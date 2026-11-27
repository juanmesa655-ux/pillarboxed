"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "cn";
import { useSession } from "@/components/auth/session-provider";
import {
  FullPageNavigationLink,
  navigateWithDocumentLoad,
} from "@/components/errors/full-page-navigation-link";
import { Button } from "@/components/ui/button";
import {
  authRepository,
  careerOptions,
  getMaxSemestersForCareer,
} from "@/lib/data/auth-repository";

type AuthMode = "login" | "recovery" | "registration" | "verification";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  onValueChange?: () => void;
  minLength?: number;
};

type AuthDialogProps = {
  registrationOnly?: boolean;
  loginOnly?: boolean;
  registrationLabel?: string;
  registrationButtonClassName?: string;
  registrationArrow?: boolean;
  loginLabel?: string;
  loginButton?: boolean;
  fullPageNavigation?: boolean;
};

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  onValueChange,
  minLength,
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
          minLength={minLength}
          onChange={onValueChange}
          required
          className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 pr-12 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated) sm:h-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="password-visibility-toggle absolute inset-y-0.5 right-0.5 flex w-10 items-center justify-center text-(--fg-secondary) hover:text-(--fg)"
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
  fullPageNavigation = false,
}: AuthDialogProps) {
  const router = useRouter();
  const { setAuthenticatedUser } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const semesterLimit = getMaxSemestersForCareer(selectedCareer);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setMode("login");
      setFormError("");
      setFormNotice("");
      setSelectedCareer("");
      setSelectedSemester("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFormNotice("");
    const formData = new FormData(event.currentTarget);

    if (mode === "recovery") {
      setFormNotice(
        "La recuperación no envía correos en esta simulación. Usa el registro de prueba para crear una cuenta.",
      );
      return;
    }

    if (mode === "registration") {
      const password = String(formData.get("password") ?? "");
      if (password !== String(formData.get("confirmPassword") ?? "")) {
        setFormError("Las contraseñas no coinciden.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await authRepository.register({
          firstName: String(formData.get("firstName") ?? ""),
          lastName: String(formData.get("lastName") ?? ""),
          email: String(formData.get("email") ?? ""),
          career: String(formData.get("career") ?? ""),
          semester: Number(formData.get("semester")),
          password,
        });

        if (!result.ok) {
          setFormError(
            result.reason === "already-registered"
              ? "Ya existe una cuenta de prueba con ese correo."
              : result.reason === "invalid-email"
                ? "Ingresa un correo válido."
                : result.reason === "institutional-email-required"
                  ? "Usa un correo que termine en @pascualbravo.edu.co."
                : result.reason === "weak-password"
                  ? "La contraseña debe tener al menos 8 caracteres."
                  : result.reason === "unavailable"
                    ? "El almacenamiento local no está disponible en este navegador."
                    : "Revisa los datos e intenta de nuevo.",
          );
          return;
        }

        setPendingEmail(result.user.email);
        setLoginEmail(result.user.email);
        setMode("verification");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setIsSubmitting(true);
    try {
      const result = await authRepository.signIn(email, password);
      if (!result.ok) {
        if (result.reason === "pending-verification") {
          setPendingEmail(email.trim());
        }
        setFormError(
          result.reason === "invalid-credentials" ||
            result.reason === "invalid-email" ||
            result.reason === "institutional-email-required"
            ? "Correo institucional o contraseña incorrectos."
            : result.reason === "pending-verification"
              ? "Esta cuenta de prueba está pendiente de verificación."
              : result.reason === "unavailable"
                ? "No pudimos guardar la sesión de prueba en este navegador."
                : "No pudimos leer las cuentas de prueba. Recarga e intenta de nuevo.",
        );
        return;
      }

      setAuthenticatedUser(result.user);
      setLoginEmail(result.user.email);
      handleOpenChange(false);
      if (fullPageNavigation) {
        navigateWithDocumentLoad("/");
      } else {
        router.push("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setFormError("");
    setFormNotice("");
    if (nextMode === "registration") {
      setSelectedCareer("");
      setSelectedSemester("");
    }
    setMode(nextMode);
  }

  function handleSimulatedVerification() {
    setFormError("");
    const result = authRepository.verifyEmail(pendingEmail);
    if (!result.ok) {
      setFormError(
        result.reason === "unavailable"
          ? "El almacenamiento local no está disponible en este navegador."
          : "No pudimos activar la cuenta de prueba. Vuelve a registrarte.",
      );
      return;
    }

    setLoginEmail(result.user.email);
    setPendingEmail("");
    setFormNotice(
      "Cuenta de prueba activada. Inicia sesión con el correo y la contraseña que registraste.",
    );
    setMode("login");
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
                  ? "h-11 w-full rounded-[3px] bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) hover:text-white"
                  : "text-sm text-(--fg-secondary) no-underline hover:no-underline"
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
                "h-10 rounded-[3px] bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-(--accent-hover) hover:text-white"
              }
            />
          }
        >
          {registrationLabel}
          {registrationArrow && <ArrowRight data-icon="inline-end" />}
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-(--surface-elevated) p-4 text-(--fg) sm:p-6",
            (mode === "registration" || mode === "verification") &&
              "auth-registration-scroll max-h-[calc(100dvh-2rem)] overflow-y-auto",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
            <Dialog.Title className="font-(family-name:--font-title) text-xl font-semibold sm:text-2xl">
              {mode === "login"
                ? "Ingresar a Pillarboxed"
                : mode === "recovery"
                  ? "Reiniciar Contraseña"
                  : mode === "verification"
                    ? "Verificar cuenta de prueba"
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

          {formError && (
            <p role="alert" className="mb-4 text-sm text-(--error)">
              {formError}
            </p>
          )}
          {formNotice && (
            <p
              role="status"
              className="mb-4 text-sm leading-5 text-(--fg-secondary)"
            >
              {formNotice}
            </p>
          )}

          {mode === "login" && (
            <>
              <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium"
                  >
                    Correo institucional
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => {
                      const nextEmail = event.target.value;
                      setLoginEmail(nextEmail);
                      if (
                        nextEmail.trim().toLowerCase() !==
                        pendingEmail.trim().toLowerCase()
                      ) {
                        setPendingEmail("");
                      }
                    }}
                    autoComplete="email"
                    placeholder="nombre@pascualbravo.edu.co"
                    required
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated) sm:h-11"
                  />
                </div>
                <p className="-mt-2 text-xs leading-5 text-(--fg-muted)">
                  Debe terminar en @pascualbravo.edu.co.
                </p>

                <PasswordField
                  id="login-password"
                  name="password"
                  label="Contraseña"
                  autoComplete="current-password"
                  onValueChange={() => setFormError("")}
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
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) sm:h-11"
                >
                  {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
                </Button>
              </form>

              {pendingEmail && (
                <Button
                  type="button"
                  variant="link"
                  className="mt-3 h-auto w-full whitespace-normal text-sm text-accent"
                  onClick={handleSimulatedVerification}
                >
                  Simular verificación de cuenta pendiente
                </Button>
              )}

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
                La recuperación de contraseña estará disponible cuando la
                aplicación tenga un servidor. En esta versión no se envían
                correos.
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
                Continuar
              </Button>
            </form>
          )}

          {mode === "registration" && (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <p className="text-xs leading-5 text-(--fg-muted)">
                Registro de demostración: no se envía un correo real. Usa datos
                ficticios.
              </p>
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
                  placeholder="nombre@pascualbravo.edu.co"
                  required
                  className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                />
                <p className="text-xs leading-5 text-(--fg-muted)">
                  Debe terminar en @pascualbravo.edu.co.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="registration-career"
                    className="block text-sm font-medium"
                  >
                    Carrera
                  </label>
                  <select
                    id="registration-career"
                    name="career"
                    required
                    value={selectedCareer}
                    onChange={(event) => {
                      setSelectedCareer(event.target.value);
                      setSelectedSemester("");
                    }}
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                  >
                    <option value="" disabled>
                      Selecciona una carrera
                    </option>
                    {careerOptions.map((career) => (
                      <option key={career.value} value={career.value}>
                        {career.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="registration-semester"
                    className="block text-sm font-medium"
                  >
                    Semestre
                  </label>
                  <select
                    id="registration-semester"
                    name="semester"
                    required
                    value={selectedSemester}
                    onChange={(event) =>
                      setSelectedSemester(event.target.value)
                    }
                    disabled={semesterLimit === null}
                    className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
                  >
                    <option value="" disabled>
                      {semesterLimit === null
                        ? "Selecciona primero una carrera"
                        : "Selecciona un semestre"}
                    </option>
                    {semesterLimit !== null &&
                      Array.from(
                        { length: semesterLimit },
                        (_, index) => index + 1,
                      ).map((semester) => (
                        <option key={semester} value={semester}>
                          {semester}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <PasswordField
                id="registration-password"
                name="password"
                label="Contraseña"
                autoComplete="new-password"
                onValueChange={() => setFormError("")}
                minLength={8}
              />
              <PasswordField
                id="registration-confirm-password"
                name="confirmPassword"
                label="Confirmar contraseña"
                autoComplete="new-password"
                onValueChange={() => setFormError("")}
                minLength={8}
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
                  {fullPageNavigation ? (
                    <FullPageNavigationLink
                      href="/terminos-de-uso"
                      className="text-(--fg) underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      términos de uso
                    </FullPageNavigationLink>
                  ) : (
                    <Link
                      href="/terminos-de-uso"
                      className="text-(--fg) underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      términos de uso
                    </Link>
                  )}{" "}
                  y la{" "}
                  {fullPageNavigation ? (
                    <FullPageNavigationLink
                      href="/politica-de-privacidad"
                      className="text-(--fg) underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      política de privacidad
                    </FullPageNavigationLink>
                  ) : (
                    <Link
                      href="/politica-de-privacidad"
                      className="text-(--fg) underline underline-offset-2 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      política de privacidad
                    </Link>
                  )}
                  .
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover)"
              >
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          )}

          {mode === "verification" && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-(--fg-secondary)">
                En un sistema real te enviaríamos un correo. Para probar el
                acceso, activa esta cuenta ficticia aquí; no se enviará ningún
                mensaje.
              </p>
              <Button
                type="button"
                onClick={handleSimulatedVerification}
                className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover)"
              >
                Simular verificación y continuar
              </Button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
