import { StudyNote, UserProfile, StudyGroup, Comment, GroupMessage } from '@/types';

export const INITIAL_USER: UserProfile = {
  uid: 'user_alex_dev',
  displayName: 'Nimal Perera',
  email: 'nimal.perera@uom.lk',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  university: 'University of Moratuwa',
  school: 'Faculty of Engineering',
  major: 'Computer Science',
  enrolledCourses: ['CS106B', 'CS161', 'MATH51', 'PHYSICS41'],
  bio: 'Junior CS student passionate about algorithms, machine learning, and collaborative study. Always happy to share clean lecture notes!',
  reputationPoints: 485,
  uploadedNotesCount: 12,
  savedBookmarkIds: ['note_1', 'note_3'],
  joinedGroupIds: ['group_1', 'group_3'],
  createdAt: '2025-09-15',
};

export const MOCK_USERS: UserProfile[] = [
  INITIAL_USER,
  {
    uid: 'user_sophia',
    displayName: 'Kavindi Silva',
    email: 'kavindi.silva@uom.lk',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    university: 'University of Colombo',
    school: 'Faculty of Science',
    major: 'Biology',
    enrolledCourses: ['BIO7.012', 'CHEM5.111', 'MATH18.02'],
    bio: 'Pre-med enthusiast focused on cell biology notes, flashcards, and group quiz sessions.',
    reputationPoints: 620,
    uploadedNotesCount: 18,
    savedBookmarkIds: ['note_2'],
    joinedGroupIds: ['group_2'],
    createdAt: '2025-08-20',
  },
  {
    uid: 'user_marcus',
    displayName: 'Dulanjan Fernando',
    email: 'dulanjan.fernando@uom.lk',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    university: 'University of Peradeniya',
    school: 'Faculty of Arts',
    major: 'Economics',
    enrolledCourses: ['ECON100A', 'STAT20', 'DATA8', 'UGBA102A'],
    bio: 'Building comprehensive exam study kits for Microeconomics & Applied Econometrics.',
    reputationPoints: 340,
    uploadedNotesCount: 8,
    savedBookmarkIds: [],
    joinedGroupIds: ['group_1'],
    createdAt: '2025-10-01',
  },
  {
    uid: 'user_emily',
    displayName: 'Sajini Jayawardena',
    email: 'sajini.jayawardena@uom.lk',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    university: 'University of Moratuwa',
    school: 'Faculty of Computing',
    major: 'Computer Science',
    enrolledCourses: ['CS106B', 'CS103', 'PHIL80'],
    bio: 'Tackling discrete structures and logic proof cheatsheets.',
    reputationPoints: 510,
    uploadedNotesCount: 15,
    savedBookmarkIds: ['note_1'],
    joinedGroupIds: ['group_1'],
    createdAt: '2025-09-02',
  }
];

