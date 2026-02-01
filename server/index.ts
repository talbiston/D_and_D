import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { initializeDatabase, getDatabase } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Create character endpoint
app.post('/api/characters', (req, res) => {
  const characterData = req.body;

  // Validate request body
  if (!characterData || typeof characterData !== 'object' || Object.keys(characterData).length === 0) {
    res.status(400).json({ error: 'Invalid or missing character data' });
    return;
  }

  const id = nanoid();
  const now = new Date().toISOString();
  const name = characterData.name || 'Unnamed Character';

  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO characters (id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(id, name, JSON.stringify(characterData), now, now);

  res.status(201).json({ id, ...characterData });
});

// Get character by ID endpoint
app.get('/api/characters/:id', (req, res) => {
  const { id } = req.params;

  const db = getDatabase();
  const stmt = db.prepare('SELECT id, data FROM characters WHERE id = ?');
  const row = stmt.get(id) as { id: string; data: string } | undefined;

  if (!row) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  const characterData = JSON.parse(row.data);
  res.json({ id: row.id, ...characterData });
});

// Update character by ID endpoint
app.put('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  const characterData = req.body;

  // Validate request body
  if (!characterData || typeof characterData !== 'object' || Object.keys(characterData).length === 0) {
    res.status(400).json({ error: 'Invalid or missing character data' });
    return;
  }

  const db = getDatabase();

  // Check if character exists
  const checkStmt = db.prepare('SELECT id FROM characters WHERE id = ?');
  const exists = checkStmt.get(id) as { id: string } | undefined;

  if (!exists) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  const now = new Date().toISOString();
  const name = characterData.name || 'Unnamed Character';

  const updateStmt = db.prepare(
    'UPDATE characters SET name = ?, data = ?, updated_at = ? WHERE id = ?'
  );
  updateStmt.run(name, JSON.stringify(characterData), now, id);

  res.json({ id, ...characterData });
});

// Delete character by ID endpoint
app.delete('/api/characters/:id', (req, res) => {
  const { id } = req.params;

  const db = getDatabase();

  // Check if character exists
  const checkStmt = db.prepare('SELECT id FROM characters WHERE id = ?');
  const exists = checkStmt.get(id) as { id: string } | undefined;

  if (!exists) {
    res.status(404).json({ error: 'Character not found' });
    return;
  }

  const deleteStmt = db.prepare('DELETE FROM characters WHERE id = ?');
  deleteStmt.run(id);

  res.json({ success: true });
});

// Initialize database
initializeDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
