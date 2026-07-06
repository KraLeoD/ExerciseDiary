const { Router } = require('express');
const { query, run } = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const weights = query('SELECT * FROM weight ORDER BY ID ASC');
  res.json(weights);
});

router.post('/', (req, res) => {
  const { DATE, WEIGHT } = req.body;
  const id = run('INSERT INTO weight (DATE, WEIGHT) VALUES (?, ?)', [DATE, WEIGHT || 0]);
  res.json({ ID: id });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM weight WHERE ID = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