export const MOCK_NOTES: StudyNote[] = [
  {
    id: 'note_1',
    title: 'CS161 Complete Graph Algorithms & Dynamic Programming Guide',
    description: 'Comprehensive 24-page synthesis covering Dijkstra, Bellman-Ford, Kruskal, Prim, and 15 solved DP classic problems with runtime complexity analysis.',
    subject: 'Computer Science',
    courseCode: 'CS161',
    university: 'University of Moratuwa',
    tags: ['Algorithms', 'Graphs', 'Dynamic Programming', 'Midterm Review'],
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CS161_Algorithms_Mastery.pdf',
    fileSize: '3.4 MB',
    fileType: 'pdf',
    previewText: `SECTION 1: GRAPH ALGORITHMS RECAP
1.1 Dijkstra's Shortest Path Algorithm
- Requires non-negative edge weights.
- Priority Queue implementation runtime: O((V + E) log V).
- Key Invariant: When node u is popped from PQ, dist[u] is guaranteed minimal.

1.2 Bellman-Ford Algorithm
- Handles negative edge weights.
- Detects negative cycles after V-1 relaxations.
- Runtime: O(V * E).

SECTION 2: DYNAMIC PROGRAMMING FORMULATION
- Step 1: Define Subproblems (State representation).
- Step 2: Formulate Recurrence Relation.
- Step 3: Identify Base Cases & Topo Order.
- Classic Example: Longest Common Subsequence (LCS) matrix filling strategy.`,
    authorId: 'user_alex_dev',
    authorName: 'Nimal Perera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    authorUniversity: 'University of Moratuwa',
    upvotes: 142,
    downvotes: 3,
    downloadsCount: 520,
    createdAt: '2026-02-14',
    commentsCount: 8,
  },
  {
    id: 'note_2',
    title: 'Cell Biology & Molecular Signaling Pathways Master Cheatsheet',
    description: 'Illustrated summary of G-protein coupled receptors, RTK cascades, apoptosis triggers, and membrane transport thermodynamics.',
    subject: 'Biology',
    courseCode: 'BIO7.012',
    university: 'University of Colombo',
    tags: ['Biochemistry', 'Cell Biology', 'Pre-Med', 'Diagrams'],
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'BIO7012_Molecular_Signaling.pdf',
    fileSize: '4.8 MB',
    fileType: 'pdf',
    previewText: `1. CELL MEMBRANE TRANSPORT THERMODYNAMICS
- Passive vs Active Transport: Delta G = R*T*ln(C_in/C_out) + z*F*Vm
- Sodium-Potassium Pump (Na+/K+-ATPase): 3 Na+ out, 2 K+ in per ATP hydrolyzed.

2. RECEPTOR TYROSINE KINASE (RTK) SIGNALING
- Ligand binding induces dimerization.
- Cross-autophosphorylation on Tyrosine residues.
- Recruitment of SH2-domain adaptors (e.g. Grb2 -> SOS -> Ras -> Raf -> MEK -> ERK).`,
    authorId: 'user_sophia',
    authorName: 'Kavindi Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    authorUniversity: 'University of Colombo',
    upvotes: 98,
    downvotes: 1,
    downloadsCount: 310,
    createdAt: '2026-03-01',
    commentsCount: 4,
  },
  {
    id: 'note_3',
    title: 'Multivariable Calculus (MATH51) Vector Analysis & Stokes Theorem',
    description: 'Step-by-step worked examples on Gradient Vectors, Lagrange Multipliers, Double/Triple Integrals, and Divergence & Curl.',
    subject: 'Mathematics',
    courseCode: 'MATH51',
    university: 'University of Moratuwa',
    tags: ['Calculus', 'Linear Algebra', 'Exam Prep', 'Vectors'],
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'MATH51_Multivariable_Summary.pdf',
    fileSize: '2.1 MB',
    fileType: 'pdf',
    previewText: `GRADIENT AND DIRECTIONAL DERIVATIVES
- The gradient vector grad(f) points in direction of steepest ascent.
- Magnitude ||grad(f)|| equals max rate of change.
- Directional derivative D_u f = grad(f) dot u (where u is a unit vector).

LAGRANGE MULTIPLIERS FOR CONSTRAINED OPTIMIZATION
- Solve grad(f) = lambda * grad(g) alongside constraint g(x,y,z) = c.`,
    authorId: 'user_emily',
    authorName: 'Sajini Jayawardena',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    authorUniversity: 'University of Moratuwa',
    upvotes: 115,
    downvotes: 2,
    downloadsCount: 440,
    createdAt: '2026-01-28',
    commentsCount: 6,
  },
  {
    id: 'note_4',
    title: 'Intermediate Microeconomics: Game Theory & Market Equilibrium',
    description: 'Comprehensive notes covering Nash Equilibrium, Cournot & Bertrand Competition, Asymmetric Information, and Adverse Selection.',
    subject: 'Economics',
    courseCode: 'ECON100A',
    university: 'University of Peradeniya',
    tags: ['Microeconomics', 'Game Theory', 'Equilibrium', 'Midterm'],
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'ECON100A_Microeconomics.pdf',
    fileSize: '1.9 MB',
    fileType: 'pdf',
    previewText: `NASH EQUILIBRIUM & STRATEGIC GAMES
- Definition: A strategy profile where no player has incentive to unilaterally deviate.
- Mixed Strategy Nash Equilibrium: Players randomize over pure strategies to make opponent indifferent.

OLIGOPOLY MODELS
- Cournot Model: Simultaneous quantity competition. Reaction functions Q1(Q2).
- Bertrand Model: Price competition yielding P = MC breakdown.`,
    authorId: 'user_marcus',
    authorName: 'Dulanjan Fernando',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    authorUniversity: 'University of Peradeniya',
    upvotes: 76,
    downvotes: 0,
    downloadsCount: 280,
    createdAt: '2026-02-20',
    commentsCount: 3,
  }
];

