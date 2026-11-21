import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime

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
    scenario = SCENARIOS["multi_stage"]
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
