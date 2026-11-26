import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import copy
from .correlation import ingest_and_correlate
from .db import db

# Predefined Safe Scenarios
SCENARIOS = {
    "windows_pc": {
        "id": "windows_pc",
        "title": "Windows Computer Intrusion (6-Stage Kill Chain)",
        "device_type": "windows",
        "target_device": "WS-ENGINEERING-07",
        "description": "Realistic enterprise Windows attack sequence: Suspicious Login -> PrivEsc -> Lateral Movement -> Suspicious File Access -> Exfiltration -> PrivEsc Alert.",
        "mitre_id": "MITRE-WIN-CHAIN",
        "mitre_name": "Windows Enterprise Kill Chain",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.2.14",
                "username": "david.webb",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "suspicious_login",
                "event_description": "Stage 1: Suspicious Login Attempt - Anomalous interactive RDP authentication from external untrusted IP.",
                "severity": "high",
                "mitre_id": "T1078",
                "mitre_name": "Valid Accounts: Compromised Credentials",
                "stage": 1,
                "raw_payload": {"protocol": "RDP", "auth_status": "SUCCESS", "geo_country": "Anonymous VPN Proxy"}
            },
            {
                "offset_sec": 3,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "david.webb",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "Stage 2: Privilege Escalation Indicator - SeDebugPrivilege abuse attempt targeting local LSASS subsystem.",
                "severity": "high",
                "mitre_id": "T1134",
                "mitre_name": "Access Token Manipulation",
                "stage": 2,
                "raw_payload": {"privilege_requested": "SeDebugPrivilege", "process": "powershell.exe", "integrity": "Medium"}
            },
            {
                "offset_sec": 6,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.3.11",
                "username": "david.webb",
                "device_name": "SRV-FINANCE-01",
                "event_type": "lateral_movement",
                "event_description": "Stage 3: Lateral Movement Indicator - Remote WinRM invocation from engineering PC to internal finance server.",
                "severity": "critical",
                "mitre_id": "T1021",
                "mitre_name": "Remote Services: WinRM",
                "stage": 3,
                "raw_payload": {"port": 5985, "command": "Invoke-Command -ComputerName SRV-FINANCE-01"}
            },
            {
                "offset_sec": 9,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.3.11",
                "username": "david.webb",
                "device_name": "SRV-FINANCE-01",
                "event_type": "canary_access",
                "event_description": "Stage 4: Suspicious File Access - Adversary opened canary decoy 'financial_report_demo.txt'. Instant alert triggered.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 4,
                "is_canary": True,
                "canary_file": "financial_report_demo.txt",
                "raw_payload": {"file": "financial_report_demo.txt", "action": "READ", "tripwire_alert": True}
            },
            {
                "offset_sec": 12,
                "source_ip": "10.0.3.11",
                "destination_ip": "198.51.100.44",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "file_exfiltration",
                "event_description": "Stage 5: Data Exfiltration Indicator - Outbound encrypted egress communication observed to adversary C2 server.",
                "severity": "critical",
                "mitre_id": "T1048",
                "mitre_name": "Exfiltration Over Alternative Protocol",
                "stage": 5,
                "raw_payload": {"bytes_sent": 4200000, "dest_port": 443, "destination_domain": "adverse-egress.net"}
            },
            {
                "offset_sec": 15,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "SYSTEM",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "Stage 6: Privilege Escalation Alert - Persistent NT AUTHORITY\\SYSTEM service installed for adversary persistence.",
                "severity": "critical",
                "mitre_id": "T1543",
                "mitre_name": "Create or Modify System Process: Windows Service",
                "stage": 6,
                "raw_payload": {"service_name": "PloySecSvc_Persistent", "binary_path": "C:\\Windows\\Temp\\svc_agent.exe"}
            }
        ]
    },
    "android_mobile": {
        "id": "android_mobile",
        "title": "Android Mobile Device Attack Simulation",
        "device_type": "android",
        "target_device": "MOBILE-PIXEL-08",
        "description": "Safe mobile attack sequence: Suspicious APK Login -> Local PrivEsc -> Subnet Probing -> Honey-token Breach -> C2 Exfiltration -> Daemon Persistence.",
        "mitre_id": "MITRE-MOBILE-ANDROID",
        "mitre_name": "Android Enterprise Mobile Attack Chain",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.4.52",
                "username": "mobile_user",
                "device_name": "MOBILE-PIXEL-08",
                "event_type": "suspicious_login",
                "event_description": "Stage 1: Suspicious Login Attempt - Untrusted OAuth token authorization from unknown mobile client identifier.",
                "severity": "medium",
                "mitre_id": "T1437",
                "mitre_name": "Application Access Token Misuse",
                "stage": 1,
                "raw_payload": {"client_id": "rogue.mobile.agent", "auth_grant": "refresh_token"}
            },
            {
                "offset_sec": 3,
                "source_ip": "10.0.4.52",
                "destination_ip": "10.0.4.52",
                "username": "mobile_user",
                "device_name": "MOBILE-PIXEL-08",
                "event_type": "privilege_escalation",
                "event_description": "Stage 2: Privilege Escalation Indicator - App sandbox escape attempt via Binder IPC driver vulnerability (simulated).",
                "severity": "high",
                "mitre_id": "T1404",
                "mitre_name": "Exploitation for Privilege Escalation: Linux Kernel",
                "stage": 2,
                "raw_payload": {"ipc_target": "/dev/binder", "uid_escalation": 0}
            },
            {
                "offset_sec": 6,
                "source_ip": "10.0.4.52",
                "destination_ip": "10.0.2.14",
                "username": "root",
                "device_name": "MOBILE-PIXEL-08",
                "event_type": "lateral_movement",
                "event_description": "Stage 3: Lateral Movement Indicator - Mobile device initiating unauthorized SMB probe across corporate Wi-Fi subnet.",
                "severity": "critical",
                "mitre_id": "T1428",
                "mitre_name": "Lateral Movement: Network Sniffing & SMB Probing",
                "stage": 3,
                "raw_payload": {"subnet_scanned": "10.0.2.0/24", "target_port": 445}
            },
            {
                "offset_sec": 9,
                "source_ip": "10.0.4.52",
                "destination_ip": "10.0.1.1",
                "username": "root",
                "device_name": "DC-CORP-01",
                "event_type": "canary_access",
                "event_description": "Stage 4: Suspicious File Access - Canary trap 'admin_credentials_demo.txt' opened by mobile process.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 4,
                "is_canary": True,
                "canary_file": "admin_credentials_demo.txt",
                "raw_payload": {"file": "admin_credentials_demo.txt", "trigger": "CANARY_MOBILE_READ"}
            },
            {
                "offset_sec": 12,
                "source_ip": "10.0.4.52",
                "destination_ip": "198.51.100.44",
                "username": "root",
                "device_name": "MOBILE-PIXEL-08",
                "event_type": "file_exfiltration",
                "event_description": "Stage 5: Data Exfiltration Indicator - Cellular telemetry burst uploading corporate contacts and tokens to adversary IP.",
                "severity": "critical",
                "mitre_id": "T1430",
                "mitre_name": "Exfiltration Over Cellular Connection",
                "stage": 5,
                "raw_payload": {"bytes_sent": 1850000, "protocol": "HTTPS_POST"}
            },
            {
                "offset_sec": 15,
                "source_ip": "10.0.4.52",
                "destination_ip": "10.0.4.52",
                "username": "root",
                "device_name": "MOBILE-PIXEL-08",
                "event_type": "privilege_escalation",
                "event_description": "Stage 6: Privilege Escalation Alert - Background init.rc service registered to survive device reboot.",
                "severity": "critical",
                "mitre_id": "T1402",
                "mitre_name": "Broadcast Receivers Persistence",
                "stage": 6,
                "raw_payload": {"boot_receiver": "com.android.sysagent.Receiver", "persistent": True}
            }
        ]
    },
    "ios_mobile": {
        "id": "ios_mobile",
        "title": "iOS Mobile Device Simulation Mode",
        "device_type": "ios",
        "target_device": "IPHONE-CORP-15",
        "description": "Safe iOS sandbox simulation: WebKit Sandbox Escape -> Keychain Query -> Container Traversal -> Honey-token Breach -> DNS Exfiltration -> Kernel Alert.",
        "mitre_id": "MITRE-MOBILE-IOS",
        "mitre_name": "iOS Mobile Enterprise Attack Chain (Simulation Mode)",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.4.61",
                "username": "sarah.connor",
                "device_name": "IPHONE-CORP-15",
                "event_type": "suspicious_login",
                "event_description": "Stage 1: Suspicious Login Attempt - Malicious MDM enterprise configuration profile installed from untrusted source.",
                "severity": "medium",
                "mitre_id": "T1436",
                "mitre_name": "Device Management Compromise",
                "stage": 1,
                "raw_payload": {"profile_name": "Enterprise_Testing_Cert_9", "cert_valid": False}
            },
            {
                "offset_sec": 3,
                "source_ip": "10.0.4.61",
                "destination_ip": "10.0.4.61",
                "username": "mobile_worker",
                "device_name": "IPHONE-CORP-15",
                "event_type": "privilege_escalation",
                "event_description": "Stage 2: Privilege Escalation Indicator - Simulated WebKit JIT compiler vulnerability triggering sandbox escape.",
                "severity": "high",
                "mitre_id": "T1404",
                "mitre_name": "Exploitation for Privilege Escalation: iOS Sandbox Escape",
                "stage": 2,
                "raw_payload": {"engine": "WebKit/JIT", "sandbox_breached": True}
            },
            {
                "offset_sec": 6,
                "source_ip": "10.0.4.61",
                "destination_ip": "10.0.4.80",
                "username": "mobile_worker",
                "device_name": "DEV-STORAGE-03",
                "event_type": "lateral_movement",
                "event_description": "Stage 3: Lateral Movement Indicator - Container sandbox traversed, accessing internal storage server DEV-STORAGE-03.",
                "severity": "high",
                "mitre_id": "T1428",
                "mitre_name": "Internal Service Discovery via Corporate Wi-Fi",
                "stage": 3,
                "raw_payload": {"destination_service": "DEV-STORAGE-03:8443"}
            },
            {
                "offset_sec": 9,
                "source_ip": "10.0.4.61",
                "destination_ip": "10.0.4.80",
                "username": "mobile_worker",
                "device_name": "DEV-STORAGE-03",
                "event_type": "canary_access",
                "event_description": "Stage 4: Suspicious File Access - Canary dummy file 'confidential_demo.txt' opened by mobile browser.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 4,
                "is_canary": True,
                "canary_file": "confidential_demo.txt",
                "raw_payload": {"file": "confidential_demo.txt", "trigger": "CANARY_CONFIDENTIAL_READ"}
            },
            {
                "offset_sec": 12,
                "source_ip": "10.0.4.61",
                "destination_ip": "198.51.100.44",
                "username": "mobile_worker",
                "device_name": "IPHONE-CORP-15",
                "event_type": "file_exfiltration",
                "event_description": "Stage 5: Data Exfiltration Indicator - Covert DNS tunneling query sequence transferring token payload.",
                "severity": "critical",
                "mitre_id": "T1071",
                "mitre_name": "Application Layer Protocol: DNS Tunneling",
                "stage": 5,
                "raw_payload": {"dns_queries": 140, "base64_length": 84200}
            },
            {
                "offset_sec": 15,
                "source_ip": "10.0.4.61",
                "destination_ip": "10.0.4.61",
                "username": "mobile_worker",
                "device_name": "IPHONE-CORP-15",
                "event_type": "privilege_escalation",
                "event_description": "Stage 6: Privilege Escalation Alert - iOS Kernel integrity check flagged anomalous memory descriptor modification.",
                "severity": "critical",
                "mitre_id": "T1404",
                "mitre_name": "Kernel Data Structure Modification Flag",
                "stage": 6,
                "raw_payload": {"integrity_violation": "KPP_FLAG_0x44", "status": "FLAGGED"}
            }
        ]
    },
    "judge_demo": {
        "id": "judge_demo",
        "title": "Hackathon Judge Demo (Temporal Correlation & Out-Of-Order Logs)",
        "device_type": "all",
        "target_device": "WS-ENGINEERING-07",
        "description": "Special Hackathon Judge Demonstration: Ingests logs intentionally out of order to demonstrate PloyWeb's temporal correlation engine, TraceGraph reconstruction, canary detection, blast radius, and SHA-256 evidence integrity.",
        "mitre_id": "JUDGE-DEMO-MVP",
        "mitre_name": "Autonomous Investigation MVP Evaluation",
        "events": [
            {
                "offset_sec": 0,
                "source_ip": "198.51.100.44",
                "destination_ip": "10.0.1.10",
                "username": "david.webb",
                "device_name": "GW-VPN-EDGE-01",
                "event_type": "brute_force",
                "event_description": "Initial credential spraying against public VPN gateway.",
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
                "device_name": "WS-ENGINEERING-07",
                "event_type": "suspicious_login",
                "event_description": "Stage 1: Suspicious Login Attempt - Anomalous login from untrusted IP location.",
                "severity": "high",
                "mitre_id": "T1078",
                "mitre_name": "Valid Accounts: Compromised Credentials",
                "stage": 1,
                "raw_payload": {"session_type": "VPN_RADIUS", "geo_mismatch": True}
            },
            {
                "offset_sec": 6,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "david.webb",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "Stage 2: Privilege Escalation Indicator - Elevation to NT AUTHORITY\\SYSTEM achieved via token manipulation.",
                "severity": "critical",
                "mitre_id": "T1068",
                "mitre_name": "Exploitation for Privilege Escalation",
                "stage": 2,
                "raw_payload": {"token": "NT AUTHORITY\\SYSTEM"}
            },
            {
                "offset_sec": 9,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.3.11",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "lateral_movement",
                "event_description": "Stage 3: Lateral Movement Indicator - Pivot to central finance server using Pass-The-Hash.",
                "severity": "critical",
                "mitre_id": "T1550",
                "mitre_name": "Use Alternate Authentication Material: Pass the Hash",
                "stage": 3,
                "raw_payload": {"target_share": "\\\\SRV-FINANCE-01\\Confidential$", "hash_type": "NTLM"}
            },
            {
                "offset_sec": 12,
                "source_ip": "10.0.3.11",
                "destination_ip": "10.0.3.11",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "canary_access",
                "event_description": "Stage 4: Suspicious File Access - Canary trap 'financial_report_demo.txt' opened by unauthorized process.",
                "severity": "critical",
                "mitre_id": "T1005",
                "mitre_name": "Data from Local System: Decoy Canary Breach",
                "stage": 4,
                "is_canary": True,
                "canary_file": "financial_report_demo.txt",
                "raw_payload": {"path": "/srv/shared/finance/Q3_Audit/financial_report_demo.txt", "trigger": "CANARY_OPEN_READ"}
            },
            {
                "offset_sec": 15,
                "source_ip": "10.0.3.11",
                "destination_ip": "198.51.100.44",
                "username": "SYSTEM",
                "device_name": "SRV-FINANCE-01",
                "event_type": "file_exfiltration",
                "event_description": "Stage 5: Data Exfiltration Indicator - Outbound encrypted egress communication observed to C2 node.",
                "severity": "critical",
                "mitre_id": "T1048",
                "mitre_name": "Exfiltration Over Alternative Protocol: Encrypted HTTPS",
                "stage": 5,
                "raw_payload": {"bytes_sent": 8452000, "dest_port": 443, "destination_domain": "c2-cdn-verify.net"}
            },
            {
                "offset_sec": 18,
                "source_ip": "10.0.2.14",
                "destination_ip": "10.0.2.14",
                "username": "SYSTEM",
                "device_name": "WS-ENGINEERING-07",
                "event_type": "privilege_escalation",
                "event_description": "Stage 6: Privilege Escalation Alert - Malicious persistence daemon scheduled for system boot.",
                "severity": "critical",
                "mitre_id": "T1543",
                "mitre_name": "Create or Modify System Process",
                "stage": 6,
                "raw_payload": {"action": "DAEMON_PERSISTENCE"}
            }
        ]
    }
}

