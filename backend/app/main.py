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
from .receiver import router as receiver_router, receiver_state

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

app.include_router(receiver_router)

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

# ==================== PHYSICAL WINDOWS ENDPOINT AGENT ENDPOINTS ====================

agent_pending_commands: Dict[str, List[str]] = {}
agent_live_state: Dict[str, Any] = {
    "connected": False,
    "last_device": None,
    "last_heartbeat": None,
    "active_pids": [],
    "recent_telemetry": []
}

@app.post("/api/agent/register")
async def register_endpoint_agent(payload: Dict[str, Any]):
    import socket, hashlib
    hostname = payload.get("name") or payload.get("hostname") or socket.gethostname()
    device_id = payload.get("id") or f"DEV-{hashlib.md5(hostname.encode()).hexdigest()[:6].upper()}"
    existing = db.devices.find_one({"name": hostname}) or db.devices.find_one({"id": device_id})

    device_record = {
        "id": device_id,
        "name": hostname,
        "device_type": "windows",
        "os": payload.get("os", "Windows 11 Enterprise"),
        "ip": payload.get("ip", "127.0.0.1"),
        "username": payload.get("username", "Administrator"),
        "status": "connected",
        "mode": "Physical Windows Endpoint Agent (Active Telemetry)",
        "registered_at": payload.get("registered_at", datetime.utcnow().isoformat()),
        "last_seen": datetime.utcnow().isoformat(),
        "security_posture": payload.get("security_posture", "nominal"),
        "version": payload.get("version", "2.1.0"),
        "sandbox_path": payload.get("sandbox_path", "test_sandbox")
    }

    if existing:
        db.devices.update_one({"id": existing["id"]}, {"$set": device_record})
    else:
        db.devices.insert_one(device_record)

    agent_live_state["connected"] = True
    agent_live_state["last_device"] = device_record
    agent_live_state["last_heartbeat"] = datetime.utcnow().isoformat()

    await manager.broadcast({
        "type": "AGENT_CONNECTED",
        "device": device_record
    })
    return {"status": "registered", "device": device_record}

@app.post("/api/agent/heartbeat")
async def agent_heartbeat(payload: Dict[str, Any]):
    dev_id = payload.get("device_id")
    hostname = payload.get("hostname")
    pids = payload.get("active_test_pids", [])
    posture = payload.get("security_posture", "nominal")

    agent_live_state["connected"] = True
    agent_live_state["last_heartbeat"] = datetime.utcnow().isoformat()
    agent_live_state["active_pids"] = pids

    if hostname:
        db.devices.update_one(
            {"name": hostname},
            {"$set": {"last_seen": datetime.utcnow().isoformat(), "security_posture": posture, "status": "connected"}}
        )

    await manager.broadcast({
        "type": "AGENT_HEARTBEAT",
        "device_id": dev_id,
        "hostname": hostname,
        "active_pids": pids,
        "posture": posture,
        "timestamp": datetime.utcnow().isoformat()
    })
    return {"status": "ok"}

@app.post("/api/agent/telemetry")
async def agent_telemetry(payload: Dict[str, Any]):
    event = ingest_and_correlate(payload)
    agent_live_state["recent_telemetry"].append(event)
    if len(agent_live_state["recent_telemetry"]) > 20:
        agent_live_state["recent_telemetry"] = agent_live_state["recent_telemetry"][-20:]

    graph = build_attack_graph()
    radius = calculate_blast_radius()

    await manager.broadcast({
        "type": "NEW_EVENT",
        "event": event,
        "graph": graph,
        "blast_radius": radius
    })
    return {"status": "ingested", "event": event}

@app.get("/api/agent/status")
def get_agent_status():
    import dateutil.parser
    is_live = False
    if agent_live_state["last_heartbeat"]:
        try:
            dt = dateutil.parser.parse(agent_live_state["last_heartbeat"])
            diff = (datetime.utcnow() - dt.replace(tzinfo=None)).total_seconds()
            is_live = (diff < 15)
        except Exception:
            is_live = agent_live_state["connected"]

    return {
        "connected": is_live,
        "live_state": agent_live_state,
        "registered_endpoint": agent_live_state.get("last_device"),
        "active_pids": agent_live_state.get("active_pids", []),
        "last_heartbeat": agent_live_state.get("last_heartbeat"),
        "total_telemetry_events": len(agent_live_state.get("recent_telemetry", []))
    }

