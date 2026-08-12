// components/FilePreviewModal.tsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
const DOCX_PREVIEWABLE_EXTENSIONS = ["docx", "doc"];
const OFFICE_VIEWABLE_EXTENSIONS = ["ppt", "pptx", "xls", "xlsx"];

const FILE_TYPE_STYLES: Record<string, string> = {
    pdf: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    doc: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    docx: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};
const DEFAULT_FILE_TYPE_STYLE = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3;
const DEFAULT_ZOOM_MULTIPLIER = 0.85;
// Trackpad pinch deltas are much finer-grained than a single wheel "click",
// so we scale deltaY down before applying it as a zoom step, otherwise a
// pinch gesture would jump the zoom level too aggressively.
const PINCH_SENSITIVITY = 0.01;

const DOCX_PREVIEW_OVERRIDE_CSS = `
.docx-preview-container .docx-wrapper {
    background: transparent !important;
    padding: 0 !important;
}

.docx-preview-container .docx-wrapper > section.docx {
    margin: 0 auto 16px auto !important;
    box-shadow: none !important;
}
`;

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [rawBlob, setRawBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [docxRendered, setDocxRendered] = useState(false);

    const [fitScale, setFitScale] = useState(1);
    const [zoomMultiplier, setZoomMultiplier] = useState(DEFAULT_ZOOM_MULTIPLIER);

    const docxOuterRef = useRef<HTMLDivElement | null>(null);
    const docxContentRef = useRef<HTMLDivElement | null>(null);
    const nativeWidthRef = useRef<number>(0);
    // Kept in a ref too so the wheel handler (added once via a plain DOM
    // listener) always reads the latest value without needing to be
    // re-attached on every zoom change.
    const zoomMultiplierRef = useRef(DEFAULT_ZOOM_MULTIPLIER);

    const ext = getFileExtension(file?.file_name);
    const isBlobPreviewable = BLOB_PREVIEWABLE_EXTENSIONS.includes(ext);
    const isDocxPreviewable = DOCX_PREVIEWABLE_EXTENSIONS.includes(ext);
    const isOfficeViewable = OFFICE_VIEWABLE_EXTENSIONS.includes(ext);

    const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

    // Central setter so both button clicks and pinch/wheel go through the
    // same clamp + ref-sync logic.
    const setZoom = useCallback((updater: (prev: number) => number) => {
        setZoomMultiplier((prev) => {
            const next = clampZoom(+updater(prev).toFixed(3));
            zoomMultiplierRef.current = next;
            return next;
        });
    }, []);

    // Fetch blob for anything we render ourselves (images/pdf and now docx)
    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        setBlobUrl(null);
        setRawBlob(null);
        setFailed(false);
        setDocxRendered(false);
        setZoomMultiplier(DEFAULT_ZOOM_MULTIPLIER);
        zoomMultiplierRef.current = DEFAULT_ZOOM_MULTIPLIER;
        setFitScale(1);

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

    // Render the docx at native size (zoom: 1) into the content div
    useEffect(() => {
        if (!isDocxPreviewable || !rawBlob || !docxContentRef.current) return;
        const container = docxContentRef.current;
        container.innerHTML = "";
        container.style.zoom = "1";
        setDocxRendered(false);
        setZoomMultiplier(DEFAULT_ZOOM_MULTIPLIER);
        zoomMultiplierRef.current = DEFAULT_ZOOM_MULTIPLIER;
        renderAsync(rawBlob, container, undefined, {
            className: "docx-preview",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
            experimental: true,
        })
            .then(() => setDocxRendered(true))
            .catch(() => setFailed(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawBlob]);

    // Capture native (unzoomed) width once, then compute + track fitScale as
    // the outer container is resized (responsive behavior).
    useLayoutEffect(() => {
        if (!isDocxPreviewable || !docxRendered) return;

        const outer = docxOuterRef.current;
        const content = docxContentRef.current;
        if (!outer || !content) return;

        const nativeWidth = content.scrollWidth;
        if (nativeWidth > 0) {
            nativeWidthRef.current = nativeWidth;
        }

        const recomputeFit = () => {
            if (!nativeWidthRef.current) return;
            const availableWidth = outer.clientWidth - 32;
            const nextFit = Math.min(availableWidth / nativeWidthRef.current, 1);
            setFitScale(nextFit > 0 ? nextFit : 1);
        };

        recomputeFit();

        const resizeObserver = new ResizeObserver(recomputeFit);
        resizeObserver.observe(outer);

        return () => resizeObserver.disconnect();
    }, [docxRendered, isDocxPreviewable]);

    // Apply the combined scale via `zoom`
    useLayoutEffect(() => {
        if (!isDocxPreviewable || !docxRendered) return;
        const content = docxContentRef.current;
        if (!content) return;

        const effectiveScale = fitScale * zoomMultiplier;
        content.style.zoom = String(effectiveScale);
    }, [fitScale, zoomMultiplier, docxRendered, isDocxPreviewable]);

    // Trackpad pinch-to-zoom support. Browsers report a two-finger pinch
    // gesture as a `wheel` event with `ctrlKey: true` set automatically
    // (this is true even though the user isn't physically pressing Ctrl) —
    // that's how Chrome/Firefox/Safari all signal "this wheel event came
    // from a pinch, not a scroll." We intercept only that case, prevent the
    // browser's native page-zoom, and translate it into our own zoom state.
    // A native (non-passive) listener is required because React's onWheel
    // is passive by default and preventDefault() would be ignored/warn.
    useEffect(() => {
        if (!isDocxPreviewable) return;
        const outer = docxOuterRef.current;
        if (!outer) return;

        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return; // plain scroll — let it through untouched
            e.preventDefault();

            const delta = -e.deltaY * PINCH_SENSITIVITY;
            setZoom((prev) => prev + delta);
        };

        outer.addEventListener("wheel", handleWheel, { passive: false });
        return () => outer.removeEventListener("wheel", handleWheel);
    }, [isDocxPreviewable, docxRendered, setZoom]);

    const zoomPercent = Math.round(fitScale * zoomMultiplier * 100);

    const handleZoomOut = () => setZoom((z) => z - ZOOM_STEP);
    const handleZoomIn = () => setZoom((z) => z + ZOOM_STEP);
    const handleZoomReset = () => setZoom(() => DEFAULT_ZOOM_MULTIPLIER);

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

    const showDocxContent = isDocxPreviewable && !loading && !failed;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <style>{DOCX_PREVIEW_OVERRIDE_CSS}</style>

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
                        {showDocxContent && (
                            <div className="flex items-center gap-1 mr-1 rounded-lg border border-[var(--border)] overflow-hidden">
                                <button
                                    onClick={handleZoomOut}
                                    disabled={zoomMultiplier <= ZOOM_MIN}
                                    aria-label="Zoom out"
                                    className="w-7 h-7 flex items-center justify-center text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm font-semibold"
                                >
                                    −
                                </button>
                                <button
                                    onClick={handleZoomReset}
                                    title="Reset zoom"
                                    className="min-w-[3.25rem] h-7 px-1.5 flex items-center justify-center text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] cursor-pointer transition-colors border-x border-[var(--border)]"
                                >
                                    {zoomPercent}%
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={zoomMultiplier >= ZOOM_MAX}
                                    aria-label="Zoom in"
                                    className="w-7 h-7 flex items-center justify-center text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm font-semibold"
                                >
                                    +
                                </button>
                            </div>
                        )}

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

                <div className="flex-1 min-h-0 bg-[var(--bg)] overflow-hidden">
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
                        <>
                            {loading && (
                                <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
                                    Loading preview...
                                </div>
                            )}
                            {failed && (
                                <PreviewFallback onDownload={handleDownload} downloading={downloading} />
                            )}
                            <div
                                ref={docxOuterRef}
                                className="docx-preview-container w-full h-full overflow-auto p-4"
                                style={{ display: showDocxContent ? "block" : "none" }}
                            >
                                <div ref={docxContentRef} />
                            </div>
                        </>
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