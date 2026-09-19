"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

export default function ThemeSync() {
  const darkMode = useAppSelector((s) => s.preferences.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return null;
}
