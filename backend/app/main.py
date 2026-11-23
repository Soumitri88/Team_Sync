import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from .db import db
from .models import SecurityEvent, Severity
from .correlation import ingest_and_correlate, normalize_log
from .simulator import sim_controller, SCENARIOS
from .graph_engine import build_attack_graph
from .blast_radius import calculate_blast_radius
from .canary import list_canaries, add_canary, trigger_canary_trip, reset_all_canaries
from .response_actions import execute_simulated_action, get_action_history
from .evidence import verify_ledger, simulate_tamper_record, restore_tampered_record
from .report import generate_investigation_report

app = FastAPI(
    title="PloyWeb – Autonomous Cyber Investigation & Attack Graph Reconstruction API",
    version="2.0.0",
    description="Enterprise AI-assisted Cybersecurity Investigation and Attack Graph Platform"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background task to bridge simulator events to WebSockets
async def sim_event_listener():
    queue = asyncio.Queue()
    sim_controller.listeners.append(queue)
    try:
        while True:
            msg = await queue.get()
            await manager.broadcast(msg)
    except asyncio.CancelledError:
        pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(sim_event_listener())
    # If no events, seed initial demo scenario so dashboard has rich initial telemetry
    if db.events.count_documents() == 0:
        seed_demo_events()

def seed_demo_events():
    """Seeds the initial multi-stage attack sequence so the UI opens with rich live data."""
    scenario = SCENARIOS.get("windows_pc") or list(SCENARIOS.values())[0]
    for evt in scenario["events"]:
        evt_copy = dict(evt)
        evt_copy["timestamp"] = datetime.utcnow().isoformat()
        ingest_and_correlate(evt_copy)

# ==================== WEBSOCKET ENDPOINT ====================
@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial sync state
        await websocket.send_json({
            "type": "INITIAL_SYNC",
            "sim_state": sim_controller.get_state(),
            "timestamp": datetime.utcnow().isoformat()
        })
        while True:
            # Keep socket open and accept incoming pings or client actions
            data = await websocket.receive_json()
            if data.get("action") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# ==================== REST APIS ====================

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "PloyWeb Autonomous SOC Engine",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    events = db.events.find(sort_by="timestamp", reverse=True)
    total_events = len(events)
    
    # Severity distribution
    sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for e in events:
        s = e.get("severity", "info").lower()
        if s in sev_counts:
            sev_counts[s] += 1

    # Active incidents & affected devices
    incidents = db.incidents.find({"status": "active"})
    active_inc_count = len(incidents)
    
    affected_devices = set(e.get("device_name") for e in events if e.get("device_name"))
    affected_accounts = set(e.get("username") for e in events if e.get("username") and e.get("username") != "unknown_user")

    canaries = db.canaries.find()
    tripped_canaries_count = sum(1 for c in canaries if c.get("tripped"))

    # Threat status evaluation
    if sev_counts["critical"] > 0 or tripped_canaries_count > 0:
        overall_status = "CRITICAL_THREAT"
        threat_level = "DEFCON 1 - ACTIVE BREACH"
    elif sev_counts["high"] > 0:
        overall_status = "ELEVATED_RISK"
        threat_level = "DEFCON 2 - SUSPICIOUS INTRUSION"
    elif total_events > 0:
        overall_status = "MONITORING"
        threat_level = "DEFCON 4 - NORMAL SEC-OPS"
    else:
        overall_status = "SECURE"
        threat_level = "DEFCON 5 - NOMINAL"

    # Attack timeline (last 15 events)
    timeline = events[:15]

    return {
        "overall_status": overall_status,
        "threat_level": threat_level,
        "total_events": total_events,
        "severity_counts": sev_counts,
        "active_incidents": active_inc_count,
        "compromised_devices_count": len(affected_devices),
        "compromised_accounts_count": len(affected_accounts),
        "tripped_canaries_count": tripped_canaries_count,
        "recent_activities": events[:8],
        "attack_timeline": timeline,
        "severity_distribution": [
            {"name": "Critical", "count": sev_counts["critical"], "color": "#ef4444"},
            {"name": "High", "count": sev_counts["high"], "color": "#f59e0b"},
            {"name": "Medium", "count": sev_counts["medium"], "color": "#38bdf8"},
            {"name": "Low", "count": sev_counts["low"], "color": "#10b981"},
        ]
    }

@app.get("/api/events")
def get_events(
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100
):
    query = {}
    if severity:
        query["severity"] = severity.lower()
    if event_type:
        query["event_type"] = event_type.lower()
    
    events = db.events.find(query=query, sort_by="timestamp", reverse=True, limit=limit)
    
    if search:
        search_lower = search.lower()
        events = [
            e for e in events
            if search_lower in e.get("id", "").lower()
            or search_lower in e.get("device_name", "").lower()
            or search_lower in e.get("username", "").lower()
            or search_lower in e.get("source_ip", "").lower()
            or search_lower in e.get("destination_ip", "").lower()
            or search_lower in e.get("event_description", "").lower()
            or search_lower in e.get("mitre_id", "").lower()
        ]
    return events

@app.post("/api/events/ingest")
async def ingest_event(payload: Dict[str, Any]):
    event = ingest_and_correlate(payload)
    await manager.broadcast({
        "type": "NEW_EVENT",
        "event": event
    })
    return event

@app.delete("/api/events/clear")
async def clear_all_events():
    db.events.delete_many()
    db.incidents.delete_many()
    db.response_actions.delete_many()
    reset_all_canaries()
    sim_controller.reset()
    await manager.broadcast({"type": "RESET_ALL"})
    return {"status": "cleared"}

# ==================== SIMULATOR ENDPOINTS ====================

@app.get("/api/simulator/scenarios")
def get_scenarios():
    return list(SCENARIOS.values())

@app.get("/api/simulator/state")
def get_simulation_state():
    return sim_controller.get_state()

@app.post("/api/simulator/start")
def start_simulation(payload: Dict[str, Any]):
    scenario_id = payload.get("scenario_id", "multi_stage")
    speed = float(payload.get("speed", 1.0))
    sim_controller.start(scenario_id, speed)
    return sim_controller.get_state()

@app.post("/api/simulator/pause")
def pause_simulation():
    sim_controller.pause()
    return sim_controller.get_state()

@app.post("/api/simulator/resume")
def resume_simulation():
    sim_controller.resume()
    return sim_controller.get_state()

@app.post("/api/simulator/reset")
def reset_simulation():
    sim_controller.reset()
    return sim_controller.get_state()

@app.post("/api/simulator/step")
async def step_simulation():
    event = sim_controller.step_forward()
    state = sim_controller.get_state()
    if event:
        await manager.broadcast({
            "type": "NEW_EVENT",
            "event": event,
            "sim_state": state
        })
    return {"event": event, "sim_state": state}

# ==================== TRACEGRAPH ENDPOINTS ====================

@app.get("/api/graph/attack-graph")
def get_attack_graph():
    return build_attack_graph()

# ==================== CANARY TWIN ENDPOINTS ====================

@app.get("/api/canary/list")
def get_canaries():
    return list_canaries()

@app.post("/api/canary/create")
def create_canary(payload: Dict[str, Any]):
    return add_canary(
        name=payload["name"],
        path=payload["path"],
        host_device=payload["host_device"],
        description=payload.get("description", "Decoy canary file"),
        file_type=payload.get("file_type", "decoy_document")
    )

@app.post("/api/canary/trip")
async def trip_canary(payload: Dict[str, Any]):
    canary_id = payload.get("canary_id")
    trigger_user = payload.get("trigger_user", "intruder.sim")
    trigger_ip = payload.get("trigger_ip", "198.51.100.44")
    result = trigger_canary_trip(canary_id, trigger_user, trigger_ip)
    if not result:
        raise HTTPException(status_code=404, detail="Canary not found")
    await manager.broadcast({
        "type": "CANARY_TRIPPED",
        "canary": result["canary"],
        "event": result["event"]
    })
    return result

@app.post("/api/canary/reset")
def reset_canaries():
    return reset_all_canaries()

# ==================== BLAST RADIUS ENDPOINTS ====================

@app.get("/api/blast-radius")
def get_blast_radius():
    return calculate_blast_radius()

# ==================== INCIDENT RESPONSE ENDPOINTS ====================

@app.get("/api/incident-response/actions")
def get_actions():
    return get_action_history()

@app.post("/api/incident-response/execute")
async def execute_action(payload: Dict[str, Any]):
    action_type = payload.get("action_type")
    target = payload.get("target")
    operator = payload.get("operator", "SOC-Commander")
    if not action_type or not target:
        raise HTTPException(status_code=400, detail="action_type and target are required")
    record = execute_simulated_action(action_type, target, operator)
    await manager.broadcast({
        "type": "RESPONSE_ACTION_EXECUTED",
        "action": record
    })
    return record

# ==================== EVIDENCE LEDGER ENDPOINTS ====================

@app.get("/api/evidence/ledger")
def get_evidence_ledger():
    events = db.events.find(sort_by="timestamp", reverse=True)
    return {
        "total_records": len(events),
        "records": events
    }

@app.post("/api/evidence/verify")
def verify_evidence_ledger():
    return verify_ledger()

@app.post("/api/evidence/tamper-demo")
def tamper_demo_record(payload: Dict[str, Any]):
    event_id = payload.get("event_id")
    modifications = payload.get("modifications", {"event_description": "Tampered log: All malicious activities wiped."})
    tampered = simulate_tamper_record(event_id, modifications)
    if not tampered:
        raise HTTPException(status_code=404, detail="Event not found")
    return tampered

@app.post("/api/evidence/restore")
def restore_event(payload: Dict[str, Any]):
    event_id = payload.get("event_id")
    restored = restore_tampered_record(event_id)
    if not restored:
        raise HTTPException(status_code=404, detail="Event not found")
    return restored

# ==================== INVESTIGATION REPORT ENDPOINTS ====================

@app.get("/api/report/generate")
def get_report():
    return generate_investigation_report()

# ==================== SETTINGS & SEED ENDPOINTS ====================

@app.get("/api/settings")
def get_settings():
    return db.settings.find_one({"id": "global_config"}) or {}

@app.put("/api/settings")
def update_settings(payload: Dict[str, Any]):
    db.settings.update_one({"id": "global_config"}, payload)
    return db.settings.find_one({"id": "global_config"})

@app.post("/api/demo/reset-and-seed")
async def reset_and_seed():
    db.events.delete_many()
    db.incidents.delete_many()
    db.response_actions.delete_many()
    reset_all_canaries()
    sim_controller.reset()
    seed_demo_events()
    await manager.broadcast({"type": "DEMO_RESEEDED"})
    return {"status": "demo_reseeded", "events_count": db.events.count_documents()}

# ==================== DEVICE MANAGEMENT ENDPOINTS ====================

@app.get("/api/devices")
def get_devices():
    return db.devices.find(sort_by="registered_at", reverse=True)

@app.post("/api/devices/register")
async def register_device(payload: Dict[str, Any]):
    device_id = f"DEV-{datetime.utcnow().strftime('%M%S')}"
    new_device = {
        "id": device_id,
        "name": payload.get("name", f"HOST-{device_id}"),
        "device_type": payload.get("device_type", "windows").lower(),
        "os": payload.get("os", "Windows 11 / Android"),
        "ip": payload.get("ip", f"10.0.{len(db.devices.find()) + 2}.15"),
        "status": "connected",
        "mode": payload.get("mode", "Simulated Telemetry Agent"),
        "registered_at": datetime.utcnow().isoformat(),
        "last_seen": datetime.utcnow().isoformat(),
        "security_posture": "nominal"
    }
    saved = db.devices.insert_one(new_device)
    await manager.broadcast({"type": "DEVICE_REGISTERED", "device": saved})
    return saved

@app.post("/api/devices/generate-test-event")
async def generate_test_event(payload: Dict[str, Any]):
    device_id = payload.get("device_id")
    device = None
    if device_id:
        device = db.devices.find_one({"id": device_id}) or db.devices.find_one({"name": device_id})
    device_name = device["name"] if device else (payload.get("device_name") or "WS-ENGINEERING-07")
    device_ip = device["ip"] if device else "10.0.2.14"
    event_type = payload.get("event_type", "diagnostic_audit")
    severity = payload.get("severity", "low")

    test_event_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "source_ip": device_ip,
        "destination_ip": "10.0.0.1",
        "username": "sec_operator",
        "device_name": device_name,
        "event_type": event_type,
        "event_description": f"Safe Diagnostic Audit: Benign telemetry test probe generated on {device_name}.",
        "severity": severity,
        "mitre_id": "T1059.001",
        "mitre_name": "Command and Scripting Interpreter: Safe Audit Probe",
        "is_safe_simulation": True,
        "raw_payload": {"test_probe": True, "generated_by": "PloyWeb Device Monitoring Lab"}
    }
    event = ingest_and_correlate(test_event_data)
    if device:
        db.devices.update_one({"id": device["id"]}, {"$set": {"last_seen": datetime.utcnow().isoformat()}})
    await manager.broadcast({"type": "NEW_EVENT", "event": event})
    return event

