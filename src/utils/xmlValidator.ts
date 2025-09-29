import { ValidationResult, ValidationError, EPGData } from '@/types/validation';
import { mockFileDatabase } from '@/data/mockFiles';
import { PHT_VALIDATION_RULES, validateGenre, validateLanguage, validateTimeFormat } from '@/config/phtValidationRules';

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

    // Validate each adZone with PHT-specific rules
    let totalActualAds = 0;
    const phtGroups: { [key: number]: number[] } = {};

    adZoneElements.forEach((adZone, index) => {
      const phtElement = adZone.querySelector('PHT');
      const numberOfAdsElement = adZone.querySelector('numberOfAds');
      const advertInfoElements = adZone.querySelectorAll('advertInfo');

      const pht = phtElement ? parseInt(phtElement.textContent || '0') : 0;
      const expectedAdsInZone = numberOfAdsElement ? parseInt(numberOfAdsElement.textContent || '0') : 0;

      // Group PHT types for duplicate checking
      if (!phtGroups[pht]) phtGroups[pht] = [];
      phtGroups[pht].push(index + 1);

      // Get PHT validation rules
      const phtRules = PHT_VALIDATION_RULES[pht];
      if (!phtRules) {
        errors.push({
          line: findLineNumber(lines, `<PHT>${pht}</PHT>`),
          message: `{Invalid-PHT} PHT ${pht} is not a valid PHT type (AdZone ${index + 1})`,
          type: 'error',
          adZone: index + 1,
          pht: pht
        });
      } else {
        // Validate ads count for PHT type
        if (expectedAdsInZone < phtRules.minAds || expectedAdsInZone > phtRules.maxAds) {
          errors.push({
            line: findLineNumber(lines, 'numberOfAds'),
            message: `{PHT-Rule-Violation} ${phtRules.name} (PHT ${pht}) requires ${phtRules.minAds}-${phtRules.maxAds} ads but ${expectedAdsInZone} declared (AdZone ${index + 1})`,
            type: 'error',
            adZone: index + 1,
            pht: pht
          });
        }
      }

      // Check numberOfAds vs actual advertInfo elements
      if (expectedAdsInZone !== advertInfoElements.length) {
        errors.push({
          line: findLineNumber(lines, 'numberOfAds'),
          message: `{Count-Mismatch} AdZone ${index + 1} (PHT ${pht}): Expected ${expectedAdsInZone} ads but found ${advertInfoElements.length}`,
          type: 'error',
          adZone: index + 1,
          pht: pht
        });
      }

      totalActualAds += advertInfoElements.length;

      // Validate each advertInfo with PHT-specific rules
      const imageIds: Set<string> = new Set();
      advertInfoElements.forEach((advertInfo, adIndex) => {
        const imageElement = advertInfo.querySelector('image');
        const animateElement = advertInfo.querySelector('animate');
        const genreElement = advertInfo.querySelector('genre');
        const langElement = advertInfo.querySelector('lang');
        const startTimeElement = advertInfo.querySelector('adsStartTime');
        const endTimeElement = advertInfo.querySelector('adsExpirationTime');

        if (imageElement) {
          validateImageElementWithPHT(imageElement, lines, errors, index + 1, pht, adIndex + 1, phtRules, imageIds);
        }

        if (animateElement && phtRules) {
          validateAnimateElement(animateElement, lines, errors, index + 1, pht, adIndex + 1, phtRules);
        }

        // Validate genre
        if (genreElement) {
          const genre = genreElement.textContent || '';
          if (!validateGenre(genre)) {
            errors.push({
              line: findLineNumber(lines, `<genre>${genre}</genre>`),
              message: `{Invalid-Genre} Genre '${genre}' must be a valid decimal value like 255 or 460 (AdZone ${index + 1}, Ad ${adIndex + 1})`,
              type: 'error',
              adZone: index + 1,
              pht: pht
            });
          }
        }

        // Validate language
        if (langElement) {
          const lang = langElement.textContent || '';
          if (!validateLanguage(lang)) {
            errors.push({
              line: findLineNumber(lines, `<lang>${lang}</lang>`),
              message: `{Invalid-Language} Language '${lang}' must be exactly 3 characters (AdZone ${index + 1}, Ad ${adIndex + 1})`,
              type: 'error',
              adZone: index + 1,
              pht: pht
            });
          }
        }

        // Validate time formats
        if (startTimeElement) {
          const startTime = startTimeElement.textContent || '';
          if (!validateTimeFormat(startTime)) {
            errors.push({
              line: findLineNumber(lines, startTime),
              message: `{Invalid-Time-Format} Start time must follow pattern "YYYY-MM-DDTHH:MM:SS+HH:MM" (AdZone ${index + 1}, Ad ${adIndex + 1})`,
              type: 'error',
              adZone: index + 1,
              pht: pht
            });
          }
        }

        if (endTimeElement) {
          const endTime = endTimeElement.textContent || '';
          if (!validateTimeFormat(endTime)) {
            errors.push({
              line: findLineNumber(lines, endTime),
              message: `{Invalid-Time-Format} End time must follow pattern "YYYY-MM-DDTHH:MM:SS+HH:MM" (AdZone ${index + 1}, Ad ${adIndex + 1})`,
              type: 'error',
              adZone: index + 1,
              pht: pht
            });
          }
        }

        // Check required elements for PHT
        if (phtRules) {
          phtRules.requiredTags.forEach(tagName => {
            if (!advertInfo.querySelector(tagName)) {
              errors.push({
                line: findLineNumber(lines, 'advertInfo'),
                message: `{Missing-Tag} Missing <${tagName}> required for ${phtRules.name} (AdZone ${index + 1}, Ad ${adIndex + 1})`,
                type: 'error',
                adZone: index + 1,
                pht: pht
              });
            }
          });
        }
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

function validateImageElementWithPHT(
  imageElement: Element,
  lines: string[],
  errors: ValidationError[],
  adZone: number,
  pht: number,
  adIndex: number,
  phtRules: any,
  imageIds: Set<string>
) {
  // Validate all required attributes for this PHT type
  Object.entries(phtRules.imageAttributes).forEach(([attr, rules]: [string, any]) => {
    const value = imageElement.getAttribute(attr);
    
    if (rules.required && !value) {
      errors.push({
        line: findLineNumber(lines, 'image'),
        message: `{Missing-Attribute} Missing '${attr}' attribute required for ${phtRules.name} (AdZone ${adZone}, Ad ${adIndex})`,
        type: 'error',
        adZone,
        pht,
        field: attr
      });
      return;
    }

    if (value) {
      // Check allowed values
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        errors.push({
          line: findLineNumber(lines, `${attr}="${value}"`),
          message: `{Invalid-Value} Attribute '${attr}' value '${value}' not allowed for ${phtRules.name}. Allowed: ${rules.allowedValues.join(', ')} (AdZone ${adZone}, Ad ${adIndex})`,
          type: 'error',
          adZone,
          pht,
          field: attr
        });
      }

      // Check pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          line: findLineNumber(lines, `${attr}="${value}"`),
          message: `{Pattern-Mismatch} Attribute '${attr}' value '${value}' doesn't match required pattern for ${phtRules.name} (AdZone ${adZone}, Ad ${adIndex})`,
          type: 'error',
          adZone,
          pht,
          field: attr
        });
      }

      // Check custom validation
      if (rules.validation && !rules.validation(value)) {
        errors.push({
          line: findLineNumber(lines, `${attr}="${value}"`),
          message: `{Validation-Failed} Attribute '${attr}' value '${value}' failed validation for ${phtRules.name} (AdZone ${adZone}, Ad ${adIndex})`,
          type: 'error',
          adZone,
          pht,
          field: attr
        });
      }
    }
  });

  // Check for duplicate IDs within the same PHT
  const id = imageElement.getAttribute('id');
  if (id) {
    if (imageIds.has(id)) {
      errors.push({
        line: findLineNumber(lines, `id="${id}"`),
        message: `{Duplicate-ID} Image ID '${id}' is duplicated within ${phtRules.name} (AdZone ${adZone}, Ad ${adIndex})`,
        type: 'error',
        adZone,
        pht,
        field: 'id'
      });
    } else {
      imageIds.add(id);
    }
  }

  // Validate file type against PHT allowed types
  const type = imageElement.getAttribute('type');
  if (type && !phtRules.allowedFileTypes.includes(type.toLowerCase())) {
    errors.push({
      line: findLineNumber(lines, `type="${type}"`),
      message: `{Invalid-File-Type} File type '${type}' not allowed for ${phtRules.name}. Allowed: ${phtRules.allowedFileTypes.join(', ')} (AdZone ${adZone}, Ad ${adIndex})`,
      type: 'error',
      adZone,
      pht
    });
  }

  // Validate dimensions and file against mock database
  const fileName = imageElement.getAttribute('fileName');
  const xmlWidth = parseInt(imageElement.getAttribute('w') || '0');
  const xmlHeight = parseInt(imageElement.getAttribute('h') || '0');

  if (fileName && mockFileDatabase[fileName]) {
    const mockFile = mockFileDatabase[fileName];
    
    if (xmlWidth !== mockFile.actualWidth || xmlHeight !== mockFile.actualHeight) {
      errors.push({
        line: findLineNumber(lines, fileName),
        message: `{Dimension-Mismatch} File ${fileName}: XML declares ${xmlWidth}x${xmlHeight} but actual dimensions are ${mockFile.actualWidth}x${mockFile.actualHeight} (AdZone ${adZone}, Ad ${adIndex})`,
        type: 'error',
        adZone,
        pht,
        field: 'dimensions'
      });
    }
  } else if (fileName) {
    errors.push({
      line: findLineNumber(lines, fileName),
      message: `{File-Not-Found} File ${fileName} not found in mock database (AdZone ${adZone}, Ad ${adIndex})`,
      type: 'error',
      adZone,
      pht,
      field: 'fileName'
    });
  }
}

