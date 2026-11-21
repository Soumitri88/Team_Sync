# PloyWeb – Autonomous Cyber Investigation & Attack Graph Reconstruction

> **Enterprise AI-Assisted Cybersecurity Investigation, Deception Detection & Kill-Chain Reconstruction Platform**

PloyWeb transforms scattered, noisy security telemetry into a chronological, evidence-backed reconstruction of multi-stage cyberattacks. It provides interactive graph visualization (TraceGraph), automated blast radius quantification, Canary Twin deception detection, SHA-256 cryptographic evidence ledger verification, and actionable incident-response playbooks.

---

## 🛡️ Key Features

### 1. 📊 Security Operations Center (SOC) Dashboard
- **DEFCON Readiness Meter**: Dynamic real-time threat posture indicator (`DEFCON 1` Breach to `DEFCON 5` Nominal).
- **Incident & KPI Telemetry**: Total ingested events, Critical/High/Medium/Low severity distributions, active incidents, affected devices, and tripped canary decoys.
- **Threat Severity Distribution**: Interactive donut charts and bar graphs powered by Recharts with neon cyber aesthetic.
- **Attack Timeline**: Chronological event stream displaying source/destination IPs, MITRE ATT&CK technique IDs, and SHA-256 digests.

### 2. ⚡ Attack Simulator (Safe & Synthetic)
- **5 Predefined Safe Scenarios**:
  1. *Brute-Force Login Simulation* (`T1110`)
  2. *Suspicious Login & Lateral Movement* (`T1078`, `T1046`, `T1021`)
  3. *Privilege Escalation Simulation* (`T1057`, `T1134`, `T1068`)
  4. *Suspicious File & Canary Decoy Access* (`T1083`, `T1005`)
  5. *Full Multi-Stage APT Attack Simulation* (Kill-chain from initial access to data breach)
- **Controls**: Start, Pause, Resume, Reset, Single-Step Forward, and Pacing Speed (`0.5x`, `1x`, `2x`, `5x`).
- **Non-Destructive Guarantee**: Generates realistic synthetic logs in a controlled virtual environment. Never modifies physical files or host network settings.

### 3. 🕸️ TraceGraph – Attack Reconstruction
- **Interactive Graph Canvas**: Built with `@xyflow/react` (React Flow v12) and backed by **NetworkX** directed graph calculations.
- **Kill-Chain Mapping**: Reconstructs the exact path:
  $$\text{External Adversary} \longrightarrow \text{Compromised User} \longrightarrow \text{Patient Zero Device} \longrightarrow \text{Lateral Movement} \longrightarrow \text{Privilege Escalation} \longrightarrow \text{Canary Trap}$$
- **Critical Path Highlighting**: NetworkX pathfinding isolates the primary attack trajectory.
- **Clickable Evidence Inspector**: Clicking any node or animated edge reveals associated events, timestamps, protocols, and SHA-256 cryptographic signatures.

### 4. 🪤 Canary Twin – Deception Detection
- **Simulated Decoy Traps**:
  - `Finance_Report_Canary.txt` (`/srv/shared/finance/Q3_Audit/`)
  - `Admin_Credentials_Canary.txt` (`/etc/security/vault/`)
  - `Backup_Configuration_Canary.txt` (`/opt/backup/cfg/`)
- **Tripwire Alerting**: Accessing any canary instantly trips a high-fidelity DEFCON 1 alert with zero false-positives.
- **Interactive Controls**: "Simulate Attacker Access", "Rearm All Decoys", and "Deploy Custom Virtual Trap".

### 5. 💥 Blast Radius & Exposure Analysis
- **Patient Zero Identification**: Automatically pinpoints the initial breach host.
- **Strict Distinction**:
  - **Confirmed Compromised Assets**: Endpoints and accounts with verified malicious telemetry.
  - **Suspected At-Risk Impact**: Connected network subnets, shared shares, and reachable domain controllers.
- **Quantified Impact Score**: Dynamic percentage exposure meter (e.g. 87.5% - 98.5%).
- **Containment Priority Queue**: Ordered list of hosts requiring immediate isolation.

### 6. 🚨 Incident Response Center
- **Simulated Playbooks**:
  1. *Isolate Affected Device* (Simulated 802.1X VLAN quarantine)
  2. *Disable Compromised Account* (Simulated Active Directory suspension & Kerberos ticket purge)
  3. *Block Suspicious Ingress IP* (Boundary edge firewall drop rule)
  4. *Review Suspicious Login Events* (Historical 48-hour authentication forensics)
  5. *Investigate Accessed Canary Files* (Memory honey-token dump extraction)
  6. *Generate Autonomous Incident Dossier*
- **Audit Ledger**: Complete log of defensive interventions with operator signatures.

### 7. 🔐 Evidence Ledger (SHA-256 Integrity)
- **Cryptographic Custody**: Every event receives a canonical SHA-256 hash.
- **One-Click Ledger Verification**: Audits all stored events, computes Merkle root digest, and confirms 100% integrity.
- **Interactive Anti-Forensic Tamper Simulation**:
  - Simulate an adversary modifying a log record in the database.
  - Run audit to watch cryptographic discrepancy detection flag the tampered record.
  - One-click restore back to authentic state.

