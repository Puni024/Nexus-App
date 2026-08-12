import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NavIcon } from "./NavIcon";
import { UserAvatar } from "./UserAvatar.tsx";
import { useAuth } from "../context/AuthContext";
import { getRoutesForSection } from "../config/helper";
import type { Section } from "../Types/Filtes";

interface TopbarProps {
    section: Section;
    setMobileNavOpen: (v: boolean) => void;
}

export function Topbar({ section, setMobileNavOpen }: TopbarProps) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const routes = user ? getRoutesForSection(section, user.role) : [];
    const current = routes.find((r) => location.pathname === `/${section}/${r.path}`);

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const goToSettings = () => {
        setProfileOpen(false);
        navigate(`/${section}/settings`);
    };

    const handleLogout = () => {
        setProfileOpen(false);
        logout();
    };

    return (
        <header className="h-[52px] shrink-0 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between px-3 md:px-6 transition-colors">

            <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => setMobileNavOpen(true)} className="md:hidden text-[var(--text)]">
                    <NavIcon name="menu" />
                </button>

                <h1 className="font-serif text-base md:text-lg truncate text-[var(--text)]">
                    {current?.label}
                </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">

                {/* Notification icon */}
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)] transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen((v) => !v)}
                        className="w-8 h-8 rounded-full border border-[var(--border)] bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#B98B4E] transition-all"
                    >
                        <UserAvatar
                            profile={user?.info.picture}
                            name={user?.name}
                            textClassName="text-xs font-semibold text-[var(--text)]"
                        />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="px-3.5 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                                    <UserAvatar
                                        profile={user?.info.picture}
                                        name={user?.name}
                                        textClassName="text-xs font-semibold text-[var(--text)]"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[var(--text)] truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={goToSettings}
                                className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                            >
                                Account settings
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-[var(--border)] cursor-pointer"
                            >
                                Log out
                            </button>
                        </div>
                    )}
                </div>

            </div>

        </header>
    );
}