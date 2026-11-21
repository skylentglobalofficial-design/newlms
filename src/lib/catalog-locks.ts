export type CatalogCategory = "skill-certificate" | "professional-career" | "degree-sem";

export interface CatalogLockItem {
  id: string;
  code: string;
  title: string;
  category: CatalogCategory;
  tierLabel: string;
  subtitle: string;
  duration: string;
  priceInr: number;
  originalPriceInr: number;
  discountLabel: string;
  locked: boolean;
  semestersTotal?: number;
  unlockedSemesters?: number[];
  caseStudiesCount: number;
}

const STORAGE_KEY = "skylent_catalog_locks_v126";

export const DEFAULT_CATALOG_ITEMS: CatalogLockItem[] = [
  {
    id: "data-analytics-pro",
    code: "CERT-101",
    title: "Data Analytics",
    category: "skill-certificate",
    tierLabel: "SKILL CERTIFICATE · ONLY SKILL DEVELOPMENT",
    subtitle: "Learn practical data analysis, spreadsheets, and structured business case studies at your own pace.",
    duration: "2 Months · Recorded + SkyLab",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Skill Scholarship",
    locked: false,
    caseStudiesCount: 6
  },
  {
    id: "product-management-cert",
    code: "CERT-102",
    title: "Product Management & Strategy",
    category: "skill-certificate",
    tierLabel: "SKILL CERTIFICATE · ONLY SKILL DEVELOPMENT",
    subtitle: "Learn user research, product workflows, and structured business problem-solving through real case studies.",
    duration: "2 Months · Recorded + SkyLab",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Skill Scholarship",
    locked: false,
    caseStudiesCount: 6
  },
  {
    id: "business-process-automation",
    code: "CERT-103",
    title: "Business Reporting & Process Automation",
    category: "skill-certificate",
    tierLabel: "SKILL CERTIFICATE · ONLY SKILL DEVELOPMENT",
    subtitle: "Build practical reporting templates, workflow automation, and operational case studies step by step.",
    duration: "2 Months · Recorded + SkyLab",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Skill Scholarship",
    locked: false,
    caseStudiesCount: 5
  },
  {
    id: "web-application-foundations",
    code: "CERT-104",
    title: "Modern Web Application Development",
    category: "skill-certificate",
    tierLabel: "SKILL CERTIFICATE · ONLY SKILL DEVELOPMENT",
    subtitle: "Master practical frontend and backend application building through guided project case studies.",
    duration: "2 Months · Recorded + SkyLab",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Skill Scholarship",
    locked: false,
    caseStudiesCount: 5
  },
  {
    id: "pro-job-assistance-analytics",
    code: "PRO-201",
    title: "Professional Program in Business & Data Analytics",
    category: "professional-career",
    tierLabel: "PROFESSIONAL PROGRAM · FULL JOB ASSISTANCE",
    subtitle: "Complete career program with 1-on-1 mentor case reviews, 3 live mock interviews, resume preparation & placement referrals.",
    duration: "4–6 Months · Mentor-Led + Job Assistance",
    priceInr: 11999,
    originalPriceInr: 19999,
    discountLabel: "40% OFF Career Track",
    locked: false,
    caseStudiesCount: 10
  },
  {
    id: "pro-job-assistance-product",
    code: "PRO-202",
    title: "Professional Program in Product & Growth Management",
    category: "professional-career",
    tierLabel: "PROFESSIONAL PROGRAM · FULL JOB ASSISTANCE",
    subtitle: "End-to-end product leadership program with live case defense, mentor feedback, mock interviews & placement support.",
    duration: "4–6 Months · Mentor-Led + Job Assistance",
    priceInr: 11999,
    originalPriceInr: 19999,
    discountLabel: "40% OFF Career Track",
    locked: false,
    caseStudiesCount: 10
  },
  {
    id: "expert-9m-analytics-decision",
    code: "EXP-901",
    title: "9-Month Executive Program with Top Industry Experts (Analytics & Strategy)",
    category: "professional-career",
    tierLabel: "9-MONTH INDUSTRY EXPERT PROGRAM",
    subtitle: "Taught live on weekends by senior industry practitioners with 12 real-world capstones & dedicated placement desk.",
    duration: "9 Months (36 Weeks) · Live Expert Cohort",
    priceInr: 34999,
    originalPriceInr: 59999,
    discountLabel: "Early Cohort Merit Grant",
    locked: false,
    caseStudiesCount: 12
  },
  {
    id: "expert-12m-enterprise-leadership",
    code: "EXP-902",
    title: "12-Month Master Program with Top Industry Experts (Enterprise Systems & Product)",
    category: "professional-career",
    tierLabel: "12-MONTH INDUSTRY EXPERT PROGRAM",
    subtitle: "4-Quarter intensive executive program with industry leaders, live portfolio defense & priority placement support.",
    duration: "12 Months (48 Weeks) · Cohort Controlled",
    priceInr: 44999,
    originalPriceInr: 79999,
    discountLabel: "Admissions Controlled by Admin",
    locked: true,
    caseStudiesCount: 14
  },
  {
    id: "degree-ug-management",
    code: "DEG-UG-01",
    title: "Undergraduate Degree Pathway in Business & Management (BBA)",
    category: "degree-sem",
    tierLabel: "UG DEGREE PATHWAY · 6 SEMESTERS",
    subtitle: "Structured 6-semester undergraduate curriculum integrated with practical business case studies.",
    duration: "3 Years (6 Semesters)",
    priceInr: 9999,
    originalPriceInr: 16999,
    discountLabel: "Per-Semester Institutional Fee",
    locked: false,
    semestersTotal: 6,
    unlockedSemesters: [1, 2],
    caseStudiesCount: 18
  },
  {
    id: "degree-ug-technology",
    code: "DEG-UG-02",
    title: "Undergraduate Degree Pathway in Computing & Technology (B.Tech / BCA)",
    category: "degree-sem",
    tierLabel: "UG DEGREE PATHWAY · 8 SEMESTERS",
    subtitle: "Structured 8-semester undergraduate curriculum with practical workspace labs and semester-wise evaluation.",
    duration: "4 Years (8 Semesters)",
    priceInr: 11999,
    originalPriceInr: 19999,
    discountLabel: "Per-Semester Institutional Fee",
    locked: false,
    semestersTotal: 8,
    unlockedSemesters: [1, 2],
    caseStudiesCount: 24
  },
  {
    id: "degree-pg-management",
    code: "DEG-PG-01",
    title: "Postgraduate Degree Pathway in Management & Strategy (MBA)",
    category: "degree-sem",
    tierLabel: "PG DEGREE PATHWAY · 4 SEMESTERS",
    subtitle: "4-semester postgraduate management curriculum built around real Indian and global corporate case studies.",
    duration: "2 Years (4 Semesters)",
    priceInr: 14999,
    originalPriceInr: 24999,
    discountLabel: "Academic Lock Active",
    locked: true,
    semestersTotal: 4,
    unlockedSemesters: [1],
    caseStudiesCount: 16
  }
];

export function readCatalogLocks(): CatalogLockItem[] {
  if (typeof window === "undefined") return DEFAULT_CATALOG_ITEMS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATALOG_ITEMS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return DEFAULT_CATALOG_ITEMS;
}

export function writeCatalogLocks(items: CatalogLockItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("skylent:catalog-locks-updated"));
  } catch {}
}

export function toggleCatalogItemLock(id: string): CatalogLockItem[] {
  const next = readCatalogLocks().map((item) =>
    item.id === id ? { ...item, locked: !item.locked } : item
  );
  writeCatalogLocks(next);
  return next;
}

export function toggleDegreeSemesterLock(id: string, sem: number): CatalogLockItem[] {
  const next = readCatalogLocks().map((item) => {
    if (item.id !== id) return item;
    const cur = item.unlockedSemesters ?? [1];
    const updated = cur.includes(sem)
      ? cur.filter((s) => s !== sem)
      : [...cur, sem].sort((a, b) => a - b);
    return { ...item, unlockedSemesters: updated, locked: updated.length === 0 };
  });
  writeCatalogLocks(next);
  return next;
}
