import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { ShoppingBagIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

import { SHOP_PRODUCT_QUERY } from "../../graphql/queries/shop.js";
import { useCart } from "../../context/CartContext.jsx";
import { currency } from "../../utils/format.js";

const ShopProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(SHOP_PRODUCT_QUERY, { variables: { id } });
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = data?.shopProduct;
  const outOfStock = product?.stockStatus === "OUT_OF_STOCK";

  if (loading) {
    return (
      <div className="card px-5 py-12 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
        Loading product…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card px-5 py-12 text-center text-sm text-stock-out">
        Couldn't find that product.
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.productName} added to cart.`);
  };

  const handleBookNow = () => {
    addItem(product, quantity);
    navigate("/cart");
  };

  return (
    <div className="space-y-6">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-ink-dim hover:text-ink dark:text-ink-dark-dim dark:hover:text-ink-dark">
        <ChevronLeftIcon className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card aspect-square overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.productName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-dim dark:text-ink-dark-dim">
              <ShoppingBagIcon className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-dim dark:text-ink-dark-dim">
              {product.category?.name}
            </p>
            <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
              {product.productName}
            </h1>
            <p className="figure mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-300">
              {currency(product.sellingPrice)}
            </p>
          </div>

          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            {product.description || "No description provided."}
          </p>

          <p className="text-sm">
            {outOfStock ? (
              <span className="font-medium text-stock-out">Out of stock</span>
            ) : (
              <span className="font-medium text-stock-ok">
                Available · {product.quantity} {product.unit} in stock
              </span>
            )}
          </p>

          {!outOfStock && (
            <div className="flex items-center gap-3">
              <label className="label mb-0" htmlFor="quantity">
                Quantity
              </label>
              <div className="flex items-center rounded-md border border-border dark:border-border-dark">
                <button
                  type="button"
                  className="px-3 py-1.5 text-ink-dim hover:text-ink dark:text-ink-dark-dim dark:hover:text-ink-dark"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.quantity)))
                  }
                  className="w-14 border-x border-border bg-transparent py-1.5 text-center text-sm dark:border-border-dark"
                />
                <button
                  type="button"
                  className="px-3 py-1.5 text-ink-dim hover:text-ink dark:text-ink-dark-dim dark:hover:text-ink-dark"
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {!outOfStock && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="btn-secondary flex-1" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn-primary flex-1" onClick={handleBookNow}>
                Book / Order Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopProduct;
