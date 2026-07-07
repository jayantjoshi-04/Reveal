import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CAPTURE_SEQUENCE } from '@reveal/shared';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../store/auth.js';
import { TopBar } from '../../components/TopBar.js';
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

  async function submit(payload: unknown, ms?: number): Promise<void> {
    if (!state?.cursor) return;
    setBusy(true);
    setError(null);
    try {
      await api.submitModule(instanceId!, state.cursor, payload, ms);
      await refetch();
    } catch (e) {
      // Never fail silently — a swallowed error looks like a frozen page.
      setError(e instanceof ApiError ? e.message : "Couldn't save your answer. Please try again.");
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
      setError(e instanceof ApiError ? e.message : "Couldn't seal this session. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar doc="Capture" />
      <div className="flex flex-col items-center px-4 py-10">
        {error ? (
          <div className="mb-4 w-full max-w-[360px] rounded-lg border border-mag bg-[#fbe6f1] px-4 py-3 text-[12px] text-mag">
            <b>Couldn’t save.</b> {error}
            <div className="mt-1 text-[11px] text-[#8a4a68]">Your selections are still here — just tap the button again.</div>
          </div>
        ) : null}
        {busy ? <div className="mb-3 font-mono text-[10px] uppercase tracking-wide text-mid">Saving…</div> : null}
        {isLoading || !state ? (
          <p className="text-sm text-mid">Loading…</p>
        ) : state.status === 'capture_complete' || state.status === 'generated' || state.status === 'released' ? (
          <Complete />
        ) : state.cursor ? (
          <ModuleView cursor={state.cursor} busy={busy} onSubmit={submit} />
        ) : state.active_session ? (
          <SealScreen sessionNo={state.active_session} busy={busy} onSeal={() => seal(state.active_session!)} />
        ) : (
          <Complete />
        )}
      </div>
    </div>
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
  if (!meta) return <p className="text-sm text-mid">Unknown module: {cursor}</p>;
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
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <div className="text-3xl">{last ? '📨' : '🔒'}</div>
        <div className="text-sm font-semibold">
          {last ? 'All done — nicely done.' : `Session ${sessionNo} saved.`}
        </div>
        <div className="text-[11px] leading-relaxed text-mid">
          {last
            ? 'Your responses go to a facilitator for a quick quality check. You’ll get a note when your Design Signature is ready.'
            : `${SESSION_TITLES[sessionNo]} is locked in. You’ll pick up exactly where you left off, with nothing to redo.`}
        </div>
      </div>
      <button
        onClick={onSeal}
        disabled={busy}
        className="mt-auto rounded-lg bg-orange py-2.5 text-center text-[13px] font-semibold text-white disabled:opacity-40"
      >
        {last ? 'Submit for review' : 'Seal & continue'}
      </button>
    </SessionShell>
  );
}

function Complete(): JSX.Element {
  return (
    <SessionShell progress={1} chip="Complete" chipTone="sealed">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <div className="text-3xl">📨</div>
        <div className="font-serif text-lg">You’re all set.</div>
        <div className="text-[11px] leading-relaxed text-mid">
          Your capture is complete and with a facilitator for review. Your Design Signature will be released once
          approved.
        </div>
      </div>
    </SessionShell>
  );
}
