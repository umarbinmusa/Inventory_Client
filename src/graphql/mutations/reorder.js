import { gql } from "@apollo/client";

export const CREATE_REORDER_MUTATION = gql`
  mutation CreateReorder($input: CreateReorderInput!) {
    createReorder(input: $input) {
      id
      status
      suggestedQuantity
      product {
        id
        productName
      }
    }
  }
`;

export const UPDATE_REORDER_STATUS_MUTATION = gql`
  mutation UpdateReorderStatus($id: ID!, $status: ReorderStatus!) {
    updateReorderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
