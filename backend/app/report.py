from datetime import datetime
from typing import Dict, Any, List
from .db import db
from .blast_radius import calculate_blast_radius
from .evidence import verify_ledger

def generate_investigation_report() -> Dict[str, Any]:
    """
    Compiles a comprehensive forensic investigation report
    merging timeline, MITRE techniques, blast radius, evidence ledger,
    and remediation recommendations.
    """
    events = db.events.find(sort_by="timestamp", reverse=False)
    blast = calculate_blast_radius()
    ledger_audit = verify_ledger()
    actions = db.response_actions.find(sort_by="timestamp", reverse=True)
    canaries = db.canaries.find()
    tripped_canaries = [c for c in canaries if c.get("tripped")]

    # Extract unique MITRE techniques
    techniques = {}
    for evt in events:
        mid = evt.get("mitre_id")
        if mid and mid not in techniques:
            techniques[mid] = {
                "id": mid,
                "name": evt.get("mitre_name", "Unspecified"),
                "first_seen": evt.get("timestamp"),
                "occurrences": 1,
                "severity": evt.get("severity", "medium")
            }
        elif mid:
            techniques[mid]["occurrences"] += 1

    report_id = f"IR-REPORT-{datetime.utcnow().strftime('%Y%m%d')}-099"

    # Executive Summary Narrative
    if events:
        earliest_ts = events[0]["timestamp"]
        latest_ts = events[-1]["timestamp"]
        patient_zero = blast.get("patient_zero", "Unknown")
        compromised_devs = [d["name"] for d in blast.get("compromised_devices", [])]
        compromised_accs = [a["username"] for a in blast.get("compromised_accounts", [])]

        summary = (
            f"Autonomous cybersecurity investigation conducted by PloyWeb platform between {earliest_ts} "
            f"and {latest_ts}. An adversarial intrusion campaign was identified originating against perimeter "
            f"node '{patient_zero}'. The attacker progressed across {len(compromised_devs)} endpoints "
            f"({', '.join(compromised_devs) if compromised_devs else 'none'}) utilizing compromised credentials "
            f"and privilege escalation to access internal network assets. Deception canary tripwires were activated "
            f"on {len(tripped_canaries)} decoy traps, successfully corroborating targeted intent. "
            f"Calculated enterprise blast radius exposure is {blast.get('impact_score', 0)}%."
        )
    else:
        summary = "No active intrusion events or security telemetry currently recorded."

    recommendations = [
        {
            "category": "Perimeter & Identity",
            "action": "Enforce Multi-Factor Authentication (MFA) & FIDO2 on all external VPN gateways.",
            "priority": "HIGH",
            "mitre_ref": "T1110, T1078"
        },
        {
            "category": "Privilege & Access Control",
            "action": "Audit and restrict SeImpersonatePrivilege and local administrator delegation across all workstations.",
            "priority": "CRITICAL",
            "mitre_ref": "T1068, T1134"
        },
        {
            "category": "Deception Architecture",
            "action": "Expand Canary Twin decoy files across high-value database mounts and Active Directory shares.",
            "priority": "MEDIUM",
            "mitre_ref": "T1005"
        },
        {
            "category": "Network Microsegmentation",
            "action": "Isolate engineering and finance subnets via dynamic Zero-Trust Network Access (ZTNA) policies.",
            "priority": "HIGH",
            "mitre_ref": "T1021"
        }
    ]

    return {
        "report_id": report_id,
        "generated_at": datetime.utcnow().isoformat(),
        "classification": "CONFIDENTIAL // SOC RESTRICTED",
        "investigation_status": "CONCLUDED" if len(actions) >= 2 else "ACTIVE_INVESTIGATION",
        "incident_summary": summary,
        "blast_radius": blast,
        "mitre_techniques": list(techniques.values()),
        "timeline_events": events,
        "evidence_audit": ledger_audit,
        "response_actions_taken": actions,
        "recommendations": recommendations,
        "investigator": "PloyWeb Autonomous Forensic Engine v2.4",
        "digital_seal_hash": ledger_audit.get("ledger_root_hash", "0"*64)
    }
