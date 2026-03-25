import { seedPhases, seedProgram } from "@/lib/seed-plan";
import { getSupabaseAdminClient } from "@/lib/supabase";

let seeded = false;

export async function ensureSeeded() {
  if (seeded) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { data: existingProgram, error: readError } = await supabase
    .from("programs")
    .select("id")
    .eq("title", seedProgram.title)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existingProgram?.id) {
    seeded = true;
    return;
  }

  const { data: program, error: programError } = await supabase
    .from("programs")
    .insert(seedProgram)
    .select("id")
    .single();

  if (programError || !program) {
    throw programError ?? new Error("Unable to create seed program");
  }

  for (const phase of seedPhases) {
    const { data: phaseRow, error: phaseError } = await supabase
      .from("phases")
      .insert({
        program_id: program.id,
        position: phase.position,
        name: phase.name,
        objective: phase.objective,
        start_date: phase.start_date,
        end_date: phase.end_date,
      })
      .select("id")
      .single();

    if (phaseError || !phaseRow) {
      throw phaseError ?? new Error("Unable to create seed phase");
    }

    if (phase.books.length === 0) {
      continue;
    }

    const rows = phase.books.map((book) => ({
      phase_id: phaseRow.id,
      position: book.position,
      title: book.title,
      author: book.author,
      start_date: book.start_date,
      end_date: book.end_date,
      style: book.style,
      intensity: book.intensity,
      difficulty: book.difficulty,
      status: "planned",
    }));

    const { error: bookError } = await supabase.from("books").insert(rows);
    if (bookError) {
      throw bookError;
    }
  }

  seeded = true;
}
