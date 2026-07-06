/** Typed fetch client. Attaches the JWT and unwraps errors. */
import type { InstanceState, QueueItem } from '@reveal/shared';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

let token: string | null = localStorage.getItem('reveal_token');
export function setToken(t: string | null): void {
  token = t;
  if (t) localStorage.setItem('reveal_token', t);
  else localStorage.removeItem('reveal_token');
}
export function getToken(): string | null {
  return token;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.error ?? body.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const api = {
  // auth
  signInStudent: (body: { name: string; email: string; cohort?: string }) =>
    request<{ token: string; student: unknown }>('/auth/student', { method: 'POST', body: JSON.stringify(body) }),
  signInStaff: (email: string) =>
    request<{ token: string; staff: { role: string; name: string } }>('/auth/staff', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // capture
  startInstance: () => request<InstanceState>('/instances', { method: 'POST' }),
  getState: (id: string) => request<InstanceState>(`/instances/${id}/state`),
  submitModule: (id: string, code: string, payload: unknown, responseMs?: number) =>
    request<{ cursor: string | null }>(`/instances/${id}/modules/${code}`, {
      method: 'POST',
      body: JSON.stringify({ payload, response_ms: responseMs }),
    }),
  sealSession: (id: string, no: number) =>
    request<{ sealed: boolean; instanceComplete: boolean }>(`/instances/${id}/sessions/${no}/seal`, {
      method: 'POST',
    }),

  // content
  content: <T = unknown>(kind: 'a-items' | 'b-tasks' | 'artifacts' | 'scenes') => request<T>(`/content/${kind}`),

  // facilitator
  queue: (status: 'to_review' | 'approved') => request<QueueItem[]>(`/facilitator/queue?status=${status}`),
  review: (id: string) => request<ReviewDetail>(`/facilitator/reviews/${id}`),
  approve: (id: string) =>
    request<{ generated: boolean; model: string; released: boolean }>(`/facilitator/reviews/${id}/approve`, {
      method: 'POST',
    }),
  saveNote: (id: string, note: string) =>
    request(`/facilitator/reviews/${id}/note`, { method: 'POST', body: JSON.stringify({ note }) }),

  // report
  report: (id: string) => request<ReportView>(`/report/${id}`),
};

export interface ReviewDetail {
  instance_id: string;
  status: string;
  findings: import('@reveal/shared').Findings;
  high_stakes: import('@reveal/shared').HighStakesSummary | null;
  facilitator_note: string | null;
  decision: string;
}

export interface ReportView {
  instance_id: string;
  generated_at: string;
  slots: import('@reveal/shared').ReportSlots;
  findings: import('@reveal/shared').Findings;
  trait_scores: import('@reveal/shared').TraitScore[];
}
