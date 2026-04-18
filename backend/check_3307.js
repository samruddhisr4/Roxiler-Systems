const mysql = require('mysql2/promise');

async function check() {
  const config = {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: ''
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('SUCCESS: Connected to 3307 with no password.');
    await connection.end();
  } catch (e) {
    console.log('CONNECTION STATUS on 3307:', e.code, e.message);
  }
}

check();
