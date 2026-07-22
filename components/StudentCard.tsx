'use client';

import React from 'react';
import { GraduationCap, Award, MessageSquare, UserPlus, BookOpen, Check } from 'lucide-react';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface StudentCardProps {
  student: UserProfile;
}

export default function StudentCard({ student }: StudentCardProps) {
  const { user, showToast } = useAuth();
  const [connected, setConnected] = React.useState(false);

  const sharedCourses = user 
    ? student.enrolledCourses.filter(c => user.enrolledCourses.includes(c))
    : [];

  const handleConnect = () => {
    setConnected(!connected);
    showToast(connected ? `Disconnected from ${student.displayName}` : `Connection request sent to ${student.displayName}!`, 'success');
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
      
      <div className="space-y-3">
        {/* Profile Header */}
        <div className="flex items-start gap-3">
          <img
            src={student.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={student.displayName}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{student.displayName}</h3>
            <p className="text-xs text-indigo-400 font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              {student.university}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{student.major}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {student.bio}
        </p>

        {/* Mutual Courses */}
        {sharedCourses.length > 0 && (
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Shared Courses: <strong className="text-white">{sharedCourses.join(', ')}</strong></span>
          </div>
        )}

        {/* Enrolled Courses Pills */}
        <div className="flex flex-wrap gap-1">
          {student.enrolledCourses.map((c, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
          <Award className="w-3.5 h-3.5" /> {student.reputationPoints} Rep
        </span>

        <button
          onClick={handleConnect}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            connected 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          {connected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          {connected ? 'Connected' : 'Study Partner'}
        </button>
      </div>

    </div>
  );
}
