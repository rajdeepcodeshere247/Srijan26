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
  CARD_OUTLINE_DIMENSIONS,
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

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = memo(({ event }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleTagsRef = useRef<HTMLDivElement>(null);
  const hiddenContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const entryLayerRef = useRef<HTMLDivElement>(null);
  const outLineRef = useRef<SVGSVGElement>(null);

  const hoverTl = useRef<gsap.core.Timeline | null>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // --- ANIMATION INITIALIZATION ---
  useGSAP(() => {
    hoverTl.current = gsap
      .timeline({ paused: true })
      .set(imageRef.current, { filter: "blur(0px) brightness(1)" })
      .to(
        imageRef.current,
        {
          scale: 1.1,
          filter: "blur(2px) brightness(0.5)",
          duration: 0.5,
          ease: "power2.inOut",
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
        { threshold: 0.4 },
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [event.id]);

  // --- OPTIMIZED EVENT HANDLERS ---
  const handleMouseEnter = contextSafe(() => {
    hoverTl.current?.play();
  });

  const handleMouseLeave = contextSafe(() => {
    hoverTl.current?.reverse();
  });

  const handleActionClick = contextSafe(() => {
    hoverTl.current?.reverse();
  });

  return (
    <div
      className="relative hidden lg:block"
      style={{
        width: CARD_OUTLINE_DIMENSIONS.w,
        height: CARD_OUTLINE_DIMENSIONS.h,
      }}
    >
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: CARD_DIMENSIONS.w,
          height: CARD_DIMENSIONS.h,
          clipPath:
            "polygon(37.2px 0%, 100% 0%, 100% calc(100% - 37.2px), calc(100% - 37.2px) 100%, 0% 100%, 0% 37.2px)",
        }}
        className="relative top-1/2 left-1/2 -translate-1/2 z-10 bg-[#121212] overflow-hidden cursor-pointer will-change-transform"
      >
        {/* Entry animation layer */}
        <div
          ref={entryLayerRef}
          className="absolute inset-0 h-full w-full z-50 pointer-events-none"
        >
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-30 bg-black will-change-transform" />
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-20 bg-red will-change-transform" />
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-10 bg-amber-300 will-change-transform" />
          <div className="entryLayers absolute scale-x-100 inset-0 h-full w-full origin-right z-0 bg-white will-change-transform" />
        </div>

        {/* 1. BACKGROUND IMAGE LAYER */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Image
            ref={imageRef}
            src={event.image}
            alt={event.title}
            fill
            className="w-full h-full object-cover object-top will-change-[transform,filter]"
          />
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-linear-to-t from-0% via-40% to-100% from-black via-black/10 to-transparent pointer-events-none"
          />
        </div>

        {/* 2. STATUS BADGE */}
        {/* <div
          className={`font-euclid absolute top-3 right-3 z-20 text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider ${
            event.status === "Open"
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
            className="flex flex-col gap-2 relative z-20 pointer-events-auto"
          >
            <div className="flex flex-wrap gap-2">
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
              className="font-elnath text-2xl font-bold text-white uppercase will-change-[color]"
            >
              {event.title}
            </h3>
          </div>

          {/* -- HIDDEN PART (Description, Meta, Buttons) -- */}
          <div
            ref={hiddenContentRef}
            className="h-0 overflow-hidden flex flex-col gap-4 pointer-events-auto will-change-[height]"
            style={{ display: "none" }}
          >
            <div className="flex">
              <p className="font-euclid text-gray-300 text-xs leading-relaxed line-clamp-2 pt-2">
                {stripMarkdown(event.description)}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-white/80 font-euclid border-t border-white/10 pt-3">
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

            {/* Buttons */}
            <div
              className="flex flex-col gap-2 pb-1"
              onClickCapture={handleActionClick}
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
                className="font-euclid text-xs uppercase font-bold flex items-center justify-center py-2 gap-2 rounded bg-white hover:bg-white/80 active:bg-gray-200 duration-200 transition-all text-black"
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
      <svg
        ref={outLineRef}
        viewBox={`0 0 ${CARD_OUTLINE_DIMENSIONS.w} ${CARD_OUTLINE_DIMENSIONS.h}`}
        className="absolute z-10 top-0 left-0 pointer-events-none opacity-0 will-change-[opacity]"
        style={{
          width: CARD_OUTLINE_DIMENSIONS.w,
          height: CARD_OUTLINE_DIMENSIONS.h,
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

EventCard.displayName = "EventCard";

export default EventCard;