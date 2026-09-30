/**
 * CULTIVO — Weather Service Abstraction
 * Supports MockWeatherService for local prototypes and OpenWeatherService for production
 */

import { WeatherData } from '@/types';

export interface IWeatherService {
  getWeather(lat: number, lng: number): Promise<WeatherData>;
}

export class MockWeatherService implements IWeatherService {
  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    // Simulate natural network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Seed-like deterministic variation based on coordinates
    const pseudoSeed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233));
    const temp = Number((27.5 + (pseudoSeed * 6.5) - 3.0).toFixed(1)); // ~24.5 - 31.0 °C
    const humidity = Math.round(62 + (pseudoSeed * 26)); // ~62 - 88 %
    const pressure = Math.round(1008 + (pseudoSeed * 8)); // ~1008 - 1016 hPa

    let condition = 'Partly Cloudy';
    if (humidity > 78) condition = 'Humid & Overcast (Elevated Fungal Risk)';
    else if (temp > 30) condition = 'Warm & Sunny (High Evaporation)';

    const soilMoistureRoot = Number((14 + pseudoSeed * 12).toFixed(1));
    const soilMoistureSurface = Number((11 + pseudoSeed * 10).toFixed(1));
    const precip24h = Number((pseudoSeed * 6.5).toFixed(1));
    const et0 = Number((3.8 + pseudoSeed * 2.4).toFixed(1));

    let waterStress: 'Optimal' | 'Moisture Deficit' | 'Saturated / Waterlogged' = 'Optimal';
    let irrigationAdvice = 'Root zone moisture is balanced. Maintain standard drip scheduling.';
    if (soilMoistureRoot < 14) {
      waterStress = 'Moisture Deficit';
      irrigationAdvice = `Mild soil moisture deficit (${soilMoistureRoot}%). Evaporation rate is ${et0} mm/day. Schedule ground irrigation.`;
    } else if (soilMoistureRoot > 28) {
      waterStress = 'Saturated / Waterlogged';
      irrigationAdvice = `High moisture content (${soilMoistureRoot}%). Avoid wetting foliar canopy to suppress fungal incubation.`;
    }

    return {
      temp,
      humidity,
      pressure,
      condition,
      isMock: true,
      water: {
        soil_moisture_root_zone_percent: soilMoistureRoot,
        soil_moisture_surface_percent: soilMoistureSurface,
        precipitation_24h_mm: precip24h,
        evapotranspiration_mm: et0,
        water_stress_status: waterStress,
        irrigation_advice: irrigationAdvice,
      },
    };
  }
}

export class OpenMeteoWeatherService implements IWeatherService {
  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,precipitation,rain&daily=et0_fao_evapotranspiration,precipitation_sum&hourly=soil_moisture_0_to_1cm,soil_moisture_3_to_9cm&forecast_days=1&timezone=auto`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });

      if (!response.ok) {
        throw new Error(`Open-Meteo API returned status: ${response.status}`);
      }

      const data = await response.json();
      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const temp = current.temperature_2m != null ? Math.round(current.temperature_2m * 10) / 10 : 28.0;
      const humidity = current.relative_humidity_2m != null ? Math.round(current.relative_humidity_2m) : 65;
      const pressure = current.surface_pressure != null ? Math.round(current.surface_pressure) : 1010;

      const precip24h = daily.precipitation_sum?.[0] != null ? Number(daily.precipitation_sum[0].toFixed(1)) : 0;
      const et0 = daily.et0_fao_evapotranspiration?.[0] != null ? Number(daily.et0_fao_evapotranspiration[0].toFixed(1)) : 4.5;

      const hourIdx = Math.min(new Date().getHours(), (hourly.soil_moisture_3_to_9cm?.length || 1) - 1);
      const rootMoistRaw = hourly.soil_moisture_3_to_9cm?.[hourIdx] ?? 0.16;
      const surfaceMoistRaw = hourly.soil_moisture_0_to_1cm?.[hourIdx] ?? 0.12;

      const rootZonePercent = Number((rootMoistRaw * 100).toFixed(1));
      const surfacePercent = Number((surfaceMoistRaw * 100).toFixed(1));

      let waterStress: 'Optimal' | 'Moisture Deficit' | 'Saturated / Waterlogged' = 'Optimal';
      let irrigationAdvice = 'Root zone moisture is balanced. Maintain standard drip scheduling.';

      if (rootZonePercent < 13) {
        waterStress = 'Moisture Deficit';
        irrigationAdvice = `Soil moisture deficit detected (${rootZonePercent}%). Evapotranspiration is ${et0} mm/day. Supplemental ground drip irrigation advised.`;
      } else if (rootZonePercent > 32) {
        waterStress = 'Saturated / Waterlogged';
        irrigationAdvice = `Soil is near saturation (${rootZonePercent}%). Cease irrigation to avert root zone hypoxia and fungal root rot.`;
      }

      let condition = 'Partly Cloudy';
      if ((current.rain || 0) > 0.5) condition = 'Rainy Conditions';
      else if (humidity > 78) condition = 'Humid & Overcast (Fungal Risk Zone)';
      else if (temp > 32) condition = 'High Evaporative Demand';

      return {
        temp,
        humidity,
        pressure,
        condition,
        isMock: false,
        water: {
          soil_moisture_root_zone_percent: rootZonePercent,
          soil_moisture_surface_percent: surfacePercent,
          precipitation_24h_mm: precip24h,
          evapotranspiration_mm: et0,
          water_stress_status: waterStress,
          irrigation_advice: irrigationAdvice,
        },
      };
    } catch (err) {
      console.warn('[OpenMeteoWeatherService] API unavailable or timed out, falling back to mock provider:', err);
      const fallback = new MockWeatherService();
      return fallback.getWeather(lat, lng);
    }
  }
}

export class OpenWeatherService implements IWeatherService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      
      if (!response.ok) {
        throw new Error(`OpenWeather API returned status: ${response.status}`);
      }

      const data = await response.json();
      return {
        temp: Math.round(data.main.temp * 10) / 10,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        condition: data.weather?.[0]?.description ?? 'Clear Sky',
        isMock: false,
      };
    } catch (err) {
      console.warn('[OpenWeatherService] API unavailable or timed out, falling back to Open-Meteo:', err);
      const fallback = new OpenMeteoWeatherService();
      return fallback.getWeather(lat, lng);
    }
  }
}

let activeWeatherService: IWeatherService | null = null;

export function getWeatherService(): IWeatherService {
  if (!activeWeatherService) {
    const openWeatherKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (openWeatherKey && openWeatherKey.trim() !== '') {
      activeWeatherService = new OpenWeatherService(openWeatherKey);
    } else {
      // Default to live Open-Meteo High-Resolution Agricultural Weather & Water Service
      activeWeatherService = new OpenMeteoWeatherService();
    }
  }
  return activeWeatherService;
}
