import Link from "next/link";

export function PillarboxedLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 text-(--fg)"
      aria-label="Ir al inicio de Pillarboxed"
    >
      <span className="h-9 w-16 shrink-0" aria-hidden="true" />
      <span className="font-(family-name:--font-title) text-[22px] font-semibold leading-none">
        Pillarboxed
      </span>
    </Link>
  );
}
