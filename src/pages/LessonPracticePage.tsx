import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLmsRoleAccent } from '../role-themes'
import { useLmsCourse } from '../hooks/useLms'
import {
  fetchLessonPractice,
  LmsHttpError,
  type ApiLessonPractice,
} from '../lib/lms-api'
import LessonPracticeSurface, { getPracticeNextLesson } from '../components/lms/LessonPracticeSurface'
import { isLessonUnlocked } from '../components/lms/lms-utils'

function dashRoute(role?: string) {
  switch (role) {
    case 'faculty':
      return '/dashboard/faculty'
    case 'organisation':
      return '/dashboard/organisation'
    case 'recruiter':
      return '/dashboard/recruiter'
    case 'superadmin':
      return '/dashboard/admin'
    default:
      return '/dashboard/student'
  }
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; practice: ApiLessonPractice }
  | { status: 'unavailable' }
  | { status: 'forbidden' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }

export default function LessonPracticePage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const { user, ready: authReady } = useAuth()
  const { access, lessonStates } = useLmsCourse(slug)
  const roleAccent = getLmsRoleAccent(user?.role)
  const learnerDash = dashRoute(user?.role)

  const [load, setLoad] = useState<LoadState>({ status: 'loading' })

  const course = access.status === 'ready' ? access.course : null
  const allLessons = course ? course.modules.flatMap((module) => module.lessons) : []
  const lessonHref = slug && lessonId ? `/learn/${slug}/${lessonId}` : learnerDash
  const nextLesson = lessonId ? getPracticeNextLesson(allLessons, lessonId) : null
  const nextUnlocked = nextLesson ? isLessonUnlocked(nextLesson.id, allLessons, lessonStates) : false
  const nextHref = slug && nextLesson && nextUnlocked ? `/learn/${slug}/${nextLesson.id}` : null

  useEffect(() => {
    if (!authReady) return
    if (!slug || !lessonId) {
      setLoad({ status: 'unavailable' })
      return
    }
    if (access.status === 'loading') {
      setLoad({ status: 'loading' })
      return
    }
    if (access.status === 'login_required') {
      setLoad({ status: 'unauthorized' })
      return
    }
    if (access.status === 'not_enrolled') {
      setLoad({ status: 'forbidden' })
      return
    }
    if (access.status !== 'ready') {
      setLoad({ status: 'error', message: 'Course unavailable' })
      return
    }

    let cancelled = false
    setLoad({ status: 'loading' })
    fetchLessonPractice(slug, lessonId)
      .then((practice) => {
        if (!cancelled) setLoad({ status: 'ready', practice })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof LmsHttpError) {
          if (error.status === 401) {
            setLoad({ status: 'unauthorized' })
            return
          }
          if (error.status === 403) {
            setLoad({ status: 'forbidden' })
            return
          }
          if (error.status === 404) {
            setLoad({ status: 'unavailable' })
            return
          }
          setLoad({ status: 'error', message: error.message })
          return
        }
        setLoad({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to load practice',
        })
      })

    return () => {
      cancelled = true
    }
  }, [authReady, access.status, slug, lessonId])

  if (!authReady || access.status === 'loading' || load.status === 'loading') {
    return (
      <div className="lms-gate lms-learn-gate" role="status">
        <p>Loading practice…</p>
      </div>
    )
  }

  if (load.status === 'unauthorized' || access.status === 'login_required') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Sign in to continue learning</h1>
        <p>Practice access requires an authenticated learner account with an enrollment for this course.</p>
        <div className="lms-gate-actions">
          <Link to="/login" className="lms-gate-primary">
            Sign in
          </Link>
          <Link to="/signup" className="lms-gate-secondary">
            Create account
          </Link>
        </div>
      </div>
    )
  }

  if (load.status === 'forbidden' || access.status === 'not_enrolled') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Practice unavailable</h1>
        <p>You need an active enrollment and an unlocked lesson to open this practice.</p>
        <div className="lms-gate-actions">
          <Link to={lessonHref} className="lms-gate-primary">
            Back to lesson
          </Link>
          <Link to={learnerDash} className="lms-gate-secondary">
            Back to learner workspace
          </Link>
        </div>
      </div>
    )
  }

  if (load.status === 'unavailable') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Practice isn't available for this lesson yet.</h1>
        <p>Return to the lesson to continue learning from the curriculum that is ready.</p>
        <div className="lms-gate-actions">
          <Link to={lessonHref} className="lms-gate-primary">
            Back to lesson
          </Link>
          <Link to={learnerDash} className="lms-gate-secondary">
            Back to learner workspace
          </Link>
        </div>
      </div>
    )
  }

  if (load.status === 'error') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Practice could not be loaded</h1>
        <p>{load.message}</p>
        <Link to={lessonHref} className="lms-gate-primary">
          Back to lesson
        </Link>
      </div>
    )
  }

  if (load.status !== 'ready') {
    return null
  }

  if (load.practice.interactionType !== 'choose') {
    return (
      <div className="lms-gate lms-learn-gate">
        <h1>Practice isn't available for this lesson yet.</h1>
        <p>This practice interaction is not supported in the current learner experience.</p>
        <Link to={lessonHref} className="lms-gate-primary">
          Back to lesson
        </Link>
      </div>
    )
  }

  return (
    <div className="lms-shell skylent-lms-shell lms-practice-shell">
      <a href="#lms-practice-main" className="lms-skip-link">
        Skip to practice
      </a>
      <header className="lms-header lms-learn-header lms-practice-header">
        <Link to={lessonHref} className="lms-back-btn">
          Back to lesson
        </Link>
        <span className="lms-header-sep" aria-hidden="true">
          ·
        </span>
        <span className="lms-header-course">{load.practice.courseTitle}</span>
      </header>
      <main id="lms-practice-main" className="lms-content lms-learn-content lms-practice-content" tabIndex={-1}>
        <LessonPracticeSurface
          practice={load.practice}
          accent={roleAccent}
          lessonHref={lessonHref}
          nextLesson={nextLesson}
          nextHref={nextHref}
        />
      </main>
    </div>
  )
}
