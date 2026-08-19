import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AppNotification } from "../hooks/useLiveNotifications";

// Adjust these to match your actual route config if different.
const ROUTE_ADMIN_APPROVALS = "/admin/approvals";
const ROUTE_ADMIN_NEWSLETTER_HUB = "/admin/newsletterhub";
const ROUTE_USER_CONTRIBUTION = "/home/contribution";
const ROUTE_USER_NEWSLETTER = "/home/newsletter";

function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function resolveRoute(n: AppNotification, role?: string): string | null {
    switch (n.type) {
        case "newsletter_submitted":
            return role === "admin" ? ROUTE_ADMIN_APPROVALS : null;
        case "newsletter_approved":
        case "newsletter_rejected":
            return role === "user" ? ROUTE_USER_CONTRIBUTION : null;
        case "newsletter_published":
            return role === "admin" ? ROUTE_ADMIN_NEWSLETTER_HUB : ROUTE_USER_NEWSLETTER;
        default:
            return null;
    }
}

export function NotificationBell() {
    const {
        unreadCount,
        notifications,
        loadingList,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        user,
    } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next) fetchNotifications();
    };

    const handleNotificationClick = (n: AppNotification) => {
        if (!n.isRead) markAsRead(n.id);
        setOpen(false);

        const path = resolveRoute(n, user?.role);
        if (!path) return;

        navigate(path, { state: { highlightId: n.entityId } });
    };

    const sortedNotifications = [...notifications].sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleToggle}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)] transition-colors cursor-pointer"
                aria-label="Notifications"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-3.5 py-3 border-b border-[var(--border)]">
                        <p className="text-xs font-semibold text-[var(--text)]">Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[11px] font-semibold text-[#B98B4E] hover:underline cursor-pointer"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loadingList ? (
                            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                                Loading...
                            </div>
                        ) : sortedNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                                No notifications yet
                            </div>
                        ) : (
                            sortedNotifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left px-3.5 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors cursor-pointer ${
                                        !n.isRead ? "bg-[#B98B4E]/5" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {!n.isRead && (
                                            <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#B98B4E] shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-[var(--text)] truncate">
                                                {n.title}
                                            </p>
                                            {n.message && (
                                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                                    {n.message}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                                {timeAgo(n.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}