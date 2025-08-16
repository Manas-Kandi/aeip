'use client';

import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('@/components/Canvas'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const Properties = dynamic(() => import('@/components/Properties'), { ssr: false });
const Topbar = dynamic(() => import('@/components/TopbarSaveLoad'), { ssr: false });

export default function ModelPageClient() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <Topbar />
      <div className="grid grid-cols-12 gap-4 mt-4">
        <aside className="col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3">
          <Sidebar />
        </aside>
        <section className="col-span-6">
          <Canvas />
        </section>
        <aside className="col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3">
          <Properties />
        </aside>
      </div>
    </main>
  );
}