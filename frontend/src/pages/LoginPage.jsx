import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Lock,
  KeyRound,
  ArrowRight,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Check,
  Fingerprint,
  Smartphone,
  Info,
  Clock,
  RefreshCw,
  Server,
  Zap,
  Radio,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import { useAuth, DEMO_ADMINS, DEMO_EMPLOYEES, DEMO_CUSTOMERS, evaluateLoginRisk } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const { loginDemoPersona, loginWithCredentials, verifyMFA, registerEmployee } = useAuth();
  const { recordAuthTelemetryEvent } = useSecurity();

  const [portalType, setPortalType] = useState('admin'); // 'admin' | 'employee'
  const [isRegistering, setIsRegistering] = useState(false);

  // Manual credentials state
  const [username, setUsername] = useState('avance.soc');
  const [password, setPassword] = useState('PloyWeb@2026!');
  const [passwordHash, setPasswordHash] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // AI-Assisted Risk Engine Simulation State
  const [riskScenario, setRiskScenario] = useState('medium'); // 'low' | 'medium' | 'high' | 'custom'
  const [simulatedIP, setSimulatedIP] = useState('198.51.100.44');
  const [simulatedDevice, setSimulatedDevice] = useState('WS-ENGINEERING-07');
  const [isOddHour, setIsOddHour] = useState(false);
  const [isMaliciousIP, setIsMaliciousIP] = useState(false);
  const [isUnregisteredDevice, setIsUnregisteredDevice] = useState(false);
  const [showSignalCustomizer, setShowSignalCustomizer] = useState(false);

  // 3-Attempt Lockout State (Knockout Engine)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return Number(sessionStorage.getItem('ployweb_failed_attempts') || 0);
  });
  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('ployweb_is_locked') === 'true';
  });
  const [lockoutTimer, setLockoutTimer] = useState(() => {
    const saved = Number(sessionStorage.getItem('ployweb_lockout_seconds') || 0);
    return saved > 0 ? saved : (sessionStorage.getItem('ployweb_is_locked') === 'true' ? 900 : 0);
  });
  const [simulatingLockout, setSimulatingLockout] = useState(false);

  // Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regEmpId, setRegEmpId] = useState('EMP-105');
  const [regDept, setRegDept] = useState('Engineering');

  // MFA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState('');

  // Live Risk Calculation
  const currentRisk = evaluateLoginRisk({
    ipAddress: simulatedIP,
    deviceName: simulatedDevice,
    isOddHour,
    failedAttempts,
    isMaliciousIP,
    isUnregisteredDevice
  });

  // Real-time SHA-256 Digest Calculation
  useEffect(() => {
    if (!password) {
      setPasswordHash('');
      return;
    }
    try {
      const encoder = new TextEncoder();
      crypto.subtle.digest('SHA-256', encoder.encode(password))
        .then((buf) => {
          const hashHex = Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          setPasswordHash(hashHex);
        })
        .catch(() => {
          setPasswordHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        });
    } catch (e) {
      setPasswordHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    }
  }, [password]);

  // Lockout Countdown Timer (15 Minutes)
  useEffect(() => {
    let timer;
    if (isLocked && lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setFailedAttempts(0);
            sessionStorage.removeItem('ployweb_is_locked');
            sessionStorage.removeItem('ployweb_failed_attempts');
            sessionStorage.removeItem('ployweb_lockout_seconds');
            return 0;
          }
          const next = prev - 1;
          sessionStorage.setItem('ployweb_lockout_seconds', String(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTimer]);

  const applyScenario = (scenario) => {
    setRiskScenario(scenario);
    setErrorMsg(null);
    setMfaChallenge(null);

    if (scenario === 'low') {
      setSimulatedIP('10.0.2.14');
      setSimulatedDevice('WS-ENGINEERING-07');
      setIsOddHour(false);
      setIsMaliciousIP(false);
      setIsUnregisteredDevice(false);
      setSuccessBanner('Low Risk Scenario armed: Corporate subnet (10.0.2.14), known MDM device, business hours.');
      setTimeout(() => setSuccessBanner(null), 3000);
    } else if (scenario === 'medium') {
      setSimulatedIP('198.51.100.44');
      setSimulatedDevice('WS-ENGINEERING-07');
      setIsOddHour(false);
      setIsMaliciousIP(false);
      setIsUnregisteredDevice(false);
      setSuccessBanner('Medium Risk Scenario armed: Unseen external IP (198.51.100.44). Step-Up MFA will trigger.');
      setTimeout(() => setSuccessBanner(null), 3000);
    } else if (scenario === 'high') {
      setSimulatedIP('185.220.101.5');
      setSimulatedDevice('UNKNOWN-MAC-X1');
      setIsOddHour(true);
      setIsMaliciousIP(true);
      setIsUnregisteredDevice(true);
      setSuccessBanner('High Risk Scenario armed: External Tor node (185.220.101.5), unmanaged device, off-hours. Access will be restricted.');
      setTimeout(() => setSuccessBanner(null), 3000);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!username || !password || !regFullName || !regEmpId) {
      setErrorMsg('Please complete all required registration fields.');
      return;
    }
    setErrorMsg(null);
    setIsAuthenticating(true);

    try {
      const res = await registerEmployee({
        username,
        password,
        full_name: regFullName,
        employee_id: regEmpId,
        department: regDept,
        email: `${username}@novatech.internal`
      });
      if (res.success) {
        setSuccessBanner(res.message);
        setIsRegistering(false);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleManualLogin = async (e) => {
    e?.preventDefault();
    if (isLocked) {
      setErrorMsg(`ACCOUNT KNOCKED OUT: Please wait ${Math.floor(lockoutTimer / 60)}m ${lockoutTimer % 60}s or click 'Emergency SOC Unlock' below.`);
      return;
    }
    if (!username || !password) {
      setErrorMsg('Please enter both Employee ID / Username and password.');
      return;
    }
    setErrorMsg(null);
    setIsAuthenticating(true);

    try {
      const res = await loginWithCredentials(
        username,
        password,
        simulatedIP,
        simulatedDevice,
        {
          isOddHour,
          isMaliciousIP,
          isUnregisteredDevice,
          failedAttempts
        }
      );

      if (res.success) {
        // LOW RISK: Direct Access Allowed
        setFailedAttempts(0);
        sessionStorage.removeItem('ployweb_failed_attempts');
        sessionStorage.removeItem('ployweb_is_locked');

        // Record successful login telemetry event
        if (recordAuthTelemetryEvent) {
          recordAuthTelemetryEvent({
            username,
            employeeId: username.startsWith('EMP') ? username : (portalType === 'admin' ? 'EMP-001' : 'EMP-041'),
            ipAddress: simulatedIP,
            deviceName: simulatedDevice,
            attemptNumber: failedAttempts + 1,
            isSuccess: true,
            isLockout: false,
            riskScore: res.risk_score || currentRisk.score,
            riskSignals: currentRisk.signals
          });
        }

        if (onLoginSuccess) onLoginSuccess();
      } else if (res.mfa_required) {
        // MEDIUM RISK: Step-up MFA Required
        setMfaChallenge(res);
        setMfaCode(res.simulated_otp || '');
      } else if (res.is_high_risk) {
        // HIGH RISK: Access Restricted & Admin Alerted
        if (recordAuthTelemetryEvent) {
          recordAuthTelemetryEvent({
            username,
            employeeId: username.startsWith('EMP') ? username : (portalType === 'admin' ? 'EMP-001' : 'EMP-041'),
            ipAddress: simulatedIP,
            deviceName: simulatedDevice,
            attemptNumber: 1,
            isSuccess: false,
            isLockout: false,
            isHighRiskBlocked: true,
            riskScore: res.risk_score || currentRisk.score,
            riskSignals: res.risk_signals || currentRisk.signals,
            failureReason: 'AI Anomaly Engine High Risk Threshold (>= 65 pts)'
          });
        }
        setErrorMsg(res.error || `ACCESS RESTRICTED: AI Anomaly Detection Engine flagged this authentication as HIGH RISK (${res.risk_score || currentRisk.score}/100). Security Operations Center notified.`);
      } else {
        // Failed attempt: credentials mismatch
        const newFailCount = failedAttempts + 1;
        setFailedAttempts(newFailCount);
        sessionStorage.setItem('ployweb_failed_attempts', String(newFailCount));

        if (newFailCount >= 3) {
          // 3rd failure: TRIGGER TEMPORARY KNOCKOUT!
          setIsLocked(true);
          setLockoutTimer(900); // 15 mins
          sessionStorage.setItem('ployweb_is_locked', 'true');
          sessionStorage.setItem('ployweb_lockout_seconds', '900');

          if (recordAuthTelemetryEvent) {
            recordAuthTelemetryEvent({
              username,
              employeeId: username.startsWith('EMP') ? username : (portalType === 'admin' ? 'EMP-001' : 'EMP-041'),
              ipAddress: simulatedIP,
              deviceName: simulatedDevice,
              attemptNumber: 3,
              isSuccess: false,
              isLockout: true,
              failureReason: '3 consecutive authentication failures reached threshold'
            });
          }

          setErrorMsg('CRITICAL SECURITY KNOCKOUT: 3 consecutive failed login attempts detected on WS-ENGINEERING-07. Account temporarily locked for 15 minutes to contain potential brute-force intrusion (MITRE ATT&CK T1110). High-priority security incident raised to SOC.');
        } else {
          const remaining = 3 - newFailCount;
          if (recordAuthTelemetryEvent) {
            recordAuthTelemetryEvent({
              username,
              employeeId: username.startsWith('EMP') ? username : (portalType === 'admin' ? 'EMP-001' : 'EMP-041'),
              ipAddress: simulatedIP,
              deviceName: simulatedDevice,
              attemptNumber: newFailCount,
              isSuccess: false,
              isLockout: false,
              failureReason: `Invalid credentials (Try ${newFailCount}/3)`
            });
          }
          setErrorMsg(`Invalid credentials provided. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary account knockout.`);
        }
      }
    } catch (err) {
      setErrorMsg('Authentication engine unreachable. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e?.preventDefault();
    if (!mfaCode || !mfaChallenge) return;
    setIsAuthenticating(true);
    setErrorMsg(null);

    try {
      const res = await verifyMFA(mfaChallenge.session_id, mfaCode);
      if (res.success) {
        if (recordAuthTelemetryEvent) {
          recordAuthTelemetryEvent({
            username,
            employeeId: username.startsWith('EMP') ? username : 'EMP-041',
            ipAddress: simulatedIP,
            deviceName: simulatedDevice,
            attemptNumber: 1,
            isSuccess: true,
            isLockout: false,
            riskScore: mfaChallenge.risk_score || currentRisk.score,
            riskSignals: mfaChallenge.risk_signals || currentRisk.signals,
            failureReason: 'MFA Step-Up Verified Successfully'
          });
        }
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid 6-digit MFA verification code.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmergencyUnlock = () => {
    setIsLocked(false);
    setFailedAttempts(0);
    setLockoutTimer(0);
    sessionStorage.removeItem('ployweb_failed_attempts');
    sessionStorage.removeItem('ployweb_is_locked');
    sessionStorage.removeItem('ployweb_lockout_seconds');
    setErrorMsg(null);
    setSuccessBanner('Account unlocked by SOC Administrator. Security attempt counter reset to 3.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Automated 3-Attempt Simulation for Hackathon Judges
  const handleSimulateKnockoutDemo = async () => {
    setSimulatingLockout(true);
    setErrorMsg(null);
    setSuccessBanner('Initiating Automated 3-Attempt Adversary Brute-Force Simulation...');

    // Attempt 1
    await new Promise(r => setTimeout(r, 600));
    setFailedAttempts(1);
    if (recordAuthTelemetryEvent) {
      recordAuthTelemetryEvent({
        username: 'david.webb',
        employeeId: 'EMP-041',
        ipAddress: simulatedIP,
        deviceName: simulatedDevice,
        attemptNumber: 1,
        isSuccess: false,
        isLockout: false
      });
    }

    // Attempt 2
    await new Promise(r => setTimeout(r, 700));
    setFailedAttempts(2);
    if (recordAuthTelemetryEvent) {
      recordAuthTelemetryEvent({
        username: 'david.webb',
        employeeId: 'EMP-041',
        ipAddress: simulatedIP,
        deviceName: simulatedDevice,
        attemptNumber: 2,
        isSuccess: false,
        isLockout: false
      });
    }

    // Attempt 3: Knockout
    await new Promise(r => setTimeout(r, 700));
    setFailedAttempts(3);
    setIsLocked(true);
    setLockoutTimer(900);
    sessionStorage.setItem('ployweb_is_locked', 'true');
    sessionStorage.setItem('ployweb_lockout_seconds', '900');
    sessionStorage.setItem('ployweb_failed_attempts', '3');

    if (recordAuthTelemetryEvent) {
      recordAuthTelemetryEvent({
        username: 'david.webb',
        employeeId: 'EMP-041',
        ipAddress: simulatedIP,
        deviceName: simulatedDevice,
        attemptNumber: 3,
        isSuccess: false,
        isLockout: true,
        failureReason: 'Simulated rapid credential spray exceeding threshold'
      });
    }

    setSuccessBanner(null);
    setErrorMsg('CRITICAL SECURITY KNOCKOUT: 3 consecutive failed login attempts detected on WS-ENGINEERING-07. Account temporarily locked for 15 minutes to contain brute-force intrusion (MITRE T1110). Attack Graph updated with incident node.');
    setSimulatingLockout(false);
  };

  const handleQuickPersonaLogin = (key) => {
    loginDemoPersona(key, portalType);
    if (onLoginSuccess) onLoginSuccess();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient Grid Lines & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-xl bg-[#090e1a]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#0d1527] to-[#090e1a] border-b border-[#1b2a47] text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-neon-cyan mb-2.5">
            <div className="w-full h-full bg-[#070b14] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
            PLOY<span className="text-cyan-400">WEB</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-mono text-cyan-300 mt-1 uppercase tracking-widest">
            Autonomous Cyber Investigation & Threat Detection Platform
          </p>

          {/* Dual Portal Switcher Tabs */}
          <div className="mt-4 p-1 rounded-xl bg-black/60 border border-white/10 flex items-center gap-1 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setPortalType('admin');
                setErrorMsg(null);
                setMfaChallenge(null);
                setUsername('avance.soc');
                setPassword('PloyWeb@2026!');
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'admin'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Master Admin / SOC</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType('employee');
                setErrorMsg(null);
                setMfaChallenge(null);
                setUsername('EMP-041');
                setPassword('Employee@2026!');
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'employee'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType('customer');
                setErrorMsg(null);
                setMfaChallenge(null);
                setUsername('CUST-8841');
                setPassword('Customer@2026!');
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'customer'
                  ? 'bg-blue-950 text-blue-300 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* AI-Assisted Risk-Based Access Decision Panel (Core Demo Showcase) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#0c1424] to-[#070b14] border border-cyan-500/30 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI-Assisted Access Risk Decision
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                currentRisk.riskLevel === 'HIGH'
                  ? 'bg-red-950 text-red-300 border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                  : currentRisk.riskLevel === 'MEDIUM'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              }`}>
                {currentRisk.riskLevel} RISK • {currentRisk.score}/100 PTS
              </span>
            </div>

            {/* Dynamic AI Risk Score Gauge */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentRisk.riskLevel === 'HIGH'
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : currentRisk.riskLevel === 'MEDIUM'
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${currentRisk.score}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-sans">
                <span className={currentRisk.riskLevel === 'LOW' ? 'text-emerald-400 font-bold' : ''}>
                  0 - 34: Low (Allow Direct Login)
                </span>
                <span className={currentRisk.riskLevel === 'MEDIUM' ? 'text-amber-400 font-bold' : ''}>
                  35 - 64: Medium (Require Step-Up MFA)
                </span>
                <span className={currentRisk.riskLevel === 'HIGH' ? 'text-red-400 font-bold' : ''}>
                  65 - 100: High (Restrict Access & Alert Admin)
                </span>
              </div>
            </div>

            {/* 3 Interactive Quick-Scenario Buttons */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Select Test Risk Scenario:</span>
                <button
                  type="button"
                  onClick={() => setShowSignalCustomizer(!showSignalCustomizer)}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-0.5 underline font-normal"
                >
                  <span>{showSignalCustomizer ? 'Hide Signal Weights' : 'Inspect Signal Weights'}</span>
                  {showSignalCustomizer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyScenario('low')}
                  className={`py-2 px-2 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    riskScenario === 'low'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🟢 Low Risk</span>
                  <span className="text-[9px] font-normal opacity-80 mt-0.5">Allow Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyScenario('medium')}
                  className={`py-2 px-2 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    riskScenario === 'medium'
                      ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🟡 Medium Risk</span>
                  <span className="text-[9px] font-normal opacity-80 mt-0.5">Requires MFA</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyScenario('high')}
                  className={`py-2 px-2 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center text-center ${
                    riskScenario === 'high'
                      ? 'bg-red-950 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-red-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🔴 High Risk</span>
                  <span className="text-[9px] font-normal opacity-80 mt-0.5">Restrict & Alert</span>
                </button>
              </div>
            </div>

            {/* Expandable Signal Breakdown & Checkbox Controls */}
            {showSignalCustomizer && (
              <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-2 text-[10px] animate-fadeIn">
                <div className="flex items-center justify-between text-slate-400 font-bold uppercase pb-1 border-b border-white/5">
                  <span>Behavioral Telemetry Signals:</span>
                  <span>Contribution</span>
                </div>

                <div className="space-y-1.5 font-sans">
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={!simulatedIP.startsWith('10.0.2.') || isMaliciousIP}
                        onChange={(e) => {
                          setRiskScenario('custom');
                          if (e.target.checked) {
                            setSimulatedIP('198.51.100.44');
                          } else {
                            setSimulatedIP('10.0.2.14');
                            setIsMaliciousIP(false);
                          }
                        }}
                        className="rounded accent-cyan-500"
                      />
                      <span>New / Untrusted IP Address ({simulatedIP})</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">{isMaliciousIP ? '+40' : '+30'} pts</span>
                  </label>

                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isUnregisteredDevice || !simulatedDevice.includes('WS-ENGINEERING')}
                        onChange={(e) => {
                          setRiskScenario('custom');
                          setIsUnregisteredDevice(e.target.checked);
                          setSimulatedDevice(e.target.checked ? 'UNKNOWN-MAC-X1' : 'WS-ENGINEERING-07');
                        }}
                        className="rounded accent-cyan-500"
                      />
                      <span>New / Unregistered Device ({simulatedDevice})</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">+25 pts</span>
                  </label>

                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isOddHour}
                        onChange={(e) => {
                          setRiskScenario('custom');
                          setIsOddHour(e.target.checked);
                        }}
                        className="rounded accent-cyan-500"
                      />
                      <span>Odd / Off-Hours Login Window (00:00 - 05:30 UTC)</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">+20 pts</span>
                  </label>

                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={failedAttempts > 0}
                        onChange={(e) => {
                          setRiskScenario('custom');
                          setFailedAttempts(e.target.checked ? 1 : 0);
                        }}
                        className="rounded accent-cyan-500"
                      />
                      <span>Prior Failed Authentication History ({failedAttempts} failure{failedAttempts === 1 ? '' : 's'})</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">{failedAttempts >= 2 ? '+25' : '+15'} pts</span>
                  </label>
                </div>

                <div className="flex justify-between text-slate-400 pt-1.5 border-t border-white/5 font-mono">
                  <span className="font-bold">Calculated Action:</span>
                  <span className={`font-bold ${
                    currentRisk.riskLevel === 'HIGH'
                      ? 'text-red-400'
                      : currentRisk.riskLevel === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }`}>
                    {currentRisk.actionRequired === 'ALLOW_DIRECT'
                      ? '✓ Allow Direct Session'
                      : currentRisk.actionRequired === 'REQUIRE_MFA'
                        ? '⚡ Challenge via Step-Up MFA'
                        : '⛔ Restrict Access & Alert SOC Admin'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive 3-Attempt Counter Status Bar */}
          <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 ${failedAttempts > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="text-slate-300 font-bold uppercase tracking-wider">
                  Consecutive Attempts Counter:
                </span>
              </div>
              <span className={`text-[11px] font-bold ${
                isLocked
                  ? 'text-red-400 animate-pulse'
                  : failedAttempts === 2
                    ? 'text-amber-400'
                    : failedAttempts === 1
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
              }`}>
                {isLocked ? 'ACCOUNT KNOCKED OUT' : `${3 - failedAttempts} of 3 Tries Remaining`}
              </span>
            </div>

            {/* 3 Step Visual Indicators */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => {
                const isFailed = failedAttempts >= step;
                const isCurrent = failedAttempts + 1 === step && !isLocked;
                return (
                  <div
                    key={step}
                    className={`py-1.5 px-2 rounded-lg text-center font-mono text-[10px] font-bold transition-all border ${
                      isFailed
                        ? 'bg-red-950/80 text-red-300 border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse'
                        : isCurrent
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 ring-1 ring-cyan-500/30'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{isFailed ? '✖' : isCurrent ? '●' : '○'}</span>
                      <span>Try {step}</span>
                    </div>
                    <span className="text-[9px] block font-normal opacity-80 mt-0.5">
                      {isFailed ? 'FAILED' : isCurrent ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Banner */}
          {successBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Status Notice:</span>
                <span className="text-[11px] leading-relaxed">{successBanner}</span>
              </div>
            </div>
          )}

          {/* Error / Lockout Alert Banner */}
          {errorMsg && (
            <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 animate-fadeIn ${
              isLocked
                ? 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
            }`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLocked ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
              <div className="space-y-1">
                <span className="font-bold block">
                  {isLocked ? 'DEFENSIVE KNOCKOUT ACTIVE (MITRE T1110):' : 'Authentication Notice:'}
                </span>
                <span className="text-[11px] leading-relaxed block">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Temporary Knockout Active Screen */}
          {isLocked && (
            <div className="p-4 rounded-xl bg-gradient-to-b from-red-950/60 to-black border-2 border-red-500/80 space-y-3 font-mono animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs uppercase">
                  <Clock className="w-4 h-4 text-red-400 animate-spin" />
                  <span>15-Minute Defensive Cooldown:</span>
                </div>
                <span className="text-xl font-black text-red-400 tracking-widest font-mono">
                  {formatTimer(lockoutTimer)}
                </span>
              </div>

              <div className="p-2.5 rounded bg-black/60 border border-red-500/30 text-[10px] text-slate-300 space-y-1">
                <div className="text-red-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Autonomous Defensive Hold Executed</span>
                </div>
                <div>• Source IP <strong>{simulatedIP}</strong> flagged for high-velocity credential guessing.</div>
                <div>• Injected high-severity event into SOC Event Ledger & Evidence Hashes.</div>
                <div>• Updated NetworkX Attack Graph with containment state.</div>
              </div>

              {/* Emergency Unlock for Judges */}
              <button
                type="button"
                onClick={handleEmergencyUnlock}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Emergency SOC Unlock (Judge Demo Reset)</span>
              </button>
            </div>
          )}

          {/* MFA Challenge Screen (Medium Risk Tier) */}
          {mfaChallenge ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-3 font-mono animate-fadeIn">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-bold text-amber-200 uppercase">
                  Step-Up Multi-Factor Authentication Required
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {mfaChallenge.message || 'Elevated risk signals detected. Please complete 6-digit MFA challenge to authorize session.'}
              </p>

              {/* Risk Signals Triggering MFA */}
              <div className="p-2.5 rounded bg-black/50 border border-white/5 space-y-1 text-[10px]">
                <span className="text-slate-400 font-bold block uppercase">
                  Signals Evaluated (Score: {mfaChallenge.risk_score} pts):
                </span>
                {(mfaChallenge.risk_signals || []).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-amber-300">
                    <span>• {s.signal}</span>
                    <span>+{s.weight} pts</span>
                  </div>
                ))}
              </div>

              {/* Simulated Demo OTP Box */}
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-300 block">SIMULATED ONE-TIME PASSWORD:</span>
                  <span className="text-base font-extrabold text-white tracking-widest">{mfaChallenge.simulated_otp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaCode(mfaChallenge.simulated_otp)}
                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] transition-colors"
                >
                  Auto-Fill OTP
                </button>
              </div>

              <form onSubmit={handleVerifyMFA} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Enter 6-Digit OTP:</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-[#070b14] border border-amber-500/50 rounded-xl px-3 py-2 text-center text-lg font-bold tracking-widest text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMfaChallenge(null)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAuthenticating ? 'VERIFYING MFA...' : 'VERIFY MFA & COMPLETE LOGIN'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Normal Login Form & Quick Selectors */
            <>
              {/* Quick Persona Selector for Hackathon Judges */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-2">
                  {portalType === 'admin'
                    ? 'Select SOC Operator Persona'
                    : portalType === 'customer'
                    ? 'Select Customer Persona (Identity & Privacy Shield)'
                    : 'Select Employee Persona (NovaTech Solutions)'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {portalType === 'admin'
                    ? Object.entries(DEMO_ADMINS).slice(0, 2).map(([k, u]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickPersonaLogin(k)}
                          className="p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-[#0d1527]/70 hover:bg-[#101b33] text-left transition-all font-mono"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              {u.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{u.role_label}</div>
                        </button>
                      ))
                    : portalType === 'customer'
                    ? Object.entries(DEMO_CUSTOMERS).map(([k, u]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickPersonaLogin(k)}
                          className="p-3 rounded-xl border border-slate-800 hover:border-blue-500/50 bg-[#0d1527]/70 hover:bg-[#101b33] text-left transition-all font-mono"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                              {u.employee_id}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{u.role_label}</div>
                        </button>
                      ))
                    : Object.entries(DEMO_EMPLOYEES).map(([k, u]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickPersonaLogin(k)}
                          className="p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-[#0d1527]/70 hover:bg-[#101b33] text-left transition-all font-mono"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              {u.employee_id}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{u.department} • {u.role_label}</div>
                        </button>
                      ))}
                </div>
              </div>

              {/* Or Manual Credentials Login / Registration */}
              <div className="pt-2 border-t border-slate-800">
                {(portalType === 'employee' || portalType === 'customer') && (
                  <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono mb-3">
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(false); setErrorMsg(null); }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        !isRegistering ? (portalType === 'customer' ? 'bg-blue-600 text-white shadow' : 'bg-emerald-500 text-black shadow') : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {portalType === 'customer' ? 'Customer Sign In' : 'Employee Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(true); setErrorMsg(null); }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        isRegistering ? (portalType === 'customer' ? 'bg-blue-600 text-white shadow' : 'bg-emerald-500 text-black shadow') : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Register New {portalType === 'customer' ? 'Customer' : 'Account'}
                    </button>
                  </div>
                )}

                {isRegistering && (portalType === 'employee' || portalType === 'customer') ? (
                  /* Employee Registration Form */
                  <form onSubmit={handleRegister} className="space-y-3 font-mono text-xs animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Full Legal Name:</label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={e => setRegFullName(e.target.value)}
                          placeholder="e.g. Jane Foster"
                          className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Employee ID:</label>
                        <input
                          type="text"
                          required
                          value={regEmpId}
                          onChange={e => setRegEmpId(e.target.value)}
                          placeholder="e.g. EMP-109"
                          className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Corporate Department:</label>
                        <select
                          value={regDept}
                          onChange={e => setRegDept(e.target.value)}
                          className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Operations">Operations</option>
                          <option value="Finance">Finance & Accounting</option>
                          <option value="Security">InfoSec & IT</option>
                          <option value="Legal">Legal & Compliance</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Corporate Username:</label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder="e.g. jane.foster"
                          className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Create Password (PBKDF2 Hashed):</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Choose a strong password (min 8 chars)"
                        className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-3 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-2"
                    >
                      <User className="w-4 h-4" />
                      <span>{isAuthenticating ? 'REGISTERING...' : 'REGISTER EMPLOYEE ACCOUNT'}</span>
                    </button>
                  </form>
                ) : (
                  /* Standard Login Form with Real Hashing & Risk-Based Access */
                  <form onSubmit={handleManualLogin} className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-400">
                          {portalType === 'admin' ? 'Operator Username / Admin ID:' : 'Employee ID or Corporate Username:'}
                        </label>
                        <span className="text-[10px] text-slate-500">e.g. {portalType === 'admin' ? 'avance.soc' : 'EMP-041 or david.webb'}</span>
                      </div>
                      <input
                        type="text"
                        required
                        disabled={isLocked}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder={portalType === 'admin' ? 'avance.soc / EMP-001' : 'EMP-041 or david.webb'}
                        className={`w-full bg-[#070b14] border rounded-xl px-3 py-2 text-white focus:outline-none ${
                          isLocked
                            ? 'border-red-500/50 opacity-50 cursor-not-allowed'
                            : portalType === 'admin'
                              ? 'border-slate-800 focus:border-cyan-500'
                              : 'border-slate-800 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-400">Account Password:</label>
                        <span className="text-[10px] text-slate-500">Protected via PBKDF2 / SHA-256</span>
                      </div>
                      <input
                        type="password"
                        required
                        disabled={isLocked}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className={`w-full bg-[#070b14] border rounded-xl px-3 py-2 text-white focus:outline-none ${
                          isLocked
                            ? 'border-red-500/50 opacity-50 cursor-not-allowed'
                            : portalType === 'admin'
                              ? 'border-slate-800 focus:border-cyan-500'
                              : 'border-slate-800 focus:border-emerald-500'
                        }`}
                      />

                      {/* Visible SHA-256 Hash Digest Preview */}
                      <div className="mt-1.5 p-2 rounded-lg bg-black/50 border border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Lock className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="text-slate-500 flex-shrink-0">SHA-256 Digest:</span>
                          <span className="text-cyan-300 font-mono truncate">
                            {passwordHash ? passwordHash.slice(0, 24) + '...' + passwordHash.slice(-8) : 'Type password to compute hash'}
                          </span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                          PBKDF2-Ready
                        </span>
                      </div>
                    </div>

                    {/* Quick Judge Demo Test Buttons */}
                    <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                        Judge Quick-Fill Shortcuts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (portalType === 'admin') {
                              setUsername('avance.soc');
                              setPassword('PloyWeb@2026!');
                            } else if (portalType === 'customer') {
                              setUsername('CUST-8841');
                              setPassword('Customer@2026!');
                            } else {
                              setUsername('EMP-041');
                              setPassword('Employee@2026!');
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono transition-colors"
                        >
                          ✓ Fill Valid {portalType === 'admin' ? 'Admin' : portalType === 'customer' ? 'Customer' : 'Employee'} Credentials
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPassword('WrongPassword#999');
                          }}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[10px] font-mono transition-colors"
                        >
                          ✖ Fill Incorrect Password (Test Try)
                        </button>

                        <button
                          type="button"
                          disabled={simulatingLockout || isLocked}
                          onClick={handleSimulateKnockoutDemo}
                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white text-[10px] font-bold font-mono transition-all flex items-center gap-1 shadow"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Simulate 3-Try Knockout</span>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isAuthenticating || isLocked}
                      className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : currentRisk.riskLevel === 'HIGH'
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-red-500/20'
                            : currentRisk.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                              : portalType === 'admin'
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      }`}
                    >
                      <span>
                        {isAuthenticating
                          ? 'EVALUATING RISK TELEMETRY...'
                          : isLocked
                            ? `ACCOUNT KNOCKED OUT (${formatTimer(lockoutTimer)})`
                            : currentRisk.riskLevel === 'HIGH'
                              ? `SUBMIT AUTHENTICATION (HIGH RISK: ${currentRisk.score}/100)`
                              : currentRisk.riskLevel === 'MEDIUM'
                                ? `SUBMIT AUTHENTICATION (REQUIRES MFA: ${currentRisk.score}/100)`
                                : `LOG IN DIRECTLY (${currentRisk.score}/100 - LOW RISK)`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
