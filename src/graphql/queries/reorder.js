import { gql } from "@apollo/client";

// Live view straight off Product - always accurate even before any Reorder
// record has been created for a given low-stock item.
export const REORDER_REQUIRED_QUERY = gql`
  query ReorderRequired {
    reorderRequired {
      id
      sku
      productName
      quantity
      minimumStock
      unit
      image
      category {
        id
        name
      }
      supplier {
        id
        companyName
      }
    }
  }
`;

export const REORDERS_QUERY = gql`
  query Reorders($status: ReorderStatus) {
    reorders(status: $status) {
      id
      quantityAtRequest
      reorderLevelAtRequest
      suggestedQuantity
      status
      notes
      createdAt
      updatedAt
      product {
        id
        sku
        productName
        quantity
        minimumStock
        unit
      }
      supplier {
        id
        companyName
      }
      requestedBy {
        id
        fullName
      }
    }
  }
`;
