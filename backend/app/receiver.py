import os
import time
import shutil
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/receiver", tags=["controlled-receiver"])

# Setup Receiver Storage
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
SANDBOX_DIR = os.path.join(PROJECT_ROOT, "test_sandbox")
RECEIVER_STORAGE = os.path.join(SANDBOX_DIR, "receiver_storage")

os.makedirs(RECEIVER_STORAGE, exist_ok=True)

class ControlledReceiverState:
    def __init__(self):
        self.block_mode: bool = False  # True = block incoming exfiltration attempts
        self.containment_active: bool = False
        self.transfer_logs: List[Dict[str, Any]] = []

    def reset(self):
        self.block_mode = False
        self.containment_active = False
        self.transfer_logs.clear()
        if os.path.exists(RECEIVER_STORAGE):
            for f in os.listdir(RECEIVER_STORAGE):
                p = os.path.join(RECEIVER_STORAGE, f)
                try:
                    if os.path.isfile(p):
                        os.remove(p)
                    elif os.path.isdir(p):
                        shutil.rmtree(p)
                except Exception:
                    pass

    def get_stats(self) -> Dict[str, Any]:
        total_attempts = len(self.transfer_logs)
        blocked_attempts = sum(1 for x in self.transfer_logs if x.get("status") == "BLOCKED")
        leaked_attempts = sum(1 for x in self.transfer_logs if x.get("status") == "RECEIVED_UNCONTAINED")
        bytes_blocked = sum(x.get("bytes_attempted", 0) for x in self.transfer_logs if x.get("status") == "BLOCKED")
        bytes_leaked = sum(x.get("bytes_received", 0) for x in self.transfer_logs if x.get("status") == "RECEIVED_UNCONTAINED")

        return {
            "status": "CONTAINMENT_ACTIVE" if (self.block_mode or self.containment_active) else "READY",
            "block_mode": self.block_mode or self.containment_active,
            "total_attempts": total_attempts,
            "blocked_attempts": blocked_attempts,
            "leaked_attempts": leaked_attempts,
            "bytes_blocked": bytes_blocked,
            "bytes_leaked": bytes_leaked,
            "prevention_rate_pct": 100.0 if total_attempts == 0 else round((blocked_attempts / total_attempts) * 100, 1),
            "receiver_endpoint": "http://127.0.0.1:8000/api/receiver/upload"
        }

receiver_state = ControlledReceiverState()

@router.get("/status")
def get_receiver_status():
    return receiver_state.get_stats()

@router.get("/logs")
def get_receiver_logs():
    return {
        "stats": receiver_state.get_stats(),
        "logs": list(reversed(receiver_state.transfer_logs))
    }

@router.post("/set-block")
def set_receiver_block(payload: Dict[str, Any]):
    blocked = bool(payload.get("blocked", True))
    receiver_state.block_mode = blocked
    receiver_state.containment_active = blocked
    return {
        "status": "updated",
        "block_mode": blocked,
        "message": f"Controlled receiver firewall rule set to {'BLOCKED (Defense Active)' if blocked else 'OPEN (Monitoring Mode)'}"
    }

@router.post("/reset")
def reset_receiver():
    receiver_state.reset()
    return {"status": "reset", "stats": receiver_state.get_stats()}

@router.post("/upload")
async def receive_exfiltration_file(
    request: Request,
    file: Optional[UploadFile] = File(None),
    filename: Optional[str] = Form(None),
    content_b64: Optional[str] = Form(None),
    device_id: Optional[str] = Form(None),
    process_id: Optional[int] = Form(None)
):
    """
    Controlled Receiver Endpoint.
    Simulates adversary C2 exfiltration collection server.
    If defensive containment is active, REJECTS the transfer with 0 bytes recorded.
    If defensive containment is inactive, accepts upload and logs bytes received.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    target_filename = filename or (file.filename if file else "staged_exfil_payload.bin")
    
    # Read incoming payload bytes
    raw_bytes = b""
    if file:
        raw_bytes = await file.read()
    elif content_b64:
        import base64
        try:
            raw_bytes = base64.b64decode(content_b64)
        except Exception:
            raw_bytes = content_b64.encode("utf-8")
    else:
        # Check raw body
        body = await request.body()
        raw_bytes = body

    attempted_size = len(raw_bytes)
    attempted_hash = hashlib.sha256(raw_bytes).hexdigest() if raw_bytes else ("0" * 64)
    now_ts = datetime.utcnow().isoformat()

    # Check if defense is active
    is_blocked = receiver_state.block_mode or receiver_state.containment_active

    if is_blocked:
        record = {
            "id": f"RX-{int(time.time() * 1000)}",
            "timestamp": now_ts,
            "client_ip": client_ip,
            "device_id": device_id or "UNKNOWN-HOST",
            "process_id": process_id or 0,
            "filename": target_filename,
            "status": "BLOCKED",
            "outcome": "PREVENTED",
            "bytes_received": 0,
            "bytes_attempted": attempted_size,
            "sha256_attempted": attempted_hash,
            "rejection_reason": "Autonomous Containment Defense Active: Outbound Exfiltration Blocked",
            "defense_rule": "NET-RULE-BLOCK-EXFIL-8000"
        }
        receiver_state.transfer_logs.append(record)
        
        # Raise HTTP 403 Forbidden with exact forensic rejection details
        raise HTTPException(
            status_code=403,
            detail={
                "error": "CONNECTION_TERMINATED_BY_POLICY",
                "message": "PloyWeb Active Containment blocked outbound file exfiltration.",
                "audit_record": record
            }
        )

    # If not blocked (uncontained attack)
    dest_path = os.path.join(RECEIVER_STORAGE, f"{int(time.time())}_{target_filename}")
    with open(dest_path, "wb") as f:
        f.write(raw_bytes)

    saved_sha256 = hashlib.sha256(raw_bytes).hexdigest()

    record = {
        "id": f"RX-{int(time.time() * 1000)}",
        "timestamp": now_ts,
        "client_ip": client_ip,
        "device_id": device_id or "UNKNOWN-HOST",
        "process_id": process_id or 0,
        "filename": target_filename,
        "status": "RECEIVED_UNCONTAINED",
        "outcome": "DATA_LEAKED",
        "bytes_received": attempted_size,
        "bytes_attempted": attempted_size,
        "sha256_received": saved_sha256,
        "rejection_reason": None,
        "defense_rule": None
    }
    receiver_state.transfer_logs.append(record)

    return {
        "status": "received",
        "outcome": "uncontained_leak",
        "bytes_received": attempted_size,
        "audit_record": record
    }
