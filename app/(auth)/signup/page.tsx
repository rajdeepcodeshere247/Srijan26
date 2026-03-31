"use client";
import { signup } from "@/services/AuthService";
import { HCaptchaProvider, useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { CONST } from "@/utils/constants";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import z from "zod";
import Tooltip from "@/components/Tooltip";
import Balls from "@/components/Balls";
import { Clickable } from "@/components/Clickable";


function Page() {
    return (
        <HCaptchaProvider sitekey={CONST.hcaptcha.SITEKEY} size="invisible">
            <SignUpForm />
        </HCaptchaProvider>
    );
}

const UserSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email"),
        password: z
            .string()
            .regex(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                "Weak Password",
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

function SignUpForm() {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState<boolean>();
    const { executeInstance } = useHCaptcha();
    const router = useRouter();

    const handleUpdate = (value: string, field: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();

        setErrors({ name: "", email: "", password: "", confirmPassword: "" });
        const isValid = UserSchema.safeParse(data);

        if (!isValid.success) {
            isValid.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    setErrors((oldErrors) => ({
                        ...oldErrors,
                        [issue.path[0]]: issue.message,
                    }));
                }
            });
            return;
        }

        toast.loading("Submitting...");
        setLoading(true);

        executeInstance()
            .then((hCaptchaToken) => {
                return signup(
                    {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        registrationComplete: false,
                        emailVerified: null,
                        image: null,
                    },
                    hCaptchaToken ?? null,
                );
            })
            .then((res) => {
                toast.dismiss();
                if (res.ok) {
                    toast.success("Signed up successfully");
                    router.push("/dashboard");
                } else {
                    toast.error(res.message);
                    setLoading(false);
                }
            })
            .catch(() => {
                toast.dismiss();
                toast("Error occurred");
                setLoading(false);
            });
    };

    const handleSignInWithGoogle = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        signIn("google", {
            redirectTo: "/dashboard",
        }).catch(() => {
            toast("Error occurred");
            setLoading(false);
        });
    };

    return (
        <div className="flex flex-col items-center justify-center gap-8 h-full min-h-[80vh]">
            <Balls />
            <h1 className="text-5xl font-semibold font-elnath text-yellow">
                Sign Up
            </h1>
            <div className="flex flex-col items-center gap-4 w-4/5 sm:w-full">
                <div className="flex flex-col items-center gap-2 w-full">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={data.name}
                        onChange={(e) => handleUpdate(e.target.value, "name")}
                        className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
                    />
                    <p className="text-sm text-red-500">{errors.name}</p>
                </div>
                <div className="flex flex-col items-center gap-2 w-full">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={data.email}
                        onChange={(e) => handleUpdate(e.target.value, "email")}
                        className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
                    />

                    <p className="text-sm text-red-500">{errors.email}</p>
                </div>
                <div className="flex flex-col items-center gap-2 relative w-full sm:w-1/3 2xl:w-1/4">
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                        <Tooltip message="Password must be at least 8 characters long and must contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special character">
                            <p className="text-xs py-1 px-2.5 rounded-full bg-gray-300/40">
                                i
                            </p>
                        </Tooltip>
                    </div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) =>
                            handleUpdate(e.target.value, "password")
                        }
                        className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                    />

                    <p className="text-sm text-red-500">{errors.password}</p>
                </div>
                <div className="flex flex-col items-center gap-2 w-full">
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={data.confirmPassword}
                        onChange={(e) =>
                            handleUpdate(e.target.value, "confirmPassword")
                        }
                        className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
                    />

                    <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                    </p>
                </div>

                <Clickable
                    as="button"
                    type="submit"
                    onClick={(e) => handleSubmit(e)}
                    className="bg-red hover:bg-red/70 active:bg-red/40"
                    disabled={loading}
                >
                    Sign Up
                </Clickable>
            </div>
            <div className="flex w-full sm:w-2/5 items-center justify-between gap-6">
                <div className="h-px w-full bg-linear-to-r from-red to-orange"></div>
                <p>OR</p>
                <div className="h-px w-full bg-linear-to-l from-red to-orange"></div>
            </div>
            <button
                onClick={(e) => handleSignInWithGoogle(e)}
                className="rounded-full bg-white px-8 py-3 text-black transition-colors duration-300 hover:bg-white/90 active:bg-white/60 flex items-center gap-3"
                disabled={loading}
            >
                <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    style={{ display: "block" }}
                    height={24}
                    width={24}
                >
                    <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Sign up with Google</span>
            </button>
            <div className="flex justify-between gap-x-8">
                <p>Already have an account?</p>
                <Link
                    href={"/login"}
                    className="underline underline-offset-4 text-yellow"
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
}

export default Page;
