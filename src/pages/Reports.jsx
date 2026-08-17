import { useQuery } from "@apollo/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ReceiptPercentIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

import { DASHBOARD_SUMMARY_QUERY } from "../graphql/queries/dashboard.js";
import StatCard from "../components/ui/StatCard.jsx";
import { currency } from "../utils/format.js";

const PIE_COLORS = ["#3D4FE0", "#8E9BF3", "#2FA876", "#E8A33D", "#8B93A7", "#26319B"];

const Reports = () => {
  const { data, loading, error } = useQuery(DASHBOARD_SUMMARY_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const summary = data?.dashboardSummary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Reports
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Revenue, profit, and stock trends across the business.
        </p>
      </div>

      {loading && !summary && (
        <div className="card px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
          Loading report data…
        </div>
      )}

      {error && (
        <div className="card px-5 py-10 text-center text-sm text-stock-out">
          Couldn't load reports: {error.message}
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Revenue" value={currency(summary.revenue)} icon={BanknotesIcon} />
            <StatCard
              label="Profit"
              value={currency(summary.profit)}
              icon={ArrowTrendingUpIcon}
              tone="ok"
            />
            <StatCard
              label="Expenses"
              value={currency(summary.expenses)}
              icon={ReceiptPercentIcon}
            />
            <StatCard
              label="Margin"
              value={
                summary.revenue > 0
                  ? `${((summary.profit / summary.revenue) * 100).toFixed(1)}%`
                  : "—"
              }
              icon={ScaleIcon}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="card p-4 xl:col-span-2">
              <h2 className="mb-4 font-display text-sm font-semibold text-ink dark:text-ink-dark">
                Sales vs. Purchases
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={summary.monthlyFigures} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-border dark:text-border-dark"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="currentColor"
                    className="text-ink-dim dark:text-ink-dark-dim"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={currency}
                    stroke="currentColor"
                    className="text-ink-dim dark:text-ink-dark-dim"
                    width={72}
                  />
                  <Tooltip formatter={(value) => currency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="sales" name="Sales" fill="#3D4FE0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#8E9BF3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4">
              <h2 className="mb-4 font-display text-sm font-semibold text-ink dark:text-ink-dark">
                Stock by category
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

          <div className="card p-4">
            <h2 className="mb-4 font-display text-sm font-semibold text-ink dark:text-ink-dark">
              Revenue trend
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={summary.monthlyFigures}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border dark:text-border-dark"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-ink-dim dark:text-ink-dark-dim"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={currency}
                  stroke="currentColor"
                  className="text-ink-dim dark:text-ink-dark-dim"
                  width={72}
                />
                <Tooltip formatter={(value) => currency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="sales" name="Sales" stroke="#3D4FE0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
