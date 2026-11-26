import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_ADMINS = {
  commander: {
    id: "usr-01",
    name: "Alex Vance",
    username: "avance.soc",
    role: "admin",
    role_label: "SOC Incident Commander",
    badge: "DEFCON-ALPHA",
    avatar: "AV",
    portal: "admin"
  },
  forensics: {
    id: "usr-02",
    name: "Dr. Elena Rostova",
    username: "erostova.forensics",
    role: "forensic_investigator",
    role_label: "Lead Cyber Forensics Investigator",
    badge: "EVIDENCE-SEAL",
    avatar: "ER",
    portal: "admin"
  },
  analyst: {
    id: "usr-03",
    name: "Marcus Miller",
    username: "mmiller.analyst",
    role: "soc_analyst",
    role_label: "Tier-2 Security Analyst",
    badge: "SOC-OPERATOR",
    avatar: "MM",
    portal: "admin"
  }
};

export const DEMO_EMPLOYEES = {
  david: {
    id: "usr-david",
    name: "David Webb",
    username: "david.webb",
    employee_id: "EMP-041",
    department: "Engineering",
    role: "employee",
    role_label: "Senior Systems Architect",
    badge: "EMP-RESTRICTED",
    avatar: "DW",
    portal: "employee"
  },
  sarah: {
    id: "usr-sarah",
    name: "Sarah Connor",
    username: "sarah.connor",
    employee_id: "EMP-088",
    department: "Operations",
    role: "employee",
    role_label: "Infrastructure Specialist",
    badge: "EMP-NOMINAL",
    avatar: "SC",
    portal: "employee"
  }
};

/**
 * AI-Assisted Risk-Based Access Decision Engine:
 * Scores authentication attempts from behavioral telemetry signals:
 *   - New / Untrusted IP Address (+30 or +40 for Malicious Proxy)
 *   - Unregistered / Unknown Device (+25)
 *   - Unusual / Off-Hours Window (+20)
 *   - Prior Failed Attempts Velocity (+15 or +25)
 *
 * Classifies risk into 3 tiers:
 *   - LOW (< 35): Direct Login Allowed
 *   - MEDIUM (35 - 64): Step-Up MFA Required (Simulated OTP)
 *   - HIGH (>= 65): Access Restricted & SOC Admin Alerted
 */
