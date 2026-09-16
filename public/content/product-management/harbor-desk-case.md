# Harbor Desk case notes

Fictional teaching case for Skylent Product Management. **Not** Northwind. **Not** a real company. **Not** a sales dataset.

## Company

**Harbor Retail** runs **12 grocery and general stores** in Chennai, Coimbatore, and Madurai. Store teams currently coordinate exceptions (late supplier trucks, missing SKUs, weekend delivery failures, staff no-shows) across **WhatsApp groups, email, and walkie**.

**Harbor Desk** is a *proposed* product: a shared inbox for store operations so an exception has one place to live.

There is no live product. You are not analysing revenue. You are deciding whether Harbor Desk is the right bet.

## Constraint (given)

- **2 engineers**, **6 weeks**, no new warehouse system, no ERP replacement.
- HQ will not hire a 24/7 ops desk this quarter.
- Stores already refused a previous “all-company chat” rollout in 2025 (too noisy).

## Exception log (weekend of 4–5 July 2026)

Nine weekend exceptions were written down after the fact. Three never appeared in any WhatsApp group.

| ID | Store | Type | Where it lived | Outcome |
| --- | --- | --- | --- | --- |
| HD-01 | T. Nagar | Late milk truck | WhatsApp “Chennai fresh” | Manager saw it at 07:10; fridge gaps by 09:00 |
| HD-02 | Anna Nagar | Missing rice SKU | Email to merchandising | Replied Monday |
| HD-03 | RS Puram | Delivery failure (customer) | Walkie, then forgotten | Customer called HQ Tuesday |
| HD-04 | KK Nagar | Staff no-show | Personal WhatsApp to Priya | Covered; not logged |
| HD-05 | Town Hall | Late vegetable truck | No channel | Discovered at open; not recorded until asked |
| HD-06 | Peelamedu | Delivery failure (customer) | WhatsApp “weekend on-call” (43 unread) | Buried |
| HD-07 | T. Nagar | Missing oil SKU | Email | Duplicate of a Friday thread |
| HD-08 | Madurai Main | Cooler fault | Walkie | Engineer called; no written trail |
| HD-09 | Anna Nagar | Delivery failure (customer) | Nothing | Customer WhatsApped the cashier |

## Interview notes

Interviews were 25 minutes each. These are condensed notes, not transcripts. Quotes are labelled.

### Priya — store lead, T. Nagar (6 years)

- Opens at 06:30. First hour is trucks, not customers.
- “If the milk is late I need someone at HQ who is actually looking before 7am. The group is full of memes by then.”
- Uses three WhatsApp groups: city fresh, city dry grocery, and a weekend on-call group she mutes.
- Does **not** want another chat. “We tried an all-hands app last year. I turned notifications off in two days.”
- Weekend delivery failures: she hears from cashiers, not from a list.
- Would not describe herself as “wanting a shared inbox.” She wants **the late truck to be someone’s job before the fridge is empty.**

### Arun — HQ operations, Chennai (3 years)

- On Monday he dumps WhatsApp screenshots into a spreadsheet to see what broke.
- “I cannot tell you how many weekend exceptions we had. I can tell you how many stores complained loudly.”
- Tried to mandate email-only. Stores ignored it.
- Engineering asked him for “requirements for Harbor Desk.” He sent: “like Gmail but for stores.”
- Constraint he repeats: two engineers, six weeks, do not touch warehouse software.
- He believes missing SKUs are a merchandising problem, not an inbox problem. He has **no count** of missing-SKU frequency vs delivery failures.

### Meena — cashier, Anna Nagar (11 months)

- Customers who did not get a delivery message her on WhatsApp because her number is on the bill.
- “I tell them I will ask. Then I forget if it is busy.”
- She does not have HQ email.
- She has never been asked what “done” looks like for a failed delivery.
- She does not use walkie. “That is for the back.”

### Karthik — engineer (one of the two)

- Can ship a simple list with statuses in six weeks. Cannot ship routing, SLA timers, and mobile offline.
- “If you ask for Gmail, I will build Gmail badly.”
- Wants a written non-goal list. Last project grew from “a list” into “mentions, @channels, and file upload.”

## What this case can support

You **can** argue from:

- Weekend exceptions falling through named channels
- Priya’s job (late inbound before open)
- Meena’s job (customer delivery failure with no place to put it)
- Arun’s Monday reconstruction
- Engineering constraint

You **cannot** honestly claim:

- Revenue impact (no sales file)
- That Harbor Desk will be loved (no prototype test)
- That missing SKUs are the top problem (Arun has no count)
- Headcount or hiring outcomes

## Suggested cuts (not answers)

A competent product case usually has to choose. Typical options students consider:

1. **Weekend exception queue** for delivery failures + late trucks (narrow).
2. **Full shared inbox** for every store message (wide).
3. **Do nothing new** — write a weekend on-call rota and a Monday checklist (process, not software).

The course does not grade you for picking option 1. It grades you for **evidence, frame, constraint, and a spec that matches the bet.**
