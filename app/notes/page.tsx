'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Search, Filter, SlidersHorizontal, UploadCloud, FileText } from 'lucide-react';
import { StudyNote } from '@/types';
import { MOCK_NOTES } from '@/lib/mockData';
import { fetchAllNotes } from '@/lib/firebase/firestore';
import NoteCard from '@/components/NoteCard';
import NotePreviewModal from '@/components/NotePreviewModal';
import Link from 'next/link';

function NotesDirectoryPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [notes, setNotes] = useState<StudyNote[]>(MOCK_NOTES);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [courseCodeFilter, setCourseCodeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'downloads'>('popular');
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  const subjects = ['All', 'Computer Science', 'Mathematics', 'Biology', 'Economics', 'Physics'];

  useEffect(() => {
    async function loadNotes() {
      const data = await fetchAllNotes({
        searchQuery,
        subject: selectedSubject,
        courseCode: courseCodeFilter,
        sortBy,
      });
      setNotes(data);
    }
    loadNotes();
  }, [searchQuery, selectedSubject, courseCodeFilter, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-sky-400" />
            Note-Sharing Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Browse, filter, and download crowd-sourced study notes, cheatsheets, and past exam kits.</p>
        </div>

        <Link
          href="/notes/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-colors w-fit"
        >
          <UploadCloud className="w-4 h-4" />
          Share Note PDF
        </Link>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, course code (CS161), or tag (#Algorithms)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="popular">Most Popular (Upvotes)</option>
              <option value="downloads">Most Downloaded</option>
              <option value="recent">Recently Uploaded</option>
            </select>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Subject:
          </span>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Study Notes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your search query or subject filters, or be the first to upload notes for this course!</p>
          <Link
            href="/notes/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
          >
            Upload Note PDF
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPreview={(selected) => setSelectedNote(selected)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedNote && (
        <NotePreviewModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}

    </div>
  );
}

export default function NotesDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading notes...</div>}>
      <NotesDirectoryPageContent />
    </Suspense>
  );
}
