const DEFAULT_MODULE_WIDTH = 220;
const DEFAULT_MODULE_HEIGHT = 80;
const GAP_X = 60;
const GAP_Y = 80;

// Layered layout with column inheritance:
//  1. Assign each module a level via longest-path topological order (rows -
//     prerequisites always sit above what they unlock).
//  2. Walk levels top-down assigning each node a column: it inherits its
//     first parent's column if that column isn't already taken by a sibling
//     at this level, otherwise it claims a brand new column. This keeps
//     simple chains (the common case in a prereq tree) in a single straight
//     vertical line instead of a physics simulation's approximately-aligned
//     curves, and only genuine multi-parent convergence points end up with
//     angled edges - which is unavoidable since a node can only sit in one
//     column but may need to connect to parents in several others.
//  3. Each column's pixel width is the widest node ever placed in it, so
//     nodes are centered consistently whether it's a plain chain or a
//     branch point.
// Modules with no prerequisites and nothing that requires them contribute
// nothing to the tree's structure - each would otherwise claim its own
// throwaway column and needlessly widen the whole layout. They're stacked
// in a single column to the side instead.
// Cost is O(nodes + edges) - a single top-down pass with no iteration.
export function autoArrange(nodes, edges) {
  const allModules = nodes.filter(n => n.type === 'module');
  const notes = nodes.filter(n => n.type === 'note');
  const nodesById = {};
  allModules.forEach(n => { nodesById[n.id] = n; });

  const parentsOf = {};
  const childrenOf = {};
  const inDegree = {};
  allModules.forEach(n => { parentsOf[n.id] = []; childrenOf[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (parentsOf[e.target] && childrenOf[e.source]) {
      parentsOf[e.target].push(e.source);
      childrenOf[e.source].push(e.target);
      inDegree[e.target]++;
    }
  });

  const isIsolated = (id) => parentsOf[id].length === 0 && childrenOf[id].length === 0;
  const modules = allModules.filter(n => !isIsolated(n.id));
  const isolatedModules = allModules.filter(n => isIsolated(n.id));

  const widthOf = (id) => nodesById[id].measured?.width || DEFAULT_MODULE_WIDTH;
  const heightOf = (id) => nodesById[id].measured?.height || DEFAULT_MODULE_HEIGHT;

  // Assign levels (longest-path layering via Kahn's algorithm).
  const levels = {};
  const remainingInDegree = { ...inDegree };
  let queue = modules.filter(n => inDegree[n.id] === 0).map(n => n.id);
  queue.forEach(id => { levels[id] = 0; });

  while (queue.length > 0) {
    const current = queue.shift();
    (childrenOf[current] || []).forEach(child => {
      if (isIsolated(child)) return;
      remainingInDegree[child]--;
      levels[child] = Math.max(levels[child] || 0, levels[current] + 1);
      if (remainingInDegree[child] === 0) queue.push(child);
    });
  }
  modules.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });

  const maxLevel = modules.reduce((max, n) => Math.max(max, levels[n.id]), -1);
  const levelMembers = Array.from({ length: maxLevel + 1 }, () => []);
  modules.forEach(n => { levelMembers[levels[n.id]].push(n.id); });

  // Assign columns top-down: inherit a parent's column when it's free at
  // this level, otherwise claim a new one. When a node has several parents
  // scattered across different branches, blindly taking the first one in
  // edge order can drag it far from its other connections (e.g. a module
  // whose first listed prereq is off in an unrelated branch, but who also
  // depends on something in the main cluster) - preferring whichever free
  // parent column is closest to the average of ALL this node's parent
  // columns keeps it near the center of its actual connections instead.
  //
  // Within a level, nodes with multiple parent options are processed first.
  // A node bridging two branches loses a lot if its shared column gets taken
  // (it's stuck aligning with a single, possibly far away, remaining
  // parent), whereas a single-parent node bumped to a fresh column barely
  // suffers - it's still a short edge to its only parent either way.
  const columnOf = {};
  let nextColumn = 0;
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const claimedAtThisLevel = new Set();
    const distinctParentColumnCount = (id) => new Set(
      (parentsOf[id] || []).map((parent) => columnOf[parent]).filter((col) => col !== undefined)
    ).size;
    const orderedMembers = [...levelMembers[lvl]].sort((a, b) => distinctParentColumnCount(b) - distinctParentColumnCount(a));

    orderedMembers.forEach((id) => {
      const parentColumns = (parentsOf[id] || [])
        .map((parent) => columnOf[parent])
        .filter((col) => col !== undefined);
      const freeParentColumns = [...new Set(parentColumns)].filter((col) => !claimedAtThisLevel.has(col));

      let column;
      if (freeParentColumns.length > 0) {
        const meanColumn = parentColumns.reduce((sum, col) => sum + col, 0) / parentColumns.length;
        freeParentColumns.sort((a, b) => Math.abs(a - meanColumn) - Math.abs(b - meanColumn) || a - b);
        column = freeParentColumns[0];
      } else {
        column = nextColumn++;
      }
      columnOf[id] = column;
      claimedAtThisLevel.add(column);
    });
  }

  // Each column's width is the widest node ever placed in it, so a column
  // shared by a narrow node in one row and a wide one in another still lines
  // up cleanly.
  const totalColumns = nextColumn;
  const columnWidth = new Array(totalColumns).fill(0);
  modules.forEach((n) => {
    const col = columnOf[n.id];
    columnWidth[col] = Math.max(columnWidth[col], widthOf(n.id));
  });

  const columnLeft = new Array(totalColumns);
  let cursorX = 0;
  for (let c = 0; c < totalColumns; c++) {
    columnLeft[c] = cursorX;
    cursorX += columnWidth[c] + GAP_X;
  }
  const totalWidth = totalColumns > 0 ? cursorX - GAP_X : 0;
  const xOffset = 600 - totalWidth / 2;

  const levelY = [];
  let cursorY = 80;
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    levelY[lvl] = cursorY;
    const rowHeight = levelMembers[lvl].reduce((max, id) => Math.max(max, heightOf(id)), DEFAULT_MODULE_HEIGHT);
    cursorY += rowHeight + GAP_Y;
  }

  const mappedModules = modules.map((n) => {
    const col = columnOf[n.id];
    const centeredX = columnLeft[col] + xOffset + (columnWidth[col] - widthOf(n.id)) / 2;
    return { ...n, position: { x: centeredX, y: levelY[levels[n.id]] } };
  });

  const isolatedX = xOffset + totalWidth + GAP_X * 2;
  let isolatedCursorY = 80;
  const mappedIsolated = isolatedModules.map((n) => {
    const position = { x: isolatedX, y: isolatedCursorY };
    isolatedCursorY += heightOf(n.id) + GAP_Y;
    return { ...n, position };
  });

  const notesX = isolatedModules.length > 0 ? isolatedX + DEFAULT_MODULE_WIDTH + GAP_X * 2 : xOffset + totalWidth + 200;
  const mappedNotes = notes.map((note, idx) => ({
    ...note,
    position: { x: notesX, y: 80 + idx * 160 }
  }));

  return [...mappedModules, ...mappedIsolated, ...mappedNotes];
}

