'use client';
import React, { useCallback } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, addEdge,
  ReactFlowProvider,
  applyNodeChanges, applyEdgeChanges
} from 'reactflow';
import type { Node as RFNode, Edge as RFEdge, Connection as RFConnection, NodeChange, EdgeChange, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '@/store/useGraphStore';
import AiepNode from './nodes/AiepNode';

const nodeTypes = { aiepNode: AiepNode };

export default function Canvas() {
  const { nodes, edges, setNodes, setEdges, selectNode } = useGraphStore();

  // Ensure nodes and edges are valid arrays
  const validNodes = Array.isArray(nodes) ? nodes : [];
  const validEdges = Array.isArray(edges) ? edges : [];

  // Ensure each node has a numeric position to avoid runtime errors in React Flow
  const sanitizeNode = (node: RFNode) => {
    const pos = (node.position as { x?: number; y?: number } | undefined) ?? { x: 0, y: 0 };
    return { ...node, position: { x: pos.x ?? 0, y: pos.y ?? 0 } } as RFNode;
  };

  const sanitizedNodes = validNodes.map((n) => sanitizeNode(n as RFNode));

  console.log('Nodes passed to ReactFlow (controlled):', sanitizedNodes);

  const onConnect = useCallback(
    (params: RFEdge | RFConnection) => {
      setEdges((prev) => addEdge({ ...params }, prev ?? []));
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.fitView();
  }, []);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: RFNode) => {
    selectNode(node.id);
  }, [selectNode]);

  return (
    <div className="h-[calc(100vh-160px)] w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <ReactFlowProvider>
        <ReactFlow
          nodes={sanitizedNodes}
          edges={validEdges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onInit={onInit}
        >
          <Background />
          <MiniMap pannable zoomable />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}