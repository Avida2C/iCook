const STORAGE_KEY = "icook.viewedActivity";
const MAX_IDS = 500;

export function readViewedActivityIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function writeViewedActivityIds(ids: Set<string>) {
  let list = [...ids];
  if (list.length > MAX_IDS) list = list.slice(list.length - MAX_IDS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
