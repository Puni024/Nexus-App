import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import api, { setLogoutHandler } from "../utils/api";

import type { AuthContextType, User, Theme, Toast, ToastType } from "../Types/Filtes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let toastIdCounter = 0;

const VALID_THEMES: Theme[] = ["light", "dark"];

// backend may send theme as undefined/null/garbage - always fall back to "light"
function normalizeTheme(value: unknown): Theme {
  return VALID_THEMES.includes(value as Theme) ? (value as Theme) : "light";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // ---------------- AUTH ----------------

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // ---------------- THEME (read from user.info, applied on load/reload) ----------------

  const theme: Theme = user?.info.Theme ?? "light";

  

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // ---------------- TOAST ----------------

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // ---------------- VERIFY (runs on mount / reload) ----------------

  const verify = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/verify");

      setUser(
        data.user
          ? {
              ...data.user,
              info: {
                Theme: normalizeTheme(data.user.info?.Theme),
                picture: data.user.info?.picture ?? "",
              },
            }
          : null
      );
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

  const login = async () => {
    await verify();
  };

  // ---------------- CLEAR AUTH ----------------

  const clearAuth = useCallback(() => {
    setUser(null);
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

  // ---------------- HEARTBEAT (keeps lastActiveAt fresh while logged in) ----------------

  useEffect(() => {
    if (!isAuthenticated) return;

    const ping = () => api.patch("/auth/heartbeat").catch(() => {});
    ping(); // send immediately when user becomes authenticated

    const interval = setInterval(ping, 2 * 60 * 1000); // every 2 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ---------------- LOCAL SYNC (no API call, other components call their own APIs then patch here) ----------------

  const updateUser: AuthContextType["updateUser"] = useCallback((patch) => {
    setUser((u:any) => {
      if (!u) return u;

      const { info: infoPatch, ...rest } = patch;

      return {
        ...u,
        ...rest,
        info: infoPatch
          ? {
              Theme: infoPatch.Theme !== undefined ? normalizeTheme(infoPatch.Theme) : u.info.Theme,
              picture: infoPatch.picture !== undefined ? infoPatch.picture : u.info.picture,
            }
          : u.info,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        theme,
        login,
        logout,
        updateUser,
        toasts,
        showToast,
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