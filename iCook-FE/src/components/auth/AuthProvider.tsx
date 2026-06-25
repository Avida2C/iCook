"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Local (no-backend) auth for development.
 *
 * Accounts and the active session live in localStorage so you can log in,
 * stay logged in across reloads, and build out the authenticated app. A demo
 * account is seeded automatically.
 *
 * NOTE: this stores credentials in plaintext in the browser and is only a
 * stand-in. Replace it with a real auth backend before shipping.
 */

export type User = { email: string; name?: string };
type StoredUser = User & { password?: string };
type AuthResult = { ok: true } | { ok: false; error: string };

const USERS_KEY = "icook.users";
const SESSION_KEY = "icook.session";

export const DEMO_CREDENTIALS = {
  email: "demo@icook.app",
  password: "demo1234",
};

const DEMO_USER: StoredUser = {
  email: DEMO_CREDENTIALS.email,
  name: "Demo Chef",
  password: DEMO_CREDENTIALS.password,
};

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    if (!users.some((u) => u.email === DEMO_USER.email)) {
      users.unshift(DEMO_USER);
    }
    return users;
  } catch {
    return [DEMO_USER];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => AuthResult;
  signup: (email: string, password?: string) => AuthResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed the demo account and restore any existing session.
    writeUsers(readUsers());
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed session
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((next: User | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = useCallback(
    (identifier: string, password: string): AuthResult => {
      const id = identifier.trim().toLowerCase();
      if (!id) return { ok: false, error: "Enter your email or username." };

      const found = readUsers().find(
        (u) =>
          u.email.toLowerCase() === id || u.name?.toLowerCase() === id,
      );
      if (!found) return { ok: false, error: "No account found for that email." };
      if (found.password && found.password !== password) {
        return { ok: false, error: "Incorrect password." };
      }

      persistSession({ email: found.email, name: found.name });
      return { ok: true };
    },
    [persistSession],
  );

  const signup = useCallback(
    (email: string, password?: string): AuthResult => {
      const e = email.trim().toLowerCase();
      if (!e) return { ok: false, error: "Enter an email address." };

      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === e)) {
        return { ok: false, error: "An account with that email already exists." };
      }

      writeUsers([...users, { email: e, password }]);
      persistSession({ email: e });
      return { ok: true };
    },
    [persistSession],
  );

  const logout = useCallback(() => persistSession(null), [persistSession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
