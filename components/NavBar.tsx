"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileNavContext } from "@/hooks/useMobileNav";
import { NavLink } from "@/components/navbar/NavLink";
import { LoginButton } from "@/components/navbar/LoginButton";
import { HamburgerButton } from "@/components/navbar/HamburgerButton";
import { NAV_LINKS } from "@/components/navbar/constants";

export default function NavBar() {
  const { isOpen: _, toggle } = useMobileNavContext();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <nav className={`full-bleed flex justify-between items-center py-4 px-4 h-fit z-50 bg-background/10 backdrop-blur-md ${isHome ? 'fixed top-0 w-full' : 'sticky top-0'}`}>
      {/* Logo */}
      <Link href="/" className="flex gap-6">
        <Image
          src="/images/srijan-thumbnail.svg"
          alt="A square shaped logo for Srijan'26"
          width={45}
          height={45}
        />
        <Image
          src="/images/srijan-wide-icon.svg"
          alt="A wide layout logo for Srijan'26"
          height={45}
          width={2.298 * 45}
        />
      </Link>

      {/* Desktop Links */}
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          isActive={activeTab === link.href}
          onClick={() => setActiveTab(link.href)}
          className="hidden lg:flex"
        />
      ))}
      <LoginButton
        className="hidden lg:flex"
        isActive={activeTab === '/login'}
        onClick={() => setActiveTab('/login')}
      />

      {/* Mobile/Tablet Menu */}
      <div className="flex gap-6 lg:hidden">
        {/* Tablet Login Button */}
        <LoginButton
          className="hidden md:flex"
          isActive={activeTab === '/login'}
          onClick={() => setActiveTab('/login')}
        />

        {/* Hamburger Button */}
        <HamburgerButton onClick={toggle} />
      </div>
    </nav>
  );
}
