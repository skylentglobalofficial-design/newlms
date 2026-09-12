// Centralized Skylent demo data — replace with Supabase/API in production

// ─── COURSES ─────────────────────────────────────────────────────────────────
export type CourseLesson = {
  id: string
  title: string
  type: 'video' | 'notes' | 'quiz' | 'assignment'
  duration?: string
  completed: boolean
  locked?: boolean
  media?: { provider: 'mux' | 'unavailable'; playbackId?: string }
}

export type CourseModule = {
  id: string
  title: string
  lessons: CourseLesson[]
}

export type Course = {
  slug: string
  title: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  mode: string
  lessons: number
  projects: number
  rating: number
  reviews: number
  price: number
  originalPrice: number
  desc: string
  longDesc: string
  outcomes: string[]
  forWhom: string[]
  modules: CourseModule[]
}

export const courses: Course[] = [
  {
    slug: 'data-analytics',
    title: 'Data Analytics',
    category: 'Data',
    level: 'Beginner',
    duration: '10 weeks',
    mode: 'Self-paced',
    lessons: 15,
    projects: 3,
    rating: 4.8,
    reviews: 312,
    price: 4999,
    originalPrice: 9999,
    desc: 'Master SQL, Excel, Power BI and Python to analyse data and drive business decisions.',
    longDesc: 'A hands-on Data Analytics course designed to take you from spreadsheets to dashboards. You work with real datasets, build Power BI reports, and practice presenting insights to stakeholders.',
    outcomes: ['Analyse business datasets with SQL and Python', 'Build interactive Power BI dashboards', 'Create Excel models and pivot tables', 'Present data insights to stakeholders', 'Complete 3 portfolio-ready projects'],
    forWhom: ['Commerce or non-technical graduates', 'Professionals moving into data roles', 'Business analysts upskilling', 'MBA students building analytics capability'],
    modules: [
      { id: 'm1', title: 'Foundations of Data', lessons: [
        { id: 'l1', title: 'What is Data Analytics?', type: 'video', duration: '12:30', completed: true },
        { id: 'l2', title: 'The Analytics Mindset', type: 'notes', completed: true },
        { id: 'l3', title: 'Foundations Quiz', type: 'quiz', completed: false },
      ]},
      { id: 'm2', title: 'Microsoft Excel', lessons: [
        { id: 'l4', title: 'Excel Fundamentals', type: 'video', duration: '18:45', completed: false },
        { id: 'l5', title: 'Pivot Tables & Charts', type: 'video', duration: '22:10', completed: false },
        { id: 'l6', title: 'Excel Assignment', type: 'assignment', completed: false },
      ]},
      { id: 'm3', title: 'SQL for Analysis', lessons: [
        { id: 'l7', title: 'Introduction to SQL', type: 'video', duration: '20:00', completed: false },
        { id: 'l8', title: 'SQL Notes & Reference', type: 'notes', completed: false },
        { id: 'l9', title: 'SQL Quiz', type: 'quiz', completed: false },
      ]},
      { id: 'm4', title: 'Power BI', lessons: [
        { id: 'l10', title: 'Getting Started with Power BI', type: 'video', duration: '25:30', completed: false },
        { id: 'l11', title: 'DAX Formulas', type: 'notes', completed: false },
        { id: 'l12', title: 'Dashboard Project', type: 'assignment', completed: false },
      ]},
      { id: 'm5', title: 'Capstone Projects', lessons: [
        { id: 'l13', title: 'Project 1: Sales Analysis', type: 'assignment', completed: false },
        { id: 'l14', title: 'Project 2: HR Dashboard', type: 'assignment', completed: false },
        { id: 'l15', title: 'Final Assessment', type: 'quiz', completed: false },
      ]},
    ],
  },
  {
    slug: 'python-programming',
    title: 'Python for Data Science',
    category: 'Programming',
    level: 'Beginner',
    duration: '8 weeks',
    mode: 'Self-paced',
    lessons: 6,
    projects: 2,
    rating: 4.9,
    reviews: 245,
    price: 3999,
    originalPrice: 7999,
    desc: 'Learn Python from scratch — variables, pandas, numpy, matplotlib, and real-world projects.',
    longDesc: 'Python is the language of data science. This course teaches you Python through practical, data-focused exercises — no prior programming experience needed.',
    outcomes: ['Write Python programs from scratch', 'Manipulate data with pandas', 'Visualise data with matplotlib and seaborn', 'Build 2 data analysis projects'],
    forWhom: ['Complete beginners to programming', 'Analysts wanting to add Python to their toolkit', 'Students building data science foundations'],
    modules: [
      { id: 'm1', title: 'Python Basics', lessons: [
        { id: 'l1', title: 'Variables and Data Types', type: 'video', duration: '14:20', completed: true },
        { id: 'l2', title: 'Control Flow & Loops', type: 'video', duration: '18:00', completed: false },
        { id: 'l3', title: 'Basics Quiz', type: 'quiz', completed: false },
      ]},
      { id: 'm2', title: 'Data with pandas', lessons: [
        { id: 'l4', title: 'DataFrames & Series', type: 'video', duration: '22:30', completed: false },
        { id: 'l5', title: 'Data Cleaning', type: 'notes', completed: false },
        { id: 'l6', title: 'Data Project', type: 'assignment', completed: false },
      ]},
    ],
  },
  {
    slug: 'generative-ai',
    title: 'Generative AI',
    category: 'AI',
    level: 'Intermediate',
    duration: '6 weeks',
    mode: 'Self-paced',
    lessons: 6,
    projects: 2,
    rating: 4.9,
    reviews: 189,
    price: 5999,
    originalPrice: 12999,
    desc: 'Prompt engineering, LangChain, RAG systems, and building LLM applications with real project work.',
    longDesc: 'A hands-on Generative AI course — from prompt engineering fundamentals to building applications with LLMs, vector databases, and agent frameworks.',
    outcomes: ['Write effective prompts for production use cases', 'Build RAG systems with LangChain', 'Ship two LLM application projects', 'Understand LLM architectures', 'Deploy projects with clear evaluation criteria'],
    forWhom: ['Developers wanting to add AI to their stack', 'Product managers building AI products', 'Data scientists extending into LLMs'],
    modules: [
      { id: 'm1', title: 'LLM Fundamentals', lessons: [
        { id: 'l1', title: 'How LLMs Work', type: 'video', duration: '20:00', completed: false },
        { id: 'l2', title: 'Prompt Engineering', type: 'video', duration: '24:30', completed: false },
        { id: 'l3', title: 'Prompting Quiz', type: 'quiz', completed: false },
      ]},
      { id: 'm2', title: 'Building with AI', lessons: [
        { id: 'l4', title: 'LangChain Basics', type: 'video', duration: '28:00', completed: false },
        { id: 'l5', title: 'RAG Architecture Notes', type: 'notes', completed: false },
        { id: 'l6', title: 'AI App Project', type: 'assignment', completed: false },
      ]},
    ],
  },
  {
    slug: 'power-bi',
    title: 'Power BI Masterclass',
    category: 'Data',
    level: 'Beginner',
    duration: '5 weeks',
    mode: 'Self-paced',
    lessons: 3,
    projects: 2,
    rating: 4.7,
    reviews: 198,
    price: 2999,
    originalPrice: 5999,
    desc: 'Build professional business intelligence dashboards with Power BI and DAX from scratch.',
    longDesc: 'The complete Power BI course covering data modelling, DAX formulas, dashboard design, and publishing reports for real business use cases.',
    outcomes: ['Import and transform data', 'Write DAX measures and calculations', 'Design professional dashboards', 'Publish and share reports'],
    forWhom: ['Business analysts', 'Finance professionals', 'Anyone working with business data'],
    modules: [
      { id: 'm1', title: 'Getting Started', lessons: [
        { id: 'l1', title: 'Power BI Interface Tour', type: 'video', duration: '10:00', completed: false },
        { id: 'l2', title: 'Data Import & Transform', type: 'video', duration: '18:00', completed: false },
        { id: 'l3', title: 'Intro Quiz', type: 'quiz', completed: false },
      ]},
    ],
  },
  {
    slug: 'product-management',
    title: 'Product Management',
    category: 'Business',
    level: 'Intermediate',
    duration: '8 weeks',
    mode: 'Self-paced',
    lessons: 3,
    projects: 3,
    rating: 4.8,
    reviews: 156,
    price: 6999,
    originalPrice: 14999,
    desc: 'Product thinking, user research, roadmapping, and stakeholder management worked through written case studies.',
    longDesc: 'Develop the complete product management skillset — from discovery to delivery — through recorded lessons, written case studies, and assignments you submit in the platform.',
    outcomes: ['Conduct user research and validation', 'Build product roadmaps', 'Write user stories and PRDs', 'Work with engineering and design', 'Build a PM portfolio'],
    forWhom: ['Engineers moving into PM roles', 'Business analysts wanting product roles', 'MBA grads targeting product management'],
    modules: [
      { id: 'm1', title: 'Product Thinking', lessons: [
        { id: 'l1', title: 'What Makes a Great PM?', type: 'video', duration: '16:00', completed: false },
        { id: 'l2', title: 'PM Frameworks', type: 'notes', completed: false },
        { id: 'l3', title: 'Thinking Quiz', type: 'quiz', completed: false },
      ]},
    ],
  },
  {
    slug: 'full-stack-web',
    title: 'Full Stack Web Development',
    category: 'Engineering',
    level: 'Intermediate',
    duration: '14 weeks',
    mode: 'Self-paced',
    lessons: 6,
    projects: 4,
    rating: 4.8,
    reviews: 203,
    price: 7999,
    originalPrice: 16999,
    desc: 'Build complete web applications — React, Node.js, PostgreSQL, and cloud deployment — through projects you build and submit yourself.',
    longDesc: 'A thorough full-stack development course that takes you from HTML fundamentals to building and deploying real-world web applications with modern tools and frameworks.',
    outcomes: ['Build full-stack web apps with React & Node', 'Design and query PostgreSQL databases', 'Deploy to cloud platforms', 'Contribute to real-world projects', 'Build a development portfolio'],
    forWhom: ['Beginners wanting software development careers', 'Designers moving into development', 'Non-CS graduates targeting tech roles'],
    modules: [
      { id: 'm1', title: 'Web Foundations', lessons: [
        { id: 'l1', title: 'HTML & CSS', type: 'video', duration: '20:00', completed: false },
        { id: 'l2', title: 'JavaScript Basics', type: 'video', duration: '28:00', completed: false },
        { id: 'l3', title: 'Web Foundations Quiz', type: 'quiz', completed: false },
      ]},
      { id: 'm2', title: 'React', lessons: [
        { id: 'l4', title: 'React Fundamentals', type: 'video', duration: '32:00', completed: false },
        { id: 'l5', title: 'State & Hooks', type: 'notes', completed: false },
        { id: 'l6', title: 'React Project', type: 'assignment', completed: false },
      ]},
    ],
  },
]

// ─── PROGRAMS ────────────────────────────────────────────────────────────────
export type PricingTier = {
  name: string
  price: number
  originalPrice: number
  features: string[]
  highlight?: boolean
}

export type ProgramType = 'SCHOOLING' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'EXAM_PREP' | 'WEBINAR' | 'CERTIFICATE' | 'PROFESSIONAL'
export type EnrollmentStatus = 'open' | 'waitlist' | 'coming_soon'

export type CurriculumModule = {
  number: string
  title: string
  description: string
  duration: string
  topics?: string[]
}

