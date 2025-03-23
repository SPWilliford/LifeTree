// src/components/ListSection/ListSection.jsx
import './ListSection.css';

function ListSection({ list, reorderList }) {
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task.instanceId);
  };

  return (
    <div className="list-section">
      <div className="task-list">
        <button onClick={reorderList}>Shuffle</button>
        {list.map((task) => (
          <div
            key={task.instanceId}
            className="task-item"
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
          >
            {task.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListSection;