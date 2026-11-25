import { AuthDialog } from "@/components/auth/auth-dialog";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";

export function NavbarVisitante() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border/70 bg-[linear-gradient(180deg,rgba(5,5,6,0.98),rgba(5,5,6,0.82))]">
      <nav
        className="mx-auto flex h-full max-w-300 items-center justify-between px-6"
        aria-label="Navegación principal"
      >
        <PillarboxedLogo />
        <div className="flex items-center gap-5">
          <AuthDialog />
        </div>
      </nav>
    </header>
  );
}
