'use client';
import { Handle, Position } from '@xyflow/react';

export default function NoteNode({ data }) {
  return (
    <div style={{ 
      padding: '12px', 
      background: '#fef5c1', // Sticky note yellow
      border: '1px solid #e6db9c',
      borderRadius: '4px', 
      minWidth: '140px',
      minHeight: '100px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      fontFamily: 'inherit',
      fontSize: '0.9rem',
      color: '#333',
      whiteSpace: 'pre-wrap' // Preserves line breaks in the note text
    }}>
      {/* in case users want to connect notes to modules */}
      <Handle type="target" position={Position.Top} style={{ background: '#ccc', opacity: 0.5 }} />
      
      <div style={{ wordBreak: 'break-word' }}>
        {data.text || "Click to add text below..."}
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#ccc', opacity: 0.5 }} />
    </div>
  );
}