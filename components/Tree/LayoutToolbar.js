export default function LayoutToolbar({ onAutoTopoSort, onAutoAlign }) {
  return (
    <div className="tree-layout-toolbar">
      <button onClick={onAutoTopoSort} className="tree-layout-btn-topo">
        🔀 Auto Topo Sort
      </button>
      <button onClick={onAutoAlign} className="tree-layout-btn-align">
        ⣿ Auto Align Grid
      </button>
    </div>
  );
}
