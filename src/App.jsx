// src/App.jsx
import { useState, useEffect } from 'react';
import { useLifeTree } from './hooks/useLifeTree';
import TreeSection from './components/TreeSection/TreeSection';
import ScheduleSection from './components/ScheduleSection/ScheduleSection';
import ListSection from './components/ListSection/ListSection';
import 'styles/global.css';

function App() {
  const { tree, setTree, list, completedTasks, fetchData, moveTaskToSchedule, completeTask, reorderList } = useLifeTree();
  const [activeTask, setActiveTask] = useState(null);
  const [stagedTask, setStagedTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartComplete = async (task) => {
    if (!activeTask) {
      setActiveTask({ ...task, startTime: new Date().toISOString() });
      setStagedTask(null);
    } else {
      await completeTask(activeTask);
      setActiveTask(null);
    }
  };

  return (
    <div className="App">
      <div className="menu-bar">
        <div className="daily-info">
          <div className="clock">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      <div className="main-layout">
        <TreeSection tree={tree} setTree={setTree} onTreeChange={fetchData} fetchData={fetchData} />
        <ScheduleSection
          completedTasks={completedTasks}
          stagedTask={stagedTask}
          setStagedTask={setStagedTask}
          activeTask={activeTask}
          handleStartComplete={handleStartComplete}
          list={list}
          moveTaskToSchedule={moveTaskToSchedule}
          currentTime={currentTime}
        />
        <ListSection list={list} reorderList={reorderList} /> {/* Pass reorderList */}
      </div>
      <div className="footer"></div>
    </div>
  );
}

export default App;