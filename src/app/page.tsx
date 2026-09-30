'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/components/landing/LandingPage';
import { FarmerDashboard } from '@/components/farmer/FarmerDashboard';
import { CameraWorkflow } from '@/components/farmer/CameraWorkflow';
import { DiagnosticProgress } from '@/components/farmer/DiagnosticProgress';
import { ReportView } from '@/components/report/ReportView';
import { ExpertDashboard } from '@/components/expert/ExpertDashboard';
import { AuthModal } from '@/components/auth/AuthModal';
import { RoleModal } from '@/components/auth/RoleModal';
import { PrivacyConsentModal } from '@/components/auth/PrivacyConsentModal';
import { UserProfileModal } from '@/components/auth/UserProfileModal';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ReportContextualSkeleton } from '@/components/ui/Skeleton';
import {
  CropReport,
  PipelineProgressStep,
  LocationData,
  WeatherData,
  SoilData,
  Diagnosis,
  RecommendationPlan,
} from '@/types';
import { ReportsService } from '@/services/reports';
import { ImageStorageService } from '@/services/storage';
import { GeolocationService } from '@/services/geolocation';
import { getWeatherService } from '@/services/weather';
import { getSoilService } from '@/services/soil';
import { getDiagnosticService } from '@/services/gemini';
import { getRecommendationService } from '@/services/recommendations';
import { ComputerVisionService } from '@/services/cvAnalysis';
import { useLanguage } from '@/context/LanguageContext';

