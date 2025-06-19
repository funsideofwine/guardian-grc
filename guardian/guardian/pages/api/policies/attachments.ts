import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ATTACHMENTS_DIR = path.join(process.cwd(), 'attachments');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure attachments directory exists
  if (!fs.existsSync(ATTACHMENTS_DIR)) {
    fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir: ATTACHMENTS_DIR,
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, (err: Error | null, fields: any, files: any) => {
    if (err) {
      return res.status(500).json({ error: 'File upload error', details: err.message });
    }
    const uploadedFiles = Array.isArray(files.file)
      ? files.file
      : files.file
      ? [files.file]
      : [];
    const result = uploadedFiles.map((file: any) => ({
      url: `/attachments/${path.basename(file.filepath || file.path)}`,
      name: file.originalFilename || file.newFilename || path.basename(file.filepath || file.path),
    }));
    return res.status(200).json({ files: result });
  });
} 