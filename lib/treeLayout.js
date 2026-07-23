const DEFAULT_MODULE_WIDTH = 220;
const DEFAULT_MODULE_HEIGHT = 80;
const GAP_X = 100;
const GAP_Y = 300;

// Layered (Sugiyama-style) layout in two phases:
//  1. ORDERING - decide the left-to-right order of each level (row) so that
//     edges cross as little as possible. Skip-level edges (a level-0 prereq
//     feeding a level-3 module directly, common in real prereq trees) are
//     threaded through virtual "dummy" nodes at each intermediate level for
//     this step, so ordering only ever compares neighbors on the same scale.
//     Barycenter sweeps give a good starting order; small levels (<=8 real
//     nodes, the common case) are then refined by trying every permutation
//     and keeping whichever minimizes crossings measured on actual packed
//     pixel positions - node widths vary enough that an abstractly
//     "crossing-free" index order can still cross once packed. Larger levels
//     fall back to greedy relocation (try each node in every position,
//     keep the best).
//  2. COORDINATES - with the order now fixed, walk levels top-down giving
//     each node an x as close as possible to the average x of its already-
//     placed parents (pulling simple chains into a single straight line),
//     while enforcing the minimum gap needed to respect the order decided
//     in phase 1 (so this step can straighten chains but can never
//     reintroduce a crossing phase 1 just removed).
// Modules with no prerequisites and nothing that requires them contribute
// nothing to the tree's structure - each would otherwise claim its own
// throwaway slot and needlessly widen the whole layout. They're stacked in
// a single column to the side instead.
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

  // --- Phase 1: ordering ---

  // Layer graph where every edge spans exactly one level (dummies fill the
  // gap for skip-level edges), used only to seed a good starting order.
  const layerAdj = {};
  const layerRevAdj = {};
  const isDummy = {};
  modules.forEach(n => { layerAdj[n.id] = []; layerRevAdj[n.id] = []; });

  let dummyCounter = 0;
  const relevantEdges = edges.filter(e => levels[e.source] !== undefined && levels[e.target] !== undefined);
  relevantEdges.forEach((e) => {
    const span = levels[e.target] - levels[e.source];
    if (span <= 0) return; // not expected for a DAG longest-path level assignment
    let prev = e.source;
    for (let lvl = levels[e.source] + 1; lvl < levels[e.target]; lvl++) {
      const dummyId = `__dummy_${dummyCounter++}__`;
      isDummy[dummyId] = true;
      layerAdj[dummyId] = [];
      layerRevAdj[dummyId] = [];
      levelMembers[lvl].push(dummyId);
      layerAdj[prev].push(dummyId);
      layerRevAdj[dummyId].push(prev);
      prev = dummyId;
    }
    layerAdj[prev].push(e.target);
    layerRevAdj[e.target].push(prev);
  });

  const positionInLevel = {};
  const refreshPositions = () => {
    levelMembers.forEach(level => level.forEach((id, idx) => { positionInLevel[id] = idx; }));
  };
  refreshPositions();

  const reorderByBarycenter = (levelIds, neighborsOf) => {
    const scored = levelIds.map(id => {
      const neighbors = neighborsOf[id] || [];
      const value = neighbors.length
        ? neighbors.reduce((sum, n) => sum + (positionInLevel[n] ?? 0), 0) / neighbors.length
        : positionInLevel[id];
      return { id, value };
    });
    scored.sort((a, b) => a.value - b.value);
    scored.forEach((entry, idx) => { levelIds[idx] = entry.id; });
  };

  const SWEEPS = 6;
  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    if (sweep % 2 === 0) {
      for (let lvl = 1; lvl <= maxLevel; lvl++) {
        reorderByBarycenter(levelMembers[lvl], layerRevAdj);
        refreshPositions();
      }
    } else {
      for (let lvl = maxLevel - 1; lvl >= 0; lvl--) {
        reorderByBarycenter(levelMembers[lvl], layerAdj);
        refreshPositions();
      }
    }
  }

  // Dummies have served their purpose - drop them and refine the real order
  // against real geometry (actual measured widths, not abstract indices).
  const order = levelMembers.map(level => level.filter(id => !isDummy[id]));

  const packPositions = (currentOrder) => {
    let cursorY = 80;
    const positions = {};
    for (let lvl = 0; lvl < currentOrder.length; lvl++) {
      const ids = currentOrder[lvl];
      const totalWidth = ids.reduce((sum, id) => sum + widthOf(id), 0) + GAP_X * Math.max(0, ids.length - 1);
      let cursorX = 600 - totalWidth / 2;
      const rowHeight = ids.reduce((max, id) => Math.max(max, heightOf(id)), DEFAULT_MODULE_HEIGHT);
      ids.forEach((id) => {
        positions[id] = { x: cursorX, y: cursorY, w: widthOf(id), h: heightOf(id) };
        cursorX += widthOf(id) + GAP_X;
      });
      cursorY += rowHeight + GAP_Y;
    }
    return positions;
  };

  const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  const segmentsCross = (A, B, C, D) =>
    ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);

  const countRealCrossings = (positions) => {
    const center = (id) => ({ x: positions[id].x + positions[id].w / 2, y: positions[id].y + positions[id].h / 2 });
    let crossings = 0;
    for (let i = 0; i < relevantEdges.length; i++) {
      const e1 = relevantEdges[i];
      if (!positions[e1.source] || !positions[e1.target]) continue;
      for (let j = i + 1; j < relevantEdges.length; j++) {
        const e2 = relevantEdges[j];
        if (!positions[e2.source] || !positions[e2.target]) continue;
        const shares = e1.source === e2.source || e1.source === e2.target ||
          e1.target === e2.source || e1.target === e2.target;
        if (shares) continue;
        if (segmentsCross(center(e1.source), center(e1.target), center(e2.source), center(e2.target))) crossings++;
      }
    }
    return crossings;
  };

  const EXHAUSTIVE_LEVEL_LIMIT = 8;
  const permutationsOf = (arr) => {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of permutationsOf(rest)) result.push([arr[i], ...p]);
    }
    return result;
  };

  let improved = true;
  let guard = 0;
  while (improved && guard++ < 8) {
    improved = false;
    for (let lvl = 0; lvl <= maxLevel; lvl++) {
      const levelIds = order[lvl];
      if (levelIds.length <= 1) continue;

      if (levelIds.length <= EXHAUSTIVE_LEVEL_LIMIT) {
        const before = countRealCrossings(packPositions(order));
        let bestOrder = levelIds;
        let bestCrossings = before;
        for (const perm of permutationsOf(levelIds)) {
          order[lvl] = perm;
          const crossings = countRealCrossings(packPositions(order));
          if (crossings < bestCrossings) {
            bestCrossings = crossings;
            bestOrder = perm;
          }
        }
        order[lvl] = bestOrder;
        if (bestCrossings < before) improved = true;
        continue;
      }

      const idsToProcess = [...levelIds];
      for (const nodeId of idsToProcess) {
        const currentOrder = order[lvl];
        const currentIndex = currentOrder.indexOf(nodeId);
        const withoutNode = currentOrder.filter(id => id !== nodeId);

        let bestPos = currentIndex;
        let bestCrossings = countRealCrossings(packPositions(order));

        for (let insertAt = 0; insertAt <= withoutNode.length; insertAt++) {
          order[lvl] = [...withoutNode.slice(0, insertAt), nodeId, ...withoutNode.slice(insertAt)];
          const crossings = countRealCrossings(packPositions(order));
          if (crossings < bestCrossings) {
            bestCrossings = crossings;
            bestPos = insertAt;
          }
        }

        order[lvl] = [...withoutNode.slice(0, bestPos), nodeId, ...withoutNode.slice(bestPos)];
        if (bestPos !== currentIndex) improved = true;
      }
    }
  }
  // --- Phase 2: coordinates ---
  // With the crossing-minimized order now fixed, walk top-down giving each
  // node an x as close as possible to its parents' average x (straightening
  // chains), sliding right only as far as needed to keep the fixed order's
  // minimum spacing. This can't reorder two nodes past each other within a
  // row, but a skip-level edge's rendered path depends on real pixel
  // positions, not just row order - so straightening one part of the graph
  // can occasionally nudge a long edge into a new crossing elsewhere even
  // though every row's own order stayed exactly as phase 1 decided. Rather
  // than accept that regression, compute both the plainly-packed layout and
  // the straightened one and keep whichever actually has fewer crossings.
  const levelY = [];
  let cursorY = 80;
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    levelY[lvl] = cursorY;
    const rowHeight = order[lvl].reduce((max, id) => Math.max(max, heightOf(id)), DEFAULT_MODULE_HEIGHT);
    cursorY += rowHeight + GAP_Y;
  }

  const straightenedX = {};
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const ids = order[lvl];
    const preferredX = ids.map((id) => {
      const parentXs = (parentsOf[id] || []).map((p) => straightenedX[p]).filter((v) => v !== undefined);
      return parentXs.length ? parentXs.reduce((sum, v) => sum + v, 0) / parentXs.length : null;
    });

    let cursorX = -Infinity;
    ids.forEach((id, idx) => {
      const minX = cursorX === -Infinity ? -Infinity : cursorX + GAP_X;
      let x = preferredX[idx] !== null ? preferredX[idx] : (minX === -Infinity ? 0 : minX);
      if (x < minX) x = minX;
      straightenedX[id] = x;
      cursorX = x + widthOf(id);
    });
  }

  const asPositions = (xById) => {
    const positions = {};
    modules.forEach((n) => { positions[n.id] = { x: xById[n.id], y: levelY[levels[n.id]], w: widthOf(n.id), h: heightOf(n.id) }; });
    return positions;
  };

  const packedPositions = packPositions(order);
  const packedX = {};
  modules.forEach((n) => { packedX[n.id] = packedPositions[n.id].x; });

  const finalX = countRealCrossings(asPositions(straightenedX)) <= countRealCrossings(asPositions(packedX))
    ? straightenedX
    : packedX;

  // Recenter the whole layout as one unit so it stays roughly centered
  // regardless of how far phase 2 nudged things while straightening chains.
  let minX = Infinity, maxX = -Infinity;
  modules.forEach((n) => {
    minX = Math.min(minX, finalX[n.id]);
    maxX = Math.max(maxX, finalX[n.id] + widthOf(n.id));
  });
  const shift = modules.length > 0 ? 600 - (minX + maxX) / 2 : 0;

  const mappedModules = modules.map((n) => ({
    ...n,
    position: { x: finalX[n.id] + shift, y: levelY[levels[n.id]] }
  }));

  const isolatedX = modules.length > 0 ? maxX + shift + GAP_X * 2 : 600;
  let isolatedCursorY = 80;
  const mappedIsolated = isolatedModules.map((n) => {
    const position = { x: isolatedX, y: isolatedCursorY };
    isolatedCursorY += heightOf(n.id) + GAP_Y;
    return { ...n, position };
  });

  const notesX = isolatedModules.length > 0 ? isolatedX + DEFAULT_MODULE_WIDTH + GAP_X * 2 : isolatedX;
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
