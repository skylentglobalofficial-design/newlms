import type { AssignmentBrief } from '../data-analytics/assignments'

const pasteNote =
  'This LMS records a text submission only. Paste your note or memo. There is no file upload, no design tool, no coding runtime, and no faculty grading in this pilot.'

const caseHref = '/content/product-management/harbor-desk-case.md'
const caseName = 'harbor-desk-case.md'

export const PM_ASSIGNMENTS: Record<string, AssignmentBrief> = {
  l6: {
    id: 'l6',
    title: 'Research note — Harbor Desk interviews',
    scenario:
      'You are the first product person asked to look at Harbor Desk. HQ wants “Gmail for stores.” You have case notes from Priya, Arun, Meena, and Karthik, plus a weekend exception log. You do not have a prototype, a revenue file, or permission to run a lab.',
    objective:
      'Write a research note that a sceptical engineer could read: who you heard, what they do today, labelled quotes, jobs, and what you still do not know.',
    caseHref,
    caseName,
    instructions: [
      'Read harbor-desk-case.md. Do not invent interviews that are not in the file.',
      'List the four people and the job each is trying to do on a weekend or Monday morning.',
      'Copy at least three labelled quotes. Mark each as observation (what they do or said) rather than your inference.',
      'Name the current channels (WhatsApp, email, walkie, nowhere) and give one example ID from the exception log for each where you can.',
      'Write one paragraph on Priya’s job that does not mention “inbox.”',
      'List at least three unknowns. Include the missing SKU frequency gap.',
      'Do not recommend a product yet. This brief is evidence, not the bet.',
    ],
    requiredOutput: [
      'People and jobs table.',
      'At least three labelled quotes.',
      'Channel map with exception IDs.',
      'A gap list (unknowns).',
      'A one-paragraph synthesis that stops before the recommendation.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Quotes are labelled',
        weight: '25%',
        description: 'You distinguish what someone said from what you inferred.',
      },
      {
        criterion: 'Jobs are not features',
        weight: '25%',
        description: 'Priya’s job is not “use Harbor Desk.”',
      },
      {
        criterion: 'The log is used',
        weight: '25%',
        description: 'At least two exception IDs appear. You do not invent counts the file does not have.',
      },
      {
        criterion: 'Gaps are explicit',
        weight: '25%',
        description: 'You name what the case cannot support, including SKU frequency and revenue.',
      },
    ],
    commonMistakes: [
      'Recommending Gmail in this assignment.',
      'Treating Arun’s “requirements” as user evidence.',
      'Inventing a revenue impact.',
      'Interviewing a fictional CEO who is not in the notes.',
    ],
    extension:
      'Optional: write four questions you would ask in a second interview with Meena. Do not claim you asked them.',
    careerEvidence: {
      learning: 'User evidence from a fictional operations case',
      artifact: 'Research note with quotes, jobs, and unknowns',
      skill: 'Product discovery, interview synthesis',
      evidence: 'A reviewer can see what you heard versus what you inferred',
    },
  },
  l12: {
    id: 'l12',
    title: 'Priority memo — Harbor Desk',
    scenario:
      'Karthik has six weeks and will not build Gmail. Arun still wants Gmail. You must send a one-page memo that chooses one bet and names what you are not building. You may use your research note.',
    objective:
      'Recommend one Harbor Desk bet under the stated constraint. Score alternatives. State non-goals.',
    caseHref,
    caseName,
    instructions: [
      'Restate the constraint in one sentence: 2 engineers, 6 weeks, no warehouse/ERP.',
      'Name the opportunity (the job/pain), not the brand.',
      'Score at least three options: (A) weekend exception queue, (B) full shared inbox, (C) process-only rota/checklist. Use reach, evidence confidence, and effort. You may use a simple High/Med/Low.',
      'Pick one. If you pick C, say what software you are not starting.',
      'Write three non-goals. “Do not replace the warehouse system” must be one of them unless you are explicitly rejecting the given constraint — which this brief does not allow.',
      'Write kill criteria: what would make you stop the bet after four weeks.',
      'Do not add SQL, dashboards, or AI.',
    ],
    requiredOutput: [
      'Constraint restated.',
      'Opportunity in one sentence.',
      'Score table of three options.',
      'The bet and three non-goals.',
      'Four-week kill criteria.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Opportunity ≠ solution',
        weight: '25%',
        description: 'The opportunity is a job or pain, not “Harbor Desk.”',
      },
      {
        criterion: 'Constraint is respected',
        weight: '25%',
        description: 'The bet fits two engineers and six weeks.',
      },
      {
        criterion: 'Alternatives are real',
        weight: '25%',
        description: 'You did not straw-man the options you did not pick.',
      },
      {
        criterion: 'Non-goals are specific',
        weight: '25%',
        description: 'A reader knows what will not ship.',
      },
    ],
    commonMistakes: [
      'Picking all three options as a “phase plan” so you never cut.',
      'Using Northwind revenue to justify the bet.',
      'Promising mobile offline and SLA timers in v1.',
      'Calling process-only “not product work” as if that makes it invalid.',
    ],
    extension: 'Optional: write the one sentence you would send Arun if he rejects the cut.',
    careerEvidence: {
      learning: 'Prioritisation under a stated constraint',
      artifact: 'Priority memo with one bet and named non-goals',
      skill: 'Prioritisation, problem framing',
      evidence: 'A one-page decision a lead could accept or reject',
    },
  },
  l14: {
    id: 'l14',
    title: 'Capstone — Harbor Desk product case',
    scenario:
      'A hiring manager (or a sceptical engineering lead) will read this without you in the room. They have never seen Northwind. They want to know what you would build, why, and how you would know in four weeks.',
    objective:
      'Produce an end-to-end product case: evidence, frame, one bet, thin spec, and a four-week check.',
    caseHref,
    caseName,
    instructions: [
      'Open with the user and the job, not the product name.',
      'Cite evidence from the case (quotes and exception IDs). Do not invent interviews.',
      'State the problem in a testable form.',
      'State the constraint and the bet. Include non-goals.',
      'Write a thin spec: trigger, happy path, one edge case, acceptance check, out of scope.',
      'Write the four-week check: what you would count, compared with the July weekend log.',
      'Add a limitations paragraph: no prototype test, no revenue proof, SKU frequency unknown.',
      'Do not claim a job, a certificate, or a placement. Do not add this to Career OS automatically — if you want it there, add the learner project yourself after you finish the project workspace.',
    ],
    requiredOutput: [
      'Evidence summary with quotes/IDs.',
      'Testable problem statement.',
      'Bet + non-goals.',
      'Thin spec.',
      'Four-week check and limitations.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Evidence before recommendation',
        weight: '20%',
        description: 'Quotes and log IDs appear before the bet.',
      },
      {
        criterion: 'Frame is testable',
        weight: '20%',
        description: 'Someone could disagree with the problem using next month’s exceptions.',
      },
      {
        criterion: 'Spec matches the bet',
        weight: '20%',
        description: 'The spec does not secretly rebuild Gmail.',
      },
      {
        criterion: 'Review check is countable',
        weight: '20%',
        description: 'Four weeks has a number, not a vibe.',
      },
      {
        criterion: 'Limitations are honest',
        weight: '20%',
        description: 'You do not claim revenue, hiring, or unrun prototype tests.',
      },
    ],
    commonMistakes: [
      'Pasting a generic PRD template with empty sections.',
      'Importing Data Analytics charts or SQL.',
      'Promising AI triage.',
      'Treating progress percent as the work sample.',
    ],
    extension: 'Optional: list two prototype tasks you would run if you had another week. Do not claim you ran them.',
    careerEvidence: {
      learning: 'End-to-end product case',
      artifact: 'Product-case memo + thin spec + four-week check',
      skill: 'Product discovery, problem framing, prioritisation, business communication',
      evidence: 'A work sample a reviewer can read without a walkthrough',
    },
  },
}

export function getPmAssignment(lessonId: string): AssignmentBrief | undefined {
  return PM_ASSIGNMENTS[lessonId]
}
