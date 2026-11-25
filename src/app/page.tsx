"use client";

import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { TrendingMovies } from "@/components/movies/trending-movies";

export default function Home() {
  const { state } = useSession();

  if (state.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Comprobando el acceso...
        </p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="max-w-lg text-center text-sm leading-6 text-(--error)" role="alert">
          No pudimos leer la sesión de prueba. Habilita el almacenamiento local
          de tu navegador y recarga la página.
        </p>
      </main>
    );
  }

  if (state.user) {
    return <HomeDashboard user={state.user} />;
  }

  return (
    <div className="landing-page flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante className="landing-navbar" />
        <main>
          <section className="mx-auto max-w-300 px-6 py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <h1 className="max-w-190 font-(family-name:--font-title) text-5xl font-semibold leading-[1.05] tracking-[-0.035em] text-(--fg) md:text-[64px]">
                  La comunidad para hablar de cine empieza aquí.
                </h1>
                <p className="mt-6 max-w-152.5 text-lg leading-8 text-(--fg-secondary)">
                  Descubre películas, vota qué proyectar y encuentra con quién
                  compartir la próxima función dentro de la Pascual Bravo.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <AuthDialog
                    registrationOnly
                    registrationLabel="Crear cuenta"
                    registrationArrow
                    registrationButtonClassName="h-12 rounded-[3px] bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) hover:text-white"
                  />
                  <Link
                    href="/solicitar-acceso"
                    className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
                  >
                    ¿Sin correo institucional? Solicita acceso
                  </Link>
                </div>
                <p role="status" className="mt-4 text-sm text-(--fg-muted)">
                  Regístrate con un correo terminado en @pascualbravo.edu.co.
                  Este prototipo no realiza cobros reales.
                </p>
              </div>

              <div className="w-full max-w-80 justify-self-center lg:justify-self-end">
                <TrendingMovies layout="featured-poster" limit={10} />
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
