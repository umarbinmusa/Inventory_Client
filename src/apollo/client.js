import { ApolloClient, InMemoryCache, HttpLink, from, Observable } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/tokenStorage.js";
import {
  getCustomerAccessToken,
  getCustomerRefreshToken,
  setCustomerTokens,
  clearCustomerTokens,
} from "../utils/customerTokenStorage.js";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "https://inventory-api-x778.onrender.com/graphql";

const httpLink = new HttpLink({ uri: GRAPHQL_URL });

// The storefront (public, no-login shop/cart/orders) and the admin
// dashboard are two entirely separate route trees that are never mounted
// at once, so the current URL alone tells us which session a request
// should carry - a staff member browsing the storefront in another tab
// doesn't accidentally send their admin token there, and vice versa.
const STOREFRONT_PATH_PREFIXES = ["/shop", "/cart", "/track-order", "/my-orders", "/customer-login", "/customer-register"];
const isStorefrontPath = () =>
  STOREFRONT_PATH_PREFIXES.some((p) => window.location.pathname.startsWith(p));

const authLink = setContext((_, { headers }) => {
  const token = isStorefrontPath() ? getCustomerAccessToken() : getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Ensures only one refresh-token request is in flight even if several
// queries fail with UNAUTHENTICATED at the same moment. Kept as two
// separate in-flight guards since a staff and a customer session can, in
// principle, both be refreshing at once in different tabs.
let staffRefreshPromise = null;
let customerRefreshPromise = null;

const performStaffRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation RefreshToken($refreshToken: String!) {
          refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
          }
        }
      `,
      variables: { refreshToken },
    }),
  });

  const { data, errors } = await response.json();
  if (errors || !data?.refreshToken) {
    throw new Error(errors?.[0]?.message || "Failed to refresh token");
  }

  setTokens(data.refreshToken);
  return data.refreshToken.accessToken;
};

const performCustomerRefresh = async () => {
  const refreshToken = getCustomerRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CustomerRefreshToken($refreshToken: String!) {
          customerRefreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
          }
        }
      `,
      variables: { refreshToken },
    }),
  });

  const { data, errors } = await response.json();
  if (errors || !data?.customerRefreshToken) {
    throw new Error(errors?.[0]?.message || "Failed to refresh token");
  }

  setCustomerTokens(data.customerRefreshToken);
  return data.customerRefreshToken.accessToken;
};

const SKIP_REFRESH_OPERATIONS = [
  "Login",
  "Register",
  "RefreshToken",
  "LoginCustomer",
  "RegisterCustomer",
  "CustomerRefreshToken",
];

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const isAuthError = graphQLErrors?.some(
    (err) => err.extensions?.code === "UNAUTHENTICATED"
  );

  if (!isAuthError || SKIP_REFRESH_OPERATIONS.includes(operation.operationName)) {
    return;
  }

  const storefront = isStorefrontPath();
  const hasRefreshToken = storefront ? getCustomerRefreshToken() : getRefreshToken();
  if (!hasRefreshToken) return;

  if (storefront) {
    if (!customerRefreshPromise) {
      customerRefreshPromise = performCustomerRefresh().finally(() => {
        customerRefreshPromise = null;
      });
    }
  } else if (!staffRefreshPromise) {
    staffRefreshPromise = performStaffRefresh().finally(() => {
      staffRefreshPromise = null;
    });
  }

  const refreshPromise = storefront ? customerRefreshPromise : staffRefreshPromise;

  // Must return an Observable (not a bare Promise) so Apollo's link chain
  // can forward the retried operation's emissions back to the caller.
  return new Observable((observer) => {
    refreshPromise
      .then((newAccessToken) => {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${newAccessToken}`,
          },
        }));
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch((err) => {
        if (storefront) {
          clearCustomerTokens();
          window.location.href = "/customer-login";
        } else {
          clearTokens();
          window.location.href = "/login";
        }
        observer.error(err);
      });
  });
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
