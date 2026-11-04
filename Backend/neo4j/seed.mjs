import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import neo4j from 'neo4j-driver';

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, '..', '.env') });

const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
const username = process.env.NEO4J_USER ?? 'neo4j';
const password = process.env.NEO4J_PASSWORD ?? 'password';
const database = process.env.NEO4J_DATABASE ?? 'neo4j';

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

async function runFile(session, file) {
  const raw = await readFile(path.join(here, file), 'utf8');
  const statements = raw
    .split(';')
    .map((s) => s.replace(/\/\/.*$/gm, '').trim())
    .filter(Boolean);
  for (const statement of statements) {
    await session.run(statement);
  }
  console.log(`Aplicado ${file} (${statements.length} sentencias)`);
}

const session = driver.session({ database });
try {
  await runFile(session, 'schema.cypher');
  await runFile(session, 'seed.cypher');
  console.log('Seed de Neo4j completado.');
} finally {
  await session.close();
  await driver.close();
}