"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Event } from "@/components/events/types/events";

// Custom Components
import EventDetailImage from "./EventDetailImage";
import WavyGradient from "../WavyGradient";
import EventNavigation from "./EventNavigation";
import EventTags from "./EventTags";
import EventTitleBlock from "./EventTitleBlock";
import EventDetailsBox from "./EventDetailsBox";
import EventPrizePool from "./EventPrizePool";
import EventRules from "./EventRules";
import EventScoring from "./EventScoring"; // <-- Imported EventScoring here
import EventContact from "./EventContact";
import FloatingActionBar from "./FloatingActionBar";
import EventPrizeDetails from "./EventPrizeDetails";
import EventFormat from "./EventFormat";
import EventSubmission from "./EventSubmission";

interface Props {
  event: Event;
}

export default function EventDetailsClient({ event }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const transitionTo = useCallback(
    (url: string) => {
      const tl = gsap.timeline();

      // EXIT ANIMATION: Content wipes away from Left to Right
      tl.fromTo(
        // Notice we are targeting our new content wrapper class
        ".clip-reveal-content",
        {
          // Start State: Fully visible
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        },
        {
          // End State: Clipped completely to the right edge (invisible)
          clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            router.push(url); // Change the page once fully hidden
          },
        },
      );
      tl.to(
        ".gsap-animate",
        {
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.inOut",
        },
        "<",
      );
    },
    [router],
  );

  return (
    <main className="min-h-screen text-white pb-32 px-6 md:px-12 lg:px-24 font-euclid selection:bg-orange-400 selection:text-white">
      <WavyGradient
        className="gsap-animate"
        brightness={0.5}
        color1="#F09400"
        color2="#A80000"
        color3="#1A0000"
        direction={20}
        speed={1.5}
        waveHeight={0.45}
        noiseIntensity={5}
        waveAmplitude={1}
      />

      <div ref={containerRef} className="relative max-w-7xl mx-auto space-y-8">
        <EventNavigation event={event} onNavigate={transitionTo} />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Image */}
          <div className="relative lg:col-span-5 w-full flex justify-center lg:justify-start">
            <EventDetailImage src={event.image} alt={event.title} />
          </div>

          {/* Right: Event Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <EventTags category={event.category} />

            <EventTitleBlock
              id={event.id}
              title={event.title}
              description={event.description}
              color={event.color}
              lastDate={event.lastDate}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-0 backdrop-blur-sm mt-4">
              <EventDetailsBox event={event} />
              <EventPrizePool event={event} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 items-end">
          <div className="lg:col-span-2 space-y-12">
            {event.rules && event.rules.length > 0 && (
              <EventRules rules={event.rules} color={event.color} />
            )}

            {event.scoring && event.scoring.length > 0 && (
              <EventScoring scoring={event.scoring} color={event.color} />
            )}

            {event.eventFormat && event.eventFormat.length > 0 && (
              <EventFormat format={event.eventFormat} color={event.color} />
            )}

            {event.prizeDetails && event.prizeDetails.length > 0 && (
              <EventPrizeDetails
                prizeDetails={event.prizeDetails}
                color={event.color}
              />
            )}

            {/* No condition needed — component handles its own null check */}
            <EventSubmission
              submissionNote={event.submissionNote}
              submissionLinks={event.submissionLinks}
              color={event.color}
            />
          </div>

          <EventContact coordinators={event.coordinators} color={event.color} />
        </section>
      </div>

      <FloatingActionBar event={event} />
    </main>
  );
}
