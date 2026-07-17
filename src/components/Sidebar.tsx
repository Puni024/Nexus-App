import { Link, useLocation } from "react-router-dom";

import { NavIcon } from "./NavIcon";
import { useAuth } from "../context/AuthContext";
import { sidebarItems } from "../config/sidebar";

interface SidebarProps {
    mobileNavOpen: boolean;
    setMobileNavOpen: (open: boolean) => void;
}

export function Sidebar({
    mobileNavOpen,
    setMobileNavOpen,
}: SidebarProps) {
    const { logout, user } = useAuth();

    const location = useLocation();

    const navItems = sidebarItems.filter((item) =>
        item.roles.includes(user!.role)
    );

    return (
        <>
            {/* Sidebar - desktop */}
            <aside className="hidden md:flex md:w-[194px] flex-col bg-[#2B2620] text-[#EDE6D6] shrink-0">

                <div className="px-[18px] py-[18px] flex items-center gap-2 border-b border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-[#B98B4E] flex items-center justify-center shrink-0">
                        <svg
                            className="w-3.5 h-3.5 text-[#2B2620]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"
                            />
                        </svg>
                    </div>

                    <span className="font-serif text-sm tracking-wide">
                        Nexus
                    </span>
                </div>

                <nav className="flex-1 px-2 py-[18px] space-y-1">

                    {navItems.map((item) => {

                        const isActive =
                            location.pathname === item.route;

                        return (
                            <Link
                                key={item.label}
                                to={item.route}
                                className={`relative w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-xs font-medium transition-colors
                                ${
                                    isActive
                                        ? "bg-[#3A332B] text-[#F0C482]"
                                        : "text-[#D8CDB8] hover:bg-white/5 hover:text-[#EDE6D6]"
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[#B98B4E]" />
                                )}

                                <NavIcon name={item.icon} />

                                {item.label}
                            </Link>
                        );
                    })}
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

                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setMobileNavOpen(false)}
                    />

                    <aside className="relative w-[208px] bg-[#2B2620] text-[#EDE6D6] flex flex-col">

                        <div className="px-[18px] py-[18px] flex items-center gap-2 border-b border-white/10">
                            <div className="w-7 h-7 rounded-lg bg-[#B98B4E] flex items-center justify-center shrink-0">
                                <svg
                                    className="w-3.5 h-3.5 text-[#2B2620]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"
                                    />
                                </svg>
                            </div>

                            <span className="font-serif text-sm tracking-wide">
                                Nexus
                            </span>
                        </div>

                        <nav className="flex-1 px-2 py-[18px] space-y-1">

                            {navItems.map((item) => {

                                const isActive =
                                    location.pathname === item.route;

                                return (
                                    <Link
                                        key={item.label}
                                        to={item.route}
                                        onClick={() =>
                                            setMobileNavOpen(false)
                                        }
                                        className={`relative w-full flex items-center gap-2 px-2 py-[7px] rounded-md text-xs font-medium transition-colors
                                        ${
                                            isActive
                                                ? "bg-[#3A332B] text-[#F0C482]"
                                                : "text-[#D8CDB8] hover:bg-white/5 hover:text-[#EDE6D6]"
                                        }`}
                                    >
                                        {isActive && (
                                            <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[#B98B4E]" />
                                        )}

                                        <NavIcon name={item.icon} />

                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}