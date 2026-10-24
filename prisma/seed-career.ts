/**
 * Career OS sample data seed.
 *
 * Creates sample employers and job listings so Career OS is not empty.
 * Run with: npx tsx prisma/seed-career.ts
 *
 * Safe to run multiple times (upserts by slug).
 * Does NOT create user data or applications.
 */
import { PrismaClient, CareerEmploymentType, CareerWorkMode, JobStatus, EmployerVerificationStatus } from "@prisma/client"

const prisma = new PrismaClient()

const EMPLOYERS = [
  {
    slug: "techstart-india",
    name: "TechStart India",
    description: "A fast-growing product company building enterprise SaaS solutions. We value learning and growth.",
    website: "https://example.com/techstart",
    location: "Bengaluru",
    verificationStatus: "VERIFIED" as EmployerVerificationStatus,
  },
  {
    slug: "datawise-analytics",
    name: "DataWise Analytics",
    description: "Analytics consulting firm helping businesses make data-driven decisions.",
    website: "https://example.com/datawise",
    location: "Mumbai",
    verificationStatus: "VERIFIED" as EmployerVerificationStatus,
  },
  {
    slug: "greentech-solutions",
    name: "GreenTech Solutions",
    description: "Sustainable technology company focused on clean energy and environmental solutions.",
    website: "https://example.com/greentech",
    location: "Pune",
    verificationStatus: "VERIFIED" as EmployerVerificationStatus,
  },
]

