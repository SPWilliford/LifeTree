// src/components/TreeSection/TreeSection.jsx
import { useState } from 'react';
import TreeNode from './TreeNode';
import './TreeSection.css';

function TreeSection({ tree, setTree, onTreeChange, fetchData }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!tree) return <div className="tree-section">No Tree</div>;

  return (
    <div className="tree-section">
      <TreeNode
        node={tree}
        setTree={setTree}
        path={[]}
        tree={tree}
        onTreeChange={onTreeChange}
        fetchData={fetchData} // Pass fetchData to TreeNode
      />
    </div>
  );
}

export default TreeSection;