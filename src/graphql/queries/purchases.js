import { gql } from "@apollo/client";

export const PURCHASES_QUERY = gql`
  query Purchases {
    purchases {
      id
      totalAmount
      paymentStatus
      purchaseDate
      createdAt
      supplier {
        id
        companyName
      }
      receivedBy {
        id
        fullName
      }
      items {
        quantity
        cost
        product {
          id
          sku
          productName
          unit
        }
      }
    }
  }
`;

export const PURCHASE_QUERY = gql`
  query Purchase($id: ID!) {
    purchase(id: $id) {
      id
      totalAmount
      paymentStatus
      purchaseDate
      createdAt
      supplier {
        id
        companyName
      }
      receivedBy {
        id
        fullName
      }
      items {
        quantity
        cost
        product {
          id
          sku
          productName
          unit
        }
      }
    }
  }
`;
