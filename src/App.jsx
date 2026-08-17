import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ShopLayout from "./layouts/ShopLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import CustomerRoute from "./components/CustomerRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import Products from "./pages/Products.jsx";
import Categories from "./pages/Categories.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import Customers from "./pages/Customers.jsx";
import Purchases from "./pages/Purchases.jsx";
import Sales from "./pages/Sales.jsx";
import OnlineOrders from "./pages/OnlineOrders.jsx";
import Reorder from "./pages/Reorder.jsx";
import Reports from "./pages/Reports.jsx";
import Shop from "./pages/shop/Shop.jsx";
import ShopProduct from "./pages/shop/ShopProduct.jsx";
import Cart from "./pages/shop/Cart.jsx";
import TrackOrder from "./pages/shop/TrackOrder.jsx";
import CustomerLogin from "./pages/shop/CustomerLogin.jsx";
import CustomerRegister from "./pages/shop/CustomerRegister.jsx";
import MyOrders from "./pages/shop/MyOrders.jsx";
import { ROLES } from "./utils/roles.js";

function App() {
  return (
    <Routes>
      {/* Public customer-facing storefront - no login required. */}
      <Route element={<ShopLayout />}>
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ShopProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-register" element={<CustomerRegister />} />

        <Route element={<CustomerRoute />}>
          <Route path="/my-orders" element={<MyOrders />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/orders" element={<OnlineOrders />} />
          <Route path="/reorder" element={<Reorder />} />
          <Route path="/reports" element={<Reports />} />

          <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
