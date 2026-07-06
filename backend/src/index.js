const express = require('express');
const cors = require('cors');
const path = require('path');
const { initialize } = require('./db');
const exerciseRoutes = require('./routes/exercises');
const setRoutes = require('./routes/sets');
const weightRoutes = require('./routes/weight');

const app = express();
const PORT = process.env.PORT || 8851;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

app.use('/api/exercises', exerciseRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/weight', weightRoutes);

const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(frontendPath, 'index.html'));
});

async function start() {
  await initialize();
  app.listen(PORT, HOST, () => {
    console.log(`ExerciseDiary running on http://${HOST}:${PORT}`);
  });
}

start();
