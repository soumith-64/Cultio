/**
 * CULTIVO — Approved Agronomist & Expert Whitelist Registry
 * Only users with approved institutional IDs or verified accreditation keys can act as experts.
 */

// Whitelist of approved expert email addresses
export const APPROVED_EXPERT_EMAILS: string[] = [
  'soumith64@gmail.com',
  'soumith@wwislib.com',
  'admin@cultio.wwislib.com',
  'expert@cultivo.ai',
  'expert@cultivo.org',
  'agronomist@icar.gov.in',
  'icar.expert@gov.in',
  'pathology@iasri.res.in',
  'extension@tnaubt.org',
  'agronomist@extension.org',
];

// Approved institutional email domains
export const APPROVED_EXPERT_DOMAINS: string[] = [
  '@icar.gov.in',
  '@iasri.res.in',
  '@gov.in',
  '@agri.gov.in',
  '@cultivo.ai',
  '@cultivo.org',
  '@wwislib.com',
];

// Master Agronomist Accreditation Keys for field researchers & certified crop advisors
export const APPROVED_ACCREDITATION_KEYS: string[] = [
  'ICAR-EXP-2026',
  'CCA-AGRI-8492',
  'CULTIO-EXPERT-99',
  'AGRONOMIST-SECURE-KEY',
];

/**
 * Checks whether an email or ID qualifies as an approved expert
 */
export function isApprovedExpertEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  // Check exact email match
  if (APPROVED_EXPERT_EMAILS.some((e) => e.toLowerCase() === normalized)) {
    return true;
  }

  // Check institutional domain match
  if (APPROVED_EXPERT_DOMAINS.some((domain) => normalized.endsWith(domain.toLowerCase()))) {
    return true;
  }

  return false;
}

/**
 * Validates an agronomist accreditation passkey or approved ID
 */
export function verifyExpertKeyOrId(input: string | null | undefined): {
  approved: boolean;
  role: 'expert' | 'farmer';
  reason?: string;
} {
  if (!input || !input.trim()) {
    return { approved: false, role: 'farmer', reason: 'Please enter an approved ID or accreditation key.' };
  }

  const cleaned = input.trim();

  // Check if it's an approved email
  if (isApprovedExpertEmail(cleaned)) {
    return { approved: true, role: 'expert' };
  }

  // Check if it matches an approved accreditation key (case-insensitive)
  const upperKey = cleaned.toUpperCase();
  if (APPROVED_ACCREDITATION_KEYS.some((k) => k.toUpperCase() === upperKey)) {
    return { approved: true, role: 'expert' };
  }

  return {
    approved: false,
    role: 'farmer',
    reason: 'Authorization failed. This ID or accreditation key is not in the certified agronomist registry.',
  };
}
