import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const Loader = () => (
  <div className="flex flex-1 items-center justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
  </div>
);

const CustomerRoute = () => {
  const { isAuthenticated, initializing } = useCustomerAuth();
  const location = useLocation();

  if (initializing) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/customer-login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default CustomerRoute;
