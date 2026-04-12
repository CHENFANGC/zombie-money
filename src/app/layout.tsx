import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Zombie Money",
  description: "Wake up idle stablecoins with one beautifully simple LI.FI Earn flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plexMono.variable} h-full bg-[var(--app-bg)] text-[var(--text-primary)] antialiased`}
    >
      <body className="min-h-full">
        <div className="app-chrome">{children}</div>
      </body>
    </html>
  );
}
