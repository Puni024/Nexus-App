import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FilePreviewModal, { type PreviewableFile } from "../../components/FilePreviewModal";
import api from "../../utils/api";

interface NewsletterFile {
    file_id: number;
    file_name: string;
    file_url: string;
}

interface SubmissionUser {
    name: string;
    email?: string;
}

interface Submission {
    newsletter_id: string;
    title: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    uploaded_at: string;
    is_published: boolean;
    approved_by?: string | null;
    approver?: SubmissionUser | null;
    File?: NewsletterFile;
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
    const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
    return initials || "?";
}

function getAvatarColor(seed?: string): string {
    if (!seed) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name }: { name?: string }) {
    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: getAvatarColor(name) }}
        >
            {getInitials(name)}
        </div>
    );
}

const Contribution = () => {
    const location = useLocation();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [selected, setSelected] = useState<Submission | null>(null);
    const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const { data } = await api.get("/auth/newsletters");
            setSubmissions(data.data ?? []);
        } catch {
            setLoadError("Couldn't load your submissions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [location.state]);

    const resetForm = () => {
        setTitle("");
        setFile(null);
        setFormError(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !file) {
            setFormError("Please enter a title and select a file.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("file", file);

            await api.post("/auth/newsletter/contribute", formData, {
                withCredentials: true,
            });

            resetForm();
            await fetchSubmissions();
        } catch {
            setFormError("Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const currentFile = selected?.File;

    const openDetails = (submission: Submission) => {
        setSelected(submission);
    };

    const closeDetails = () => {
        setSelected(null);
    };

    const handleViewFile = () => {
        if (!currentFile) return;
        setPreviewFile({
            file_id: currentFile.file_id,
            file_name: currentFile.file_name,
            file_url: currentFile.file_url,
        });
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

    const isPublished = !!selected?.is_published;
    const hasReview = !!selected?.approved_by;

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg)] transition-colors">

            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] truncate">
                        NewsLetter Contribution
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                        Submit and track your newsletter contributions
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                    New Submission
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                <div className="w-full space-y-5">

                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden transition-colors">

                        {loading ? (
                            <div className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
                                Loading your submissions...
                            </div>
                        ) : loadError ? (
                            <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                                <p className="text-sm font-semibold text-[var(--text)]">{loadError}</p>
                                <button
                                    onClick={fetchSubmissions}
                                    className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                                <div className="w-11 h-11 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-[var(--text)]">
                                    No contribution from your side
                                </p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    Click "New Submission" to send in your first newsletter.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] text-left">
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Name</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">File</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Date</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Approval</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {submissions.map((s) => (
                                            <tr
                                                key={s.newsletter_id}
                                                onClick={() => openDetails(s)}
                                                className="hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                            >
                                                <td className="px-4 py-3.5 font-semibold text-[var(--text)] max-w-[240px] truncate">
                                                    {s.title}
                                                </td>
                                                <td className="px-4 py-3.5 text-[var(--text-muted)] max-w-[200px] truncate">
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

            {showForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={resetForm}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-base text-[var(--text)]">New Submission</h2>
                            <button
                                onClick={resetForm}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-semibold text-[var(--text)]">
                                    Newsletter Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter newsletter title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1.5 w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-sm text-[var(--text)]"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-[var(--text)]">
                                    Upload Newsletter
                                </label>

                                <label
                                    htmlFor="newsletter-file"
                                    className="mt-1.5 flex flex-col items-center justify-center gap-1.5 w-full border border-dashed border-[var(--border)] rounded-lg py-5 px-3 cursor-pointer hover:border-[#B98B4E] hover:bg-[var(--bg)] transition-colors"
                                >
                                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
                                    </svg>
                                    <span className="text-xs font-semibold text-[var(--text)]">
                                        {file ? file.name : "Click to choose a file"}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        PDF, DOC or DOCX
                                    </span>
                                    <input
                                        id="newsletter-file"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {formError && (
                                <p className="text-red-600 dark:text-red-400 text-[11px]">{formError}</p>
                            )}

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-10 rounded-lg bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] text-xs font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Submitting..." : "Submit Contribution"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="h-10 px-4 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${statusStyles[selected.status]}`}>
                                    {statusLabels[selected.status]}
                                </span>
                                <span
                                    className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                                        isPublished
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {isPublished ? "Published" : "Not Published"}
                                </span>
                            </div>

                            {selected.File && (
                                <div className="flex items-center justify-between gap-3 border border-[var(--border)] rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                                                FILE_TYPE_STYLES[getFileExtension(selected.File.file_name)] || DEFAULT_FILE_TYPE_STYLE
                                            }`}
                                        >
                                            {getFileExtension(selected.File.file_name) || "file"}
                                        </span>
                                        <p className="text-sm font-medium text-[var(--text)] truncate">
                                            {selected.File.file_name || fileNameFromUrl(selected.File.file_url)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={handleViewFile}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Submitted on</span>
                                <span className="font-medium text-[var(--text)]">{formatDate(selected.uploaded_at)}</span>
                            </div>

                            <div className="border-t border-[var(--border)] pt-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2.5">
                                    Approval
                                </p>

                                {hasReview ? (
                                    <div className="flex items-center gap-3">
                                        <Avatar name={selected.approver?.name} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[var(--text)] truncate">
                                                {selected.approver?.name || "Admin"}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {selected.status === "REJECTED" ? "Rejected this submission" : "Approved this submission"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)]">Awaiting review from admin</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[var(--border)] pt-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2.5">
                                    Publish
                                </p>

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                            isPublished
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "border border-dashed border-[var(--border)] text-[var(--text-muted)]"
                                        }`}
                                    >
                                        {isPublished ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--text)]">
                                            {isPublished ? "Published" : "Not published yet"}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {isPublished
                                                ? "Live in the newsletter"
                                                : selected.status === "APPROVED"
                                                ? "Approved, waiting to be published by an admin"
                                                : "Will be published once approved"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
};

export default Contribution;