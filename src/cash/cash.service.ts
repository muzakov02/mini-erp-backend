import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import { toDbDate } from '../common/utils/date.js';
import { MONEY_DP } from '../documents/costing.js';
import { dateRange } from '../documents/document-filter.js';
import {
  DOCUMENT_TX_OPTIONS,
  lockCounterparty,
} from '../documents/document-tx.js';
import {
  CashDirection,
  CounterpartySource,
  Prisma,
  type CashOperation,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CASH_CATEGORIES,
  CASH_CATEGORY_MAP,
  OVERPAYMENT_GUARDS,
  type CashCategoryMeta,
} from './cash-categories.js';
import { CashQueryDto } from './dto/cash-query.dto.js';
import { CreateCashOperationDto } from './dto/create-cash-operation.dto.js';

const CASH_LOCK_KEY = 7_001;

const COUNTERPARTY_SELECT = { select: { id: true, name: true } };

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Prisma.Decimal> {
    const rows = await db.cashOperation.groupBy({
      by: ['direction'],
      _sum: { amount: true },
    });
    return rows.reduce((balance, row) => {
      const amount = row._sum.amount ?? new Prisma.Decimal(0);
      return row.direction === 'IN' ? balance.add(amount) : balance.sub(amount);
    }, new Prisma.Decimal(0));
  }

  async lock(tx: Prisma.TransactionClient): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${CASH_LOCK_KEY})`;
  }

  getCategories(): readonly CashCategoryMeta[] {
    return CASH_CATEGORIES;
  }

  async findAll(query: CashQueryDto) {
    const operations = await this.prisma.cashOperation.findMany({
      where: {
        date: dateRange(query.from, query.to),
        category: query.category,
      },
      include: { counterparty: COUNTERPARTY_SELECT },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
    return operations.map((operation) => this.withLabel(operation));
  }

  async create(dto: CreateCashOperationDto) {
    const meta = CASH_CATEGORY_MAP.get(dto.category)!;
    const counterpartyId = dto.counterpartyId ?? null;
    this.validateCategory(meta, counterpartyId);
    const amount = new Prisma.Decimal(dto.amount);

    const created = await this.prisma.$transaction(async (tx) => {
      await this.lock(tx);
      if (counterpartyId !== null) {
        await this.assertCounterpartyActive(tx, counterpartyId);
      }

      if (meta.direction === CashDirection.OUT) {
        const balance = await this.getBalance(tx);
        if (balance.lt(amount)) {
          throw new AppException(
            ErrorCode.INSUFFICIENT_CASH,
            'Insufficient cash balance',
            undefined,
            {
              balance: balance.toFixed(MONEY_DP),
              required: amount.toFixed(MONEY_DP),
            },
          );
        }
      }

      const guard = OVERPAYMENT_GUARDS[meta.code];
      if (guard && counterpartyId !== null) {
        const balance = await this.getCounterpartyBalance(tx, counterpartyId);
        const limit = guard === 'receivable' ? balance : balance.neg();
        if (amount.gt(limit)) {
          throw new AppException(
            ErrorCode.OVERPAYMENT,
            'Amount exceeds the counterparty balance',
            undefined,
            {
              balance: balance.toFixed(MONEY_DP),
              amount: amount.toFixed(MONEY_DP),
            },
          );
        }
      }

      const operation = await tx.cashOperation.create({
        data: {
          date: toDbDate(dto.date),
          direction: meta.direction,
          category: meta.code,
          amount,
          counterpartyId,
          note: dto.note ?? null,
        },
        include: { counterparty: COUNTERPARTY_SELECT },
      });

      if (meta.counterpartyEffect !== null && counterpartyId !== null) {
        await tx.counterpartyEntry.create({
          data: {
            counterpartyId,
            amount: meta.counterpartyEffect === '+' ? amount : amount.neg(),
            sourceType: CounterpartySource.CASH,
            sourceId: operation.id,
            date: operation.date,
          },
        });
      }
      return operation;
    }, DOCUMENT_TX_OPTIONS);

    return this.withLabel(created);
  }

  private validateCategory(
    meta: CashCategoryMeta,
    counterpartyId: number | null,
  ): void {
    if (!meta.manual) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        `Category ${meta.code} cannot be entered manually`,
        undefined,
        { category: meta.code },
      );
    }
    if (meta.requiresCounterparty && counterpartyId === null) {
      throw new AppException(
        ErrorCode.COUNTERPARTY_REQUIRED,
        `Category ${meta.code} requires a counterparty`,
        undefined,
        { category: meta.code },
      );
    }
    if (!meta.requiresCounterparty && counterpartyId !== null) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        `Category ${meta.code} does not accept a counterparty`,
        undefined,
        { category: meta.code },
      );
    }
  }

  private async assertCounterpartyActive(
    tx: Prisma.TransactionClient,
    id: number,
  ): Promise<void> {
    if (!(await lockCounterparty(tx, id))) {
      throw new AppException(
        ErrorCode.NOT_FOUND,
        'Counterparty not found',
        undefined,
        { entity: 'Counterparty', ids: [id] },
      );
    }
    const counterparty = await tx.counterparty.findUniqueOrThrow({
      where: { id },
    });
    if (counterparty.isArchived) {
      throw new AppException(
        ErrorCode.ARCHIVED_ENTITY,
        'Counterparty is archived',
        undefined,
        { entity: 'Counterparty', ids: [id] },
      );
    }
  }

  private async getCounterpartyBalance(
    tx: Prisma.TransactionClient,
    id: number,
  ): Promise<Prisma.Decimal> {
    const result = await tx.counterpartyEntry.aggregate({
      where: { counterpartyId: id },
      _sum: { amount: true },
    });
    return result._sum.amount ?? new Prisma.Decimal(0);
  }

  private withLabel<T extends CashOperation>(operation: T) {
    return {
      ...operation,
      categoryLabel: CASH_CATEGORY_MAP.get(operation.category)!.label,
    };
  }
}
