export interface PHTValidationRule {
  phtType: number;
  name: string;
  description: string;
  minAds: number;
  maxAds: number;
  requiredTags: string[];
  imageAttributes: {
    [key: string]: {
      required: boolean;
      pattern?: RegExp;
      allowedValues?: string[];
      validation?: (value: string) => boolean;
    };
  };
  animateAttributes: {
    [key: string]: {
      required: boolean;
      pattern?: RegExp;
      allowedValues?: string[];
    };
  };
  allowedFileTypes: string[];
}

export const PHT_VALIDATION_RULES: { [key: number]: PHTValidationRule } = {
  1: {
    phtType: 1,
    name: "Home Advert",
    description: "Home screen advertisement zone",
    minAds: 1,
    maxAds: 15,
    requiredTags: ['image', 'animate', 'genre', 'lang', 'adsStartTime', 'adsExpirationTime'],
    imageAttributes: {
      id: { 
        required: true, 
        validation: (value: string) => /^\d+$/.test(value) && parseInt(value) > 0 
      },
      zOrder: { 
        required: true, 
        pattern: /^\d{1,3}$/ 
      },
      type: { 
        required: true, 
        allowedValues: ['png', 'jpg', 'jpeg'] 
      },
      w: { 
        required: true, 
        allowedValues: ['180', '250', '300', '360'] 
      },
      h: { 
        required: true, 
        allowedValues: ['125', '180', '240', '280'] 
      },
      x: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      y: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      fileName: { 
        required: true, 
        pattern: /^[a-zA-Z0-9_\-\.]+\.(png|jpg|jpeg)$/ 
      },
      resolution: { 
        required: true, 
        allowedValues: ['small', 'large'] 
      },
      duration: { 
        required: true, 
        pattern: /^\d{2}$/ 
      },
      align: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      },
      style: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      }
    },
    animateAttributes: {
      style: { required: true, allowedValues: ['1', '2', '3'] },
      delay: { required: true, pattern: /^\d+$/ },
      pixel: { required: true, pattern: /^\d+$/ },
      dur: { required: true, pattern: /^\d+$/ },
      repeat: { required: true, allowedValues: ['0', '1'] }
    },
    allowedFileTypes: ['png', 'jpg', 'jpeg']
  },
  2: {
    phtType: 2,
    name: "Channel Banner Advert",
    description: "Channel banner advertisement zone",
    minAds: 1,
    maxAds: 10,
    requiredTags: ['image', 'animate', 'genre', 'lang', 'adsStartTime', 'adsExpirationTime'],
    imageAttributes: {
      id: { 
        required: true, 
        validation: (value: string) => /^\d+$/.test(value) && parseInt(value) > 0 
      },
      zOrder: { 
        required: true, 
        pattern: /^\d{1,3}$/ 
      },
      type: { 
        required: true, 
        allowedValues: ['png', 'jpg', 'jpeg'] 
      },
      w: { 
        required: true, 
        allowedValues: ['174', '200', '250'] 
      },
      h: { 
        required: true, 
        allowedValues: ['136', '150', '180'] 
      },
      x: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      y: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      fileName: { 
        required: true, 
        pattern: /^[a-zA-Z0-9_\-\.]+\.(png|jpg|jpeg)$/ 
      },
      resolution: { 
        required: true, 
        allowedValues: ['small', 'large'] 
      },
      duration: { 
        required: true, 
        pattern: /^\d{2}$/ 
      },
      align: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      },
      style: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      }
    },
    animateAttributes: {
      style: { required: true, allowedValues: ['1', '2', '3'] },
      delay: { required: true, pattern: /^\d+$/ },
      pixel: { required: true, pattern: /^\d+$/ },
      dur: { required: true, pattern: /^\d+$/ },
      repeat: { required: true, allowedValues: ['0', '1'] }
    },
    allowedFileTypes: ['png', 'jpg', 'jpeg']
  },
  3: {
    phtType: 3,
    name: "Guide Advert",
    description: "Guide screen advertisement zone",
    minAds: 1,
    maxAds: 8,
    requiredTags: ['image', 'animate', 'genre', 'lang', 'adsStartTime', 'adsExpirationTime'],
    imageAttributes: {
      id: { 
        required: true, 
        validation: (value: string) => /^\d+$/.test(value) && parseInt(value) > 0 
      },
      zOrder: { 
        required: true, 
        pattern: /^\d{1,3}$/ 
      },
      type: { 
        required: true, 
        allowedValues: ['png', 'jpg', 'jpeg'] 
      },
      w: { 
        required: true, 
        allowedValues: ['360', '400', '450'] 
      },
      h: { 
        required: true, 
        allowedValues: ['180', '200', '240'] 
      },
      x: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      y: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      fileName: { 
        required: true, 
        pattern: /^[a-zA-Z0-9_\-\.]+\.(png|jpg|jpeg)$/ 
      },
      resolution: { 
        required: true, 
        allowedValues: ['small', 'large'] 
      },
      duration: { 
        required: true, 
        pattern: /^\d{2}$/ 
      },
      align: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      },
      style: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      }
    },
    animateAttributes: {
      style: { required: true, allowedValues: ['1', '2', '3'] },
      delay: { required: true, pattern: /^\d+$/ },
      pixel: { required: true, pattern: /^\d+$/ },
      dur: { required: true, pattern: /^\d+$/ },
      repeat: { required: true, allowedValues: ['0', '1'] }
    },
    allowedFileTypes: ['png', 'jpg', 'jpeg']
  },
  4: {
    phtType: 4,
    name: "BootUp Advert",
    description: "Boot-up screen advertisement zone",
    minAds: 1,
    maxAds: 5,
    requiredTags: ['image', 'animate', 'genre', 'lang', 'adsStartTime', 'adsExpirationTime'],
    imageAttributes: {
      id: { 
        required: true, 
        validation: (value: string) => /^\d+$/.test(value) && parseInt(value) > 0 
      },
      zOrder: { 
        required: true, 
        pattern: /^\d{1,3}$/ 
      },
      type: { 
        required: true, 
        allowedValues: ['m2v', 'mp4', 'png', 'jpg', 'jpeg'] 
      },
      w: { 
        required: true, 
        allowedValues: ['480', '720', '1080'] 
      },
      h: { 
        required: true, 
        allowedValues: ['240', '360', '540'] 
      },
      x: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      y: { 
        required: true, 
        pattern: /^\d+$/ 
      },
      fileName: { 
        required: true, 
        pattern: /^[a-zA-Z0-9_\-\.]+\.(m2v|mp4|png|jpg|jpeg)$/ 
      },
      resolution: { 
        required: true, 
        allowedValues: ['small', 'large'] 
      },
      duration: { 
        required: true, 
        pattern: /^\d{2}$/ 
      },
      align: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      },
      style: { 
        required: true, 
        allowedValues: ['1', '2', '3'] 
      }
    },
    animateAttributes: {
      style: { required: true, allowedValues: ['1', '2', '3'] },
      delay: { required: true, pattern: /^\d+$/ },
      pixel: { required: true, pattern: /^\d+$/ },
      dur: { required: true, pattern: /^\d+$/ },
      repeat: { required: true, allowedValues: ['0', '1'] }
    },
    allowedFileTypes: ['m2v', 'mp4', 'png', 'jpg', 'jpeg']
  }
};

export const validateGenre = (genre: string): boolean => {
  return /^\d+$/.test(genre) && (genre === '255' || genre === '460' || parseInt(genre) > 0);
};

export const validateLanguage = (lang: string): boolean => {
  return /^[a-z]{3}$/.test(lang);
};

export const validateTimeFormat = (time: string): boolean => {
  const timePattern = /^"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}"$/;
  return timePattern.test(time);
};