'use client';
import { useState } from 'react';

const CUSTOM = '__custom__';

export default function ColorSelect({ label, value, onChange, options, defaultCustomColor = '#e0f7fa' }) {
  const uniqueOptions = [...new Set((options || []).filter(Boolean))];
  const [mode, setMode] = useState(() => (uniqueOptions.includes(value) ? 'existing' : 'custom'));

  const handleSelectChange = (e) => {
    const next = e.target.value;
    if (next === CUSTOM) {
      setMode('custom');
      onChange(value && !uniqueOptions.includes(value) ? value : defaultCustomColor);
    } else {
      setMode('existing');
      onChange(next);
    }
  };

  return (
    <div>
      {label && <label className="tree-edit-label">{label}</label>}
      <select value={mode === 'custom' ? CUSTOM : value} onChange={handleSelectChange} className="tree-edit-select">
        {uniqueOptions.map((c) => (
          <option key={c} value={c} style={{ backgroundColor: c }}>{c}</option>
        ))}
        <option value={CUSTOM}>Custom...</option>
      </select>
      {mode === 'custom' && (
        <input
          type="color"
          value={value || defaultCustomColor}
          onChange={(e) => onChange(e.target.value)}
          className="tree-edit-color"
        />
      )}
    </div>
  );
}
