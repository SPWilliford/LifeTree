import { useState, useRef, useEffect } from 'react';
import './ScheduleSection.css';
import './TimeSection.css';
import styles from './TaskSection.module.css';
import './HourlyView.css';

function ScheduleSection({ completedTasks, stagedTask, setStagedTask, activeTask, handleStartComplete, list, setList, currentTime }) {
  const [numHours, setNumHours] = useState(12);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollContainerRef = useRef(null);

  const totalHours = 24;
  const maxScroll = totalHours - numHours;
  const slotHeight = containerHeight / numHours || 40;

  useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
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

  const renderHourSlot = (hour, index, viewStartHour, currentTime) => {
    const displayTime = format12Hour(hour);
    const isoTime = `${currentTime.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`;
    const isCurrentHour = hour === currentTime.getHours();
    const minutes = isCurrentHour ? currentTime.getMinutes() : 0;
    const completedTask = completedTasks.find((t) => t.endTime === isoTime);

    return (
      <div
        key={index}
        className={`hour-slot ${isCurrentHour ? 'current-slot' : ''} ${index === totalHours - 1 ? 'last-slot' : ''}`}
        style={{ height: `${slotHeight}px` }}
      >
        <div className="time-markers">
          <span className="hour-label">{displayTime}</span>
          {index === totalHours - 1 && (
            <span className="hour-label end-label">
              {format12Hour((viewStartHour + totalHours) % 24)}
            </span>
          )}
          <div className="hour-mark" />
          {index === totalHours - 1 && <div className="hour-mark end-mark" />}
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

  const renderActiveTaskOverlay = () => {
    if (!activeTask || !activeTask.startTime) return null;

    const start = new Date(activeTask.startTime);
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const now = currentTime;
    const viewStartHour = (currentTime.getHours() - 8 + 24) % 24;
    const startSlotIndex = (startHour - viewStartHour + 24) % 24;
    const endSlotIndex = (currentTime.getHours() - viewStartHour + 24) % 24;

    const top = (startSlotIndex * slotHeight) + ((startMinutes / 60) * slotHeight);
    const endPosition = (endSlotIndex * slotHeight) + ((currentTime.getMinutes() / 60) * slotHeight);
    const height = Math.max(endPosition - top, 2);

    return (
      <div
        className="active-task-overlay"
        style={{
          position: 'absolute',
          top: `${top}px`,
          height: `${height}px`,
          width: '75%',
          right: '10px',
          background: 'rgba(46, 204, 113, 0.2)',
          border: '1px solid var(--accent-2)',
          boxShadow: '0 0 10px var(--accent-2)',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
      />
    );
  };

  const renderCompletedTaskOverlays = () => {
    return completedTasks.map((task, index) => {
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      const startHour = start.getHours();
      const startMinutes = start.getMinutes();
      const endHour = end.getHours();
      const endMinutes = end.getMinutes();
      const viewStartHour = (currentTime.getHours() - 8 + 24) % 24;

      const startSlotIndex = (startHour - viewStartHour + 24) % 24;
      const endSlotIndex = (endHour - viewStartHour + 24) % 24;

      const top = (startSlotIndex * slotHeight) + ((startMinutes / 60) * slotHeight);
      const endPosition = (endSlotIndex * slotHeight) + ((endMinutes / 60) * slotHeight);
      const height = Math.max(endPosition - top, 2);

      return (
        <div
          key={index}
          className="completed-task-overlay"
          style={{
            position: 'absolute',
            top: `${top}px`,
            height: `${height}px`,
            width: '75%',
            right: '10px',
            background: 'var(--base-dark)', // Fill with base-dark
            border: '1px solid var(--mid-tone)', // Border with mid-tone
            opacity: 0.8,
            zIndex: 1,
            boxSizing: 'border-box',
          }}
        />
      );
    });
  };

  const renderHourlyView = () => {
    const slots = [];
    const viewStartHour = (currentTime.getHours() - 8 + 24) % 24;

    for (let i = 0; i < totalHours; i++) {
      const hour = (viewStartHour + i) % 24;
      slots.push(renderHourSlot(hour, i, viewStartHour, currentTime));
    }

    return (
      <div className="hourly-view-wrapper" style={{ height: `${slotHeight * totalHours}px` }}>
        <div className="hourly-view" style={{ position: 'relative' }}>
          {slots}
          {renderCompletedTaskOverlays()}
          {renderActiveTaskOverlay()}
        </div>
      </div>
    );
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const slotHeight = containerHeight / numHours;
    const newOffset = Math.round(scrollTop / slotHeight);
    setScrollOffset(Math.min(Math.max(0, newOffset), maxScroll));
  };

  return (
    <div className="schedule-section">
      <div 
        className={styles.currentTaskArea}
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
      <div className="schedule-controls">
        <button 
          onClick={() => setNumHours((prev) => Math.max(1, prev - 1))} 
          disabled={numHours <= 1}
        >
          -
        </button>
        <button 
          onClick={() => setNumHours((prev) => Math.min(16, prev + 1))}
          disabled={numHours >= 16}
        >
          +
        </button>
      </div>
      <div 
        className="scroll-container" 
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {renderHourlyView()}
      </div>
    </div>
  );
}

export default ScheduleSection;