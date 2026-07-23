'use client';
import { useEffect, useState } from 'react';
import { loadTreeFromStorage, saveTreeToStorage } from '../lib/treeStorage';

// Loads a previously saved canvas from localStorage on mount, then keeps
// saving to it on every change so a page reload doesn't lose the tree.
export function useTreePersistence(nodes, edges, setNodes, setEdges) {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const saved = loadTreeFromStorage();
    if (saved) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
    }
    setHasLoaded(true);
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (!hasLoaded) return;
    saveTreeToStorage(nodes, edges);
  }, [nodes, edges, hasLoaded]);
}
