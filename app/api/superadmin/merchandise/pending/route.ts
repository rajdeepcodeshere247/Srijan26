import { auth } from "@/auth";
import { prisma } from "@/prisma/client";

export async function GET() {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPERADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const merchandise = await prisma.merchandise.findMany({
            where: {
                status: "pending",
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        department: true,
                        year: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return Response.json(merchandise);
    } catch (error) {
        console.error("Failed to fetch pending merchandise:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
