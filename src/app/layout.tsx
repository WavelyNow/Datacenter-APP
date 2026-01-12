import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Engineering Suite: Hydraulic Calc",
  description: "Professional Tool for HVAC Hydraulic Calculations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EngSuite",
  },
};

export const viewport: Viewport = {
  themeColor: "#44403c",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
