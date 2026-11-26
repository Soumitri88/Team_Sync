import sqlite3
import json
import os
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "ployweb.db")

class SQLiteCollection:
    """
    Relational SQLite Collection replacing the legacy JSON store.
    Stores and queries documents with SQLite transactions, ACID guarantees, and WAL mode.
    """
    def __init__(self, collection_name: str, db_path: str = DB_PATH):
        self.collection_name = collection_name
        self.db_path = db_path
        self.lock = threading.Lock()
        self._local = threading.local()
        self._init_table()

    def _get_connection(self) -> sqlite3.Connection:
        if not hasattr(self._local, "conn") or self._local.conn is None:
            conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=15.0)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA foreign_keys = ON;")
            self._local.conn = conn
        return self._local.conn

    def _init_table(self):
        with self.lock:
            conn = self._get_connection()
            conn.execute("""
            CREATE TABLE IF NOT EXISTS sqlite_collections (
                collection_name TEXT NOT NULL,
                doc_id TEXT NOT NULL,
                doc_data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                PRIMARY KEY (collection_name, doc_id)
            );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_coll_name ON sqlite_collections(collection_name);")
            conn.commit()

    def insert_one(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            doc_copy = dict(doc)
            doc_id = str(doc_copy.get("id") or doc_copy.get("_id") or datetime.utcnow().timestamp())
            doc_copy["id"] = doc_id
            json_str = json.dumps(doc_copy, default=str)
            now_str = datetime.utcnow().isoformat()

            conn = self._get_connection()
            conn.execute("""
                INSERT OR REPLACE INTO sqlite_collections (collection_name, doc_id, doc_data, created_at)
                VALUES (?, ?, ?, ?)
            """, (self.collection_name, doc_id, json_str, now_str))

            # Sync security events with relational security_events table if applicable
            if self.collection_name == "events.json":
                try:
                    conn.execute("""
                        INSERT OR REPLACE INTO security_events (
                            id, timestamp, source_ip, destination_ip, username, device_name,
                            event_type, event_description, severity, mitre_id, mitre_name,
                            stage, raw_payload, evidence_hash, status, is_canary, anomaly_score
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        doc_id,
                        doc_copy.get("timestamp", now_str),
                        doc_copy.get("source_ip", "10.0.2.14"),
                        doc_copy.get("destination_ip", "10.0.2.14"),
                        doc_copy.get("username", "david.webb"),
                        doc_copy.get("device_name", "WS-ENGINEERING-07"),
                        doc_copy.get("event_type", "suspicious_process"),
                        doc_copy.get("event_description", "Forensic event logged"),
                        doc_copy.get("severity", "medium"),
                        doc_copy.get("mitre_id", "T1059"),
                        doc_copy.get("mitre_name", "Command and Scripting"),
                        int(doc_copy.get("stage", 1)),
                        json_str,
                        doc_copy.get("evidence_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
                        doc_copy.get("status", "detected"),
                        1 if doc_copy.get("is_canary") else 0,
                        float(doc_copy.get("anomaly_score", 0.0))
                    ))
                except Exception:
                    pass

            conn.commit()
            return doc_copy

    def insert_many(self, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        inserted = []
        for d in docs:
            inserted.append(self.insert_one(d))
        return inserted

    def find(self, query: Optional[Dict[str, Any]] = None, sort_by: Optional[str] = None, reverse: bool = False, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        with self.lock:
            conn = self._get_connection()
            cur = conn.cursor()
            cur.execute("""
                SELECT doc_data FROM sqlite_collections
                WHERE collection_name = ?
                ORDER BY created_at DESC
            """, (self.collection_name,))
            rows = cur.fetchall()

            results = []
            for r in rows:
                try:
                    item = json.loads(r["doc_data"])
                    match = True
                    if query:
                        for k, v in query.items():
                            if item.get(k) != v:
                                match = False
                                break
                    if match:
                        results.append(item)
                except Exception:
                    pass

            if sort_by:
                results.sort(key=lambda x: str(x.get(sort_by, "")), reverse=reverse)

            if limit:
                return results[:limit]
            return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        res = self.find(query=query, limit=1)
        return res[0] if res else None

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        with self.lock:
            target = self.find_one(query)
            if not target:
                return False

            if "$set" in update:
                target.update(update["$set"])
            else:
                target.update(update)

            conn = self._get_connection()
            conn.execute("""
                UPDATE sqlite_collections
                SET doc_data = ?
                WHERE collection_name = ? AND doc_id = ?
            """, (json.dumps(target, default=str), self.collection_name, target.get("id")))
            conn.commit()
            return True

    def delete_many(self, query: Optional[Dict[str, Any]] = None) -> int:
        with self.lock:
            conn = self._get_connection()
            if not query:
                cur = conn.execute("DELETE FROM sqlite_collections WHERE collection_name = ?", (self.collection_name,))
                if self.collection_name == "events.json":
                    try:
                        conn.execute("DELETE FROM security_events;")
                    except Exception:
                        pass
                conn.commit()
                return cur.rowcount

            # Delete matching items
            items = self.find(query)
            deleted = 0
            for item in items:
                conn.execute("""
                    DELETE FROM sqlite_collections
                    WHERE collection_name = ? AND doc_id = ?
                """, (self.collection_name, item.get("id")))
                deleted += 1
            conn.commit()
            return deleted

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

class DatabaseManager:
    """
    SQLite Relational Database Manager replacing legacy JSON file store.
    """
    def __init__(self):
        self.events = SQLiteCollection("events.json")
        self.canaries = SQLiteCollection("canaries.json")
        self.response_actions = SQLiteCollection("response_actions.json")
        self.incidents = SQLiteCollection("incidents.json")
        self.settings = SQLiteCollection("settings.json")
        self.simulation_state = SQLiteCollection("simulation_state.json")
        self.devices = SQLiteCollection("devices.json")
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
