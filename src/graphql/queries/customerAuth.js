import { gql } from "@apollo/client";
import { ORDER_FIELDS } from "./orders.js";

export const CURRENT_CUSTOMER_QUERY = gql`
  query CurrentCustomer {
    currentCustomer {
      id
      fullName
      email
      phone
      address
      createdAt
    }
  }
`;

export const MY_ORDERS_QUERY = gql`
  query MyOrders {
    myOrders {
      ...OrderFields
    }
  }
  ${ORDER_FIELDS}
`;
