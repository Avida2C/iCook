const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

/** Strip leading @ and normalize for storage/lookup. */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/** Returns an error message if invalid, otherwise null. */
export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!username) return "Enter a username.";
  if (!USERNAME_RE.test(username)) {
    return "Username must be 3–30 characters: letters, numbers, or underscores.";
  }
  return null;
}

export function displayName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function initialsFromName(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  const initials = `${a}${b}`.toUpperCase();
  return initials || "?";
}
