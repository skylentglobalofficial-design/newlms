import photo from "../../assets/home/pexels-3874631-cafe.jpg"

export default function HomeHeroVisual() {
  return (
    <figure className="home-hero-visual">
      <img
        src={photo}
        alt="A person working on a laptop in a bright cafe"
        width={2000}
        height={1333}
      />
      <div className="home-os-card" aria-hidden="true">
        <header className="home-os-bar">
          <strong>Skylent OS</strong>
          <span className="home-os-search">Search courses, skills or career paths…</span>
          <i />
        </header>
        <div className="home-os-body">
          <nav>
            <b>Home</b>
            <span>Learn</span>
            <span>Practice</span>
            <span>Career OS</span>
            <span>Certificates</span>
          </nav>
          <div className="home-os-main">
            <div className="home-os-head">
              <p>Continue learning</p>
              <span>View all →</span>
            </div>
            <article className="home-os-course">
              <em />
              <div>
                <strong>Data Analytics</strong>
                <small>Lesson 4 of 12</small>
                <b><i style={{ width: "33%" }} /></b>
              </div>
              <span>33%</span>
            </article>
            <div className="home-os-head">
              <p>Recommended for you</p>
              <span>View all →</span>
            </div>
            <div className="home-os-recs">
              <article>
                <em />
                <strong>Python for Data Science</strong>
                <small>Beginner · 6 weeks</small>
              </article>
              <article>
                <em />
                <strong>SQL for Analytics</strong>
                <small>Beginner · 4 weeks</small>
              </article>
            </div>
            <div className="home-os-head">
              <p>Career OS</p>
              <span>Explore →</span>
            </div>
            <div className="home-os-careers">
              <article><em /> <strong>Browse Jobs</strong><small>Live opportunities</small></article>
              <article><em /> <strong>Build Profile</strong><small>Showcase your skills</small></article>
              <article><em /> <strong>Get Placed</strong><small>Career guidance</small></article>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="home-hero-caption">
        The card shows the Skylent OS learning workspace.
      </figcaption>
    </figure>
  )
}
