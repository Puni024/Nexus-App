import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NexusLogo from "../components/NexusLogo";
import { GoogleLogin } from "@react-oauth/google";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

import { loginSchema, type LoginFormData } from "../schemas/formSchema";
import { registerSchema, type RegisterFormData } from "../schemas/formSchema";

function Login() {

    const { login } = useAuth();
    const [showSuccess, setShowSuccess] = useState<"login" | "register">();
    const [loginError, setLoginError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [isRegisterView, setIsRegisterView] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    // --- Google button ready-state ---
    const [googleReady, setGoogleReady] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        // Poll for the Google Identity Services script to finish initializing.
        // This prevents the "placeholder button -> real button" flash on production.
        let cancelled = false;

        const checkGoogleReady = () => {
            if (cancelled) return;

            const w = window as any;
            if (w.google?.accounts?.id) {
                setGoogleReady(true);
            } else {
                setTimeout(checkGoogleReady, 100);
            }
        };

        checkGoogleReady();

        return () => {
            cancelled = true;
        };
    }, []);

    const {
        register,
        handleSubmit,
        reset: resetLoginForm,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const {
        register: registerField,
        handleSubmit: handleRegisterSubmit,
        reset: resetRegisterForm,
        formState: { errors: registerErrors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoginError(null);

            await api.post("/auth/login", {
                email: data.email,
                password: data.password,
            });

            setShowSuccess("login");

            setTimeout(() => {
                login();
                setShowSuccess(undefined);
            }, 1500);

        } catch (error: any) {
            setLoginError(
                error.response?.data?.message || "Login failed. Please try again."
            );
        }
    };

    const googleLogin = async (googlecredential: string) => {

        try {
            setGoogleLoading(true);
            setLoginError(null);

            const res = await api.post("/auth/google", {
                token: googlecredential,
            });

            if (!res) {
                setLoginError("Login failed. Please try again.");
                setGoogleLoading(false);
                return;
            }

            if (res.status === 200) {
                setShowSuccess("login");

                setTimeout(() => {
                    login();
                    setShowSuccess(undefined);
                    setGoogleLoading(false);
                }, 1500);
            }

        } catch (error) {
            setLoginError("Google login failed. Please try again.");
            setGoogleLoading(false);
        }

    };

    const onRegisterSubmit = async (data: RegisterFormData) => {

        try {
            const res = await api.post("/auth/register", {
                name: data.name,
                email: data.email,
                password: data.password,
            });
            if (!res || res.status !== 201) {
                throw new Error(res?.data?.message);
            }

            setShowSuccess("register");

            setTimeout(() => {
                resetRegisterForm();   // clear register form fields
                resetLoginForm();      // ensure login form is empty when we land back on it
                setLoginError(null);
                setIsRegisterView(false);
                setShowSuccess(undefined);
            }, 1500);

        } catch (error: any) {
            setRegisterError(
                error.response?.data?.message || "Registration failed.2.0"
            );
        }

    };

    const handleShowRegister = () => {
        resetRegisterForm();   // clear any stale/autofilled values before opening
        setRegisterError(null);
        setIsRegisterView(true);
    };

    const handleShowLogin = () => {
        resetLoginForm();      // clear login form when coming back manually
        setLoginError(null);
        setIsRegisterView(false);
    };

    return (

        <div className="h-screen w-full bg-[#EDE6D6] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">

            <div className="relative w-full max-w-[315px] bg-[#F5EFE4] border border-[#D8CDB8] rounded-[18px] sm:rounded-[25px] shadow-2xl px-3.5 py-3.5 sm:px-6 sm:py-6 my-auto">

                {/* Success Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-[#F5EFE4] z-50 flex flex-col items-center justify-center overflow-hidden rounded-[18px] sm:rounded-[25px]">

                        <div className="absolute w-[220px] h-[220px] sm:w-[315px] sm:h-[315px] rounded-full border border-[#D8CDB8] animate-ping opacity-20"></div>

                        <div className="absolute w-[157px] h-[157px] sm:w-[220px] sm:h-[220px] rounded-full border border-[#D8CDB8] opacity-40"></div>

                        <div className="relative animate-scaleIn">

                            <div className="absolute inset-0 rounded-full bg-[#B98B4E]/30 blur-3xl opacity-60 scale-150"></div>

                            <div className="relative w-[90px] h-[90px] sm:w-[141px] sm:h-[141px] bg-[#F5EFE4] shadow-2xl flex items-center justify-center success-badge">

                                <div className="w-[60px] h-[60px] sm:w-[91px] sm:h-[91px] rounded-full bg-[#B98B4E] flex items-center justify-center shadow-[0_0_56px_rgba(185,139,78,0.5)]">

                                    <svg
                                        className="w-[31px] h-[31px] sm:w-[50px] sm:h-[50px] text-[#2B2620]"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>

                                </div>

                            </div>

                        </div>

                        <h2 className="mt-3.5 sm:mt-6 text-base sm:text-xl font-bold text-[#2B2620] animate-fadeIn text-center px-4">
                            {(showSuccess === "login") ? "Verification Successful" : "Registration Successful"}
                        </h2>

                        <p className="text-xs sm:text-sm text-[#8C8272] mt-1 sm:mt-2.5 animate-fadeIn">
                            {(showSuccess === "login") ? "Verified with Zod Backend" : "Registration completed successfully"}
                        </p>

                    </div>
                )}

                {/* Logo / Brand */}
                <div className="transform scale-85 origin-left">
                    <NexusLogo />
                </div>

                {!isRegisterView ? (
                    <>
                        {/* LOGIN VIEW */}

                        {/* Heading */}
                        <h2 className="text-base sm:text-[22px] font-bold text-[#2B2620] mt-1 sm:mt-2">
                            Welcome Back
                        </h2>

                        <p className="text-[11px] sm:text-xs text-[#8C8272] mt-0.5 mb-2.5 sm:mt-0.5 sm:mb-3.5">
                            Sign in to continue to your workspace
                        </p>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit(onSubmit)}>

                            <div className="mb-2 sm:mb-3.5">
                                <label className="text-[11px] font-semibold text-[#3A332B]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="mt-1 sm:mt-1.5 w-full h-[29px] sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-xs text-[#2B2620]"
                                    {...register("email", {
                                        onChange: () => setLoginError(null),
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="mb-1">
                                <label className="text-[11px] font-semibold text-[#3A332B]">
                                    Password
                                </label>
                                <div className="relative mt-1 sm:mt-1.5">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className="w-full h-[29px] sm:h-9 px-2.5 sm:px-3 pr-8 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-xs text-[#2B2620]"
                                        {...register("password", {
                                            onChange: () => setLoginError(null),
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C8272] hover:text-[#2B2620]"
                                    >
                                        {showPassword ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8-.32 1.12-.87 2.19-1.6 3.14M6.1 6.1C3.86 7.5 2.3 9.6 2 12c1 4 5 8 10 8 1.24 0 2.42-.24 3.5-.68" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
                                                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                                {loginError && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {loginError}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end mb-2 sm:mb-3.5">
                                <button
                                    type="button"
                                    className="text-[11px] font-semibold text-[#B98B4E] hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-[29px] sm:h-9 rounded-xl bg-[#2B2620] text-[#EDE6D6] font-semibold text-xs hover:scale-[1.02] transition-all duration-300 shadow-lg"
                            >
                                Sign In
                            </button>

                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-2 my-3 sm:my-3.5">
                            <div className="flex-1 h-px bg-[#D8CDB8]" />
                            <span className="text-[9px] font-medium text-[#8C8272] uppercase tracking-wider">
                                or continue with email
                            </span>
                            <div className="flex-1 h-px bg-[#D8CDB8]" />
                        </div>

                        {/* Google Auth Button */}
                        <div className="relative w-full h-9 flex items-center justify-center">
                            {/* Skeleton shown until Google's script is fully ready */}
                            {!googleReady && !googleLoading && (
                                <div className="absolute inset-0 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] animate-pulse" />
                            )}

                            {/* Loading overlay shown while verifying with backend */}
                            {googleLoading && (
                                <div className="absolute inset-0 z-10 rounded-xl border border-[#D8CDB8] bg-[#F5EFE4] flex items-center justify-center gap-2">
                                    <svg
                                        className="w-3.5 h-3.5 animate-spin text-[#B98B4E]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                    <span className="text-[11px] font-medium text-[#8C8272]">
                                        Verifying...
                                    </span>
                                </div>
                            )}

                            <div
                                className={`w-full flex justify-center transition-opacity duration-200 ${googleReady && !googleLoading ? "opacity-100" : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <GoogleLogin
                                    onSuccess={(credentialResponse) => {
                                        googleLogin(credentialResponse.credential!);
                                    }}
                                    onError={() => console.log("Login Failed")}
                                    useOneTap={false}
                                    theme="outline"
                                    size="medium"
                                    shape="rectangular"
                                    text="continue_with"
                                    width="100%"
                                    logo_alignment="left"
                                />
                            </div>
                        </div>

                        {/* Toggle to Register */}
                        <p className="text-center text-[11px] sm:text-xs text-[#8C8272] mt-3 sm:mt-4">
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={handleShowRegister}
                                className="font-semibold text-[#B98B4E] hover:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </>
                ) : (
                    <>
                        {/* REGISTER VIEW */}

                        {/* Heading */}
                        <h2 className="text-base sm:text-[22px] font-bold text-[#2B2620] mt-1 sm:mt-2">
                            Create Account
                        </h2>

                        <p className="text-[11px] sm:text-xs text-[#8C8272] mt-0.5 mb-2.5 sm:mt-0.5 sm:mb-3.5">
                            Sign up to get started with your workspace
                        </p>

                        {/* Register Form */}
                        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>

                            <div className="mb-2 sm:mb-3.5">
                                <label className="text-[11px] font-semibold text-[#3A332B]">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    placeholder="John Doe"
                                    className="mt-1 sm:mt-1.5 w-full h-[29px] sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-xs text-[#2B2620]"
                                    {...registerField("name", {
                                        onChange: () => setRegisterError(null),
                                    })}
                                />
                                {registerErrors.name && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {registerErrors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="mb-2 sm:mb-3.5">
                                <label className="text-[11px] font-semibold text-[#3A332B]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="mt-1 sm:mt-1.5 w-full h-[29px] sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-xs text-[#2B2620]"
                                    {...registerField("email", {
                                        onChange: () => setRegisterError(null),
                                    })}
                                />
                                {registerErrors.email && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {registerErrors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="mb-1">
                                <label className="text-[11px] font-semibold text-[#3A332B]">
                                    Password
                                </label>
                                <div className="relative mt-1 sm:mt-1.5">
                                    <input
                                        type={showRegisterPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Password"
                                        className="w-full h-[29px] sm:h-9 px-2.5 sm:px-3 pr-8 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-xs text-[#2B2620]"
                                        {...registerField("password", {
                                            onChange: () => setRegisterError(null),
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C8272] hover:text-[#2B2620]"
                                    >
                                        {showRegisterPassword ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8-.32 1.12-.87 2.19-1.6 3.14M6.1 6.1C3.86 7.5 2.3 9.6 2 12c1 4 5 8 10 8 1.24 0 2.42-.24 3.5-.68" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
                                                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {registerErrors.password && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {registerErrors.password.message}
                                    </p>
                                )}
                                {registerError && (
                                    <p className="text-red-600 text-[11px] mt-1">
                                        {registerError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full h-[29px] sm:h-9 rounded-xl bg-[#2B2620] text-[#EDE6D6] font-semibold text-xs hover:scale-[1.02] transition-all duration-300 shadow-lg mt-3 sm:mt-3.5"
                            >
                                Create Account
                            </button>

                        </form>

                        {/* Back to Login */}
                        <p className="text-center text-[11px] sm:text-xs text-[#8C8272] mt-3 sm:mt-4">
                            Already have an account?{" "}
                            <button
                                onClick={handleShowLogin}
                                className="font-semibold text-[#B98B4E] hover:underline"
                            >
                                Back to Login
                            </button>
                        </p>
                    </>
                )}

            </div>

        </div>
    );
}

export default Login;