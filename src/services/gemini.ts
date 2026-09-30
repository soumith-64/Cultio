/**
 * CULTIVO — AI Diagnostic Service Abstraction
 * Calls server-side Gemini AI engine with contextual environmental data
 */

import { Diagnosis, LocationData, SoilData, WeatherData, CropReport } from '@/types';

export interface DiagnosticRequestPayload {
  image_url?: string;
  image_base64?: string;
  mime_type?: string;
  farmer_notes?: string;
  preferred_language?: string;
  weather: WeatherData;
  soil: SoilData;
  location: LocationData;
  previous_reports?: CropReport[];
}

export interface IDiagnosticService {
  diagnoseCrop(payload: DiagnosticRequestPayload): Promise<Diagnosis>;
}

export class GeminiDiagnosticService implements IDiagnosticService {
  async diagnoseCrop(payload: DiagnosticRequestPayload): Promise<Diagnosis> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Diagnostic service responded with status ${response.status}`
        );
      }

      const result = await response.json();
      if (!result.diagnosis) {
        throw new Error('Invalid diagnostic response structure received from engine.');
      }

      return result.diagnosis;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Crop diagnosis request timed out. Please check your network and retry.');
      }
      throw err;
    }
  }
}

let activeDiagnosticService: IDiagnosticService | null = null;

export function getDiagnosticService(): IDiagnosticService {
  if (!activeDiagnosticService) {
    activeDiagnosticService = new GeminiDiagnosticService();
  }
  return activeDiagnosticService;
}
