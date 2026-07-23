'use client';
import { useEffect } from 'react';
import { edgeStyle } from '../lib/treeFlowConfig';

export function useEdgeHighlighting(selectedNode, setEdges) {
  useEffect(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {

        if (!selectedNode) {
          return {
            ...edge,
            animated: false,
            style: edgeStyle(edge.data?.requirement)
          };
        }

        if (edge.target === selectedNode.id) {
          return {
            ...edge,
            animated: true,
            style: edgeStyle(edge.data?.requirement, '#ef4444', 3) // Bold Red
          };
        }

        // 3. OUTGOING ARROWS: What this course UNLOCKS
        if (edge.source === selectedNode.id) {
          return {
            ...edge,
            animated: true,
            style: edgeStyle(edge.data?.requirement, '#22c55e', 3) // Bold Green
          };
        }

        // 4. UNRELATED ARROWS: Fade these out so the active path pops!
        return {
          ...edge,
          animated: false,
          style: edgeStyle(edge.data?.requirement, '#e5e7eb', 1) // Faint Gray
        };
      })
    );
  }, [selectedNode, setEdges]);
}
