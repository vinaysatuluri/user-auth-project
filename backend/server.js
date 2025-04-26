import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Route to fetch all users from the database
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) throw err;
    res.json(result);  // Send back the result as a JSON response
  });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
