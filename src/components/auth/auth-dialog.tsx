"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "recovery" | "registration";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  onValueChange?: () => void;
};

type AuthDialogProps = {
  registrationOnly?: boolean;
  loginOnly?: boolean;
  registrationLabel?: string;
  registrationButtonClassName?: string;
  registrationArrow?: boolean;
  loginLabel?: string;
  loginButton?: boolean;
};

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  onValueChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1 sm:space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          onChange={onValueChange}
          required
          className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 pr-12 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated) sm:h-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-(--fg-secondary) hover:text-(--fg)"
        >
          {visible ? (
            <EyeOff aria-hidden="true" size={18} />
          ) : (
            <Eye aria-hidden="true" size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

export function AuthDialog({
  registrationOnly = false,
  loginOnly = false,
  registrationLabel = "Registrarme",
  registrationButtonClassName,
  registrationArrow = false,
  loginLabel = "Iniciar sesión",
  loginButton = false,
}: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [formError, setFormError] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setMode("login");
      setFormError("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (mode === "registration") {
      const formData = new FormData(event.currentTarget);
      if (formData.get("password") !== formData.get("confirmPassword")) {
        setFormError("Las contraseñas no coinciden.");
      }
    }
  }

  function changeMode(nextMode: AuthMode) {
    setFormError("");
    setMode(nextMode);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {!registrationOnly && (
        <Dialog.Trigger
          onClick={() => changeMode("login")}
          render={
            <Button
              variant={loginButton ? "default" : "link"}
              className={
                loginButton
                  ? "h-11 w-full rounded-[3px] bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-(--accent-hover)"
                  : "text-sm text-(--fg-secondary)"
              }
            />
          }
        >
          {loginLabel}
        </Dialog.Trigger>
      )}
      {!loginOnly && (
        <Dialog.Trigger
          onClick={() => changeMode("registration")}
          render={
            <Button
              className={
                registrationButtonClassName ??
                "h-10 rounded-[3px] bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-(--accent-hover)"
              }
            />
          }
        >
          {registrationLabel}
          {registrationArrow && <ArrowRight data-icon="inline-end" />}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-(--surface-elevated) p-4 text-(--fg) sm:p-6",
            mode === "registration" &&
              "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
            <Dialog.Title className="font-(family-name:--font-title) text-xl font-semibold sm:text-2xl">
              {mode === "login"
                ? "Ingresar a Pillarboxed"
                : mode === "recovery"
                  ? "Reiniciar Contraseña"
                  : "Unirse a Pillarboxed"}
            </Dialog.Title>
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar formulario"
                />
              }
            >
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>

          {mode === "login" && (
            <>
              <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium"
                  >
                    Correo
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated) sm:h-11"
                  />
                </div>

                <PasswordField
                  id="login-password"
                  name="password"
                  label="Contraseña"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => changeMode("recovery")}
                  className="text-sm text-(--fg-secondary) underline underline-offset-4 hover:text-(--fg)"
                >
                  ¿Olvidó su contraseña?
                </button>

                <Button
                  type="submit"
                  className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) sm:h-11"
                >
                  Iniciar Sesión
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-(--fg-secondary) sm:mt-6">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("registration")}
                  className="font-medium text-accent underline underline-offset-4 hover:text-(--accent-hover)"
                >
                  Crear una
                </button>
              </p>
            </>
          )}

          {mode === "recovery" && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <p className="text-center text-sm leading-6 text-(--fg-secondary)">
                Ingresa tu correo institucional y un link de recuperación será
                enviado para reiniciar tu contraseña.
              </p>
              <div>
                <label htmlFor="recovery-email" className="sr-only">
                  Correo institucional
                </label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  placeholder="Correo institucional"
                  autoComplete="email"
                  autoFocus
                  required
                  className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none placeholder:text-(--fg-muted) focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated) sm:h-11"
                />
              </div>
              <Button
                type="submit"
                className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) sm:h-11"
              >
                Enviar
              </Button>
            </form>
          )}

          {mode === "registration" && (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="registration-first-name"
                    className="block text-sm font-medium"
                  >
                    Nombre
                  </label>
                  <input
                    id="registration-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="registration-last-name"
                    className="block text-sm font-medium"
                  >
                    Apellidos
                  </label>
                  <input
                    id="registration-last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="registration-email"
                  className="block text-sm font-medium"
                >
                  Correo Institucional
                </label>
                <input
                  id="registration-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="registration-career"
                    className="block text-sm font-medium"
                  >
                    Carrera
                  </label>
                  <input
                    id="registration-career"
                    name="career"
                    type="text"
                    maxLength={120}
                    required
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="registration-semester"
                    className="block text-sm font-medium"
                  >
                    Semestre
                  </label>
                  <input
                    id="registration-semester"
                    name="semester"
                    type="number"
                    min={1}
                    step={1}
                    required
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                  />
                </div>
              </div>

              <PasswordField
                id="registration-password"
                name="password"
                label="Contraseña"
                autoComplete="new-password"
                onValueChange={() => setFormError("")}
              />
              <PasswordField
                id="registration-confirm-password"
                name="confirmPassword"
                label="Confirmar contraseña"
                autoComplete="new-password"
                onValueChange={() => setFormError("")}
              />

              <label className="flex items-start gap-2 text-sm leading-5 text-(--fg-secondary)">
                <input
                  type="checkbox"
                  name="adultDeclaration"
                  required
                  className="mt-1 accent-accent"
                />
                <span>Declaro que soy mayor de edad.</span>
              </label>

              <div className="flex items-start gap-2 text-sm leading-5 text-(--fg-secondary)">
                <input
                  id="registration-terms"
                  type="checkbox"
                  name="termsAccepted"
                  required
                  className="mt-1 accent-accent"
                />
                <label htmlFor="registration-terms">
                  Acepto los{" "}
                  <Link
                    href="/terminos-de-uso"
                    className="text-(--fg) underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    términos de uso
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/politica-de-privacidad"
                    className="text-(--fg) underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    política de privacidad
                  </Link>
                  .
                </label>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-(--error)">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover)"
              >
                Crear cuenta
              </Button>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
