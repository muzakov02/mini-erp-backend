import { HttpException } from '@nestjs/common';
import { ERROR_STATUS, ErrorCode } from './error-code.js';

export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    statusCode: number = ERROR_STATUS[code],
    readonly details: Record<string, unknown> | null = null,
  ) {
    super(message, statusCode);
  }
}
