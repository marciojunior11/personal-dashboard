import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import {
  ApiResult,
  CommonErrorCodes,
  type CommonErrorCode,
} from '@personal-dashboard/shared/common';
import {
  BaseError,
  ConflictError,
  DomainError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  type ErrorParams,
  type IErrorIssue,
} from '@personal-dashboard/shared/errors';
import type { Response } from 'express';
import { I18nContext, type I18nService } from 'nestjs-i18n';
import type { I18nPath, I18nTranslations } from '@generated/i18n';

/**
 * The catalog key of each error code, merged from every module's map. The
 * generic code of each category must be there: it is the fallback.
 */
export type ErrorMessages = Readonly<Record<CommonErrorCode, I18nPath>> &
  Readonly<Record<string, I18nPath>>;

type ErrorType = abstract new (...args: never[]) => BaseError;

/** HTTP status and generic code of each error category; anything else is a 500. */
const CATEGORIES: [ErrorType, number, CommonErrorCode][] = [
  [ValidationError, 422, CommonErrorCodes.INVALID_INPUT],
  [DomainError, 422, CommonErrorCodes.DOMAIN_RULE_BROKEN],
  [NotFoundError, 404, CommonErrorCodes.NOT_FOUND],
  [ConflictError, 409, CommonErrorCodes.CONFLICT],
  [UnauthorizedError, 401, CommonErrorCodes.UNAUTHORIZED],
  [ForbiddenError, 403, CommonErrorCodes.FORBIDDEN],
];

/**
 * Turns every thrown error into an `ApiResult.failure` response with the
 * matching HTTP status. Unexpected errors are logged and answered as a
 * generic `InternalError`, so internal details never reach the client.
 *
 * This is where errors get their text: each code (the error's and each
 * issue's) is looked up in the modules' message maps and translated into
 * the request's locale. Errors themselves hold codes only.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly messages: ErrorMessages,
  ) {}

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
    const category = CATEGORIES.find(([type]) => error instanceof type);
    const status = category?.[1] ?? 500;
    const genericCode = category?.[2] ?? CommonErrorCodes.INTERNAL;

    const lang = I18nContext.current(host)?.lang;
    const translate = (
      code: string,
      params: ErrorParams | undefined,
      fallback: CommonErrorCode,
    ): string => {
      const key = this.messages[code];
      if (key === undefined) {
        this.logger.warn(`No message for error code ${code}.`);
      }
      return String(
        this.i18n.t(key ?? this.messages[fallback], { lang, args: params }),
      );
    };

    const issues: IErrorIssue[] = error.issues.map((issue) => ({
      ...issue,
      message: translate(
        issue.code,
        issue.params,
        CommonErrorCodes.INVALID_INPUT,
      ),
    }));

    response.status(status).json(
      ApiResult.failure({
        name: error.name,
        code: error.code,
        message: translate(error.code, error.params, genericCode),
        ...(issues.length > 0 && { issues }),
      }),
    );
  }
}
