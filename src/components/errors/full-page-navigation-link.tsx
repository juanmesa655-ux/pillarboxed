"use client";

import Link from "next/link";
import type { MouseEvent, MouseEventHandler, ReactNode } from "react";

export function navigateWithDocumentLoad(href: string) {
  window.location.assign(href);
}

export function FullPageNavigationLink({
  href,
  className,
  "aria-current": ariaCurrent,
  "aria-label": ariaLabel,
  children,
  title,
  onClick,
}: {
  href: string;
  className?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  children: ReactNode;
  title?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateWithDocumentLoad(href);
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      title={title}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
