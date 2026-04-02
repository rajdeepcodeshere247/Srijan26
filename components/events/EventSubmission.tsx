import React from "react";
import SwipeReveal from "./SwipeReveal";
import { SubmissionLink } from "@/components/events/types/events";

interface Props {
  submissionNote?: string;
  submissionLinks?: SubmissionLink[];
  color: string;
  className?: string;
}

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 shrink-0"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const renderWithBold = (text: string, color: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color }} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const CODE_BLOCK_RE = /`([^`]+)`/g;

const renderNote = (text: string, color: string) => {
  // Split on both **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color }} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded font-mono"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function EventSubmission({
  submissionNote,
  submissionLinks,
  color,
  className,
}: Props) {
  if (!submissionLinks || submissionLinks.length === 0) return null;

  return (
    <SwipeReveal>
      <div className={`${className || ""} space-y-4`}>
        <h2
          className="font-elnath text-3xl uppercase border-b pb-2"
          style={{ color }}
        >
          Submission
        </h2>

        <div className="text-white space-y-5">
          <p className="leading-relaxed text-white/80">
            {submissionNote
              ? renderNote(submissionNote, color)
              : "Submit your work using the link below before the deadline."}
          </p>

          <div className="flex flex-wrap gap-3">
            {submissionLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-euclid font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: color, color: "#fff" }}
              >
                <UploadIcon />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </SwipeReveal>
  );
}