/**
 * Servicio de lords. Colección "lords", índice "lords_by_house" (terms: ["data", "houseId"]).
 */
export function listLords(client, q, { houseId } = {}) {
  const listExpr = houseId
    ? q.Map(
        q.Paginate(q.Match(q.Index('lords_by_house'), houseId)),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    : q.Map(
        q.Paginate(q.Documents(q.Collection('lords'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      );

  return client.query(listExpr).then((res) => {
    const page = Array.isArray(res) ? res : (res && res.data) ?? [];
    return page.map((doc) => ({
      id: doc.ref?.id ?? doc.id,
      ...(doc.data ?? doc),
    }));
  });
}

export function getLordById(client, q, id) {
  return client
    .query(q.Get(q.Ref(q.Collection('lords'), id)))
    .then((doc) => ({ id: doc.ref.id, ...doc.data }))
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}

export function createLord(client, q, { name, title, houseId }) {
  const now = new Date().toISOString();
  return client
    .query(
      q.Create(q.Collection('lords'), {
        data: { name, title: title ?? 'Lord', houseId, createdAt: now, updatedAt: now },
      })
    )
    .then((doc) => ({ id: doc.ref.id, ...doc.data }));
}

export function updateLord(client, q, id, patch) {
  const now = new Date().toISOString();
  return client
    .query(
      q.Update(q.Ref(q.Collection('lords'), id), {
        data: { ...patch, updatedAt: now },
      })
    )
    .then((doc) => ({ id: doc.ref.id, ...doc.data }))
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}

export function deleteLord(client, q, id) {
  return client
    .query(q.Delete(q.Ref(q.Collection('lords'), id)))
    .then(() => true)
    .catch((err) => {
      if (err.description?.includes('NotFound') || err.message?.includes('instance not found')) return null;
      throw err;
    });
}
