const { Client } = require('pg');

function parseDatabaseUrl(connectionString) {
  const url = new URL(connectionString);

  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: Number(url.port || 5432),
    database: url.pathname.replace(/^\//, ''),
  };
}

async function ensureDatabaseExists() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const target = parseDatabaseUrl(connectionString);

  const adminClient = new Client({
    user: target.user,
    password: target.password,
    host: target.host,
    port: target.port,
    database: 'postgres',
  });

  await adminClient.connect();

  try {
    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [target.database],
    );

    if (result.rowCount > 0) {
      console.log(`Database "${target.database}" already exists.`);
      return;
    }

    const escapedName = `"${target.database.replace(/"/g, '""')}"`;
    await adminClient.query(`CREATE DATABASE ${escapedName}`);
    console.log(`Database "${target.database}" created successfully.`);
  } finally {
    await adminClient.end();
  }
}

ensureDatabaseExists().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
