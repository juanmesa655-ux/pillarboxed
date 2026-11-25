import type { CurationFailureReason } from "@/lib/data/curation-repository";

export function getCurationErrorMessage(reason: CurationFailureReason) {
  switch (reason) {
    case "forbidden":
      return "No tienes permisos para gestionar la curaduría.";
    case "unauthenticated":
      return "Inicia sesión con una cuenta autorizada.";
    case "not-found":
      return "No encontramos ese elemento. Actualiza la lista.";
    case "cycle-closed":
      return "No puedes editar un ciclo cerrado.";
    case "invalid-state":
      return "La acción no está disponible en el estado actual del ciclo.";
    case "invalid-data":
      return "Revisa los campos: deben estar completos y tener valores válidos.";
    default:
      return "No pudimos guardar los cambios. Habilita el almacenamiento local e inténtalo de nuevo.";
  }
}

export function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}
