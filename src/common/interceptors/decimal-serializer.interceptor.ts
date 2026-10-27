import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Prisma } from '../../generated/prisma/client.js';

const MONEY_SCALE = 2;
const COST_SCALE = 4;
const COST_FIELDS = new Set(['avgCost', 'unitCost']);
const DATE_ONLY_FIELDS = new Set(['date']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function serialize(value: unknown, key?: string): unknown {
  if (Prisma.Decimal.isDecimal(value)) {
    return value.toFixed(
      key !== undefined && COST_FIELDS.has(key) ? COST_SCALE : MONEY_SCALE,
    );
  }
  if (value instanceof Date && key !== undefined && DATE_ONLY_FIELDS.has(key)) {
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) {
    return value.map((item) => serialize(item, key));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serialize(v, k)]),
    );
  }
  return value;
}

@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data: unknown) => serialize(data)));
  }
}
