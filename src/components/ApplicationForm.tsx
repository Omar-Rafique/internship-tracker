"use client";

import { useState, type FormEvent } from "react";
import { STATUSES, STATUS_LABELS, validate, type NewApplication, type Status } from "@/lib/applications";

const EMPTY: NewApplication = { company: "", role: "", status: "wishlist", location: "", url: "", deadline: "", notes: "" };

export default function ApplicationForm({ onAdd }: { onAdd: (input: NewApplication) => void }) {
  const [form, setForm] = useState<NewApplication>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);

  const update = (field: keyof NewApplication) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problems = validate(form);
    setErrors(problems);
    if (problems.length) return;
    onAdd(form);
    setForm(EMPTY);
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>Add application</h2>
      <div className="grid">
        <label>
          Company *
          <input value={form.company} onChange={(e) => update("company")(e.target.value)} placeholder="Telerelation" />
        </label>
        <label>
          Role *
          <input value={form.role} onChange={(e) => update("role")(e.target.value)} placeholder="Software Engineer Intern" />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(e) => update("status")(e.target.value as Status)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input value={form.location} onChange={(e) => update("location")(e.target.value)} placeholder="Lahore / Remote" />
        </label>
        <label>
          Deadline
          <input type="date" value={form.deadline} onChange={(e) => update("deadline")(e.target.value)} />
        </label>
        <label>
          Job link
          <input type="url" value={form.url} onChange={(e) => update("url")(e.target.value)} placeholder="https://…" />
        </label>
      </div>
      <label>
        Notes
        <textarea rows={2} value={form.notes} onChange={(e) => update("notes")(e.target.value)} placeholder="Referral, interview prep, contacts…" />
      </label>
      {errors.length > 0 && (
        <ul className="errors" role="alert">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      <button type="submit" className="primary">Add</button>
    </form>
  );
}
