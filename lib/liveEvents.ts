import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/prisma/client";

export interface LiveEvent {
    id: string;
    slug: string;
    name: string;
    round: string;
    location: string;
}

const _getLiveEvents = async (): Promise<LiveEvent[]> => {
    try {
        const events = await prisma.liveEvent.findMany();
        return events.map((e) => ({
            id: e.id,
            slug: e.slug,
            name: e.name,
            round: e.round,
            location: e.location,
        }));
    } catch {
        return [];
    }
}

export const getLiveEvents = unstable_cache(
    async () => _getLiveEvents(),
    ["live-events-cache"],
    { tags: ["live-events"], revalidate: 43200 } // 12 hours
);

export async function addLiveEvent(event: Omit<LiveEvent, "id">): Promise<LiveEvent> {
    const newEvent = await prisma.liveEvent.create({
        data: event,
    });
    revalidateTag("live-events", {});
    return {
        id: newEvent.id,
        slug: newEvent.slug,
        name: newEvent.name,
        round: newEvent.round,
        location: newEvent.location,
    };
}

export async function removeLiveEvent(id: string): Promise<void> {
    await prisma.liveEvent.delete({
        where: { id }
    });
    revalidateTag("live-events", {});
}

export async function updateLiveEvent(event: LiveEvent): Promise<void> {
    await prisma.liveEvent.update({
        where: { id: event.id },
        data: {
            slug: event.slug,
            name: event.name,
            round: event.round,
            location: event.location
        }
    });
    revalidateTag("live-events", {});
}
