/**
 * Store local en memoria (con persistencia opcional en JSON).
 * Se usa cuando USE_LOCAL_STORE=true o cuando no hay FAUNA_SECRET.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BONUS_PER_ALLIANCE = 5;
const PENALTY_PER_BETRAYAL = 10;
const PENALTY_PER_REMOVED_ALLIANCE = 5; // al quitar una alianza: -5 (menos bono) -5 (esta penalización) = -10
const DEFAULT_HOUSE_BASE = 70;

const SEED_HOUSES = [
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

// houseId corresponde al orden en SEED_HOUSES: 1=Stark, 2=Lannister, 3=Targaryen, 4=Baratheon, 5=Tyrell, 6=Martell, 7=Greyjoy, 8=Arryn, 9=Tully
const SEED_LORDS = [
  { name: 'Eddard', title: 'Lord', houseId: '1' },
  { name: 'Catelyn', title: 'Lady', houseId: '9' },
  { name: 'Tywin', title: 'Lord', houseId: '2' },
  { name: 'Cersei', title: 'Lady', houseId: '2' },
  { name: 'Daenerys', title: 'Lady', houseId: '3' },
  { name: 'Robert', title: 'Lord', houseId: '4' },
  { name: 'Margaery', title: 'Lady', houseId: '5' },
  { name: 'Oberyn', title: 'Prince', houseId: '6' },
  { name: 'Balon', title: 'Lord', houseId: '7' },
  { name: 'Jon', title: 'Lord', houseId: '8' },
];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function now() {
  return new Date().toISOString();
}

export function createLocalStore(options = {}) {
  const dataDir = options.dataDir ?? join(__dirname, '../../data');
  const dataFile = options.dataFile ?? join(dataDir, 'local-store.json');
  const persist = options.persist !== false;

  let houses = new Map();
  let lords = new Map();
  let alliances = new Map();
  let betrayals = new Map();
  let nextHouseId = 1;

  function seedHouses() {
    SEED_HOUSES.forEach((h) => {
      const id = String(nextHouseId++);
      houses.set(id, { id, ...h });
    });
  }

  function seedLords() {
    const nowStr = now();
    SEED_LORDS.forEach((l) => {
      const id = generateId();
      lords.set(id, {
        id,
        name: l.name,
        title: l.title ?? 'Lord',
        houseId: l.houseId,
        createdAt: nowStr,
        updatedAt: nowStr,
      });
    });
    save();
  }

  function load() {
    if (!persist || !existsSync(dataFile)) {
      seedHouses();
      if (lords.size === 0) seedLords();
      return;
    }
    try {
      const raw = readFileSync(dataFile, 'utf8');
      const data = JSON.parse(raw);
      houses = new Map(Object.entries(data.houses ?? {}));
      lords = new Map(Object.entries(data.lords ?? {}));
      alliances = new Map(Object.entries(data.alliances ?? {}));
      betrayals = new Map(Object.entries(data.betrayals ?? {}));
      nextHouseId = Math.max(1, ...[...houses.keys()].map(Number).filter((n) => !Number.isNaN(n)), 0) + 1;
      if (houses.size === 0) seedHouses();
      if (lords.size === 0) seedLords();
    } catch (_) {
      seedHouses();
      if (lords.size === 0) seedLords();
    }
  }

  function save() {
    if (!persist) return;
    try {
      if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
      writeFileSync(
        dataFile,
        JSON.stringify(
          {
            houses: Object.fromEntries(houses),
            lords: Object.fromEntries(lords),
            alliances: Object.fromEntries(alliances),
            betrayals: Object.fromEntries(betrayals),
          },
          null,
          2
        ),
        'utf8'
      );
    } catch (err) {
      console.warn('[localStore] No se pudo guardar:', err.message);
    }
  }

  load();

  return {
    listHouses() {
      return Promise.resolve([...houses.values()]);
    },

    getHouseById(id) {
      return Promise.resolve(houses.get(id) ?? null);
    },

    updateHouse(id, patch) {
      const house = houses.get(id);
      if (!house) return Promise.resolve(null);
      const updated = { ...house, ...patch };
      houses.set(id, updated);
      save();
      return Promise.resolve(updated);
    },

    listLords({ houseId } = {}) {
      let list = [...lords.values()];
      if (houseId) list = list.filter((l) => l.houseId === houseId);
      return Promise.resolve(list);
    },

    getLordById(id) {
      return Promise.resolve(lords.get(id) ?? null);
    },

    createLord({ name, title, houseId }) {
      const id = generateId();
      const nowStr = now();
      const lord = { id, name, title: title ?? 'Lord', houseId, createdAt: nowStr, updatedAt: nowStr };
      lords.set(id, lord);
      save();
      return Promise.resolve(lord);
    },

    updateLord(id, patch) {
      const lord = lords.get(id);
      if (!lord) return Promise.resolve(null);
      const updated = { ...lord, ...patch, updatedAt: now() };
      lords.set(id, updated);
      save();
      return Promise.resolve(updated);
    },

    deleteLord(id) {
      if (!lords.has(id)) return Promise.resolve(null);
      lords.delete(id);
      [...betrayals.values()].forEach((b) => {
        if (b.lordId === id || b.targetLordId === id) betrayals.delete(b.id);
      });
      save();
      return Promise.resolve(true);
    },

    listAlliances() {
      return Promise.resolve([...alliances.values()]);
    },

    listAlliancesByHouse(houseId) {
      const list = [...alliances.values()].filter(
        (a) => a.houseId === houseId || a.targetHouseId === houseId
      );
      return Promise.resolve(list);
    },

    listAlliancesByLord(lordId) {
      const lord = lords.get(lordId);
      if (!lord || !lord.houseId) return Promise.resolve([]);
      return this.listAlliancesByHouse(lord.houseId);
    },

    getAlliance(id) {
      const a = alliances.get(id);
      return Promise.resolve(a ? { ...a } : null);
    },

    createAlliance({ houseId, targetHouseId }) {
      const id = generateId();
      const alliance = { id, houseId, targetHouseId, createdAt: now() };
      alliances.set(id, alliance);
      save();
      return Promise.resolve(alliance);
    },

    async deleteAlliance(id) {
      const alliance = await this.getAlliance(id);
      if (!alliance) return null;
      const h1 = houses.get(alliance.houseId);
      const h2 = houses.get(alliance.targetHouseId);
      if (h1) {
        h1.removedAlliancesCount = (h1.removedAlliancesCount || 0) + 1;
        houses.set(alliance.houseId, h1);
      }
      if (h2) {
        h2.removedAlliancesCount = (h2.removedAlliancesCount || 0) + 1;
        houses.set(alliance.targetHouseId, h2);
      }
      save();
      alliances.delete(id);
      save();
      return true;
    },

    listBetrayalsByLord(lordId) {
      const list = [...betrayals.values()].filter((b) => b.lordId === lordId);
      return Promise.resolve(list);
    },

    createBetrayal({ lordId, targetLordId, description }) {
      const id = generateId();
      const betrayal = { id, lordId, targetLordId, description: description ?? '', createdAt: now() };
      betrayals.set(id, betrayal);
      save();
      return Promise.resolve(betrayal);
    },

    async getPowerIndex(lordId) {
      const lord = lords.get(lordId);
      if (!lord || !lord.houseId) return null;
      const house = houses.get(lord.houseId);
      const base = house && typeof house.powerBase === 'number' ? house.powerBase : DEFAULT_HOUSE_BASE;
      const alliancesList = await this.listAlliancesByHouse(lord.houseId);
      const removedCount = house ? (house.removedAlliancesCount || 0) : 0;
      const alliancesBonus = alliancesList.length * BONUS_PER_ALLIANCE;
      const removedPenalty = removedCount * PENALTY_PER_REMOVED_ALLIANCE;
      const powerIndex = Math.max(0, base + alliancesBonus - removedPenalty);
      return {
        lordId,
        powerIndex,
        breakdown: { base, alliancesBonus, removedPenalty },
      };
    },
  };
}
