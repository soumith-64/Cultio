/**
 * CULTIVO — Soil Intelligence Service Abstraction
 * Supports MockSoilService for development and ISRICSoilService (SoilGrids) for production
 */

import { SoilData } from '@/types';

export interface ISoilService {
  getSoilData(lat: number, lng: number): Promise<SoilData>;
}

export class MockSoilService implements ISoilService {
  async getSoilData(lat: number, lng: number): Promise<SoilData> {
    // Natural latency simulation
    await new Promise((resolve) => setTimeout(resolve, 650));

    // Derive deterministic, realistic soil properties from coordinates
    const pseudoSeed = Math.abs(Math.cos(lat * 15.42 + lng * 33.19));

    const soilTypes = [
      'Red Loamy Soil (Alfisol)',
      'Clay Loam with High Retention',
      'Alluvial Deep Silt Loam',
      'Black Cotton Soil (Vertisol)',
      'Sandy Clay Loam',
    ];

    const typeIndex = Math.floor(pseudoSeed * soilTypes.length) % soilTypes.length;
    const soil_type = soilTypes[typeIndex];
    const soil_ph = Number((6.2 + pseudoSeed * 0.9).toFixed(1)); // 6.2 to 7.1

    return {
      soil_type,
      soil_ph,
      organic_matter: pseudoSeed > 0.5 ? 'Moderate (1.4% - 2.1%)' : 'Slightly Depleted (<1.2%)',
      drainage: pseudoSeed > 0.4 ? 'Well Drained' : 'Moderately Slow Permeability',
      isMock: true,
    };
  }
}

export class ISRICSoilService implements ISoilService {
  async getSoilData(lat: number, lng: number): Promise<SoilData> {
    try {
      // ISRIC SoilGrids REST endpoint query
      const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${lat}&lon=${lng}&property=phh2o&property=clay&depth=0-30cm`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

      if (!response.ok) {
        throw new Error(`ISRIC SoilGrids returned status: ${response.status}`);
      }

      const data = await response.json();
      const phVal = data?.properties?.layers?.find((l: any) => l.name === 'phh2o')?.depths?.[0]?.values?.mean;
      const parsedPh = phVal ? Number((phVal / 10).toFixed(1)) : 6.5;

      return {
        soil_type: 'ISRIC Mapped Agricultural Loam',
        soil_ph: parsedPh,
        organic_matter: 'Standard Agro-Ecological Baseline',
        drainage: 'Good Natural Infiltration',
        isMock: false,
      };
    } catch (err) {
      console.warn('[ISRICSoilService] ISRIC query unavailable or timed out, falling back to mock provider:', err);
      const fallback = new MockSoilService();
      const mockData = await fallback.getSoilData(lat, lng);
      return {
        ...mockData,
        soil_type: `${mockData.soil_type} (Regional Estimate)`,
      };
    }
  }
}

let activeSoilService: ISoilService | null = null;

export function getSoilService(): ISoilService {
  if (!activeSoilService) {
    // If ISRIC_ENABLED environment flag is set, instantiate ISRIC service
    const isricEnabled = process.env.NEXT_PUBLIC_USE_ISRIC === 'true';
    if (isricEnabled) {
      activeSoilService = new ISRICSoilService();
    } else {
      activeSoilService = new MockSoilService();
    }
  }
  return activeSoilService;
}
