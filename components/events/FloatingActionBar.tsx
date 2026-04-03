import React from "react";
import ShareButton from "./ShareButton";
import RegisterButton from "./RegisterButton";
import { Event } from "@/components/events/types/events";
import DocButton from "./DocButton";

interface Props {
  event: Event;
}

export default function FloatingActionBar({ event }: Props) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#121212] p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        {/* <p className="text-gray-400 text-left text-sm font-bold uppercase tracking-wider">
          Status:{" "}
          <span
            className={
              event.status === "Open"
                ? "text-green-400"
                : event.status === "Closed"
                  ? "text-red-400"
                  : "text-yellow-300"
            }
          >
            {event.status}
          </span>
        </p> */}

        <div className="flex gap-2 sm:gap-4 w-fit">
          <DocButton docUrl={event.driveLink ?? event.pdfLink ?? ""} label="Details" />
          <ShareButton eventSlug={event.slug} eventTitle={event.title} />
          <RegisterButton status={event.status} link={event.link} slug={event.slug} />
        </div>
      </div>
    </div>
  );
}