'use client';
import { useRef, useState } from 'react';
import { edgeStyle } from '../lib/treeFlowConfig';

//Tree search algo
export function usePrereqTree({ nodes, setNodes, setEdges, setSelectedNode }) {
  const [moduleCode, setModuleCode] = useState('CS2040S'); //Prefill 2040
  const [treeError, setTreeError] = useState('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [choicePrompt, setChoicePrompt] = useState(null);
  const choiceResolverRef = useRef(null);

  // Pauses the recursive load to ask which alternative(s) to include. `options`
  // is a list of { id, label } - some may represent a single module code, others
  // a whole compound sub-requirement (see describeNode below).
  const askForPrereqChoice = (moduleId, moduleName, options, minRequired = 1) => {
    return new Promise((resolve) => {
      choiceResolverRef.current = resolve;
      setChoicePrompt({ moduleId, moduleName, options, minRequired });
    });
  };

  const resolvePrereqChoice = (selectedIds) => {
    setChoicePrompt(null);
    const resolve = choiceResolverRef.current;
    choiceResolverRef.current = null;
    if (resolve) resolve(selectedIds);
  };

  const parseCode = (leaf) => leaf.split(':')[0].trim().toUpperCase();

  // Short human-readable summary of a compound sub-requirement, used as the
  // label for a choice option that represents more than a single module code.
  const describeNode = (node) => {
    if (typeof node === 'string') return parseCode(node);
    if (node.and) return node.and.map(describeNode).join(' + ');
    if (node.or) return `(${node.or.map(describeNode).join(' or ')})`;
    if (node.nOf) {
      const [n, children] = node.nOf;
      return `${n} of (${children.map(describeNode).join(', ')})`;
    }
    return 'requirement';
  };

  // Turns the children of an or/nOf node into a uniform list of alternatives -
  // a plain module code is a 'leaf' alternative, anything else (and/or/nOf) is
  // a 'group' alternative representing a whole sub-requirement. Choosing a
  // 'group' alternative later resolves its entire sub-tree; choosing a 'leaf'
  // just adds that one code. Critically, these are mutually exclusive choices,
  // not "ask about the leaves, then always also include the group anyway".
  const toAlternatives = (children) => children.map((child) => (
    typeof child === 'string'
      ? { type: 'leaf', code: parseCode(child), label: parseCode(child) }
      : { type: 'group', node: child, label: describeNode(child) }
  ));

  const resolveAlternative = async (alt, moduleId, moduleName, isAlreadyPresent) => (
    alt.type === 'leaf'
      ? [{ code: alt.code, requirement: 'any' }]
      : await resolvePrereqNode(alt.node, 'all', moduleId, moduleName, isAlreadyPresent)
  );

  // Walks NUSMods' structured prereqTree (and/or/nOf nodes, string leaves) so that
  // "any one of" groups are resolved per-group instead of being flattened together.
  // isAlreadyPresent(code) lets a group that's already been resolved elsewhere in the
  // tree (already on the canvas, or already added earlier in this same load) auto-pick
  // the existing choice instead of asking again.
  const resolvePrereqNode = async (node, requirement, moduleId, moduleName, isAlreadyPresent) => {
    if (!node) return [];

    if (typeof node === 'string') {
      return [{ code: parseCode(node), requirement }];
    }

    if (node.and) {
      const results = [];
      for (const child of node.and) {
        results.push(...await resolvePrereqNode(child, 'all', moduleId, moduleName, isAlreadyPresent));
      }
      return results;
    }

    if (node.or) {
      const alternatives = toAlternatives(node.or);
      const alreadyChosen = alternatives.filter((alt) => alt.type === 'leaf' && isAlreadyPresent(alt.code));

      let chosen;
      if (alreadyChosen.length > 0) {
        chosen = alreadyChosen;
      } else if (alternatives.length <= 1) {
        chosen = alternatives;
      } else {
        const options = alternatives.map((alt, idx) => ({ id: String(idx), label: alt.label }));
        const selectedIds = await askForPrereqChoice(moduleId, moduleName, options);
        chosen = alternatives.filter((_, idx) => selectedIds.includes(String(idx)));
      }

      const results = [];
      for (const alt of chosen) {
        results.push(...await resolveAlternative(alt, moduleId, moduleName, isAlreadyPresent));
      }
      return results;
    }

    if (node.nOf) {
      const [n, children] = node.nOf;
      const alternatives = toAlternatives(children);

      if (alternatives.length <= n) {
        const results = [];
        for (const alt of alternatives) {
          results.push(...(alt.type === 'leaf'
            ? [{ code: alt.code, requirement: 'all' }]
            : await resolvePrereqNode(alt.node, 'all', moduleId, moduleName, isAlreadyPresent)));
        }
        return results;
      }

      const alreadyChosen = alternatives.filter((alt) => alt.type === 'leaf' && isAlreadyPresent(alt.code));
      let chosen;
      if (alreadyChosen.length >= n) {
        chosen = alreadyChosen;
      } else {
        const options = alternatives.map((alt, idx) => ({ id: String(idx), label: alt.label }));
        const selectedIds = await askForPrereqChoice(moduleId, moduleName, options, n);
        chosen = alternatives.filter((_, idx) => selectedIds.includes(String(idx)));
      }

      const results = [];
      for (const alt of chosen) {
        results.push(...await resolveAlternative(alt, moduleId, moduleName, isAlreadyPresent));
      }
      return results;
    }

    return [];
  };

  const loadPrereqTree = async (event) => {
    event.preventDefault();
    // Snapshot what's already on the canvas so this load adds to it instead of
    // replacing it, and so prerequisites already resolved elsewhere (either already
    // on the canvas, or resolved earlier in this same load) don't get asked about again.
    const existingNodeIds = new Set(nodes.filter(n => n.type === 'module').map(n => n.id));
    const seen = new Map();
    const isAlreadyPresent = (code) => existingNodeIds.has(code) || seen.has(code);
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
      if (!id) return false;
      // Already on the canvas from before - just link to it, don't re-expand it.
      if (depth > 0 && existingNodeIds.has(id)) return true;
      if (seen.has(id) || seen.size >= 60) return seen.has(id);
      const response = await fetch(`/api/module?code=${encodeURIComponent(id)}`);
      if (!response.ok) return false;
      const module = await response.json();
      seen.set(id, {
        id, type: 'module', position: { x: depth * 280, y: 80 + seen.size * 120 },
        data: { courseCode: id, courseName: module.title, color: depth ? '#e0f7fa' : '#ffeb3b', description: module.description }
      });
      let prereqEntries;
      if (module.prereqTree) {
        prereqEntries = await resolvePrereqNode(module.prereqTree, 'all', id, module.title, isAlreadyPresent);
      } else {
        // Fallback for modules NUSMods doesn't provide a structured prereqTree for:
        // parse the free-text prerequisite string instead (coarser - can't tell "any"
        // groups apart from "all" groups if the text mixes both).
        const prerequisiteText = module.prerequisite || '';
        const prereqs = [...new Set(prerequisiteText.match(/[A-Z]{2,4}\d{4}[A-Z]?/g) || [])];
        const requirement = /\bor\b/i.test(prerequisiteText) ? 'any' : 'all';
        const alreadyChosen = prereqs.filter(isAlreadyPresent);
        let chosenPrereqs;
        if (alreadyChosen.length > 0) {
          chosenPrereqs = alreadyChosen;
        } else if (requirement === 'any' && prereqs.length > 1) {
          const options = prereqs.map((code) => ({ id: code, label: code }));
          chosenPrereqs = await askForPrereqChoice(id, module.title, options);
        } else {
          chosenPrereqs = prereqs;
        }
        prereqEntries = chosenPrereqs.map((code) => ({ code, requirement }));
      }

      // A code can appear in more than one branch (rare) - keep its first resolution.
      const seenCodes = new Set();
      const uniqueEntries = prereqEntries.filter(({ code }) => {
        if (seenCodes.has(code)) return false;
        seenCodes.add(code);
        return true;
      });

      for (const { code: prereq, requirement } of uniqueEntries) {
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
      setNodes((currentNodes) => {
        const currentIds = new Set(currentNodes.map(n => n.id));
        const newNodes = [...seen.values()]
          .filter(node => !currentIds.has(node.id))
          .map(node => rootCodes.includes(node.id)
            ? { ...node, data: { ...node.data, color: '#ffeb3b' } }
            : node);
        return [...currentNodes, ...newNodes];
      });
      setEdges((currentEdges) => {
        const existingEdgeIds = new Set(currentEdges.map(e => e.id));
        const newEdges = nextEdges.filter(e => !existingEdgeIds.has(e.id));
        return [...currentEdges, ...newEdges];
      });
      setSelectedNode(null);
      if (failedCodes.length) setTreeError(`Could not load: ${failedCodes.join(', ')}`);
    } else {
      setTreeError(`No modules found for: ${rootCodes.join(', ')}`);
    }
    setIsLoadingTree(false);
  };

  return { moduleCode, setModuleCode, treeError, isLoadingTree, loadPrereqTree, choicePrompt, resolvePrereqChoice };
}
