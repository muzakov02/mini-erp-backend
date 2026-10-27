import { ValidationError, ValidationPipe } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception.js';
import { ErrorCode } from '../exceptions/error-code.js';

interface FieldError {
  field: string;
  constraints: Record<string, string>;
}

function flattenErrors(errors: ValidationError[], parent = ''): FieldError[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own: FieldError[] = error.constraints
      ? [{ field, constraints: error.constraints }]
      : [];
    return [...own, ...flattenErrors(error.children ?? [], field)];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new AppException(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        undefined,
        {
          errors: flattenErrors(errors),
        },
      ),
  });
}
