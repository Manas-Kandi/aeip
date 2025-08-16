'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editors'), { ssr: false });

export default function EditPageClient() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="mb-4 text-2xl font-semibold">Edit Files</h1>
      <Editor />
    </main>
  );
}