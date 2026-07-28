import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import NexusLogo from "./NexusLogo";
import type { Section } from "../Types/Filtes";

interface AppLayoutProps {
  section: Section;
}

function AppLayout({ section }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative h-screen w-full bg-[#EDE6D6] dark:bg-[#211D18] text-[#2B2620] dark:text-[#EDE6D6] flex overflow-hidden transition-colors">

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
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <Sidebar
        role={section === "admin" ? "admin" : "user"}
        section={section}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar section={section} setMobileNavOpen={setMobileNavOpen} />

        <main className="flex-1 overflow-auto bg-[#EDE6D6] dark:bg-[#211D18] transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;