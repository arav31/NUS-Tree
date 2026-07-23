export default function LayoutToolbar({ onAutoArrange, onAutoAlign }) {
  return (
    <div className="tree-layout-toolbar">
      <button onClick={onAutoArrange} className="tree-layout-btn-topo">
        🔀 Auto Arrange
      </button>
      <button onClick={onAutoAlign} className="tree-layout-btn-align">
        ⣿ Auto Align Grid
      </button>
    </div>
  );
}
