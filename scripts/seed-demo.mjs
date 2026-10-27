import {
  API_URL,
  assertResetConfirmed,
  CheckFailed,
  createApi,
  resetDatabase,
  runMainScenario,
  TODAY,
} from './scenario-test.mjs';

assertResetConfirmed();
console.log(`API_URL=${API_URL} TODAY(Asia/Tashkent)=${TODAY}`);

const api = createApi();

try {
  await resetDatabase();
  const { ids } = await runMainScenario(api);
  const pnl = await api.call('pnl', 'GET', '/reports/pnl', null, 200);
  const { balance } = await api.call('cash balance', 'GET', '/cash/balance', null, 200);
  const counterparties = await api.call('counterparties', 'GET', '/counterparties', null, 200);
  const stock = await api.call('stock', 'GET', '/reports/stock', null, 200);

  console.log('Demo data loaded:');
  console.log(`  ids: ${JSON.stringify(ids)}`);
  console.log(`  cash balance: ${balance}`);
  console.log(`  P&L netProfit: ${pnl.netProfit} (revenue ${pnl.revenue}, cogs ${pnl.cogs})`);
  console.log(`  counterparties: ${counterparties.map((c) => `${c.name} ${c.balance}`).join(', ')}`);
  console.log(`  stock: ${stock.items.map((i) => `${i.name} ${i.total.units} (${i.stockValue})`).join(', ')}`);
} catch (error) {
  if (!(error instanceof CheckFailed)) throw error;
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
}
