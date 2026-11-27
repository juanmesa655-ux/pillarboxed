"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-provider";
import { authRepository } from "@/lib/data/auth-repository";

type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPasswordValues: PasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function PasswordEditor() {
  const { state } = useSession();
  const [values, setValues] = useState(emptyPasswordValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateValue(field: keyof PasswordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (values.newPassword !== values.confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await authRepository.updatePassword(
        values.currentPassword,
        values.newPassword,
      );

      if (!result.ok) {
        setError(
          result.reason === "invalid-credentials"
            ? "La contraseña actual no es correcta."
            : result.reason === "weak-password"
              ? "La nueva contraseña debe tener al menos 8 caracteres."
              : result.reason === "not-found"
                ? "No encontramos una cuenta activa. Inicia sesión e inténtalo de nuevo."
                : result.reason === "invalid-data"
                  ? "No pudimos validar los datos de tu cuenta."
                  : "No pudimos guardar el cambio en este navegador. Inténtalo de nuevo.",
        );
        return;
      }

      setValues(emptyPasswordValues);
      setNotice("Tu contraseña se actualizó correctamente.");
    } finally {
      setIsSaving(false);
    }
  }

  if (state.status === "loading") {
    return (
      <p className="text-sm text-(--fg-secondary)" role="status">
        Cargando los ajustes de contraseña...
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
        Necesitas iniciar sesión para cambiar tu contraseña.
      </p>
    );
  }

  return (
    <section aria-labelledby="password-title">
      <header className="mb-6 border-b border-border pb-5">
        <h2
          id="password-title"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Cambiar contraseña
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
          Para cambiarla, confirma tu contraseña actual y escribe una nueva.
        </p>
      </header>

      <p className="mb-5 text-sm leading-6 text-(--fg-muted)">
        Esta versión de demostración guarda los datos en este navegador. No uses
        una contraseña que utilices en otros servicios.
      </p>

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

      <form className="max-w-120 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="current-password" className="block text-sm font-medium">
            Contraseña actual
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={values.currentPassword}
            onChange={(event) =>
              updateValue("currentPassword", event.target.value)
            }
            className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password" className="block text-sm font-medium">
            Nueva contraseña
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={values.newPassword}
            onChange={(event) =>
              updateValue("newPassword", event.target.value)
            }
            className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium"
          >
            Confirmar nueva contraseña
          </label>
          <input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={values.confirmPassword}
            onChange={(event) =>
              updateValue("confirmPassword", event.target.value)
            }
            className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)"
          />
        </div>
        <div className="border-t border-border pt-5">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Actualizar contraseña"}
          </Button>
        </div>
      </form>
    </section>
  );
}
