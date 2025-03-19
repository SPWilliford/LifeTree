import express from 'express';
import sqlite3 from 'better-sqlite3';
import cors from 'cors';

const app = express();
const port = 5000;
const db = sqlite3('./backend/life-tree.db');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS tree (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS completed_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL
  )
`);

app.get('/api/tree', (req, res) => {
  console.log('GET /api/tree called');
  const row = db.prepare('SELECT data FROM tree WHERE id = 1').get();
  if (row) {
    console.log('Found row:', row);
    return res.json(JSON.parse(row.data));
  }
  const defaultTree = {
    name: "Live a Good Life", isTask: false,
    children: [
      { name: "Health", isTask: false, children: [
        { name: "Body", isTask: false, children: [
          { name: "Run for 30 mins", isTask: true }
        ] }
      ] },
      { name: "Wealth", isTask: false, children: [
        { name: "Work", isTask: false, children: [
          { name: "Finish report", isTask: true }
        ] }
      ] }
    ],
  };
  console.log('Inserting default tree:', defaultTree);
  db.prepare('INSERT INTO tree (id, data) VALUES (1, ?)').run(JSON.stringify(defaultTree));
  res.json(defaultTree);
});

app.post('/api/tree', (req, res) => {
  console.log('POST /api/tree received:', req.body);
  const treeData = JSON.stringify(req.body);
  db.prepare('REPLACE INTO tree (id, data) VALUES (1, ?)').run(treeData);
  res.json({ message: 'Tree updated', tree: req.body });
});

app.get('/api/completed', (req, res) => {
  console.log('GET /api/completed called');
  const rows = db.prepare('SELECT task, startTime, endTime FROM completed_tasks').all();
  res.json(rows);
});

app.post('/api/completed', (req, res) => {
  const { task, startTime, endTime } = req.body;
  console.log('POST /api/completed received:', { task, startTime, endTime });
  db.prepare('INSERT INTO completed_tasks (task, startTime, endTime) VALUES (?, ?, ?)').run(task, startTime, endTime);
  res.json({ message: 'Task completed', task, startTime, endTime });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});