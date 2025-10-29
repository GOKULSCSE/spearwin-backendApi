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
 * Generates a unique company UUID in the format: spear-[short]-[number]
 * @param companyName - The company name to generate UUID from
 * @param existingUuids - Array of existing UUIDs to check for uniqueness
 * @returns A unique UUID string
 */
export function generateCompanyUuid(companyName: string, existingUuids: string[] = []): string {
  const shortForm = generateShortForm(companyName);
  
  // Find the highest number for this short form
  const pattern = new RegExp(`^spear-${shortForm}-(\\d+)$`);
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
  
  return `spear-${shortForm}-${paddedNumber}`;
}

/**
 * Validates if a UUID follows the correct format
 * @param uuid - The UUID to validate
 * @returns true if valid, false otherwise
 */
export function isValidCompanyUuid(uuid: string): boolean {
  const pattern = /^spear-[a-z]+-\d{3}$/;
  return pattern.test(uuid);
}

/**
 * Extracts the short form from a company UUID
 * @param uuid - The UUID to extract from
 * @returns The short form or null if invalid
 */
export function extractShortFormFromUuid(uuid: string): string | null {
  const match = uuid.match(/^spear-([a-z]+)-\d{3}$/);
  return match ? match[1] : null;
}
