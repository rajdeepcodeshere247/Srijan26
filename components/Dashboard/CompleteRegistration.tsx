"use client";

import {
    checkRegistrationStatus,
    updateRegistrationStatus,
} from "@/services/AuthService";
import { completeUserRegistration } from "@/services/UserService";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import Balls from "../Balls";
import { Clickable } from "../Clickable";
import Tooltip from "../Tooltip";

const RegistrationSchema = z.object({
    phone: z
        .string()
        .regex(
            /\d{10}$/,
            "Phone number must be exactly 10 digits",
        ),
    college: z.string().min(1, "College is required"),
    year: z.string().min(1, "Year of Study is required"),
    department: z.string().min(1, "Department is required"),
    referralCode: z.string().optional(),
});

function CompleteRegistration({ id }: { id: string }) {
    return (
        <Suspense>
            <RegistrationForm id={id} />
        </Suspense>
    );
}

function RegistrationForm({ id }: { id: string }) {
    const [data, setData] = useState({
        phone: "",
        college: "",
        year: "",
        department: "",
        referralCode: "",
    });
    const [errors, setErrors] = useState({
        phone: "",
        college: "",
        year: "",
        department: "",
        referralCode: "",
    });
    const [showReferral, setShowReferral] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect");

    useEffect(() => {
        checkRegistrationStatus(id).then((res) => {
            if (res.registrationComplete) {
                updateRegistrationStatus().then(() => {
                    if (redirectUrl) router.push(redirectUrl);
                    else router.refresh();
                });
            }
        });
    }, [id, redirectUrl, router]);

    const handleChange = (field: string, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setErrors({
            phone: "",
            college: "",
            department: "",
            year: "",
            referralCode: "",
        });
        const isValid = RegistrationSchema.safeParse(data);
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

        toast.loading("Submitting...");
        completeUserRegistration(data, id)
            .then((res) => {
                toast.dismiss();
                if (res.ok) {
                    updateRegistrationStatus().then(() => {
                        if (redirectUrl) router.push(redirectUrl);
                        else router.refresh();
                    });
                } else {
                    toast.error(res.message);
                }
            })
            .catch(() => {
                toast.dismiss();
                toast.error("Error occurred");
            });

        setLoading(false);
    };

    return (
        <form
            className="flex flex-col items-center justify-center gap-6 h-full min-h-[80vh]"
            onSubmit={(e) => handleSubmit(e)}
        >
            <Balls />
            <h1 className="text-4xl sm:text-5xl font-semibold font-elnath text-yellow mb-8 text-center">
                Complete &nbsp; Registration
            </h1>
            <div className="flex flex-col items-center gap-2 w-4/5 sm:w-1/3 2xl:w-1/4">
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={data.phone}
                    onChange={(e) => {
                        handleChange("phone", e.target.value);
                    }}
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                />
                {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                )}
            </div>
            <div className="flex flex-col items-center gap-2 w-4/5 sm:w-1/3 2xl:w-1/4">
                <input
                    type="text"
                    name="college"
                    placeholder="College"
                    value={data.college}
                    onChange={(e) => {
                        handleChange("college", e.target.value);
                    }}
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                />
                {errors.college && (
                    <p className="text-sm text-red-500">{errors.college}</p>
                )}
            </div>
            <div className="flex flex-col items-center gap-2 w-4/5 sm:w-1/3 2xl:w-1/4">
                <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={data.department}
                    onChange={(e) => {
                        handleChange("department", e.target.value);
                    }}
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                />
                {errors.department && (
                    <p className="text-sm text-red-500">{errors.department}</p>
                )}
            </div>
            <div className="flex flex-col items-center gap-2 w-4/5 sm:w-1/3 2xl:w-1/4">
                <input
                    type="text"
                    name="year"
                    placeholder="Year of Graduation"
                    value={data.year}
                    onChange={(e) => {
                        handleChange("year", e.target.value);
                    }}
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                />
                {errors.year && (
                    <p className="text-sm text-red-500">{errors.year}</p>
                )}
            </div>

            <div className="flex flex-col items-center gap-2 w-4/5 sm:w-1/3 2xl:w-1/4">
                <button
                    type="button"
                    onClick={() => setShowReferral((prev) => !prev)}
                    className="text-sm text-yellow/80 hover:text-yellow underline underline-offset-2 transition-colors"
                >
                    {showReferral ? "Hide referral code" : "Have a referral code?"}
                </button>
                {showReferral && (
                    <div className="flex flex-col items-center gap-2 relative w-full">
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                            <Tooltip message="This is an optional field, in case you have a code given by a Campus Ambassador.">
                                <p className="text-xs py-1 px-2.5 rounded-full bg-gray-300/40">
                                    i
                                </p>
                            </Tooltip>
                        </div>
                        <input
                            type="text"
                            name="referralCode"
                            placeholder="Referral Code (Optional)"
                            value={data.referralCode}
                            onChange={(e) =>
                                handleChange("referralCode", e.target.value)
                            }
                            className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full"
                        />
                    </div>
                )}
            </div>
            <Clickable
                as="button"
                type="submit"
                disabled={loading}
                className="bg-red hover:bg-red/70 active:bg-red/40"
            >
                Submit
            </Clickable>
        </form>
    );
}

export default CompleteRegistration;
