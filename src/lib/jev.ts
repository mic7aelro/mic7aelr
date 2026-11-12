/**
 * Client for Jev, the System One model from TypeSafe AI.
 *
 * Jev does not write text. It reads a state and answers typed questions. This client sends one
 * request for each decision point and returns the answers in the shape that the solver reads.
 * Use this file on the server only. The API key must never reach the browser.
 */

import type { Answer, Decider, DecisionRequest } from './cfop-solve';

const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const MODEL = 'jev-latest';
const DEFAULT_TIMEOUT_MS = 30_000;

interface RawAnswer {
  type?: string;
  choice?: string;
  probabilities?: Record<string, number> | number[];
  confidence?: number;
  score?: number;
  noul?: number;
}

/**
 * Read one answer. The API documentation shows a `type` field in some places and leaves it out
 * in others, so the parser looks at the fields that are present.
 */
function toAnswer(raw: RawAnswer): Answer | null {
  const probabilities = raw.probabilities;
  if (typeof raw.choice === 'string' && probabilities && !Array.isArray(probabilities)) {
    return { type: 'choice', choice: raw.choice, probabilities, confidence: raw.confidence ?? 0 };
  }
  if (typeof raw.score === 'number') {
    return { type: 'score', score: raw.score, confidence: raw.confidence ?? 0 };
  }
  if (typeof raw.noul === 'number') return { type: 'noul', noul: raw.noul };
  return null;
}

const RETRIES = 3;
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export interface JevOptions {
  /** Called after each successful request with the token counts that Jev reports. */
  onUsage?: (usage: { inputTokens: number; outputTokens: number }) => void;
  timeoutMs?: number;
}

export function createJevDecider(apiKey: string, options: JevOptions = {}): Decider {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return async (request: DecisionRequest) => {
    let response: Response | undefined;
    for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, state: request.state, questions: request.questions }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      // Retry a rate limit or a server error. Wait longer each time.
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === RETRIES) break;
      await wait(300 * 2 ** attempt + Math.random() * 200);
    }
    if (!response || !response.ok) {
      throw new Error(`Jev returned status ${response?.status ?? 'unknown'} at the ${request.stage} step.`);
    }
    const body = (await response.json()) as {
      answers?: Record<string, RawAnswer>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    options.onUsage?.({ inputTokens: body.usage?.input_tokens ?? 0, outputTokens: body.usage?.output_tokens ?? 0 });
    if (!body.answers) return null;
    const answers: Record<string, Answer> = {};
    for (const [key, raw] of Object.entries(body.answers)) {
      const answer = toAnswer(raw);
      if (answer) answers[key] = answer;
    }
    return answers;
  };
}
