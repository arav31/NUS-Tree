export default function DetailPanel({
  selectedNode, isEditing, editData, setEditData, onStartEdit, onSaveEdit, onClose, onNoteTextChange, onRemove
}) {
  if (!selectedNode) return null;

  return (
    <div className="tree-detail-panel">
      <button onClick={onClose} className="tree-detail-close">
        &times;
      </button>

      {selectedNode.type === 'note' ? (
        <div className="tree-note-editor">
          <h2>Edit Note Content</h2>
          <textarea
            value={selectedNode.data.text || ''}
            onChange={onNoteTextChange}
            placeholder="Type your notes here..."
            className="tree-note-textarea"
          />
        </div>
      ) : (
        <div>
          {isEditing ? (
            // --- EDIT MODE ---
            <div className="tree-edit-form">
              <input value={editData.courseCode || ''} onChange={e => setEditData({...editData, courseCode: e.target.value})} placeholder="Course Code" className="tree-edit-input" />
              <input value={editData.courseName || ''} onChange={e => setEditData({...editData, courseName: e.target.value})} placeholder="Course Name" className="tree-edit-input" />
              <textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Description" className="tree-edit-textarea" />
              <select value={editData.semester || ''} onChange={e => setEditData({...editData, semester: e.target.value})} className="tree-edit-select">
                <option value="">No Semester</option>
                <option value="Y1S1">Year 1 Sem 1</option>
                <option value="Y1S2">Year 1 Sem 2</option>
                <option value="Y2S1">Year 2 Sem 1</option>
                <option value="Y2S2">Year 2 Sem 2</option>
                <option value="Y3S1">Year 3 Sem 1</option>
                <option value="Y3S2">Year 3 Sem 2</option>
                <option value="Y4S1">Year 4 Sem 1</option>
                <option value="Y4S2">Year 4 Sem 2</option>
              </select>
              <button onClick={onSaveEdit} className="tree-save-btn">Save Changes</button>
            </div>
          ) : (
            // --- VIEW MODE ---
            <div>
              <h2 className="tree-view-title">
                <span className="tree-color-dot" style={{ backgroundColor: selectedNode.data.color }}></span>
                {selectedNode.data.courseCode} {selectedNode.data.semester && `(${selectedNode.data.semester})`}
              </h2>
              <h3 className="tree-view-subtitle">{selectedNode.data.courseName}</h3>
              <p><strong>Description:</strong></p>
              <p>{selectedNode.data.description || 'No description available for this module.'}</p>

              <div className="tree-view-actions">
                <button onClick={onStartEdit} className="tree-edit-btn">Edit</button>
                <button className="tree-remove-btn" onClick={onRemove}>
                  Remove Item
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
