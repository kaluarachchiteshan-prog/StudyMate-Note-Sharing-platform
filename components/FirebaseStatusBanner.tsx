'use client';

import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function FirebaseStatusBanner() {
  const { isFirebaseActive } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          {isFirebaseActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Firebase Live Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              <Database className="w-3.5 h-3.5" />
              Mock Storage & Auth Mode Active
            </span>
          )}
          <span className="hidden md:inline text-slate-400">
            {isFirebaseActive 
              ? 'Connected to your real Cloud Firestore & Firebase Storage bucket.' 
              : 'All study notes, filters, groups, and uploads work seamlessly out-of-the-box using built-in datasets.'}
          </span>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-all"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Config Info</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-lg text-white">Firebase Setup & Status</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300">
              The application is configured to run smoothly both with real Firebase keys or in zero-friction Mock Mode.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <p><span className="text-indigo-400">NEXT_PUBLIC_FIREBASE_PROJECT_ID</span>: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set (Using Mock)'}</p>
              <p><span className="text-indigo-400">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</span>: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</p>
            </div>

            <div className="text-xs text-slate-400 space-y-2">
              <p className="font-medium text-slate-200">How to connect your Firebase backend:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">console.firebase.google.com</a>.</li>
                <li>Enable Firebase Auth (Email & Google), Firestore DB, and Cloud Storage.</li>
                <li>Copy configuration values into your <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">.env.local</code> file based on <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">.env.example</code>.</li>
              </ol>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Got it, continue studying
            </button>
          </div>
        </div>
      )}
    </>
  );
}
