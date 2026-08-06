import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

interface FileRecord {
    file_id: number;
    file_name: string;
    file_url: string;
}


const FILE_TYPE_STYLES: Record<string, string> = {
    pdf: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    doc: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    docx: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};
const DEFAULT_FILE_TYPE_STYLE = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

const AllFiles = () => {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null); // which row is downloading

    const fetchFiles = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const { data } = await api.get("/admin/users/files");
            setFiles(data ?? []);
        } catch {
            setLoadError("Couldn't load files. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const filteredFiles = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return files;
        return files.filter((f) => f.file_name?.toLowerCase().includes(q));
    }, [files, query]);

    function getFileExtension(name?: string): string {
    if (!name) return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

const OFFICE_VIEWABLE_EXTENSIONS = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"];

const handleView = (file: FileRecord) => {
    const ext = getFileExtension(file.file_name);

    if (OFFICE_VIEWABLE_EXTENSIONS.includes(ext)) {
        // Office Online viewer needs a publicly reachable, URL-encoded source link
        const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
            file.file_url
        )}`;
        window.open(viewerUrl, "_blank", "noreferrer");
        return;
    }

    // PDFs (and other browser-renderable types) can open directly
    window.open(file.file_url, "_blank", "noreferrer");
};

    const handleDownload = async (file: FileRecord) => {
        try {
            setBusyId(file.file_id);
            const res = await fetch(file.file_url);
            if (!res.ok) throw new Error("Fetch failed");
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = file.file_name || "file";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch {
            window.open(file.file_url, "_blank", "noreferrer");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--bg)] transition-colors">

            {/* Page header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] truncate">
                        All Files
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                        Browse and download every uploaded file
                    </p>
                </div>

                {/* Search - pill style, distinct from the Contribution page's inputs */}
                <div className="relative w-full max-w-xs shrink-0">
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
                        placeholder="Search files..."
                        className="w-full h-10 pl-10 pr-4 rounded-full border border-[var(--border)] bg-[var(--card)] focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                <div className="w-full">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden transition-colors">

                        {loading ? (
                            <div className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
                                Loading files...
                            </div>
                        ) : loadError ? (
                            <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                                <p className="text-sm font-semibold text-[var(--text)]">{loadError}</p>
                                <button
                                    onClick={fetchFiles}
                                    className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                                <div className="w-11 h-11 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-[var(--text)]">
                                    {query ? "No files match your search" : "No files uploaded yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] text-left">
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Name</th>
                                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] w-28 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {filteredFiles.map((f) => {
                                            const ext = getFileExtension(f.file_name);
                                            const isBusy = busyId === f.file_id;
                                            return (
                                                <tr key={f.file_id} className="hover:bg-[var(--bg)] transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span
                                                                className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${FILE_TYPE_STYLES[ext] || DEFAULT_FILE_TYPE_STYLE
                                                                    }`}
                                                            >
                                                                {ext || "file"}
                                                            </span>
                                                            <span className="font-medium text-[var(--text)] truncate">
                                                                {f.file_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleView(f)}
                                                                aria-label="View file"
                                                                title="View"
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                                                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownload(f)}
                                                                disabled={isBusy}
                                                                aria-label="Download file"
                                                                title="Download"
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                                            >
                                                                {isBusy ? (
                                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllFiles;