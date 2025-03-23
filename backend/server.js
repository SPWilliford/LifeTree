// server.js
import express from 'express';
import sqlite3 from 'better-sqlite3';
import cors from 'cors';

const app = express();
const port = 5000;
const db = sqlite3('./backend/life-tree.db');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Helper function for inherited weights
function getInheritedWeight(treeId) {
  const row = db.prepare(`
    WITH RECURSIVE ancestors AS (
      SELECT id, parent_id FROM tree WHERE id = ?
      UNION ALL
      SELECT t.id, t.parent_id FROM tree t
      JOIN ancestors a ON t.id = a.parent_id
    )
    SELECT np.weight
    FROM ancestors a
    JOIN node_priorities np ON a.id = np.tree_id
    WHERE np.weight IS NOT NULL
    ORDER BY a.id DESC LIMIT 1
  `).get(treeId);
  return row ? row.weight : 10;
}

// GET /api/tree
app.get('/api/tree', (req, res) => {
  const rows = db.prepare(`
    SELECT t.id, t.parent_id, nd.name, nd.description, a.deadline, np.weight
    FROM tree t
    LEFT JOIN node_details nd ON t.id = nd.tree_id
    LEFT JOIN actions a ON t.id = a.tree_id
    LEFT JOIN node_priorities np ON t.id = np.tree_id
  `).all();
  const buildTree = (parentId = null) => {
    return rows.filter(row => row.parent_id === parentId).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      weight: row.weight !== null ? row.weight : getInheritedWeight(row.id),
      isAction: !!db.prepare('SELECT COUNT(*) as count FROM actions WHERE tree_id = ?').get(row.id).count,
      children: buildTree(row.id),
    }));
  };
  res.json(buildTree()[0]);
});

// POST /api/tree
app.post('/api/tree', (req, res) => {
  const newTree = req.body;
  const updateTree = (node, parentId = null) => {
    let nodeId = node.id;
    if (!nodeId) {
      const { lastInsertRowid } = db.prepare('INSERT INTO tree (parent_id) VALUES (?)').run(parentId);
      nodeId = lastInsertRowid;
      db.prepare('INSERT INTO node_details (tree_id, name) VALUES (?, ?)').run(nodeId, node.name || 'Unnamed');
    } else {
      db.prepare('UPDATE tree SET parent_id = ? WHERE id = ?').run(parentId, nodeId);
      db.prepare('INSERT OR REPLACE INTO node_details (tree_id, name, description) VALUES (?, ?, ?)').run(nodeId, node.name, node.description || null);
      if (node.hasOwnProperty('isAction') && !node.isAction) {
        db.prepare('DELETE FROM actions WHERE tree_id = ?').run(nodeId);
      }
    }
    if (node.children) node.children.forEach(child => updateTree(child, nodeId));
    return nodeId;
  };

  const newIds = new Set();
  const collectIds = (node) => { if (node.id) newIds.add(node.id); if (node.children) node.children.forEach(collectIds); };
  collectIds(newTree);
  const allIds = db.prepare('SELECT id FROM tree').all().map(row => row.id);
  const idsToDelete = allIds.filter(id => !newIds.has(id));

  if (idsToDelete.length > 0) {
    db.prepare(`DELETE FROM tree WHERE id IN (${idsToDelete.map(() => '?').join(',')})`).run(...idsToDelete);
  }

  updateTree(newTree);
  res.json({ message: 'Tree updated' });
});

// GET /api/daily-tasks
app.get('/api/daily-tasks', (req, res) => {
  const tasks = db.prepare(`
    SELECT t.id, nd.name, t.parent_id, np.weight, ra.frequency, ra.count
    FROM tree t
    JOIN node_details nd ON t.id = nd.tree_id
    JOIN actions a ON t.id = a.tree_id
    LEFT JOIN node_priorities np ON t.id = np.tree_id
    LEFT JOIN repeated_actions ra ON t.id = ra.tree_id
  `).all();
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json(tasks.map(task => ({ ...task, weight: task.weight !== null ? task.weight : getInheritedWeight(task.id) })));
});

// POST /api/completed
app.post('/api/completed', (req, res) => {
  const { treeId, startTime, endTime } = req.body;
  db.prepare('INSERT INTO completed_actions (tree_id, start_time, end_time) VALUES (?, ?, ?)').run(treeId, startTime, endTime);
  res.json({ message: 'Task completed' });
});

// POST /api/actions
app.post('/api/actions', (req, res) => {
  const { tree_id, deadline } = req.body;
  db.prepare('INSERT OR REPLACE INTO actions (tree_id, deadline) VALUES (?, ?)').run(tree_id, deadline || null);
  res.json({ message: 'Action updated' });
});

// POST /api/repeat
app.post('/api/repeat', (req, res) => {
  const { treeId, frequency, count } = req.body;
  db.exec('BEGIN TRANSACTION');
  try {
    const actionExists = db.prepare('SELECT COUNT(*) as count FROM actions WHERE tree_id = ?').get(treeId).count;
    if (!actionExists) {
      db.prepare('INSERT INTO actions (tree_id) VALUES (?)').run(treeId);
    }
    const stmt = db.prepare('INSERT OR REPLACE INTO repeated_actions (tree_id, frequency, count, "interval") VALUES (?, ?, ?, 1)');
    stmt.run(treeId, frequency, count);
    db.exec('COMMIT');
    res.json({ message: 'Repeat set' });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to set repeat', details: err.message });
  }
});

// GET /api/completed
app.get('/api/completed', (req, res) => {
  const rows = db.prepare('SELECT tree_id, start_time, end_time FROM completed_actions').all();
  res.json(rows);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});