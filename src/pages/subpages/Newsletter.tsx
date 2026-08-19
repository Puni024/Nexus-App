import { useEffect, useMemo, useState } from "react";
import FilePreviewModal, { type PreviewableFile } from "../../components/FilePreviewModal";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

interface NewsletterFile {
    file_id: number;
    file_name: string;
    file_url: string;
}

interface SubmittedByUser {
    id: string;
    name: string;
    email: string;
    info?: { picture?: string };
}

interface ApprovedByUser {
    id: string;
    name: string;
    email: string;
}

interface Submission {
    newsletter_id: string;
    title: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    uploaded_at: string;
    is_published: boolean;
    File?: NewsletterFile;
    SubmittedBy?: SubmittedByUser | null;
    ApprovedBy?: ApprovedByUser | null;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function monthLabel(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Undated";
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function fileNameFromUrl(url?: string): string {
    if (!url) return "-";
    return url.split("/").pop() || url;
}

function getFileExtension(name?: string): string {
    if (!name) return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

const FILE_TYPE_STYLES: Record<string, string> = {
    pdf: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    doc: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",

    docx: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

const AVATAR_COLORS = ["#B98B4E", "#6B8F71", "#7C83FD", "#E07A5F", "#3D8BFD", "#C9184A", "#8A5CF6"];

function getInitials(name?: string): string {
    if (!name || !name.trim()) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function getAvatarColor(seed?: string): string {
    if (!seed) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function resolveProfileSrc(profile?: string | null): string | null {
    if (!profile) return null;
    const value = profile.trim();
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("data:")) return value;
    return `data:image/png;base64,${value}`;
}

function Avatar({ name, profile, size = 34 }: { name?: string; profile?: string | null; size?: number }) {
    const src = resolveProfileSrc(profile);
    const [imgFailed, setImgFailed] = useState(false);

    if (src && !imgFailed) {
        return (
            <img
                src={src}
                alt={name || "User"}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="rounded-full object-cover shrink-0"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div
            className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
            style={{ width: size, height: size, backgroundColor: getAvatarColor(name), fontSize: size * 0.34 }}
        >
            {getInitials(name)}
        </div>
    );
}

function Newsletter() {
    const navigate = useNavigate();
    const location = useLocation();

    const [items, setItems] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

    const fetchPublished = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const { data } = await api.get("/auth/newsletters/published");
            setItems(data.data ?? []);
        } catch {
            setLoadError("Couldn't load the newsletter. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublished();
    }, [location.state]);

    const groups = useMemo(() => {
        const map = new Map<string, Submission[]>();
        for (const item of items) {
            const key = monthLabel(item.uploaded_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        }
        return Array.from(map.entries());
    }, [items]);

    const toggleInfo = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleViewFile = (file?: NewsletterFile) => {
        if (!file) return;
        setPreviewFile({
            file_id: file.file_id,
            file_name: file.file_name,
            file_url: file.file_url,
        });
    };

    // Scroll the notified card into view and expand its info panel.
    useEffect(() => {
        const highlightId = (location.state as any)?.highlightId;

        if (!highlightId || items.length === 0) return;

        const match = items.find(
            (item) =>
                String(item.newsletter_id) ===
                String(highlightId)
        );

        if (!match) return;

        setHighlightedId(match.newsletter_id);

        requestAnimationFrame(() => {
            document
                .getElementById(
                    `newsletter-card-${match.newsletter_id}`
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
        });

        const timer = window.setTimeout(() => {
            setHighlightedId(null);
        }, 5000);

        window.history.replaceState({}, document.title);

        return () => {
            window.clearTimeout(timer);
        };
    }, [location.state, items]);

    return (
        <div className="w-full min-h-full bg-[var(--bg)] transition-colors">

            <div className="px-4 sm:px-8 pt-8 pb-10">
                <div className="max-w-5xl mx-auto">

                    <div className="flex items-start justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                                Community Newsletter
                            </h1>

                            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                                Monthly updates, stories, and contributions from the team
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/home/contribution")}
                            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                        >
                            Contribute
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-sm text-[var(--text-muted)] text-center py-16">
                            Loading the newsletter...
                        </p>
                    ) : loadError ? (
                        <div className="flex flex-col items-center text-center py-16">
                            <p className="text-sm font-semibold text-[var(--text)]">
                                {loadError}
                            </p>

                            <button
                                onClick={fetchPublished}
                                className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--card)] transition-colors cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="flex flex-col items-center text-center py-16">
                            <p className="text-sm font-semibold text-[var(--text)]">
                                Nothing published yet
                            </p>

                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                Check back soon, or be the first to contribute.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-9">
                            {groups.map(([label, groupItems]) => (
                                <section key={label}>

                                    <div className="flex items-center gap-2 mb-3.5">
                                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#B98B4E]">
                                            {label}
                                        </h2>

                                        <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--card)] border border-[var(--border)] rounded-full px-2 py-0.5">
                                            {groupItems.length}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">

                                        {groupItems.map((item) => {
                                            const isOpen =
                                                expandedId === item.newsletter_id;

                                            const ext =
                                                getFileExtension(
                                                    item.File?.file_name
                                                );

                                            return (
                                                <div
                                                    key={item.newsletter_id}
                                                    id={`newsletter-card-${item.newsletter_id}`}
                                                    className={`relative self-start h-[290px] flex flex-col rounded-2xl border bg-[var(--card)] overflow-hidden transition-all duration-300 ${highlightedId === item.newsletter_id
                                                            ? "border-[#B98B4E] shadow-[0_0_0_3px_rgba(185,139,78,0.25),0_10px_35px_rgba(0,0,0,0.18)]"
                                                            : "border-[var(--border)] hover:border-[#B98B4E]"
                                                        }`}
                                                >

                                                    <button
                                                        onClick={() =>
                                                            handleViewFile(item.File)
                                                        }
                                                        disabled={!item.File}
                                                        className="group relative h-28 shrink-0 flex items-center justify-center bg-[var(--bg)] border-b border-[var(--border)] cursor-pointer disabled:cursor-default"
                                                    >
                                                        <span
                                                            className={`text-2xl font-black uppercase tracking-wider opacity-70 ${FILE_TYPE_STYLES[
                                                                    ext
                                                                ]
                                                                    ?.split(" ")
                                                                    .find((c) =>
                                                                        c.startsWith(
                                                                            "text-"
                                                                        )
                                                                    ) ||
                                                                "text-[var(--text-muted)]"
                                                                }`}
                                                        >
                                                            .{ext || "file"}
                                                        </span>

                                                        {item.File && (
                                                            <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                                <svg
                                                                    className="w-4 h-4 text-white"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75-7.5-10.5-7.5S1.5 12 1.5 12z"
                                                                    />

                                                                    <circle
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="3"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>

                                                                <span className="text-xs font-semibold text-white">
                                                                    View file
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>

                                                    <div className="flex-1 flex flex-col p-4 min-h-0">

                                                        <p className="text-sm font-semibold text-[var(--text)] leading-snug line-clamp-2">
                                                            {item.title}
                                                        </p>

                                                        {item.File && (
                                                            <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                                                                {item.File.file_name ||
                                                                    fileNameFromUrl(
                                                                        item.File.file_url
                                                                    )}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-2 mt-3.5">
                                                            <Avatar
                                                                name={
                                                                    item.SubmittedBy
                                                                        ?.name
                                                                }
                                                                profile={
                                                                    item.SubmittedBy
                                                                        ?.info
                                                                        ?.picture
                                                                }
                                                                size={28}
                                                            />

                                                            <div className="min-w-0">
                                                                <p className="text-xs font-medium text-[var(--text)] truncate">
                                                                    {item
                                                                        .SubmittedBy
                                                                        ?.name ||
                                                                        "Unknown"}
                                                                </p>

                                                                <p className="text-[10px] text-[var(--text-muted)]">
                                                                    {formatDate(
                                                                        item.uploaded_at
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1" />

                                                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]">

                                                            <button
                                                                onClick={() =>
                                                                    handleViewFile(
                                                                        item.File
                                                                    )
                                                                }
                                                                disabled={
                                                                    !item.File
                                                                }
                                                                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B98B4E] hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-default"
                                                            >
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
                                                                        d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75-7.5-10.5-7.5S1.5 12 1.5 12z"
                                                                    />

                                                                    <circle
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="3"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>

                                                                Open file
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    toggleInfo(
                                                                        item.newsletter_id
                                                                    )
                                                                }
                                                                aria-label="Publishing details"
                                                                title="Publishing details"
                                                                className={`w-[28px] h-[28px] rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${isOpen
                                                                        ? "bg-[#2B2620] dark:bg-[#EDE6D6] border-[#2B2620] dark:border-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] shadow-md"
                                                                        : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                                                                    }`}
                                                            >
                                                                <svg
                                                                    className="w-3.5 h-3.5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                    />

                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M12 16v-5M12 8h.01"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isOpen && (
                                                        <div className="absolute inset-0 z-30 flex items-end p-3 bg-black/10 dark:bg-black/20 backdrop-blur-[1px]">

                                                            <div className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xl px-3 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">

                                                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#B98B4E]">
                                                                        Publishing details
                                                                    </p>

                                                                    <button
                                                                        onClick={() =>
                                                                            setExpandedId(
                                                                                null
                                                                            )
                                                                        }
                                                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                                                        aria-label="Close"
                                                                    >
                                                                        <svg
                                                                            className="w-3 h-3"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M6 6l12 12M18 6L6 18"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>

                                                                {item.ApprovedBy ? (
                                                                    <div className="flex items-center gap-2.5">

                                                                        <Avatar
                                                                            name={
                                                                                item
                                                                                    .ApprovedBy
                                                                                    .name
                                                                            }
                                                                            size={30}
                                                                        />

                                                                        <div className="min-w-0">
                                                                            <p className="text-[11px] font-semibold text-[var(--text)] truncate">
                                                                                Published by{" "}
                                                                                {
                                                                                    item
                                                                                        .ApprovedBy
                                                                                        .name
                                                                                }
                                                                            </p>

                                                                            <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                                                                                {
                                                                                    item
                                                                                        .ApprovedBy
                                                                                        .email
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[11px] text-[var(--text-muted)]">
                                                                        Publisher details unavailable.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <FilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </div>
    );
}

export default Newsletter;