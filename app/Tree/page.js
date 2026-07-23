'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './tree.css';

import { nodeTypes, initialNodes, initialEdges, defaultEdgeOptions, edgeStyle } from '../../lib/treeFlowConfig';
import { autoArrange, autoAlign, shuffleLayout } from '../../lib/treeLayout';
import { downloadTreeAsJson, parseTreeJson } from '../../lib/treeStorage';
import { usePrereqTree } from '../../hooks/usePrereqTree';
import { useEdgeHighlighting } from '../../hooks/useEdgeHighlighting';
import { useTreePersistence } from '../../hooks/useTreePersistence';
import CanvasToolbar from '../../components/Tree/CanvasToolbar';
import DataToolbar from '../../components/Tree/DataToolbar';
import LayoutToolbar from '../../components/Tree/LayoutToolbar';
import DetailPanel from '../../components/Tree/DetailPanel';
import PrereqChoiceModal from '../../components/Tree/PrereqChoiceModal';
import AddCourseModal from '../../components/AddCourseModal';

export default function TreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const { moduleCode, setModuleCode, treeError, isLoadingTree, loadPrereqTree, choicePrompt, resolvePrereqChoice } =
    usePrereqTree({ nodes, setNodes, setEdges, setSelectedNode });

  const startEdit = () => {
    setEditData({ color: '#e0f7fa', textColor: '#111827', ...selectedNode.data });
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

  const handleAutoArrange = () => setNodes(autoArrange(nodes, edges));
  const handleAutoAlign = () => setNodes((currentNodes) => autoAlign(currentNodes));
  const handleShuffle = () => setNodes((currentNodes) => shuffleLayout(currentNodes));

  useEffect(() => {
    const initialLayoutTimer = setTimeout(() => {
      setNodes((currentNodes) => autoAlign(currentNodes));
    }, 100);

    return () => clearTimeout(initialLayoutTimer);
  }, [setNodes]);

  useEdgeHighlighting(selectedNode, setEdges);
  useTreePersistence(nodes, edges, setNodes, setEdges);

  const handleExport = () => downloadTreeAsJson(nodes, edges);

  const handleImport = async (file) => {
    try {
      const text = await file.text();
      const imported = parseTreeJson(text);
      if (nodes.length > 0 && !window.confirm('Importing will replace your current canvas. Continue?')) {
        return;
      }
      setNodes(imported.nodes);
      setEdges(imported.edges);
      setSelectedNode(null);
    } catch (err) {
      window.alert(`Could not import file: ${err.message}`);
    }
  };

  const handleClearTree = () => {
    if (nodes.length === 0) return;
    if (!window.confirm('This will permanently clear your current tree. Continue?')) return;
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setIsEditing(false);
  };

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
        textColor: newCourseData.textColor,
        description: newCourseData.description || '',
        semester: newCourseData.semester
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

  const handleRemoveSelected = () => {
    setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
  };

  return (
    <div className="tree-page">
      <div className="tree-canvas-wrap">
        <DataToolbar onExport={handleExport} onImport={handleImport} onClear={handleClearTree} />

        <CanvasToolbar
          moduleCode={moduleCode}
          onModuleCodeChange={setModuleCode}
          onSubmit={loadPrereqTree}
          isLoadingTree={isLoadingTree}
          treeError={treeError}
          onOpenAddModule={() => setIsModalOpen(true)}
          onAddNote={handleAddNote}
        />

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

        <LayoutToolbar onAutoArrange={handleAutoArrange} onAutoAlign={handleAutoAlign} onShuffle={handleShuffle} />
      </div>

      <DetailPanel
        nodes={nodes}
        selectedNode={selectedNode}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
        onStartEdit={startEdit}
        onSaveEdit={saveEdit}
        onClose={onPaneClick}
        onNoteTextChange={handleNoteTextChange}
        onRemove={handleRemoveSelected}
      />

      {isModalOpen && (
        <AddCourseModal existingNodes={nodes} onClose={() => setIsModalOpen(false)} onAdd={handleAddCourse} />
      )}

      <PrereqChoiceModal prompt={choicePrompt} onConfirm={resolvePrereqChoice} />
    </div>
  );
}
