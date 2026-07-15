import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CAPTURE_SEQUENCE, SESSIONS } from '@reveal/shared';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';
import { SavingOverlay } from '../../components/ui.js';
import { SessionShell } from './SessionShell.js';
import { MODULE_REGISTRY } from './modules/registry.js';
import { SESSION_TITLES } from './types.js';

export function CaptureFlow(): JSX.Element {
  const instanceId = useAuth((s) => s.instanceId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: state, refetch, isLoading } = useQuery({
    queryKey: ['state', instanceId],
    queryFn: () => api.getState(instanceId!),
    enabled: !!instanceId,
  });

  if (!instanceId) return <Navigate to="/" replace />;

  function errMessage(e: unknown, fallback: string): string {
    if (e instanceof ApiError) return e.issues?.length ? e.issues.join(' · ') : e.message;
    return fallback;
  }

  async function submit(payload: unknown, ms?: number): Promise<void> {
    if (!state?.cursor) return;
    setBusy(true);
    setError(null);
    try {
      await api.submitModule(instanceId!, state.cursor, payload, ms);
      await refetch();
    } catch (e) {
      setError(errMessage(e, "Couldn't save your answer. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function seal(no: number): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await api.sealSession(instanceId!, no);
      await refetch();
    } catch (e) {
      setError(errMessage(e, "Couldn't seal this session. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const activeSession = state?.active_session ?? 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <SavingOverlay show={busy} />
      <CaptureHeader session={activeSession} busy={busy} />
      <div className="flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl">
          {error ? (
            <div className="mb-4 animate-fade-in rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              <b>Couldn’t save.</b> {error}
              <div className="mt-1 text-xs text-rose-500">Your selections are still here — just tap the button again.</div>
            </div>
          ) : null}
        </div>
        {isLoading || !state ? (
          <div className="w-full max-w-xl">
            <div className="skeleton mb-6 h-1.5 w-full rounded-full" />
            <div className="skeleton h-96 rounded-3xl" />
          </div>
        ) : state.status === 'capture_complete' || state.status === 'generated' || state.status === 'released' ? (
          <Navigate to="/dashboard" replace />
        ) : state.cursor ? (
          <ModuleView cursor={state.cursor} busy={busy} onSubmit={submit} />
        ) : state.active_session ? (
          <SealScreen sessionNo={state.active_session} busy={busy} onSeal={() => seal(state.active_session!)} />
        ) : (
          <Navigate to="/dashboard" replace />
        )}
      </div>
    </div>
  );
}

function CaptureHeader({ session, busy }: { session: number; busy: boolean }): JSX.Element {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3.5">
        <span className="text-[13px] font-bold uppercase tracking-[0.28em] text-slate-900">Re<span className="text-accent">veal</span></span>
        <div className="flex items-center gap-3">
          {busy ? <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Saving…</span> : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-slate-500">
            Session {session} of {SESSIONS.length}
          </span>
          <button className="text-[13px] font-medium text-slate-400 hover:text-slate-700" onClick={() => nav('/dashboard')}>Exit</button>
        </div>
      </div>
    </header>
  );
}

function ModuleView({
  cursor,
  busy,
  onSubmit,
}: {
  cursor: string;
  busy: boolean;
  onSubmit: (p: unknown, ms?: number) => void;
}): JSX.Element {
  const meta = MODULE_REGISTRY[cursor];
  if (!meta) return <p className="text-sm text-slate-500">Unknown module: {cursor}</p>;
  const progress = (CAPTURE_SEQUENCE.indexOf(cursor as never) + 1) / CAPTURE_SEQUENCE.length;
  const { Component } = meta;
  return (
    <SessionShell progress={progress} chip={meta.chip} chipTone={meta.tone}>
      <Component onSubmit={onSubmit} busy={busy} />
    </SessionShell>
  );
}

function SealScreen({ sessionNo, busy, onSeal }: { sessionNo: number; busy: boolean; onSeal: () => void }): JSX.Element {
  const last = sessionNo === 3;
  return (
    <SessionShell progress={sessionNo / 3} chip="Sealed · locked" chipTone="sealed">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">{last ? '✦' : '🔒'}</div>
        <div className="font-serif text-2xl text-slate-900">{last ? 'All done — nicely done.' : `Session ${sessionNo} saved.`}</div>
        <div className="max-w-sm text-sm leading-relaxed text-slate-500">
          {last
            ? 'Your responses go to an admin for a quick quality check. Your dashboard will update the moment your Design Signature is ready.'
            : `${SESSION_TITLES[sessionNo]} is locked in. You’ll pick up exactly where you left off, with nothing to redo.`}
        </div>
      </div>
      <button
        onClick={onSeal}
        disabled={busy}
        className="press mt-auto rounded-2xl bg-accent py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-40"
      >
        {last ? 'Submit for review' : 'Seal & continue'}
      </button>
    </SessionShell>
  );
}
