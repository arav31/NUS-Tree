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

const initialNodes = [
  { id: 'ma1522', type: 'module', position: { x: 50, y: 50 }, data: { courseCode: 'MA1522', courseName: 'Linear Algebra I', color: '#e0f7fa', description: 'Systems of linear equations, matrices, determinants, vectors, and linear transformations.' } },
  { id: 'is1108', type: 'module', position: { x: 250, y: 50 }, data: { courseCode: 'IS1108', courseName: 'Digital Ethics and Data Privacy', color: '#e0f7fa', description: 'Ethical considerations and privacy issues in data analytics and software deployments.' } },
  { id: 'cs2101', type: 'module', position: { x: 450, y: 50 }, data: { courseCode: 'CS2101*', courseName: 'Effective Communication', color: '#e0f7fa', description: '*Have to be taken in the same sem as CS2103T' } },
  { id: 'ma1521', type: 'module', position: { x: 650, y: 50 }, data: { courseCode: 'MA1521', courseName: 'Calculus for Computing', color: '#e0f7fa', description: 'Functions, limits, derivatives, integrals, sequences, and series.' } },
  { id: 'cs1231s', type: 'module', position: { x: 850, y: 50 }, data: { courseCode: 'CS1231S', courseName: 'Discrete Structures', color: '#e0f7fa', description: 'Mathematical logic, sets, relations, functions, and graph basics.' } },
  { id: 'cs1010x', type: 'module', position: { x: 1050, y: 50 }, data: { courseCode: 'CS1010X', courseName: 'Programming Methodology', color: '#e0f7fa', description: 'Problem-solving using functional structures and programmatic abstractions.' } },
  { id: 'st2334', type: 'module', position: { x: 600, y: 220 }, data: { courseCode: 'ST2334', courseName: 'Probability and Statistics', color: '#ffeb3b', description: 'Probability laws, random variables, expectations, sampling, estimation, and testing hypotheses.' } },
  { id: 'cs2040s', type: 'module', position: { x: 850, y: 220 }, data: { courseCode: 'CS2040S', courseName: 'Data Structures and Algorithms', color: '#ffeb3b', description: 'Design, analysis, and implementation of algorithms and standard data structures.' } },
  { id: 'cs2030s', type: 'module', position: { x: 1050, y: 220 }, data: { courseCode: 'CS2030S', courseName: 'Programming Methodology II', color: '#ffeb3b', description: 'Object-oriented programming and functional abstractions.' } },
  { id: 'cs2100', type: 'module', position: { x: 1250, y: 220 }, data: { courseCode: 'CS2100', courseName: 'Computer Organisation', color: '#ffeb3b', description: 'Processor pipelines, memory organization, assembly arrays, and digital logic design.' } },
  { id: 'cs2109s', type: 'module', position: { x: 650, y: 390 }, data: { courseCode: 'CS2109S', courseName: 'Introduction to AI and ML', color: '#f8bbd0', description: 'Search strategies, knowledge representation, machine learning basics, and neural structures.' } },
  { id: 'cs3230', type: 'module', position: { x: 850, y: 390 }, data: { courseCode: 'CS3230', courseName: 'Design and Analysis of Algorithms', color: '#f8bbd0', description: 'Divide and conquer, greedy methods, dynamic programming, NP-completeness.' } },
  { id: 'cs2103t', type: 'module', position: { x: 1050, y: 390 }, data: { courseCode: 'CS2103T*', courseName: 'Software Engineering', color: '#f8bbd0', description: '*Have to be taken in the same sem as CS2101' } },
  { id: 'cs2106', type: 'module', position: { x: 1250, y: 390 }, data: { courseCode: 'CS2106', courseName: 'Introduction to Operating Systems', color: '#f8bbd0', description: 'Processes, threads, synchronization, memory management, and file systems.' } }
];

const initialEdges = [
  { id: 'e-ma1521-st2334', source: 'ma1521', target: 'st2334', animated: 0 },
  { id: 'e-ma1521-cs2109s', source: 'ma1521', target: 'cs2109s', animated: 0 },
  { id: 'e-cs1231s-cs2109s', source: 'cs1231s', target: 'cs2109s', animated: 0 },
  { id: 'e-cs1231s-cs3230', source: 'cs1231s', target: 'cs3230', animated: 0 },
  { id: 'e-cs1231s-cs2040s', source: 'cs1231s', target: 'cs2040s', animated: 0 },
  { id: 'e-cs1010x-cs2040s', source: 'cs1010x', target: 'cs2040s', animated: 0 },
  { id: 'e-cs1010x-cs2030s', source: 'cs1010x', target: 'cs2030s', animated: 0 },
  { id: 'e-cs1010x-cs2100', source: 'cs1010x', target: 'cs2100', animated: 0 },
  { id: 'e-cs2040s-cs2109s', source: 'cs2040s', target: 'cs2109s', animated: 0 },
  { id: 'e-cs2040s-cs3230', source: 'cs2040s', target: 'cs3230', animated: 0 },
  { id: 'e-cs2040s-cs2103t', source: 'cs2040s', target: 'cs2103t', animated: 0 },
  { id: 'e-cs2030s-cs2103t', source: 'cs2030s', target: 'cs2103t', animated: 0 },
  { id: 'e-cs2100-cs2106', source: 'cs2100', target: 'cs2106', animated: 0 }
];

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

