export const NORTHWIND_SQL_EXAMPLES = [
  {
    id: "valid_rows",
    label: "Valid rows",
    summary: "Count order lines with positive units, positive price, and returned = no.",
    sql: `SELECT COUNT(*) AS valid_rows
FROM northwind_sales
WHERE units > 0
  AND unit_price > 0
  AND returned = 'no'`,
  },
  {
    id: "revenue_by_category",
    label: "Revenue by category",
    summary: "Valid net revenue by category, mapping Elec. and electronics to Electronics.",
    sql: `SELECT CASE
         WHEN lower(category) IN ('elec.', 'electronics') THEN 'Electronics'
         ELSE category
       END AS category,
       ROUND(SUM(units * unit_price * (1 - discount_pct / 100.0))) AS net_revenue
FROM northwind_sales
WHERE units > 0
  AND unit_price > 0
  AND returned = 'no'
GROUP BY CASE
           WHEN lower(category) IN ('elec.', 'electronics') THEN 'Electronics'
           ELSE category
         END
ORDER BY net_revenue DESC`,
  },
  {
    id: "monthly_revenue",
    label: "Monthly revenue",
    summary: "Valid net revenue by month from order_date.",
    sql: `SELECT substr(order_date, 1, 7) AS month,
       ROUND(SUM(units * unit_price * (1 - discount_pct / 100.0))) AS net_revenue
FROM northwind_sales
WHERE units > 0
  AND unit_price > 0
  AND returned = 'no'
GROUP BY substr(order_date, 1, 7)
ORDER BY month`,
  },
] as const

export const NORTHWIND_SQL_PROMPTS = [
  "Filter to valid sales",
  "Group revenue by category",
  "Compare channels",
  "Find the highest-revenue category",
] as const
