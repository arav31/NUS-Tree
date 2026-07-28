const STORAGE_KEY = 'nus-tree-canvas-v1';

export function loadTreeFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTreeToStorage(nodes, edges) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch {
    // Storage unavailable or full - the canvas still works for this session.
  }
}

export function parseTreeJson(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('File must contain "nodes" and "edges" arrays.');
  }
  return parsed;
}

export async function parseNusmodsPlan(text) {
  const parsed = JSON.parse(text);
  const terms = Array.isArray(parsed.semesters) ? parsed.semesters : [parsed];
  const planned = terms.flatMap((term, index) => {
    const semester = term.label || `Y${term.year || index + 1}S${term.semester}`;
    return Object.keys(term.timetable || {}).map((code) => ({ code: code.toUpperCase(), semester }));
  });
  if (!planned.length) throw new Error('No NUSMods timetable modules were found.');

  const loaded = await Promise.all(planned.map(async (item) => {
    const response = await fetch(`/api/module?code=${encodeURIComponent(item.code)}`);
    if (!response.ok) throw new Error(`${item.code} could not be loaded.`);
    return { ...item, module: await response.json() };
  }));
  const semesterOrder = new Map(['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'].map((term, index) => [term, index]));
  const plannedAt = new Map(loaded.map(({ code, semester }) => [code, semesterOrder.get(semester)]));
  const completed = new Set(parsed.completed || []);
  const codeOf = (leaf) => leaf.split(':')[0].trim().toUpperCase();
  const satisfies = (tree, target) => {
    if (!tree) return true;
    if (typeof tree === 'string') return completed.has(codeOf(tree)) || (plannedAt.get(codeOf(tree)) ?? Infinity) < target;
    if (tree.and) return tree.and.every((child) => satisfies(child, target));
    if (tree.or) return tree.or.some((child) => satisfies(child, target));
    if (tree.nOf) return tree.nOf[1].filter((child) => satisfies(child, target)).length >= tree.nOf[0];
    return true;
  };
  const leaves = (tree) => typeof tree === 'string'
    ? [codeOf(tree)]
    : Object.values(tree || {}).flat(2).flatMap(leaves);
  const nodes = loaded.map(({ code, semester, module }, index) => {
    const valid = satisfies(module.prereqTree, plannedAt.get(code));
    return {
      id: code, type: 'module', position: { x: (index % 4) * 240, y: Math.floor(index / 4) * 120 },
      data: { courseCode: code, courseName: module.title, description: module.description, semester,
        availableSemesters: module.semesterData || [], color: valid ? '#e0f7fa' : '#fee2e2',
        planWarning: valid ? '' : `${code} has prerequisites missing from earlier semesters.` }
    };
  });
  const edges = loaded.flatMap(({ code, module }) => [...new Set(leaves(module.prereqTree))]
    .filter((source) => plannedAt.has(source))
    .map((source) => ({ id: `${source}-${code}`, source, target: code, data: { importedPlan: true } })));
  return { nodes, edges };
}

export function downloadTreeAsJson(nodes, edges) {
  const payload = JSON.stringify({ nodes, edges }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nus-tree-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
