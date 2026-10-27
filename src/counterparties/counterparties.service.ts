import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import {
  Prisma,
  type Counterparty,
  type CounterpartyEntry,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto.js';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto.js';

export type CounterpartyWithBalance = Counterparty & {
  balance: Prisma.Decimal;
};

@Injectable()
export class CounterpartiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeArchived: boolean): Promise<CounterpartyWithBalance[]> {
    const counterparties = await this.prisma.counterparty.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { name: 'asc' },
    });
    const balances = await this.getBalances(
      counterparties.map((counterparty) => counterparty.id),
    );
    return counterparties.map((counterparty) => ({
      ...counterparty,
      balance: balances.get(counterparty.id) ?? new Prisma.Decimal(0),
    }));
  }

  async findOne(id: number): Promise<CounterpartyWithBalance> {
    const counterparty = await this.getOrThrow(id);
    return { ...counterparty, balance: await this.getBalance(id) };
  }

  create(dto: CreateCounterpartyDto): Promise<Counterparty> {
    return this.prisma.counterparty.create({ data: dto });
  }

  update(id: number, dto: UpdateCounterpartyDto): Promise<Counterparty> {
    return this.prisma.counterparty.update({ where: { id }, data: dto });
  }

  async archive(id: number): Promise<Counterparty> {
    await this.getOrThrow(id);
    const balance = await this.getBalance(id);
    if (!balance.isZero()) {
      throw new AppException(
        ErrorCode.HAS_BALANCE,
        'Counterparty has non-zero balance and cannot be archived',
        undefined,
        { balance: balance.toFixed(2) },
      );
    }
    return this.prisma.counterparty.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async findEntries(id: number): Promise<CounterpartyEntry[]> {
    await this.getOrThrow(id);
    return this.prisma.counterpartyEntry.findMany({
      where: { counterpartyId: id },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
  }

  private async getBalance(id: number): Promise<Prisma.Decimal> {
    const result = await this.prisma.counterpartyEntry.aggregate({
      where: { counterpartyId: id },
      _sum: { amount: true },
    });
    return result._sum.amount ?? new Prisma.Decimal(0);
  }

  private async getBalances(
    ids: number[],
  ): Promise<Map<number, Prisma.Decimal>> {
    const rows = await this.prisma.counterpartyEntry.groupBy({
      by: ['counterpartyId'],
      where: { counterpartyId: { in: ids } },
      _sum: { amount: true },
    });
    return new Map(
      rows.map((row) => [
        row.counterpartyId,
        row._sum.amount ?? new Prisma.Decimal(0),
      ]),
    );
  }

  private async getOrThrow(id: number): Promise<Counterparty> {
    const counterparty = await this.prisma.counterparty.findUnique({
      where: { id },
    });
    if (!counterparty) {
      throw new AppException(
        ErrorCode.NOT_FOUND,
        `Counterparty ${id} not found`,
      );
    }
    return counterparty;
  }
}
