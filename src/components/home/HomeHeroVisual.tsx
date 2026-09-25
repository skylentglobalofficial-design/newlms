import photo from "../../assets/home/pexels-3987012-macbook.jpg"
import { CourseWorkspacePreview } from "../product/ProductLanguage"
import { courses } from "../../data"
import { FLAGSHIP_COURSE_SLUG } from "../../lib/authored-courses"
import { countStaticCourseLessons } from "../../lib/curriculum-counts"

const course = courses.find((item) => item.slug === FLAGSHIP_COURSE_SLUG)
const lessons = course?.modules.flatMap((module) => module.lessons) ?? []
const firstLesson = course?.modules[0]?.lessons[0]
const firstQuiz = lessons.find((lesson) => lesson.type === "quiz")
const capstone = lessons.find((lesson) => /capstone/i.test(lesson.title))

export default function HomeHeroVisual() {
  return (
    <figure className="home-hero-visual">
      <div className="home-hero-stage">
        <img
          src={photo}
          alt="A person working on a laptop at a white desk"
          width={2000}
          height={1333}
        />
        {course ? (
          <div className="home-hero-screen" aria-hidden="true">
            <div className="home-hero-screen-ui">
              <CourseWorkspacePreview
                courseTitle={course.title}
                lessonTitle={firstLesson?.title ?? "Open the first lesson"}
                practiceTitle={firstQuiz?.title ?? "Practice"}
                workTitle={capstone?.title ?? "Capstone"}
                modules={course.modules.map((module) => module.title)}
                lessonCount={countStaticCourseLessons(course)}
                visual="northwind"
              />
            </div>
          </div>
        ) : null}
      </div>
      <figcaption className="home-hero-caption">
        The laptop shows the Data Analytics workspace in Skylent OS.
      </figcaption>
    </figure>
  )
}
