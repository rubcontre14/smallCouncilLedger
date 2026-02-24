/**
 * Servicio de casas (houses). Asume colección "houses" en Fauna.
 * Crear en Dashboard: Collection "houses".
 */
export function listHouses(client, q) {
  return client
    .query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('houses'))),
        q.Lambda('ref', q.Let({ doc: q.Get(q.Var('ref')) }, { id: q.Select(['ref', 'id'], q.Var('doc')), ...q.Select(['data'], q.Var('doc')) }))
      )
    )
    .then((res) => (Array.isArray(res) ? res : (res && res.data) ?? []));
}

export function getHouseById(client, q, id) {
  return client
    .query(q.Get(q.Ref(q.Collection('houses'), id)))
    .then((doc) => ({ id: doc.ref.id, ...doc.data }))
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}

export function updateHouse(client, q, id, patch) {
  return client
    .query(
      q.Update(q.Ref(q.Collection('houses'), id), {
        data: patch,
      })
    )
    .then((doc) => ({ id: doc.ref.id, ...doc.data }))
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}
