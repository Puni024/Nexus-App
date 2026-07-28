import { Link, useLocation } from "react-router-dom";

import { NavIcon } from "./NavIcon";
import { useAuth } from "../context/AuthContext";
import { getRoutesForSection } from "../config/helper";
import type { Section, Role } from "../Types/Filtes";

interface SidebarProps {
    role: Role;
    section: Section;
    mobileNavOpen: boolean;
    setMobileNavOpen: (open: boolean) => void;
}

const sidebarThemes: Record<Role, { bg: string; accent: string; accentText: string; label: string }> = {
    admin: { bg: "#1F1B1B", accent: "#B33A3A", accentText: "#F5B8B8", label: "Nexus Admin" },
    user:  { bg: "#2B2620", accent: "#B98B4E", accentText: "#F0C482", label: "Nexus" },
};

export function Sidebar({ role, section, mobileNavOpen, setMobileNavOpen }: SidebarProps) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const theme = sidebarThemes[role];

    const navItems = user ? getRoutesForSection(section, user.role) : [];

    const renderNavLink = (item: ReturnType<typeof getRoutesForSection>[number], onClick?: () => void) => {
        const to = `/${section}/${item.path}`;
        const isActive = location.pathname === to;

        return (
            <Link
                key={item.path}
                to={to}
                onClick={onClick}
                className="relative w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-xs font-medium transition-colors text-[#D8CDB8] hover:bg-white/5 hover:text-[#EDE6D6]"
                style={isActive ? { backgroundColor: "#3A332B", color: theme.accentText } : undefined}
            >
                {isActive && (
                    <span
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                        style={{ backgroundColor: theme.accent }}
                    />
                )}
                <NavIcon name={item.icon} />
                {item.label}
            </Link>
        );
    };

    return (
        <>
            {/* Sidebar - desktop */}
            <aside
                className="hidden md:flex md:w-[194px] flex-col text-[#EDE6D6] shrink-0"
                style={{ backgroundColor: theme.bg }}
            >
                <div className="px-[18px] py-[18px] flex items-center gap-2 border-b border-white/10">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: theme.accent }}
                    >
                        <svg className="w-3.5 h-3.5 text-[#2B2620]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" />
                        </svg>
                    </div>
                    <span className="font-serif text-sm tracking-wide">{theme.label}</span>
                </div>

                <nav className="flex-1 px-2 py-[18px] space-y-1">
                    {navItems.map((item) => renderNavLink(item))}
                </nav>

                <div className="px-2 py-[18px] border-t border-white/10">
                    <button
                        className="w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-xs font-medium text-[#D8CDB8] hover:bg-white/5 hover:text-[#EDE6D6] transition-colors"
                        onClick={logout}
                    >
                        <NavIcon name="logout" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Sidebar - mobile */}
            {mobileNavOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNavOpen(false)} />

                    <aside
                        className="relative w-[208px] flex flex-col text-[#EDE6D6]"
                        style={{ backgroundColor: theme.bg }}
                    >
                        <div className="px-[18px] py-[18px] flex items-center gap-2 border-b border-white/10">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: theme.accent }}
                            >
                                <svg className="w-3.5 h-3.5 text-[#2B2620]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" />
                                </svg>
                            </div>
                            <span className="font-serif text-sm tracking-wide">{theme.label}</span>
                        </div>

                        <nav className="flex-1 px-2 py-[18px] space-y-1">
                            {navItems.map((item) => renderNavLink(item, () => setMobileNavOpen(false)))}
                        </nav>

                        <div className="px-2 py-[18px] border-t border-white/10">
                            <button
                                className="w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-xs font-medium text-[#D8CDB8] hover:bg-white/5 hover:text-[#EDE6D6] transition-colors"
                                onClick={logout}
                            >
                                <NavIcon name="logout" />
                                Log out
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}