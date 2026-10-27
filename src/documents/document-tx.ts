import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import { Prisma, type DocumentStatus } from '../generated/prisma/client.js';

export const DOCUMENT_TX_OPTIONS = { maxWait: 10_000, timeout: 30_000 };

export type DocumentTable = 'sales' | 'purchases' | 'inventories';

export async function lockDocument(
  tx: Prisma.TransactionClient,
  table: DocumentTable,
  id: number,
): Promise<boolean> {
  const rows = await tx.$queryRaw<{ id: number }[]>(
    Prisma.sql`SELECT id FROM ${Prisma.raw(`"${table}"`)} WHERE id = ${id} FOR UPDATE`,
  );
  return rows.length > 0;
}

export async function lockProducts(
  tx: Prisma.TransactionClient,
  sortedIds: number[],
): Promise<void> {
  if (sortedIds.length === 0) {
    return;
  }
  await tx.$queryRaw`SELECT id FROM "products" WHERE id IN (${Prisma.join(sortedIds)}) ORDER BY id FOR UPDATE`;
}

export async function lockCounterparty(
  tx: Prisma.TransactionClient,
  id: number,
): Promise<boolean> {
  const rows = await tx.$queryRaw<
    { id: number }[]
  >`SELECT id FROM "counterparties" WHERE id = ${id} FOR UPDATE`;
  return rows.length > 0;
}

export function documentNotFound(entity: string, id: number): AppException {
  return new AppException(ErrorCode.NOT_FOUND, `${entity} ${id} not found`);
}

export function documentNotDraft(
  entity: string,
  id: number,
  status?: DocumentStatus,
): AppException {
  return new AppException(
    ErrorCode.DOCUMENT_NOT_DRAFT,
    `${entity} ${id} is not a draft`,
    undefined,
    status ? { status } : null,
  );
}

export function draftStateError(
  entity: string,
  id: number,
  current: { status: DocumentStatus } | null,
): AppException {
  return current
    ? documentNotDraft(entity, id, current.status)
    : documentNotFound(entity, id);
}
