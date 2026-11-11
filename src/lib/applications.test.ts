import { describe, expect, it } from "vitest";
import {
  computeStats,
  createApplication,
  groupByStatus,
  isValidDate,
  search,
  setStatus,
  upcomingDeadlines,
  validate,
  type Application,
} from "./applications";

const TODAY = "2026-11-11";

function app(overrides: Partial<Application> = {}): Application {
  return {
    id: overrides.id ?? Math.random().toString(36),
    company: "Acme",
    role: "SE Intern",
    status: "applied",
    createdAt: "2026-11-01",
    updatedAt: "2026-11-01",
    ...overrides,
  };
}

describe("validation", () => {
  it("requires company and role", () => {
    expect(validate({ company: " ", role: "" })).toEqual(["Company is required", "Role is required"]);
  });

  it("rejects bad dates and links", () => {
    const errors = validate({ company: "A", role: "B", deadline: "2026-02-30", url: "ftp://x" });
    expect(errors).toContain("Deadline must be a valid date");
    expect(errors).toContain("Link must be a valid http(s) URL");
  });

  it("checks real calendar dates", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(isValidDate("2026-02-29")).toBe(false);
    expect(isValidDate("2026-1-5")).toBe(false);
  });
});

describe("createApplication", () => {
  it("trims fields, drops empty ones and defaults to wishlist", () => {
    const a = createApplication({ company: " Telerelation ", role: " SE Intern ", notes: "  " }, TODAY, "x");
    expect(a).toEqual({
      id: "x",
      company: "Telerelation",
      role: "SE Intern",
      status: "wishlist",
      location: undefined,
      url: undefined,
      deadline: undefined,
      notes: undefined,
      createdAt: TODAY,
      updatedAt: TODAY,
    });
  });

  it("throws with all validation errors", () => {
    expect(() => createApplication({ company: "", role: "" }, TODAY)).toThrow(
      "Company is required, Role is required",
    );
  });
});

describe("setStatus", () => {
  it("updates status and date without mutating", () => {
    const a = app();
    const b = setStatus(a, "interview", TODAY);
    expect(b.status).toBe("interview");
    expect(b.updatedAt).toBe(TODAY);
    expect(a.status).toBe("applied");
  });

  it("returns the same object when nothing changes", () => {
    const a = app();
    expect(setStatus(a, "applied", TODAY)).toBe(a);
  });
});

describe("groupByStatus", () => {
  it("puts every status in a column, newest first", () => {
    const old = app({ id: "1", updatedAt: "2026-11-01" });
    const recent = app({ id: "2", updatedAt: "2026-11-10" });
    const offer = app({ id: "3", status: "offer" });
    const groups = groupByStatus([old, offer, recent]);
    expect(groups.applied.map((a) => a.id)).toEqual(["2", "1"]);
    expect(groups.offer.map((a) => a.id)).toEqual(["3"]);
    expect(groups.wishlist).toEqual([]);
  });
});

describe("search", () => {
  const apps = [
    app({ id: "1", company: "Telerelation", location: "Lahore" }),
    app({ id: "2", company: "Systems Ltd", notes: "Referred by Ali" }),
  ];

  it("matches company, location and notes case-insensitively", () => {
    expect(search(apps, "lahore").map((a) => a.id)).toEqual(["1"]);
    expect(search(apps, "ALI").map((a) => a.id)).toEqual(["2"]);
  });

  it("returns everything for an empty query", () => {
    expect(search(apps, "  ")).toHaveLength(2);
  });
});

describe("upcomingDeadlines", () => {
  it("lists wishlist deadlines within the window, soonest first", () => {
    const apps = [
      app({ id: "late", status: "wishlist", deadline: "2026-11-30" }),
      app({ id: "soon", status: "wishlist", deadline: "2026-11-13" }),
      app({ id: "today", status: "wishlist", deadline: TODAY }),
      app({ id: "past", status: "wishlist", deadline: "2026-11-01" }),
      app({ id: "sent", status: "applied", deadline: "2026-11-12" }),
    ];
    const result = upcomingDeadlines(apps, TODAY, 7);
    expect(result.map((r) => [r.app.id, r.daysLeft])).toEqual([
      ["today", 0],
      ["soon", 2],
    ]);
  });
});

describe("computeStats", () => {
  it("computes response and interview rates over sent applications", () => {
    const apps = [
      app({ status: "wishlist" }),
      app({ status: "applied" }),
      app({ status: "applied" }),
      app({ status: "interview" }),
      app({ status: "rejected" }),
    ];
    const s = computeStats(apps);
    expect(s.total).toBe(5);
    expect(s.sent).toBe(4);
    expect(s.responseRate).toBe(50);
    expect(s.interviewRate).toBe(25);
    expect(s.byStatus.applied).toBe(2);
  });

  it("handles no sent applications", () => {
    expect(computeStats([app({ status: "wishlist" })]).responseRate).toBe(0);
  });
});
