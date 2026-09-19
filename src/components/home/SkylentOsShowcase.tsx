import { CourseThumb, ProductFrame } from "../product/ProductLanguage"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../../lib/authored-courses"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import { authoredWorkspace } from "../../lib/home-workspace"

export default function SkylentOsShowcase({ wide = false }: { wide?: boolean }) {
  const analytics = authoredWorkspace(FLAGSHIP_COURSE_SLUG)
  const product = authoredWorkspace(PRODUCT_MANAGEMENT_SLUG)
  if (!analytics) return null

  return (
    <div className={wide ? "hp-show is-wide" : "hp-show"}>
      <div className="hp-show-collage">
        <div className="hp-show-main">
          <ProductFrame brand="Skylent OS" title="" meta={`Lesson 7 of ${analytics.lessonCount}`}>
            <div className="hp-show-os">
              <div className="hp-show-learn">
                <p className="hp-show-continue">Continue learning</p>
                <p className="hp-show-course">{analytics.title}</p>
                <p className="hp-show-lesson">
                  {analytics.path.find((module) => module.state === "now")?.title ?? analytics.lessonTitle}
                </p>
                <ol className="hp-show-path">
                  {analytics.path.map((module) => (
                    <li key={module.id} className={`is-${module.state}`}>
                      <span aria-hidden="true">{module.state === "done" ? "✓" : "→"}</span>
                      {module.title}
                    </li>
                  ))}
                </ol>
              </div>
              <p className="hp-show-capstone">{analytics.workTitle}</p>
              <div className="hp-show-work">
                <CourseThumb authored visual={analytics.visual} />
              </div>
            </div>
          </ProductFrame>
        </div>
        <div className="hp-show-proof">
          {product ? (
            <div className="hp-show-float is-project">
              <ProductFrame brand="Skylent OS" title="" meta="Your project" compact>
                <p className="hp-show-case-kicker">Harbor Desk</p>
                <p className="hp-show-case-title">{product.workTitle}</p>
              </ProductFrame>
            </div>
          ) : null}
          <div className="hp-show-float is-career">
            <ProductFrame brand="Career OS" title="" meta="Evidence" compact>
              <ul className="hp-hero-career">
                {CAREER_OS_IA.filter((item) => item.label === "Projects" || item.label === "Opportunities").map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <b>{item.label === "Opportunities" ? "Empty until published" : item.sub}</b>
                  </li>
                ))}
              </ul>
            </ProductFrame>
          </div>
        </div>
      </div>
      <p className="hp-show-note">
        Live product UI from Skylent OS and Career OS. Data Analytics and Product Management are the two authored windows — not the brand.
      </p>
    </div>
  )
}
