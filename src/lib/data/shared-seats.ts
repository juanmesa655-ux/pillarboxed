import { curationRepository } from "@/lib/data/curation-repository";
import type { CineFunction } from "@/lib/data/events";
import {
  getMembershipTier,
  membershipRepository,
} from "@/lib/data/membership";

export type SeatInvitationStatus = "pending" | "accepted" | "declined";

export type SeatParticipant = {
  id: string;
  userId: string;
  name: string;
  status: SeatInvitationStatus;
};

export type SharedSeatGroup = {
  id: string;
  eventId: string;
  eventTitle: string;
  startsAt: string;
  venue: string;
  creatorId: string;
  creatorName: string;
  participants: SeatParticipant[];
};

export type SeatInvitation = {
  id: string;
  groupId: string;
  eventId: string;
  eventTitle: string;
  startsAt: string;
  venue: string;
  inviterName: string;
  status: SeatInvitationStatus;
};

export type SeatInvitee = {
  id: string;
  name: string;
};

export type SharedSeatOverview = {
  invitations: SeatInvitation[];
  groups: SharedSeatGroup[];
};

export type SharedSeatFailureReason =
  | "already-responded"
  | "event-closed"
  | "invalid-event"
  | "invalid-invitees"
  | "invalid-data"
  | "membership-required"
  | "no-invitees"
  | "not-found"
  | "unavailable";

export type SharedSeatResult =
  | { ok: true; overview: SharedSeatOverview }
  | { ok: false; reason: SharedSeatFailureReason };

export interface SharedSeatRepository {
  getInvitees(): SeatInvitee[];
  getOverview(userId: string, userName: string): SharedSeatResult;
  createGroup(
    userId: string,
    userName: string,
    eventId: string,
    inviteeIds: string[],
  ): SharedSeatResult;
  respondToInvitation(
    userId: string,
    userName: string,
    invitationId: string,
    response: "accepted" | "declined",
  ): SharedSeatResult;
}

const storageKeyPrefix = "pillarboxed.demo-shared-seats.";
const demoInvitees: SeatInvitee[] = [
  { id: "demo-follower-ana", name: "Ana Vélez" },
  { id: "demo-follower-mateo", name: "Mateo Ospina" },
  { id: "demo-follower-lina", name: "Lina Montoya" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInvitationStatus(value: unknown): value is SeatInvitationStatus {
  return value === "pending" || value === "accepted" || value === "declined";
}

function isParticipant(value: unknown): value is SeatParticipant {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.name === "string" &&
    isInvitationStatus(value.status)
  );
}

function isSharedSeatGroup(value: unknown): value is SharedSeatGroup {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.eventId === "string" &&
    typeof value.eventTitle === "string" &&
    typeof value.startsAt === "string" &&
    !Number.isNaN(Date.parse(value.startsAt)) &&
    typeof value.venue === "string" &&
    typeof value.creatorId === "string" &&
    typeof value.creatorName === "string" &&
    Array.isArray(value.participants) &&
    value.participants.every(isParticipant)
  );
}

function createDemoGroups(
  userId: string,
  userName: string,
  events: CineFunction[],
): SharedSeatGroup[] {
  const upcomingFunctions = events.filter(
    (cineFunction) => cineFunction.period === "upcoming",
  );
  const groups: SharedSeatGroup[] = [];
  const invitationFunction = upcomingFunctions[0];
  const createdFunction = upcomingFunctions[1];

  if (invitationFunction) {
    groups.push({
      id: `${userId}-demo-invitation`,
      eventId: invitationFunction.id,
      eventTitle: invitationFunction.title,
      startsAt: invitationFunction.startsAt,
      venue: invitationFunction.venue,
      creatorId: "demo-organizer",
      creatorName: "Daniela Restrepo",
      participants: [
        {
          id: `${userId}-demo-invitation-response`,
          userId,
          name: userName,
          status: "pending",
        },
        {
          id: `${userId}-demo-invitation-guest`,
          userId: `${userId}-demo-guest`,
          name: "Santiago Ruiz",
          status: "accepted",
        },
      ],
    });
  }

  if (createdFunction) {
    groups.push({
      id: `${userId}-demo-group`,
      eventId: createdFunction.id,
      eventTitle: createdFunction.title,
      startsAt: createdFunction.startsAt,
      venue: createdFunction.venue,
      creatorId: userId,
      creatorName: userName,
      participants: [
        {
          id: `${userId}-demo-group-guest-1`,
          userId: `${userId}-demo-group-user-1`,
          name: "Valentina Cárdenas",
          status: "accepted",
        },
        {
          id: `${userId}-demo-group-guest-2`,
          userId: `${userId}-demo-group-user-2`,
          name: "Mateo Ospina",
          status: "pending",
        },
      ],
    });
  }

  return groups;
}

