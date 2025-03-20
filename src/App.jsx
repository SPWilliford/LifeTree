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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/tree')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched tree:', data);
        setTree(data);
      })
      .catch((err) => console.error('Fetch tree failed:', err));

    fetch('http://localhost:5000/api/daily-tasks')
      .then((res) => res.json())
      .then((data) => {
        console.log('Daily tasks:', data);
        fetch('http://localhost:5000/api/completed')
          .then((res) => res.json())
          .then((completed) => {
            const today = new Date().toISOString().split('T')[0];
            const todayCompleted = completed.filter(t => t.end_time.startsWith(today));
            const filteredList = data.filter(task => 
              !todayCompleted.some(ct => ct.tree_id === task.treeId && ct.task === task.name)
            );
            setList(filteredList);
            setCompletedTasks(completed);
          })
          .catch((err) => console.error('Fetch completed failed:', err));
      })
      .catch((err) => console.error('Fetch daily tasks failed:', err));
  }, []);

  const handleStartComplete = (task) => {
    if (!activeTask) {
      // Start: task is { treeId, name }
      setActiveTask({ treeId: task.treeId, task: task.name, startTime: new Date().toISOString() });
      setStagedTask(null);
    } else {
      // Complete: task is { treeId, task, startTime }
      const endTime = new Date().toISOString();
      fetch('http://localhost:5000/api/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treeId: task.treeId, task: task.task, startTime: task.startTime, endTime }),
      })
        .then(() => {
          setCompletedTasks((prev) => [...prev, { tree_id: task.treeId, task: task.task, start_time: task.startTime, end_time: endTime }]);
          setActiveTask(null);
          setList((prev) => prev.filter(t => t.treeId !== task.treeId || t.name !== task.task));
        })
        .catch((err) => console.error('Complete task failed:', err));
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="App">
      <div className="menu-bar">
        <div className="daily-info">
          <div className="clock">{formatTime(currentTime)}</div>
        </div>
      </div>
      <div className="main-layout">
        <TreeSection tree={tree} setTree={setTree} />
        <ScheduleSection 
          completedTasks={completedTasks} 
          stagedTask={stagedTask} 
          setStagedTask={setStagedTask} 
          activeTask={activeTask} 
          handleStartComplete={handleStartComplete} 
          list={list}
          setList={setList}
          currentTime={currentTime}
        />
        <ListSection list={list} setList={setList} />
      </div>
      <div className="footer"></div>
    </div>
  );
}

export default App;