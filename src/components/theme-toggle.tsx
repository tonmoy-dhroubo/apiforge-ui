"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "light" : "dark");
      }}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 hidden dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </Button>
  );
}
