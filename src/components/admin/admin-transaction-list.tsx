"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  transactionRepository,
  type AdminPaymentTransaction,
  type PaymentMethod,
  type TransactionStatus,
} from "@/lib/data/transactions";

type TransactionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; transactions: AdminPaymentTransaction[] };

function getErrorMessage(reason: string) {
  switch (reason) {
    case "forbidden":
      return "No tienes permisos para consultar todas las transacciones.";
    case "unauthenticated":
      return "Inicia sesión con una cuenta administradora.";
    case "invalid-data":
      return "Hay datos de transacciones locales que no se pueden leer.";
    default:
      return "No pudimos consultar las transacciones locales. Intenta de nuevo.";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function getLocalDate(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Bogota",
  }).formatToParts(new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

function formatAmount(amount: number) {
  return `COP ${new Intl.NumberFormat("es-CO").format(amount)}`;
}

const methodLabels: Record<PaymentMethod, string> = {
  tarjeta: "Tarjeta simulada",
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

export function AdminTransactionList() {
  const [state, setState] = useState<TransactionState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | "todas"
  >("todas");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "todos">(
    "todos",
  );
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const result = transactionRepository.listAllTransactions();
      setState(
        result.ok
          ? { status: "ready", transactions: result.transactions }
          : { status: "error", message: getErrorMessage(result.reason) },
      );
    });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const visibleTransactions = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.transactions.filter(
      (transaction) =>
        (statusFilter === "todas" || transaction.status === statusFilter) &&
        (methodFilter === "todos" || transaction.method === methodFilter) &&
        (!dateFilter || getLocalDate(transaction.createdAt) === dateFilter),
    );
  }, [dateFilter, methodFilter, state, statusFilter]);

  if (state.status === "loading") {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando transacciones...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--error)" role="alert">
          {state.message}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            setState({ status: "loading" });
            setRetryCount((count) => count + 1);
          }}
        >
          Intentar de nuevo
        </Button>
      </section>
    );
  }

  return (
    <div>
      <aside className="mb-6 border-l-2 border-(--info) bg-(--info)/10 px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
        Este listado reúne registros de prueba guardados en este navegador.
        Ninguno representa un cobro real y no se almacenan datos de tarjetas.
      </aside>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="admin-transaction-status" className="text-sm font-medium">
            Estado
          </label>
          <select
            id="admin-transaction-status"
            value={statusFilter}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (
                value === "todas" ||
                value === "pendiente" ||
                value === "aprobada" ||
                value === "rechazada"
              ) {
                setStatusFilter(value);
              }
            }}
            className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="todas">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-transaction-method" className="text-sm font-medium">
            Método
          </label>
          <select
            id="admin-transaction-method"
            value={methodFilter}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (
                value === "todos" ||
                value === "tarjeta" ||
                value === "pse" ||
                value === "nequi"
              ) {
                setMethodFilter(value);
              }
            }}
            className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="todos">Todos</option>
            <option value="pse">PSE</option>
            <option value="nequi">Nequi</option>
            <option value="tarjeta">Tarjeta simulada</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-transaction-date" className="text-sm font-medium">
            Fecha
          </label>
          <input
            id="admin-transaction-date"
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.currentTarget.value)}
            className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </div>

      {visibleTransactions.length === 0 ? (
        <p className="border-y border-border py-8 text-sm text-(--fg-secondary)" role="status">
          {state.transactions.length === 0
            ? "Todavía no hay transacciones de demostración."
            : "No hay transacciones que coincidan con estos filtros."}
        </p>
      ) : (
        <div className="overflow-x-auto border-y border-border">
          <table className="w-full min-w-240 border-collapse text-left text-sm">
            <caption className="sr-only">
              Transacciones de demostración de todas las cuentas
            </caption>
            <thead>
              <tr className="border-b border-border text-sm text-(--fg-muted)">
                <th scope="col" className="px-3 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-3 py-3 font-medium">Cuenta</th>
                <th scope="col" className="px-3 py-3 font-medium">Tipo</th>
                <th scope="col" className="px-3 py-3 font-medium">Monto</th>
                <th scope="col" className="px-3 py-3 font-medium">Método</th>
                <th scope="col" className="px-3 py-3 font-medium">Estado</th>
                <th scope="col" className="px-3 py-3 font-medium">Vigencia</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.map((transaction) => (
                <tr
                  key={`${transaction.userId}-${transaction.id}`}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="whitespace-nowrap px-3 py-4 text-(--fg-secondary)">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-3 py-4">
                    <span className="block font-medium text-(--fg)">
                      {transaction.userName}
                    </span>
                    <span className="block text-xs text-(--fg-secondary)">
                      {transaction.userEmail}
                    </span>
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
                  <td className={`whitespace-nowrap px-3 py-4 font-medium ${statusColors[transaction.status]}`}>
                    {statusLabels[transaction.status]}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-(--fg-secondary)">
                    {transaction.periodEndsAt
                      ? `Hasta ${formatDate(transaction.periodEndsAt)}`
                      : "Sin cambios"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-(--fg-muted)">
        Las transacciones conservan el monto y la vigencia registrados al
        momento de la simulación, aunque luego cambie el plan.
      </p>
    </div>
  );
}
