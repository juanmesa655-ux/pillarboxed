"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  transactionRepository,
  type PaymentMethod,
  type PaymentTransaction,
  type TransactionStatus,
} from "@/lib/data/transactions";

type TransactionListState =
  | { status: "loading" }
  | { status: "ready"; transactions: PaymentTransaction[] }
  | { status: "error"; message: string };

const methodLabels: Record<PaymentMethod, string> = {
  tarjeta: "Tarjeta (simulada)",
  pse: "PSE",
  nequi: "Nequi",
};

const statusLabels: Record<TransactionStatus, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const statusColors: Record<TransactionStatus, string> = {
  pendiente: "text-(--warning)",
  aprobada: "text-(--success)",
  rechazada: "text-(--error)",
};

function getErrorMessage(reason: "invalid-data" | "unauthenticated" | "unavailable") {
  switch (reason) {
    case "invalid-data":
      return "No pudimos leer las transacciones guardadas. Revisa los datos locales e inténtalo de nuevo.";
    case "unauthenticated":
      return "Inicia sesión con la cuenta que deseas consultar.";
    case "unavailable":
      return "El almacenamiento local no está disponible. Habilítalo e inténtalo de nuevo.";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function formatAmount(amount: number) {
  return `COP ${new Intl.NumberFormat("es-CO").format(amount)}`;
}

export function TransactionHistory() {
  const { state: session } = useSession();

  if (session.status === "loading") {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Comprobando tu sesión...
      </p>
    );
  }

  if (session.status === "error") {
    return (
      <p className="py-8 text-sm text-(--error)" role="alert">
        No pudimos comprobar tu sesión. Habilita el almacenamiento local y
        recarga la página.
      </p>
    );
  }

  if (session.user === null) {
    return (
      <p className="py-8 text-sm text-(--error)" role="alert">
        Inicia sesión para consultar tus transacciones.
      </p>
    );
  }

  return (
    <TransactionHistoryForUser
      key={session.user.id}
      userId={session.user.id}
    />
  );
}

function TransactionHistoryForUser({ userId }: { userId: string }) {
  const [state, setState] = useState<TransactionListState>({
    status: "loading",
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;

      const result = transactionRepository.getTransactions(userId);
      setState(
        result.ok
          ? { status: "ready", transactions: result.transactions }
          : { status: "error", message: getErrorMessage(result.reason) },
      );
    });

    return () => {
      active = false;
    };
  }, [retryCount, userId]);

  function retry() {
    setState({ status: "loading" });
    setRetryCount((count) => count + 1);
  }

  if (state.status === "loading") {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando tus transacciones...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--error)" role="alert">
          {state.message}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={retry}>
          Intentar de nuevo
        </Button>
      </section>
    );
  }

  if (state.transactions.length === 0) {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Todavía no tienes transacciones de demostración.
        </p>
        <Link
          href="/perfil?tab=suscripcion"
          className="mt-4 inline-flex text-sm text-(--fg) underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ir a Mi suscripción
        </Link>
      </section>
    );
  }

  return (
    <div>
      <aside className="mb-5 border-l-2 border-(--info) bg-(--info)/10 px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
        Este historial contiene únicamente transacciones simuladas en este
        navegador. Ninguna representa un cobro real.
      </aside>
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-180 border-collapse text-left text-sm">
          <caption className="sr-only">
            Historial de transacciones simuladas de esta cuenta
          </caption>
          <thead>
            <tr className="border-b border-border text-sm text-(--fg-muted)">
              <th scope="col" className="px-3 py-3 font-medium">
                Fecha
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Tipo
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Monto
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Método
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Estado
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {state.transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="whitespace-nowrap px-3 py-4 text-(--fg-secondary)">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-(--fg-secondary)">
                  {transaction.kind === "purchase" ? "Compra" : "Renovación"}
                </td>
                <td className="whitespace-nowrap px-3 py-4 font-mono tabular-nums text-(--fg)">
                  {formatAmount(transaction.amount)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-(--fg-secondary)">
                  {methodLabels[transaction.method]}
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-4 font-medium ${statusColors[transaction.status]}`}
                >
                  {statusLabels[transaction.status]}
                </td>
                <td className="px-3 py-4">
                  <details className="group">
                    <summary className="cursor-pointer text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      Ver detalle
                    </summary>
                    <dl className="mt-3 space-y-2 text-xs">
                      <div>
                        <dt className="text-(--fg-muted)">
                          Identificador de prueba
                        </dt>
                        <dd className="mt-1 break-all font-mono text-(--fg-secondary)">
                          {transaction.id}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-(--fg-muted)">
                          Vigencia registrada
                        </dt>
                        <dd className="mt-1 text-(--fg-secondary)">
                          {transaction.periodEndsAt
                            ? `Hasta ${formatDate(transaction.periodEndsAt)}`
                            : "No se modificó"}
                        </dd>
                      </div>
                    </dl>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href="/perfil?tab=suscripcion"
        className="mt-5 inline-flex text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Volver a Mi suscripción
      </Link>
    </div>
  );
}
