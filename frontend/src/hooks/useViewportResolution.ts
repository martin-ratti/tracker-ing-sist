import { useState, useEffect } from 'react';
import {
  type ResolutionTier,
  type ResolutionProfile,
  detectResolutionTier,
  getResolutionTier,
  getResolutionProfile
} from '../utils/resolution';

export type { ResolutionTier, ResolutionProfile };
export { detectResolutionTier, getResolutionTier, getResolutionProfile };

export interface ViewportResolutionState extends ResolutionProfile {
  width: number;
  height: number;
}

/**
 * Hook para detectar de forma reactiva la resolución y altura del viewport,
 * retornando el perfil correspondiente (mobile, 720p, 1080p, 1440p, 2160p).
 */
export function useViewportResolution(isCalendarTab = true): ViewportResolutionState {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>(() => {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { width, height } = dimensions;
  const profile = getResolutionProfile(width, height, isCalendarTab);

  return {
    ...profile,
    width,
    height
  };
}
