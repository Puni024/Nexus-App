// components/MainBar.tsx
import { Users } from "./applications/Users";
import  NexusLogo  from "./NexusLogo";

export function MainBar() {
    return (
        <main className="flex-1 overflow-y-auto p-3.5 md:p-7">
            <div className="max-w-5xl mx-auto">

                <Users />
            </div>
        </main>
    );
}