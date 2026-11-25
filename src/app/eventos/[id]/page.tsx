import type { Metadata } from "next";
import Link from "next/link";
import { EventDetailContent } from "@/components/events/event-detail-content";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { getCineFunctions } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Detalle de función | Pillarboxed",
  description:
    "Consulta los detalles de una función y crea una butaca compartida.",
};

export default async function EventDetailPage({
  params,
}: PageProps<"/eventos/[id]">) {
  const { id } = await params;
  const cineFunction = getCineFunctions().find((item) => item.id === id);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <Link
            href="/eventos"
            className="inline-flex text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Volver a funciones
          </Link>
          <EventDetailContent id={id} initialFunction={cineFunction} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
