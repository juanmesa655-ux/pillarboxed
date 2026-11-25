import Link from "next/link";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { getLandingEvent } from "@/lib/data/landing";

export default function Home() {
  const event = getLandingEvent();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />

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
                    registrationButtonClassName="h-12 rounded-[3px] bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-(--accent-hover)"
                  />
                  <Link
                    href="/peliculas"
                    className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
                  >
                    Explorar películas
                  </Link>
                  <Link
                    href="/solicitar-acceso"
                    className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
                  >
                    ¿Sin correo institucional? Solicita acceso
                  </Link>
                </div>
                <p role="status" className="mt-4 text-sm text-(--fg-muted)">
                  Los formularios son una simulación; el acceso aún no se
                  gestiona en un servidor.
                </p>
              </div>

              <div className="film-frame hidden aspect-4/3 min-h-97.5 lg:block">
                <div className="absolute inset-3.25 overflow-hidden bg-(--surface)">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(201,161,91,0.28),transparent_24%),linear-gradient(145deg,transparent_0_55%,rgba(5,5,6,0.72)_55%)]" />
                  <div className="absolute bottom-0 left-0 w-[72%] border-t border-border bg-[linear-gradient(180deg,rgba(34,35,42,0.96),rgba(26,27,32,0.96))] p-7">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                      {event.simulated
                        ? ""
                        : "Próxima proyección"}
                    </p>
                    <p className="mt-3 font-(family-name:--font-title) text-[32px] leading-tight">
                      {event.title}
                    </p>
                    <p className="mt-3 font-mono text-xs text-(--fg-secondary)">
                      {event.startsAt ?? "Fecha por anunciar"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </div>
  );
}
