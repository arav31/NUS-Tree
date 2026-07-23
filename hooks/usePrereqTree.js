'use client';
import { useState } from 'react';
import { edgeStyle } from '../lib/treeFlowConfig';

//Tree search algo
export function usePrereqTree({ setNodes, setEdges, setSelectedNode }) {
  const [moduleCode, setModuleCode] = useState('CS2040S'); //Prefill 2040
  const [treeError, setTreeError] = useState('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const loadPrereqTree = async (event) => {
    event.preventDefault();
    const seen = new Map();
    const nextEdges = [];
    const rootCodes = [...new Set(moduleCode.toUpperCase().match(/[A-Z]{2,4}\d{4}[A-Z]?/g) || [])];
    setTreeError('');
    setIsLoadingTree(true);

    if (!rootCodes.length) {
      setTreeError('Enter at least one valid module code');
      setIsLoadingTree(false);
      return;
    }

    const visit = async (code, depth = 0) => {
      const id = code.trim().toUpperCase();
      if (!id || seen.has(id) || seen.size >= 60) return seen.has(id);
      const response = await fetch(`/api/module?code=${encodeURIComponent(id)}`);
      if (!response.ok) return false;
      const module = await response.json();
      seen.set(id, {
        id, type: 'module', position: { x: depth * 280, y: 80 + seen.size * 120 },
        data: { courseCode: id, courseName: module.title, color: depth ? '#e0f7fa' : '#ffeb3b', description: module.description }
      });
      const prerequisiteText = module.prerequisite || '';
      const prereqs = [...new Set(prerequisiteText.match(/[A-Z]{2,4}\d{4}[A-Z]?/g) || [])];
      const requirement = /\bor\b/i.test(prerequisiteText) ? 'any' : 'all';
      for (const prereq of prereqs) {
        //recurse through prereqs
        if (await visit(prereq, depth + 1)) {
          nextEdges.push({ id: `${prereq}-${id}`, source: prereq, target: id, data: { requirement }, style: edgeStyle(requirement) });
        }
      }
      return true;
    };

    const failedCodes = [];
    for (const code of rootCodes) {
      if (!(await visit(code))) failedCodes.push(code);
    }

    if (seen.size) {
      setNodes([...seen.values()].map(node => rootCodes.includes(node.id)
        ? { ...node, data: { ...node.data, color: '#ffeb3b' } }
        : node));
      setEdges(nextEdges);
      setSelectedNode(null);
      if (failedCodes.length) setTreeError(`Could not load: ${failedCodes.join(', ')}`);
    } else {
      setTreeError(`No modules found for: ${rootCodes.join(', ')}`);
    }
    setIsLoadingTree(false);
  };

  return { moduleCode, setModuleCode, treeError, isLoadingTree, loadPrereqTree };
}