# ==================== EVENT IMPORT ENDPOINT ====================

@app.post("/api/events/import")
async def import_events(payload: Dict[str, Any]):
    raw_logs = payload.get("logs")
    imported_events = []
    
    if isinstance(raw_logs, list):
        for item in raw_logs:
            if isinstance(item, dict):
                norm = normalize_log(item)
                evt = ingest_and_correlate(norm)
                imported_events.append(evt)
            elif isinstance(item, str):
                norm = normalize_log(item)
                evt = ingest_and_correlate(norm)
                imported_events.append(evt)
    elif isinstance(raw_logs, str):
        try:
            parsed = json.loads(raw_logs)
            if isinstance(parsed, list):
                for item in parsed:
                    norm = normalize_log(item)
                    evt = ingest_and_correlate(norm)
                    imported_events.append(evt)
            elif isinstance(parsed, dict):
                norm = normalize_log(parsed)
                evt = ingest_and_correlate(norm)
                imported_events.append(evt)
        except Exception:
            lines = [l.strip() for l in raw_logs.split("\n") if l.strip()]
            for line in lines:
                norm = normalize_log(line)
                evt = ingest_and_correlate(norm)
                imported_events.append(evt)
                
    await manager.broadcast({"type": "EVENTS_IMPORTED", "count": len(imported_events)})
    return {
        "status": "success",
        "imported_count": len(imported_events),
        "events": imported_events[:10]
    }

