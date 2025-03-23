// src/components/ScheduleSection/scheduleUtils.js
export const format12Hour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };
  
  export const renderHourSlot = (hour, index, viewStartHour, currentTime, slotHeight, completedTasks, totalHours) => {
    const displayTime = format12Hour(hour);
    const isoTime = `${currentTime.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`;
    const isCurrentHour = hour === currentTime.getHours();
    const minutes = isCurrentHour ? currentTime.getMinutes() : 0;
    const completedTask = completedTasks.find((t) => t.end_time === isoTime);
  
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
          <div className="time-indicator" style={{ top: `${(minutes / 60) * 100}%` }} />
        )}
      </div>
    );
  };
  
  export const renderActiveTaskOverlay = (activeTask, currentTime, slotHeight, viewStartHour) => {
    if (!activeTask || !activeTask.startTime) return null;
  
    const start = new Date(activeTask.startTime);
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const startSlotIndex = (startHour - viewStartHour + 24) % 24;
    const endSlotIndex = (currentTime.getHours() - viewStartHour + 24) % 24;
  
    const top = startSlotIndex * slotHeight + (startMinutes / 60) * slotHeight;
    const endPosition = endSlotIndex * slotHeight + (currentTime.getMinutes() / 60) * slotHeight;
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
  
  export const renderCompletedTaskOverlays = (completedTasks, currentTime, slotHeight, viewStartHour) => {
    return completedTasks.map((task, index) => {
      const start = new Date(task.start_time);
      const end = new Date(task.end_time);
      const startHour = start.getHours();
      const startMinutes = start.getMinutes();
      const endHour = end.getHours();
      const endMinutes = end.getMinutes();
      const startSlotIndex = (startHour - viewStartHour + 24) % 24;
      const endSlotIndex = (endHour - viewStartHour + 24) % 24;
  
      const top = startSlotIndex * slotHeight + (startMinutes / 60) * slotHeight;
      const endPosition = endSlotIndex * slotHeight + (endMinutes / 60) * slotHeight;
      const height = Math.max(endPosition - top, 2);
  
      return (
        <div
          key={index}
          className="completed-task-overlay"
          style={{
            top: `${top}px`,
            height: `${height}px`,
          }}
        />
      );
    });
  
  };