import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ───────── LOAD USER ON REFRESH ─────────
  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    if (savedUser) {

      const parsedUser = JSON.parse(savedUser);

      let savedToken = null;

      // ROLE BASED TOKEN
      if (parsedUser.role === "student") {
        savedToken = localStorage.getItem("studentToken");
      }

      else if (parsedUser.role === "driver") {
        savedToken = localStorage.getItem("driverToken");
      }

      else if (parsedUser.role === "admin") {
        savedToken = localStorage.getItem("adminToken");
      }

      if (savedToken) {
        setUser(parsedUser);
        setToken(savedToken);
      }
    }

    setLoading(false);

  }, []);

  // ───────── LOGIN FUNCTION ─────────
  const login = (token, userData) => {

    // SAVE ROLE BASED TOKEN
    if (userData.role === "student") {
      localStorage.setItem("studentToken", token);
    }

    else if (userData.role === "driver") {
      localStorage.setItem("driverToken", token);
    }

    else if (userData.role === "admin") {
      localStorage.setItem("adminToken", token);
    }

    // SAVE USER
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);
  };

  // ───────── LOGOUT FUNCTION ─────────
  const logout = () => {

    // REMOVE ALL TOKENS
    localStorage.removeItem("studentToken");
    localStorage.removeItem("driverToken");
    localStorage.removeItem("adminToken");

    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;