"use client";

import type React from "react";
import { useTheme } from "./providers";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // For UI purposes, treat anything that's not explicit "dark" as light
  const current: "light" | "dark" = theme === "dark" ? "dark" : "light";

  const toggle = () => setTheme(current === "dark" ? "light" : "dark");

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "ArrowLeft") {
      setTheme("light");
    }
    if (e.key === "ArrowRight") {
      setTheme("dark");
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        type="button"
        role="switch"
        aria-checked={current === "dark"}
        onClick={toggle}
        onKeyDown={handleKey}
        className="relative inline-flex h-9 w-[112px] select-none items-center rounded-full border border-neutral-300 bg-white px-1 transition-colors duration-200 ease-out hover:bg-neutral-50 focus:outline-none focus:ring-0 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        {/* Sliding thumb */}
        <span
          className={[
            "absolute top-1 left-1 h-7 w-[52px] rounded-full bg-neutral-200 transition-transform duration-300 ease-out dark:bg-neutral-800",
            current === "dark" ? "translate-x-[56px]" : "translate-x-0",
          ].join(" ")}
          aria-hidden
        />

        {/* Labels with icons */}
        <span
          className={[
            "z-10 flex w-1/2 items-center justify-center gap-1 text-xs",
            current === "light" ? "text-black dark:text-white" : "text-neutral-500",
          ].join(" ")}
        >
          <span aria-hidden>☀️</span>
          <span>Light</span>
        </span>
        <span
          className={[
            "z-10 flex w-1/2 items-center justify-center gap-1 text-xs",
            current === "dark" ? "text-white" : "text-neutral-500",
          ].join(" ")}
        >
          <span aria-hidden>🌙</span>
          <span>Dark</span>
        </span>
      </button>
    </div>
  );
}
