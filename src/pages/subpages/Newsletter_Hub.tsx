import { useEffect, useMemo, useState } from "react";
import FilePreviewModal, { type PreviewableFile } from "../../components/FilePreviewModal";
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
    info?: { Theme?: string; picture?: string };
}

interface ApprovedByUser {
    id: string;
    name: string;
    email: string;
}

interface Submission {
    newsletter_id: number;
    title: string;
    file_id: number;
    submitted_by: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approved_by?: string | null;
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

// picture can be "" (empty string, as your API sends for no-photo users),
// null/undefined, a full data URI already, or a bare base64 string.
function resolveProfileSrc(profile?: string | null): string | null {
    if (!profile) return null;
    const value = profile.trim();
    if (!value) return null;
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

const Newsletter_Hub = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);
    const [selected, setSelected] = useState<Submission | null>(null);
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchApproved = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const { data } = await api.get("/admin/newsletters", {
                params: { status: "APPROVED" },
            });
            setSubmissions(data.data ?? []);
        } catch {
            setLoadError("Couldn't load newsletters. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApproved();
    }, []);

    const { published, unpublished } = useMemo(() => {
        const q = query.trim().toLowerCase();

        const matchesQuery = (s: Submission) =>
            !q ||
            s.title?.toLowerCase().includes(q) ||
            s.SubmittedBy?.name?.toLowerCase().includes(q) ||
            s.SubmittedBy?.email?.toLowerCase().includes(q);

        const published: Submission[] = [];
        const unpublished: Submission[] = [];

        for (const s of submissions) {
            if (!matchesQuery(s)) continue;
            (s.is_published ? published : unpublished).push(s);
        }

        return { published, unpublished };
    }, [submissions, query]);

    const handleTogglePublish = async (submission: Submission) => {
        try {
            setPublishingId(submission.newsletter_id);
            setActionError(null);
            const { data } = await api.patch(`/admin/newsletter/${submission.newsletter_id}/publish`);

            setSubmissions((prev) =>
                prev.map((s) =>
                    s.newsletter_id === submission.newsletter_id
                        ? { ...s, is_published: data.is_published }
                        : s
                )
            );
            setSelected((prev) =>
                prev && prev.newsletter_id === submission.newsletter_id
                    ? { ...prev, is_published: data.is_published }
                    : prev
            );
        } catch {
            setActionError("Couldn't update publish status. Please try again.");
        } finally {
            setPublishingId(null);
        }
    };

    const openDetails = (s: Submission) => {
        setSelected(s);
        setActionError(null);
    };

    const closeDetails = () => {
        setSelected(null);
        setActionError(null);
    };

    function SubmissionRow({ s }: { s: Submission }) {
        const isBusy = publishingId === s.newsletter_id;

        return (
            <div
                onClick={() => openDetails(s)}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--bg)] transition-colors cursor-pointer"
            >
                <Avatar name={s.SubmittedBy?.name} profile={s.SubmittedBy?.info?.picture} />

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{s.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                        {s.SubmittedBy?.name || "Unknown"} · {formatDate(s.uploaded_at)}
                    </p>
                </div>

                <span
                    className={`hidden sm:inline-flex shrink-0 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${FILE_TYPE_STYLES[getFileExtension(s.File?.file_name)] || DEFAULT_FILE_TYPE_STYLE
                        }`}
                >
                    {getFileExtension(s.File?.file_name) || "file"}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(s);
                    }}
                    disabled={isBusy}
                    className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${s.is_published
                            ? "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
                            : "bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                >
                    {isBusy ? "..." : s.is_published ? "Unpublish" : "Publish"}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg)] transition-colors">

            <div className="shrink-0 flex items-center justify-end px-6 sm:px-10 py-4">
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

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-6">
                {loading ? (
                    <div className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
                        Loading newsletters...
                    </div>
                ) : loadError ? (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                        <p className="text-sm font-semibold text-[var(--text)]">{loadError}</p>
                        <button
                            onClick={fetchApproved}
                            className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : published.length === 0 && unpublished.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                        <div className="w-11 h-11 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text)]">
                            {query ? "No newsletters match your search" : "Nothing approved yet"}
                        </p>
                    </div>
                ) : (
                    <div className="w-full space-y-8">

                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Ready to Publish
                                </h2>
                                <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--card)] border border-[var(--border)] rounded-full px-2 py-0.5">
                                    {unpublished.length}
                                </span>
                            </div>

                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden divide-y divide-[var(--border)]">
                                {unpublished.length === 0 ? (
                                    <p className="px-4 py-6 text-sm text-[var(--text-muted)]">
                                        Nothing waiting to go live.
                                    </p>
                                ) : (
                                    unpublished.map((s) => <SubmissionRow key={s.newsletter_id} s={s} />)
                                )}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Published
                                </h2>
                                <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5">
                                    {published.length} live
                                </span>
                            </div>

                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden divide-y divide-[var(--border)]">
                                {published.length === 0 ? (
                                    <p className="px-4 py-6 text-sm text-[var(--text-muted)]">
                                        Nothing published yet.
                                    </p>
                                ) : (
                                    published.map((s) => <SubmissionRow key={s.newsletter_id} s={s} />)
                                )}
                            </div>
                        </section>
                    </div>
                )}
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

                            <span
                                className={`inline-flex text-[11px] font-semibold px-3 py-1 rounded-full ${selected.is_published
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    }`}
                            >
                                {selected.is_published ? "Published" : "Not Published"}
                            </span>

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

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--text-muted)]">Submitted on</span>
                                    <span className="font-medium text-[var(--text)]">{formatDate(selected.uploaded_at)}</span>
                                </div>
                                {selected.ApprovedBy && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--text-muted)]">Approved by</span>
                                        <span className="font-medium text-[var(--text)]">{selected.ApprovedBy.name}</span>
                                    </div>
                                )}
                            </div>

                            {actionError && (
                                <p className="text-red-600 dark:text-red-400 text-xs">{actionError}</p>
                            )}

                            <div className="border-t border-[var(--border)] pt-4">
                                <button
                                    onClick={() => handleTogglePublish(selected)}
                                    disabled={publishingId === selected.newsletter_id}
                                    className={`w-full h-10 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors ${selected.is_published
                                            ? "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
                                            : "bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] active:scale-[0.98]"
                                        }`}
                                >
                                    {publishingId === selected.newsletter_id
                                        ? "Updating..."
                                        : selected.is_published
                                            ? "Unpublish"
                                            : "Publish"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
};

export default Newsletter_Hub;