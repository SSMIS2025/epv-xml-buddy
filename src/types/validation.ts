export interface AdZoneInfo {
  PHT: number;
  numberOfAds: number;
  advertInfo: AdvertInfo[];
}

export interface AdvertInfo {
  image: {
    id: string;
    type: string;
    w: number;
    h: number;
    x: number;
    y: number;
    fileName: string;
    resolution: string;
    duration: string;
    align: string;
    style: string;
  };
  animate: {
    style: string;
    delay: string;
    pixel: string;
    dur: string;
    repeat: string;
  };
  genre: string;
  lang: string;
  adsStartTime: string;
  adsExpirationTime: string;
}

export interface EPGData {
  category: string;
  subCategory: string;
  numberOfAdZones: number;
  totalnumberOfAds: number;
  adZones: AdZoneInfo[];
}

export interface ValidationError {
  line: number;
  message: string;
  type: 'error' | 'warning';
  adZone?: number;
  pht?: number;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  presentPHTs: number[];
  summary: {
    totalAdZones: number;
    expectedAdZones: number;
    totalAds: number;
    expectedAds: number;
    missingTags: string[];
    invalidAttributes: string[];
  };
}

export interface MockFileData {
  fileName: string;
  actualWidth: number;
  actualHeight: number;
  mimeType: string;
  resolution: string;
  fileSize: number;
}