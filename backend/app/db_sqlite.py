import sqlite3
import os
import hashlib
import secrets
import json
import threading
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "ployweb.db")

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Secure password hashing using PBKDF2-HMAC-SHA256 with 100,000 iterations and random salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    """Verifies a password against its salt and PBKDF2 hash using constant-time comparison."""
    calculated_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(calculated_hash, expected_hash)

class DatabaseManager:
    _instance = None
    _lock = threading.Lock()

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._local = threading.local()
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        if not hasattr(self._local, "conn") or self._local.conn is None:
            conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=15.0)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON;")
            conn.execute("PRAGMA journal_mode = WAL;")
            self._local.conn = conn
        return self._local.conn

    def execute(self, sql: str, params: Tuple = ()) -> sqlite3.Cursor:
        with self._lock:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, params)
            conn.commit()
            return cursor

    def query_all(self, sql: str, params: Tuple = ()) -> List[Dict[str, Any]]:
        with self._lock:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def query_one(self, sql: str, params: Tuple = ()) -> Optional[Dict[str, Any]]:
        with self._lock:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, params)
            row = cursor.fetchone()
            return dict(row) if row else None

    def init_db(self):
        """Initializes all 19 relational tables specified in PloyWeb Architecture Phase 3."""
        with self._lock:
            conn = self.get_connection()
            cur = conn.cursor()

            # 1. ROLES
            cur.execute("""
            CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                permissions TEXT NOT NULL,
                description TEXT
            );
            """)

            # 2. USERS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                role_id TEXT NOT NULL,
                is_locked INTEGER DEFAULT 0,
                lockout_until TEXT,
                failed_attempts INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            );
            """)

            # 3. EMPLOYEES
            cur.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY,
                employee_id TEXT UNIQUE NOT NULL,
                user_id TEXT UNIQUE NOT NULL,
                department TEXT NOT NULL,
                title TEXT NOT NULL,
                manager TEXT,
                phone TEXT,
                security_clearance TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """)

            # 4. AUTH_EVENTS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS auth_events (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                username TEXT NOT NULL,
                event_type TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                device_name TEXT,
                user_agent TEXT,
                risk_score REAL DEFAULT 0.0,
                risk_level TEXT DEFAULT 'LOW',
                risk_factors TEXT,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """)

            # 5. LOGIN_SESSIONS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS login_sessions (
                id TEXT PRIMARY KEY,
                session_token TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                device_name TEXT,
                user_agent TEXT,
                expires_at TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """)

            # 6. IP_ADDRESSES
            cur.execute("""
            CREATE TABLE IF NOT EXISTS ip_addresses (
                id TEXT PRIMARY KEY,
                ip TEXT UNIQUE NOT NULL,
                reputation TEXT DEFAULT 'clean',
                country TEXT DEFAULT 'US',
                city TEXT,
                is_known INTEGER DEFAULT 1,
                first_seen TEXT NOT NULL,
                last_seen TEXT NOT NULL,
                failed_count INTEGER DEFAULT 0
            );
            """)

            # 7. DEVICES
            cur.execute("""
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY,
                device_id TEXT UNIQUE NOT NULL,
                name TEXT UNIQUE NOT NULL,
                device_type TEXT NOT NULL,
                os TEXT NOT NULL,
                ip TEXT NOT NULL,
                status TEXT DEFAULT 'connected',
                security_posture TEXT DEFAULT 'nominal',
                registered_at TEXT NOT NULL,
                last_seen TEXT NOT NULL
            );
            """)

            # 8. DEVICE_ACTIVITY
            cur.execute("""
            CREATE TABLE IF NOT EXISTS device_activity (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                activity_type TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (device_id) REFERENCES devices(device_id)
            );
            """)

            # 9. SECURITY_EVENTS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS security_events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                source_ip TEXT NOT NULL,
                destination_ip TEXT NOT NULL,
                username TEXT NOT NULL,
                device_name TEXT NOT NULL,
                event_type TEXT NOT NULL,
                event_description TEXT NOT NULL,
                severity TEXT NOT NULL,
                mitre_id TEXT,
                mitre_name TEXT,
                stage INTEGER DEFAULT 1,
                raw_payload TEXT,
                evidence_hash TEXT NOT NULL,
                status TEXT DEFAULT 'detected',
                is_canary INTEGER DEFAULT 0,
                canary_file TEXT,
                anomaly_score REAL DEFAULT 0.0
            );
            """)

            # 10. INCIDENTS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                patient_zero TEXT,
                affected_devices TEXT,
                affected_accounts TEXT,
                events_count INTEGER DEFAULT 0,
                blast_radius_score REAL DEFAULT 0.0,
                mitre_tactics TEXT,
                summary TEXT
            );
            """)

            # 11. ATTACK_GRAPH_NODES
            cur.execute("""
            CREATE TABLE IF NOT EXISTS attack_graph_nodes (
                id TEXT PRIMARY KEY,
                node_id TEXT UNIQUE NOT NULL,
                label TEXT NOT NULL,
                node_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                visual_state TEXT NOT NULL,
                stage INTEGER DEFAULT 1,
                is_critical_path INTEGER DEFAULT 0,
                confidence REAL DEFAULT 1.0,
                relationship_nature TEXT DEFAULT 'observed',
                metadata_json TEXT,
                created_at TEXT NOT NULL
            );
            """)

            # 12. ATTACK_GRAPH_EDGES
            cur.execute("""
            CREATE TABLE IF NOT EXISTS attack_graph_edges (
                id TEXT PRIMARY KEY,
                edge_id TEXT UNIQUE NOT NULL,
                source TEXT NOT NULL,
                target TEXT NOT NULL,
                label TEXT NOT NULL,
                severity TEXT NOT NULL,
                stage INTEGER DEFAULT 1,
                confidence REAL DEFAULT 1.0,
                relationship_nature TEXT DEFAULT 'observed',
                is_critical_path INTEGER DEFAULT 0,
                metadata_json TEXT,
                created_at TEXT NOT NULL
            );
            """)

            # 13. EVIDENCE
            cur.execute("""
            CREATE TABLE IF NOT EXISTS evidence (
                id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                artifact_name TEXT NOT NULL,
                artifact_type TEXT NOT NULL,
                evidence_hash TEXT NOT NULL,
                original_source TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                verified INTEGER DEFAULT 1,
                metadata_json TEXT,
                FOREIGN KEY (event_id) REFERENCES security_events(id)
            );
            """)

            # 14. ADMIN_APPROVALS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS admin_approvals (
                id TEXT PRIMARY KEY,
                incident_id TEXT NOT NULL,
                reviewer_id TEXT NOT NULL,
                reviewer_name TEXT NOT NULL,
                decision TEXT NOT NULL,
                reason TEXT NOT NULL,
                action_requested TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                execution_result TEXT,
                verification_result TEXT
            );
            """)

            # 15. RESPONSE_ACTIONS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS response_actions (
                id TEXT PRIMARY KEY,
                action_type TEXT NOT NULL,
                target TEXT NOT NULL,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                operator TEXT NOT NULL,
                details TEXT,
                mitigation_impact TEXT,
                integrity_hash TEXT NOT NULL
            );
            """)

            # 16. AUDIT_LOGS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                username TEXT NOT NULL,
                action TEXT NOT NULL,
                incident_id TEXT,
                timestamp TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                current_hash TEXT NOT NULL,
                action_outcome TEXT NOT NULL,
                details TEXT
            );
            """)

            # 17. MFA_VERIFICATIONS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS mfa_verifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_id TEXT,
                code_hash TEXT NOT NULL,
                delivery_method TEXT DEFAULT 'SIMULATED_DEMO_OTP',
                is_verified INTEGER DEFAULT 0,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """)

            # 18. CUSTOMER_ACCOUNTS (NovaTech Solutions Dataset)
            cur.execute("""
            CREATE TABLE IF NOT EXISTS customer_accounts (
                id TEXT PRIMARY KEY,
                customer_id TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                account_tier TEXT DEFAULT 'Standard',
                balance REAL DEFAULT 0.0,
                status TEXT DEFAULT 'active',
                created_at TEXT NOT NULL
            );
            """)

            # 19. NOTIFICATIONS
            cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                severity TEXT DEFAULT 'info',
                is_read INTEGER DEFAULT 0,
                link TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """)

            # Indices for High-Performance Forensic Querying
            cur.execute("CREATE INDEX IF NOT EXISTS idx_auth_username ON auth_events(username);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_auth_ts ON auth_events(timestamp);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_sec_events_ts ON security_events(timestamp);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_sec_events_sev ON security_events(severity);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_logs(timestamp);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON login_sessions(session_token);")

            conn.commit()

            # Seed default roles and baseline users
            self._seed_default_data(cur, conn)

    def _seed_default_data(self, cur: sqlite3.Cursor, conn: sqlite3.Connection):
        # 1. Seed Roles
        roles = [
            ("role-admin", "admin", "all", "Master SOC Administrator & Incident Commander"),
            ("role-forensics", "forensic_investigator", "read,investigate,seal", "Lead Digital Forensics Investigator"),
            ("role-analyst", "soc_analyst", "read,mitigate", "Tier-2 SOC Security Analyst"),
            ("role-employee", "employee", "self_read,self_update", "Standard Enterprise Employee")
        ]
        for r in roles:
            cur.execute("INSERT OR IGNORE INTO roles (id, name, permissions, description) VALUES (?, ?, ?, ?)", r)

        now = datetime.utcnow().isoformat()

        # 2. Seed Master Admin & SOC Personnel
        h_admin, s_admin = hash_password("PloyWeb@2026!")
        admin_users = [
            ("usr-01", "avance.soc", h_admin, s_admin, "Alex Vance", "avance@novatech.local", "role-admin"),
            ("usr-02", "erostova.forensics", h_admin, s_admin, "Dr. Elena Rostova", "erostova@novatech.local", "role-forensics"),
            ("usr-03", "mmiller.analyst", h_admin, s_admin, "Marcus Miller", "mmiller@novatech.local", "role-analyst")
        ]
        for u in admin_users:
            cur.execute("""
            INSERT OR IGNORE INTO users (id, username, password_hash, salt, full_name, email, role_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (*u, now, now))

        # 3. Seed Enterprise Employees (Victim & Baseline)
        h_emp, s_emp = hash_password("Employee@2026!")
        employees = [
            ("usr-david", "david.webb", h_emp, s_emp, "David Webb", "david.webb@novatech.local", "role-employee",
             "EMP-041", "Engineering", "Senior Systems Architect", "Alex Vance", "+1-555-0141", "CONFIDENTIAL-RESTRICTED"),
            ("usr-sarah", "sarah.connor", h_emp, s_emp, "Sarah Connor", "sarah.connor@novatech.local", "role-employee",
             "EMP-088", "Operations", "Infrastructure Specialist", "Alex Vance", "+1-555-0188", "INTERNAL-OPERATIONAL"),
            ("usr-john", "john.doe", h_emp, s_emp, "Johnathan Doe", "john.doe@novatech.local", "role-employee",
             "EMP-102", "Finance", "Treasury Controller", "Dr. Elena Rostova", "+1-555-0102", "FINANCE-RESTRICTED")
        ]
        for e in employees:
            cur.execute("""
            INSERT OR IGNORE INTO users (id, username, password_hash, salt, full_name, email, role_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (e[0], e[1], e[2], e[3], e[4], e[5], e[6], now, now))

            cur.execute("""
            INSERT OR IGNORE INTO employees (id, employee_id, user_id, department, title, manager, phone, security_clearance, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f"emp-{e[7]}", e[7], e[0], e[8], e[9], e[10], e[11], e[12], now))

        # 4. Seed Known Devices
        devices = [
            ("DEV-001", "WS-ENGINEERING-07", "WS-ENGINEERING-07", "windows", "Windows 11 Enterprise (23H2)", "10.0.2.14", "connected", "nominal", now, now),
            ("DEV-002", "SRV-FINANCE-01", "SRV-FINANCE-01", "server", "Ubuntu 22.04 LTS (Security Hardened)", "10.0.3.11", "connected", "nominal", now, now),
            ("DEV-003", "DC-GLOBAL-01", "DC-GLOBAL-01", "domain_controller", "Windows Server 2022 Datacenter", "10.0.1.5", "connected", "nominal", now, now),
            ("DEV-004", "MOBILE-PIXEL-08", "MOBILE-PIXEL-08", "mobile_android", "Android 14 Enterprise MDM", "10.0.5.42", "connected", "nominal", now, now)
        ]
        for d in devices:
            cur.execute("""
            INSERT OR IGNORE INTO devices (id, device_id, name, device_type, os, ip, status, security_posture, registered_at, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, d)

        # 5. Seed Known Internal Subnet IPs
        ips = [
            ("ip-01", "10.0.2.14", "clean", "US", "Austin", 1, now, now, 0),
            ("ip-02", "10.0.3.11", "clean", "US", "Austin", 1, now, now, 0),
            ("ip-03", "198.51.100.44", "malicious", "NL", "Amsterdam (Proxy/Tor)", 0, now, now, 4)
        ]
        for ip_item in ips:
            cur.execute("""
            INSERT OR IGNORE INTO ip_addresses (id, ip, reputation, country, city, is_known, first_seen, last_seen, failed_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ip_item)

        # 6. Seed NovaTech Solutions Customer Accounts
        customers = [
            ("CUST-10491", "CUST-10491", "Apex Logistics Global", "billing@apexlogistics.demo", "Enterprise", 145820.50, "active", now),
            ("CUST-10492", "CUST-10492", "BioSynth Pharmaceuticals", "accounts@biosynth.demo", "Enterprise", 984000.10, "active", now),
            ("CUST-10493", "CUST-10493", "Vanguard Financial Partners", "finance@vanguardfp.demo", "Premier", 4512000.00, "active", now),
            ("CUST-10494", "CUST-10494", "CyberDynamics Security Ltd", "compliance@cyberdyn.demo", "Standard", 67210.80, "active", now)
        ]
        for c in customers:
            cur.execute("""
            INSERT OR IGNORE INTO customer_accounts (id, customer_id, full_name, email, account_tier, balance, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, c)

        # 7. Seed Genesis Block in Audit Ledger
        genesis_prev = "0000000000000000000000000000000000000000000000000000000000000000"
        genesis_content = f"{genesis_prev}|SYSTEM|SYSTEM_INIT|{now}|SUCCESS"
        genesis_hash = hashlib.sha256(genesis_content.encode()).hexdigest()
        cur.execute("""
        INSERT OR IGNORE INTO audit_logs (id, user_id, username, action, incident_id, timestamp, previous_hash, current_hash, action_outcome, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("audit-genesis", "SYSTEM", "SYSTEM", "GENESIS_INITIALIZE_AUDIT_CHAIN", None, now, genesis_prev, genesis_hash, "SUCCESS", "PloyWeb Immutable Audit Ledger Genesis Block"))

        conn.commit()

# Global database manager singleton
db_mgr = DatabaseManager()
