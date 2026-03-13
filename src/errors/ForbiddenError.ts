import { CustomError } from './CustomError';

/**
 * Thrown when an authenticated user attempts to access a resource they do not have permission for.
 * Extensively used across Task management roles/RBAC.
 */
export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(message: string = 'Forbidden from accessing this resource') {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
