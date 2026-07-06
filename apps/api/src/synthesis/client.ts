/**
 * Anthropic Messages API client (via fetch — no SDK dependency). Runs at most
 * once per report_instance, at low temperature, behind the facilitator gate.
 */
export interface ClaudeParams {
  apiKey: string;
  model: string;
  temperature: number;
  system: string;
  user: string;
  maxTokens?: number;
}

export async function callClaude(p: ClaudeParams): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': p.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: p.model,
      max_tokens: p.maxTokens ?? 1500,
      temperature: p.temperature,
      system: p.system,
      messages: [{ role: 'user', content: p.user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  return data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('')
    .trim();
}

/** Extract the JSON object from a model response that may be wrapped in prose/fences. */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in model response');
  return JSON.parse(candidate.slice(start, end + 1));
}
