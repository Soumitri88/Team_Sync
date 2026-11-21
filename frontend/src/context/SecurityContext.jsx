import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [simState, setSimState] = useState({
    status: 'idle',
    scenario_id: null,
    current_step: 0,
    total_steps: 0,
    speed: 1.0,
    progress_pct: 0
  });
  const [canaries, setCanaries] = useState([]);
  const [attackGraph, setAttackGraph] = useState({ nodes: [], edges: [], summary: {} });
  const [blastRadius, setBlastRadius] = useState(null);
  const [actions, setActions] = useState([]);
  const [evidenceLedger, setEvidenceLedger] = useState({ total_records: 0, records: [] });
  const [ledgerAudit, setLedgerAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);

  // Guided Demo Mode state
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoAutoPlay, setDemoAutoPlay] = useState(false);

  const wsRef = useRef(null);

  // ==================== FETCH DATA ====================
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
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
      console.error('Failed to fetch events:', e);
    }
  }, []);

  const fetchAttackGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/graph/attack-graph');
      if (res.ok) {
        const data = await res.json();
        setAttackGraph(data);
      }
    } catch (e) {
      console.error('Failed to fetch attack graph:', e);
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
      console.error('Failed to fetch blast radius:', e);
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
      console.error('Failed to fetch canaries:', e);
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
      console.error('Failed to fetch response actions:', e);
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
      console.error('Failed to fetch evidence ledger:', e);
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
      console.error('Failed to fetch sim state:', e);
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
      fetchSimulationState()
    ]);
  }, [
    fetchDashboardStats,
    fetchEvents,
    fetchAttackGraph,
    fetchBlastRadius,
    fetchCanaries,
    fetchActions,
    fetchEvidenceLedger,
    fetchSimulationState
  ]);

  // Initial mount load
  useEffect(() => {
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll]);

  // ==================== WEBSOCKET CONNECTION ====================
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
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
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        setTimeout(connectWs, 3000);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pauseSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/pause', { method: 'POST' });
      if (res.ok) setSimState(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const resumeSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/resume', { method: 'POST' });
      if (res.ok) setSimState(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const resetSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/reset', { method: 'POST' });
      if (res.ok) {
        setSimState(await res.json());
        await fetch('/api/events/clear', { method: 'DELETE' });
        await refreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stepSimulation = async () => {
    try {
      const res = await fetch('/api/simulator/step', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSimState(data.sim_state);
        await refreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reseedDemo = async () => {
    try {
      await fetch('/api/demo/reset-and-seed', { method: 'POST' });
      await refreshAll();
    } catch (e) {
      console.error(e);
    }
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const rearmCanaries = async () => {
    try {
      const res = await fetch('/api/canary/reset', { method: 'POST' });
      if (res.ok) fetchCanaries();
    } catch (e) {
      console.error(e);
    }
  };

  const createCanary = async (canaryData) => {
    try {
      const res = await fetch('/api/canary/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(canaryData)
      });
      if (res.ok) fetchCanaries();
    } catch (e) {
      console.error(e);
    }
  };

  // ==================== INCIDENT RESPONSE ACTIONS ====================
  const executeResponseAction = async (actionType, target, operator = 'SOC-Commander') => {
    try {
      const res = await fetch('/api/incident-response/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType, target, operator })
      });
      if (res.ok) {
        const actionRecord = await res.json();
        setActions((prev) => [actionRecord, ...prev]);
        await refreshAll();
        return actionRecord;
      }
    } catch (e) {
      console.error(e);
    }
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
    } catch (e) {
      console.error(e);
    }
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
      }
    } catch (e) {
      console.error(e);
    }
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
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        evidenceLedger,
        ledgerAudit,
        loading,
        activeAlert,
        setActiveAlert,
        refreshAll,
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
        // Demo
        demoActive,
        demoStep,
        demoStepsList: DEMO_STEPS,
        currentDemoStep: DEMO_STEPS[demoStep - 1],
        startDemo,
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
