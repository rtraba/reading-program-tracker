import { NextResponse } from "next/server";

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function ok(data: unknown) {
  return NextResponse.json(data);
}

export function fail(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status });
}
