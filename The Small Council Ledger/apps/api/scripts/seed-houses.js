/**
 * Seed de casas en Fauna. Ejecutar desde apps/api con FAUNA_SECRET en .env o en el entorno.
 * node scripts/seed-houses.js
 */
import faunadb from 'faunadb';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { Client, query: q } = faunadb;

function loadEnv() {
  try {
    const path = resolve(__dirname, '../.env');
    const content = readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (_) {}
}

loadEnv();

const secret = process.env.FAUNA_SECRET;
if (!secret) {
  console.error('FAUNA_SECRET no definido. Crea apps/api/.env con FAUNA_SECRET=...');
  process.exit(1);
}

const client = new Client({ secret });

const HOUSES = [
  { name: 'Stark', motto: 'Winter is Coming', powerBase: 80 },
  { name: 'Lannister', motto: 'Hear Me Roar', powerBase: 85 },
  { name: 'Targaryen', motto: 'Fire and Blood', powerBase: 90 },
  { name: 'Baratheon', motto: 'Ours is the Fury', powerBase: 82 },
  { name: 'Tyrell', motto: 'Growing Strong', powerBase: 78 },
  { name: 'Martell', motto: 'Unbowed, Unbent, Unbroken', powerBase: 75 },
  { name: 'Greyjoy', motto: 'We Do Not Sow', powerBase: 72 },
  { name: 'Arryn', motto: 'As High as Honor', powerBase: 70 },
  { name: 'Tully', motto: 'Family, Duty, Honor', powerBase: 74 },
];

async function run() {
  for (const house of HOUSES) {
    try {
      const res = await client.query(
        q.Create(q.Collection('houses'), { data: house })
      );
      console.log('Creada casa:', house.name, '— id:', res.ref?.id ?? res.ref);
    } catch (err) {
      if (err.message?.includes('instance not unique') || err.description?.includes('unique')) {
        console.log('Casa ya existe (omitida):', house.name);
      } else {
        console.error('Error creando', house.name, err.message || err);
      }
    }
  }
  console.log('Seed finalizado.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
