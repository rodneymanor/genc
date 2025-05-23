import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/common/ModeToggle";
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AiWriterProvider } from "@/contexts/AiWriterContext";
import { AppProvider } from "@/contexts/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import MainContent from "@/components/layout/MainContent";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = constructMetadata({});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background antialiased w-full mx-auto scroll-smooth font-poppins"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <AiWriterProvider>
              <div className="flex flex-row min-h-screen bg-background">
                <Sidebar />
                <MobileNav />
                <div id="main-content-wrapper" className="flex-1 flex flex-col overflow-y-auto md:pl-64">
                  <MainContent>
                    {children}
                  </MainContent>
                  <Footer />
                </div>
              </div>
              <Toaster />
              <ModeToggle />
              <TailwindIndicator />
            </AiWriterProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
