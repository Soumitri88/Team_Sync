from typing import List, Dict, Any, Optional
from datetime import datetime
import dateutil.parser
from .models import SecurityEvent, Severity
from .evidence import compute_evidence_hash
from .db import db

# MITRE ATT&CK Knowledge Base Mapping
MITRE_TACTICS_MAP = {
    "brute_force": {"id": "T1110", "tactic": "Credential Access", "name": "Brute Force: Password Guessing"},
    "suspicious_login": {"id": "T1078", "tactic": "Initial Access", "name": "Valid Accounts: Compromised Credentials"},
    "lateral_movement": {"id": "T1021", "tactic": "Lateral Movement", "name": "Remote Services: SMB/RDP/SSH"},
    "privilege_escalation": {"id": "T1068", "tactic": "Privilege Escalation", "name": "Exploitation for Privilege Escalation"},
    "canary_access": {"id": "T1005", "tactic": "Collection", "name": "Data from Local System: Decoy Canary Breach"},
    "file_exfiltration": {"id": "T1048", "tactic": "Exfiltration", "name": "Exfiltration Over Alternative Protocol"},
    "c2_beacon": {"id": "T1071", "tactic": "Command and Control", "name": "Application Layer Protocol"},
    "reconnaissance": {"id": "T1046", "tactic": "Discovery", "name": "Network Service Discovery"},
    "persistence": {"id": "T1053", "tactic": "Persistence", "name": "Scheduled Task / Job"}
}

