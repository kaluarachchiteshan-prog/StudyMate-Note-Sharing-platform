'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, GraduationCap, Sparkles, BookOpen } from 'lucide-react';
import { UserProfile, StudyGroup } from '@/types';
import { MOCK_USERS, MOCK_STUDY_GROUPS } from '@/lib/mockData';
import { fetchStudents, fetchAllStudyGroups } from '@/lib/firebase/firestore';
import StudentCard from '@/components/StudentCard';
import StudyGroupCard from '@/components/StudyGroupCard';
import CreateGroupModal from '@/components/CreateGroupModal';

export default function StudyMatesPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'groups'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All Universities');
  const [students, setStudents] = useState<UserProfile[]>(MOCK_USERS);
  const [groups, setGroups] = useState<StudyGroup[]>(MOCK_STUDY_GROUPS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const universities = ['All Universities', 'Stanford University', 'MIT', 'UC Berkeley', 'NYU'];

  const reloadData = async () => {
    const sData = await fetchStudents(selectedUniversity, searchQuery);
    setStudents(sData);
    const gData = await fetchAllStudyGroups();
    setGroups(gData);
  };

  useEffect(() => {
    reloadData();
  }, [selectedUniversity, searchQuery]);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = !searchQuery || 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUni = selectedUniversity === 'All Universities' || g.university.toLowerCase() === selectedUniversity.toLowerCase();
    return matchesSearch && matchesUni;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-sky-400" />
            Study Mate & Group Finder
          </h1>
          <p className="text-xs text-slate-400 mt-1">Connect with students sharing your enrolled courses or create a study squad.</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Study Group
        </button>
      </div>

      {/* Tabs & Search Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Main Tab Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 w-fit text-xs font-semibold">
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'groups' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Study Groups ({filteredGroups.length})
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'students' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Directory ({students.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'groups' ? "Filter CS161, Algorithms groups..." : "Filter CS106B, Stanford peers..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

        </div>

        {/* University Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> University:
          </span>
          {universities.map((uni) => (
            <button
              key={uni}
              onClick={() => setSelectedUniversity(uni)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedUniversity === uni
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {uni}
            </button>
          ))}
        </div>

      </div>

      {/* Grid Content */}
      {activeTab === 'groups' ? (
        filteredGroups.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Study Groups Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Be the pioneer! Create a study group for your university course.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
            >
              Create Study Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((group) => (
              <StudyGroupCard key={group.id} group={group} onStateChange={reloadData} />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => (
            <StudentCard key={student.uid} student={student} />
          ))}
        </div>
      )}

      {/* Group Creation Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={reloadData}
      />

    </div>
  );
}
