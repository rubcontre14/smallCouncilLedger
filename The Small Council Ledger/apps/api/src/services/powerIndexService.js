import * as lordService from './lordService.js';
import * as houseService from './houseService.js';
import * as allianceService from './allianceService.js';

const BONUS_PER_ALLIANCE = 5;
const PENALTY_PER_REMOVED_ALLIANCE = 5; // al quitar una alianza: -10 en total
const DEFAULT_HOUSE_BASE = 70;

/**
 * Calcula el índice de poder de la casa del lord (alianzas entre casas).
 * Fórmula: base (casa) + alianzas de la casa * BONUS - removedAlliancesCount * PENALTY
 */
export async function getPowerIndex(client, q, lordId) {
  const lord = await lordService.getLordById(client, q, lordId);
  if (!lord || !lord.houseId) return null;

  const house = await houseService.getHouseById(client, q, lord.houseId);
  const base = house && typeof house.powerBase === 'number' ? house.powerBase : DEFAULT_HOUSE_BASE;
  const alliances = await allianceService.listAlliancesByHouse(client, q, lord.houseId);
  const removedCount = house ? (house.removedAlliancesCount || 0) : 0;

  const alliancesBonus = (Array.isArray(alliances) ? alliances.length : 0) * BONUS_PER_ALLIANCE;
  const removedPenalty = removedCount * PENALTY_PER_REMOVED_ALLIANCE;
  const powerIndex = Math.max(0, base + alliancesBonus - removedPenalty);

  return {
    lordId,
    powerIndex,
    breakdown: { base, alliancesBonus, removedPenalty },
  };
}