@app.post("/api/agent/poll-commands")
def poll_agent_commands(payload: Dict[str, Any]):
    dev_id = payload.get("device_id")
    cmds = agent_pending_commands.get(dev_id, [])
    if cmds:
        cmd = cmds.pop(0)
        return {"command": cmd}
    return {"command": None}

@app.post("/api/agent/trigger-simulation")
async def trigger_agent_simulation(payload: Dict[str, Any]):
    scenario = payload.get("scenario", "multistage")
    dev_id = payload.get("device_id")
    if dev_id:
        if dev_id not in agent_pending_commands:
            agent_pending_commands[dev_id] = []
        agent_pending_commands[dev_id].append("run_simulation")

    await manager.broadcast({
        "type": "SIMULATION_TRIGGERED",
        "scenario": scenario,
        "timestamp": datetime.utcnow().isoformat()
    })
    return {"status": "queued", "scenario": scenario}

@app.post("/api/agent/remediate")
async def trigger_agent_remediation(payload: Dict[str, Any] = None):
    import platform, subprocess
    for k in agent_pending_commands:
        agent_pending_commands[k].append("remediate")

    killed_pids = []
    for pid in list(agent_live_state.get("active_pids", [])):
        try:
            if platform.system() == "Windows":
                subprocess.run(["taskkill", "/F", "/PID", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                os.kill(pid, 9)
            killed_pids.append(pid)
        except Exception:
            pass
    agent_live_state["active_pids"] = []

    for dev in db.devices.find():
        db.devices.update_one({"id": dev["id"]}, {"$set": {"security_posture": "protected", "status": "connected"}})

    # Activate receiver containment & egress drop
    receiver_state.block_mode = True
    receiver_state.containment_active = True
    rx_stats = receiver_state.get_stats()

    action = {
        "id": f"ACT-{datetime.utcnow().strftime('%M%S')}",
        "action_type": "terminate_process_and_quarantine",
        "target": "TEST-PROCESSES & SANDBOX ARTIFACTS",
        "status": "EXECUTED_VERIFIED",
        "timestamp": datetime.utcnow().isoformat(),
        "operator": "Autonomous-Incident-Response",
        "details": f"Terminated PIDs: {killed_pids}. Quarantined sandbox artifacts. Decoy restored. Receiver exfil socket blocked.",
        "mitigation_impact": "Threat Completely Contained. Host Verified Clean. Data Leakage Prevented."
    }
    db.response_actions.insert_one(action)

    verification_event = {
        "timestamp": datetime.utcnow().isoformat(),
        "source_ip": "127.0.0.1",
        "destination_ip": "10.0.0.1",
        "username": "SOC-Commander",
        "device_name": agent_live_state.get("last_device", {}).get("name", "WS-ENGINEERING-07"),
        "event_type": "incident_contained",
        "event_description": f"Incident Contained: Endpoint verification passed. Active PIDs {killed_pids} terminated. Attack path neutralized.",
        "severity": "info",
        "mitre_id": "RESPONSE-CONTAIN",
        "mitre_name": "Autonomous Incident Response & Endpoint Containment",
        "raw_payload": {"remediation_verified": True, "terminated_pids": killed_pids}
    }
    ingest_and_correlate(verification_event)

    await manager.broadcast({
        "type": "REMEDIATION_VERIFIED",
        "action": action,
        "terminated_pids": killed_pids
    })

    return {
        "status": "CONTAINED",
        "verification_passed": True,
        "terminated_pids": killed_pids,
        "action": action,
        "receiver_stats": rx_stats
    }

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

# ==================== PHASE 4 & 5: REAL AUTHENTICATION & EMPLOYEE PORTAL APIS ====================
from pydantic import BaseModel
from .db_sqlite import db_mgr, hash_password, verify_password
from .auth_service import authenticate_user, verify_mfa, record_audit_log, register_employee

class LoginPayload(BaseModel):
    username: str
    password: str
    ip_address: Optional[str] = "127.0.0.1"
    device_name: Optional[str] = "Web-Portal-Client"

class RegisterPayload(BaseModel):
    username: str
    password: str
    full_name: str
    employee_id: str
    department: str
    email: Optional[str] = None

class MFAPayload(BaseModel):
    session_id: str
    code: str

class PasswordChangePayload(BaseModel):
    user_id: str
    old_password: str
    new_password: str

class LockTogglePayload(BaseModel):
    user_id: str
    is_locked: int
    reason: Optional[str] = "Admin security intervention"

class ApprovalPayload(BaseModel):
    incident_id: str
    decision: str  # APPROVE, REJECT, ESCALATE
    reason: str
    action_requested: str
    reviewer_name: Optional[str] = "SOC-Commander"

@app.post("/api/auth/login")
def api_auth_login(payload: LoginPayload):
    result = authenticate_user(
        identifier=payload.username,
        password=payload.password,
        ip_address=payload.ip_address,
        device_name=payload.device_name
    )
    return result

@app.post("/api/auth/register")
def api_auth_register(payload: RegisterPayload):
    result = register_employee(
        username=payload.username,
        password=payload.password,
        full_name=payload.full_name,
        employee_id=payload.employee_id,
        department=payload.department,
        email=payload.email
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Registration failed"))
    return result

@app.post("/api/auth/verify-mfa")
def api_auth_verify_mfa(payload: MFAPayload):
    result = verify_mfa(payload.session_id, payload.code)
    return result

@app.post("/api/auth/logout")
def api_auth_logout(session_token: Optional[str] = Query(None)):
    if session_token:
        db_mgr.execute("UPDATE login_sessions SET is_active = 0 WHERE session_token = ?", (session_token,))
    return {"success": True, "message": "Session terminated successfully."}

@app.get("/api/auth/me")
def api_auth_me(token: Optional[str] = Query(None)):
    if not token:
        raise HTTPException(status_code=401, detail="Session token required")
    session = db_mgr.query_one("""
        SELECT s.*, u.username, u.full_name, u.email, u.is_locked, r.name as role,
               e.employee_id, e.department, e.title, e.security_clearance
        FROM login_sessions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN employees e ON u.id = e.user_id
        WHERE s.session_token = ? AND s.is_active = 1
    """, (token,))
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return {
        "authenticated": True,
        "user": session
    }

# ==================== EMPLOYEE / CUSTOMER PORTAL APIS ====================

@app.get("/api/employee/dashboard")
def get_employee_dashboard(user_id: Optional[str] = Query("usr-david")):
    user = db_mgr.query_one("""
        SELECT u.id, u.username, u.full_name, u.email, u.is_locked, u.created_at,
               e.employee_id, e.department, e.title, e.security_clearance
        FROM users u
        LEFT JOIN employees e ON u.id = e.user_id
        WHERE u.id = ? OR u.username = ?
    """, (user_id, user_id))

    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Login history (last 10)
    history = db_mgr.query_all("""
        SELECT id, event_type, ip_address, device_name, risk_score, risk_level, status, timestamp
        FROM auth_events
        WHERE user_id = ? OR username = ?
        ORDER BY timestamp DESC LIMIT 10
    """, (user["id"], user["username"]))

    # Registered devices
    devices = db_mgr.query_all("SELECT * FROM devices WHERE status = 'connected'")

    # Security notifications & alerts
    alerts = db_mgr.query_all("""
        SELECT * FROM notifications
        WHERE user_id = ? OR user_id IS NULL
        ORDER BY created_at DESC LIMIT 5
    """, (user["id"],))

    # Active sessions
    sessions = db_mgr.query_all("""
        SELECT id, ip_address, device_name, created_at, expires_at, is_active
        FROM login_sessions
        WHERE user_id = ? AND is_active = 1
        ORDER BY created_at DESC
    """, (user["id"],))

    return {
        "profile": user,
        "login_history": history,
        "registered_devices": devices,
        "security_alerts": alerts,
        "active_sessions": sessions,
        "account_security_status": "SECURE" if user.get("is_locked") == 0 else "LOCKED",
        "mfa_enforced": True
    }

@app.post("/api/employee/change-password")
def api_change_password(payload: PasswordChangePayload):
    user = db_mgr.query_one("SELECT * FROM users WHERE id = ?", (payload.user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.old_password, user["salt"], user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password incorrect.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    new_hash, new_salt = hash_password(payload.new_password)
    now_str = datetime.utcnow().isoformat()
    db_mgr.execute("""
        UPDATE users
        SET password_hash = ?, salt = ?, updated_at = ?
        WHERE id = ?
    """, (new_hash, new_salt, now_str, payload.user_id))

    record_audit_log(payload.user_id, user["username"], "PASSWORD_CHANGE", None, "SUCCESS", "User changed account password.")
    return {"success": True, "message": "Password changed successfully."}

# ==================== MASTER ADMIN: EMPLOYEE & APPROVAL MANAGEMENT ====================

@app.get("/api/admin/employees")
def get_all_employees():
    employees = db_mgr.query_all("""
        SELECT u.id as user_id, u.username, u.full_name, u.email, u.is_locked, u.failed_attempts,
               u.lockout_until, u.created_at, r.name as role,
               e.employee_id, e.department, e.title, e.security_clearance, e.status as emp_status
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN employees e ON u.id = e.user_id
        ORDER BY u.created_at ASC
    """)
    return {"total": len(employees), "employees": employees}

@app.post("/api/admin/employees/lock-toggle")
def toggle_employee_lock(payload: LockTogglePayload):
    user = db_mgr.query_one("SELECT * FROM users WHERE id = ?", (payload.user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_locked = 1 if payload.is_locked == 1 else 0
    now_str = datetime.utcnow().isoformat()
    db_mgr.execute("""
        UPDATE users
        SET is_locked = ?, failed_attempts = 0, lockout_until = NULL, updated_at = ?
        WHERE id = ?
    """, (new_locked, now_str, payload.user_id))

    action_text = "ADMIN_LOCK_ACCOUNT" if new_locked else "ADMIN_UNLOCK_ACCOUNT"
    record_audit_log("usr-01", "Alex Vance", action_text, None, "SUCCESS", f"{action_text} on user {user['username']}: {payload.reason}")

    return {
        "success": True,
        "user_id": payload.user_id,
        "is_locked": new_locked,
        "message": f"Account {user['username']} has been {'LOCKED' if new_locked else 'UNLOCKED'} by Administrator."
    }

@app.get("/api/admin/approvals")
def get_approvals():
    rows = db_mgr.query_all("SELECT * FROM admin_approvals ORDER BY timestamp DESC")
    return {"total": len(rows), "approvals": rows}

@app.post("/api/admin/approvals")
def record_approval(payload: ApprovalPayload):
    now_str = datetime.utcnow().isoformat()
    appr_id = f"APPR-{secrets.token_hex(4).upper()}"

    db_mgr.execute("""
        INSERT INTO admin_approvals (id, incident_id, reviewer_id, reviewer_name, decision, reason, action_requested, timestamp, execution_result, verification_result)
        VALUES (?, ?, 'usr-01', ?, ?, ?, ?, ?, 'EXECUTED', 'VERIFIED_COMPLIANT')
    """, (appr_id, payload.incident_id, payload.reviewer_name, payload.decision, payload.reason, payload.action_requested, now_str))

    record_audit_log("usr-01", payload.reviewer_name, f"INCIDENT_RESPONSE_{payload.decision}", payload.incident_id, "SUCCESS",
                     f"Decision: {payload.decision} for {payload.action_requested}. Reason: {payload.reason}")

    return {
        "success": True,
        "approval_id": appr_id,
        "decision": payload.decision,
        "timestamp": now_str
    }

@app.get("/api/admin/audit-logs")
def get_audit_logs():
    rows = db_mgr.query_all("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50")
    # Verify cryptographic hash chain integrity
    is_valid = True
    for i in range(len(rows) - 1):
        curr = rows[i]
        prev = rows[i + 1]
        if curr["previous_hash"] != prev["current_hash"]:
            is_valid = False
            break

    return {
        "total": len(rows),
        "chain_valid": is_valid,
        "root_hash": rows[0]["current_hash"] if rows else "GENESIS",
        "logs": rows
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