### 8. 📄 Investigation Reports
- **Executive Summary Narrative**: Automated SOC finding synthesis.
- **MITRE ATT&CK Matrix**: Technique categorization with knowledgebase links.
- **Downloadable PDF Dossier**: Client-side PDF export with cryptographic seal (`jspdf`).
- **JSON Export & Print**: Raw forensic dossier export.

### 9. 🚀 Guided 9-Step Demo Mode
Walks evaluators through the complete end-to-end lifecycle with a persistent floating controller:
1. *Suspicious Login Detected*
2. *Lateral Movement Identified*
3. *Privilege Escalation Detected*
4. *Canary File Accessed*
5. *Attack Graph Reconstructed*
6. *Blast Radius Calculated*
7. *Incident Response Recommendations Generated*
8. *Evidence Hashes Verified*
9. *Incident Report Generated*

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, JavaScript (ESNext), Tailwind CSS, `@xyflow/react` (React Flow v12), Recharts, Lucide React, jsPDF, canvas-confetti, Vite |
| **Backend** | Python 3.11+, FastAPI, WebSockets (`/ws/events`), NetworkX (Directed Graph Analytics), Pydantic v2 |
| **Database** | Embedded Mongo-compatible JSON Document Store (`JsonCollection` in `backend/app/db.py`), zero external database setup needed |
| **Integrity** | SHA-256 Canonical Event Digests & Merkle Root Chain |

---

## 📁 Project Structure

```
TeamSync/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── blast_radius.py       # Blast radius & network topology calculations
│   │   ├── canary.py             # Canary Twin decoy management & tripwires
│   │   ├── correlation.py        # Event normalization, ordering & correlation engine
│   │   ├── db.py                 # Embedded thread-safe JSON document store
│   │   ├── evidence.py           # SHA-256 evidence hashing, audit & tamper demo
│   │   ├── graph_engine.py       # NetworkX attack graph & React Flow layout
│   │   ├── main.py               # FastAPI application & WebSocket connection manager
│   │   ├── models.py             # Pydantic data schemas & MITRE mapping
│   │   ├── report.py             # Incident report dossier generation
│   │   ├── response_actions.py   # Simulated containment playbooks
│   │   └── simulator.py          # 5 Safe simulation scenarios & step controller
│   ├── data/                     # Persistent JSON stores for events, canaries, settings
│   ├── requirements.txt          # Python dependencies
│   └── run.py                    # Uvicorn entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomGraphNode.jsx # Sleek cyber node for React Flow
│   │   │   ├── DemoTourBar.jsx     # 9-step guided walkthrough floating bar
│   │   │   ├── EvidenceModal.jsx   # Forensic evidence dossier & SHA-256 copy
│   │   │   ├── Navbar.jsx          # DEFCON status, live clock & telemetry stream
│   │   │   └── Sidebar.jsx         # 10 module navigation & operator badge
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Operator profile switching & clearance
│   │   │   └── SecurityContext.jsx # Global WebSocket & telemetry state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Terminal authentication & persona selector
│   │   │   ├── DashboardPage.jsx   # SOC KPIs, charts & timeline
│   │   │   ├── SimulationPage.jsx  # 5 attack scenarios & pacing controls
│   │   │   ├── EventsPage.jsx      # Filterable live telemetry & log injection
│   │   │   ├── TraceGraphPage.jsx  # Interactive attack graph reconstruction
│   │   │   ├── CanaryTwinPage.jsx  # Decoy honey-token tripwires
│   │   │   ├── BlastRadiusPage.jsx # Exposure analysis & containment priorities
│   │   │   ├── IncidentResponsePage.jsx # Defensive containment playbooks
│   │   │   ├── EvidenceLedgerPage.jsx   # SHA-256 verification & tamper demo
│   │   │   ├── ReportsPage.jsx     # Dossier viewer & PDF export
│   │   │   └── SettingsPage.jsx    # Thresholds, retention & factory reset
│   │   ├── App.jsx                 # Routing & modal orchestration
│   │   ├── index.css               # Tailwind & cyber glowing borders
│   │   └── main.jsx                # Application root mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js              # Proxy for backend /api and /ws
└── README.md
```

---

## 🚀 Running the Application Locally

### Step 1: Start the Backend (FastAPI + WebSockets)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Launch the FastAPI server (runs on port 8000)
python run.py
```
> The API will be accessible at: `http://localhost:8000`  
> Interactive OpenAPI documentation: `http://localhost:8000/docs`

---

### Step 2: Start the Frontend (React 19 + Vite)

```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Install dependencies (if needed)
pnpm install

# Start Vite dev server
pnpm dev
```
> The web interface will open at: `http://localhost:5173`

---

## 🎬 Testing the 9-Step Demo Mode

1. Open `http://localhost:5173` in your browser.
2. Log in using any of the 3 pre-configured SOC profiles (e.g., **Alex Vance - SOC Incident Commander**).
3. Click the glowing **"Launch 9-Step Demo Mode"** button in the sidebar or top navbar.
4. Follow the interactive tour as it steps through:
   - **Step 1:** Suspicious login detection
   - **Step 2:** Lateral pivot to workstation
   - **Step 3:** Privilege escalation to SYSTEM
   - **Step 4:** Canary file detonation
   - **Step 5:** Attack graph reconstruction in TraceGraph
   - **Step 6:** Blast radius calculation (98.5% impact)
   - **Step 7:** Incident response playbooks execution
   - **Step 8:** Evidence SHA-256 ledger integrity audit
   - **Step 9:** Downloadable incident dossier PDF generation
