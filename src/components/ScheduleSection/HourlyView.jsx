// src/components/ScheduleSection/HourlyView.jsx
import { useRef, useEffect } from 'react';
import { renderHourSlot, renderActiveTaskOverlay, renderCompletedTaskOverlays } from './hourlyViewRender';
import './HourlyView.css';

function HourlyView({ numHours, completedTasks, activeTask, currentTime, scrollOffset, setScrollOffset, containerHeight, setContainerHeight }) {
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
  }, [setContainerHeight]);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const newOffset = Math.round(scrollTop / slotHeight);
    setScrollOffset(Math.min(Math.max(0, newOffset), maxScroll));
  };

  const viewStartHour = (currentTime.getHours() - 8 + 24) % 24;
  const slots = [];
  for (let i = 0; i < totalHours; i++) {
    const hour = (viewStartHour + i) % 24;
    slots.push(renderHourSlot(hour, i, viewStartHour, currentTime, slotHeight, completedTasks, totalHours));
  }

  return (
    <div className="scroll-container" ref={scrollContainerRef} onScroll={handleScroll}>
      <div className="hourly-view-wrapper" style={{ height: `${slotHeight * totalHours}px` }}>
        <div className="hourly-view" style={{ position: 'relative' }}>
          {slots}
          {renderCompletedTaskOverlays(completedTasks, currentTime, slotHeight, viewStartHour)}
          {renderActiveTaskOverlay(activeTask, currentTime, slotHeight, viewStartHour)}
        </div>
      </div>
    </div>
  );
}

export default HourlyView;