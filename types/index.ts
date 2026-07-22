export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  university: string;
  school?: string;
  major: string;
  enrolledCourses: string[];
  bio: string;
  reputationPoints: number;
  uploadedNotesCount: number;
  savedBookmarkIds: string[];
  joinedGroupIds: string[];
  createdAt: string;
}

export interface StudyNote {
  id: string;
  title: string;
  description: string;
  subject: string;
  courseCode: string;
  university: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'doc' | 'text';
  previewText?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorUniversity: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  downloadsCount: number;
  createdAt: string;
  commentsCount: number;
}

export interface Comment {
  id: string;
  noteId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  courseCode: string;
  university: string;
  isPrivate: boolean;
  memberIds: string[];
  memberCount: number;
  maxMembers: number;
  creatorId: string;
  creatorName: string;
  meetingSchedule: string;
  tags: string[];
  sharedResourceCount: number;
  createdAt: string;
  avatarUrl?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export interface FilterOptions {
  searchQuery: string;
  subject: string;
  courseCode: string;
  university: string;
  sortBy: 'popular' | 'recent' | 'downloads' | 'upvotes';
}
