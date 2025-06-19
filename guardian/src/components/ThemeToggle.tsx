"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { Button } from '@/components/ui/Button';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On mount, check local storage or system preference
    const dark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.theme = newDark ? "dark" : "light";
  };

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="p-2 rounded-full"
      aria-label="Toggle dark mode"
    >
      {isDark ? <SunIcon className="w-5 h-5 text-warning" /> : <MoonIcon className="w-5 h-5 text-muted" />}
    </Button>
  );
} 