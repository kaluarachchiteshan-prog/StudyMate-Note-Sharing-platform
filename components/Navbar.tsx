'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Search, 
  Upload, 
  User, 
  LogOut, 
  BookOpen, 
  Users, 
  Award,
  ChevronDown,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_USERS } from '@/lib/mockData';

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const { user, switchMockUser, showToast } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMockSelector, setShowMockSelector] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-blue-950/80 backdrop-blur-md border-b border-blue-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                StudyMate <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Hub</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Notes & Peer Learning Platform</p>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search CS161, Algorithms, Stanford notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/90 border border-slate-800 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </form>

        {/* Right: Upload & User Controls */}
        <div className="flex items-center gap-3">
          
          <Link
            href="/notes/upload"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Share Note PDF</span>
          </Link>

          {/* User Profile / Mock Context Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
                <div className="hidden xl:block text-left pr-1">
                  <p className="text-xs font-semibold text-white leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-indigo-400 font-medium leading-none mt-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> {user.reputationPoints} pts
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2">
                    <p className="font-semibold text-white text-sm">{user.displayName}</p>
                    <p className="text-slate-400 text-xs">{user.email}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
                      <span>{user.university}</span>
                      <span className="font-semibold text-indigo-400">{user.major}</span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>My Profile & Settings</span>
                  </Link>

                  <Link
                    href="/notes"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>My Bookmarks & Uploads</span>
                  </Link>

                  <div className="pt-2 border-t border-slate-800/80 mt-1">
                    <button
                      onClick={() => {
                        setShowMockSelector(!showMockSelector);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Switch Persona User
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMockSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showMockSelector && (
                      <div className="mt-1 p-1 bg-slate-950 rounded-xl border border-slate-800 space-y-1 max-h-40 overflow-y-auto">
                        {MOCK_USERS.map((mockU) => (
                          <button
                            key={mockU.uid}
                            onClick={() => {
                              switchMockUser(mockU.uid);
                              setShowUserDropdown(false);
                              setShowMockSelector(false);
                            }}
                            className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${
                              user.uid === mockU.uid ? 'bg-indigo-600/30 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <img src={mockU.photoURL} alt={mockU.displayName} className="w-6 h-6 rounded-full object-cover" />
                            <div className="truncate">
                              <p className="text-[11px] leading-tight font-semibold text-white">{mockU.displayName}</p>
                              <p className="text-[9px] text-slate-400 truncate">{mockU.university}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
