"use client";

import React, { useRef, memo } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Users, Trophy, MapPin, Info } from "lucide-react";
import { Event } from "@/components/events/types/events";
import { 
  CLIP_PATH, 
  CARD_DIMENSIONS, 
  CARD_OUTLINE_DIMENSIONS 
} from "./constants/events";
import RegisterButton from "./RegisterButton";
import ShareButton from "./ShareButton";
import Image from "next/image";
import DocButton from "./DocButton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Strips common markdown syntax (bold, italic, code, links, headings, etc.)
// so raw markdown strings render as clean plain text.
const stripMarkdown = (text: string): string =>
  text
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold**
    .replace(/\*(.+?)\*/g, "$1")     // *italic*
    .replace(/__(.+?)__/g, "$1")     // __bold__
    .replace(/_(.+?)_/g, "$1")       // _italic_
    .replace(/~~(.+?)~~/g, "$1")     // ~~strikethrough~~
    .replace(/`(.+?)`/g, "$1")       // `inline code`
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // [link](url)
    .replace(/^#{1,6}\s+/gm, "")     // # headings
    .replace(/^[-*+]\s+/gm, "")      // - list items
    .replace(/^\d+\.\s+/gm, "")      // 1. ordered list
    .replace(/^>\s+/gm, "")          // > blockquotes
    .trim();

interface EventCardTouchProps {
  event: Event;
}

const EventCardTouch: React.FC<EventCardTouchProps> = memo(({ event }) => {
  // Use refs for state to completely bypass React re-rendering on toggle
  const isOpen = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleTagsRef = useRef<HTMLDivElement>(null);
  const hiddenContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const entryLayerRef = useRef<HTMLDivElement>(null);
  const outLineRef = useRef<SVGSVGElement>(null);

  // Store the timeline in a ref so it's built once and reused
  const touchTl = useRef<gsap.core.Timeline | null>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // --- ANIMATION INITIALIZATION ---
  useGSAP(() => {
    touchTl.current = gsap
      .timeline({ paused: true })
      .set(imageRef.current, { filter: "brightness(1)" })
      .to(
        imageRef.current,
        {
          scale: 1.1,
          filter: "brightness(0.5)",
          duration: 0.5,
          ease: "power2.inOut",
          force3D: true,
        },
        0,
      )
      .to(
        outLineRef.current,
        {
          autoAlpha: 1,
          duration: 0.3,
        },
        0,
      )
      .to(
        titleRef.current,
        {
          color: "#fde047",
          duration: 0.3,
        },
        0,
      )
      .set(hiddenContentRef.current, { display: "flex" }, 0)
      .to(
        hiddenContentRef.current,
        {
          height: "auto",
          autoAlpha: 1,
          duration: 0.4,
          ease: "power2.inOut",
        },
        0,
      );

    if (entryLayerRef.current && containerRef.current) {
      const entryAnim = gsap.fromTo(
        entryLayerRef.current.children,
        { scaleX: 1 },
        {
          scaleX: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          transformOrigin: "right center",
          force3D: true,
          paused: true,
        },
      );

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            entryAnim.play();
            observer.disconnect();
          }
        },
        { threshold: 0.3 },
      );

      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }
  }, [event.slug]);

  // --- OPTIMIZED EVENT HANDLERS ---
  const toggleCard = contextSafe((e: React.MouseEvent) => {
    e.preventDefault();
    isOpen.current = !isOpen.current;

    if (isOpen.current) {
      touchTl.current?.play();
    } else {
      touchTl.current?.reverse();
    }
  });

  return (
    <div 
      className="relative block lg:hidden"
      style={{ 
        width: CARD_OUTLINE_DIMENSIONS.w, 
        height: CARD_OUTLINE_DIMENSIONS.h 
      }}
    >
      <div
        ref={containerRef}
        onClick={toggleCard}
        style={{
          width: CARD_DIMENSIONS.w,
          height: CARD_DIMENSIONS.h,
          clipPath:
            "polygon(37.2px 0%, 100% 0%, 100% calc(100% - 37.2px), calc(100% - 37.2px) 100%, 0% 100%, 0% 37.2px)",
          touchAction: "pan-y",
        }}
        className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#121212] overflow-hidden cursor-pointer tap-highlight-transparent will-change-transform"
      >
        {/* Entry animation layer */}
        <div
          ref={entryLayerRef}
          className="absolute inset-0 h-full w-full z-50 pointer-events-none"
        >
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-30 bg-black will-change-transform" />
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-20 bg-red-600 will-change-transform" />
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-10 bg-amber-300 will-change-transform" />
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-0 bg-white will-change-transform" />
        </div>

        {/* 1. BACKGROUND IMAGE LAYER */}
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
          <Image
            ref={imageRef}
            src={event.image}
            alt={event.title}
            fill
            className="w-full h-full object-cover object-top will-change-[transform,filter] backface-hidden"
          />
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-linear-to-t from-0% via-40% to-100% from-black via-black/10 to-transparent"
          />
        </div>

        {/* 2. STATUS BADGE */}
        {/* <div
          className={`font-euclid absolute top-3 right-3 z-20 text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider ${event.status === "Open"
            ? "bg-green-500 text-white"
            : event.status === "Closed"
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-white"
            }`}
        >
          {event.status}
        </div> */}

        {/* 3. CONTENT CONTAINER */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end z-10 pointer-events-none">
          {/* -- ALWAYS VISIBLE PART (Title & Tags) -- */}
          <div
            ref={titleTagsRef}
            className="flex flex-col gap-2 relative z-20 pointer-events-none"
          >
            <div className="flex flex-wrap gap-2 pointer-events-auto">
              {event.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="font-euclid bg-red-600/50 text-[10px] px-2 py-0.5 rounded text-red-100 uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3
              ref={titleRef}
              className="font-elnath text-2xl font-bold text-white uppercase will-change-[color] pointer-events-auto"
            >
              {event.title}
            </h3>
          </div>

          {/* -- HIDDEN PART (Description, Meta, Buttons) -- */}
          <div
            ref={hiddenContentRef}
            className="h-0 opacity-0 overflow-hidden flex flex-col gap-4 will-change-[height,opacity,visibility] pointer-events-auto"
            style={{ display: "none" }}
          >
            <div className="flex pointer-events-none">
              <p className="font-euclid text-gray-300 text-xs leading-relaxed line-clamp-2 pt-2">
                {stripMarkdown(event.description)}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-white/80 font-euclid border-t border-white/10 pt-3 pointer-events-none">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-white" />
                <span>{event.finalsDate || event.lastDate || "TBD"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-white" />
                <span>{event.teamSize}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-3 h-3 text-yellow-300" />
                <span className="text-yellow-300">{event.prizePool}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-white" />
                <span>{event.format}</span>
              </div>
            </div>

            {/* Buttons Container */}
            <div
              className="flex flex-col gap-2 pb-1 relative z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <RegisterButton
                status={event.status}
                link={event.link}
                isCard={true}
                slug={event.slug}
              />

              <Link
                href={`/events/${event.slug}`}
                prefetch={false}
                style={{ clipPath: CLIP_PATH }}
                className="font-euclid text-xs uppercase font-bold flex items-center justify-center py-2 gap-2 rounded bg-white hover:bg-white/80 active:bg-gray-200 duration-150 transition-all text-black"
                title="More Info"
              >
                <p>More Info</p>
                <Info size={16} strokeWidth={2} />
              </Link>

              <div className="flex w-full gap-2">
                <ShareButton
                  eventSlug={event.slug}
                  eventTitle={event.title}
                  isCard={true}
                />

                <DocButton
                  isCard={true}
                  docUrl={event.driveLink ?? event.pdfLink ?? ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Outline */}
      <svg
        ref={outLineRef}
        viewBox={`0 0 ${CARD_OUTLINE_DIMENSIONS.w} ${CARD_OUTLINE_DIMENSIONS.h}`}
        className="absolute z-10 top-0 left-0 pointer-events-none opacity-0 will-change-[opacity]"
        style={{ 
          width: CARD_OUTLINE_DIMENSIONS.w, 
          height: CARD_OUTLINE_DIMENSIONS.h 
        }}
      >
        <path
          d={`M 40 1 L ${CARD_OUTLINE_DIMENSIONS.w - 1} 1 L ${CARD_OUTLINE_DIMENSIONS.w - 1} ${CARD_OUTLINE_DIMENSIONS.h - 40} L ${CARD_OUTLINE_DIMENSIONS.w - 40} ${CARD_OUTLINE_DIMENSIONS.h - 1} L 1 ${CARD_OUTLINE_DIMENSIONS.h - 1} L 1 40 Z`}
          fill="transparent"
          stroke={event.color}
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
});

EventCardTouch.displayName = "EventCardTouch";

export default EventCardTouch;