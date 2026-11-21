import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_USERS = {
  commander: {
    id: "usr-01",
    name: "Alex Vance",
    username: "avance.soc",
    role: "SOC Incident Commander",
    badge: "DEFCON-ALPHA",
    avatar: "AV"
  },
  forensics: {
    id: "usr-02",
    name: "Dr. Elena Rostova",
    username: "erostova.forensics",
    role: "Lead Cyber Forensics Investigator",
    badge: "EVIDENCE-SEAL",
    avatar: "ER"
  },
  analyst: {
    id: "usr-03",
    name: "Marcus Miller",
    username: "mmiller.analyst",
    role: "Tier-2 Security Analyst",
    badge: "SOC-OPERATOR",
    avatar: "MM"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ployweb_user");
    return saved ? JSON.parse(saved) : DEMO_USERS.commander;
  });

  const login = (roleKey = "commander", customName = null) => {
    const selected = DEMO_USERS[roleKey] || {
      id: "usr-custom",
      name: customName || "Security Operator",
      username: (customName || "operator").toLowerCase().replace(/\s+/g, ".") + "@ployweb.io",
      role: "Cyber Operations Analyst",
      badge: "SOC-OPERATOR",
      avatar: (customName || "SO").slice(0, 2).toUpperCase()
    };
    setUser(selected);
    localStorage.setItem("ployweb_user", JSON.stringify(selected));
    return selected;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ployweb_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, DEMO_USERS, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
