import { CashCategory, CashDirection } from '../generated/prisma/client.js';

export type CounterpartyEffect = '+' | '-' | null;

export interface CashCategoryMeta {
  code: CashCategory;
  direction: CashDirection;
  label: string;
  manual: boolean;
  requiresCounterparty: boolean;
  affectsPnl: boolean;
  counterpartyEffect: CounterpartyEffect;
}

const { IN, OUT } = CashDirection;

export const CASH_CATEGORIES: readonly CashCategoryMeta[] = [
  {
    code: CashCategory.SALE_PAYMENT,
    direction: IN,
    label: 'Savdo tushumi',
    manual: false,
    requiresCounterparty: false,
    affectsPnl: false,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.CUSTOMER_DEBT_PAYMENT,
    direction: IN,
    label: "Mijoz nasiyani to'ladi",
    manual: true,
    requiresCounterparty: true,
    affectsPnl: false,
    counterpartyEffect: '-',
  },
  {
    code: CashCategory.LOAN_RETURNED,
    direction: IN,
    label: 'Berilgan qarz qaytdi',
    manual: true,
    requiresCounterparty: true,
    affectsPnl: false,
    counterpartyEffect: '-',
  },
  {
    code: CashCategory.LOAN_TAKEN,
    direction: IN,
    label: 'Qarz oldik',
    manual: true,
    requiresCounterparty: true,
    affectsPnl: false,
    counterpartyEffect: '-',
  },
  {
    code: CashCategory.OTHER_INCOME,
    direction: IN,
    label: 'Boshqa daromad',
    manual: true,
    requiresCounterparty: false,
    affectsPnl: true,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.OPENING_BALANCE,
    direction: IN,
    label: "Boshlang'ich qoldiq",
    manual: true,
    requiresCounterparty: false,
    affectsPnl: false,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.PURCHASE_PAYMENT,
    direction: OUT,
    label: "Xarid to'lovi",
    manual: false,
    requiresCounterparty: false,
    affectsPnl: false,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.SUPPLIER_PAYMENT,
    direction: OUT,
    label: "Yetkazib beruvchiga to'lov",
    manual: true,
    requiresCounterparty: true,
    affectsPnl: false,
    counterpartyEffect: '+',
  },
  {
    code: CashCategory.LOAN_GIVEN,
    direction: OUT,
    label: 'Qarz berdik',
    manual: true,
    requiresCounterparty: true,
    affectsPnl: false,
    counterpartyEffect: '+',
  },
  {
    code: CashCategory.LOAN_REPAID,
    direction: OUT,
    label: "Olgan qarzni to'ladik",
    manual: true,
    requiresCounterparty: true,
    affectsPnl: false,
    counterpartyEffect: '+',
  },
  {
    code: CashCategory.EXPENSE_TRANSPORT,
    direction: OUT,
    label: "Yo'l kira",
    manual: true,
    requiresCounterparty: false,
    affectsPnl: true,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.EXPENSE_RENT,
    direction: OUT,
    label: 'Ijara',
    manual: true,
    requiresCounterparty: false,
    affectsPnl: true,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.EXPENSE_OTHER,
    direction: OUT,
    label: 'Boshqa xarajat',
    manual: true,
    requiresCounterparty: false,
    affectsPnl: true,
    counterpartyEffect: null,
  },
  {
    code: CashCategory.OWNER_WITHDRAWAL,
    direction: OUT,
    label: 'Egasi olgan pul',
    manual: true,
    requiresCounterparty: false,
    affectsPnl: false,
    counterpartyEffect: null,
  },
];

export const CASH_CATEGORY_MAP = new Map(
  CASH_CATEGORIES.map((meta) => [meta.code, meta]),
) as ReadonlyMap<CashCategory, CashCategoryMeta>;

export type OverpaymentGuard = 'receivable' | 'payable';

export const OVERPAYMENT_GUARDS: Partial<
  Record<CashCategory, OverpaymentGuard>
> = {
  [CashCategory.CUSTOMER_DEBT_PAYMENT]: 'receivable',
  [CashCategory.LOAN_RETURNED]: 'receivable',
  [CashCategory.SUPPLIER_PAYMENT]: 'payable',
  [CashCategory.LOAN_REPAID]: 'payable',
};
