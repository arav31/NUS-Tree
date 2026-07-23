'use client';
import { useRef } from 'react';

export default function DataToolbar({ onExport, onImport, onClear }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) onImport(file);
    event.target.value = '';
  };

  return (
    <div className="tree-data-toolbar">
      <button onClick={onExport} className="tree-btn tree-btn-dark">
        Export JSON
      </button>
      <button onClick={() => fileInputRef.current.click()} className="tree-btn tree-btn-dark">
        Import JSON
      </button>
      <button onClick={onClear} className="tree-remove-btn">
        Clear Tree
      </button>
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
