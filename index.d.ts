/**
 * @pdtf/trust-framework
 * TypeScript definitions for Property Data Trust Framework
 */

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Validate a credential against a PDTF schema
 */
export function validateCredential(credential: any, schemaId: string): Promise<ValidationResult>;

export const PDTF_REGISTRY_URL: string;
export const PDTF_DID: string;