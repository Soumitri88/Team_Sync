import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import copy
from .correlation import ingest_and_correlate
from .db import db

# Predefined Safe Scenarios
SCENARIOS = {
    "brute_force": {
        "id": "brute_force",
        "title": "Brute-force Login Simulation",
        "description": "Simulates external credential guessing against Edge Gateway, followed by account lockout and alert escalation.",
        "mitre_id": "T1110",
        "mitre_name": "Brute Force: Password Guessing",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.1.10",
                "username": "admin",
                "device_name": "GW-VPN-EDGE-01",
                "event_type": "brute_force",
                "event_description": "Repeated SSH authentication failure (Attempt 1/5) using dictionary list.",
                "severity": "low",
                "mitre_id": "T1110",
                "mitre_name": "Brute Force: Password Guessing",
                "stage": 1,
                "raw_payload": {"port": 22, "protocol": "SSH", "auth_status": "FAILED", "attempt": 1}
            },
            {
                "offset_sec": 3,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.1.10",
                "username": "administrator",
                "device_name": "GW-VPN-EDGE-01",
                "event_type": "brute_force",
                "event_description": "Repeated SSH authentication failure (Attempt 2/5) targeting privileged account.",
                "severity": "medium",
                "mitre_id": "T1110",
                "mitre_name": "Brute Force: Password Guessing",
                "stage": 1,
                "raw_payload": {"port": 22, "protocol": "SSH", "auth_status": "FAILED", "attempt": 2}
            },
            {
                "offset_sec": 6,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.1.10",
                "username": "svc_backup",
                "device_name": "GW-VPN-EDGE-01",
                "event_type": "brute_force",
                "event_description": "Repeated authentication failure (Attempt 5/5) detected. Threshold exceeded.",
                "severity": "high",
                "mitre_id": "T1110",
                "mitre_name": "Brute Force: Password Guessing",
                "stage": 1,
                "raw_payload": {"port": 22, "protocol": "SSH", "auth_status": "FAILED", "attempt": 5, "threshold_breached": True}
            },
            {
                "offset_sec": 9,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.1.10",
                "username": "svc_backup",
                "device_name": "GW-VPN-EDGE-01",
                "event_type": "brute_force",
                "event_description": "Account 'svc_backup' locked out due to high volume of failed authentication requests.",
                "severity": "critical",
                "mitre_id": "T1110",
                "mitre_name": "Brute Force: Password Guessing",
                "stage": 1,
                "raw_payload": {"action": "ACCOUNT_LOCKED", "ip_flagged": "198.51.100.44"}
            }
        ]
    },
    "suspicious_login_lateral": {
        "id": "suspicious_login_lateral",
        "title": "Suspicious Login & Lateral Movement",
        "description": "Simulates compromised valid credentials used from an anomalous geographical IP, pivoting to an internal database server.",
        "mitre_id": "T1078",
        "mitre_name": "Valid Accounts & Remote Services",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "203.0.113.89",
                "destination_ip": "10.0.2.14",
                "username": "sarah.connor",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "suspicious_login",
                "event_description": "Interactive RDP login detected from unrecognized public IP outside normal working hours.",
                "severity": "high",
                "mitre_id": "T1078",
                "mitre_name": "Valid Accounts: Compromised Credentials",
                "stage": 1,
                "raw_payload": {"auth_protocol": "Kerberos/RDP", "geo_country": "Anonymous Proxy", "client_version": "FreeRDP"}
            },
            {
                "offset_sec": 4,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.254",
                "username": "sarah.connor",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "reconnaissance",
                "event_description": "Network scanning port 445 (SMB) and 3389 across local subnet /24.",
                "severity": "medium",
                "mitre_id": "T1046",
                "mitre_name": "Network Service Discovery",
                "stage": 2,
                "raw_payload": {"tool": "nmap_syn_scan", "targets_scanned": 254, "open_ports": [445, 135, 3389]}
            },
            {
                "offset_sec": 8,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.4.50",
                "username": "sarah.connor",
                "device_name": "SRV-DATABASE-02",
                "event_type": "lateral_movement",
                "event_description": "Lateral SMB session opened to internal database server using acquired user session token.",
                "severity": "critical",
                "mitre_id": "T1021",
                "mitre_name": "Remote Services: SMB/Windows Admin Shares",
                "stage": 2,
                "raw_payload": {"share_accessed": "\\\\SRV-DATABASE-02\\C$", "auth_method": "NTLMv2"}
            }
        ]
    },
    "privilege_escalation": {
        "id": "privilege_escalation",
        "title": "Privilege Escalation Simulation",
        "description": "Simulates standard user escalating permissions to NT AUTHORITY\\SYSTEM via token impersonation and DLL sideloading.",
        "mitre_id": "T1068",
        "mitre_name": "Exploitation for Privilege Escalation",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "sarah.connor",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "reconnaissance",
                "event_description": "Execution of 'whoami /priv' and token enumeration via powershell.exe.",
                "severity": "low",
                "mitre_id": "T1057",
                "mitre_name": "Process Discovery",
                "stage": 1,
                "raw_payload": {"cmdline": "powershell.exe -NoP -ep bypass -c whoami /priv"}
            },
            {
                "offset_sec": 4,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "sarah.connor",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "SeImpersonatePrivilege exploitation detected via Potato exploit family (simulated).",
                "severity": "high",
                "mitre_id": "T1134",
                "mitre_name": "Access Token Manipulation",
                "stage": 2,
                "raw_payload": {"exploit_family": "GodPotato", "target_token": "SYSTEM", "process_id": 4812}
            },
            {
                "offset_sec": 8,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "SYSTEM",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "Process spawned with elevated NT AUTHORITY\\SYSTEM privileges: cmd.exe /c mimikatz.exe (simulated).",
                "severity": "critical",
                "mitre_id": "T1068",
                "mitre_name": "Exploitation for Privilege Escalation",
                "stage": 3,
                "raw_payload": {"spawned_process": "cmd.exe", "integrity_level": "High/System"}
            }
        ]
    },
    "suspicious_file_access": {
        "id": "suspicious_file_access",
        "title": "Suspicious File & Canary Decoy Access",
        "description": "Simulates attacker discovery and attempted reading of synthetic canary deception traps in shared folders.",
        "mitre_id": "T1005",
        "mitre_name": "Data from Local System: Decoy Canary Breach",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.3.11",
                "username": "svc_operator",
                "device_name": "SRV-FINANCE-01",
                "event_type": "reconnaissance",
                "event_description": "Directory traversal on confidential finance network drive: /srv/shared/finance/Q3_Audit/.",
                "severity": "medium",
                "mitre_id": "T1083",
                "mitre_name": "File and Directory Discovery",
                "stage": 1,
                "raw_payload": {"path_searched": "/srv/shared/finance/", "filter": "*.txt;*.xlsx"}
            },
            {
                "offset_sec": 4,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.3.11",
                "username": "svc_operator",
                "device_name": "SRV-FINANCE-01",
                "event_type": "canary_access",
                "event_description": "TRIPWIRE ACTIVATED: Unauthorized file read of decoy canary 'Finance_Report_Canary.txt'.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 2,
                "is_canary": True,
                "canary_file": "Finance_Report_Canary.txt",
                "raw_payload": {"file_path": "/srv/shared/finance/Q3_Audit/Finance_Report_Canary.txt", "action": "READ", "bytes_read": 4096}
            },
            {
                "offset_sec": 8,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.4.80",
                "username": "svc_operator",
                "device_name": "DEV-STORAGE-03",
                "event_type": "canary_access",
                "event_description": "TRIPWIRE ACTIVATED: Unauthorized touch of backup canary 'Backup_Configuration_Canary.txt'.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 3,
                "is_canary": True,
                "canary_file": "Backup_Configuration_Canary.txt",
                "raw_payload": {"file_path": "/opt/backup/cfg/Backup_Configuration_Canary.txt", "action": "OPEN", "decoy_alarm": True}
            }
        ]
    },
    "multi_stage": {
        "id": "multi_stage",
        "title": "Full Multi-Stage APT Attack Simulation (Demo Mode)",
        "description": "Comprehensive 5-stage cyberattack sequence: Initial Access -> Lateral Movement -> Privilege Escalation -> Canary Deception Breach -> Blast Radius Impact.",
        "mitre_id": "MITRE-ATT&CK-CHAIN",
        "mitre_name": "Full Kill Chain Recreation",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.1.10",
                "username": "david.webb",
                "device_name": "GW-VPN-EDGE-01",
                "event_type": "brute_force",
                "event_description": "Initial credential spraying campaign against public VPN gateway.",
                "severity": "medium",
                "mitre_id": "T1110",
                "mitre_name": "Brute Force: Password Spraying",
                "stage": 1,
                "raw_payload": {"spray_targets": 45, "success_account": "david.webb"}
            },
            {
                "offset_sec": 3,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.2.14",
                "username": "david.webb",
                "device_name": "WS-MARKETING-02",
                "event_type": "suspicious_login",
                "event_description": "Anomalous user login via external VPN from untrusted IP location (Eastern Europe).",
                "severity": "high",
                "mitre_id": "T1078",
                "mitre_name": "Valid Accounts: Compromised Credentials",
                "stage": 1,
                "raw_payload": {"session_type": "VPN_RADIUS", "geo_mismatch": True}
            },
            {
                "offset_sec": 6,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.20",
                "username": "david.webb",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "lateral_movement",
                "event_description": "Lateral pivot via Remote PowerShell (WinRM port 5985) to engineering workstation.",
                "severity": "high",
                "mitre_id": "T1021",
                "mitre_name": "Remote Services: WinRM",
                "stage": 2,
                "raw_payload": {"protocol": "WinRM", "command_executed": "Invoke-Command -ComputerName WS-ENGINEERING-07"}
            },
            {
                "offset_sec": 9,
                "source_ip": "10.0.2.20",
                "destination_ip": "10.0.2.20",
                "username": "SYSTEM",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "Elevation of privilege achieved via Named Pipe token impersonation. System shell spawned.",
                "severity": "critical",
                "mitre_id": "T1068",
                "mitre_name": "Exploitation for Privilege Escalation",
                "stage": 3,
                "raw_payload": {"escalation_technique": "NamedPipeImpersonation", "token": "NT AUTHORITY\\SYSTEM"}
            },
            {
                "offset_sec": 12,
                "source_ip": "10.0.2.20",
                "destination_ip": "10.0.3.11",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "lateral_movement",
                "event_description": "Lateral movement from compromised workstation to central finance server using Pass-The-Hash.",
                "severity": "critical",
                "mitre_id": "T1550",
                "mitre_name": "Use Alternate Authentication Material: Pass the Hash",
                "stage": 3,
                "raw_payload": {"target_share": "\\\\SRV-FINANCE-01\\Confidential$", "hash_type": "NTLM"}
            },
            {
                "offset_sec": 15,
                "source_ip": "10.0.3.11",
                "destination_ip": "10.0.3.11",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "canary_access",
                "event_description": "CANARY DECEPTION TRIPPED: Attacker opened decoy 'Finance_Report_Canary.txt'. Instant alert triggered.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 4,
                "is_canary": True,
                "canary_file": "Finance_Report_Canary.txt",
                "raw_payload": {"path": "/srv/shared/finance/Q3_Audit/Finance_Report_Canary.txt", "trigger": "CANARY_OPEN_READ"}
            },
            {
                "offset_sec": 18,
                "source_ip": "10.0.3.11",
                "destination_ip": "10.0.1.1",
                "username": "SYSTEM",
                "device_name": "DC-CORP-01",
                "event_type": "canary_access",
                "event_description": "CANARY DECEPTION TRIPPED: Access attempt on honeypot 'Admin_Credentials_Canary.txt' on Primary Domain Controller.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 4,
                "is_canary": True,
                "canary_file": "Admin_Credentials_Canary.txt",
                "raw_payload": {"path": "/etc/security/vault/Admin_Credentials_Canary.txt", "trigger": "CANARY_VAULT_TOUCH"}
            },
            {
                "offset_sec": 21,
                "source_ip": "10.0.3.11",
                "destination_ip": "198.51.100.44",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "file_exfiltration",
                "event_description": "Data staging and outbound encrypted egress communication observed to attacker C2 node.",
                "severity": "critical",
                "mitre_id": "T1048",
                "mitre_name": "Exfiltration Over Alternative Protocol: Encrypted HTTPS",
                "stage": 5,
                "raw_payload": {"bytes_sent": 8452000, "dest_port": 443, "destination_domain": "c2-cdn-verify.net"}
            }
        ]
    }
}

