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

    return {
      temp,
      humidity,
      pressure,
      condition,
      isMock: true,
    };
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
      console.warn('[OpenWeatherService] API unavailable or timed out, falling back to mock provider:', err);
      const fallback = new MockWeatherService();
      const mockData = await fallback.getWeather(lat, lng);
      return {
        ...mockData,
        condition: `${mockData.condition} (Service Fallback)`,
      };
    }
  }
}

let activeWeatherService: IWeatherService | null = null;

export function getWeatherService(): IWeatherService {
  if (!activeWeatherService) {
    const key = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (key && key.trim() !== '') {
      activeWeatherService = new OpenWeatherService(key);
    } else {
      activeWeatherService = new MockWeatherService();
    }
  }
  return activeWeatherService;
}
