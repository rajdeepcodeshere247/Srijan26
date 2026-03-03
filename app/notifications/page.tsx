"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ReactLenis } from "lenis/react";
import NotificationCard from "@/components/Notifications/NotificationCard";
import WavyGradient from "@/components/WavyGradient";
import Loading from "@/components/Loading";
import LoginPage from "@/app/(auth)/login/page";
import SignupPage from "@/app/(auth)/signup/page";

// GSAP Imports
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Import the static mock data
import { NOTIFICATIONS_DATA } from "@/components/Notifications/constants/notifications";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function NotificationsPage() {
  const { status } = useSession();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [localNotes, setLocalNotes] = useState<any[]>([]);
  
  // Reference for scoping GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("local_notifications") || "[]");
    setLocalNotes(stored);
  }, []);

  const allNotifications = [...localNotes, ...NOTIFICATIONS_DATA];

  // GSAP Animations
  useGSAP(() => {
    // 1. Initial Page Entry Animations (Header)
    gsap.from(".header-anim", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2, // Loads elements one by one
      ease: "back.out(1.5)",
      delay: 0.2,
    });

    // 2. Scroll Animations for Notifications ("Pop in / out")
    const notificationCards = gsap.utils.toArray(".notification-anim");
    
    notificationCards.forEach((card: any) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%", // Animation starts when top of card hits 85% of viewport
          toggleActions: "play none none reverse", // Plays on scroll down, reverses (fades out) on scroll up
        },
        scale: 0.8, // Start slightly shrunken for the "pop" effect
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)", // Gives that bouncy pop feel
      });
    });

    // 3. Empty State Animation (if applicable)
    if (allNotifications.length === 0) {
      gsap.from(".empty-state-anim", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.5,
      });
    }
  }, { scope: containerRef, dependencies: [allNotifications.length, status] }); 
  // Dependency array ensures animations recalculate when localNotes finish loading

  if (status === "loading") return <Loading />;

  if (status === "unauthenticated") {
    return (
      <main className="full-bleed min-h-screen relative text-white overflow-hidden">
        <WavyGradient
          color1="#bc6116"
          color2="#8f0c03"
          color3="#1A0000"
          direction={20}
          speed={1.5}
          waveHeight={0.45}
          noiseIntensity={5}
          waveAmplitude={1}
        />
        <Suspense fallback={<Loading />}>
          {authMode === "login" ? <LoginPage /> : <SignupPage />}
        </Suspense>
      </main>
    );
  }

  return (
    <ReactLenis root>
      <main ref={containerRef} className="full-bleed min-h-screen relative text-white overflow-hidden">
        <WavyGradient
          color1="#bc6116"
          color2="#8f0c03"
          color3="#1A0000"
          direction={20}
          speed={1.5}
          waveHeight={0.45}
          noiseIntensity={5}
          waveAmplitude={1}
        />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 flex flex-col gap-10 sm:gap-12">
          
          <header className="flex flex-col items-center text-center gap-3 sm:gap-4 px-3">
            {/* Added header-anim class */}
            <h1 className="header-anim text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-elnath text-[#EBD87D] drop-shadow-lg leading-tight">
              NOTIFICATIONS
            </h1>
            {/* Added header-anim class */}
            <p className="header-anim text-base sm:text-lg md:text-xl text-white/70 font-euclid max-w-md sm:max-w-lg">
              Stay updated with the latest announcements from Srijan '26.
            </p>
          </header>

          <div className="flex flex-col gap-6 w-full min-h-[250px] sm:min-h-[300px]">
            {allNotifications.length > 0 ? (
              allNotifications.map((note) => {
                return (
                  /* Wrapped in a div for reliable GSAP targeting without modifying child component */
                  <div key={note.id} className="notification-anim">
                    <NotificationCard
                      title={note.title}
                      message={note.description}
                      date={note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "New Update"}
                      isNew={note.isNew}
                      color={note.color}
                      registerLink={note.link}
                      moreInfoLink={note.slug ? `/events/${note.slug}` : undefined} 
                    />
                  </div>
                );
              })
            ) : (
              /* Added empty-state-anim class */
              <div className="empty-state-anim flex flex-col items-center justify-center py-16 sm:py-24 gap-4 sm:gap-6 text-center border border-white/10 rounded-xl bg-white/5 backdrop-blur-md mx-3">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 sm:h-8 w-6 sm:w-8 text-[#EBD87D]/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div className="space-y-2 sm:space-y-3 px-4">
                  <h3 className="text-lg sm:text-2xl font-futura text-[#EBD87D] tracking-wide uppercase">
                    All Caught Up
                  </h3>
                  <p className="text-white/50 font-euclid text-sm sm:text-base max-w-xs sm:max-w-sm mx-auto">
                    We don't have any new updates for you right now. Check back closer to the event!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ReactLenis>
  );
}
