/**
 * CULTIVO — Geolocation Service
 * Explicit state-machine geolocation with safe fallback handling
 */

import { GeolocationStatus, LocationData } from '@/types';

export const DEV_FALLBACK_COORDINATES: LocationData = {
  latitude: 11.0168,
  longitude: 76.9558,
  accuracy: 15,
  isFallback: true,
  source: 'fallback',
  regionName: 'Coimbatore Agro-Ecological Belt, TN (Dev Fallback)',
};

export interface GeolocationResult {
  status: GeolocationStatus;
  data: LocationData;
  error?: string;
}

export class GeolocationService {
  /**
   * Request device coordinates via browser navigator.geolocation
   * Falls back gracefully to Coimbatore agricultural zone if denied, timed out, or unavailable
   */
  public static async getCurrentLocation(): Promise<GeolocationResult> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return {
        status: 'unavailable',
        data: DEV_FALLBACK_COORDINATES,
        error: 'Browser geolocation is not supported in this environment.',
      };
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({
          status: 'timeout',
          data: DEV_FALLBACK_COORDINATES,
          error: 'Geolocation request timed out. Using designated agricultural test coordinates.',
        });
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            status: 'success',
            data: {
              latitude: Number(position.coords.latitude.toFixed(6)),
              longitude: Number(position.coords.longitude.toFixed(6)),
              accuracy: Math.round(position.coords.accuracy),
              isFallback: false,
              source: 'device',
              regionName: `Field Coordinates (${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°)`,
            },
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          let status: GeolocationStatus = 'error';
          let errorMessage = error.message;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              status = 'permission_denied';
              errorMessage = 'Location permission was denied. Switched to designated agricultural test zone.';
              break;
            case error.POSITION_UNAVAILABLE:
              status = 'unavailable';
              errorMessage = 'Location position is currently unavailable from device sensors.';
              break;
            case error.TIMEOUT:
              status = 'timeout';
              errorMessage = 'Location acquisition timed out.';
              break;
            default:
              status = 'error';
          }

          resolve({
            status,
            data: DEV_FALLBACK_COORDINATES,
            error: errorMessage,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    });
  }
}
