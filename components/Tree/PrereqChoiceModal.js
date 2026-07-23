'use client';
import { useState, useEffect } from 'react';

export default function PrereqChoiceModal({ prompt, onConfirm }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [prompt]);

  if (!prompt) return null;

  const { moduleId, moduleName, options, minRequired = 1 } = prompt;

  const toggle = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  return (
    <div className="tree-modal-overlay">
      <div className="tree-modal-card">
        <h2 className="tree-modal-title">
          {moduleId} needs {minRequired > 1 ? `at least ${minRequired} of these` : 'only one of these'}
        </h2>
        <p className="tree-modal-subtitle">
          {moduleName ? `${moduleName} — ` : ''}select which prerequisite(s) you're taking (or plan to take):
        </p>
        <div className="tree-modal-options">
          {options.map((option) => (
            <label key={option.id} className="tree-modal-option">
              <input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} />
              {option.label}
            </label>
          ))}
        </div>
        <div className="tree-modal-actions">
          <button type="button" className="tree-btn tree-btn-dark" onClick={() => onConfirm([])}>
            Skip
          </button>
          <button
            type="button"
            className="tree-btn tree-btn-primary"
            disabled={selected.length < minRequired}
            onClick={() => onConfirm(selected)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
