export default function PrereqLegend() {
  return (
    <div aria-label="Prerequisite legend" className="tree-legend">
      <div><span className="tree-legend-line" />ALL required</div>
      <div><span className="tree-legend-line-dashed" />ANY one</div>
    </div>
  );
}
