export type UserRole = "usuario" | "curador" | "administrador";
export type AssignableUserRole = "usuario" | "curador";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  career: string;
  semester: number;
  role: UserRole;
};

export type RoleManagementUser = Pick<
  AuthUser,
  "id" | "firstName" | "lastName" | "email" | "role"
>;

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  career: string;
  semester: number;
  password: string;
};

export type ProfileUpdateInput = Pick<
  AuthUser,
  "firstName" | "lastName" | "career" | "semester"
>;

export type PublicProfile = Pick<AuthUser, "id" | "firstName" | "lastName">;

type StoredAccount = AuthUser & {
  status: "pendiente" | "activa";
  passwordSalt: string;
  passwordHash: string;
};

export type AuthFailureReason =
  | "already-registered"
  | "institutional-email-required"
  | "invalid-credentials"
  | "invalid-data"
  | "invalid-email"
  | "not-pending"
  | "pending-verification"
  | "unavailable"
  | "weak-password";

export type AuthActionResult =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: AuthFailureReason };

export type SessionReadResult =
  | { ok: true; user: AuthUser | null }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export type ProfileUpdateResult =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: "invalid-data" | "not-found" | "unavailable" };

export type PublicProfileReadResult =
  | { ok: true; profile: PublicProfile | null }
  | {
      ok: false;
      reason: "invalid-data" | "unauthenticated" | "unavailable";
    };

export type SignOutResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" };
export type RoleManagementReadResult =
  | { ok: true; users: RoleManagementUser[] }
  | {
      ok: false;
      reason:
        | "forbidden"
        | "invalid-data"
        | "unauthenticated"
        | "unavailable";
    };
export type RoleManagementWriteResult =
  | { ok: true; user: RoleManagementUser }
  | {
      ok: false;
      reason:
        | "forbidden"
        | "invalid-data"
        | "not-found"
        | "unauthenticated"
        | "unavailable";
    };
type StorageWriteResult = SignOutResult;

export interface AuthRepository {
  register(input: RegistrationInput): Promise<AuthActionResult>;
  verifyEmail(email: string): AuthActionResult;
  signIn(email: string, password: string): Promise<AuthActionResult>;
  readSession(): SessionReadResult;
  updateProfile(input: ProfileUpdateInput): ProfileUpdateResult;
  readPublicProfile(userId: string): PublicProfileReadResult;
  listUsersForRoleManagement(): RoleManagementReadResult;
  updateUserRole(
    targetUserId: string,
    role: AssignableUserRole,
  ): RoleManagementWriteResult;
  signOut(): SignOutResult;
}

const accountsStorageKey = "pillarboxed.demo-accounts";
const sessionStorageKey = "pillarboxed.demo-session";
const passwordIterations = 120_000;
const institutionalEmailDomain = "@pascualbravo.edu.co";
export const careerOptions = [
  { value: "Ingeniería de Software", maxSemesters: 10 },
  { value: "Tecnología de Software", maxSemesters: 6 },
] as const;

export function getMaxSemestersForCareer(career: string): number | null {
  return (
    careerOptions.find((option) => option.value === career)?.maxSemesters ??
    null
  );
}

export function isInstitutionalEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(institutionalEmailDomain);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUserRole(value: unknown): value is UserRole {
  return value === "usuario" || value === "curador" || value === "administrador";
}

function isStoredAccount(value: unknown): value is StoredAccount {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    typeof value.email === "string" &&
    typeof value.career === "string" &&
    typeof value.semester === "number" &&
    Number.isInteger(value.semester) &&
    value.semester > 0 &&
    isUserRole(value.role) &&
    (value.status === "pendiente" || value.status === "activa") &&
    typeof value.passwordSalt === "string" &&
    /^[\da-f]{32}$/i.test(value.passwordSalt) &&
    typeof value.passwordHash === "string" &&
    /^[\da-f]{64}$/i.test(value.passwordHash)
  );
}

async function getInitialAdminRole(
  email: string,
): Promise<
  | { ok: true; role: "administrador" | null }
  | { ok: false; reason: "invalid-data" | "unavailable" }
> {
  let response: Response;
  try {
    response = await fetch("/api/demo/initial-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  if (!response.ok) return { ok: false, reason: "unavailable" };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (
    !isRecord(payload) ||
    (payload.role !== null && payload.role !== "administrador")
  ) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, role: payload.role };
}

function readAccounts():
  | { ok: true; accounts: StoredAccount[] }
  | { ok: false; reason: "invalid-data" | "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(accountsStorageKey);
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  if (serialized === null) return { ok: true, accounts: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (!Array.isArray(parsed) || !parsed.every(isStoredAccount)) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, accounts: parsed };
}

