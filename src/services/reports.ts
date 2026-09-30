/**
 * CULTIVO — Reports Service & Real-Time Cloud Synchronization
 * 
 * CORE RULE ENFORCED:
 * "No prestored data, only using live analysis, but you can store previous analysis data and give suggestions"
 * 
 * Zero hardcoded/pre-stored reports.
 * Starts with empty clean state and stores only genuine live analyses.
 * Computes longitudinal suggestions from previously stored analyses in Hostinger DB.
 */

import { db, isFirebaseConfigured } from '@/config/firebase';
import {
  CropReport,
  ExpertReview,
  ReportStatus,
  HistoricalInsight,
  Severity,
} from '@/types';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

const REPORTS_COLLECTION = 'crop_reports';
const LOCAL_STORAGE_KEY = 'cultivo_reports_live_store';
const SYNC_EVENT_NAME = 'cultivo_reports_sync';

// Clean initial state: ZERO prestored data
function getLocalReports(): CropReport[] {
  if (typeof window === 'undefined') return [];
  try {
    // Purge any legacy prestored mock data if present
    const oldKey = localStorage.getItem('cultivo_prototype_reports');
    if (oldKey) {
      localStorage.removeItem('cultivo_prototype_reports');
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed: CropReport[] = JSON.parse(raw);
    
    // Filter out any legacy dummy or mock records if they exist
    return parsed.filter(
      (r) =>
        !r.id.startsWith('report_demo_') &&
        !r.id.startsWith('mock_') &&
        !r.id.startsWith('seed_') &&
        r.farmer_id !== 'sample_farmer_uid'
    );
  } catch {
    return [];
  }
}

function saveLocalReports(reports: CropReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: reports }));
  } catch (e) {
    console.error('Failed to save reports locally:', e);
  }
}

