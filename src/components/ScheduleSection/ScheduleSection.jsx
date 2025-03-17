import { useState, useEffect } from 'react';
import './ScheduleSection.css';
import './TimeSection.css';
import styles from './TaskSection.module.css'; // Module import
import './HourlyView.css';

function ScheduleSection({ completedTasks, stagedTask, setStagedTask, activeTask, handleStartComplete, list, setList }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const task = e.dataTransfer.getData('text/plain');
    setStagedTask(task);
    setList(list.filter((t) => t !== task));
  };

  const handleDragOver = (e) => e.preventDefault();

  const format12Hour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderHourSlot = (hour, index, startHour, currentTime, isLast = false) => {
    const displayTime = format12Hour(hour);
    const isoTime = `${currentTime.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`;
    const isCurrentHour = index === 0;
    const minutes = isCurrentHour ? currentTime.getMinutes() : 0;
    const completedTask = completedTasks.find((t) => t.endTime === isoTime);

    return (
      <div
        key={index}
        className={`hour-slot ${isCurrentHour ? 'first-slot' : ''} ${isLast ? 'last-slot' : ''}`}
      >
        <div className="time-markers">
          <span className="hour-label">{displayTime}</span>
          {isLast && (
            <span className="hour-label end-label">
              {format12Hour((startHour + 12) % 24)}
            </span>
          )}
          <div className="hour-mark" />
          {isLast && <div className="hour-mark end-mark" />}
          <div className="quarter-mark quarter-15" />
          <div className="quarter-mark quarter-30" />
          <div className="quarter-mark quarter-45" />
        </div>
        <div className="slot-content">
          {completedTask && <div className="task completed">{completedTask.task}</div>}
        </div>
        {isCurrentHour && (
          <div
            className="time-indicator"
            style={{ top: `${(minutes / 60) * 100}%` }}
          />
        )}
      </div>
    );
  };

  const renderHourlyView = () => {
    const slots = [];
    const now = new Date(currentTime);
    const startHour = now.getHours();

    for (let i = 0; i < 12; i++) {
      const hour = (startHour + i) % 24;
      const isLast = i === 11;
      slots.push(renderHourSlot(hour, i, startHour, now, isLast));
    }

    return <div className="hourly-view">{slots}</div>;
  };

  return (
    <div className="schedule-section">
      <div className="current-time-area">
        <div className="clock">{formatTime(currentTime)}</div>
      </div>
      <div 
        className={styles.currentTaskArea} /* Scoped */
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {activeTask ? (
          <div className={`${styles.currentTask} ${styles.active}`}>
            <span className={styles.taskText}>{activeTask.task}</span>
            <button className={styles.taskButton} onClick={() => handleStartComplete(activeTask.task)}>Complete</button>
          </div>
        ) : stagedTask ? (
          <div className={`${styles.currentTask} ${styles.staged}`}>
            <span className={styles.taskText}>{stagedTask}</span>
            <button className={styles.taskButton} onClick={() => handleStartComplete(stagedTask)}>Start</button>
          </div>
        ) : (
          <div className={`${styles.currentTask} ${styles.placeholder}`}>Drop a Task</div>
        )}
      </div>
      {renderHourlyView()}
    </div>
  );
}

export default ScheduleSection;