# Alias for backwards compatibility
SCENARIOS["multi_stage"] = SCENARIOS["windows_pc"]

# Controlled Test Scenarios for Demonstration & Endpoint Agent
SCENARIOS["scenario_process"] = {
    "id": "scenario_process",
    "title": "Scenario A: Suspicious Process Spawning",
    "device_type": "windows",
    "target_device": "WS-ENGINEERING-07",
    "description": "Benign PowerShell & cmd execution pattern in isolated test environment.",
    "mitre_id": "T1059",
    "mitre_name": "Command and Scripting Interpreter: PowerShell",
    "events": [
        {
            "offset_sec": 0,
            "source_ip": "10.0.2.14",
            "destination_ip": "10.0.2.14",
            "username": "david.webb",
            "device_name": "WS-ENGINEERING-07",
            "event_type": "process_execution",
            "event_description": "Controlled Test: Benign test command spawned under PID tracking.",
            "severity": "medium",
            "mitre_id": "T1059.001",
            "mitre_name": "PowerShell Command Execution",
            "stage": 1,
            "raw_payload": {"process": "powershell.exe -NoProfile -Command Write-Host 'Harmless probe'", "pid": 4812}
        },
        {
            "offset_sec": 3,
            "source_ip": "10.0.2.14",
            "destination_ip": "10.0.2.14",
            "username": "david.webb",
            "device_name": "WS-ENGINEERING-07",
            "event_type": "privilege_escalation",
            "event_description": "Controlled Test: Access token query on local thread.",
            "severity": "high",
            "mitre_id": "T1134",
            "mitre_name": "Access Token Manipulation",
            "stage": 2,
            "raw_payload": {"privilege_requested": "SeDebugPrivilege", "process": "powershell.exe"}
        }
    ]
}

