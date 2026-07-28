import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

interface UserRow {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    signedwith: string;
    isVerified: boolean;
    isActive: boolean;
}

const Overview = () => {

    const { showToast, theme } = useAuth();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/admin/users");
            setUsers(data.users ?? []);
            setError(null);
        } catch {
            setError("Failed to load overview");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.isActive).length;
        const inactive = total - active;
        const verified = users.filter((u) => u.isVerified).length;
        const unverified = total - verified;

        return { total, active, inactive, verified, unverified };
    }, [users]);

    const pendingUsers = useMemo(
        () => users.filter((u) => !u.isVerified),
        [users]
    );

    const verifyUser = async (id: string) => {
    try {
        setUpdatingId(id);
        await api.patch(`/admin/${id}/verify`);
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, isVerified: true } : u))
        );
        showToast("User verified successfully", "success");
    } catch {
        showToast("Failed to verify user. Please try again.", "error");
    } finally {
        setUpdatingId(null);
    }
};

    // colors used via inline `style`, so CSS vars don't help here directly -
    // JS still needs to know which mode it's in for the accent hex values
    const accents = {
        total: theme === "dark" ? "#EDE6D6" : "#2B2620",
        activeGreen: theme === "dark" ? "#6FCF7A" : "#2E7D32",
        inactiveRed: theme === "dark" ? "#E08585" : "#B33A3A",
        verifiedGreen: theme === "dark" ? "#6FCF7A" : "#2E7D32",
        unverifiedGold: "#B98B4E", // already reads fine on both backgrounds
    };

    // ---------- Circle spinner (used everywhere loading is needed) ----------
    function CircleSpinner({ size = "w-4 h-4" }: { size?: string }) {
        return (
            <span
                className={`inline-block ${size} rounded-full border-2 border-[var(--border)] border-t-[#B98B4E] animate-spin`}
            />
        );
    }

    // ---------- Single stat KPI card ----------
    function KpiCard({
        label,
        value,
        accent,
    }: {
        label: string;
        value: number;
        accent: string;
    }) {
        return (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 flex flex-col gap-1 min-h-[76px] justify-center transition-colors">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    {label}
                </p>
                {loading ? (
                    <CircleSpinner />
                ) : (
                    <p className="text-2xl font-serif" style={{ color: accent }}>
                        {value}
                    </p>
                )}
            </div>
        );
    }

    // ---------- Split stat KPI card (two values side by side) ----------
    function SplitKpiCard({
        title,
        left,
        right,
    }: {
        title: string;
        left: { label: string; value: number; accent: string };
        right: { label: string; value: number; accent: string };
    }) {
        return (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 flex flex-col gap-3 min-h-[76px] justify-center transition-colors">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    {title}
                </p>

                {loading ? (
                    <div className="flex items-center justify-center py-1">
                        <CircleSpinner />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-2xl font-serif" style={{ color: left.accent }}>
                                {left.value}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">{left.label}</p>
                        </div>

                        <div className="w-px self-stretch bg-[var(--border)]" />

                        <div className="flex-1">
                            <p className="text-2xl font-serif" style={{ color: right.accent }}>
                                {right.value}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">{right.label}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4">

            {/* KPI Row: 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <KpiCard label="Total Users" value={stats.total} accent={accents.total} />

                <SplitKpiCard
                    title="Active / Inactive"
                    left={{ label: "Active", value: stats.active, accent: accents.activeGreen }}
                    right={{ label: "Inactive", value: stats.inactive, accent: accents.inactiveRed }}
                />

                <SplitKpiCard
                    title="Verified / Not Verified"
                    left={{ label: "Verified", value: stats.verified, accent: accents.verifiedGreen }}
                    right={{ label: "Not Verified", value: stats.unverified, accent: accents.unverifiedGold }}
                />

            </div>

            {/* Refresh - below KPI row, right aligned, themed */}
            <div className="flex justify-end">
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-[#B98B4E] text-[#2B2620] hover:bg-[#A67A3F] transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <CircleSpinner size="w-3.5 h-3.5" />
                    ) : (
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h5M20 20v-5h-5M4.5 9a7.5 7.5 0 0113-4.9M19.5 15a7.5 7.5 0 01-13 4.9"
                            />
                        </svg>
                    )}
                    Refresh
                </button>
            </div>

            {/* Second row: pending verification list + empty space for future widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Pending verification list */}
                <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden flex flex-col h-[360px] transition-colors">
                    <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--card-strip)] text-[#EDE6D6] shrink-0">
                        <p className="text-xs uppercase tracking-wide">
                            Pending Verification {!loading && `(${pendingUsers.length})`}
                        </p>
                    </div>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <CircleSpinner size="w-6 h-6" />
                            </div>
                        ) : error ? (
                            <div className="p-4 space-y-3">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                <button
                                    onClick={fetchUsers}
                                    className="text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--card-strip)] text-[#EDE6D6] hover:opacity-90 transition-opacity"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm text-[var(--text-muted)]">All users are verified.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--border)]">
                                {pendingUsers.map((u) => (
                                    <li
                                        key={u.id}
                                        className="flex items-center justify-between px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm text-[var(--text)] truncate">
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] truncate">
                                                {u.email}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => verifyUser(u.id)}
                                            disabled={updatingId === u.id}
                                            className="shrink-0 ml-3 text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--card-strip)] text-[#EDE6D6] hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {updatingId === u.id ? "Verifying..." : "Mark Verified"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Empty placeholder box for future widget (chart, activity feed, etc.) */}
                <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-lg flex items-center justify-center min-h-[200px] lg:min-h-0 transition-colors">
                    <p className="text-xs text-[var(--text-muted)]">More insights coming soon</p>
                </div>

            </div>

        </div>
    );
};

export default Overview;