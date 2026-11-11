// Pure logic for tracking job / internship applications.
// No React or browser APIs here, so everything is easy to unit test.

export const STATUSES = ["wishlist", "applied", "interview", "offer", "rejected"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  location?: string;
  url?: string;
  /** Application deadline, YYYY-MM-DD. */
  deadline?: string;
  notes?: string;
  createdAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
}

export type NewApplication = Pick<Application, "company" | "role"> &
  Partial<Pick<Application, "status" | "location" | "url" | "deadline" | "notes">>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Validate input and return a list of human-readable problems (empty = valid). */
export function validate(input: NewApplication): string[] {
  const errors: string[] = [];
  if (!input.company?.trim()) errors.push("Company is required");
  if (!input.role?.trim()) errors.push("Role is required");
  if (input.status && !STATUSES.includes(input.status)) errors.push("Unknown status");
  if (input.deadline && !isValidDate(input.deadline)) errors.push("Deadline must be a valid date");
  if (input.url) {
    try {
      const u = new URL(input.url);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    } catch {
      errors.push("Link must be a valid http(s) URL");
    }
  }
  return errors;
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function createApplication(input: NewApplication, today: string, id?: string): Application {
  const errors = validate(input);
  if (errors.length) throw new Error(errors.join(", "));
  return {
    id: id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    company: input.company.trim(),
    role: input.role.trim(),
    status: input.status ?? "wishlist",
    location: clean(input.location),
    url: clean(input.url),
    deadline: clean(input.deadline),
    notes: clean(input.notes),
    createdAt: today,
    updatedAt: today,
  };
}

export function setStatus(app: Application, status: Status, today: string): Application {
  return app.status === status ? app : { ...app, status, updatedAt: today };
}

/** Group applications by status, newest first inside each column. */
export function groupByStatus(apps: Application[]): Record<Status, Application[]> {
  const groups = Object.fromEntries(STATUSES.map((s) => [s, [] as Application[]])) as Record<
    Status,
    Application[]
  >;
  for (const app of apps) groups[app.status].push(app);
  for (const s of STATUSES) {
    groups[s].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.company.localeCompare(b.company));
  }
  return groups;
}

/** Case-insensitive search across company, role, location and notes. */
export function search(apps: Application[], query: string): Application[] {
  const q = query.trim().toLowerCase();
  if (!q) return apps;
  return apps.filter((a) =>
    [a.company, a.role, a.location, a.notes].some((field) => field?.toLowerCase().includes(q)),
  );
}

function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Wishlist items with a deadline in the next `withinDays` days (incl. today), soonest first. */
export function upcomingDeadlines(apps: Application[], today: string, withinDays = 7) {
  return apps
    .filter((a) => a.status === "wishlist" && a.deadline)
    .map((a) => ({ app: a, daysLeft: daysBetween(today, a.deadline!) }))
    .filter(({ daysLeft }) => daysLeft >= 0 && daysLeft <= withinDays)
    .sort((x, y) => x.daysLeft - y.daysLeft);
}

export interface Stats {
  total: number;
  byStatus: Record<Status, number>;
  /** Applications actually sent (everything except wishlist). */
  sent: number;
  /** % of sent applications that got any reply (interview, offer or rejection). */
  responseRate: number;
  /** % of sent applications that reached interview or offer. */
  interviewRate: number;
}

export function computeStats(apps: Application[]): Stats {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const a of apps) byStatus[a.status]++;
  const sent = apps.length - byStatus.wishlist;
  const replied = byStatus.interview + byStatus.offer + byStatus.rejected;
  const positive = byStatus.interview + byStatus.offer;
  const pct = (n: number) => (sent === 0 ? 0 : Math.round((n / sent) * 100));
  return {
    total: apps.length,
    byStatus,
    sent,
    responseRate: pct(replied),
    interviewRate: pct(positive),
  };
}
