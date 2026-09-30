/**
 * CULTIVO — Central Domain Types
 * Strict typing across UI, Services, AI Engine, and Real-Time Cloud Synchronization
 */

export type UserRole = 'farmer' | 'expert';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  specialization?: string;
  licenseNumber?: string;
  institution?: string;
  isAccreditedExpert?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ReportStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'AI_ANALYZED'
  | 'PENDING_EXPERT'
  | 'EXPERT_REVIEWED';

export type Severity = 'HEALTHY' | 'LOW' | 'MODERATE' | 'CRITICAL';

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'success'
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  isFallback: boolean;
  source: 'device' | 'fallback';
  regionName?: string;
}

export interface WaterData {
  soil_moisture_root_zone_percent: number; // e.g. 14.2%
  soil_moisture_surface_percent: number; // e.g. 11.5%
  precipitation_24h_mm: number; // e.g. 7.3 mm
  evapotranspiration_mm: number; // e.g. 5.6 mm/day
  water_stress_status: 'Optimal' | 'Moisture Deficit' | 'Saturated / Waterlogged';
  irrigation_advice: string;
}

export interface WeatherData {
  temp: number; // Celsius
  humidity: number; // Percentage
  pressure: number; // hPa
  condition?: string;
  isMock: boolean;
  water?: WaterData;
}

export interface SoilData {
  soil_type: string; // e.g. "Loamy Clay", "Alluvial", "Sandy Loam"
  soil_ph: number; // e.g. 6.4
  organic_matter?: string;
  drainage?: string;
  isMock: boolean;
}

export interface EnvironmentData {
  weather: WeatherData;
  soil: SoilData;
  water?: WaterData;
}

export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';

export interface DifferentialDiagnosis {
  condition: string;
  rationale: string;
}

export interface GovernmentGuideline {
  authority: string; // e.g. "ICAR & CIBRC (Govt of India)" or "National Extension Service"
  advisory_title: string;
  standard_practice: string;
  approved_formulations?: string[];
  official_portal_url: string;
}

export interface Diagnosis {
  plant_type: string;
  disease_name: string;
  severity: Severity;
  confidence_level?: ConfidenceLevel;
  confidence_explanation?: string;
  confidence?: number; // Numeric 0.00 - 1.00 for badge compatibility (High: 0.85, Moderate: 0.55, Low: 0.30)
  uncertainty_note?: string;
  visual_symptoms?: string[];
  differential_diagnoses?: DifferentialDiagnosis[];
  root_cause_analysis: string;
  recommended_next_steps?: string[];
  farmer_notes?: string;
  translated_notes?: string;
  detected_language?: string;
  government_guideline?: GovernmentGuideline;
}

export interface RecommendationPlan {
  organic_solutions: string[];
  chemical_solutions: string[];
  preventive_actions: string[];
  monitoring_guidance: string[];
  ordered_action_plan: string[];
}

export interface ExpertReview {
  expert_uid: string;
  expert_name: string;
  expert_title?: string;
  expert_avatar?: string;
  assessment: string;
  recommendations: string;
  reviewed_at: string;
}

export interface ComputerVisionMetrics {
  lesion_surface_area_percent: number; // e.g. 18.5%
  healthy_canopy_percent: number;      // e.g. 81.5%
  chlorophyll_health_index: number;    // e.g. 0.72 (range -1.0 to 1.0)
  color_distribution: {
    healthy_green: number; // %
    chlorotic_yellow: number; // %
    necrotic_brown: number; // %
  };
  detected_lesion_clusters: number;
  annotated_overlay_url?: string;
}

export interface HistoricalInsight {
  has_previous_data: boolean;
  previous_analyses_count: number;
  last_analyzed_date?: string;
  previous_severity?: Severity;
  previous_lesion_percent?: number;
  lesion_area_change_percent?: number;
  severity_trend?: 'improving' | 'deteriorating' | 'stable' | 'new_crop';
  pathogen_recurrence_alert?: string;
  treatment_continuity_suggestion?: string;
  environmental_recurrence_pattern?: string;
}

export interface CropReport {
  id: string;
  farmer_id: string;
  farmer_name?: string;
  image_url: string;
  thumbnail_url?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  location: LocationData;
  environment: EnvironmentData;
  diagnosis?: Diagnosis;
  recommendations?: RecommendationPlan;
  expert_review?: ExpertReview;
  historical_insight?: HistoricalInsight;
  cv_metrics?: ComputerVisionMetrics;
}

export type PipelineStepId =
  | 'capture'
  | 'upload'
  | 'cv_analysis'
  | 'geolocation'
  | 'weather'
  | 'soil'
  | 'ai_analysis'
  | 'recommendations'
  | 'persist';

export type StepState = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

export interface PipelineProgressStep {
  id: PipelineStepId;
  label: string;
  state: StepState;
  detail?: string;
  error?: string;
}
