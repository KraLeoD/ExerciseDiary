const { Router } = require('express');
const { query, run, persist } = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const { date } = req.query;
  if (date) {
    const sets = query('SELECT * FROM sets WHERE DATE = ? ORDER BY ID ASC', [date]);
    return res.json(sets);
  }
  const sets = query('SELECT * FROM sets ORDER BY ID ASC');
  res.json(sets);
});

router.post('/bulk', (req, res) => {
  const { date, sets } = req.body;

  run('DELETE FROM sets WHERE DATE = ?', [date]);
  for (const s of sets) {
    run('INSERT INTO sets (DATE, NAME, COLOR, WEIGHT, REPS) VALUES (?, ?, ?, ?, ?)',
      [date, s.NAME || '', s.COLOR || '', s.WEIGHT || 0, parseInt(s.REPS, 10) || 0]);
  }
  persist();
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM sets WHERE ID = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
