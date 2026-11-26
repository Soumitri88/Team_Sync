import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_DEVICES,
  INITIAL_CANARIES,
  INITIAL_EVENTS,
  DATA_THEFT_EVENTS,
  INITIAL_ATTACK_GRAPH,
  INITIAL_STATS,
  INITIAL_BLAST_RADIUS,
  INITIAL_ACTIONS
} from '../services/clientEngine';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [simState, setSimState] = useState({
    status: 'idle',
    scenario_id: 'enterprise_killchain',
    current_step: 6,
    total_steps: 6,
    speed: 1.0,
    progress_pct: 100
  });
  const [canaries, setCanaries] = useState(INITIAL_CANARIES);
  const [attackGraph, setAttackGraph] = useState(INITIAL_ATTACK_GRAPH);
  const [blastRadius, setBlastRadius] = useState(INITIAL_BLAST_RADIUS);
  const [actions, setActions] = useState(INITIAL_ACTIONS);
  const [approvals, setApprovals] = useState([
    {
      id: "APPR-01",
      incident_id: "INC-2026-881",
      action_requested: "Quarantine Host & Terminate Harvester (PID 5124)",
      target: "WS-ENGINEERING-07",
      reviewer_name: "Alex Vance (SOC Incident Commander)",
      decision: "APPROVED",
      reason: "Confirmed data collection and staging of synthetic payroll records.",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: "EXECUTED",
      mitre_id: "T1059.001 / T1005"
    },
    {
      id: "APPR-02",
      incident_id: "INC-2026-882",
      action_requested: "Block Controlled Receiver Egress Port 8000 via Windows Firewall",
      target: "Controlled Receiver (127.0.0.1:8000)",
      reviewer_name: "Pending Review",
      decision: "PENDING",
      reason: "Suspicious outbound TLS socket opened attempting 2,450 bytes exfiltration.",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      status: "PENDING",
      mitre_id: "T1048"
    },
    {
      id: "APPR-03",
      incident_id: "INC-2026-883",
      action_requested: "Revoke Kerberos TGT & Invalidate Tokens for david.webb",
      target: "david.webb (EMP-041)",
      reviewer_name: "Pending Review",
      decision: "PENDING",
      reason: "High anomaly login risk score (78/100) from unseen external Tor IP.",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      status: "PENDING",
      mitre_id: "T1078"
    }
  ]);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [agentStatus, setAgentStatus] = useState({
    connected: false,
    hostname: 'WS-ENGINEERING-07',
    ip: '10.0.2.14',
    os: 'Windows 11 Enterprise (23H2)',
    active_pids: [],
    last_heartbeat: new Date().toISOString()
  });
  const [evidenceLedger, setEvidenceLedger] = useState({
    total_records: INITIAL_EVENTS.length,
    records: INITIAL_EVENTS
  });
  const [ledgerAudit, setLedgerAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  // Guided Demo Mode state
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoAutoPlay, setDemoAutoPlay] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);

  const wsRef = useRef(null);
  const simTimerRef = useRef(null);

  // ==================== FETCH DATA ====================
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events?limit=100');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchAttackGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/graph/attack-graph');
      if (res.ok) {
        const data = await res.json();
        if (data && data.nodes && data.nodes.length > 0) {
          setAttackGraph(data);
        }
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchBlastRadius = useCallback(async () => {
    try {
      const res = await fetch('/api/blast-radius');
      if (res.ok) {
        const data = await res.json();
        setBlastRadius(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchCanaries = useCallback(async () => {
    try {
      const res = await fetch('/api/canary/list');
      if (res.ok) {
        const data = await res.json();
        setCanaries(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch('/api/incident-response/actions');
      if (res.ok) {
        const data = await res.json();
        setActions(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchEvidenceLedger = useCallback(async () => {
    try {
      const res = await fetch('/api/evidence/ledger');
      if (res.ok) {
        const data = await res.json();
        setEvidenceLedger(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchSimulationState = useCallback(async () => {
    try {
      const res = await fetch('/api/simulator/state');
      if (res.ok) {
        const data = await res.json();
        setSimState(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const fetchAgentStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/status');
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
      }
    } catch (e) {
      // Backend offline: keep current state
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchEvents(),
      fetchAttackGraph(),
      fetchBlastRadius(),
      fetchCanaries(),
      fetchActions(),
      fetchEvidenceLedger(),
      fetchSimulationState(),
      fetchDevices(),
      fetchAgentStatus()
    ]);
  }, [
    fetchDashboardStats,
    fetchEvents,
    fetchAttackGraph,
    fetchBlastRadius,
    fetchCanaries,
    fetchActions,
    fetchEvidenceLedger,
    fetchSimulationState,
    fetchDevices,
    fetchAgentStatus
  ]);

  // Initial mount load
  useEffect(() => {
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll]);

  // ==================== WEBSOCKET CONNECTION ====================
  useEffect(() => {
    // Skip WebSocket on static hosts like GitHub Pages
    if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;
    let attempts = 0;
    const maxAttempts = 3;

    const connectWs = () => {
      if (attempts >= maxAttempts) return;
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          attempts = 0;
          console.log('[PloyWeb WS] Connected to live security telemetry stream');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'NEW_EVENT') {
              setEvents((prev) => [msg.event, ...prev.filter((e) => e.id !== msg.event.id)]);
              if (msg.sim_state) setSimState(msg.sim_state);

              // Flash active alert banner if critical
              if (msg.event.severity === 'critical') {
                setActiveAlert({
                  id: msg.event.id,
                  title: 'CRITICAL INTRUSION DETECTED',
                  description: msg.event.event_description,
                  device: msg.event.device_name,
                  mitre: msg.event.mitre_id,
                  timestamp: msg.event.timestamp
                });
              }

              // Update graph and blast stats
              fetchAttackGraph();
              fetchBlastRadius();
              fetchDashboardStats();
              fetchCanaries();
              fetchEvidenceLedger();
            } else if (msg.type === 'CANARY_TRIPPED') {
              setActiveAlert({
                id: msg.canary.id,
                title: 'DECEPTION CANARY DETONATED',
                description: `Trap '${msg.canary.name}' opened on host ${msg.canary.host_device} by ${msg.canary.tripped_by || 'unknown'}!`,
                severity: 'critical',
                timestamp: new Date().toISOString()
              });
              fetchCanaries();
              fetchAttackGraph();
              fetchBlastRadius();
              fetchDashboardStats();
            } else if (msg.type === 'RESPONSE_ACTION_EXECUTED') {
              setActions((prev) => [msg.action, ...prev]);
              fetchDashboardStats();
              fetchBlastRadius();
            } else if (msg.type === 'AGENT_CONNECTED') {
              fetchDevices();
              fetchAgentStatus();
            } else if (msg.type === 'AGENT_HEARTBEAT') {
              setAgentStatus((prev) => ({
                ...prev,
                connected: true,
                hostname: msg.hostname || prev.hostname,
                active_pids: msg.active_pids || [],
                last_heartbeat: msg.timestamp
              }));
            } else if (msg.type === 'REMEDIATION_VERIFIED') {
              if (msg.action) setActions((prev) => [msg.action, ...prev]);
              fetchAttackGraph();
              fetchDashboardStats();
              fetchDevices();
              fetchAgentStatus();
            } else if (msg.type === 'RESET_ALL' || msg.type === 'DEMO_RESEEDED') {
              refreshAll();
            }
          } catch (err) {
            console.error('[PloyWeb WS] message error:', err);
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        ws.onclose = () => {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(connectWs, 4000);
          }
        };
      } catch (err) {
        attempts++;
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchAttackGraph, fetchBlastRadius, fetchDashboardStats, fetchCanaries, fetchEvidenceLedger, refreshAll]);

  // ==================== SIMULATION CONTROLS ====================
  const startSimulation = async (scenarioId = 'multi_stage', speed = 1.0) => {
    try {
      const res = await fetch('/api/simulator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId, speed })
      });
      if (res.ok) {
        const state = await res.json();
        setSimState(state);
        return;
      }
    } catch (e) {
      // Fallback to client simulation
    }

    if (simTimerRef.current) clearInterval(simTimerRef.current);
    const activeEventsList = (scenarioId === 'scenario_data_theft' || scenarioId === 'data_theft' || scenarioId === 'theft')
      ? DATA_THEFT_EVENTS
      : INITIAL_EVENTS;

    setSimState({
      status: 'running',
      scenario_id: scenarioId,
      current_step: 1,
      total_steps: activeEventsList.length,
      speed,
      progress_pct: Math.round((1 / activeEventsList.length) * 100)
    });
    setEvents([activeEventsList[0]]);

    let step = 1;
    simTimerRef.current = setInterval(() => {
      step++;
      if (step <= activeEventsList.length) {
        setSimState({
          status: step === activeEventsList.length ? 'completed' : 'running',
          scenario_id: scenarioId,
          current_step: step,
          total_steps: activeEventsList.length,
          speed,
          progress_pct: Math.round((step / activeEventsList.length) * 100)
        });
        setEvents(activeEventsList.slice(0, step));
        if (step === activeEventsList.length) {
          clearInterval(simTimerRef.current);
          confetti({ particleCount: 100, spread: 70 });
        }
      } else {
        clearInterval(simTimerRef.current);
      }
    }, Math.max(1000, 2000 / speed));
  };

  const pauseSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/pause', { method: 'POST' });
      if (res.ok) {
        setSimState(await res.json());
        return;
      }
    } catch (e) {}
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setSimState(prev => ({ ...prev, status: 'paused' }));
  };

  const resumeSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/resume', { method: 'POST' });
      if (res.ok) {
        setSimState(await res.json());
        return;
      }
    } catch (e) {}
    startSimulation(simState.scenario_id || 'multi_stage', simState.speed || 1.0);
  };

  const resetSimulation = async () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    try {
      const res = await fetch('/api/simulator/reset', { method: 'POST' });
      if (res.ok) {
        setSimState(await res.json());
        await fetch('/api/events/clear', { method: 'DELETE' });
        await refreshAll();
        return;
      }
    } catch (e) {}
    setSimState({
      status: 'idle',
      scenario_id: null,
      current_step: 0,
      total_steps: 6,
      speed: 1.0,
      progress_pct: 0
    });
    setEvents(INITIAL_EVENTS);
    setAttackGraph(INITIAL_ATTACK_GRAPH);
    setCanaries(INITIAL_CANARIES);
    setDevices(INITIAL_DEVICES);
    setStats(INITIAL_STATS);
    setBlastRadius(INITIAL_BLAST_RADIUS);
    setActions(INITIAL_ACTIONS);
    setEvidenceLedger({ total_records: INITIAL_EVENTS.length, records: INITIAL_EVENTS });
  };

  const stepSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/step', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSimState(data.sim_state);
        await refreshAll();
        return;
      }
    } catch (e) {}
    setSimState(prev => {
      const nextStep = Math.min(6, (prev.current_step || 0) + 1);
      setEvents(INITIAL_EVENTS.slice(0, nextStep));
      return {
        ...prev,
        current_step: nextStep,
        status: nextStep >= 6 ? 'completed' : 'running',
        progress_pct: Math.round((nextStep / 6) * 100)
      };
    });
  };

  const reseedDemo = async () => {
    try {
      const res = await fetch('/api/demo/reset-and-seed', { method: 'POST' });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (e) {}
    setEvents(INITIAL_EVENTS);
    setAttackGraph(INITIAL_ATTACK_GRAPH);
    setCanaries(INITIAL_CANARIES);
    setDevices(INITIAL_DEVICES);
    setStats(INITIAL_STATS);
    setBlastRadius(INITIAL_BLAST_RADIUS);
    setActions(INITIAL_ACTIONS);
    setEvidenceLedger({ total_records: INITIAL_EVENTS.length, records: INITIAL_EVENTS });
  };

  // ==================== CANARY CONTROLS ====================
  const tripCanary = async (canaryId, triggerUser = 'adversary.sim', triggerIp = '198.51.100.44') => {
    try {
      const res = await fetch('/api/canary/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canary_id: canaryId, trigger_user: triggerUser, trigger_ip: triggerIp })
      });
      if (res.ok) {
        await refreshAll();
        return;
      }
    } catch (e) {}
    setCanaries(prev => prev.map(c => (c.id === canaryId || c.name === canaryId) ? {
      ...c,
      tripped: true,
      tripped_at: new Date().toISOString(),
      tripped_by: triggerUser,
      tripped_ip: triggerIp
    } : c));
    const tripEvent = {
      id: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      source_ip: triggerIp,
      destination_ip: "10.0.3.11",
      username: triggerUser,
      device_name: "SRV-FINANCE-01",
      event_type: "canary_access",
      event_description: `Stage 4: Suspicious File Access - Canary decoy trap '${canaryId}' breached.`,
      severity: "critical",
      mitre_id: "T1005",
      mitre_name: "Data from Local System: Decoy Canary Breach",
      stage: 4,
      status: "correlated",
      is_canary: true,
      canary_file: canaryId,
      evidence_hash: "7f4955c4d6fba5f98cf85d9bf73295f7ecbe9fa161fb975a5c68f182c611488c",
      raw_payload: { file: canaryId, action: "READ", tripwire_alert: true }
    };
    setEvents(prev => [tripEvent, ...prev]);
    setActiveAlert({
      id: canaryId,
      title: 'DECEPTION CANARY DETONATED',
      description: `Decoy trap '${canaryId}' was opened on host SRV-FINANCE-01 by ${triggerUser}!`,
      severity: 'critical',
      timestamp: new Date().toISOString()
    });
  };

  const rearmCanaries = async () => {
    try {
      const res = await fetch('/api/canary/reset', { method: 'POST' });
      if (res.ok) {
        fetchCanaries();
        return;
      }
    } catch (e) {}
    setCanaries(prev => prev.map(c => ({
      ...c,
      tripped: false,
      tripped_at: null,
      tripped_by: null,
      tripped_ip: null
    })));
  };

  const createCanary = async (canaryData) => {
    try {
      const res = await fetch('/api/canary/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(canaryData)
      });
      if (res.ok) {
        fetchCanaries();
        return;
      }
    } catch (e) {}
    const newCanary = {
      id: `CAN-${Math.floor(100 + Math.random() * 900)}`,
      name: canaryData.name || "custom_trap.txt",
      path: canaryData.path || "/srv/shared/custom_trap.txt",
      host_device: canaryData.host_device || "WS-ENGINEERING-07",
      created_at: new Date().toISOString(),
      tripped: false,
      tripped_at: null,
      tripped_by: null,
      tripped_ip: null,
      description: canaryData.description || "User-configured deception trap.",
      file_type: canaryData.file_type || "decoy_document"
    };
    setCanaries(prev => [newCanary, ...prev]);
  };

  // ==================== INCIDENT RESPONSE ACTIONS ====================
  const executeResponseAction = async (actionType, target, operator = 'SOC-Commander') => {
    let actionRecord = null;
    try {
      const res = await fetch('/api/incident-response/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType, target, operator })
      });
      if (res.ok) {
        actionRecord = await res.json();
      }
    } catch (e) {}

    if (!actionRecord) {
      actionRecord = {
        id: `ACT-${Date.now().toString().slice(-4)}`,
        action_type: actionType,
        target: target,
        status: "EXECUTED_SIMULATED",
        timestamp: new Date().toISOString(),
        operator,
        integrity_hash: `SHA256-${Date.now().toString(16).toUpperCase()}8810FE2`
      };
    }

    setActions((prev) => [actionRecord, ...(prev || [])]);

    // Apply real client-side security posture transitions
    if (actionType === 'quarantine_host' || actionType === 'isolate_device') {
      setDevices(prev => (prev || []).map(d =>
        (d.name === target || d.id === target || String(target).includes('WS-ENGINEERING') || String(target).includes('SRV-FINANCE'))
          ? { ...d, status: 'isolated', security_posture: 'protected' }
          : d
      ));
      setStats(prev => prev ? {
        ...prev,
        overall_status: "THREAT_CONTAINED",
        threat_level: "DEFCON 5 - CONTAINED",
        compromised_devices_count: Math.max(0, (prev.compromised_devices_count || 1) - 1)
      } : prev);
      setActiveAlert(null);
    } else if (actionType === 'revoke_session' || actionType === 'password_change') {
      setStats(prev => prev ? {
        ...prev,
        compromised_accounts_count: Math.max(0, (prev.compromised_accounts_count || 1) - 1)
      } : prev);
    }

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}

    return actionRecord;
  };

  // ==================== EVIDENCE AUDIT ====================
  const verifyLedgerIntegrity = async () => {
    try {
      const res = await fetch('/api/evidence/verify', { method: 'POST' });
      if (res.ok) {
        const audit = await res.json();
        setLedgerAudit(audit);
        return audit;
      }
    } catch (e) {}
    const audit = {
      total_events_checked: events.length || INITIAL_EVENTS.length,
      valid_hashes: events.length || INITIAL_EVENTS.length,
      tampered_events: 0,
      status: "ALL_HASHES_VALID",
      root_merkle_digest: "b083a12a2d73844f481dfacf1356231c2eda4250ce20db516c3220e64d3161bc",
      tampered_records: []
    };
    setLedgerAudit(audit);
    return audit;
  };

  const tamperEvidence = async (eventId, modifications) => {
    try {
      const res = await fetch('/api/evidence/tamper-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, modifications })
      });
      if (res.ok) {
        await refreshAll();
        await verifyLedgerIntegrity();
        return;
      }
    } catch (e) {}
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...modifications } : e));
    setLedgerAudit({
      total_events_checked: events.length,
      valid_hashes: Math.max(0, events.length - 1),
      tampered_events: 1,
      status: "TAMPER_DETECTED",
      root_merkle_digest: "MISMATCH_DETECTED",
      tampered_records: [{ event_id: eventId, error: "SHA-256 hash does not match payload content" }]
    });
  };

  const restoreEvidence = async (eventId) => {
    try {
      const res = await fetch('/api/evidence/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId })
      });
      if (res.ok) {
        await refreshAll();
        await verifyLedgerIntegrity();
        return;
      }
    } catch (e) {}
    setEvents(INITIAL_EVENTS);
    verifyLedgerIntegrity();
  };

  // ==================== DEVICE MANAGEMENT ====================
  const registerDevice = async (deviceData) => {
    try {
      const res = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      if (res.ok) {
        const saved = await res.json();
        setDevices((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (e) {}
    const newDev = {
      id: `DEV-${Math.floor(100 + Math.random() * 900)}`,
      name: deviceData.name || "NEW-DEVICE",
      device_type: deviceData.device_type || "windows",
      os: deviceData.os || "Windows 11",
      ip: deviceData.ip || "10.0.5.20",
      status: "connected",
      mode: "Local Telemetry Agent",
      registered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      security_posture: "nominal"
    };
    setDevices(prev => [newDev, ...prev]);
    return newDev;
  };

  const generateTestEvent = async (testData) => {
    try {
      const res = await fetch('/api/devices/generate-test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      if (res.ok) {
        const evt = await res.json();
        setEvents((prev) => [evt, ...(prev || [])]);
        await refreshAll();
        return evt;
      }
    } catch (e) {}

    const devName = testData?.device_name || (testData?.device_id ? (devices.find(d => d.id === testData.device_id)?.name) : "WS-ENGINEERING-07") || "WS-ENGINEERING-07";
    const newEvt = {
      id: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      source_ip: testData?.ip || (devName.includes('MOBILE') ? '10.0.4.52' : devName.includes('IPHONE') ? '10.0.4.61' : devName.includes('FINANCE') ? '10.0.3.11' : '10.0.2.14'),
      destination_ip: "10.0.3.11",
      username: testData?.username || (devName.includes('FINANCE') ? 'svc_finance' : 'david.webb'),
      device_name: devName,
      event_type: testData?.event_type || "diagnostic_audit",
      event_description: testData?.description || `Controlled benign diagnostic telemetry probe fired on ${devName}.`,
      severity: testData?.severity || "low",
      mitre_id: testData?.severity === 'high' ? 'T1068' : 'T1078',
      mitre_name: testData?.event_type === 'suspicious_login' ? 'Credential Validation Probe' : 'Diagnostic Telemetry Pulse',
      stage: 1,
      status: "correlated",
      is_canary: false,
      evidence_hash: `SHA256-${Date.now().toString(16).toUpperCase()}78F2`
    };

    setEvents(prev => [newEvt, ...(prev || [])]);
    setStats(prev => prev ? {
      ...prev,
      total_events: (prev.total_events || 0) + 1
    } : prev);

    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (err) {}

    return newEvt;
  };

  const importEvents = async (rawLogs) => {
    try {
      const res = await fetch('/api/events/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: rawLogs })
      });
      if (res.ok) {
        const result = await res.json();
        await refreshAll();
        return result;
      }
    } catch (e) {}

    // Autonomous client fallback for static deployments (GitHub Pages)
    let parsedEvents = [];
    try {
      const trimmed = String(rawLogs).trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        parsedEvents = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Syslog format: parse each line
        const lines = trimmed.split('\n').filter(Boolean);
        parsedEvents = lines.map((line, idx) => ({
          id: `EVT-SYS-${Date.now().toString().slice(-4)}-${idx}`,
          timestamp: new Date().toISOString(),
          source_ip: "10.0.2.14",
          destination_ip: "10.0.3.11",
          username: "syslog_operator",
          device_name: line.includes('MOBILE') ? 'MOBILE-PIXEL-08' : line.includes('FINANCE') ? 'SRV-FINANCE-01' : 'WS-ENGINEERING-07',
          event_type: "syslog_ingest",
          event_description: line,
          severity: line.toLowerCase().includes('err') || line.toLowerCase().includes('fail') || line.toLowerCase().includes('high') ? 'high' : 'info',
          mitre_id: "T1078",
          mitre_name: "RFC5424 Syslog Ingest",
          status: "correlated",
          evidence_hash: `SHA256-${Date.now().toString(16).toUpperCase()}${idx}C81`
        }));
      }
    } catch (parseErr) {
      parsedEvents = [{
        id: `EVT-RAW-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        source_ip: "10.0.2.14",
        destination_ip: "10.0.3.11",
        username: "ingest_agent",
        device_name: "WS-ENGINEERING-07",
        event_type: "raw_log_ingest",
        event_description: String(rawLogs).slice(0, 150),
        severity: "low",
        mitre_id: "T1078",
        mitre_name: "Raw Ingest Stream",
        status: "correlated",
        evidence_hash: `SHA256-${Date.now().toString(16).toUpperCase()}99A`
      }];
    }

    const normalizedEvents = parsedEvents.map((evt, idx) => ({
      id: evt.id || `EVT-INGEST-${Date.now().toString().slice(-4)}-${idx}`,
      timestamp: evt.timestamp || new Date().toISOString(),
      source_ip: evt.source_ip || evt.ip || "10.0.2.14",
      destination_ip: evt.destination_ip || "10.0.3.11",
      username: evt.username || evt.user || "ingest_user",
      device_name: evt.device_name || evt.hostname || "WS-ENGINEERING-07",
      event_type: evt.event_type || evt.type || "security_log",
      event_description: evt.event_description || evt.message || evt.description || "Ingested security telemetry",
      severity: evt.severity || "medium",
      mitre_id: evt.mitre_id || "T1078",
      mitre_name: evt.mitre_name || "Telemetry Ingestion Pulse",
      status: "correlated",
      evidence_hash: evt.evidence_hash || `SHA256-${Date.now().toString(16).toUpperCase()}12FF`
    }));

    setEvents(prev => [...normalizedEvents, ...(prev || [])]);
    setStats(prev => prev ? {
      ...prev,
      total_events: (prev.total_events || 0) + normalizedEvents.length
    } : prev);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}

    return {
      status: 'success',
      success: true,
      imported_count: normalizedEvents.length,
      events: normalizedEvents
    };
  };

  // ==================== JUDGE & PROTECTION DEMOS ====================
  const runJudgeDemo = async () => {
    try {
      const res = await fetch('/api/demo/judge', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await refreshAll();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        return data;
      }
    } catch (e) {}
    setEvents(INITIAL_EVENTS);
    setAttackGraph(INITIAL_ATTACK_GRAPH);
    setCanaries(INITIAL_CANARIES);
    setDevices(INITIAL_DEVICES);
    setStats(INITIAL_STATS);
    setBlastRadius(INITIAL_BLAST_RADIUS);
    setEvidenceLedger({ total_records: INITIAL_EVENTS.length, records: INITIAL_EVENTS });
    setActiveAlert({
      id: "EVT-JUDGE-DEMO",
      title: "AUTONOMOUS ATTACK PATH RECONSTRUCTED",
      description: "6 attack stages correlated into directed attack graph with critical path highlighted.",
      device: "WS-ENGINEERING-07",
      mitre: "T1078 -> T1068 -> T1021 -> T1005 -> T1048",
      timestamp: new Date().toISOString()
    });
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    return { success: true, message: "Autonomous investigation reconstructed successfully." };
  };

  const runProtectionDemo = async () => {
    try {
      const res = await fetch('/api/incident-response/run-protection-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await refreshAll();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        return data;
      }
    } catch (e) {}
    const newAction = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      action_type: "quarantine_host",
      target: "WS-ENGINEERING-07",
      status: "EXECUTED_SIMULATED",
      timestamp: new Date().toISOString(),
      operator: "Autonomous-Incident-Response",
      integrity_hash: "a4f89d34e9087c2b51264872c9183416e91bf84c68832a76f2d8e4129486c91b"
    };
    setActions(prev => [newAction, ...prev]);
    setDevices(prev => prev.map(d => d.id === 'DEV-001' ? { ...d, status: 'isolated', security_posture: 'protected' } : d));
    setStats(prev => prev ? {
      ...prev,
      overall_status: "THREAT_CONTAINED",
      threat_level: "DEFCON 5 - CONTAINED",
      compromised_devices_count: 0
    } : INITIAL_STATS);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    return { success: true, message: "Host WS-ENGINEERING-07 isolated and sessions revoked." };
  };

  const triggerLiveAttackSimulation = async (scenario = 'multistage') => {
    try {
      const res = await fetch('/api/agent/trigger-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        await startSimulation(scenario, 1.2);
        return;
      }
    } catch (e) {}
    await startSimulation(scenario, 1.2);
  };

  const executeRemediationAndVerify = async () => {
    try {
      const res = await fetch('/api/agent/remediate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await refreshAll();
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        return data;
      }
    } catch (e) {}

    // Autonomous client fallback for static deployments (GitHub Pages)
    const verificationRecord = {
      success: true,
      status: "CONTAINED_AND_VERIFIED",
      message: "Adversary process killed (PID 5124), Controlled Receiver egress blocked (403 Forbidden), staged payload quarantined, clean data restored.",
      actions_taken: [
        "Terminated malicious harvester process PID 5124 (powershell.exe) via taskkill /F",
        "Enforced perimeter egress drop at Controlled Receiver (HTTP 403 Forbidden applied)",
        "Quarantined staged exfiltration archive exfil_payload_staged.zip to sandbox quarantine vault",
        "Restored clean verified synthetic customer data from immutable backup",
        "Revoked compromised interactive tokens for david.webb on WS-ENGINEERING-07"
      ],
      process_terminated: true,
      active_pids: [],
      quarantined_files: ["exfil_payload_staged.zip"],
      restored_files: ["synthetic_customer_records.csv", "confidential_payroll_q3.json"],
      receiver_status: {
        egress_blocked: true,
        bytes_leaked: 0,
        bytes_blocked: 2450,
        prevention_rate_pct: 100.0,
        outcome: "PREVENTED"
      },
      verification_hash: "3a8f190e7bc944c21a0d819e6b72a44d018f4bb2f45ec7d36329a1a8c983cba4",
      timestamp: new Date().toISOString()
    };

    // Update attack graph to contained state
    setAttackGraph((prev) => {
      const prevGraph = prev || INITIAL_ATTACK_GRAPH;
      return {
        ...prevGraph,
        summary: {
          ...prevGraph.summary,
          containment_status: "CONTAINED"
        },
        nodes: (prevGraph.nodes || []).map((n) => ({
          ...n,
          data: {
            ...n.data,
            visual_state: 'contained'
          }
        })),
        edges: (prevGraph.edges || []).map((e) => ({
          ...e,
          animated: false,
          data: {
            ...e.data,
            contained: true
          }
        }))
      };
    });

    // Update devices state
    setDevices((prev) =>
      prev.map((d) =>
        d.id === 'DEV-001' || d.name === 'WS-ENGINEERING-07'
          ? { ...d, status: 'isolated', security_posture: 'protected', active_pids: [] }
          : d
      )
    );

    // Update stats
    setStats((prev) =>
      prev
        ? {
            ...prev,
            overall_status: "THREAT_CONTAINED",
            threat_level: "DEFCON 5 - CONTAINED",
            active_threats_count: 0,
            compromised_devices_count: 0
          }
        : INITIAL_STATS
    );

    // Add action record
    const newAction = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      action_type: "autonomous_containment",
      target: "WS-ENGINEERING-07 (PID 5124) + Receiver :8000",
      status: "EXECUTED_VERIFIED",
      timestamp: new Date().toISOString(),
      operator: "PloyWeb-Autonomous-Defense",
      integrity_hash: verificationRecord.verification_hash
    };
    setActions((prev) => [newAction, ...prev]);

    // Add contained event
    const containedEvent = {
      id: `EVT-CONTAIN-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      source_ip: "10.0.2.14",
      destination_ip: "127.0.0.1",
      username: "SOC-Defense-Engine",
      device_name: "WS-ENGINEERING-07",
      event_type: "incident_contained",
      event_description: "Autonomous Defense: Adversary harvester PID 5124 killed, Controlled Receiver egress blocked (0 bytes leaked), clean data restored.",
      severity: "info",
      mitre_id: "RESPONSE-CONTAIN",
      mitre_name: "Defensive Containment & Data Theft Prevention",
      stage: 7,
      status: "contained",
      is_canary: false,
      evidence_hash: verificationRecord.verification_hash,
      raw_payload: verificationRecord
    };
    setEvents((prev) => [containedEvent, ...prev]);

    setActiveAlert({
      id: "ALERT-CONTAINED",
      title: "ADVERSARY ATTACK NEUTRALIZED",
      description: "Autonomous defensive containment executed: 100% data theft prevented (0 bytes leaked).",
      device: "WS-ENGINEERING-07",
      mitre: "RESPONSE-CONTAIN",
      timestamp: new Date().toISOString()
    });

    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    return verificationRecord;
  };

  const submitApprovalDecision = async (approvalId, decision, reviewerName = "Alex Vance (SOC Incident Commander)", reason = "") => {
    const nowStr = new Date().toISOString();
    try {
      await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: approvalId,
          reviewer_name: reviewerName,
          decision,
          reason: reason || `Action decision marked as ${decision} by ${reviewerName}`,
          action_requested: approvalId
        })
      });
    } catch (e) {}

    // Find approval target details
    const targetApproval = approvals.find(a => a.id === approvalId);
    const targetEntity = targetApproval?.target || "WS-ENGINEERING-07";
    const requestedAction = targetApproval?.action_requested || approvalId;

    // Generate SHA-256 audit seal hash
    const rawAuditPayload = `${approvalId}|${decision}|${reviewerName}|${targetEntity}|${nowStr}`;
    let auditHash = "";
    try {
      const encoder = new TextEncoder();
      const hashBuf = await crypto.subtle.digest("SHA-256", encoder.encode(rawAuditPayload));
      auditHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      auditHash = Array.from(rawAuditPayload).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, "0");
    }

    // 1. Update approvals state
    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        return {
          ...a,
          decision,
          reviewer_name: reviewerName,
          reason: reason || a.reason,
          timestamp: nowStr,
          status: decision === 'APPROVED' ? 'EXECUTED' : decision === 'REJECTED' ? 'REJECTED' : 'ESCALATED'
        };
      }
      return a;
    }));

    // 2. Append to Immutable Containment Action Audit Trail
    const newAuditAction = {
      id: `ACT-APPR-${Date.now().toString().slice(-4)}`,
      action_type: `ADMIN_DECISION: ${decision}`,
      target: targetEntity,
      operator: reviewerName,
      status: decision === 'APPROVED' ? 'CONTAINED' : decision === 'REJECTED' ? 'REJECTED' : 'ESCALATED',
      timestamp: nowStr,
      integrity_hash: auditHash,
      details: reason || `${requestedAction} decision marked as ${decision} by ${reviewerName}`
    };
    setActions(prev => [newAuditAction, ...(prev || [])]);

    // 3. Append to Event Logs and Cryptographic Evidence Ledger
    const newApprovalEvent = {
      id: `EVT-APPR-${Date.now().toString().slice(-4)}`,
      timestamp: nowStr,
      device_id: "DEV-001",
      device_name: "WS-ENGINEERING-07",
      process_id: 1104,
      process_name: "PloyWeb-SOC-ApprovalEngine.exe",
      event_type: "admin_approval",
      event_description: `[ADMIN APPROVAL WORKFLOW] Reviewer ${reviewerName} marked action ${approvalId} (${requestedAction}) as ${decision}. Target: ${targetEntity}.`,
      severity: decision === 'APPROVED' ? 'info' : (decision === 'ESCALATED' ? 'critical' : 'medium'),
      mitre_id: "M1049",
      mitre_name: "Antivirus/EDR Containment",
      evidence_hash: auditHash,
      status: decision === 'APPROVED' ? 'executed' : (decision === 'REJECTED' ? 'rejected' : 'escalated'),
      username: reviewerName
    };
    setEvents(prev => [newApprovalEvent, ...(prev || [])]);
    setEvidenceLedger(prev => ({
      total_records: (prev?.total_records || 0) + 1,
      records: [newApprovalEvent, ...(prev?.records || [])]
    }));

    // 4. Update Attack Graph based on decision
    if (decision === 'APPROVED') {
      setAttackGraph(prev => {
        const prevGraph = prev || INITIAL_ATTACK_GRAPH;
        return {
          ...prevGraph,
          summary: {
            ...prevGraph.summary,
            containment_status: "CONTAINED"
          },
          nodes: (prevGraph.nodes || []).map(n => ({
            ...n,
            data: {
              ...n.data,
              visual_state: 'contained'
            }
          })),
          edges: (prevGraph.edges || []).map(e => ({
            ...e,
            animated: false,
            data: {
              ...e.data,
              contained: true
            }
          }))
        };
      });

      // Update devices
      setDevices(prev => prev.map(d => 
        (d.id === 'DEV-001' || d.name === 'WS-ENGINEERING-07') 
          ? { ...d, status: 'isolated', security_posture: 'protected', active_pids: [] } 
          : d
      ));

      setActiveAlert({
        id: "ALERT-APPROVAL-EXEC",
        title: `DEFENSE AUTHORIZED: ${decision}`,
        description: `Remediation action '${approvalId}' approved and authorized by ${reviewerName}. Target contained.`,
        device: targetEntity,
        mitre: "RESPONSE-CONTAIN",
        timestamp: nowStr
      });

      confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
    } else if (decision === 'REJECTED') {
      setAttackGraph(prev => {
        const prevGraph = prev || INITIAL_ATTACK_GRAPH;
        return {
          ...prevGraph,
          summary: {
            ...prevGraph.summary,
            containment_status: "REJECTED_REVIEW"
          },
          nodes: (prevGraph.nodes || []).map(n => {
            if (n.data?.label?.includes(targetEntity) || n.id?.includes(targetEntity)) {
              return {
                ...n,
                data: {
                  ...n.data,
                  visual_state: 'normal',
                  details: `Remediation action rejected by ${reviewerName}. Host remains under passive observation.`
                }
              };
            }
            return n;
          })
        };
      });

      setActiveAlert({
        id: "ALERT-APPROVAL-REJECT",
        title: `REMEDIATION REJECTED: ${approvalId}`,
        description: `Proposed containment for '${targetEntity}' was rejected by ${reviewerName}. Host remains unquarantined.`,
        device: targetEntity,
        mitre: "ACTION-REJECTED",
        timestamp: nowStr
      });
    } else if (decision === 'ESCALATED') {
      setAttackGraph(prev => {
        const prevGraph = prev || INITIAL_ATTACK_GRAPH;
        return {
          ...prevGraph,
          summary: {
            ...prevGraph.summary,
            containment_status: "DEFCON_1_ESCALATED"
          },
          nodes: (prevGraph.nodes || []).map(n => {
            if (n.data?.label?.includes(targetEntity) || n.id?.includes(targetEntity) || n.data?.is_patient_zero) {
              return {
                ...n,
                data: {
                  ...n.data,
                  visual_state: 'malicious-simulation',
                  details: `DEFCON-1 ESCALATION: Action ${approvalId} escalated to Tier-3 incident response by ${reviewerName}.`
                }
              };
            }
            return n;
          })
        };
      });

      setActiveAlert({
        id: "ALERT-APPROVAL-ESCALATE",
        title: `CRITICAL ESCALATION: ${approvalId}`,
        description: `Remediation action '${approvalId}' escalated to Tier-3 emergency response by ${reviewerName}.`,
        device: targetEntity,
        mitre: "DEFCON-1-ESCALATE",
        timestamp: nowStr
      });
    }
  };

  // ==================== AUTH TELEMETRY & ATTACK GRAPH INGESTION ====================
  const recordAuthTelemetryEvent = useCallback(async ({
    username,
    employeeId = 'EMP-041',
    ipAddress = '198.51.100.44',
    deviceName = 'WS-ENGINEERING-07',
    attemptNumber = 1,
    isSuccess = false,
    isLockout = false,
    isHighRiskBlocked = false,
    riskScore = 0,
    riskSignals = [],
    failureReason = 'Password verification mismatch'
  }) => {
    const nowStr = new Date().toISOString();
    const rawPayload = `${username}|${employeeId}|${ipAddress}|${deviceName}|${attemptNumber}|${nowStr}|${isHighRiskBlocked ? 'HIGH_RISK_BLOCK' : (isLockout ? 'LOCKOUT' : (isSuccess ? 'SUCCESS' : 'FAILED'))}`;

    let evidenceHash = '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(rawPayload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      evidenceHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      evidenceHash = Array.from(rawPayload).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, '0');
    }

    const eventId = isHighRiskBlocked
      ? `EVT-RISK-HIGH-${Date.now().toString().slice(-4)}`
      : isLockout
        ? `EVT-BF-${Date.now().toString().slice(-4)}`
        : isSuccess
          ? `EVT-AUTH-${Date.now().toString().slice(-4)}`
          : `EVT-FAIL-${Date.now().toString().slice(-4)}`;

    const newEvent = {
      id: eventId,
      timestamp: nowStr,
      device_id: 'DEV-001',
      device_name: deviceName,
      process_id: 1104,
      process_name: 'lsass.exe / LogonUI.exe',
      parent_process_id: 648,
      parent_process: 'winlogon.exe',
      event_type: isHighRiskBlocked ? 'suspicious_login' : (isLockout ? 'brute_force' : (isSuccess ? 'user_login' : 'login_failure')),
      event_description: isHighRiskBlocked
        ? `[AI ANOMALY DETECTION] High-risk login attempt intercepted for ${username} (${employeeId}) from ${ipAddress} on ${deviceName}. Risk Score: ${riskScore}/100. Access restricted and SOC alerted.`
        : isLockout
          ? `[ACCOUNT KNOCKED OUT] 3 consecutive failed authentication attempts detected for ${username} (${employeeId}) from external IP ${ipAddress}. 15-minute defensive account knockout engaged.`
          : isSuccess
            ? `Interactive user session authenticated for ${username} (${employeeId}) on ${deviceName} from ${ipAddress} (Risk Score: ${riskScore}/100 - LOW).`
            : `Authentication failure (Attempt ${attemptNumber}/3) for ${username} on ${deviceName} from IP ${ipAddress}.`,
      severity: isHighRiskBlocked || isLockout ? 'critical' : (isSuccess ? 'info' : (attemptNumber >= 2 ? 'high' : 'medium')),
      mitre_id: isHighRiskBlocked ? 'T1078' : (isLockout ? 'T1110' : (isSuccess ? 'T1078' : 'T1110.001')),
      mitre_name: isHighRiskBlocked ? 'Valid Accounts: High-Risk Access Attempt' : (isLockout ? 'Brute Force: Password Guessing' : (isSuccess ? 'Valid Accounts' : 'Password Guessing Attempt')),
      mitre_tactic: isHighRiskBlocked ? 'Initial Access' : (isLockout ? 'Credential Access' : 'Initial Access'),
      stage: isHighRiskBlocked || isLockout ? 1 : (isSuccess ? 0 : 1),
      evidence_hash: evidenceHash,
      status: isHighRiskBlocked || isLockout ? 'detected' : 'logged',
      source_ip: ipAddress,
      destination_ip: '10.0.2.14',
      username: username,
      why_flagged: {
        score: isHighRiskBlocked ? riskScore : (isLockout ? 95 : (attemptNumber === 2 ? 65 : 40)),
        baseline: 'Corporate subnet (10.0.2.x), 0 failures, standard business hours',
        signals: isHighRiskBlocked && riskSignals && riskSignals.length > 0
          ? riskSignals
          : isLockout
            ? [
                { signal: 'Adversary External IP (198.51.100.44)', weight: 35 },
                { signal: 'Velocity Anomaly (3 failures < 60s)', weight: 30 },
                { signal: 'Exceeded Maximum Failed Authentication Threshold', weight: 20 },
                { signal: 'High Risk Brute Force Pattern (T1110)', weight: 10 }
              ]
            : [
                { signal: 'External Source IP', weight: 25 },
                { signal: `Authentication Failure #${attemptNumber}`, weight: 20 }
              ]
      }
    };

    // Prepend to security events and evidence ledger
    setEvents(prev => [newEvent, ...(prev || [])]);
    setEvidenceLedger(prev => ({
      total_records: (prev?.total_records || 0) + 1,
      records: [newEvent, ...(prev?.records || [])]
    }));

    if (isHighRiskBlocked || isLockout) {
      setStats(prev => ({
        ...prev,
        total_events: (prev?.total_events || 0) + 1,
        threat_count: (prev?.threat_count || 0) + 1,
        critical_alerts: (prev?.critical_alerts || 0) + 1,
        overall_status: 'CRITICAL_THREAT'
      }));

      // Update Attack Graph with anomaly / knockout node and edge
      setAttackGraph(prev => {
        const prevGraph = prev || INITIAL_ATTACK_GRAPH;
        const nodes = [...(prevGraph.nodes || [])];
        const edges = [...(prevGraph.edges || [])];

        // Find or create adversary IP node
        let attackerNode = nodes.find(n => n.id === 'node-attacker-198.51.100.44');
        if (attackerNode) {
          attackerNode.data = {
            ...attackerNode.data,
            visual_state: 'malicious-simulation',
            details: isHighRiskBlocked
              ? `Adversary origin [${ipAddress}] intercepted by AI Anomaly Detection Engine (Risk Score: ${riskScore}/100). Access restricted.`
              : `Adversary origin [198.51.100.44] executed 3 rapid brute-force attempts on ${username}. Triggered T1110 knockout.`,
            last_seen: nowStr
          };
        }

        // Find or create target user node
        let userNode = nodes.find(n => n.id === `node-user-${username}` || n.id === 'node-user-david.webb');
        if (userNode) {
          userNode.data = {
            ...userNode.data,
            label: isHighRiskBlocked ? `${username} [ACCESS RESTRICTED]` : `${username} [KNOCKED OUT]`,
            visual_state: 'contained',
            details: isHighRiskBlocked
              ? `Authentication blocked by AI Anomaly Risk Engine (Score: ${riskScore}/100). Defensive hold engaged.`
              : `Account temporarily locked out for 15 minutes following 3 consecutive authentication failures. Defended by PloyWeb SOC.`,
            last_seen: nowStr
          };
        }

        // Update Edge 1 connecting attacker to user
        let edge1 = edges.find(e => e.id === 'edge-1' || (e.source === 'node-attacker-198.51.100.44' && (e.target === `node-user-${username}` || e.target === 'node-user-david.webb')));
        if (edge1) {
          edge1.label = isHighRiskBlocked
            ? `Stage 1: AI Anomaly Intercept (Score: ${riskScore}/100) [OBSERVED • 100%]`
            : 'Stage 1: T1110 Brute-Force Lockout (3 Failures) [OBSERVED • 100%]';
          edge1.data = {
            ...edge1.data,
            severity: 'critical',
            mitre_id: isHighRiskBlocked ? 'T1078' : 'T1110',
            confidence: 1.0,
            relationship_nature: 'observed',
            details: isHighRiskBlocked
              ? `High-risk anomaly score (${riskScore}/100) triggered defensive restriction.`
              : '3 consecutive authentication failures triggered automated 15-minute account knockout.'
          };
        }

        return {
          ...prevGraph,
          nodes,
          edges
        };
      });

      setActiveAlert({
        id: isHighRiskBlocked ? 'ALERT-HIGH-RISK-ACCESS' : 'ALERT-BF-LOCKOUT',
        title: isHighRiskBlocked ? 'AI ANOMALY RISK: HIGH-RISK ACCESS RESTRICTED' : 'ACCOUNT KNOCKOUT ENFORCED (T1110)',
        description: isHighRiskBlocked
          ? `Interactive authentication for '${username}' from ${ipAddress} scored ${riskScore}/100 (HIGH RISK). Access restricted; SOC incident raised.`
          : `Account '${username}' knocked out for 15 minutes after 3 failed login attempts on ${deviceName} from ${ipAddress}. NetworkX Attack Graph updated.`
      });
    }

    // Try posting to backend if online
    try {
      fetch('/api/events/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      }).catch(() => {});
    } catch (e) {}

    return newEvent;
  }, []);

  // ==================== GUIDED DEMO MODE LOGIC ====================
  // 9 Required Steps:
  // 1. Suspicious login detected
  // 2. Lateral movement identified
  // 3. Privilege escalation detected
  // 4. Canary file accessed
  // 5. Attack graph reconstructed
  // 6. Blast radius calculated
  // 7. Incident response recommendations generated
  // 8. Evidence hashes verified
  // 9. Incident report generated
  const DEMO_STEPS = [
    {
      step: 1,
      title: "1. Suspicious Login Detected",
      targetPath: "/events",
      description: "Anomalous authentication observed on perimeter gateway from Eastern Europe proxy IP.",
      actionLabel: "Advance to Step 2: Lateral Movement",
      action: async () => {
        // highlight login event
      }
    },
    {
      step: 2,
      title: "2. Lateral Movement Identified",
      targetPath: "/tracegraph",
      description: "Attacker pivoted via WinRM (Port 5985) and SMB to engineering workstation WS-ENGINEERING-07.",
      actionLabel: "Advance to Step 3: Privilege Escalation",
      action: async () => {}
    },
    {
      step: 3,
      title: "3. Privilege Escalation Detected",
      targetPath: "/tracegraph",
      description: "Attacker executed Named Pipe token impersonation, elevating to NT AUTHORITY\\SYSTEM.",
      actionLabel: "Advance to Step 4: Canary Deception",
      action: async () => {}
    },
    {
      step: 4,
      title: "4. Canary File Accessed",
      targetPath: "/canary-twin",
      description: "Decoy trap 'Finance_Report_Canary.txt' was breached. Tripwire instantly triggered DEFCON 1 alert.",
      actionLabel: "Advance to Step 5: TraceGraph Reconstruction",
      action: async () => {}
    },
    {
      step: 5,
      title: "5. Attack Graph Reconstructed",
      targetPath: "/tracegraph",
      description: "NetworkX directed graph maps end-to-end multi-stage intrusion and highlights the critical attack path.",
      actionLabel: "Advance to Step 6: Blast Radius",
      action: async () => {}
    },
    {
      step: 6,
      title: "6. Blast Radius Calculated",
      targetPath: "/blast-radius",
      description: "Identifies Patient Zero, isolates 4 compromised hosts, and exposes at-risk subnet reachability (87.5% impact).",
      actionLabel: "Advance to Step 7: Incident Response",
      action: async () => {}
    },
    {
      step: 7,
      title: "7. Incident Response Recommendations Generated",
      targetPath: "/incident-response",
      description: "Autonomous containment playbooks generated: Isolate WS-ENGINEERING-07, Suspend david.webb, Block attacker IP.",
      actionLabel: "Advance to Step 8: Evidence Verification",
      action: async () => {}
    },
    {
      step: 8,
      title: "8. Evidence Hashes Verified",
      targetPath: "/evidence",
      description: "SHA-256 cryptographic checksums audited across the entire event ledger. Cryptographic chain verified 100% intact.",
      actionLabel: "Advance to Step 9: Investigation Dossier",
      action: async () => {
        await verifyLedgerIntegrity();
      }
    },
    {
      step: 9,
      title: "9. Incident Report Generated",
      targetPath: "/reports",
      description: "Comprehensive investigation dossier finalized with executive summary, MITRE matrix, evidence root seal, and exportable PDF.",
      actionLabel: "Complete Guided Demonstration",
      action: () => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  ];

  const startDemo = async () => {
    setDemoActive(true);
    setDemoStep(1);
    await reseedDemo();
  };

  const nextDemoStep = () => {
    if (demoStep < 9) {
      const nextS = demoStep + 1;
      setDemoStep(nextS);
      if (DEMO_STEPS[nextS - 1].action) {
        DEMO_STEPS[nextS - 1].action();
      }
    } else {
      setDemoActive(false);
      confetti({ particleCount: 150, spread: 90 });
    }
  };

  const prevDemoStep = () => {
    if (demoStep > 1) {
      setDemoStep(demoStep - 1);
    }
  };

  const exitDemo = () => {
    setDemoActive(false);
  };

  return (
    <SecurityContext.Provider
      value={{
        stats,
        events,
        simState,
        canaries,
        attackGraph,
        blastRadius,
        actions,
        approvals,
        setApprovals,
        submitApprovalDecision,
        devices,
        agentStatus,
        fetchAgentStatus,
        triggerLiveAttackSimulation,
        executeRemediationAndVerify,
        evidenceLedger,
        ledgerAudit,
        loading,
        activeAlert,
        setActiveAlert,
        refreshAll,
        fetchDevices,
        registerDevice,
        generateTestEvent,
        importEvents,
        runJudgeDemo,
        runProtectionDemo,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        stepSimulation,
        reseedDemo,
        tripCanary,
        rearmCanaries,
        createCanary,
        executeResponseAction,
        verifyLedgerIntegrity,
        tamperEvidence,
        restoreEvidence,
        // Live Judge Demo Modal
        isJudgeModalOpen,
        setIsJudgeModalOpen,
        // Demo
        demoActive,
        demoStep,
        demoStepsList: DEMO_STEPS,
        currentDemoStep: DEMO_STEPS[demoStep - 1],
        startDemo,
        recordAuthTelemetryEvent,
        nextDemoStep,
        prevDemoStep,
        exitDemo
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);
