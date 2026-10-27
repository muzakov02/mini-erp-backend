import { Prisma, UnitType } from '../generated/prisma/client.js';

export const COST_DP = 4;
export const MONEY_DP = 2;

export function round(value: Prisma.Decimal, dp: number): Prisma.Decimal {
  return value.toDecimalPlaces(dp, Prisma.Decimal.ROUND_HALF_UP);
}

export function toUnits(
  unitType: UnitType,
  quantity: number,
  unitsPerBlock: number,
): number {
  return unitType === UnitType.BLOCK ? quantity * unitsPerBlock : quantity;
}

export function unitCostOf(
  unitType: UnitType,
  price: Prisma.Decimal,
  unitsPerBlock: number,
): Prisma.Decimal {
  return unitType === UnitType.BLOCK
    ? round(price.div(unitsPerBlock), COST_DP)
    : round(price, COST_DP);
}

export function weightedAvgCost(
  currentQty: number,
  currentAvg: Prisma.Decimal,
  addedQty: number,
  addedCost: Prisma.Decimal,
): Prisma.Decimal {
  const totalQty = currentQty + addedQty;
  if (totalQty <= 0) {
    return addedCost;
  }
  return round(
    currentAvg.mul(currentQty).add(addedCost.mul(addedQty)).div(totalQty),
    COST_DP,
  );
}
