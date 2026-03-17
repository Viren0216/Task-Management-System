import { CustomError } from './CustomError';

/**
 * Thrown when an unauthenticated user attempts to access a protected resource.
 */
export class UnauthorizedError extends CustomError {
  statusCode = 401;

  constructor(message: string = 'Not authorized') {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
