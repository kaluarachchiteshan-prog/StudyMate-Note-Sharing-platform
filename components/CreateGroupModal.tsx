'use client';

import React, { useState } from 'react';
import { X, Users, Calendar, Lock, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createStudyGroup } from '@/lib/firebase/firestore';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onCreated }: CreateGroupModalProps) {
  const { user, showToast } = useAuth();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('Wednesdays @ 6:00 PM');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState(8);
  const [tagsInput, setTagsInput] = useState('ExamPrep, HomeworkSync');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseCode.trim()) {
      showToast('Please provide a group name and course code.', 'error');
      return;
    }

    const tagList = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    await createStudyGroup({
      name: name.trim(),
      description: description.trim() || 'Collaborative university study room.',
      subject,
      courseCode: courseCode.trim().toUpperCase(),
      university: user?.university || 'Stanford University',
      isPrivate,
      memberIds: [user?.uid || 'user_alex_dev'],
      maxMembers,
      creatorId: user?.uid || 'user_alex_dev',
      creatorName: user?.displayName || 'Alex Chen',
      meetingSchedule,
      tags: tagList.length ? tagList : ['StudySession'],
      avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=250',
    });

    showToast(`Study Group "${name}" created successfully!`, 'success');
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white">Create Peer Study Group</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-300 font-medium mb-1">Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. CS161 Problem Set Crew"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Course Code *</label>
              <input
                type="text"
                required
                placeholder="CS161"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Economics">Economics</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Meeting Schedule</label>
            <input
              type="text"
              placeholder="e.g. Tuesdays & Thursdays @ 6:00 PM PST"
              value={meetingSchedule}
              onChange={(e) => setMeetingSchedule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Group Description</label>
            <textarea
              rows={2}
              placeholder="What is the goal of this study group?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Roster Size</label>
              <input
                type="number"
                min={2}
                max={30}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Privacy Mode</label>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-colors ${
                  isPrivate 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {isPrivate ? 'Private (Invite Only)' : 'Public (Open Join)'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition-colors"
          >
            Create Study Group
          </button>

        </form>
      </div>
    </div>
  );
}
