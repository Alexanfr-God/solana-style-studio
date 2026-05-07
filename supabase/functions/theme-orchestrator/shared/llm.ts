/**
 * Anthropic Claude API helper for theme-orchestrator agents.
 *
 * Single source of truth for model selection, auth, and request shape.
 * All text agents (color-analyst, designer, element-designer, director,
 * design-system-selector) call through `callClaude()`.
 *
 * Provider switching: set `THEME_AI_PROVIDER=gemini` to fall back to the
 * old Lovable gateway path used by callers. Default is `claude`.
 */

const DEFAULT_MODEL = "claude-sonnet-4-5"; // exact model id; aliases sometimes lag
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";

export type Provider = "claude" | "gemini";

export function getProvider(): Provider {
  const v = (Deno.env.get("THEME_AI_PROVIDER") ?? "claude").toLowerCase();
  return v === "gemini" ? "gemini" : "claude";
}

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "url"; url: string } | { type: "base64"; media_type: string; data: string } };

export interface ClaudeMessage {
  role: "user" | "assistant";
  /** Plain text or an array of content blocks (for multi-modal / vision). */
  content: string | ContentBlock[];
}

export interface CallClaudeOpts {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Optional model override (testing different sizes) */
  model?: string;
}

/**
 * Call Anthropic's Messages API. Throws on non-2xx with response body for
 * easier debugging. Returns concatenated text blocks from the assistant
 * response (handles content-block arrays).
 */
export async function callClaude(opts: CallClaudeOpts): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not configured. Run: supabase secrets set ANTHROPIC_API_KEY=sk-ant-..."
    );
  }

  const body = {
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.4,
    system: opts.system,
    messages: opts.messages,
  };

  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Claude ${res.status}: ${errBody.slice(0, 400)}`);
  }

  const data = await res.json();
  // Anthropic returns { content: [{ type: 'text', text: '...' }, ...] }
  const blocks = (data.content ?? []) as Array<{ type: string; text?: string }>;
  return blocks
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

/**
 * Helper for JSON-mode prompts. Asks Claude to return ONLY valid JSON in
 * the specified shape, then strips common wrappers (```json ... ```) and
 * parses. Throws if parsing fails after one retry.
 */
export async function callClaudeJSON<T>(opts: CallClaudeOpts): Promise<T> {
  const text = await callClaude(opts);
  const cleaned = stripJsonFences(text).trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new Error(
      `Claude JSON parse failed: ${(e as Error).message}\n--- raw output ---\n${text.slice(0, 500)}`
    );
  }
}

function stripJsonFences(s: string): string {
  // Match ```json ... ``` or ``` ... ```
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) return fence[1];
  return s;
}
