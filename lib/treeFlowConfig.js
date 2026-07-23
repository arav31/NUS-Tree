import { MarkerType } from '@xyflow/react';
import ModuleNode from '../components/ModuleNode';
import NoteNode from '../components/NoteNode';

export const nodeTypes = {
  module: ModuleNode,
  note: NoteNode
};

export const initialNodes = [];
export const initialEdges = [];

export const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#888' },
  type: 'default', // 'default' (bezier), 'step' (sharp corners), or 'smoothstep'
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#888',
  },
};

export const edgeStyle = (requirement, stroke = '#888', strokeWidth = 2) => ({
  stroke, strokeWidth,
});
