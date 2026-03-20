import { redirect } from "next/navigation";
import { Metadata } from "next";
import { EVENTS_DATA } from "@/data/eventsList";
import EventDetailsClient from "@/components/events/EventDetailsClient";

export async function generateStaticParams() {
  return EVENTS_DATA.map((event) => ({
    slug: event.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return EVENTS_DATA.map((event) => ({
    slug: event.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = EVENTS_DATA.find(
    (e) =>
      e.slug === slug ||
      e.slug.toLowerCase() === slug.toLowerCase() ||
      e.id === slug,
  );

  if (!event) {
    return {
      title: "Event Not Found | Srijan 2026",
      description: "This event does not exist or has been removed.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://srijanju.in";

  return {
    title: `${event.title} | Srijan 2026`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      url: `${baseUrl}/events/${event.slug}`,
      siteName: "Srijan 2026",
      images: [
        {
          url: event.image,
          width: 595,
          height: 842,
          alt: `${event.title} Poster`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [event.image],
    },
  };
}

// 3. Make sure your default export is also an async function
export default async function EventDetailsPage({ params }: Props) {
  const { slug } = await params;

  // 1. Logical precedence:
  // a) Exact slug match -> render
  // b) Case-insensitive slug match -> redirect
  // c) ID match -> redirect

  const exactEvent = EVENTS_DATA.find((e) => e.slug === slug);
  if (exactEvent) {
    return <EventDetailsClient event={exactEvent} />;
  }

  const caseInsensitiveEvent = EVENTS_DATA.find(
    (e) => e.slug.toLowerCase() === slug.toLowerCase(),
  );
  if (caseInsensitiveEvent) {
    redirect(`/events/${caseInsensitiveEvent.slug}`);
  }

  const idEvent = EVENTS_DATA.find((e) => e.id === slug);
  if (idEvent) {
    redirect(`/events/${idEvent.slug}`);
  }

  return <div className="text-white text-center mt-20">Event not found</div>;
}