import type { Metadata } from "next";
import { Providers } from "../providers";
import { UnifiedNav } from "../../components/unified-nav";
import { RegistrationSummaryManager } from "../../components/registration-summary-manager";
import { locales, type Locale } from "@/lib/locale";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Panamerican Aerobic Gymnastics Championship",
  description: "Registration system for the Panamerican Aerobic Gymnastics Championship. Register choreographies and manage gymnast participation.",
  keywords: ["gymnastics", "aerobic", "panamerican", "championship", "registration", "choreography"],
  authors: [{ name: "Tournament Organization" }],
  robots: "noindex, nofollow", // Since this is a private tournament system
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#667eea",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <Providers locale={locale as Locale}>
      <div className="relative flex min-h-screen flex-col">
        <UnifiedNav />
        <div className="flex-1">
          {children}
        </div>
      
        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  © 2025 Panamerican Aerobic Gymnastics Championship
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Registration Summary Sidebar */}
        <RegistrationSummaryManager />
      </div>
    </Providers>
  );
} 