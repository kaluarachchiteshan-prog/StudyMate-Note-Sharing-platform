'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Calendar, Lock, Globe, ArrowRight, Check, BookOpen } from 'lucide-react';
import { StudyGroup } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { joinOrLeaveGroup } from '@/lib/firebase/firestore';

interface StudyGroupCardProps {
  group: StudyGroup;
  onStateChange?: () => void;
}

export default function StudyGroupCard({ group, onStateChange }: StudyGroupCardProps) {
  const { user, showToast } = useAuth();
  const isMember = user ? group.memberIds.includes(user.uid) : false;

  const handleJoinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const joined = await joinOrLeaveGroup(group.id, user.uid);
    showToast(joined ? `Joined "${group.name}"!` : `Left "${group.name}"`, joined ? 'success' : 'info');
    if (onStateChange) onStateChange();
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
      
      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
            {group.courseCode}
          </span>

          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
            group.isPrivate 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {group.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {group.isPrivate ? 'Private Room' : 'Public Squad'}
          </span>
        </div>

        <div>
          <h3 className="font-display font-semibold text-base text-white group-hover:text-indigo-300 transition-colors">
            {group.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {group.description}
          </p>
        </div>

        {/* Schedule & University */}
        <div className="space-y-1.5 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-indigo-300">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{group.meetingSchedule}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {group.tags.map((t, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer & Roster */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-white font-semibold">{group.memberCount}</span> / {group.maxMembers} Members
          </div>

          <span className="flex items-center gap-1 text-[11px] text-purple-400">
            <BookOpen className="w-3.5 h-3.5" /> {group.sharedResourceCount} Resources
          </span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleJoinToggle}
            className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isMember
                ? 'bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            {isMember ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Users className="w-3.5 h-3.5" />}
            {isMember ? 'Joined' : 'Join Group'}
          </button>

          <Link
            href={`/study-mates/group/${group.id}`}
            className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            View Group <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
