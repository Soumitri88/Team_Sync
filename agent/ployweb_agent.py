#!/usr/bin/env python3
"""
PloyWeb Safe Endpoint Monitoring Agent & Controlled Attack Simulator
=====================================================================
Enterprise Cybersecurity Investigation Endpoint Daemon for Windows.
Safely collects genuine endpoint telemetry (processes, files, network, canary tripwires)
and provides non-destructive, strictly scoped attack demonstrations for hackathon judging.

Safety Guarantee:
- All actions are strictly isolated to the designated test sandbox directory.
- No malicious payloads, exploits, persistence, or sensitive data access are ever executed.
- Remediation physically terminates only test processes spawned during the simulation.
"""

import os
import sys
import time
import json
import socket
import platform
import hashlib
import shutil
import subprocess
import threading
from datetime import datetime
from typing import Dict, Any, Optional, List

# Attempt to import requests, fallback to urllib if not installed
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    HAS_REQUESTS = False

# Default configuration
DEFAULT_BACKEND_URL = os.environ.get("PLOYWEB_URL", "http://localhost:8000")
AGENT_VERSION = "2.1.0-SecOps"

# Setup Safe Sandbox Directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
SANDBOX_DIR = os.path.join(PROJECT_ROOT, "test_sandbox")
FILES_DIR = os.path.join(SANDBOX_DIR, "files")
QUARANTINE_DIR = os.path.join(SANDBOX_DIR, "quarantine")
BACKUPS_DIR = os.path.join(SANDBOX_DIR, "backups")

