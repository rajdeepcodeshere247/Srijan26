"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { BOT_AVATAR } from "./constants";

// The full ChatWidget is only dynamically imported AFTER the user first clicks
// the toggle button — it is NOT part of the initial JS bundle.
const ChatWidget = dynamic(() => import("./index"), { ssr: false });

export default function DynamicChatWidget() {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const didInteract = useRef(false);

  // Mirror the scroll-visibility logic so the placeholder fades in correctly
  useEffect(() => {
    const update = () => {
      const isHome = window.location.pathname === "/";
      setVisible(!isHome || window.scrollY > 80);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleClick = () => {
    if (!didInteract.current) {
      // First click: load the full widget bundle then open it
      didInteract.current = true;
      setLoaded(true);
      setOpen(true);
    } else {
      setOpen((o) => !o);
    }
  };

  // Once loaded, hand off entirely to the real ChatWidget
  if (loaded) {
    return <ChatWidget initialOpen={open} />;
  }

  // ─── Lightweight placeholder (zero heavy deps) ───────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "1rem",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        fontFamily: "var(--font-euclid), sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Teaser bubble */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(240,148,0,0.15), rgba(235,216,125,0.1))",
          border: "1px solid rgba(235,216,125,0.2)",
          borderRadius: 10,
          padding: "7px 12px",
          color: "rgba(255,255,255,0.85)",
          fontSize: 12,
          backdropFilter: "blur(8px)",
          position: "relative",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "#ebd87d", fontWeight: 700 }}>Doubts?</span>{" "}
        I&apos;m here to help!
        <span
          style={{
            position: "absolute",
            right: -5,
            top: "50%",
            transform: "translateY(-50%) rotate(45deg)",
            width: 9,
            height: 9,
            background:
              "linear-gradient(135deg, transparent 50%, rgba(235,216,125,0.2) 50%)",
            border: "1px solid rgba(235,216,125,0.2)",
            borderLeft: "none",
            borderBottom: "none",
          }}
        />
      </div>

      {/* Toggle button */}
      <button
        onClick={handleClick}
        aria-label="Open Kalpana AI chat"
        className="srijan-placeholder-toggle"
        style={{
          flexShrink: 0,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "2px solid rgba(235,216,125,0.4)",
          overflow: "hidden",
          cursor: "pointer",
          background: "#160505",
          padding: 0,
          animation: "srijan-pulse-glow 3s ease-in-out infinite",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BOT_AVATAR}
          alt="Kalpana"
          width={58}
          height={58}
          style={{
            display: "block",
            width: 58,
            height: 58,
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />
      </button>
      </div>

      <style>{`
        @keyframes srijan-pulse-glow {
          0%, 100% { box-shadow: 0 0 18px 4px rgba(240,148,0,0.35); }
          50%       { box-shadow: 0 0 32px 8px rgba(240,148,0,0.6); }
        }
        @media (max-width: 640px) {
          .srijan-placeholder-toggle { width: 46px !important; height: 46px !important; }
          .srijan-placeholder-toggle img { width: 46px !important; height: 46px !important; }
        }
      `}</style>
    </div>
  );
}