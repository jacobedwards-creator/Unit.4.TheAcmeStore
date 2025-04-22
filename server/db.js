const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
require("dotenv").config();

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_store_db"
);

const SALT_ROUNDS = 10;

async function createTables() {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      UNIQUE(user_id, product_id)
    );
  `;
  await client.query(SQL);
}

async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
  return response.rows[0];
}

async function createProduct({ name }) {
  const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
}

async function fetchUsers() {
  const SQL = `SELECT id, username FROM users`;
  const response = await client.query(SQL);
  return response.rows;
}

async function fetchProducts() {
  const SQL = `SELECT * FROM products`;
  const response = await client.query(SQL);
  return response.rows;
}

async function createFavorite({ product_id, user_id }) {
  const SQL = `
    INSERT INTO favorites(id, product_id, user_id) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
}

async function fetchFavorites(user_id) {
  const SQL = `
    SELECT * FROM favorites 
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
}

async function destroyFavorite({ id, user_id }) {
  const SQL = `
    DELETE FROM favorites WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
}

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite
};