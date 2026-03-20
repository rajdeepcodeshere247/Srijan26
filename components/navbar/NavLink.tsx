"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CLIP_PATH } from "./constants";

const MotionLink = motion.create(Link);

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string; 
}

export function NavLink({ href, label, isActive, onClick, className }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionLink
      href={href}
      prefetch={false}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative px-10 h-10 font-bold uppercase flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{
        clipPath: CLIP_PATH,
      }}
      initial={false}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <AnimatePresence>
        {/* Active State: Red Background */}
        {isActive && (
          <motion.div
            key="active-bg"
            className="absolute inset-0 bg-red pointer-events-none"
            style={{ clipPath: CLIP_PATH }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Hover State: White Outline */}
        {isHovered && !isActive && (
          <motion.div
            key="hover-outline"
            className="absolute inset-0 bg-white pointer-events-none"
            style={{ clipPath: CLIP_PATH }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
             <div
              className="absolute inset-0.5 bg-background"
              style={{ clipPath: CLIP_PATH }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <span className="relative z-10 text-white">{label}</span>
    </MotionLink>
  );
}
