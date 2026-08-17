import { gql } from "@apollo/client";

// Deliberately a separate, smaller field set than the admin ProductFields
// fragment - the storefront never needs cost price/barcode/supplier internals.
export const SHOP_PRODUCT_FIELDS = gql`
  fragment ShopProductFields on Product {
    id
    sku
    productName
    description
    sellingPrice
    quantity
    unit
    image
    stockStatus
    category {
      id
      name
    }
  }
`;

export const SHOP_PRODUCTS_QUERY = gql`
  query ShopProducts($categoryId: ID) {
    shopProducts(categoryId: $categoryId) {
      ...ShopProductFields
    }
  }
  ${SHOP_PRODUCT_FIELDS}
`;

export const SHOP_PRODUCT_QUERY = gql`
  query ShopProduct($id: ID!) {
    shopProduct(id: $id) {
      ...ShopProductFields
    }
  }
  ${SHOP_PRODUCT_FIELDS}
`;

export const SHOP_SEARCH_PRODUCTS_QUERY = gql`
  query ShopSearchProducts($query: String!) {
    shopSearchProducts(query: $query) {
      ...ShopProductFields
    }
  }
  ${SHOP_PRODUCT_FIELDS}
`;

export const SHOP_CATEGORIES_QUERY = gql`
  query ShopCategories {
    shopCategories {
      id
      name
    }
  }
`;
