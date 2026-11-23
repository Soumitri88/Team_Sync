// PloyWeb Client-Side Autonomous Investigation & Reconstruction Engine
// Provides full offline/static hosting resilience for GitHub Pages, Vercel, and Firebase Hosting.

export const INITIAL_DEVICES = [
  {
    id: "DEV-001",
    name: "WS-ENGINEERING-07",
    device_type: "windows",
    os: "Windows 11 Enterprise (23H2)",
    ip: "10.0.2.14",
    status: "connected",
    mode: "Simulated Telemetry Agent",
    registered_at: new Date(Date.now() - 3600000).toISOString(),
    last_seen: new Date().toISOString(),
    security_posture: "elevated_risk"
  },
  {
    id: "DEV-002",
    name: "MOBILE-PIXEL-08",
    device_type: "android",
    os: "Android 14 (Google Pixel 8)",
    ip: "10.0.4.52",
    status: "connected",
    mode: "Simulated Mobile Agent",
    registered_at: new Date(Date.now() - 3600000).toISOString(),
    last_seen: new Date().toISOString(),
    security_posture: "nominal"
  },
  {
    id: "DEV-003",
    name: "IPHONE-CORP-15",
    device_type: "ios",
    os: "iOS 17.4 (iPhone 15 Pro)",
    ip: "10.0.4.61",
    status: "connected",
    mode: "Sandbox Simulation Mode",
    registered_at: new Date(Date.now() - 3600000).toISOString(),
    last_seen: new Date().toISOString(),
    security_posture: "nominal"
  },
  {
    id: "DEV-004",
    name: "SRV-FINANCE-01",
    device_type: "linux",
    os: "Ubuntu 22.04 LTS",
    ip: "10.0.3.11",
    status: "connected",
    mode: "Server Telemetry Stream",
    registered_at: new Date(Date.now() - 3600000).toISOString(),
    last_seen: new Date().toISOString(),
    security_posture: "critical_threat"
  }
];

export const INITIAL_CANARIES = [
  {
    id: "CAN-001",
    name: "financial_report_demo.txt",
    path: "/srv/shared/finance/Q3_Audit/financial_report_demo.txt",
    host_device: "SRV-FINANCE-01",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    tripped: true,
    tripped_at: new Date(Date.now() - 600000).toISOString(),
    tripped_by: "david.webb",
    tripped_ip: "198.51.100.44",
    description: "Decoy financial audit spreadsheet detecting unauthorized lateral traversal.",
    file_type: "decoy_document"
  },
  {
    id: "CAN-002",
    name: "admin_credentials_demo.txt",
    path: "/etc/security/vault/admin_credentials_demo.txt",
    host_device: "DC-CORP-01",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    tripped: false,
    tripped_at: null,
    tripped_by: null,
    tripped_ip: null,
    description: "Fictional credential honey-token file monitoring domain controller probing.",
    file_type: "honey_credentials"
  },
  {
    id: "CAN-003",
    name: "confidential_demo.txt",
    path: "/opt/backup/cfg/confidential_demo.txt",
    host_device: "DEV-STORAGE-03",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    tripped: false,
    tripped_at: null,
    tripped_by: null,
    tripped_ip: null,
    description: "Harmless confidential dummy text file detecting exfiltration staging.",
    file_type: "decoy_infrastructure"
  }
];

