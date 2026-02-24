/**
 * Adaptador de store que delega en FaunaDB mediante los servicios existentes.
 */
import * as houseService from '../services/houseService.js';
import * as lordService from '../services/lordService.js';
import * as allianceService from '../services/allianceService.js';
import * as betrayalService from '../services/betrayalService.js';
import * as powerIndexService from '../services/powerIndexService.js';

export function createFaunaStore(client, q) {
  return {
    listHouses() {
      return houseService.listHouses(client, q);
    },

    getHouseById(id) {
      return houseService.getHouseById(client, q, id);
    },

    updateHouse(id, patch) {
      return houseService.updateHouse(client, q, id, patch);
    },

    listLords({ houseId } = {}) {
      return lordService.listLords(client, q, { houseId });
    },

    getLordById(id) {
      return lordService.getLordById(client, q, id);
    },

    createLord(payload) {
      return lordService.createLord(client, q, payload);
    },

    updateLord(id, patch) {
      return lordService.updateLord(client, q, id, patch);
    },

    deleteLord(id) {
      return lordService.deleteLord(client, q, id);
    },

    listAlliances() {
      return allianceService.listAlliances(client, q);
    },

    listAlliancesByHouse(houseId) {
      return allianceService.listAlliancesByHouse(client, q, houseId);
    },

    listAlliancesByLord(lordId) {
      return lordService.getLordById(client, q, lordId).then((lord) => {
        if (!lord || !lord.houseId) return [];
        return allianceService.listAlliancesByHouse(client, q, lord.houseId);
      });
    },

    getAlliance(id) {
      return allianceService.getAlliance(client, q, id);
    },

    createAlliance(payload) {
      return allianceService.createAlliance(client, q, payload);
    },

    async deleteAlliance(id) {
      const alliance = await allianceService.getAlliance(client, q, id);
      if (!alliance) return null;
      const h1 = alliance.houseId && (await houseService.getHouseById(client, q, alliance.houseId));
      const h2 = alliance.targetHouseId && (await houseService.getHouseById(client, q, alliance.targetHouseId));
      if (h1) {
        await houseService.updateHouse(client, q, alliance.houseId, {
          removedAlliancesCount: (h1.removedAlliancesCount || 0) + 1,
        });
      }
      if (h2) {
        await houseService.updateHouse(client, q, alliance.targetHouseId, {
          removedAlliancesCount: (h2.removedAlliancesCount || 0) + 1,
        });
      }
      return allianceService.deleteAlliance(client, q, id);
    },

    listBetrayalsByLord(lordId) {
      return betrayalService.listBetrayalsByLord(client, q, lordId);
    },

    createBetrayal(payload) {
      return betrayalService.createBetrayal(client, q, payload);
    },

    getPowerIndex(lordId) {
      return powerIndexService.getPowerIndex(client, q, lordId);
    },
  };
}
