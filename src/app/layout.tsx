import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelpProvider } from "@/components/help/HelpContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { InstallPrompt, ServiceWorkerCleanup } from "@/components/InstallPrompt";
import { Toaster } from "sonner";
import { DynamicBackground } from "@/components/ui/DynamicBackground";

export const metadata: Metadata = {
  title: "Suita de inginerie: Calcul hidraulic",
  description: "Instrument profesional pentru calcule hidraulice HVAC",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inginerie DC",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased bg-background text-foreground min-h-screen"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <PreferencesProvider>
            <ErrorBoundary>
              <HelpProvider>
                <DynamicBackground />
                <OnlineStatusIndicator />
                <InstallPrompt />
                <ServiceWorkerCleanup />
                {children}
              </HelpProvider>
            </ErrorBoundary>
          </PreferencesProvider>
          <Toaster position="bottom-right" richColors theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
