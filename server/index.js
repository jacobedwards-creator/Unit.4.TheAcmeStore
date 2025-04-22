const express = require('express');
const {
  client,
  createTables,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite
} = require('./db');

const app = express();
app.use(express.json());

// Routes (same as before)
app.get('/api/users', async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

// ... (keep all other routes the same)

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

const init = async () => {
  await client.connect();
  console.log('Connected to database');
  
  await createTables();
  console.log('Tables created');
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
};

init();