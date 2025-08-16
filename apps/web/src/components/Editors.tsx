'use client';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

type Tab = { label: string; path: string };
const tabs: Tab[] = [
  { label: 'contracts/send_email.yml', path: 'examples/contracts/send_email.yml' },
  { label: 'invariants.yml', path: 'examples/invariants.yml' },
  { label: 'scenarios.yml', path: 'examples/scenarios.yml' },
];

export default function Editors() {
  const [active, setActive] = useState<Tab>(tabs[0]);
  const [text, setText] = useState<string>('');

  useEffect(() => {
    fetch(`/api/file?path=${encodeURIComponent(active.path)}`, { cache: 'no-store' })
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText(''));
  }, [active]);

  const save = async () => {
    await fetch('/api/file', { method: 'POST', body: JSON.stringify({ path: active.path, text }), headers: { 'Content-Type': 'application/json' } });
  };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.path}
            className={`rounded-xl border px-3 py-2 ${t.path === active.path ? 'border-white/40 bg-white/15' : 'border-white/10 bg-white/10'}`}
            onClick={() => setActive(t)}
          >
            {t.label}
          </button>
        ))}
        <button onClick={save} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">Save</button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <Editor height="70vh" defaultLanguage="yaml" value={text} onChange={(v) => setText(v ?? '')} />
      </div>
    </div>
  );
}