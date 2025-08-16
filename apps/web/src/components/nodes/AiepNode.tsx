'use client';
import { Handle, Position, NodeProps } from 'reactflow';

export default function AiepNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-2 text-sm shadow-sm backdrop-blur
        ${selected ? 'border-white/40 bg-white/15' : 'border-white/10 bg-white/10'}`}
      style={{ minWidth: 140 }}
    >
      <div className="font-medium">{data?.label ?? 'Node'}</div>

      {/* Single input/output dots with enlarged hover area */}
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-white/80 hover:!h-4 hover:!w-4 transition-all"
      />
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-white/80 hover:!h-4 hover:!w-4 transition-all"
      />
    </div>
  );
}