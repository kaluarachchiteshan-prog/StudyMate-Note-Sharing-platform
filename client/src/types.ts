export interface StudyNote {
  _id: string;
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

export type NoteInput = Omit<
  StudyNote,
  | "_id"
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
