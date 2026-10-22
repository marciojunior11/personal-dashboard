import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { ApiResult } from '@personal-dashboard/shared/common';
import {
  BaseError,
  ConflictError,
  DomainError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@personal-dashboard/shared/errors';
import type { Response } from 'express';

type ErrorType = abstract new (...args: never[]) => BaseError;

/** HTTP status of each application error; anything else is a 500. */
const STATUS_BY_ERROR: [ErrorType, number][] = [
  [ValidationError, 422],
  [DomainError, 422],
  [NotFoundError, 404],
  [ConflictError, 409],
  [UnauthorizedError, 401],
  [ForbiddenError, 403],
];

/**
 * Turns every thrown error into an `ApiResult.failure` response with the
 * matching HTTP status. Unexpected errors are logged and answered as a
 * generic `InternalError`, so internal details never reach the client.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    // Nest's own errors (unknown route, malformed JSON...) keep their status and body.
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    let error: BaseError;
    if (exception instanceof BaseError) {
      error = exception;
    } else {
      this.logger.error(exception);
      error = new InternalError();
    }
    const status =
      STATUS_BY_ERROR.find(([type]) => error instanceof type)?.[1] ?? 500;

    response.status(status).json(ApiResult.failure(error));
  }
}
