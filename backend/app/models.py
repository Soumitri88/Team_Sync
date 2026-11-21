from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class EventType(str, Enum):
    BRUTE_FORCE = "brute_force"
    SUSPICIOUS_LOGIN = "suspicious_login"
    LATERAL_MOVEMENT = "lateral_movement"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    CANARY_ACCESS = "canary_access"
    FILE_EXFILTRATION = "file_exfiltration"
    C2_BEACON = "c2_beacon"
    PERSISTENCE = "persistence"
    RECONNAISSANCE = "reconnaissance"

class SecurityEvent(BaseModel):
    id: str
    timestamp: str
    source_ip: str
    destination_ip: str
    username: str
    device_name: str
    event_type: str
    event_description: str
    severity: str
    mitre_id: Optional[str] = None
    mitre_name: Optional[str] = None
    stage: int = 1
    raw_payload: Dict[str, Any] = Field(default_factory=dict)
    evidence_hash: str
    status: str = "detected" # detected, correlated, investigated, contained
    is_canary: bool = False
    canary_file: Optional[str] = None
    anomaly_score: float = 0.0

class CanaryFile(BaseModel):
    id: str
    name: str
    path: str
    host_device: str
    created_at: str
    tripped: bool = False
    tripped_at: Optional[str] = None
    tripped_by: Optional[str] = None
    tripped_ip: Optional[str] = None
    description: str
    file_type: str = "decoy_document"

class ResponseAction(BaseModel):
    id: str
    action_type: str # isolate_device, disable_account, block_ip, review_logins, investigate_canaries, rollback_process, generate_report
    target: str
    status: str = "executed" # executed, simulated, pending, revoked
    timestamp: str
    operator: str = "SOC-Analyst-AI"
    details: str
    mitigation_impact: str

class BlastRadiusResult(BaseModel):
    patient_zero: str
    compromised_devices: List[Dict[str, Any]]
    compromised_accounts: List[Dict[str, Any]]
    reachable_devices: List[Dict[str, Any]]
    communication_paths: List[Dict[str, Any]]
    impact_score: float
    containment_priorities: List[Dict[str, Any]]
    confirmed_count: int
    suspected_count: int

class Incident(BaseModel):
    id: str
    title: str
    severity: str
    status: str # active, contained, resolved
    created_at: str
    updated_at: str
    patient_zero: Optional[str] = None
    affected_devices: List[str] = Field(default_factory=list)
    affected_accounts: List[str] = Field(default_factory=list)
    events_count: int = 0
    blast_radius_score: float = 0.0
    mitre_tactics: List[str] = Field(default_factory=list)
    summary: str = ""