export function evaluateLoginRisk({
  ipAddress = "10.0.2.14",
  deviceName = "WS-ENGINEERING-07",
  isOddHour = false,
  failedAttempts = 0,
  isMaliciousIP = false,
  isUnregisteredDevice = false
}) {
  const signals = [];
  let score = 0;

  // Signal 1: New / External / Untrusted IP Address
  const isExternalIP = isMaliciousIP || (!ipAddress.startsWith("10.0.2.") && !ipAddress.startsWith("192.168.1."));
  if (isMaliciousIP) {
    score += 40;
    signals.push({
      signal: "Malicious Proxy / Tor Node Detected",
      weight: 40,
      description: `Source IP ${ipAddress} is cataloged as a known external adversary Tor proxy.`
    });
  } else if (isExternalIP) {
    score += 30;
    signals.push({
      signal: "New / Untrusted External IP Address",
      weight: 30,
      description: `Source IP ${ipAddress} has no prior historical affinity with user profile.`
    });
  }

  // Signal 2: New / Unregistered Device
  const isUnknownDevice = isUnregisteredDevice || (!deviceName.includes("WS-ENGINEERING") && !deviceName.includes("SRV-"));
  if (isUnknownDevice) {
    score += 25;
    signals.push({
      signal: "Unregistered / Unknown Device",
      weight: 25,
      description: `Device '${deviceName}' lacks corporate MDM cryptographic identity certificate.`
    });
  }

  // Signal 3: Odd / Off-Hours Access Window (00:00 - 05:30 UTC)
  if (isOddHour) {
    score += 20;
    signals.push({
      signal: "Unusual / Off-Hours Login Window",
      weight: 20,
      description: `Authentication initiated outside normal business hours (off-peak 00:00 - 05:30 UTC).`
    });
  }

  // Signal 4: Prior Failed Attempts Count
  if (failedAttempts >= 2) {
    score += 25;
    signals.push({
      signal: `Multiple Prior Failed Attempts (${failedAttempts} failures)`,
      weight: 25,
      description: `Account has accumulated consecutive failed authentication attempts.`
    });
  } else if (failedAttempts === 1) {
    score += 15;
    signals.push({
      signal: "Prior Failed Attempt (1 failure)",
      weight: 15,
      description: `Single prior authentication failure recorded within past 5 minutes.`
    });
  }

  // Default baseline score for clean internal login
  if (score === 0) {
    score = 10;
  }

  // Determine Tier and Action
  let riskLevel = "LOW";
  let actionRequired = "ALLOW_DIRECT";

  if (score >= 65) {
    riskLevel = "HIGH";
    actionRequired = "RESTRICT_AND_ALERT";
  } else if (score >= 35) {
    riskLevel = "MEDIUM";
    actionRequired = "REQUIRE_MFA";
  } else {
    riskLevel = "LOW";
    actionRequired = "ALLOW_DIRECT";
  }

  return {
    score: Math.min(100, score),
    riskLevel,
    actionRequired,
    signals
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Only resume active session if explicit in current browser session
    const isSessionActive = sessionStorage.getItem("ployweb_session_active");
    if (!isSessionActive) {
      // First visit / fresh tab: start on the login form!
      return null;
    }
    const saved = localStorage.getItem("ployweb_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activePortal, setActivePortal] = useState(() => {
    const savedPortal = localStorage.getItem("ployweb_active_portal");
    if (savedPortal) return savedPortal;
    const saved = localStorage.getItem("ployweb_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role === "employee" ? "employee" : "admin";
      } catch (e) {}
    }
    return "admin";
  });

  const [token, setToken] = useState(() => localStorage.getItem("ployweb_token") || null);
  const [pendingMfaUser, setPendingMfaUser] = useState(null);

  const loginWithCredentials = async (
    username,
    password,
    ipAddress = "198.51.100.44",
    deviceName = "WS-ENGINEERING-07",
    riskConfig = {}
  ) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          ip_address: ipAddress,
          device_name: deviceName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        const portal = data.user.role === "employee" ? "employee" : "admin";
        setActivePortal(portal);
        sessionStorage.setItem("ployweb_session_active", "true");
        localStorage.setItem("ployweb_user", JSON.stringify(data.user));
        localStorage.setItem("ployweb_token", data.token);
        localStorage.setItem("ployweb_active_portal", portal);
        return { success: true, user: data.user, portal };
      }
      return data;
    } catch (err) {
      // Client-side offline engine verification with AI-assisted risk scoring
      const cleanUser = (username || "").trim().toLowerCase();
      let matched = null;
      let matchedRole = "employee";

      // 1. Check Master Admins
      if (cleanUser === "avance.soc" || cleanUser === "alex vance" || cleanUser === "admin" || cleanUser === "emp-001") {
        matched = DEMO_ADMINS.commander;
        matchedRole = "admin";
      } else if (cleanUser === "erostova.forensics" || cleanUser === "elena" || cleanUser === "emp-002") {
        matched = DEMO_ADMINS.forensics;
        matchedRole = "admin";
      } else if (cleanUser === "mmiller.analyst" || cleanUser === "marcus" || cleanUser === "emp-003") {
        matched = DEMO_ADMINS.analyst;
        matchedRole = "admin";
      } else {
        // 2. Check Employees
        const foundEmp = Object.values(DEMO_EMPLOYEES).find(e =>
          (e.username && e.username.toLowerCase() === cleanUser) ||
          (e.employee_id && e.employee_id.toLowerCase() === cleanUser) ||
          (e.id && e.id.toLowerCase() === cleanUser)
        );
        if (foundEmp) {
          matched = foundEmp;
          matchedRole = "employee";
        }
      }

      // Check valid passwords
      const validPasswords = [
        "PloyWeb@2026!",
        "Employee@2026!",
        "password123",
        "admin",
        "socadmin"
      ];
      const isKnownValidPw = validPasswords.includes(password) || (matched && matched.password === password);

      if (matched && isKnownValidPw) {
        // Evaluate AI Risk Signals
        const riskResult = evaluateLoginRisk({
          ipAddress,
          deviceName,
          ...riskConfig
        });

        // HIGH RISK: Restrict access and alert SOC
        if (riskResult.riskLevel === "HIGH") {
          return {
            success: false,
            is_high_risk: true,
            risk_score: riskResult.score,
            risk_level: "HIGH",
            risk_signals: riskResult.signals,
            user: matched,
            error: `ACCESS RESTRICTED: AI Anomaly Detection Engine flagged this authentication as HIGH RISK (${riskResult.score}/100). Security Operations Center notified.`
          };
        }

        // MEDIUM RISK: Step-up MFA Challenge (Simulated OTP)
        if (riskResult.riskLevel === "MEDIUM") {
          const simulatedOtp = String(Math.floor(100000 + Math.random() * 900000));
          setPendingMfaUser({ user: matched, portal: matchedRole, otp: simulatedOtp });
          return {
            success: false,
            mfa_required: true,
            session_id: `SESS-MFA-${Date.now()}`,
            risk_score: riskResult.score,
            risk_level: "MEDIUM",
            risk_signals: riskResult.signals,
            simulated_otp: simulatedOtp,
            user: matched,
            message: `Elevated risk signals detected (Score: ${riskResult.score}/100). Step-Up MFA Challenge required.`
          };
        }

        // LOW RISK: Direct Access Allowed
        setUser(matched);
        setActivePortal(matchedRole);
        sessionStorage.setItem("ployweb_session_active", "true");
        localStorage.setItem("ployweb_user", JSON.stringify(matched));
        localStorage.setItem("ployweb_active_portal", matchedRole);
        return {
          success: true,
          user: matched,
          portal: matchedRole,
          risk_score: riskResult.score,
          risk_level: "LOW"
        };
      }

      return {
        success: false,
        error: "Invalid Employee ID / username or password.",
        code: "INVALID_CREDENTIALS"
      };
    }
  };

  const verifyMFA = async (sessionId, code) => {
    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        const portal = data.user.role === "employee" ? "employee" : "admin";
        setActivePortal(portal);
        sessionStorage.setItem("ployweb_session_active", "true");
        localStorage.setItem("ployweb_user", JSON.stringify(data.user));
        localStorage.setItem("ployweb_token", data.token);
        localStorage.setItem("ployweb_active_portal", portal);
        return { success: true, user: data.user, portal };
      }
      return data;
    } catch (err) {
      // Client-side offline MFA verification
      if (pendingMfaUser) {
        if (!code || (pendingMfaUser.otp && pendingMfaUser.otp !== code && code.length !== 6)) {
          return { success: false, error: "Invalid 6-digit verification code. Please enter the OTP displayed above." };
        }
        const userToLogin = pendingMfaUser.user;
        const portalToSet = pendingMfaUser.portal;
        setUser(userToLogin);
        setActivePortal(portalToSet);
        sessionStorage.setItem("ployweb_session_active", "true");
        localStorage.setItem("ployweb_user", JSON.stringify(userToLogin));
        localStorage.setItem("ployweb_active_portal", portalToSet);
        setPendingMfaUser(null);
        return { success: true, user: userToLogin, portal: portalToSet };
      }
      return { success: false, error: "MFA verification failed. Please try again." };
    }
  };

  const registerEmployee = async ({ username, password, full_name, employee_id, department, email }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          full_name,
          employee_id,
          department,
          email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: `Account for ${full_name} (${employee_id}) created successfully.` };
      }
      return { success: false, error: data.detail || data.error || "Registration failed." };
    } catch (e) {
      // Offline fallback: store in DEMO_EMPLOYEES
      const newKey = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      DEMO_EMPLOYEES[newKey] = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: full_name,
        username,
        employee_id,
        department,
        role: "employee",
        role_label: `${department} Specialist`,
        badge: "EMP-VERIFIED",
        avatar: full_name.slice(0, 2).toUpperCase(),
        portal: "employee"
      };
      return { success: true, message: `Account for ${full_name} (${employee_id}) created successfully (Offline mode).` };
    }
  };

  const loginDemoPersona = (personaKey, portalType = "admin") => {
    let selected = null;
    if (portalType === "employee") {
      selected = DEMO_EMPLOYEES[personaKey] || DEMO_EMPLOYEES.david;
      setActivePortal("employee");
      localStorage.setItem("ployweb_active_portal", "employee");
    } else {
      selected = DEMO_ADMINS[personaKey] || DEMO_ADMINS.commander;
      setActivePortal("admin");
      localStorage.setItem("ployweb_active_portal", "admin");
    }
    sessionStorage.setItem("ployweb_session_active", "true");
    setUser(selected);
    localStorage.setItem("ployweb_user", JSON.stringify(selected));
    return selected;
  };

  const switchPortal = (portalName) => {
    setActivePortal(portalName);
    localStorage.setItem("ployweb_active_portal", portalName);
    if (portalName === "employee" && user?.role === "admin") {
      // Switch active view to employee profile
      setUser(DEMO_EMPLOYEES.david);
      localStorage.setItem("ployweb_user", JSON.stringify(DEMO_EMPLOYEES.david));
    } else if (portalName === "admin" && user?.role === "employee") {
      setUser(DEMO_ADMINS.commander);
      localStorage.setItem("ployweb_user", JSON.stringify(DEMO_ADMINS.commander));
    }
  };

  const logout = () => {
    if (token) {
      fetch(`/api/auth/logout?session_token=${token}`, { method: "POST" }).catch(() => {});
    }
    sessionStorage.removeItem("ployweb_session_active");
    setUser(null);
    setToken(null);
    localStorage.removeItem("ployweb_user");
    localStorage.removeItem("ployweb_token");
    localStorage.removeItem("ployweb_active_portal");
  };

  const isAdmin = user?.role === "admin" || user?.role === "forensic_investigator" || user?.role === "soc_analyst";
  const isEmployee = user?.role === "employee";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activePortal,
        isAdmin,
        isEmployee,
        loginWithCredentials,
        verifyMFA,
        registerEmployee,
        loginDemoPersona,
        switchPortal,
        logout,
        DEMO_ADMINS,
        DEMO_EMPLOYEES,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
