"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  authRepository,
  type AssignableUserRole,
  type RoleManagementUser,
} from "@/lib/data/auth-repository";

type ManagedRole = Exclude<AssignableUserRole, "administrador">;

function readErrorMessage(reason: string) {
  switch (reason) {
    case "forbidden":
      return "No tienes permisos para administrar roles.";
    case "unauthenticated":
      return "Inicia sesión con una cuenta administradora.";
    case "not-found":
      return "No encontramos esa cuenta activa. Actualiza la lista.";
    case "invalid-data":
      return "Los datos de las cuentas no son válidos.";
    default:
      return "No pudimos acceder a las cuentas. Intenta de nuevo.";
  }
}

export function UserRoleManager() {
  const [users, setUsers] = useState<RoleManagementUser[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, ManagedRole>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const result = authRepository.listUsersForRoleManagement();
      if (!result.ok) {
        setError(readErrorMessage(result.reason));
        setLoading(false);
        return;
      }

      setUsers(result.users);
      setSelectedRoles(
        Object.fromEntries(
          result.users
            .filter(
              (user): user is RoleManagementUser & { role: ManagedRole } =>
                user.role !== "administrador",
            )
            .map((user) => [user.id, user.role]),
        ),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleRoleChange(userId: string, role: ManagedRole) {
    setSelectedRoles((current) => ({ ...current, [userId]: role }));
    setMessage("");
  }

  function handleSave(user: RoleManagementUser) {
    const role = selectedRoles[user.id];
    if (!role) return;

    setSavingUserId(user.id);
    setError("");
    setMessage("");

    const result = authRepository.updateUserRole(user.id, role);
    setSavingUserId(null);
    if (!result.ok) {
      setError(readErrorMessage(result.reason));
      return;
    }

    setUsers((current) =>
      current.map((item) => (item.id === user.id ? result.user : item)),
    );
    setMessage(`Se actualizó el rol de ${result.user.firstName}.`);
  }

  return (
    <section aria-labelledby="accounts-heading">
      <div className="mb-5">
        <h2
          id="accounts-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Cuentas activas
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
          Solo una persona administradora puede asignar o retirar el rol de
          curador. Las cuentas administradoras no se pueden modificar desde esta
          pantalla.
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-sm text-(--fg-secondary)" role="status">
          Cargando cuentas...
        </p>
      ) : error && users.length === 0 ? (
        <p className="border-y border-border py-8 text-sm text-(--error)" role="alert">
          {error}
        </p>
      ) : users.length === 0 ? (
        <p className="border-y border-border py-8 text-sm text-(--fg-secondary)">
          Todavía no hay cuentas activas para administrar.
        </p>
      ) : (
        <>
          {error && (
            <p className="mb-4 text-sm text-(--error)" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-4 text-sm text-(--success)" role="status">
              {message}
            </p>
          )}
          <ul className="divide-y divide-border border-y border-border">
            {users.map((user) => (
              <li
                key={user.id}
                className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div>
                  <h3 className="font-medium text-(--fg)">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="mt-1 text-sm text-(--fg-secondary)">
                    {user.email}
                  </p>
                </div>
                {user.role === "administrador" ? (
                  <p className="text-sm text-(--fg-secondary)">
                    Administrador · protegido
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Rol de {user.firstName} {user.lastName}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      value={selectedRoles[user.id] ?? user.role}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        if (value === "usuario" || value === "curador") {
                          handleRoleChange(user.id, value);
                        }
                      }}
                      className="h-10 rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="curador">Curador</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        savingUserId === user.id ||
                        selectedRoles[user.id] === user.role
                      }
                      onClick={() => handleSave(user)}
                    >
                      {savingUserId === user.id
                        ? "Guardando..."
                        : "Guardar rol"}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-4 text-xs leading-5 text-(--fg-muted)">
        Prototipo local: los roles se guardan en este navegador y no reemplazan
        la autorización que deberá implementarse en el servidor.
      </p>
    </section>
  );
}
