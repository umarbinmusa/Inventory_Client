import { gql } from "@apollo/client";

export const CUSTOMERS_QUERY = gql`
  query Customers {
    customers {
      id
      fullName
      phone
      email
      address
      orderCount
      createdAt
      updatedAt
    }
  }
`;

export const CUSTOMER_QUERY = gql`
  query Customer($id: ID!) {
    customer(id: $id) {
      id
      fullName
      phone
      email
      address
      orderCount
    }
  }
`;
