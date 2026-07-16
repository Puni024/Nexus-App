import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import api, { setLogoutHandler } from "../common/api";

import type { AuthContextType, User, Theme } from "../Types/Filtes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // ---------------- AUTH ----------------

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ---------------- THEME ----------------

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // ---------------- VERIFY ----------------

  const verify = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/verify");
      setIsAuthenticated(!!data.user);

    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  // ---------------- LOGIN ----------------

  const login = () => {
    setIsAuthenticated(true);
  };

  // ---------------- FORCE LOGOUT ----------------

  const clearAuth = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);


    console.log("aaaa",window.location.pathname);
    

    if (window.location.pathname !== "/") {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    setLogoutHandler(clearAuth);
  }, [clearAuth]);

  // ---------------- LOGOUT ----------------

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        theme,
        toggleTheme,
        login,
        logout,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}