export type ProjectDetail = {
  title: string
  what: string
  skills: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

export type FAQ = {
  q: string
  a: string
}

export type Faculty = {
  name: string
  role: string
  expertise: string
  affiliation?: string
  placeholder?: true
}

export type Program = {
  slug: string
  name: string
  duration: string
  modules: number
  projects: number
  format: string
  cert: string
  outcome: string
  desc: string
  pricing: PricingTier[]
  upcomingBatch: string
  // Extended product fields
  programType: ProgramType
  level: string
  whoIsItFor?: string[]
  whatYouWillLearn?: string[]
  curriculumDetail?: CurriculumModule[]
  projectsDetail?: ProjectDetail[]
  learningExperience?: string[]
  careerSupport?: boolean
  enrollmentStatus?: EnrollmentStatus
  faqs?: FAQ[]
  faculty?: Faculty[]
  // Exam prep specific
  examPattern?: string
  examSections?: string[]
}

export const programs: Program[] = [
  {
    slug: 'data-science-ai',
    name: 'Data Science & AI',
    duration: '11 months',
    modules: 18,
    projects: 6,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'Data Scientist / ML Engineer',
    desc: 'Python, machine learning, deep learning and NLP, taught through recorded lessons, notes and assignments you submit in the platform.',
    upcomingBatch: 'Start when you enrol',
    programType: 'PROFESSIONAL',
    level: 'Advanced',
    enrollmentStatus: 'open',
    careerSupport: true,
    whoIsItFor: [
      'Engineers and developers aiming for data science or ML roles',
      'Working professionals with a quantitative or analytical background',
      'Graduates from STEM fields looking to specialise in AI',
      'Analysts who want to deepen their technical ML skills',
    ],
    whatYouWillLearn: [
      'Python for data science: NumPy, pandas, matplotlib, seaborn',
      'Statistical foundations, probability, and hypothesis testing',
      'Supervised learning: regression, classification, ensemble methods',
      'Unsupervised learning: clustering, dimensionality reduction',
      'Deep learning: neural networks, CNNs, RNNs, transformers',
      'Natural language processing with HuggingFace and LLMs',
      'Model deployment and MLOps fundamentals',
    ],
    curriculumDetail: [
      { number: '01', title: 'Python & Data Foundations', description: 'Core Python programming, NumPy, pandas, and data visualisation. The toolkit for every module that follows.', duration: '4 weeks', topics: ['Python syntax and data structures', 'NumPy array operations', 'pandas DataFrames', 'Matplotlib & Seaborn visualisation'] },
      { number: '02', title: 'Statistics & Probability', description: 'Statistical thinking, distributions, hypothesis testing, and Bayesian foundations essential for ML.', duration: '3 weeks', topics: ['Descriptive statistics', 'Probability distributions', 'Hypothesis testing', 'A/B testing fundamentals'] },
      { number: '03', title: 'Machine Learning', description: 'Supervised and unsupervised learning algorithms, model evaluation, feature engineering, and ensemble methods.', duration: '6 weeks', topics: ['Linear and logistic regression', 'Decision trees and random forests', 'SVM, KNN, Naive Bayes', 'K-Means, PCA, DBSCAN'] },
      { number: '04', title: 'Deep Learning & NLP', description: 'Neural network architectures, computer vision, sequence models, and applied NLP using transformers.', duration: '6 weeks', topics: ['Feed-forward and convolutional networks', 'RNNs, LSTMs, and attention', 'Transfer learning with HuggingFace', 'Prompt engineering basics'] },
      { number: '05', title: 'Applied Industry Projects', description: 'Three end-to-end projects built with public datasets and submitted as assignments in the platform.', duration: '6 weeks' },
      { number: '06', title: 'Career Bootcamp', description: 'Career OS access: profile, the job board, application tracking, and structured interview practice.', duration: '3 weeks' },
    ],
    projectsDetail: [
      { title: 'Customer Churn Prediction', what: 'Build a classification model to identify at-risk customers using telecom subscriber data', skills: ['Python', 'scikit-learn', 'Feature Engineering', 'XGBoost'], difficulty: 'Intermediate' },
      { title: 'Recommendation Engine', what: 'Design a collaborative filtering recommendation system for an e-commerce dataset', skills: ['Python', 'Matrix Factorisation', 'Surprise library', 'Evaluation metrics'], difficulty: 'Advanced' },
      { title: 'NLP Sentiment Pipeline', what: 'Fine-tune a transformer model on domain-specific review data and deploy as an inference API', skills: ['HuggingFace Transformers', 'PyTorch', 'FastAPI', 'Docker'], difficulty: 'Advanced' },
    ],
    learningExperience: [
      'Recorded lessons, written notes and quizzes you work through at your own pace',
      'Assignments you submit in the platform, with your files stored against your progress',
      'Lessons unlock in order so the sequence stays deliberate',
      'Progress is saved per lesson and visible on your dashboard',
      'Career OS access once the programme is completed',
    ],
    faqs: [
      { q: 'Do I need prior programming experience?', a: 'A basic familiarity with any programming language helps, but we begin from Python fundamentals. Learners from engineering, mathematics, or science backgrounds adapt well.' },
      { q: 'How many hours per week does this require?', a: 'Plan for 10–15 hours per week — recorded lessons, notes, quizzes, assignments, and project work.' },
      { q: 'Is Career OS included?', a: 'Yes. Completing a Professional Programme opens Career OS: your profile, the job board, application tracking, and structured interview practice. Skylent does not place you in a job and makes no placement guarantee.' },
      { q: 'How is the material delivered?', a: 'Through the Skylent learning platform: recorded lessons, written notes, quizzes and assignments you submit online. Lessons unlock in order and your progress is saved as you go.' },
      { q: 'What certification do I receive?', a: 'A Skylent completion certificate once you finish the required lessons and assessments. It records what you completed on Skylent; it is not an accredited or university-recognised qualification.' },
    ],
    faculty: [
      { name: 'Faculty Lead · Data Science', role: 'Program Lead', expertise: 'Machine Learning & Applied AI', placeholder: true },
      { name: 'Industry Mentor · ML Engineering', role: 'Mentor', expertise: 'MLOps & Model Deployment', placeholder: true },
    ],
    pricing: [
      { name: 'Self-paced', price: 29999, originalPrice: 59999, features: ['Published lessons in linked courses', 'Assignments submitted in the platform', 'Skylent completion certificate'] },
      { name: 'Pro', price: 44999, originalPrice: 89999, highlight: true, features: ['Everything in Self-paced', '3 guided project briefs', 'Written feedback on submitted assignments', 'Career OS access on completion'] },
      { name: 'Career', price: 59999, originalPrice: 119999, features: ['Everything in Pro', 'Career OS interview practice sets', 'Profile and portfolio review', 'Application tracking in Career OS'] },
    ],
  },
  {
    slug: 'data-analytics-pro',
    name: 'Data Analytics with Gen AI',
    duration: '8 months',
    modules: 14,
    projects: 5,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'Data Analyst / BI Developer',
    desc: 'Build expertise in SQL, Excel, Power BI, and Python — with a dedicated Gen AI module for modern analytics workflows.',
    upcomingBatch: 'Start when you enrol',
    programType: 'PROFESSIONAL',
    level: 'Intermediate',
    enrollmentStatus: 'open',
    careerSupport: true,
    whoIsItFor: [
      'Commerce, humanities, or non-technical graduates entering data roles',
      'Business analysts and operations professionals upskilling',
      'Finance and accounting professionals adding data capabilities',
      'Anyone working with spreadsheets who wants to go further',
    ],
    whatYouWillLearn: [
      'SQL for business analytics: queries, joins, aggregations, window functions',
      'Microsoft Excel: pivot tables, VLOOKUP, financial modelling',
      'Power BI: data modelling, DAX, dashboard design, and publishing',
      'Python for data analysis: pandas, matplotlib, seaborn',
      'Generative AI for analytics: prompting LLMs for data tasks',
      'Storytelling with data and executive presentation',
    ],
    curriculumDetail: [
      { number: '01', title: 'Analytics Foundations', description: 'The analyst mindset, data types, business metrics, and the analytics workflow from question to insight.', duration: '2 weeks' },
      { number: '02', title: 'Microsoft Excel', description: 'Pivot tables, VLOOKUP and XLOOKUP, financial functions, and building analytical models in Excel.', duration: '3 weeks' },
      { number: '03', title: 'SQL for Business', description: 'Database fundamentals, querying, joins, aggregations, CTEs, and window functions for business analysis.', duration: '4 weeks' },
      { number: '04', title: 'Power BI', description: 'Connecting data sources, data modelling, DAX formulas, and building professional BI dashboards.', duration: '4 weeks' },
      { number: '05', title: 'Python for Analytics', description: 'pandas for data manipulation, matplotlib and seaborn for visualisation, and basic statistical analysis.', duration: '4 weeks' },
      { number: '06', title: 'Generative AI for Analysts', description: 'Using LLMs to accelerate data tasks: generating SQL, summarising reports, and building analytical workflows.', duration: '2 weeks' },
      { number: '07', title: 'Industry Projects & Career', description: 'Five real-world analytics projects, presentation skills, and Career OS access.', duration: '5 weeks' },
    ],
    projectsDetail: [
      { title: 'Sales Performance Dashboard', what: 'Build an end-to-end Power BI dashboard from a raw sales dataset, including DAX measures and drill-through pages', skills: ['Power BI', 'DAX', 'Data Modelling'], difficulty: 'Intermediate' },
      { title: 'Customer Segmentation Analysis', what: 'Use SQL and Python to segment customers by behaviour and present actionable insights to a business audience', skills: ['SQL', 'Python', 'Segmentation', 'Presentation'], difficulty: 'Intermediate' },
      { title: 'Financial Analytics Model', what: 'Build a multi-year financial model in Excel with scenario analysis and dynamic visualisations', skills: ['Excel', 'Financial Modelling', 'Data Visualisation'], difficulty: 'Beginner' },
    ],
    learningExperience: [
      'Recorded lessons and written notes covering Excel, SQL, Power BI and Python',
      'Quizzes and assignments submitted and stored in the platform',
      'Lessons unlock in order so the sequence stays deliberate',
      'Progress is saved per lesson and visible on your dashboard',
      'Career OS access once the programme is completed',
    ],
    faqs: [
      { q: 'Do I need a technical background?', a: 'No. This program is specifically designed for non-technical learners. We start from Excel and build up through SQL, Python, and Power BI step by step.' },
      { q: 'Is this suitable for working professionals?', a: 'Yes. Everything is recorded and self-paced, so you can fit it around your schedule.' },
      { q: 'What jobs does this program prepare me for?', a: 'Common roles include Data Analyst, Business Analyst, BI Analyst, and Reporting Analyst across industries like e-commerce, banking, consulting, and operations.' },
      { q: 'Is Career OS included?', a: 'Yes. Completing a Professional Programme opens Career OS: your profile, the job board, application tracking, and structured interview practice. Skylent does not place you in a job and makes no placement guarantee.' },
    ],
    pricing: [
      { name: 'Self-paced', price: 19999, originalPrice: 39999, features: ['Published lessons in linked courses', 'Assignments submitted in the platform', 'Skylent completion certificate'] },
      { name: 'Pro', price: 29999, originalPrice: 59999, highlight: true, features: ['Everything in Self-paced', '3 guided project briefs', 'Written feedback on submitted assignments', 'Career OS access on completion'] },
      { name: 'Career', price: 39999, originalPrice: 79999, features: ['Everything in Pro', 'Career OS interview practice sets', 'Profile and portfolio review', 'Application tracking in Career OS'] },
    ],
  },
  {
    slug: 'full-stack',
    name: 'Full Stack Development',
    duration: '9 months',
    modules: 16,
    projects: 5,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'Full Stack Developer',
    desc: 'Build end-to-end web applications using React, Node.js, PostgreSQL, and cloud deployment — with projects you build and submit in the platform.',
    upcomingBatch: 'Not yet teaching',
    programType: 'PROFESSIONAL',
    level: 'Intermediate',
    enrollmentStatus: 'open',
    careerSupport: true,
    whoIsItFor: [
      'Beginners with basic programming curiosity wanting a software development career',
      'Designers and non-engineers wanting to build their own products',
      'Non-CS graduates targeting technology roles',
      'Backend or frontend developers wanting to become full stack',
    ],
    whatYouWillLearn: [
      'HTML5, CSS3, and responsive web design',
      'JavaScript ES6+ and TypeScript fundamentals',
      'React: components, hooks, state management, routing',
      'Node.js and Express: REST APIs and backend architecture',
      'PostgreSQL: database design, queries, and ORMs',
      'Authentication, security, and deployment to cloud platforms',
      'Git, version control, and professional engineering practices',
    ],
    curriculumDetail: [
      { number: '01', title: 'Web Foundations', description: 'HTML5, CSS3, Flexbox, Grid, and responsive design. Building pages that work on every device.', duration: '3 weeks' },
      { number: '02', title: 'JavaScript & TypeScript', description: 'Core JavaScript, ES6+ features, asynchronous programming, and TypeScript fundamentals.', duration: '5 weeks' },
      { number: '03', title: 'React Frontend', description: 'Component architecture, hooks, context, React Router, and building production-quality UIs.', duration: '6 weeks' },
      { number: '04', title: 'Node.js & APIs', description: 'Server-side development with Node.js and Express, REST API design, middleware, and error handling.', duration: '4 weeks' },
      { number: '05', title: 'Databases', description: 'PostgreSQL database design, SQL queries, Prisma ORM, and connecting backends to data.', duration: '4 weeks' },
      { number: '06', title: 'Auth, Security & Deployment', description: 'JWT authentication, OWASP security basics, Docker, and deploying full applications to cloud platforms.', duration: '4 weeks' },
      { number: '07', title: 'Client Projects & Career', description: 'Five real-world projects with code reviews, portfolio review, and Career OS access.', duration: '10 weeks' },
    ],
    projectsDetail: [
      { title: 'E-Commerce Platform', what: 'Build a full-stack shopping application with product listings, cart, checkout, and order management', skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe'], difficulty: 'Advanced' },
      { title: 'Task Management App', what: 'Build a Trello-like project management tool with real-time updates and team collaboration', skills: ['React', 'WebSockets', 'Node.js', 'PostgreSQL'], difficulty: 'Intermediate' },
      { title: 'REST API Service', what: 'Design and build a production-grade REST API with authentication, rate limiting, and documentation', skills: ['Node.js', 'Express', 'JWT', 'Swagger'], difficulty: 'Intermediate' },
    ],
    learningExperience: [
      'Recorded lessons, written notes and quizzes you work through at your own pace',
      'Assignments you submit in the platform, with your files stored against your progress',
      'Lessons unlock in order so the sequence stays deliberate',
      'Progress is saved per lesson and visible on your dashboard',
      'A completion certificate once the course requirements are met',
    ],
    faqs: [
      { q: 'Do I need prior coding experience?', a: 'No prior experience is required. We start from the very basics of HTML and build up to deploying full applications over 9 months.' },
      { q: 'How is this different from self-learning?', a: 'A sequenced curriculum with assignments you submit and progress that is tracked for you, plus Career OS access on completion.' },
      { q: 'What kind of jobs will I be qualified for?', a: 'Junior Full Stack Developer, Frontend Developer, Backend Developer, and Associate Software Engineer roles across product and service companies.' },
      { q: 'Is Career OS included?', a: 'Yes. Completing this Professional Programme opens Career OS. Skylent does not place you in a job and makes no placement guarantee.' },
    ],
    pricing: [
      { name: 'Self-paced', price: 24999, originalPrice: 49999, features: ['Planned curriculum', 'Assignments when lessons exist', 'Skylent completion certificate'] },
      { name: 'Pro', price: 39999, originalPrice: 79999, highlight: true, features: ['Everything in Self-paced', '3 guided project briefs', 'Written feedback on submitted assignments', 'Career OS access on completion'] },
      { name: 'Career', price: 54999, originalPrice: 109999, features: ['Everything in Pro', 'Career OS interview practice sets', 'Profile and portfolio review', 'Application tracking in Career OS'] },
    ],
  },
  {
    slug: 'generative-ai-program',
    name: 'Generative AI',
    duration: '4 months',
    modules: 10,
    projects: 3,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'AI/ML Engineer',
    desc: 'LLMs, prompt engineering, RAG systems, and AI product development with hands-on implementation across every module.',
    upcomingBatch: 'Not yet teaching',
    programType: 'PROFESSIONAL',
    level: 'Intermediate',
    enrollmentStatus: 'open',
    careerSupport: true,
    whoIsItFor: [
      'Developers who want to build LLM-based products and features',
      'Data scientists extending their skills into LLMs and generative models',
      'Product managers and tech leads evaluating AI architecture decisions',
      'Engineers with Python experience wanting to specialise in AI',
    ],
    whatYouWillLearn: [
      'How large language models work: architecture, training, and inference',
      'Prompt engineering: zero-shot, few-shot, chain-of-thought, and advanced techniques',
      'Retrieval-augmented generation (RAG) system design',
      'LangChain and LlamaIndex for building AI applications',
      'Vector databases: Pinecone, Weaviate, ChromaDB',
      'Evaluation and testing of LLM-based systems',
      'Deploying AI applications to production with FastAPI and Docker',
    ],
    curriculumDetail: [
      { number: '01', title: 'LLM Foundations', description: 'How transformers work, the training process, key model families, and how to choose the right model for your use case.', duration: '2 weeks' },
      { number: '02', title: 'Prompt Engineering', description: 'Zero-shot, few-shot, chain-of-thought, ReAct, and advanced prompting patterns with practical exercises.', duration: '3 weeks' },
      { number: '03', title: 'RAG Architecture', description: 'Retrieval-augmented generation: chunking, embeddings, vector stores, retrieval strategies, and evaluation.', duration: '4 weeks' },
      { number: '04', title: 'AI Application Development', description: 'Building end-to-end AI apps with LangChain, LlamaIndex, and streaming APIs.', duration: '3 weeks' },
      { number: '05', title: 'Production & Evaluation', description: 'Testing LLM systems, handling hallucinations, latency, cost, and deploying with FastAPI and Docker.', duration: '2 weeks' },
      { number: '06', title: 'Capstone Projects', description: 'Three AI product builds submitted as assignments in the platform.', duration: '3 weeks' },
    ],
    projectsDetail: [
      { title: 'Document Q&A System', what: 'Build a RAG-based question-answering system over a private document corpus with source attribution', skills: ['LangChain', 'ChromaDB', 'OpenAI API', 'FastAPI'], difficulty: 'Intermediate' },
      { title: 'AI Writing Assistant', what: 'Build a context-aware writing assistant with memory, tone control, and multi-turn conversation', skills: ['LangChain', 'Memory', 'Prompt Engineering', 'Streamlit'], difficulty: 'Intermediate' },
      { title: 'Multi-Agent Research Tool', what: 'Build an autonomous multi-agent system that researches topics, synthesises information, and generates reports', skills: ['LangGraph', 'Tool use', 'Agent evaluation', 'Python'], difficulty: 'Advanced' },
    ],
    learningExperience: [
      'Recorded lessons, written notes and quizzes you work through at your own pace',
      'Assignments you submit in the platform, with your files stored against your progress',
      'Lessons unlock in order so the sequence stays deliberate',
      'Progress is saved per lesson and visible on your dashboard',
      'A completion certificate once the course requirements are met',
    ],
    faqs: [
      { q: 'What prior knowledge do I need?', a: 'Comfortable Python programming is required. Familiarity with basic ML concepts is helpful but not mandatory.' },
      { q: 'Does this cover open-source models as well as commercial APIs?', a: 'Yes. We cover both OpenAI and Anthropic APIs as well as open-weight models like Llama and Mistral.' },
      { q: 'How quickly is this content updated?', a: 'The generative AI space moves fast, so module content is revised as the field changes. Published lessons always show what is currently in the platform.' },
      { q: 'Is Career OS included?', a: 'Yes. Completing this Professional Programme opens Career OS. Skylent does not place you in a job and makes no placement guarantee.' },
    ],
    pricing: [
      { name: 'Self-paced', price: 14999, originalPrice: 29999, features: ['Planned curriculum', 'Assignments when lessons exist', 'Skylent completion certificate'] },
      { name: 'Pro', price: 24999, originalPrice: 49999, highlight: true, features: ['Everything in Self-paced', '3 guided AI project briefs', 'Written feedback on submitted assignments', 'Career OS access on completion'] },
      { name: 'Career', price: 34999, originalPrice: 69999, features: ['Everything in Pro', 'Career OS interview practice sets', 'Profile and portfolio review', 'Application tracking in Career OS'] },
    ],
  },
  {
    slug: 'product-management',
    name: 'Product Management',
    duration: '5 months',
    modules: 10,
    projects: 3,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'Product Manager / APM',
    desc: 'Develop product thinking, user research, roadmapping, and stakeholder management skills through written case studies and assignments.',
    upcomingBatch: 'Not yet teaching',
    programType: 'PROFESSIONAL',
    level: 'Intermediate',
    enrollmentStatus: 'open',
    careerSupport: true,
    whoIsItFor: [
      'Software engineers or tech leads wanting to move into product roles',
      'Business analysts and consultants targeting product management',
      'MBA graduates and management trainees entering product',
      'Entrepreneurs who want to strengthen structured product thinking',
    ],
    whatYouWillLearn: [
      'Product thinking: problem framing, opportunity sizing, and prioritisation',
      'User research: discovery interviews, surveys, and synthesis',
      'Product roadmapping: goals, OKRs, and stakeholder alignment',
      'Writing PRDs, user stories, and acceptance criteria',
      'Working with engineering and design teams',
      'Metrics, analytics, and data-driven product decisions',
      'PM interview preparation: case studies, execution, and strategy questions',
    ],
    curriculumDetail: [
      { number: '01', title: 'Product Thinking', description: 'What great product managers do, how to frame problems, and the frameworks that underpin good product decisions.', duration: '2 weeks' },
      { number: '02', title: 'User Research', description: 'Discovery interviews, survey design, competitive analysis, and synthesising insights into actionable product direction.', duration: '3 weeks' },
      { number: '03', title: 'Roadmapping & Prioritisation', description: 'OKRs, product vision, roadmap formats, prioritisation frameworks (RICE, MoSCoW), and stakeholder communication.', duration: '3 weeks' },
      { number: '04', title: 'Execution', description: 'Writing PRDs and user stories, sprint planning, working with engineers, and managing releases.', duration: '4 weeks' },
      { number: '05', title: 'Metrics & Analytics', description: 'Defining product metrics, building dashboards, A/B testing, and making data-informed decisions.', duration: '3 weeks' },
      { number: '06', title: 'PM Interview Prep', description: 'Case study method, product design questions, estimation, and strategy frameworks used in top PM interviews.', duration: '5 weeks' },
    ],
    projectsDetail: [
      { title: 'Product Discovery Report', what: 'Conduct 8 user interviews, synthesise findings, and present a product opportunity with a proposed solution', skills: ['User Research', 'Synthesis', 'Opportunity Framing', 'Presentation'], difficulty: 'Beginner' },
      { title: 'Product Roadmap', what: 'Build a 6-month product roadmap with OKRs, prioritised features, and a stakeholder communication plan', skills: ['Roadmapping', 'Prioritisation', 'OKRs', 'Stakeholder Management'], difficulty: 'Intermediate' },
      { title: 'Case Study Portfolio', what: 'Solve 3 PM case studies (product design, metrics, and strategy) in interview-ready format', skills: ['Product Design', 'Metrics', 'Strategy', 'Communication'], difficulty: 'Advanced' },
    ],
    learningExperience: [
      'Recorded lessons, written notes and quizzes you work through at your own pace',
      'Assignments you submit in the platform, with your files stored against your progress',
      'Lessons unlock in order so the sequence stays deliberate',
      'Progress is saved per lesson and visible on your dashboard',
      'A completion certificate once the course requirements are met',
    ],
    faqs: [
      { q: 'Do I need a technical background?', a: 'No. While engineers who transition to PM have strong technical credibility, the program is designed for learners from any background — business, design, or technical.' },
      { q: 'What companies do Skylent PM graduates join?', a: 'We do not publish placement data we cannot verify. Our focus is on giving you the skills and preparation to compete for PM roles on your own merit.' },
      { q: 'How is the programme structured?', a: 'Ten modules of recorded lessons and notes, each with case studies and an assignment you submit in the platform.' },
      { q: 'Is Career OS included?', a: 'Yes. Completing this Professional Programme opens Career OS. Skylent does not place you in a job and makes no placement guarantee.' },
    ],
    pricing: [
      { name: 'Self-paced', price: 17999, originalPrice: 35999, features: ['Planned curriculum', 'Case studies when published', 'Skylent completion certificate'] },
      { name: 'Pro', price: 27999, originalPrice: 55999, highlight: true, features: ['Everything in Self-paced', '3 guided project briefs', 'Written feedback on submitted assignments'] },
      { name: 'Career', price: 37999, originalPrice: 75999, features: ['Everything in Pro', 'Career OS interview practice sets', 'Profile and portfolio review'] },
    ],
  },

  // ─── EXAM PREP ─────────────────────────────────────────────────────────────
  {
    slug: 'jee-advanced-prep',
    name: 'JEE Advanced Preparation',
    duration: '12 months',
    modules: 3,
    projects: 0,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'JEE Advanced preparation',
    desc: 'A planned subject-by-subject JEE Advanced programme covering Physics, Chemistry and Mathematics. The syllabus below is an outline — no material has been published yet.',
    upcomingBatch: 'To be announced',
    programType: 'EXAM_PREP',
    level: 'Advanced',
    enrollmentStatus: 'coming_soon',
    careerSupport: false,
    examPattern: 'JEE Advanced: 3 hours, 3 papers. Physics, Chemistry, Mathematics — objective and numerical questions. Negative marking applies.',
    examSections: ['Physics', 'Chemistry', 'Mathematics'],
    whoIsItFor: [
      'Class 11 and 12 students targeting IIT and NIT admissions',
      'Repeaters wanting structured full-year preparation',
      'Students who want to supplement school coaching with structured practice',
    ],
    whatYouWillLearn: [
      'Physics: Mechanics, Thermodynamics, Electrostatics, Optics, Modern Physics',
      'Chemistry: Physical, Organic, and Inorganic Chemistry with problem-solving approaches',
      'Mathematics: Calculus, Algebra, Coordinate Geometry, Vectors, Probability',
      'Exam strategy: time management, paper pattern, negative marking approach',
      'Planned: exam strategy and timed practice, once material is published',
    ],
    curriculumDetail: [
      {
        number: '01', title: 'Physics', description: 'Complete JEE Advanced Physics syllabus — concept classes, solved examples, and progressive practice sets from topic-level to exam-level difficulty.', duration: '12 months (parallel)',
        topics: ['Mechanics', 'Heat & Thermodynamics', 'Electrostatics', 'Current Electricity', 'Magnetism', 'Optics', 'Modern Physics'],
      },
      {
        number: '02', title: 'Chemistry', description: 'Physical, Organic, and Inorganic Chemistry structured from foundational understanding to JEE Advanced difficulty with reaction mechanisms and numericals.', duration: '12 months (parallel)',
        topics: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Reaction Mechanisms', 'Stoichiometry'],
      },
      {
        number: '03', title: 'Mathematics', description: 'Calculus, Algebra, Coordinate Geometry, Vectors and 3D, and Probability — emphasis on concept clarity and multi-step problem solving.', duration: '12 months (parallel)',
        topics: ['Calculus (Differential & Integral)', 'Algebra & Complex Numbers', 'Coordinate Geometry', 'Vectors & 3D Geometry', 'Probability & Statistics'],
      },
    ],
    learningExperience: [
      'Planned: recorded concept lessons for each subject',
      'Planned: practice sets and chapter tests inside the platform',
      'Planned: full-length mock papers in the exam format',
      'None of this material is in the platform yet — the programme has not launched',
    ],
    faqs: [
      { q: 'Is this for JEE Mains or JEE Advanced?', a: 'This program covers the full syllabus for both JEE Mains and JEE Advanced, with a focus on Advanced-level depth and problem-solving.' },
      { q: 'When does this start?', a: 'No start date has been set. Register your interest and we will contact you when there is a date to share.' },
      { q: 'Is there a test series?', a: 'A test series is planned, but nothing has been published yet. Nothing is available to practise on today.' },
    ],
    faculty: [
      { name: 'Physics Faculty · JEE', role: 'Physics', expertise: 'Mechanics, Optics, Modern Physics', placeholder: true },
      { name: 'Chemistry Faculty · JEE', role: 'Chemistry', expertise: 'Physical & Organic Chemistry', placeholder: true },
      { name: 'Mathematics Faculty · JEE', role: 'Mathematics', expertise: 'Calculus, Algebra, Coordinate Geometry', placeholder: true },
    ],
    pricing: [
      { name: 'Foundation', price: 39999, originalPrice: 79999, features: ['Planned: recorded lessons', 'Planned: chapter tests', 'Planned: practice sets', 'Nothing published yet'] },
      { name: 'Full Prep', price: 59999, originalPrice: 119999, highlight: true, features: ['Planned: everything in Foundation', 'Planned: full mock test series', 'Planned: performance analytics', 'Nothing published yet'] },
    ],
  },
  {
    slug: 'cat-prep',
    name: 'CAT Preparation',
    duration: '9 months',
    modules: 3,
    projects: 0,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'CAT preparation',
    desc: 'A planned CAT programme covering VARC, DILR and QA. The syllabus below is an outline — no material has been published yet.',
    upcomingBatch: 'To be announced',
    programType: 'EXAM_PREP',
    level: 'Advanced',
    enrollmentStatus: 'coming_soon',
    careerSupport: false,
    examPattern: 'CAT: 2 hours, 3 sections. VARC (40 min), DILR (40 min), QA (40 min). MCQs and TITA (type-in-the-answer) questions. Negative marking on MCQs.',
    examSections: ['VARC', 'DILR', 'QA'],
    whoIsItFor: [
      'Working professionals targeting MBA from IIMs and top B-schools',
      'Final year graduates planning full-time CAT preparation',
      'Repeaters wanting a structured, analytics-driven approach',
    ],
    whatYouWillLearn: [
      'VARC: Reading Comprehension strategies, Verbal Ability, Para Jumbles, Odd Sentence',
      'DILR: Data Interpretation (tables, charts, caselets) and Logical Reasoning sets',
      'QA: Arithmetic, Algebra, Geometry, Number System, and Modern Math',
      'Sectional time management and question selection strategies',
      'Planned: mock analysis once a test engine exists',
    ],
    curriculumDetail: [
      {
        number: 'S1', title: 'VARC — Verbal Ability & Reading Comprehension', description: 'RC passage analysis, vocabulary in context, Para Jumbles, Para Summary, and Odd Sentence. Speed reading and inference techniques for 99th percentile accuracy.', duration: '9 months (parallel)',
        topics: ['Reading Comprehension', 'Para Jumbles', 'Para Summary', 'Verbal Ability', 'Critical Reasoning'],
      },
      {
        number: 'S2', title: 'DILR — Data Interpretation & Logical Reasoning', description: 'Tables, bar charts, line graphs, pie charts, caselets — and Logical Reasoning set types including arrangements, networks, and scheduling.', duration: '9 months (parallel)',
        topics: ['DI: Tables & Charts', 'DI: Caselets', 'LR: Arrangements', 'LR: Networks', 'LR: Scheduling & Routes'],
      },
      {
        number: 'S3', title: 'QA — Quantitative Ability', description: 'Arithmetic, Algebra, Geometry & Mensuration, Number System, Modern Math (PnC, Probability, Set Theory). Emphasis on speed, shortcuts, and identifying solvable vs. time-sink questions.', duration: '9 months (parallel)',
        topics: ['Arithmetic', 'Algebra', 'Geometry & Mensuration', 'Number System', 'PnC & Probability'],
      },
    ],
    learningExperience: [
      'Planned: recorded concept lessons for each subject',
      'Planned: practice sets and chapter tests inside the platform',
      'Planned: full-length mock papers in the exam format',
      'None of this material is in the platform yet — the programme has not launched',
    ],
    faqs: [
      { q: 'Is this for working professionals?', a: 'It is intended to be, but the programme has not launched and no material is available yet.' },
      { q: 'How many mock tests are included?', a: 'The mock test series has not been built yet, so we cannot commit to a number.' },
      { q: 'Is GD-PI preparation included?', a: 'It is planned for a later stage. No GD-PI material exists in the platform today.' },
    ],
    faculty: [
      { name: 'VARC Faculty · CAT', role: 'VARC', expertise: 'Reading Comprehension & Verbal Ability', placeholder: true },
      { name: 'DILR Faculty · CAT', role: 'DILR', expertise: 'Data Interpretation & Logical Reasoning', placeholder: true },
      { name: 'QA Faculty · CAT', role: 'Quantitative Ability', expertise: 'Arithmetic, Algebra, Geometry', placeholder: true },
    ],
    pricing: [
      { name: 'Foundation', price: 24999, originalPrice: 49999, features: ['Planned: recorded lessons', 'Planned: sectional tests', 'Planned: practice sets', 'Nothing published yet'] },
      { name: 'Full Prep', price: 39999, originalPrice: 79999, highlight: true, features: ['Planned: everything in Foundation', 'Planned: full mock CATs', 'Planned: detailed analytics', 'Nothing published yet'] },
    ],
  },

  // ─── CERTIFICATE PROGRAMS ──────────────────────────────────────────────────
  {
    slug: 'sql-certificate',
    name: 'SQL for Business Analytics',
    duration: '6 weeks',
    modules: 5,
    projects: 2,
    format: 'Self-paced',
    cert: 'Skylent completion certificate',
    outcome: 'SQL-fluent Analyst',
    desc: 'A focused, practical SQL course for business analysts and professionals — from foundational queries to advanced window functions and business reporting.',
    upcomingBatch: 'Not yet teaching',
    programType: 'CERTIFICATE',
    level: 'Beginner to Intermediate',
    enrollmentStatus: 'open',
    careerSupport: false,
    whoIsItFor: [
      'Business analysts wanting to query data without relying on engineers',
      'Finance and operations professionals working with structured datasets',
      'Product analysts who need SQL for funnel and cohort analysis',
      'Anyone who wants to go from spreadsheets to database queries',
    ],
    whatYouWillLearn: [
      'SELECT, WHERE, GROUP BY, and aggregate functions',
      'JOIN types: INNER, LEFT, RIGHT, FULL — when and how to use each',
      'Subqueries, CTEs, and query organisation for readability',
      'Window functions: RANK, ROW_NUMBER, LAG, LEAD',
      'Business reporting patterns: cohorts, funnels, rolling averages',
    ],
    curriculumDetail: [
      { number: '01', title: 'SQL Foundations', description: 'Database structure, SELECT statements, filtering with WHERE, and sorting results.', duration: '1 week', topics: ['SELECT & FROM', 'WHERE & AND/OR', 'ORDER BY & LIMIT', 'NULL handling'] },
      { number: '02', title: 'Aggregation & Grouping', description: 'COUNT, SUM, AVG, MIN, MAX — and using GROUP BY and HAVING for summary analysis.', duration: '1 week', topics: ['Aggregate functions', 'GROUP BY', 'HAVING', 'DISTINCT'] },
      { number: '03', title: 'Joins', description: 'Connecting tables with INNER, LEFT, RIGHT, and FULL JOINs — and understanding when to use each.', duration: '1.5 weeks', topics: ['INNER JOIN', 'LEFT JOIN', 'Multiple joins', 'Self-join patterns'] },
      { number: '04', title: 'Subqueries & CTEs', description: 'Nested queries, correlated subqueries, and Common Table Expressions for readable, modular SQL.', duration: '1 week', topics: ['Subqueries in WHERE/FROM', 'Correlated subqueries', 'WITH clause CTEs', 'Recursive CTEs'] },
      { number: '05', title: 'Window Functions & Reporting', description: 'ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, and PARTITION BY — the building blocks for business analytics reporting.', duration: '1.5 weeks', topics: ['ROW_NUMBER & RANK', 'LAG & LEAD', 'Running totals', 'Cohort & funnel queries'] },
    ],
    projectsDetail: [
      { title: 'E-Commerce Analytics Report', what: 'Write SQL queries to analyse a retail dataset: revenue trends, top products, customer cohorts, and churn indicators', skills: ['Joins', 'Window Functions', 'CTEs', 'Aggregation'], difficulty: 'Intermediate' },
      { title: 'HR Analytics Dashboard', what: 'Query an HR database to produce headcount, attrition, tenure, and department-level salary reports', skills: ['GROUP BY', 'Subqueries', 'Date functions', 'Aggregation'], difficulty: 'Beginner' },
    ],
    faqs: [
      { q: 'Which SQL dialect does this cover?', a: 'Core SQL is covered, with examples in PostgreSQL. The concepts apply directly to MySQL, SQLite, BigQuery, and Snowflake.' },
      { q: 'How long will I have access?', a: 'Lifetime access to all content and updates.' },
      { q: 'Is there a certificate?', a: 'Yes. A Skylent Certificate of Completion is issued on passing the final assessment.' },
    ],
    pricing: [
      { name: 'Full Access', price: 4999, originalPrice: 9999, highlight: true, features: ['5 planned modules', '2 project briefs', 'SQL practice sets when published', 'Skylent completion certificate'] },
    ],
  },
]

// ─── WORKSHOPS ────────────────────────────────────────────────────────────────
export type Workshop = {
  slug: string
  title: string
  category: string
  duration: string
  date: string
  mode: string
  instructor: string
  seats: number
  seatsLeft: number
  price: number
  originalPrice: number
  desc: string
  whatYouGet: string[]
}

/**
 * Planned short sessions — not a live calendar. `date`, `instructor`, `seats`
 * and `originalPrice` are retained on the type so older surfaces compile, but
 * they are not facts: no session is scheduled, no faculty is assigned, and
 * seat counts are not published. Pages must not render those fields as live.
 */
export const workshops: Workshop[] = [
  {
    slug: 'ai-for-business',
    title: 'AI for Business Leaders',
    category: 'AI',
    duration: '1 day',
    date: '',
    mode: 'Online',
    instructor: '',
    seats: 0,
    seatsLeft: 0,
    price: 999,
    originalPrice: 999,
    desc: 'How to evaluate and adopt AI in an organisation without a technical background.',
    whatYouGet: ['AI strategy frameworks', 'Use-case identification', 'ROI evaluation models', 'Reading list'],
  },
  {
    slug: 'prompt-engineering',
    title: 'Prompt Engineering Masterclass',
    category: 'AI',
    duration: '1 day',
    date: '',
    mode: 'Online',
    instructor: '',
    seats: 0,
    seatsLeft: 0,
    price: 1499,
    originalPrice: 1499,
    desc: 'Zero-shot, chain-of-thought and multi-step prompting, written so you can apply it to any current LLM.',
    whatYouGet: ['Prompt patterns', 'Worked examples', 'A framework you can reuse', 'Notes to keep'],
  },
  {
    slug: 'resume-masterclass',
    title: 'Resume & LinkedIn Masterclass',
    category: 'Career',
    duration: '3 hours',
    date: '',
    mode: 'Online',
    instructor: '',
    seats: 0,
    seatsLeft: 0,
    price: 499,
    originalPrice: 499,
    desc: 'How to structure a resume and LinkedIn profile around work you have actually done.',
    whatYouGet: ['Resume structure', 'ATS checklist', 'LinkedIn profile outline', 'Notes to keep'],
  },
  {
    slug: 'interview-masterclass',
    title: 'Data Interview Masterclass',
    category: 'Career',
    duration: '1 day',
    date: '',
    mode: 'Online',
    instructor: '',
    seats: 0,
    seatsLeft: 0,
    price: 1999,
    originalPrice: 1999,
    desc: 'SQL, Python, statistics and case interviews — the kinds of questions data roles actually ask.',
    whatYouGet: ['Question patterns', 'SQL and Python drills', 'Case-study walkthrough', 'Notes to keep'],
  },
  {
    slug: 'power-bi-workshop',
    title: 'Power BI Intensive',
    category: 'Data',
    duration: '2 days',
    date: '',
    mode: 'Online',
    instructor: '',
    seats: 0,
    seatsLeft: 0,
    price: 2499,
    originalPrice: 2499,
    desc: 'From data import to a published report: the Power BI workflow in a short, focused session.',
    whatYouGet: ['Import and model a dataset', 'DAX patterns', 'Dashboard layout', 'Publish and share'],
  },
]

// ─── BLOG POSTS ────────────────────────────────────────────────────────────────
export type BlogPost = {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  body: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'llms-and-education',
    title: 'How LLMs are changing the way students learn — and what education platforms need to do about it',
    category: 'Technology',
    date: '7 August 2026',
    readTime: '6 min read',
    excerpt: 'Large language models are not a replacement for teaching. But they are changing the relationship between a student, a concept, and the moment of understanding.',
    body: `Large language models are not a replacement for teaching. But they are fundamentally changing the relationship between a student, a concept, and the moment of understanding.

For decades, the bottleneck in education has been access — access to a patient teacher, access to instant feedback, access to a clear explanation of exactly the concept you don't understand yet.

LLMs remove that bottleneck. A student stuck on a statistics problem at 11pm can now get a clear explanation in seconds. A learner who needs the same concept explained five different ways can receive all five immediately.

What this means for education platforms is not that content becomes worthless. It means that content without context is worthless.

The platforms that will survive this shift are the ones that understand their job is no longer to deliver information. Their job is to design the conditions under which understanding happens.

That means structured progression, not random access. It means projects that require synthesis, not recall. It means mentorship that corrects for what an LLM cannot see — the student's real-world context, their career goals, their blind spots.

Skylent was built around this principle before LLMs made it obvious. The question we have always asked is not "how do we teach more content?" but "how do we reliably produce a skilled, employable person from where this student is today?"

LLMs are a powerful tool inside that system. They are not the system itself.`,
  },
  {
    slug: 'data-skills-2026',
    title: 'The data skills that actually get people hired in 2026',
    category: 'Career',
    date: '2 August 2026',
    readTime: '5 min read',
    excerpt: 'A sample editorial on what data hiring teams look for in portfolios, SQL skills, and dashboard work.',
    body: `This is an illustrative editorial — not a published research study.

We outline what hiring teams commonly look for when reviewing data analyst and data scientist applications: SQL fluency, dashboard storytelling, and evidence of working with messy business datasets.

The results were different from what most course providers would have you believe.

**SQL remains the single most demanded skill.** Nearly 91% of data analyst job listings required SQL proficiency. Not familiarity. Proficiency. Hiring managers told us that the most common reason candidates fail early-stage screening is an inability to write a multi-table join without help.

**Excel is underrated.** 78% of listings still required Excel. At companies that primarily use Power BI or Tableau, hiring managers told us they still expect candidates to be fluent in Excel because much of real business analysis happens in spreadsheets before it ever reaches a dashboard.

**Python is expected, but not always at depth.** Most data analyst roles wanted Python for data manipulation — pandas, cleaning, basic visualisation. Very few analyst roles at the entry level required machine learning. The expectation was competent, not expert.

**Communication is the actual differentiator.** Every single hiring manager we spoke to said the same thing in different words: "We can teach tools. We cannot easily teach someone to explain what their analysis means to a business leader who doesn't care about the methodology."

The implication for how we build Skylent programs is straightforward. We teach SQL, Excel, Python, and Power BI as foundations. We add projects that require synthesis and decision-making, not just execution. And every program includes a communication and presentation component.

Because the goal is not to produce someone who can use tools. The goal is to produce someone who can create value from data.`,
  },
  {
    slug: 'building-a-portfolio',
    title: 'Why most data portfolios fail — and what a good one actually looks like',
    category: 'Career',
    date: '28 July 2026',
    readTime: '7 min read',
    excerpt: 'A portfolio of Titanic survival predictions is not a data portfolio. Here is what hiring managers actually want to see.',
    body: `A portfolio of Titanic survival predictions is not a data portfolio.

Neither is a collection of tutorial notebooks where you followed someone else's code step by step and produced the same output as 40,000 other people who did the same tutorial.

A data portfolio, in the sense that it actually gets people hired, has three properties.

**First: it answers a real question that someone actually cared about.**

The best portfolios we have seen from Skylent students start with a question before they start with a dataset. "Why do customers churn in the first 30 days?" is a question. "I cleaned a dataset and made some visualisations" is not.

**Second: it shows the thinking, not just the output.**

A good portfolio project includes a brief explanation of why you chose the approach you chose. What did you consider and reject? What did you discover that surprised you? A recruiter looking at your portfolio wants to see evidence that there is a person thinking behind the code — not just a person who can copy and run cells.

**Third: it is a coherent body of work, not a list of completed courses.**

Three well-documented, genuinely interesting projects that demonstrate range — data collection, analysis, visualisation, communication of insight — are worth more than fifteen notebooks that prove you have completed fifteen courses.

In every Skylent program, we build the portfolio alongside the learning. By the time a student finishes, they have projects that demonstrate real decision-making, not just technical execution.

That is the difference between a portfolio that gets you an interview and a repository that proves you have internet access.`,
  },
  {
    slug: 'institutions-and-lms',
    title: 'What institutions get wrong about LMS adoption',
    category: 'Education',
    date: '20 July 2026',
    readTime: '5 min read',
    excerpt: 'The technology is almost never the problem. Here is what actually prevents institutions from delivering modern learning outcomes.',
    body: `The question we hear most often from university administrators is: "Which LMS platform should we choose?"

It is almost never the right question.

The technology is almost never the barrier to modern learning outcomes. The barriers are curriculum design, faculty enablement, and a clear definition of what a "good outcome" looks like for every student who goes through a program.

A university can deploy the most sophisticated learning management system available. If the curriculum is designed around what is easy to teach rather than what prepares students for the workforce, the LMS will deliver exactly what it always has — a slightly more digital version of the same experience.

What Skylent brings to institutional partnerships is not primarily software. It is an outcome-first design process. We begin every institutional engagement with the question: "What should a student be able to do, and be hired to do, after completing this program?" Then we design backward from that answer.

The LMS is the delivery infrastructure for a program that has already been designed to work. It is not the solution to the design problem.

Institutions that understand this — and there are more of them than the technology vendors want you to believe — are the ones that produce consistently employable graduates.

That is the partnership Skylent is built for.`,
  },
  {
    slug: 'career-os-approach',
    title: "Why career placement isn't a service — it's a system",
    category: 'Industry',
    date: '14 July 2026',
    readTime: '4 min read',
    excerpt: "Most edtech platforms treat career support as a feature added at the end of a course. We built it into the beginning.",
    body: `Most education platforms treat career support as a feature. Something you add at the end of a learning experience — a few job listings, a resume template, a WhatsApp group.

The problem is that career outcomes are not produced by career services. They are produced by the quality of the learning, the depth of the projects, the strength of the portfolio, and the readiness of the student to actually do the job on day one.

Career services at the end of a course is like adding a quality check at the end of a manufacturing line. By the time you get there, the product is already determined.

Skylent's Career OS sits alongside learning rather than after it. A learner can keep a profile, track applications, and work through structured interview practice while they are still on a programme — provided that programme actually opens Career OS.

What the workspace does not do is review your resume for you, optimise your LinkedIn, or run a set number of mock interviews. Those services are not in the product. The job search still belongs to the learner.

That is the difference between a career service and a career system.`,
  },
]

// ─── JOBS (used across career OS) ─────────────────────────────────────────────
export type Job = {
  id: string
  role: string
  company: string
  salary: string
  location: string
  mode: string
  skills: string[]
  exp: string
  desc: string
  postedDays: number
}

/**
 * Empty by design. The public Career OS page reads from this list, and the only
 * roles that belong in it are ones a verified employer has actually posted.
 * Invented companies and salary bands would make an empty board look like a
 * working one, which is the thing this list must never do.
 */
export const jobs: Job[] = []

// ─── LEARNER STORIES ──────────────────────────────────────────────────────────
/**
 * Empty by design. A learner story may only be added here once the person, the
 * programme they took and the outcome they describe have all been verified.
 * Names, salaries and placement claims that cannot be verified are not sample
 * content — they are false advertising, so there is nothing to fall back on.
 */
export type LearnerStory = {
  name: string
  initials: string
  before: string
  provided: string
  outcome: string
  salary: string
  duration: string
  program: string
}

export const stories: LearnerStory[] = []

// ─── DEMO USERS (for role dashboard switcher) ─────────────────────────────────
export const demoUsers = [
  { role: 'student' as const, name: 'Arjun Sharma', email: 'arjun@demo.skylent.in', avatar: 'AS', program: 'Data Science & AI', progress: 72 },
  { role: 'faculty' as const, name: 'Dr. Priya Nair', email: 'priya@demo.skylent.in', avatar: 'PN', course: 'Data Science & AI', students: 128 },
  { role: 'organisation' as const, name: 'Apex College', email: 'admin@apex.edu.in', avatar: 'AC', students: 1240, programs: 4 },
  { role: 'superadmin' as const, name: 'Skylent Admin', email: 'admin@skylent.in', avatar: 'SA', totalUsers: 12450, totalOrgs: 48 },
]

// ─── LABS ─────────────────────────────────────────────────────────────────────

export type LabExperimentStatus = 'not_started' | 'in_progress' | 'submitted' | 'completed'
export type LabType = 'coding' | 'data' | 'business' | 'simulation'

export type LabExperiment = {
  id: string
  number: number
  title: string
  objective: string
  type: LabType
  duration: string
  instructions: string[]
  tasks: string[]
  expectedOutcome: string
}

export type LabSubject = {
  id: string
  program: string
  semester: string
  subject: string
  title: string
  desc: string
  labType: LabType
  experiments: LabExperiment[]
}

export const labSubjects: LabSubject[] = [
  // ── Data Centric AI ────────────────────────────────────────────────────────
  {
    id: 'data-centric-ai-python',
    program: 'Data Centric AI',
    semester: 'Semester 1',
    subject: 'Python for Data Science',
    title: 'Python for Data Science Lab',
    desc: 'Hands-on Python programming with NumPy, pandas, and matplotlib for real-world data science workflows.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-py-1', number: 1,
        title: 'Data Exploration with Pandas',
        objective: 'Analyse a real dataset, handle missing values, and compute descriptive statistics.',
        type: 'data', duration: '60 min',
        instructions: [
          'Import the pandas library and load the provided CSV dataset into a DataFrame.',
          'Inspect the DataFrame using head(), info(), and describe() methods.',
          'Identify columns with null values using isnull().sum().',
          'Fill or drop missing values using appropriate strategies (mean imputation for numeric, mode for categorical).',
          'Compute mean, median, and mode for each numeric column.',
          'Export the cleaned dataset to a new CSV file.',
        ],
        tasks: ['Load dataset and display first 10 rows', 'Identify and handle all null values', 'Compute summary statistics for numeric columns', 'Visualise distribution of at least two columns'],
        expectedOutcome: 'Clean dataset with a summary statistics report and two distribution plots.',
      },
      {
        id: 'exp-py-2', number: 2,
        title: 'NumPy Array Operations',
        objective: 'Perform vectorised operations using NumPy arrays and understand broadcasting rules.',
        type: 'coding', duration: '45 min',
        instructions: [
          'Create 1D and 2D NumPy arrays from Python lists.',
          'Perform element-wise arithmetic operations and compare with Python loops.',
          'Use broadcasting to add a 1D array to each row of a 2D array.',
          'Apply NumPy universal functions (ufuncs) such as np.sqrt, np.log, and np.exp.',
          'Slice and index arrays using basic and advanced indexing.',
        ],
        tasks: ['Create arrays and demonstrate shape operations', 'Apply broadcasting to a practical example', 'Benchmark NumPy vs pure Python loop for 1M element sum', 'Use fancy indexing to filter rows by condition'],
        expectedOutcome: 'Script demonstrating NumPy operations with benchmark results showing speedup over pure Python.',
      },
      {
        id: 'exp-py-3', number: 3,
        title: 'Data Visualisation with Matplotlib and Seaborn',
        objective: 'Create informative visualisations to communicate data insights effectively.',
        type: 'data', duration: '60 min',
        instructions: [
          'Load the iris dataset using seaborn or sklearn.',
          'Create a histogram for each numeric feature.',
          'Plot a scatter matrix to observe pairwise relationships.',
          'Generate a heatmap of the correlation matrix using seaborn.',
          'Create a box plot to identify outliers in each feature.',
          'Save all plots as PNG files with descriptive filenames.',
        ],
        tasks: ['Generate histogram for each numeric column', 'Create a correlation heatmap', 'Plot box plots to show outliers', 'Add titles and axis labels to every chart'],
        expectedOutcome: 'A set of publication-ready visualisation files with a short written interpretation of each chart.',
      },
      {
        id: 'exp-py-4', number: 4,
        title: 'Web Scraping with BeautifulSoup',
        objective: 'Collect structured data from a public webpage and store it in a pandas DataFrame.',
        type: 'coding', duration: '75 min',
        instructions: [
          'Import requests and BeautifulSoup libraries.',
          'Fetch the HTML content of a target public webpage using requests.get().',
          'Parse the HTML with BeautifulSoup and locate target elements using CSS selectors.',
          'Extract text data from table rows or list items into Python lists.',
          'Construct a pandas DataFrame from the extracted lists.',
          'Export the DataFrame to a CSV file and verify the output.',
        ],
        tasks: ['Fetch and parse HTML from a public URL', 'Extract at least 3 data fields per record', 'Store scraped data in a DataFrame with correct column names', 'Handle HTTP errors gracefully with try/except'],
        expectedOutcome: 'A CSV file containing scraped data from at least 50 records with proper column headers.',
      },
      {
        id: 'exp-py-5', number: 5,
        title: 'Exploratory Data Analysis — End-to-End',
        objective: 'Conduct a full EDA pipeline from raw data ingestion to insight communication.',
        type: 'data', duration: '90 min',
        instructions: [
          'Choose one of the provided datasets (sales, healthcare, or social media).',
          'Document the business context and key questions you aim to answer.',
          'Perform data cleaning: handle nulls, remove duplicates, fix data types.',
          'Generate at least five visualisations covering distribution, correlation, and trend.',
          'Write a 200-word summary of three actionable insights derived from the EDA.',
          'Present findings in a structured Jupyter notebook with markdown sections.',
        ],
        tasks: ['Define 3 business questions before starting analysis', 'Clean data and document all transformations', 'Produce 5 distinct chart types', 'Write an executive summary with 3 insights'],
        expectedOutcome: 'A Jupyter notebook with documented EDA pipeline and an executive summary section.',
      },
    ],
  },
  {
    id: 'data-centric-ai-preprocessing',
    program: 'Data Centric AI',
    semester: 'Semester 1',
    subject: 'Data Preprocessing & Feature Engineering',
    title: 'Data Preprocessing & Feature Engineering Lab',
    desc: 'Learn to transform raw data into ML-ready datasets through encoding, scaling, and feature construction.',
    labType: 'data',
    experiments: [
      {
        id: 'exp-pp-1', number: 1,
        title: 'Handling Missing Data Strategies',
        objective: 'Compare different imputation strategies and their effect on model performance.',
        type: 'data', duration: '60 min',
        instructions: [
          'Load the provided dataset with intentional missing values.',
          'Split the dataset into training and test sets before imputation.',
          'Apply mean, median, and KNN imputation strategies on the training set.',
          'Transform the test set using the fitted imputers.',
          'Train a simple decision tree on each imputed version.',
          'Compare accuracy scores and document which strategy performs best.',
        ],
        tasks: ['Implement three different imputation strategies', 'Evaluate each strategy on a held-out test set', 'Visualise the distribution before and after imputation', 'Document the recommended strategy with justification'],
        expectedOutcome: 'A comparison table showing accuracy scores for each imputation method with a recommendation.',
      },
      {
        id: 'exp-pp-2', number: 2,
        title: 'Categorical Encoding Techniques',
        objective: 'Apply one-hot, label, and target encoding and understand when each is appropriate.',
        type: 'coding', duration: '50 min',
        instructions: [
          'Load a dataset with nominal and ordinal categorical variables.',
          'Apply one-hot encoding to nominal columns using pandas get_dummies.',
          'Apply ordinal encoding to ordered categories using sklearn OrdinalEncoder.',
          'Implement target encoding manually and compare with category_encoders library.',
          'Check for the dummy variable trap and drop one column where needed.',
          'Verify encoded DataFrames have expected shape and column names.',
        ],
        tasks: ['Encode at least 3 categorical columns using appropriate methods', 'Avoid the dummy variable trap in one-hot encoding', 'Apply target encoding on a high-cardinality column', 'Verify final feature matrix shape before modelling'],
        expectedOutcome: 'Encoded feature matrix ready for ML with a rationale document for each encoding choice.',
      },
      {
        id: 'exp-pp-3', number: 3,
        title: 'Feature Scaling and Normalisation',
        objective: 'Apply standard scaling, min-max scaling, and robust scaling and observe their impact on algorithms.',
        type: 'coding', duration: '55 min',
        instructions: [
          'Load a dataset with features of varying scales.',
          'Apply StandardScaler, MinMaxScaler, and RobustScaler from sklearn.',
          'Train a KNN and SVM model on raw and each scaled version.',
          'Plot the distribution of features before and after each scaling method.',
          'Record accuracy and training time for each combination.',
        ],
        tasks: ['Scale features using all three methods', 'Compare model accuracy on raw vs scaled data', 'Plot before-and-after distributions for two features', 'Identify which scaler performs best for the given dataset'],
        expectedOutcome: 'Comparative report showing model metrics across scaling strategies with visualisations.',
      },
      {
        id: 'exp-pp-4', number: 4,
        title: 'Feature Selection with Filter Methods',
        objective: 'Identify the most informative features using statistical tests and correlation analysis.',
        type: 'data', duration: '65 min',
        instructions: [
          'Load the provided high-dimensional dataset.',
          'Compute the correlation matrix and remove features with correlation > 0.9.',
          'Apply chi-squared test for categorical feature selection.',
          'Use ANOVA F-test for continuous features vs target.',
          'Select the top-K features and retrain the model.',
          'Compare performance before and after feature selection.',
        ],
        tasks: ['Remove highly correlated features using correlation matrix', 'Apply chi-squared test and select top 10 features', 'Apply ANOVA F-test for continuous predictors', 'Compare model accuracy before and after selection'],
        expectedOutcome: 'Reduced feature set with documented selection rationale and performance comparison.',
      },
      {
        id: 'exp-pp-5', number: 5,
        title: 'Pipeline Construction with sklearn',
        objective: 'Build a reusable end-to-end ML preprocessing pipeline using sklearn Pipeline.',
        type: 'coding', duration: '70 min',
        instructions: [
          'Define separate transformer steps for imputation, encoding, and scaling.',
          'Use ColumnTransformer to apply different steps to numeric vs categorical columns.',
          'Wrap the ColumnTransformer and a classifier in a Pipeline object.',
          'Fit the pipeline on training data and evaluate on test data.',
          'Use cross-validation inside the pipeline to avoid data leakage.',
          'Pickle the trained pipeline for later inference.',
        ],
        tasks: ['Build a ColumnTransformer for mixed-type data', 'Create a full Pipeline with preprocessing and classifier', 'Run 5-fold cross-validation through the pipeline', 'Save and reload the pipeline using joblib'],
        expectedOutcome: 'A saved pipeline file that can preprocess new data and produce predictions without re-fitting.',
      },
    ],
  },
  {
    id: 'data-centric-ai-ml',
    program: 'Data Centric AI',
    semester: 'Semester 2',
    subject: 'Machine Learning Fundamentals',
    title: 'Machine Learning Fundamentals Lab',
    desc: 'Implement supervised and unsupervised learning algorithms from scratch and with sklearn.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-ml-1', number: 1,
        title: 'Linear Regression Implementation',
        objective: 'Implement linear regression using gradient descent and verify against sklearn.',
        type: 'coding', duration: '75 min',
        instructions: [
          'Generate a synthetic dataset using sklearn make_regression.',
          'Implement gradient descent from scratch using NumPy.',
          'Track the cost function over iterations and plot convergence.',
          'Tune the learning rate and observe its effect on convergence.',
          'Compare your implementation output with sklearn LinearRegression.',
          'Report MSE and R² for both implementations.',
        ],
        tasks: ['Implement gradient descent manually', 'Plot cost vs iterations for 3 learning rates', 'Compare manual vs sklearn predictions', 'Report MSE and R² metrics on test set'],
        expectedOutcome: 'Matching MSE and R² scores between manual implementation and sklearn, with convergence plots.',
      },
      {
        id: 'exp-ml-2', number: 2,
        title: 'Classification with Logistic Regression and SVM',
        objective: 'Train and evaluate binary classifiers and understand the decision boundary.',
        type: 'coding', duration: '65 min',
        instructions: [
          'Load the breast cancer dataset from sklearn.',
          'Train a Logistic Regression and an SVM (RBF kernel) classifier.',
          'Evaluate both using accuracy, precision, recall, and F1.',
          'Plot confusion matrices for both models.',
          'Visualise the decision boundary using a 2D PCA projection.',
          'Tune the SVM C parameter using GridSearchCV.',
        ],
        tasks: ['Train both classifiers on the full feature set', 'Generate and compare confusion matrices', 'Plot ROC curves and compute AUC for both models', 'Find best SVM C value via GridSearchCV'],
        expectedOutcome: 'Comparative evaluation report with confusion matrices, ROC curves, and best hyperparameters.',
      },
      {
        id: 'exp-ml-3', number: 3,
        title: 'Decision Trees and Random Forest',
        objective: 'Understand how tree-based models split data and reduce overfitting through ensembles.',
        type: 'coding', duration: '70 min',
        instructions: [
          'Load the adult income dataset and preprocess it.',
          'Train a Decision Tree and visualise the tree using graphviz or plot_tree.',
          'Observe overfitting by comparing train vs test accuracy at different depths.',
          'Train a Random Forest and compare its accuracy to the single tree.',
          'Plot feature importances from the Random Forest.',
          'Use cross-validation to report stable performance estimates.',
        ],
        tasks: ['Visualise decision tree up to depth 4', 'Plot accuracy vs max_depth curve for train and test sets', 'Train Random Forest with 100 trees and report accuracy', 'Plot top 10 feature importances as a bar chart'],
        expectedOutcome: 'Side-by-side comparison of Decision Tree vs Random Forest with feature importance chart.',
      },
      {
        id: 'exp-ml-4', number: 4,
        title: 'K-Means Clustering',
        objective: 'Apply unsupervised clustering to segment a customer dataset and interpret the clusters.',
        type: 'data', duration: '60 min',
        instructions: [
          'Load the mall customer dataset with annual income and spending score.',
          'Scale the features using StandardScaler.',
          'Run K-Means for k = 2 to 10 and plot the elbow curve.',
          'Select the optimal k and fit the final model.',
          'Visualise clusters in 2D scatter plot with centroids marked.',
          'Write a business interpretation for each cluster.',
        ],
        tasks: ['Plot elbow curve to determine optimal k', 'Fit final K-Means model with chosen k', 'Visualise clusters with centroids in scatter plot', 'Write 2-sentence business interpretation for each cluster'],
        expectedOutcome: 'Cluster visualisation with a business interpretation document describing each customer segment.',
      },
      {
        id: 'exp-ml-5', number: 5,
        title: 'Model Evaluation and Cross-Validation',
        objective: 'Apply robust evaluation practices to avoid data leakage and overfitting.',
        type: 'coding', duration: '55 min',
        instructions: [
          'Select any classification dataset used in previous experiments.',
          'Implement a stratified K-Fold cross-validation loop manually.',
          'Use StratifiedKFold from sklearn and verify your manual results match.',
          'Compute mean and standard deviation of accuracy, precision, recall across folds.',
          'Apply learning curve analysis to diagnose bias vs variance.',
          'Produce a final model evaluation report.',
        ],
        tasks: ['Implement 5-fold CV manually and compare with sklearn', 'Compute mean ± std for accuracy across folds', 'Plot learning curve for bias-variance diagnosis', 'Write a 150-word model evaluation report'],
        expectedOutcome: 'Cross-validation results table and learning curve plot with written evaluation report.',
      },
    ],
  },
  // ── BCA Full Stack Development ─────────────────────────────────────────────
  {
    id: 'bca-fullstack-web-tech',
    program: 'BCA Full Stack Development',
    semester: 'Semester 3',
    subject: 'Web Technologies',
    title: 'Web Technologies Lab',
    desc: 'Build structured web pages using HTML5, CSS3, and JavaScript with focus on accessibility and responsiveness.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-wt-1', number: 1,
        title: 'Responsive Portfolio Page',
        objective: 'Build a responsive personal portfolio page using HTML5 and CSS3 Flexbox.',
        type: 'coding', duration: '90 min',
        instructions: [
          'Create the HTML structure with semantic tags: header, nav, main, section, footer.',
          'Add navigation links that scroll smoothly to each section.',
          'Style the layout using CSS Flexbox for the project card grid.',
          'Add a media query breakpoint at 768px to switch to a single-column layout.',
          'Include a contact form with name, email, and message fields.',
          'Validate the HTML using the W3C Markup Validation Service.',
        ],
        tasks: ['Build semantic HTML structure with 5 sections', 'Implement Flexbox-based card grid', 'Add responsive breakpoint at 768px', 'Validate HTML with no critical errors'],
        expectedOutcome: 'A responsive portfolio page that displays correctly on both desktop and mobile viewports.',
      },
      {
        id: 'exp-wt-2', number: 2,
        title: 'JavaScript DOM Manipulation',
        objective: 'Dynamically update page content using vanilla JavaScript DOM APIs.',
        type: 'coding', duration: '75 min',
        instructions: [
          'Create an HTML page with a list of items and an input field.',
          'Write JavaScript to add new items to the list on button click.',
          'Implement delete functionality for each list item.',
          'Add a filter input that hides list items not matching the search term.',
          'Persist the list to localStorage and restore it on page reload.',
          'Add a "Clear All" button that removes all items after a confirmation dialog.',
        ],
        tasks: ['Implement add, delete, and filter operations', 'Persist data to localStorage', 'Restore state on page load from localStorage', 'Add form validation for empty input'],
        expectedOutcome: 'A functional to-do list application with localStorage persistence and search filtering.',
      },
      {
        id: 'exp-wt-3', number: 3,
        title: 'Fetch API and Async JavaScript',
        objective: 'Consume a public REST API and render data dynamically in the DOM.',
        type: 'coding', duration: '80 min',
        instructions: [
          'Identify a suitable public API (e.g., JSONPlaceholder or Open-Meteo).',
          'Use the Fetch API to retrieve data asynchronously.',
          'Handle loading, success, and error states in the UI.',
          'Parse the JSON response and dynamically generate HTML cards.',
          'Add pagination or "Load More" button for multiple pages of data.',
          'Implement a search/filter on the fetched dataset.',
        ],
        tasks: ['Fetch data from a public API with async/await', 'Display loading spinner during fetch', 'Handle and display error messages', 'Render at least 10 data cards dynamically'],
        expectedOutcome: 'A data-driven webpage that fetches, renders, and filters external API data with error handling.',
      },
      {
        id: 'exp-wt-4', number: 4,
        title: 'CSS Animations and Transitions',
        objective: 'Enhance user interface with CSS keyframe animations and smooth transitions.',
        type: 'coding', duration: '60 min',
        instructions: [
          'Create a landing page hero section with an animated headline.',
          'Add a keyframe animation for a pulsing call-to-action button.',
          'Implement a smooth CSS transition on navigation hover states.',
          'Create a loading spinner using CSS animation.',
          'Add a scroll-triggered fade-in effect using IntersectionObserver.',
          'Ensure all animations respect the prefers-reduced-motion media query.',
        ],
        tasks: ['Create 2 keyframe animations for UI elements', 'Add hover transitions to at least 5 interactive elements', 'Implement a CSS loading spinner', 'Respect prefers-reduced-motion accessibility preference'],
        expectedOutcome: 'An animated landing page with accessible motion that passes the prefers-reduced-motion check.',
      },
      {
        id: 'exp-wt-5', number: 5,
        title: 'HTML Forms and Validation',
        objective: 'Build an accessible, validated HTML form with client-side and custom validation.',
        type: 'coding', duration: '70 min',
        instructions: [
          'Design a multi-field registration form with name, email, phone, password, and confirmpassword.',
          'Apply HTML5 built-in validation attributes (required, pattern, minlength).',
          'Write custom JavaScript validation for password match and phone format.',
          'Display inline error messages adjacent to invalid fields.',
          'Add ARIA attributes for screen reader accessibility.',
          'Simulate form submission and show a success confirmation message.',
        ],
        tasks: ['Implement HTML5 validation attributes on all fields', 'Write custom password match validation', 'Display inline error messages below each field', 'Add ARIA labels and roles for accessibility'],
        expectedOutcome: 'An accessible registration form with both HTML5 and custom JS validation that passes an ARIA audit.',
      },
    ],
  },
  {
    id: 'bca-fullstack-react',
    program: 'BCA Full Stack Development',
    semester: 'Semester 5',
    subject: 'React & Frontend',
    title: 'React & Frontend Development Lab',
    desc: 'Build modern, component-driven UIs with React, hooks, state management, and API integration.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-react-1', number: 1,
        title: 'React Component Architecture',
        objective: 'Design and build a reusable component library following atomic design principles.',
        type: 'coding', duration: '90 min',
        instructions: [
          'Scaffold a new React project using Vite.',
          'Create atomic components: Button, Input, Badge, and Card.',
          'Compose these into a ProductCard organism component.',
          'Pass data via props and implement PropTypes or TypeScript interfaces.',
          'Render a list of ProductCards using array.map with correct keys.',
          'Add a simple Storybook story for the Button component.',
        ],
        tasks: ['Build 4 atomic components with documented props', 'Compose ProductCard from atomic components', 'Render a list of 6 product cards from a data array', 'Add hover and focus styles to Button component'],
        expectedOutcome: 'A component library folder with 4 reusable components and a ProductCard composite.',
      },
      {
        id: 'exp-react-2', number: 2,
        title: 'React Hooks and State Management',
        objective: 'Build a shopping cart using useState, useEffect, useContext, and useReducer.',
        type: 'coding', duration: '100 min',
        instructions: [
          'Create a ProductList component that fetches products from a mock API.',
          'Implement an "Add to Cart" button using useContext with a CartContext.',
          'Use useReducer to manage cart actions: add, remove, and update quantity.',
          'Display the cart total using a derived value from the cart state.',
          'Persist the cart to localStorage using a useEffect.',
          'Add a checkout form that clears the cart on submission.',
        ],
        tasks: ['Set up CartContext and CartProvider', 'Implement useReducer with add/remove/update actions', 'Sync cart state to localStorage with useEffect', 'Display running cart total with correct calculation'],
        expectedOutcome: 'A working shopping cart application with persistent state using React hooks and context.',
      },
      {
        id: 'exp-react-3', number: 3,
        title: 'Build a RESTful Dashboard',
        objective: 'Create a data dashboard that consumes a REST API and visualises results in tables and charts.',
        type: 'coding', duration: '110 min',
        instructions: [
          'Set up React Router with routes for /dashboard, /users, and /analytics.',
          'Fetch user data from JSONPlaceholder and display in a sortable table.',
          'Implement pagination with 10 users per page.',
          'Add a search bar that filters the displayed users.',
          'Create a summary analytics panel showing total users, active, and inactive counts.',
          'Handle loading and error states for every API call.',
        ],
        tasks: ['Set up React Router with 3 routes', 'Display a sortable and paginated user table', 'Implement client-side search filtering', 'Show loading skeleton and error fallback UI'],
        expectedOutcome: 'A multi-page dashboard with data fetching, search, pagination, and error handling.',
      },
      {
        id: 'exp-react-4', number: 4,
        title: 'Implement JWT Authentication',
        objective: 'Add secure login and route protection to a React application using JWT.',
        type: 'coding', duration: '90 min',
        instructions: [
          'Create Login and Register forms in React.',
          'Send credentials to a mock auth endpoint and receive a JWT token.',
          'Store the token in localStorage and set the Authorization header for subsequent API calls.',
          'Create a ProtectedRoute component that redirects unauthenticated users to /login.',
          'Decode the JWT payload to display the logged-in username.',
          'Implement logout by clearing the token and redirecting to /login.',
        ],
        tasks: ['Build Login form with email and password fields', 'Store JWT in localStorage on successful login', 'Protect at least 2 routes with ProtectedRoute', 'Implement logout clearing token and redirecting'],
        expectedOutcome: 'A React app with JWT-based authentication, protected routes, and persistent login sessions.',
      },
      {
        id: 'exp-react-5', number: 5,
        title: 'Create a Responsive Dashboard UI',
        objective: 'Build a pixel-accurate responsive admin dashboard with a sidebar, stats, and chart placeholders.',
        type: 'coding', duration: '120 min',
        instructions: [
          'Design a two-column layout: fixed sidebar (240px) and scrollable main content.',
          'Add navigation links in the sidebar with active state highlighting.',
          'Create a stats row with 4 KPI cards showing metric, value, and trend.',
          'Add a responsive grid that collapses to 2 then 1 column on smaller screens.',
          'Implement a dark/light theme toggle using a CSS class on the root element.',
          'Ensure the sidebar collapses to a hamburger menu below 768px.',
        ],
        tasks: ['Build fixed sidebar with navigation and active states', 'Create 4 KPI stat cards with mock data', 'Implement responsive grid with 3 breakpoints', 'Add dark/light theme toggle'],
        expectedOutcome: 'A responsive admin dashboard that works on desktop, tablet, and mobile with theme switching.',
      },
    ],
  },
  // ── MBA ────────────────────────────────────────────────────────────────────
  {
    id: 'mba-business-analytics',
    program: 'MBA',
    semester: 'Semester 1',
    subject: 'Business Analytics',
    title: 'Business Analytics Lab',
    desc: 'Apply analytical frameworks and data interpretation skills to real-world business scenarios.',
    labType: 'business',
    experiments: [
      {
        id: 'exp-ba-1', number: 1,
        title: 'Case Study: Market Expansion Strategy',
        objective: 'Analyse market data and recommend an expansion strategy for a consumer goods company.',
        type: 'business', duration: '90 min',
        instructions: [
          'Read the provided case study document for Horizon Consumer Goods.',
          'Identify the three potential markets: Tier-2 cities, rural distribution, and export.',
          'Analyse the financial projections for each option using the provided data tables.',
          'Apply a weighted scoring matrix to evaluate markets against 5 criteria.',
          'Prepare a one-page strategy recommendation with supporting rationale.',
          'Present your recommendation in a 5-slide PowerPoint format.',
        ],
        tasks: ['Complete the weighted scoring matrix for all 3 markets', 'Identify the top market with justification', 'Prepare a risk analysis for the chosen strategy', 'Write a 1-page executive recommendation'],
        expectedOutcome: 'A market expansion recommendation with weighted scoring matrix and executive summary.',
      },
      {
        id: 'exp-ba-2', number: 2,
        title: 'Regression Analysis for Sales Forecasting',
        objective: 'Build a multiple regression model to forecast quarterly sales using business drivers.',
        type: 'data', duration: '80 min',
        instructions: [
          'Load the provided 3-year quarterly sales dataset in Excel or Python.',
          'Identify potential predictor variables: advertising spend, seasonality, price index.',
          'Check for multicollinearity using a correlation matrix.',
          'Build a multiple regression model and interpret coefficients.',
          'Evaluate the model using R², adjusted R², and RMSE.',
          'Forecast next two quarters using the fitted model.',
        ],
        tasks: ['Identify 3 predictor variables with justification', 'Build and evaluate the regression model', 'Interpret each coefficient in business terms', 'Forecast next 2 quarters with confidence intervals'],
        expectedOutcome: 'A regression model with business interpretation of coefficients and a 2-quarter sales forecast.',
      },
      {
        id: 'exp-ba-3', number: 3,
        title: 'Customer Segmentation Analysis',
        objective: 'Segment customers using RFM analysis and develop targeted strategies for each segment.',
        type: 'business', duration: '85 min',
        instructions: [
          'Load the provided transaction dataset with customer ID, date, and amount.',
          'Compute Recency, Frequency, and Monetary values for each customer.',
          'Score each dimension on a 1–5 scale using quintile partitioning.',
          'Assign customer segments: Champions, Loyal, At Risk, Lost.',
          'Calculate segment size and average revenue per segment.',
          'Recommend a marketing action for each of the 4 segments.',
        ],
        tasks: ['Compute RFM scores for all customers', 'Assign segment labels based on combined scores', 'Calculate revenue contribution per segment', 'Write marketing recommendation for each segment'],
        expectedOutcome: 'An RFM segmentation table with 4 segments, revenue breakdown, and targeted marketing actions.',
      },
      {
        id: 'exp-ba-4', number: 4,
        title: 'Dashboard Design for Executive Reporting',
        objective: 'Design an executive KPI dashboard that communicates business performance clearly.',
        type: 'business', duration: '75 min',
        instructions: [
          'Review the provided business performance dataset for Q1–Q4.',
          'Select 6 KPIs most relevant to the CEO audience.',
          'Create the dashboard layout with chart placeholders in Excel or Figma.',
          'Choose appropriate chart types for each KPI (bar, line, gauge, etc.).',
          'Apply a consistent colour scheme and typography.',
          'Write a 100-word executive commentary below the dashboard.',
        ],
        tasks: ['Select and justify 6 KPIs for executive audience', 'Design dashboard layout with correct chart types', 'Apply consistent colour and typography standards', 'Write executive commentary narrative'],
        expectedOutcome: 'A one-page executive dashboard design with commentary, ready for board presentation.',
      },
      {
        id: 'exp-ba-5', number: 5,
        title: 'A/B Test Analysis',
        objective: 'Analyse an A/B test result and determine statistical significance of the outcome.',
        type: 'data', duration: '70 min',
        instructions: [
          'Load the provided A/B test dataset with conversion events for control and treatment.',
          'Compute conversion rates for both groups.',
          'Perform a two-proportion z-test to determine statistical significance.',
          'Calculate the 95% confidence interval for the difference in conversion rates.',
          'Determine the minimum detectable effect and required sample size.',
          'Write a go/no-go recommendation based on the test results.',
        ],
        tasks: ['Compute conversion rates for control and treatment', 'Run two-proportion z-test and report p-value', 'Calculate 95% confidence interval', 'Write go/no-go recommendation with business justification'],
        expectedOutcome: 'A statistical analysis report with p-value, confidence interval, and a business decision recommendation.',
      },
    ],
  },
  {
    id: 'mba-operations-research',
    program: 'MBA',
    semester: 'Semester 2',
    subject: 'Operations Research',
    title: 'Operations Research Lab',
    desc: 'Apply quantitative techniques such as linear programming and simulation to optimise business operations.',
    labType: 'simulation',
    experiments: [
      {
        id: 'exp-or-1', number: 1,
        title: 'Monte Carlo Simulation for Risk Analysis',
        objective: 'Use Monte Carlo simulation to quantify project cost uncertainty and probability of overrun.',
        type: 'simulation', duration: '85 min',
        instructions: [
          'Define a project with 5 tasks, each with minimum, most likely, and maximum cost estimates.',
          'Set up a spreadsheet or Python script to sample from triangular distributions for each task.',
          'Run 10,000 simulation iterations, summing total project cost each time.',
          'Plot a histogram of total cost outcomes.',
          'Compute the P50, P80, and P90 cost estimates from the simulation.',
          'Report the probability of exceeding the project budget of Rs 15 lakh.',
        ],
        tasks: ['Set up triangular distribution for 5 tasks', 'Run 10,000 Monte Carlo iterations', 'Plot cost histogram with P50/P80/P90 lines', 'Report probability of budget overrun'],
        expectedOutcome: 'A simulation report with cost distribution histogram, percentile estimates, and overrun probability.',
      },
      {
        id: 'exp-or-2', number: 2,
        title: 'Linear Programming for Production Planning',
        objective: 'Formulate and solve a production optimisation problem using linear programming.',
        type: 'simulation', duration: '80 min',
        instructions: [
          'Read the case: a factory produces two products with known profit margins and resource constraints.',
          'Define decision variables, objective function, and constraints.',
          'Solve using the simplex method or scipy.optimize.linprog.',
          'Identify the optimal production mix and maximum profit.',
          'Perform sensitivity analysis on resource constraints.',
          'Interpret shadow prices in business terms.',
        ],
        tasks: ['Formulate LP with decision variables and constraints', 'Solve using scipy or Excel Solver', 'Report optimal production mix and profit', 'Interpret at least 2 shadow prices in business context'],
        expectedOutcome: 'A solved LP formulation with optimal production plan, profit figure, and sensitivity analysis.',
      },
      {
        id: 'exp-or-3', number: 3,
        title: 'Queuing Theory — Bank Branch Simulation',
        objective: 'Model a bank branch queuing system and find the optimal number of tellers.',
        type: 'simulation', duration: '75 min',
        instructions: [
          'Model the branch as an M/M/c queue with given arrival and service rates.',
          'Compute utilisation, average wait time, and average queue length for c = 1 to 5 tellers.',
          'Plot wait time vs number of tellers.',
          'Determine the minimum tellers needed to keep average wait under 5 minutes.',
          'Estimate the cost of each additional teller and the revenue lost per minute of customer wait.',
          'Recommend the economically optimal staffing level.',
        ],
        tasks: ['Compute M/M/c queue metrics for c = 1 to 5', 'Plot average wait time vs number of tellers', 'Find minimum tellers for 5-minute wait target', 'Recommend staffing level with cost-benefit justification'],
        expectedOutcome: 'A queuing analysis report with optimal teller count, cost-benefit table, and recommendation.',
      },
      {
        id: 'exp-or-4', number: 4,
        title: 'Supply Chain Network Optimisation',
        objective: 'Optimise warehouse locations to minimise total distribution cost.',
        type: 'simulation', duration: '90 min',
        instructions: [
          'Load the provided dataset of 20 demand points and 4 candidate warehouse locations.',
          'Formulate the facility location problem as an integer program.',
          'Solve using PuLP or a manual greedy approach.',
          'Calculate total distribution cost for each feasible warehouse combination.',
          'Identify the minimum-cost configuration.',
          'Prepare a map visualisation (matplotlib or a sketch) showing selected warehouses and routes.',
        ],
        tasks: ['Formulate facility location as integer program', 'Enumerate or solve for optimal warehouse set', 'Compute total distribution cost for optimal solution', 'Visualise selected warehouses and distribution routes'],
        expectedOutcome: 'An optimal warehouse location plan with total cost, visualisation, and comparison to current setup.',
      },
    ],
  },
  // ── BBA ────────────────────────────────────────────────────────────────────
  {
    id: 'bba-financial-accounting',
    program: 'BBA',
    semester: 'Semester 1',
    subject: 'Financial Accounting',
    title: 'Financial Accounting Lab',
    desc: 'Prepare and analyse financial statements using standard accounting principles.',
    labType: 'business',
    experiments: [
      {
        id: 'exp-fa-1', number: 1,
        title: 'Prepare a Balance Sheet',
        objective: 'Construct a balance sheet from a trial balance and verify the accounting equation.',
        type: 'business', duration: '75 min',
        instructions: [
          'Review the provided trial balance for Sunrise Trading Co. for the year ending 31 March.',
          'Classify accounts into assets, liabilities, and equity.',
          'Arrange current and non-current assets in order of liquidity.',
          'Calculate total assets, total liabilities, and owners equity.',
          'Verify that Assets = Liabilities + Equity.',
          'Format the balance sheet in the standard vertical presentation.',
        ],
        tasks: ['Classify all 20 trial balance accounts', 'Calculate subtotals for current and non-current sections', 'Verify the accounting equation balances', 'Format in standard vertical presentation'],
        expectedOutcome: 'A correctly formatted balance sheet where Assets = Liabilities + Equity.',
      },
      {
        id: 'exp-fa-2', number: 2,
        title: 'Prepare a Profit and Loss Statement',
        objective: 'Construct a P&L statement and compute gross profit, operating profit, and net profit margins.',
        type: 'business', duration: '70 min',
        instructions: [
          'Use the provided revenue and expense data for the quarter.',
          'Calculate gross profit as Revenue minus Cost of Goods Sold.',
          'Deduct operating expenses to compute EBIT.',
          'Subtract interest and tax to arrive at net profit.',
          'Compute gross margin, operating margin, and net margin percentages.',
          'Compare margins against the provided industry benchmark table.',
        ],
        tasks: ['Calculate gross profit and gross margin', 'Calculate EBIT and operating margin', 'Calculate net profit and net margin', 'Compare all three margins against industry benchmarks'],
        expectedOutcome: 'A completed P&L statement with margin calculations and a benchmark comparison commentary.',
      },
      {
        id: 'exp-fa-3', number: 3,
        title: 'Ratio Analysis',
        objective: 'Compute and interpret key financial ratios to assess company performance and liquidity.',
        type: 'business', duration: '65 min',
        instructions: [
          'Load the financial statements of two competing companies from the provided data sheet.',
          'Compute liquidity ratios: current ratio and quick ratio for both.',
          'Compute profitability ratios: ROE, ROA, and net margin for both.',
          'Compute efficiency ratios: asset turnover and inventory turnover.',
          'Compute leverage ratios: debt-to-equity and interest coverage.',
          'Write a 200-word comparative analysis of the two companies.',
        ],
        tasks: ['Compute 8 ratios for both companies', 'Identify which company has stronger liquidity', 'Identify which company is more profitable', 'Write comparative analysis with investment recommendation'],
        expectedOutcome: 'A ratio analysis table for both companies with a written comparative assessment and recommendation.',
      },
      {
        id: 'exp-fa-4', number: 4,
        title: 'Cash Flow Statement',
        objective: 'Prepare a cash flow statement using the indirect method and interpret operating, investing, and financing activities.',
        type: 'business', duration: '80 min',
        instructions: [
          'Use the provided income statement and comparative balance sheets.',
          'Start with net income and adjust for non-cash items (depreciation).',
          'Adjust for changes in working capital items.',
          'Identify and categorise investing activities (asset purchases, disposals).',
          'Identify and categorise financing activities (loans, dividends, equity).',
          'Verify that net change in cash matches the balance sheet movement.',
        ],
        tasks: ['Calculate cash from operating activities using indirect method', 'Identify and sum all investing activity cash flows', 'Identify and sum all financing activity cash flows', 'Verify net cash change ties to balance sheet'],
        expectedOutcome: 'A complete cash flow statement using the indirect method with all three sections correctly totalled.',
      },
    ],
  },
  {
    id: 'bba-marketing',
    program: 'BBA',
    semester: 'Semester 2',
    subject: 'Marketing Fundamentals',
    title: 'Marketing Fundamentals Lab',
    desc: 'Analyse markets, consumer behaviour, and apply marketing mix frameworks to real business cases.',
    labType: 'business',
    experiments: [
      {
        id: 'exp-mkt-1', number: 1,
        title: 'Marketing Mix Analysis — The 4 Ps',
        objective: 'Analyse and recommend a marketing mix for a new product launch.',
        type: 'business', duration: '80 min',
        instructions: [
          'Read the case: a startup launching a premium water bottle in the Indian market.',
          'Analyse the Product: features, USP, packaging, and brand positioning.',
          'Analyse the Price: competitor pricing, value-based pricing suggestion.',
          'Analyse the Place: distribution channels, online vs offline split.',
          'Analyse the Promotion: recommended channels, message, and budget allocation.',
          'Summarise your 4P recommendations in a one-page marketing plan.',
        ],
        tasks: ['Analyse Product with 5 differentiating features', 'Recommend Price with competitive justification', 'Recommend 3 distribution channels with rationale', 'Draft a 50-word promotional message for the target audience'],
        expectedOutcome: 'A one-page marketing mix document with justified recommendations for all 4 Ps.',
      },
      {
        id: 'exp-mkt-2', number: 2,
        title: 'Consumer Behaviour Survey Analysis',
        objective: 'Design a consumer survey, collect responses, and derive insights for a brand.',
        type: 'business', duration: '90 min',
        instructions: [
          'Design a 10-question survey to understand buying behaviour for a snack brand.',
          'Include Likert scale, multiple choice, and open-ended question types.',
          'Collect at least 20 simulated or real responses.',
          'Tabulate responses and compute frequency distributions.',
          'Identify the top 3 purchase drivers from the data.',
          'Present findings in a 5-slide presentation format.',
        ],
        tasks: ['Design 10-question survey with mixed question types', 'Collect and tabulate 20+ responses', 'Identify top 3 purchase drivers with data evidence', 'Prepare 5-slide findings presentation'],
        expectedOutcome: 'A survey results document with frequency tables and a 5-slide presentation of key insights.',
      },
      {
        id: 'exp-mkt-3', number: 3,
        title: 'Brand Audit',
        objective: 'Conduct a brand audit of an Indian company and assess brand equity dimensions.',
        type: 'business', duration: '75 min',
        instructions: [
          'Select one of the provided Indian brands (Amul, Fabindia, or Nykaa).',
          'Assess brand awareness using publicly available data and survey responses.',
          'Evaluate brand associations: attributes, benefits, attitudes.',
          'Assess perceived quality using online reviews and NPS proxy.',
          'Evaluate brand loyalty using customer retention indicators.',
          'Score each dimension 1–10 and compute total brand equity score.',
        ],
        tasks: ['Score brand awareness, association, quality, and loyalty', 'Compute total brand equity score out of 40', 'Identify the brand\'s weakest equity dimension', 'Recommend 2 strategies to improve the weakest dimension'],
        expectedOutcome: 'A brand audit scorecard with total equity score and strategic recommendations for improvement.',
      },
    ],
  },
  // ── MCA ────────────────────────────────────────────────────────────────────
  {
    id: 'mca-algorithms',
    program: 'MCA',
    semester: 'Semester 3',
    subject: 'Algorithms & Data Structures',
    title: 'Algorithms & Data Structures Lab',
    desc: 'Implement and analyse fundamental algorithms and data structures in Python or Java.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-algo-1', number: 1,
        title: 'Sorting Algorithm Comparison',
        objective: 'Implement and compare bubble sort, merge sort, and quicksort on datasets of varying sizes.',
        type: 'coding', duration: '80 min',
        instructions: [
          'Implement bubble sort, merge sort, and quicksort in Python.',
          'Generate random arrays of sizes: 100, 1000, 10000, 100000 elements.',
          'Measure execution time for each algorithm on each array size using time.perf_counter.',
          'Plot a line chart of execution time vs array size for all three algorithms.',
          'Identify the Big-O complexity of each algorithm from the plot shape.',
          'Write a summary comparing average and worst-case behaviour.',
        ],
        tasks: ['Implement all 3 sorting algorithms', 'Benchmark on 4 array sizes', 'Plot time vs size line chart', 'Explain Big-O complexity from empirical results'],
        expectedOutcome: 'A benchmark report with time-complexity chart and written analysis of each algorithm.',
      },
      {
        id: 'exp-algo-2', number: 2,
        title: 'Graph Traversal — BFS and DFS',
        objective: 'Implement BFS and DFS on a directed graph and find shortest paths.',
        type: 'coding', duration: '75 min',
        instructions: [
          'Represent the provided graph as an adjacency list in Python.',
          'Implement BFS iteratively using a queue.',
          'Implement DFS recursively and iteratively using a stack.',
          'Find all reachable nodes from a given start node using both methods.',
          'Find the shortest path between two specified nodes using BFS.',
          'Detect if the graph contains a cycle using DFS.',
        ],
        tasks: ['Implement BFS and DFS on the provided graph', 'Find shortest path between nodes A and F', 'Detect and report any cycle in the graph', 'Compare nodes explored order for BFS vs DFS'],
        expectedOutcome: 'Working BFS/DFS implementations with shortest path result and cycle detection output.',
      },
      {
        id: 'exp-algo-3', number: 3,
        title: 'Dynamic Programming — Knapsack Problem',
        objective: 'Solve the 0/1 knapsack problem using dynamic programming and reconstruct the selected items.',
        type: 'coding', duration: '70 min',
        instructions: [
          'Given 10 items with weights and values, and a knapsack capacity of 50.',
          'Build the DP table bottom-up using a 2D array.',
          'Trace back through the DP table to reconstruct the selected items.',
          'Verify that the selected items do not exceed the capacity.',
          'Compare the DP solution with a greedy approach (value/weight ratio).',
          'Report cases where greedy gives a suboptimal result.',
        ],
        tasks: ['Build the 2D DP table for the knapsack', 'Reconstruct and list the selected items', 'Verify total weight does not exceed capacity', 'Show a case where greedy fails to match DP result'],
        expectedOutcome: 'A DP solution with item list, total value, and a greedy vs DP comparison table.',
      },
      {
        id: 'exp-algo-4', number: 4,
        title: 'Binary Search Tree Operations',
        objective: 'Implement a BST with insert, search, delete, and all three traversal orders.',
        type: 'coding', duration: '85 min',
        instructions: [
          'Define a TreeNode class and a BinarySearchTree class in Python.',
          'Implement insert and recursive search methods.',
          'Implement in-order, pre-order, and post-order traversal.',
          'Implement delete with all three cases: leaf, one child, two children.',
          'Find the height and count of nodes in the BST.',
          'Test with the provided sequence of 15 insert and delete operations.',
        ],
        tasks: ['Implement insert and search', 'Implement all 3 traversal orders', 'Implement delete for all 3 cases', 'Compute height and node count of the final BST'],
        expectedOutcome: 'A working BST implementation with correct traversal output and delete edge cases handled.',
      },
    ],
  },
  {
    id: 'mca-cloud-computing',
    program: 'MCA',
    semester: 'Semester 5',
    subject: 'Cloud Computing',
    title: 'Cloud Computing Lab',
    desc: 'Design and deploy cloud-native architectures using containerisation, serverless, and managed services.',
    labType: 'simulation',
    experiments: [
      {
        id: 'exp-cloud-1', number: 1,
        title: 'Docker Containerisation',
        objective: 'Containerise a Python Flask application and manage it with Docker Compose.',
        type: 'coding', duration: '90 min',
        instructions: [
          'Write a minimal Flask application with three routes: /, /health, and /data.',
          'Write a Dockerfile using python:3.11-slim as the base image.',
          'Build the Docker image and run it locally, mapping port 5000.',
          'Write a docker-compose.yml with the Flask app and a Redis service.',
          'Add a Redis-based request counter to the Flask app.',
          'Test the application end-to-end using curl or a browser.',
        ],
        tasks: ['Write Dockerfile and build image successfully', 'Run container and verify all 3 routes respond', 'Set up docker-compose with Flask + Redis', 'Verify Redis counter increments on each request'],
        expectedOutcome: 'A running multi-container application with verified route responses and Redis integration.',
      },
      {
        id: 'exp-cloud-2', number: 2,
        title: 'Serverless Function Deployment',
        objective: 'Deploy a serverless function to a simulated cloud environment and test event-driven execution.',
        type: 'simulation', duration: '80 min',
        instructions: [
          'Write a Python function that processes a JSON payload and returns a summary.',
          'Define a serverless.yml configuration file with function triggers.',
          'Deploy to a local simulated environment using the serverless-offline plugin.',
          'Test the function with 5 different JSON payloads via HTTP POST.',
          'Configure environment variables for the function.',
          'Add basic error handling and return appropriate HTTP status codes.',
        ],
        tasks: ['Write serverless function with JSON processing logic', 'Configure serverless.yml with HTTP trigger', 'Test with 5 payloads including edge cases', 'Return correct HTTP status codes for success and errors'],
        expectedOutcome: 'A deployed serverless function that processes JSON correctly and handles error cases.',
      },
      {
        id: 'exp-cloud-3', number: 3,
        title: 'Microservices Architecture Design',
        objective: 'Design a microservices architecture for an e-commerce platform and document service boundaries.',
        type: 'simulation', duration: '85 min',
        instructions: [
          'Identify 5 bounded contexts for the e-commerce platform: Catalogue, Orders, Payments, Users, Notifications.',
          'Define the API contract (endpoints and payload schemas) for each service.',
          'Design the communication pattern: synchronous REST vs asynchronous messaging.',
          'Draw the architecture diagram showing services, API gateway, and message bus.',
          'Identify data ownership for each service and document why no cross-service database sharing.',
          'Write a 200-word trade-off analysis of this architecture vs a monolith.',
        ],
        tasks: ['Define 5 microservices with API contracts', 'Design communication patterns for service interactions', 'Draw architecture diagram with all components', 'Write monolith vs microservices trade-off analysis'],
        expectedOutcome: 'An architecture document with service definitions, API contracts, diagram, and trade-off analysis.',
      },
    ],
  },
  // ── M.Com Fintech ──────────────────────────────────────────────────────────
  {
    id: 'mcom-fintech-digital-payments',
    program: 'M.Com Fintech',
    semester: 'Semester 1',
    subject: 'Digital Payments',
    title: 'Digital Payments Lab',
    desc: 'Explore UPI, NEFT, IMPS, and global digital payment architectures through simulations and case analysis.',
    labType: 'simulation',
    experiments: [
      {
        id: 'exp-dp-1', number: 1,
        title: 'UPI Transaction Flow Simulation',
        objective: 'Simulate a UPI payment lifecycle and map each step to the technical and regulatory framework.',
        type: 'simulation', duration: '75 min',
        instructions: [
          'Review the NPCI UPI technical documentation summary provided.',
          'Identify the 7 stages of a UPI collect flow: initiation, VPA resolution, mandate, debit, settlement, reconciliation, notification.',
          'Map each stage to the responsible entity: PSP app, issuing bank, NPCI switch, beneficiary bank.',
          'Simulate a Rs 10,000 transaction using the provided flowchart template.',
          'Identify failure points at each stage and document the retry/error mechanism.',
          'Calculate settlement timeline and float implications for the merchant.',
        ],
        tasks: ['Map all 7 UPI flow stages to entities', 'Complete the transaction simulation flowchart', 'Identify 3 potential failure points with error codes', 'Calculate merchant float for T+1 settlement'],
        expectedOutcome: 'A completed UPI transaction flowchart with entity mapping, failure analysis, and settlement calculation.',
      },
      {
        id: 'exp-dp-2', number: 2,
        title: 'Payment Gateway Integration Analysis',
        objective: 'Analyse the technical and commercial structure of a payment gateway integration.',
        type: 'business', duration: '80 min',
        instructions: [
          'Review the sandbox API documentation for the provided mock payment gateway.',
          'Identify the API endpoints for: payment initiation, status check, and refund.',
          'Map the merchant discount rate (MDR) structure for different card types.',
          'Simulate a payment failure scenario and document the fallback flow.',
          'Compare MDR and settlement terms for 3 gateway providers using the provided table.',
          'Recommend the best gateway for a small e-commerce merchant with daily volume under Rs 1 lakh.',
        ],
        tasks: ['Document 3 key API endpoints with request/response schemas', 'Map MDR structure for debit, credit, and UPI', 'Simulate and document a payment failure flow', 'Recommend gateway with cost-benefit justification'],
        expectedOutcome: 'A gateway integration analysis with MDR comparison table, failure flow, and merchant recommendation.',
      },
      {
        id: 'exp-dp-3', number: 3,
        title: 'Fraud Detection in Digital Payments',
        objective: 'Apply rule-based fraud detection logic to a transaction dataset and measure false positive rate.',
        type: 'data', duration: '85 min',
        instructions: [
          'Load the provided transaction dataset with 500 records and fraud labels.',
          'Apply 5 rule-based detection rules: velocity check, geo anomaly, amount outlier, device mismatch, time anomaly.',
          'Flag transactions that trigger 2 or more rules.',
          'Calculate precision, recall, and false positive rate of the rule system.',
          'Identify the 3 most effective rules by individual recall.',
          'Suggest 2 improvements to reduce false positives without significantly hurting recall.',
        ],
        tasks: ['Implement 5 fraud detection rules on the dataset', 'Flag transactions triggering 2+ rules', 'Calculate precision, recall, and FPR', 'Identify most effective rules and suggest improvements'],
        expectedOutcome: 'A fraud detection evaluation report with metrics table and rule improvement recommendations.',
      },
      {
        id: 'exp-dp-4', number: 4,
        title: 'Cross-Border Payment Cost Analysis',
        objective: 'Analyse the cost structure of cross-border remittances and compare corridors.',
        type: 'data', duration: '70 min',
        instructions: [
          'Use the World Bank Remittance Prices data (provided as a CSV) for 5 corridors.',
          'Calculate total cost as a percentage of the transfer amount for each provider.',
          'Plot a bar chart comparing costs across providers for the India-UAE corridor.',
          'Identify the cheapest provider for each of the 5 corridors.',
          'Calculate potential savings if the G20 5% cost target were applied universally.',
          'Write a 150-word policy recommendation to reduce remittance costs.',
        ],
        tasks: ['Calculate total cost % for each provider and corridor', 'Plot corridor cost comparison chart', 'Identify cheapest provider per corridor', 'Estimate savings from G20 5% cost target'],
        expectedOutcome: 'A cost comparison table, chart, and policy recommendation for reducing remittance costs.',
      },
    ],
  },
  {
    id: 'mcom-fintech-blockchain',
    program: 'M.Com Fintech',
    semester: 'Semester 1',
    subject: 'Blockchain Fundamentals',
    title: 'Blockchain Fundamentals Lab',
    desc: 'Understand distributed ledger mechanics, consensus mechanisms, and smart contract basics.',
    labType: 'simulation',
    experiments: [
      {
        id: 'exp-bc-1', number: 1,
        title: 'Build a Simple Blockchain in Python',
        objective: 'Implement a basic blockchain with block creation, hashing, and chain validation.',
        type: 'coding', duration: '90 min',
        instructions: [
          'Define a Block class with index, timestamp, data, previous_hash, and hash fields.',
          'Use hashlib.sha256 to compute the block hash from its fields.',
          'Define a Blockchain class that initialises with a genesis block.',
          'Implement an add_block method that links blocks by previous_hash.',
          'Implement a validate_chain method that verifies hash links are unbroken.',
          'Test the chain: add 5 blocks, tamper with block 3, and verify the chain reports invalid.',
        ],
        tasks: ['Implement Block class with correct hash computation', 'Implement Blockchain with genesis block', 'Add 5 blocks and validate the chain', 'Tamper with one block and show chain invalidation'],
        expectedOutcome: 'A working blockchain implementation that correctly detects tampering in the chain.',
      },
      {
        id: 'exp-bc-2', number: 2,
        title: 'Smart Contract Logic Simulation',
        objective: 'Simulate the logic of an escrow smart contract using Python classes.',
        type: 'simulation', duration: '80 min',
        instructions: [
          'Design an escrow contract with three parties: buyer, seller, and arbiter.',
          'Implement deposit, release, refund, and dispute functions.',
          'Enforce state transitions: Created, Funded, Released, Refunded, Disputed.',
          'Add balance tracking and ensure no double-spend is possible.',
          'Simulate 3 scenarios: successful purchase, refund, and dispute resolution.',
          'Write assertions to verify contract state after each scenario.',
        ],
        tasks: ['Implement all 4 contract functions with state validation', 'Simulate successful purchase scenario', 'Simulate refund and dispute scenarios', 'Write assertions verifying correct state transitions'],
        expectedOutcome: 'A Python escrow contract simulation with verified state transitions for all 3 scenarios.',
      },
    ],
  },
  // ── SSU Semester 3 ─────────────────────────────────────────────────────────
  {
    id: 'ssu-sem3-computer-networks',
    program: 'SSU Semester 3',
    semester: 'Semester 3',
    subject: 'Computer Networks',
    title: 'Computer Networks Lab',
    desc: 'Explore networking protocols, socket programming, and network analysis using practical tools.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-cn-1', number: 1,
        title: 'TCP Socket Client-Server Communication',
        objective: 'Implement a TCP client-server application that exchanges messages bidirectionally.',
        type: 'coding', duration: '80 min',
        instructions: [
          'Write a Python TCP server that listens on port 9090.',
          'Write a Python TCP client that connects and sends a message.',
          'Implement bidirectional communication: server echoes back the message in uppercase.',
          'Handle multiple sequential client connections using a loop.',
          'Add connection error handling with try/except on the client side.',
          'Log each connection with timestamp and client IP on the server side.',
        ],
        tasks: ['Implement TCP server listening on port 9090', 'Implement client that sends and receives message', 'Handle connection errors gracefully on client', 'Log connections on server with timestamp'],
        expectedOutcome: 'A working client-server application demonstrating TCP communication with error handling.',
      },
      {
        id: 'exp-cn-2', number: 2,
        title: 'Packet Analysis with Wireshark',
        objective: 'Capture and analyse network packets to understand protocol headers and data flow.',
        type: 'simulation', duration: '75 min',
        instructions: [
          'Open Wireshark and start a capture on the loopback or active network interface.',
          'Generate HTTP traffic by visiting a non-HTTPS website or using curl.',
          'Apply a display filter for HTTP and identify the GET request packet.',
          'Examine the Ethernet, IP, TCP, and HTTP headers for one packet.',
          'Identify source/destination IP, TTL, sequence number, and HTTP method.',
          'Export the captured packets as a .pcapng file.',
        ],
        tasks: ['Capture at least 50 packets in Wireshark', 'Apply HTTP display filter', 'Document all 4 protocol layer headers for 1 packet', 'Export capture file and submit'],
        expectedOutcome: 'A packet analysis report documenting headers at all 4 layers with screenshots or field values.',
      },
      {
        id: 'exp-cn-3', number: 3,
        title: 'Subnet Calculation and VLSM',
        objective: 'Perform subnet calculations and design a VLSM addressing scheme for a given network.',
        type: 'coding', duration: '70 min',
        instructions: [
          'Given the base network 192.168.10.0/24 and 4 departments with host requirements.',
          'Order departments by size: 60, 30, 14, and 6 hosts.',
          'Allocate subnets using VLSM starting with the largest requirement.',
          'Calculate subnet address, mask, first host, last host, and broadcast for each subnet.',
          'Write a Python script to automate the subnet calculation for any input.',
          'Verify no subnets overlap using the script.',
        ],
        tasks: ['Manually calculate all 4 VLSM subnets', 'Write Python script to automate subnet calculation', 'Verify no overlap between calculated subnets', 'Document the complete addressing plan in a table'],
        expectedOutcome: 'A VLSM addressing table with a Python calculator script that validates non-overlapping subnets.',
      },
      {
        id: 'exp-cn-4', number: 4,
        title: 'HTTP and DNS Protocol Exploration',
        objective: 'Use command-line tools to explore HTTP and DNS behaviour and document findings.',
        type: 'coding', duration: '65 min',
        instructions: [
          'Use curl -v to make an HTTP GET request and document all request and response headers.',
          'Use nslookup or dig to query the DNS A record for a domain.',
          'Trace the DNS resolution chain from root to authoritative nameserver.',
          'Compare response times for cached vs uncached DNS lookups.',
          'Use curl to follow redirects with -L and count the number of hops.',
          'Document your findings in a structured report.',
        ],
        tasks: ['Document all HTTP request and response headers', 'Trace DNS resolution chain with dig', 'Measure and compare cached vs uncached DNS times', 'Count redirect hops for a URL that redirects'],
        expectedOutcome: 'A protocol exploration report documenting HTTP headers, DNS chain, and redirect behaviour.',
      },
    ],
  },
  {
    id: 'ssu-sem3-os',
    program: 'SSU Semester 3',
    semester: 'Semester 3',
    subject: 'Operating Systems',
    title: 'Operating Systems Lab',
    desc: 'Explore process scheduling, memory management, and file system operations through simulation and coding.',
    labType: 'simulation',
    experiments: [
      {
        id: 'exp-os-1', number: 1,
        title: 'CPU Scheduling Algorithms',
        objective: 'Implement FCFS, SJF, and Round Robin schedulers and compare average waiting time.',
        type: 'simulation', duration: '85 min',
        instructions: [
          'Define a process data structure with PID, arrival time, burst time, and priority.',
          'Implement First Come First Served (FCFS) scheduling algorithm.',
          'Implement Shortest Job First (SJF) non-preemptive scheduling.',
          'Implement Round Robin with a time quantum of 3ms.',
          'Compute waiting time, turnaround time, and CPU utilisation for each algorithm.',
          'Draw a Gantt chart for each algorithm on the provided process set.',
        ],
        tasks: ['Implement all 3 scheduling algorithms', 'Compute average waiting and turnaround time', 'Draw Gantt chart for each algorithm', 'Identify which algorithm minimises average waiting time'],
        expectedOutcome: 'A comparative table of scheduling metrics with Gantt charts and algorithm recommendation.',
      },
      {
        id: 'exp-os-2', number: 2,
        title: 'Page Replacement Algorithms',
        objective: 'Simulate FIFO, LRU, and Optimal page replacement and count page faults.',
        type: 'simulation', duration: '75 min',
        instructions: [
          'Given a reference string of 20 page numbers and 3 page frames.',
          'Simulate FIFO: track page frames and count faults on each access.',
          'Simulate LRU: evict the least recently used page on each fault.',
          'Simulate Optimal: look ahead in the reference string to evict the furthest-used page.',
          'Build a step-by-step trace table showing frame contents after each access.',
          'Compare total page faults across all three algorithms.',
        ],
        tasks: ['Simulate FIFO and count page faults', 'Simulate LRU and count page faults', 'Simulate Optimal and count page faults', 'Build complete trace table and compare results'],
        expectedOutcome: 'A trace table for all 3 algorithms with page fault counts and a comparison chart.',
      },
      {
        id: 'exp-os-3', number: 3,
        title: 'Shell Scripting for System Administration',
        objective: 'Write bash scripts to automate common system administration tasks.',
        type: 'coding', duration: '80 min',
        instructions: [
          'Write a bash script that monitors disk usage and alerts if any partition exceeds 80%.',
          'Write a script that archives log files older than 7 days to a .tar.gz file.',
          'Write a script that lists the top 10 CPU-consuming processes every 5 seconds.',
          'Add error handling and logging to each script.',
          'Schedule the disk monitor script using a cron expression.',
          'Test all three scripts and document sample output.',
        ],
        tasks: ['Write disk usage monitoring script with alert', 'Write log archival script for 7-day-old files', 'Write process monitor script with 5-second loop', 'Document sample output for each script'],
        expectedOutcome: 'Three working bash scripts with documented sample output and cron configuration.',
      },
    ],
  },
  // ── SSU Semester 5 ─────────────────────────────────────────────────────────
  {
    id: 'ssu-sem5-compiler-design',
    program: 'SSU Semester 5',
    semester: 'Semester 5',
    subject: 'Compiler Design',
    title: 'Compiler Design Lab',
    desc: 'Implement lexical analysis, parsing, and code generation phases of a simple compiler.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-cd-1', number: 1,
        title: 'Lexical Analyser Implementation',
        objective: 'Build a lexer that tokenises a subset of a C-like language using regular expressions.',
        type: 'coding', duration: '90 min',
        instructions: [
          'Define token categories: keywords, identifiers, literals, operators, and delimiters.',
          'Write regular expressions for each token category.',
          'Implement a lexer function that scans input and returns a token stream.',
          'Handle whitespace and single-line comments as ignored input.',
          'Test the lexer on 5 provided code snippets.',
          'Report any lexical errors (unrecognised characters) with line and column numbers.',
        ],
        tasks: ['Define regex for at least 6 token types', 'Tokenise all 5 provided code snippets correctly', 'Skip whitespace and comments correctly', 'Report lexical errors with line and column'],
        expectedOutcome: 'A lexer that correctly tokenises valid input and reports errors for 5 test programs.',
      },
      {
        id: 'exp-cd-2', number: 2,
        title: 'Recursive Descent Parser',
        objective: 'Build a recursive descent parser for arithmetic expressions with operator precedence.',
        type: 'coding', duration: '85 min',
        instructions: [
          'Define the grammar: E -> E + T | T, T -> T * F | F, F -> (E) | num.',
          'Refactor the grammar to eliminate left recursion.',
          'Implement a recursive descent parser with functions for E, T, and F.',
          'Integrate with your lexer to parse a token stream.',
          'Build an Abstract Syntax Tree (AST) during parsing.',
          'Test with 10 expressions including edge cases (nested parentheses, missing operators).',
        ],
        tasks: ['Eliminate left recursion from grammar', 'Implement recursive descent functions for E, T, F', 'Build AST from parse result', 'Test with 10 expressions including edge cases'],
        expectedOutcome: 'A parser that produces a correct AST for valid expressions and reports parse errors.',
      },
      {
        id: 'exp-cd-3', number: 3,
        title: 'Symbol Table and Semantic Analysis',
        objective: 'Implement a symbol table and perform type checking for variable declarations.',
        type: 'coding', duration: '80 min',
        instructions: [
          'Design a symbol table as a dictionary of scope-keyed dictionaries.',
          'Implement insert and lookup operations with scope handling.',
          'Walk the AST from the previous experiment and populate the symbol table.',
          'Implement type checking: flag errors for undeclared variables and type mismatches.',
          'Handle nested scopes by pushing and popping scope contexts.',
          'Report all semantic errors with descriptive messages.',
        ],
        tasks: ['Implement symbol table with scope support', 'Populate symbol table by walking the AST', 'Detect undeclared variable usage', 'Detect and report type mismatch errors'],
        expectedOutcome: 'A symbol table and type checker that reports semantic errors for the provided test programs.',
      },
      {
        id: 'exp-cd-4', number: 4,
        title: 'Three-Address Code Generation',
        objective: 'Generate three-address intermediate code from an AST for arithmetic expressions.',
        type: 'coding', duration: '85 min',
        instructions: [
          'Traverse the AST post-order to generate three-address code instructions.',
          'Use temporary variables t1, t2, ... for intermediate results.',
          'Handle binary operations, assignments, and conditional jumps.',
          'Produce the three-address code as a list of instruction strings.',
          'Optimise by eliminating redundant temporaries in constant expressions.',
          'Test on 5 source programs and verify the generated code is semantically equivalent.',
        ],
        tasks: ['Generate 3-address code for binary expressions', 'Handle assignment statements correctly', 'Use minimal temporaries with constant folding', 'Verify 5 generated programs are semantically correct'],
        expectedOutcome: 'A code generator that produces correct three-address intermediate code for 5 test programs.',
      },
      {
        id: 'exp-cd-5', number: 5,
        title: 'Peephole Optimisation',
        objective: 'Implement a peephole optimiser that applies local code transformations to three-address code.',
        type: 'coding', duration: '75 min',
        instructions: [
          'Define 5 peephole optimisation patterns: dead store elimination, redundant load removal, constant folding, algebraic simplification, and jump-to-jump elimination.',
          'Implement a sliding window of 3 instructions over the code sequence.',
          'Apply matching patterns and replace with optimised instruction sequences.',
          'Count the number of instructions before and after optimisation.',
          'Verify that optimised code produces the same output as original.',
          'Report optimisation percentage (instructions eliminated).',
        ],
        tasks: ['Implement 5 peephole optimisation patterns', 'Apply optimiser to 3 test programs', 'Count instructions before and after', 'Verify semantic equivalence of optimised code'],
        expectedOutcome: 'A peephole optimiser that reduces instruction count while preserving semantics for test programs.',
      },
    ],
  },
  {
    id: 'ssu-sem5-software-engineering',
    program: 'SSU Semester 5',
    semester: 'Semester 5',
    subject: 'Software Engineering',
    title: 'Software Engineering Lab',
    desc: 'Apply software development lifecycle methodologies, design patterns, and testing techniques.',
    labType: 'coding',
    experiments: [
      {
        id: 'exp-se-1', number: 1,
        title: 'Use Case Diagram and Requirements Specification',
        objective: 'Elicit and document requirements for a library management system using UML use cases.',
        type: 'business', duration: '75 min',
        instructions: [
          'Identify actors for the library management system: Student, Librarian, Admin.',
          'Identify at least 12 use cases across all actors.',
          'Draw a UML use case diagram using draw.io or pen-and-paper scan.',
          'Write a fully-dressed use case for "Issue Book" with preconditions, main flow, and alternates.',
          'Write a Software Requirements Specification (SRS) section for 5 key functional requirements.',
          'Apply the SMART criteria to validate each requirement.',
        ],
        tasks: ['Identify all actors and 12+ use cases', 'Draw complete UML use case diagram', 'Write fully-dressed use case for Issue Book', 'Write 5 SMART functional requirements'],
        expectedOutcome: 'A UML use case diagram, one fully-dressed use case, and 5 validated functional requirements.',
      },
      {
        id: 'exp-se-2', number: 2,
        title: 'Design Patterns Implementation',
        objective: 'Implement Singleton, Factory, and Observer design patterns in Python.',
        type: 'coding', duration: '85 min',
        instructions: [
          'Implement the Singleton pattern for a configuration manager class.',
          'Verify that multiple instantiations return the same object.',
          'Implement the Factory pattern for creating different notification types (Email, SMS, Push).',
          'Implement the Observer pattern for an event system with multiple subscribers.',
          'Demonstrate each pattern with a realistic usage scenario.',
          'Document the problem each pattern solves and when to use it.',
        ],
        tasks: ['Implement Singleton with verification test', 'Implement Factory for 3 notification types', 'Implement Observer with 3 subscriber types', 'Document use case for each pattern'],
        expectedOutcome: 'Three working pattern implementations with tests and usage documentation.',
      },
      {
        id: 'exp-se-3', number: 3,
        title: 'Unit Testing with pytest',
        objective: 'Write comprehensive unit tests for a provided Python module using pytest.',
        type: 'coding', duration: '80 min',
        instructions: [
          'Receive the provided BankAccount class with deposit, withdraw, and get_balance methods.',
          'Write unit tests for all 3 methods covering happy path cases.',
          'Write tests for edge cases: negative deposit, overdraft, zero balance.',
          'Use pytest fixtures to set up and tear down test objects.',
          'Mock an external payment gateway call using unittest.mock.',
          'Achieve at least 90% code coverage and document uncovered lines.',
        ],
        tasks: ['Write tests for all 3 BankAccount methods', 'Cover 5 edge cases with separate test functions', 'Use pytest fixtures for test setup', 'Achieve 90%+ code coverage'],
        expectedOutcome: 'A test suite with 90%+ coverage, edge case tests, and mocked external dependency.',
      },
    ],
  },
]
