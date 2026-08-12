import { useEffect, useRef, useState } from "react";

export function resolveProfileSrc(profile?: string | null): string | null {
    if (!profile) return null;

    const value = profile.trim();
    if (!value) return null;

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (value.startsWith("data:")) {
        return value;
    }

    return `data:image/png;base64,${value}`;
}

type ImgStatus = "empty" | "loading" | "loaded" | "error";

export function UserAvatar({
    name,
    profile,
    className,
    textClassName,
}: {
    name?: string;
    profile?: string | null;
    className?: string;
    textClassName?: string;
}) {
    const src = resolveProfileSrc(profile);
    const imgRef = useRef<HTMLImageElement>(null);
    const [status, setStatus] = useState<ImgStatus>(src ? "loading" : "empty");

    // Reset status whenever the picture prop actually changes
    // (fixes avatars getting stuck on the fallback after upload / user switch)
    useEffect(() => {
        if (!src) {
            setStatus("empty");
            return;
        }

        setStatus("loading");

        requestAnimationFrame(() => {
            const img = imgRef.current;
            if (img?.complete) {
                setStatus(img.naturalWidth > 0 ? "loaded" : "error");
            }
        });
    }, [src]);

    if (status === "empty" || status === "error") {
        return <span className={textClassName}>{name?.charAt(0).toUpperCase()}</span>;
    }

    return (
        <img
            ref={imgRef}
            src={src as string}
            alt={name}
            // No referrerPolicy override — Google's photo CDN can reject
            // no-referrer requests, which is why People's avatars worked
            // and these didn't.
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={`w-[85%] h-[85%] object-cover ${className ?? ""}`}
        />
    );
}