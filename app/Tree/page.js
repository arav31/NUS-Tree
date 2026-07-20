'use client';
import { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  useNodesState, 
  useEdgesState, 
  Background, 
  Controls,
  addEdge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ModuleNode from '../../components/ModuleNode';
import NoteNode from '../../components/NoteNode';
import AddCourseModal from '../../components/AddCourseModal';

const nodeTypes = { 
  module: ModuleNode,
  note: NoteNode 
};

const initialNodes = [];
const initialEdges = [];

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#888' },
  type: 'default', // 'default' (bezier), 'step' (sharp corners), or 'smoothstep'
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#888',
  },
};

const edgeStyle = (requirement, stroke = '#888', strokeWidth = 2) => ({
  stroke, strokeWidth,
  strokeDasharray: requirement === 'any' ? '8 6' : undefined,
});

export default function TreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [moduleCode, setModuleCode] = useState('CS2040S'); //Prefill 2040
  const [treeError, setTreeError] = useState('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const startEdit = () => {
    setEditData(selectedNode.data); 
    setIsEditing(true);
  };

  const saveEdit = () => {
    setNodes((nds) => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...editData } } : n));
    setSelectedNode({ ...selectedNode, data: editData });
    setIsEditing(false);
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds)); 
  }, [setEdges]);

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  //Tree search algo
  const loadPrereqTree = async (event) => {
    event.preventDefault();
    const seen = new Map();
    const nextEdges = [];
    setTreeError('');
    setIsLoadingTree(true);

    const visit = async (code, depth = 0) => {
      const id = code.trim().toUpperCase();
      if (!id || seen.has(id) || seen.size >= 20) return seen.has(id);
      const response = await fetch(`/api/module?code=${encodeURIComponent(id)}`);
      if (!response.ok) return false;
      const module = await response.json();
      seen.set(id, {
        id, type: 'module', position: { x: depth * 280, y: 80 + seen.size * 120 },
        data: { courseCode: id, courseName: module.title, color: depth ? '#e0f7fa' : '#ffeb3b', description: module.description }
      });
      const prerequisiteText = module.prerequisite || '';
      const prereqs = [...new Set(prerequisiteText.match(/[A-Z]{2,4}\d{4}[A-Z]?/g) || [])].slice(0, 10);
      const requirement = /\bor\b/i.test(prerequisiteText) ? 'any' : 'all';
      for (const prereq of prereqs) {
        //recurse through prereqs
        if (await visit(prereq, depth + 1)) {
          nextEdges.push({ id: `${prereq}-${id}`, source: prereq, target: id, data: { requirement }, style: edgeStyle(requirement) });
        }
      }
      return true;
    };

    if (await visit(moduleCode)) {
      setNodes([...seen.values()]);
      setEdges(nextEdges);
      setSelectedNode(null);
    } else {
      setTreeError(`${moduleCode.toUpperCase()} was not found`);
    }
    setIsLoadingTree(false);
  };

  const semesterData = nodes
    .filter(n => n.type === 'module')
    .reduce((acc, node) => {
      const sem = node.data.semester || 'Unassigned';
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(node.data.courseCode);
      return acc;
    }, {});

  const autoTopoSort = () => {
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

    setNodes(() => {
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
    });
  };

  const autoAlign = () => {
    setNodes((currentNodes) => {
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
    });
  };

  useEffect(() => {
    const initialLayoutTimer = setTimeout(() => {
      autoAlign(); 
    }, 100);

    return () => clearTimeout(initialLayoutTimer);
  }, []);

  useEffect(() => {
    setEdges((currentEdges) => 
      currentEdges.map((edge) => {
        
        if (!selectedNode) {
          return { 
            ...edge, 
            animated: false, 
            style: edgeStyle(edge.data?.requirement)
          };
        }

        if (edge.target === selectedNode.id) {
          return { 
            ...edge, 
            animated: true, 
            style: edgeStyle(edge.data?.requirement, '#ef4444', 3) // Bold Red
          };
        }

        // 3. OUTGOING ARROWS: What this course UNLOCKS
        if (edge.source === selectedNode.id) {
          return { 
            ...edge, 
            animated: true, 
            style: edgeStyle(edge.data?.requirement, '#22c55e', 3) // Bold Green
          };
        }

        // 4. UNRELATED ARROWS: Fade these out so the active path pops!
        return { 
          ...edge, 
          animated: false, 
          style: edgeStyle(edge.data?.requirement, '#e5e7eb', 1) // Faint Gray
        };
      })
    );
  }, [selectedNode, setEdges]);

  const handleAddCourse = (newCourseData) => {
    const newNodeId = `node-${Date.now()}`; 
    const newNode = {
      id: newNodeId,
      type: 'module',
      position: { x: 100, y: 100 }, 
      data: { 
        courseCode: newCourseData.code, 
        courseName: newCourseData.name,
        color: newCourseData.color,
        description: newCourseData.description || '' 
      }
    };

    const newEdges = newCourseData.prereqs.map(prereqId => ({
      id: `edge-${prereqId}-${newNodeId}`,
      source: prereqId, target: newNodeId,
      data: { requirement: newCourseData.requirement },
      style: edgeStyle(newCourseData.requirement)
    }));

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, ...newEdges]);
    setIsModalOpen(false);
  };

  const handleAddNote = () => {
    const newNoteId = `note-${Date.now()}`;
    const newNote = {
      id: newNoteId,
      type: 'note',
      position: { x: 150, y: 150 },
      data: { text: 'New reminder note. Type your details below!' }
    };

    setNodes((nds) => [...nds, newNote]);
    setSelectedNode(newNote);
  };

  const handleNoteTextChange = (e) => {
    const updatedText = e.target.value;
    setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, text: updatedText } } : n));
    setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, text: updatedText } }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: 'calc(100vh - 80px)' }}>
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 4, display: 'flex', gap: '10px' }}>
          <form onSubmit={loadPrereqTree} style={{ display: 'flex', gap: '6px' }}>
            <input value={moduleCode} onChange={(e) => setModuleCode(e.target.value)} aria-label="Module code" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '12px 18px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoadingTree ? 'Loading...' : 'Load Tree'}
            </button>
          </form>
          <button onClick={() => setIsModalOpen(true)} style={{ padding: '12px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Module
          </button>
          <button onClick={handleAddNote} style={{ padding: '12px 24px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Note
          </button>
        </div>
        {treeError && <p role="alert" style={{ position: 'absolute', top: 78, right: 20, zIndex: 4, color: '#e02424' }}>{treeError}</p>}

        <div aria-label="Prerequisite legend" style={{ position: 'absolute', top: 20, left: 20, zIndex: 4, background: 'rgba(255,255,255,0.92)', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.8rem', lineHeight: 1.8 }}>
          <div><span style={{ display: 'inline-block', width: 30, borderTop: '2px solid #666', marginRight: 8 }} />ALL required</div>
          <div><span style={{ display: 'inline-block', width: 30, borderTop: '2px dashed #666', marginRight: 8 }} />ANY one</div>
        </div>

        <ReactFlow 
          nodes={nodes} edges={edges} 
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} 
          onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}   
          nodeTypes={nodeTypes} 
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>

        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 4, display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.85)', padding: '8px 16px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }}>
          <button onClick={autoTopoSort} style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
            🔀 Auto Topo Sort
          </button>
          <button onClick={autoAlign} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
            ⣿ Auto Align Grid
          </button>
        </div>
      </div>

      {selectedNode && (
  <div style={{ 
    height: '300px', 
    borderTop: '2px solid #ccc', 
    padding: '24px', 
    backgroundColor: '#f9f9f9', 
    overflowY: 'auto', 
    position: 'relative' 
  }}>
    
    {/* Top-Right Close Button */}
    <button 
      onClick={onPaneClick}
      style={{
        position: 'absolute', top: '16px', right: '16px',
        background: 'none', border: 'none', fontSize: '1.5rem',
        cursor: 'pointer', color: '#666'
      }}
    >
      &times;
    </button>
    
    {selectedNode.type === 'note' ? (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <h2 style={{ margin: 0 }}>Edit Note Content</h2>
        <textarea 
          value={selectedNode.data.text || ''} 
          onChange={handleNoteTextChange} 
          placeholder="Type your notes here..." 
          style={{ flexGrow: 1, width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none', fontFamily: 'inherit' }} 
        />
      </div>
    ) : (
      <div>
        {isEditing ? (
          // --- EDIT MODE ---
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input value={editData.courseCode || ''} onChange={e => setEditData({...editData, courseCode: e.target.value})} placeholder="Course Code" style={{ padding: '8px' }} />
            <input value={editData.courseName || ''} onChange={e => setEditData({...editData, courseName: e.target.value})} placeholder="Course Name" style={{ padding: '8px' }} />
            <textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Description" style={{ padding: '8px', height: '50px' }} />
            <select value={editData.semester || ''} onChange={e => setEditData({...editData, semester: e.target.value})} style={{ padding: '8px' }}>
              <option value="">No Semester</option>
              <option value="Y1S1">Year 1 Sem 1</option>
              <option value="Y1S2">Year 1 Sem 2</option>
              <option value="Y2S1">Year 2 Sem 1</option>
              <option value="Y2S2">Year 2 Sem 2</option>
              <option value="Y3S1">Year 3 Sem 1</option>
              <option value="Y3S2">Year 3 Sem 2</option>
              <option value="Y4S1">Year 4 Sem 1</option>
              <option value="Y4S2">Year 4 Sem 2</option>
            </select>
            <button onClick={saveEdit} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}>Save Changes</button>
          </div>
        ) : (
          // --- VIEW MODE ---
          <div>
            <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: selectedNode.data.color }}></span>
              {selectedNode.data.courseCode} {selectedNode.data.semester && `(${selectedNode.data.semester})`}
            </h2>
            <h3 style={{ color: '#555', marginTop: 0 }}>{selectedNode.data.courseName}</h3>
            <p><strong>Description:</strong></p>
            <p>{selectedNode.data.description || 'No description available for this module.'}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={startEdit} style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
              <button style={{ padding: '8px 16px', background: '#e02424', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { setNodes((nds) => nds.filter(n => n.id !== selectedNode.id)); setSelectedNode(null); }}>
                Remove Item
              </button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>

  
)}

{isModalOpen && (
  <AddCourseModal existingNodes={nodes} onClose={() => setIsModalOpen(false)} onAdd={handleAddCourse} />
)}

</div>
  



);

  
}
