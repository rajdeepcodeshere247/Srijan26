"use client";

import React, { useRef, useEffect } from "react";
import { ExternalLink, Loader2, FileText } from "lucide-react";
import { Message, QUICK_QUESTIONS, BOT_AVATAR, POSTER_BASE_URL } from "./constants";

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const tokens: React.ReactNode[] = [];
    const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(https?:\/\/[^\s]+)/g;
    let last = 0;
    let match;
    let ti = 0;
    while ((match = re.exec(line)) !== null) {
      if (match.index > last) {
        tokens.push(<span key={`t-${li}-${ti++}`}>{line.slice(last, match.index)}</span>);
      }
      if (match[1]) {
        tokens.push(<strong key={`t-${li}-${ti++}`} style={{ fontWeight: 700 }}>{match[2]}</strong>);
      } else if (match[3]) {
        tokens.push(<em key={`t-${li}-${ti++}`}>{match[4]}</em>);
      } else if (match[5]) {
        tokens.push(
          <a key={`t-${li}-${ti++}`} href={match[5]} target="_blank" rel="noopener noreferrer"
            style={{ color: "#ebd87d", textDecoration: "underline" }}>
            {match[5]}
          </a>
        );
      }
      last = match.index + match[0].length;
    }
    if (last < line.length) tokens.push(<span key={`t-${li}-${ti++}`}>{line.slice(last)}</span>);
    return (
      <span key={`line-${li}`}>
        {tokens.length ? tokens : <span>&nbsp;</span>}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean; 
  onQuickReply: (option: typeof QUICK_QUESTIONS[number]) => void;
}

export const ChatMessages = React.memo(function ChatMessages({ messages, isLoading, isOpen, onQuickReply }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
    return () => clearTimeout(timer);
  }, [messages, isOpen]);

  return (
    <div
      className="srijan-scrollbar"
      style={{
        flex: 1, overflowY: "auto", padding: "16px 14px",
        display: "flex", flexDirection: "column", gap: 16,
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {messages.map((msg, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
          <div style={{ display: "flex", maxWidth: "85%", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
            {msg.role === "assistant" && (
              <img src={BOT_AVATAR} alt="Kalpana"
                style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 2, border: "1px solid rgba(235,216,125,0.25)", background: "#2a0d0d", objectFit: "cover" }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={msg.role === "user"
                ? { padding: "10px 14px", fontSize: 13, borderRadius: "18px 4px 18px 18px", background: "linear-gradient(135deg, #f09400, #ebd87d)", color: "#160505", fontWeight: 600, lineHeight: 1.5, wordBreak: "break-word", boxShadow: "0 4px 16px rgba(240,148,0,0.25)" }
                : { padding: "10px 14px", fontSize: 13, borderRadius: "4px 18px 18px 18px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.88)", border: "1px solid rgba(235,216,125,0.1)", lineHeight: 1.6, wordBreak: "break-word" }
              }>
                {/* Registration status badge */}
                {msg.status && msg.status !== "None" && msg.status !== "" && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 4,
                      border: `1px solid ${msg.status.toUpperCase() === "OPEN" ? "rgba(34,197,94,0.3)" : "rgba(240,0,0,0.3)"}`,
                      background: msg.status.toUpperCase() === "OPEN" ? "rgba(34,197,94,0.1)" : "rgba(240,0,0,0.1)",
                      color: msg.status.toUpperCase() === "OPEN" ? "#4ade80" : "#f87171",
                    }}>
                      REGISTRATION: {msg.status.toUpperCase()}
                    </span>
                  </div>
                )}

                <div>{renderMarkdown(msg.content)}</div>

                {/* Event poster */}
                {msg.poster && msg.poster !== "None" && msg.poster !== "" && (
                  <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(235,216,125,0.15)", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "center" }}>
                    <img src={`${POSTER_BASE_URL}${msg.poster}`} alt="Event poster"
                      style={{ width: "100%", maxWidth: 350, height: "auto", maxHeight: 300, objectFit: "contain", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}

                {/* Action links */}
                {(msg.link || (msg.drive_link && msg.drive_link !== "None")) && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(235,216,125,0.1)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {msg.link && (
                      <a href={`https://srijanju.in${msg.link}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 6, background: "linear-gradient(135deg, rgba(240,148,0,0.2), rgba(235,216,125,0.15))", border: "1px solid rgba(240,148,0,0.35)", color: "#ebd87d", textDecoration: "none", letterSpacing: "0.04em" }}>
                        Register Now <ExternalLink size={11} />
                      </a>
                    )}
                    {msg.drive_link && msg.drive_link !== "None" && msg.drive_link !== "" && (
                      <a href={msg.drive_link} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", textDecoration: "none", letterSpacing: "0.04em" }}>
                        <FileText size={11} /> Rulebook
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Quick reply chips*/}
      {messages.length === 1 && !isLoading && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 32 }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={q.id} className="srijan-chip"
              style={{ animationDelay: `${i * 0.07}s`, fontSize: 11, padding: "6px 13px", borderRadius: 99, border: "1px solid rgba(235,216,125,0.2)", background: "rgba(235,216,125,0.05)", color: "rgba(235,216,125,0.8)", cursor: "pointer", textAlign: "left", fontFamily: "inherit", letterSpacing: "0.02em", transition: "all 0.15s" }}
              onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(235,216,125,0.12)"; b.style.borderColor = "rgba(235,216,125,0.4)"; b.style.color = "#ebd87d"; b.style.transform = "scale(1.04)"; }}
              onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(235,216,125,0.05)"; b.style.borderColor = "rgba(235,216,125,0.2)"; b.style.color = "rgba(235,216,125,0.8)"; b.style.transform = "scale(1)"; }}
              onClick={() => onQuickReply(q)}
            >{q.label}</button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <img src={BOT_AVATAR} alt="" style={{ width: 24, height: 24, borderRadius: "50%", opacity: 0.4, filter: "grayscale(1)", objectFit: "cover" }} />
          <div style={{ padding: "8px 14px", borderRadius: "4px 18px 18px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(235,216,125,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
            <Loader2 size={13} style={{ color: "#f09400" }} className="animate-spin" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>Thinking…</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
});