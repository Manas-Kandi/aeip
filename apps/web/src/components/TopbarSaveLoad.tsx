'use client';
import { useGraphStore } from '@/store/useGraphStore';

export default function TopbarSaveLoad() {
  const { nodes, edges, setGraph } = useGraphStore();

  const load = async () => {
    const res = await fetch('/api/graph', { cache: 'no-store' });
    const data = await res.json();
    setGraph(data.nodes ?? [], data.edges ?? []);
  };

  const save = async () => {
    await fetch('/api/graph', {
      method: 'POST',
      body: JSON.stringify({ nodes, edges }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return (
    <div className="mb-3 flex gap-2">
      <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2" onClick={load}>Load</button>
      <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2" onClick={save}>Save</button>
    </div>
  );
}