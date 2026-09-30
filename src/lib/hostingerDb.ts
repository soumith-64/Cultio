/**
 * CULTIVO — Hostinger Persistent Database Engine
 * 
 * Provides persistent server-side storage for:
 * 1. Specimen Photos (Photo metadata, storage paths, URLs, sizes)
 * 2. Diagnostic Crop Reports (Field telemetry, AI diagnosis, Expert reviews)
 * 
 * Stored persistently on Hostinger server filesystem (data/hostinger_db.json)
 * with atomic non-blocking write locking.
 */

import fs from 'fs';
import path from 'path';
import { CropReport, ExpertReview, ReportStatus } from '@/types';

export interface PhotoRecord {
  id: string;
  filename: string;
  url: string;
  download_url: string;
  user_id: string;
  size_bytes?: number;
  mime_type?: string;
  created_at: string;
}

interface HostingerDbSchema {
  photos: PhotoRecord[];
  reports: CropReport[];
  version: number;
  last_updated: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hostinger_db.json');

// Memory cache + write queue to prevent race conditions during concurrent requests
let isWriting = false;
const writeQueue: Array<() => Promise<void>> = [];

async function ensureDbInitialized(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: HostingerDbSchema = {
      photos: [],
      reports: [],
      version: 1,
      last_updated: new Date().toISOString(),
    };
    await fs.promises.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
  }
}

async function readDb(): Promise<HostingerDbSchema> {
  await ensureDbInitialized();
  try {
    const data = await fs.promises.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(data) as HostingerDbSchema;
    if (!Array.isArray(parsed.photos)) parsed.photos = [];
    if (!Array.isArray(parsed.reports)) parsed.reports = [];
    return parsed;
  } catch (err) {
    console.error('[Hostinger DB] Failed to read database file, initializing clean DB:', err);
    return {
      photos: [],
      reports: [],
      version: 1,
      last_updated: new Date().toISOString(),
    };
  }
}

async function writeDb(dbData: HostingerDbSchema): Promise<void> {
  await ensureDbInitialized();
  dbData.last_updated = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const executeWrite = async () => {
      isWriting = true;
      try {
        const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
        await fs.promises.writeFile(tempFile, JSON.stringify(dbData, null, 2), 'utf8');
        await fs.promises.rename(tempFile, DB_FILE);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        isWriting = false;
        if (writeQueue.length > 0) {
          const next = writeQueue.shift();
          if (next) next();
        }
      }
    };

    if (isWriting) {
      writeQueue.push(executeWrite);
    } else {
      executeWrite();
    }
  });
}

export class HostingerDb {
  // ── PHOTO STORAGE IN HOSTINGER DB ─────────────────────────
  public static async recordPhoto(photo: Omit<PhotoRecord, 'id' | 'created_at'>): Promise<PhotoRecord> {
    const db = await readDb();
    const newRecord: PhotoRecord = {
      ...photo,
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    db.photos.unshift(newRecord);
    await writeDb(db);
    return newRecord;
  }

  public static async getPhotos(userId?: string): Promise<PhotoRecord[]> {
    const db = await readDb();
    if (!userId) return db.photos;
    return db.photos.filter((p) => p.user_id === userId);
  }

  // ── CROP REPORTS IN HOSTINGER DB ───────────────────────────
  public static async saveReport(report: CropReport): Promise<CropReport> {
    const db = await readDb();
    const existingIndex = db.reports.findIndex((r) => r.id === report.id);

    if (existingIndex >= 0) {
      db.reports[existingIndex] = {
        ...db.reports[existingIndex],
        ...report,
        updated_at: new Date().toISOString(),
      };
    } else {
      db.reports.unshift(report);
    }

    await writeDb(db);
    return report;
  }

  public static async updateReportStatus(
    reportId: string,
    status: ReportStatus
  ): Promise<CropReport | null> {
    const db = await readDb();
    const report = db.reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.status = status;
    report.updated_at = new Date().toISOString();
    await writeDb(db);
    return report;
  }

  public static async submitExpertReview(
    reportId: string,
    review: ExpertReview
  ): Promise<CropReport | null> {
    const db = await readDb();
    const report = db.reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.expert_review = review;
    report.status = 'EXPERT_REVIEWED';
    report.updated_at = new Date().toISOString();
    await writeDb(db);
    return report;
  }

  public static async getReportById(reportId: string): Promise<CropReport | null> {
    const db = await readDb();
    return db.reports.find((r) => r.id === reportId) ?? null;
  }

  public static async getReportsByFarmer(farmerId: string): Promise<CropReport[]> {
    const db = await readDb();
    const filtered = db.reports.filter(
      (r) => r.farmer_id === farmerId || (farmerId !== 'guest_farmer' && r.farmer_id === 'guest_farmer')
    );
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public static async getAllReports(): Promise<CropReport[]> {
    const db = await readDb();
    return db.reports.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}
