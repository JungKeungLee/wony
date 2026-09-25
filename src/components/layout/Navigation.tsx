"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";
import { useSiteMode } from "@/context/SiteModeContext";
import MusicToggle from "./MusicToggle";

interface NavigationProps {
  /** 초 단위. 0보다 크면 해당 시간만큼 대기했다가 부드럽게 페이드인한다. */
  revealDelay?: number;
}

/** contribute 모드에서 Navigation에 남겨둘 메뉴 라벨만 - 나머지(HOME/TIMELINE/
 * ARCHIVE/STATISTICS)는 완전히 숨긴다. CONCERT는 페이지 자체가 임시
 * 비활성화(주석 처리)돼 있어 여기서도 뺐다 - 다시 열 때 함께 되돌리면 된다. */
const CONTRIBUTE_VISIBLE_LABELS = new Set(["LETTER", "FAN ART", "VIDEO" /* , "CONCERT" */]);

export default function Navigation({ revealDelay = 0 }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isContributeMode } = useSiteMode();

  const navItems = isContributeMode
    ? NAV_ITEMS.filter((item) => CONTRIBUTE_VISIBLE_LABELS.has(item.label))
    : NAV_ITEMS;

  return (
    <motion.header
      initial={revealDelay > 0 ? { opacity: 0, y: -10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: revealDelay, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-40 bg-bg/70 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.15em] text-text"
          onClick={() => setIsOpen(false)}
        >
          WONY
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs tracking-[0.2em] transition-colors hover:text-pink ${
                  active ? "text-pink" : "text-text-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {!isContributeMode && <MusicToggle className="ml-4" />}
        </nav>

        <button
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-5 bg-text transition-transform ${
              isOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-text transition-transform ${
              isOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden bg-bg-soft/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm tracking-[0.15em] ${
                    pathname === item.href ? "text-pink" : "text-text-soft"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!isContributeMode && <MusicToggle className="pt-2" />}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
