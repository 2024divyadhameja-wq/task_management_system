import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser, getCurrentUser } from "../services/api";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore and verify session when the app loads
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem("taskFlowToken");
      if (!token) {
        if (active) setAuthLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        if (active) {
          setUser(data.user);
        }
      } catch (err) {
        localStorage.removeItem("taskFlowToken");
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const data = await loginUser({ email, password });
    localStorage.setItem("taskFlowToken", data.token);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password, adminSecret) {
    const data = await registerUser({ name, email, password, adminSecret });
    localStorage.setItem("taskFlowToken", data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("taskFlowToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
