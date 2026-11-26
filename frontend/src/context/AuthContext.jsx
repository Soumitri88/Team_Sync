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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ployweb_user");
    return saved ? JSON.parse(saved) : DEMO_ADMINS.commander;
  });

  const [activePortal, setActivePortal] = useState(() => {
    const savedPortal = localStorage.getItem("ployweb_active_portal");
    if (savedPortal) return savedPortal;
    const saved = localStorage.getItem("ployweb_user");
    if (saved) {
      const u = JSON.parse(saved);
      return u.role === "employee" ? "employee" : "admin";
    }
    return "admin";
  });

  const [token, setToken] = useState(() => localStorage.getItem("ployweb_token") || null);

  const loginWithCredentials = async (username, password, ipAddress = "10.0.2.14", deviceName = "WS-ENGINEERING-07") => {
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
        localStorage.setItem("ployweb_user", JSON.stringify(data.user));
        localStorage.setItem("ployweb_token", data.token);
        localStorage.setItem("ployweb_active_portal", portal);
        return { success: true, user: data.user, portal };
      }
      return data;
    } catch (err) {
      // Offline fallback
      return { success: false, error: "Backend offline. Use persona selection." };
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
        localStorage.setItem("ployweb_user", JSON.stringify(data.user));
        localStorage.setItem("ployweb_token", data.token);
        localStorage.setItem("ployweb_active_portal", portal);
        return { success: true, user: data.user, portal };
      }
      return data;
    } catch (err) {
      return { success: false, error: "Network error during MFA verification." };
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