export const INITIAL_EVENTS = [
  {
    id: "EVT-43884",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    source_ip: "198.51.100.44",
    destination_ip: "10.0.2.14",
    username: "david.webb",
    device_name: "WS-ENGINEERING-07",
    event_type: "suspicious_login",
    event_description: "Stage 1: Suspicious Login Attempt - Anomalous interactive RDP authentication from external untrusted IP.",
    severity: "high",
    mitre_id: "T1078",
    mitre_name: "Valid Accounts: Compromised Credentials",
    stage: 1,
    status: "correlated",
    is_canary: false,
    evidence_hash: "b083a12a2d73844f481dfacf1356231c2eda4250ce20db516c3220e64d3161bc",
    raw_payload: { protocol: "RDP", auth_status: "SUCCESS", geo_country: "Anonymous VPN Proxy" }
  },
  {
    id: "EVT-80251",
    timestamp: new Date(Date.now() - 750000).toISOString(),
    source_ip: "10.0.2.14",
    destination_ip: "10.0.2.14",
    username: "david.webb",
    device_name: "WS-ENGINEERING-07",
    event_type: "privilege_escalation",
    event_description: "Stage 2: Privilege Escalation Indicator - SeDebugPrivilege abuse attempt targeting local LSASS subsystem.",
    severity: "high",
    mitre_id: "T1068",
    mitre_name: "Exploitation for Privilege Escalation",
    stage: 2,
    status: "correlated",
    is_canary: false,
    evidence_hash: "8a4f1071da56d8174f76cc3837ea81bfaeb51e847df34a41f62c0e95ff1cb209",
    raw_payload: { privilege_requested: "SeDebugPrivilege", process: "powershell.exe", integrity: "Medium" }
  },
  {
    id: "EVT-19448",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    source_ip: "10.0.2.14",
    destination_ip: "10.0.3.11",
    username: "SYSTEM",
    device_name: "SRV-FINANCE-01",
    event_type: "lateral_movement",
    event_description: "Stage 3: Lateral Movement Indicator - Remote WinRM invocation from engineering PC to internal finance server.",
    severity: "critical",
    mitre_id: "T1021",
    mitre_name: "Remote Services: WinRM",
    stage: 3,
    status: "correlated",
    is_canary: false,
    evidence_hash: "3c988b4923e20d2d3a37b09c256038166fa867f08e5832a2f86641b658d53862",
    raw_payload: { port: 5985, command: "Invoke-Command -ComputerName SRV-FINANCE-01" }
  },
  {
    id: "EVT-99231",
    timestamp: new Date(Date.now() - 450000).toISOString(),
    source_ip: "10.0.2.14",
    destination_ip: "10.0.3.11",
    username: "david.webb",
    device_name: "SRV-FINANCE-01",
    event_type: "canary_access",
    event_description: "Stage 4: Suspicious File Access - Canary decoy 'financial_report_demo.txt' opened by unauthorized user.",
    severity: "critical",
    mitre_id: "T1005",
    mitre_name: "Data from Local System: Decoy Canary Breach",
    stage: 4,
    status: "correlated",
    is_canary: true,
    canary_file: "financial_report_demo.txt",
    evidence_hash: "7f4955c4d6fba5f98cf85d9bf73295f7ecbe9fa161fb975a5c68f182c611488c",
    raw_payload: { file: "financial_report_demo.txt", action: "READ", tripwire_alert: true }
  },
  {
    id: "EVT-61842",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    source_ip: "10.0.3.11",
    destination_ip: "198.51.100.44",
    username: "SYSTEM",
    device_name: "SRV-FINANCE-01",
    event_type: "file_exfiltration",
    event_description: "Stage 5: Data Exfiltration Indicator - Outbound encrypted egress communication observed to adversary C2 server.",
    severity: "critical",
    mitre_id: "T1048",
    mitre_name: "Exfiltration Over Alternative Protocol",
    stage: 5,
    status: "correlated",
    is_canary: false,
    evidence_hash: "c281df6fa8ff23e19277d3fecaa21021bc782921eead8421b8b8095111bb9e32",
    raw_payload: { bytes_sent: 4200000, dest_port: 443, destination_domain: "adverse-egress.net" }
  },
  {
    id: "EVT-73019",
    timestamp: new Date(Date.now() - 150000).toISOString(),
    source_ip: "10.0.2.14",
    destination_ip: "10.0.2.14",
    username: "SYSTEM",
    device_name: "WS-ENGINEERING-07",
    event_type: "privilege_escalation",
    event_description: "Stage 6: Privilege Escalation Alert - Persistent NT AUTHORITY\\SYSTEM service installed for adversary persistence.",
    severity: "critical",
    mitre_id: "T1543",
    mitre_name: "Create or Modify System Process: Windows Service",
    stage: 6,
    status: "correlated",
    is_canary: false,
    evidence_hash: "45c83229ea4b67d14210aa912803bba2a20b8b839845dafaee3061247ff569d1",
    raw_payload: { service_name: "PloySecSvc_Persistent", binary_path: "C:\\Windows\\Temp\\svc_agent.exe" }
  }
];

