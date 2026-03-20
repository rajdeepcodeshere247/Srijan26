import { auth } from "@/auth";
import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { merchandiseId, status } = body;

        if (!merchandiseId || !status) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        if (!["completed", "failed", "refunded", "pending"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedMerchandise = await prisma.merchandise.update({
            where: { id: merchandiseId },
            data: { status },
        });

        return NextResponse.json({ success: true, merchandise: updatedMerchandise });
    } catch (error) {
        console.error("Failed to update merchandise status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
