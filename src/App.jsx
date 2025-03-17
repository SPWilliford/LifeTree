import { useState, useEffect } from 'react';
import 'styles/global.css';
import TreeSection from './components/TreeSection/TreeSection';
import ScheduleSection from './components/ScheduleSection/ScheduleSection';
import ListSection from './components/ListSection/ListSection';

function App() {
  const [tree, setTree] = useState(null);
  const [list, setList] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [stagedTask, setStagedTask] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/tree')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched tree:', data);
        setTree(data);
        const tasks = getTasks(data);
        console.log('Tasks for list:', tasks);
        setList(tasks);
      })
      .catch((err) => console.error('Fetch tree failed:', err));

    fetch('http://localhost:5000/api/completed')
      .then((res) => res.json())
      .then((data) => setCompletedTasks(data))
      .catch((err) => console.error('Fetch completed failed:', err));
  }, []);

  useEffect(() => {
    if (tree) {
      setList(getTasks(tree));
      fetch('http://localhost:5000/api/tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tree),
      }).catch((err) => console.error('Sync tree failed:', err));
    }
  }, [tree]);

  const getTasks = (node) => {
    if (!node) return [];
    if (node.isTask && (!node.children || node.children.length === 0)) return [node.name];
    return node.children ? node.children.flatMap(getTasks) : [];
  };

  const removeTaskFromTree = (node, taskName) => {
    if (!node) return null;
    if (node.isTask && node.name === taskName && (!node.children || node.children.length === 0)) return null;
    if (node.children) {
      node.children = node.children.map((child) => removeTaskFromTree(child, taskName)).filter(Boolean);
    }
    return node;
  };

  const handleStartComplete = (task) => {
    if (!activeTask) {
      setActiveTask({ task: stagedTask, startTime: new Date().toISOString() });
      setStagedTask(null);
    } else if (activeTask.task === task) {
      const endTime = new Date().toISOString();
      fetch('http://localhost:5000/api/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: activeTask.task, startTime: activeTask.startTime, endTime }),
      })
        .then(() => {
          setCompletedTasks((prev) => [...prev, { task: activeTask.task, startTime: activeTask.startTime, endTime }]);
          const updatedTree = removeTaskFromTree(tree, activeTask.task);
          console.log('Updated tree:', updatedTree);
          setTree(updatedTree); // Triggers list update via useEffect
          setActiveTask(null);
        })
        .catch((err) => console.error('Complete task failed:', err));
    }
  };

  return (
    <div className="App">
      <div className="menu-bar"></div>
      <div className="main-layout">
        <TreeSection tree={tree} setTree={setTree} />
        <ScheduleSection 
          completedTasks={completedTasks} 
          stagedTask={stagedTask} 
          setStagedTask={setStagedTask} 
          activeTask={activeTask} 
          handleStartComplete={handleStartComplete} 
          list={list} // Pass list
          setList={setList} // Pass setList
        />
        <ListSection list={list} setList={setList} />
      </div>
      <div className="footer"></div>
    </div>
  );
}

export default App;