import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import NexusLogo from "../components/NexusLogo";

function Home() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="relative h-screen w-full bg-[#EDE6D6] text-[#2B2620] flex overflow-hidden">

            {/* Grain overlay */}
            <svg className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.05] mix-blend-multiply z-50">
                <filter id="grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.85"
                        numOctaves="2"
                        stitchTiles="stitch"
                    />
                </filter>

                <NexusLogo />

                <rect
                    width="100%"
                    height="100%"
                    filter="url(#grain)"
                />
            </svg>

            <Sidebar
                mobileNavOpen={mobileNavOpen}
                setMobileNavOpen={setMobileNavOpen}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                    setMobileNavOpen={setMobileNavOpen}
                />

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Home;