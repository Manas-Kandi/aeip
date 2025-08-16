'use client';
import { useGraphStore } from '@/store/useGraphStore';
import { nanoid } from 'nanoid';

export default function Sidebar() {
  const { setNodes } = useGraphStore();
  const addNode = (label: string) =>
    setNodes((nodes) => nodes.concat({
      id: nanoid(6),
      position: { x: 120, y: 80 + nodes.length * 60 },
      data: { label },
      type: 'aiepNode',
    }));
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold opacity-80">Palette</h3>
      <div className="grid gap-2">
        <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2" onClick={() => addNode('Action')}>
          + Action
        </button>
        <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2" onClick={() => addNode('Decision')}>
          + Decision
        </button>
      </div>
    </div>
  );
}