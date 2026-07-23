'use client';
import { ReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '../../lib/treeFlowConfig';

export default function TemplatePreviewModal({ template, onClose, onLoad }) {
  if (!template) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="template-modal-close" onClick={onClose} aria-label="Close preview">
          &times;
        </button>

        <h2>{template.title}</h2>
        <p className="template-modal-description">{template.description}</p>
        <div className="template-modal-tags">
          {template.tags.map((tag) => (
            <span key={tag} className="template-tag">{tag}</span>
          ))}
        </div>

        <div className="template-preview-canvas">
          <ReactFlow
            nodes={template.nodes}
            edges={template.edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            onInit={(instance) => {
              // Nodes are measured asynchronously after mount, so the initial
              // fitView can clip long labels - refit once measurement settles.
              setTimeout(() => instance.fitView({ padding: 0.2 }), 100);
            }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#ccc" gap={16} />
          </ReactFlow>
        </div>

        <div className="template-modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => onLoad(template)}>Load into My Tree</button>
        </div>
      </div>
    </div>
  );
}
