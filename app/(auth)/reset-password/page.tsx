"use client";
import Balls from "@/components/Balls";
import { Clickable } from "@/components/Clickable";
import Loading from "@/components/Loading";
import Tooltip from "@/components/Tooltip";
import {
    resetPassword,
    verifyPasswordResetToken,
} from "@/services/UserService";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import z from "zod";

function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPassword />
        </Suspense>
    );
}

const PasswordResetSchema = z
    .object({
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

function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [userId, setUserId] = useState("");
    const [data, setData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    
    useEffect(() => {
        verifyPasswordResetToken(token)
        .then((res) => {
            if (res.ok && res.id) setUserId(res.id);
            else router.push("/404");
        })
        .catch(() => {
            router.push("/404");
        });
    }, [token, router]);
    
    if(!token){
        router.push("/404");
        return;
    }

    const handleChange = (field: string, value: string) => {
        setData((oldData) => ({ ...oldData, [field]: value }));
    };

    const handleSubmit = () => {
        setLoading(true);
        setErrors({ password: "", confirmPassword: "" });
        const isValid = PasswordResetSchema.safeParse(data);
        if (!isValid.success) {
            isValid.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    setErrors((oldErrors) => ({
                        ...oldErrors,
                        [issue.path[0]]: issue.message,
                    }));
                }
            });
            setLoading(false);
            return;
        }
        toast("Submitting...");

        resetPassword(userId, data.password, token)
            .then((res) => {
                if (res.ok){
                    toast.success(res.message);
                    redirect("/login");
                }
                else toast.error(res.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="flex flex-col items-center justify-center gap-8 h-full min-h-[80vh]">
            <Balls />
            <h1 className="text-5xl font-semibold font-elnath text-yellow text-center">Reset your Password</h1>
            <div className="flex flex-col items-center gap-2 relative w-9/10 sm:w-1/3 2xl:w-1/4">
                <div className="absolute top-1/2 -right-10 -translate-y-1/2">
                    <Tooltip message="Password must be at least 8 characters long and must contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special character">
                        <p className="rounded-full bg-gray-300/40 px-2.5 py-1 text-xs">
                            i
                        </p>
                    </Tooltip>
                </div>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                />
                {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                )}
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={data.confirmPassword}
                    onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                    }
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
                />
                {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                    </p>
                )}
            </div>
            <Clickable
                as="button"
                className="bg-red hover:bg-red/70 active:bg-red/40"
                onClick={() => handleSubmit()}
                disabled={loading}
            >
                Submit
            </Clickable>
        </div>
    );
}

export default Page;
