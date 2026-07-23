'use client';
import { useState, useEffect } from 'react';

export default function PrereqChoiceModal({ prompt, onConfirm }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [prompt]);

  if (!prompt) return null;

  const { moduleId, moduleName, candidates, minRequired = 1 } = prompt;

  const toggle = (code) => {
    setSelected((prev) => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
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
          {candidates.map((code) => (
            <label key={code} className="tree-modal-option">
              <input type="checkbox" checked={selected.includes(code)} onChange={() => toggle(code)} />
              {code}
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