function CultivoApp() {
  const { language } = useLanguage();
  const {
    user,
    isAuthenticated,
    hasPrivacyConsent,
    setShowAuthModal,
    setShowRoleModal,
    setShowConsentModal,
  } = useAuth();

  const [currentView, setCurrentView] = useState<'landing' | 'farmer' | 'expert' | 'scan' | 'report'>('landing');
  const [activeReport, setActiveReport] = useState<CropReport | null>(null);
  const [reports, setReports] = useState<CropReport[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineProgressStep[]>([]);
  const [pipelineCurrentLabel, setPipelineCurrentLabel] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Automatically adapt view based on user role when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (currentView === 'landing') {
        setCurrentView(user.role === 'expert' ? 'expert' : 'farmer');
      }
    }
  }, [isAuthenticated, user?.role, currentView]);

  // Real-time synchronization subscription based on current active view
  useEffect(() => {
    let unsubscribe = () => {};

    if (currentView === 'expert' || user?.role === 'expert') {
      unsubscribe = ReportsService.subscribeToExpertQueue((queue) => {
        setReports(queue);
      });
    } else {
      const farmerId = user?.uid || 'sample_farmer_uid';
      unsubscribe = ReportsService.subscribeToFarmerReports(farmerId, (list) => {
        setReports(list);
      });
    }

    return () => unsubscribe();
  }, [currentView, user?.role, user?.uid]);

  // Check requirements before triggering scan workflow
  const handleStartScan = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!hasPrivacyConsent) {
      setShowConsentModal(true);
      return;
    }
    setCurrentView('scan');
  };

  // EXECUTE FULL PARALLEL SCIENTIFIC DIAGNOSTIC PIPELINE
  const handleImageConfirmed = async ({
    file,
    base64,
    previewUrl,
    farmerNotes,
  }: {
    file?: File;
    base64: string;
    previewUrl: string;
    farmerNotes?: string;
  }) => {
    setIsProcessing(true);

    // Initial pipeline state
    const initialSteps: PipelineProgressStep[] = [
      {
        id: 'capture',
        label: 'Crop photograph & farmer input captured',
        state: 'completed',
        detail: farmerNotes ? 'Specimen + Farmer observation validated' : 'Live foliar specimen validated',
      },
      { id: 'upload', label: 'Secure image storage', state: 'active', detail: 'Uploading to encrypted storage' },
      { id: 'cv_analysis', label: 'Computer Vision lesion segmentation', state: 'active', detail: 'Mathematical pixel & ExG index analysis' },
      { id: 'geolocation', label: 'Field coordinates acquisition', state: 'pending', detail: 'Requesting GPS sensors' },
      { id: 'weather', label: 'Microclimatic telemetry', state: 'pending', detail: 'Temperature, humidity & pressure' },
      { id: 'soil', label: 'Soil horizon intelligence', state: 'pending', detail: 'Soil taxonomy & pH reading' },
      { id: 'ai_analysis', label: 'AI multimodal diagnostic reasoning', state: 'pending', detail: 'Analyzing lesions & environmental triggers' },
      { id: 'recommendations', label: 'Actionable treatment synthesis', state: 'pending', detail: 'Organic & targeted solutions' },
      { id: 'persist', label: 'Publishing diagnostic record', state: 'pending', detail: 'Real-time synchronization' },
    ];

    setPipelineSteps(initialSteps);
    setPipelineCurrentLabel('Analyzing foliar pixels with Computer Vision and acquiring telemetry...');

    try {
      const userId = user?.uid || 'guest_farmer';
      let imageUrl = previewUrl;

      // PARALLEL EXECUTION: Operation A (Image Upload) + Operation B (GPS Request) + Operation C (Computer Vision)
      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === 'upload' || s.id === 'geolocation' || s.id === 'cv_analysis'
            ? { ...s, state: 'active' }
            : s
        )
      );

      // A: Upload Image
      const uploadPromise = (async () => {
        if (file) {
          const uploadRes = await ImageStorageService.uploadCropImage(file, userId);
          imageUrl = uploadRes.downloadUrl;
        }
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === 'upload'
              ? { ...s, state: 'completed', detail: 'Encrypted storage verified' }
              : s
          )
        );
        return imageUrl;
      })();

      // B: Request GPS
      const locationPromise = (async () => {
        const geoResult = await GeolocationService.getCurrentLocation();
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === 'geolocation'
              ? {
                  ...s,
                  state: 'completed',
                  detail: `${geoResult.data.latitude.toFixed(4)}°, ${geoResult.data.longitude.toFixed(4)}° ${
                    geoResult.data.isFallback ? '(Dev Fallback)' : '(Hardware GPS)'
                  }`,
                }
              : s
          )
        );
        return geoResult.data;
      })();

      // C: Computer Vision Foliar Segmentation & ExG Index
      const cvPromise = (async () => {
        const metrics = await ComputerVisionService.analyzeImage(previewUrl);
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === 'cv_analysis'
              ? {
                  ...s,
                  state: 'completed',
                  detail: `${metrics.lesion_surface_area_percent}% lesion area • ExG Index ${metrics.chlorophyll_health_index}`,
                }
              : s
          )
        );
        return metrics;
      })();

      const [storedImageUrl, locationData, cvMetrics] = await Promise.all([
        uploadPromise,
        locationPromise,
        cvPromise,
      ]);

      // PARALLEL EXECUTION: Operation C (Weather) + Operation D (Soil)
      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === 'weather' || s.id === 'soil'
            ? { ...s, state: 'active' }
            : s
        )
      );
      setPipelineCurrentLabel('Querying OpenWeather Agro & Soil Intelligence concurrently...');

      const weatherPromise = (async () => {
        const weatherService = getWeatherService();
        const weather = await weatherService.getWeather(
          locationData.latitude,
          locationData.longitude
        );
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === 'weather'
              ? {
                  ...s,
                  state: 'completed',
                  detail: `${weather.temp}°C • ${weather.humidity}% Humidity • ${weather.pressure} hPa`,
                }
              : s
          )
        );
        return weather;
      })();

      const soilPromise = (async () => {
        const soilService = getSoilService();
        const soil = await soilService.getSoilData(
          locationData.latitude,
          locationData.longitude
        );
        setPipelineSteps((prev) =>
          prev.map((s) =>
            s.id === 'soil'
              ? {
                  ...s,
                  state: 'completed',
                  detail: `${soil.soil_type} • pH ${soil.soil_ph}`,
                }
              : s
          )
        );
        return soil;
      })();

      const [weatherData, soilData] = await Promise.all([
        weatherPromise,
        soilPromise,
      ]);

      // OPERATION E: GEMINI AI MULTIMODAL DIAGNOSTIC ENGINE
      setPipelineSteps((prev) =>
        prev.map((s) => (s.id === 'ai_analysis' ? { ...s, state: 'active' } : s))
      );
      setPipelineCurrentLabel('Gemini reasoning over visual evidence and environmental conditions...');

      const diagnosticService = getDiagnosticService();
      const diagnosis: Diagnosis = await diagnosticService.diagnoseCrop({
        image_url: storedImageUrl,
        image_base64: base64,
        farmer_notes: farmerNotes,
        preferred_language: language,
        weather: weatherData,
        soil: soilData,
        location: locationData,
        previous_reports: reports,
      });

      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === 'ai_analysis'
            ? {
                ...s,
                state: 'completed',
                detail: `${diagnosis.plant_type} — ${diagnosis.disease_name} (${diagnosis.severity})`,
              }
            : s
        )
      );

      // OPERATION F: RECOMMENDATION ENGINE & HISTORICAL SUGGESTIONS SYNTHESIS
      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === 'recommendations' ? { ...s, state: 'active' } : s
        )
      );
      setPipelineCurrentLabel('Cross-referencing previous analysis history for trend suggestions...');

      const recommendationService = getRecommendationService();
      const recommendations: RecommendationPlan =
        await recommendationService.getRecommendations(
          diagnosis.plant_type,
          diagnosis.disease_name,
          diagnosis.severity,
          diagnosis.confidence_level,
          diagnosis.recommended_next_steps,
          diagnosis.differential_diagnoses
        );

      // Compute longitudinal suggestions from stored previous analyses (comparing lesion area %)
      const historicalInsight = ReportsService.computeHistoricalInsights(
        diagnosis.plant_type,
        diagnosis.disease_name,
        diagnosis.severity,
        weatherData.humidity,
        reports,
        cvMetrics.lesion_surface_area_percent
      );

      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === 'recommendations'
            ? {
                ...s,
                state: 'completed',
                detail: historicalInsight.has_previous_data
                  ? `Historical trend analyzed (${historicalInsight.previous_analyses_count} prior scans, ${cvMetrics.lesion_surface_area_percent}% lesion area) with continuity suggestions`
                  : `${recommendations.ordered_action_plan.length} sequential execution steps synthesized`,
              }
            : s
        )
      );

      // OPERATION G: ASSEMBLE & PERSIST CROP REPORT (Storing analysis for future suggestions)
      setPipelineSteps((prev) =>
        prev.map((s) => (s.id === 'persist' ? { ...s, state: 'active' } : s))
      );

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newReport: CropReport = {
        id: reportId,
        farmer_id: userId,
        farmer_name: user?.displayName || 'Field Cultivator',
        image_url: storedImageUrl,
        thumbnail_url: previewUrl,
        status: 'AI_ANALYZED',
        created_at: now,
        updated_at: now,
        location: locationData,
        environment: {
          weather: weatherData,
          soil: soilData,
        },
        diagnosis,
        recommendations,
        historical_insight: historicalInsight,
        cv_metrics: cvMetrics,
      };

      await ReportsService.createReport(newReport);

      setPipelineSteps((prev) =>
        prev.map((s) =>
          s.id === 'persist'
            ? { ...s, state: 'completed', detail: 'Real-time record published' }
            : s
        )
      );

      // Transition smoothly into report view
      setTimeout(() => {
        setIsProcessing(false);
        setActiveReport(newReport);
        setCurrentView('report');
      }, 700);
    } catch (err: any) {
      console.error('Diagnostic pipeline error:', err);
      setIsProcessing(false);
      alert(`Diagnostic Pipeline Notice: ${err.message || 'Error occurred during processing.'}`);
      setCurrentView('farmer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F0]">
      {/* Top Application Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setActiveReport(null);
          setCurrentView(view);
        }}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage onStartDiagnosis={handleStartScan} />
        )}

        {/* VIEW 2: FARMER DASHBOARD */}
        {currentView === 'farmer' && !isProcessing && (
          <FarmerDashboard
            onScanClick={handleStartScan}
            reports={reports}
            onSelectReport={(rep) => {
              setActiveReport(rep);
              setCurrentView('report');
            }}
            isProcessing={isProcessing}
          />
        )}

        {/* VIEW 3: CAMERA / SPECIMEN WORKFLOW */}
        {currentView === 'scan' && !isProcessing && (
          <CameraWorkflow
            onImageConfirmed={handleImageConfirmed}
            onCancel={() => setCurrentView('farmer')}
            isProcessing={isProcessing}
          />
        )}

        {/* VIEW 4: DIAGNOSTIC PIPELINE IN PROGRESS */}
        {isProcessing && (
          <DiagnosticProgress
            steps={pipelineSteps}
            currentStepLabel={pipelineCurrentLabel}
          />
        )}

        {/* VIEW 5: FULL 5-DIVISION REPORT VIEW */}
        {currentView === 'report' && activeReport && (
          <ReportView
            initialReport={activeReport}
            onBack={() => {
              setActiveReport(null);
              setCurrentView(user?.role === 'expert' ? 'expert' : 'farmer');
            }}
          />
        )}

        {/* VIEW 6: AGRICULTURAL EXPERT PORTAL */}
        {currentView === 'expert' && (
          <ExpertDashboard
            reports={reports}
            onReportReviewed={(updatedRep) => {
              // Update local state if needed
              setReports((prev) =>
                prev.map((r) => (r.id === updatedRep.id ? updatedRep : r))
              );
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <RoleModal />
      <PrivacyConsentModal />
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Mobile Sticky Field Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onStartScan={handleStartScan}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Application Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return <CultivoApp />;
}
