// src/components/TreeSection/treeUtils.js
export const safeClone = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('Clone error:', e);
      return { ...obj };
    }
  };
  
  export const saveTree = async (updatedTree, action, setTree, tree, onTreeChange) => {
    console.log(`Starting ${action}...`);
    try {
      const response = await fetch('http://localhost:5000/api/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTree),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log(`${action} successful:`, data);
      setTree(updatedTree);
      if (onTreeChange) onTreeChange();
    } catch (err) {
      console.error(`${action} failed:`, err);
      setTree(tree); // Revert to original tree on error
    }
  };