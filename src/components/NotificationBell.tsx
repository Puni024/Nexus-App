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

    const unreadNotifications = notifications
        .filter((notification) => !notification.isRead)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

    const readNotifications = notifications
        .filter((notification) => notification.isRead)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleToggle}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)] transition-colors cursor-pointer"
                aria-label="Notifications"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">

                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[var(--text)]">
                                Notifications
                            </p>

                            {unreadCount > 0 && (
                                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#B98B4E] text-white text-[9px] font-bold flex items-center justify-center">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[11px] font-semibold text-[#B98B4E] hover:underline cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[250px] overflow-y-auto">

                        {loadingList ? (
                            <div className="px-4 py-10 text-center text-xs text-[var(--text-muted)]">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--bg)] flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-[var(--text-muted)]"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5"
                                        />
                                    </svg>
                                </div>

                                <p className="text-xs font-medium text-[var(--text)]">
                                    You're all caught up
                                </p>

                                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            <>
                                {unreadNotifications.length > 0 && (
                                    <div>
                                        <div className="sticky top-0 z-10 px-4 py-2 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#B98B4E]" />

                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                    Unread
                                                </p>
                                            </div>

                                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                                                {unreadNotifications.length}
                                            </span>
                                        </div>

                                        {unreadNotifications.map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() =>
                                                    handleNotificationClick(n)
                                                }
                                                className="group w-full text-left px-4 py-3 border-b border-[var(--border)] bg-[#B98B4E]/[0.06] hover:bg-[#B98B4E]/[0.12] transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span className="w-2 h-2 mt-1.5 rounded-full bg-[#B98B4E] shrink-0" />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-xs font-semibold text-[var(--text)] leading-5">
                                                                {n.title}
                                                            </p>

                                                            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                                                                {timeAgo(
                                                                    n.createdAt
                                                                )}
                                                            </span>
                                                        </div>

                                                        {n.message && (
                                                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-4 line-clamp-2">
                                                                {n.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {readNotifications.length > 0 && (
                                    <div>
                                        <div className="sticky top-0 z-10 px-4 py-2.5 bg-[var(--card)] border-b border-[var(--border)]">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                Earlier
                                            </p>
                                        </div>

                                        {readNotifications.map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() =>
                                                    handleNotificationClick(n)
                                                }
                                                className="w-full text-left px-4 py-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg)] transition-colors cursor-pointer opacity-75 hover:opacity-100"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="text-xs font-medium text-[var(--text)] leading-5">
                                                            {n.title}
                                                        </p>

                                                        <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                                                            {timeAgo(n.createdAt)}
                                                        </span>
                                                    </div>

                                                    {n.message && (
                                                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-4 line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}