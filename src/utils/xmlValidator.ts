import { ValidationResult, ValidationError, EPGData } from '@/types/validation';
import { mockFileDatabase } from '@/data/mockFiles';

export function validateEPGXML(xmlContent: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const lines = xmlContent.split('\n');

  try {
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for XML parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      errors.push({
        line: 1,
        message: 'Invalid XML structure: ' + parserError.textContent,
        type: 'error'
      });
      return {
        isValid: false,
        errors,
        warnings,
        summary: {
          totalAdZones: 0,
          expectedAdZones: 0,
          totalAds: 0,
          expectedAds: 0,
          missingTags: [],
          invalidAttributes: []
        }
      };
    }

    const root = xmlDoc.documentElement;
    if (!root || root.tagName !== 'start') {
      errors.push({
        line: 1,
        message: 'Root element must be <start>',
        type: 'error'
      });
    }

    // Validate numberOfAdZones vs actual adZone elements
    const numberOfAdZonesElement = xmlDoc.querySelector('numberOfAdZones');
    const totalNumberOfAdsElement = xmlDoc.querySelector('totalnumberOfAds');
    const adZoneElements = xmlDoc.querySelectorAll('adZone');

    let expectedAdZones = 0;
    let expectedTotalAds = 0;

    if (numberOfAdZonesElement) {
      expectedAdZones = parseInt(numberOfAdZonesElement.textContent || '0');
    } else {
      errors.push({
        line: findLineNumber(lines, 'numberOfAdZones'),
        message: 'Missing <numberOfAdZones> element',
        type: 'error'
      });
    }

    if (totalNumberOfAdsElement) {
      expectedTotalAds = parseInt(totalNumberOfAdsElement.textContent || '0');
    } else {
      errors.push({
        line: findLineNumber(lines, 'totalnumberOfAds'),
        message: 'Missing <totalnumberOfAds> element',
        type: 'error'
      });
    }

    // Check adZone count
    if (expectedAdZones !== adZoneElements.length) {
      errors.push({
        line: findLineNumber(lines, 'numberOfAdZones'),
        message: `Expected ${expectedAdZones} adZones but found ${adZoneElements.length}`,
        type: 'error'
      });
    }

    // Validate each adZone
    let totalActualAds = 0;
    adZoneElements.forEach((adZone, index) => {
      const phtElement = adZone.querySelector('PHT');
      const numberOfAdsElement = adZone.querySelector('numberOfAds');
      const advertInfoElements = adZone.querySelectorAll('advertInfo');

      const pht = phtElement ? parseInt(phtElement.textContent || '0') : 0;
      const expectedAdsInZone = numberOfAdsElement ? parseInt(numberOfAdsElement.textContent || '0') : 0;

      // Check numberOfAds vs actual advertInfo elements
      if (expectedAdsInZone !== advertInfoElements.length) {
        errors.push({
          line: findLineNumber(lines, 'numberOfAds'),
          message: `AdZone ${index + 1} (PHT ${pht}): Expected ${expectedAdsInZone} ads but found ${advertInfoElements.length}`,
          type: 'error',
          adZone: index + 1,
          pht: pht
        });
      }

      totalActualAds += advertInfoElements.length;

      // Validate each advertInfo
      advertInfoElements.forEach((advertInfo, adIndex) => {
        const imageElement = advertInfo.querySelector('image');
        if (imageElement) {
          validateImageElement(imageElement, lines, errors, warnings, index + 1, pht, adIndex + 1);
        }

        // Check required elements
        const requiredElements = ['genre', 'lang', 'adsStartTime', 'adsExpirationTime'];
        requiredElements.forEach(elementName => {
          if (!advertInfo.querySelector(elementName)) {
            errors.push({
              line: findLineNumber(lines, 'advertInfo'),
              message: `Missing <${elementName}> in AdZone ${index + 1}, Ad ${adIndex + 1}`,
              type: 'error',
              adZone: index + 1,
              pht: pht
            });
          }
        });
      });
    });

    // Check total ads count
    if (expectedTotalAds !== totalActualAds) {
      errors.push({
        line: findLineNumber(lines, 'totalnumberOfAds'),
        message: `Expected ${expectedTotalAds} total ads but found ${totalActualAds}`,
        type: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalAdZones: adZoneElements.length,
        expectedAdZones,
        totalAds: totalActualAds,
        expectedAds: expectedTotalAds,
        missingTags: [],
        invalidAttributes: []
      }
    };

  } catch (error) {
    errors.push({
      line: 1,
      message: 'Failed to parse XML: ' + (error as Error).message,
      type: 'error'
    });

    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        totalAdZones: 0,
        expectedAdZones: 0,
        totalAds: 0,
        expectedAds: 0,
        missingTags: [],
        invalidAttributes: []
      }
    };
  }
}

function validateImageElement(
  imageElement: Element,
  lines: string[],
  errors: ValidationError[],
  warnings: ValidationError[],
  adZone: number,
  pht: number,
  adIndex: number
) {
  const requiredAttributes = ['id', 'type', 'w', 'h', 'x', 'y', 'fileName', 'resolution', 'duration', 'align', 'style'];
  
  requiredAttributes.forEach(attr => {
    if (!imageElement.hasAttribute(attr)) {
      errors.push({
        line: findLineNumber(lines, 'image'),
        message: `Missing '${attr}' attribute in image element (AdZone ${adZone}, Ad ${adIndex})`,
        type: 'error',
        adZone,
        pht,
        field: attr
      });
    }
  });

  // Validate file type
  const type = imageElement.getAttribute('type');
  const validTypes = ['png', 'jpg', 'jpeg', 'm2v', 'mp4'];
  if (type && !validTypes.includes(type.toLowerCase())) {
    errors.push({
      line: findLineNumber(lines, 'type'),
      message: `Invalid file type '${type}' (AdZone ${adZone}, Ad ${adIndex})`,
      type: 'error',
      adZone,
      pht
    });
  }

  // Validate dimensions and file
  const fileName = imageElement.getAttribute('fileName');
  const xmlWidth = parseInt(imageElement.getAttribute('w') || '0');
  const xmlHeight = parseInt(imageElement.getAttribute('h') || '0');

  if (fileName && mockFileDatabase[fileName]) {
    const mockFile = mockFileDatabase[fileName];
    
    if (xmlWidth !== mockFile.actualWidth || xmlHeight !== mockFile.actualHeight) {
      warnings.push({
        line: findLineNumber(lines, fileName),
        message: `Dimension mismatch for ${fileName}: XML declares ${xmlWidth}x${xmlHeight} but actual is ${mockFile.actualWidth}x${mockFile.actualHeight} (AdZone ${adZone}, Ad ${adIndex})`,
        type: 'warning',
        adZone,
        pht
      });
    }
  } else if (fileName) {
    warnings.push({
      line: findLineNumber(lines, fileName),
      message: `File ${fileName} not found in database (AdZone ${adZone}, Ad ${adIndex})`,
      type: 'warning',
      adZone,
      pht
    });
  }
}

function findLineNumber(lines: string[], searchText: string): number {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return 1;
}