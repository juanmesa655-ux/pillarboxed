import { CuratorEventManager } from "@/components/curation/curator-event-manager";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";

export default function CuratorEventsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold text-(--fg) sm:text-5xl">
              Gestionar eventos
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base">
              Crea y edita funciones del cineclub, y decide cuáles aparecen en
              la cartelera pública.
            </p>
          </header>
          <div className="py-6 sm:py-8">
            <CuratorEventManager />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
