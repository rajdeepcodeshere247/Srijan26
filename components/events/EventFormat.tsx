import React from "react";
import SwipeReveal from "./SwipeReveal";

interface Props {
  format?: string[];
  color: string;
  className?: string;
}

export default function EventFormat({ format, color, className }: Props) {
  // Safety check
  if (!format || format.length === 0) return null;

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color }} className="font-euclid font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Handle Links [text](url)
      if (part.startsWith("[") && part.endsWith(")")) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const linkText = match[1];
          const url = match[2];
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color }}
              className="underline hover:opacity-80 transition-opacity font-semibold"
            >
              {linkText}
            </a>
          );
        }
      }

      return part;
    });
  };

  return (
    <SwipeReveal>
      <div className={` ${className} space-y-4`}>
        <h2 className="font-elnath text-3xl uppercase border-b pb-2" style={{ color }}>
          Event Format
        </h2>

        <div className="text-white space-y-3">
          {format.map((item, index) => {
            const isHeading = item.startsWith("# ");
            const textToRender = isHeading ? item.slice(2) : item;

            if (isHeading) {
              return (
                <p key={index} className="leading-relaxed text-xl pb-1 mt-8 font-semibold">
                  {renderFormattedText(textToRender)}
                </p>
              );
            }

            return (
              <div key={index} className="flex items-start gap-3">
                <span
                  className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="leading-relaxed">
                  {renderFormattedText(textToRender)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SwipeReveal>
  );
}
