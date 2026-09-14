export type DaQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  lessonId: string;
  moduleId: string;
};

export type DaQuizBank = {
  lessonId: string;
  title: string;
  questions: DaQuizQuestion[];
};

export const DA_QUIZZES: Record<string, DaQuizBank> = {
  l3: {
    lessonId: 'l3',
    title: 'Foundations check',
    questions: [
      {
        id: 'da-l3-q1',
        prompt:
          'A store lead asks: “Are we doing well?” Why is that a weak analytics question for northwind_sales.csv?',
        options: [
          'Because CSV files cannot answer commercial questions',
          'Because “well” is not a measurable outcome with a time window, metric, and segment',
          'Because you must use Python before you can define a question',
          'Because the file has no dates',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 2: a usable question names the metric, the period, and the cut. The sales file has dates; Python is not required for this course.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'da-l3-q2',
        prompt:
          'Which statement is a descriptive finding rather than a recommendation?',
        options: [
          'We should cut Furniture SKUs next quarter',
          'Online should get a bigger marketing budget',
          'Electronics is the largest share of valid net revenue in this extract',
          'Hire two more analysts',
        ],
        correctIndex: 2,
        explanation:
          'Descriptive analytics reports what the data shows. Telling the business what to cut or hire is a recommendation that must sit on top of the finding.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'da-l3-q3',
        prompt:
          'You see category values Electronics, Elec., and electronics in one column. What should you do first?',
        options: [
          'Delete every non-Electronics row',
          'Treat them as three unrelated categories in the final board pack',
          'Document that they are likely the same category and decide a mapping rule before you total revenue',
          'Replace the whole column with the mode of the file',
        ],
        correctIndex: 2,
        explanation:
          'Lesson 1: aliases are a quality issue. Mapping is allowed if you record the rule. Silent deletion or treating aliases as different businesses misstates mix.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'da-l3-q4',
        prompt:
          'Net revenue on a valid sales row in this course is defined as:',
        options: [
          'unit_price only',
          'units × unit_price, ignoring discount',
          'units × unit_price × (1 − discount_pct/100)',
          'discount_pct × units',
        ],
        correctIndex: 2,
        explanation:
          'The Northwind briefs use units × unit_price × (1 − discount_pct/100) on valid rows. Summing price alone double-counts nothing useful.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'da-l3-q5',
        prompt:
          'A stakeholder wants next month’s revenue as a single number from Jan–Jun history only. What is the honest move?',
        options: [
          'Refuse any forward-looking sentence',
          'Average the six months and call it a forecast with no caveat',
          'Report the historical trend and state that a forecast needs a method and extra assumptions this course does not train',
          'Multiply June by 12',
        ],
        correctIndex: 2,
        explanation:
          'This flagship trains descriptive and diagnostic work. You can show a trend; you should not ship an unstated forecast as a fact.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
    ],
  },
  l9: {
    lessonId: 'l9',
    title: 'SQL check',
    questions: [
      {
        id: 'da-l9-q1',
        prompt:
          'You need net revenue by category from a table named sales. Which query shape is appropriate?',
        options: [
          'SELECT category FROM sales',
          'SELECT category, SUM(units * unit_price * (1 - discount_pct/100.0)) FROM sales GROUP BY category',
          'SELECT * FROM sales WHERE category = SUM(unit_price)',
          'UPDATE sales SET category = "Electronics"',
        ],
        correctIndex: 1,
        explanation:
          'Aggregation needs GROUP BY the dimension and an aggregate of the measure. SELECT category alone lists values; UPDATE changes data.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'da-l9-q2',
        prompt:
          'WHERE returned = "no" filters rows before grouping. HAVING SUM(units) > 10 filters after grouping. When do you use HAVING?',
        options: [
          'To restrict to a single order_id',
          'When the condition is on an aggregate, such as categories with more than 10 units',
          'Whenever a column is text',
          'Instead of JOIN',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 7: WHERE filters rows; HAVING filters groups. Text vs number is not the rule.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'da-l9-q3',
        prompt:
          'Two rows share order_id NW-10013 on different dates. COUNT(*) and COUNT(DISTINCT order_id) will:',
        options: [
          'Always be equal',
          'Show COUNT(*) higher than COUNT(DISTINCT order_id) if duplicates exist',
          'Delete the duplicate automatically',
          'Only work in Excel',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 8: comparing COUNT(*) to COUNT(DISTINCT order_id) is how you detect duplicate keys.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'da-l9-q4',
        prompt:
          'You LEFT JOIN sales to a calendar table on order_date. A date with no orders should appear with:',
        options: [
          'A random category from another month',
          'NULL measures that you can COALESCE to 0 if you want a complete month axis',
          'The previous year’s revenue',
          'An INNER JOIN result, because LEFT JOIN drops unmatched left rows',
        ],
        correctIndex: 1,
        explanation:
          'LEFT JOIN keeps the left (calendar) row. INNER JOIN would drop days with no sales. COALESCE can turn NULL sums into 0.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'da-l9-q5',
        prompt:
          'Blank region should be labelled Unknown in a SQL region summary. Which expression is in the right family?',
        options: [
          'DELETE FROM sales WHERE region IS NULL',
          'CASE WHEN region IS NULL OR TRIM(region) = "" THEN "Unknown" ELSE region END',
          'WHERE region = "Unknown"',
          'JOIN sales ON region',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 8: keep the rows and label the missing dimension. Deleting them hides two Northwind orders.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
    ],
  },
  l15: {
    lessonId: 'l15',
    title: 'Final check',
    questions: [
      {
        id: 'da-l15-q1',
        prompt:
          'Your dashboard default view has eight charts and no title question. What fails first?',
        options: [
          'SQL JOIN syntax',
          'The stand-up test: a lead cannot see one decision in sixty seconds',
          'CSV encoding',
          'The need for a certificate',
        ],
        correctIndex: 1,
        explanation:
          'Lesson 10: one question, KPI, comparison, trend, filter. Decoration is a fail even if every chart is technically correct.',
        lessonId: 'l10',
        moduleId: 'm4',
      },
      {
        id: 'da-l15-q2',
        prompt:
          'Discount_pct is 10 on a row with units 2 and unit_price 50. Net revenue is:',
        options: [
          '100',
          '90',
          '10',
          '50',
        ],
        correctIndex: 1,
        explanation:
          '2 × 50 × (1 − 10/100) = 90. Forgetting the discount overstates revenue; using 10 as revenue understates it.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
      {
        id: 'da-l15-q3',
        prompt:
          'northwind_hr.csv has performance_rating N/A on one row and salary "46,250" on another. For an average salary by department you should:',
        options: [
          'Average the text as if Excel will guess correctly and ignore N/A',
          'Parse salary to a number, treat N/A as missing for rating metrics, and log both issues',
          'Delete the HR file',
          'Fill salary with the CEO rate',
        ],
        correctIndex: 1,
        explanation:
          'Capstone/HR lessons: coerce types, do not invent ratings, log issues. Deleting the file is not analysis.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
      {
        id: 'da-l15-q4',
        prompt:
          'A recommendation that passes the capstone bar looks like:',
        options: [
          '“Improve sales.”',
          '“Be more data-driven.”',
          '“Operations: investigate blank-region orders NW-10024 and NW-10089 before next month’s close; measure residual blank rate.”',
          '“Guarantee a data analyst job.”',
        ],
        correctIndex: 2,
        explanation:
          'Actionable recommendations name an owner, a concrete issue in this dataset, and a follow-up measure. Job guarantees are not part of this course.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
      {
        id: 'da-l15-q5',
        prompt:
          'You completed every lesson checkbox. What is still missing if you never submitted the capstone memo?',
        options: [
          'Nothing — progress percent is competence',
          'A demonstrated work sample: cleaning, analysis, visual, and recommendations on Northwind',
          'A Skylent certificate',
          'Automatic Career OS project creation',
        ],
        correctIndex: 1,
        explanation:
          'This product records progress separately from competence. Career OS does not auto-create projects. Certificates are not issued in this pilot.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
    ],
  },
};

export function getDaQuiz(lessonId: string): DaQuizBank | undefined {
  return DA_QUIZZES[lessonId];
}

/** Seed key: courseSlug:sourceId — never a bare l3 shared across courses. */
export function daQuizSeedKey(lessonId: string): string {
  return `data-analytics:${lessonId}`;
}
