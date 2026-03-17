/**
 * Base abstract class for ALL custom errors in the application.
 * Extending the built-in Error allows us to implement specific HTTP status codes
 * and enforce a uniform serialization structure for API responses.
 */
export abstract class CustomError extends Error {
  // Every Custom Error must define its HTTP status code
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    // Standard approach when extending built-in classes in TypeScript to maintain prototype chain
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  /**
   * Serializes the error into a consistent array format to return to external clients.
   * This is very helpful for front-end clients expecting array-mapped validation errors.
   */
  abstract serializeErrors(): { message: string; field?: string }[];
}
