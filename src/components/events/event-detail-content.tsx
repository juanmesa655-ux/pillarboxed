"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SharedSeatCreation } from "@/components/events/shared-seat-creation";
import { curationRepository } from "@/lib/data/curation-repository";
import type { CineFunction } from "@/lib/data/events";

export function EventDetailContent({
  id,
  initialFunction,
}: {
  id: string;
  initialFunction: CineFunction | undefined;
}) {
  const [cineFunction, setCineFunction] = useState(initialFunction ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const result = curationRepository.getPublicEvents();
      if (!result.ok) {
        setError(
          result.reason === "invalid-data"
            ? "No pudimos leer las funciones guardadas."
            : "No pudimos cargar las funciones. Habilita el almacenamiento local e inténtalo de nuevo.",
        );
        setLoading(false);
        return;
      }

      setCineFunction(result.events.find((event) => event.id === id) ?? null);
      setError("");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading && !cineFunction) {
    return (
      <p className="py-12 text-center text-sm text-(--fg-secondary)" role="status">
        Cargando la función...
      </p>
    );
  }

  if (error || !cineFunction) {
    return (
      <section className="border-y border-border py-10 text-center">
        <p className="text-sm text-(--error)" role={error ? "alert" : "status"}>
          {error || "No encontramos esta función publicada."}
        </p>
        <Link
          href="/eventos"
          className="mt-4 inline-flex text-sm text-accent underline underline-offset-4 hover:text-(--accent-hover)"
        >
          Volver a funciones
        </Link>
      </section>
    );
  }

  return <SharedSeatCreation cineFunction={cineFunction} />;
}
