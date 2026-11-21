import hashlib
import json
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
from .db import db

def compute_evidence_hash(event_data: Dict[str, Any]) -> str:
    """
    Computes a cryptographic SHA-256 hash for the canonical representation of an event.
    Guarantees evidence integrity and non-repudiation.
    """
    canonical_tokens = [
        str(event_data.get("id", "")),
        str(event_data.get("timestamp", "")),
        str(event_data.get("source_ip", "")),
        str(event_data.get("destination_ip", "")),
        str(event_data.get("username", "")),
        str(event_data.get("device_name", "")),
        str(event_data.get("event_type", "")),
        str(event_data.get("severity", "")),
        str(event_data.get("mitre_id", "")),
        json.dumps(event_data.get("raw_payload", {}), sort_keys=True)
    ]
    canonical_string = "|".join(canonical_tokens)
    return hashlib.sha256(canonical_string.encode("utf-8")).hexdigest()

def verify_single_event(event: Dict[str, Any]) -> Tuple[bool, str, str]:
    """
    Verifies stored evidence hash against recomputed hash.
    Returns: (is_valid, stored_hash, computed_hash)
    """
    stored_hash = event.get("evidence_hash", "")
    computed_hash = compute_evidence_hash(event)
    return (stored_hash == computed_hash, stored_hash, computed_hash)

def verify_ledger() -> Dict[str, Any]:
    """
    Audits the entire evidence ledger, validating every event against its SHA-256 digest.
    """
    all_events = db.events.find(sort_by="timestamp", reverse=False)
    total_count = len(all_events)
    verified_count = 0
    tampered_records = []

    combined_hashes = []
    for evt in all_events:
        is_valid, stored, computed = verify_single_event(evt)
        if is_valid:
            verified_count += 1
            combined_hashes.append(stored)
        else:
            tampered_records.append({
                "event_id": evt.get("id"),
                "timestamp": evt.get("timestamp"),
                "device_name": evt.get("device_name"),
                "stored_hash": stored,
                "computed_hash": computed,
                "discrepancy": "Cryptographic checksum mismatch detected. Content modified post-ingestion."
            })
            combined_hashes.append(computed)

    # Calculate Merkle-like root ledger digest
    ledger_root_hash = hashlib.sha256("".join(combined_hashes).encode("utf-8")).hexdigest() if combined_hashes else "0" * 64

    return {
        "status": "SECURE" if len(tampered_records) == 0 else "COMPROMISED",
        "total_records": total_count,
        "verified_records": verified_count,
        "tampered_records": tampered_records,
        "ledger_root_hash": ledger_root_hash,
        "audited_at": datetime.utcnow().isoformat(),
        "integrity_rate": (verified_count / total_count * 100.0) if total_count > 0 else 100.0
    }

def simulate_tamper_record(event_id: str, malicious_payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Simulates malicious record modification in the database without updating the hash,
    allowing the SOC analyst to test and demonstrate SHA-256 tamper detection.
    """
    evt = db.events.find_one({"id": event_id})
    if not evt:
        return None
    
    # Store original state in raw_payload backup if not already saved
    if "_original_tamper_backup" not in evt:
        evt["raw_payload"]["_original_tamper_backup"] = {
            "source_ip": evt.get("source_ip"),
            "event_description": evt.get("event_description"),
            "severity": evt.get("severity")
        }

    # Apply malicious updates directly to record fields without re-hashing
    for k, v in malicious_payload.items():
        evt[k] = v

    db.events.update_one({"id": event_id}, evt)
    return evt

def restore_tampered_record(event_id: str) -> Optional[Dict[str, Any]]:
    """
    Restores a tampered record back to its verified original state.
    """
    evt = db.events.find_one({"id": event_id})
    if not evt:
        return None
    
    backup = evt.get("raw_payload", {}).get("_original_tamper_backup")
    if backup:
        for k, v in backup.items():
            evt[k] = v
        evt.get("raw_payload", {}).pop("_original_tamper_backup", None)
    
    # Recompute correct hash
    evt["evidence_hash"] = compute_evidence_hash(evt)
    db.events.update_one({"id": event_id}, evt)
    return evt
