import { fail, ok, readJson } from "@/lib/api";
import { getSupabaseAdminClient } from "@/lib/supabase";

type PatchBody = { id: string; updates: Record<string, unknown> };

export async function POST(request: Request) {
  try {
    const payload = await readJson<Record<string, unknown>>(request);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("phases").insert(payload).select("*").single();
    if (error) throw error;
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await readJson<PatchBody>(request);
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("phases").update(updates).eq("id", id).select("*").single();
    if (error) throw error;
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return fail(new Error("Missing id"), 400);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("phases").delete().eq("id", id);
    if (error) throw error;
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
