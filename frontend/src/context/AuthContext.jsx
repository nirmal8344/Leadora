import { createContext, useContext, useEffect, useState } from "react";
import apiClient, { clearAuthToken, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const saved =
      sessionStorage.getItem("leadora_token") ||
      localStorage.getItem("leadora_token");
    if (saved) {
      setAuthToken(saved);
    }
    return saved;
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!token);
  const [error, setError] = useState(null);

  const handleLocalLogout = () => {
    clearAuthToken();
    sessionStorage.removeItem("leadora_token");
    localStorage.removeItem("leadora_token");
    setTokenState(null);
    setUser(null);
    setError(null);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    apiClient
      .get("/api/v1/auth/me")
      .then((res) => {
        if (res?.data) {
          setUser(res.data);
        }
      })
      .catch(() => {
        handleLocalLogout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password, rememberMe = false) => {
    setError(null);
    try {
      const res = await apiClient.post("/api/v1/auth/login", { email, password });
      const authData = res?.data;

      if (!authData?.token || !authData?.user) {
        throw new Error("Invalid authentication response received from server.");
      }

      const receivedToken = authData.token;
      const receivedUser = authData.user;

      setAuthToken(receivedToken);
      setTokenState(receivedToken);
      setUser(receivedUser);

      if (rememberMe) {
        localStorage.setItem("leadora_token", receivedToken);
      } else {
        sessionStorage.setItem("leadora_token", receivedToken);
      }

      return { success: true, user: receivedUser };
    } catch (err) {
      const message =
        err?.data?.message || err?.message || "Invalid work email or password";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch {
      // Ignore network errors during logout
    } finally {
      handleLocalLogout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
