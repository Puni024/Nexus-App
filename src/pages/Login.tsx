import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NexusLogo from "../components/NexusLogo";
import { GoogleLogin } from "@react-oauth/google";

import { loginSchema, type LoginFormData } from "../schemas/loginSchema";

function Login() {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoginError(null);

            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (res.status === 401) {
                setLoginError("Invalid credential");
                return;
            }

            if (!res.ok) {
                throw new Error("Login failed");
            }

            console.log("Login successful", responseData);

            setShowSuccess(true);

            setTimeout(() => {
                navigate("/home");
            }, 1500);
        } catch (error) {
            console.log("Error in login", error);
        }
    };

    const googleLogin = async (googlecredential: string) => {

        const res = await fetch("http://localhost:5000/api/auth/google", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: googlecredential,
            }),
        });
        if (res.ok) {
            setShowSuccess(true);
            navigate("/home");
        }

    };

    const handleRegisterClick = () => {
        console.log("Sign up clicked");
    };

    return (

        <div className="h-screen w-full bg-[#EDE6D6] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">

            <div className="relative w-full max-w-[350px] bg-[#F5EFE4] border border-[#D8CDB8] rounded-[20px] sm:rounded-[28px] shadow-2xl px-4 py-4 sm:px-7 sm:py-7 my-auto">

                {/* Success Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-[#F5EFE4] z-50 flex flex-col items-center justify-center overflow-hidden rounded-[20px] sm:rounded-[28px]">

                        <div className="absolute w-[245px] h-[245px] sm:w-[350px] sm:h-[350px] rounded-full border border-[#D8CDB8] animate-ping opacity-20"></div>


                        <div className="absolute w-[175px] h-[175px] sm:w-[245px] sm:h-[245px] rounded-full border border-[#D8CDB8] opacity-40"></div>

                        <div className="relative animate-scaleIn">

                            <div className="absolute inset-0 rounded-full bg-[#B98B4E]/30 blur-3xl opacity-60 scale-150"></div>

                            <div className="relative w-[100px] h-[100px] sm:w-[157px] sm:h-[157px] bg-[#F5EFE4] shadow-2xl flex items-center justify-center success-badge">

                                <div className="w-[67px] h-[67px] sm:w-[101px] sm:h-[101px] rounded-full bg-[#B98B4E] flex items-center justify-center shadow-[0_0_56px_rgba(185,139,78,0.5)]">

                                    <svg
                                        className="w-[34px] h-[34px] sm:w-14 sm:h-14 text-[#2B2620]"
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

                        <h2 className="mt-4 sm:mt-7 text-lg sm:text-2xl font-bold text-[#2B2620] animate-fadeIn text-center px-4">
                            Verification Successful
                        </h2>

                        <p className="text-sm sm:text-base text-[#8C8272] mt-1.5 sm:mt-3 animate-fadeIn">
                            Verified with Zod Backend
                        </p>

                    </div>
                )}

                {/* Logo / Brand */}
                <NexusLogo />

                {/* Heading */}
                <h2 className="text-lg sm:text-[24px] font-bold text-[#2B2620] mt-1 sm:mt-2">
                    Welcome Back
                </h2>

                <p className="text-xs sm:text-sm text-[#8C8272] mt-0.5 mb-3 sm:mt-0.5 sm:mb-4">
                    Sign in to continue to your workspace
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="mb-2.5 sm:mb-4">
                        <label className="text-xs font-semibold text-[#3A332B]">
                            Email Address
                        </label>
                        <input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="mt-1.5 sm:mt-2 w-full h-8 sm:h-10 px-3 sm:px-3.5 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-sm text-[#2B2620]"
                            {...register("email", {
                                onChange: () => setLoginError(null),
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-600 text-xs mt-1.5">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-1.5">
                        <label className="text-xs font-semibold text-[#3A332B]">
                            Password
                        </label>
                        <div className="relative mt-1.5 sm:mt-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Password"
                                className="w-full h-8 sm:h-10 px-3 sm:px-3.5 pr-9 rounded-xl border border-[#D8CDB8] bg-[#EDE6D6] focus:bg-white focus:border-[#B98B4E] focus:ring-4 focus:ring-[#B98B4E]/20 outline-none transition text-sm text-[#2B2620]"
                                {...register("password", {
                                    onChange: () => setLoginError(null),
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8272] hover:text-[#2B2620]"
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8-.32 1.12-.87 2.19-1.6 3.14M6.1 6.1C3.86 7.5 2.3 9.6 2 12c1 4 5 8 10 8 1.24 0 2.42-.24 3.5-.68" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
                                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-600 text-xs mt-1.5">
                                {errors.password.message}
                            </p>
                        )}
                        {loginError && (
                            <p className="text-red-600 text-xs mt-1.5">
                                {loginError}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end mb-2.5 sm:mb-4">
                        <button
                            type="button"
                            className="text-xs font-semibold text-[#B98B4E] hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-8 sm:h-10 rounded-xl bg-[#2B2620] text-[#EDE6D6] font-semibold text-sm hover:scale-[1.02] transition-all duration-300 shadow-lg"
                    >
                        Sign In
                    </button>

                </form>

                {/* Divider */}
                <div className="flex items-center gap-2.5 my-3.5 sm:my-4">
                    <div className="flex-1 h-px bg-[#D8CDB8]" />
                    <span className="text-[10px] font-medium text-[#8C8272] uppercase tracking-wider">
                        or continue with email
                    </span>
                    <div className="flex-1 h-px bg-[#D8CDB8]" />
                </div>

                {/* Google Auth Button */}
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        googleLogin(credentialResponse.credential!);
                    }}
                    onError={() => console.log("Login Failed")}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    width="100%"
                    logo_alignment="left"
                />

                {/* Toggle */}
                <p className="text-center text-xs sm:text-sm text-[#8C8272] mt-3.5 sm:mt-5">
                    Don&apos;t have an account?{" "}
                    <button
                        onClick={handleRegisterClick}
                        className="font-semibold text-[#B98B4E] hover:underline"
                    >
                        Sign up
                    </button>
                </p>

            </div>

        </div>
    );
}

export default Login;