export const MOCK_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'group_1',
    name: 'CS161 Algorithm Knights & Problem Set Crew',
    description: 'Weekly collaborative problem-solving squad focusing on dynamic programming, graph theory homeworks, and mock whiteboard coding practice.',
    subject: 'Computer Science',
    courseCode: 'CS161',
    university: 'University of Moratuwa',
    isPrivate: false,
    memberIds: ['user_alex_dev', 'user_emily', 'user_marcus'],
    memberCount: 3,
    maxMembers: 8,
    creatorId: 'user_alex_dev',
    creatorName: 'Nimal Perera',
    meetingSchedule: 'Tuesdays & Thursdays @ 6:00 PM PST',
    tags: ['Algorithms', 'Python', 'LeetCode', 'Homework Sync'],
    sharedResourceCount: 5,
    createdAt: '2026-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'group_2',
    name: 'MIT BIO7.012 MCAT & Finals Prep Circle',
    description: 'Focused review room for biological pathways, cell signaling mock exams, and memory flashcards.',
    subject: 'Biology',
    courseCode: 'BIO7.012',
    university: 'University of Colombo',
    isPrivate: false,
    memberIds: ['user_sophia'],
    memberCount: 1,
    maxMembers: 6,
    creatorId: 'user_sophia',
    creatorName: 'Kavindi Silva',
    meetingSchedule: 'Wednesdays @ 5:30 PM EST',
    tags: ['Biochemistry', 'Pre-Med', 'Flashcards'],
    sharedResourceCount: 3,
    createdAt: '2026-02-01',
    avatarUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'group_3',
    name: 'Stanford MATH51 Study Lounge',
    description: 'Open discussion space for vector math questions, practice exam drills, and visual intuition tips.',
    subject: 'Mathematics',
    courseCode: 'MATH51',
    university: 'University of Moratuwa',
    isPrivate: false,
    memberIds: ['user_alex_dev', 'user_emily'],
    memberCount: 2,
    maxMembers: 10,
    creatorId: 'user_emily',
    creatorName: 'Sajini Jayawardena',
    meetingSchedule: 'Mondays @ 7:00 PM PST',
    tags: ['Calculus', 'Linear Algebra', 'Exam Prep'],
    sharedResourceCount: 4,
    createdAt: '2026-01-20',
    avatarUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=250',
  }
];

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  'note_1': [
    {
      id: 'c1',
      noteId: 'note_1',
      authorId: 'user_emily',
      authorName: 'Sajini Jayawardena',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      content: 'This DP section saved my midterm prep! The LCS breakdown is so clear.',
      createdAt: '2 hours ago',
      likes: 12,
    },
    {
      id: 'c2',
      noteId: 'note_1',
      authorId: 'user_marcus',
      authorName: 'Dulanjan Fernando',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      content: 'Super helpful summary. Are you planning to add Floyd-Warshall notes as well?',
      createdAt: '1 day ago',
      likes: 5,
    }
  ]
};

export const MOCK_GROUP_MESSAGES: Record<string, GroupMessage[]> = {
  'group_1': [
    {
      id: 'm1',
      groupId: 'group_1',
      senderId: 'user_alex_dev',
      senderName: 'Nimal Perera',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      text: 'Hey everyone! Welcome to the CS161 study group. I just linked the Dijkstra & DP note set to our group resources.',
      timestamp: '10:30 AM',
    },
    {
      id: 'm2',
      groupId: 'group_1',
      senderId: 'user_emily',
      senderName: 'Sajini Jayawardena',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      text: 'Awesome, thanks Nimal! Shall we review Question 3 from Problem Set 4 together tonight?',
      timestamp: '10:34 AM',
    },
    {
      id: 'm3',
      groupId: 'group_1',
      senderId: 'user_marcus',
      senderName: 'Dulanjan Fernando',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      text: 'Count me in! I will bring my work for the Bellman-Ford proof.',
      timestamp: '11:02 AM',
    }
  ]
};
