import { ValidationResult } from '@/types/validation';

export interface ValidationHistory {
  id: string;
  fileName: string;
  timestamp: Date;
  isValid: boolean;
  errorCount: number;
  summary: ValidationResult['summary'];
}

const HISTORY_KEY = 'epg_validation_history';
const MAX_HISTORY_ITEMS = 5;

export const saveValidationHistory = (fileName: string, result: ValidationResult): void => {
  try {
    const existingHistory = getValidationHistory();
    
    const newItem: ValidationHistory = {
      id: Date.now().toString(),
      fileName,
      timestamp: new Date(),
      isValid: result.isValid,
      errorCount: result.errors.length,
      summary: result.summary
    };

    const updatedHistory = [newItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save validation history:', error);
  }
};

export const getValidationHistory = (): ValidationHistory[] => {
  try {
    const historyData = localStorage.getItem(HISTORY_KEY);
    if (!historyData) return [];
    
    const history = JSON.parse(historyData);
    return history.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load validation history:', error);
    return [];
  }
};

export const clearValidationHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear validation history:', error);
  }
};