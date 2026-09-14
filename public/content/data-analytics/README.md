# Data Analytics datasets (synthetic)

These files are generated for the Skylent Data Analytics course. They do not contain real people or scraped commercial data.

## northwind_sales.csv

- 180 order lines for a fictional retailer, **Northwind Retail**, Jan–Jun 2026.
- `channel` is `store` or `online` (order number divisible by 3 → online).
- Revenue formula used in the course:

`net_revenue = units * unit_price * (1 - discount_pct/100)`

Only use rows where `units > 0`, `unit_price > 0`, and `returned = no` unless a lesson asks you to inspect dirty rows.

Reference totals using that rule (rounded to rupees): valid rows 166, invalid 14, net revenue ≈ ₹812,020. Electronics is the largest category; South is the largest named region; April 2026 is the weakest month.

### Known quality issues (do not “fix” the file until the lesson says so)

- Blank `region`: `NW-10024`, `NW-10089`
- Category aliases: `Elec.` (`NW-10018`), `electronics` (`NW-10042`)
- Negative `units`: `NW-10055` (`-2`)
- Zero `unit_price`: `NW-10122`
- Duplicate `order_id`: `NW-10013` appears twice

## northwind_hr.csv

- 56 fictional employees.
- Known issues: blank department (`E-107`), `performance_rating = N/A` (`E-119`), text salary `46,250` (`E-133`).

## Tools

The LMS does not run Excel or SQL for you. Use Google Sheets, Excel, SQLite, or any SQL tool you already have. Paste queries and results into the assignment submission box.
