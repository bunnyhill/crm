const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async () => {
  console.log('-------------------------------------');

  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    console.log('SQL Server Connected', rows);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }

  console.log('-------------------------------------');
};

testConnection();

module.exports = pool;
