import { gql } from "@apollo/client";

export const SUPPLIERS_QUERY = gql`
  query Suppliers {
    suppliers {
      id
      companyName
      contactPerson
      phone
      email
      address
      productCount
      createdAt
      updatedAt
    }
  }
`;

export const SUPPLIER_QUERY = gql`
  query Supplier($id: ID!) {
    supplier(id: $id) {
      id
      companyName
      contactPerson
      phone
      email
      address
      productCount
    }
  }
`;