export const INITIAL_ATTACK_GRAPH = {
  summary: {
    total_nodes: 7,
    total_edges: 7,
    attack_stages: 6,
    patient_zero: "WS-ENGINEERING-07",
    critical_path: [
      "node-attacker-198.51.100.44",
      "node-user-david.webb",
      "node-device-WS-ENGINEERING-07",
      "node-user-SYSTEM",
      "node-device-SRV-FINANCE-01",
      "node-canary-financial_report_demo.txt"
    ]
  },
  nodes: [
    {
      id: "node-attacker-198.51.100.44",
      type: "custom",
      position: { x: 50, y: 150 },
      data: {
        id: "node-attacker-198.51.100.44",
        label: "Adversary [198.51.100.44]",
        type: "attacker",
        severity: "critical",
        is_critical_path: true,
        critical_path: true,
        metadata: { ip: "198.51.100.44", threat_actor: "APT-SIM-409", reputation: "Malicious External Origin" }
      }
    },
    {
      id: "node-user-david.webb",
      type: "custom",
      position: { x: 300, y: 100 },
      data: {
        id: "node-user-david.webb",
        label: "User: david.webb",
        type: "account",
        severity: "high",
        is_critical_path: true,
        critical_path: true,
        metadata: { username: "david.webb", role: "Domain Engineer", device_affinity: "WS-ENGINEERING-07" }
      }
    },
    {
      id: "node-device-WS-ENGINEERING-07",
      type: "custom",
      position: { x: 550, y: 150 },
      data: {
        id: "node-device-WS-ENGINEERING-07",
        label: "Patient Zero: WS-ENGINEERING-07",
        type: "device",
        severity: "critical",
        is_critical_path: true,
        critical_path: true,
        metadata: { ip: "10.0.2.14", os: "Windows 11 Enterprise", role: "Workstation (Patient Zero)" }
      }
    },
    {
      id: "node-user-SYSTEM",
      type: "custom",
      position: { x: 550, y: 320 },
      data: {
        id: "node-user-SYSTEM",
        label: "NT AUTHORITY\\SYSTEM",
        type: "account",
        severity: "critical",
        is_critical_path: true,
        critical_path: true,
        metadata: { username: "SYSTEM", privilege: "Root/Kernel OS Level", compromised_on: "WS-ENGINEERING-07" }
      }
    },
    {
      id: "node-device-SRV-FINANCE-01",
      type: "custom",
      position: { x: 850, y: 150 },
      data: {
        id: "node-device-SRV-FINANCE-01",
        label: "Server: SRV-FINANCE-01",
        type: "device",
        severity: "critical",
        is_critical_path: true,
        critical_path: true,
        metadata: { ip: "10.0.3.11", os: "Ubuntu 22.04 LTS", role: "Core Finance Storage" }
      }
    },
    {
      id: "node-canary-financial_report_demo.txt",
      type: "custom",
      position: { x: 1150, y: 100 },
      data: {
        id: "node-canary-financial_report_demo.txt",
        label: "Canary: financial_report_demo.txt",
        type: "canary",
        severity: "critical",
        is_critical_path: true,
        critical_path: true,
        metadata: { file: "financial_report_demo.txt", path: "/srv/shared/finance/Q3_Audit/", host: "SRV-FINANCE-01" }
      }
    },
    {
      id: "node-attacker-adverse-egress.net",
      type: "custom",
      position: { x: 1150, y: 260 },
      data: {
        id: "node-attacker-adverse-egress.net",
        label: "C2 Exfiltration Node",
        type: "attacker",
        severity: "critical",
        is_critical_path: true,
        critical_path: true,
        metadata: { destination: "adverse-egress.net:443", bytes_exfiltrated: "4.2 MB", protocol: "TLS Encrypted" }
      }
    }
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-attacker-198.51.100.44",
      target: "node-user-david.webb",
      label: "RDP Credential Abuse (T1078)",
      animated: true,
      data: { severity: "critical", is_critical_path: true, protocol: "RDP:3389" }
    },
    {
      id: "edge-2",
      source: "node-user-david.webb",
      target: "node-device-WS-ENGINEERING-07",
      label: "Initial Breach Auth",
      animated: true,
      data: { severity: "high", is_critical_path: true, protocol: "Kerberos" }
    },
    {
      id: "edge-3",
      source: "node-device-WS-ENGINEERING-07",
      target: "node-user-SYSTEM",
      label: "LSASS Token Impersonation (T1068)",
      animated: true,
      data: { severity: "critical", is_critical_path: true, protocol: "Local NamedPipe" }
    },
    {
      id: "edge-4",
      source: "node-user-SYSTEM",
      target: "node-device-SRV-FINANCE-01",
      label: "WinRM Lateral Pivot (T1021)",
      animated: true,
      data: { severity: "critical", is_critical_path: true, protocol: "WinRM:5985" }
    },
    {
      id: "edge-5",
      source: "node-device-SRV-FINANCE-01",
      target: "node-canary-financial_report_demo.txt",
      label: "Canary Trap Access (DEFCON 1)",
      animated: true,
      data: { severity: "critical", is_critical_path: true, protocol: "SMB/FileRead" }
    },
    {
      id: "edge-6",
      source: "node-device-SRV-FINANCE-01",
      target: "node-attacker-adverse-egress.net",
      label: "Encrypted Data Exfiltration (T1048)",
      animated: true,
      data: { severity: "critical", is_critical_path: true, protocol: "HTTPS:443" }
    },
    {
      id: "edge-7",
      source: "node-user-SYSTEM",
      target: "node-device-WS-ENGINEERING-07",
      label: "Persistent Service Daemon (T1543)",
      animated: true,
      data: { severity: "critical", is_critical_path: true, protocol: "ServiceController" }
    }
  ]
};

