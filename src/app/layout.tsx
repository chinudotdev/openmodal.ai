import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenModal - AI Model Directory & Discovery Platform",
    template: "%s | OpenModal",
  },
  description:
    "Discover and explore AI models from top providers. Find the perfect model for your project with our comprehensive directory of text, image, audio, and video AI models.",
  keywords: [
    "AI models",
    "artificial intelligence",
    "machine learning",
    "model directory",
    "AI discovery",
    "text models",
    "image models",
    "audio models",
    "video models",
    "open source AI",
  ],
  authors: [{ name: "OpenModal Team" }],
  creator: "OpenModal",
  publisher: "OpenModal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://openmodal.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openmodal.ai",
    siteName: "OpenModal",
    title: "OpenModal - AI Model Directory & Discovery Platform",
    description:
      "Discover and explore AI models from top providers. Find the perfect model for your project with our comprehensive directory of text, image, audio, and video AI models.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenModal - AI Model Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenModal - AI Model Directory & Discovery Platform",
    description:
      "Discover and explore AI models from top providers. Find the perfect model for your project.",
    images: ["/og-image.png"],
    creator: "@chinudotdev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
