import Link from "next/link";
import packageInfo from "../../../package.json";
import { FullPageNavigationLink } from "@/components/errors/full-page-navigation-link";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";
import { TmdbAttribution } from "@/components/layout/tmdb-attribution";

const footerItems: { label: string; href?: string }[] = [
  { label: "Acerca de Pillarboxed", href: "/acerca-de" },
  { label: "Ayuda", href: "/ayuda" },
  { label: "Política de Privacidad", href: "/politica-de-privacidad" },
  { label: "Condiciones de Uso", href: "/terminos-de-uso" },
  { label: "Membresía", href: "/membresia" },
  { label: "Créditos", href: "/creditos" },
];

export function Footer({
  fullPageNavigation = false,
  className,
  contentClassName,
}: {
  fullPageNavigation?: boolean;
  className?: string;
  contentClassName?: string;
} = {}) {
  return (
    <footer
      className={`site-footer w-full border-t border-border bg-(--bg-pillar) ${className ?? ""}`}
    >
      <div
        className={`mx-auto max-w-300 px-6 py-8 ${contentClassName ?? ""}`}
      >
        <nav aria-label="Información del sitio">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-(--fg-secondary)">
            {footerItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  fullPageNavigation ? (
                    <FullPageNavigationLink
                      href={item.href}
                      className="hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {item.label}
                    </FullPageNavigationLink>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {item.label}
                    </Link>
                  )
                ) : (
                  item.label
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 grid grid-cols-1 items-center gap-8 border-t border-border pt-8 md:grid-cols-3">
          <TmdbAttribution
            className="flex flex-col items-center gap-2 text-center md:flex-row md:text-left"
            logoClassName="h-6 w-auto"
          />

          <div className="flex flex-col items-center gap-2">
            <PillarboxedLogo fullPageNavigation={fullPageNavigation} />
            <p className="text-xs text-(--fg-muted)">
              Versión {packageInfo.version}
            </p>
          </div>

          <div className="text-center text-sm md:text-right">
            <p className="text-(--fg)">Contacto</p>
            <a
              href="mailto:soporte@pillarboxed"
              className="text-(--fg-secondary) hover:text-(--fg)"
            >
              soporte@pillarboxed
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
