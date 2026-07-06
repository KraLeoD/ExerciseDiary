const BASE_URL = typeof window !== 'undefined' && window.location
  ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`
  : 'http://localhost:8851/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getExercises: () => request('/exercises'),
  getExercise: (id) => request(`/exercises/${id}`),
  createExercise: (data) => request('/exercises', { method: 'POST', body: JSON.stringify(data) }),
  updateExercise: (id, data) => request(`/exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExercise: (id) => request(`/exercises/${id}`, { method: 'DELETE' }),

  getSets: (date) => request(`/sets${date ? `?date=${date}` : ''}`),
  saveDaySets: (date, sets) => request('/sets/bulk', { method: 'POST', body: JSON.stringify({ date, sets }) }),
  deleteSet: (id) => request(`/sets/${id}`, { method: 'DELETE' }),

  getWeights: () => request('/weight'),
  addWeight: (DATE, WEIGHT) => request('/weight', { method: 'POST', body: JSON.stringify({ DATE, WEIGHT }) }),
  deleteWeight: (id) => request(`/weight/${id}`, { method: 'DELETE' }),
};
