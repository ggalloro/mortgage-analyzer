# Feature Request: Amortization Schedule with Scenario Comparison

## Problem

Users who get approved for a mortgage can see their monthly payment, but they can't see how that payment breaks down over time (principal vs. interest), and they can't compare different scenarios to make informed decisions.

## Requirements

### Amortization Schedule

After a feasibility analysis, an approved user should be able to view a full amortization schedule showing:

- **Month-by-month breakdown** of each payment: how much goes to principal vs. interest
- **Running balance** showing remaining loan balance after each payment
- **Cumulative totals** showing total principal and total interest paid to date
- The schedule should cover the entire loan term (e.g., 360 rows for a 30-year mortgage)

### Scenario Comparison

Users should be able to compare **up to 3 mortgage scenarios** side by side. For example:

- "What if I put 20% down vs. 10% down?"
- "What if I choose a 15-year term vs. 30-year?"
- "What if I get a 6% rate vs. 7%?"

For each scenario, show:
- Monthly payment
- Total interest paid over the life of the loan
- Total cost (principal + interest)
- Stress-test result at +3% rate

The comparison should make it easy to see which scenario saves the most money.

### UI

- Add an "Amortization Schedule" section below the feasibility results
- Add a "Compare Scenarios" page accessible from the navigation
- The amortization table should be scrollable with sticky headers
- The comparison view should show scenarios in columns

## Acceptance Criteria

- [ ] Amortization schedule displays correct month-by-month breakdown
- [ ] Running balance reaches €0 (or near €0) at the end of the term
- [ ] Scenario comparison supports 2-3 scenarios with different parameters
- [ ] All calculations use proper financial math (no floating-point drift on currency)
- [ ] New pages are responsive and match the existing design
- [ ] Existing feasibility analysis functionality is not affected
