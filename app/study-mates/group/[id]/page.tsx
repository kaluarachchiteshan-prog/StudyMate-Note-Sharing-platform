'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Calendar, 
  BookOpen, 
  ArrowLeft, 
  Lock, 
  Globe, 
  Check, 
  Download,
  Share2
} from 'lucide-react';
import { MOCK_STUDY_GROUPS, MOCK_GROUP_MESSAGES, MOCK_NOTES } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { GroupMessage } from '@/types';
import Link from 'next/link';

export default function StudyGroupHubPage() {
  const params = useParams();
  const router = useRouter();
  const { user, showToast } = useAuth();
  const groupId = params.id as string;

  const group = MOCK_STUDY_GROUPS.find(g => g.id === groupId) || MOCK_STUDY_GROUPS[0];
  const [messages, setMessages] = useState<GroupMessage[]>(
    MOCK_GROUP_MESSAGES[group.id] || []
  );
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user) return;

    const newMsg: GroupMessage = {
      id: `msg_${Date.now()}`,
      groupId: group.id,
      senderId: user.uid,
      senderName: user.displayName,
      senderAvatar: user.photoURL,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
    showToast('Message sent to study group chat!', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Study Groups
      </button>

      {/* Group Header Card */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={group.avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=250'}
              alt={group.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold text-xs">
                  {group.courseCode}
                </span>
                <span className="text-xs text-slate-400">{group.university}</span>
              </div>
              <h1 className="font-display font-bold text-xl text-white">{group.name}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{group.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {group.meetingSchedule}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat & Group Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Group Live Chat */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 border border-slate-800 flex flex-col h-[520px]">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <span className="font-semibold text-white text-xs flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Live Group Chat Room
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {group.memberCount} members online
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No chat messages yet. Start the conversation!</p>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.uid;
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img src={m.senderAvatar} alt={m.senderName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className={`max-w-[75%] rounded-2xl p-3 text-xs ${
                      isMe 
                        ? 'bg-sky-600 text-white' 
                        : 'bg-slate-950 text-slate-200 border border-slate-800'
                    }`}>
                      <div className={`flex items-center gap-2 text-[10px] mb-1 font-semibold ${isMe ? 'text-sky-200' : 'text-sky-400'}`}>
                        <span>{m.senderName}</span>
                        <span className="font-normal opacity-70">{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Type message to group..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>

        </div>

        {/* Right Col: Shared Resources & Member Roster */}
        <div className="space-y-4">
          
          {/* Shared Note Resources */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-400" /> Group Shared Notes
              </span>
              <span className="text-[10px] text-sky-400 font-bold">{group.sharedResourceCount} PDFs</span>
            </div>

            <div className="space-y-2">
              {MOCK_NOTES.slice(0, 2).map((resNote) => (
                <Link
                  key={resNote.id}
                  href={`/notes/${resNote.id}`}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 block hover:border-sky-500/40 transition-colors"
                >
                  <p className="text-xs font-semibold text-white truncate">{resNote.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{resNote.courseCode}</span>
                    <span className="text-sky-400 font-medium">Download PDF</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Member Roster */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-3">
            <p className="font-semibold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Users className="w-4 h-4 text-sky-400" /> Group Member Roster
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <img src={group.avatarUrl} alt={group.creatorName} className="w-6 h-6 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-white text-[11px]">{group.creatorName}</p>
                  <p className="text-[9px] text-amber-400 font-medium">Group Founder</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
