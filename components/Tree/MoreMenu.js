'use client';
import { useEffect, useRef, useState } from 'react';

export default function MoreMenu({ onOpenAddModule, onOpenStudyPlan, onExport, onImport, onClear }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    // Capture phase: ReactFlow's pane click handler calls stopPropagation,
    // which would otherwise stop this from ever seeing clicks on the canvas.
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [open]);

  const runAndClose = (fn) => () => {
    fn();
    setOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) onImport(file);
    event.target.value = '';
    setOpen(false);
  };

  return (
    <div className="tree-more-menu" ref={menuRef}>
      <button onClick={() => setOpen((o) => !o)} className="tree-btn tree-btn-dark">
        ⋯ More
      </button>
      {open && (
        <div className="tree-more-dropdown">
          <button onClick={runAndClose(onOpenAddModule)} className="tree-more-item">
            + Add Module Manually
          </button>
          <button onClick={runAndClose(onOpenStudyPlan)} className="tree-more-item">
            View Study Plan
          </button>
          <button onClick={runAndClose(onExport)} className="tree-more-item">
            Export JSON
          </button>
          <button onClick={() => fileInputRef.current.click()} className="tree-more-item">
            Import JSON
          </button>
          <button onClick={runAndClose(onClear)} className="tree-more-item tree-more-item-danger">
            Clear Tree
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="tree-hidden-input"
      />
    </div>
  );
}
