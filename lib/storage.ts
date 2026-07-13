import type { Conversation } from "@/types/chat";

const STORAGE_KEY = "ai-chat.conversations.v1";
const ACTIVE_KEY = "ai-chat.active-conversation.v1";

/** Reads all saved conversations from LocalStorage. Safe for SSR (returns []). */
export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** Persists the full conversation list to LocalStorage. */
export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable — fail silently, chat still works in-memory.
  }
}

export function loadActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveConversationId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function deleteConversationFromStorage(
  conversations: Conversation[],
  id: string
): Conversation[] {
  const next = conversations.filter((c) => c.id !== id);
  saveConversations(next);
  return next;
}
