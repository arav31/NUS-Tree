'use client';
import { Handle, Position } from '@xyflow/react';

export default function ModuleNode({ data }) {
  return (
    <div style={{ 
      padding: '12px 16px', 
      border: '2px solid #333', 
      borderRadius: '8px', 
      background: data.color || '#ffffff',
      minWidth: '160px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* Top Handle for incoming prerequisite arrows */}
      <Handle type="target" position={Position.Top} style={{ width: '10px', height: '10px' }} />
      
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>
        {data.courseCode}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#444' }}>
        {data.courseName}
      </div>
      
      {/* Bottom Handle for outgoing arrows */}
      <Handle type="source" position={Position.Bottom} style={{ width: '10px', height: '10px' }} />
    </div>
  );
}