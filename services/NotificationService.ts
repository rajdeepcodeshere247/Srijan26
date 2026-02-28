'use server'

import { prisma } from "@/prisma/client";

/**
 * Broadcast a notification to ALL users.
 */
const broadcastNotification = async (title: string, description: string) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true },
        });

        await prisma.notification.createMany({
            data: users.map((user) => ({
                title,
                description,
                userId: user.id,
            })),
        });

        return { ok: true, message: `Notified ${users.length} users` };
    } catch (err) {
        console.error(`Error broadcasting notification: ${err}`);
        return { ok: false, message: "Failed to broadcast notification" };
    }
};

/**
 * Send a notification to a single user.
 */
const notifyUser = async (userId: string, title: string, description: string) => {
    try {
        await prisma.notification.create({
            data: { title, description, userId },
        });
        return { ok: true };
    } catch (err) {
        console.error(`Error notifying user ${userId}: ${err}`);
        return { ok: false };
    }
};

export { broadcastNotification, notifyUser };
