import { gql } from "@apollo/client";

export const CREATE_PURCHASE_MUTATION = gql`
  mutation CreatePurchase($input: CreatePurchaseInput!) {
    createPurchase(input: $input) {
      id
      totalAmount
      paymentStatus
      purchaseDate
      createdAt
      supplier {
        id
        companyName
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

export const UPDATE_PURCHASE_PAYMENT_MUTATION = gql`
  mutation UpdatePurchasePayment($id: ID!, $paymentStatus: PaymentStatus!) {
    updatePurchasePayment(id: $id, paymentStatus: $paymentStatus) {
      id
      paymentStatus
    }
  }
`;
