import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [privileges, setPrivileges] = useState([]);

  // Load privileges from localStorage on mount
  useEffect(() => {
    const storedPrivileges = localStorage.getItem("privileges");
    if (storedPrivileges) {
      setPrivileges(JSON.parse(storedPrivileges));
    }
  }, []);

  // Check if a user has a specific privilege
  const hasPrivilege = (priv) => privileges.includes(priv);

  return (
    <AuthContext.Provider value={{ privileges, hasPrivilege, setPrivileges }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);