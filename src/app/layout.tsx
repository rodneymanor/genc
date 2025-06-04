import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AiWriterProvider } from "@/contexts/AiWriterContext";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import ModernSidebar from "@/components/layout/ModernSidebar";
import TopBar from "@/components/layout/TopBar";
import { TopBarProvider } from "@/components/layout/TopBarProvider";
import SettingsOverlayWrapper from "@/components/settings/SettingsOverlayWrapper";

export const metadata: Metadata = constructMetadata({});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, "h-full")} suppressHydrationWarning>
      <body
        className={cn(
          "h-full antialiased w-full scroll-smooth font-inter flex flex-col"
        )}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <div className="fixed inset-0 animated-background-gradient -z-20"></div>

        <div className="relative z-0 flex flex-col flex-1 bg-[hsl(var(--sidebar-background))]">
          <ThemeProvider
            attribute="class"
            disableTransitionOnChange
          >
            <AppProvider>
              <AuthProvider>
                <AiWriterProvider>
                  <TopBarProvider>
                    <SettingsProvider>
                      <div className="flex h-screen overflow-hidden">
                        <ModernSidebar />
                        <main className="bg-[hsl(var(--background))] flex-1 w-0 flex flex-col">
                          <TopBar />
                          <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {children}
                          </div>
                        </main>
                      </div>
                      
                      {/* Settings Overlay */}
                      <SettingsOverlayWrapper />
                    </SettingsProvider>
                  </TopBarProvider>
                  <Toaster />
                  <TailwindIndicator />
                </AiWriterProvider>
              </AuthProvider>
            </AppProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
