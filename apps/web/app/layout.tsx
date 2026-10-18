import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppState, DevBar } from "@/components/app-state";
import { IconSprite } from "@/components/icons";
import "./globals.css";

const display = localFont({
  src: [{ path: "./fonts/bricolage-latin.woff2", weight: "500 800", style: "normal" }],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [{ path: "./fonts/dm-sans-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-body",
  display: "swap",
});

const mono = localFont({
  src: [{ path: "./fonts/jetbrains-latin.woff2", weight: "500 700", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarbAdapt",
  description: "Endurance fueling and gut training.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="system"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <IconSprite />
        <AppState>
          <div className="stage">
            <DevBar />
            <div className="column">{children}</div>
          </div>
        </AppState>
      </body>
    </html>
  );
}
