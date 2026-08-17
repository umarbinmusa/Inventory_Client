import { gql } from "@apollo/client";

export const SALE_FIELDS = gql`
  fragment SaleFields on Sale {
    id
    receiptNumber
    subtotal
    discount
    tax
    total
    amountPaid
    change
    paymentMethod
    createdAt
    customer {
      id
      fullName
    }
    cashier {
      id
      fullName
    }
    order {
      id
      orderNumber
    }
    items {
      quantity
      price
      product {
        id
        sku
        productName
        unit
      }
    }
  }
`;

export const SALES_QUERY = gql`
  query Sales {
    sales {
      ...SaleFields
    }
  }
  ${SALE_FIELDS}
`;

export const SALE_QUERY = gql`
  query Sale($id: ID!) {
    sale(id: $id) {
      ...SaleFields
    }
  }
  ${SALE_FIELDS}
`;
