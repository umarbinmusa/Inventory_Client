import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import { SHOP_PRODUCTS_QUERY, SHOP_SEARCH_PRODUCTS_QUERY, SHOP_CATEGORIES_QUERY } from "../../graphql/queries/shop.js";
import { useCart } from "../../context/CartContext.jsx";
import { currency } from "../../utils/format.js";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <div className="card flex flex-col overflow-hidden">
      <Link to={`/shop/${product.id}`} className="block aspect-square bg-canvas dark:bg-canvas-dark">
        {product.image ? (
          <img src={product.image} alt={product.productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-dim dark:text-ink-dark-dim">
            <ShoppingBagIcon className="h-10 w-10" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to={`/shop/${product.id}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-brand-600 dark:text-ink-dark">
          {product.productName}
        </Link>
        <p className="text-xs text-ink-dim dark:text-ink-dark-dim">{product.category?.name}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="figure text-sm font-semibold text-ink dark:text-ink-dark">
            {currency(product.sellingPrice)}
          </span>
          {outOfStock ? (
            <span className="text-xs font-medium text-stock-out">Out of stock</span>
          ) : (
            <button
              className="btn-primary px-2.5 py-1.5 text-xs"
              onClick={() => {
                addItem(product, 1);
                toast.success(`${product.productName} added to cart.`);
              }}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: categoriesData } = useQuery(SHOP_CATEGORIES_QUERY);
  const { data: browseData, loading: browseLoading } = useQuery(SHOP_PRODUCTS_QUERY, {
    variables: { categoryId: categoryId || null },
    skip: !!submittedSearch,
  });
  const { data: searchData, loading: searchLoading } = useQuery(SHOP_SEARCH_PRODUCTS_QUERY, {
    variables: { query: submittedSearch },
    skip: !submittedSearch,
  });

  const categories = categoriesData?.shopCategories || [];
  const loading = submittedSearch ? searchLoading : browseLoading;
  const products = submittedSearch ? searchData?.shopSearchProducts || [] : browseData?.shopProducts || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
    setCategoryId("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Browse products
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Find what you need and book it — pay when you pick it up.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim dark:text-ink-dark-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or category…"
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
        {submittedSearch && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSubmittedSearch("");
              setSearch("");
            }}
          >
            Clear
          </button>
        )}
      </form>

      {!submittedSearch && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryId("")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !categoryId
                ? "bg-brand-500 text-white"
                : "bg-canvas text-ink-dim hover:text-ink dark:bg-canvas-dark dark:text-ink-dark-dim dark:hover:text-ink-dark"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryId === c.id
                  ? "bg-brand-500 text-white"
                  : "bg-canvas text-ink-dim hover:text-ink dark:bg-canvas-dark dark:text-ink-dark-dim dark:hover:text-ink-dark"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="card px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
          Loading products…
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="card px-5 py-12 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
          No products found.
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
