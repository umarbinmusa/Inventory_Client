import { gql } from "@apollo/client";
import { ORDER_FIELDS } from "../queries/orders.js";

// Public - no auth required. A customer books a product without an account.
export const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      ...OrderFields
    }
  }
  ${ORDER_FIELDS}
`;

export const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      ...OrderFields
    }
  }
  ${ORDER_FIELDS}
`;

export const CONVERT_ORDER_TO_SALE_MUTATION = gql`
  mutation ConvertOrderToSale($id: ID!, $input: ConvertOrderToSaleInput!) {
    convertOrderToSale(id: $id, input: $input) {
      id
      receiptNumber
      total
      amountPaid
      change
      paymentMethod
      createdAt
    }
  }
`;
