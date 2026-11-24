import type { Metadata } from "next";
import {
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Newsreader,
} from "next/font/google";
import { SessionGate } from "@/components/auth/session-gate";
import { SessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-title",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Pillarboxed - Cineclub IU Pascual Bravo",
  description:
    "Descubre películas, participa en votaciones y encuentra tu próxima función en la comunidad cinéfila de la IU Pascual Bravo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${hankenGrotesk.variable} ${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>
          <SessionGate>{children}</SessionGate>
        </SessionProvider>
      </body>
    </html>
  );
}
