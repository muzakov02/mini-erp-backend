import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateBy,
  ValidateIf,
} from 'class-validator';
import { todayInBusinessZone } from '../utils/date.js';

export const MONEY_PATTERN = /^\d{1,16}(\.\d{1,2})?$/;
export const COST_PATTERN = /^\d{1,14}(\.\d{1,4})?$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export function IsName(): PropertyDecorator {
  return applyDecorators(Trim(), IsString(), IsNotEmpty());
}

export function IsMoney(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    Matches(MONEY_PATTERN, {
      message:
        '$property must be a non-negative amount with up to 16 integer digits and 2 decimals',
    }),
  );
}

export function IsCost(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    Matches(COST_PATTERN, {
      message:
        '$property must be a non-negative amount with up to 14 integer digits and 4 decimals',
    }),
  );
}

export function IsDateOnly(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    Matches(DATE_PATTERN, {
      message: '$property must be in YYYY-MM-DD format',
    }),
    IsISO8601({ strict: true }),
  );
}

export function IsNotFutureDate(): PropertyDecorator {
  return applyDecorators(
    IsDateOnly(),
    ValidateBy({
      name: 'isNotFutureDate',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && value <= todayInBusinessZone(),
        defaultMessage: () => '$property must not be later than today',
      },
    }),
  );
}

export function IsPositiveMoney(): PropertyDecorator {
  return applyDecorators(
    IsMoney(),
    ValidateBy({
      name: 'isPositiveMoney',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && /[1-9]/.test(value),
        defaultMessage: () => '$property must be greater than 0',
      },
    }),
  );
}

export function IsNotBefore(property: string): PropertyDecorator {
  return ValidateBy({
    name: 'isNotBefore',
    constraints: [property],
    validator: {
      validate: (value: unknown, args) => {
        const target = args?.object as Record<string, unknown> | undefined;
        const other = target?.[property];
        return (
          typeof value !== 'string' ||
          typeof other !== 'string' ||
          value >= other
        );
      },
      defaultMessage: () => `$property must not be earlier than ${property}`,
    },
  });
}

export function IsOptionalDefined(): PropertyDecorator {
  return ValidateIf((_object: object, value: unknown) => value !== undefined);
}
