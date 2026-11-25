import {
  authRepository,
  isInstitutionalEmail,
} from "@/lib/data/auth-repository";

export type AccessRequestRelationship = "egresado" | "trabajador";
export type AccessRequestStatus = "pendiente" | "aprobada" | "rechazada";

export type AccessRequest = {
  id: string;
  fullName: string;
  email: string;
  relationship: AccessRequestRelationship;
  reason: string;
  status: AccessRequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
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

export type AccessRequestListResult =
  | { ok: true; requests: AccessRequest[] }
  | {
      ok: false;
      reason:
        | "forbidden"
        | "invalid-data"
        | "unauthenticated"
        | "unavailable";
    };

export type AccessRequestDecisionResult =
  | { ok: true; request: AccessRequest }
  | {
      ok: false;
      reason:
        | "already-reviewed"
        | "forbidden"
        | "invalid-data"
        | "not-found"
        | "unauthenticated"
        | "unavailable";
    };

export interface AccessRequestRepository {
  submit(request: NewAccessRequest): SubmitAccessRequestResult;
  listForAdmin(): AccessRequestListResult;
  decide(
    requestId: string,
    status: Exclude<AccessRequestStatus, "pendiente">,
  ): AccessRequestDecisionResult;
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
    (record.status === "pendiente" ||
      record.status === "aprobada" ||
      record.status === "rechazada") &&
    typeof record.createdAt === "string" &&
    (record.reviewedAt === undefined ||
      record.reviewedAt === null ||
      typeof record.reviewedAt === "string") &&
    (record.reviewedBy === undefined ||
      record.reviewedBy === null ||
      typeof record.reviewedBy === "string")
  );
}

function readRequests():
  | { ok: true; requests: AccessRequest[] }
  | { ok: false; reason: "unavailable" | "invalid-data" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

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
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const reason = input.reason.trim();
    if (
      !fullName ||
      fullName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !reason ||
      reason.length > 1000 ||
      (input.relationship !== "egresado" &&
        input.relationship !== "trabajador")
    ) {
      return { ok: false, reason: "invalid-data" };
    }
    if (isInstitutionalEmail(email)) {
      return { ok: false, reason: "institutional-email" };
    }

    const stored = readRequests();
    if (!stored.ok) return stored;

    const request: AccessRequest = {
      ...input,
      fullName,
      email,
      reason,
      id: crypto.randomUUID(),
      status: "pendiente",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
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

  listForAdmin() {
    const session = authRepository.readSession();
    if (!session.ok) return session;
    if (!session.user) {
      return { ok: false, reason: "unauthenticated" };
    }
    if (session.user.role !== "administrador") {
      return { ok: false, reason: "forbidden" };
    }

    const stored = readRequests();
    if (!stored.ok) return stored;
    return { ok: true, requests: stored.requests };
  },

  decide(requestId, status) {
    if (status !== "aprobada" && status !== "rechazada") {
      return { ok: false, reason: "invalid-data" };
    }

    const session = authRepository.readSession();
    if (!session.ok) return session;
    if (!session.user) {
      return { ok: false, reason: "unauthenticated" };
    }
    if (session.user.role !== "administrador") {
      return { ok: false, reason: "forbidden" };
    }

    const stored = readRequests();
    if (!stored.ok) return stored;
    const requestIndex = stored.requests.findIndex(
      (request) => request.id === requestId,
    );
    if (requestIndex < 0) return { ok: false, reason: "not-found" };
    const current = stored.requests[requestIndex];
    if (current.status !== "pendiente") {
      return { ok: false, reason: "already-reviewed" };
    }

    const updatedRequest: AccessRequest = {
      ...current,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: session.user.id,
    };
    const requests = [...stored.requests];
    requests[requestIndex] = updatedRequest;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(requests));
    } catch (error) {
      if (error instanceof DOMException) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    return { ok: true, request: updatedRequest };
  },
};
