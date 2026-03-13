import { CustomError } from './CustomError';

/**
 * Thrown when a system state conflict happens, i.e., trying to register a user with an already existing email.
 */
export class ConflictError extends CustomError {
  statusCode = 409;

  constructor(message: string = 'Resource conflict occurred') {
    super(message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
