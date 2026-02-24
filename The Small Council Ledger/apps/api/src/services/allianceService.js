/**
 * Alianzas entre casas. Colección "alliances" con houseId y targetHouseId.
 */
export function getAlliance(client, q, id) {
  return client
    .query(q.Get(q.Ref(q.Collection('alliances'), id)))
    .then((doc) => ({ id: doc.ref.id, ...doc.data }))
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}

export function listAlliances(client, q) {
  return client
    .query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('alliances'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    )
    .then((res) => {
      const page = res.data ?? res;
      return (Array.isArray(page) ? page : []).map((doc) => ({
        id: doc.ref?.id ?? doc.id,
        ...doc.data,
      }));
    });
}

export async function listAlliancesByHouse(client, q, houseId) {
  const all = await listAlliances(client, q);
  return (all || []).filter(
    (a) => a.houseId === houseId || a.targetHouseId === houseId
  );
}

export function createAlliance(client, q, { houseId, targetHouseId }) {
  const now = new Date().toISOString();
  return client
    .query(
      q.Create(q.Collection('alliances'), {
        data: {
          houseId,
          targetHouseId,
          createdAt: now,
        },
      })
    )
    .then((doc) => ({ id: doc.ref.id, ...doc.data }));
}

export function deleteAlliance(client, q, id) {
  return client
    .query(q.Delete(q.Ref(q.Collection('alliances'), id)))
    .then(() => true)
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}
