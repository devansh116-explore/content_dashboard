import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import ThemeSync from "@/components/providers/ThemeSync";

export const metadata: Metadata = {
  title: "Content Dashboard",
  description: "Personalized content dashboard — news, recommendations, and social posts in one feed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ReduxProvider>
          <ThemeSync />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
