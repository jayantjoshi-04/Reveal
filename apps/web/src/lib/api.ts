/** Typed fetch client. Attaches the JWT and unwraps errors. */
import type { ReportPayloadV2 } from '@reveal/shared/v2';

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
  signup: (body: SignupBody) => request<{ student: { student_id: string; name: string; email: string }; devVerificationCode?: string; emailSent: boolean }>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  verify: (email: string, code: string) => post('/auth/verify', { email, code }),
  resendVerification: (email: string) => request<{ ok: boolean; emailSent: boolean }>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  signin: (identifier: string, password: string) => request<{ token: string; student: { student_id: string; name: string; email: string } }>('/auth/signin', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  adminSignin: (username: string, password: string) => request<{ token: string; admin: { staff_id: string; name: string; email: string } }>('/auth/admin/signin', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // ── student profile ──
  meDashboard: () => request<Dashboard>('/me/dashboard'),
  updateProfile: (patch: { name?: string; institution?: string; domain_of_interest?: string }) =>
    request('/me/profile', { method: 'PATCH', body: JSON.stringify(patch) }),

  // ── V2 survey (the native REVEAL 2.0.0 instrument) ──
  surveyStart: () => request<{ instanceId: string }>('/survey/start', { method: 'POST' }),
  surveyStatus: () => request<{ instance: V2Status | null }>('/survey/status'),
  surveyState: (id: string) => request<SurveyState>(`/survey/${id}`),
  surveySubmit: (id: string, activityId: string, rawPayload: unknown, channel?: 'say' | 'do') =>
    request<{ ok: boolean; next: string | null }>(`/survey/${id}/activity/${activityId}`, { method: 'POST', body: JSON.stringify({ rawPayload, channel }) }),
  surveyComplete: (id: string) => request<{ ok: boolean; instanceId: string }>(`/survey/${id}/complete`, { method: 'POST' }),
  surveyReport: (id: string) => request<ReportPayloadV2>(`/survey/${id}/report`),

  // ── admin ──
  adminOverview: () => request<AdminOverview>('/admin/overview'),
  adminReports: () => request<AdminReportRow[]>('/admin/reports'),
  adminReport: (id: string) => request<{ instance_id: string; payload: ReportPayloadV2 | null }>(`/admin/reports/${id}`),
  adminStudents: () => request<StudentRow[]>('/admin/students'),
  adminCreateStudent: (b: { name: string; email: string; username: string; password: string; domain_of_interest?: string }) =>
    request<{ student: { student_id: string; name: string; email: string } }>('/admin/students', { method: 'POST', body: JSON.stringify(b) }),
  setStudentStatus: (id: string, status: 'active' | 'suspended') => request(`/admin/students/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminChangePassword: (current_password: string, new_password: string) => post('/admin/change-password', { current_password, new_password }),
};

// ── types ──
export interface SignupBody {
  name: string; email: string; username: string; password: string;
  gender?: string; dob?: string; institution?: string; domain_of_interest?: string; cohort?: string;
}
export interface Dashboard {
  profile: { name: string; email: string; username: string | null; domain_of_interest: string | null; institution: string | null };
}
export interface V2Status {
  id: string; status: string; generatedAt: string | null; answered: number; total: number; reportReady: boolean;
}
export interface SurveyOption {
  id: string; step: string; label: string; constructId: string | null; edge: string | null; driver: string | null; axis: string | null; isEscape: boolean;
}
export interface SurveyActivity {
  id: string; code: string; label: string; channel: string; format: string; note: string | null; archetype: string; options: SurveyOption[];
}
export interface SurveyState {
  instanceId: string; status: string;
  blocks: { block: number; title: string; activities: string[] }[];
  activities: SurveyActivity[];
  answered: Record<string, unknown>;
  cursor: string | null;
}
export interface AdminOverview { ruleset: string; students: number; instances: number; reports_generated: number; }
export interface AdminReportRow { instance_id: string; student_name: string; status: string; tier: string; generated_at: string | null; }
export interface StudentRow { student_id: string; name: string; email: string; username: string | null; cohort: string | null; institution: string | null; domain_of_interest: string | null; account_status: string; email_verified: boolean; created_at: string; latest_status: string | null; }