SCENARIOS["scenario_file"] = {
    "id": "scenario_file",
    "title": "Scenario B: Canary File Modification",
    "device_type": "windows",
    "target_device": "WS-ENGINEERING-07",
    "description": "Safe file write and canary tripwire simulation in dedicated test folder.",
    "mitre_id": "T1005",
    "mitre_name": "Data from Local System: Decoy Canary Breach",
    "events": [
        {
            "offset_sec": 0,
            "source_ip": "10.0.2.14",
            "destination_ip": "10.0.3.11",
            "username": "SYSTEM",
            "device_name": "SRV-FINANCE-01",
            "event_type": "canary_access",
            "event_description": "Decoy Trap Breached: Canary tripwire accessed in sandbox.",
            "severity": "critical",
            "mitre_id": "T1005",
            "mitre_name": "Data from Local System: Decoy Canary Breach",
            "stage": 1,
            "is_canary": True,
            "canary_file": "financial_report_demo.txt",
            "raw_payload": {"path": "test_sandbox/files/financial_report_demo.txt", "trigger": "CANARY_OPEN_READ"}
        }
    ]
}

class SimulationController:
    def __init__(self):
        self.status: str = "idle"  # idle, running, paused, completed, error
        self.current_step_index: int = 0
        self.current_scenario_id: Optional[str] = None
        self.speed: float = 1.0  # multiplier
        self.listeners: List[asyncio.Queue] = []
        self._task: Optional[asyncio.Task] = None

    def get_state(self) -> Dict[str, Any]:
        scenario = SCENARIOS.get(self.current_scenario_id, {})
        total_steps = len(scenario.get("events", []))
        progress = (self.current_step_index / total_steps * 100) if total_steps > 0 else 0.0

        return {
            "status": self.status,
            "current_step": self.current_step_index,
            "total_steps": total_steps,
            "progress_pct": round(progress, 1),
            "scenario_id": self.current_scenario_id,
            "scenario_title": scenario.get("title", "None"),
            "target_device": scenario.get("target_device", "WS-ENGINEERING-07"),
            "speed": self.speed,
            "active_threat": self.status in ["running", "paused"]
        }

    async def broadcast_state(self, message: Dict[str, Any]):
        for q in self.listeners:
            try:
                await q.put(message)
            except Exception:
                pass

    def start(self, scenario_id: str = "windows_pc", speed: float = 1.0):
        if scenario_id not in SCENARIOS:
            scenario_id = "windows_pc"

        if self._task and not self._task.done():
            self._task.cancel()

        self.current_scenario_id = scenario_id
        self.speed = max(speed, 0.2)
        self.current_step_index = 0
        self.status = "running"

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
            self.current_scenario_id = "windows_pc"

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
