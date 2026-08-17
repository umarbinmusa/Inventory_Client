import { gql } from "@apollo/client";

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id
    sku
    barcode
    productName
    purchasePrice
    sellingPrice
    quantity
    minimumStock
    unit
    image
    description
    status
    stockStatus
    expiryDate
    createdAt
    updatedAt
    category {
      id
      name
    }
    supplier {
      id
      companyName
    }
  }
`;

export const PRODUCTS_QUERY = gql`
  query Products($categoryId: ID, $status: ProductStatus) {
    products(categoryId: $categoryId, status: $status) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

export const PRODUCT_QUERY = gql`
  query Product($id: ID!) {
    product(id: $id) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

export const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($query: String!) {
    searchProducts(query: $query) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

export const LOW_STOCK_PRODUCTS_QUERY = gql`
  query LowStockProducts {
    lowStockProducts {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

export const OUT_OF_STOCK_PRODUCTS_QUERY = gql`
  query OutOfStockProducts {
    outOfStockProducts {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

export const EXPIRING_PRODUCTS_QUERY = gql`
  query ExpiringProducts($withinDays: Int) {
    expiringProducts(withinDays: $withinDays) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;
