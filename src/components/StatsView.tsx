"use client";

import { computeStats, STATUSES, STATUS_LABELS } from "@/lib/applications";
import { useApplications } from "@/lib/useApplications";

export default function StatsView() {
  const { apps, loaded } = useApplications();
  if (!loaded) return <p className="muted">Loading…</p>;

  const stats = computeStats(apps);
  const max = Math.max(1, ...STATUSES.map((s) => stats.byStatus[s]));

  return (
    <>
      <div className="tiles">
        <div className="card tile">
          <span className="tile-value">{stats.total}</span>
          <span className="muted">Tracked</span>
        </div>
        <div className="card tile">
          <span className="tile-value">{stats.sent}</span>
          <span className="muted">Applications sent</span>
        </div>
        <div className="card tile">
          <span className="tile-value">{stats.responseRate}%</span>
          <span className="muted">Response rate</span>
        </div>
        <div className="card tile">
          <span className="tile-value">{stats.interviewRate}%</span>
          <span className="muted">Reached interview</span>
        </div>
      </div>

      <section className="card">
        <h2>Pipeline</h2>
        {stats.total === 0 ? (
          <p className="muted">Add some applications on the Board to see your pipeline.</p>
        ) : (
          <ul className="bars">
            {STATUSES.map((s) => (
              <li key={s}>
                <span className="bar-label">{STATUS_LABELS[s]}</span>
                <span className="bar-track">
                  <span
                    className={`bar-fill column-${s}`}
                    style={{ width: `${(stats.byStatus[s] / max) * 100}%` }}
                  />
                </span>
                <span className="bar-value">{stats.byStatus[s]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
