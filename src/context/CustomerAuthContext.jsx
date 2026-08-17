import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";

import { CURRENT_CUSTOMER_QUERY } from "../graphql/queries/customerAuth.js";
import {
  REGISTER_CUSTOMER_MUTATION,
  LOGIN_CUSTOMER_MUTATION,
  CUSTOMER_LOGOUT_MUTATION,
} from "../graphql/mutations/customerAuth.js";
import {
  getCustomerAccessToken,
  setCustomerTokens,
  clearCustomerTokens,
} from "../utils/customerTokenStorage.js";

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const apolloClient = useApolloClient();
  const [customer, setCustomer] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [fetchCurrentCustomer] = useLazyQuery(CURRENT_CUSTOMER_QUERY, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setCustomer(data?.currentCustomer || null);
      setInitializing(false);
    },
    onError: () => {
      setCustomer(null);
      setInitializing(false);
    },
  });

  const [registerMutation] = useMutation(REGISTER_CUSTOMER_MUTATION);
  const [loginMutation] = useMutation(LOGIN_CUSTOMER_MUTATION);
  const [logoutMutation] = useMutation(CUSTOMER_LOGOUT_MUTATION);

  useEffect(() => {
    if (getCustomerAccessToken()) {
      fetchCurrentCustomer();
    } else {
      setInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(
    async (input) => {
      const { data } = await registerMutation({ variables: { input } });
      setCustomerTokens(data.registerCustomer);
      setCustomer(data.registerCustomer.customer);
      return data.registerCustomer.customer;
    },
    [registerMutation]
  );

  const login = useCallback(
    async (email, password) => {
      const { data } = await loginMutation({ variables: { input: { email, password } } });
      setCustomerTokens(data.loginCustomer);
      setCustomer(data.loginCustomer.customer);
      return data.loginCustomer.customer;
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    try {
      if (getCustomerAccessToken()) await logoutMutation();
    } catch {
      // Best-effort: even if the server call fails, clear the local session.
    } finally {
      clearCustomerTokens();
      setCustomer(null);
      await apolloClient.clearStore();
      toast.info("You've been logged out.");
    }
  }, [logoutMutation, apolloClient]);

  const value = {
    customer,
    isAuthenticated: !!customer,
    initializing,
    register,
    login,
    logout,
    refetchCurrentCustomer: fetchCurrentCustomer,
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  return ctx;
};
