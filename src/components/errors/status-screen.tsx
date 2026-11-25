import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";

type StatusScreenProps = {
  code: "403" | "404";
  title: string;
  description: string;
  header?: ReactNode;
};

export function StatusScreen({
  code,
  title,
  description,
  header,
}: StatusScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header ?? (
        <header className="border-b border-border bg-(--bg-pillar) px-6 py-4">
          <div className="mx-auto max-w-300">
            <PillarboxedLogo />
          </div>
        </header>
      )}
      <main className="site-frame flex flex-1 items-center justify-center px-6 py-16">
        <section className="max-w-xl text-center" aria-labelledby="status-title">
          <p
            className="text-sm text-accent"
            aria-label={`Código ${code}`}
          >
            {code}
          </p>
          <h1
            id="status-title"
            className="mt-4 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl"
          >
            {title}
          </h1>
          <p className="mt-4 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
            {description}
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-11 items-center justify-center border border-accent px-5 text-sm font-medium text-(--fg) transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Ir al inicio
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
