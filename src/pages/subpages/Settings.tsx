import { useRef, useState } from "react";

import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import type { Theme } from "../../Types/Filtes";
import { UserAvatar } from "../../components/UserAvatar";

function Settings() {

    const { user, theme, logout, updateUser, showToast } = useAuth();

    // ---------------- NAME EDIT ----------------

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [savingName, setSavingName] = useState(false);

    const handleSaveName = async () => {
        if (!name.trim() || name.trim() === user?.name) return;
        setSavingName(true);
        try {
            const { data } = await api.patch("/auth/user/updateprofile", { name: name.trim() });
            updateUser({
                name: data.user?.name ?? name.trim(),
            });
            showToast("Profile updated", "success");
            setEditingName(false);
        } catch {
            showToast("Failed to update name", "error");
        } finally {
            setSavingName(false);
        }
    };

    // ---------------- PROFILE PHOTO ----------------

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please select an image file", "error");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast("Image must be under 2MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;

            setUploadingPhoto(true);
            try {
                const { data } = await api.patch("/auth/user/updateprofile", { picture: base64 });
                updateUser({ info: { picture: data.user?.picture ?? base64 } });
                showToast("Profile photo updated", "success");
            } catch {
                showToast("Failed to update photo", "error");
            } finally {
                setUploadingPhoto(false);
            }
        };
        reader.readAsDataURL(file);

        e.target.value = ""; // allow re-selecting same file later
    };

    // ---------------- THEME ----------------

    const [savingTheme, setSavingTheme] = useState(false);

    const handleUpdateTheme = async (mode: Theme) => {
        if (mode === theme) return;

        const prev = theme;
        updateUser({ info: { Theme: mode } });
        setSavingTheme(true);
        try {
            await api.patch("/auth/user/updateprofile", { Theme: mode });
        } catch {
            updateUser({ info: { Theme: prev } });
            showToast("Failed to update theme", "error");
        } finally {
            setSavingTheme(false);
        }
    };

    // ---------------- PASSWORD ----------------

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [savingPassword, setSavingPassword] = useState(false);

    const handleChangePassword = async () => {
        setPasswordError(null);

        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        setSavingPassword(true);
        try {
            await api.patch("/auth/user/updateprofile", { newPassword });
            showToast("Password updated", "success");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch (error: any) {
            setPasswordError(
                error.response?.data?.message || "Failed to update password."
            );
        } finally {
            setSavingPassword(false);
        }
    };

    // ---------------- DELETE ACCOUNT ----------------

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete("/auth/user/account");
            await logout();
        } catch {
            showToast("Failed to delete account", "error");
            setDeleting(false);
        }
    };

    const isLocal = user?.provider !== "google";
    const isAdmin = user?.role === "admin";

    return (
        <div className="w-full min-h-full bg-[var(--bg)] px-4 sm:px-8 py-6 sm:py-8 transition-colors">
            <div className="w-full max-w-5xl mx-auto space-y-6">

                {/* THEME */}
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-sm text-[var(--text)]">Theme</h2>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                Choose how the app looks to you.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] shrink-0">
                            <button
                                onClick={() => handleUpdateTheme("light")}
                                disabled={savingTheme}
                                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition disabled:opacity-60 cursor-pointer ${theme === "light"
                                    ? "bg-[#2B2620] text-[#EDE6D6]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="4" />
                                    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                                </svg>
                                Light
                            </button>

                            <button
                                onClick={() => handleUpdateTheme("dark")}
                                disabled={savingTheme}
                                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition disabled:opacity-60 cursor-pointer ${theme === "dark"
                                    ? "bg-[#2B2620] text-[#EDE6D6]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                </svg>
                                Dark
                            </button>
                        </div>
                    </div>
                </section>

                {/* ACCOUNT SETTINGS */}
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 transition-colors">
                    <h2 className="font-semibold text-sm text-[var(--text)] mb-4">Account Settings</h2>

                    <div className="space-y-4">
                        {/* Profile photo */}
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[#2B2620] font-semibold text-lg overflow-hidden">
                                    <UserAvatar
                                        profile={user?.info.picture}
                                        name={user?.name}
                                        textClassName="text-lg font-semibold text-[#2B2620] dark:text-[#EDE6D6]"
                                    />
                                </div>

                                <button
                                    onClick={handlePhotoClick}
                                    disabled={uploadingPhoto}
                                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#2B2620] dark:bg-[#EDE6D6] border-2 border-[var(--card)] flex items-center justify-center text-[#EDE6D6] dark:text-[#2B2620] disabled:opacity-50 cursor-pointer"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828H9V13z" />
                                    </svg>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-[var(--text)]">Profile photo</p>
                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                    {uploadingPhoto ? "Uploading..." : "JPG or PNG, up to 2MB"}
                                </p>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-[11px] font-semibold text-[var(--text)]">Name</label>
                            <div className="flex items-center gap-2 mt-1">
                                {editingName ? (
                                    <>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none text-xs text-[var(--text)]"
                                        />
                                        <button
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                            className="h-9 px-3 rounded-lg bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setName(user?.name ?? "");
                                                setEditingName(false);
                                            }}
                                            className="h-9 px-3 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm text-[var(--text)]">{user?.name}</span>
                                        <button
                                            onClick={() => setEditingName(true)}
                                            className="text-[11px] font-semibold text-[#B98B4E] hover:underline cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="text-[11px] font-semibold text-[var(--text)]">Email</label>
                            <p className="mt-1 text-sm text-[var(--text)]">{user?.email}</p>
                        </div>

                        {/* Verified */}
                        <div>
                            <label className="text-[11px] font-semibold text-[var(--text)]">Verification Status</label>
                            <p className="mt-1">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${user?.isVerified
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                        }`}
                                >
                                    {user?.isVerified ? "Verified" : "Pending Verification"}
                                </span>
                            </p>
                        </div>

                        {/* Signed in with */}
                        <div>
                            <label className="text-[11px] font-semibold text-[var(--text)]">Signed in with</label>
                            <p className="mt-1 text-sm text-[var(--text)] capitalize">
                                {user?.provider === "google" ? "Google" : "Email & Password"}
                            </p>
                        </div>

                        {/* Change password - only for local accounts */}
                        {isLocal && (
                            <div className="pt-2 border-t border-[var(--border)]">
                                {!showPasswordForm ? (
                                    <button
                                        onClick={() => setShowPasswordForm(true)}
                                        className="text-[11px] font-semibold text-[#B98B4E] hover:underline cursor-pointer"
                                    >
                                        Change password
                                    </button>
                                ) : (
                                    <div className="space-y-2 mt-2">
                                        <input
                                            type="password"
                                            placeholder="New password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none text-xs text-[var(--text)]"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none text-xs text-[var(--text)]"
                                        />
                                        {passwordError && (
                                            <p className="text-red-600 dark:text-red-400 text-[11px]">{passwordError}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={savingPassword}
                                                className="h-9 px-3 rounded-lg bg-[#2B2620] dark:bg-[#EDE6D6] text-[#EDE6D6] dark:text-[#2B2620] text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                                            >
                                                Update password
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setPasswordError(null);
                                                    setNewPassword("");
                                                    setConfirmPassword("");
                                                }}
                                                className="h-9 px-3 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* DANGER ZONE - hidden for admins */}
                {!isAdmin && (
                    <section className="bg-[var(--card)] border border-red-200 dark:border-red-900/40 rounded-lg p-5 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="font-semibold text-sm text-red-700 dark:text-red-400">Danger Zone</h2>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
                                </svg>
                                Under development
                            </span>
                        </div>

                        <p className="text-xs text-[var(--text-muted)] mb-3">
                            Deleting your account is permanent and cannot be undone.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled
                                title="This feature is still under development"
                                className="h-9 px-3 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold opacity-50 cursor-not-allowed"
                            >
                                Delete account
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                                    Are you sure? This action cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="h-9 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-50"
                                    >
                                        {deleting ? "Deleting..." : "Yes, delete my account"}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="h-9 px-3 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                )}

            </div>
        </div>
    );
}

export default Settings;