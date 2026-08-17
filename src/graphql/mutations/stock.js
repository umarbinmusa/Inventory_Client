import { gql } from "@apollo/client";

const STOCK_MOVEMENT_FIELDS = gql`
  fragment StockMovementFields on StockMovement {
    id
    type
    quantity
    reason
    createdAt
    product {
      id
      sku
      productName
      quantity
      unit
    }
    performedBy {
      id
      fullName
    }
  }
`;

export const STOCK_IN_MUTATION = gql`
  mutation StockIn($productId: ID!, $quantity: Int!, $reason: String) {
    stockIn(productId: $productId, quantity: $quantity, reason: $reason) {
      ...StockMovementFields
    }
  }
  ${STOCK_MOVEMENT_FIELDS}
`;

export const STOCK_OUT_MUTATION = gql`
  mutation StockOut($productId: ID!, $quantity: Int!, $reason: String) {
    stockOut(productId: $productId, quantity: $quantity, reason: $reason) {
      ...StockMovementFields
    }
  }
  ${STOCK_MOVEMENT_FIELDS}
`;

export const STOCK_ADJUST_MUTATION = gql`
  mutation StockAdjust($productId: ID!, $quantity: Int!, $reason: String) {
    stockAdjust(productId: $productId, quantity: $quantity, reason: $reason) {
      ...StockMovementFields
    }
  }
  ${STOCK_MOVEMENT_FIELDS}
`;

export const STOCK_TRANSFER_MUTATION = gql`
  mutation StockTransfer(
    $productId: ID!
    $quantity: Int!
    $from: String!
    $to: String!
    $note: String
  ) {
    stockTransfer(
      productId: $productId
      quantity: $quantity
      from: $from
      to: $to
      note: $note
    ) {
      ...StockMovementFields
    }
  }
  ${STOCK_MOVEMENT_FIELDS}
`;
