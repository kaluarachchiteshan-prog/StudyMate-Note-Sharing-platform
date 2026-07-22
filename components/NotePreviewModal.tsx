'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Share2, 
  MessageSquare, 
  Send, 
  GraduationCap, 
  Calendar, 
  HardDrive, 
  CheckCircle2 
} from 'lucide-react';
import { StudyNote, Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { MOCK_COMMENTS } from '@/lib/mockData';
import { toggleNoteVote } from '@/lib/firebase/firestore';

interface NotePreviewModalProps {
  note: StudyNote | null;
  onClose: () => void;
}

export default function NotePreviewModal({ note, onClose }: NotePreviewModalProps) {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'preview' | 'comments'>('preview');
  const [upvotes, setUpvotes] = useState(note?.upvotes || 0);
  const [downvotes, setDownvotes] = useState(note?.downvotes || 0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(note?.userVote || null);
  const [comments, setComments] = useState<Comment[]>(
    note ? MOCK_COMMENTS[note.id] || [] : []
  );
  const [newComment, setNewComment] = useState('');

  if (!note) return null;

  const handleVote = async (type: 'up' | 'down') => {
    const res = await toggleNoteVote(note.id, type);
    setUpvotes(res.upvotes);
    setDownvotes(res.downvotes);
    setUserVote(res.userVote);
    showToast(res.userVote === 'up' ? 'Upvoted (+1 Rep)' : 'Vote updated', 'info');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    const added: Comment = {
      id: `c_${Date.now()}`,
      noteId: note.id,
      authorId: user.uid,
      authorName: user.displayName,
      authorAvatar: user.photoURL,
      content: newComment.trim(),
      createdAt: 'Just now',
      likes: 0,
    };
    setComments([added, ...comments]);
    setNewComment('');
    showToast('Comment posted!', 'success');
  };

  const handleDownload = () => {
    showToast(`Downloading "${note.fileName}" (${note.fileSize})...`, 'success');
    const a = document.createElement('a');
    a.href = note.fileUrl;
    a.download = note.fileName;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                  {note.courseCode}
                </span>
                <span className="text-xs text-slate-400">{note.university}</span>
              </div>
              <h2 className="font-display font-semibold text-lg text-white truncate max-w-lg">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'preview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Document Reader & Content
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'comments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Discussion & Feedback ({comments.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900">
          
          {activeTab === 'preview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Main Document Content */}
              <div className="lg:col-span-2 space-y-4">
                
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white text-sm">About this Study Note</p>
                  <p>{note.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {note.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PDF Text Reader Box */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed space-y-3 relative shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Embedded Preview Reader
                    </span>
                    <span>Format: {note.fileType.toUpperCase()} ({note.fileSize})</span>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-slate-300">
                    {note.previewText || 'Sample preview content not extracted for this file format.'}
                  </pre>
                </div>

              </div>

              {/* Right Col: Author Metadata & Voting */}
              <div className="space-y-4">
                
                {/* Author Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contributor Profile</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={note.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={note.authorName}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{note.authorName}</h4>
                      <p className="text-xs text-indigo-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> {note.authorUniversity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating & Engagement Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Community Rating</p>
                  
                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <button
                      onClick={() => handleVote('up')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        userVote === 'up' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Upvote ({upvotes})
                    </button>

                    <button
                      onClick={() => handleVote('down')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        userVote === 'down' 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-rose-400'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5 text-indigo-400" /> Downloads</span>
                      <span className="font-mono font-bold text-white">{note.downloadsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Uploaded</span>
                      <span className="font-mono text-slate-300">{note.createdAt}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Comments & Discussion Tab */
            <div className="space-y-6">
              
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask a question about this note or post feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No comments yet. Be the first to start the discussion!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img src={c.authorAvatar} alt={c.authorName} className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-semibold text-white">{c.authorName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-300 pl-7">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
