// The backend serves GraphQL at {API_BASE}/graphql and plain REST upload
// endpoints (e.g. POST /api/upload) at {API_BASE} directly, so we derive
// one from the other rather than needing a second env var.
export const getApiBaseUrl = () => {
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";
  return graphqlUrl.replace(/\/graphql\/?$/, "");
};
