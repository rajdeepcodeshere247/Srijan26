"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { CLIP_PATH } from "./constants";

const MotionLink = motion.create(Link);

interface LoginButtonProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function LoginButton({ className, isActive, onClick }: LoginButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: session } = useSession();

  const isLoggedIn = !!session?.user;
  const href = isLoggedIn ? "/dashboard" : "/login";
  const label = isLoggedIn ? "dashboard" : "login";

  const showRed = isActive;
  const showWhite = !isActive && !isHovered;
  const showOutline = isHovered && !isActive;

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
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <AnimatePresence>
        {/* Active State: Red Background */}
        {showRed && (
          <motion.div
            key="active-red-bg"
            className="absolute inset-0 bg-red pointer-events-none"
            style={{ clipPath: CLIP_PATH }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Default State: White Background */}
        {showWhite && (
          <motion.div
            key="default-white-bg"
            className="absolute inset-0 bg-foreground pointer-events-none"
            style={{ clipPath: CLIP_PATH }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Hover State: White Outline */}
        {showOutline && (
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

      <span className={`relative z-10 transition-colors duration-200 ${showWhite ? "text-black" : "text-white"}`}>
        {label}
      </span>
    </MotionLink>
  );
}
