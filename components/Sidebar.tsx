'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  Users, 
  User, 
  Sparkles,
  Flame,
  FileText,
  Bookmark,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Note-Sharing Hub', href: '/notes', icon: BookOpen },
    { name: 'Upload Note PDF', href: '/notes/upload', icon: Upload },
    { name: 'Study Mates & Groups', href: '/study-mates', icon: Users },
    { name: 'My Profile & Bio', href: '/profile', icon: User },
  ];

  const quickStats = [
    { label: 'Uploaded Notes', value: user?.uploadedNotesCount || 12, icon: FileText, color: 'text-indigo-400' },
    { label: 'Saved Bookmarks', value: user?.savedBookmarkIds.length || 2, icon: Bookmark, color: 'text-purple-400' },
    { label: 'Reputation Score', value: user?.reputationPoints || 485, icon: Flame, color: 'text-amber-400' },
  ];

  return (
    <aside 
      className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-slate-950/95 lg:bg-slate-950/60 border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">Main Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Card */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Scholar Stats
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
          </div>

          <div className="space-y-2">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    {stat.label}
                  </span>
                  <span className="font-bold text-white font-mono">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 text-xs text-slate-300">
        <p className="font-semibold text-white flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-indigo-400" /> Course Matcher
        </p>
        <p className="text-[11px] text-slate-400 mt-1">Connect with peer scholars taking your courses.</p>
      </div>

    </aside>
  );
}
