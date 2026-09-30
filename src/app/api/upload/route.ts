import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileName = '';
    let buffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const userId = (formData.get('userId') as string) || 'guest';

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const cleanName = (file.name || 'specimen.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${Date.now()}_${userId}_${cleanName}`;
    } else {
      // JSON body with base64
      const body = await req.json();
      const { image_base64, file_name, userId = 'guest' } = body;

      if (!image_base64) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      const cleanName = (file_name || 'specimen.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${Date.now()}_${userId}_${cleanName}`;
    }

    // Save to public/uploads on Hostinger server
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      downloadUrl: publicUrl,
      storagePath: publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('[Upload API] Error saving image on server:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo to Hostinger server' },
      { status: 500 }
    );
  }
}
