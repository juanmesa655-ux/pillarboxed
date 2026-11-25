"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  authRepository,
  careerOptions,
  getMaxSemestersForCareer,
  type AuthUser,
} from "@/lib/data/auth-repository";

type ProfileValues = {
  firstName: string;
  lastName: string;
  career: string;
  semester: string;
};

function getProfileValues(user: AuthUser): ProfileValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    career: user.career,
    semester: String(user.semester),
  };
}

function ProfileEditorForUser({ user }: { user: AuthUser }) {
  const { setAuthenticatedUser } = useSession();
  const [values, setValues] = useState(() => getProfileValues(user));
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const semesterLimit = getMaxSemestersForCareer(values.career) ?? 0;

  function updateValue(field: keyof ProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

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
    setIsEditing(false);
    setError("");
    setNotice("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const result = authRepository.updateProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      career: values.career,
      semester: Number(values.semester),
    });

    if (!result.ok) {
      setError(
        result.reason === "invalid-data"
          ? "Revisa tu nombre, apellido, carrera y semestre."
          : result.reason === "not-found"
            ? "No encontramos una sesión activa. Inicia sesión e inténtalo de nuevo."
            : "No pudimos guardar los cambios en este navegador. Inténtalo de nuevo.",
      );
      return;
    }

    setAuthenticatedUser(result.user);
    setValues(getProfileValues(result.user));
    setIsEditing(false);
    setNotice("Tu perfil se actualizó correctamente.");
  }

  return (
    <section
      className="border border-border bg-(--surface)/60 p-5 sm:p-7"
      aria-labelledby="profile-details-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2
            id="profile-details-title"
            className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
          >
            Información personal
          </h2>
          <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
            Estos datos pertenecen a tu cuenta y se usan en la comunidad.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/usuarios/${user.id}`}
            className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Volver a perfil
          </Link>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError("");
                setNotice("");
                setIsEditing(true);
              }}
            >
              Editar perfil
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <p className="mt-5 text-sm text-(--success)" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-5 text-sm text-(--error)" role="alert">
          {error}
        </p>
      )}

      {isEditing ? (
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="profile-first-name" className="block text-sm font-medium">
                Nombre
              </label>
              <input
                id="profile-first-name"
                name="firstName"
                autoComplete="given-name"
                required
                value={values.firstName}
                onChange={(event) => updateValue("firstName", event.target.value)}
                className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-last-name" className="block text-sm font-medium">
                Apellido
              </label>
              <input
                id="profile-last-name"
                name="lastName"
                autoComplete="family-name"
                required
                value={values.lastName}
                onChange={(event) => updateValue("lastName", event.target.value)}
                className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
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
                className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
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
                value={values.semester}
                onChange={(event) => updateValue("semester", event.target.value)}
                className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
              >
                {Array.from({ length: semesterLimit }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-sm font-medium text-(--fg)">Correo institucional</p>
            <p className="mt-1 text-sm text-(--fg-secondary)">{user.email}</p>
            <p className="mt-2 text-xs leading-5 text-(--fg-muted)">
              El correo identifica tu cuenta y no se puede cambiar desde esta pantalla.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Guardar cambios</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Nombre
            </dt>
            <dd className="mt-1 text-sm text-(--fg)">{user.firstName}</dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Apellido
            </dt>
            <dd className="mt-1 text-sm text-(--fg)">{user.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Correo institucional
            </dt>
            <dd className="mt-1 break-all text-sm text-(--fg)">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Carrera
            </dt>
            <dd className="mt-1 text-sm text-(--fg)">{user.career}</dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Semestre
            </dt>
            <dd className="mt-1 text-sm text-(--fg)">{user.semester}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

export function ProfileEditor() {
  const { state } = useSession();

  if (state.status !== "ready") {
    return (
      <p className="text-sm text-(--fg-secondary)" role="status">
        Cargando tu perfil...
      </p>
    );
  }

  if (state.user === null) {
    return (
      <p className="text-sm text-(--error)" role="alert">
        Necesitas iniciar sesión para consultar tu perfil.
      </p>
    );
  }

  return <ProfileEditorForUser user={state.user} />;
}
