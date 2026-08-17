import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  CubeIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "../components/ui/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { DASHBOARD_SUMMARY_QUERY } from "../graphql/queries/dashboard.js";
import { currency } from "../utils/format.js";

const PIE_COLORS = ["#3D4FE0", "#8E9BF3", "#2FA876", "#E8A33D", "#8B93A7", "#26319B"];

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(DASHBOARD_SUMMARY_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const summary = data?.dashboardSummary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Here's how the business is tracking.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-stock-out/30 bg-stock-out/10 px-3 py-2 text-sm text-ink dark:text-ink-dark">
          Couldn't load dashboard figures: {error.message}
        </div>
      )}

      {loading && !summary && (
        <div className="card px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
          Loading dashboard…
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Link to="/products">
              <StatCard label="Total Products" value={summary.totalProducts.toLocaleString()} icon={CubeIcon} />
            </Link>
            <Link to="/categories">
              <StatCard label="Categories" value={summary.totalCategories.toLocaleString()} icon={TagIcon} />
            </Link>
            <Link to="/suppliers">
              <StatCard label="Suppliers" value={summary.totalSuppliers.toLocaleString()} icon={TruckIcon} />
            </Link>
            <Link to="/customers">
              <StatCard label="Customers" value={summary.totalCustomers.toLocaleString()} icon={UsersIcon} />
            </Link>
            <Link to="/purchases">
              <StatCard label="Purchases (mo.)" value={summary.totalPurchases.toLocaleString()} icon={ShoppingCartIcon} />
            </Link>
            <Link to="/sales">
              <StatCard label="Sales (mo.)" value={summary.totalSales.toLocaleString()} icon={BanknotesIcon} />
            </Link>
            <Link to="/products?filter=low">
              <StatCard label="Low Stock" value={summary.lowStockCount.toLocaleString()} icon={ExclamationTriangleIcon} tone="low" />
            </Link>
            <Link to="/products?filter=out">
              <StatCard label="Out of Stock" value={summary.outOfStockCount.toLocaleString()} icon={XCircleIcon} tone="out" />
            </Link>
            <Link to="/sales">
              <StatCard
                label="Today's Sales"
                value={summary.todaysSalesCount.toLocaleString()}
                suffix={currency(summary.todaysSalesTotal)}
                icon={BanknotesIcon}
                tone="ok"
              />
            </Link>
            <Link to="/orders">
              <StatCard label="Pending Orders" value={summary.pendingOrdersCount.toLocaleString()} icon={ClockIcon} tone="low" />
            </Link>
            <Link to="/orders">
              <StatCard label="Completed Orders" value={summary.completedOrdersCount.toLocaleString()} icon={CheckCircleIcon} tone="ok" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Revenue" value={currency(summary.revenue)} />
            <StatCard label="Profit" value={currency(summary.profit)} tone="ok" />
            <StatCard label="Expenses" value={currency(summary.expenses)} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="card p-4 xl:col-span-2">
              <h2 className="mb-4 font-display text-sm font-semibold text-ink dark:text-ink-dark">
                Sales vs. Purchases (last 6 months)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={summary.monthlyFigures} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border dark:text-border-dark" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" className="text-ink-dim dark:text-ink-dark-dim" />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={currency} stroke="currentColor" className="text-ink-dim dark:text-ink-dark-dim" width={64} />
                  <Tooltip
                    formatter={(value) => currency(value)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="sales" name="Sales" fill="#3D4FE0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#8E9BF3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4">
              <h2 className="mb-4 font-display text-sm font-semibold text-ink dark:text-ink-dark">
                Stock by Category
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={summary.categoryDistribution}
                    dataKey="quantity"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {summary.categoryDistribution.map((entry, index) => (
                      <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
