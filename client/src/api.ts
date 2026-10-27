import type { ApiFailure, NoteFilters, NoteInput, StudyNote } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as ApiFailure | null;
    throw new Error(failure?.error || `Request failed (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function fetchNotes(filters: NoteFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.subject !== "All") params.set("subject", filters.subject);
  params.set("sortBy", filters.sortBy);
  const result = await request<{ data: StudyNote[] }>(`/api/notes?${params.toString()}`, { signal });
  return result.data;
}

export async function createNote(input: NoteInput) {
  const result = await request<{ data: StudyNote }>("/api/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function updateNote(id: string, input: NoteInput) {
  const result = await request<{ data: StudyNote }>(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return result.data;
}

export function deleteNote(id: string) {
  return request<void>(`/api/notes/${id}`, { method: "DELETE" });
}
