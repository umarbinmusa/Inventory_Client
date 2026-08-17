import { gql } from "@apollo/client";

export const CREATE_SUPPLIER_MUTATION = gql`
  mutation CreateSupplier($input: SupplierInput!) {
    createSupplier(input: $input) {
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

export const UPDATE_SUPPLIER_MUTATION = gql`
  mutation UpdateSupplier($id: ID!, $input: SupplierInput!) {
    updateSupplier(id: $id, input: $input) {
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

export const DELETE_SUPPLIER_MUTATION = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id) {
      success
      message
    }
  }
`;
