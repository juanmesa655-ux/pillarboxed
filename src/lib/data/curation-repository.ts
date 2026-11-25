import { authRepository } from "@/lib/data/auth-repository";
import { getCineFunctions, type CineFunction } from "@/lib/data/events";
import {
  getVotingCycles,
  type VotingCycle,
  type VotingCycleStatus,
} from "@/lib/data/voting-cycles";

export type PublicationStatus = "draft" | "published";

export type CuratedEvent = CineFunction & {
  publicationStatus: PublicationStatus;
};

export type CuratedVotingCycle = VotingCycle & {
  publicationStatus: PublicationStatus;
  closedAt: string | null;
  closureReason: string | null;
};

export type CurationData = {
  events: CuratedEvent[];
  cycles: CuratedVotingCycle[];
};

export type EventInput = {
  id?: string;
  title: string;
  description: string;
  startsAt: string;
  venue: string;
  publicationStatus: PublicationStatus;
};

export type VotingCycleInput = {
  id?: string;
  title: string;
  description: string;
  opensAt: string;
  closesAt: string;
  candidates: string[];
  publicationStatus: PublicationStatus;
};

export type CurationFailureReason =
  | "cycle-closed"
  | "forbidden"
  | "invalid-data"
  | "invalid-state"
  | "not-found"
  | "unauthenticated"
  | "unavailable";

export type CurationReadResult =
  | { ok: true; data: CurationData }
  | { ok: false; reason: CurationFailureReason };

export type EventReadResult =
  | { ok: true; events: CineFunction[] }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export type CycleReadResult =
  | { ok: true; cycles: VotingCycle[] }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export type CurationWriteResult =
  | { ok: true; data: CurationData }
  | { ok: false; reason: CurationFailureReason };

export interface CurationRepository {
  getPublicEvents(): EventReadResult;
  getPublicCycles(): CycleReadResult;
  getManagementData(): CurationReadResult;
  saveEvent(input: EventInput): CurationWriteResult;
  setEventPublication(
    eventId: string,
    publicationStatus: PublicationStatus,
  ): CurationWriteResult;
  saveCycle(input: VotingCycleInput): CurationWriteResult;
  closeCycle(cycleId: string, reason: string): CurationWriteResult;
  publishCycleResults(cycleId: string): CurationWriteResult;
}

const storageKey = "pillarboxed.demo-curation";
const minimumCandidates = 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPublicationStatus(value: unknown): value is PublicationStatus {
  return value === "draft" || value === "published";
}

function isVotingCycleStatus(value: unknown): value is VotingCycleStatus {
  return value === "open" || value === "upcoming" || value === "closed";
}

function isCuratedEvent(value: unknown): value is CuratedEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.startsAt === "string" &&
    !Number.isNaN(Date.parse(value.startsAt)) &&
    typeof value.venue === "string" &&
    (value.period === "upcoming" || value.period === "past") &&
    isPublicationStatus(value.publicationStatus)
  );
}

function isCuratedCycle(value: unknown): value is CuratedVotingCycle {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.opensAt === "string" &&
    !Number.isNaN(Date.parse(value.opensAt)) &&
    typeof value.closesAt === "string" &&
    !Number.isNaN(Date.parse(value.closesAt)) &&
    Array.isArray(value.candidates) &&
    value.candidates.every(
      (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
    ) &&
    isVotingCycleStatus(value.status) &&
    typeof value.resultsPublished === "boolean" &&
    isPublicationStatus(value.publicationStatus) &&
    (value.closedAt === null ||
      (typeof value.closedAt === "string" &&
        !Number.isNaN(Date.parse(value.closedAt)))) &&
    (value.closureReason === null || typeof value.closureReason === "string")
  );
}

function defaultData(): CurationData {
  return {
    events: getCineFunctions().map((event) => ({
      ...event,
      publicationStatus: "published",
    })),
    cycles: getVotingCycles().map((cycle) => ({
      ...cycle,
      publicationStatus: "published",
      closedAt: cycle.status === "closed" ? cycle.closesAt : null,
      closureReason: cycle.status === "closed" ? "Ciclo de ejemplo cerrado." : null,
    })),
  };
}

function readData():
  | { ok: true; data: CurationData }
  | { ok: false; reason: "invalid-data" | "unavailable" } {
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

  if (serialized === null) return { ok: true, data: defaultData() };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.events) ||
    !parsed.events.every(isCuratedEvent) ||
    !Array.isArray(parsed.cycles) ||
    !parsed.cycles.every(isCuratedCycle)
  ) {
    return { ok: false, reason: "invalid-data" };
  }

  return {
    ok: true,
    data: { events: parsed.events, cycles: parsed.cycles },
  };
}

