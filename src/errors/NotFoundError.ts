import { CustomError } from './CustomError';

/**
 * Dispatched when a specific requested resource (user, task, project, route) does not exist.
 */
export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message: string = 'Resource not found') {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
