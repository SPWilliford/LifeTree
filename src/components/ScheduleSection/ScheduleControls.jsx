// src/components/ScheduleSection/ScheduleControls.jsx
import './ScheduleSection.css';

function ScheduleControls({ numHours, setNumHours }) {
  return (
    <div className="schedule-controls">
      <button
        onClick={() => setNumHours((prev) => Math.min(16, prev + 1))}
        disabled={numHours >= 16}
      >
        - {/* Zoom out, more hours */}
      </button>
      <button
        onClick={() => setNumHours((prev) => Math.max(1, prev - 1))}
        disabled={numHours <= 1}
      >
        + {/* Zoom in, fewer hours */}
      </button>
    </div>
  );
}

export default ScheduleControls;