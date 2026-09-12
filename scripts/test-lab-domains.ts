import {
  domainsForCourse,
  domainsForLesson,
  domainsForProgram,
  findCatalogueCourse,
  findCatalogueProgram,
} from '../src/lib/lab-domains.ts'
import { labRunPath, safeInternalPath } from '../src/lib/safe-return.ts'
import {
  labsForCourse,
  labsForLearningContext,
  labsForProgram,
} from '../src/lib/virtual-labs.ts'
import {
  filterLearnInventory,
  getLearnInventory,
  sortLearnInventory,
} from '../src/lib/learn-inventory.ts'

function ids(labs: { id: string }[]) {
  return labs.map(lab => lab.id).sort()
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

const python = findCatalogueCourse('python-programming')
const analytics = findCatalogueCourse('data-analytics')
const web = findCatalogueCourse('full-stack-web')
const powerbi = findCatalogueCourse('power-bi')
const product = findCatalogueCourse('product-management')
const genai = findCatalogueCourse('generative-ai')
const ds = findCatalogueProgram('data-science-ai')
const da = findCatalogueProgram('data-analytics-pro')

if (!python || !analytics || !web || !powerbi || !product || !genai || !ds || !da) {
  throw new Error('Catalogue fixtures missing')
}

assert(!domainsForCourse(python).includes('html'), 'Python course must not be tagged HTML')
assert(!domainsForCourse(python).includes('ml'), 'Python basics course must not be tagged machine learning')
assert(!domainsForCourse(python).includes('css'), 'Python course must not be tagged CSS')
assert(domainsForCourse(python).includes('python'), 'Python course must be tagged python')

const pythonLabs = ids(labsForCourse('python-programming'))
assert(pythonLabs.includes('python-filter'), `Python course should include python-filter, got ${pythonLabs}`)
assert(!pythonLabs.includes('css-box'), `Python course must not include HTML/CSS lab, got ${pythonLabs}`)
assert(!pythonLabs.includes('knn-classifier'), `Python course must not include k-NN, got ${pythonLabs}`)

const analyticsLabs = ids(labsForCourse('data-analytics'))
assert(analyticsLabs.includes('excel-group'), `Analytics should include Excel lab, got ${analyticsLabs}`)
assert(analyticsLabs.includes('sql-filter'), `Analytics should include SQL lab, got ${analyticsLabs}`)
assert(!analyticsLabs.includes('css-box'), `Analytics must not include HTML lab, got ${analyticsLabs}`)
assert(!analyticsLabs.includes('knn-classifier'), `Analytics must not include k-NN, got ${analyticsLabs}`)

const webLabs = ids(labsForCourse('full-stack-web'))
assert(webLabs.includes('css-box'), `Full-stack should include CSS box lab, got ${webLabs}`)
assert(!webLabs.includes('python-filter'), `Full-stack must not include Python lab, got ${webLabs}`)
assert(!webLabs.includes('knn-classifier'), `Full-stack must not include k-NN, got ${webLabs}`)
assert(!webLabs.includes('sql-filter'), `Full-stack published modules are not SQL, got ${webLabs}`)

assert(labsForCourse('power-bi').length === 0, 'Power BI has no published interactive lab yet')
assert(labsForCourse('product-management').length === 0, 'Product management has no published interactive lab yet')
assert(labsForCourse('generative-ai').length === 0, 'Generative AI has no published interactive lab yet')

const dsLabs = ids(labsForProgram('data-science-ai'))
assert(dsLabs.includes('python-filter'), `Data Science & AI should include Python lab, got ${dsLabs}`)
assert(dsLabs.includes('knn-classifier'), `Data Science & AI should include k-NN, got ${dsLabs}`)
assert(!dsLabs.includes('css-box'), `Data Science & AI must not include HTML lab, got ${dsLabs}`)
assert(!dsLabs.includes('excel-group'), `Data Science & AI syllabus is not Excel, got ${dsLabs}`)

const daLabs = ids(labsForProgram('data-analytics-pro'))
assert(daLabs.includes('excel-group'), `Analytics programme should include Excel, got ${daLabs}`)
assert(daLabs.includes('sql-filter'), `Analytics programme should include SQL, got ${daLabs}`)
assert(daLabs.includes('python-filter'), `Analytics programme syllabus includes Python, got ${daLabs}`)
assert(!daLabs.includes('knn-classifier'), `Analytics programme must not include k-NN, got ${daLabs}`)
assert(!daLabs.includes('css-box'), `Analytics programme must not include HTML, got ${daLabs}`)

const pythonLesson = ids(labsForLearningContext({
  moduleTitle: 'Python Basics',
  lessonTitle: 'Variables and Data Types',
}))
assert(JSON.stringify(pythonLesson) === JSON.stringify(['python-filter']), `Python lesson labs: ${pythonLesson}`)

const excelLesson = ids(labsForLearningContext({
  moduleTitle: 'Microsoft Excel',
  lessonTitle: 'Excel Fundamentals',
}))
assert(JSON.stringify(excelLesson) === JSON.stringify(['excel-group']), `Excel lesson labs: ${excelLesson}`)

const sqlLesson = ids(labsForLearningContext({
  moduleTitle: 'SQL for Analysis',
  lessonTitle: 'Introduction to SQL',
}))
assert(JSON.stringify(sqlLesson) === JSON.stringify(['sql-filter']), `SQL lesson labs: ${sqlLesson}`)

const htmlLesson = ids(labsForLearningContext({
  moduleTitle: 'Web Foundations',
  lessonTitle: 'HTML & CSS',
}))
assert(JSON.stringify(htmlLesson) === JSON.stringify(['css-box']), `HTML lesson labs: ${htmlLesson}`)

const jsLesson = ids(labsForLearningContext({
  moduleTitle: 'Web Foundations',
  lessonTitle: 'JavaScript Basics',
}))
assert(!jsLesson.includes('css-box'), `JS lesson must not open the CSS lab, got ${jsLesson}`)
assert(!jsLesson.includes('python-filter'), `JS lesson must not open Python, got ${jsLesson}`)

const mlLesson = ids(labsForLearningContext({
  moduleTitle: 'Machine Learning',
  lessonTitle: 'SVM, KNN, Naive Bayes',
}))
assert(mlLesson.includes('knn-classifier'), `ML lesson should include k-NN, got ${mlLesson}`)
assert(!mlLesson.includes('css-box'), `ML lesson must not include HTML, got ${mlLesson}`)

assert(domainsForLesson({ moduleTitle: 'Python Basics', lessonTitle: 'Variables and Data Types' }).includes('python'))
assert(!domainsForLesson({ moduleTitle: 'Python Basics', lessonTitle: 'Variables and Data Types' }).includes('html'))
assert(!domainsForProgram(da).includes('ml'))
assert(domainsForProgram(ds).includes('ml'))

assert(safeInternalPath('//evil.com') === null, 'protocol-relative returnTo must be rejected')
assert(safeInternalPath('https://evil.com/learn') === null, 'absolute URL returnTo must be rejected')
assert(safeInternalPath('/\\evil.com') === null, 'backslash returnTo must be rejected')
assert(safeInternalPath('/login') === null, 'login is not a return target')
assert(safeInternalPath('/learn/python-programming') === '/learn/python-programming', 'learn paths must be allowed')
assert(labRunPath('knn-classifier', '//evil.com') === '/labs/knn-classifier/run', 'unsafe from must be dropped')
assert(
  labRunPath('knn-classifier', '/courses/python-programming') ===
    '/labs/knn-classifier/run?from=%2Fcourses%2Fpython-programming',
  'safe from must be preserved',
)

const learn = getLearnInventory()
assert(learn.length > 0, 'Learn inventory must not be empty')
assert(learn.every(item => item.title && item.href && item.kindLabel && item.availability.label), 'Learn items need honest labels')
assert(new Set(learn.map(item => item.id)).size === learn.length, 'Learn inventory must be unique by kind+slug')
assert(learn.some(item => item.kind === 'program'), 'Learn inventory includes programmes')
assert(learn.some(item => item.kind === 'course'), 'Learn inventory includes courses')
assert(learn.some(item => item.kind === 'workshop'), 'Learn inventory includes webinars')
assert(
  !learn.some(item => item.availability.canStartLearning && item.availabilityGroup !== 'available'),
  'Open items must be grouped as available',
)

const pythonHits = filterLearnInventory(learn, {
  query: 'python',
  domain: 'all',
  kind: 'all',
  level: 'all',
  format: 'all',
  duration: 'all',
  availability: 'all',
})
assert(pythonHits.length > 0, 'Python search must return real inventory')
assert(pythonHits.every(item => `${item.title} ${item.description} ${item.domains.map(d => d.label).join(' ')}`.toLowerCase().includes('python') || item.outcomes.some(o => o.toLowerCase().includes('python'))), 'Python search should stay on-topic')

const openOnly = filterLearnInventory(learn, {
  query: '',
  domain: 'all',
  kind: 'all',
  level: 'all',
  format: 'all',
  duration: 'all',
  availability: 'available',
})
assert(openOnly.every(item => item.availability.canStartLearning), 'Available filter must only return startable items')

const recommended = sortLearnInventory(learn, 'recommended')
assert(recommended[0].availability.canStartLearning, 'Recommended sort puts open inventory first')

console.log('lab-domain matching assertions passed')
console.log({
  pythonLabs,
  analyticsLabs,
  webLabs,
  dsLabs,
  daLabs,
  pythonLesson,
  excelLesson,
  sqlLesson,
  htmlLesson,
  jsLesson,
  mlLesson,
})
