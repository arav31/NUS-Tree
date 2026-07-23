const DEFAULT_MODULE_WIDTH = 220;
const DEFAULT_MODULE_HEIGHT = 80;

// Layered (Sugiyama-style) layout:
//  1. Assign each module a level via longest-path topological order.
//  2. Edges that skip levels (e.g. a level-0 prereq feeding a level-3 module
//     directly, common in real prereq trees) are threaded through virtual
//     "dummy" nodes at each intermediate level, so every edge used for
//     ordering purposes only ever connects adjacent levels - without this,
//     a skip-level edge's ordering weight gets averaged against index scales
//     from unrelated levels, which is meaningless and produces worse layouts.
//  3. Get a good starting order with iterative barycenter sweeps between
//     adjacent levels (using the dummies from step 2), then drop the dummies
//     and polish with a hill-climbing pass that swaps adjacent real nodes
//     whenever it strictly reduces crossings measured on the actual packed
//     pixel positions - node widths vary enough in real trees that an
//     abstractly "crossing-free" index order can still cross once packed.
//  4. Pack each level tightly using actual measured node sizes instead of
//     fixed grid spacing, keeping the overall tree compact.
export function autoArrange(nodes, edges) {
  const modules = nodes.filter(n => n.type === 'module');
  const notes = nodes.filter(n => n.type === 'note');
  const nodesById = {};
  modules.forEach(n => { nodesById[n.id] = n; });

  const directAdj = {};
  const inDegree = {};
  modules.forEach(n => { directAdj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (directAdj[e.source] && inDegree[e.target] !== undefined) {
      directAdj[e.source].push(e.target);
      inDegree[e.target]++;
    }
  });

  // Assign levels (longest-path layering via Kahn's algorithm).
  const levels = {};
  const remainingInDegree = { ...inDegree };
  let queue = modules.filter(n => inDegree[n.id] === 0).map(n => n.id);
  queue.forEach(id => { levels[id] = 0; });

  while (queue.length > 0) {
    const current = queue.shift();
    (directAdj[current] || []).forEach(neighbor => {
      remainingInDegree[neighbor]--;
      levels[neighbor] = Math.max(levels[neighbor] || 0, levels[current] + 1);
      if (remainingInDegree[neighbor] === 0) queue.push(neighbor);
    });
  }
  modules.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });

  const maxLevel = modules.reduce((max, n) => Math.max(max, levels[n.id]), 0);
  const levelMembers = Array.from({ length: maxLevel + 1 }, () => []);
  modules.forEach(n => { levelMembers[levels[n.id]].push(n.id); });

  // Build the layer graph: every edge here spans exactly one level.
  const layerAdj = {};
  const layerRevAdj = {};
  const isDummy = {};
  modules.forEach(n => { layerAdj[n.id] = []; layerRevAdj[n.id] = []; });

  let dummyCounter = 0;
  edges.forEach((e) => {
    if (!(e.source in levels) || !(e.target in levels)) return;
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

  // --- Crossing reduction: barycenter sweeps, then transpose refinement ---
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

  // Drop dummies now - the barycenter sweeps used them to get a good starting
  // order, but node widths vary enough in real trees that an order judged
  // "crossing-free" in the abstract can still show crossings once actual
  // pixel positions are packed. The refinement pass below works directly in
  // real coordinates against the real (non-dummy) edges instead.
  const realLevelOrder = levelMembers.map(level => level.filter(id => !isDummy[id]));

  const GAP_X = 60;
  const GAP_Y = 80;
  const widthOf = (id) => nodesById[id].measured?.width || DEFAULT_MODULE_WIDTH;
  const heightOf = (id) => nodesById[id].measured?.height || DEFAULT_MODULE_HEIGHT;

  const packPositions = (order) => {
    let cursorY = 80;
    const positions = {};
    for (let lvl = 0; lvl < order.length; lvl++) {
      const levelIds = order[lvl];
      const totalWidth = levelIds.reduce((sum, id) => sum + widthOf(id), 0) + GAP_X * Math.max(0, levelIds.length - 1);
      let cursorX = 600 - totalWidth / 2;
      const rowHeight = levelIds.reduce((max, id) => Math.max(max, heightOf(id)), DEFAULT_MODULE_HEIGHT);

      levelIds.forEach((id) => {
        positions[id] = { x: cursorX, y: cursorY, w: widthOf(id), h: heightOf(id) };
        cursorX += widthOf(id) + GAP_X;
      });
      cursorY += rowHeight + GAP_Y;
    }
    return positions;
  };

  // Standard segment-intersection test, applied to straight lines between
  // each edge's actual (center-point) endpoints - this is what will actually
  // be rendered, so it's the metric that matters for "does this look clean".
  const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  const segmentsCross = (A, B, C, D) =>
    ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);

  const countRealCrossings = (positions) => {
    const center = (id) => ({ x: positions[id].x + positions[id].w / 2, y: positions[id].y + positions[id].h / 2 });
    let crossings = 0;
    for (let i = 0; i < edges.length; i++) {
      const e1 = edges[i];
      if (!positions[e1.source] || !positions[e1.target]) continue;
      for (let j = i + 1; j < edges.length; j++) {
        const e2 = edges[j];
        if (!positions[e2.source] || !positions[e2.target]) continue;
        const shares = e1.source === e2.source || e1.source === e2.target ||
          e1.target === e2.source || e1.target === e2.target;
        if (shares) continue;
        if (segmentsCross(center(e1.source), center(e1.target), center(e2.source), center(e2.target))) crossings++;
      }
    }
    return crossings;
  };

  // Refine level-by-level: for small levels (common in prereq trees), try
  // every possible ordering of that level and keep whichever yields the
  // fewest total rendered crossings - exact, not just locally best. Larger
  // levels fall back to greedy relocation (try each node in every position,
  // holding the rest fixed), since factorial growth makes exhaustive search
  // infeasible past a handful of nodes. A single-node relocation heuristic
  // alone can get stuck short of the true optimum (a two-node move can help
  // even when neither node's move alone does), which is exactly what
  // exhaustive search for small levels fixes.
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
      const levelIds = realLevelOrder[lvl];
      if (levelIds.length <= 1) continue;

      if (levelIds.length <= EXHAUSTIVE_LEVEL_LIMIT) {
        const before = countRealCrossings(packPositions(realLevelOrder));
        let bestOrder = levelIds;
        let bestCrossings = before;
        for (const perm of permutationsOf(levelIds)) {
          realLevelOrder[lvl] = perm;
          const crossings = countRealCrossings(packPositions(realLevelOrder));
          if (crossings < bestCrossings) {
            bestCrossings = crossings;
            bestOrder = perm;
          }
        }
        realLevelOrder[lvl] = bestOrder;
        if (bestCrossings < before) improved = true;
        continue;
      }

      const idsToProcess = [...levelIds];
      for (const nodeId of idsToProcess) {
        const currentOrder = realLevelOrder[lvl];
        const currentIndex = currentOrder.indexOf(nodeId);
        const withoutNode = currentOrder.filter(id => id !== nodeId);

        let bestPos = currentIndex;
        let bestCrossings = countRealCrossings(packPositions(realLevelOrder));

        for (let insertAt = 0; insertAt <= withoutNode.length; insertAt++) {
          realLevelOrder[lvl] = [...withoutNode.slice(0, insertAt), nodeId, ...withoutNode.slice(insertAt)];
          const crossings = countRealCrossings(packPositions(realLevelOrder));
          if (crossings < bestCrossings) {
            bestCrossings = crossings;
            bestPos = insertAt;
          }
        }

        realLevelOrder[lvl] = [...withoutNode.slice(0, bestPos), nodeId, ...withoutNode.slice(bestPos)];
        if (bestPos !== currentIndex) improved = true;
      }
    }
  }

  const finalPositions = packPositions(realLevelOrder);
  const mappedModules = modules.map(n => ({
    ...n,
    position: { x: finalPositions[n.id].x, y: finalPositions[n.id].y }
  }));

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
