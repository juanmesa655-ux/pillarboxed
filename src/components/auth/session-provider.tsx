"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  authRepository,
  type AuthUser,
  type SignOutResult,
} from "@/lib/data/auth-repository";

type SessionState =
  | { status: "loading" }
  | { status: "ready"; user: AuthUser | null }
  | { status: "error"; reason: "invalid-data" | "unavailable" };

type SessionContextValue = {
  state: SessionState;
  setAuthenticatedUser: (user: AuthUser) => void;
  signOut: () => SignOutResult;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const loadingState: SessionState = { status: "loading" };
let sessionState: SessionState = loadingState;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return sessionState;
}

function getServerSnapshot() {
  return loadingState;
}

function updateSessionState(nextState: SessionState) {
  sessionState = nextState;
  listeners.forEach((listener) => listener());
}

function initializeSession() {
  if (sessionState.status !== "loading") return;

  const result = authRepository.readSession();
  updateSessionState(
    result.ok
      ? { status: "ready", user: result.user }
      : { status: "error", reason: result.reason },
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    initializeSession();
  }, []);

  function setAuthenticatedUser(user: AuthUser) {
    updateSessionState({ status: "ready", user });
  }

  function signOut(): SignOutResult {
    const result = authRepository.signOut();
    if (result.ok) {
      updateSessionState({ status: "ready", user: null });
    }
    return result;
  }

  return (
    <SessionContext.Provider value={{ state, setAuthenticatedUser, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error("useSession debe usarse dentro de SessionProvider.");
  }
  return session;
}
