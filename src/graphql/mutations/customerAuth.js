import { gql } from "@apollo/client";

export const REGISTER_CUSTOMER_MUTATION = gql`
  mutation RegisterCustomer($input: RegisterCustomerInput!) {
    registerCustomer(input: $input) {
      accessToken
      refreshToken
      customer {
        id
        fullName
        email
        phone
        address
      }
    }
  }
`;

export const LOGIN_CUSTOMER_MUTATION = gql`
  mutation LoginCustomer($input: LoginCustomerInput!) {
    loginCustomer(input: $input) {
      accessToken
      refreshToken
      customer {
        id
        fullName
        email
        phone
        address
      }
    }
  }
`;

export const CUSTOMER_REFRESH_TOKEN_MUTATION = gql`
  mutation CustomerRefreshToken($refreshToken: String!) {
    customerRefreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      customer {
        id
        fullName
        email
      }
    }
  }
`;

export const CUSTOMER_LOGOUT_MUTATION = gql`
  mutation CustomerLogout {
    customerLogout {
      success
      message
    }
  }
`;
