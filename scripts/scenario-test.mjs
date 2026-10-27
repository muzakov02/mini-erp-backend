import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

export const API_URL = process.env.API_URL ?? 'http://localhost:3000/api';

const TABLES = [
  'cash_operations',
  'counterparty_entries',
  'stock_movements',
  'inventory_items',
  'inventories',
  'sale_items',
  'sales',
  'purchase_items',
  'purchases',
  'counterparties',
  'products',
  'warehouses',
];

export const TODAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tashkent',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

export class CheckFailed extends Error {}

export function assertResetConfirmed() {
  if (process.env.CONFIRM_RESET !== 'yes') {
    console.error(
      'Refusing to run: this script TRUNCATES all business tables in the database from DATABASE_URL.\n' +
        'Set CONFIRM_RESET=yes to confirm, e.g. in PowerShell: $env:CONFIRM_RESET = "yes"',
    );
    process.exit(1);
  }
}

export async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new CheckFailed('DATABASE_URL is not set');
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
  } finally {
    await client.end();
  }
  console.log(`Database reset (${TABLES.length} tables truncated)`);
}

export function createApi({ verbose = false } = {}) {
  const dateStats = { dateOk: 0, dateBad: [], isoOk: 0, isoBad: [] };

  function scanDates(value, path = '$') {
    if (Array.isArray(value)) {
      value.forEach((v, i) => scanDates(v, `${path}[${i}]`));
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, v] of Object.entries(value)) {
      if (key === 'date' && v !== null) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) dateStats.dateOk++;
        else dateStats.dateBad.push(`${path}.${key}=${v}`);
      } else if (['createdAt', 'updatedAt', 'postedAt'].includes(key) && v !== null) {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) dateStats.isoOk++;
        else dateStats.isoBad.push(`${path}.${key}=${v}`);
      } else {
        scanDates(v, `${path}.${key}`);
      }
    }
  }

  async function call(label, method, path, body, expectStatus, expectCode) {
    let res;
    try {
      res = await fetch(API_URL + path, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw new CheckFailed(`${label}: cannot reach ${API_URL} (${error.cause?.code ?? error.message})`);
    }
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    if (res.status < 400) scanDates(json);
    const ok = res.status === expectStatus && (!expectCode || json?.code === expectCode);
    const shown =
      json && json.code
        ? JSON.stringify({ code: json.code, message: json.message, details: json.details })
        : JSON.stringify(json);
    if (!ok || verbose) {
      const trimmed = shown && shown.length > 300 ? `${shown.slice(0, 300)}...` : (shown ?? '');
      console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${method} ${path} -> ${res.status} ${trimmed}`);
    }
    if (!ok) {
      throw new CheckFailed(
        `${label}: expected ${expectStatus}${expectCode ? ` ${expectCode}` : ''}, got ${res.status}`,
      );
    }
    return json;
  }

  return { call, dateStats };
}

export async function runMainScenario(api) {
  const { call } = api;
  const cash = (body) =>
    call(`cash ${body.category}`, 'POST', '/cash/operations', { date: TODAY, ...body }, 201);

  const cola = await call('product Cola', 'POST', '/products', { name: 'Cola 1.5L', unitsPerBlock: 6, salePriceUnit: '12000', salePriceBlock: '66000' }, 201);
  const asosiy = await call('warehouse Asosiy', 'POST', '/warehouses', { name: 'Asosiy' }, 201);
  const zaxira = await call('warehouse Zaxira', 'POST', '/warehouses', { name: 'Zaxira', parentId: asosiy.id }, 201);
  const sovutgich = await call('warehouse Sovutgich', 'POST', '/warehouses', { name: 'Sovutgich', parentId: asosiy.id }, 201);
  const ulgurji = await call('counterparty Ulgurji', 'POST', '/counterparties', { name: 'Ulgurji', type: 'SUPPLIER' }, 201);
  const ali = await call('counterparty Ali', 'POST', '/counterparties', { name: 'Ali', type: 'CUSTOMER' }, 201);
  const vali = await call('counterparty Vali', 'POST', '/counterparties', { name: 'Vali', type: 'OTHER' }, 201);
  const sardor = await call('counterparty Sardor', 'POST', '/counterparties', { name: 'Sardor', type: 'OTHER' }, 201);

  await cash({ category: 'OPENING_BALANCE', amount: '2000000' });

  const opening = await call('OPENING draft', 'POST', '/inventories', { date: TODAY, type: 'OPENING', warehouseId: zaxira.id, items: [{ productId: cola.id, countedQty: 12, unitCost: '7800' }] }, 201);
  await call('OPENING post', 'POST', `/inventories/${opening.id}/post`, null, 200);

  const purchase = await call('purchase draft', 'POST', '/purchases', { date: TODAY, counterpartyId: ulgurji.id, paidAmount: '300000', items: [{ productId: cola.id, warehouseId: zaxira.id, unitType: 'BLOCK', quantity: 10, price: '54000' }] }, 201);
  await call('purchase post', 'POST', `/purchases/${purchase.id}/post`, null, 200);

  const saleDraft = await call('sale draft (placeholder lines)', 'POST', '/sales', { date: TODAY, paidAmount: '0', note: 'tmp', items: [{ productId: cola.id, warehouseId: sovutgich.id, unitType: 'UNIT', quantity: 2, price: '11000' }] }, 201);
  const saleReplaced = await call('sale PUT', 'PUT', `/sales/${saleDraft.id}`, {
    date: TODAY,
    counterpartyId: ali.id,
    paidAmount: '200000',
    items: [
      { productId: cola.id, warehouseId: zaxira.id, unitType: 'BLOCK', quantity: 5, price: '66000' },
      { productId: cola.id, warehouseId: zaxira.id, unitType: 'UNIT', quantity: 3, price: '12000' },
    ],
  }, 200);
  const sale = await call('sale post', 'POST', `/sales/${saleDraft.id}/post`, null, 200);

  await cash({ category: 'CUSTOMER_DEBT_PAYMENT', amount: '100000', counterpartyId: ali.id });
  await cash({ category: 'LOAN_GIVEN', amount: '300000', counterpartyId: vali.id });
  await cash({ category: 'LOAN_TAKEN', amount: '500000', counterpartyId: sardor.id });
  await cash({ category: 'EXPENSE_TRANSPORT', amount: '40000' });

  const regular = await call('REGULAR draft', 'POST', '/inventories', { date: TODAY, type: 'REGULAR', warehouseId: zaxira.id, items: [{ productId: cola.id, countedQty: 37 }] }, 201);
  const regularPosted = await call('REGULAR post', 'POST', `/inventories/${regular.id}/post`, null, 200);

  await cash({ category: 'OWNER_WITHDRAWAL', amount: '100000' });

  return {
    ids: {
      cola: cola.id,
      asosiy: asosiy.id,
      zaxira: zaxira.id,
      sovutgich: sovutgich.id,
      ulgurji: ulgurji.id,
      ali: ali.id,
      vali: vali.id,
      sardor: sardor.id,
    },
    docs: { purchase, saleDraft, saleReplaced, sale, regularPosted },
  };
}

function createChecker() {
  const rows = [];
  function expect(label, expected, actual) {
    const ok = String(expected) === String(actual);
    rows.push({ label, expected: String(expected), actual: String(actual), ok });
    console.log(`  ${ok ? 'OK      ' : 'MISMATCH'} ${label.padEnd(48)} expected=${String(expected).padEnd(28)} actual=${String(actual)}`);
    if (!ok) throw new CheckFailed(`mismatch: ${label}`);
  }
  return { rows, expect };
}

async function verifyState(api, expect, ids, state, tag) {
  const { call } = api;
  console.log(`=== VERIFY: ${tag}`);
  const pnl = await call('pnl', 'GET', '/reports/pnl', null, 200);
  expect('P&L revenue', state.revenue, pnl.revenue);
  expect('P&L cogs', state.cogs, pnl.cogs);
  expect('P&L grossProfit', state.grossProfit, pnl.grossProfit);
  expect('P&L otherIncome', state.otherIncome, pnl.otherIncome);
  expect('P&L expenses.transport', state.transport, pnl.expenses.transport);
  expect('P&L expenses.rent', state.rent, pnl.expenses.rent);
  expect('P&L expenses.total', state.expensesTotal, pnl.expenses.total);
  expect('P&L inventoryDiff.shortage', state.shortage, pnl.inventoryDiff.shortage);
  expect('P&L inventoryDiff.surplus', state.surplus, pnl.inventoryDiff.surplus);
  expect('P&L inventoryDiff.total', state.inventoryDiffTotal, pnl.inventoryDiff.total);
  expect('P&L netProfit', state.netProfit, pnl.netProfit);
  const ex = pnl.excludedFromPnl;
  for (const key of Object.keys(state.excluded)) {
    expect(`excluded ${key}`, state.excluded[key], ex[key]);
  }

  expect('cash balance', state.cash, (await call('cash balance', 'GET', '/cash/balance', null, 200)).balance);

  const counterparties = await call('counterparties', 'GET', '/counterparties', null, 200);
  const balance = (id) => counterparties.find((c) => c.id === id).balance;
  expect('balance Ali', state.balances.ali, balance(ids.ali));
  expect('balance Vali', state.balances.vali, balance(ids.vali));
  expect('balance Ulgurji', state.balances.ulgurji, balance(ids.ulgurji));
  expect('balance Sardor', state.balances.sardor, balance(ids.sardor));

  const stock = await call('stock report', 'GET', '/reports/stock', null, 200);
  const cola = stock.items.find((i) => i.productId === ids.cola);
  expect('stock Cola total', '37/6/1', `${cola.total.units}/${cola.total.blocks}/${cola.total.remainder}`);
  expect('stock Cola Zaxira qty', 37, cola.locations.find((l) => l.warehouseId === ids.zaxira)?.qty.units);
  expect('stock Cola Sovutgich absent', false, cola.locations.some((l) => l.warehouseId === ids.sovutgich));
  expect('stock Cola stockValue', '325600.00', cola.stockValue);
  expect('stock totalStockValue', state.totalStockValue, stock.totalStockValue);
  const byRoot = await call('stock ?warehouseId=Asosiy', 'GET', `/reports/stock?warehouseId=${ids.asosiy}`, null, 200);
  expect('stock Cola total (Asosiy filter)', 37, byRoot.items.find((i) => i.productId === ids.cola).total.units);

  const sales = await call('sales report', 'GET', '/reports/sales', null, 200);
  const s = sales.summary;
  expect('sales count', 1, s.count);
  expect('sales revenue', '366000.00', s.revenue);
  expect('sales cost', '290400.00', s.cost);
  expect('sales grossProfit', '75600.00', s.grossProfit);
  expect('sales paid', '200000.00', s.paid);
  expect('sales unpaid', '166000.00', s.unpaid);
}

const MAIN_STATE = {
  revenue: '366000.00',
  cogs: '290400.00',
  grossProfit: '75600.00',
  otherIncome: '0.00',
  transport: '40000.00',
  rent: '0.00',
  expensesTotal: '40000.00',
  shortage: '-17600.00',
  surplus: '0.00',
  inventoryDiffTotal: '-17600.00',
  netProfit: '18000.00',
  excluded: {
    customerDebtPayments: '100000.00',
    loansReturned: '0.00',
    loansTaken: '500000.00',
    loansGiven: '300000.00',
    loansRepaid: '0.00',
    supplierPayments: '0.00',
    ownerWithdrawals: '100000.00',
    openingBalance: '2000000.00',
    openingStockValue: '93600.00',
  },
  cash: '2060000.00',
  balances: { ali: '66000.00', vali: '300000.00', ulgurji: '-240000.00', sardor: '-500000.00' },
  totalStockValue: '325600.00',
};

const EXTRA_STATE = {
  ...MAIN_STATE,
  otherIncome: '25000.00',
  rent: '150000.00',
  expensesTotal: '190000.00',
  surplus: '15000.00',
  inventoryDiffTotal: '-2600.00',
  netProfit: '-92000.00',
  excluded: {
    ...MAIN_STATE.excluded,
    customerDebtPayments: '166000.00',
    loansReturned: '120000.00',
    loansRepaid: '200000.00',
    supplierPayments: '100000.00',
    openingStockValue: '143600.00',
  },
  cash: '1821000.00',
  balances: { ali: '0.00', vali: '180000.00', ulgurji: '-140000.00', sardor: '-300000.00' },
  totalStockValue: '390600.00',
};

async function runTest() {
  assertResetConfirmed();
  console.log(`API_URL=${API_URL} TODAY(Asia/Tashkent)=${TODAY}`);
  const api = createApi();
  const { call, dateStats } = api;
  const { rows, expect } = createChecker();
  const cash = (body, label, status = 201, code) =>
    call(label, 'POST', '/cash/operations', { date: TODAY, ...body }, status, code);

  try {
    await resetDatabase();

    console.log('=== CATEGORIES');
    const categories = await call('categories', 'GET', '/cash/categories', null, 200);
    expect('categories count', 14, categories.length);
    expect('manual=false categories', 'SALE_PAYMENT,PURCHASE_PAYMENT', categories.filter((c) => !c.manual).map((c) => c.code).join(','));

    console.log('=== MAIN SCENARIO (10 steps)');
    const { ids, docs } = await runMainScenario(api);
    expect('PUT: placeholder draft total', '22000.00', docs.saleDraft.totalAmount);
    expect('PUT: items replaced', '330000.00:30,36000.00:3', docs.saleReplaced.items.map((i) => `${i.amount}:${i.qtyInUnits}`).join(','));
    expect('PUT: old item removed', false, docs.saleReplaced.items.some((i) => i.id === docs.saleDraft.items[0].id));
    expect('purchase unitCost', '9000.0000', (await call('purchase', 'GET', `/purchases/${docs.purchase.id}`, null, 200)).items[0].unitCost);
    expect('sale totalCost', '290400.00', docs.sale.totalCost);
    expect('REGULAR expected/diff/diffAmount', '39/-2/-17600.00', `${docs.regularPosted.items[0].expectedQty}/${docs.regularPosted.items[0].diffQty}/${docs.regularPosted.items[0].diffAmount}`);
    expect('Cola avgCost', '8800.0000', (await call('cola', 'GET', `/products/${ids.cola}`, null, 200)).avgCost);
    await verifyState(api, expect, ids, MAIN_STATE, 'after main scenario');

    console.log('=== ERROR CASES');
    await cash({ category: 'CUSTOMER_DEBT_PAYMENT', amount: '70000', counterpartyId: ids.ali }, 'Ali 70000 CUSTOMER_DEBT_PAYMENT', 409, 'OVERPAYMENT');
    await cash({ category: 'LOAN_REPAID', amount: '600000', counterpartyId: ids.sardor }, 'Sardor 600000 LOAN_REPAID', 409, 'OVERPAYMENT');
    await cash({ category: 'EXPENSE_OTHER', amount: '3000000' }, '3000000 EXPENSE_OTHER', 409, 'INSUFFICIENT_CASH');
    await cash({ category: 'LOAN_GIVEN', amount: '1000' }, 'LOAN_GIVEN without counterparty', 400, 'COUNTERPARTY_REQUIRED');
    await cash({ category: 'SALE_PAYMENT', amount: '1000' }, 'manual SALE_PAYMENT', 400, 'VALIDATION_ERROR');
    await cash({ category: 'EXPENSE_TRANSPORT', amount: '1000', counterpartyId: ids.vali }, 'EXPENSE_TRANSPORT with counterpartyId', 400, 'VALIDATION_ERROR');
    await call('report from > to', 'GET', '/reports/pnl?from=2026-10-27&to=2026-10-01', null, 400, 'VALIDATION_ERROR');
    await call('re-post sale', 'POST', `/sales/${docs.sale.id}/post`, null, 409, 'DOCUMENT_NOT_DRAFT');
    await call('delete posted sale', 'DELETE', `/sales/${docs.sale.id}`, null, 409, 'DOCUMENT_NOT_DRAFT');
    console.log(`  ${rows.length} checks so far, error cases passed`);
    await verifyState(api, expect, ids, MAIN_STATE, 'after error cases (unchanged)');

    console.log('=== EXTRA: inventory surplus');
    const fanta = await call('product Fanta', 'POST', '/products', { name: 'Fanta 1L', unitsPerBlock: 12, salePriceUnit: '9000', salePriceBlock: '100000' }, 201);
    const fantaOpening = await call('Fanta OPENING draft', 'POST', '/inventories', { date: TODAY, type: 'OPENING', warehouseId: ids.sovutgich, items: [{ productId: fanta.id, countedQty: 10, unitCost: '5000' }] }, 201);
    await call('Fanta OPENING post', 'POST', `/inventories/${fantaOpening.id}/post`, null, 200);
    expect('Fanta avgCost after OPENING', '5000.0000', (await call('fanta', 'GET', `/products/${fanta.id}`, null, 200)).avgCost);
    const fantaRegular = await call('Fanta REGULAR draft', 'POST', '/inventories', { date: TODAY, type: 'REGULAR', warehouseId: ids.sovutgich, items: [{ productId: fanta.id, countedQty: 13 }] }, 201);
    const fantaPosted = await call('Fanta REGULAR post', 'POST', `/inventories/${fantaRegular.id}/post`, null, 200);
    const fi = fantaPosted.items[0];
    expect('Fanta expected/diff/diffAmount', '10/3/15000.00', `${fi.expectedQty}/${fi.diffQty}/${fi.diffAmount}`);
    const fantaAfter = await call('fanta', 'GET', `/products/${fanta.id}`, null, 200);
    expect('Fanta avgCost after REGULAR (unchanged)', '5000.0000', fantaAfter.avgCost);
    expect('Fanta stock', '13/1/1', `${fantaAfter.stock.units}/${fantaAfter.stock.blocks}/${fantaAfter.stock.remainder}`);
    const pnlSurplus = await call('pnl', 'GET', '/reports/pnl', null, 200);
    expect('P&L surplus > 0', '15000.00', pnlSurplus.inventoryDiff.surplus);
    expect('P&L inventoryDiff.total', '-2600.00', pnlSurplus.inventoryDiff.total);

    console.log('=== EXTRA: cash categories success paths');
    const cashBalance = async () => (await call('cash balance', 'GET', '/cash/balance', null, 200)).balance;
    const counterpartyBalance = async (id) => (await call('counterparty', 'GET', `/counterparties/${id}`, null, 200)).balance;

    await cash({ category: 'OTHER_INCOME', amount: '25000' }, 'OTHER_INCOME 25000');
    expect('cash after OTHER_INCOME', '2085000.00', await cashBalance());
    await cash({ category: 'EXPENSE_RENT', amount: '150000' }, 'EXPENSE_RENT 150000');
    expect('cash after EXPENSE_RENT', '1935000.00', await cashBalance());
    await cash({ category: 'SUPPLIER_PAYMENT', amount: '100000', counterpartyId: ids.ulgurji }, 'SUPPLIER_PAYMENT Ulgurji 100000');
    expect('Ulgurji after SUPPLIER_PAYMENT', '-140000.00', await counterpartyBalance(ids.ulgurji));
    expect('cash after SUPPLIER_PAYMENT', '1835000.00', await cashBalance());
    await cash({ category: 'LOAN_RETURNED', amount: '120000', counterpartyId: ids.vali }, 'LOAN_RETURNED Vali 120000');
    expect('Vali after LOAN_RETURNED', '180000.00', await counterpartyBalance(ids.vali));
    expect('cash after LOAN_RETURNED', '1955000.00', await cashBalance());
    await cash({ category: 'LOAN_REPAID', amount: '200000', counterpartyId: ids.sardor }, 'LOAN_REPAID Sardor 200000');
    expect('Sardor after LOAN_REPAID', '-300000.00', await counterpartyBalance(ids.sardor));
    expect('cash after LOAN_REPAID', '1755000.00', await cashBalance());
    await cash({ category: 'CUSTOMER_DEBT_PAYMENT', amount: '66000.01', counterpartyId: ids.ali }, 'Ali 66000.01 (1 tiyin over)', 409, 'OVERPAYMENT');
    await cash({ category: 'CUSTOMER_DEBT_PAYMENT', amount: '66000', counterpartyId: ids.ali }, 'Ali exactly 66000 (boundary)');
    expect('Ali after full payment', '0.00', await counterpartyBalance(ids.ali));
    expect('cash after Ali full payment', '1821000.00', await cashBalance());

    const entries = await call('Vali entries', 'GET', `/counterparties/${ids.vali}/entries`, null, 200);
    expect('Vali entries (newest first)', '-120000.00:CASH,300000.00:CASH', entries.map((e) => `${e.amount}:${e.sourceType}`).join(','));

    await verifyState(api, expect, ids, EXTRA_STATE, 'after extra tests');

    console.log('=== DATE FORMAT');
    expect('date fields YYYY-MM-DD (bad count)', 0, dateStats.dateBad.length);
    expect('createdAt/updatedAt/postedAt ISO (bad count)', 0, dateStats.isoBad.length);
    console.log(`  date fields checked: ${dateStats.dateOk}, ISO fields checked: ${dateStats.isoOk}`);

    for (const kind of ['sales', 'purchases', 'inventories']) {
      const drafts = await call(`${kind} drafts`, 'GET', `/${kind}?status=DRAFT`, null, 200);
      for (const d of drafts) await call(`delete ${kind} draft`, 'DELETE', `/${kind}/${d.id}`, null, 204);
    }
  } catch (error) {
    if (!(error instanceof CheckFailed)) throw error;
    console.error(`\nSTOPPED: ${error.message}`);
    process.exitCode = 1;
  }

  const failed = rows.filter((r) => !r.ok).length;
  console.log(`\n=== SUMMARY: ${rows.length} checks, ${failed} mismatches`);
  if (process.exitCode === 1 || failed > 0) {
    console.log('RESULT: FAILED');
    process.exitCode = 1;
  } else {
    console.log('RESULT: ALL PASSED');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runTest();
}
