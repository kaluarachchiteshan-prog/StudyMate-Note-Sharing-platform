'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { uploadNoteFile } from '@/lib/firebase/storage';
import { createNewNote } from '@/lib/firebase/firestore';

export default function DragDropUpload() {
  const router = useRouter();
  const { user, showToast, updateUserProfile } = useAuth();
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Midterm', 'Notes']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.type.includes('text')) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '));
        }
      } else {
        showToast('Please upload a valid PDF or document file.', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a PDF file to upload.', 'error');
      return;
    }
    if (!title.trim() || !courseCode.trim()) {
      showToast('Please provide a note title and course code.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Step 1: Upload file to storage / blob
      setUploadProgress(50);
      const { url, fileName, fileSize } = await uploadNoteFile(selectedFile, courseCode);

      setUploadProgress(80);

      // Step 2: Create note metadata in DB
      const newNote = await createNewNote({
        title: title.trim(),
        description: description.trim() || 'No additional description provided.',
        subject,
        courseCode: courseCode.trim().toUpperCase(),
        university: user?.university || 'Stanford University',
        tags,
        fileUrl: url,
        fileName,
        fileSize,
        fileType: 'pdf',
        previewText: `EXCERPT FROM UPLOADED NOTE: ${title}\nCourse: ${courseCode.toUpperCase()} (${subject})\nUploaded by ${user?.displayName}\n\nKey Concepts covered:\n- Comprehensive lecture notes & formulas\n- Solved practice problems with explanations\n- Exam review notes & key reference definitions`,
        authorId: user?.uid || 'user_guest',
        authorName: user?.displayName || 'Scholar',
        authorAvatar: user?.photoURL,
        authorUniversity: user?.university || 'Stanford University',
      });

      setUploadProgress(100);

      if (user) {
        updateUserProfile({ 
          uploadedNotesCount: (user.uploadedNotesCount || 0) + 1,
          reputationPoints: (user.reputationPoints || 0) + 50 
        });
      }

      showToast('Note PDF uploaded successfully! (+50 Reputation Points)', 'success');
      setTimeout(() => {
        router.push('/notes');
      }, 1000);

    } catch (error) {
      console.error(error);
      showToast('Error uploading note. Please try again.', 'error');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">Share Your Study Notes & Earn Points</h1>
            <p className="text-xs text-slate-300">Upload PDF lecture notes, exam guides, or cheatsheets to assist your university peers.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Drag & Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive 
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' 
              : selectedFile 
              ? 'border-emerald-500/50 bg-emerald-500/5' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <FileText className="w-7 h-7" />
              </div>
              <p className="font-semibold text-white text-sm">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Ready</p>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="mt-2 text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">Drag & Drop Note PDF here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse from your computer (Max 25MB)</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                Supports PDF, DOCX, TXT
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar if Uploading */}
        {isUploading && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Uploading & Processing PDF...</span>
              <span className="font-mono font-bold text-indigo-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata Inputs */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Note Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS161 Graph Algorithms & DP Master Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS161, BIO7.012, MATH51"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject Area</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Economics">Economics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">University / School</label>
              <input
                type="text"
                readOnly
                value={user?.university || 'Stanford University'}
                className="w-full bg-slate-950/60 border border-slate-800/60 text-slate-400 rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description & Key Topics</label>
            <textarea
              rows={3}
              placeholder="Outline what topics this document covers, midterm relevance, or helpful formulas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Tags & Keywords</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag (e.g. Midterm, DynamicProgramming)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, idx) => (
                <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs">
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <UploadCloud className="w-5 h-5" />
          {isUploading ? 'Publishing Note...' : 'Publish Study Note'}
        </button>

      </form>
    </div>
  );
}
