import Link from "next/link";
import { FullPageNavigationLink } from "@/components/errors/full-page-navigation-link";

export function PillarboxedLogo({
  fullPageNavigation = false,
}: {
  fullPageNavigation?: boolean;
}) {
  const content = (
    <span className="font-(family-name:--font-title) text-[22px] font-semibold leading-none">
      Pillarboxed
    </span>
  );
  const className = "flex items-center text-(--fg)";

  if (fullPageNavigation) {
    return (
      <FullPageNavigationLink
        href="/"
        className={className}
        aria-label="Ir al inicio de Pillarboxed"
      >
        {content}
      </FullPageNavigationLink>
    );
  }

  return (
    <Link
      href="/"
      className={className}
      aria-label="Ir al inicio de Pillarboxed"
    >
      {content}
    </Link>
  );
}
