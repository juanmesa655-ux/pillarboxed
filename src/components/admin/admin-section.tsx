import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import {
  AdminTabs,
  type AdminSectionKey,
} from "@/components/admin/admin-tabs";

export function AdminSection({
  active,
  title,
  description,
  children,
}: {
  active: AdminSectionKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold text-(--fg) sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-180 text-sm leading-6 text-(--fg-secondary) sm:text-base">
              {description}
            </p>
          </header>
          <div className="mt-6">
            <AdminTabs active={active} />
          </div>
          <div className="py-8">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
