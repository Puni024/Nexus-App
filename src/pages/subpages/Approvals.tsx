import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import FilePreviewModal, { type PreviewableFile } from "../../components/FilePreviewModal";
import api from "../../utils/api";

interface NewsletterFile {
    file_id: number;
    file_name: string;
    file_url: string;
}

interface SubmitterUser {
    id: string;
    name: string;
    email: string;
    info?: { picture?: string };
}

interface ApproverUser {
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
    approved_by?: string | null;
    approver?: ApproverUser | null;
    SubmittedBy?: SubmitterUser | null;
    File?: NewsletterFile;
}

type StatusTab = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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
const DEFAULT_FILE_TYPE_STYLE = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

const statusStyles: Record<Submission["status"], string> = {
    APPROVED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    REJECTED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const statusLabels: Record<Submission["status"], string> = {
    APPROVED: "Approved",
    PENDING: "Pending",
    REJECTED: "Rejected",
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
    if (!profile || !profile.trim()) return null;
    const value = profile.trim();
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("data:")) return value;
    return `data:image/png;base64,${value}`;
}

function Avatar({ name, profile, size = 36 }: { name?: string; profile?: string | null; size?: number }) {
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
            style={{ width: size, height: size, backgroundColor: getAvatarColor(name), fontSize: size * 0.32 }}
        >
            {getInitials(name)}
        </div>
    );
}

const TABS: { key: StatusTab; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "APPROVED", label: "Approved" },
    { key: "PENDING", label: "Pending" },
    { key: "REJECTED", label: "Rejected" },
];

