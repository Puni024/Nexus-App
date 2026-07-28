import { useAuth } from "../context/AuthContext";

function PendingVerification() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen w-full bg-[#EDE6D6] text-[#2B2620] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#F5EFE4] border border-[#D8CDB8] rounded-lg p-8 flex flex-col items-center text-center gap-4">

                <div className="w-14 h-14 rounded-full bg-[#B98B4E]/15 flex items-center justify-center">
                    <svg
                        className="w-7 h-7 text-[#B98B4E]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                    </svg>
                </div>

                <h1 className="font-serif text-xl">
                    Account Verification Pending
                </h1>

                <p className="text-sm text-[#8C8272]">
                    Your account is currently under review. An administrator needs to
                    approve your account before you can access the dashboard.
                </p>

                <div className="w-full bg-[#EDE6D6] border border-[#D8CDB8] rounded-md p-3 text-left space-y-1">
                    <p className="text-xs text-[#8C8272] uppercase tracking-wide">
                        Name
                    </p>
                    <p className="text-sm font-medium">{user?.name}</p>
                </div>

                <p className="text-xs text-[#8C8272]">
                    You'll be able to sign in normally once your account is approved.
                </p>

                <button
                    onClick={logout}
                    className="mt-2 text-xs font-medium px-4 py-2 rounded-md bg-[#2B2620] text-[#EDE6D6] hover:bg-[#3A332B] transition-colors"
                >
                    Log out
                </button>

            </div>
        </div>
    );
}

export default PendingVerification;