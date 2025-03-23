// src/api/index.js
export const fetchTree = () =>
  fetch('http://localhost:5000/api/tree').then(res => res.json());

export const fetchDailyTasks = (query = '') =>
  fetch(`http://localhost:5000/api/daily-tasks${query}`).then(res => res.json());

export const fetchCompletedTasks = () =>
  fetch('http://localhost:5000/api/completed').then(res => res.json());

export const completeTask = (task) =>
  fetch('http://localhost:5000/api/completed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  }).then(res => res.json());

export const updateTree = (treeData) =>
  fetch('http://localhost:5000/api/tree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(treeData),
  }).then(res => res.json());

export const setActionDeadline = (treeId, deadline) =>
  fetch('http://localhost:5000/api/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tree_id: treeId, deadline }),
  }).then(res => res.json());

export const setRepeat = (treeId, frequency, count) =>
  fetch('http://localhost:5000/api/repeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ treeId, frequency, count }),
  }).then(res => res.json());