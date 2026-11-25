"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-provider";
import {
  FullPageNavigationLink,
  navigateWithDocumentLoad,
} from "@/components/errors/full-page-navigation-link";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";
import { MovieSearchBar } from "@/components/movies/movie-search-bar";
import { NotificationBell } from "@/components/notifications/notification-bell";

const navigationItems = [
  { label: "Inicio", href: "/" },
  { label: "Películas", href: "/peliculas" },
  { label: "Eventos", href: "/eventos" },
];

function NavbarLink({
  href,
  fullPageNavigation,
  children,
  className,
  "aria-current": ariaCurrent,
  "aria-label": ariaLabel,
  title,
}: {
  href: string;
  fullPageNavigation: boolean;
  children: ReactNode;
  className?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  title?: string;
}) {
  if (fullPageNavigation) {
    return (
      <FullPageNavigationLink
        href={href}
        className={className}
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        title={title}
      >
        {children}
      </FullPageNavigationLink>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </Link>
  );
}

export function NavbarSesion({
  fullPageNavigation = false,
}: {
  fullPageNavigation?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, signOut } = useSession();
  const [error, setError] = useState("");

  if (state.status !== "ready" || state.user === null) return null;
  const profileHref = `/usuarios/${state.user.id}`;
  const isProfileRoute = pathname === profileHref || pathname === "/perfil";
  const isCurator =
    state.user.role === "curador" || state.user.role === "administrador";

  function handleSignOut() {
    const result = signOut();
    if (!result.ok) {
      setError("No pudimos cerrar la sesión de prueba. Intenta de nuevo.");
      return;
    }
    if (fullPageNavigation) {
      navigateWithDocumentLoad("/");
    } else {
      router.replace("/");
    }
  }

  return (
    <header className="site-navbar sticky top-0 z-40 border-b border-border/70 bg-[linear-gradient(180deg,rgba(5,5,6,0.98),rgba(5,5,6,0.82))]">
      <nav
        className="mx-auto flex min-h-16 max-w-300 items-center justify-between gap-3 px-4 sm:px-6"
        aria-label="Navegación principal"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-8">
          <PillarboxedLogo fullPageNavigation={fullPageNavigation} />
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:gap-x-3 sm:text-xs lg:gap-x-5 lg:text-sm">
            {navigationItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <NavbarLink
                    href={item.href}
                    fullPageNavigation={fullPageNavigation}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "border-b border-accent pb-1 text-(--fg)"
                        : "text-(--fg-secondary) hover:text-(--fg)"
                    }
                  >
                    {item.label}
                  </NavbarLink>
                </li>
              );
            })}
            {isCurator && (
              <li>
                <NavbarLink
                  href="/curaduria/eventos"
                  fullPageNavigation={fullPageNavigation}
                  aria-current={
                    pathname?.startsWith("/curaduria/") ? "page" : undefined
                  }
                  className={
                    pathname?.startsWith("/curaduria/")
                      ? "border-b border-accent pb-1 text-(--fg)"
                      : "text-(--fg-secondary) hover:text-(--fg)"
                  }
                >
                  Curaduría
                </NavbarLink>
              </li>
            )}
            {state.user.role === "administrador" && (
              <li>
                <NavbarLink
                  href="/admin/usuarios"
                  fullPageNavigation={fullPageNavigation}
                  aria-current={
                    pathname?.startsWith("/admin/") ? "page" : undefined
                  }
                  className={
                    pathname?.startsWith("/admin/")
                      ? "border-b border-accent pb-1 text-(--fg)"
                      : "text-(--fg-secondary) hover:text-(--fg)"
                  }
                >
                  Administración
                </NavbarLink>
              </li>
            )}
          </ul>
        </div>
        <MovieSearchBar fullPageNavigation={fullPageNavigation} />
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell fullPageNavigation={fullPageNavigation} />
          <NavbarLink
            href={profileHref}
            fullPageNavigation={fullPageNavigation}
            aria-label="Mi perfil"
            aria-current={isProfileRoute ? "page" : undefined}
            title="Mi perfil"
            className={`flex size-9 items-center justify-center text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isProfileRoute
                ? "border-b border-accent text-(--fg)"
                : "border-b border-transparent"
            }`}
          >
            <UserRound aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </NavbarLink>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="text-(--fg-secondary) hover:text-(--fg)"
            onClick={handleSignOut}
          >
            <LogOut aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </Button>
        </div>
      </nav>
      {error && (
        <p className="mx-auto max-w-300 px-4 pb-2 text-sm text-(--error) sm:px-6" role="alert">
          {error}
        </p>
      )}
    </header>
  );
}
