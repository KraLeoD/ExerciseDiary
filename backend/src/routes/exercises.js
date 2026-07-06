const { Router } = require('express');
const { query, run } = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const exercises = query('SELECT * FROM exercises ORDER BY ID ASC');
  res.json(exercises);
});

router.get('/:id', (req, res) => {
  const rows = query('SELECT * FROM exercises WHERE ID = ?', [Number(req.params.id)]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/', (req, res) => {
  const { GR, PLACE, NAME, DESCR, IMAGE, COLOR, WEIGHT, REPS } = req.body;
  const id = run(
    'INSERT INTO exercises (GR, PLACE, NAME, DESCR, IMAGE, COLOR, WEIGHT, REPS) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [GR || '', PLACE || '', NAME || '', DESCR || '', IMAGE || '', COLOR || '', WEIGHT || 0, REPS || 0]
  );
  res.json({ ID: id });
});

router.put('/:id', (req, res) => {
  const { GR, PLACE, NAME, DESCR, IMAGE, COLOR, WEIGHT, REPS } = req.body;
  run(
    'UPDATE exercises SET GR=?, PLACE=?, NAME=?, DESCR=?, IMAGE=?, COLOR=?, WEIGHT=?, REPS=? WHERE ID=?',
    [GR || '', PLACE || '', NAME || '', DESCR || '', IMAGE || '', COLOR || '', WEIGHT || 0, REPS || 0, Number(req.params.id)]
  );
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM exercises WHERE ID = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
