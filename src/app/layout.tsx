import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Bricolage_Grotesque } from "next/font/google";
import { AiWriterProvider } from "@/contexts/AiWriterContext";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ParticlesBackground } from "@/components/magicui/particles-background";
import SidebarLayoutClient from "@/components/layout/SidebarLayoutClient";

export const metadata: Metadata = constructMetadata({});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(bricolageGrotesque.variable, "h-full")} suppressHydrationWarning>
      <body
        className={cn(
          "h-full antialiased w-full scroll-smooth font-bricolage-grotesque flex flex-col overflow-hidden"
        )}
      >
        <div className="fixed inset-0 animated-background-gradient -z-20"></div>
        <ParticlesBackground className="fixed inset-0 -z-10" />

        <div className="relative z-0 flex flex-col flex-1 bg-[hsl(var(--sidebar-background))]">
          <ThemeProvider
            attribute="class"
            disableTransitionOnChange
          >
            <AppProvider>
              <AuthProvider>
                <AiWriterProvider>
                  <SidebarLayoutClient>
                    {children}
                  </SidebarLayoutClient>
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
