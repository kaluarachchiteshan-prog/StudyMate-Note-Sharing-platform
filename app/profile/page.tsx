'use client';

import React, { useState, useRef } from 'react';
import { User, GraduationCap, Award, BookOpen, Bookmark, Save, Sparkles, CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_NOTES } from '@/lib/mockData';
import NoteCard from '@/components/NoteCard';
import NotePreviewModal from '@/components/NotePreviewModal';
import { StudyNote } from '@/types';

export default function ProfilePage() {
  const { user, updateUserProfile, showToast } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [university, setUniversity] = useState(user?.university || 'Stanford University');
  const [school, setSchool] = useState(user?.school || 'School of Engineering');
  const [major, setMajor] = useState(user?.major || 'Computer Science');
  const [coursesInput, setCoursesInput] = useState(user?.enrolledCourses.join(', ') || 'CS106B, CS161, MATH51');
  const [bio, setBio] = useState(user?.bio || '');
  
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'uploads'>('bookmarks');
  
  // Profile picture upload state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedNotes = MOCK_NOTES.filter(n => user?.savedBookmarkIds.includes(n.id));
  const uploadedNotes = MOCK_NOTES.filter(n => n.authorId === user?.uid);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5MB', 'error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoPreview) return;

    setIsUploadingPhoto(true);
    try {
      // In a real app, you would upload to a server/Firebase storage
      // For now, we'll update the profile with the base64 image
      await updateUserProfile({
        photoURL: photoPreview,
      });
      showToast('Profile picture updated successfully!', 'success');
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      showToast('Failed to upload profile picture', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const cancelPhotoUpload = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const enrolledCourses = coursesInput.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
    updateUserProfile({
      displayName,
      university,
      school,
      major,
      enrolledCourses,
      bio,
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-950/90 border border-blue-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user?.displayName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-sky-500/30 transition-opacity group-hover:opacity-70"
              />
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div>
              <h1 className="font-display font-bold text-2xl text-white">{user?.displayName}</h1>
              <p className="text-xs text-sky-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                {user?.university} • {user?.major}
              </p>
              <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">Reputation Score</p>
              <p className="font-display font-bold text-amber-400 text-lg flex items-center gap-1">
                <Award className="w-4 h-4 fill-amber-400" /> {user?.reputationPoints} pts
              </p>
            </div>
          </div>

        </div>

        {/* Bio quote */}
        {user?.bio && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 italic">
            "{user.bio}"
          </div>
        )}
      </div>

      {/* Profile Setup Form */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            Edit Profile Details
          </h2>
          <span className="text-xs text-slate-400">Manage school, major, and course roster</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">University / College</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">School / Department</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Major / Specialization</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Enrolled Course Codes (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. CS106B, CS161, MATH51"
              value={coursesInput}
              onChange={(e) => setCoursesInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Scholar Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Updates
          </button>
        </form>
      </div>

      {/* Bookmarks & Uploaded Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`font-display font-semibold text-sm flex items-center gap-2 pb-2 transition-all border-b-2 ${
              activeTab === 'bookmarks' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Saved Bookmarks ({savedNotes.length})
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`font-display font-semibold text-sm flex items-center gap-2 pb-2 transition-all border-b-2 ${
              activeTab === 'uploads' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> My Uploaded Notes ({uploadedNotes.length})
          </button>
        </div>

        {activeTab === 'bookmarks' ? (
          savedNotes.length === 0 ? (
            <p className="text-xs text-slate-500 py-6">No saved bookmarks yet. Browse the Note-Sharing Hub to save notes for quick review!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedNotes.map(n => (
                <NoteCard key={n.id} note={n} onPreview={(s) => setSelectedNote(s)} />
              ))}
            </div>
          )
        ) : (
          uploadedNotes.length === 0 ? (
            <p className="text-xs text-slate-500 py-6">You haven't uploaded notes yet. Upload your first PDF note to earn 50 reputation points!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {uploadedNotes.map(n => (
                <NoteCard key={n.id} note={n} onPreview={(s) => setSelectedNote(s)} />
              ))}
            </div>
          )
        )}
      </div>

      {selectedNote && (
        <NotePreviewModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {/* Profile Photo Upload Modal */}
      {photoPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-white">New Profile Picture</h3>
              <button
                onClick={cancelPhotoUpload}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Preview</div>
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-64 rounded-2xl object-cover ring-4 ring-sky-500/30"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="flex-1 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isUploadingPhoto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Upload
                  </>
                )}
              </button>
              <button
                onClick={cancelPhotoUpload}
                disabled={isUploadingPhoto}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
