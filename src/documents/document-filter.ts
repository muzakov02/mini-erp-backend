import { toDbDate } from '../common/utils/date.js';
import type { DocumentStatus } from '../generated/prisma/client.js';
import { DocumentQueryDto } from './dto/document-query.dto.js';

export interface DocumentWhere {
  status?: DocumentStatus;
  date?: { gte?: Date; lte?: Date };
}

export function dateRange(
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) {
    return undefined;
  }
  return {
    gte: from ? toDbDate(from) : undefined,
    lte: to ? toDbDate(to) : undefined,
  };
}

export function documentWhere(query: DocumentQueryDto): DocumentWhere {
  return { status: query.status, date: dateRange(query.from, query.to) };
}

export const LIST_ORDER = [{ date: 'desc' as const }, { id: 'desc' as const }];
