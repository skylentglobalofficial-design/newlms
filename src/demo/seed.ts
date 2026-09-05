import type { BatchLearner } from './types'

/** Demo cohort learners for institution batch review — sample data only. */
export const BATCH_LEARNERS: Record<string, BatchLearner[]> = {
  'Full Stack Batch 5': [
    { name: 'Amit Verma', completion: 31, issue: 'Below 50% completion — 4 lessons behind' },
    { name: 'Sneha Reddy', completion: 38, issue: 'Missing React assignment submission' },
    { name: 'Kunal Joshi', completion: 29, issue: 'No lab activity in 2 weeks' },
    { name: 'Divya Nambiar', completion: 44, issue: 'Quiz retake pending — Node.js module' },
    { name: 'Rahul Kapoor', completion: 35, issue: 'Below 50% completion — attendance flag' },
    { name: 'Pooja Menon', completion: 41, issue: 'Assignment backlog — API integration' },
    { name: 'Vikram Singh', completion: 27, issue: 'Below 50% completion — needs faculty check-in' },
  ],
  'Analytics Pro Cohort 8': [
    { name: 'Neha Gupta', completion: 48, issue: 'Elevated at-risk — SQL module incomplete' },
    { name: 'Arun Pillai', completion: 52, issue: 'Assignment backlog — dashboard project' },
    { name: 'Isha Desai', completion: 45, issue: 'Below cohort completion target' },
  ],
  'PM Program Batch 2': [
    { name: 'Tarun Mehta', completion: 55, issue: 'Assignment backlog — case study' },
    { name: 'Lakshmi Rao', completion: 58, issue: 'Pending stakeholder interview prep' },
  ],
}
