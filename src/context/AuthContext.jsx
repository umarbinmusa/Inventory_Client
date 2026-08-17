import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";

import { CURRENT_USER_QUERY } from "../graphql/queries/auth.js";
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
} from "../graphql/mutations/auth.js";
import { getAccessToken, setTokens, clearTokens } from "../utils/tokenStorage.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const apolloClient = useApolloClient();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [fetchCurrentUser] = useLazyQuery(CURRENT_USER_QUERY, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setUser(data?.currentUser || null);
      setInitializing(false);
    },
    onError: () => {
      setUser(null);
      setInitializing(false);
    },
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    if (getAccessToken()) {
      fetchCurrentUser();
    } else {
      setInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await loginMutation({ variables: { input: { email, password } } });
      setTokens(data.login);
      setUser(data.login.user);
      return data.login.user;
    },
    [loginMutation]
  );

  const register = useCallback(
    async (input) => {
      const { data } = await registerMutation({ variables: { input } });
      setTokens(data.register);
      setUser(data.register.user);
      return data.register.user;
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) await logoutMutation();
    } catch {
      // Best-effort: even if the server call fails, clear the local session.
    } finally {
      clearTokens();
      setUser(null);
      await apolloClient.clearStore();
      toast.info("You've been logged out.");
    }
  }, [logoutMutation, apolloClient]);

  const value = {
    user,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
    refetchCurrentUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
