const SEMESTERS = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];

export default function StudyPlanModal({ open, nodes, edges, onClose }) {
  if (!open) return null;
  const modules = nodes.filter((node) => node.type === 'module');
  const byId = new Map(modules.map((node) => [node.id, node]));
  const semesterOrder = new Map(SEMESTERS.map((semester, index) => [semester, index]));
  const warnings = [];

  modules.forEach(({ data }) => {
    if (data.planWarning) warnings.push(data.planWarning);
    if (!data.semester || !data.availableSemesters?.length) return;
    const term = Number(data.semester.at(-1));
    if (!data.availableSemesters.includes(term)) {
      warnings.push(`${data.courseCode} is not offered in Semester ${term}.`);
    }
  });
  edges.forEach(({ source, target, data }) => {
    if (data?.importedPlan) return;
    const prereq = byId.get(source)?.data;
    const module = byId.get(target)?.data;
    if (semesterOrder.has(prereq?.semester) && semesterOrder.has(module?.semester)
      && semesterOrder.get(prereq.semester) >= semesterOrder.get(module.semester)) {
      warnings.push(`${prereq.courseCode} must be before ${module.courseCode}.`);
    }
  });

  return (
    <div className="tree-modal-overlay" role="dialog" aria-modal="true" aria-label="Study plan">
      <div className="tree-modal-card tree-plan-card">
        <h2 className="tree-modal-title">Four-Year Study Plan</h2>
        <div className="tree-plan-grid">
          {[...SEMESTERS, 'Unassigned'].map((semester) => {
            const planned = modules.filter(({ data }) => semester === 'Unassigned' ? !data.semester : data.semester === semester);
            return (
              <section className="tree-plan-semester" key={semester}>
                <h3>{semester}</h3>
                {planned.length ? planned.map(({ id, data }) => <div key={id}>{data.courseCode}</div>) : <span>None</span>}
              </section>
            );
          })}
        </div>
        <div className={`tree-plan-warnings ${warnings.length ? '' : 'tree-plan-valid'}`}>
          <strong>{warnings.length ? 'Planning warnings' : 'Plan checks passed'}</strong>
          {warnings.map((warning) => <div key={warning}>{warning}</div>)}
        </div>
        <div className="tree-modal-actions">
          <button type="button" className="tree-btn tree-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
