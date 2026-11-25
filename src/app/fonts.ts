import { Hanken_Grotesk, IBM_Plex_Mono, Newsreader } from "next/font/google";

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

export const appFontVariables = [
  hankenGrotesk.variable,
  newsreader.variable,
  ibmPlexMono.variable,
].join(" ");
