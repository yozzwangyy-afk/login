import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AI_ENDPOINT = "https://api.siputzx.my.id/api/ai/deepseekr1";
const DEFAULT_SYSTEM =
  "You are a helpful, intelligent, friendly AI assistant. Always answer clearly, politely, and in Markdown.";
const DEFAULT_TEMPERATURE = 0.7;
const REQUEST_TIMEOUT_MS = 45_000;

interface ChatRequestBody {
  prompt?: string;
  system?: string;
  temperature?: number;
}

/**
 * POST /api/chat
 * Server-side proxy for the DeepSeekR1 API. The client never talks to the
 * third-party endpoint directly — this route is the only place that does.
 */
export async function POST(req: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json(
      { error: "A non-empty 'prompt' is required." },
      { status: 400 }
    );
  }

  const system = body.system?.trim() || DEFAULT_SYSTEM;
  const temperature =
    typeof body.temperature === "number" && !Number.isNaN(body.temperature)
      ? Math.min(Math.max(body.temperature, 0), 2)
      : DEFAULT_TEMPERATURE;

  const url = new URL(AI_ENDPOINT);
  url.searchParams.set("prompt", prompt);
  url.searchParams.set("system", system);
  url.searchParams.set("temperature", String(temperature));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: `The AI service responded with an error (status ${upstream.status}).`,
        },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    let reply: string | undefined;

    if (contentType.includes("application/json")) {
      const data = await upstream.json();
      // The upstream API's exact response shape can vary; check the common keys.
      reply =
        data?.data ??
        data?.result ??
        data?.message ??
        data?.response ??
        data?.answer;

      if (typeof reply !== "string") {
        reply = undefined;
      }
    } else {
      const text = await upstream.text();
      reply = text;
    }

    if (!reply) {
      return NextResponse.json(
        { error: "The AI service returned an empty or unrecognized response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    clearTimeout(timeout);

    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "The AI service took too long to respond. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Could not reach the AI service. Please try again shortly." },
      { status: 503 }
    );
  }
}
