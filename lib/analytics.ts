import {
  AdjustmentSuggestion,
  AppWarning,
  Book,
  DashboardMetrics,
  DataBundle,
  Evaluation,
  Phase,
} from "@/lib/types";

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function getCurrentWeekMinutes(bundle: DataBundle) {
  const today = new Date();
  const day = today.getDay() || 7;
  const start = new Date(today);
  start.setDate(today.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);

  return bundle.sessions
    .filter((session) => toDate(session.session_date) >= start)
    .reduce((acc, session) => acc + session.minutes, 0);
}

function objectiveScore(evaluations: Evaluation[]) {
  if (evaluations.length === 0) {
    return 0;
  }

  const scores = evaluations.map((item) =>
    average([item.comprehension, item.retention, item.application, item.satisfaction]),
  );

  return Math.round((average(scores) / 5) * 100);
}

function resolveActivePhase(phases: Phase[]) {
  const today = new Date();

  return (
    phases.find((phase) => {
      const start = toDate(phase.start_date);
      const end = toDate(phase.end_date);
      return start <= today && today <= end;
    })?.name ?? null
  );
}

function getDelayedBooks(books: Book[]) {
  const today = new Date();
  return books.filter((book) => book.status !== "completed" && toDate(book.end_date) < today);
}

export function buildMetrics(bundle: DataBundle): DashboardMetrics {
  const totalBooks = bundle.books.length;
  const completedBooks = bundle.books.filter((book) => book.status === "completed").length;
  const totalSessions = bundle.sessions.length;
  const totalMinutes = bundle.sessions.reduce((acc, session) => acc + session.minutes, 0);
  const totalPages = bundle.sessions.reduce((acc, session) => acc + session.pages, 0);
  const weeklyMinuteGoal = 420;
  const weeklyMinutesActual = getCurrentWeekMinutes(bundle);
  const completionRate = totalBooks === 0 ? 0 : Math.round((completedBooks / totalBooks) * 100);
  const weeklyCompliance = Math.min(100, Math.round((weeklyMinutesActual / weeklyMinuteGoal) * 100));

  const delayedBooks = getDelayedBooks(bundle.books).length;
  const objectiveCompliance = objectiveScore(bundle.evaluations);

  return {
    completionRate,
    totalBooks,
    completedBooks,
    totalSessions,
    totalMinutes,
    totalPages,
    weeklyMinuteGoal,
    weeklyMinutesActual,
    weeklyCompliance,
    objectiveCompliance,
    delayedBooks,
    activePhaseName: resolveActivePhase(bundle.phases),
  };
}

export function buildWarnings(bundle: DataBundle): AppWarning[] {
  const warnings: AppWarning[] = [];
  const delayed = getDelayedBooks(bundle.books);

  if (delayed.length > 0) {
    warnings.push({
      id: "delayed-books",
      severity: "warn",
      title: "Delayed books",
      message: `${delayed.length} books are past end date and still not completed.`,
    });
  }

  const outOfProgramRange = bundle.books.filter((book) => {
    const program = bundle.programs[0];
    if (!program) return false;
    return toDate(book.end_date) > toDate(program.end_date);
  });

  if (outOfProgramRange.length > 0) {
    warnings.push({
      id: "out-of-range",
      severity: "info",
      title: "Books outside program window",
      message: `${outOfProgramRange.length} books end after the program end date (allowed in flexible mode).`,
    });
  }

  const weeklyMinutes = getCurrentWeekMinutes(bundle);
  if (weeklyMinutes < 210) {
    warnings.push({
      id: "low-weekly-load",
      severity: "warn",
      title: "Weekly rhythm is low",
      message: "You are under 50% of weekly minute target.",
    });
  }

  return warnings;
}

export function buildAdjustments(bundle: DataBundle): AdjustmentSuggestion[] {
  const delayed = getDelayedBooks(bundle.books);
  const suggestions: AdjustmentSuggestion[] = [];

  if (delayed.length > 0) {
    suggestions.push({
      title: "Reschedule delayed items",
      detail: "Move delayed books forward by 7-14 days while preserving reading order.",
    });
  }

  if (bundle.sessions.length < 3) {
    suggestions.push({
      title: "Increase reading consistency",
      detail: "Add at least 3 sessions per week to stabilize progress and predictions.",
    });
  }

  if (bundle.evaluations.length === 0) {
    suggestions.push({
      title: "Start objective tracking",
      detail: "Create first evaluation to unlock objective compliance scoring.",
    });
  }

  return suggestions;
}
