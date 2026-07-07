import type { Metadata } from "next";
import { Taviraj, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const taviraj = Taviraj({
  variable: "--font-taviraj",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Breathe Write | Wellness & Breathwork",
  description: "Take A Breath. Reconnect with your intuition, creativity and inner calm through breathwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${taviraj.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Taviraj:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Header />
        <main className="flex-1 mt-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
