import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import type { ToastType } from "../Types/Filtes";

const typeStyles: Record<ToastType, string> = {
    success: "bg-[#2E7D32] text-white",
    error: "bg-[#B33A3A] text-white",
    info: "bg-[#2B2620] text-[#EDE6D6]",
};

function Toaster() {
    const { toasts } = useAuth();

    return createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto px-4 py-2.5 rounded-md text-sm font-medium shadow-lg ${typeStyles[toast.type]} animate-[fadeIn_0.2s_ease-out]`}
                >
                    {toast.message}
                </div>
            ))}
        </div>,
        document.body
    );
}

export default Toaster;