function readGroups(
  userId: string,
  userName: string,
  events: CineFunction[],
):
  | { ok: true; groups: SharedSeatGroup[] }
  | { ok: false; reason: "invalid-data" | "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  if (serialized === null) {
    return { ok: true, groups: createDemoGroups(userId, userName, events) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (!Array.isArray(parsed) || !parsed.every(isSharedSeatGroup)) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, groups: parsed };
}

function saveGroups(
  userId: string,
  groups: SharedSeatGroup[],
): { ok: true } | { ok: false; reason: "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      JSON.stringify(groups),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

function createOverview(
  groups: SharedSeatGroup[],
  userId: string,
): SharedSeatOverview {
  const invitations = groups.flatMap((group) =>
    group.participants
      .filter((participant) => participant.userId === userId)
      .map((participant) => ({
        id: participant.id,
        groupId: group.id,
        eventId: group.eventId,
        eventTitle: group.eventTitle,
        startsAt: group.startsAt,
        venue: group.venue,
        inviterName: group.creatorName,
        status: participant.status,
      })),
  );

  return {
    invitations,
    groups: groups.filter((group) => group.creatorId === userId),
  };
}

export const sharedSeatRepository: SharedSeatRepository = {
  getInvitees() {
    return [...demoInvitees];
  },

  getOverview(userId, userName) {
    const events = curationRepository.getPublicEvents();
    if (!events.ok) return events;
    const stored = readGroups(userId, userName, events.events);
    if (!stored.ok) return stored;

    return {
      ok: true,
      overview: createOverview(stored.groups, userId),
    };
  },

  createGroup(userId, userName, eventId, inviteeIds) {
    const membership = membershipRepository.getSubscription(userId);
    if (!membership.ok) return membership;
    if (getMembershipTier(membership.subscription) !== "colaborador") {
      return { ok: false, reason: "membership-required" };
    }

    const events = curationRepository.getPublicEvents();
    if (!events.ok) return events;
    const cineFunction = events.events.find(
      (item) => item.id === eventId,
    );
    if (!cineFunction) return { ok: false, reason: "invalid-event" };
    if (
      cineFunction.period !== "upcoming" ||
      Date.parse(cineFunction.startsAt) <= Date.now()
    ) {
      return { ok: false, reason: "event-closed" };
    }

    const uniqueInviteeIds = new Set(inviteeIds);
    if (inviteeIds.length === 0) {
      return { ok: false, reason: "no-invitees" };
    }
    if (
      uniqueInviteeIds.size !== inviteeIds.length ||
      inviteeIds.some(
        (id) => !demoInvitees.some((invitee) => invitee.id === id),
      )
    ) {
      return { ok: false, reason: "invalid-invitees" };
    }

    const stored = readGroups(userId, userName, events.events);
    if (!stored.ok) return stored;

    let groupId: string;
    try {
      groupId = globalThis.crypto.randomUUID();
    } catch (error) {
      if (error instanceof DOMException || error instanceof TypeError) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    const participants: SeatParticipant[] = [];
    for (const inviteeId of inviteeIds) {
      const invitee = demoInvitees.find((item) => item.id === inviteeId);
      if (!invitee) return { ok: false, reason: "invalid-invitees" };

      participants.push({
        id: `${groupId}-${invitee.id}`,
        userId: invitee.id,
        name: invitee.name,
        status: "pending",
      });
    }

    const group: SharedSeatGroup = {
      id: groupId,
      eventId: cineFunction.id,
      eventTitle: cineFunction.title,
      startsAt: cineFunction.startsAt,
      venue: cineFunction.venue,
      creatorId: userId,
      creatorName: userName,
      participants,
    };
    const groups = [...stored.groups, group];
    const saved = saveGroups(userId, groups);
    if (!saved.ok) return saved;

    return { ok: true, overview: createOverview(groups, userId) };
  },

  respondToInvitation(userId, userName, invitationId, response) {
    const events = curationRepository.getPublicEvents();
    if (!events.ok) return events;
    const stored = readGroups(userId, userName, events.events);
    if (!stored.ok) return stored;

    let found = false;
    let alreadyResponded = false;
    const groups = stored.groups.map((group) => ({
      ...group,
      participants: group.participants.map((participant) => {
        if (participant.id !== invitationId || participant.userId !== userId) {
          return participant;
        }

        found = true;
        if (participant.status !== "pending") {
          alreadyResponded = true;
          return participant;
        }

        return { ...participant, status: response };
      }),
    }));

    if (!found) return { ok: false, reason: "not-found" };
    if (alreadyResponded) {
      return { ok: false, reason: "already-responded" };
    }

    const saved = saveGroups(userId, groups);
    if (!saved.ok) return saved;

    return { ok: true, overview: createOverview(groups, userId) };
  },
};
