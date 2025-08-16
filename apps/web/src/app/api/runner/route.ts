import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, args } = body;

    if (command !== 'run') {
      return NextResponse.json({ error: 'Only 'run' command is supported' }, { status: 400 });
    }

    const runnerPath = path.resolve(process.cwd(), '../../packages/runner/dist/index.js');
    const cmd = `node ${runnerPath} ${command} ${args.join(' ')}`;

    console.log(`Executing runner command: ${cmd}`);

    return new Promise((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return resolve(NextResponse.json({ error: stderr || error.message }, { status: 500 }));
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          // return resolve(NextResponse.json({ error: stderr }, { status: 500 }));
        }
        console.log(`stdout: ${stdout}`);
        resolve(NextResponse.json({ stdout, stderr }));
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
