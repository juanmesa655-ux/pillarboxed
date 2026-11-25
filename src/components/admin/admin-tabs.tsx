import Link from "next/link";

export type AdminSectionKey =
  | "plans"
  | "transactions"
  | "users"
  | "requests";

const sections: { key: AdminSectionKey; label: string; href: string }[] = [
  { key: "plans", label: "Planes", href: "/admin/planes" },
  {
    key: "transactions",
    label: "Transacciones",
    href: "/admin/transacciones",
  },
  { key: "users", label: "Usuarios y roles", href: "/admin/usuarios" },
  {
    key: "requests",
    label: "Solicitudes",
    href: "/admin/solicitudes",
  },
];

export function AdminTabs({ active }: { active: AdminSectionKey }) {
  return (
    <nav aria-label="Secciones de administración" className="overflow-x-auto">
      <ul className="flex min-w-max border-b border-border">
        {sections.map((section) => (
          <li key={section.key}>
            <Link
              href={section.href}
              aria-current={active === section.key ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border-b-2 px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                active === section.key
                  ? "border-accent text-(--fg)"
                  : "border-transparent text-(--fg-secondary) hover:text-(--fg)"
              }`}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
