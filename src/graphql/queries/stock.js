import { gql } from "@apollo/client";

export const STOCK_MOVEMENTS_QUERY = gql`
  query StockMovements($productId: ID) {
    stockMovements(productId: $productId) {
      id
      type
      quantity
      reason
      createdAt
      product {
        id
        sku
        productName
        unit
      }
      performedBy {
        id
        fullName
      }
    }
  }
`;
