import express from 'express';
import sqlite3 from 'better-sqlite3';
import cors from 'cors';

const app = express();
const port = 5000;
const db = sqlite3('./backend/life-tree.db');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Schema Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS trees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    is_task BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (parent_id) REFERENCES trees(id)
  );
  CREATE TABLE IF NOT EXISTS completed_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tree_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    FOREIGN KEY (tree_id) REFERENCES trees(id)
  );
`);

// Initialize Default Root (If Empty)
const rows = db.prepare('SELECT COUNT(*) as count FROM trees').get();
if (rows.count === 0) {
  db.prepare('INSERT INTO trees (name, is_task) VALUES (?, ?)').run("My LifeTree", 0);
}

// Get Tree
app.get('/api/tree', (req, res) => {
  const rows = db.prepare('SELECT * FROM trees').all();
  const buildTree = (parentId = null) => {
    return rows.filter(row => row.parent_id === parentId).map(row => ({
      id: row.id,
      name: row.name,
      isTask: !!row.is_task,
      children: buildTree(row.id),
    }));
  };
  res.json(buildTree()[0]);
});

// Update Tree (Targeted Update)
app.post('/api/tree', (req, res) => {
  const updateTree = (node, parentId = null) => {
    const existing = node.id ? db.prepare('SELECT id FROM trees WHERE id = ?').get(node.id) : null;
    let nodeId;
    if (existing) {
      db.prepare('UPDATE trees SET name = ?, parent_id = ?, is_task = ? WHERE id = ?').run(node.name, parentId, node.isTask ? 1 : 0, node.id);
      nodeId = node.id;
    } else {
      const { lastInsertRowid } = db.prepare('INSERT INTO trees (name, parent_id, is_task) VALUES (?, ?, ?)').run(node.name, parentId, node.isTask ? 1 : 0);
      nodeId = lastInsertRowid;
    }
    if (node.children) node.children.forEach(child => updateTree(child, nodeId));
    return nodeId;
  };
  updateTree(req.body);
  res.json({ message: 'Tree updated' });
});

// Get Daily Tasks
app.get('/api/daily-tasks', (req, res) => {
  const tasks = db.prepare('SELECT id, name FROM trees WHERE is_task = 1').all();
  const dailyList = [];
  tasks.forEach(t => {
    const match = t.name.match(/Daily (.+) \((\d+)\)/);
    if (match) {
      const [, name, count] = match;
      for (let i = 0; i < parseInt(count); i++) {
        dailyList.push({ treeId: t.id, name: `${name}${count > 1 ? ` #${i + 1}` : ''}` });
      }
    } else {
      dailyList.push({ treeId: t.id, name: t.name });
    }
  });
  res.json(dailyList);
});

// Log Completed Tasks
app.post('/api/completed', (req, res) => {
  const { treeId, task, startTime, endTime } = req.body;
  db.prepare('INSERT INTO completed_tasks (tree_id, task, start_time, end_time) VALUES (?, ?, ?, ?)').run(treeId, task, startTime, endTime);
  res.json({ message: 'Task completed' });
});

// Get Completed Tasks
app.get('/api/completed', (req, res) => {
  const rows = db.prepare('SELECT tree_id, task, start_time, end_time FROM completed_tasks').all();
  res.json(rows);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});