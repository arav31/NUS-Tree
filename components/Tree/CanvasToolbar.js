export default function CanvasToolbar({
  moduleCode, onModuleCodeChange, treeMode, onTreeModeChange, onSubmit, isLoadingTree, treeError, onAddNote
}) {
  return (
    <>
      <div className="tree-toolbar">
        <div role="group" aria-label="Tree direction">
          <button type="button" onClick={() => onTreeModeChange('prereqs')} className={`tree-btn ${treeMode === 'prereqs' ? 'tree-btn-primary' : 'tree-btn-dark'}`}>Prerequisites</button>
          <button type="button" onClick={() => onTreeModeChange('unlocks')} className={`tree-btn ${treeMode === 'unlocks' ? 'tree-btn-primary' : 'tree-btn-dark'}`}>Unlocks</button>
        </div>
        <form onSubmit={onSubmit} className="tree-toolbar-form">
          <input
            value={moduleCode}
            onChange={(e) => onModuleCodeChange(e.target.value)}
            aria-label="Module codes"
            placeholder="CS3210, CS4248"
            className="tree-input"
          />
          <button type="submit" className="tree-btn tree-btn-primary">
            {isLoadingTree ? 'Loading...' : `+ Load ${treeMode === 'unlocks' ? 'Unlocks' : 'Prerequisites'}`}
          </button>
        </form>
        <button onClick={onAddNote} className="tree-btn tree-btn-dark">
          + Add Note
        </button>
      </div>
      {treeError && <p role="alert" className="tree-error">{treeError}</p>}
    </>
  );
}
