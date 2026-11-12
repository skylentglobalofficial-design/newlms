export type CatalogCategory = "self-paced" | "expert-9-12m" | "degree-sem";

export interface CatalogLockItem {
  id: string;
  code: string;
  title: string;
  category: CatalogCategory;
  subtitle: string;
  duration: string;
  priceInr: number;
  originalPriceInr: number;
  discountLabel: string;
  locked: boolean;
  badge: string;
  semestersTotal?: number;
  unlockedSemesters?: number[];
  caseStudiesCount: number;
  labsCount: number;
}

const STORAGE_KEY = "skylent_catalog_locks_v124";

export const DEFAULT_CATALOG_ITEMS: CatalogLockItem[] = [
  {
    id: "data-analytics-pro",
    code: "SKY-DA-101",
    title: "Data Analytics: SQL, Python & BI Case Studies",
    category: "self-paced",
    subtitle: "Solve 6 enterprise analytics case studies inside browser SQL & Python labs",
    duration: "2 Months (8 Weeks)",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Launch Scholarship",
    locked: false,
    badge: "Case Study + Practical Labs",
    caseStudiesCount: 6,
    labsCount: 18
  },
  {
    id: "full-stack-web-pro",
    code: "SKY-FS-102",
    title: "Full-Stack TypeScript, React & Cloud Architecture",
    category: "self-paced",
    subtitle: "Build production APIs, auth flows & e-commerce system case studies",
    duration: "2 Months (8 Weeks)",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Launch Scholarship",
    locked: false,
    badge: "Case Study + Practical Labs",
    caseStudiesCount: 5,
    labsCount: 22
  },
  {
    id: "ai-engineering-pro",
    code: "SKY-AI-103",
    title: "Applied AI, RAG Pipelines & LLM Evaluation",
    category: "self-paced",
    subtitle: "Ship verifiable RAG workflows, prompt evaluations & enterprise AI case studies",
    duration: "2 Months (8 Weeks)",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Launch Scholarship",
    locked: false,
    badge: "AI Case Studies + Labs",
    caseStudiesCount: 6,
    labsCount: 16
  },
  {
    id: "product-growth-pro",
    code: "SKY-PM-104",
    title: "Product Strategy, PRDs & Growth Analytics",
    category: "self-paced",
    subtitle: "Write product teardowns, funnel models & executive PRDs on real tech products",
    duration: "2 Months (8 Weeks)",
    priceInr: 1499,
    originalPriceInr: 2999,
    discountLabel: "50% OFF Launch Scholarship",
    locked: false,
    badge: "8 Industry Case Studies",
    caseStudiesCount: 8,
    labsCount: 12
  },
  {
    id: "expert-ai-architect-12m",
    code: "SKY-EXP-901",
    title: "12-Month Executive Program in Applied AI & Cloud Systems",
    category: "expert-9-12m",
    subtitle: "Live classes with Top Industry Experts + 12 Capstones + Dedicated Job Assistance",
    duration: "12 Months (48 Weeks)",
    priceInr: 44999,
    originalPriceInr: 79999,
    discountLabel: "Early Cohort Merit Grant",
    locked: false,
    badge: "12M Industry Expert Program",
    caseStudiesCount: 12,
    labsCount: 45
  },
  {
    id: "expert-data-science-9m",
    code: "SKY-EXP-902",
    title: "9-Month Professional Program in Data Science & Decision Systems",
    category: "expert-9-12m",
    subtitle: "Led by Senior Data Scientists with live case study defense & placement support",
    duration: "9 Months (36 Weeks)",
    priceInr: 34999,
    originalPriceInr: 59999,
    discountLabel: "Early Cohort Merit Grant",
    locked: false,
    badge: "9M Industry Expert Program",
    caseStudiesCount: 10,
    labsCount: 36
  },
  {
    id: "expert-fullstack-cloud-9m",
    code: "SKY-EXP-903",
    title: "9-Month Professional Program in Distributed Full-Stack & DevOps",
    category: "expert-9-12m",
    subtitle: "System design, Kubernetes case studies & direct recruiter referrals",
    duration: "9 Months (36 Weeks)",
    priceInr: 34999,
    originalPriceInr: 59999,
    discountLabel: "Controlled by Admin",
    locked: true,
    badge: "9M Expert Track · Locked",
    caseStudiesCount: 10,
    labsCount: 40
  },
  {
    id: "degree-btech-cse-ai",
    code: "DEG-UG-01",
    title: "B.Tech in Computer Science & AI (Curriculum Skeleton)",
    category: "degree-sem",
    subtitle: "8-Semester credit-aligned curriculum with browser labs & case study evaluations",
    duration: "4 Years (8 Semesters)",
    priceInr: 11999,
    originalPriceInr: 19999,
    discountLabel: "Per-Semester Institutional Track",
    locked: false,
    badge: "UG Degree · Sem 1-2 Unlocked",
    semestersTotal: 8,
    unlockedSemesters: [1, 2],
    caseStudiesCount: 24,
    labsCount: 64
  },
  {
    id: "degree-bca-cloud-data",
    code: "DEG-UG-02",
    title: "BCA Honours in Data Analytics & Cloud Engineering",
    category: "degree-sem",
    subtitle: "6-Semester degree pathway with embedded Skylent workspace projects",
    duration: "3 Years (6 Semesters)",
    priceInr: 9999,
    originalPriceInr: 16999,
    discountLabel: "Per-Semester Institutional Track",
    locked: false,
    badge: "UG Degree · Sem 1-2 Unlocked",
    semestersTotal: 6,
    unlockedSemesters: [1, 2],
    caseStudiesCount: 18,
    labsCount: 48
  },
  {
    id: "degree-mca-applied-ai",
    code: "DEG-PG-01",
    title: "MCA in Applied AI & Enterprise Software Systems",
    category: "degree-sem",
    subtitle: "4-Semester postgraduate degree track with industry thesis & Career OS",
    duration: "2 Years (4 Semesters)",
    priceInr: 14999,
    originalPriceInr: 24999,
    discountLabel: "Academic Lock Enabled",
    locked: true,
    badge: "PG Degree · Locked",
    semestersTotal: 4,
    unlockedSemesters: [1],
    caseStudiesCount: 12,
    labsCount: 32
  },
  {
    id: "degree-mba-digital-product",
    code: "DEG-PG-02",
    title: "MBA in Digital Finance, Product Strategy & Analytics",
    category: "degree-sem",
    subtitle: "4-Semester executive management degree built on real business case studies",
    duration: "2 Years (4 Semesters)",
    priceInr: 14999,
    originalPriceInr: 24999,
    discountLabel: "Academic Lock Enabled",
    locked: true,
    badge: "PG Degree · Locked",
    semestersTotal: 4,
    unlockedSemesters: [1],
    caseStudiesCount: 16,
    labsCount: 20
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