const JOBS = [
  {
    employerSlug: "techstart-india",
    slug: "junior-data-analyst-techstart",
    title: "Junior Data Analyst",
    description: `We're looking for a Junior Data Analyst to join our growing analytics team.

**What you'll do:**
- Analyze business data using SQL and Python
- Create dashboards and reports for stakeholders
- Collaborate with product teams on data-driven decisions
- Learn and grow with mentorship from senior analysts

**What we're looking for:**
- Understanding of SQL and basic Python
- Familiarity with data visualization tools
- Strong analytical and problem-solving skills
- Good communication skills

**Nice to have:**
- Experience with Tableau or Power BI
- Exposure to statistical analysis
- Portfolio projects demonstrating data analysis`,
    employmentType: "FULL_TIME" as CareerEmploymentType,
    workMode: "HYBRID" as CareerWorkMode,
    location: "Bengaluru",
    experienceMin: 0,
    experienceMax: 2,
    salaryMin: 400000,
    salaryMax: 700000,
    skills: ["SQL", "Python", "Data Analysis", "Excel", "Data Visualization"],
    category: "Data Analytics",
    status: "OPEN" as JobStatus,
  },
  {
    employerSlug: "datawise-analytics",
    slug: "associate-product-manager-datawise",
    title: "Associate Product Manager",
    description: `Join our product team as an Associate Product Manager and help shape analytics products used by enterprises.

**Responsibilities:**
- Work with senior PMs to define product requirements
- Conduct user research and gather feedback
- Write user stories and acceptance criteria
- Collaborate with engineering and design teams
- Track product metrics and suggest improvements

**Requirements:**
- Strong analytical thinking
- Excellent written and verbal communication
- Understanding of product development lifecycle
- Ability to work in a fast-paced environment

**Preferred:**
- Product management certification or coursework
- Experience with analytics or SaaS products
- Familiarity with Agile methodologies`,
    employmentType: "FULL_TIME" as CareerEmploymentType,
    workMode: "REMOTE" as CareerWorkMode,
    location: "Mumbai (Remote)",
    experienceMin: 0,
    experienceMax: 2,
    salaryMin: 500000,
    salaryMax: 900000,
    skills: ["Product Management", "User Research", "Agile", "Data Analysis", "Communication"],
    category: "Product Management",
    status: "OPEN" as JobStatus,
  },
  {
    employerSlug: "greentech-solutions",
    slug: "data-science-intern-greentech",
    title: "Data Science Intern",
    description: `3-month internship opportunity to work on real data science projects in the sustainability space.

**What you'll learn:**
- Apply machine learning to environmental data
- Work with large datasets and cloud platforms
- Collaborate with experienced data scientists
- Present findings to stakeholders

**We're looking for:**
- Currently pursuing or recently completed a degree in a relevant field
- Basic understanding of Python and machine learning
- Enthusiasm for sustainability and clean energy
- Willingness to learn and take initiative

**Internship details:**
- Duration: 3 months
- Stipend provided
- Possibility of full-time conversion`,
    employmentType: "INTERNSHIP" as CareerEmploymentType,
    workMode: "HYBRID" as CareerWorkMode,
    location: "Pune",
    experienceMin: 0,
    experienceMax: 0,
    salaryMin: 20000,
    salaryMax: 30000,
    skills: ["Python", "Machine Learning", "Data Analysis", "SQL"],
    category: "Data Science",
    status: "OPEN" as JobStatus,
  },
  {
    employerSlug: "techstart-india",
    slug: "senior-analyst-techstart",
    title: "Senior Data Analyst",
    description: `Lead data initiatives and mentor junior analysts in our product analytics team.

**Role:**
- Drive analytics strategy for product decisions
- Build and maintain analytics infrastructure
- Mentor junior team members
- Present insights to leadership

**Requirements:**
- 3+ years of data analytics experience
- Advanced SQL and Python skills
- Experience with data visualization and storytelling
- Leadership and mentoring experience`,
    employmentType: "FULL_TIME" as CareerEmploymentType,
    workMode: "ONSITE" as CareerWorkMode,
    location: "Bengaluru",
    experienceMin: 3,
    experienceMax: 6,
    salaryMin: 1200000,
    salaryMax: 1800000,
    skills: ["SQL", "Python", "Data Analysis", "Leadership", "Data Visualization", "Statistics"],
    category: "Data Analytics",
    status: "OPEN" as JobStatus,
  },
  {
    employerSlug: "datawise-analytics",
    slug: "product-analyst-datawise",
    title: "Product Analyst",
    description: `Bridge the gap between data and product decisions in our consulting practice.

**You will:**
- Analyze product usage patterns
- Create A/B testing frameworks
- Build product health dashboards
- Work with product managers on roadmap decisions

**Requirements:**
- 1-3 years in analytics or product role
- Strong SQL and Excel skills
- Understanding of product metrics
- Client-facing communication skills`,
    employmentType: "FULL_TIME" as CareerEmploymentType,
    workMode: "HYBRID" as CareerWorkMode,
    location: "Mumbai",
    experienceMin: 1,
    experienceMax: 3,
    salaryMin: 800000,
    salaryMax: 1200000,
    skills: ["SQL", "Product Analytics", "A/B Testing", "Excel", "Data Visualization"],
    category: "Product Analytics",
    status: "OPEN" as JobStatus,
  },
]

async function main() {
  console.log("Seeding Career OS sample data...")

  // Seed employers
  for (const employer of EMPLOYERS) {
    await prisma.employer.upsert({
      where: { slug: employer.slug },
      update: {
        name: employer.name,
        description: employer.description,
        website: employer.website,
        location: employer.location,
        verificationStatus: employer.verificationStatus,
      },
      create: employer,
    })
  }
  console.log(`Seeded ${EMPLOYERS.length} employers`)

  // Seed jobs
  for (const job of JOBS) {
    const employer = await prisma.employer.findUnique({ where: { slug: job.employerSlug } })
    if (!employer) {
      console.warn(`Employer ${job.employerSlug} not found, skipping job ${job.slug}`)
      continue
    }

    const { employerSlug, ...jobData } = job
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {
        ...jobData,
        employerId: employer.id,
        postedAt: new Date(),
      },
      create: {
        ...jobData,
        employerId: employer.id,
        postedAt: new Date(),
      },
    })
  }
  console.log(`Seeded ${JOBS.length} jobs`)

  console.log("Career OS seed complete.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
