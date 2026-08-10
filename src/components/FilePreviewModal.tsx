// components/FilePreviewModal.tsx
import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import api from "../utils/api";

export interface PreviewableFile {
    file_id: number;
    file_name: string;
    file_url: string;
}

interface FilePreviewModalProps {
    file: PreviewableFile | null;
    onClose: () => void;
}

function getFileExtension(name?: string): string {
    if (!name) return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

const BLOB_PREVIEWABLE_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "gif", "webp", "svg"];
// docx/doc now render client-side via docx-preview, not Office Online's iframe
const DOCX_PREVIEWABLE_EXTENSIONS = ["docx", "doc"];
// ppt/xls still go through Microsoft's viewer since there's no good client-side lib for those
const OFFICE_VIEWABLE_EXTENSIONS = ["ppt", "pptx", "xls", "xlsx"];

const FILE_TYPE_STYLES: Record<string, string> = {
    pdf: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    doc: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    docx: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};
const DEFAULT_FILE_TYPE_STYLE = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [rawBlob, setRawBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const docxContainerRef = useRef<HTMLDivElement | null>(null);

    const ext = getFileExtension(file?.file_name);
    const isBlobPreviewable = BLOB_PREVIEWABLE_EXTENSIONS.includes(ext);
    const isDocxPreviewable = DOCX_PREVIEWABLE_EXTENSIONS.includes(ext);
    const isOfficeViewable = OFFICE_VIEWABLE_EXTENSIONS.includes(ext);

    // Fetch blob for anything we render ourselves (images/pdf and now docx)
    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        setBlobUrl(null);
        setRawBlob(null);
        setFailed(false);

        if (file && (isBlobPreviewable || isDocxPreviewable)) {
            setLoading(true);
            api
                .get(`/auth/files/${file.file_id}/stream`, { responseType: "blob" })
                .then((res) => {
                    if (cancelled) return;
                    if (isBlobPreviewable) {
                        objectUrl = URL.createObjectURL(res.data);
                        setBlobUrl(objectUrl);
                    } else if (isDocxPreviewable) {
                        setRawBlob(res.data);
                    }
                })
                .catch(() => {
                    if (!cancelled) setFailed(true);
                })
                .finally(() => {
                    if (!cancelled) setLoading(false);
                });
        }

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file?.file_id]);

    // Render the docx into the container once we have the blob
    useEffect(() => {
        if (!isDocxPreviewable || !rawBlob || !docxContainerRef.current) return;
        const container = docxContainerRef.current;
        container.innerHTML = "";
        renderAsync(rawBlob, container, undefined, {
            className: "docx-preview",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
        }).catch(() => setFailed(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawBlob]);

    const handleDownload = async () => {
        if (!file) return;
        try {
            setDownloading(true);
            const res = await api.get(`/auth/files/${file.file_id}/stream`, { responseType: "blob" });
            const objectUrl = URL.createObjectURL(res.data);
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
            setDownloading(false);
        }
    };

    if (!file) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl h-[85vh] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--card)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                                FILE_TYPE_STYLES[ext] || DEFAULT_FILE_TYPE_STYLE
                            }`}
                        >
                            {ext || "file"}
                        </span>
                        <p className="text-sm font-semibold text-[var(--text)] truncate">{file.file_name}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />
                            </svg>
                            {downloading ? "Downloading..." : "Download"}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 bg-[var(--bg)] overflow-auto">
                    {isBlobPreviewable ? (
                        loading ? (
                            <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
                                Loading preview...
                            </div>
                        ) : failed || !blobUrl ? (
                            <PreviewFallback onDownload={handleDownload} downloading={downloading} />
                        ) : ext === "pdf" ? (
                            <iframe src={blobUrl} title={file.file_name} className="w-full h-full border-0" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={blobUrl}
                                    alt={file.file_name}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </div>
                        )
                    ) : isDocxPreviewable ? (
                        loading ? (
                            <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
                                Loading preview...
                            </div>
                        ) : failed ? (
                            <PreviewFallback onDownload={handleDownload} downloading={downloading} />
                        ) : (
                            <div ref={docxContainerRef} className="w-full h-full p-6" />
                        )
                    ) : isOfficeViewable ? (
                        <iframe
                            src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.file_url)}`}
                            title={file.file_name}
                            className="w-full h-full border-0"
                        />
                    ) : (
                        <PreviewFallback onDownload={handleDownload} downloading={downloading} />
                    )}
                </div>
            </div>
        </div>
    );
}

function PreviewFallback({ onDownload, downloading }: { onDownload: () => void; downloading: boolean }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-8 gap-3">
            <p className="text-sm font-semibold text-[var(--text)]">Unable to preview this file here</p>
            <p className="text-xs text-[var(--text-muted)] max-w-sm">
                This file type can't be shown inline. Try downloading it instead.
            </p>
            <button
                onClick={onDownload}
                disabled={downloading}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
                {downloading ? "Downloading..." : "Download"}
            </button>
        </div>
    );
}