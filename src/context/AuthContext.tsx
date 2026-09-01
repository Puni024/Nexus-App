import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

import api, { setLogoutHandler } from "../utils/api";
import { useLiveNotifications } from "../hooks/useLiveNotifications";

import type { AuthContextType, User, Theme, Toast, ToastType } from "../Types/Filtes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let toastIdCounter = 0;

const VALID_THEMES: Theme[] = ["light", "dark"];

function normalizeTheme(value: unknown): Theme {
  return VALID_THEMES.includes(value as Theme) ? (value as Theme) : "light";
}
const TOKEN_REFRESH_INTERVAL_MS = 12 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const theme: Theme = user?.info.Theme ?? "light";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

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
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  const login = async () => {
    await verify();
  };

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    setLogoutHandler(clearAuth);
  }, [clearAuth]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuth();
    }
  };


  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
      return;
    }

    refreshTimerRef.current = setInterval(() => {
      api.post("/auth/refresh").catch(() => {
        // Swallowed on purpose — if the refresh token itself is dead, the
        // next real API call will 401 and the interceptor's logoutHandler
        // will fire. No need to duplicate that logic here.
      });
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    };
  }, [isAuthenticated]);

  const {
    unreadCount,
    notifications,
    loadingList,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useLiveNotifications(isAuthenticated);

  const updateUser: AuthContextType["updateUser"] = useCallback((patch) => {
    setUser((u: any) => {
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
        unreadCount,
        notifications,
        loadingList,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
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