function saveData(data: CurationData):
  | { ok: true }
  | { ok: false; reason: "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

function hasCurationPermission():
  | { ok: true }
  | { ok: false; reason: "forbidden" | "invalid-data" | "unauthenticated" | "unavailable" } {
  const session = authRepository.readSession();
  if (!session.ok) return session;
  if (!session.user) return { ok: false, reason: "unauthenticated" };
  if (session.user.role !== "curador" && session.user.role !== "administrador") {
    return { ok: false, reason: "forbidden" };
  }
  return { ok: true };
}

function deriveCycleStatus(
  cycle: CuratedVotingCycle,
  now: number,
): VotingCycleStatus {
  if (cycle.closedAt || Date.parse(cycle.closesAt) < now) return "closed";
  if (Date.parse(cycle.opensAt) > now) return "upcoming";
  return "open";
}

function deriveEventPeriod(event: CuratedEvent, now: number): CuratedEvent {
  return {
    ...event,
    period: Date.parse(event.startsAt) > now ? "upcoming" : "past",
  };
}

function deriveCycle(cycle: CuratedVotingCycle, now: number): CuratedVotingCycle {
  return { ...cycle, status: deriveCycleStatus(cycle, now) };
}

function normalizeDateTime(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}:00-05:00`);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function createId(title: string): string | null {
  try {
    const suffix = globalThis.crypto.randomUUID().slice(0, 8);
    const slug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `${slug || "evento"}-${suffix}`;
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) {
      return null;
    }
    throw error;
  }
}

function validateText(value: string, maxLength: number): string | null {
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength
    ? normalized
    : null;
}

function readManagementData(): CurationReadResult {
  const permission = hasCurationPermission();
  if (!permission.ok) return permission;
  return readData();
}

export const curationRepository: CurationRepository = {
  getPublicEvents() {
    const stored = readData();
    if (!stored.ok) return stored;

    const now = Date.now();
    return {
      ok: true,
      events: stored.data.events
        .filter((event) => event.publicationStatus === "published")
        .map((event) => deriveEventPeriod(event, now)),
    };
  },

  getPublicCycles() {
    const stored = readData();
    if (!stored.ok) return stored;

    const now = Date.now();
    return {
      ok: true,
      cycles: stored.data.cycles
        .filter((cycle) => cycle.publicationStatus === "published")
        .map((cycle) => deriveCycle(cycle, now)),
    };
  },

  getManagementData() {
    const stored = readManagementData();
    if (!stored.ok) return stored;
    const now = Date.now();
    return {
      ok: true,
      data: {
        events: stored.data.events.map((event) =>
          deriveEventPeriod(event, now),
        ),
        cycles: stored.data.cycles.map((cycle) => deriveCycle(cycle, now)),
      },
    };
  },

  saveEvent(input) {
    const stored = readManagementData();
    if (!stored.ok) return stored;

    const title = validateText(input.title, 120);
    const description = validateText(input.description, 1000);
    const venue = validateText(input.venue, 120);
    const startsAt = normalizeDateTime(input.startsAt);
    if (
      !title ||
      !description ||
      !venue ||
      !startsAt ||
      !isPublicationStatus(input.publicationStatus)
    ) {
      return { ok: false, reason: "invalid-data" };
    }

    const existing = input.id
      ? stored.data.events.find((event) => event.id === input.id)
      : undefined;
    if (input.id && !existing) return { ok: false, reason: "not-found" };

    let id = existing?.id;
    if (!id) {
      id = createId(title) ?? undefined;
      if (!id) return { ok: false, reason: "unavailable" };
    }

    const now = Date.now();
    const event: CuratedEvent = {
      id,
      title,
      description,
      startsAt,
      venue,
      period: Date.parse(startsAt) > now ? "upcoming" : "past",
      publicationStatus: input.publicationStatus,
    };
    const events = existing
      ? stored.data.events.map((item) => (item.id === id ? event : item))
      : [...stored.data.events, event];
    const data = { ...stored.data, events };
    const saved = saveData(data);
    if (!saved.ok) return saved;
    return { ok: true, data };
  },

  setEventPublication(eventId, publicationStatus) {
    if (!isPublicationStatus(publicationStatus)) {
      return { ok: false, reason: "invalid-data" };
    }
    const stored = readManagementData();
    if (!stored.ok) return stored;

    const existing = stored.data.events.find((event) => event.id === eventId);
    if (!existing) return { ok: false, reason: "not-found" };
    const events = stored.data.events.map((event) =>
      event.id === eventId ? { ...event, publicationStatus } : event,
    );
    const data = { ...stored.data, events };
    const saved = saveData(data);
    if (!saved.ok) return saved;
    return { ok: true, data };
  },

  saveCycle(input) {
    const stored = readManagementData();
    if (!stored.ok) return stored;

    const title = validateText(input.title, 120);
    const description = validateText(input.description, 1000);
    const opensAt = normalizeDateTime(input.opensAt);
    const closesAt = normalizeDateTime(input.closesAt);
    const candidates = input.candidates
      .map((candidate) => candidate.trim())
      .filter(Boolean);
    const uniqueCandidates = new Set(
      candidates.map((candidate) => candidate.toLocaleLowerCase("es-CO")),
    );

    if (
      !title ||
      !description ||
      !opensAt ||
      !closesAt ||
      Date.parse(opensAt) >= Date.parse(closesAt) ||
      !isPublicationStatus(input.publicationStatus) ||
      candidates.length < minimumCandidates ||
      candidates.length !== uniqueCandidates.size ||
      candidates.some((candidate) => candidate.length > 160)
    ) {
      return { ok: false, reason: "invalid-data" };
    }

    const existing = input.id
      ? stored.data.cycles.find((cycle) => cycle.id === input.id)
      : undefined;
    if (input.id && !existing) return { ok: false, reason: "not-found" };
    if (existing && deriveCycleStatus(existing, Date.now()) === "closed") {
      return { ok: false, reason: "cycle-closed" };
    }

    let id = existing?.id;
    if (!id) {
      id = createId(title) ?? undefined;
      if (!id) return { ok: false, reason: "unavailable" };
    }

    const now = Date.now();
    const cycle: CuratedVotingCycle = {
      id,
      title,
      description,
      opensAt,
      closesAt,
      candidates,
      status: "upcoming",
      resultsPublished: existing?.resultsPublished ?? false,
      publicationStatus: input.publicationStatus,
      closedAt: null,
      closureReason: null,
    };
    cycle.status = deriveCycleStatus(cycle, now);
    const cycles = existing
      ? stored.data.cycles.map((item) => (item.id === id ? cycle : item))
      : [...stored.data.cycles, cycle];
    const data = { ...stored.data, cycles };
    const saved = saveData(data);
    if (!saved.ok) return saved;
    return { ok: true, data };
  },

  closeCycle(cycleId, reasonInput) {
    const reason = validateText(reasonInput, 500);
    if (!reason) return { ok: false, reason: "invalid-data" };

    const stored = readManagementData();
    if (!stored.ok) return stored;

    const cycleIndex = stored.data.cycles.findIndex(
      (cycle) => cycle.id === cycleId,
    );
    if (cycleIndex < 0) return { ok: false, reason: "not-found" };
    const cycle = stored.data.cycles[cycleIndex];
    if (deriveCycleStatus(cycle, Date.now()) !== "open") {
      return { ok: false, reason: "invalid-state" };
    }

    const updatedCycle = {
      ...cycle,
      status: "closed" as const,
      closedAt: new Date().toISOString(),
      closureReason: reason,
    };
    const cycles = [...stored.data.cycles];
    cycles[cycleIndex] = updatedCycle;
    const data = { ...stored.data, cycles };
    const saved = saveData(data);
    if (!saved.ok) return saved;
    return { ok: true, data };
  },

  publishCycleResults(cycleId) {
    const stored = readManagementData();
    if (!stored.ok) return stored;

    const cycleIndex = stored.data.cycles.findIndex(
      (cycle) => cycle.id === cycleId,
    );
    if (cycleIndex < 0) return { ok: false, reason: "not-found" };

    const cycle = stored.data.cycles[cycleIndex];
    if (deriveCycleStatus(cycle, Date.now()) !== "closed") {
      return { ok: false, reason: "invalid-state" };
    }
    if (cycle.resultsPublished) {
      return { ok: false, reason: "invalid-state" };
    }

    const cycles = [...stored.data.cycles];
    cycles[cycleIndex] = { ...cycle, resultsPublished: true };
    const data = { ...stored.data, cycles };
    const saved = saveData(data);
    if (!saved.ok) return saved;
    return { ok: true, data };
  },
};
