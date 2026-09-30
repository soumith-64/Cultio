'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CropReport } from '@/types';
import { ReportsService } from '@/services/reports';
import { isFirebaseConfigured } from '@/config/firebase';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExpertReviewModal } from '@/components/expert/ExpertReviewModal';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Filter,
  Eye,
  LogOut,
  Sprout,
  Sparkles,
  Cloud,
  FileCheck2,
  Award,
  Building,
  UserCheck,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function ExpertPortalPage() {
  const { user, isAuthenticated, signOut, selectRole } = useAuth();

  const [reports, setReports] = useState<CropReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<CropReport | null>(null);
  const [filterMode, setFilterMode] = useState<'pending' | 'reviewed' | 'all'>('pending');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'MODERATE' | 'LOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);

  // Subscribe in real-time to the expert queue
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = ReportsService.subscribeToExpertQueue((allReports) => {
      setReports(allReports);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isExpert = user?.role === 'expert';

  // Metrics computation
  const pendingReports = reports.filter((r) => r.status === 'PENDING_EXPERT');
  const reviewedReports = reports.filter((r) => r.status === 'EXPERT_REVIEWED');
  const criticalReports = reports.filter(
    (r) => r.status === 'PENDING_EXPERT' && r.diagnosis?.severity === 'CRITICAL'
  );

  // Filter & Search
  const filteredReports = reports.filter((report) => {
    if (filterMode === 'pending' && report.status !== 'PENDING_EXPERT') return false;
    if (filterMode === 'reviewed' && report.status !== 'EXPERT_REVIEWED') return false;

    if (severityFilter !== 'ALL' && report.diagnosis?.severity !== severityFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const crop = report.diagnosis?.plant_type?.toLowerCase() || '';
      const disease = report.diagnosis?.disease_name?.toLowerCase() || '';
      const region = report.location.regionName?.toLowerCase() || '';
      return crop.includes(q) || disease.includes(q) || region.includes(q);
    }

    return true;
  });

  const sortedReports = [...filteredReports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4E342E]">
      {/* Top Expert Portal Navigation */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E0D7C6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Portal Identifier */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#2E7D32]/25 shadow-earth flex items-center justify-center bg-white group-hover:scale-105 transition-all p-0.5">
                <img src="/logo.png" alt="Cultio Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-[#2E7D32]">
                    CULTIO
                  </span>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#2E7D32] text-white">
                    EXPERT
                  </span>
                </div>
                <p className="text-[10px] text-[#795548] font-bold uppercase tracking-wider hidden sm:block">
                  Certified Agronomy Terminal
                </p>
              </div>
            </Link>
          </div>

          {/* Sync Pill & User Identity */}
          <div className="flex items-center gap-3">
            <div
              className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F9F6F0] text-[#795548] border border-[#E0D7C6]"
              title={
                isFirebaseConfigured
                  ? 'Connected to Firebase Firestore Live Synchronization'
                  : 'Running in Local Prototype Reactive Mode'
              }
            >
              <Cloud className="w-3 h-3 text-[#2E7D32]" />
              <span>{isFirebaseConfigured ? 'Firebase Cloud Sync' : 'Local Real-Time'}</span>
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-[#2E7D32]/10 hover:bg-[#2E7D32]/15 px-3 py-1.5 rounded-xl border border-[#2E7D32]/20 transition-all cursor-pointer"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmer Portal</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#4E342E] leading-tight">
                    {user?.displayName || 'Dr. Agronomist'}
                  </div>
                  <div className="text-[10px] text-[#2E7D32] font-semibold">
                    {user?.specialization || 'Certified Crop Advisor'}
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="w-9 h-9 rounded-xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] flex items-center justify-center text-[#795548] transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAuthGateModal(true)}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                className="font-bold shadow-earth"
              >
                Sign In as Agronomist
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Gate View: When user is not authenticated or not in Expert role */}
        {(!isAuthenticated || !isExpert) && (
          <div className="max-w-xl mx-auto my-12 bg-white border-2 border-[#2E7D32]/30 rounded-3xl p-6 sm:p-8 shadow-earth-lg text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center mx-auto shadow-earth">
              <ShieldCheck className="w-9 h-9 text-[#81C784]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] bg-[#2E7D32]/10 px-3 py-1 rounded-full">
                Accredited Personnel Only
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#4E342E] mt-3">
                Agronomist Clinical Terminal
              </h1>
              <p className="text-xs sm:text-sm text-[#795548] mt-2 leading-relaxed">
                This dedicated portal enables certified plant pathologists, university extension specialists, and accredited agronomists to review live escalated field reports and issue binding clinical prescriptions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6] text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#4E342E]">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Verify real-time foliar computer vision metrics</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-[#4E342E]">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Cross-examine microclimate, precipitation, and soil horizons</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-[#4E342E]">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Prescribe targeted chemistry with regulated PHI intervals</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 font-bold shadow-earth"
                onClick={() => setShowAuthGateModal(true)}
                leftIcon={<ShieldCheck className="w-5 h-5" />}
              >
                Sign In as Expert
              </Button>

              {/* Quick role switch for evaluators */}
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 font-bold"
                onClick={async () => {
                  await selectRole('expert');
                }}
                leftIcon={<UserCheck className="w-5 h-5 text-[#2E7D32]" />}
              >
                Access Terminal Now
              </Button>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="text-xs text-[#795548] hover:text-[#2E7D32] hover:underline font-semibold"
              >
                ← Return to Farmer Diagnostic Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Authenticated Expert Dashboard */}
        {isAuthenticated && isExpert && (
          <div className="space-y-6 animate-fadeIn">
            {/* Expert Hero & KPI Overview */}
            <div className="bg-white border-2 border-[#2E7D32]/25 rounded-3xl p-6 sm:p-8 shadow-earth space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center flex-shrink-0 shadow-earth">
                    <ShieldCheck className="w-8 h-8 text-[#81C784]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
                        Clinical Workspace
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32]">
                        Verified Agronomist
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4E342E] tracking-tight">
                      {user?.displayName || 'Dr. Agronomist'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#795548] mt-1">
                      {user?.specialization || 'Plant Pathology'} • License:{' '}
                      <span className="font-mono font-bold text-[#4E342E]">
                        {user?.licenseNumber || 'CCA-IN-VERIFIED'}
                      </span>{' '}
                      • {user?.institution || 'Agricultural Research Extension'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const sampleName = prompt('Update Display Name:', user?.displayName || '');
                      if (sampleName) selectRole('expert');
                    }}
                    className="text-xs"
                  >
                    Edit Credentials
                  </Button>
                  <Link href="/" className="inline-flex">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Farmer View
                    </Button>
                  </Link>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-[#E0D7C6]">
                <div className="bg-[#FFA000]/10 border border-[#FFA000]/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E65100]">
                      Pending Verification
                    </span>
                    <Clock className="w-4 h-4 text-[#F57C00] animate-pulse" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#E65100] mt-1">
                    {pendingReports.length}
                  </div>
                  <span className="text-[11px] text-[#795548] block mt-0.5">
                    Awaiting clinical review
                  </span>
                </div>

                <div className="bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#B71C1C]">
                      Critical Pathogens
                    </span>
                    <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#B71C1C] mt-1">
                    {criticalReports.length}
                  </div>
                  <span className="text-[11px] text-[#795548] block mt-0.5">
                    Urgent containment required
                  </span>
                </div>

                <div className="bg-[#81C784]/20 border border-[#81C784]/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
                      Verified Cases
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#2E7D32] mt-1">
                    {reviewedReports.length}
                  </div>
                  <span className="text-[11px] text-[#795548] block mt-0.5">
                    Prescriptions issued
                  </span>
                </div>

                <div className="bg-white border border-[#E0D7C6] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
                      Total Field Scans
                    </span>
                    <Sprout className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#4E342E] mt-1">
                    {reports.length}
                  </div>
                  <span className="text-[11px] text-[#795548] block mt-0.5">
                    Across all monitored plots
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#E0D7C6] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              {/* Queue Status Tabs */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFilterMode('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterMode === 'pending'
                      ? 'bg-[#2E7D32] text-white shadow-sm'
                      : 'bg-[#F9F6F0] text-[#4E342E] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Review ({pendingReports.length})</span>
                </button>

                <button
                  onClick={() => setFilterMode('reviewed')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterMode === 'reviewed'
                      ? 'bg-[#2E7D32] text-white shadow-sm'
                      : 'bg-[#F9F6F0] text-[#4E342E] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Verified Cases ({reviewedReports.length})</span>
                </button>

                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterMode === 'all'
                      ? 'bg-[#2E7D32] text-white shadow-sm'
                      : 'bg-[#F9F6F0] text-[#4E342E] hover:bg-[#EFE8DC]'
                  }`}
                >
                  All Queue ({reports.length})
                </button>
              </div>

              {/* Severity & Search Controls */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-xs font-bold text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#795548] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search crop or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-xs text-[#4E342E] placeholder-[#795548]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>
            </div>

            {/* Case List */}
            {isLoading ? (
              <div className="text-center py-16 bg-white border border-[#E0D7C6] rounded-3xl space-y-3">
                <div className="w-8 h-8 border-3 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#795548] font-bold">Synchronizing Live Case Queue...</p>
              </div>
            ) : sortedReports.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#E0D7C6] rounded-3xl p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#4E342E]">No Field Cases in this Queue</h3>
                <p className="text-xs text-[#795548] max-w-md mx-auto">
                  {filterMode === 'pending'
                    ? 'All escalated field cases have been verified by certified agronomists. Great job!'
                    : 'No matching diagnostic reports found for the selected filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedReports.map((report) => {
                  const diag = report.diagnosis;
                  const env = report.environment;
                  const isPending = report.status === 'PENDING_EXPERT';

                  return (
                    <div
                      key={report.id}
                      className={`bg-white border rounded-3xl p-5 shadow-earth hover:shadow-earth-lg transition-all flex flex-col justify-between space-y-4 ${
                        isPending ? 'border-[#FFA000]/60 ring-1 ring-[#FFA000]/30' : 'border-[#E0D7C6]'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={report.status} />
                            {diag?.severity && <SeverityBadge severity={diag.severity} size="sm" />}
                            {diag?.confidence_level && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F9F6F0] text-[#795548] border border-[#E0D7C6]">
                                Conf: {diag.confidence_level}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#795548] font-mono">
                            {new Date(report.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Image + Crop Title */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F9F6F0] border border-[#E0D7C6] flex-shrink-0 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={report.image_url}
                              alt={diag?.plant_type || 'Crop'}
                              className="w-full h-full object-cover"
                            />
                            {report.cv_metrics && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] font-bold text-center py-0.5">
                                {report.cv_metrics.lesion_surface_area_percent}% Lesion
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#795548]">
                              {diag?.plant_type || 'Crop Specimen'}
                            </div>
                            <h3 className="text-base font-extrabold text-[#D32F2F] leading-tight line-clamp-1">
                              {diag?.disease_name || 'Analyzing Condition...'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-[#795548] pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#F57C00] flex-shrink-0" />
                              <span className="truncate">
                                {report.location.regionName ||
                                  `Lat ${report.location.latitude.toFixed(2)}, Lng ${report.location.longitude.toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Environmental Telemetry Snippet */}
                        <div className="grid grid-cols-3 gap-2 bg-[#F9F6F0] p-2.5 rounded-xl border border-[#E0D7C6] text-center text-xs">
                          <div>
                            <span className="text-[10px] text-[#795548] block">Humidity</span>
                            <span className="font-extrabold text-[#4E342E]">
                              {env.weather.humidity}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#795548] block">Soil pH</span>
                            <span className="font-extrabold text-[#4E342E]">
                              {env.soil.soil_ph}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#795548] block">Rain / ET₀</span>
                            <span className="font-extrabold text-[#2E7D32]">
                              {env.water?.precipitation_24h_mm || 0}mm
                            </span>
                          </div>
                        </div>

                        {/* Stored Expert Review Preview if reviewed */}
                        {report.expert_review && (
                          <div className="bg-[#2E7D32]/5 p-3 rounded-xl border border-[#2E7D32]/20 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[#2E7D32] font-bold">
                              <span>Verified by {report.expert_review.expert_name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[#4E342E] line-clamp-2 leading-relaxed">
                              {report.expert_review.assessment}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant={isPending ? 'primary' : 'secondary'}
                          size="md"
                          onClick={() => setSelectedReport(report)}
                          className="w-full font-bold shadow-sm justify-between"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          <span>{isPending ? 'Review Case & Prescribe Treatment' : 'View Clinical Assessment'}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clinical Review Modal */}
      {selectedReport && (
        <ExpertReviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onReviewSubmitted={(updated) => {
            setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSelectedReport(null);
          }}
        />
      )}

      {/* Auth Gatekeeper Modal */}
      {showAuthGateModal && (
        <AuthModal initialRole="expert" />
      )}
    </div>
  );
}
