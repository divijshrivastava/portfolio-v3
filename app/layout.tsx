import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://divij.tech";

export const metadata: Metadata = {
  title: {
    default: "Divij Shrivastava — Senior Backend Engineer",
    template: "%s | Divij Shrivastava",
  },
  description:
    "Senior Backend Engineer specializing in distributed systems, system design, and scalable architecture. Built real-time trading platforms, event-driven systems on Kafka, and complex integrations at Morgan Stanley, TIAA, and TCS.",
  keywords: [
    "Backend Engineer",
    "Distributed Systems",
    "System Design",
    "Kafka",
    "Java",
    "Spring Boot",
    "Fintech",
    "Trading Systems",
  ],
  authors: [{ name: "Divij Shrivastava" }],
  creator: "Divij Shrivastava",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Divij Shrivastava — Senior Backend Engineer",
    description:
      "Senior Backend Engineer specializing in distributed systems, system design, and scalable architecture. Built real-time trading platforms and event-driven systems at Morgan Stanley, TIAA, and TCS.",
    siteName: "Divij Shrivastava",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Divij Shrivastava — Senior Backend Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Divij Shrivastava — Senior Backend Engineer",
    description:
      "Senior Backend Engineer specializing in distributed systems, system design, and scalable architecture at Morgan Stanley, TIAA, and TCS.",
    images: [`${baseUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
