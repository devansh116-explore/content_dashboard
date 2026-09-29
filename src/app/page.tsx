"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PreferencesPanel from "@/components/settings/PreferencesPanel";
import FeedSection from "@/components/content/FeedSection";
import TrendingSection from "@/components/content/TrendingSection";
import FavoritesSection from "@/components/content/FavoritesSection";
import ReadLaterSection from "@/components/content/ReadLaterSection";
import DashboardSummary from "@/components/content/DashboardSummary";
import TodayBriefing from "@/components/content/TodayBriefing";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeSection = useAppSelector((s) => s.ui.activeSection);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6">
          <DashboardSummary />
          {activeSection === "feed" && <TodayBriefing />}
          {activeSection === "feed" && <FeedSection />}
          {activeSection === "trending" && <TrendingSection />}
          {activeSection === "favorites" && <FavoritesSection />}
          {activeSection === "readLater" && <ReadLaterSection />}
        </main>
      </div>

      <PreferencesPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