function validateAnimateElement(
  animateElement: Element,
  lines: string[],
  errors: ValidationError[],
  adZone: number,
  pht: number,
  adIndex: number,
  phtRules: any
) {
  Object.entries(phtRules.animateAttributes).forEach(([attr, rules]: [string, any]) => {
    const value = animateElement.getAttribute(attr);
    
    if (rules.required && !value) {
      errors.push({
        line: findLineNumber(lines, 'animate'),
        message: `{Missing-Attribute} Missing '${attr}' attribute in animate element for ${phtRules.name} (AdZone ${adZone}, Ad ${adIndex})`,
        type: 'error',
        adZone,
        pht,
        field: attr
      });
      return;
    }

    if (value) {
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        errors.push({
          line: findLineNumber(lines, `${attr}="${value}"`),
          message: `{Invalid-Value} Animate attribute '${attr}' value '${value}' not allowed for ${phtRules.name}. Allowed: ${rules.allowedValues.join(', ')} (AdZone ${adZone}, Ad ${adIndex})`,
          type: 'error',
          adZone,
          pht,
          field: attr
        });
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          line: findLineNumber(lines, `${attr}="${value}"`),
          message: `{Pattern-Mismatch} Animate attribute '${attr}' value '${value}' doesn't match required pattern for ${phtRules.name} (AdZone ${adZone}, Ad ${adIndex})`,
          type: 'error',
          adZone,
          pht,
          field: attr
        });
      }
    }
  });
}

function findLineNumber(lines: string[], searchText: string): number {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return 1;
}