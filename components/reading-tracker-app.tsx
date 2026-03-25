"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildAdjustments, buildMetrics, buildWarnings } from "@/lib/analytics";
import { labels, resolveLocale } from "@/lib/i18n";
import { DataBundle, Locale, TargetType } from "@/lib/types";

const emptyData: DataBundle = {
  programs: [],
  phases: [],
  books: [],
  sessions: [],
  evaluations: [],
  reflections: [],
};

async function request(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Request failed");
  }

  return response.json();
}

type CrudSectionProps = {
  title: string;
  rows: Record<string, unknown>[];
  fields: string[];
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function CrudSection({ title, rows, fields, onCreate, onUpdate, onDelete }: CrudSectionProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      const value = draft[field] ?? "";
      if (field === "tags") {
        payload[field] = value ? value.split(",").map((item) => item.trim()) : [];
      } else if (["position", "minutes", "pages", "intensity", "difficulty", "comprehension", "retention", "application", "satisfaction"].includes(field)) {
        payload[field] = value ? Number(value) : null;
      } else {
        payload[field] = value === "" ? null : value;
      }
    });

    if (editingId) {
      await onUpdate(editingId, payload);
      setEditingId(null);
      setDraft({});
      return;
    }

    await onCreate(payload);
    setDraft({});
  }

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <form className="mt-3 grid gap-2 md:grid-cols-3" onSubmit={submit}>
        {fields.map((field) => (
          <input
            key={field}
            value={draft[field] ?? ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, [field]: event.target.value }))}
            placeholder={field}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        ))}
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
        >
          {editingId ? "Update" : "Create"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setDraft({});
            }}
            className="rounded-lg border border-slate-400 px-3 py-2 text-sm"
          >
            Cancel
          </button>
        )}
      </form>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2 pr-4">id</th>
              {fields.map((field) => (
                <th className="py-2 pr-4" key={field}>
                  {field}
                </th>
              ))}
              <th className="py-2">actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-slate-100 align-top" key={String(row.id)}>
                <td className="py-2 pr-4 text-xs text-slate-500">{String(row.id).slice(0, 8)}</td>
                {fields.map((field) => (
                  <td className="py-2 pr-4" key={`${String(row.id)}-${field}`}>
                    {Array.isArray(row[field]) ? row[field]?.join(",") : String(row[field] ?? "")}
                  </td>
                ))}
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded border border-slate-400 px-2 py-1 text-xs"
                      onClick={() => {
                        const next: Record<string, string> = {};
                        fields.forEach((field) => {
                          const value = row[field];
                          if (Array.isArray(value)) {
                            next[field] = value.join(",");
                            return;
                          }
                          next[field] = value == null ? "" : String(value);
                        });
                        setDraft(next);
                        setEditingId(String(row.id));
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border border-rose-500 px-2 py-1 text-xs text-rose-700"
                      onClick={() => onDelete(String(row.id))}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ReadingTrackerApp() {
  const [locale, setLocale] = useState<Locale>("es");
  const [data, setData] = useState<DataBundle>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = labels[locale];

  async function loadData() {
    try {
      setLoading(true);
      const payload = (await request("/api/data")) as DataBundle;
      setData(payload);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("reading-locale");
    setLocale(resolveLocale(stored));
    void loadData();
  }, []);

  function changeLocale(nextLocale: Locale) {
    localStorage.setItem("reading-locale", nextLocale);
    setLocale(nextLocale);
  }

  async function create(resource: string, payload: Record<string, unknown>) {
    await request(`/api/${resource}`, { method: "POST", body: JSON.stringify(payload) });
    await loadData();
  }

  async function update(resource: string, id: string, payload: Record<string, unknown>) {
    await request(`/api/${resource}`, { method: "PATCH", body: JSON.stringify({ id, updates: payload }) });
    await loadData();
  }

  async function remove(resource: string, id: string) {
    await request(`/api/${resource}?id=${id}`, { method: "DELETE" });
    await loadData();
  }

  const metrics = useMemo(() => buildMetrics(data), [data]);
  const warnings = useMemo(() => buildWarnings(data), [data]);
  const adjustments = useMemo(() => buildAdjustments(data), [data]);

  const chartData = [
    { name: "Planned", value: metrics.weeklyMinuteGoal },
    { name: "Actual", value: metrics.weeklyMinutesActual },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#e2f0ff,transparent_30%),radial-gradient(circle_at_80%_0%,#fef3d6,transparent_30%),#f8fafc] px-4 py-6 md:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t.appTitle}</h1>
              <p className="mt-1 text-slate-600">{t.appSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">{t.language}</span>
              <select
                value={locale}
                onChange={(event) => changeLocale(resolveLocale(event.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
              <button
                type="button"
                onClick={() => void loadData()}
                className="rounded-lg border border-slate-400 px-3 py-2 text-sm"
              >
                {t.refresh}
              </button>
            </div>
          </div>
        </header>

        {error && <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-800">{error}</p>}
        {loading && <p className="text-slate-700">{t.loading}</p>}

        {!loading && (
          <>
            <section className="grid gap-3 md:grid-cols-4">
              <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">{t.progress}</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.completionRate}%</p>
                <p className="text-xs text-slate-600">
                  {metrics.completedBooks}/{metrics.totalBooks} {t.completedBooks}
                </p>
              </article>
              <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">{t.compliance}</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.weeklyCompliance}%</p>
                <p className="text-xs text-slate-600">{t.plannedVsActual}</p>
              </article>
              <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">{t.delayedBooks}</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.delayedBooks}</p>
                <p className="text-xs text-slate-600">{t.activePhase}: {metrics.activePhaseName ?? "-"}</p>
              </article>
              <article className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">{t.objectiveScore}</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{metrics.objectiveCompliance}%</p>
                <p className="text-xs text-slate-600">{t.totalMinutes}: {metrics.totalMinutes}</p>
              </article>
            </section>

            <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">{t.dashboard}</h2>
                <p className="mb-3 text-sm text-slate-600">{t.plannedVsActual}</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <article className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                  <h3 className="text-sm font-semibold text-amber-900">{t.warnings}</h3>
                  <ul className="mt-2 space-y-2 text-sm text-amber-900">
                    {warnings.length === 0 && <li>OK</li>}
                    {warnings.map((warning) => (
                      <li key={warning.id}>
                        <strong>{warning.title}: </strong>
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                </article>
                <article className="rounded-2xl border border-sky-300 bg-sky-50 p-4">
                  <h3 className="text-sm font-semibold text-sky-900">{t.adjustments}</h3>
                  <ul className="mt-2 space-y-2 text-sm text-sky-900">
                    {adjustments.length === 0 && <li>OK</li>}
                    {adjustments.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}: </strong>
                        {item.detail}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">{t.crud}</h2>

              <CrudSection
                title={t.programs}
                rows={data.programs as unknown as Record<string, unknown>[]}
                fields={["title", "description", "start_date", "end_date"]}
                onCreate={(payload) => create("programs", payload)}
                onUpdate={(id, payload) => update("programs", id, payload)}
                onDelete={(id) => remove("programs", id)}
              />

              <CrudSection
                title={t.phases}
                rows={data.phases as unknown as Record<string, unknown>[]}
                fields={["program_id", "position", "name", "objective", "start_date", "end_date"]}
                onCreate={(payload) => create("phases", payload)}
                onUpdate={(id, payload) => update("phases", id, payload)}
                onDelete={(id) => remove("phases", id)}
              />

              <CrudSection
                title={t.books}
                rows={data.books as unknown as Record<string, unknown>[]}
                fields={[
                  "phase_id",
                  "position",
                  "title",
                  "author",
                  "style",
                  "intensity",
                  "difficulty",
                  "start_date",
                  "end_date",
                  "status",
                ]}
                onCreate={(payload) => create("books", payload)}
                onUpdate={(id, payload) => update("books", id, payload)}
                onDelete={(id) => remove("books", id)}
              />

              <CrudSection
                title={t.sessions}
                rows={data.sessions as unknown as Record<string, unknown>[]}
                fields={["book_id", "session_date", "minutes", "pages", "notes"]}
                onCreate={(payload) => create("sessions", payload)}
                onUpdate={(id, payload) => update("sessions", id, payload)}
                onDelete={(id) => remove("sessions", id)}
              />

              <CrudSection
                title={t.evaluations}
                rows={data.evaluations as unknown as Record<string, unknown>[]}
                fields={[
                  "target_type",
                  "target_id",
                  "evaluation_date",
                  "comprehension",
                  "retention",
                  "application",
                  "satisfaction",
                  "notes",
                ]}
                onCreate={(payload) =>
                  create("evaluations", {
                    ...payload,
                    target_type: (payload.target_type as TargetType | null) ?? "book",
                  })
                }
                onUpdate={(id, payload) => update("evaluations", id, payload)}
                onDelete={(id) => remove("evaluations", id)}
              />

              <CrudSection
                title={t.reflections}
                rows={data.reflections as unknown as Record<string, unknown>[]}
                fields={["target_type", "target_id", "reflection_date", "content", "tags"]}
                onCreate={(payload) =>
                  create("reflections", {
                    ...payload,
                    target_type: (payload.target_type as TargetType | null) ?? "book",
                  })
                }
                onUpdate={(id, payload) => update("reflections", id, payload)}
                onDelete={(id) => remove("reflections", id)}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
