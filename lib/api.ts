import type { ChatApiRequest } from "@/types/chat";

export const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful, intelligent, friendly AI assistant. Always answer clearly, politely, and in Markdown.";

export const DEFAULT_TEMPERATURE = 0.7;

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

/**
 * Calls our internal Next.js API route (never the third-party API directly).
 * Supports cancellation via AbortSignal so "stop generating" works.
 */
export async function sendChatMessage(
  payload: ChatApiRequest,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: payload.prompt,
      system: payload.system ?? DEFAULT_SYSTEM_PROMPT,
      temperature: payload.temperature ?? DEFAULT_TEMPERATURE,
    }),
    signal,
  });

  let json: { reply?: string; error?: string } | null = null;
  try {
    json = await res.json();
  } catch {
    // ignore parse failure, handled below
  }

  if (!res.ok) {
    throw new ChatApiError(json?.error ?? "The AI service could not be reached.");
  }

  if (!json?.reply) {
    throw new ChatApiError("The AI returned an empty response.");
  }

  return json.reply;
}
