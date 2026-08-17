import { gql } from "@apollo/client";
import { SALE_FIELDS } from "../queries/sales.js";

export const CREATE_SALE_MUTATION = gql`
  mutation CreateSale($input: CreateSaleInput!) {
    createSale(input: $input) {
      ...SaleFields
    }
  }
  ${SALE_FIELDS}
`;