const Approvals = () => {
    const location = useLocation();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [tab, setTab] = useState<StatusTab>("ALL");
    const [query, setQuery] = useState("");
    const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

    const [selected, setSelected] = useState<Submission | null>(null);
    const [actionLoading, setActionLoading] = useState<"approve" | "reject" | "publish" | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const processedHighlightRef = useRef<string | null>(null);

    const fetchSubmissions = async (status: StatusTab) => {
        try {
            setLoading(true);
            setLoadError(null);
            const { data } = await api.get("/admin/newsletters", {
                params: status === "ALL" ? {} : { status },
            });
            setSubmissions(data.data ?? []);
        } catch {
            setLoadError("Couldn't load submissions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions(tab);
    }, [tab, location.state]);

    const filteredSubmissions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return submissions;
        return submissions.filter(
            (s) =>
                s.title?.toLowerCase().includes(q) ||
                s.SubmittedBy?.name?.toLowerCase().includes(q) ||
                s.SubmittedBy?.email?.toLowerCase().includes(q)
        );
    }, [submissions, query]);

    const openDetails = (s: Submission) => {
        setSelected(s);
        setActionError(null);
    };

    const closeDetails = () => {
        setSelected(null);
        setActionError(null);
    };

    const refreshAfterAction = async () => {
        await fetchSubmissions(tab);
    };

    const handleApprove = async () => {
        if (!selected) return;
        try {
            setActionLoading("approve");
            setActionError(null);
            await api.patch(`/admin/newsletter/${selected.newsletter_id}/approve`);
            await refreshAfterAction();
            closeDetails();
        } catch {
            setActionError("Couldn't approve this submission.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selected) return;
        try {
            setActionLoading("reject");
            setActionError(null);
            await api.patch(`/admin/newsletter/${selected.newsletter_id}/reject`);
            await refreshAfterAction();
            closeDetails();
        } catch {
            setActionError("Couldn't reject this submission.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleTogglePublish = async () => {
        if (!selected) return;
        try {
            setActionLoading("publish");
            setActionError(null);
            const { data } = await api.patch(`/admin/newsletter/${selected.newsletter_id}/publish`);
            setSelected((prev) => (prev ? { ...prev, is_published: data.is_published } : prev));
            await refreshAfterAction();
        } catch {
            setActionError("Couldn't update publish status.");
        } finally {
            setActionLoading(null);
        }
    };

    // Auto-open the submission a notification pointed at, once loaded.
    useEffect(() => {
        const highlightId = (location.state as any)?.highlightId;
        if (!highlightId || submissions.length === 0) return;

        const match = submissions.find((s) => String(s.newsletter_id) === String(highlightId));
        if (match) {
            openDetails(match);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, submissions]);

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg)] transition-colors">

            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] truncate">Approvals</h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                        Review and manage newsletter submissions
                    </p>
                </div>

                <div className="relative w-full sm:max-w-xs shrink-0">
                    <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title or submitter..."
                        className="w-full h-10 pl-10 pr-4 rounded-full border border-[var(--border)] bg-[var(--card)] focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                    />
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 px-6 sm:px-10 pt-4">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${tab === t.key
                                ? "bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] border-[#2B2620] dark:border-[#EDE6D6]"
                                : "bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--bg)]"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                <div className="w-full">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden transition-colors">

                        {loading ? (
                            <div className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
                                Loading submissions...
                            </div>
                        ) : loadError ? (
                            <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                                <p className="text-sm font-semibold text-[var(--text)]">{loadError}</p>
                                <button
                                    onClick={() => fetchSubmissions(tab)}
                                    className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredSubmissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                                <div className="w-11 h-11 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-[var(--text)]">
                                    {query ? "No submissions match your search" : "Nothing here"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] text-left">
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Submitter</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Title</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">File</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Date</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {filteredSubmissions.map((s) => (
                                            <tr
                                                key={s.newsletter_id}
                                                onClick={() => openDetails(s)}
                                                className="hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <Avatar name={s.SubmittedBy?.name} profile={s.SubmittedBy?.info?.picture} size={32} />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-[var(--text)] truncate max-w-[160px]">
                                                                {s.SubmittedBy?.name || "Unknown"}
                                                            </p>
                                                            <p className="text-xs text-[var(--text-muted)] truncate max-w-[160px]">
                                                                {s.SubmittedBy?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 font-semibold text-[var(--text)] max-w-[220px] truncate">
                                                    {s.title}
                                                </td>
                                                <td className="px-4 py-3.5 text-[var(--text-muted)] max-w-[180px] truncate">
                                                    {s.File ? (s.File.file_name || fileNameFromUrl(s.File.file_url)) : "-"}
                                                </td>
                                                <td className="px-4 py-3.5 text-[var(--text-muted)] whitespace-nowrap">
                                                    {formatDate(s.uploaded_at)}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[s.status]}`}>
                                                        {statusLabels[s.status]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={closeDetails}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
                    >
                        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--card)]">
                            <p className="text-sm font-semibold text-[var(--text)] truncate min-w-0">
                                {selected.title}
                            </p>
                            <button
                                onClick={closeDetails}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto">

                            <div className="flex items-center gap-3">
                                <Avatar name={selected.SubmittedBy?.name} profile={selected.SubmittedBy?.info?.picture} size={44} />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[var(--text)] truncate">
                                        {selected.SubmittedBy?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">
                                        {selected.SubmittedBy?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${statusStyles[selected.status]}`}>
                                    {statusLabels[selected.status]}
                                </span>
                                <span
                                    className={`text-[11px] font-semibold px-3 py-1 rounded-full ${selected.is_published
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        }`}
                                >
                                    {selected.is_published ? "Published" : "Not Published"}
                                </span>
                            </div>

                            {selected.File && (
                                <div className="flex items-center justify-between gap-3 border border-[var(--border)] rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${FILE_TYPE_STYLES[getFileExtension(selected.File.file_name)] || DEFAULT_FILE_TYPE_STYLE
                                                }`}
                                        >
                                            {getFileExtension(selected.File.file_name) || "file"}
                                        </span>
                                        <p className="text-sm font-medium text-[var(--text)] truncate">
                                            {selected.File.file_name || fileNameFromUrl(selected.File.file_url)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            selected.File &&
                                            setPreviewFile({
                                                file_id: selected.File.file_id,
                                                file_name: selected.File.file_name,
                                                file_url: selected.File.file_url,
                                            })
                                        }
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer shrink-0"
                                    >
                                        View
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Submitted on</span>
                                <span className="font-medium text-[var(--text)]">{formatDate(selected.uploaded_at)}</span>
                            </div>

                            {selected.approver && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Reviewed by</span>
                                    <span className="font-medium text-[var(--text)]">{selected.approver.name}</span>
                                </div>
                            )}

                            {actionError && (
                                <p className="text-red-600 dark:text-red-400 text-xs">{actionError}</p>
                            )}

                            <div className="border-t border-[var(--border)] pt-4 space-y-2.5">
                                {selected.status === "PENDING" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleApprove}
                                            disabled={actionLoading !== null}
                                            className="flex-1 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                        >
                                            {actionLoading === "approve" ? "Approving..." : "Approve"}
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={actionLoading !== null}
                                            className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                        >
                                            {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                                        </button>
                                    </div>
                                )}

                                {selected.status === "APPROVED" && (
                                    <button
                                        onClick={handleTogglePublish}
                                        disabled={actionLoading !== null}
                                        className="w-full h-10 rounded-lg bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] text-xs font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    >
                                        {actionLoading === "publish"
                                            ? "Updating..."
                                            : selected.is_published
                                                ? "Unpublish"
                                                : "Publish"}
                                    </button>
                                )}

                                {selected.status === "REJECTED" && (
                                    <p className="text-xs text-[var(--text-muted)] text-center">
                                        This submission was rejected and can't be published.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
};

export default Approvals;