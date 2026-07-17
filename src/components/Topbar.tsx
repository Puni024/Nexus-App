import { NavIcon } from "./NavIcon";

import { useLocation } from "react-router-dom";

import { sidebarItems } from "../config/sidebar";
import { useAuth } from "../context/AuthContext";

interface TopbarProps {
    setMobileNavOpen: (open: boolean) => void;
}

export function Topbar({
    setMobileNavOpen,
}: TopbarProps) {

    const location = useLocation();

    const { user } = useAuth();

    const current = sidebarItems.find(
        (item) => item.route === location.pathname
    );

    return (
        <header className="h-[52px] shrink-0 bg-[#F5EFE4] border-b border-[#D8CDB8] flex items-center justify-between px-3 md:px-6">

            <div className="flex items-center gap-2 min-w-0">

                <button
                    onClick={() => setMobileNavOpen(true)}
                    className="md:hidden text-[#2B2620]"
                >
                    <NavIcon name="menu" />
                </button>

                <h1 className="font-serif text-base md:text-lg truncate">
                    {current?.label}
                </h1>

            </div>

            <div className="flex items-center gap-3 shrink-0">

                <div className="hidden sm:flex items-center h-8 px-3 rounded-full bg-[#EDE6D6] border border-[#D8CDB8]">
                    <svg
                        className="w-3 h-3 text-[#8C8272]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                    </svg>

                    <input
                        type="text"
                        placeholder="Search"
                        className="ml-1.5 bg-transparent outline-none text-xs w-24 placeholder:text-[#8C8272]"
                    />
                </div>

                <div className="w-7 h-7 rounded-full bg-[#B98B4E] flex items-center justify-center text-[#2B2620] font-semibold text-xs">
                    {user?.name.charAt(0).toUpperCase()}
                </div>

            </div>

        </header>
    );
}