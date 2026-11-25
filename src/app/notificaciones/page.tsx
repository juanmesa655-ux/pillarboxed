import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { NotificationInbox } from "@/components/notifications/notification-inbox";

export const metadata: Metadata = {
  title: "Notificaciones | Pillarboxed",
  description: "Consulta las notificaciones de tu cuenta de Pillarboxed.",
};

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-220 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Notificaciones
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Consulta los avisos relacionados con tus actividades en
              Pillarboxed.
            </p>
          </header>
          <div className="py-7 sm:py-9">
            <NotificationInbox />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
