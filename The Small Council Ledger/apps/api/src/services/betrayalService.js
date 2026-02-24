/**
 * Traiciones. Colección "betrayals", índice "betrayals_by_lord" (terms: ["data", "lordId"]).
 */
export function listBetrayalsByLord(client, q, lordId) {
  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index('betrayals_by_lord'), lordId)),
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

export function createBetrayal(client, q, { lordId, targetLordId, description }) {
  const now = new Date().toISOString();
  return client
    .query(
      q.Create(q.Collection('betrayals'), {
        data: {
          lordId,
          targetLordId,
          description: description ?? '',
          createdAt: now,
        },
      })
    )
    .then((doc) => ({ id: doc.ref.id, ...doc.data }));
}
