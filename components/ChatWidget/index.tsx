"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, X, Maximize2, Minimize2, LogIn } from "lucide-react";
import { Message, QUICK_QUESTIONS, BOT_AVATAR } from "./constants";
import { sendMessageToBot } from "./actions";
import { ChatMessages } from "./ChatMessages";

function ChatHeader({
  isFullscreen, onFullscreen, onMinimize, onClose,
}: {
  isFullscreen: boolean;
  onFullscreen?: () => void;
  onMinimize?: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{
      padding: isFullscreen ? "12px 16px" : "12px 14px",
      borderBottom: "1px solid rgba(235,216,125,0.12)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "linear-gradient(90deg, rgba(240,148,0,0.06) 0%, rgba(240,0,0,0.04) 100%)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <img src={BOT_AVATAR} alt="Kalpana"
            style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(235,216,125,0.35)", objectFit: "cover", background: "#2a0d0d" }}
          />
          <span style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", border: "2px solid #160505" }} />
        </div>
        <div>
          <span style={{ display: "block", color: "#ebd87d", fontWeight: 700, fontSize: 13, letterSpacing: "0.03em", fontFamily: "var(--font-elnath), sans-serif" }}>KALPANA 3.0</span>
          <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Srijan&nbsp;2026&nbsp;AI</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {isFullscreen && onMinimize && (
          <button onClick={onMinimize} className="srijan-fs-btn"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", padding: 6, borderRadius: 8 }}
            aria-label="Exit fullscreen"
          ><Minimize2 size={16} /></button>
        )}
        {!isFullscreen && onFullscreen && (
          <button onClick={onFullscreen} className="srijan-fs-btn"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", padding: 6, borderRadius: 8 }}
            aria-label="Fullscreen"
          ><Maximize2 size={15} /></button>
        )}
        <button onClick={onClose} className="srijan-fs-btn"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", padding: 6, borderRadius: 8 }}
          aria-label="Close chat"
        ><X size={17} /></button>
      </div>
    </div>
  );
}

function ChatInput({
  input, isLoading, isLoggedIn, onChange, onKeyDown, onSend, fontSize, maxHeight,
}: {
  input: string;
  isLoading: boolean;
  isLoggedIn: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  fontSize: number;
  maxHeight: number;
}) {
  const disabled = isLoading || !input.trim() || !isLoggedIn;

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "12px", borderTop: "1px solid rgba(235,216,125,0.1)", background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "center" }}>
        <a href="/login"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", textDecoration: "none", background: "linear-gradient(135deg, #f09400, #ebd87d)", color: "#160505", boxShadow: "0 4px 16px rgba(240,148,0,0.3)", transition: "opacity 0.15s", fontFamily: "inherit" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
        >
          <LogIn size={15} />
          Please Login to Continue
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(235,216,125,0.1)", display: "flex", gap: 8, alignItems: "flex-end", background: "rgba(255,255,255,0.02)" }}>
      <textarea
        value={input} onChange={onChange} onKeyDown={onKeyDown}
        placeholder="Enter message…" rows={1} className="srijan-textarea"
        style={{ flex: 1, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.9)", fontSize, padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(235,216,125,0.15)", outline: "none", resize: "none", minHeight: 44, maxHeight, fontFamily: "inherit", lineHeight: 1.5, caretColor: "#f09400" }}
        onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(235,216,125,0.35)"; }}
        onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(235,216,125,0.15)"; }}
      />
      <button onClick={onSend} disabled={disabled}
        style={{ width: 44, height: 44, borderRadius: 12, border: "none", cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "rgba(235,216,125,0.1)" : "linear-gradient(135deg, #f09400, #ebd87d)", color: disabled ? "rgba(255,255,255,0.25)" : "#160505", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s", opacity: disabled ? 0.5 : 1 }}>
        <Send size={17} />
      </button>
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Kalpana 3.0, your AI guide for Srijan 2026.\nNeed details about events, timelines, rules, or registrations? Just ask — I've got the answers.",
    },
  ]);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isEventPage = pathname.startsWith("/events/");

  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const update = () => {
      const isMobile = window.innerWidth <= 640;
      if (isMobile && isEventPage && !isOpen) {
        setVisible(false);
        return;
      }
      if (!isHome) {
        setVisible(true);
      } else {
        setVisible(isOpen || window.scrollY > 80);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome, isEventPage, isOpen]);

  // Reset
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setIsLoading(false);
      setInput("");
    }
  }, [isOpen]);

  const handleQuickReply = (option: typeof QUICK_QUESTIONS[number]) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: option.label },
      { role: "assistant", content: option.answer, link: option.link },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || !isLoggedIn) return;
    const userText = input;
    setInput("");
    const newHistory: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newHistory);
    setIsLoading(true);
    try {
      const data = await sendMessageToBot(userText, newHistory.slice(1));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          link: data.link,
          poster: data.poster,
          drive_link: data.drive_link,
          status: data.status,
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sorry, I am having trouble connecting right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputProps = {
    input, isLoading, isLoggedIn,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value),
    onKeyDown: handleKeyDown,
    onSend: handleSend,
  };

  return (
    <>
      <style>{`
        @keyframes srijan-fadein {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes srijan-fadein-fs {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes srijan-chip-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes srijan-pulse-glow {
          0%, 100% { box-shadow: 0 0 18px 4px rgba(240,148,0,0.35); }
          50%       { box-shadow: 0 0 32px 8px rgba(240,148,0,0.6); }
        }
        .srijan-chat-window     { animation: srijan-fadein 0.22s ease both; }
        .srijan-chat-fullscreen { animation: srijan-fadein-fs 0.2s ease both; }
        .srijan-chip            { animation: srijan-chip-in 0.3s ease both; }
        .srijan-glow            { animation: srijan-pulse-glow 3s ease-in-out infinite; }
        .srijan-scrollbar::-webkit-scrollbar { width: 4px; }
        .srijan-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 99px; }
        .srijan-scrollbar::-webkit-scrollbar-thumb { background: rgba(235,216,125,0.2); border-radius: 99px; }
        .srijan-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(235,216,125,0.4); }
        .srijan-textarea { field-sizing: content; }
        .srijan-widget { transition: opacity 0.35s ease, transform 0.35s ease; }
        .srijan-widget-hidden  { opacity: 0; pointer-events: none; transform: translateY(20px); }
        .srijan-widget-visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .srijan-toggle-size     { width: 58px; height: 58px; }
        .srijan-toggle-img-size { width: 58px; height: 58px; object-fit: cover; object-position: center 20%; }
        .srijan-fs-btn { transition: color 0.15s, background 0.15s; }
        .srijan-fs-btn:hover { color: #f09400 !important; background: rgba(240,148,0,0.1) !important; }
        @media (max-width: 640px) {
          .srijan-toggle-size     { width: 46px; height: 46px; }
          .srijan-toggle-img-size { width: 46px; height: 46px; }
          .srijan-chat-window {
            width: calc(100vw - 2rem) !important;
            height: 85dvh !important;
            max-height: 580px !important;
          }
        }
      `}</style>

      {/* Fullscreen overlay */}
      {isOpen && isFullscreen && (
        <div className="srijan-chat-fullscreen" style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #1e0808 0%, #160505 60%, #1a0a05 100%)", fontFamily: "var(--font-euclid), 'Euclid Circular B', sans-serif" }}>
          <ChatHeader isFullscreen onMinimize={() => setIsFullscreen(false)} onClose={() => setIsOpen(false)} />
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", maxWidth: 800, width: "100%", margin: "0 auto", alignSelf: "stretch" }}>
            <ChatMessages messages={messages} isLoading={isLoading} isOpen={isOpen} onQuickReply={handleQuickReply} />
          </div>
          <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", alignSelf: "stretch" }}>
            <ChatInput {...inputProps} fontSize={14} maxHeight={160} />
          </div>
        </div>
      )}

      {/* Floating widget */}
      <div
        className={`srijan-widget ${visible ? "srijan-widget-visible" : "srijan-widget-hidden"}`}
        style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem", fontFamily: "var(--font-euclid), 'Euclid Circular B', sans-serif" }}
      >
        {/* Chat window*/}
        {isOpen && !isFullscreen && (
          <div className="srijan-chat-window" style={{ width: "380px", height: "600px", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(235,216,125,0.18)", background: "linear-gradient(160deg, #1e0808 0%, #160505 60%, #1a0a05 100%)", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,148,0,0.08) inset" }}>
            <ChatHeader isFullscreen={false} onFullscreen={() => setIsFullscreen(true)} onClose={() => setIsOpen(false)} />
            <ChatMessages messages={messages} isLoading={isLoading} isOpen={isOpen} onQuickReply={handleQuickReply} />
            <ChatInput {...inputProps} fontSize={13} maxHeight={128} />
          </div>
        )}

        {/* Toggle button row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isOpen && !isEventPage && (
            <div style={{ background: "linear-gradient(135deg, rgba(240,148,0,0.15), rgba(235,216,125,0.1))", border: "1px solid rgba(235,216,125,0.2)", borderRadius: 10, padding: "7px 12px", color: "rgba(255,255,255,0.85)", fontSize: 12, backdropFilter: "blur(8px)", position: "relative", whiteSpace: "nowrap" }}>
              <span style={{ color: "#ebd87d", fontWeight: 700 }}>Doubts?</span>{" "}
              I&apos;m here to help!
              <span style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%) rotate(45deg)", width: 9, height: 9, background: "linear-gradient(135deg, transparent 50%, rgba(235,216,125,0.2) 50%)", border: "1px solid rgba(235,216,125,0.2)", borderLeft: "none", borderBottom: "none" }} />
            </div>
          )}
          <button
            onClick={() => setIsOpen((o) => !o)}
            className={((!isOpen ? "srijan-glow " : "") + "srijan-toggle-size")}
            style={{ borderRadius: "50%", border: "2px solid rgba(235,216,125,0.4)", overflow: "hidden", cursor: "pointer", background: "#160505", padding: 0, transition: "transform 0.2s, border-color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#ebd87d"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(235,216,125,0.4)"; }}
            aria-label="Toggle chat"
          >
            <img src={BOT_AVATAR} alt="Kalpana" className="srijan-toggle-img-size" style={{ display: "block" }} />
          </button>
        </div>
      </div>
    </>
  );
}