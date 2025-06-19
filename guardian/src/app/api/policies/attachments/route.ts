import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file');
    const savedFiles = [];
    for (const file of files) {
      if (typeof file === 'object' && 'arrayBuffer' in file && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), 'public', fileName);
        await fs.writeFile(filePath, buffer);
        savedFiles.push({ url: `/${fileName}`, name: file.name });
      }
    }
    return NextResponse.json({ success: true, files: savedFiles });
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
      message = (err as { message: string }).message;
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 