// Deliberately separate keys from utils/tokenStorage.js (staff tokens) so a
// person can, in principle, be logged in as staff in the admin dashboard and
// as a customer on the storefront in the same browser without either
// session clobbering the other.

const ACCESS_TOKEN_KEY = "ims_customer_access_token";
const REFRESH_TOKEN_KEY = "ims_customer_refresh_token";

export const getCustomerAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getCustomerRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setCustomerTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearCustomerTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
