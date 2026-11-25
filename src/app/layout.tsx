import type { Metadata } from "next";
import { SessionGate } from "@/components/auth/session-gate";
import { SessionProvider } from "@/components/auth/session-provider";
import { appFontVariables } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pillarboxed - Cineclub IU Pascual Bravo",
  description:
    "Descubre películas, participa en votaciones y encuentra tu próxima función en la comunidad cinéfila de la IU Pascual Bravo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${appFontVariables} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>
          <SessionGate>{children}</SessionGate>
        </SessionProvider>
      </body>
    </html>
  );
}
