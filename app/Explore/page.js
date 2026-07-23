'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templates } from '../../lib/templates';
import { loadTreeFromStorage, saveTreeToStorage } from '../../lib/treeStorage';
import TemplatePreviewModal from '../../components/Explore/TemplatePreviewModal';

export default function ExplorePage() {
  const router = useRouter();
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => setCustomTemplates(data.templates || []))
      .catch(() => {});
  }, []);

  const allTemplates = [...templates, ...customTemplates];

  const handleLoadTemplate = (template) => {
    const existing = loadTreeFromStorage();
    const hasExistingWork = existing && existing.nodes.length > 0;
    if (hasExistingWork && !window.confirm('Loading this template will replace your current tree. Continue?')) {
      return;
    }
    saveTreeToStorage(template.nodes, template.edges);
    router.push('/Tree');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Explore Study Plans</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Select a template to view or load it into your planner.</p>

      <div className="template-grid">
        {allTemplates.map((template) => (
          <div key={template.id} className="template-card">
            <h3>{template.title}</h3>
            <p>{template.description}</p>

            <div className="template-tags">
              {template.tags.map((tag) => (
                <span key={tag} className="template-tag">{tag}</span>
              ))}
            </div>

            <div className="template-card-actions">
              <button className="btn" onClick={() => setPreviewTemplate(template)}>
                View Template
              </button>
              <button className="btn btn-primary" onClick={() => handleLoadTemplate(template)}>
                Load into My Tree
              </button>
            </div>
          </div>
        ))}
      </div>

      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onLoad={handleLoadTemplate}
      />
    </div>
  );
}
