import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import { ProfileTabs } from "@/components/profile/profile-tabs";

export const metadata: Metadata = {
  title: "Mi perfil | Pillarboxed",
  description: "Administra tu información personal y consulta tu suscripción.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "suscripcion" ? "subscription" : "general";

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-220 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Mi perfil
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Administra tus datos personales y consulta tu suscripción.
            </p>
          </header>

          <div className="py-7 sm:py-9">
            <ProfileTabs initialTab={initialTab} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