export class ReportsService {
  /**
   * Save a newly created crop diagnosis report
   * Storing in Hostinger Database and local cache for future trend suggestions
   */
  public static async createReport(report: CropReport): Promise<void> {
    // 1. Persist locally first for zero-latency UI updates & offline fallback
    const reports = getLocalReports();
    const existingIndex = reports.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    saveLocalReports(reports);

    // 2. Persist to Hostinger Server Database
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (hostingerErr) {
      console.warn('[ReportsService] Hostinger DB save warning:', hostingerErr);
    }

    // 3. Optional Firestore sync if configured
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, REPORTS_COLLECTION, report.id);
        await setDoc(docRef, report);
      } catch (err) {
        console.warn('[ReportsService] Firestore createReport sync warning:', err);
      }
    }
  }

  /**
   * Update report status (e.g. AI_ANALYZED -> PENDING_EXPERT)
   */
  public static async updateReportStatus(
    reportId: string,
    status: ReportStatus
  ): Promise<void> {
    const now = new Date().toISOString();

    // 1. Update local store
    const reports = getLocalReports();
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      report.status = status;
      report.updated_at = now;
      saveLocalReports(reports);
    }

    // 2. Update Hostinger Database
    try {
      await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      });
    } catch (hostingerErr) {
      console.warn('[ReportsService] Hostinger DB update warning:', hostingerErr);
    }

    // 3. Synchronize to Cloud Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(docRef, { status, updated_at: now });
      } catch (err) {
        console.warn('[ReportsService] Firestore updateReportStatus warning:', err);
      }
    }
  }

  /**
   * Submit an Agricultural Expert's professional assessment
   * Updates status to EXPERT_REVIEWED in real time
   */
  public static async submitExpertReview(
    reportId: string,
    review: ExpertReview
  ): Promise<void> {
    const now = new Date().toISOString();

    // 1. Update local store
    const reports = getLocalReports();
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      report.expert_review = review;
      report.status = 'EXPERT_REVIEWED';
      report.updated_at = now;
      saveLocalReports(reports);
    }

    // 2. Update Hostinger Database
    try {
      await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, review, status: 'EXPERT_REVIEWED' }),
      });
    } catch (hostingerErr) {
      console.warn('[ReportsService] Hostinger DB review update warning:', hostingerErr);
    }

    // 3. Synchronize to Cloud Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(docRef, {
          expert_review: review,
          status: 'EXPERT_REVIEWED',
          updated_at: now,
        });
      } catch (err) {
        console.warn('[ReportsService] Firestore submitExpertReview warning:', err);
      }
    }
  }

  /**
   * Get a single report by ID
   */
  public static async getReportById(reportId: string): Promise<CropReport | null> {
    const reports = getLocalReports();
    const match = reports.find((r) => r.id === reportId);
    if (match) return match;

    // Check Hostinger DB
    try {
      const res = await fetch(`/api/reports?id=${encodeURIComponent(reportId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.report) return data.report;
      }
    } catch (e) {
      console.warn('[ReportsService] Hostinger DB single fetch warning:', e);
    }

    // Check Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, REPORTS_COLLECTION, reportId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return snapshot.data() as CropReport;
        }
      } catch (e) {
        console.warn('[ReportsService] Firestore getDoc warning:', e);
      }
    }

    return null;
  }

  /**
   * Real-time subscription for a single report
   */
  public static subscribeToReport(
    reportId: string,
    callback: (report: CropReport | null) => void
  ): Unsubscribe {
    // 1. Initial check
    const reports = getLocalReports();
    callback(reports.find((r) => r.id === reportId) || null);

    // 2. Poll Hostinger DB every 1 second
    const pollHostinger = async () => {
      try {
        const res = await fetch(`/api/reports?id=${encodeURIComponent(reportId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            callback(data.report);
          }
        }
      } catch {}
    };

    const intervalId = setInterval(pollHostinger, 1000);

    // Local reactive listener
    const handler = () => {
      const currentReports = getLocalReports();
      const match = currentReports.find((r) => r.id === reportId) || null;
      callback(match);
    };

    window.addEventListener(SYNC_EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(SYNC_EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }

  /**
   * Real-time subscription to a farmer's stored reports
   * Continuous 1-second sync with Hostinger DB + local cache
   */
  public static subscribeToFarmerReports(
    farmerId: string,
    callback: (reports: CropReport[]) => void
  ): Unsubscribe {
    // Local reactive listener
    const getMergedFarmerReports = (serverReports: CropReport[] = []) => {
      const local = getLocalReports();
      const map = new Map<string, CropReport>();

      // Server takes priority for shared state, local supplements
      serverReports.forEach((r) => map.set(r.id, r));
      local.forEach((r) => {
        if (!map.has(r.id)) {
          if (r.farmer_id === farmerId || (farmerId !== 'guest_farmer' && r.farmer_id === 'guest_farmer')) {
            map.set(r.id, r);
          }
        }
      });

      const list = Array.from(map.values()).filter(
        (r) => r.farmer_id === farmerId || (farmerId !== 'guest_farmer' && r.farmer_id === 'guest_farmer')
      );

      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    };

    // Initial emit
    callback(getMergedFarmerReports());

    // Continuous 1-second sync with Hostinger DB
    const syncFromHostingerDb = async () => {
      try {
        const res = await fetch(`/api/reports?farmer_id=${encodeURIComponent(farmerId)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reports)) {
            callback(getMergedFarmerReports(data.reports));
          }
        }
      } catch (err) {
        // Fallback to local
        callback(getMergedFarmerReports());
      }
    };

    syncFromHostingerDb();
    const syncInterval = setInterval(syncFromHostingerDb, 1000);

    const localHandler = () => {
      callback(getMergedFarmerReports());
    };

    window.addEventListener(SYNC_EVENT_NAME, localHandler);
    window.addEventListener('storage', localHandler);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener(SYNC_EVENT_NAME, localHandler);
      window.removeEventListener('storage', localHandler);
    };
  }

  /**
   * Real-time subscription for Agricultural Experts to see incoming reports
   * Continuous 1-second sync with Hostinger DB
   */
  public static subscribeToExpertQueue(
    callback: (reports: CropReport[]) => void
  ): Unsubscribe {
    const getMergedExpertReports = (serverReports: CropReport[] = []) => {
      const local = getLocalReports();
      const map = new Map<string, CropReport>();

      serverReports.forEach((r) => map.set(r.id, r));
      local.forEach((r) => {
        if (!map.has(r.id)) {
          map.set(r.id, r);
        }
      });

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    };

    // Initial emit
    callback(getMergedExpertReports());

    // Continuous 1-second sync with Hostinger DB
    const syncFromHostingerDb = async () => {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reports)) {
            callback(getMergedExpertReports(data.reports));
          }
        }
      } catch {
        callback(getMergedExpertReports());
      }
    };

    syncFromHostingerDb();
    const syncInterval = setInterval(syncFromHostingerDb, 1000);

    const localHandler = () => {
      callback(getMergedExpertReports());
    };

    window.addEventListener(SYNC_EVENT_NAME, localHandler);
    window.addEventListener('storage', localHandler);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener(SYNC_EVENT_NAME, localHandler);
      window.removeEventListener('storage', localHandler);
    };
  }

  /**
   * HISTORICAL INTELLIGENCE & LONGITUDINAL SUGGESTIONS
   * Synthesizes trends and actionable advice by cross-referencing previous stored analyses
   */
  public static computeHistoricalInsights(
    currentPlantType: string,
    currentDiseaseName: string,
    currentSeverity: Severity,
    currentHumidity: number,
    previousReports: CropReport[],
    currentLesionPercent?: number
  ): HistoricalInsight {
    if (!previousReports || previousReports.length === 0) {
      return {
        has_previous_data: false,
        previous_analyses_count: 0,
        severity_trend: 'new_crop',
        pathogen_recurrence_alert:
          'First diagnostic baseline registered for this plot. Future scans will track progression against this scan.',
      };
    }

    // Find previous reports for the same crop or general plot
    const matchingReports = previousReports.filter((r) => {
      const pastPlant = r.diagnosis?.plant_type?.toLowerCase() || '';
      const currPlant = currentPlantType.toLowerCase();
      return (
        pastPlant.includes(currPlant) ||
        currPlant.includes(pastPlant) ||
        currPlant.split(' ')[0] === pastPlant.split(' ')[0]
      );
    });

    const relevantPast = matchingReports.length > 0 ? matchingReports : previousReports;
    const mostRecent = relevantPast[0];
    const pastSeverity = mostRecent.diagnosis?.severity || 'LOW';
    const pastDisease = mostRecent.diagnosis?.disease_name || 'Previous Stress';
    const pastLesionPercent = mostRecent.cv_metrics?.lesion_surface_area_percent;

    let lesionAreaChange: number | undefined;
    if (typeof currentLesionPercent === 'number' && typeof pastLesionPercent === 'number') {
      lesionAreaChange = Number((currentLesionPercent - pastLesionPercent).toFixed(1));
    }

    // Calculate severity trend
    const severityRanks: Record<Severity, number> = {
      HEALTHY: 0,
      LOW: 1,
      MODERATE: 2,
      CRITICAL: 3,
    };

    const currentRank = severityRanks[currentSeverity] || 1;
    const pastRank = severityRanks[pastSeverity] || 1;

    let severity_trend: 'improving' | 'deteriorating' | 'stable' | 'new_crop' = 'stable';
    if (currentRank > pastRank || (lesionAreaChange && lesionAreaChange > 4)) {
      severity_trend = 'deteriorating';
    } else if (currentRank < pastRank || (lesionAreaChange && lesionAreaChange < -4)) {
      severity_trend = 'improving';
    }

    // Recurrence analysis
    const isSamePathogen =
      currentDiseaseName.toLowerCase().includes(pastDisease.toLowerCase()) ||
      pastDisease.toLowerCase().includes(currentDiseaseName.toLowerCase());

    let recurrence_alert: string | undefined;
    let treatment_suggestion: string | undefined;

    if (isSamePathogen) {
      recurrence_alert = `⚠️ Pathogen Recurrence Alert: ${currentDiseaseName} was also recorded on ${new Date(
        mostRecent.created_at
      ).toLocaleDateString()}. Persistent or recurring pathogen detected in this plot.`;

      if (severity_trend === 'deteriorating') {
        treatment_suggestion = `Previous treatment prescribed on ${new Date(
          mostRecent.created_at
        ).toLocaleDateString()} did not arrest pathogen escalation (Severity rose from ${pastSeverity} to ${currentSeverity}). Immediate escalation to alternate chemical group or immediate Human Agronomist review is strongly recommended.`;
      } else if (severity_trend === 'improving') {
        treatment_suggestion = `Positive progress: Foliar symptoms have reduced from ${pastSeverity} to ${currentSeverity} since ${new Date(
          mostRecent.created_at
        ).toLocaleDateString()}. Continue maintenance protective treatments.`;
      } else {
        treatment_suggestion = `Symptoms remain persistent at ${currentSeverity} severity. Re-verify spray coverage and ensure lower leaves are completely treated.`;
      }
    } else {
      treatment_suggestion = `Secondary or new condition identified compared to previous report (${pastDisease} on ${new Date(
        mostRecent.created_at
      ).toLocaleDateString()}). Ensure treatment does not conflict with previous soil or foliar applications.`;
    }

    // Environmental pattern correlation
    const pastHumidity = mostRecent.environment?.weather?.humidity;
    let environmental_pattern: string | undefined;
    if (pastHumidity && pastHumidity > 75 && currentHumidity > 75) {
      environmental_pattern = `Both current and previous scans occurred during prolonged elevated humidity (>75%), confirming microclimatic moisture as the primary recurring disease trigger.`;
    }

    return {
      has_previous_data: true,
      previous_analyses_count: relevantPast.length,
      last_analyzed_date: mostRecent.created_at,
      previous_severity: pastSeverity,
      previous_lesion_percent: pastLesionPercent,
      lesion_area_change_percent: lesionAreaChange,
      severity_trend,
      pathogen_recurrence_alert: recurrence_alert,
      treatment_continuity_suggestion: treatment_suggestion,
      environmental_recurrence_pattern: environmental_pattern,
    };
  }
}
