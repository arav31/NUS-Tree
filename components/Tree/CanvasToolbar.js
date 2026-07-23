export default function CanvasToolbar({
  moduleCode, onModuleCodeChange, onSubmit, isLoadingTree, treeError, onOpenAddModule, onAddNote
}) {
  return (
    <>
      <div className="tree-toolbar">
        <form onSubmit={onSubmit} className="tree-toolbar-form">
          <input
            value={moduleCode}
            onChange={(e) => onModuleCodeChange(e.target.value)}
            aria-label="Module codes"
            placeholder="CS3210, CS4248"
            className="tree-input"
          />
          <button type="submit" className="tree-btn tree-btn-primary">
            {isLoadingTree ? 'Loading...' : 'Load Trees'}
          </button>
        </form>
        <button onClick={onOpenAddModule} className="tree-btn tree-btn-primary">
          + Add Module
        </button>
        <button onClick={onAddNote} className="tree-btn tree-btn-dark">
          + Add Note
        </button>
      </div>
      {treeError && <p role="alert" className="tree-error">{treeError}</p>}
    </>
  );
}
