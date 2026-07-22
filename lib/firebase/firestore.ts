import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  increment 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { MOCK_NOTES, MOCK_STUDY_GROUPS, MOCK_USERS, MOCK_COMMENTS, INITIAL_USER } from '../mockData';
import { StudyNote, StudyGroup, UserProfile, Comment, FilterOptions } from '@/types';

// Notes Operations
export async function fetchAllNotes(filters?: Partial<FilterOptions>): Promise<StudyNote[]> {
  if (isFirebaseConfigured && db) {
    try {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyNote));
      return filterNotes(notes, filters);
    } catch (e) {
      console.warn('Firestore fetch failed, using mock notes', e);
    }
  }
  return filterNotes(MOCK_NOTES, filters);
}

function filterNotes(notes: StudyNote[], filters?: Partial<FilterOptions>): StudyNote[] {
  let result = [...notes];
  if (!filters) return result;

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.subject.toLowerCase().includes(q) || 
      n.courseCode.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.subject && filters.subject !== 'All') {
    result = result.filter(n => n.subject.toLowerCase() === filters.subject?.toLowerCase());
  }

  if (filters.courseCode) {
    result = result.filter(n => n.courseCode.toLowerCase().includes(filters.courseCode!.toLowerCase()));
  }

  if (filters.sortBy) {
    if (filters.sortBy === 'popular' || filters.sortBy === 'upvotes') {
      result.sort((a, b) => b.upvotes - a.upvotes);
    } else if (filters.sortBy === 'downloads') {
      result.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (filters.sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  return result;
}

export async function createNewNote(noteData: Omit<StudyNote, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'downloadsCount' | 'commentsCount'>): Promise<StudyNote> {
  const newNote: StudyNote = {
    ...noteData,
    id: `note_${Date.now()}`,
    upvotes: 1,
    downvotes: 0,
    downloadsCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'notes', newNote.id);
      await setDoc(docRef, newNote);
    } catch (e) {
      console.warn('Firestore write error, saved locally', e);
    }
  }

  MOCK_NOTES.unshift(newNote);
  return newNote;
}

export async function toggleNoteVote(noteId: string, voteType: 'up' | 'down'): Promise<{ upvotes: number; downvotes: number; userVote: 'up' | 'down' | null }> {
  const note = MOCK_NOTES.find(n => n.id === noteId);
  if (note) {
    if (note.userVote === voteType) {
      note.userVote = null;
      if (voteType === 'up') note.upvotes -= 1;
      else note.downvotes -= 1;
    } else {
      if (note.userVote === 'up') note.upvotes -= 1;
      if (note.userVote === 'down') note.downvotes -= 1;
      
      note.userVote = voteType;
      if (voteType === 'up') note.upvotes += 1;
      else note.downvotes += 1;
    }
    return { upvotes: note.upvotes, downvotes: note.downvotes, userVote: note.userVote };
  }
  return { upvotes: 0, downvotes: 0, userVote: null };
}

// Study Groups Operations
export async function fetchAllStudyGroups(): Promise<StudyGroup[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, 'groups');
      const snap = await getDocs(ref);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyGroup));
      }
    } catch (e) {
      console.warn('Firestore group fetch failed', e);
    }
  }
  return MOCK_STUDY_GROUPS;
}

export async function createStudyGroup(groupData: Omit<StudyGroup, 'id' | 'createdAt' | 'memberCount' | 'sharedResourceCount'>): Promise<StudyGroup> {
  const newGroup: StudyGroup = {
    ...groupData,
    id: `group_${Date.now()}`,
    memberCount: groupData.memberIds.length || 1,
    sharedResourceCount: 1,
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'groups', newGroup.id), newGroup);
    } catch (e) {
      console.warn('Firestore group creation fallback to local', e);
    }
  }

  MOCK_STUDY_GROUPS.unshift(newGroup);
  return newGroup;
}

export async function joinOrLeaveGroup(groupId: string, userId: string): Promise<boolean> {
  const group = MOCK_STUDY_GROUPS.find(g => g.id === groupId);
  if (group) {
    const isMember = group.memberIds.includes(userId);
    if (isMember) {
      group.memberIds = group.memberIds.filter(id => id !== userId);
      group.memberCount = Math.max(0, group.memberCount - 1);
      return false;
    } else {
      group.memberIds.push(userId);
      group.memberCount += 1;
      return true;
    }
  }
  return false;
}

// Student Directory Operations
export async function fetchStudents(universityFilter?: string, courseFilter?: string): Promise<UserProfile[]> {
  let list = [...MOCK_USERS];
  if (universityFilter && universityFilter !== 'All Universities') {
    list = list.filter(u => u.university.toLowerCase() === universityFilter.toLowerCase());
  }
  if (courseFilter) {
    list = list.filter(u => u.enrolledCourses.some(c => c.toLowerCase().includes(courseFilter.toLowerCase())));
  }
  return list;
}
