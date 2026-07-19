const { Client } = require('pg');

const urls = [
  'postgresql://postgres:olamide@localhost:5432/postgres',
  'postgresql://postgres:olamideakinola@localhost:5432/postgres',
  'postgresql://postgres:12345678@localhost:5432/postgres',
  'postgresql://postgres:123456789@localhost:5432/postgres',
  'postgresql://postgres:pgadmin@localhost:5432/postgres',
  'postgresql://postgres:root123@localhost:5432/postgres',
  'postgresql://postgres:mysecretpassword@localhost:5432/postgres'
];

async function test() {
  for (const url of urls) {
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      console.log(`Success: ${url}`);
      await client.end();
      process.exit(0);
    } catch (e) {
      // Ignored
    }
  }
  console.log('None worked');
  process.exit(1);
}

test();
