export function autoTopoSort(nodes, edges) {
  const modules = nodes.filter(n => n.type === 'module');
  const notes = nodes.filter(n => n.type === 'note');
  const adj = {};
  const inDegree = {};

  modules.forEach(n => { adj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (adj[e.source] && inDegree[e.target] !== undefined) {
      adj[e.source].push(e.target);
      inDegree[e.target]++;
    }
  });

  let queue = modules.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const levels = {};
  queue.forEach(id => { levels[id] = 0; });

  while (queue.length > 0) {
    const current = queue.shift();
    (adj[current] || []).forEach(neighbor => {
      inDegree[neighbor]--;
      levels[neighbor] = Math.max(levels[neighbor] || 0, levels[current] + 1);
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  modules.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });

  const levelGroups = {};
  modules.forEach(n => {
    const lvl = levels[n.id];
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n.id);
  });

  const X_SPACING = 300;
  const Y_SPACING = 220;
  const mappedModules = modules.map(n => {
    const lvl = levels[n.id];
    const indexInLvl = levelGroups[lvl].indexOf(n.id);
    const totalInLvl = levelGroups[lvl].length;

    const startX = 600 - ((totalInLvl - 1) * X_SPACING) / 2;
    return {
      ...n,
      position: {
        x: startX + indexInLvl * X_SPACING,
        y: 80 + lvl * Y_SPACING
      }
    };
  });

  const mappedNotes = notes.map((note, idx) => ({
    ...note,
    position: { x: 1400, y: 80 + idx * 160 }
  }));

  return [...mappedModules, ...mappedNotes];
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
