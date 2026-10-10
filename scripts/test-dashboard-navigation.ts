import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/pages/DashboardStudentPage.tsx', import.meta.url), 'utf8')
const navBlock = source.match(/const NAV_ITEMS: AuthNavItem\[\] = \[(.*?)\n\]/s)
if (!navBlock) throw new Error('Dashboard navigation block not found')

const labels = [...navBlock[1].matchAll(/label: '([^']+)'/g)].map((match) => match[1])
const expected = ['Dashboard', 'My Courses', 'Projects', 'Explore Courses', 'Career OS']

if (JSON.stringify(labels) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected dashboard nav labels: ${labels.join(' | ')}`)
}

if (!source.includes("to=\"/courses\"")) {
  throw new Error('Empty-state call to action should point to /courses')
}

console.log('dashboard-navigation ok')
