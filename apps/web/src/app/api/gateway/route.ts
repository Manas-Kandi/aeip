import { NextResponse } from 'next/server';
import axios from 'axios';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const { path, method, body } = await request.json();
    const url = `${GATEWAY_URL}${path}`;

    let response;
    if (method === 'POST') {
      response = await axios.post(url, body);
    } else if (method === 'GET') {
      response = await axios.get(url);
    } else {
      return NextResponse.json({ error: 'Method not supported' }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
