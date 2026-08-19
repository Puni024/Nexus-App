import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

interface UserRecord {
    id: number;
    name: string;
    email: string;
    info?: { theme?: string; picture?: string };
    isAdmin?: boolean;
}

function resolveProfileSrc(profile?: string | null): string | null {
    if (!profile) return null;

    const value = profile.trim();

    if (!value) {
        return null;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (value.startsWith("data:")) {
        return value;
    }

    return `data:image/png;base64,${value}`;
}

type ImgStatus = "empty" | "loading" | "loaded" | "error";

const BORDER_COLOR: Record<ImgStatus, string> = {
    empty: "#EF4444",
    loading: "#D1D5DB",
    loaded: "#22C55E",
    error: "#EF4444",
};

function UserAvatar({
    name,
    profile,
    size = 56,
}: {
    name?: string;
    profile?: string | null;
    size?: number;
}) {
    const src = resolveProfileSrc(profile);

    const imgRef = useRef<HTMLImageElement>(null);

    const [status, setStatus] = useState<ImgStatus>(
        src ? "loading" : "empty"
    );

    useEffect(() => {
        if (!src) {
            setStatus("empty");
            return;
        }

        setStatus("loading");

        requestAnimationFrame(() => {
            const img = imgRef.current;

            if (img?.complete) {
                if (img.naturalWidth > 0) {
                    setStatus("loaded");
                } else {
                    setStatus("error");
                }
            }
        });
    }, [src]);

    const borderStyle = {
        width: size,
        height: size,
        border: `2px solid ${BORDER_COLOR[status]}`,
        padding: 2,
    };

    // No photo on file at all -> generic silhouette icon, clearly distinct
    // from a "real" avatar so it never gets mistaken for initials-as-photo.
    if (status === "empty") {
        return (
            <div className="rounded-full shrink-0" style={borderStyle} title="No photo on file">
                <div className="rounded-full w-full h-full flex items-center justify-center bg-[var(--bg)] text-[var(--text-muted)]">
                    <svg
                        style={{ width: size * 0.5, height: size * 0.5 }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="8" r="3.5" />
                        <path strokeLinecap="round" d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-full shrink-0" style={borderStyle}>
            <div className="relative w-full h-full">
                <img
                    ref={imgRef}
                    src={src as string}
                    alt={name || "User"}
                    onLoad={() => setStatus("loaded")}
                    onError={() => setStatus("error")}
                    className={`rounded-full object-cover w-full h-full ${status === "loaded"
                            ? "opacity-100"
                            : "opacity-0 absolute inset-0"
                        }`}
                />

                {status === "loading" && (
                    <div
                        className="rounded-full w-full h-full bg-[var(--border)] animate-pulse"
                        aria-label={`Loading photo for ${name || "user"}`}
                    />
                )}

                {status === "error" && (
                    <div
                        className="rounded-full w-full h-full flex items-center justify-center bg-[var(--bg)] text-red-500"
                        title="Photo failed to load"
                    >
                        <svg
                            style={{
                                width: size * 0.4,
                                height: size * 0.4,
                            }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16l4.5-4.5a2 2 0 012.83 0L16 16m-2-2l1.5-1.5a2 2 0 012.83 0L20 14M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
                            />
                            <circle
                                cx="8.5"
                                cy="9.5"
                                r="1.25"
                                fill="currentColor"
                                stroke="none"
                            />
                            <path strokeLinecap="round" d="M3 21L21 3" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserCard({ user }: { user: UserRecord }) {
    const navigate = useNavigate();

    const goToUserInTable = () => {
        navigate(`/admin/users?search=${encodeURIComponent(user.email)}&active=false`);
    };

    return (
        <div
            className="flex flex-col items-center text-center gap-2.5 py-4 rounded-lg"
            title={`View ${user.name} in Users`}
        >
            <button
                type="button"
                onClick={goToUserInTable}
                className="flex flex-col items-center text-center gap-2.5 py-4 rounded-lg cursor-pointer "
            >
                <UserAvatar name={user.name} profile={user.info?.picture} />
            </button>
            <div className="min-w-0 w-full">
                <p className="text-sm font-semibold text-[var(--text)] truncate" title={user.name}>
                    {user.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate" title={user.email}>
                    {user.email}
                </p>
            </div>
        </div>
    );
}

const People = () => {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const { data } = await api.get("/admin/users", {
                params: { fields: "id,name,email,info,isAdmin" },
            });
            setUsers(data.users ?? []);
        } catch {
            setLoadError("Couldn't load people. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const { admins, members } = useMemo(() => {
        const admins: UserRecord[] = [];
        const members: UserRecord[] = [];
        for (const u of users) {
            (u.isAdmin ? admins : members).push(u);
        }
        return { admins, members };
    }, [users]);

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg)] transition-colors">
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                {loading ? (
                    <div className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
                        Loading people...
                    </div>
                ) : loadError ? (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                        <p className="text-sm font-semibold text-[var(--text)]">{loadError}</p>
                        <button
                            onClick={fetchUsers}
                            className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                        <p className="text-sm font-semibold text-[var(--text)]">No people found</p>
                    </div>
                ) : (
                    <div className="w-full space-y-10">
                        {admins.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Admins
                                    </h2>
                                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--card)] border border-[var(--border)] rounded-full px-2 py-0.5">
                                        {admins.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-4">
                                    {admins.map((u) => (
                                        <UserCard key={u.id} user={u} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {members.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Users
                                    </h2>
                                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--card)] border border-[var(--border)] rounded-full px-2 py-0.5">
                                        {members.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-4">
                                    {members.map((u) => (
                                        <UserCard key={u.id} user={u} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default People;