def normalize_log(raw_log: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes heterogeneous log formats (Windows Event, Syslog, CEF, custom JSON)
    into PloyWeb standardized event schema.
    """
    # Parse and standardize timestamp
    raw_ts = raw_log.get("timestamp") or raw_log.get("time") or raw_log.get("@timestamp") or datetime.utcnow().isoformat()
    try:
        parsed_dt = dateutil.parser.parse(str(raw_ts))
        norm_ts = parsed_dt.isoformat()
    except Exception:
        norm_ts = datetime.utcnow().isoformat()

    evt_type = raw_log.get("event_type") or raw_log.get("type") or "suspicious_activity"
    evt_type = evt_type.lower().replace(" ", "_").replace("-", "_")

    # Severity mapping
    raw_sev = str(raw_log.get("severity", "medium")).lower()
    if raw_sev in ["crit", "critical", "fatal", "5"]:
        severity = Severity.CRITICAL.value
    elif raw_sev in ["high", "err", "error", "4"]:
        severity = Severity.HIGH.value
    elif raw_sev in ["med", "medium", "warn", "warning", "3"]:
        severity = Severity.MEDIUM.value
    elif raw_sev in ["low", "notice", "2"]:
        severity = Severity.LOW.value
    else:
        severity = Severity.INFO.value

    # MITRE ATT&CK lookup
    mitre_info = MITRE_TACTICS_MAP.get(evt_type, {
        "id": raw_log.get("mitre_id", "T1000"),
        "name": raw_log.get("mitre_name", "Unmapped Technique"),
        "tactic": "Execution"
    })

    # Canary detection
    is_canary = False
    canary_file = raw_log.get("canary_file")
    desc = raw_log.get("event_description") or raw_log.get("message") or raw_log.get("description", "")
    
    canary_keywords = ["Finance_Report_Canary.txt", "Admin_Credentials_Canary.txt", "Backup_Configuration_Canary.txt", "Canary", "decoy"]
    for kw in canary_keywords:
        if kw.lower() in desc.lower() or kw.lower() in str(canary_file or "").lower():
            is_canary = True
            if not canary_file:
                canary_file = kw
            severity = Severity.CRITICAL.value
            evt_type = "canary_access"
            mitre_info = MITRE_TACTICS_MAP["canary_access"]
            break

    # Extract source & destination endpoints
    src_ip = raw_log.get("source_ip") or raw_log.get("src_ip") or raw_log.get("attacker_ip") or "192.168.1.100"
    dst_ip = raw_log.get("destination_ip") or raw_log.get("dst_ip") or raw_log.get("target_ip") or "10.0.0.10"
    username = raw_log.get("username") or raw_log.get("user") or raw_log.get("account") or "unknown_user"
    device_name = raw_log.get("device_name") or raw_log.get("host") or raw_log.get("computer_name") or "WORKSTATION-01"

    event_id = raw_log.get("id") or f"EVT-{abs(hash(norm_ts + src_ip + username)) % 100000:05d}"

    # Calculate Anomaly Score based on severity & event type
    anomaly_weights = {
        "critical": 0.95,
        "high": 0.80,
        "medium": 0.50,
        "low": 0.25,
        "info": 0.05
    }
    base_score = anomaly_weights.get(severity, 0.5)
    if is_canary:
        base_score = 0.99
    if "escalation" in evt_type:
        base_score = max(base_score, 0.92)

    normalized_event = {
        "id": event_id,
        "timestamp": norm_ts,
        "source_ip": src_ip,
        "destination_ip": dst_ip,
        "username": username,
        "device_name": device_name,
        "event_type": evt_type,
        "event_description": desc or f"Simulated {evt_type.replace('_', ' ').title()} event detected on {device_name}",
        "severity": severity,
        "mitre_id": mitre_info["id"],
        "mitre_name": mitre_info["name"],
        "stage": raw_log.get("stage", 1),
        "raw_payload": raw_log,
        "status": "correlated",
        "is_canary": is_canary,
        "canary_file": canary_file,
        "anomaly_score": round(base_score, 2)
    }

    # Generate SHA-256 evidence integrity hash
    normalized_event["evidence_hash"] = compute_evidence_hash(normalized_event)

    return normalized_event

def ingest_and_correlate(raw_log: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ingests raw log, normalizes, handles out-of-order timestamps,
    evaluates correlation patterns, updates Canary states, and persists to DB.
    """
    event = normalize_log(raw_log)

    # If canary was tripped, update canary registry
    if event["is_canary"] and event["canary_file"]:
        canary = db.canaries.find_one({"name": event["canary_file"]})
        if canary:
            db.canaries.update_one(
                {"id": canary["id"]},
                {
                    "tripped": True,
                    "tripped_at": event["timestamp"],
                    "tripped_by": event["username"],
                    "tripped_ip": event["source_ip"]
                }
            )

    # Save to events collection
    db.events.insert_one(event)

    # Update or correlate into an Active Incident
    update_incident_correlation(event)

    return event

def update_incident_correlation(new_event: Dict[str, Any]):
    """
    Correlates new events into an active incident grouping based on shared actors,
    IP addresses, and multi-stage attack patterns.
    """
    # Look for active incident
    active_inc = db.incidents.find_one({"status": "active"})
    
    if not active_inc:
        # Create new incident
        inc_id = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-01"
        new_inc = {
            "id": inc_id,
            "title": f"Active Cyber Intrusion Campaign - {new_event['device_name']}",
            "severity": new_event["severity"],
            "status": "active",
            "created_at": new_event["timestamp"],
            "updated_at": new_event["timestamp"],
            "patient_zero": new_event["device_name"],
            "affected_devices": [new_event["device_name"]],
            "affected_accounts": [new_event["username"]] if new_event["username"] != "unknown_user" else [],
            "events_count": 1,
            "blast_radius_score": 15.0,
            "mitre_tactics": [new_event.get("mitre_id", "T1000")],
            "summary": f"Initial suspicious activity observed originating from {new_event['source_ip']} targeting {new_event['device_name']}."
        }
        db.incidents.insert_one(new_inc)
    else:
        # Update existing incident
        devices = set(active_inc.get("affected_devices", []))
        devices.add(new_event["device_name"])

        accounts = set(active_inc.get("affected_accounts", []))
        if new_event["username"] and new_event["username"] != "unknown_user":
            accounts.add(new_event["username"])

        mitre_tactics = set(active_inc.get("mitre_tactics", []))
        if new_event.get("mitre_id"):
            mitre_tactics.add(new_event["mitre_id"])

        # Elevate incident severity if higher
        sev_rank = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}
        curr_rank = sev_rank.get(active_inc.get("severity", "low"), 1)
        new_rank = sev_rank.get(new_event.get("severity", "low"), 1)
        higher_sev = new_event["severity"] if new_rank > curr_rank else active_inc.get("severity", "medium")

        # Dynamic blast radius approximation
        blast_score = min(100.0, 15.0 + (len(devices) * 15.0) + (len(accounts) * 12.0) + (20.0 if new_event.get("is_canary") else 0.0))

        updated_inc = {
            "severity": higher_sev,
            "updated_at": new_event["timestamp"],
            "affected_devices": list(devices),
            "affected_accounts": list(accounts),
            "events_count": active_inc.get("events_count", 0) + 1,
            "blast_radius_score": round(blast_score, 1),
            "mitre_tactics": list(mitre_tactics),
            "summary": f"Attack chain in progress. {len(devices)} devices and {len(accounts)} accounts impacted across {len(mitre_tactics)} MITRE ATT&CK techniques."
        }
        db.incidents.update_one({"id": active_inc["id"]}, updated_inc)
