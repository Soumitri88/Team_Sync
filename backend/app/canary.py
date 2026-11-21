from datetime import datetime
from typing import Dict, Any, List, Optional
from .db import db
from .correlation import ingest_and_correlate

def list_canaries() -> List[Dict[str, Any]]:
    return db.canaries.find()

def add_canary(name: str, path: str, host_device: str, description: str, file_type: str = "decoy_document") -> Dict[str, Any]:
    canary_id = f"CAN-{db.canaries.count_documents() + 1:03d}"
    doc = {
        "id": canary_id,
        "name": name,
        "path": path,
        "host_device": host_device,
        "created_at": datetime.utcnow().isoformat(),
        "tripped": False,
        "tripped_at": None,
        "tripped_by": None,
        "tripped_ip": None,
        "description": description,
        "file_type": file_type
    }
    db.canaries.insert_one(doc)
    return doc

def trigger_canary_trip(canary_id: str, trigger_user: str = "adversary.sim", trigger_ip: str = "198.51.100.44") -> Optional[Dict[str, Any]]:
    """
    Manually or programmatically triggers a decoy tripwire, immediately generating
    a Critical severity alert and updating Canary Twin state.
    """
    canary = db.canaries.find_one({"id": canary_id})
    if not canary:
        return None

    now_iso = datetime.utcnow().isoformat()
    db.canaries.update_one(
        {"id": canary_id},
        {
            "tripped": True,
            "tripped_at": now_iso,
            "tripped_by": trigger_user,
            "tripped_ip": trigger_ip
        }
    )

    # Ingest synthetic critical security event
    event = {
        "timestamp": now_iso,
        "source_ip": trigger_ip,
        "destination_ip": "10.0.3.11",
        "username": trigger_user,
        "device_name": canary["host_device"],
        "event_type": "canary_access",
        "event_description": f"TRIPWIRE DETONATED: Decoy canary '{canary['name']}' read attempt detected on host {canary['host_device']}.",
        "severity": "critical",
        "mitre_id": "T1005",
        "mitre_name": "Data from Local System: Decoy Canary Breach",
        "stage": 4,
        "is_canary": True,
        "canary_file": canary["name"],
        "raw_payload": {
            "canary_id": canary["id"],
            "path": canary["path"],
            "trap_type": canary["file_type"],
            "alarm_code": "CANARY_SIG_0x99A"
        }
    }
    ingested = ingest_and_correlate(event)
    return {"canary": db.canaries.find_one({"id": canary_id}), "event": ingested}

def reset_all_canaries():
    canaries = db.canaries.find()
    for c in canaries:
        db.canaries.update_one({"id": c["id"]}, {
            "tripped": False,
            "tripped_at": None,
            "tripped_by": None,
            "tripped_ip": None
        })
    return {"status": "all_canaries_rearmed"}
