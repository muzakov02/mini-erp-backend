import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import {
  Prisma,
  type Product,
  type UnitType,
} from '../generated/prisma/client.js';
import { MONEY_DP, round, toUnits } from './costing.js';
import { TradeDocumentDto } from './dto/trade-document.dto.js';

export interface TradeDraftItem {
  productId: number;
  warehouseId: number;
  unitType: UnitType;
  quantity: number;
  price: Prisma.Decimal;
  amount: Prisma.Decimal;
  qtyInUnits: number;
}

export interface TradeDraft {
  totalAmount: Prisma.Decimal;
  paidAmount: Prisma.Decimal;
  items: TradeDraftItem[];
}

export function buildTradeDraft(
  dto: TradeDocumentDto,
  products: Map<number, Product>,
): TradeDraft {
  const items = dto.items.map((item) => {
    const price = new Prisma.Decimal(item.price);
    const product = products.get(item.productId)!;
    return {
      productId: item.productId,
      warehouseId: item.warehouseId,
      unitType: item.unitType,
      quantity: item.quantity,
      price,
      amount: round(price.mul(item.quantity), MONEY_DP),
      qtyInUnits: toUnits(item.unitType, item.quantity, product.unitsPerBlock),
    };
  });
  const totalAmount = items.reduce(
    (sum, item) => sum.add(item.amount),
    new Prisma.Decimal(0),
  );
  const paidAmount = new Prisma.Decimal(dto.paidAmount);
  if (paidAmount.gt(totalAmount)) {
    throw new AppException(
      ErrorCode.VALIDATION_ERROR,
      'paidAmount must not exceed totalAmount',
      undefined,
      {
        paidAmount: paidAmount.toFixed(MONEY_DP),
        totalAmount: totalAmount.toFixed(MONEY_DP),
      },
    );
  }
  return { totalAmount, paidAmount, items };
}

export function tradeReferences(dto: TradeDocumentDto) {
  return {
    productIds: dto.items.map((item) => item.productId),
    warehouseIds: dto.items.map((item) => item.warehouseId),
    counterpartyId: dto.counterpartyId,
  };
}

export function assertCounterpartyForDebt(
  unpaid: Prisma.Decimal,
  counterpartyId: number | null,
): void {
  if (unpaid.gt(0) && counterpartyId === null) {
    throw new AppException(
      ErrorCode.COUNTERPARTY_REQUIRED,
      'Counterparty is required when the document is not fully paid',
      undefined,
      { unpaidAmount: unpaid.toFixed(MONEY_DP) },
    );
  }
}
