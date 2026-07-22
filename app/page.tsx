'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  UploadCloud, 
  Sparkles, 
  Flame, 
  Search, 
  ArrowRight, 
  GraduationCap,
  Award,
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_NOTES, MOCK_STUDY_GROUPS, MOCK_USERS } from '@/lib/mockData';
import NoteCard from '@/components/NoteCard';
import StudyGroupCard from '@/components/StudyGroupCard';
import NotePreviewModal from '@/components/NotePreviewModal';
import { StudyNote } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  const featuredNotes = MOCK_NOTES.slice(0, 3);
  const activeGroups = MOCK_STUDY_GROUPS.slice(0, 2);

  return (
    <div className="space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border border-sky-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Welcome back, {user?.displayName || 'Scholar'}!
            </div>
            
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Collaborate, Share Notes & Master Your Courses Together.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Enrolled in <strong className="text-sky-400 font-mono">{user?.enrolledCourses.join(', ') || 'CS161, MATH51'}</strong> at <span className="text-white">{user?.university}</span>.
            </p>
          </div>

          {/* Quick Upload CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/notes/upload"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
            >
              <UploadCloud className="w-4 h-4" />
              Upload PDF Note
            </Link>

            <Link
              href="/study-mates"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Users className="w-4 h-4 text-sky-400" />
              Find Study Mates
            </Link>
          </div>
        </div>

        {/* Dashboard Quick Metrics Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium">Uploaded Notes</p>
            <p className="font-display font-bold text-xl text-white mt-1">{user?.uploadedNotesCount || 12}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium">Reputation Points</p>
            <p className="font-display font-bold text-xl text-amber-400 mt-1 flex items-center gap-1">
              <Flame className="w-5 h-5 fill-amber-400" />
              {user?.reputationPoints || 485}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium">Saved Bookmarks</p>
            <p className="font-display font-bold text-xl text-sky-400 mt-1">{user?.savedBookmarkIds.length || 2}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium">Active Groups</p>
            <p className="font-display font-bold text-xl text-sky-400 mt-1">{user?.joinedGroupIds.length || 2}</p>
          </div>
        </div>

      </div>

      {/* Recommended Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              Top Rated Study Notes
            </h2>
            <p className="text-xs text-slate-400">High impact lecture summaries and solved exam sheets.</p>
          </div>

          <Link
            href="/notes"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
          >
            Explore Notes Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPreview={(selected) => setSelectedNote(selected)}
            />
          ))}
        </div>
      </div>

      {/* Study Groups & Top Contributors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Peer Study Groups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Active Peer Study Groups
              </h2>
              <p className="text-xs text-slate-400">Join course squads to sync homework & practice exams.</p>
            </div>

            <Link
              href="/study-mates"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
            >
              All Groups <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeGroups.map((group) => (
              <StudyGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>

        {/* Right Col: Top Scholar Contributors Leaderboard */}
        <div className="space-y-4">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top Scholars
            </h2>
            <p className="text-xs text-slate-400">Highest rated note contributors.</p>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
            {MOCK_USERS.map((scholar, rank) => (
              <div key={scholar.uid} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    rank === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{rank + 1}
                  </span>
                  <img src={scholar.photoURL} alt={scholar.displayName} className="w-7 h-7 rounded-lg object-cover" />
                  <div className="truncate max-w-[100px]">
                    <p className="font-semibold text-white truncate">{scholar.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{scholar.university}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-amber-400">{scholar.reputationPoints} pts</p>
                  <p className="text-[10px] text-slate-500">{scholar.uploadedNotesCount} notes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Note Detail Preview Modal */}
      {selectedNote && (
        <NotePreviewModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}

    </div>
  );
}
