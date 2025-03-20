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
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name || '');
  const [contextMenu, setContextMenu] = useState(null);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const safeClone = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('Clone error:', e);
      return { ...obj };
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (!tree || !editName) return;
    const updatedTree = safeClone(tree);
    let current = updatedTree;
    path.forEach((idx) => (current = current.children[idx]));
    current.name = editName;
    setTree(updatedTree);
    fetch('http://localhost:5000/api/tree', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTree),
    }).catch((err) => console.error('Save tree failed:', err));
    setIsEditing(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  const handleAddChild = () => {
    if (!tree) return;
    const updatedTree = safeClone(tree);
    let current = updatedTree;
    path.forEach((idx) => (current = current.children[idx]));
    current.children = current.children || [];
    current.children.push({ name: 'New Item', isTask: node.isTask || false, children: [] });
    setTree(updatedTree);
    setIsExpanded(true);
    fetch('http://localhost:5000/api/tree', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTree),
    }).catch((err) => console.error('Add child failed:', err));
    setContextMenu(null);
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
    setContextMenu(null);
  };

  useEffect(() => {
    setEditName(node.name || '');
  }, [node.name]);

  return (
    <div className="tree-node" onContextMenu={handleContextMenu}>
      <div className="tree-node-content">
        {isEditing ? (
          <span className="tree-node-editing">
            <span className="expand-icon" onClick={toggleExpand}>
              {isExpanded ? '▼' : '▶'}
            </span>
            <input
              className="tree-node-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); }}
              style={{ width: `${editName.length + 1}ch` }}
              autoFocus
            />
          </span>
        ) : (
          <span className="tree-node-name">
            <span className="expand-icon" onClick={toggleExpand}>
              {isExpanded ? '▼' : '▶'}
            </span>
            <span onDoubleClick={handleDoubleClick}>{node.name || 'Unnamed'}</span>
          </span>
        )}
      </div>
      {contextMenu && (
        <div
          className="context-menu"
          style={{ position: 'absolute', left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button onClick={handleAddChild}>Add Child</button>
          {path.length > 0 && <button onClick={handleDelete}>Delete</button>}
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