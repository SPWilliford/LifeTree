import './ListSection.css';

function ListSection({ list, setList }) {
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task);
  };

  return (
    <div className="list-section">
      <div className="task-list">
        {list.map((task, index) => (
          <div
            key={index}
            className="task-item" /* No top-task */
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
          >
            {task}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListSection;