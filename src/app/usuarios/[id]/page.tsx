import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { PublicProfilePage } from "@/components/profile/public-profile-page";

export const metadata: Metadata = {
  title: "Perfil público | Pillarboxed",
  description: "Consulta el perfil público de una persona de Pillarboxed.",
};

export default async function PublicUserProfilePage({
  params,
}: PageProps<"/usuarios/[id]">) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-220 px-4 py-9 sm:px-6 sm:py-12">
          <Link
            href="/"
            className="inline-flex text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Ir al inicio
          </Link>
          <PublicProfilePage userId={id} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
