import type { Metadata } from "next";
import StatsView from "@/components/StatsView";

export const metadata: Metadata = { title: "Stats · Internship Tracker" };

export default function StatsPage() {
  return (
    <>
      <h1>Stats</h1>
      <p className="muted">How your job search is going.</p>
      <StatsView />
    </>
  );
}
