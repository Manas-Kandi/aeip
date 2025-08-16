import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function safePath(rel: string) {
  const base = process.cwd();
  const abs = path.join(base, rel);
  if (!abs.startsWith(base)) throw new Error('Invalid path');
  return abs;
}

export async function GET(req: NextRequest) {
  const rel = new URL(req.url).searchParams.get('path')!;
  try {
    const data = await fs.readFile(safePath(rel), 'utf-8');
    return new NextResponse(data, { headers: { 'Content-Type': 'text/plain' } });
  } catch {
    return new NextResponse('', { headers: { 'Content-Type': 'text/plain' } });
  }
}

export async function POST(req: NextRequest) {
  const { path: rel, text } = await req.json();
  await fs.mkdir(path.dirname(safePath(rel)), { recursive: true });
  await fs.writeFile(safePath(rel), text ?? '', 'utf-8');
  return NextResponse.json({ ok: true });
}