import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, BookOpen, Check, CheckCircle2, LoaderCircle, Plus, Search, X } from "lucide-react";
import { createNoteRequest, fetchNoteRequests, fulfillNoteRequest } from "./api";
import type { AuthUser, NoteRequest, NoteRequestInput } from "./types";

export default function NoteRequests({
  user,
  onRequireAuth,
}: {
  user: AuthUser | null;
  onRequireAuth: () => void;
}) {
  const [requests, setRequests] = useState<NoteRequest[]>([]);
  const [status, setStatus] = useState<NoteRequest["status"]>("open");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState("");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setRequests(await fetchNoteRequests(status));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load note requests.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return requests;
    return requests.filter((request) =>
      [request.title, request.subject, request.courseCode, request.details, request.requesterName]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }, [requests, search]);

  const handleCreate = async (input: NoteRequestInput) => {
    setIsSubmitting(true);
    setActionError("");
    try {
      const request = await createNoteRequest(input);
      setStatus("open");
      setSearch("");
      setRequests((current) => [request, ...current]);
      setNotice("Your note request is now visible to everyone.");
      setIsFormOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not submit your note request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfill = async (request: NoteRequest) => {
    setPendingId(request._id);
    setActionError("");
    setNotice("");
    try {
      const updatedRequest = await fulfillNoteRequest(request._id);
      setRequests((current) => current.filter((item) => item._id !== updatedRequest._id));
      setNotice(`Marked "${request.title}" as fulfilled.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update this request.");
    } finally {
      setPendingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-panel">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300">
            <BookOpen className="h-3 w-3" /> Community learning
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[30px]">Public note requests</h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
            Looking for a course resource? Post a request for the community, then mark it fulfilled when you find it.
          </p>
        </div>
        <div className="hero-decoration" aria-hidden="true"><BookOpen className="h-20 w-20" /></div>
      </section>

      {actionError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-xs text-emerald-200">
          <Check className="h-4 w-4" /> {notice}
        </div>
      )}

      <section className="panel space-y-4" aria-label="Public note request controls">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="search-field flex-1">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="sr-only">Search note requests</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, subject, course code, or requester..." />
          </label>
          <button
            type="button"
            className="primary-button shrink-0"
            onClick={() => {
              setActionError("");
              if (!user) {
                onRequireAuth();
                return;
              }
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Request a note
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" aria-label="Request status">
            <button type="button" className={`filter-chip ${status === "open" ? "filter-chip-active" : ""}`} onClick={() => setStatus("open")} aria-pressed={status === "open"}>Open requests</button>
            <button type="button" className={`filter-chip ${status === "fulfilled" ? "filter-chip-active" : ""}`} onClick={() => setStatus("fulfilled")} aria-pressed={status === "fulfilled"}>Fulfilled</button>
          </div>
          <span className="text-[11px] text-slate-500">{filteredRequests.length} {filteredRequests.length === 1 ? "request" : "requests"}</span>
        </div>
      </section>

      {loadError ? (
        <div role="alert" className="rounded-2xl border border-rose-500/25 bg-rose-950/30 p-5 text-sm text-rose-200">
          <div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" />Couldn’t load note requests</div>
          <p className="mt-2 text-xs text-rose-200/75">{loadError}</p>
          <button type="button" className="mt-3 text-xs font-semibold underline" onClick={() => void loadRequests()}>Try again</button>
        </div>
      ) : isLoading ? (
        <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" />Loading note requests...</div>
      ) : filteredRequests.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRequests.map((request) => (
            <article key={request._id} className="note-card flex min-h-[230px] flex-col justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge badge-blue">{request.courseCode}</span>
                  <span className="badge badge-purple">{request.subject}</span>
                </div>
                <h2 className="mt-4 font-display text-base font-semibold text-white">{request.title}</h2>
                <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-400">{request.details}</p>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <p className="text-[10px] text-slate-500">
                  Requested by <span className="font-medium text-slate-300">{request.requesterId === user?.id ? "you" : request.requesterName}</span>
                  {" · "}{formatDate(request.createdAt)}
                </p>
                {request.status === "fulfilled" ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />Fulfilled</p>
                ) : request.requesterId === user?.id ? (
                  <button type="button" className="secondary-button mt-3" disabled={pendingId === request._id} onClick={() => void handleFulfill(request)}>
                    {pendingId === request._id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Mark as fulfilled
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-400"><BookOpen className="h-6 w-6" /></span>
          <h2 className="mt-4 font-display text-base font-semibold text-white">{search ? "No matching requests" : status === "open" ? "No open requests yet" : "No fulfilled requests yet"}</h2>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
            {search ? "Try another search term or course code." : "Use the request button to tell the community which notes would help you."}
          </p>
        </div>
      )}

      {isFormOpen && (
        <NoteRequestDialog
          isSaving={isSubmitting}
          onClose={() => setIsFormOpen(false)}
          onSubmit={(input) => void handleCreate(input)}
        />
      )}
    </div>
  );
}

function NoteRequestDialog({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: NoteRequestInput) => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({
      title: String(formData.get("title") || ""),
      subject: String(formData.get("subject") || ""),
      courseCode: String(formData.get("courseCode") || ""),
      details: String(formData.get("details") || ""),
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <section className="modal-panel max-w-xl" role="dialog" aria-modal="true" aria-labelledby="note-request-title">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="note-request-title" className="font-display text-lg font-semibold text-white">Request course notes</h2>
            <p className="mt-1 text-[11px] text-slate-400">Your request and account name will be visible publicly.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} disabled={isSaving} aria-label="Close note request form"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <RequestField label="What notes do you need?">
            <input name="title" required minLength={3} maxLength={120} placeholder="e.g. Lecture notes for week five" />
          </RequestField>
          <div className="grid gap-4 sm:grid-cols-2">
            <RequestField label="Course code">
              <input name="courseCode" required minLength={2} maxLength={30} placeholder="EC4307" />
            </RequestField>
            <RequestField label="Subject">
              <input name="subject" required minLength={2} maxLength={80} placeholder="Web application development" />
            </RequestField>
          </div>
          <RequestField label="Details">
            <textarea name="details" required minLength={10} maxLength={500} rows={4} placeholder="Mention topics, lecture weeks, or the type of notes you are looking for." />
          </RequestField>
          <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
            <button type="button" className="secondary-button px-4" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isSaving ? "Posting..." : "Post public request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function RequestField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
