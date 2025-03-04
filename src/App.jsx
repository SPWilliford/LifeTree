import { useState } from 'react';
import './App.css';

function App() {
  const [tree] = useState({
    name: "Live a Good Life",
    children: [
      { name: "Health", children: [{ name: "Body", children: [{ name: "Run for 30 mins" }] }] },
      { name: "Wealth", children: [{ name: "Work", children: [{ name: "Finish report" }] }] },
    ],
  });

  const getTasks = (node) => {
    if (!node.children || node.children.length === 0) return [node.name];
    return node.children.flatMap(getTasks);
  };
  const tasks = getTasks(tree);

  return (
    <div className="App">
      <h1>My Life App</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h2>Life Goals</h2>
          <TreeNode node={tree} />
        </div>
        <div>
          <h2>To-Do List</h2>
          <ul>
            {tasks.map((task, idx) => (
              <li key={idx}>{task}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Daily Schedule</h2>
          <p>[Time slots here]</p>
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node }) {
  return (
    <ul>
      <li>
        {node.name}
        {node.children && node.children.map((child, idx) => (
          <TreeNode key={idx} node={child} />
        ))}
      </li>
    </ul>
  );
}

export default App;