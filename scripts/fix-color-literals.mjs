import fs from 'fs'

const files = [
  'src/pages/ProgramsPage.tsx',
  'src/pages/ProgramPage.tsx',
  'src/pages/CourseDetailPage.tsx',
  'src/pages/WorkshopDetailPage.tsx',
  'src/pages/EducationPage.tsx',
  'src/pages/SkillsPage.tsx',
  'src/pages/InstitutionsPage.tsx',
  'src/pages/UniversitiesPage.tsx',
  'src/pages/LabsPage.tsx',
  'src/pages/LabDetailPage.tsx',
  'src/pages/ExperimentPage.tsx',
  'src/pages/StoriesPage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/BlogPage.tsx',
  'src/pages/BlogPostPage.tsx',
  'src/pages/ContactPage.tsx',
  'src/pages/LoginPage.tsx',
]

const subtle = 'rgba(11,13,15,0.04)'
const subtleHover = 'rgba(11,13,15,0.06)'

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8')
  const orig = s

  s = s.replace(/'C\.slate'/g, 'C.slate')
  s = s.replace(/'C\.ink'/g, 'C.ink')

  s = s.replace(/background: C\.slate/g, `background: ${subtle}`)
  s = s.replace(/background = C\.slate/g, `background = '${subtle}'`)
  s = s.replace(/\.style\.background = C\.slate/g, `.style.background = '${subtleHover}'`)

  s = s.replace(/border: '1px solid C\.slate'/g, 'border: `1px solid ${T.lineLight}`')
  s = s.replace(/borderTop: '1px solid C\.slate'/g, 'borderTop: `1px solid ${T.lineLight}`')
  s = s.replace(/borderColor = C\.slate/g, 'borderColor = T.lineLight')

  if (s !== orig) {
    fs.writeFileSync(file, s)
    console.log('fixed', file)
  }
}
