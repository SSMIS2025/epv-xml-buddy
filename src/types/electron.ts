import { MockFileData } from './validation';

export interface ElectronXMLResponse {
  xmlContent: string;
  fileName: string;
  mockDatabase?: Record<string, MockFileData>;
  success: boolean;
  error?: string;
}

declare global {
  interface Window {
    electron?: {
      getXmlData: () => Promise<ElectronXMLResponse>;
    };
  }
}

export {};
