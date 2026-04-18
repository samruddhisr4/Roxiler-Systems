const mysql = require('mysql2/promise');

async function check() {
  const configs = [
    { host: 'localhost', user: 'root', password: '' },
    { host: 'localhost', user: 'root', password: 'password' },
    { host: 'localhost', user: 'root', password: 'root' }
  ];

  for (const config of configs) {
    try {
      const connection = await mysql.createConnection(config);
      console.log(`SUCCESS: Connected with password "${config.password}"`);
      await connection.end();
      return;
    } catch (e) {
      console.log(`FAILED: password "${config.password}" - `, e);
    }
  }
}

check();