class SimulationController:
    def __init__(self):
        self.status: str = "idle" # idle, running, paused, completed
        self.current_scenario_id: Optional[str] = None
        self.current_step_index: int = 0
        self.speed: float = 1.0 # 1.0, 2.0, 5.0
        self._task: Optional[asyncio.Task] = None
        self.listeners = []

    def get_state(self) -> Dict[str, Any]:
        scenario = SCENARIOS.get(self.current_scenario_id) if self.current_scenario_id else None
        total_steps = len(scenario["events"]) if scenario else 0
        return {
            "status": self.status,
            "scenario_id": self.current_scenario_id,
            "scenario_title": scenario["title"] if scenario else None,
            "current_step": self.current_step_index,
            "total_steps": total_steps,
            "speed": self.speed,
            "progress_pct": round((self.current_step_index / total_steps * 100), 1) if total_steps > 0 else 0
        }

    async def broadcast_state(self, message: Dict[str, Any]):
        for queue in self.listeners:
            try:
                await queue.put(message)
            except Exception:
                pass

    def start(self, scenario_id: str, speed: float = 1.0):
        if scenario_id not in SCENARIOS:
            raise ValueError(f"Unknown scenario: {scenario_id}")
        
        self.status = "running"
        self.current_scenario_id = scenario_id
        self.speed = speed
        self.current_step_index = 0

        # Cancel any previous task
        if self._task and not self._task.done():
            self._task.cancel()

        self._task = asyncio.create_task(self._run_loop())

    def pause(self):
        if self.status == "running":
            self.status = "paused"

    def resume(self):
        if self.status == "paused":
            self.status = "running"

    def reset(self):
        if self._task and not self._task.done():
            self._task.cancel()
        self.status = "idle"
        self.current_step_index = 0
        self.current_scenario_id = None

    def step_forward(self) -> Optional[Dict[str, Any]]:
        """Executes a single step synchronously and advances pointer."""
        if not self.current_scenario_id or self.current_scenario_id not in SCENARIOS:
            self.current_scenario_id = "multi_stage"

        scenario = SCENARIOS[self.current_scenario_id]
        if self.current_step_index >= len(scenario["events"]):
            self.status = "completed"
            return None

        event_template = copy.deepcopy(scenario["events"][self.current_step_index])
        event_template["timestamp"] = datetime.utcnow().isoformat()
        
        # Ingest and correlate
        ingested = ingest_and_correlate(event_template)
        self.current_step_index += 1
        
        if self.current_step_index >= len(scenario["events"]):
            self.status = "completed"

        return ingested

    async def _run_loop(self):
        try:
            scenario = SCENARIOS[self.current_scenario_id]
            events = scenario["events"]

            while self.current_step_index < len(events):
                if self.status == "paused":
                    await asyncio.sleep(0.5)
                    continue

                if self.status != "running":
                    break

                # Execute step
                evt_def = copy.deepcopy(events[self.current_step_index])
                evt_def["timestamp"] = datetime.utcnow().isoformat()
                
                ingested = ingest_and_correlate(evt_def)
                self.current_step_index += 1

                # Notify listeners
                await self.broadcast_state({
                    "type": "NEW_EVENT",
                    "event": ingested,
                    "sim_state": self.get_state()
                })

                # Sleep interval based on speed
                delay = 2.5 / max(self.speed, 0.5)
                await asyncio.sleep(delay)

            if self.current_step_index >= len(events):
                self.status = "completed"
                await self.broadcast_state({
                    "type": "SIMULATION_COMPLETED",
                    "sim_state": self.get_state()
                })
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            self.status = "error"

sim_controller = SimulationController()
