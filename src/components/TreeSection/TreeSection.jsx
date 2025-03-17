import { useState, useEffect } from 'react';
import './TreeSection.css';

function TreeSection({ tree, setTree }) {
  if (!tree) return null;
  return (
    <div className="tree-section">
      <TreeNode node={tree} setTree={setTree} path={[]} tree={tree} />
    </div>
  );
}

function TreeNode({ node, setTree, path, tree }) {
  if (!node) return null;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('New Item');
  const [isTask, setIsTask] = useState(node.isTask || false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const safeClone = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('Clone error:', e);
      return { ...obj };
    }
  };

  const handleAddChild = () => {
    setShowAddForm(true); // Show form instead of adding directly
  };

  const submitAddChild = () => {
    if (!tree || !newName) return;
    const updatedTree = safeClone(tree);
    let current = updatedTree;
    path.forEach((idx) => (current = current.children[idx]));
    const newIsTask = node.isTask ? true : isTask; // Inherit or user choice
    current.children.push({ name: newName, isTask: newIsTask, children: [] });
    setTree(updatedTree);
    setIsExpanded(true);
    setShowAddForm(false);
    setNewName('New Item');
    setIsTask(false); // Reset for next add

    fetch('http://localhost:5000/api/tree', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTree),
    }).catch((err) => console.error('Add child failed:', err));
  };

  const handleEdit = () => {
    if (isEditing) {
      if (!tree) {
        console.error('No tree to edit');
        return;
      }
      const updatedTree = safeClone(tree);
      let current = updatedTree;
      path.forEach((idx) => (current = current.children[idx]));
      current.name = editName;
      setTree(updatedTree);
      fetch('http://localhost:5000/api/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTree),
      }).catch((err) => console.error('Edit tree failed:', err));
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    if (!tree || path.length === 0) return;
    const updatedTree = safeClone(tree);
    let parent = updatedTree;
    path.slice(0, -1).forEach((idx) => (parent = parent.children[idx]));
    parent.children.splice(path[path.length - 1], 1);
    setTree(updatedTree);
    fetch('http://localhost:5000/api/tree', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTree),
    }).catch((err) => console.error('Delete tree failed:', err));
  };

  useEffect(() => {
    setEditName(node.name || '');
  }, [node.name]);

  return (
    <div className="tree-node">
      <div className="tree-node-content">
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleEdit}
            autoFocus
          />
        ) : (
          <span onClick={toggleExpand} className="tree-node-name">
            {node.children && node.children.length > 0 && (
              <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
            )}
            {node.name || 'Unnamed'}
          </span>
        )}
        <div className="tree-node-actions">
          <button onClick={handleAddChild}>+</button>
          <button onClick={handleEdit}>{isEditing ? 'Save' : 'Edit'}</button>
          {path.length > 0 && <button onClick={handleDelete}>Delete</button>}
        </div>
      </div>
      {showAddForm && (
        <div className="add-form">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter name"
            autoFocus
          />
          {!node.isTask && (
            <label>
              <input
                type="checkbox"
                checked={isTask}
                onChange={(e) => setIsTask(e.target.checked)}
              />
              Task?
            </label>
          )}
          <button onClick={submitAddChild}>Add</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}
      {isExpanded && node.children && (
        <div className="tree-children">
          {node.children.map((child, idx) => (
            <TreeNode
              key={idx}
              node={child}
              setTree={setTree}
              path={[...path, idx]}
              tree={tree}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeSection;