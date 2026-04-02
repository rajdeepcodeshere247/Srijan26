"use server";
import "server-only";
import { prisma } from "@/prisma/client";
import { getUserByEmail } from "./AuthService";
import { sendPasswordResetEmail, sendVerificationEmail } from "./EmailService";
import bcrypt from "bcryptjs";
import { SERVER_URL } from "@/utils/constants";
import { withAuth } from "@/utils/withAuth";
import { signOut } from "@/auth";

type RegistrationData = {
    phone: string;
    college: string;
    year: string;
    department: string;
    referralCode?: string;
};

const completeUserRegistration = withAuth(async (sessionUserId: string, data: RegistrationData, id: string) => {
    try {
        if (sessionUserId !== id) {
            signOut({
                redirectTo: "/login"
            });
            throw new Error("Invalid session - id mismatch");
        }
        await prisma.$transaction(async (txn) => {
            await txn.user.update({
                where: {
                    id,
                },
                data: {
                    phone: data.phone,
                    year: data.year,
                    college: data.college,
                    department: data.department,
                    registrationComplete: true,
                    emailVerified: new Date(),
                },
            });

            if (data.referralCode) {
                try {
                    await txn.campusAmbassador.update({
                        where: {
                            referralCode: data.referralCode,
                        },
                        data: {
                            referralCount: {
                                increment: 1,
                            },
                        },
                    });
                } catch (err) {
                    console.error(`Error while trying to increase referralCount - ${err}`);
                }
            }
        });
        return { ok: true, message: "Registration completed" };
    } catch (err) {
        console.error(`Error in completing user registration: ${err}`);
        return {
            ok: false,
            message: "Error occurred - failed to complete registration",
        };
    }
});

const matchVerificationCode = withAuth(async (sessionUserId: string, email: string, code: string) => {
    try {
        const userToken = await prisma.user.findFirst({
            where: { email },
            select: { id: true, verificationToken: true },
        });
        const match = userToken?.verificationToken === code.trim() && userToken.id === sessionUserId;

        const verifiedAt = new Date();
        if (match)
            await prisma.user.update({
                where: { email },
                data: { emailVerified: verifiedAt },
            });
        return match;
    } catch (err) {
        console.error(err);
        return false;
    }
});

const verifyEmail = withAuth(async (sessionUserId: string, email: string) => {
    try {
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
            where: { id: sessionUserId, email, emailVerified: null },
            data: { verificationToken: token },
        });

        const result = await sendVerificationEmail(email, token);
        if (result)
            return { ok: true, message: "Email sent with verification code" };
        else return { ok: false, message: "Error in email verification" };
    } catch (err) {
        console.error(`Error in email verification: ${err}`);
        return { ok: false, message: "Error in email verification" };
    }
});

const handleForgotPassword = async (email: string) => {
    try {
        const existingUser = await getUserByEmail(email);
        if (!existingUser) return false;

        const token = crypto.randomUUID();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.resetPasswordToken.create({
            data: {
                user_id: existingUser.id,
                token,
                expiresAt: tokenExpiry,
            },
        });
        const link = `${SERVER_URL}/reset-password?token=${token}`;

        const res = await sendPasswordResetEmail(email, link);

        return res;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const verifyPasswordResetToken = async (token: string | null) => {
    try {
        if (!token) return { ok: false, id: null };
        const resetToken = await prisma.resetPasswordToken.findFirst({
            where: { token },
        });

        const currentDate = new Date();
        if (!resetToken || !resetToken.user_id) return { ok: false, id: null };
        const tokenValid = resetToken?.expiresAt > currentDate;
        if (!tokenValid) {
            await prisma.resetPasswordToken.delete({ where: { token } });
            return { ok: false, id: null };
        }

        return { ok: true, id: resetToken.user_id };
    } catch (err) {
        console.error(`Error while verifying password reset token: ${err}`);
        return { ok: false, id: null };
    }
};

const resetPassword = async (
    userId: string,
    password: string,
    token: string,
) => {
    try {
        const existingToken = await prisma.resetPasswordToken.delete({ where: { token }, select: { user_id: true } });
        if (existingToken.user_id !== userId) throw new Error("Invalid token - user id mismatch");

        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        return { ok: true, message: "Password reset successfully" };
    } catch (err) {
        console.error(`Error while resetting password: ${err}`);
        return { ok: false, message: "Error occurred" };
    }
};

const updateUserProfile = withAuth(async (sessionUserId: string, data: RegistrationData) => {
    try {
        await prisma.user.update({
            where: {
                id: sessionUserId,
            },
            data: {
                phone: data.phone,
                year: data.year,
                college: data.college,
                department: data.department,
            },
        });

        return { ok: true, message: "Profile updated successfully" };
    } catch (err) {
        return {
            ok: false,
            message: `Failed to update profile: ${err}`,
        };
    }
});

export {
    completeUserRegistration,
    matchVerificationCode,
    verifyEmail,
    handleForgotPassword,
    verifyPasswordResetToken,
    resetPassword,
    updateUserProfile,
};
