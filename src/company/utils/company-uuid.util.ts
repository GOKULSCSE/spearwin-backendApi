/**
 * Utility functions for generating company UUIDs
 */

/**
 * Generates a short form from company name
 * Examples:
 * - "Webnox" -> "wbnx"
 * - "Microsoft Corporation" -> "msft"
 * - "Apple Inc" -> "apl"
 * - "Google LLC" -> "goog"
 * - "Amazon Web Services" -> "aws"
 */
export function generateShortForm(companyName: string): string {
  if (!companyName || companyName.trim().length === 0) {
    throw new Error('Company name is required');
  }

  // Clean the company name
  const cleanName = companyName.trim().toLowerCase();
  
  // Remove common suffixes and words
  const suffixes = [
    'inc', 'inc.', 'corporation', 'corp', 'corp.', 'llc', 'ltd', 'ltd.', 
    'limited', 'company', 'co', 'co.', 'group', 'technologies', 'tech',
    'solutions', 'services', 'systems', 'software', 'international',
    'global', 'enterprises', 'holdings', 'partners', 'associates'
  ];
  
  let processedName = cleanName;
  
  // Remove suffixes
  for (const suffix of suffixes) {
    const regex = new RegExp(`\\b${suffix}\\b`, 'gi');
    processedName = processedName.replace(regex, '').trim();
  }
  
  // Split into words
  const words = processedName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    // Fallback to first 4 characters of original name
    return cleanName.substring(0, 4).replace(/[^a-z]/g, '');
  }
  
  if (words.length === 1) {
    // Single word - take first 4 characters
    return words[0].substring(0, 4).replace(/[^a-z]/g, '');
  }
  
  if (words.length === 2) {
    // Two words - take first 2 characters from each
    return words.map(word => word.substring(0, 2)).join('').replace(/[^a-z]/g, '');
  }
  
  // Three or more words - take first character from each word, max 4 characters
  const shortForm = words.map(word => word.charAt(0)).join('').substring(0, 4);
  return shortForm.replace(/[^a-z]/g, '');
}

/**
 * Generates a unique company UUID in the format: spw-[short]-[number]
 * @param companyName - The company name to generate UUID from
 * @param existingUuids - Array of existing UUIDs to check for uniqueness
 * @returns A unique UUID string
 */
export function generateCompanyUuid(companyName: string, existingUuids: string[] = []): string {
  const shortForm = generateShortForm(companyName);
  
  // Find the highest number for this short form
  const pattern = new RegExp(`^spw-${shortForm}-(\\d+)$`);
  let maxNumber = 0;
  
  existingUuids.forEach(uuid => {
    const match = uuid.match(pattern);
    if (match) {
      const number = parseInt(match[1], 10);
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });
  
  // Generate next number (padded to 3 digits)
  const nextNumber = maxNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  
  return `spw-${shortForm}-${paddedNumber}`;
}

/**
 * Generates the next 2-letter code in sequence (aa, ab, ac, ..., zz)
 * @param currentCode - Current 2-letter code
 * @returns Next 2-letter code
 */
function getNextCode(currentCode: string): string {
  if (!currentCode || currentCode.length !== 2) {
    return 'aa';
  }
  
  const first = currentCode.charCodeAt(0) - 97; // 'a' = 0
  const second = currentCode.charCodeAt(1) - 97; // 'a' = 0
  
  // Increment second letter
  let newSecond = second + 1;
  let newFirst = first;
  
  // If second letter exceeds 'z', reset to 'a' and increment first letter
  if (newSecond > 25) {
    newSecond = 0;
    newFirst = first + 1;
  }
  
  // If first letter exceeds 'z', reset to 'aa' (shouldn't happen in practice)
  if (newFirst > 25) {
    return 'aa';
  }
  
  return String.fromCharCode(97 + newFirst) + String.fromCharCode(97 + newSecond);
}

/**
 * Generates a unique company ID in the format: spear-[code]-[number]
 * Uses sequential 2-letter codes (aa, ab, ac, ...) instead of company name
 * @param companyName - Not used, kept for backward compatibility
 * @param existingCompanyIds - Array of existing company IDs to check for uniqueness
 * @returns A unique company ID string
 */
export function generateCompanyId(companyName: string, existingCompanyIds: string[] = []): string {
  // Parse all existing company IDs
  const pattern = /^spear-([a-z]{2})-(\d{3})$/;
  const codeMap = new Map<string, number>(); // Map of code -> max number
  
  // Debug: Log existing IDs
  console.log('Existing company IDs:', existingCompanyIds);
  
  existingCompanyIds.forEach(companyId => {
    if (!companyId) return; // Skip null/undefined
    const match = companyId.match(pattern);
    if (match) {
      const code = match[1];
      const number = parseInt(match[2], 10);
      const currentMax = codeMap.get(code) || 0;
      if (number > currentMax) {
        codeMap.set(code, number);
      }
    } else {
      console.warn(`Invalid company ID format: ${companyId}`);
    }
  });
  
  // Debug: Log code map
  console.log('Code map:', Array.from(codeMap.entries()));
  
  // If no existing IDs, start with aa-001
  if (codeMap.size === 0) {
    console.log('No existing IDs, starting with spear-aa-001');
    return 'spear-aa-001';
  }
  
  // Find the code with the highest number
  // If multiple codes have the same highest number, use the latest code alphabetically
  let maxNumber = 0;
  let currentCode = 'aa';
  
  codeMap.forEach((maxNum, code) => {
    if (maxNum > maxNumber) {
      // Found a code with a higher number
      maxNumber = maxNum;
      currentCode = code;
    } else if (maxNum === maxNumber && code > currentCode) {
      // Same max number, but this code is later alphabetically
      currentCode = code;
    }
  });
  
  console.log(`Found max number: ${maxNumber} for code: ${currentCode}`);
  
  // If we've reached 999 for the current code, move to the next code
  if (maxNumber >= 999) {
    currentCode = getNextCode(currentCode);
    maxNumber = 0;
    console.log(`Reached 999, moving to next code: ${currentCode}`);
  }
  
  // Generate next number (padded to 3 digits)
  const nextNumber = maxNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  const generatedId = `spear-${currentCode}-${paddedNumber}`;
  
  console.log(`Generated company ID: ${generatedId}`);
  
  return generatedId;
}

/**
 * Validates if a UUID follows the correct format
 * @param uuid - The UUID to validate
 * @returns true if valid, false otherwise
 */
export function isValidCompanyUuid(uuid: string): boolean {
  const pattern = /^spw-[a-z]+-\d{3}$/;
  return pattern.test(uuid);
}

/**
 * Extracts the short form from a company UUID
 * @param uuid - The UUID to extract from
 * @returns The short form or null if invalid
 */
export function extractShortFormFromUuid(uuid: string): string | null {
  const match = uuid.match(/^spw-([a-z]+)-\d{3}$/);
  return match ? match[1] : null;
}

/**
 * Validates if a company ID follows the correct format
 * @param companyId - The company ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidCompanyId(companyId: string): boolean {
  const pattern = /^spear-[a-z]{2}-\d{3}$/;
  return pattern.test(companyId);
}

/**
 * Extracts the code from a company ID
 * @param companyId - The company ID to extract from
 * @returns The 2-letter code or null if invalid
 */
export function extractShortFormFromCompanyId(companyId: string): string | null {
  const match = companyId.match(/^spear-([a-z]{2})-\d{3}$/);
  return match ? match[1] : null;
}
