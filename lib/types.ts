export type Locale = "es" | "en";

export type TargetType = "program" | "phase" | "book";

export type Program = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type Phase = {
  id: string;
  program_id: string;
  position: number;
  name: string;
  objective: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type BookStatus = "planned" | "in_progress" | "completed";

export type Book = {
  id: string;
  phase_id: string;
  position: number;
  title: string;
  author: string;
  style: string | null;
  intensity: number | null;
  difficulty: number | null;
  start_date: string;
  end_date: string;
  status: BookStatus;
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string;
  book_id: string;
  session_date: string;
  minutes: number;
  pages: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Evaluation = {
  id: string;
  target_type: TargetType;
  target_id: string;
  evaluation_date: string;
  comprehension: number;
  retention: number;
  application: number;
  satisfaction: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Reflection = {
  id: string;
  target_type: TargetType;
  target_id: string;
  reflection_date: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type DataBundle = {
  programs: Program[];
  phases: Phase[];
  books: Book[];
  sessions: Session[];
  evaluations: Evaluation[];
  reflections: Reflection[];
};

export type AppWarning = {
  id: string;
  severity: "info" | "warn";
  title: string;
  message: string;
};

export type DashboardMetrics = {
  completionRate: number;
  totalBooks: number;
  completedBooks: number;
  totalSessions: number;
  totalMinutes: number;
  totalPages: number;
  weeklyMinuteGoal: number;
  weeklyMinutesActual: number;
  weeklyCompliance: number;
  objectiveCompliance: number;
  delayedBooks: number;
  activePhaseName: string | null;
};

export type AdjustmentSuggestion = {
  title: string;
  detail: string;
};
