// Centralizes token persistence so only this file touches localStorage.
// Note: storing tokens in localStorage is convenient for a client-only SPA
// talking to a token-based GraphQL API, but it is readable by any JS running
// on the page (XSS risk). For a production deployment, consider moving the
// refresh token to an httpOnly cookie set by the backend instead.

const ACCESS_TOKEN_KEY = "ims_access_token";
const REFRESH_TOKEN_KEY = "ims_refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
