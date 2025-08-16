'use client';
import { useGraphStore } from '@/store/useGraphStore';
import { useMemo } from 'react';

export default function Properties() {
  const { nodes, selectedNodeId, setNodes } = useGraphStore();
  const n = useMemo(() => nodes.find((x) => x.id === selectedNodeId), [nodes, selectedNodeId]);
  if (!n) return <div className="text-sm opacity-60">Select a node to edit.</div>;

  return (
    <div className="space-y-3 text-sm">
      <div className="opacity-70">Node ID: {n.id}</div>
      <label className="block space-y-1">
        <span className="opacity-70">Label</span>
        <input
          className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-1"
          value={n.data?.label ?? ''}
          onChange={(e) =>
            setNodes((all) =>
              all.map((x) => (x.id === n.id ? { ...x, data: { ...x.data, label: e.target.value } } : x))
            )
          }
        />
      </label>
    </div>
  );
}