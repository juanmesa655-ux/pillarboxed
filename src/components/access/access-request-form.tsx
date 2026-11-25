"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { accessRequestRepository } from "@/lib/data/access-request-repository";

export function AccessRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const relationship = formData.get("relationship");
    const reason = formData.get("reason");

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof relationship !== "string" ||
      typeof reason !== "string" ||
      (relationship !== "egresado" && relationship !== "trabajador")
    ) {
      setError("Revisa los datos del formulario e inténtalo de nuevo.");
      return;
    }

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();
    const normalizedReason = reason.trim();

    if (!normalizedFullName || !normalizedEmail || !normalizedReason) {
      setError("Completa todos los campos antes de enviar la solicitud.");
      return;
    }

    const request = accessRequestRepository.submit({
      fullName: normalizedFullName,
      email: normalizedEmail,
      relationship,
      reason: normalizedReason,
    });

    if (!request.ok) {
      setError(
        request.reason === "unavailable"
          ? "No pudimos guardar la solicitud en este navegador. Inténtalo de nuevo."
          : "No pudimos leer las solicitudes guardadas. Contacta a soporte.",
      );
      return;
    }

    event.currentTarget.reset();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="border border-border bg-(--surface) p-6 sm:p-8"
      >
        <h2 className="font-(family-name:--font-title) text-2xl font-semibold">
          Solicitud registrada
        </h2>
        <p className="mt-4 leading-7 text-(--fg-secondary)">
          Tu solicitud quedó guardada en este navegador como pendiente de
          revisión. Esta es una simulación: todavía no se envía a un
          administrador ni se manda un correo.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-accent underline underline-offset-4 hover:text-(--accent-hover)"
        >
          Volver al inicio
        </Link>
      </section>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <p className="border-l-2 border-(--info) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
        El acceso sin correo institucional requiere aprobación de un
        administrador. En esta versión de prueba, la solicitud solo se guarda
        en este navegador.
      </p>

      <div className="space-y-2">
        <label htmlFor="access-full-name" className="block text-sm font-medium">
          Nombre y apellidos
        </label>
        <input
          id="access-full-name"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="access-email" className="block text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="access-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="access-relationship"
          className="block text-sm font-medium"
        >
          Relación con la institución
        </label>
        <select
          id="access-relationship"
          name="relationship"
          required
          defaultValue=""
          className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="egresado">Egresado/a</option>
          <option value="trabajador">Docente o trabajador/a</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="access-reason" className="block text-sm font-medium">
          ¿Por qué quieres unirte al cineclub?
        </label>
        <textarea
          id="access-reason"
          name="reason"
          required
          maxLength={1000}
          rows={4}
          className="w-full resize-none overflow-y-auto rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 py-2 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-(--error)">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="h-11 rounded-[3px] bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-(--accent-hover)"
      >
        Enviar solicitud
      </Button>
    </form>
  );
}
