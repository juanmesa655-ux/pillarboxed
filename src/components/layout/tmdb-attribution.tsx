import Image from "next/image";

export function TmdbAttribution({
  className,
  logoClassName,
}: {
  className: string;
  logoClassName: string;
}) {
  return (
    <div className={className}>
      <a
        href="https://www.themoviedb.org/"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Visitar The Movie Database en una pestaña nueva"
      >
        <Image
          src="/tmdb-logo.svg"
          alt="TMDB"
          width={190}
          height={82}
          className={logoClassName}
        />
      </a>
      <div>
        <p className="text-xs leading-5 text-(--fg-secondary)">
          Este producto utiliza la API de TMDB, pero no cuenta con el respaldo
          ni la certificación de TMDB.
        </p>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 inline-block text-xs text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Sitio de TMDB
        </a>
      </div>
    </div>
  );
}
