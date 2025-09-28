import { MockFileData } from '@/types/validation';

export const mockFileDatabase: Record<string, MockFileData> = {
  'boot_ST112HW_29.m2v': {
    fileName: 'boot_ST112HW_29.m2v',
    actualWidth: 480,
    actualHeight: 240,
    mimeType: 'video/mpeg',
    resolution: 'small',
    fileSize: 2048000
  },
  'm1_ST112HW_29.png': {
    fileName: 'm1_ST112HW_29.png',
    actualWidth: 88,
    actualHeight: 126,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 15360
  },
  'm2_ST112HW_29.png': {
    fileName: 'm2_ST112HW_29.png',
    actualWidth: 88,
    actualHeight: 126,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 15360
  },
  'm3_ST112HW_29.png': {
    fileName: 'm3_ST112HW_29.png',
    actualWidth: 90, // Different from XML to test validation
    actualHeight: 128,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 15800
  },
  'm4_ST112HW_29.png': {
    fileName: 'm4_ST112HW_29.png',
    actualWidth: 88,
    actualHeight: 126,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 15360
  },
  'cb1_ST112HW_29.png': {
    fileName: 'cb1_ST112HW_29.png',
    actualWidth: 174,
    actualHeight: 136,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 38400
  },
  'cb2_ST112HW_29.png': {
    fileName: 'cb2_ST112HW_29.png',
    actualWidth: 174,
    actualHeight: 136,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 38400
  },
  'cb3_ST112HW_29.png': {
    fileName: 'cb3_ST112HW_29.png',
    actualWidth: 176, // Different dimensions to test validation
    actualHeight: 138,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 39200
  },
  'cb4_ST112HW_29.png': {
    fileName: 'cb4_ST112HW_29.png',
    actualWidth: 174,
    actualHeight: 136,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 38400
  },
  'cb5_ST112HW_29.png': {
    fileName: 'cb5_ST112HW_29.png',
    actualWidth: 174,
    actualHeight: 136,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 38400
  },
  'g1_ST112HW_29.png': {
    fileName: 'g1_ST112HW_29.png',
    actualWidth: 360,
    actualHeight: 180,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 105600
  },
  'g2_ST112HW_29.png': {
    fileName: 'g2_ST112HW_29.png',
    actualWidth: 360,
    actualHeight: 180,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 105600
  },
  'g3_ST112HW_29.png': {
    fileName: 'g3_ST112HW_29.png',
    actualWidth: 362, // Slightly different dimensions
    actualHeight: 182,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 107000
  },
  'g4_ST112HW_29.png': {
    fileName: 'g4_ST112HW_29.png',
    actualWidth: 360,
    actualHeight: 180,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 105600
  },
  'g5_ST112HW_29.png': {
    fileName: 'g5_ST112HW_29.png',
    actualWidth: 360,
    actualHeight: 180,
    mimeType: 'image/png',
    resolution: 'small',
    fileSize: 105600
  }
};