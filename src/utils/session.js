import { v4 as uuidv4 } from "uuid";

const VISITOR_KEY = "bayai_visitor_id";
const SESSION_KEY = "bayai_session_id";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function readEntry(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.id || !entry?.expiresAt) return null;
    if (Date.now() > entry.expiresAt) {
      storage.removeItem(key);
      return null;
    }
    return entry.id;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function writeEntry(storage, key, id) {
  storage.setItem(key, JSON.stringify({ id, expiresAt: Date.now() + TTL_MS }));
  return id;
}

export const getVisitorId = () => {
  const existing = readEntry(localStorage, VISITOR_KEY);
  if (existing) return existing;
  return writeEntry(localStorage, VISITOR_KEY, uuidv4());
};

export const getSessionId = (forceNew = false) => {
  if (!forceNew) {
    const existing = readEntry(localStorage, SESSION_KEY);
    if (existing) return existing;
  }
  return writeEntry(localStorage, SESSION_KEY, uuidv4());
};

export const resetSessionId = () => getSessionId(true);
