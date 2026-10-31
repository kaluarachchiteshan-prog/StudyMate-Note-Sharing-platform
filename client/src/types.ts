export interface StudyNote {
  _id: string;
  authorId: string;
  title: string;
  description: string;
  subject: string;
  courseCode: string;
  university: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: "pdf" | "doc" | "text";
  previewText: string;
  authorName: string;
  authorUniversity: string;
  upvotes: number;
  downvotes: number;
  downloadsCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface StudyGroup {
  _id: string;
  name: string;
  subject: string;
  courseCode: string;
  description: string;
  meetingSchedule: string;
  creatorId: string;
  creatorName: string;
  memberIds: string[];
  maxMembers: number;
  tags: string[];
  createdAt: string;
}

export interface StudyGroupMember {
  id: string;
  name: string;
}

export interface StudyGroupDetails extends StudyGroup {
  members: StudyGroupMember[];
}

export interface StudyGroupMessage {
  _id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface StudyGroupTask {
  _id: string;
  groupId: string;
  title: string;
  dueDate: string | null;
  isComplete: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface NoteRequest {
  _id: string;
  title: string;
  subject: string;
  courseCode: string;
  details: string;
  requesterId: string;
  requesterName: string;
  status: "open" | "fulfilled";
  createdAt: string;
}

export type NoteRequestInput = Pick<NoteRequest, "title" | "subject" | "courseCode" | "details">;

export type StudyGroupInput = Pick<
  StudyGroup,
  "name" | "subject" | "courseCode" | "description" | "meetingSchedule" | "maxMembers" | "tags"
>;

export type NoteInput = Omit<
  StudyNote,
  | "_id"
  | "authorId"
  | "authorName"
  | "authorUniversity"
  | "upvotes"
  | "downvotes"
  | "downloadsCount"
  | "commentsCount"
  | "createdAt"
>;

export interface NoteFilters {
  search: string;
  subject: string;
  sortBy: "recent" | "popular" | "downloads" | "title";
}

export interface ApiFailure {
  error: string;
  details?: Record<string, string[] | undefined>;
}
