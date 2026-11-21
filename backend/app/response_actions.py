from datetime import datetime
from typing import Dict, Any, List, Optional
from .db import db

def execute_simulated_action(action_type: str, target: str, operator: str = "SOC-Commander") -> Dict[str, Any]:
    """
    Executes a simulated containment countermeasure without touching real OS or network.
    Maintains an immutable audit ledger of security interventions.
    """
    action_id = f"ACT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{abs(hash(target)) % 1000:03d}"
    
    playbook_map = {
        "isolate_device": {
            "title": "Endpoint Network Containment",
            "details": f"Simulated 802.1X VLAN isolation applied to endpoint '{target}'. Blocked all ingress/egress traffic except SOC telemetry port 8443.",
            "mitigation_impact": "Halts lateral propagation and prevents attacker C2 egress."
        },
        "disable_account": {
            "title": "IAM Account Suspension & Token Revocation",
            "details": f"Simulated Active Directory account '{target}' set to Disabled. All active Kerberos TGT tickets purged from domain controllers.",
            "mitigation_impact": "Nullifies compromised credentials and cuts session access."
        },
        "block_ip": {
            "title": "Perimeter Firewall Ingress Drop",
            "details": f"Simulated boundary ACL rule deployed to Edge Gateway: DROP ip source '{target}' on all external interfaces.",
            "mitigation_impact": "Prevents remote adversary from initiating new ingress TCP handshakes."
        },
        "review_logins": {
            "title": "Authentication Deep Forensics",
            "details": f"Simulated historical audit initiated for target '{target}'. Flagged 4 anomaly events across 48-hour event window.",
            "mitigation_impact": "Identifies initial access vector and concurrent unauthorized sessions."
        },
        "investigate_canaries": {
            "title": "Canary Deception Forensics Extraction",
            "details": f"Simulated honey-token forensic memory dump collected for decoy '{target}'. Extracted process PID and origin IP.",
            "mitigation_impact": "Confirms attacker objective and validates deceptive telemetry."
        },
        "generate_report": {
            "title": "Autonomous Incident Dossier Compilation",
            "details": f"Simulated cryptographic incident dossier compiled for target '{target}'. SHA-256 evidence chain sealed.",
            "mitigation_impact": "Delivers executive summary, forensic timeline, and post-incident hardening steps."
        }
    }

    meta = playbook_map.get(action_type, {
        "title": "Custom SOC Playbook Countermeasure",
        "details": f"Executed custom mitigation action against '{target}'.",
        "mitigation_impact": "Reduces environmental risk exposure."
    })

    record = {
        "id": action_id,
        "action_type": action_type,
        "target": target,
        "status": "EXECUTED_SIMULATED",
        "timestamp": datetime.utcnow().isoformat(),
        "operator": operator,
        "title": meta["title"],
        "details": meta["details"],
        "mitigation_impact": meta["mitigation_impact"]
    }

    db.response_actions.insert_one(record)

    # If action was isolating a device or disabling account, check if all confirmed threats are contained
    active_inc = db.incidents.find_one({"status": "active"})
    if active_inc:
        actions_count = db.response_actions.count_documents()
        if actions_count >= 3:
            db.incidents.update_one({"id": active_inc["id"]}, {
                "status": "contained",
                "summary": "Threat actively contained by automated SOC countermeasures. Systems quarantined."
            })

    return record

def get_action_history() -> List[Dict[str, Any]]:
    return db.response_actions.find(sort_by="timestamp", reverse=True)