function saveAccounts(accounts: StoredAccount[]):
  StorageWriteResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(accountsStorageKey, JSON.stringify(accounts));
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

function toAuthUser(account: StoredAccount): AuthUser {
  return {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    career: account.career,
    semester: account.semester,
    role: account.role,
  };
}

function toPublicProfile(account: StoredAccount): PublicProfile {
  return {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
  };
}

function createSalt(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: passwordIterations,
    },
    key,
    256,
  );

  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function isUnavailableCryptoError(error: unknown): boolean {
  return error instanceof DOMException || error instanceof TypeError;
}

function saveSession(userId: string): StorageWriteResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(
      sessionStorageKey,
      JSON.stringify({ userId }),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

export const authRepository: AuthRepository = {
  async register(input) {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim().toLowerCase();
    const career = input.career.trim();
    const maxSemester = getMaxSemestersForCareer(career);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, reason: "invalid-email" };
    }
    if (!isInstitutionalEmail(email)) {
      return { ok: false, reason: "institutional-email-required" };
    }
    if (
      !firstName ||
      !lastName ||
      maxSemester === null ||
      !Number.isInteger(input.semester) ||
      input.semester < 1 ||
      input.semester > maxSemester
    ) {
      return { ok: false, reason: "invalid-data" };
    }
    if (input.password.length < 8) {
      return { ok: false, reason: "weak-password" };
    }
    if (!globalThis.crypto?.subtle) {
      return { ok: false, reason: "unavailable" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;
    if (stored.accounts.some((account) => account.email === email)) {
      return { ok: false, reason: "already-registered" };
    }

    let passwordSalt: string;
    let passwordHash: string;
    try {
      passwordSalt = createSalt();
      passwordHash = await hashPassword(input.password, passwordSalt);
    } catch (error) {
      if (isUnavailableCryptoError(error)) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    const account: StoredAccount = {
      id: globalThis.crypto.randomUUID(),
      firstName,
      lastName,
      email,
      career,
      semester: input.semester,
      role: "usuario",
      status: "pendiente",
      passwordSalt,
      passwordHash,
    };
    const saved = saveAccounts([...stored.accounts, account]);
    if (!saved.ok) return saved;

    return { ok: true, user: toAuthUser(account) };
  },

  verifyEmail(emailInput) {
    const email = emailInput.trim().toLowerCase();
    const stored = readAccounts();
    if (!stored.ok) return stored;

    const accountIndex = stored.accounts.findIndex(
      (account) => account.email === email,
    );
    if (accountIndex < 0 || stored.accounts[accountIndex].status !== "pendiente") {
      return { ok: false, reason: "not-pending" };
    }

    const account: StoredAccount = {
      ...stored.accounts[accountIndex],
      status: "activa",
    };
    const accounts = [...stored.accounts];
    accounts[accountIndex] = account;

    const saved = saveAccounts(accounts);
    if (!saved.ok) return saved;

    return { ok: true, user: toAuthUser(account) };
  },

  async signIn(emailInput, password) {
    const email = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, reason: "invalid-email" };
    }
    if (!isInstitutionalEmail(email)) {
      return { ok: false, reason: "institutional-email-required" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;

    const account = stored.accounts.find((item) => item.email === email);
    if (!account) {
      return { ok: false, reason: "invalid-credentials" };
    }
    if (account.status === "pendiente") {
      return { ok: false, reason: "pending-verification" };
    }
    if (!globalThis.crypto?.subtle) {
      return { ok: false, reason: "unavailable" };
    }

    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password, account.passwordSalt);
    } catch (error) {
      if (isUnavailableCryptoError(error)) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    if (passwordHash !== account.passwordHash) {
      return { ok: false, reason: "invalid-credentials" };
    }

    let accountToSignIn = account;
    if (account.role !== "administrador") {
      const initialRole = await getInitialAdminRole(email);
      if (!initialRole.ok) return initialRole;

      if (initialRole.role === "administrador") {
        const accountIndex = stored.accounts.findIndex(
          (item) => item.id === account.id,
        );
        if (accountIndex < 0) return { ok: false, reason: "invalid-data" };

        accountToSignIn = { ...account, role: "administrador" };
        const accounts = [...stored.accounts];
        accounts[accountIndex] = accountToSignIn;
        const savedAccounts = saveAccounts(accounts);
        if (!savedAccounts.ok) return savedAccounts;
      }
    }

    const saved = saveSession(account.id);
    if (!saved.ok) return saved;

    return { ok: true, user: toAuthUser(accountToSignIn) };
  },

  readSession() {
    if (typeof window === "undefined") {
      return { ok: false, reason: "unavailable" };
    }

    let serialized: string | null;
    try {
      serialized = window.localStorage.getItem(sessionStorageKey);
    } catch (error) {
      if (error instanceof DOMException) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    if (serialized === null) return { ok: true, user: null };

    let parsed: unknown;
    try {
      parsed = JSON.parse(serialized);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { ok: false, reason: "invalid-data" };
      }
      throw error;
    }

    if (!isRecord(parsed) || typeof parsed.userId !== "string") {
      return { ok: false, reason: "invalid-data" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;

    const account = stored.accounts.find(
      (item) => item.id === parsed.userId && item.status === "activa",
    );
    if (!account || !isInstitutionalEmail(account.email)) {
      return { ok: true, user: null };
    }

    return { ok: true, user: toAuthUser(account) };
  },

  updateProfile(input) {
    const session = this.readSession();
    if (!session.ok) return session;
    if (session.user === null) return { ok: false, reason: "not-found" };
    const user = session.user;

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const career = input.career.trim();
    const maxSemester = getMaxSemestersForCareer(career);

    if (
      !firstName ||
      !lastName ||
      maxSemester === null ||
      !Number.isInteger(input.semester) ||
      input.semester < 1 ||
      input.semester > maxSemester
    ) {
      return { ok: false, reason: "invalid-data" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;

    const accountIndex = stored.accounts.findIndex(
      (account) => account.id === user.id && account.status === "activa",
    );
    if (accountIndex < 0) return { ok: false, reason: "not-found" };

    const account: StoredAccount = {
      ...stored.accounts[accountIndex],
      firstName,
      lastName,
      career,
      semester: input.semester,
    };
    const accounts = [...stored.accounts];
    accounts[accountIndex] = account;

    const saved = saveAccounts(accounts);
    if (!saved.ok) return saved;

    return { ok: true, user: toAuthUser(account) };
  },

  readPublicProfile(userId) {
    const session = this.readSession();
    if (!session.ok) return session;
    if (session.user === null) {
      return { ok: false, reason: "unauthenticated" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;

    const account = stored.accounts.find(
      (item) => item.id === userId && item.status === "activa",
    );
    return {
      ok: true,
      profile: account ? toPublicProfile(account) : null,
    };
  },

  listUsersForRoleManagement() {
    const session = this.readSession();
    if (!session.ok) return session;
    if (!session.user) {
      return { ok: false, reason: "unauthenticated" };
    }
    if (session.user.role !== "administrador") {
      return { ok: false, reason: "forbidden" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;

    return {
      ok: true,
      users: stored.accounts
        .filter((account) => account.status === "activa")
        .map(({ id, firstName, lastName, email, role }) => ({
          id,
          firstName,
          lastName,
          email,
          role,
        })),
    };
  },

  updateUserRole(targetUserId, role) {
    if (role !== "usuario" && role !== "curador") {
      return { ok: false, reason: "invalid-data" };
    }

    const session = this.readSession();
    if (!session.ok) return session;
    if (!session.user) {
      return { ok: false, reason: "unauthenticated" };
    }
    if (
      session.user.role !== "administrador" ||
      session.user.id === targetUserId
    ) {
      return { ok: false, reason: "forbidden" };
    }

    const stored = readAccounts();
    if (!stored.ok) return stored;

    const accountIndex = stored.accounts.findIndex(
      (account) => account.id === targetUserId && account.status === "activa",
    );
    if (accountIndex < 0) return { ok: false, reason: "not-found" };
    if (stored.accounts[accountIndex].role === "administrador") {
      return { ok: false, reason: "forbidden" };
    }

    const updatedAccount = {
      ...stored.accounts[accountIndex],
      role,
    };
    const accounts = [...stored.accounts];
    accounts[accountIndex] = updatedAccount;

    const saved = saveAccounts(accounts);
    if (!saved.ok) return saved;

    const { id, firstName, lastName, email, role: updatedRole } = updatedAccount;
    return {
      ok: true,
      user: {
        id,
        firstName,
        lastName,
        email,
        role: updatedRole,
      },
    };
  },

  signOut() {
    if (typeof window === "undefined") {
      return { ok: false, reason: "unavailable" };
    }

    try {
      window.localStorage.removeItem(sessionStorageKey);
    } catch (error) {
      if (error instanceof DOMException) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    return { ok: true };
  },
};