export function autoAlign(currentNodes) {
  if (currentNodes.length === 0) return currentNodes;

  let nodes = currentNodes.map(n => {
    const w = n.measured?.width || (n.type === 'note' ? 160 : 220);
    const h = n.measured?.height || (n.type === 'note' ? 120 : 80);
    return {
      ...n, w, h,
      cx: n.position.x + w / 2,
      cy: n.position.y + h / 2
    };
  });

  nodes.sort((a, b) => a.cx - b.cx);
  let columns = [];
  const TOLERANCE_X = 60;

  nodes.forEach(n => {
    let lastCol = columns[columns.length - 1];
    if (lastCol && Math.abs(n.cx - lastCol.baseCx) <= TOLERANCE_X) {
      lastCol.nodes.push(n);
      lastCol.w = Math.max(lastCol.w, n.w);
    } else {
      columns.push({ baseCx: n.cx, w: n.w, nodes: [n] });
    }
  });

  const GAP_X = 60;
  let placedColX = columns[0].baseCx;

  columns.forEach((col, i) => {
    if (i > 0) {
      let prevCol = columns[i - 1];
      let requiredDistance = (prevCol.w / 2) + GAP_X + (col.w / 2);
      placedColX = Math.max(col.baseCx, placedColX + requiredDistance);
    } else {
      placedColX = col.baseCx;
    }

    col.nodes.forEach(n => n.position.x = placedColX - (n.w / 2));
  });

  nodes.sort((a, b) => a.cy - b.cy);
  let rows = [];
  const TOLERANCE_Y = 45;
  nodes.forEach(n => {
    let lastRow = rows[rows.length - 1];
    if (lastRow && Math.abs(n.cy - lastRow.baseCy) <= TOLERANCE_Y) {
      lastRow.nodes.push(n);
      lastRow.h = Math.max(lastRow.h, n.h);
    } else {
      rows.push({ baseCy: n.cy, h: n.h, nodes: [n] });
    }
  });

  const GAP_Y = 60;
  let placedRowY = rows[0].baseCy;

  rows.forEach((row, i) => {
    if (i > 0) {
      let prevRow = rows[i - 1];
      let requiredDistance = (prevRow.h / 2) + GAP_Y + (row.h / 2);
      placedRowY = Math.max(row.baseCy, placedRowY + requiredDistance);
    } else {
      placedRowY = row.baseCy;
    }

    row.nodes.forEach(n => n.position.y = placedRowY - (n.h / 2));
  });

  return nodes.map(({ w, h, cx, cy, ...n }) => n);
}
