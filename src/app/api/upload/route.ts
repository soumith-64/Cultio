import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { HostingerDb } from '@/lib/hostingerDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileName = '';
    let buffer: Buffer;
    let userId = 'guest';
    let mimeType = 'image/jpeg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      userId = (formData.get('userId') as string) || 'guest';

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      mimeType = file.type || 'image/jpeg';
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const cleanName = (file.name || 'specimen.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${Date.now()}_${userId}_${cleanName}`;
    } else {
      // JSON body with base64
      const body = await req.json();
      const { image_base64, file_name, userId: reqUserId = 'guest' } = body;
      userId = reqUserId;

      if (!image_base64) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      const matchMime = image_base64.match(/^data:(image\/\w+);base64,/);
      if (matchMime) {
        mimeType = matchMime[1];
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

    // Record photo in Hostinger DB
    const photoRecord = await HostingerDb.recordPhoto({
      filename: fileName,
      url: publicUrl,
      download_url: publicUrl,
      user_id: userId,
      size_bytes: buffer.length,
      mime_type: mimeType,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      downloadUrl: publicUrl,
      storagePath: publicUrl,
      fileName,
      photoId: photoRecord.id,
      storage: 'hostinger_db',
    });
  } catch (error: any) {
    console.error('[Upload API] Error saving image on Hostinger server:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo to Hostinger server' },
      { status: 500 }
    );
  }
}
