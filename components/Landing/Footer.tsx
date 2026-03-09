"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SrijanBigTextSVG from "./SrijanBigTextSVG";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  // { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Merchandise", href: "/merchandise" },
  // { label: "Dashboard", href: "/dashboard" },
  { label: "Contact", href: "/#contact-us" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/pdf/Privacy_Policy.pdf" },
  { label: "Terms", href: "/terms" },
  { label: "Events", href: "/events" },
];

const SOCIAL_LINKS = [
  { icon: "/icons/linkedin.svg", alt: "LinkedIn", href: "https://in.linkedin.com/company/srijan-ju" },
  { icon: "/icons/instagram.svg", alt: "Instagram", href: "https://www.instagram.com/srijan_ju/" },
  { icon: "/icons/youtube.svg", alt: "YouTube", href: "https://www.youtube.com/channel/UCnuZJMtVle5xn5M1wYIlg9g" },
];


function FooterInner() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!footerRef.current) return;

    gsap.fromTo(
      ".reveal-stop",
      { attr: { offset: "0%" } },
      {
        attr: { offset: "100%" },
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "center 100%",
          end: "bottom bottom",
          scrub: 1,
        },
      }
    );

    gsap.fromTo(
      ".floating-dot",
      { y: 50 },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          end: "bottom bottom",
          scrub: 2,
        },
      }
    );
  }, {
    scope: footerRef,
  });

  return (
    <footer
      ref={footerRef}
      className="full-bleed relative w-full pt-16 overflow-hidden"
    >
      {/* ── Top Section ── */}
      <div className="px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left — Logo + Description */}
        <div className="flex flex-col gap-2 lg:max-w-95 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="relative w-16 h-16 shrink-0">
                <Image
                  src="/srijan-logo.png"
                  alt="Srijan Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-40 h-20 shrink-0">
                <Image
                  src="/srijan26-text-logo.png"
                  alt="Srijan 26"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
          <p className="text-white/70 text-base leading-relaxed font-euclid">
            A convergence of innovation, competition, and culture - the spirit of
            engineering at Jadavpur University.
          </p>
        </div>

        {/* Right — Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 flex-1">
          {/* NAVIGATION */}
          <div className="flex flex-col gap-4">
            <h4 className="font-elnath text-base font-bold uppercase tracking-[0.25em] text-white border-b-2 border-white/30 pb-2">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/80 text-base font-euclid hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LOCATED AT */}
          <div className="flex flex-col gap-4">
            <h4 className="font-elnath text-base font-bold uppercase tracking-[0.25em] text-white border-b-2 border-white/30 pb-2">
              Located At
            </h4>
            <address className="text-white/80 text-base font-euclid not-italic leading-relaxed">
              Jadavpur University Saltlake Campus, <br />Plot No. 8, Block-73, <br />Salt Lake Bypass, Sector-III, <br /> Salt Lake City, Kolkata - 700106
              <br />
              West Bengal, India
            </address>
          </div>

          {/* FOLLOW US */}
          <div className="flex flex-col gap-4">
            <h4 className="font-elnath text-base font-bold uppercase tracking-[0.25em] text-white border-b-2 border-white/30 pb-2">
              Follow Us
            </h4>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.alt}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-200"
                >
                  <Image
                    src={social.icon}
                    alt={social.alt}
                    width={40}
                    height={40}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* LEGAL */}
          <div className="flex flex-col gap-4">
            <h4 className="font-elnath text-base font-bold uppercase tracking-[0.25em] text-white border-b-2 border-white/30 pb-2">
              Legal
            </h4>
            <ul className="flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/80 text-base font-euclid hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Section — Big SRIJAN SVG ── */}
      <div className="relative mt-20 w-full flex items-end justify-center">
        <div className="w-full">
          <SrijanBigTextSVG className="w-full h-auto block" />
        </div>
      </div>
    </footer>
  );
}

// this re-renders the inner component every time the page changes
// this is done to reset the animation
export default function Footer() {
  const pathname = usePathname();
  return <FooterInner key={pathname} />;
}
