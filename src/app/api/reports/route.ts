import { NextRequest, NextResponse } from 'next/server';
import { HostingerDb } from '@/lib/hostingerDb';
import { CropReport, ExpertReview, ReportStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const farmerId = searchParams.get('farmer_id');

    if (id) {
      const report = await HostingerDb.getReportById(id);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, report });
    }

    if (farmerId) {
      const reports = await HostingerDb.getReportsByFarmer(farmerId);
      return NextResponse.json({ success: true, reports });
    }

    // Expert queue: return all live analyses
    const allReports = await HostingerDb.getAllReports();
    return NextResponse.json({ success: true, reports: allReports });
  } catch (error: any) {
    console.error('[Reports API GET] Error reading from Hostinger DB:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports from Hostinger DB' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const report: CropReport = await req.json();

    if (!report || !report.id) {
      return NextResponse.json({ error: 'Invalid report payload' }, { status: 400 });
    }

    const saved = await HostingerDb.saveReport(report);
    return NextResponse.json({ success: true, report: saved });
  } catch (error: any) {
    console.error('[Reports API POST] Error saving to Hostinger DB:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save report to Hostinger DB' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, status, review }: { reportId: string; status?: ReportStatus; review?: ExpertReview } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    let updatedReport: CropReport | null = null;

    if (review) {
      updatedReport = await HostingerDb.submitExpertReview(reportId, review);
    } else if (status) {
      updatedReport = await HostingerDb.updateReportStatus(reportId, status);
    }

    if (!updatedReport) {
      return NextResponse.json({ error: 'Report not found to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error: any) {
    console.error('[Reports API PATCH] Error updating Hostinger DB report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update report in Hostinger DB' },
      { status: 500 }
    );
  }
}
