import { fail, ok } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    await ensureSeeded();
    const supabase = getSupabaseAdminClient();

    const [programs, phases, books, sessions, evaluations, reflections] = await Promise.all([
      supabase.from("programs").select("*").order("start_date", { ascending: true }),
      supabase.from("phases").select("*").order("position", { ascending: true }),
      supabase.from("books").select("*").order("position", { ascending: true }),
      supabase.from("sessions").select("*").order("session_date", { ascending: false }),
      supabase.from("evaluations").select("*").order("evaluation_date", { ascending: false }),
      supabase.from("reflections").select("*").order("reflection_date", { ascending: false }),
    ]);

    const errors = [programs.error, phases.error, books.error, sessions.error, evaluations.error, reflections.error]
      .filter(Boolean)
      .map((error) => error?.message)
      .join("; ");

    if (errors) {
      throw new Error(errors);
    }

    return ok({
      programs: programs.data ?? [],
      phases: phases.data ?? [],
      books: books.data ?? [],
      sessions: sessions.data ?? [],
      evaluations: evaluations.data ?? [],
      reflections: reflections.data ?? [],
    });
  } catch (error) {
    return fail(error);
  }
}
