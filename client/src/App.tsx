import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowDownWideNarrow,
  BookOpen,
  Check,
  ClipboardList,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  KeyRound,
  Layers3,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tags,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { createNote, deleteNote, fetchCurrentUser, fetchNotes, recordNoteDownload, signIn, signOut, signUp, updateNote, uploadNoteFile } from "./api";
import NoteRequests from "./NoteRequests";
import StudyGroups from "./StudyGroups";
import type { AuthUser, NoteInput, NoteFilters, StudyNote } from "./types";

const courseSubjects = [
  "EC4307 Web Application Development",
  "EC5202 Digital System Design with HDL",
  "EC5203 Machine Learning",
  "EC5205 Operating System and Network Programming",
  "EC5207 DevOps Engineering",
  "EC5301 Control Systems Design",
  "EC5406 Software Project",
  "Labs_25th Batch",
  "Software Testing & Quality Assurance",
];
const emptyNote: NoteInput = {
  title: "",
  description: "",
  subject: "",
  courseCode: "",
  university: "University of Ruhuna, Faculty of Engineering",
  tags: [],
  fileUrl: "",
  fileName: "",
  fileSize: "",
  fileType: "pdf",
  previewText: "",
};

function friendlyDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function tagsFromInput(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export default function App() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [filters, setFilters] = useState<NoteFilters>({
    search: "",
    subject: "All",
    sortBy: "recent",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editorNote, setEditorNote] = useState<StudyNote | null | "new">(null);
  const [detailNote, setDetailNote] = useState<StudyNote | null>(null);
  const [recentlyViewedSubject, setRecentlyViewedSubject] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"notes" | "groups" | "requests">("notes");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "register" | null>(null);
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (active) setAuthError(error instanceof Error ? error.message : "Could not check your sign-in status.");
      });
    return () => { active = false; };
  }, []);

  const loadNotes = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await fetchNotes(filters, signal);
      setNotes(result);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setLoadError(error instanceof Error ? error.message : "Could not load study notes.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    void loadNotes(controller.signal);
    return () => controller.abort();
  }, [loadNotes]);

  const noteCountLabel = useMemo(
    () => `${notes.length} ${notes.length === 1 ? "note" : "notes"}`,
    [notes.length],
  );
  const visibleSubjects = useMemo(
    () => ["All", ...(recentlyViewedSubject ? [recentlyViewedSubject] : []), ...courseSubjects.filter((subject) => subject !== recentlyViewedSubject)],
    [recentlyViewedSubject],
  );

  const openCreateForm = () => {
    setActionError("");
    if (!user) {
      setAuthError("");
      setAuthDialogMode("register");
      return;
    }
    setEditorNote("new");
  };

  const openEditForm = (note: StudyNote) => {
    if (note.authorId !== user?.id) return;
    setActionError("");
    setEditorNote(note);
    setDetailNote(null);
  };

  const handleAuthSubmit = async (name: string, email: string, password: string) => {
    setIsAuthSubmitting(true);
    setAuthError("");
    try {
      const signedInUser = authDialogMode === "register"
        ? await signUp(name, email, password)
        : await signIn(email, password);
      setUser(signedInUser);
      setAuthDialogMode(null);
      setNotice(`Welcome, ${signedInUser.name}!`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in. Please try again.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setActionError("");
    try {
      await signOut();
      setUser(null);
      setNotice("You have signed out.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    }
  };

  const handleSave = async (input: NoteInput) => {
    setPendingId(editorNote === "new" ? "new" : editorNote?._id || "");
    setActionError("");
    try {
      if (editorNote === "new") {
        await createNote(input);
        setNotice("Study note created and saved to MongoDB.");
      } else if (editorNote) {
        await updateNote(editorNote._id, input);
        setNotice("Study note updated.");
      }
      setEditorNote(null);
      await loadNotes();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not save this note.");
      throw error;
    } finally {
      setPendingId("");
    }
  };

  const handleDelete = async (note: StudyNote) => {
    const confirmed = window.confirm(`Delete "${note.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setPendingId(note._id);
    setActionError("");
    try {
      await deleteNote(note._id);
      setNotice("Study note deleted.");
      if (detailNote?._id === note._id) setDetailNote(null);
      await loadNotes();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete this note.");
    } finally {
      setPendingId("");
    }
  };

  const handleDownload = async (note: StudyNote, event: MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      event.preventDefault();
      setAuthError("");
      setAuthDialogMode("login");
      return;
    }

    setActionError("");
    try {
      const { downloadsCount } = await recordNoteDownload(note._id);
      setNotes((current) => current.map((item) => item._id === note._id ? { ...item, downloadsCount } : item));
      setDetailNote((current) => current?._id === note._id ? { ...current, downloadsCount } : current);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not record this download.");
    }
  };

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#080d18]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label={isMobileSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileSidebarOpen}
            aria-controls="study-notes-sidebar"
            onClick={() => setIsMobileSidebarOpen((open) => !open)}
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <a href="#" className="flex items-center gap-3" aria-label="StudyMate Hub home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-950/50">
              <GraduationCap className="h-6 w-6 text-white" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold tracking-tight text-white">StudyMate <span className="text-sky-400">Hub</span></span>
              <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">NOTES & PEER LEARNING</span>
            </span>
          </a>
          <div className="header-marquee" aria-label="Better Way To Improve Your Knowledge">
            <span>LEARN TODAY, LEAD TOMORROW</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden max-w-[150px] truncate text-xs text-slate-300 md:block" title={user.email}>{user.name}</span>
                <button type="button" onClick={() => void handleSignOut()} className="secondary-button" aria-label="Sign out">
                  <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setAuthError(""); setAuthDialogMode("login"); }} className="secondary-button">
                <LogIn className="h-3.5 w-3.5" />Sign in
              </button>
            )}
            <button type="button" onClick={openCreateForm} className="primary-button">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Share a note</span>
              <span className="sm:hidden">New note</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {isMobileSidebarOpen && (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-[72px] z-30 bg-slate-950/70 lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        <aside
          id="study-notes-sidebar"
          aria-label="Main navigation"
          className={`${
            isMobileSidebarOpen
              ? "fixed bottom-0 left-0 top-[72px] z-40 block w-[min(85vw,300px)] overflow-y-auto border-r border-slate-800 bg-[#080d18] px-4 py-8 shadow-2xl"
              : "hidden"
          } shrink-0 lg:sticky lg:bottom-auto lg:left-auto lg:top-[72px] lg:z-20 lg:block lg:h-[calc(100vh-72px)] lg:w-[250px] lg:overflow-y-auto lg:border-r lg:border-slate-800/70 lg:bg-transparent lg:px-4 lg:py-8 lg:shadow-none`}
        >
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Workspace</p>
          <button
            type="button"
            className={`nav-item w-full text-left ${activeSection === "notes" ? "nav-item-active" : ""}`}
            onClick={() => { setActiveSection("notes"); setIsMobileSidebarOpen(false); }}
            aria-current={activeSection === "notes" ? "page" : undefined}
          >
            <BookOpen className="h-4 w-4" />
            Note-Sharing Hub
            <span className="ml-auto rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] text-sky-300">{notes.length}</span>
          </button>
          <button
            type="button"
            className={`nav-item w-full text-left ${activeSection === "groups" ? "nav-item-active" : ""}`}
            onClick={() => { setActiveSection("groups"); setIsMobileSidebarOpen(false); }}
            aria-current={activeSection === "groups" ? "page" : undefined}
          >
            <Layers3 className="h-4 w-4" />
            Study Groups
            <span className="ml-auto rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] text-sky-300">Open</span>
          </button>
          <button
            type="button"
            className={`nav-item w-full text-left ${activeSection === "requests" ? "nav-item-active" : ""}`}
            onClick={() => { setActiveSection("requests"); setIsMobileSidebarOpen(false); }}
            aria-current={activeSection === "requests" ? "page" : undefined}
          >
            <ClipboardList className="h-4 w-4" />
            Note Requests
            <span className="ml-auto rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] text-sky-300">Public</span>
          </button>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Library overview
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-sky-300" /> Total notes</span>
                <span className="font-mono font-semibold text-slate-200">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-2"><Tags className="h-3.5 w-3.5 text-violet-300" /> Subjects</span>
                <span className="font-mono font-semibold text-slate-200">{new Set(notes.map((note) => note.subject)).size}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-sky-500/15 bg-gradient-to-br from-sky-950/45 to-indigo-950/30 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-white"><GraduationCap className="h-4 w-4 text-sky-300" /> Learn together</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">Share a helpful course resource and make revision easier for your classmates.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
          <div className="mx-auto max-w-[1120px] space-y-6">
            {activeSection === "groups" ? (
              <StudyGroups
                user={user}
                onRequireAuth={() => {
                  setAuthError("");
                  setAuthDialogMode("login");
                }}
              />
            ) : activeSection === "requests" ? (
              <NoteRequests
                user={user}
                onRequireAuth={() => {
                  setAuthError("");
                  setAuthDialogMode("register");
                }}
              />
            ) : (
              <>
            <section className="hero-panel">
              <div className="relative z-10 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300">
                  <Sparkles className="h-3 w-3" /> Your course library
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[30px]">A better way to study together.</h1>
                <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">Discover class notes, find a useful explanation, or share what helped you learn. Your changes are saved to the local MongoDB database.</p>
              </div>
              <div className="hero-decoration" aria-hidden="true"><BookOpen className="h-20 w-20" /></div>
            </section>

            {actionError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {actionError}
              </div>
            )}
            {authError && !authDialogMode && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {authError}
              </div>
            )}
            {notice && (
              <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-xs text-emerald-200">
                <Check className="h-4 w-4" /> {notice}
              </div>
            )}

            <section className="panel space-y-4" aria-label="Study note filters">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="search-field flex-1">
                  <Search className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="sr-only">Search notes</span>
                  <input
                    value={filters.search}
                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                    placeholder="Search by title, subject, course code, or tag..."
                  />
                  {filters.search && <button type="button" onClick={() => setFilters((current) => ({ ...current, search: "" }))} aria-label="Clear search"><X className="h-4 w-4" /></button>}
                </label>
                <label className="select-field">
                  <ArrowDownWideNarrow className="h-4 w-4 shrink-0 text-sky-300" />
                  <span className="sr-only">Sort notes</span>
                  <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value as NoteFilters["sortBy"] }))}>
                    <option value="recent">Recently added</option>
                    <option value="popular">Most popular</option>
                    <option value="downloads">Most downloaded</option>
                    <option value="title">Title A-Z</option>
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </label>
              </div>

              <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
                <span className="mr-1 shrink-0 text-[11px] font-medium text-slate-500">Subject</span>
                {visibleSubjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, subject }))}
                    className={`filter-chip ${filters.subject === subject ? "filter-chip-active" : ""}`}
                    aria-pressed={filters.subject === subject}
                  >
                    {subject}
                  </button>
                ))}
                <span className="ml-auto hidden shrink-0 text-[11px] text-slate-500 sm:inline">{noteCountLabel}</span>
              </div>
            </section>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">Study notes</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Browse and manage shared learning resources</p>
              </div>
              <button type="button" onClick={openCreateForm} className="secondary-button hidden sm:inline-flex"><Plus className="h-3.5 w-3.5" /> Add note</button>
            </div>

            {loadError && (
              <div role="alert" className="rounded-2xl border border-rose-500/25 bg-rose-950/30 p-5 text-sm text-rose-200">
                <div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" /> Couldn’t load the notes</div>
                <p className="mt-2 text-xs text-rose-200/75">{loadError}</p>
                <button type="button" className="mt-3 text-xs font-semibold underline" onClick={() => void loadNotes()}>Try again</button>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50" />)}
              </div>
            ) : notes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {notes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    canManage={note.authorId === user?.id}
                    isPending={pendingId === note._id}
                    onPreview={() => {
                      setRecentlyViewedSubject(note.subject);
                      setDetailNote(note);
                    }}
                    onEdit={() => openEditForm(note)}
                    onDelete={() => void handleDelete(note)}
                    onDownload={(event) => void handleDownload(note, event)}
                  />
                ))}
              </div>
            ) : !loadError ? (
              <div className="empty-state">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-400"><BookOpen className="h-6 w-6" /></span>
                <h3 className="mt-4 font-display text-base font-semibold text-white">No notes match those filters</h3>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">Try another search or subject, or share the first note for this course.</p>
                <button type="button" onClick={openCreateForm} className="primary-button mt-5"><Plus className="h-4 w-4" /> Share a note</button>
              </div>
            ) : null}

            <footer className="border-t border-slate-800/70 py-5 text-center text-[10px] text-slate-600">
              StudyMate Hub · MERN mini project · Notes are stored in MongoDB
            </footer>
              </>
            )}
          </div>
        </main>
      </div>

      {editorNote && (
        <NoteEditor
          key={editorNote === "new" ? "new-note" : editorNote._id}
          note={editorNote === "new" ? null : editorNote}
          isSaving={Boolean(pendingId)}
          onClose={() => setEditorNote(null)}
          onSave={handleSave}
        />
      )}
      {detailNote && (
        <NoteDetails
          note={detailNote}
          canManage={detailNote.authorId === user?.id}
          onClose={() => setDetailNote(null)}
          onEdit={() => openEditForm(detailNote)}
          onDelete={() => void handleDelete(detailNote)}
          onDownload={(event) => void handleDownload(detailNote, event)}
          isDeleting={pendingId === detailNote._id}
        />
      )}
      {authDialogMode && (
        <AuthDialog
          key={authDialogMode}
          mode={authDialogMode}
          error={authError}
          isSubmitting={isAuthSubmitting}
          onClose={() => setAuthDialogMode(null)}
          onModeChange={(mode) => { setAuthError(""); setAuthDialogMode(mode); }}
          onSubmit={handleAuthSubmit}
        />
      )}
    </div>
  );
}

function NoteCard({
  note,
  canManage,
  isPending,
  onPreview,
  onEdit,
  onDelete,
  onDownload,
}: {
  note: StudyNote;
  canManage: boolean;
  isPending: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <article className="note-card group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-blue">{note.courseCode || "GENERAL"}</span>
          <span className="badge badge-purple">{note.subject}</span>
        </div>
        <span className="rounded-md border border-slate-700/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">{note.fileType}</span>
      </div>
      <button type="button" onClick={onPreview} className="mt-4 block text-left">
        <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-slate-100 transition-colors group-hover:text-sky-200">{note.title}</h3>
        <p className="mt-2 line-clamp-3 min-h-[3.4em] text-[11px] leading-relaxed text-slate-400">{note.description}</p>
      </button>
      <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">
        {(note.tags || []).slice(0, 3).map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}
        {(note.tags || []).length > 3 && <span className="tag-chip">+{note.tags.length - 3}</span>}
      </div>
      <div className="mt-4 border-t border-slate-800/90 pt-3">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
          <span className="flex min-w-0 items-center gap-1.5 truncate"><GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-500" />{note.university}</span>
          <span className="flex shrink-0 items-center gap-1"><Clock3 className="h-3 w-3" />{friendlyDate(note.createdAt)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="max-w-[130px] truncate text-[10px] font-medium text-slate-300">{note.authorName}</span>
          {note.fileUrl ? (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noreferrer"
              download={note.fileName || undefined}
              onClick={onDownload}
              aria-label={`Download notes: ${note.title}`}
              title="Download notes"
              className="flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-sky-300"
            >
              <Download className="h-3 w-3 text-sky-400" />{note.downloadsCount}
            </a>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-slate-500" title="No file attached">
              <Download className="h-3 w-3 text-slate-600" />{note.downloadsCount}
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onPreview} className="secondary-button flex-1">View details</button>
          {canManage && (
            <>
              <button type="button" onClick={onEdit} className="icon-button" aria-label={`Edit ${note.title}`}><Pencil className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={onDelete} disabled={isPending} className="icon-button icon-button-danger" aria-label={`Delete ${note.title}`}>
                {isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function NoteEditor({
  note,
  isSaving,
  onClose,
  onSave,
}: {
  note: StudyNote | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: NoteInput) => Promise<void>;
}) {
  const [form, setForm] = useState<NoteInput>(() => note ? {
    title: note.title,
    description: note.description,
    subject: note.subject,
    courseCode: note.courseCode,
    university: note.university,
    tags: note.tags,
    fileUrl: note.fileUrl,
    fileName: note.fileName,
    fileSize: note.fileSize,
    fileType: note.fileType,
    previewText: note.previewText,
  } : emptyNote);
  const [tagsValue, setTagsValue] = useState(form.tags.join(", "));
  const [formError, setFormError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof NoteInput>(key: K, value: NoteInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Choose a file that is 10 MB or smaller.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFile = await uploadNoteFile(file);
      setForm((current) => ({
        ...current,
        fileUrl: uploadedFile.url,
        fileName: uploadedFile.fileName,
        fileSize: uploadedFile.fileSize,
        fileType: uploadedFile.fileType,
      }));
      setUploadSuccess(`File uploaded successfully: ${uploadedFile.fileName}`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The file could not be uploaded.");
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    try {
      await onSave({ ...form, tags: tagsFromInput(tagsValue) });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Please check the fields and try again.");
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="note-editor-title">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="note-editor-title" className="font-display text-lg font-semibold text-white">{note ? "Edit study note" : "Share a study note"}</h2>
            <p className="mt-1 text-[11px] text-slate-400">Required fields are marked. Updates are saved in MongoDB.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={(event) => void submit(event)} className="max-h-[75vh] space-y-4 overflow-y-auto p-5 sm:p-6">
          {formError && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{formError}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Note title" required>
              <input required minLength={3} maxLength={120} value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="e.g. Graph algorithms revision guide" />
            </Field>
            <Field label="Course code" required>
              <input required minLength={2} maxLength={30} value={form.courseCode} onChange={(event) => setField("courseCode", event.target.value)} placeholder="CS161" />
            </Field>
            <Field label="Subject" required>
              <input required minLength={2} maxLength={80} list="course-subjects" value={form.subject} onChange={(event) => setField("subject", event.target.value)} placeholder="Choose or enter a subject" />
              <datalist id="course-subjects">
                {courseSubjects.map((subject) => <option key={subject} value={subject} />)}
              </datalist>
            </Field>
            <Field label="University" required>
              <input required minLength={2} maxLength={120} value={form.university} onChange={(event) => setField("university", event.target.value)} placeholder="University of Ruhuna, Faculty of Engineering" />
            </Field>
          </div>
          <Field label="Description" required>
            <textarea required minLength={10} maxLength={1000} rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="What topics does this resource cover?" />
          </Field>
          <Field label="Tags" hint="Separate tags with commas; use up to 10.">
            <input value={tagsValue} onChange={(event) => setTagsValue(event.target.value)} placeholder="Algorithms, Graphs, Exam Prep" />
          </Field>
          <Field label="Upload a file" hint="PDF, Word (.doc/.docx), or text file. Maximum size: 10 MB.">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => void handleFileChange(event)}
              disabled={isUploading || isSaving}
              className="sr-only"
            />
            <button
              type="button"
              className="secondary-button w-fit"
              onClick={() => {
                if (!fileInputRef.current) return;
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }}
              disabled={isUploading || isSaving}
            >
              {isUploading ? "Uploading..." : uploadSuccess ? "Change file" : "Choose file"}
            </button>
            {isUploading && <span role="status" className="text-xs text-sky-300">Uploading file...</span>}
            {uploadError && <span role="alert" className="text-xs text-rose-300">{uploadError}</span>}
            {uploadSuccess && <span role="status" className="flex items-center gap-1 text-xs text-emerald-300"><Check className="h-3.5 w-3.5 shrink-0" />{uploadSuccess}</span>}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="File name">
              <input maxLength={180} value={form.fileName} onChange={(event) => setField("fileName", event.target.value)} placeholder="CS161_notes.pdf" />
            </Field>
            <Field label="File type">
              <select value={form.fileType} onChange={(event) => setField("fileType", event.target.value as NoteInput["fileType"])}>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="text">Text</option>
              </select>
            </Field>
            <Field label="File size">
              <input maxLength={30} value={form.fileSize} onChange={(event) => setField("fileSize", event.target.value)} placeholder="2.4 MB" />
            </Field>
            <Field label="File URL" hint="Optional public http(s) link, or upload a file above.">
              <input type="text" maxLength={500} value={form.fileUrl} onChange={(event) => setField("fileUrl", event.target.value)} placeholder="https://example.com/notes.pdf" />
            </Field>
          </div>
          <Field label="Preview text" hint="Optional short extract shown in note details.">
            <textarea maxLength={10000} rows={4} value={form.previewText} onChange={(event) => setField("previewText", event.target.value)} placeholder="Add a short excerpt to help students preview the note..." />
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
            <button type="button" className="secondary-button px-4" onClick={onClose} disabled={isSaving || isUploading}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isSaving || isUploading}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isSaving ? "Saving..." : note ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}{required && <span className="ml-1 text-rose-300">*</span>}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function NoteDetails({ note, canManage, onClose, onEdit, onDelete, onDownload, isDeleting }: {
  note: StudyNote;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: (event: MouseEvent<HTMLAnchorElement>) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="note-detail-title">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5"><span className="badge badge-blue">{note.courseCode || "GENERAL"}</span><span className="badge badge-purple">{note.subject}</span></div>
            <h2 id="note-detail-title" className="mt-2 font-display text-lg font-semibold leading-snug text-white sm:text-xl">{note.title}</h2>
          </div>
          <button type="button" className="icon-button ml-3 shrink-0" onClick={onClose} aria-label="Close note details"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <DetailStat icon={<GraduationCap className="h-4 w-4 text-sky-300" />} label="University" value={note.university} />
            <DetailStat icon={<Clock3 className="h-4 w-4 text-violet-300" />} label="Added" value={friendlyDate(note.createdAt)} />
            <DetailStat icon={<Download className="h-4 w-4 text-emerald-300" />} label="Downloads" value={String(note.downloadsCount)} />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold text-white">About this note</h3>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{note.description}</p>
            {(note.tags || []).length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{note.tags.map((tag) => <span className="tag-chip" key={tag}>#{tag}</span>)}</div>}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold text-white">Preview</h3>
              <span className="text-[10px] text-slate-500">{note.fileName || "No file attached"}{note.fileSize ? ` · ${note.fileSize}` : ""}</span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">{note.previewText || "No preview text has been added for this resource."}</pre>
            {note.fileUrl && <a className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-sky-300 hover:text-sky-200" href={note.fileUrl} target="_blank" rel="noreferrer" download={note.fileName || undefined} onClick={onDownload}><Download className="h-3.5 w-3.5" />Download notes</a>}
          </div>
          <p className="text-[10px] text-slate-500">Shared by {note.authorName} · {note.authorUniversity}</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4 sm:px-6">
          {canManage ? (
            <button type="button" onClick={onDelete} disabled={isDeleting} className="danger-button">{isDeleting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}Delete</button>
          ) : <span />}
          <div className="flex gap-2"><button type="button" onClick={onClose} className="secondary-button px-4">Close</button>{canManage && <button type="button" onClick={onEdit} className="primary-button"><Pencil className="h-3.5 w-3.5" />Edit note</button>}</div>
        </div>
      </section>
    </div>
  );
}

function AuthDialog({
  mode,
  error,
  isSubmitting,
  onClose,
  onModeChange,
  onSubmit,
}: {
  mode: "login" | "register";
  error: string;
  isSubmitting: boolean;
  onClose: () => void;
  onModeChange: (mode: "login" | "register") => void;
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void onSubmit(
      String(formData.get("name") || ""),
      String(formData.get("email") || ""),
      String(formData.get("password") || ""),
    );
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="auth-dialog-title" className="font-display text-lg font-semibold text-white">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="mt-1 text-[11px] text-slate-400">{mode === "login" ? "Sign in to upload and download study notes." : "Create an account to upload and download study notes."}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close sign-in form"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
          {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
          {mode === "register" && (
            <Field label="Full name" required>
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your name" />
            </Field>
          )}
          <Field label="Email" required>
            <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" required hint={mode === "register" ? "Use at least 8 characters." : undefined}>
            <input name="password" type="password" required minLength={mode === "register" ? 8 : undefined} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Enter your password" />
          </Field>
          <button type="submit" className="primary-button w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === "login" ? <KeyRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <p className="text-center text-xs text-slate-400">
            {mode === "login" ? "New to StudyMate?" : "Already have an account?"}{" "}
            <button type="button" className="font-semibold text-sky-300 hover:text-sky-200" onClick={() => onModeChange(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}

function DetailStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="flex items-center gap-2 text-[10px] text-slate-500">{icon}{label}</div><p className="mt-2 truncate text-xs font-medium text-slate-200">{value}</p></div>;
}
