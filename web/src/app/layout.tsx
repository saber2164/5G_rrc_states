import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "5G NR RRC State Machine Simulator | Interactive Learning",
  description: "Learn 5G New Radio Radio Resource Control (RRC) state machine through interactive simulation. Visualize IDLE, CONNECTED, and INACTIVE states with 3GPP TS 38.331 compliance.",
  keywords: ["5G", "NR", "RRC", "State Machine", "3GPP", "TS 38.331", "Simulation", "Education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
