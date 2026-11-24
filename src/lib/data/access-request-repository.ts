import { isInstitutionalEmail } from "@/lib/data/auth-repository";

export type AccessRequestRelationship = "egresado" | "trabajador";

export type AccessRequest = {
  id: string;
  fullName: string;
  email: string;
  relationship: AccessRequestRelationship;
  reason: string;
  status: "pendiente";
  createdAt: string;
};

export type NewAccessRequest = Pick<
  AccessRequest,
  "fullName" | "email" | "relationship" | "reason"
>;

export type SubmitAccessRequestResult =
  | { ok: true; request: AccessRequest }
  | {
      ok: false;
      reason: "institutional-email" | "unavailable" | "invalid-data";
    };

export interface AccessRequestRepository {
  submit(request: NewAccessRequest): SubmitAccessRequestResult;
}

const storageKey = "pillarboxed.access-requests";

function isAccessRequest(value: unknown): value is AccessRequest {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.fullName === "string" &&
    typeof record.email === "string" &&
    (record.relationship === "egresado" ||
      record.relationship === "trabajador") &&
    typeof record.reason === "string" &&
    record.status === "pendiente" &&
    typeof record.createdAt === "string"
  );
}

function readRequests():
  | { ok: true; requests: AccessRequest[] }
  | { ok: false; reason: "unavailable" | "invalid-data" } {
  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(storageKey);
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  if (serialized === null) return { ok: true, requests: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (!Array.isArray(parsed) || !parsed.every(isAccessRequest)) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, requests: parsed };
}

export const accessRequestRepository: AccessRequestRepository = {
  submit(input) {
    if (isInstitutionalEmail(input.email)) {
      return { ok: false, reason: "institutional-email" };
    }

    const stored = readRequests();
    if (!stored.ok) return stored;

    const request: AccessRequest = {
      ...input,
      email: input.email.trim(),
      id: crypto.randomUUID(),
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify([...stored.requests, request]),
      );
    } catch (error) {
      if (error instanceof DOMException) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    return { ok: true, request };
  },
};