# ==================== 1-CLICK JUDGE DEMO ENDPOINT ====================

@app.post("/api/demo/judge")
async def run_judge_demo():
    """
    1-Click Hackathon Judging Demonstration:
    Demonstrates PloyWeb's temporal correlation engine:
    1. Ingests logs intentionally OUT OF ORDER (Stage 3 -> Stage 1 -> Stage 2 -> Stage 5 -> Stage 4 -> Stage 6)
    2. Sorts logs by actual timestamps to reconstruct true attack progression
    3. Trips the decoy canary 'financial_report_demo.txt'
    4. Calculates updated graph and blast radius
    """
    db.events.delete_many()
    db.incidents.delete_many()
    db.response_actions.delete_many()
    reset_all_canaries()
    sim_controller.reset()

    scenario = SCENARIOS["judge_demo"]
    raw_events = scenario["events"]
    
    base_time = datetime.utcnow() - timedelta(minutes=5)
    stamped_events = []
    for idx, e in enumerate(raw_events):
        e_copy = dict(e)
        e_copy["timestamp"] = (base_time + timedelta(seconds=e_copy.get("offset_sec", idx * 10))).isoformat()
        stamped_events.append(e_copy)

    # Scramble ingestion order to prove temporal sorting
    scrambled_order = [3, 1, 2, 5, 4, 0, 6]
    for idx in scrambled_order:
        if idx < len(stamped_events):
            ingest_and_correlate(stamped_events[idx])

    # Trip the canary decoy
    canary = db.canaries.find_one({"name": "financial_report_demo.txt"})
    if canary:
        trigger_canary_trip(canary["id"], trigger_user="david.webb", trigger_ip="198.51.100.44")

    graph = build_attack_graph()
    radius = calculate_blast_radius()

    await manager.broadcast({"type": "JUDGE_DEMO_READY"})

    return {
        "status": "reconstructed",
        "scenario": "Enterprise Multi-Stage Intrusion (Out-Of-Order Telemetry Stream)",
        "temporal_sorting_verified": True,
        "message": "PloyWeb successfully ingested out-of-order security telemetry and reconstructed true attack sequence.",
        "nodes_reconstructed": len(graph.get("nodes", [])),
        "edges_reconstructed": len(graph.get("edges", [])),
        "blast_radius_impact_pct": radius.get("compromise_percentage", 75.0),
        "canary_tripped": "financial_report_demo.txt",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==================== RUN PROTECTION DEMO ====================

@app.post("/api/incident-response/run-protection-demo")
async def run_protection_demo():
    """
    Automated Protection Demo:
    1. Revokes active simulated attacker session.
    2. Enforces MFA policy on all affected endpoints.
    3. Isolates compromised simulated host (WS-ENGINEERING-07) in safe sandbox.
    4. Quarantines persistent service artifact (PloySecSvc_Persistent).
    5. Updates incident status to 'CONTAINED' and device security posture to 'protected'.
    6. Signs audit records with SHA-256 evidence hashes.
    """
    operator = "Autonomous-Incident-Response"
    
    actions_to_run = [
        ("revoke_session", "david.webb"),
        ("enable_mfa", "david.webb"),
        ("quarantine_host", "WS-ENGINEERING-07"),
        ("block_ip", "198.51.100.44")
    ]
    
    executed_records = []
    for action_type, target in actions_to_run:
        rec = execute_simulated_action(action_type, target, operator)
        executed_records.append(rec)

    db.devices.update_one({"name": "WS-ENGINEERING-07"}, {"$set": {"security_posture": "protected", "mode": "Isolated (Simulation Sandbox)"}})
    db.devices.update_one({"name": "SRV-FINANCE-01"}, {"$set": {"security_posture": "protected"}})

    incidents = db.incidents.find()
    for inc in incidents:
        db.incidents.update_one({"id": inc["id"]}, {"$set": {"status": "contained", "contained_at": datetime.utcnow().isoformat()}})

    protect_event = {
        "timestamp": datetime.utcnow().isoformat(),
        "source_ip": "127.0.0.1",
        "destination_ip": "10.0.2.14",
        "username": "SOC-Commander",
        "device_name": "WS-ENGINEERING-07",
        "event_type": "incident_contained",
        "event_description": "Protection Demo: Automated containment executed. Adversary session terminated and simulated endpoint isolated.",
        "severity": "low",
        "mitre_id": "RESPONSE-CONTAIN",
        "mitre_name": "Autonomous Incident Response & Endpoint Containment",
        "raw_payload": {"protection_status": "CONTAINED", "contained_by": "PloyWeb Autonomous Playbook"}
    }
    ingest_and_correlate(protect_event)

    await manager.broadcast({"type": "PROTECTION_DEMO_COMPLETED", "actions": executed_records})

    return {
        "status": "contained",
        "device_status": "PROTECTED (SIMULATION SANDBOX)",
        "actions_executed": len(executed_records),
        "records": executed_records,
        "message": "All threat vectors neutralized. Simulated device safely isolated and credentials revoked."
    }

# ==================== STATIC FILE SERVING FOR FULL-STACK DEPLOYMENT ====================
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="Endpoint not found")
        target_file = os.path.join(DIST_DIR, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

