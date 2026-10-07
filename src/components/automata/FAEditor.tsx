import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  Connection, Edge, Node, ReactFlowInstance,
  MarkerType, BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { FAState, FATransition } from '../../types';
import StateNode from './StateNode';

const nodeTypes = { stateNode: StateNode };

interface FAEditorProps {
  states: FAState[];
  transitions: FATransition[];
  activeStateIds?: string[];
  activeTransitionId?: string | null;
  onStatesChange: (states: FAState[]) => void;
  onTransitionsChange: (transitions: FATransition[]) => void;
  mode: 'edit' | 'simulate';
}

let stateCounter = 1;
let transCounter = 1;

export default function FAEditor({
  states, transitions, activeStateIds = [], activeTransitionId,
  onStatesChange, onTransitionsChange, mode,
}: FAEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Convert to ReactFlow nodes/edges
  const nodes: Node[] = states.map(s => ({
    id: s.id,
    type: 'stateNode',
    position: { x: s.x, y: s.y },
    data: {
      label: s.label,
      isInitial: s.isInitial,
      isFinal: s.isFinal,
      isActive: activeStateIds.includes(s.id),
      onLabelChange: (label: string) => {
        onStatesChange(states.map(st => st.id === s.id ? { ...st, label } : st));
      },
      onToggleInitial: () => {
        onStatesChange(states.map(st => ({
          ...st,
          isInitial: st.id === s.id ? !st.isInitial : false, // only one initial
        })));
      },
      onToggleFinal: () => {
        onStatesChange(states.map(st => st.id === s.id ? { ...st, isFinal: !st.isFinal } : st));
      },
      onDelete: () => {
        onStatesChange(states.filter(st => st.id !== s.id));
        onTransitionsChange(transitions.filter(t => t.from !== s.id && t.to !== s.id));
      },
    },
    draggable: mode === 'edit',
  }));

  const edges: Edge[] = transitions.map(t => ({
    id: t.id,
    source: t.from,
    target: t.to,
    label: t.symbol,
    labelStyle: { fill: '#93c5fd', fontWeight: 600, fontSize: 13 },
    labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
    style: {
      stroke: t.id === activeTransitionId ? '#60a5fa' : '#4b5563',
      strokeWidth: t.id === activeTransitionId ? 3 : 2,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: t.id === activeTransitionId ? '#60a5fa' : '#4b5563' },
    animated: t.id === activeTransitionId,
    type: t.from === t.to ? 'selfConnecting' : 'default',
  }));

  const onConnect = useCallback((connection: Connection) => {
    const symbol = prompt('Transition symbol (use ε for epsilon, comma-separate multiple):') ?? '';
    if (!symbol.trim()) return;
    const newTrans: FATransition = {
      id: `t${transCounter++}`,
      from: connection.source!,
      to: connection.target!,
      symbol: symbol.trim(),
    };
    onTransitionsChange([...transitions, newTrans]);
  }, [transitions, onTransitionsChange]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    onStatesChange(states.map(s => s.id === node.id ? { ...s, x: node.position.x, y: node.position.y } : s));
  }, [states, onStatesChange]);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (mode !== 'edit') return;
    const wrapper = reactFlowWrapper.current;
    if (!wrapper || !rfInstance) return;
    const bounds = wrapper.getBoundingClientRect();
    const pos = rfInstance.project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    const id = `q${stateCounter++}`;
    onStatesChange([...states, { id, label: id, isInitial: states.length === 0, isFinal: false, x: pos.x, y: pos.y }]);
  }, [mode, states, onStatesChange, rfInstance]);

  const onEdgeDoubleClick = useCallback((_: any, edge: Edge) => {
    if (mode !== 'edit') return;
    const symbol = prompt('Edit transition symbol:', edge.label as string) ?? '';
    if (!symbol.trim()) {
      onTransitionsChange(transitions.filter(t => t.id !== edge.id));
    } else {
      onTransitionsChange(transitions.map(t => t.id === edge.id ? { ...t, symbol } : t));
    }
  }, [mode, transitions, onTransitionsChange]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onInit={setRfInstance}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-gray-950"
        connectOnClick={false}
      >
        <Background variant={BackgroundVariant.Dots} color="#374151" gap={20} />
        <Controls className="!bg-gray-800 !border-gray-700" />
        <MiniMap className="!bg-gray-900" nodeColor={() => '#3b82f6'} maskColor="rgba(0,0,0,0.5)" />
      </ReactFlow>
    </div>
  );
}
