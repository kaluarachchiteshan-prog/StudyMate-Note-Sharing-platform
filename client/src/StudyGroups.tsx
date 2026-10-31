import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, CalendarDays, Check, CheckCircle2, ClipboardList, LoaderCircle, MessageCircle, Plus, RefreshCw, Search, Send, Users, X } from "lucide-react";
import { createStudyGroup, createStudyGroupTask, fetchStudyGroupDetails, fetchStudyGroupMessages, fetchStudyGroupTasks, fetchStudyGroups, joinStudyGroup, leaveStudyGroup, postStudyGroupMessage, updateStudyGroupTaskStatus } from "./api";
import type { AuthUser, StudyGroup, StudyGroupDetails, StudyGroupInput, StudyGroupMessage, StudyGroupTask } from "./types";

const emptyGroup: StudyGroupInput = {
  name: "",
  subject: "",
  courseCode: "",
  description: "",
  meetingSchedule: "",
  maxMembers: 8,
  tags: [],
};

export default function StudyGroups({
  user,
  onRequireAuth,
}: {
  user: AuthUser | null;
  onRequireAuth: () => void;
}) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState("");
  const [openGroupId, setOpenGroupId] = useState("");

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setGroups(await fetchStudyGroups());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load study groups.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return groups;
    return groups.filter((group) =>
      [group.name, group.subject, group.courseCode, group.description, ...group.tags]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }, [groups, search]);

  const handleCreate = async (input: StudyGroupInput) => {
    setIsCreating(true);
    setActionError("");
    try {
      const group = await createStudyGroup(input);
      setGroups((current) => [group, ...current]);
      setIsCreateOpen(false);
      setNotice(`Created "${group.name}".`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not create this study group.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleMembership = async (group: StudyGroup) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setPendingGroupId(group._id);
    setActionError("");
    setNotice("");
    try {
      const isMember = group.memberIds.includes(user.id);
      const updatedGroup = isMember
        ? await leaveStudyGroup(group._id)
        : await joinStudyGroup(group._id);
      setGroups((current) => current.map((item) => item._id === updatedGroup._id ? updatedGroup : item));
      if (isMember && openGroupId === group._id) setOpenGroupId("");
      setNotice(isMember ? `You left "${group.name}".` : `You joined "${group.name}".`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update your group membership.");
    } finally {
      setPendingGroupId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-panel">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300">
            <Users className="h-3 w-3" /> Learn together
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[30px]">Study Groups</h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
            Find classmates studying the same course, join a group, or create one of your own.
          </p>
        </div>
        <div className="hero-decoration" aria-hidden="true"><Users className="h-20 w-20" /></div>
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

      <section className="panel space-y-4" aria-label="Study group search">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="search-field flex-1">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="sr-only">Search study groups</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by group, subject, course code, or tag..." />
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
              setIsCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Create a group
          </button>
        </div>
        <p className="text-[11px] text-slate-500">{groups.length} {groups.length === 1 ? "study group" : "study groups"}</p>
      </section>

      {loadError ? (
        <div role="alert" className="rounded-2xl border border-rose-500/25 bg-rose-950/30 p-5 text-sm text-rose-200">
          <div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" /> Couldn’t load study groups</div>
          <p className="mt-2 text-xs text-rose-200/75">{loadError}</p>
          <button type="button" className="mt-3 text-xs font-semibold underline" onClick={() => void loadGroups()}>Try again</button>
        </div>
      ) : isLoading ? (
        <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading study groups...</div>
      ) : filteredGroups.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredGroups.map((group) => {
            const isMember = Boolean(user && group.memberIds.includes(user.id));
            const isFull = group.memberIds.length >= group.maxMembers;
            const isPending = pendingGroupId === group._id;
            return (
              <article key={group._id} className="note-card flex min-h-[245px] flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge badge-blue">{group.courseCode}</span>
                    <span className="text-[10px] text-slate-500">{group.subject}</span>
                  </div>
                  <h2 className="mt-4 font-display text-base font-semibold text-white">{group.name}</h2>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400">{group.description || "A peer group for learning and revision."}</p>
                  {group.meetingSchedule && (
                    <p className="mt-3 flex items-center gap-2 text-[11px] text-sky-300">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />{group.meetingSchedule}
                    </p>
                  )}
                  {group.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.tags.map((tag) => <span className="tag-chip" key={tag}>#{tag}</span>)}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Users className="h-3.5 w-3.5 text-sky-300" />
                      {group.memberIds.length}/{group.maxMembers} members
                    </p>
                    <p className="mt-1 max-w-[150px] truncate text-[10px] text-slate-500">Created by {group.creatorName}</p>
                  </div>
                  <div className={`mt-3 grid gap-2 ${isMember ? "grid-cols-2" : "grid-cols-1"}`}>
                    {isMember && (
                      <button type="button" className="primary-button" onClick={() => { setActionError(""); setOpenGroupId(group._id); }}>
                        <MessageCircle className="h-3.5 w-3.5" />Open group
                      </button>
                    )}
                    <button
                      type="button"
                      className={isMember ? "secondary-button px-3" : "primary-button"}
                      disabled={isPending || (!isMember && isFull)}
                      onClick={() => void handleMembership(group)}
                    >
                      {isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : isMember ? <X className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                      {isPending ? "Please wait..." : isMember ? "Leave group" : isFull ? "Group full" : "Join group"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-400"><Users className="h-6 w-6" /></span>
          <h2 className="mt-4 font-display text-base font-semibold text-white">{search ? "No groups found" : "No study groups yet"}</h2>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
            {search ? "Try a different search or course code." : "Create the first group and invite classmates to study together."}
          </p>
        </div>
      )}

      {isCreateOpen && (
        <CreateGroupDialog
          isSaving={isCreating}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(input) => void handleCreate(input)}
        />
      )}
      {openGroupId && user && (
        <StudyGroupSpace
          key={openGroupId}
          groupId={openGroupId}
          user={user}
          onClose={() => setOpenGroupId("")}
        />
      )}
    </div>
  );
}

function StudyGroupSpace({
  groupId,
  user,
  onClose,
}: {
  groupId: string;
  user: AuthUser;
  onClose: () => void;
}) {
  const [group, setGroup] = useState<StudyGroupDetails | null>(null);
  const [messages, setMessages] = useState<StudyGroupMessage[]>([]);
  const [tasks, setTasks] = useState<StudyGroupTask[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [activeTab, setActiveTab] = useState<"discussion" | "tasks">("discussion");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [groupDetails, groupMessages, groupTasks] = await Promise.all([
        fetchStudyGroupDetails(groupId),
        fetchStudyGroupMessages(groupId),
        fetchStudyGroupTasks(groupId),
      ]);
      setGroup(groupDetails);
      setMessages(groupMessages);
      setTasks(groupTasks);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this group's details.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = messageBody.trim();
    if (!body) return;

    setIsSending(true);
    setError("");
    try {
      const message = await postStudyGroupMessage(groupId, body);
      setMessages((current) => [...current, message]);
      setMessageBody("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send your message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    setIsAddingTask(true);
    setError("");
    try {
      const task = await createStudyGroupTask(groupId, title, taskDueDate);
      setTasks((current) => [...current, task].sort(compareTasks));
      setTaskTitle("");
      setTaskDueDate("");
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "Could not add this study task.");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleTaskStatus = async (task: StudyGroupTask) => {
    setPendingTaskId(task._id);
    setError("");
    try {
      const updatedTask = await updateStudyGroupTaskStatus(groupId, task._id, !task.isComplete);
      setTasks((current) => current.map((item) => item._id === updatedTask._id ? updatedTask : item).sort(compareTasks));
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "Could not update this study task.");
    } finally {
      setPendingTaskId("");
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="group-space-title">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-300">{group?.courseCode || "Study group"} · {group?.subject || ""}</p>
            <h2 id="group-space-title" className="mt-1 truncate font-display text-lg font-semibold text-white">{group?.name || "Group space"}</h2>
          </div>
          <button type="button" className="icon-button ml-3 shrink-0" onClick={onClose} aria-label="Close group space"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid max-h-[75vh] gap-0 overflow-y-auto md:grid-cols-[minmax(0,1fr)_220px]">
          <section className="flex min-h-[420px] flex-col border-b border-slate-800 p-4 sm:p-5 md:border-b-0 md:border-r">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex gap-2" role="tablist" aria-label="Group activities">
                <button type="button" role="tab" aria-selected={activeTab === "discussion"} onClick={() => setActiveTab("discussion")} className={`secondary-button px-3 ${activeTab === "discussion" ? "border-sky-500/40 text-sky-200" : ""}`}>
                  <MessageCircle className="h-3.5 w-3.5" />Discussion
                </button>
                <button type="button" role="tab" aria-selected={activeTab === "tasks"} onClick={() => setActiveTab("tasks")} className={`secondary-button px-3 ${activeTab === "tasks" ? "border-sky-500/40 text-sky-200" : ""}`}>
                  <ClipboardList className="h-3.5 w-3.5" />Study tasks
                </button>
              </div>
              <button type="button" className="icon-button" onClick={() => void refresh()} disabled={isLoading} aria-label="Refresh group activity">
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {error && <p role="alert" className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">{error}</p>}
            {activeTab === "discussion" ? (
              <>
                <div className="mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4 text-sky-300" />Group discussion</h3>
                  <p className="mt-1 text-[10px] text-slate-500">Share questions, study plans, and helpful updates.</p>
                </div>
                <div className="min-h-[230px] flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  {isLoading ? (
                    <p role="status" className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Loading discussion...</p>
                  ) : messages.length ? (
                    messages.map((message) => (
                      <article key={message._id} className={`max-w-[90%] rounded-xl border p-3 ${message.authorId === user.id ? "ml-auto border-sky-500/20 bg-sky-500/[0.08]" : "border-slate-800 bg-slate-900/70"}`}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-[10px] font-semibold text-sky-200">{message.authorId === user.id ? "You" : message.authorName}</span>
                          <time className="shrink-0 text-[9px] text-slate-500" dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-200">{message.body}</p>
                      </article>
                    ))
                  ) : (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                      <MessageCircle className="h-7 w-7 text-slate-600" />
                      <p className="mt-3 text-xs font-medium text-slate-300">Start the conversation</p>
                      <p className="mt-1 text-[10px] text-slate-500">Post the first message to your group.</p>
                    </div>
                  )}
                </div>
                <form onSubmit={(event) => void handleSend(event)} className="mt-3 flex items-end gap-2">
                  <label className="form-field min-w-0 flex-1">
                    <span className="sr-only">Write a group message</span>
                    <textarea rows={2} maxLength={1000} value={messageBody} onChange={(event) => setMessageBody(event.target.value)} placeholder="Write a message to the group..." disabled={isSending} />
                  </label>
                  <button type="submit" className="primary-button h-10 shrink-0" disabled={isSending || !messageBody.trim()}>
                    {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only sm:not-sr-only">{isSending ? "Sending" : "Send"}</span>
                  </button>
                </form>
                <p className="mt-1 text-right text-[9px] text-slate-600">{messageBody.length}/1000</p>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><ClipboardList className="h-4 w-4 text-sky-300" />Shared study tasks</h3>
                  <p className="mt-1 text-[10px] text-slate-500">Plan revision and track group assignment progress.</p>
                </div>
                <form onSubmit={(event) => void handleAddTask(event)} className="mb-3 grid gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
                  <label className="form-field min-w-0">
                    <span className="sr-only">Study task</span>
                    <input required minLength={3} maxLength={160} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a revision or assignment task..." disabled={isAddingTask} />
                  </label>
                  <label className="form-field">
                    <span className="sr-only">Optional due date</span>
                    <input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} disabled={isAddingTask} />
                  </label>
                  <button type="submit" className="primary-button" disabled={isAddingTask || !taskTitle.trim()}>
                    {isAddingTask ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add task
                  </button>
                </form>
                <div className="min-h-[230px] flex-1 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  {isLoading ? (
                    <p role="status" className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Loading tasks...</p>
                  ) : tasks.length ? (
                    tasks.map((task) => (
                      <article key={task._id} className={`flex items-start gap-3 rounded-xl border p-3 ${task.isComplete ? "border-emerald-500/15 bg-emerald-500/[0.04]" : "border-slate-800 bg-slate-900/70"}`}>
                        <button
                          type="button"
                          className={`mt-0.5 shrink-0 ${task.isComplete ? "text-emerald-300" : "text-slate-500 hover:text-sky-300"}`}
                          aria-label={`${task.isComplete ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
                          disabled={pendingTaskId === task._id}
                          onClick={() => void handleTaskStatus(task)}
                        >
                          {pendingTaskId === task._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`break-words text-xs font-medium ${task.isComplete ? "text-slate-500 line-through" : "text-slate-200"}`}>{task.title}</p>
                          <p className="mt-1 text-[9px] text-slate-500">
                            Added by {task.createdBy === user.id ? "you" : task.createdByName}
                            {task.dueDate ? ` · Due ${formatDueDate(task.dueDate)}` : ""}
                          </p>
                        </div>
                        {task.isComplete && <span className="shrink-0 text-[9px] font-semibold text-emerald-300">Done</span>}
                      </article>
                    ))
                  ) : (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                      <ClipboardList className="h-7 w-7 text-slate-600" />
                      <p className="mt-3 text-xs font-medium text-slate-300">No study tasks yet</p>
                      <p className="mt-1 text-[10px] text-slate-500">Add a shared goal or assignment for your group.</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-right text-[9px] text-slate-500">
                  {tasks.filter((task) => task.isComplete).length} of {tasks.length} tasks complete
                </p>
              </>
            )}
          </section>

          <aside className="space-y-5 p-4 sm:p-5">
            {group && (
              <>
                <section>
                  <h3 className="text-xs font-semibold text-white">About this group</h3>
                  <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-400">{group.description || "A peer group for learning and revision."}</p>
                  {group.meetingSchedule && (
                    <p className="mt-3 flex items-start gap-2 text-[10px] text-sky-300"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />{group.meetingSchedule}</p>
                  )}
                  {group.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.tags.map((tag) => <span className="tag-chip" key={tag}>#{tag}</span>)}
                    </div>
                  )}
                </section>
                <section className="border-t border-slate-800 pt-4">
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Users className="h-3.5 w-3.5 text-sky-300" />Members ({group.members.length}/{group.maxMembers})
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {group.members.map((member) => (
                      <li key={member.id} className="flex min-w-0 items-center gap-2 text-[11px] text-slate-300">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-[9px] font-semibold text-sky-200">{member.name.slice(0, 1).toUpperCase()}</span>
                        <span className="truncate">{member.id === user.id ? `${member.name} (you)` : member.name}</span>
                        {member.id === group.creatorId && <span className="ml-auto shrink-0 text-[9px] text-amber-300">Host</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function compareTasks(left: StudyGroupTask, right: StudyGroupTask) {
  if (left.isComplete !== right.isComplete) return Number(left.isComplete) - Number(right.isComplete);
  if (left.dueDate && right.dueDate) return left.dueDate.localeCompare(right.dueDate);
  if (left.dueDate) return -1;
  if (right.dueDate) return 1;
  return right.createdAt.localeCompare(left.createdAt);
}

function CreateGroupDialog({
  isSaving,
  onClose,
  onSubmit,
}: {
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: StudyGroupInput) => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({
      name: String(formData.get("name") || ""),
      subject: String(formData.get("subject") || ""),
      courseCode: String(formData.get("courseCode") || ""),
      description: String(formData.get("description") || ""),
      meetingSchedule: String(formData.get("meetingSchedule") || ""),
      maxMembers: Number(formData.get("maxMembers")),
      tags: String(formData.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <section className="modal-panel max-w-xl" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="create-group-title" className="font-display text-lg font-semibold text-white">Create a study group</h2>
            <p className="mt-1 text-[11px] text-slate-400">Start a course group and classmates can join.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} disabled={isSaving} aria-label="Close create group form"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <GroupField label="Group name">
              <input name="name" required minLength={3} maxLength={80} placeholder="EC4307 study circle" />
            </GroupField>
            <GroupField label="Course code">
              <input name="courseCode" required minLength={2} maxLength={30} placeholder="EC4307" />
            </GroupField>
            <GroupField label="Subject">
              <input name="subject" required minLength={2} maxLength={80} placeholder="Web application development" />
            </GroupField>
            <GroupField label="Maximum members">
              <input name="maxMembers" type="number" required min={2} max={30} defaultValue={emptyGroup.maxMembers} />
            </GroupField>
          </div>
          <GroupField label="Description">
            <textarea name="description" rows={3} maxLength={500} placeholder="What will your group study together?" />
          </GroupField>
          <GroupField label="Meeting schedule">
            <input name="meetingSchedule" maxLength={120} placeholder="e.g. Wednesdays at 6 PM" />
          </GroupField>
          <GroupField label="Tags" hint="Separate tags with commas.">
            <input name="tags" placeholder="Revision, Projects, Exam prep" />
          </GroupField>
          <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
            <button type="button" className="secondary-button px-4" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isSaving ? "Creating..." : "Create group"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function GroupField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
