'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_NOTES } from '@/lib/mockData';
import NotePreviewModal from '@/components/NotePreviewModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const note = MOCK_NOTES.find((n) => n.id === id) || MOCK_NOTES[0];

  return (
    <div className="space-y-4">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Notes Hub
      </button>

      <NotePreviewModal
        note={note}
        onClose={() => router.push('/notes')}
      />
    </div>
  );
}
