import { gql } from "@apollo/client";

export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary {
    dashboardSummary {
      totalProducts
      totalCategories
      totalSuppliers
      totalCustomers
      totalPurchases
      totalSales
      revenue
      profit
      expenses
      lowStockCount
      outOfStockCount
      todaysSalesCount
      todaysSalesTotal
      pendingOrdersCount
      completedOrdersCount
      monthlyFigures {
        month
        sales
        purchases
      }
      categoryDistribution {
        category
        quantity
      }
    }
  }
`;
