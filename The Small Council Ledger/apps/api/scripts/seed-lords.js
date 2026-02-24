/**
 * Seed de lords/ladies en Fauna.
 * Ejecutar desde apps/api con FAUNA_SECRET en .env.
 * Requiere tener casas creadas antes (ej. node scripts/seed-houses.js).
 * node scripts/seed-lords.js
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

// Nombre de casa (como en seed-houses) -> se resolverá al id de Fauna
const LORDS = [
  { name: 'Eddard', title: 'Lord', houseName: 'Stark' },
  { name: 'Catelyn', title: 'Lady', houseName: 'Tully' },
  { name: 'Tywin', title: 'Lord', houseName: 'Lannister' },
  { name: 'Cersei', title: 'Lady', houseName: 'Lannister' },
  { name: 'Daenerys', title: 'Lady', houseName: 'Targaryen' },
  { name: 'Robert', title: 'Lord', houseName: 'Baratheon' },
  { name: 'Margaery', title: 'Lady', houseName: 'Tyrell' },
  { name: 'Oberyn', title: 'Prince', houseName: 'Martell' },
  { name: 'Balon', title: 'Lord', houseName: 'Greyjoy' },
  { name: 'Jon', title: 'Lord', houseName: 'Arryn' },
];

async function getHouseIdsByName() {
  const res = await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection('houses'))),
      q.Lambda('ref', q.Let({ doc: q.Get(q.Var('ref')) }, { name: q.Select(['data', 'name'], q.Var('doc')), id: q.Select(['ref', 'id'], q.Var('doc')) }))
    )
  );
  const list = res.data ?? res;
  const arr = Array.isArray(list) ? list : [];
  const byName = {};
  arr.forEach((h) => {
    if (h && h.name) byName[h.name] = String(h.id);
  });
  return byName;
}

async function run() {
  const houseIds = await getHouseIdsByName();
  if (Object.keys(houseIds).length === 0) {
    console.error('No hay casas en Fauna. Ejecuta antes: node scripts/seed-houses.js');
    process.exit(1);
  }

  for (const lord of LORDS) {
    const houseId = houseIds[lord.houseName];
    if (!houseId) {
      console.warn('Casa no encontrada:', lord.houseName, '— omitido:', lord.name);
      continue;
    }
    try {
      const now = new Date().toISOString();
      const res = await client.query(
        q.Create(q.Collection('lords'), {
          data: {
            name: lord.name,
            title: lord.title,
            houseId,
            createdAt: now,
            updatedAt: now,
          },
        })
      );
      console.log('Creado lord:', lord.title, lord.name, '(', lord.houseName, ') — id:', res.ref?.id ?? res.ref);
    } catch (err) {
      if (err.message?.includes('instance not unique') || err.description?.includes('unique')) {
        console.log('Lord ya existe (omitido):', lord.name);
      } else {
        console.error('Error creando', lord.name, err.message || err);
      }
    }
  }
  console.log('Seed lords finalizado.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
