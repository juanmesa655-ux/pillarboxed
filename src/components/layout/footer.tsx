import Image from "next/image";
import Link from "next/link";
import packageInfo from "../../../package.json";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";

const footerItems: { label: string; href?: string }[] = [
  { label: "Acerca de Pillarboxed", href: "/acerca-de" },
  { label: "Ayuda", href: "/ayuda" },
  { label: "Política de Privacidad", href: "/politica-de-privacidad" },
  { label: "Condiciones de Uso", href: "/terminos-de-uso" },
  { label: "Membresía", href: "/membresia" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-(--bg-pillar)">
      <div className="mx-auto max-w-300 px-6 py-8">
        <nav aria-label="Información del sitio">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-(--fg-secondary)">
            {footerItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 grid grid-cols-1 items-center gap-8 border-t border-border pt-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-2 text-center md:flex-row md:text-left">
            <Image
              src="/tmdb-logo.svg"
              alt="TMDB"
              width={190}
              height={82}
              className="h-6 w-auto"
            />
            <p className="max-w-90 text-xs leading-5 text-(--fg-secondary)">
              Este producto utiliza la API de TMDB, pero no cuenta con el
              respaldo ni la certificación de TMDB.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <PillarboxedLogo />
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
