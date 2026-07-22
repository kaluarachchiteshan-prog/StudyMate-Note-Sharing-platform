'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  Eye, 
  Bookmark, 
  MessageSquare,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { StudyNote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toggleNoteVote } from '@/lib/firebase/firestore';

interface NoteCardProps {
  note: StudyNote;
  onPreview: (note: StudyNote) => void;
}

export default function NoteCard({ note, onPreview }: NoteCardProps) {
  const { user, updateUserProfile, showToast } = useAuth();
  const [upvotes, setUpvotes] = useState(note.upvotes);
  const [downvotes, setDownvotes] = useState(note.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(note.userVote || null);
  const isBookmarked = user?.savedBookmarkIds.includes(note.id) || false;

  const handleVote = async (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    const res = await toggleNoteVote(note.id, type);
    setUpvotes(res.upvotes);
    setDownvotes(res.downvotes);
    setUserVote(res.userVote);
    showToast(res.userVote === 'up' ? 'Upvoted note (+1 point)' : res.userVote === 'down' ? 'Downvoted note' : 'Vote removed', 'info');
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const existing = user.savedBookmarkIds || [];
    const updated = isBookmarked 
      ? existing.filter(id => id !== note.id) 
      : [...existing, note.id];
    
    updateUserProfile({ savedBookmarkIds: updated });
    showToast(isBookmarked ? 'Removed from saved bookmarks' : 'Added to saved bookmarks', 'success');
  };

  return (
    <div 
      onClick={() => onPreview(note)}
      className="group relative glass-card glass-card-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between border border-slate-800 hover:border-indigo-500/40 transition-all duration-300"
    >
      
      {/* Top Header: Subject Badge & Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
              {note.courseCode}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-medium">
              {note.subject}
            </span>
          </div>

          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Save bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Note Title */}
        <h3 className="font-display font-semibold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
          {note.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {note.description}
        </p>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Engagement */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        
        {/* Author & School */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img
              src={note.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={note.authorName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
            />
            <span className="font-medium text-slate-300 truncate max-w-[110px]">{note.authorName}</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[110px]">
            <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
            {note.university.split(' ')[0]}
          </span>
        </div>

        {/* Action Controls (Upvote/Downvote/Download) */}
        <div className="flex items-center justify-between text-xs pt-1">
          
          <div className="flex items-center gap-1.5 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
            <button
              onClick={(e) => handleVote(e, 'up')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                userVote === 'up' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{upvotes}</span>
            </button>

            <span className="w-px h-3 bg-slate-800" />

            <button
              onClick={(e) => handleVote(e, 'down')}
              className={`p-1 rounded-md text-[11px] transition-colors ${
                userVote === 'down' 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              {note.downloadsCount}
            </span>
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <Eye className="w-3.5 h-3.5" /> Preview
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
