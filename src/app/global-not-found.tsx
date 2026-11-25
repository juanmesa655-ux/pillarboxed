import type { Metadata } from "next";
import "./globals.css";
import { FullPageNavigationLink } from "@/components/errors/full-page-navigation-link";
import { SessionProvider } from "@/components/auth/session-provider";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { appFontVariables } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Página no encontrada | Pillarboxed",
  description: "No encontramos la página que buscas.",
};

export default function GlobalNotFound() {
  return (
    <html lang="es" className={`${appFontVariables} h-full antialiased`}>
      <body className="min-h-full">
        <SessionProvider>
          <div className="flex min-h-screen flex-col">
            <NavbarVisitante fullPageNavigation />

            <main className="site-frame flex flex-1 items-center justify-center px-6 py-16">
              <section
                className="max-w-xl text-center"
                aria-labelledby="global-not-found-title"
              >
                <p
                  className="text-sm text-accent"
                  aria-label="Código 404"
                >
                  404
                </p>
                <h1
                  id="global-not-found-title"
                  className="mt-4 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl"
                >
                  No encontramos esta página
                </h1>
                <p className="mt-4 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
                  La dirección puede haber cambiado o la página ya no está
                  disponible.
                </p>
                <FullPageNavigationLink
                  href="/"
                  className="mt-7 inline-flex min-h-11 items-center justify-center border border-accent px-5 text-sm font-medium text-(--fg) transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ir al inicio
                </FullPageNavigationLink>
              </section>
            </main>

            <Footer fullPageNavigation />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
