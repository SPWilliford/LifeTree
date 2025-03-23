// src/hooks/useLifeTree.js
import { useState, useEffect } from 'react'; // Fixed: Added useState
import { fetchTree, fetchDailyTasks, fetchCompletedTasks, completeTask as apiCompleteTask } from '../api';

export function useLifeTree() {
  const [tree, setTree] = useState(null);
  const [list, setList] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [shouldReorder, setShouldReorder] = useState(false);

  const enhanceTasks = (tasks, completed) =>
    tasks.flatMap(task => {
      const isCompleted = completed.some(c => c.tree_id === task.id);
      if (task.frequency && task.count > 0) {
        return Array.from({ length: task.count }, (_, i) => {
          const instanceId = `${task.id}-${i}`;
          const completedCount = completed.filter(c => c.tree_id === task.id).length;
          return {
            ...task,
            instanceId,
            isCompleted: isCompleted && i < completedCount,
          };
        }).filter(t => !t.isCompleted);
      }
      return isCompleted ? [] : [{ ...task, instanceId: `${task.id}-0` }];
    });

  const generateDailyList = (tasks, completed) => {
    const enhanced = enhanceTasks(tasks, completed);
    if (shouldReorder || list.length === 0) {
      setShouldReorder(false);
      return enhanced.sort((a, b) => {
        const aWeight = a.weight || 0;
        const bWeight = b.weight || 0;
        return Math.random() * bWeight - Math.random() * aWeight;
      });
    }
    return enhanced; // Keep existing order
  };

  const fetchData = async () => {
    try {
      const treeData = await fetchTree();
      setTree(treeData);
      const timestamp = Date.now();
      const tasks = await fetchDailyTasks(`?t=${timestamp}`);
      const completed = await fetchCompletedTasks();
      setCompletedTasks(completed);
      setList(generateDailyList(tasks, completed));
    } catch (err) {
      console.error('Fetch data failed:', err);
    }
  };

  const reorderList = () => {
    setShouldReorder(true);
    fetchData();
  };

  const moveTaskToSchedule = (instanceId) => {
    const task = list.find(t => t.instanceId === instanceId);
    if (task) {
      setList(prev => prev.filter(t => t.instanceId !== instanceId));
      return task;
    }
    return null;
  };

  const completeTask = async (task) => {
    const endTime = new Date().toISOString();
    await apiCompleteTask({ treeId: task.id, startTime: task.startTime, endTime });
    setCompletedTasks(prev => {
      const newCompleted = [...prev, { tree_id: task.id, start_time: task.startTime, end_time: endTime }];
      setList(prevList => generateDailyList(prevList.map(t => ({ ...t, instanceId: undefined })), newCompleted));
      return newCompleted;
    });
  };

  useEffect(() => { fetchData(); }, []);

  return { tree, setTree, list, completedTasks, fetchData, moveTaskToSchedule, completeTask, reorderList };
}