import type { ApiFailure, AuthUser, NoteFilters, NoteInput, NoteRequest, NoteRequestInput, StudyGroup, StudyGroupDetails, StudyGroupInput, StudyGroupMessage, StudyGroupTask, StudyNote } from "./types";

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (typeof init?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as ApiFailure | null;
    throw new ApiRequestError(failure?.error || `Request failed (${response.status}).`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function fetchCurrentUser() {
  try {
    const result = await request<{ data: AuthUser }>("/api/auth/me");
    return result.data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null;
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const result = await request<{ data: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return result.data;
}

export async function signUp(name: string, email: string, password: string) {
  const result = await request<{ data: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return result.data;
}

export function signOut() {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export async function uploadNoteFile(file: File) {
  const result = await request<{
    data: {
      url: string;
      fileName: string;
      fileSize: string;
      fileType: NoteInput["fileType"];
    };
  }>("/api/uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
    },
    body: file,
  });
  return result.data;
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

export async function recordNoteDownload(id: string) {
  const result = await request<{ data: { downloadsCount: number } }>(`/api/notes/${id}/download`, {
    method: "POST",
  });
  return result.data;
}

export function deleteNote(id: string) {
  return request<void>(`/api/notes/${id}`, { method: "DELETE" });
}

export async function fetchStudyGroups() {
  const result = await request<{ data: StudyGroup[] }>("/api/study-groups");
  return result.data;
}

export async function createStudyGroup(input: StudyGroupInput) {
  const result = await request<{ data: StudyGroup }>("/api/study-groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function joinStudyGroup(id: string) {
  const result = await request<{ data: StudyGroup }>(`/api/study-groups/${id}/join`, {
    method: "POST",
  });
  return result.data;
}

export async function leaveStudyGroup(id: string) {
  const result = await request<{ data: StudyGroup }>(`/api/study-groups/${id}/membership`, {
    method: "DELETE",
  });
  return result.data;
}

export async function fetchStudyGroupDetails(id: string) {
  const result = await request<{ data: StudyGroupDetails }>(`/api/study-groups/${id}`);
  return result.data;
}

export async function fetchStudyGroupMessages(id: string) {
  const result = await request<{ data: StudyGroupMessage[] }>(`/api/study-groups/${id}/messages`);
  return result.data;
}

export async function postStudyGroupMessage(id: string, body: string) {
  const result = await request<{ data: StudyGroupMessage }>(`/api/study-groups/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return result.data;
}

export async function fetchStudyGroupTasks(id: string) {
  const result = await request<{ data: StudyGroupTask[] }>(`/api/study-groups/${id}/tasks`);
  return result.data;
}

export async function createStudyGroupTask(id: string, title: string, dueDate: string) {
  const result = await request<{ data: StudyGroupTask }>(`/api/study-groups/${id}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title, dueDate }),
  });
  return result.data;
}

export async function updateStudyGroupTaskStatus(id: string, taskId: string, isComplete: boolean) {
  const result = await request<{ data: StudyGroupTask }>(`/api/study-groups/${id}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ isComplete }),
  });
  return result.data;
}

export async function fetchNoteRequests(status: NoteRequest["status"] = "open") {
  const result = await request<{ data: NoteRequest[] }>(`/api/note-requests?status=${status}`);
  return result.data;
}

export async function createNoteRequest(input: NoteRequestInput) {
  const result = await request<{ data: NoteRequest }>("/api/note-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function fulfillNoteRequest(id: string) {
  const result = await request<{ data: NoteRequest }>(`/api/note-requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "fulfilled" }),
  });
  return result.data;
}
