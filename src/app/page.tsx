"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PreferencesPanel from "@/components/settings/PreferencesPanel";
import FeedSection from "@/components/content/FeedSection";
import TrendingSection from "@/components/content/TrendingSection";
import FavoritesSection from "@/components/content/FavoritesSection";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeSection = useAppSelector((s) => s.ui.activeSection);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeSection === "feed" && <FeedSection />}
          {activeSection === "trending" && <TrendingSection />}
          {activeSection === "favorites" && <FavoritesSection />}
        </main>
      </div>

      <PreferencesPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
