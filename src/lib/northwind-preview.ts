/** Public product-preview figures from the authored Data Analytics extract. */
export const NORTHWIND_PREVIEW = {
  filename: "northwind_sales.csv",
  rows: 180,
  validRows: 166,
  excludedRows: 14,
  netRevenue: 812020,
  netRevenueLabel: "₹812,020",
  window: "Jan–Jun 2026",
  topCategory: "Electronics",
  weakestMonth: "April",
  categories: [
    { name: "Electronics", value: 347072 },
    { name: "Apparel", value: 179739 },
    { name: "Home", value: 155457 },
    { name: "Grocery", value: 129752 },
  ],
  months: [
    { name: "Jan", value: 117967 },
    { name: "Feb", value: 162726 },
    { name: "Mar", value: 188525 },
    { name: "Apr", value: 91729 },
  ],
  sql: "SELECT ROUND(SUM(units * unit_price * (1.0 - discount_pct / 100.0)), 0) AS net_revenue\nFROM sales\nWHERE units > 0 AND unit_price > 0 AND returned = 'no';",
} as const

export function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`
}
