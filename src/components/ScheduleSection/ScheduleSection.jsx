// src/components/ScheduleSection/ScheduleSection.jsx
import { useState } from 'react';
import TaskArea from './TaskArea';
import ScheduleControls from './ScheduleControls';
import HourlyView from './HourlyView';
import './ScheduleSection.css';

function ScheduleSection({ completedTasks, stagedTask, setStagedTask, activeTask, handleStartComplete, list, moveTaskToSchedule, currentTime }) {
  const [numHours, setNumHours] = useState(12);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  return (
    <div className="schedule-section">
      <TaskArea
        stagedTask={stagedTask}
        setStagedTask={setStagedTask}
        activeTask={activeTask}
        handleStartComplete={handleStartComplete}
        list={list}
        moveTaskToSchedule={moveTaskToSchedule} // Add this
      />
      <ScheduleControls numHours={numHours} setNumHours={setNumHours} />
      <HourlyView
        numHours={numHours}
        completedTasks={completedTasks}
        activeTask={activeTask}
        currentTime={currentTime}
        scrollOffset={scrollOffset}
        setScrollOffset={setScrollOffset}
        containerHeight={containerHeight}
        setContainerHeight={setContainerHeight}
      />
    </div>
  );
}

export default ScheduleSection;