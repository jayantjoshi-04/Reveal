/** Client for the /api/v2 deterministic-engine surface. */
import type { ReportPayloadV2 } from '@reveal/shared/v2';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...opts,
      headers: { 'content-type': 'application/json', ...(opts.headers ?? {}) },
    });
  } catch {
    throw new Error(`Can't reach the API at ${BASE}. Is it running?`);
  }
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const b = await res.json();
      msg = b.error ?? b.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export interface V2Catalog {
  ruleset: string;
  activities: { id: string; code: string; label: string; channel: string; format: string; phase: number; note: string | null }[];
  constructs: { id: string; family: string; name: string; type: string }[];
  counts: { constructs: number; roles: number; domains: number; molecules: number; growth: number };
}

export interface V2Signal {
  constructId: string;
  channel: 'say' | 'do';
  value: number;
  edge?: string;
  position?: number;
  driver?: string;
  valence?: 'approach' | 'avoidance';
}
export interface V2Response {
  activityId: string;
  channel: 'say' | 'do';
  rawPayload: { signals?: V2Signal[]; selected_option_ids?: string[] };
}

export const v2 = {
  catalog: () => req<V2Catalog>('/v2/catalog'),
  createInstance: (b: { name: string; enrolledField?: string; track?: 'physical' | 'digital'; tier?: 'free' | 'paid' }) =>
    req<{ instanceId: string; studentId: string }>('/v2/instances', { method: 'POST', body: JSON.stringify(b) }),
  submitResponses: (id: string, body: { responses: V2Response[]; portfolio?: unknown[]; experience?: unknown[]; factual?: Record<string, unknown> }) =>
    req<{ ok: boolean; added: number }>(`/v2/instances/${id}/responses`, { method: 'POST', body: JSON.stringify(body) }),
  loadSample: (id: string) => req<{ ok: boolean }>(`/v2/instances/${id}/sample`, { method: 'POST' }),
  generate: (id: string) => req<ReportPayloadV2>(`/v2/instances/${id}/generate`, { method: 'POST' }),
  report: (id: string) => req<ReportPayloadV2>(`/v2/instances/${id}/report`),
};
