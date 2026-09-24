# Manifest

Visual capture from `http://127.0.0.1:5174` on 24 September 2026. Each source image is one full scroll-height screenshot. Theme for every capture is the app’s single built-in appearance. No dark or light theme control exists, so no second theme was tested.

Only the files under `selected/` are stored in this branch. The inventory below lists every screenshot from that capture, including images that were not committed.

## Viewports tested

| Viewport width | Capture height | Coverage |
| ---: | --- | --- |
| 1440 | 900 | Every public route, LMS role pages, login error, logged-out guards |
| 1280 | 900 | Main public pages |
| 768 | 1024 | Main public pages and each role dashboard |
| 390 | 844 | Main public pages, each role dashboard, home with the menu open |

## Route inventory

| Route | Viewports | Auth | Final URL on the widest capture | Heading |
| --- | --- | --- | --- | --- |
| `/` | 390, 768, 1280, 1440 | signed out | `/` | Learn, practice, and build — in one learning workspace. |
| `/about` | 390, 768, 1280, 1440 | signed out | `/about` | Education → skills → career → institutions. |
| `/blog` | 390, 768, 1280, 1440 | signed out | `/blog` | Notes on education and careers. |
| `/blog/building-a-portfolio` | 1440 | signed out | `/blog/building-a-portfolio` | Why most data portfolios fail — and what a good one actually looks like |
| `/blog/career-os-approach` | 1440 | signed out | `/blog/career-os-approach` | Why career placement isn't a service — it's a system |
| `/blog/data-skills-2026` | 1440 | signed out | `/blog/data-skills-2026` | The data skills that actually get people hired in 2026 |
| `/blog/institutions-and-lms` | 1440 | signed out | `/blog/institutions-and-lms` | What institutions get wrong about LMS adoption |
| `/blog/llms-and-education` | 1440 | signed out | `/blog/llms-and-education` | How LLMs are changing the way students learn — and what education platforms need to do about it |
| `/career-os` | 390, 768, 1280, 1440 | signed out | `/career-os` | Keep your learning evidence in one place. |
| `/career-os/applications` | 1440 | signed out | `/career-os/applications` | Applications |
| `/career-os/applications/not-in-catalog` | 1440 | signed out | `/career-os/applications/not-in-catalog` | Applications |
| `/career-os/interviews` | 1440 | signed out | `/career-os/interviews` | Interviews |
| `/career-os/interviews/not-in-catalog` | 1440 | signed out | `/career-os/interviews/not-in-catalog` | Interviews |
| `/career-os/jobs` | 390, 768, 1280, 1440 | signed out | `/career-os/jobs` | Opportunities |
| `/career-os/profile` | 1440 | signed out | `/career-os/profile` | Profile |
| `/career-os/projects` | 1440 | signed out | `/career-os/projects` | Projects |
| `/career-os/projects/not-in-catalog` | 1440 | signed out | `/career-os/projects/not-in-catalog` | Projects |
| `/career-os/support` | 1440 | signed out | `/career-os/support` | Support |
| `/career-os/support/not-in-catalog` | 1440 | signed out | `/career-os/support/not-in-catalog` | Support |
| `/contact` | 390, 768, 1280, 1440 | signed out | `/contact` | Reach the team directly. |
| `/courses` | 390, 768, 1280, 1440 | signed out | `/courses` | Courses you can start this week. |
| `/courses/data-analytics` | 390, 768, 1280, 1440 | signed out | `/courses/data-analytics` | This course could not be loaded |
| `/courses/full-stack-web` | 1440 | signed out | `/courses/full-stack-web` | This course could not be loaded |
| `/courses/generative-ai` | 1440 | signed out | `/courses/generative-ai` | This course could not be loaded |
| `/courses/power-bi` | 1440 | signed out | `/courses/power-bi` | This course could not be loaded |
| `/courses/product-management` | 1440 | signed out | `/courses/product-management` | This course could not be loaded |
| `/courses/python-programming` | 1440 | signed out | `/courses/python-programming` | This course could not be loaded |
| `/dashboard/admin` | 390, 768, 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/dashboard/faculty` | 390, 768, 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/dashboard/organisation` | 390, 768, 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/dashboard/recruiter` | 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/dashboard/student` | 390, 768, 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/education` | 390, 768, 1280, 1440 | signed out | `/education` | Academic product lines. Not a live course catalogue. |
| `/education/exams` | 1440 | signed out | `/education/exams` | A preparation system — when it ships. |
| `/education/postgraduate` | 1440 | signed out | `/education/postgraduate` | Specialisation with a term structure — not UG rewritten. |
| `/education/schooling` | 1440 | signed out | `/education/schooling` | Academic progression, not a kids' course shop. |
| `/education/undergraduate` | 1440 | signed out | `/education/undergraduate` | Degree-aligned study beside the academic calendar. |
| `/exams/gate` | 1440 | signed out | `/exams/gate` | GATE |
| `/exams/iit-jam` | 1440 | signed out | `/exams/iit-jam` | IIT JAM |
| `/exams/neet` | 1440 | signed out | `/exams/neet` | NEET |
| `/exams/ssc` | 1440 | signed out | `/exams/ssc` | SSC |
| `/exams/upsc` | 1440 | signed out | `/exams/upsc` | UPSC |
| `/institutions` | 390, 768, 1280, 1440 | signed out | `/institutions` | Build the learning ecosystem around your institution. |
| `/labs` | 390, 768, 1280, 1440 | signed out | `/labs` | Labs live inside the learning path. |
| `/learn/data-analytics` | 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/learn/data-analytics/l1` | 1440 | demo Learner (client only, no API session) | `/learn/data-analytics/l1` | Course unavailable |
| `/learn/data-analytics/l3` | 1440 | demo Learner (client only, no API session) | `/learn/data-analytics/l3` | Course unavailable |
| `/learn/product-management` | 1440 | demo Learner (client only, no API session) | `/learn/product-management` | Course unavailable |
| `/learn/python-programming` | 1440 | demo Learner (client only, no API session) | `/learn/python-programming` | Course unavailable |
| `/login` | 390, 768, 1280, 1440 | signed out | `/login` | Welcome back. |
| `/not-a-real-route` | 1440 | signed out | `/not-a-real-route` | (no heading) |
| `/os` | 390, 768, 1280, 1440 | signed out | `/os` | Your learning workspace |
| `/os/labs/data-analytics/northwind` | 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/os/projects/data-analytics/northwind-commercial-review` | 1440 | signed out (guard redirected) | `/login` | Welcome back. |
| `/os/projects/product-management/harbor-desk-case` | 1440 | demo Learner (client only, no API session) | `/os/projects/product-management/harbor-desk-case` | This project could not load. |
| `/programs` | 390, 768, 1280, 1440 | signed out | `/programs` | Learn deeply. Build something real. |
| `/programs/cat-prep` | 1440 | signed out | `/programs/cat-prep` | This programme could not be loaded |
| `/programs/data-analytics-pro` | 390, 768, 1280, 1440 | signed out | `/programs/data-analytics-pro` | This programme could not be loaded |
| `/programs/data-science-ai` | 1440 | signed out | `/programs/data-science-ai` | This programme could not be loaded |
| `/programs/full-stack` | 1440 | signed out | `/programs/full-stack` | This programme could not be loaded |
| `/programs/generative-ai-program` | 1440 | signed out | `/programs/generative-ai-program` | This programme could not be loaded |
| `/programs/jee-advanced-prep` | 1440 | signed out | `/programs/jee-advanced-prep` | This programme could not be loaded |
| `/programs/product-management` | 1440 | signed out | `/programs/product-management` | This programme could not be loaded |
| `/programs/sql-certificate` | 1440 | signed out | `/programs/sql-certificate` | This programme could not be loaded |
| `/signup` | 1440 | signed out | `/signup` | Create your account. |
| `/skills` | 390, 768, 1280, 1440 | signed out | `/skills` | What do you want to be able to do? |
| `/stories` | 390, 768, 1280, 1440 | signed out | `/stories` | Stories from the work behind learning. |
| `/universities` | 390, 768, 1280, 1440 | signed out | `/universities` | Degree pathways with institutional depth. |
| `/workshops` | 390, 768, 1280, 1440 | signed out | `/workshops` | Short sessions. Planned subjects. Registration not open. |
| `/workshops/ai-for-business` | 1440 | signed out | `/workshops/ai-for-business` | AI for Business Leaders |
| `/workshops/interview-masterclass` | 1440 | signed out | `/workshops/interview-masterclass` | Data Interview Masterclass |
| `/workshops/power-bi-workshop` | 1440 | signed out | `/workshops/power-bi-workshop` | Power BI Intensive |
| `/workshops/prompt-engineering` | 1440 | signed out | `/workshops/prompt-engineering` | Prompt Engineering Masterclass |
| `/workshops/resume-masterclass` | 1440 | signed out | `/workshops/resume-masterclass` | Resume & LinkedIn Masterclass |

## Every screenshot captured

| Filename | Route | Section / state | Viewport | Theme | Auth state | In this branch |
| --- | --- | --- | ---: | --- | --- | --- |
| `lms/admin/1440/dashboard.png` | `/dashboard/admin` | Platform overview | 1440 | built-in | demo Admin (client only, no API session) | selected/lms-admin-dashboard-1440.png |
| `lms/admin/1440/wrong-role-recruiter.png` | `/dashboard/recruiter` | Platform overview | 1440 | built-in | demo Admin (client only, no API session) | not committed |
| `lms/admin/390/dashboard.png` | `/dashboard/admin` | Platform overview | 390 | built-in | demo Admin (client only, no API session) | not committed |
| `lms/admin/768/dashboard.png` | `/dashboard/admin` | Platform overview | 768 | built-in | demo Admin (client only, no API session) | not committed |
| `lms/faculty/1440/dashboard.png` | `/dashboard/faculty` | Teaching scope | 1440 | built-in | demo Faculty (client only, no API session) | selected/lms-faculty-dashboard-1440.png |
| `lms/faculty/1440/wrong-role-learn.png` | `/learn/data-analytics` | Teaching scope | 1440 | built-in | demo Faculty (client only, no API session) | not committed |
| `lms/faculty/1440/wrong-role-student-dashboard.png` | `/dashboard/student` | Teaching scope | 1440 | built-in | demo Faculty (client only, no API session) | not committed |
| `lms/faculty/390/dashboard.png` | `/dashboard/faculty` | Teaching scope | 390 | built-in | demo Faculty (client only, no API session) | not committed |
| `lms/faculty/768/dashboard.png` | `/dashboard/faculty` | Teaching scope | 768 | built-in | demo Faculty (client only, no API session) | not committed |
| `lms/organisation/1440/dashboard.png` | `/dashboard/organisation` | Demo Institution | 1440 | built-in | demo Institution (client only, no API session) | selected/lms-institution-dashboard-1440.png |
| `lms/organisation/390/dashboard.png` | `/dashboard/organisation` | Demo Institution | 390 | built-in | demo Institution (client only, no API session) | not committed |
| `lms/organisation/768/dashboard.png` | `/dashboard/organisation` | Demo Institution | 768 | built-in | demo Institution (client only, no API session) | not committed |
| `lms/student/1440/career-os-signed-in.png` | `/career-os` | (no heading) | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/courses-signed-in.png` | `/courses` | Courses you can start this week. | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/dashboard.png` | `/dashboard/student` | Learning workspace unavailable | 1440 | built-in | demo Learner (client only, no API session) | selected/lms-learner-dashboard-1440.png |
| `lms/student/1440/lab-northwind.png` | `/os/labs/data-analytics/northwind` | This lab could not load. | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/labs-signed-in.png` | `/labs` | Labs live inside the learning path. | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/learn-data-analytics-l1.png` | `/learn/data-analytics/l1` | Course unavailable | 1440 | built-in | demo Learner (client only, no API session) | selected/lms-lesson-route-1440.png |
| `lms/student/1440/learn-data-analytics-l3.png` | `/learn/data-analytics/l3` | Course unavailable | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/learn-data-analytics.png` | `/learn/data-analytics` | Course unavailable | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/learn-product-management.png` | `/learn/product-management` | Course unavailable | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/learn-python-programming.png` | `/learn/python-programming` | Course unavailable | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/program-data-science-ai-signed-in.png` | `/programs/data-science-ai` | This programme could not be loaded | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/project-harbor-desk.png` | `/os/projects/product-management/harbor-desk-case` | This project could not load. | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/1440/project-northwind.png` | `/os/projects/data-analytics/northwind-commercial-review` | This project could not load. | 1440 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/390/dashboard.png` | `/dashboard/student` | Learning workspace unavailable | 390 | built-in | demo Learner (client only, no API session) | not committed |
| `lms/student/768/dashboard.png` | `/dashboard/student` | Learning workspace unavailable | 768 | built-in | demo Learner (client only, no API session) | not committed |
| `public/1440/about.png` | `/about` | Education → skills → career → institutions. | 1440 | built-in | signed out | selected/about-desktop-1440.png |
| `public/1440/blog-building-a-portfolio.png` | `/blog/building-a-portfolio` | Why most data portfolios fail — and what a good one actually looks like | 1440 | built-in | signed out | not committed |
| `public/1440/blog-career-os-approach.png` | `/blog/career-os-approach` | Why career placement isn't a service — it's a system | 1440 | built-in | signed out | not committed |
| `public/1440/blog-data-skills-2026.png` | `/blog/data-skills-2026` | The data skills that actually get people hired in 2026 | 1440 | built-in | signed out | not committed |
| `public/1440/blog-institutions-and-lms.png` | `/blog/institutions-and-lms` | What institutions get wrong about LMS adoption | 1440 | built-in | signed out | not committed |
| `public/1440/blog-llms-and-education.png` | `/blog/llms-and-education` | How LLMs are changing the way students learn — and what education platforms need to do about it | 1440 | built-in | signed out | not committed |
| `public/1440/blog.png` | `/blog` | Notes on education and careers. | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-application-missing.png` | `/career-os/applications/not-in-catalog` | Applications | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-applications.png` | `/career-os/applications` | Applications | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-interview-missing.png` | `/career-os/interviews/not-in-catalog` | Interviews | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-interviews.png` | `/career-os/interviews` | Interviews | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-jobs.png` | `/career-os/jobs` | Opportunities | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-profile.png` | `/career-os/profile` | Profile | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-project-missing.png` | `/career-os/projects/not-in-catalog` | Projects | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-projects.png` | `/career-os/projects` | Projects | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-support-missing.png` | `/career-os/support/not-in-catalog` | Support | 1440 | built-in | signed out | not committed |
| `public/1440/career-os-support.png` | `/career-os/support` | Support | 1440 | built-in | signed out | not committed |
| `public/1440/career-os.png` | `/career-os` | Keep your learning evidence in one place. | 1440 | built-in | signed out | not committed |
| `public/1440/contact.png` | `/contact` | Reach the team directly. | 1440 | built-in | signed out | not committed |
| `public/1440/course-data-analytics.png` | `/courses/data-analytics` | This course could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/course-full-stack-web.png` | `/courses/full-stack-web` | This course could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/course-generative-ai.png` | `/courses/generative-ai` | This course could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/course-power-bi.png` | `/courses/power-bi` | This course could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/course-product-management.png` | `/courses/product-management` | This course could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/course-python-programming.png` | `/courses/python-programming` | This course could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/courses.png` | `/courses` | Courses you can start this week. | 1440 | built-in | signed out | selected/courses-desktop-1440.png |
| `public/1440/education-exams.png` | `/education/exams` | A preparation system — when it ships. | 1440 | built-in | signed out | not committed |
| `public/1440/education-postgraduate.png` | `/education/postgraduate` | Specialisation with a term structure — not UG rewritten. | 1440 | built-in | signed out | not committed |
| `public/1440/education-schooling.png` | `/education/schooling` | Academic progression, not a kids' course shop. | 1440 | built-in | signed out | not committed |
| `public/1440/education-undergraduate.png` | `/education/undergraduate` | Degree-aligned study beside the academic calendar. | 1440 | built-in | signed out | not committed |
| `public/1440/education.png` | `/education` | Academic product lines. Not a live course catalogue. | 1440 | built-in | signed out | not committed |
| `public/1440/exam-gate.png` | `/exams/gate` | GATE | 1440 | built-in | signed out | not committed |
| `public/1440/exam-iit-jam.png` | `/exams/iit-jam` | IIT JAM | 1440 | built-in | signed out | not committed |
| `public/1440/exam-neet.png` | `/exams/neet` | NEET | 1440 | built-in | signed out | not committed |
| `public/1440/exam-ssc.png` | `/exams/ssc` | SSC | 1440 | built-in | signed out | not committed |
| `public/1440/exam-upsc.png` | `/exams/upsc` | UPSC | 1440 | built-in | signed out | not committed |
| `public/1440/home.png` | `/` | Learn, practice, and build — in one learning workspace. | 1440 | built-in | signed out | selected/home-desktop-1440.png |
| `public/1440/institutions.png` | `/institutions` | Build the learning ecosystem around your institution. | 1440 | built-in | signed out | selected/institutions-desktop-1440.png |
| `public/1440/labs.png` | `/labs` | Labs live inside the learning path. | 1440 | built-in | signed out | not committed |
| `public/1440/login.png` | `/login` | Welcome back. | 1440 | built-in | signed out | not committed |
| `public/1440/not-found.png` | `/not-a-real-route` | 404 | 1440 | built-in | signed out | not committed |
| `public/1440/os.png` | `/os` | Your learning workspace | 1440 | built-in | signed out | not committed |
| `public/1440/program-cat-prep.png` | `/programs/cat-prep` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-data-analytics-pro.png` | `/programs/data-analytics-pro` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-data-science-ai.png` | `/programs/data-science-ai` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-full-stack.png` | `/programs/full-stack` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-generative-ai-program.png` | `/programs/generative-ai-program` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-jee-advanced-prep.png` | `/programs/jee-advanced-prep` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-product-management.png` | `/programs/product-management` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/program-sql-certificate.png` | `/programs/sql-certificate` | This programme could not be loaded | 1440 | built-in | signed out | not committed |
| `public/1440/programs.png` | `/programs` | Learn deeply. Build something real. | 1440 | built-in | signed out | selected/programs-desktop-1440.png |
| `public/1440/signup.png` | `/signup` | Create your account. | 1440 | built-in | signed out | not committed |
| `public/1440/skills.png` | `/skills` | What do you want to be able to do? | 1440 | built-in | signed out | not committed |
| `public/1440/stories.png` | `/stories` | Stories from the work behind learning. | 1440 | built-in | signed out | selected/stories-desktop-1440.png |
| `public/1440/universities.png` | `/universities` | Degree pathways with institutional depth. | 1440 | built-in | signed out | selected/universities-desktop-1440.png |
| `public/1440/workshop-ai-for-business.png` | `/workshops/ai-for-business` | AI for Business Leaders | 1440 | built-in | signed out | not committed |
| `public/1440/workshop-interview-masterclass.png` | `/workshops/interview-masterclass` | Data Interview Masterclass | 1440 | built-in | signed out | not committed |
| `public/1440/workshop-power-bi-workshop.png` | `/workshops/power-bi-workshop` | Power BI Intensive | 1440 | built-in | signed out | not committed |
| `public/1440/workshop-prompt-engineering.png` | `/workshops/prompt-engineering` | Prompt Engineering Masterclass | 1440 | built-in | signed out | not committed |
| `public/1440/workshop-resume-masterclass.png` | `/workshops/resume-masterclass` | Resume & LinkedIn Masterclass | 1440 | built-in | signed out | not committed |
| `public/1440/workshops.png` | `/workshops` | Short sessions. Planned subjects. Registration not open. | 1440 | built-in | signed out | not committed |
| `responsive/1280/about.png` | `/about` | Education → skills → career → institutions. | 1280 | built-in | signed out | not committed |
| `responsive/1280/blog.png` | `/blog` | Notes on education and careers. | 1280 | built-in | signed out | not committed |
| `responsive/1280/career-os-jobs.png` | `/career-os/jobs` | Opportunities | 1280 | built-in | signed out | not committed |
| `responsive/1280/career-os.png` | `/career-os` | Keep your learning evidence in one place. | 1280 | built-in | signed out | not committed |
| `responsive/1280/contact.png` | `/contact` | Reach the team directly. | 1280 | built-in | signed out | not committed |
| `responsive/1280/course-data-analytics.png` | `/courses/data-analytics` | This course could not be loaded | 1280 | built-in | signed out | not committed |
| `responsive/1280/courses.png` | `/courses` | Courses you can start this week. | 1280 | built-in | signed out | not committed |
| `responsive/1280/education.png` | `/education` | Academic product lines. Not a live course catalogue. | 1280 | built-in | signed out | not committed |
| `responsive/1280/home.png` | `/` | Learn, practice, and build — in one learning workspace. | 1280 | built-in | signed out | selected/home-1280.png |
| `responsive/1280/institutions.png` | `/institutions` | Build the learning ecosystem around your institution. | 1280 | built-in | signed out | not committed |
| `responsive/1280/labs.png` | `/labs` | Labs live inside the learning path. | 1280 | built-in | signed out | not committed |
| `responsive/1280/login.png` | `/login` | Welcome back. | 1280 | built-in | signed out | not committed |
| `responsive/1280/os.png` | `/os` | Your learning workspace | 1280 | built-in | signed out | not committed |
| `responsive/1280/program-data-analytics-pro.png` | `/programs/data-analytics-pro` | This programme could not be loaded | 1280 | built-in | signed out | not committed |
| `responsive/1280/programs.png` | `/programs` | Learn deeply. Build something real. | 1280 | built-in | signed out | not committed |
| `responsive/1280/skills.png` | `/skills` | What do you want to be able to do? | 1280 | built-in | signed out | not committed |
| `responsive/1280/stories.png` | `/stories` | Stories from the work behind learning. | 1280 | built-in | signed out | not committed |
| `responsive/1280/universities.png` | `/universities` | Degree pathways with institutional depth. | 1280 | built-in | signed out | not committed |
| `responsive/1280/workshops.png` | `/workshops` | Short sessions. Planned subjects. Registration not open. | 1280 | built-in | signed out | not committed |
| `responsive/390/about.png` | `/about` | Education → skills → career → institutions. | 390 | built-in | signed out | selected/about-390.png |
| `responsive/390/blog.png` | `/blog` | Notes on education and careers. | 390 | built-in | signed out | not committed |
| `responsive/390/career-os-jobs.png` | `/career-os/jobs` | Opportunities | 390 | built-in | signed out | not committed |
| `responsive/390/career-os.png` | `/career-os` | Keep your learning evidence in one place. | 390 | built-in | signed out | not committed |
| `responsive/390/contact.png` | `/contact` | Reach the team directly. | 390 | built-in | signed out | not committed |
| `responsive/390/course-data-analytics.png` | `/courses/data-analytics` | This course could not be loaded | 390 | built-in | signed out | not committed |
| `responsive/390/courses.png` | `/courses` | Courses you can start this week. | 390 | built-in | signed out | selected/courses-390.png |
| `responsive/390/education.png` | `/education` | Academic product lines. Not a live course catalogue. | 390 | built-in | signed out | not committed |
| `responsive/390/home.png` | `/` | Learn, practice, and build — in one learning workspace. | 390 | built-in | signed out | selected/home-390.png |
| `responsive/390/institutions.png` | `/institutions` | Build the learning ecosystem around your institution. | 390 | built-in | signed out | selected/institutions-390.png |
| `responsive/390/labs.png` | `/labs` | Labs live inside the learning path. | 390 | built-in | signed out | not committed |
| `responsive/390/login.png` | `/login` | Welcome back. | 390 | built-in | signed out | not committed |
| `responsive/390/os.png` | `/os` | Your learning workspace | 390 | built-in | signed out | selected/overflow-os-390.png |
| `responsive/390/program-data-analytics-pro.png` | `/programs/data-analytics-pro` | This programme could not be loaded | 390 | built-in | signed out | not committed |
| `responsive/390/programs.png` | `/programs` | Learn deeply. Build something real. | 390 | built-in | signed out | selected/programs-390.png |
| `responsive/390/skills.png` | `/skills` | What do you want to be able to do? | 390 | built-in | signed out | not committed |
| `responsive/390/stories.png` | `/stories` | Stories from the work behind learning. | 390 | built-in | signed out | selected/stories-390.png |
| `responsive/390/universities.png` | `/universities` | Degree pathways with institutional depth. | 390 | built-in | signed out | selected/universities-390.png |
| `responsive/390/workshops.png` | `/workshops` | Short sessions. Planned subjects. Registration not open. | 390 | built-in | signed out | not committed |
| `responsive/768/about.png` | `/about` | Education → skills → career → institutions. | 768 | built-in | signed out | not committed |
| `responsive/768/blog.png` | `/blog` | Notes on education and careers. | 768 | built-in | signed out | not committed |
| `responsive/768/career-os-jobs.png` | `/career-os/jobs` | Opportunities | 768 | built-in | signed out | not committed |
| `responsive/768/career-os.png` | `/career-os` | Keep your learning evidence in one place. | 768 | built-in | signed out | not committed |
| `responsive/768/contact.png` | `/contact` | Reach the team directly. | 768 | built-in | signed out | not committed |
| `responsive/768/course-data-analytics.png` | `/courses/data-analytics` | This course could not be loaded | 768 | built-in | signed out | not committed |
| `responsive/768/courses.png` | `/courses` | Courses you can start this week. | 768 | built-in | signed out | not committed |
| `responsive/768/education.png` | `/education` | Academic product lines. Not a live course catalogue. | 768 | built-in | signed out | not committed |
| `responsive/768/home.png` | `/` | Learn, practice, and build — in one learning workspace. | 768 | built-in | signed out | selected/home-768.png |
| `responsive/768/institutions.png` | `/institutions` | Build the learning ecosystem around your institution. | 768 | built-in | signed out | not committed |
| `responsive/768/labs.png` | `/labs` | Labs live inside the learning path. | 768 | built-in | signed out | not committed |
| `responsive/768/login.png` | `/login` | Welcome back. | 768 | built-in | signed out | not committed |
| `responsive/768/os.png` | `/os` | Your learning workspace | 768 | built-in | signed out | selected/overflow-os-768.png |
| `responsive/768/program-data-analytics-pro.png` | `/programs/data-analytics-pro` | This programme could not be loaded | 768 | built-in | signed out | not committed |
| `responsive/768/programs.png` | `/programs` | Learn deeply. Build something real. | 768 | built-in | signed out | not committed |
| `responsive/768/skills.png` | `/skills` | What do you want to be able to do? | 768 | built-in | signed out | not committed |
| `responsive/768/stories.png` | `/stories` | Stories from the work behind learning. | 768 | built-in | signed out | not committed |
| `responsive/768/universities.png` | `/universities` | Degree pathways with institutional depth. | 768 | built-in | signed out | not committed |
| `responsive/768/workshops.png` | `/workshops` | Short sessions. Planned subjects. Registration not open. | 768 | built-in | signed out | not committed |
| `states/1440/guard-admin.png` | `/dashboard/admin` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-faculty.png` | `/dashboard/faculty` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-lab.png` | `/os/labs/data-analytics/northwind` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-learn.png` | `/learn/data-analytics` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-organisation.png` | `/dashboard/organisation` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-project.png` | `/os/projects/data-analytics/northwind-commercial-review` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-recruiter.png` | `/dashboard/recruiter` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/guard-student.png` | `/dashboard/student` | Welcome back. | 1440 | built-in | signed out (guard redirected) | not committed |
| `states/1440/login-empty-submit.png` | `/login` | sign-in, empty submit error | 1440 | built-in | signed out | not committed |
| `states/390/home-menu-open.png` | `/` | home, mobile menu open | 390 | built-in | signed out | not committed |

Captured files: 155. Committed screenshots: 23.