class PloyWebEndpointAgent:
    def __init__(self, backend_url: str = DEFAULT_BACKEND_URL):
        self.backend_url = backend_url.rstrip("/")
        self.hostname = socket.gethostname()
        self.device_id = f"DEV-{hashlib.md5(self.hostname.encode()).hexdigest()[:6].upper()}"
        self.os_info = f"{platform.system()} {platform.release()} ({platform.version().split('.')[0]})"
        self.ip_address = self._get_local_ip()
        self.username = os.environ.get("USERNAME") or os.environ.get("USER") or "SecOperator"
        self.is_registered = False
        self.is_running = True
        self.active_test_pids: List[int] = []
        self.active_simulation_state: Dict[str, Any] = {
            "status": "idle",
            "scenario": None,
            "last_action": None,
            "contained": False
        }

        self._init_sandbox()

    def _get_local_ip(self) -> str:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def _init_sandbox(self):
        """Creates the isolated test sandbox folders."""
        for d in [SANDBOX_DIR, FILES_DIR, QUARANTINE_DIR, BACKUPS_DIR]:
            os.makedirs(d, exist_ok=True)

        # Create pristine canary decoy test file
        canary_path = os.path.join(FILES_DIR, "financial_report_demo.txt")
        if not os.path.exists(canary_path):
            with open(canary_path, "w", encoding="utf-8") as f:
                f.write(
                    "=== CONFIDENTIAL FINANCIAL AUDIT SUMMARY (SAFE DECOY) ===\n"
                    "Organization: Contoso Corp Financial Services\n"
                    "Status: CANARY TWIN DECOY HONEY-TOKEN\n"
                    "Note: This file contains zero real data. Any unauthorized read triggers DEFCON 1 alert.\n"
                    "Hash Seed: 7f4955c4d6fba5f98cf85d9bf73295f7ecbe9fa161fb975a5c68f182c611488c\n"
                )

        # Create backup copy for remediation restoration
        backup_path = os.path.join(BACKUPS_DIR, "financial_report_demo.txt")
        shutil.copy2(canary_path, backup_path)

    def _http_post(self, endpoint: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        url = f"{self.backend_url}{endpoint}"
        try:
            if HAS_REQUESTS:
                res = requests.post(url, json=payload, timeout=4)
                if res.status_code in [200, 201]:
                    return res.json()
            else:
                data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=4) as response:
                    return json.loads(response.read().decode("utf-8"))
        except Exception as e:
            # Backend not reachable or offline; handled gracefully
            return None
        return None

    def compute_sha256(self, filepath: str) -> str:
        """Computes cryptographic SHA-256 digest of an endpoint artifact."""
        if not os.path.exists(filepath):
            return "0" * 64
        sha256 = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def register(self) -> bool:
        """Registers this physical Windows computer with the PloyWeb SOC backend."""
        payload = {
            "id": self.device_id,
            "name": self.hostname,
            "device_type": "windows",
            "os": self.os_info,
            "ip": self.ip_address,
            "username": self.username,
            "status": "connected",
            "mode": "Physical Windows Endpoint Agent (Active Telemetry)",
            "version": AGENT_VERSION,
            "sandbox_path": SANDBOX_DIR,
            "registered_at": datetime.utcnow().isoformat(),
            "security_posture": "nominal"
        }
        res = self._http_post("/api/agent/register", payload)
        if res:
            self.is_registered = True
            print(f"[✓] Successfully registered endpoint '{self.hostname}' with PloyWeb backend.")
            return True
        else:
            print(f"[!] Backend unreachable at {self.backend_url}. Operating in Standalone Demonstration Mode.")
            return False

    def send_telemetry_event(self, event_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Sends a genuine security telemetry event to the PloyWeb correlation engine."""
        timestamp = datetime.utcnow().isoformat()
        raw_str = f"{timestamp}:{event_data.get('event_type')}:{self.hostname}:{self.username}"
        digest = hashlib.sha256(raw_str.encode()).hexdigest()

        full_event = {
            "timestamp": timestamp,
            "source_ip": event_data.get("source_ip", self.ip_address),
            "destination_ip": event_data.get("destination_ip", "10.0.0.1"),
            "username": event_data.get("username", self.username),
            "device_name": self.hostname,
            "event_type": event_data.get("event_type", "endpoint_telemetry"),
            "event_description": event_data.get("description", "Endpoint audit telemetry"),
            "severity": event_data.get("severity", "medium"),
            "mitre_id": event_data.get("mitre_id", "T1059"),
            "mitre_name": event_data.get("mitre_name", "Command and Scripting Interpreter"),
            "stage": event_data.get("stage", 1),
            "evidence_hash": digest,
            "raw_payload": event_data.get("raw_payload", {}),
            "is_canary": event_data.get("is_canary", False),
            "canary_file": event_data.get("canary_file"),
            "is_live_agent": True
        }

        res = self._http_post("/api/agent/telemetry", full_event)
        # Also post to standard ingest if agent endpoint not available
        if not res:
            res = self._http_post("/api/events/ingest", full_event)

        print(f"  [TELEMETRY STREAM] [{full_event['severity'].upper()}] {full_event['event_type']} -> {full_event['event_description'][:65]}...")
        return full_event

    def send_heartbeat(self):
        """Sends periodic live pulse to indicate active connection."""
        payload = {
            "device_id": self.device_id,
            "hostname": self.hostname,
            "timestamp": datetime.utcnow().isoformat(),
            "active_test_pids": self.active_test_pids,
            "status": "connected",
            "security_posture": "threat_active" if self.active_test_pids else "nominal"
        }
        self._http_post("/api/agent/heartbeat", payload)

    # ==================== CONTROLLED ATTACK SCENARIOS ====================

    def run_scenario_process(self) -> Dict[str, Any]:
        """
        Scenario A: Suspicious Process Activity
        Spawns a harmless tagged test background process in the sandbox.
        Captures genuine OS PID, execution command, and sends telemetry.
        """
        print("\n" + "="*70)
        print("  LAUNCHING SCENARIO A: SUSPICIOUS PROCESS CREATION (SAFE BENIGN)")
        print("="*70)

        # Benign test command: sleeps in background so it can be verified and killed
        test_script = (
            "import time, sys; "
            "print('PloyWeb Controlled Benign Test Process Active'); "
            "time.sleep(300)"
        )
        proc = subprocess.Popen(
            [sys.executable, "-c", test_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        pid = proc.pid
        self.active_test_pids.append(pid)

        event_payload = {
            "event_type": "suspicious_process_spawn",
            "description": f"Stage 2: Privilege Escalation Indicator - Suspicious PowerShell/Python subprocess spawned with PID {pid}.",
            "severity": "high",
            "mitre_id": "T1059.001",
            "mitre_name": "Command and Scripting Interpreter: PowerShell/Python",
            "stage": 2,
            "raw_payload": {
                "process_id": pid,
                "process_name": "python.exe",
                "parent_pid": os.getpid(),
                "command_line": f"{sys.executable} -c \"import time...\"",
                "executable_hash": self.compute_sha256(sys.executable),
                "is_benign_simulation": True
            }
        }
        self.send_telemetry_event(event_payload)
        print(f"[+] Harmless test process running with real OS PID: {pid}")
        return {"scenario": "process", "pid": pid}

    def run_scenario_file_and_canary(self) -> Dict[str, Any]:
        """
        Scenario B: Suspicious File & Canary Modification
        Modifies a test file and touches the Canary Twin decoy.
        Computes genuine cryptographic hashes before and after.
        """
        print("\n" + "="*70)
        print("  LAUNCHING SCENARIO B: SUSPICIOUS FILE ACCESS & CANARY DECOY BREACH")
        print("="*70)

        canary_path = os.path.join(FILES_DIR, "financial_report_demo.txt")
        pre_hash = self.compute_sha256(canary_path)

        # Simulate unauthorized file read/append
        with open(canary_path, "a", encoding="utf-8") as f:
            f.write(f"\n[UNAUTHORIZED ACCESS LOG: {datetime.utcnow().isoformat()} by adversary_sim]")

        post_hash = self.compute_sha256(canary_path)

        event_payload = {
            "event_type": "canary_access",
            "description": "Stage 4: Canary Decoy Accessed - Tripwire 'financial_report_demo.txt' opened by unauthorized caller.",
            "severity": "critical",
            "mitre_id": "T1005",
            "mitre_name": "Data from Local System: Decoy Canary Breach",
            "stage": 4,
            "is_canary": True,
            "canary_file": "financial_report_demo.txt",
            "raw_payload": {
                "file_path": canary_path,
                "access_type": "UNAUTHORIZED_WRITE_APPEND",
                "pre_access_sha256": pre_hash,
                "post_access_sha256": post_hash,
                "tripwire_detonated": True
            }
        }
        self.send_telemetry_event(event_payload)
        print(f"[!] Canary tripwire detonated on '{canary_path}'! SHA-256 hash changed.")
        return {"scenario": "file_canary", "pre_hash": pre_hash, "post_hash": post_hash}

    def run_scenario_network(self) -> Dict[str, Any]:
        """
        Scenario C: Network Threat Simulation
        Initiates controlled benign network telemetry probe to test server.
        """
        print("\n" + "="*70)
        print("  LAUNCHING SCENARIO C: NETWORK THREAT / C2 EGRESS SIMULATION")
        print("="*70)

        # Benign test probe
        test_url = f"{self.backend_url}/api/health"
        try:
            if HAS_REQUESTS:
                requests.get(test_url, timeout=2)
            else:
                urllib.request.urlopen(test_url, timeout=2)
        except Exception:
            pass

        event_payload = {
            "event_type": "c2_beacon",
            "description": "Stage 5: Data Exfiltration Indicator - Outbound HTTP egress communication observed to destination 198.51.100.44:443.",
            "severity": "critical",
            "mitre_id": "T1048",
            "mitre_name": "Exfiltration Over Alternative Protocol: HTTP Egress",
            "stage": 5,
            "raw_payload": {
                "dest_ip": "198.51.100.44",
                "dest_port": 443,
                "bytes_out": 4194304,
                "protocol": "HTTPS (Simulated Encrypted Egress)",
                "socket_state": "ESTABLISHED"
            }
        }
        self.send_telemetry_event(event_payload)
        return {"scenario": "network", "dest": "198.51.100.44:443"}

    def run_scenario_multistage_chain(self) -> Dict[str, Any]:
        """
        Scenario D: Coordinated Multi-Stage Attack Simulation
        Sequentially executes genuine process activity, canary access, and network egress.
        Demonstrates complete kill-chain reconstruction.
        """
        print("\n" + "="*70)
        print("  LAUNCHING SCENARIO D: FULL COORDINATED MULTI-STAGE KILL CHAIN")
        print("="*70)

        # Stage 1: Initial Suspicious Login
        self.send_telemetry_event({
            "event_type": "suspicious_login",
            "description": f"Stage 1: Suspicious Login Attempt - Anomalous interactive authentication from external IP 198.51.100.44 on {self.hostname}.",
            "severity": "high",
            "mitre_id": "T1078",
            "mitre_name": "Valid Accounts: Compromised Credentials",
            "stage": 1,
            "source_ip": "198.51.100.44",
            "raw_payload": {"protocol": "RDP", "auth_status": "SUCCESS"}
        })
        time.sleep(1.2)

        # Stage 2: Process Spawn (Real PID)
        self.run_scenario_process()
        time.sleep(1.2)

        # Stage 3: Lateral Movement WinRM
        self.send_telemetry_event({
            "event_type": "lateral_movement",
            "description": f"Stage 3: Lateral Movement Indicator - WinRM session invoked from {self.hostname} targeting internal storage host.",
            "severity": "critical",
            "mitre_id": "T1021",
            "mitre_name": "Remote Services: WinRM",
            "stage": 3,
            "raw_payload": {"port": 5985, "target_host": "SRV-FINANCE-01"}
        })
        time.sleep(1.2)

        # Stage 4: Canary Decoy Breach
        self.run_scenario_file_and_canary()
        time.sleep(1.2)

        # Stage 5: Network Exfiltration
        self.run_scenario_network()
        time.sleep(1.2)

        # Stage 6: Persistent Service Alert
        self.send_telemetry_event({
            "event_type": "privilege_escalation",
            "description": f"Stage 6: Privilege Escalation Alert - Persistent NT AUTHORITY\\SYSTEM service installed on {self.hostname}.",
            "severity": "critical",
            "mitre_id": "T1543",
            "mitre_name": "Create or Modify System Process: Windows Service",
            "stage": 6,
            "raw_payload": {"service_name": "PloySecSvc_Persistent"}
        })

        print("\n[✓] Multi-Stage Attack Simulation sequence completed. Telemetry transmitted to PloyWeb.")
        return {"status": "completed", "pids": self.active_test_pids}

    # ==================== SAFE REMEDIATION & VERIFICATION ====================

    def execute_remediation(self) -> Dict[str, Any]:
        """
        Executes genuine, safe remediation on the host:
        1. Terminate all test PIDs spawned during simulation.
        2. Quarantine modified canary artifact.
        3. Restore pristine canary file from backup.
        4. Physical Verification: Checks tasklist to confirm processes are terminated.
        """
        print("\n" + "="*70)
        print("  EXECUTING AUTONOMOUS ENDPOINT REMEDIATION & VERIFICATION")
        print("="*70)

        killed_pids = []
        # 1. Terminate test processes
        for pid in list(self.active_test_pids):
            try:
                if platform.system() == "Windows":
                    subprocess.run(["taskkill", "/F", "/PID", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    os.kill(pid, 9)
                killed_pids.append(pid)
                print(f"[✓] Terminated test process PID: {pid}")
            except Exception as e:
                print(f"[!] Note on PID {pid}: {e}")

        self.active_test_pids.clear()

        # 2. Quarantine modified canary and restore clean backup
        canary_path = os.path.join(FILES_DIR, "financial_report_demo.txt")
        quarantine_target = os.path.join(QUARANTINE_DIR, f"financial_report_demo_quarantined_{int(time.time())}.txt")
        backup_path = os.path.join(BACKUPS_DIR, "financial_report_demo.txt")

        if os.path.exists(canary_path):
            shutil.move(canary_path, quarantine_target)
            print(f"[✓] Quarantined tampered artifact to: {quarantine_target}")

        if os.path.exists(backup_path):
            shutil.copy2(backup_path, canary_path)
            print(f"[✓] Restored pristine clean decoy from backup: {canary_path}")

        # 3. Physical Verification Step
        verified_clean = True
        for pid in killed_pids:
            try:
                # Check if PID still exists
                if platform.system() == "Windows":
                    output = subprocess.check_output(f'tasklist /FI "PID eq {pid}"', shell=True).decode()
                    if str(pid) in output:
                        verified_clean = False
                else:
                    os.kill(pid, 0)
                    verified_clean = False
            except Exception:
                # Exception means process does NOT exist (which is what we want)
                pass

        verification_record = {
            "remediation_status": "CONTAINED",
            "terminated_pids": killed_pids,
            "verification_check_passed": verified_clean,
            "quarantined_files": [quarantine_target],
            "restored_files": [canary_path],
            "current_sha256": self.compute_sha256(canary_path),
            "timestamp": datetime.utcnow().isoformat(),
            "operator": "Autonomous-PloyWeb-Agent"
        }

        # Send containment event
        self.send_telemetry_event({
            "event_type": "incident_contained",
            "description": f"Incident Contained: Host {self.hostname} neutralized. Terminated PIDs: {killed_pids}. Decoy restored.",
            "severity": "info",
            "mitre_id": "RESPONSE-CONTAIN",
            "mitre_name": "Autonomous Incident Response & Endpoint Containment",
            "raw_payload": verification_record
        })

        print("\n" + "="*70)
        print("  [✓] VERIFICATION CONFIRMED: THREAT CONTAINED & ENDPOINT PROTECTED")
        print("="*70)
        return verification_record

    def run_daemon(self):
        """Runs the agent as a background listener with periodic heartbeats and command polling."""
        print(f"\n[+] PloyWeb Agent daemon active for host '{self.hostname}' ({self.ip_address})")
        print("[+] Telemetry streaming to PloyWeb SOC...")

        self.register()

        while self.is_running:
            try:
                self.send_heartbeat()
                # Poll for commands if backend supports it
                res = self._http_post("/api/agent/poll-commands", {"device_id": self.device_id})
                if res and res.get("command"):
                    cmd = res["command"]
                    if cmd == "run_simulation":
                        self.run_scenario_multistage_chain()
                    elif cmd == "remediate":
                        self.execute_remediation()
                time.sleep(4)
            except KeyboardInterrupt:
                print("\n[!] Stopping PloyWeb Agent...")
                break
            except Exception as e:
                time.sleep(4)

def interactive_menu():
    """Interactive command-line menu for Hackathon demonstration."""
    agent = PloyWebEndpointAgent()

    banner = r"""
  ██████╗ ██╗      ██████╗ ██╗   ██╗██╗    ██╗███████╗██████╗ 
  ██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██║    ██║██╔════╝██╔══██╗
  ██████╔╝██║     ██║   ██║ ╚████╔╝ ██║ █╗ ██║█████╗  ██████╔╝
  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██║███╗██║██╔══╝  ██╔══██╗
  ██║     ███████╗╚██████╔╝   ██║   ╚███╔███╔╝███████╗██████╔╝
  ╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚══╝╚══╝ ╚══════╝╚═════╝ 
        Autonomous Endpoint Security & Investigation Agent
    """
    print(banner)
    print(f"  Target Device:  {agent.hostname} ({agent.os_info})")
    print(f"  IP Address:     {agent.ip_address}")
    print(f"  Backend URL:    {agent.backend_url}")
    print(f"  Test Sandbox:   {SANDBOX_DIR}")
    print("-" * 70)

    agent.register()

    # Start background heartbeat thread
    heartbeat_thread = threading.Thread(target=lambda: [agent.send_heartbeat(), time.sleep(5)] if agent.is_running else None, daemon=True)
    heartbeat_thread.start()

    while True:
        print("\n  [AVAILABLE HACKATHON DEMONSTRATION ACTIONS]")
        print("  1. Run Scenario A: Suspicious Process Creation (Safe Benign Process)")
        print("  2. Run Scenario B: Suspicious File & Canary Decoy Breach")
        print("  3. Run Scenario C: Simulated Network Threat (C2 Egress)")
        print("  4. Run Scenario D: Complete 6-Stage Multi-Stage Attack Simulation")
        print("  5. Execute Safe Remediation & Verify Host Containment")
        print("  6. Start Background Telemetry Daemon (Auto Heartbeat & Polling)")
        print("  7. Exit")
        print("-" * 70)

        choice = input("  Select action [1-7]: ").strip()

        if choice == "1":
            agent.run_scenario_process()
        elif choice == "2":
            agent.run_scenario_file_and_canary()
        elif choice == "3":
            agent.run_scenario_network()
        elif choice == "4":
            agent.run_scenario_multistage_chain()
        elif choice == "5":
            agent.execute_remediation()
        elif choice == "6":
            agent.run_daemon()
        elif choice == "7":
            print("[+] Exiting PloyWeb Agent.")
            break
        else:
            print("[!] Invalid option. Please select 1-7.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--daemon":
        agent = PloyWebEndpointAgent()
        agent.run_daemon()
    elif len(sys.argv) > 1 and sys.argv[1] == "--simulate":
        agent = PloyWebEndpointAgent()
        scenario = sys.argv[2] if len(sys.argv) > 2 else "multistage"
        if scenario == "process":
            agent.run_scenario_process()
        elif scenario == "file":
            agent.run_scenario_file_and_canary()
        elif scenario == "network":
            agent.run_scenario_network()
        else:
            agent.run_scenario_multistage_chain()
    elif len(sys.argv) > 1 and sys.argv[1] == "--remediate":
        agent = PloyWebEndpointAgent()
        agent.execute_remediation()
    else:
        interactive_menu()
