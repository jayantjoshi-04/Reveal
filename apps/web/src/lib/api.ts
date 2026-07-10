/** Typed fetch client. Attaches the JWT and unwraps errors. */
import type { InstanceState } from '@reveal/shared';

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
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...opts,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(opts.headers ?? {}),
      },
    });
  } catch {
    // fetch rejects on network failure / CORS / server down — before any HTTP status
    throw new ApiError(0, `Can't reach the server at ${BASE}. Is the API running?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    let issues: string[] | undefined;
    try {
      const body = await res.json();
      detail = body.error ?? body.message ?? detail;
      if (Array.isArray(body.issues)) issues = body.issues.map((i: unknown) => (typeof i === 'string' ? i : JSON.stringify(i)));
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail, issues);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: string[],
  ) {
    super(message);
  }
}

const post = (path: string, body?: unknown) =>
  request(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });

export const api = {
  // ── auth ──
  signup: (body: SignupBody) => request<{ student: { student_id: string; name: string; email: string }; devVerificationCode?: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  verify: (email: string, code: string) => post('/auth/verify', { email, code }),
  signin: (identifier: string, password: string) => request<{ token: string; student: { student_id: string; name: string; email: string } }>('/auth/signin', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  adminSignin: (username: string, password: string) => request<{ token: string; admin: { staff_id: string; name: string; email: string } }>('/auth/admin/signin', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // ── student ──
  meDashboard: () => request<Dashboard>('/me/dashboard'),
  startInstance: () => request<InstanceState>('/instances', { method: 'POST' }),
  getState: (id: string) => request<InstanceState>(`/instances/${id}/state`),
  submitModule: (id: string, code: string, payload: unknown, responseMs?: number) =>
    request<{ cursor: string | null }>(`/instances/${id}/modules/${code}`, { method: 'POST', body: JSON.stringify({ payload, response_ms: responseMs }) }),
  sealSession: (id: string, no: number) =>
    request<{ sealed: boolean; instanceComplete: boolean }>(`/instances/${id}/sessions/${no}/seal`, { method: 'POST' }),
  content: <T = unknown>(kind: 'a-items' | 'b-tasks' | 'artifacts' | 'scenes') => request<T>(`/content/${kind}`),
  report: (id: string) => request<ReportView>(`/report/${id}`),

  // ── admin ──
  adminOverview: () => request<AdminOverview>('/admin/overview'),
  adminQuestions: () => request<AItem[]>('/admin/questions'),
  createQuestion: (b: { module_code: string; prompt: string; seq: number; is_non_design?: boolean }) => post('/admin/questions', b),
  updateQuestion: (itemId: string, b: { prompt?: string; seq?: number; is_non_design?: boolean }) => request(`/admin/questions/${itemId}`, { method: 'PATCH', body: JSON.stringify(b) }),
  deleteQuestion: (itemId: string) => request(`/admin/questions/${itemId}`, { method: 'DELETE' }),
  addOption: (itemId: string, label: string, tag: string) => post(`/admin/questions/${itemId}/options`, { label, tag }),
  updateOption: (optionId: string, b: { label?: string; tag?: string }) => request(`/admin/options/${optionId}`, { method: 'PATCH', body: JSON.stringify(b) }),
  deleteOption: (optionId: string) => request(`/admin/options/${optionId}`, { method: 'DELETE' }),
  adminReports: () => request<AdminReport[]>('/admin/reports'),
  adminReport: (id: string) => request<ReviewDetail>(`/admin/reports/${id}`),
  approveReport: (id: string) => post(`/admin/reports/${id}/approve`) as Promise<{ generated: boolean; model: string }>,
  rejectReport: (id: string, reason?: string) => post(`/admin/reports/${id}/reject`, { reason }),
  adminStudents: () => request<StudentRow[]>('/admin/students'),
  setStudentStatus: (id: string, status: 'active' | 'suspended') => request(`/admin/students/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export interface SignupBody {
  name: string; email: string; username: string; password: string;
  gender?: string; dob?: string; institution?: string; domain_of_interest?: string; cohort?: string;
}
export interface Dashboard {
  profile: { name: string; email: string; username: string | null; domain_of_interest: string | null; institution: string | null };
  instance: { instance_id: string; status: string; started_at: string; completed_at: string | null; generated_at: string | null } | null;
  report_ready: boolean;
}
export interface AdminOverview { version_id: string; a_items: number; b_tasks: number; artifacts: number; students: number; to_review: number; released: number; }
export interface AItem { item_id: string; module_code: string; seq: number; prompt: string; is_non_design: boolean; options: { option_id: string; label: string; tag: string }[]; }
export interface AdminReport { instance_id: string; student_id: string; student_name: string; cohort: string | null; status: string; completed_at: string | null; decision: string | null; surprise_count: number; coherence_flag: boolean; }
export interface StudentRow { student_id: string; name: string; email: string; username: string | null; cohort: string | null; institution: string | null; domain_of_interest: string | null; account_status: string; email_verified: boolean; created_at: string; latest_status: string | null; }

export interface ReviewDetail {
  instance_id: string;
  status: string;
  findings: import('@reveal/shared').Findings | null;
  high_stakes: import('@reveal/shared').HighStakesSummary | null;
  facilitator_note: string | null;
  decision: string;
  slots: import('@reveal/shared').ReportSlots | null;
}

export interface ReportView {
  instance_id: string;
  generated_at: string;
  slots: import('@reveal/shared').ReportSlots;
  findings: import('@reveal/shared').Findings;
  trait_scores: import('@reveal/shared').TraitScore[];
}
