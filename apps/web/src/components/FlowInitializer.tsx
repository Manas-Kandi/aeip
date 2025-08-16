'use client';

import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '@/store/useGraphStore';

export default function FlowInitializer() {
  const { nodes, edges } = useGraphStore();
  const { setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  return null;
}