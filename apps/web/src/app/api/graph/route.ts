import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'examples', 'graphs', 'sample.json');

export async function GET() {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ nodes: [], edges: [] });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}