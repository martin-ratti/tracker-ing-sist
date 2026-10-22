/**
 * Tipos de resolución reconocidos para adaptación responsive en la aplicación.
 * - mobile: Dispositivos móviles y tablets en vertical (ancho < 640px)
 * - 720p: HD (1280x720, 1366x768 o laptops con altura reducida <= 780px)
 * - 1080p: Full HD (1920x1080 estándar de escritorio)
 * - 1440p: QHD / 2K (2560x1440)
 * - 2160p: UHD / 4K (3840x2160)
 */
export type ResolutionTier = 'mobile' | '720p' | '1080p' | '1440p' | '2160p';

export interface ResolutionProfile {
  tier: ResolutionTier;
  nombre: string;
  resolucionBase: string;
  isMobile: boolean;
  isHD: boolean;
  isFullHD: boolean;
  is2K: boolean;
  is4K: boolean;
  /** Indica si la pantalla tiene altura reducida (laptops 720p o móvil) */
  isCompactHeight: boolean;
  /** Indica si la pantalla tiene altura estándar Full HD */
  isStandardHeight: boolean;
  /** Clases CSS específicas para el modal del calendario */
  calendarModalSize: string;
  /** Clases de padding del contenedor */
  containerPadding: string;
  /** Clases de celdas de días */
  dayCellPadding: string;
  dayNumberSize: string;
  turnBadgeSize: string;
  metaBadgeSize: string;
  anotarButtonSize: string;
}

/**
 * Clasifica las dimensiones de viewport en un ResolutionTier estándar de PC o móvil.
 */
export function detectResolutionTier(width: number, height: number): ResolutionTier {
  if (width < 640) return 'mobile';

  // 4K (2160p): pantallas de muy alta resolución (altura > 1500px o ultrapanorámicas 4K)
  if (height > 1500 || (width >= 3400 && height > 1100)) {
    return '2160p';
  }

  // 2K (1440p / QHD): pantallas 2560x1440 o altura entre 1100px y 1500px
  if (height > 1100 || (width >= 2400 && height > 850)) {
    return '1440p';
  }

  // 720p (HD): laptops de 1366x768 o 1280x720 (altura útil en navegador <= 780px)
  if (height <= 780) {
    return '720p';
  }

  // 1080p (Full HD): estándar 1920x1080 (altura útil en navegador entre 781px y 1100px)
  return '1080p';
}

/**
 * Retorna el perfil completo de configuración responsive y diseño adaptativo.
 */
export function getResolutionProfile(width: number, height: number, isCalendarTab = true): ResolutionProfile {
  const tier = detectResolutionTier(width, height);

  switch (tier) {
    case 'mobile':
      return {
        tier: 'mobile',
        nombre: 'Mobile',
        resolucionBase: '< 640px',
        isMobile: true,
        isHD: false,
        isFullHD: false,
        is2K: false,
        is4K: false,
        isCompactHeight: true,
        isStandardHeight: false,
        calendarModalSize: isCalendarTab ? 'w-full h-[94vh]' : 'w-full max-h-[92vh]',
        containerPadding: 'p-2 sm:p-2.5',
        dayCellPadding: 'p-1',
        dayNumberSize: 'text-[11px]',
        turnBadgeSize: 'text-[8px] max-w-[70px]',
        metaBadgeSize: 'text-[8.5px]',
        anotarButtonSize: 'py-0.5 text-[8.5px]'
      };

    case '720p':
      return {
        tier: '720p',
        nombre: 'HD (720p)',
        resolucionBase: '1280x720 / 1366x768',
        isMobile: false,
        isHD: true,
        isFullHD: false,
        is2K: false,
        is4K: false,
        isCompactHeight: true,
        isStandardHeight: false,
        // En 720p maximizamos el alto a 96vh con padding ultracompacto para que quepan las 6 filas con cero scroll
        calendarModalSize: isCalendarTab ? 'max-w-5xl h-[96vh]' : 'max-w-4xl max-h-[94vh]',
        containerPadding: 'p-1.5 sm:p-2',
        dayCellPadding: 'p-0.5 sm:p-1',
        dayNumberSize: 'text-[10px] sm:text-[11px]',
        turnBadgeSize: 'text-[8px] max-w-[80px]',
        metaBadgeSize: 'text-[8px]',
        anotarButtonSize: 'py-0.5 text-[8px]'
      };

    case '1440p':
      return {
        tier: '1440p',
        nombre: 'QHD / 2K (1440p)',
        resolucionBase: '2560x1440',
        isMobile: false,
        isHD: false,
        isFullHD: false,
        is2K: true,
        is4K: false,
        isCompactHeight: false,
        isStandardHeight: false,
        // En 2K (1440p) aprovechamos la amplitud de pantalla para un diseño espacioso y espectacular
        calendarModalSize: isCalendarTab ? 'max-w-[1450px] h-[88vh]' : 'max-w-5xl max-h-[88vh]',
        containerPadding: 'p-3 sm:p-4.5',
        dayCellPadding: 'p-1.5 sm:p-2.5',
        dayNumberSize: 'text-xs sm:text-sm',
        turnBadgeSize: 'text-[9.5px] max-w-[140px]',
        metaBadgeSize: 'text-[9.5px]',
        anotarButtonSize: 'py-1 text-[10px]'
      };

    case '2160p':
      return {
        tier: '2160p',
        nombre: 'UHD / 4K (2160p)',
        resolucionBase: '3840x2160',
        isMobile: false,
        isHD: false,
        isFullHD: false,
        is2K: false,
        is4K: true,
        isCompactHeight: false,
        isStandardHeight: false,
        // En 4K (2160p) aumentamos proporciones para mantener legibilidad cristalina y presencia
        calendarModalSize: isCalendarTab ? 'max-w-[1750px] h-[84vh]' : 'max-w-6xl max-h-[85vh]',
        containerPadding: 'p-4 sm:p-5',
        dayCellPadding: 'p-2 sm:p-3',
        dayNumberSize: 'text-sm sm:text-base',
        turnBadgeSize: 'text-[10.5px] max-w-[170px]',
        metaBadgeSize: 'text-[10.5px]',
        anotarButtonSize: 'py-1.5 text-[11px]'
      };

    case '1080p':
    default:
      return {
        tier: '1080p',
        nombre: 'Full HD (1080p)',
        resolucionBase: '1920x1080',
        isMobile: false,
        isHD: false,
        isFullHD: true,
        is2K: false,
        is4K: false,
        isCompactHeight: false,
        isStandardHeight: true,
        // En 1080p ajustamos para que el mes completo encaje 100% sin scroll vertical
        calendarModalSize: isCalendarTab ? 'max-w-[1240px] h-[91vh]' : 'max-w-5xl max-h-[90vh]',
        containerPadding: 'p-2 sm:p-3',
        dayCellPadding: 'p-1 sm:p-1.5',
        dayNumberSize: 'text-[11px] sm:text-xs',
        turnBadgeSize: 'text-[8.5px] sm:text-[9px] max-w-[105px]',
        metaBadgeSize: 'text-[9px]',
        anotarButtonSize: 'py-0.5 sm:py-1 text-[9px] sm:text-[10px]'
      };
  }
}

/**
 * Alias de detectResolutionTier para conveniencia de nomenclatura
 */
export const getResolutionTier = detectResolutionTier;
