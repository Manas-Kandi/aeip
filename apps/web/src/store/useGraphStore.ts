'use client';
import { create } from 'zustand';
import type { Edge, Node } from 'reactflow';

type GraphState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId?: string;
  setGraph: (n: Node[], e: Edge[]) => void;
  setNodes: (fn: (n: Node[]) => Node[]) => void;
  setEdges: (fn: (e: Edge[]) => Edge[]) => void;
  selectNode: (id?: string) => void;
};

const ensureNodePosition = (node: Node): Node => {
  if (!node.position) {
    return { ...node, position: { x: 0, y: 0 } };
  }
  if (typeof node.position.x === 'undefined' || typeof node.position.y === 'undefined') {
    return { ...node, position: { x: node.position.x ?? 0, y: node.position.y ?? 0 } };
  }
  return node;
};

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [
    { id: 'planner', position: { x: 160, y: 120 }, data: { label: 'Planner' }, type: 'aiepNode' },
    { id: 'sendEmail', position: { x: 460, y: 120 }, data: { label: 'SendEmail' }, type: 'aiepNode' },
  ].map(ensureNodePosition),

  edges: [{ id: 'e1', source: 'planner', target: 'sendEmail', type: 'smoothstep' }],

  setGraph: (nodes, edges) => set({ nodes: nodes.map(ensureNodePosition), edges }),
  setNodes: (fn) => set((s) => ({ nodes: fn(s.nodes).map(ensureNodePosition) })),
  setEdges: (fn) => set((s) => ({ edges: fn(s.edges) })),
  selectNode: (id) => set({ selectedNodeId: id }),
}));