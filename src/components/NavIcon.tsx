// components/NavIcon.tsx
export function NavIcon({ name }: { name: string }) {
    const common = {
        className: "w-5 h-5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        viewBox: "0 0 24 24",
    };

    switch (name) {
        case "home":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
                </svg>
            );
        case "users":
            return (
                <svg {...common}>
                    <circle cx="9" cy="8" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20c0-3 2.7-5 6-5s6 2 6 5M15 8a3 3 0 110-6M21 20c0-2.5-2-4.3-4.5-4.9" />
                </svg>
            );
        case "chart":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M12 20V4M20 20v-7" />
                </svg>
            );
        case "gear":
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6h.1a1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
                </svg>
            );
        case "logout":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l-4 6 4 6M5 12h13M16 6v-.5A1.5 1.5 0 0117.5 4h2A1.5 1.5 0 0121 5.5v13a1.5 1.5 0 01-1.5 1.5h-2a1.5 1.5 0 01-1.5-1.5V18" />
                </svg>
            );
        case "menu":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
            );
        default:
            return null;
    }
}