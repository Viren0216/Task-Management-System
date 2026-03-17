import { CustomError } from './CustomError';

/**
 * Typically dispatched by validation middleware when incoming request schemas do not match.
 * Example: Missing email domain, weak password, or missing required body parameters.
 */
export class ValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: { message: string; field?: string }[]) {
    // Provide a generic message for server logging contexts
    super('Invalid request parameters');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors() {
    // Map over actual field validation errors (for instance supplied by Zod)
    return this.errors;
  }
}
