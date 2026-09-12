/**
 * Subject domains for Virtual Labs.
 *
 * A lab is offered only when its domain appears in the current course,
 * module or lesson. Python never inherits HTML; Excel never inherits k-NN.
 * "Data science" means analytics here, not machine learning.
 */

import { courses, programs, type Course, type CourseModule, type Program } from '../data'

export type LabDomain =
  | 'excel'
  | 'sql'
  | 'python'
  | 'pandas'
  | 'powerbi'
  | 'analytics'
  | 'ml'
  | 'genai'
  | 'html'
  | 'css'
  | 'javascript'
  | 'react'
  | 'product'
  | 'statistics'
  | 'cybersecurity'
  | 'business'

export const LAB_DOMAIN_LABEL: Record<LabDomain, string> = {
  excel: 'Excel',
  sql: 'SQL',
  python: 'Python',
  pandas: 'pandas',
  powerbi: 'Power BI',
  analytics: 'Analytics',
  ml: 'Machine learning',
  genai: 'Generative AI',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  react: 'React',
  product: 'Product',
  statistics: 'Statistics',
  cybersecurity: 'Cybersecurity',
  business: 'Business',
}

type DomainRule = { domain: LabDomain; patterns: RegExp[] }

const RULES: DomainRule[] = [
  { domain: 'excel', patterns: [/\bexcel\b/i, /\bspreadsheet\b/i, /\bpivot tables?\b/i, /\bvlookup\b/i, /\bxlookup\b/i] },
  { domain: 'sql', patterns: [/\bsql\b/i, /\bwindow functions?\b/i] },
  { domain: 'pandas', patterns: [/\bpandas\b/i, /\bdataframe\b/i] },
  { domain: 'python', patterns: [/\bpython\b/i, /\bnumpy\b/i, /\bmatplotlib\b/i, /\bseaborn\b/i, /\bjupyter\b/i] },
  { domain: 'powerbi', patterns: [/\bpower\s*bi\b/i, /\bpowerbi\b/i, /\bdax\b/i] },
  { domain: 'ml', patterns: [/\bmachine learning\b/i, /\bdeep learning\b/i, /\bk-?nn\b/i, /\bk nearest\b/i, /\bclassifier\b/i, /\bclassification\b/i, /\bneural\b/i, /\bscikit\b/i, /\bsklearn\b/i, /\bsupervised\b/i, /\bunsupervised\b/i, /\brandom forest\b/i, /\blogistic regression\b/i] },
  { domain: 'genai', patterns: [/\bgenerative ai\b/i, /\bgen ai\b/i, /\bllm\b/i, /\bprompt engineering\b/i, /\blangchain\b/i, /\brag\b/i, /\bhuggingface\b/i] },
  { domain: 'html', patterns: [/\bhtml5?\b/i] },
  { domain: 'css', patterns: [/\bcss3?\b/i, /\bbox model\b/i, /\bstylesheet\b/i] },
  { domain: 'javascript', patterns: [/\bjavascript\b/i, /\becmascript\b/i, /\btypescript\b/i] },
  { domain: 'react', patterns: [/\breact\b/i] },
  { domain: 'product', patterns: [/\bproduct management\b/i, /\bproduct thinking\b/i, /\broadmapping\b/i, /\buser stories\b/i, /\bprd\b/i] },
  { domain: 'statistics', patterns: [/\bstatistics\b/i, /\bprobability\b/i, /\bhypothesis testing\b/i] },
  { domain: 'analytics', patterns: [/\banalytics\b/i, /\bdata science\b/i] },
  { domain: 'cybersecurity', patterns: [/\bcybersecurity\b/i, /\bcryptograph/i] },
  { domain: 'business', patterns: [/\bmanagement\b/i, /\bmarketing\b/i, /\bfinance\b/i] },
]

export function inferDomains(texts: Array<string | null | undefined>): LabDomain[] {
  const blob = texts.filter((value): value is string => !!value && value.trim().length > 0).join('\n')
  if (!blob) return []
  const found = new Set<LabDomain>()
  for (const rule of RULES) {
    if (rule.patterns.some(pattern => pattern.test(blob))) found.add(rule.domain)
  }
  if (found.has('pandas')) found.add('python')
  return Array.from(found)
}

export function domainsOverlap(labDomains: LabDomain[], contextDomains: LabDomain[]): boolean {
  if (labDomains.length === 0 || contextDomains.length === 0) return false
  return labDomains.some(domain => contextDomains.includes(domain))
}

export function domainsForCourse(course: Course): LabDomain[] {
  return inferDomains([
    course.title,
    course.category,
    course.desc,
    course.longDesc,
    ...course.outcomes,
    ...course.modules.flatMap(module => [module.title, ...module.lessons.map(lesson => lesson.title)]),
  ])
}

export function domainsForModule(module: Pick<CourseModule, 'title' | 'lessons'>): LabDomain[] {
  return inferDomains([module.title, ...module.lessons.map(lesson => lesson.title)])
}

export function domainsForLesson(input: {
  moduleTitle?: string | null
  lessonTitle?: string | null
}): LabDomain[] {
  return inferDomains([input.moduleTitle, input.lessonTitle])
}

export function domainsForProgram(program: Program): LabDomain[] {
  return inferDomains([
    program.name,
    program.desc,
    program.outcome,
    ...(program.whatYouWillLearn ?? []),
    ...(program.curriculumDetail ?? []).flatMap(module => [
      module.title,
      module.description,
      ...(module.topics ?? []),
    ]),
    ...(program.projectsDetail ?? []).flatMap(project => [project.title, project.what, ...project.skills]),
  ])
}

export function findCatalogueCourse(slug: string): Course | undefined {
  return courses.find(course => course.slug === slug)
}

export function findCatalogueProgram(slug: string): Program | undefined {
  return programs.find(program => program.slug === slug)
}

export function matchCatalogueModule(course: Course, moduleTitle: string): CourseModule | undefined {
  const needle = moduleTitle.trim().toLowerCase()
  if (!needle) return undefined
  return (
    course.modules.find(module => module.title.toLowerCase() === needle)
    ?? course.modules.find(module => {
      const title = module.title.toLowerCase()
      return title.includes(needle) || needle.includes(title)
    })
  )
}

export function emptySubjectLabCopy(subjectLabel: string): string {
  const label = subjectLabel.trim() || 'this subject'
  return `No virtual lab is published for ${label} yet. We do not substitute an unrelated experiment.`
}