export const INITIAL_STATS = {
  overall_status: "CRITICAL_THREAT",
  threat_level: "DEFCON 1 - ACTIVE BREACH",
  total_events: 6,
  severity_counts: { critical: 4, high: 2, medium: 0, low: 0, info: 0 },
  active_incidents: 1,
  compromised_devices_count: 2,
  compromised_accounts_count: 2,
  tripped_canaries_count: 1,
  recent_activities: INITIAL_EVENTS.slice(0, 4),
  attack_timeline: INITIAL_EVENTS,
  severity_distribution: [
    { name: "Critical", count: 4, color: "#ef4444" },
    { name: "High", count: 2, color: "#f59e0b" },
    { name: "Medium", count: 0, color: "#38bdf8" },
    { name: "Low", count: 0, color: "#10b981" }
  ]
};

export const INITIAL_BLAST_RADIUS = {
  compromise_percentage: 85.0,
  patient_zero: "WS-ENGINEERING-07",
  compromised_nodes: ["WS-ENGINEERING-07", "SRV-FINANCE-01"],
  compromised_accounts: ["david.webb", "SYSTEM"],
  at_risk_nodes: ["DEV-STORAGE-03", "GW-VPN-EDGE-01", "DC-CORP-01"],
  subnets_affected: ["10.0.2.0/24 (Engineering)", "10.0.3.0/24 (Finance)"],
  containment_priority: [
    { host: "WS-ENGINEERING-07", action: "Isolate VLAN immediately", risk: "Critical (Patient Zero)" },
    { host: "SRV-FINANCE-01", action: "Sever remote WinRM session", risk: "Critical (Finance Storage)" }
  ]
};

export const INITIAL_ACTIONS = [
  {
    id: "ACT-001",
    action_type: "quarantine_host",
    target: "WS-ENGINEERING-07",
    status: "EXECUTED_SIMULATED",
    timestamp: new Date().toISOString(),
    operator: "Autonomous-Incident-Response",
    integrity_hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
  }
];
