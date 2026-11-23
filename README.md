# PloyWeb – Autonomous Cyber Investigation & Attack Graph Reconstruction

> **" PloyWeb does not just flag anomalies. It reconstructs the reality of an attack. "**
>
> Enterprise Autonomous Cybersecurity Investigation, Deception Detection & Kill-Chain Reconstruction Platform.

PloyWeb transforms scattered, noisy security telemetry into a chronological, evidence-backed reconstruction of multi-stage cyberattacks. It provides interactive graph visualization (TraceGraph), automated blast radius quantification, Canary Twin deception detection, SHA-256 cryptographic evidence ledger verification, and actionable incident-response playbooks across Windows PC, Android mobile, and iOS simulation endpoints.

---

## 🌐 Permanent Public Live URL (Works 24/7 Forever, Laptop & Mobile)

👉 **[https://soumitri88.github.io/Team_Sync/](https://soumitri88.github.io/Team_Sync/)**

- **Hosting**: GitHub Pages Global Edge Network (Fastly CDN + SSL)
- **Status**: 100% Online & Permanent (No local computer or tunnel needed)
- **Responsive**: Adapts dynamically to PC, laptop, tablet, and mobile screens

---

## 💻 Local Development & API Docs

- **Local Frontend**: `http://localhost:5173`
- **Local Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 🚀 1-Click Permanent Cloud Deployment (24/7 Forever Free)

To deploy a permanent URL that stays online 24/7 independently of your local computer:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Soumitri88/Team_Sync)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Soumitri88/Team_Sync)

1. **Render (Full-Stack Docker)**: Click the **Deploy to Render** button above. It uses `render.yaml` & `Dockerfile` to launch both the React UI and FastAPI backend on a permanent `https://ployweb-soc.onrender.com` domain for free.
2. **Vercel (Frontend)**: Click **Deploy with Vercel** or run `vercel` in your terminal to get a permanent `https://team-sync.vercel.app` domain.

---

## 🛡️ Key Pages & Capabilities

### 1. 🌐 Landing Page (`/landing`)
- **Brand Identity & Philosophy**: Comprehensive introduction to autonomous cyber investigation.
- **TraceGraph & Canary Twin Highlights**: Visual overview of signature graph reconstruction and deception tripwires.
- **How It Works**: 4-step pipeline from telemetry ingestion to cryptographic evidence ledger sealing.
- **Target Audience**: SOC Analysts, Enterprise SecOps, Compliance & Audit Teams.
- **Quick Actions**: 1-click CTAs to Launch Dashboard, Run Hackathon Judge Demo, or explore Attack Lab.

### 2. 📊 Security Operations Center (SOC) Dashboard (`/`)
- **DEFCON Readiness Meter**: Dynamic real-time threat posture indicator (`DEFCON 1` Breach to `DEFCON 5` Nominal).
- **Incident & KPI Telemetry**: Total ingested events, Critical/High/Medium/Low severity distributions, active incidents, affected devices, and tripped canary decoys.
- **Threat Analytics Charts**: Interactive donut charts and bar graphs powered by Recharts with neon cyber aesthetic.
- **Attack Timeline**: Chronological event stream displaying source/destination IPs, MITRE ATT&CK IDs, and SHA-256 digests.

### 3. 📱 Device Monitoring & Telemetry Ingestion (`/devices`)
- **Endpoint Inventory**: Live connection indicators and posture for Windows (`WS-ENGINEERING-07`), Android (`MOBILE-PIXEL-08`), iOS (`IPHONE-CORP-15`), and Linux (`SRV-FINANCE-01`).
- **Endpoint Registration**: Register custom PC, Android, or iOS simulated devices.
- **Safe Diagnostic Probes**: Generate non-destructive test telemetry on any registered device.
- **Security Log Ingestion Tool**: Ingest JSON arrays or RFC 5424 Syslog records into the correlation engine.
- **Compliance Guarantee**: Operates strictly with authorized test logs and controlled simulation telemetry.

### 4. ⚡ Attack Simulation Lab (`/simulation`) – MOST IMPORTANT
- **Target Platform Selection**:
  1. *Windows Computer* (`WS-ENGINEERING-07`) – 6-stage enterprise kill chain
  2. *Android Mobile Device* (`MOBILE-PIXEL-08`) – 6-stage mobile attack chain
  3. *iOS Mobile Device (Simulation Mode)* (`IPHONE-CORP-15`) – 6-stage sandbox simulation
  4. *Hackathon Judge Demo* – Intentionally scrambled out-of-order logs demonstrating temporal correlation
- **Prominent Controls**: `START SAFE ATTACK SIMULATION`, `Pause Simulation`, and `Reset Simulation`.
- **6-Stage Kill Chain Visual Stepper**:
  - *Stage 1*: Suspicious Login Attempt
  - *Stage 2*: Privilege Escalation Indicator
  - *Stage 3*: Lateral Movement Indicator
  - *Stage 4*: Suspicious File Access (`financial_report_demo.txt`)
  - *Stage 5*: Data Exfiltration Indicator
  - *Stage 6*: Privilege Escalation Alert

### 5. 🕸️ TraceGraph – Attack Reconstruction (`/tracegraph`)
- **Interactive Graph Canvas**: Directional edges mapping attacker, compromised accounts, devices, and attack stages.
- **Temporal Correlation Ground Truth**: Reconstructs exact chronological order even when log events arrive out of order.
- **Clickable Node Drawer**: Event name, timestamp, source, target, severity, MITRE ID, and SHA-256 evidence digest.

### 6. 🪤 Canary Twin – Deception Detection (`/canary-twin`)
- **Fictional Tripwire Decoys**:
  - `financial_report_demo.txt` (`/srv/shared/finance/Q3_Audit/`)
  - `admin_credentials_demo.txt` (`/etc/security/vault/`)
  - `confidential_demo.txt` (`/opt/backup/cfg/`)
- **Instant Tripwire Alert**: Access triggers immediate DEFCON 1 alarm, SHA-256 evidence hash, and blast radius update.

### 7. 💥 Blast Radius & Exposure Analysis (`/blast-radius`)
- **Patient Zero Identification**: Pinpoints the initial compromise vector.
- **Exposure Metric**: Real-time quantified compromise percentage across subnets.
- **Asset Hierarchy**: Strict separation of confirmed compromised assets and at-risk connected nodes.

### 8. 🚨 Security Response Center (`/incident-response`)
- **1-Click Countermeasure**: Prominent `RUN PROTECTION DEMO` button executing automated containment.
- **Suggested Protective Actions**:
  1. Review suspicious login activity
  2. Revoke simulated sessions
  3. Recommend password changes
  4. Recommend enabling multi-factor authentication
  5. Isolate device only in simulation environment
  6. Generate incident report
- **Immutable Action Audit Ledger**: Cryptographically hashed record of all protective interventions.

### 9. 🔐 Evidence Ledger (`/evidence`)
- **SHA-256 Cryptographic Custody**: Canonical hashing for every security event.
- **Integrity Verification**: One-click verification auditing all hashes.
- **Anti-Forensic Tamper Simulator**: Demonstrates detection of modified database records and 1-click restore.

### 10. 📄 Investigation Reports (`/reports`)
- Executive summary narrative, MITRE ATT&CK technique matrix, and downloadable PDF dossier.

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
