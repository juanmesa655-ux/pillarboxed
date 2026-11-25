import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export default function AccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex flex-1 flex-col">
        <NavbarVisitante />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-full max-w-xl">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Inicia sesión para continuar
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Esta sección requiere una cuenta activa. Inicia sesión o crea una
              con tu correo institucional terminado en @pascualbravo.edu.co.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <AuthDialog
                loginButton
                registrationLabel="Crear cuenta"
                registrationButtonClassName="h-11 rounded-[3px] border border-border bg-transparent px-6 text-base font-semibold text-(--fg) hover:bg-(--surface)"
              />
            </div>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
