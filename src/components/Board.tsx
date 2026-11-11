"use client";

import { useMemo, useState } from "react";
import {
  groupByStatus,
  search,
  STATUSES,
  STATUS_LABELS,
  upcomingDeadlines,
  type Application,
  type Status,
} from "@/lib/applications";
import { todayISO, useApplications } from "@/lib/useApplications";
import ApplicationForm from "./ApplicationForm";

function Card({
  app,
  onMove,
  onRemove,
}: {
  app: Application;
  onMove: (status: Status) => void;
  onRemove: () => void;
}) {
  return (
    <article className="app-card">
      <div className="app-card-head">
        <strong>{app.company}</strong>
        <button className="icon" aria-label={`Delete ${app.company} application`} onClick={onRemove}>
          ✕
        </button>
      </div>
      <div>{app.role}</div>
      {app.location && <div className="muted">📍 {app.location}</div>}
      {app.deadline && <div className="muted">⏰ Deadline {app.deadline}</div>}
      {app.notes && <p className="notes">{app.notes}</p>}
      <div className="app-card-foot">
        <select
          aria-label={`Status for ${app.company}`}
          value={app.status}
          onChange={(e) => onMove(e.target.value as Status)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {app.url && (
          <a href={app.url} target="_blank" rel="noreferrer">
            Job post ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function Board() {
  const { apps, loaded, add, move, remove } = useApplications();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => search(apps, query), [apps, query]);
  const columns = useMemo(() => groupByStatus(visible), [visible]);
  const deadlines = useMemo(() => upcomingDeadlines(apps, todayISO()), [apps]);

  return (
    <>
      <ApplicationForm onAdd={add} />

      {deadlines.length > 0 && (
        <section className="card warning" aria-label="Upcoming deadlines">
          <strong>Deadlines this week:</strong>{" "}
          {deadlines
            .map(({ app, daysLeft }) =>
              `${app.company} (${daysLeft === 0 ? "today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`})`,
            )
            .join(", ")}
        </section>
      )}

      <div className="toolbar">
        <input
          type="search"
          aria-label="Search applications"
          placeholder="Search company, role, location, notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="muted">
          {loaded ? `${visible.length} of ${apps.length} applications` : "Loading…"}
        </span>
      </div>

      <div className="board">
        {STATUSES.map((status) => (
          <section key={status} className={`column column-${status}`} aria-label={STATUS_LABELS[status]}>
            <h3>
              {STATUS_LABELS[status]} <span className="count">{columns[status].length}</span>
            </h3>
            {columns[status].map((app) => (
              <Card
                key={app.id}
                app={app}
                onMove={(s) => move(app.id, s)}
                onRemove={() => remove(app.id)}
              />
            ))}
            {loaded && columns[status].length === 0 && <p className="empty">Nothing here yet</p>}
          </section>
        ))}
      </div>
    </>
  );
}
