"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  authRepository,
  careerOptions,
  getMaxSemestersForCareer,
  type AuthUser,
} from "@/lib/data/auth-repository";

type ProfileValues = {
  career: string;
  semester: string;
};

function getProfileValues(user: AuthUser): ProfileValues {
  return {
    career: user.career,
    semester: String(user.semester),
  };
}

function ProfileEditorForUser({ user }: { user: AuthUser }) {
  const { setAuthenticatedUser } = useSession();
  const [values, setValues] = useState(() => getProfileValues(user));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const semesterLimit = getMaxSemestersForCareer(values.career) ?? 0;

  function handleCareerChange(career: string) {
    const maxSemester = getMaxSemestersForCareer(career);
    setValues((current) => ({
      ...current,
      career,
      semester: maxSemester
        ? String(Math.min(Number(current.semester) || 1, maxSemester))
        : "",
    }));
  }

  function handleCancel() {
    setValues(getProfileValues(user));
    setError("");
    setNotice("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const result = authRepository.updateProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      career: values.career,
      semester: Number(values.semester),
    });

    if (!result.ok) {
      setError(
        result.reason === "invalid-data"
          ? "Revisa la carrera y el semestre."
          : result.reason === "not-found"
            ? "No encontramos una sesión activa. Inicia sesión e inténtalo de nuevo."
            : "No pudimos guardar los cambios en este navegador. Inténtalo de nuevo.",
      );
      return;
    }

    setAuthenticatedUser(result.user);
    setValues(getProfileValues(result.user));
    setNotice("Tus datos se actualizaron correctamente.");
  }

  return (
    <section aria-labelledby="profile-details-title">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2
            id="profile-details-title"
            className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
          >
            Información personal
          </h2>
          <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
            Solo puedes editar tu carrera y semestre.
          </p>
        </div>
        <Link
          href={`/usuarios/${user.id}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a perfil
        </Link>
      </header>

      {notice && (
        <p className="mb-5 text-sm text-(--success)" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-5 text-sm text-(--error)" role="alert">
          {error}
        </p>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="profile-first-name" className="block text-sm font-medium">
              Nombre
            </label>
            <input
              id="profile-first-name"
              type="text"
              autoComplete="given-name"
              readOnly
              value={user.firstName}
              className="h-11 w-full border border-(--border-strong) bg-(--surface-elevated) px-3 text-base text-(--fg-secondary) outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-last-name" className="block text-sm font-medium">
              Apellido
            </label>
            <input
              id="profile-last-name"
              type="text"
              autoComplete="family-name"
              readOnly
              value={user.lastName}
              className="h-11 w-full border border-(--border-strong) bg-(--surface-elevated) px-3 text-base text-(--fg-secondary) outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-email" className="block text-sm font-medium">
              Correo institucional
            </label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              readOnly
              value={user.email}
              className="h-11 w-full border border-(--border-strong) bg-(--surface-elevated) px-3 text-base text-(--fg-secondary) outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-career" className="block text-sm font-medium">
              Carrera
            </label>
            <select
              id="profile-career"
              name="career"
              required
              value={values.career}
              onChange={(event) => handleCareerChange(event.target.value)}
              className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)"
            >
              <option value="">Selecciona tu carrera</option>
              {careerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-semester" className="block text-sm font-medium">
              Semestre
            </label>
            <select
              id="profile-semester"
              name="semester"
              required
              disabled={semesterLimit === 0}
              value={values.semester}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  semester: event.target.value,
                }))
              }
              className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {Array.from({ length: semesterLimit }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border pt-5">
          <Button type="submit">Guardar cambios</Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Descartar cambios
          </Button>
        </div>
      </form>
    </section>
  );
}

export function ProfileEditor() {
  const { state } = useSession();

  if (state.status === "loading") {
    return (
      <p className="text-sm text-(--fg-secondary)" role="status">
        Cargando tus ajustes...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="text-sm text-(--error)" role="alert">
        No pudimos comprobar tu sesión. Recarga la página e inténtalo de nuevo.
      </p>
    );
  }

  if (state.user === null) {
    return (
      <p className="text-sm text-(--error)" role="alert">
        Necesitas iniciar sesión para consultar tus ajustes.
      </p>
    );
  }

  return <ProfileEditorForUser user={state.user} />;
}