export default function TreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

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
      // 1. Layout Modules with GUARANTEED spacing
      const X_SPACING = 300; // Force a massive horizontal gap
      const Y_SPACING = 220; // Force a massive vertical gap

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

      // 2. Push all notes safely to the far right boundary
      const mappedNotes = notes.map((note, idx) => ({ 
        ...note, 
        position: { x: 1400, y: 80 + idx * 160 } 
      }));

      return [...mappedModules, ...mappedNotes];
    });
  };

  // NEW: Non-Destructive Widest/Tallest Alternating Grid Alignment Engine
  const autoAlign = () => {
    setNodes((currentNodes) => {
      if (currentNodes.length === 0) return currentNodes;

      // 1. Snapshot with exact centers and sizes
      let nodes = currentNodes.map(n => {
        const w = n.measured?.width || (n.type === 'note' ? 160 : 220);
        const h = n.measured?.height || (n.type === 'note' ? 120 : 80);
        return { 
          ...n, w, h, 
          cx: n.position.x + w / 2, 
          cy: n.position.y + h / 2 
        };
      });

      // --- PHASE 1: EXACT COLUMNS (X-AXIS) ---
      nodes.sort((a, b) => a.cx - b.cx); 
      let columns = [];
      const TOLERANCE_X = 60; // Max pixels of human error when dragging. If centers are > 60px apart, they form a new column.

      nodes.forEach(n => {
        let lastCol = columns[columns.length - 1];
        // We lock the base center to the FIRST node to prevent drifting
        if (lastCol && Math.abs(n.cx - lastCol.baseCx) <= TOLERANCE_X) {
          lastCol.nodes.push(n);
          lastCol.w = Math.max(lastCol.w, n.w); // Track widest node for safe spacing
        } else {
          columns.push({ baseCx: n.cx, w: n.w, nodes: [n] });
        }
      });

      const GAP_X = 60; // Guaranteed minimum empty space between columns
      let placedColX = columns[0].baseCx;

      columns.forEach((col, i) => {
        if (i > 0) {
          let prevCol = columns[i - 1];
          let requiredDistance = (prevCol.w / 2) + GAP_X + (col.w / 2);
          // Push column safely to the right if they would overlap
          placedColX = Math.max(col.baseCx, placedColX + requiredDistance);
        } else {
          placedColX = col.baseCx;
        }
        
        // Apply perfectly centered X to all nodes in this column
        col.nodes.forEach(n => n.position.x = placedColX - (n.w / 2));
      });

      // --- PHASE 2: EXACT ROWS (Y-AXIS) ---
      nodes.sort((a, b) => a.cy - b.cy);
      let rows = [];
      const TOLERANCE_Y = 45; // Tightened to 45px. Rows will NOT merge unless they heavily overlap visually.

      nodes.forEach(n => {
        let lastRow = rows[rows.length - 1];
        if (lastRow && Math.abs(n.cy - lastRow.baseCy) <= TOLERANCE_Y) {
          lastRow.nodes.push(n);
          lastRow.h = Math.max(lastRow.h, n.h); // Track tallest node for safe spacing
        } else {
          rows.push({ baseCy: n.cy, h: n.h, nodes: [n] });
        }
      });

      const GAP_Y = 60; // Guaranteed minimum empty space between rows
      let placedRowY = rows[0].baseCy;

      rows.forEach((row, i) => {
        if (i > 0) {
          let prevRow = rows[i - 1];
          let requiredDistance = (prevRow.h / 2) + GAP_Y + (row.h / 2);
          // Push row safely downwards if they would overlap
          placedRowY = Math.max(row.baseCy, placedRowY + requiredDistance);
        } else {
          placedRowY = row.baseCy;
        }
        
        // Apply perfectly centered Y to all nodes in this row
        row.nodes.forEach(n => n.position.y = placedRowY - (n.h / 2));
      });

      // 3. Clean up the tracking properties before giving the data back to React Flow
      return nodes.map(({ w, h, cx, cy, ...n }) => n);
    });
  };

  useEffect(() => {
    // We wait 100ms to allow React Flow to paint the DOM and calculate the true 
    // heights of the text blocks before we snap everything into place.
    const initialLayoutTimer = setTimeout(() => {
      autoAlign(); 
      // Note: You can change this to autoTopoSort() if you prefer the cascading tree look on load!
    }, 100);

    return () => clearTimeout(initialLayoutTimer);
  }, []);

  useEffect(() => {
    setEdges((currentEdges) => 
      currentEdges.map((edge) => {
        
        // 1. If nothing is selected, return all arrows to the default state
        if (!selectedNode) {
          return { 
            ...edge, 
            animated: false, 
            style: { strokeWidth: 2, stroke: '#888' } 
          };
        }

        // 2. INCOMING ARROWS: What you need to take BEFORE this course
        if (edge.target === selectedNode.id) {
          return { 
            ...edge, 
            animated: true, 
            style: { strokeWidth: 3, stroke: '#ef4444' } // Bold Red
          };
        }

        // 3. OUTGOING ARROWS: What this course UNLOCKS
        if (edge.source === selectedNode.id) {
          return { 
            ...edge, 
            animated: true, 
            style: { strokeWidth: 3, stroke: '#22c55e' } // Bold Green
          };
        }

        // 4. UNRELATED ARROWS: Fade these out so the active path pops!
        return { 
          ...edge, 
          animated: false, 
          style: { strokeWidth: 1, stroke: '#e5e7eb' } // Faint Gray
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
      source: prereqId, target: newNodeId 
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
          <button onClick={() => setIsModalOpen(true)} style={{ padding: '12px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Module
          </button>
          <button onClick={handleAddNote} style={{ padding: '12px 24px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Note
          </button>
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