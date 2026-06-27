'use client';

export default function AddCourseModal({ existingNodes, onClose, onAdd }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Extract selected prerequisite IDs
    const prereqSelect = e.target.prereqs;
    const prereqs = Array.from(prereqSelect.selectedOptions).map(opt => opt.value);

    onAdd({
      code: formData.get('code'),
      name: formData.get('name'),
      color: formData.get('color'),
      description: formData.get('description'), // Captured new field
      prereqs: prereqs
    });
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', padding: '24px', borderRadius: '12px',
        width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative' // Required for absolute positioning of X button
      }}>
        
        {/* Top Right Close Button */}
        <button 
          type="button" 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', fontSize: '1.5rem',
            cursor: 'pointer', color: '#666', lineHeight: '1rem'
          }}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.35rem' }}>Add New Module</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Course Code*</label>
            <input name="code" placeholder="e.g., CS2109S" required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Course Name</label>
            <input name="name" placeholder="Introduction to AI and ML" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          {/* New Description Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Description (Optional)</label>
            <textarea 
              name="description" 
              placeholder="Enter module details or syllabus summaries..." 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Node Color</label>
            <input name="color" type="color" defaultValue="#e0f7fa" style={{ width: '100%', height: '36px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Prerequisites (Hold Ctrl/Cmd)</label>
            <select name="prereqs" multiple style={{ width: '100%', padding: '8px', height: '90px', borderRadius: '4px', border: '1px solid #ccc' }}>
              {existingNodes.filter(n => n.type === 'module').map(node => (
                <option key={node.id} value={node.id}>
                  {node.data.courseCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Semester (Optional)</label>
            <select name="semester" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Select a Semester</option>
                <option value="Y1S1">Year 1 Sem 1</option>
                <option value="Y1S2">Year 1 Sem 2</option>
                <option value="Y2S1">Year 2 Sem 1</option>
                <option value="Y2S2">Year 2 Sem 2</option>
                <option value="Y3S1">Year 3 Sem 1</option>
                <option value="Y3S2">Year 3 Sem 2</option>
                <option value="Y4S1">Year 4 Sem 1</option>
                <option value="Y4S2">Year 4 Sem 2</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              Add Module
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: '#eaeaea', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}