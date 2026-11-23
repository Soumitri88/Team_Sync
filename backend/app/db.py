import json
import os
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

class JsonCollection:
    def __init__(self, filename: str):
        self.filepath = os.path.join(DATA_DIR, filename)
        self.lock = threading.Lock()
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        with self.lock:
            if os.path.exists(self.filepath):
                try:
                    with open(self.filepath, "r", encoding="utf-8") as f:
                        self._data = json.load(f)
                except Exception:
                    self._data = []
            else:
                self._data = []

    def _save(self):
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving {self.filepath}: {e}")

    def insert_one(self, doc: Dict[str, Any]):
        with self.lock:
            doc_copy = dict(doc)
            self._data.append(doc_copy)
            self._save()
            return doc_copy

    def insert_many(self, docs: List[Dict[str, Any]]):
        with self.lock:
            for doc in docs:
                self._data.append(dict(doc))
            self._save()
            return docs

    def find(self, query: Optional[Dict[str, Any]] = None, sort_by: Optional[str] = None, reverse: bool = False, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        with self.lock:
            results = []
            for item in self._data:
                match = True
                if query:
                    for k, v in query.items():
                        if item.get(k) != v:
                            match = False
                            break
                if match:
                    results.append(dict(item))

            if sort_by:
                results.sort(key=lambda x: str(x.get(sort_by, "")), reverse=reverse)

            if limit:
                return results[:limit]
            return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self.lock:
            for item in self._data:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    return dict(item)
            return None

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        with self.lock:
            for item in self._data:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    # check for $set operator or plain dict
                    if "$set" in update:
                        item.update(update["$set"])
                    else:
                        item.update(update)
                    self._save()
                    return True
            return False

    def delete_many(self, query: Optional[Dict[str, Any]] = None) -> int:
        with self.lock:
            if not query:
                count = len(self._data)
                self._data = []
                self._save()
                return count
            
            initial_count = len(self._data)
            self._data = [
                item for item in self._data
                if not all(item.get(k) == v for k, v in query.items())
            ]
            deleted = initial_count - len(self._data)
            self._save()
            return deleted

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        with self.lock:
            if not query:
                return len(self._data)
            count = 0
            for item in self._data:
                if all(item.get(k) == v for k, v in query.items()):
                    count += 1
            return count

class DatabaseManager:
    def __init__(self):
        self.events = JsonCollection("events.json")
        self.canaries = JsonCollection("canaries.json")
        self.response_actions = JsonCollection("response_actions.json")
        self.incidents = JsonCollection("incidents.json")
        self.settings = JsonCollection("settings.json")
        self.simulation_state = JsonCollection("simulation_state.json")
        self.devices = JsonCollection("devices.json")
        self._init_defaults()

    def _init_defaults(self):
        # Default settings if empty
        if self.settings.count_documents() == 0:
            self.settings.insert_one({
                "id": "global_config",
                "soc_name": "PloyWeb Autonomous SOC",
                "alert_threshold": "medium",
                "auto_correlate": True,
                "canary_auto_isolate": True,
                "blast_radius_depth": 3,
                "api_rate_limit": 100,
                "theme": "dark_navy",
                "updated_at": datetime.utcnow().isoformat()
            })

        # Default Registered Devices if empty
        if self.devices.count_documents() == 0:
            default_devices = [
                {
                    "id": "DEV-001",
                    "name": "WS-ENGINEERING-07",
                    "device_type": "windows",
                    "os": "Windows 11 Enterprise (23H2)",
                    "ip": "10.0.2.14",
                    "status": "connected",
                    "mode": "Simulated Telemetry Agent",
                    "registered_at": datetime.utcnow().isoformat(),
                    "last_seen": datetime.utcnow().isoformat(),
                    "security_posture": "elevated_risk"
                },
                {
                    "id": "DEV-002",
                    "name": "MOBILE-PIXEL-08",
                    "device_type": "android",
                    "os": "Android 14 (Google Pixel 8)",
                    "ip": "10.0.4.52",
                    "status": "connected",
                    "mode": "Simulated Mobile Agent",
                    "registered_at": datetime.utcnow().isoformat(),
                    "last_seen": datetime.utcnow().isoformat(),
                    "security_posture": "nominal"
                },
                {
                    "id": "DEV-003",
                    "name": "IPHONE-CORP-15",
                    "device_type": "ios",
                    "os": "iOS 17.4 (iPhone 15 Pro)",
                    "ip": "10.0.4.61",
                    "status": "connected",
                    "mode": "Sandbox Simulation Mode",
                    "registered_at": datetime.utcnow().isoformat(),
                    "last_seen": datetime.utcnow().isoformat(),
                    "security_posture": "nominal"
                },
                {
                    "id": "DEV-004",
                    "name": "SRV-FINANCE-01",
                    "device_type": "linux",
                    "os": "Ubuntu 22.04 LTS",
                    "ip": "10.0.3.11",
                    "status": "connected",
                    "mode": "Server Telemetry Stream",
                    "registered_at": datetime.utcnow().isoformat(),
                    "last_seen": datetime.utcnow().isoformat(),
                    "security_posture": "critical_threat"
                }
            ]
            self.devices.insert_many(default_devices)

        # Default Canary Files if empty
        if self.canaries.count_documents() == 0:
            default_canaries = [
                {
                    "id": "CAN-001",
                    "name": "financial_report_demo.txt",
                    "path": "/srv/shared/finance/Q3_Audit/financial_report_demo.txt",
                    "host_device": "SRV-FINANCE-01",
                    "created_at": datetime.utcnow().isoformat(),
                    "tripped": False,
                    "tripped_at": None,
                    "tripped_by": None,
                    "tripped_ip": None,
                    "description": "Harmless decoy financial audit spreadsheet detecting unauthorized lateral traversal.",
                    "file_type": "decoy_document"
                },
                {
                    "id": "CAN-002",
                    "name": "admin_credentials_demo.txt",
                    "path": "/etc/security/vault/admin_credentials_demo.txt",
                    "host_device": "DC-CORP-01",
                    "created_at": datetime.utcnow().isoformat(),
                    "tripped": False,
                    "tripped_at": None,
                    "tripped_by": None,
                    "tripped_ip": None,
                    "description": "Fictional credential honey-token file monitoring domain controller probing.",
                    "file_type": "honey_credentials"
                },
                {
                    "id": "CAN-003",
                    "name": "confidential_demo.txt",
                    "path": "/opt/backup/cfg/confidential_demo.txt",
                    "host_device": "DEV-STORAGE-03",
                    "created_at": datetime.utcnow().isoformat(),
                    "tripped": False,
                    "tripped_at": None,
                    "tripped_by": None,
                    "tripped_ip": None,
                    "description": "Harmless confidential dummy text file detecting exfiltration staging.",
                    "file_type": "decoy_infrastructure"
                }
            ]
            self.canaries.insert_many(default_canaries)

db = DatabaseManager()
