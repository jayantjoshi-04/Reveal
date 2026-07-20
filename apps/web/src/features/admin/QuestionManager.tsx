import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type AItem } from '../../lib/api.js';
import { Card, Button, Input, Select, Skeleton, Badge } from '../../components/ui.js';
import { AdminPageHeader } from './AdminLayout.js';

const A_MODULES = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

export function QuestionManager(): JSX.Element {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-questions'] });
  const { data: items, isLoading } = useQuery({ queryKey: ['admin-questions'], queryFn: () => api.adminQuestions() });
  const [adding, setAdding] = useState(false);

  const create = useMutation({
    mutationFn: (b: { module_code: string; prompt: string; seq: number }) => api.createQuestion(b),
    onSuccess: () => { setAdding(false); invalidate(); },
  });

  const byModule = new Map<string, AItem[]>();
  for (const it of items ?? []) {
    const list = byModule.get(it.module_code) ?? [];
    list.push(it);
    byModule.set(it.module_code, list);
  }

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Questionnaire"
        sub="Every Channel-A question, with full add / edit / delete."
        action={<Button onClick={() => setAdding((v) => !v)}>{adding ? 'Cancel' : '+ New question'}</Button>}
      />

      {adding ? <NewQuestion onCreate={(b) => create.mutate(b)} busy={create.isPending} /> : null}

      {isLoading ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        [...byModule.entries()].map(([mod, list]) => (
          <section key={mod} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-sm font-medium uppercase text-accent">{mod}</span>
              <span className="text-xs text-slate-400">{list.length} question{list.length === 1 ? '' : 's'}</span>
            </div>
            <div className="space-y-4">
              {list.map((it) => <QuestionCard key={it.item_id} item={it} onChange={invalidate} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function NewQuestion({ onCreate, busy }: { onCreate: (b: { module_code: string; prompt: string; seq: number }) => void; busy: boolean }): JSX.Element {
  const [module_code, setMod] = useState('a1');
  const [prompt, setPrompt] = useState('');
  const [seq, setSeq] = useState(1);
  return (
    <Card className="mb-6 p-5">
      <div className="grid gap-3 sm:grid-cols-[120px_1fr_90px]">
        <Select value={module_code} onChange={(e) => setMod(e.target.value)}>{A_MODULES.map((m) => <option key={m}>{m}</option>)}</Select>
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question prompt…" />
        <Input type="number" value={seq} onChange={(e) => setSeq(Number(e.target.value))} placeholder="seq" />
      </div>
      <div className="mt-3 flex justify-end">
        <Button loading={busy} disabled={!prompt.trim()} onClick={() => onCreate({ module_code, prompt, seq })}>Create question</Button>
      </div>
    </Card>
  );
}

function QuestionCard({ item, onChange }: { item: AItem; onChange: () => void }): JSX.Element {
  const [prompt, setPrompt] = useState(item.prompt);
  const dirty = prompt !== item.prompt;
  const save = useMutation({ mutationFn: () => api.updateQuestion(item.item_id, { prompt }), onSuccess: onChange });
  const del = useMutation({ mutationFn: () => api.deleteQuestion(item.item_id), onSuccess: onChange });
  const addOpt = useMutation({ mutationFn: (b: { label: string; tag: string }) => api.addOption(item.item_id, b.label, b.tag), onSuccess: onChange });
  const [nl, setNl] = useState('');
  const [nt, setNt] = useState('');

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">#{item.seq}</span>
          {item.is_non_design ? <Badge tone="amber">non-design</Badge> : null}
        </div>
        <button className="text-xs font-medium text-rose-500 hover:text-rose-700" onClick={() => del.mutate()}>Delete</button>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        className="mt-2 w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
      />
      {dirty ? (
        <div className="mt-2 flex justify-end gap-2">
          <button className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => setPrompt(item.prompt)}>Reset</button>
          <Button variant="subtle" className="px-3 py-1.5 text-xs" loading={save.isPending} onClick={() => save.mutate()}>Save prompt</Button>
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-100 dark:border-white/10 pt-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">Options → tag</div>
        <div className="space-y-2">
          {item.options.map((o) => <OptionRow key={o.option_id} option={o} onChange={onChange} />)}
        </div>
        <div className="mt-2 flex gap-2">
          <Input value={nl} onChange={(e) => setNl(e.target.value)} placeholder="Option label" className="flex-1" />
          <Input value={nt} onChange={(e) => setNt(e.target.value)} placeholder="tag" className="w-28" />
          <Button variant="ghost" className="px-3 py-2 text-xs" disabled={!nl || !nt} loading={addOpt.isPending} onClick={() => addOpt.mutate({ label: nl, tag: nt }, { onSuccess: () => { setNl(''); setNt(''); } })}>Add</Button>
        </div>
      </div>
    </Card>
  );
}

function OptionRow({ option, onChange }: { option: { option_id: string; label: string; tag: string }; onChange: () => void }): JSX.Element {
  const [label, setLabel] = useState(option.label);
  const [tag, setTag] = useState(option.tag);
  const dirty = label !== option.label || tag !== option.tag;
  const save = useMutation({ mutationFn: () => api.updateOption(option.option_id, { label, tag }), onSuccess: onChange });
  const del = useMutation({ mutationFn: () => api.deleteOption(option.option_id), onSuccess: onChange });
  return (
    <div className="flex items-center gap-2">
      <Input value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1 py-1.5 text-[13px]" />
      <Input value={tag} onChange={(e) => setTag(e.target.value)} className="w-28 py-1.5 text-[13px]" />
      {dirty ? <button className="text-xs font-medium text-accent" onClick={() => save.mutate()}>{save.isPending ? '…' : 'Save'}</button> : null}
      <button className="text-slate-300 hover:text-rose-500" onClick={() => del.mutate()} title="Delete option">✕</button>
    </div>
  );
}
