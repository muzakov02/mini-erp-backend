import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { AppException } from '../exceptions/app.exception.js';
import { ERROR_STATUS, ErrorCode } from '../exceptions/error-code.js';

const PRISMA_ERRORS: Record<string, { code: ErrorCode; message: string }> = {
  P2002: { code: ErrorCode.DUPLICATE, message: 'Record already exists' },
  P2003: {
    code: ErrorCode.REFERENCE_ERROR,
    message: 'Referenced record is missing or still in use',
  },
  P2025: { code: ErrorCode.NOT_FOUND, message: 'Record not found' },
};

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      return {
        statusCode,
        code: this.codeForStatus(statusCode),
        message: this.extractMessage(exception),
        details: null,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERRORS[exception.code];
      if (mapped) {
        return {
          statusCode: ERROR_STATUS[mapped.code],
          code: mapped.code,
          message: mapped.message,
          details: this.prismaDetails(exception),
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: null,
    };
  }

  private prismaDetails(
    exception: Prisma.PrismaClientKnownRequestError,
  ): Record<string, unknown> {
    const meta = exception.meta as
      | {
          modelName?: string;
          driverAdapterError?: { cause?: { constraint?: unknown } };
        }
      | undefined;
    return {
      model: meta?.modelName ?? null,
      constraint: meta?.driverAdapterError?.cause?.constraint ?? null,
    };
  }

  private codeForStatus(statusCode: number): string {
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return ErrorCode.VALIDATION_ERROR;
    }
    if (statusCode === HttpStatus.NOT_FOUND) {
      return ErrorCode.NOT_FOUND;
    }
    const name: unknown = HttpStatus[statusCode];
    return typeof name === 'string' ? name : 'HTTP_ERROR';
  }

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    const message = (response as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    return typeof message === 'string' ? message : exception.message;
  }
}
