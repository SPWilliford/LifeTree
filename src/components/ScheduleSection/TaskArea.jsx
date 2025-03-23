// src/components/ScheduleSection/TaskArea.jsx
import styles from './TaskArea.module.css';

function TaskArea({ stagedTask, setStagedTask, activeTask, handleStartComplete, list, moveTaskToSchedule }) {
  const handleDrop = (e) => {
    e.preventDefault();
    const instanceId = e.dataTransfer.getData('text/plain');
    const task = moveTaskToSchedule(instanceId);
    if (task) setStagedTask(task);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className={styles.currentTaskArea} onDrop={handleDrop} onDragOver={handleDragOver}>
      {activeTask ? (
        <div className={`${styles.currentTask} ${styles.active}`}>
          <span className={styles.taskText}>{activeTask.task}</span>
          <button className={styles.taskButton} onClick={() => handleStartComplete(activeTask)}>
            Complete
          </button>
        </div>
      ) : stagedTask ? (
        <div className={`${styles.currentTask} ${styles.staged}`}>
          <span className={styles.taskText}>{stagedTask.name}</span>
          <button className={styles.taskButton} onClick={() => handleStartComplete(stagedTask)}>
            Start
          </button>
        </div>
      ) : (
        <div className={`${styles.currentTask} ${styles.placeholder}`}>Drop a Task</div>
      )}
    </div>
  );
}

export default TaskArea;