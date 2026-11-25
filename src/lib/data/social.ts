import { authRepository } from "@/lib/data/auth-repository";

export type FollowResult =
  | { ok: true; isFollowing: boolean }
  | { ok: false; reason: FollowFailureReason };

export type FollowFailureReason =
  | "cannot-follow-self"
  | "invalid-data"
  | "not-found"
  | "unauthenticated"
  | "unavailable";

export interface SocialRepository {
  getFollowStatus(targetUserId: string): FollowResult;
  follow(targetUserId: string): FollowResult;
  unfollow(targetUserId: string): FollowResult;
}

const storageKeyPrefix = "pillarboxed.demo-following.";

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(value).size === value.length
  );
}

function getCurrentUserId():
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid-data" | "unauthenticated" | "unavailable" } {
  const session = authRepository.readSession();
  if (!session.ok) return session;
  if (session.user === null) {
    return { ok: false, reason: "unauthenticated" };
  }

  return { ok: true, userId: session.user.id };
}

function readFollowing(userId: string):
  | { ok: true; userIds: string[] }
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

  if (serialized === null) return { ok: true, userIds: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (!isStringArray(parsed)) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, userIds: parsed };
}

function saveFollowing(userId: string, userIds: string[]):
  | { ok: true }
  | { ok: false; reason: "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      JSON.stringify(userIds),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

function verifyTarget(targetUserId: string):
  | { ok: true }
  | {
      ok: false;
      reason: "invalid-data" | "not-found" | "unauthenticated" | "unavailable";
    } {
  const result = authRepository.readPublicProfile(targetUserId);
  if (!result.ok) return result;
  if (result.profile === null) return { ok: false, reason: "not-found" };

  return { ok: true };
}

export const socialRepository: SocialRepository = {
  getFollowStatus(targetUserId) {
    const currentUser = getCurrentUserId();
    if (!currentUser.ok) return currentUser;
    if (currentUser.userId === targetUserId) {
      return { ok: true, isFollowing: false };
    }

    const target = verifyTarget(targetUserId);
    if (!target.ok) return target;

    const following = readFollowing(currentUser.userId);
    if (!following.ok) return following;

    return {
      ok: true,
      isFollowing: following.userIds.includes(targetUserId),
    };
  },

  follow(targetUserId) {
    const currentUser = getCurrentUserId();
    if (!currentUser.ok) return currentUser;
    if (currentUser.userId === targetUserId) {
      return { ok: false, reason: "cannot-follow-self" };
    }

    const target = verifyTarget(targetUserId);
    if (!target.ok) return target;

    const following = readFollowing(currentUser.userId);
    if (!following.ok) return following;
    if (following.userIds.includes(targetUserId)) {
      return { ok: true, isFollowing: true };
    }

    const saved = saveFollowing(currentUser.userId, [
      ...following.userIds,
      targetUserId,
    ]);
    if (!saved.ok) return saved;

    return { ok: true, isFollowing: true };
  },

  unfollow(targetUserId) {
    const currentUser = getCurrentUserId();
    if (!currentUser.ok) return currentUser;
    if (currentUser.userId === targetUserId) {
      return { ok: false, reason: "cannot-follow-self" };
    }

    const target = verifyTarget(targetUserId);
    if (!target.ok) return target;

    const following = readFollowing(currentUser.userId);
    if (!following.ok) return following;
    if (!following.userIds.includes(targetUserId)) {
      return { ok: true, isFollowing: false };
    }

    const saved = saveFollowing(
      currentUser.userId,
      following.userIds.filter((userId) => userId !== targetUserId),
    );
    if (!saved.ok) return saved;

    return { ok: true, isFollowing: false };
  },
};
