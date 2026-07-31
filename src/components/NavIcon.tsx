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
        
            case "reports":
            return (
                <svg {...common}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 3h6l5 5v13a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 3v5h5"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 13h6M9 17h6"
                    />
                </svg>
            );
        
            case "contribution":
            return (
                <svg {...common}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 20h4l10-10-4-4L4 16v4z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 5l4 4"
                    />
                </svg>
            );
        
            case "folder":
            return (
                <svg {...common}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    />
                </svg>
            );
        
            case "newsletter":
            return (
                <svg {...common}>
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 8h10M7 12h10M7 16h6"
                    />
                </svg>
            );

            case "people":
                return (
                    <svg {...common}>
                        <circle cx="9" cy="8" r="2.5" />
                        <circle cx="16.5" cy="9.5" r="2" />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 19c0-2.5 2.2-4.5 5-4.5S14 16.5 14 19"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 18c.4-1.7 1.8-3 3.5-3s2.5.8 3 2"
                        />
                    </svg>
                );

            case "publish":
                return (
                    <svg {...common}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16V5"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 9l4-4 4 4"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 20h14"
                        />
                    </svg>
                );

            case "approval":
                return (
                    <svg {...common}>
                        <circle cx="12" cy="12" r="9" />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.5 12.5l2.5 2.5 4.5-5"
                        />
                    </svg>
                );
            
            default:
                return null;
    }
}