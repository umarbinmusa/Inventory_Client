import { gql } from "@apollo/client";

export const ORDER_FIELDS = gql`
  fragment OrderFields on Order {
    id
    orderNumber
    customerName
    customerPhone
    customerEmail
    customerAddress
    notes
    subtotal
    total
    status
    paymentStatus
    createdAt
    updatedAt
    items {
      quantity
      price
      product {
        id
        sku
        productName
        unit
        image
      }
    }
    convertedSale {
      id
      receiptNumber
    }
    processedBy {
      id
      fullName
    }
  }
`;

export const ORDERS_QUERY = gql`
  query Orders($status: OrderStatus) {
    orders(status: $status) {
      ...OrderFields
    }
  }
  ${ORDER_FIELDS}
`;

export const ORDER_QUERY = gql`
  query Order($id: ID!) {
    order(id: $id) {
      ...OrderFields
    }
  }
  ${ORDER_FIELDS}
`;

// Public - no auth required. Used by the customer-facing "Track Order" page.
export const TRACK_ORDER_QUERY = gql`
  query TrackOrder($orderNumber: String!) {
    trackOrder(orderNumber: $orderNumber) {
      ...OrderFields
    }
  }
  ${ORDER_FIELDS}
`;
