import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../utils/api";
import Loader from "../../components/Loader";

interface UserRow {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    signedwith: string;
    isVerified: boolean;
    last_visited: string;
}

type StatusFilter = "active" | "inactive" | null;
type SignedFilter = "google" | "email" | null;
type VerifiedFilter = "verified" | "unverified" | null;

const ACTIVE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes, matches heartbeat interval on the client

function isUserActive(lastVisited: string | null | undefined): boolean {
    if (!lastVisited) return false;
    const last = new Date(lastVisited).getTime();
    if (Number.isNaN(last)) return false;
    return Date.now() - last < ACTIVE_WINDOW_MS;
}

function formatLastVisited(lastVisited: string | null | undefined): string {
    if (!lastVisited) return "Never";

    const date = new Date(lastVisited);
    if (Number.isNaN(date.getTime())) return "Never";

    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const Users = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
    const [signedFilter, setSignedFilter] = useState<SignedFilter>(null);
    const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>(null);

    const [search, setSearch] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/admin/users");
            setUsers(data.users ?? []);
            setError(null);
        } catch {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const active = isUserActive(u.last_visited);

            if (statusFilter === "active" && !active) return false;
            if (statusFilter === "inactive" && active) return false;

            if (signedFilter === "google" && u.signedwith?.toLowerCase() !== "google") return false;
            if (signedFilter === "email" && u.signedwith?.toLowerCase() !== "email") return false;

            if (verifiedFilter === "verified" && !u.isVerified) return false;
            if (verifiedFilter === "unverified" && u.isVerified) return false;

            if (search.trim()) {
                const q = search.trim().toLowerCase();
                const matches =
                    u.name?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q);
                if (!matches) return false;
            }

            return true;
        });
    }, [users, statusFilter, signedFilter, verifiedFilter, search]);

    // ---------- Filter chip helper ----------
    interface Chip<T> {
        label: string;
        value: T;
    }

    function FilterGroup<T extends string>({
        chips,
        selected,
        onSelect,
    }: {
        chips: Chip<T>[];
        selected: T | null;
        onSelect: (v: T | null) => void;
    }) {
        return (
            <div className="flex flex-wrap gap-2">
                {chips.map((chip) => {
                    const isActive = selected === chip.value;

                    return (
                        <button
                            key={chip.value}
                            onClick={() =>
                                onSelect(isActive ? null : chip.value)
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors
                                ${
                                    isActive
                                        ? "bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] border-[#2B2620] dark:border-[#EDE6D6]"
                                        : "bg-[#F5EFE4] dark:bg-[#211D18] text-[#2B2620] dark:text-[#EDE6D6] border-[#D8CDB8] dark:border-[#3A332B] hover:bg-[#EDE6D6] dark:hover:bg-[#2B2620]"
                                }`}
                        >
                            {chip.label}

                            {isActive && (
                                <span className="text-[#EDE6D6] dark:text-[#2B2620] opacity-80">
                                    ✕
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-5">

            {/* Filters */}
            <div className="flex flex-col md:flex-row bg-[#F5EFE4] dark:bg-[#2B2620] border border-[#D8CDB8] dark:border-[#3A332B] rounded-lg overflow-hidden transition-colors">

                {/* Left: Filters ~85% */}
                <div className="flex-1 md:basis-[85%] flex flex-wrap items-center gap-x-8 gap-y-4 p-4">

                    <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-[#8C8272] dark:text-[#A69C8C]">
                            Status
                        </p>
                        <FilterGroup
                            chips={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" },
                            ]}
                            selected={statusFilter}
                            onSelect={setStatusFilter}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-[#8C8272] dark:text-[#A69C8C]">
                            Signed with
                        </p>
                        <FilterGroup
                            chips={[
                                { label: "Google", value: "google" },
                                { label: "Email", value: "email" },
                            ]}
                            selected={signedFilter}
                            onSelect={setSignedFilter}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-wide text-[#8C8272] dark:text-[#A69C8C]">
                            Verification
                        </p>
                        <FilterGroup
                            chips={[
                                { label: "Verified", value: "verified" },
                                { label: "Not Verified", value: "unverified" },
                            ]}
                            selected={verifiedFilter}
                            onSelect={setVerifiedFilter}
                        />
                    </div>

                </div>

                {/* Right: Search ~15% */}
                <div className="md:basis-[15%] flex items-center border-t md:border-t-0 border-[#D8CDB8] dark:border-[#3A332B] p-4">
                    <div className="w-full flex items-center h-9 px-3 rounded-md bg-white dark:bg-[#211D18] border border-[#D8CDB8] dark:border-[#3A332B] focus-within:border-[#B98B4E] transition-colors">
                        <svg
                            className="w-3.5 h-3.5 text-[#8C8272] dark:text-[#A69C8C] shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                        </svg>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search"
                            className="ml-2 w-full bg-transparent outline-none text-sm text-[#2B2620] dark:text-[#EDE6D6] placeholder:text-[#8C8272] dark:placeholder:text-[#A69C8C]"
                        />

                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="text-[#8C8272] dark:text-[#A69C8C] hover:text-[#2B2620] dark:hover:text-[#EDE6D6] shrink-0"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Table */}
            <div className="bg-[#F5EFE4] dark:bg-[#2B2620] border border-[#D8CDB8] dark:border-[#3A332B] rounded-lg overflow-hidden flex flex-col max-h-[420px] transition-colors">

                {/* Box header: count + refresh */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#D8CDB8] dark:border-[#3A332B]">
                    <p className="text-xs text-[#8C8272] dark:text-[#A69C8C]">
                        {loading ? "Loading..." : `${filteredUsers.length} user(s)`}
                    </p>

                    <button
                        onClick={fetchUsers}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-[#D8CDB8] dark:border-[#3A332B] bg-white dark:bg-[#211D18] text-[#2B2620] dark:text-[#EDE6D6] hover:bg-[#EDE6D6] dark:hover:bg-[#3A332B] transition-colors disabled:opacity-50"
                    >
                        <svg
                            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
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
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-10">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="p-6 space-y-3">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={fetchUsers}
                            className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#2B2620] dark:bg-[#3A332B] text-[#EDE6D6] hover:bg-[#3A332B] dark:hover:bg-[#4A4137] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <p className="p-6 text-sm text-[#8C8272] dark:text-[#A69C8C]">No users found.</p>
                ) : (
                    <>
                        {/* Fixed header table */}
                        <table className="w-full text-sm table-fixed shrink-0">
                            <thead className="bg-[#2B2620] dark:bg-[#1B1712] text-[#EDE6D6]">
                                <tr className="text-left text-[11px] uppercase tracking-wide">
                                    <th className="px-4 py-3 font-medium w-[20%]">Name</th>
                                    <th className="px-4 py-3 font-medium w-[26%]">Email</th>
                                    <th className="px-4 py-3 font-medium w-[15%]">Signed With</th>
                                    <th className="px-4 py-3 font-medium w-[14%]">Verified</th>
                                    <th className="px-4 py-3 font-medium w-[25%]">Last Visited</th>
                                </tr>
                            </thead>
                        </table>

                        {/* Scrollable body table */}
                        <div className="overflow-y-auto">
                            <table className="w-full text-sm table-fixed">
                                <tbody>
                                    {filteredUsers.map((u) => {
                                        const active = isUserActive(u.last_visited);

                                        return (
                                            <tr
                                                key={u.id}
                                                className="border-b border-[#D8CDB8] dark:border-[#3A332B] last:border-0 hover:bg-[#EDE6D6]/60 dark:hover:bg-[#211D18]/60"
                                            >
                                                <td className="px-4 py-3 w-[20%] text-[#2B2620] dark:text-[#EDE6D6]">{u.name}</td>
                                                <td className="px-4 py-3 w-[26%] text-[#2B2620] dark:text-[#EDE6D6]">{u.email}</td>
                                                <td className="px-4 py-3 w-[15%] text-[#2B2620] dark:text-[#EDE6D6] capitalize">
                                                    {u.signedwith}
                                                </td>
                                                <td className="px-4 py-3 w-[14%]">
                                                    <span
                                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                            u.isVerified
                                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                        }`}
                                                    >
                                                        {u.isVerified ? "Verified" : "Not Verified"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 w-[25%]">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                                                                active ? "bg-green-500" : "bg-[#8C8272] dark:bg-[#A69C8C]"
                                                            }`}
                                                        />
                                                        <span className="text-[#2B2620] dark:text-[#EDE6D6]">
                                                            {formatLastVisited(u.last_visited)}
                                                        </span>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Users;