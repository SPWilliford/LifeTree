// src/components/TreeSection/TreeNode.jsx
import { useState, useEffect } from 'react';
import { safeClone, saveTree } from './treeUtils';
import { setActionDeadline, setRepeat } from '../../api';
import './TreeSection.css';

function TreeNode({ node, setTree, path, tree, onTreeChange, fetchData }) {
  if (!node) return null;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name || '');
  const [contextMenu, setContextMenu] = useState(null);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const handleDoubleClick = () => setIsEditing(true);

  const handleEditSave = () => {
    if (!tree || !editName) return;
    const updatedTree = safeClone(tree);
    let current = updatedTree;
    path.forEach((idx) => (current = current.children[idx]));
    current.name = editName;
    saveTree(updatedTree, 'Edit', setTree, tree, onTreeChange);
    setIsEditing(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  const handleAddChild = () => {
    if (!tree) return;
    const updatedTree = safeClone(tree);
    let current = updatedTree;
    path.forEach((idx) => (current = current.children[idx]));
    current.children = current.children || [];
    const newId = crypto.randomUUID();
    current.children.push({ id: newId, name: 'New Item', children: [] });
    saveTree(updatedTree, 'Add Child', setTree, tree, onTreeChange);
    setIsExpanded(true);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!tree || path.length === 0) return;
    const updatedTree = safeClone(tree);
    let parent = updatedTree;
    path.slice(0, -1).forEach((idx) => (parent = parent.children[idx]));
    parent.children.splice(path[path.length - 1], 1);
    if (parent.children.length === 0) delete parent.children;
    saveTree(updatedTree, 'Delete', setTree, tree, onTreeChange);
    setContextMenu(null);
  };

  const handleToggleAction = () => {
    if (!tree) return;
    const updatedTree = safeClone(tree);
    let current = updatedTree;
    path.forEach((idx) => (current = current.children[idx]));
    current.isAction = !current.isAction;
    saveTree(updatedTree, 'Toggle Action', setTree, tree, onTreeChange);
    setContextMenu(null);
  };

  const handleSetDeadline = () => {
    const deadline = prompt('Enter deadline (e.g., 2025-04-01T12:00Z):');
    if (deadline) {
      const updatedTree = safeClone(tree);
      let current = updatedTree;
      path.forEach((idx) => (current = current.children[idx]));
      current.isAction = true;
      setActionDeadline(current.id, deadline).then(() => {
        saveTree(updatedTree, 'Set Deadline', setTree, tree, onTreeChange);
        setContextMenu(null);
      });
    }
  };

  const handleSetRepeat = () => {
    const frequency = prompt('Enter frequency (e.g., Daily, no quotes):');
    const count = prompt('Enter count (e.g., 3):');
    if (frequency && count && !isNaN(count)) {
      const cleanFrequency = frequency.replace(/^["']|["']$/g, '');
      if (!cleanFrequency) return;
      const updatedTree = safeClone(tree);
      let current = updatedTree;
      path.forEach((idx) => (current = current.children[idx]));
      current.isAction = true;
      const cleanName = current.name.replace(/Daily (.+) \(\d+\)/, '$1').replace(/Daily /, '');
      current.name = cleanName;
      console.log('Setting repeat:', { treeId: current.id, frequency: cleanFrequency, count: parseInt(count) });
      setRepeat(current.id, cleanFrequency, parseInt(count)).then(() => {
        console.log('Repeat set successfully');
        saveTree(updatedTree, 'Set Repeat', setTree, tree, onTreeChange);
        fetchData(); // Refresh task list
        setContextMenu(null);
      }).catch(err => console.error('Set repeat failed:', err));
    }
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
          onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
        >
          <button onClick={handleAddChild}>Add Child</button>
          <button onClick={handleToggleAction}>{node.isAction ? 'Unmark as Action' : 'Mark as Action'}</button>
          {node.isAction && <button onClick={handleSetDeadline}>Set Deadline</button>}
          {node.isAction && <button onClick={handleSetRepeat}>Set Repeat</button>}
          {path.length > 0 && <button onClick={handleDelete}>Delete</button>}
        </div>
      )}
      {isExpanded && node.children && (
        <div className="tree-children">
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              setTree={setTree}
              path={[...path, idx]}
              tree={tree}
              onTreeChange={onTreeChange}
              fetchData={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;