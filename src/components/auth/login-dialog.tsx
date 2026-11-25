"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "recovery">("login");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setShowPassword(false);
      setMode("login");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        className="text-sm text-(--fg-secondary)"
      >
        Iniciar sesión
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-(--surface-elevated) p-4 text-(--fg) sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
            <Dialog.Title className="font-(family-name:--font-title) text-xl font-semibold sm:text-2xl">
              {mode === "login"
                ? "Ingresar a Pillarboxed"
                : "Reiniciar Contraseña"}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex size-10 items-center justify-center rounded-[3px] text-(--fg-secondary) hover:bg-(--bg-center) hover:text-(--fg)"
              aria-label="Cerrar formulario de inicio de sesión"
            >
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>

          {mode === "login" ? (
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

                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 pr-12 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated) sm:h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={showPassword}
                      className="password-visibility-toggle absolute inset-y-0.5 right-0.5 flex w-10 items-center justify-center text-(--fg-secondary) hover:text-(--fg)"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" size={18} />
                      ) : (
                        <Eye aria-hidden="true" size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("recovery")}
                  className="text-sm text-(--fg-secondary) underline underline-offset-4 hover:text-(--fg)"
                >
                  ¿Olvidó su contraseña?
                </button>

                <button
                  type="submit"
                  className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) sm:h-11"
                >
                  Iniciar Sesión
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-(--fg-secondary) sm:mt-6">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/registro"
                  className="font-medium text-accent underline underline-offset-4 hover:text-(--accent-hover)"
                >
                  Crear una
                </Link>
              </p>
            </>
          ) : (
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
              <button
                type="submit"
                className="h-10 w-full rounded-[3px] bg-accent text-base font-semibold text-accent-foreground hover:bg-(--accent-hover) sm:h-11"
              >
                Enviar
              </button>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
