import { useCallback, useEffect, useRef, useState } from "react";
import api from "../utils/api";

export interface AppNotification {
    id: number;
    userId: string;
    type: string;
    title: string;
    message: string | null;
    entityType: string | null;
    entityId: string | null;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

// EventSource needs an absolute URL — it doesn't go through axios's baseURL.
const API_ORIGIN = (api.defaults.baseURL ?? "").replace(/\/api\/?$/, "");

export function useLiveNotifications(isAuthenticated: boolean) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loadingList, setLoadingList] = useState(false);

    const esRef = useRef<EventSource | null>(null);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get("/notifications/unread-count");
            setUnreadCount(data.count ?? 0);
        } catch {
            // ignore — SSE pushes will still keep it roughly accurate
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoadingList(true);
        try {
            const { data } = await api.get("/notifications", { params: { limit: 20 } });
            setNotifications(data.notifications ?? []);
        } catch {
            // ignore
        } finally {
            setLoadingList(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: number) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch {
            // ignore
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await api.patch("/notifications/read-all");
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            esRef.current?.close();
            esRef.current = null;
            return;
        }

        fetchUnreadCount();

        const es = new EventSource(`${API_ORIGIN}/api/notifications/stream`, {
            withCredentials: true,
        });
        esRef.current = es;

        es.addEventListener("notification", (e: MessageEvent) => {
            setUnreadCount((prev) => prev + 1);
            try {
                const payload = JSON.parse(e.data);
                setNotifications((prev) => [payload, ...prev].slice(0, 20));
            } catch {
                // ignore malformed payloads
            }
        });

        es.onerror = () => {
            // EventSource auto-reconnects on its own.
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [isAuthenticated, fetchUnreadCount]);

    return {
        unreadCount,
        notifications,
        loadingList,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}