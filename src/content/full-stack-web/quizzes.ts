export type FswQuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  lessonId: string
  moduleId: string
}

export type FswQuizBank = {
  lessonId: string
  title: string
  questions: FswQuizQuestion[]
}

export const FSW_QUIZZES: Record<string, FswQuizBank> = {
  l3: {
    lessonId: 'l3',
    title: 'Web Protocols Check',
    questions: [
      {
        id: 'fsw-l3-q1',
        prompt: 'Which HTTP method is defined as idempotent according to the RFC HTTP specifications?',
        options: [
          'POST',
          'PUT',
          'PATCH (by default in standard specs)',
          'CONNECT',
        ],
        correctIndex: 1,
        explanation: 'PUT, GET, HEAD, DELETE, and OPTIONS are idempotent: making multiple identical requests has the same side effect on the server as making a single request.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'fsw-l3-q2',
        prompt: 'What HTTP status code should a server return when a client provides valid authentication credentials, but lacks permission to access the requested resource?',
        options: [
          '401 Unauthorized',
          '403 Forbidden',
          '404 Not Found',
          '400 Bad Request',
        ],
        correctIndex: 1,
        explanation: '401 Unauthorized means authentication is missing or invalid. 403 Forbidden means authentication is valid, but the user is not authorized to access this resource.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'fsw-l3-q3',
        prompt: 'Why should a backend API return HTTP 503 (Service Unavailable) rather than 500 (Internal Server Error) during database migrations or temporary connection pool exhaustion?',
        options: [
          '503 informs clients and load balancers that the outage is temporary and safe to retry (often accompanied by a Retry-After header)',
          '503 automatically restarts the database server',
          '500 is only allowed for JavaScript frontend errors',
          '503 compresses the error payload',
        ],
        correctIndex: 0,
        explanation: '503 explicitly signals a temporary condition where the server cannot handle the request right now, preventing automated retry storms from overwhelming a recovering database.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'fsw-l3-q4',
        prompt: 'What is the purpose of the "Accept" header in an HTTP request?',
        options: [
          'It specifies which MIME types the client understands and expects in the response (Content Negotiation)',
          'It tells the server whether to accept credit cards',
          'It provides the client authentication password',
          'It enables gzip compression on the request body',
        ],
        correctIndex: 0,
        explanation: 'The Accept header enables content negotiation, allowing the client to request JSON (application/json), HTML (text/html), or other representations.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'fsw-l3-q5',
        prompt: 'What header directive prevents browsers from caching sensitive authenticated API responses?',
        options: [
          'Cache-Control: no-store',
          'Cache-Control: public, max-age=31536000',
          'Connection: keep-alive',
          'Content-Encoding: gzip',
        ],
        correctIndex: 0,
        explanation: 'Cache-Control: no-store instructs caches and browsers not to store any part of the request or response in storage, preventing data leakage on shared computers.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
    ],
  },
  l9: {
    lessonId: 'l9',
    title: 'Persistence & Data Modeling Check',
    questions: [
      {
        id: 'fsw-l9-q1',
        prompt: 'What causes the "N+1 query problem" in relational database applications?',
        options: [
          'Executing 1 query to fetch N parent records, followed by N individual separate queries to fetch related child records inside a loop',
          'Running out of disk space on the primary partition',
          'Having more than N unique constraints on a single table',
          'Setting the database connection pool limit to 1',
        ],
        correctIndex: 0,
        explanation: 'The N+1 problem occurs when an application fetches a list of parent rows (1 query) and then loops over them executing an extra query per parent to fetch children (N queries). It is resolved by eager loading with a JOIN or WHERE IN.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'fsw-l9-q2',
        prompt: 'What guarantee does a database transaction provide under ACID properties?',
        options: [
          'All statements inside the transaction commit completely as an atomic unit, or all rollback with zero partial changes on error (Atomicity)',
          'It guarantees the database will never run out of memory',
          'It compiles SQL into C++ code',
          'It makes all queries asynchronous',
        ],
        correctIndex: 0,
        explanation: 'Atomicity guarantees that all modifications within the transaction are completed successfully, or the entire transaction is aborted and rolled back.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'fsw-l9-q3',
        prompt: 'Why are database indexes critical for query performance on columns used in WHERE and JOIN clauses?',
        options: [
          'They allow the database engine to find matching rows in logarithmic O(log N) time using B-Trees instead of scanning every row in O(N) time',
          'They compress the database by 90%',
          'They automatically format text to uppercase',
          'They prevent users from entering invalid emails',
        ],
        correctIndex: 0,
        explanation: 'Without an index, the database must perform a full table scan reading every row from disk. An index maintains a sorted B-Tree allowing fast binary search lookups.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'fsw-l9-q4',
        prompt: 'What does a composite unique constraint (e.g. @@unique([userId, courseId])) enforce?',
        options: [
          'A user can have multiple enrollments in the same course',
          'The combination of userId and courseId must be globally unique across all rows in the table',
          'Both userId and courseId must be positive integers',
          'The courseId is deleted if the user is deleted',
        ],
        correctIndex: 1,
        explanation: 'Composite unique constraints guarantee at the database engine level that no duplicate pair of (userId, courseId) can ever be inserted, preventing double enrollments.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'fsw-l9-q5',
        prompt: 'Why should backend applications use connection pooling (such as PgBouncer or connection pools)?',
        options: [
          'Opening a new PostgreSQL TCP connection per request incurs heavy SSL and memory handshake overhead; pooling reuses existing connections',
          'Connection pools convert SQL queries into JSON',
          'Connection pools eliminate the need for foreign keys',
          'PostgreSQL forbids running without a pooler',
        ],
        correctIndex: 0,
        explanation: 'PostgreSQL creates a dedicated OS process per connection. Connection pooling maintains a pool of warm connections, drastically reducing connection latency and memory load.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
    ],
  },
  l15: {
    lessonId: 'l15',
    title: 'Full Stack Web Final Check',
    questions: [
      {
        id: 'fsw-l15-q1',
        prompt: 'Why are authentication tokens (JWT or session IDs) safer in HttpOnly, SameSite=Lax cookies than in localStorage?',
        options: [
          'HttpOnly cookies cannot be read or exfiltrated by malicious JavaScript during a Cross-Site Scripting (XSS) attack',
          'LocalStorage is only available on desktop computers',
          'Cookies make HTTP requests 10x faster',
          'LocalStorage expires after 5 minutes automatically',
        ],
        correctIndex: 0,
        explanation: 'JavaScript running in the browser cannot read HttpOnly cookies via document.cookie, protecting authentication tokens from being stolen if an XSS vulnerability exists.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'fsw-l15-q2',
        prompt: 'What does Cross-Site Request Forgery (CSRF) exploit?',
        options: [
          'The browser automatically including ambient authentication cookies on cross-origin requests initiated by an external malicious site',
          'Weak database password hashing algorithms',
          'Slow DNS resolution times',
          'Missing alt tags on image elements',
        ],
        correctIndex: 0,
        explanation: 'CSRF tricks an authenticated browser into submitting unauthorized commands to a vulnerable web application because the browser automatically attaches cookies.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'fsw-l15-q3',
        prompt: 'In modern frontend component architecture, why is direct state mutation (e.g. state.items.push(new_item)) considered an anti-pattern?',
        options: [
          'It bypasses shallow reference equality checks, preventing the framework from detecting that state changed and causing missing UI re-renders',
          'Direct mutation throws a browser SyntaxError',
          'It increases network bandwidth',
          'It makes the browser reload the page',
        ],
        correctIndex: 0,
        explanation: 'Frontend frameworks use shallow reference checks (prev_state !== next_state) to decide when to re-render. Mutating in-place retains the same object reference, breaking UI reactivity.',
        lessonId: 'l10',
        moduleId: 'm4',
      },
      {
        id: 'fsw-l15-q4',
        prompt: 'What is an "optimistic UI update"?',
        options: [
          'Updating the client UI immediately assuming the server mutation will succeed, then rolling back if the network request fails',
          'Showing a spinning loading wheel on every button click',
          'Disabling all buttons after one click',
          'Always assuming user input is valid without validation',
        ],
        correctIndex: 0,
        explanation: 'Optimistic UI makes interfaces feel instantaneous by reflecting the expected outcome immediately, then reverting gracefully with an error toast if the backend call fails.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
      {
        id: 'fsw-l15-q5',
        prompt: 'What is the role of Content Security Policy (CSP) in web applications?',
        options: [
          'Restricting the sources (scripts, styles, images, iframes) from which the browser is allowed to load and execute resources, mitigating XSS',
          'Setting the font family across CSS files',
          'Encrypting the database backup file',
          'Compressing HTML files before sending',
        ],
        correctIndex: 0,
        explanation: 'CSP is an HTTP response header that restricts where browsers can fetch and execute resources, preventing inline malicious scripts injected by attackers from executing.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
    ],
  },
}

export function getFswQuiz(lessonId: string): FswQuizBank | undefined {
  return FSW_QUIZZES[lessonId]
}
