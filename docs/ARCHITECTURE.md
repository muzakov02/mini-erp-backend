# Mini ERP — arxitektura: loyiha nega aynan shunday qurilgan

Ichimliklar do'koni uchun kichik ERP. Hujjat qarorlarni va ularning sababini yozadi. Barcha faktlar backend kodi (`src/`, `prisma/`), `scripts/scenario-test.mjs` va mobile ilova kodidan olingan.

## 1. Umumiy ko'rinish

```
Flutter (Android)  --REST/JSON-->  NestJS (/api)  --Prisma-->  PostgreSQL (Neon)
```

| Qatlam | Texnologiya | Nega |
|---|---|---|
| Mobile | Flutter, flutter_bloc (Cubit), dio, go_router, get_it, decimal | Bitta kod bazasi, Android uchun. Cubit oddiy va test qilish oson. `decimal` pul uchun. |
| Backend | NestJS 12, class-validator, Swagger (`/api/docs`) | Modulli tuzilma, DTO orqali qat'iy validatsiya, global xato filtri va javob interceptor'i. |
| ORM | Prisma 7.10.1 + `@prisma/adapter-pg` | Tiplangan so'rovlar, `Decimal` qo'llovi, migratsiyalar (`prisma/migrations`). |
| DB | PostgreSQL | Tranzaksiya, `SELECT ... FOR UPDATE`, advisory lock, `NUMERIC` pul uchun. |

Backend global prefiks `api` bilan ishlaydi. Validatsiya pipe'i, xato filtri va `Decimal` serializer'i `AppModule` da global ulangan, shuning uchun har bir endpoint bir xil xato va pul formatini beradi.

## 2. TZ dagi 3 muammo va yechimi

| Muammo | Yechim | Qayerda |
|---|---|---|
| Qoldiq dona va blokda ko'rinishi kerak ("37 dona · 6 blok + 1 dona") | Faqat dona saqlanadi, blok — hisoblangan ko'rinish: `{units, blocks, remainder}` | `StockService.formatQty`, mobile `formatStock` |
| Sof foyda to'g'ri chiqishi kerak (kassa aylanmasi emas) | Foyda kassadan emas, bajarilgan savdo, tannarx, xarajat va inventarizatsiya farqidan hisoblanadi. Qarz va kapital harakatlari foydadan tashqarida | `ReportsService.pnlReport`, `cash-categories.ts` |
| Mahsulot qaysi omborda turganini bilish | Har bir harakat `warehouse_id` bilan yoziladi; qoldiq ombor bo'yicha ham hisoblanadi. 2 darajali ombor: asosiy va sub-ombor | `stock_movements`, `/reports/stock` (`locations`) |

## 3. Asosiy qarorlar

### 3.1 Qoldiq harakatlar jurnalidan hisoblanadi

- **Qaror.** Qoldiq hech qayerda maydon sifatida saqlanmaydi. `stock_movements` jadvalida har bir harakat ishorali `quantity` (dona) bilan yoziladi (`SALE` manfiy, `PURCHASE` musbat, `INVENTORY` farq). Qoldiq = `SUM(quantity)` (`StockService.getQty`, `getQtyByProduct`, `getQtyByLocation`). Tezlik uchun `(product_id, warehouse_id)` va `date` indekslari bor.
- **Nega.** Jurnal va qoldiq hech qachon bir-biridan ajralib qolmaydi. Har bir raqamning manbasi bor: `source_type` va `source_id` (hujjat).
- **Muqobil: mahsulotda `qty` ustuni.** Rad etildi: har bir hujjat va har bir tuzatishda ustunni qo'lda sinxron ushlash kerak, parallel so'rovlarda chalkashadi, xato bo'lsa sababini topib bo'lmaydi.
- **Qoldiq tomoni.** Jurnal o'sgan sari agregatsiya og'irlashadi. Hozir buning uchun snapshot yoki sahifalash yo'q (7-bo'limga qarang).

### 3.2 Faqat dona saqlanadi, blok — ko'rinish

- **Qaror.** Hujjat qatori kiritilgan birlikni (`unitType`: `UNIT` yoki `BLOCK`) va miqdorni saqlaydi. Posting paytida `qty_in_units` hisoblanadi (`toUnits`: blok bo'lsa `quantity × unitsPerBlock`). Jurnalga faqat dona tushadi. Ko'rsatishda `formatQty` ishorani saqlagan holda `blocks = ⌊|qty| / unitsPerBlock⌋`, `remainder = |qty| mod unitsPerBlock` beradi.
- **Nega.** Bitta o'lchov birligi — qo'shish va ayirishda butun son, yaxlitlash xatosi yo'q.
- **Muqobil: blok va donani alohida saqlash.** Rad etildi: har bir amalda ikki maydonni konvertatsiya qilish kerak, "6 blok 1 dona" va "5 blok 7 dona" bir xil qoldiq bo'lib qoladi.
- **Eslatma.** `unitsPerBlock` mahsulotda tahrirlanadi (`UpdateProductDto`). Jurnal donada bo'lgani uchun o'zgarish faqat blokka aylantirilgan ko'rinishga ta'sir qiladi.

### 3.3 DRAFT → POSTED, bitta tranzaksiya, qulflar

- **Qaror.** Savdo, xarid va inventarizatsiya `DRAFT` holatida yaratiladi. `DRAFT` qoldiqqa, kassaga va kontragent balansiga ta'sir qilmaydi. Faqat `POST /{hujjat}/{id}/post` ta'sir qiladi. `PUT` va `DELETE` faqat `DRAFT` ga ruxsat etiladi (`updateMany`/`deleteMany ... WHERE status = DRAFT`), aks holda `DOCUMENT_NOT_DRAFT`.
- **Posting tartibi** (`post()`, bitta `prisma.$transaction`, `maxWait` 10 s, `timeout` 30 s):
  1. `SELECT ... FOR UPDATE` bilan hujjat qatorini qulflash (`lockDocument`);
  2. mahsulotlarni id bo'yicha tartiblab qulflash (`lockProducts`, tartib o'zaro blokirovka — deadlock — xavfini kamaytiradi);
  3. `updateMany ... WHERE status = DRAFT → POSTED`. Ikkinchi parallel so'rov `count = 0` oladi va `DOCUMENT_NOT_DRAFT` bilan to'xtaydi — **ikki marta bajarishdan himoya**;
  4. havolalarning faolligini tekshirish (arxivlangan bo'lsa `ARCHIVED_ENTITY`);
  5. tekshiruvlar (qoldiq, nasiya uchun kontragent, kassa), keyin jurnal, kassa va kontragent yozuvlari.
- **Kassa uchun alohida qulf.** Kassaga ta'sir qiluvchi amallar (`POST /cash/operations`, to'lov bilan xaridni bajarish) `pg_advisory_xact_lock(7001)` oladi, shunda ikki parallel chiqim kassani manfiyga tushira olmaydi. Kontragentli kassa amalida kontragent qatori ham qulflanadi (`lockCounterparty`).
- **Muqobil: hujjat yaratilishi bilan darhol ta'sir qilish.** Rad etildi: xatoni tuzatishning yo'li yo'q, chunki bajarilgan hujjat o'zgarmaydi (7-bo'lim). Qoralama o'zgartirilishi mumkin.
- **Muqobil: faqat optimistik versiya maydoni.** Qo'llanmadi: holat bo'yicha shartli `UPDATE` va qatorli qulf shu vazifani soddaroq hal qiladi.

### 3.4 Harakatlanuvchi o'rtacha tannarx (FIFO emas)

- **Qaror.** Mahsulotda bitta `avg_cost` (4 xona) saqlanadi. Xarid yoki boshlang'ich inventarizatsiya posting qilinganda yangilanadi (`weightedAvgCost`):
  `(joriy_qoldiq × joriy_avg + qo'shilgan × yangi_tannarx) / jami`, 4 xonagacha yaxlitlanadi (half-up). Joriy qoldiq barcha omborlar bo'yicha jami. Jami ≤ 0 bo'lsa yangi tannarx olinadi. Xaridda blok narxi `unitsPerBlock` ga bo'linadi (`unitCostOf`). Savdo posting qilinganda `unitCost = avg_cost` va `costAmount = round(unitCost × dona, 2)` qatorga yoziladi, hujjat `totalCost` oladi.
- **Nega.** Ichimlik savdosida partiyalar bir xil mahsulot, partiya bo'yicha kuzatish kerak emas. Bitta raqam bilan hisob oddiy va tez, hisobotlar `SUM` bilan olinadi.
- **Muqobil: FIFO.** Rad etildi: har bir xarid partiya qoldig'ini talab qiladi, savdo va inventarizatsiya farqi partiyalarni "yeydi", ombor bo'yicha ham bo'linadi. Murakkablik do'kon uchun foyda bermaydi.
- **Sodir bo'ladigan narsa.** Oddiy (`REGULAR`) inventarizatsiya `avg_cost` ni o'zgartirmaydi, farqni joriy `avg_cost` bilan baholaydi (ssenariydagi Fanta tekshiruvi: `avgCost` 5000.0000 bo'lib qoladi).

### 3.5 P&L kassadan o'qilmaydi: 14 kassa turkumi

- **Qaror.** Har bir kassa operatsiyasining turkumi (`CashCategory`) uchta narsani belgilaydi: yo'nalish, foydaga ta'siri, kontragent balansiga ta'siri. Jadval kodda (`cash-categories.ts`) yagona joyda turadi va `GET /cash/categories` orqali mobile'ga beriladi.
- **Nega.** Kassaga kirgan pul daromad emas: qarz olish, mijoz nasiyasini qaytarishi, boshlang'ich qoldiq — hammasi kassaga kiradi, lekin foyda emas. Foyda turkumga qarab hisoblanadi, shuning uchun noto'g'ri turkum tanlash qiyin.
- **Muqobil: foyda = kirim − chiqim.** Rad etildi (5-bo'limda ssenariy raqamlari bilan).

| Kod | Yo'nalish | Qo'lda kiritiladi | Kontragent | Foydaga ta'siri | Kontragent balansiga |
|---|---|---|---|---|---|
| `SALE_PAYMENT` | IN | yo'q (savdo posting) | — | yo'q (daromad savdodan) | — |
| `CUSTOMER_DEBT_PAYMENT` | IN | ha | majburiy | yo'q | − |
| `LOAN_RETURNED` | IN | ha | majburiy | yo'q | − |
| `LOAN_TAKEN` | IN | ha | majburiy | yo'q | − |
| `OTHER_INCOME` | IN | ha | yo'q | ha (+) | — |
| `OPENING_BALANCE` | IN | ha | yo'q | yo'q | — |
| `PURCHASE_PAYMENT` | OUT | yo'q (xarid posting) | — | yo'q (tannarx sotilganda) | — |
| `SUPPLIER_PAYMENT` | OUT | ha | majburiy | yo'q | + |
| `LOAN_GIVEN` | OUT | ha | majburiy | yo'q | + |
| `LOAN_REPAID` | OUT | ha | majburiy | yo'q | + |
| `EXPENSE_TRANSPORT` | OUT | ha | yo'q | ha (−) | — |
| `EXPENSE_RENT` | OUT | ha | yo'q | ha (−) | — |
| `EXPENSE_OTHER` | OUT | ha | yo'q | ha (−) | — |
| `OWNER_WITHDRAWAL` | OUT | ha | yo'q | yo'q | — |

Qoidalar (`CashService.create`): qo'lda kiritilmaydigan turkum `VALIDATION_ERROR`; kontragent majburiy turkumda bo'lmasa `COUNTERPARTY_REQUIRED`; kontragent kerak bo'lmagan turkumda berilsa `VALIDATION_ERROR`; summa noldan katta bo'lishi kerak; sana bugundan keyin bo'lmaydi.

### 3.6 Nasiya va qarz: kontragent hisob-kitob jurnali

- **Qaror.** Kontragent balansi saqlanmaydi, `counterparty_entries` jadvalidagi ishorali `amount` yig'indisi (`SUM`). **Ishora qoidasi: musbat — kontragent bizga qarz; manfiy — biz kontragentga qarzmiz.** Mobile'da: `> 0` "Bizga qarz", `< 0` "Biz qarzmiz", `0` "Hisob-kitob yo'q".
- **Yozuvlar:**
  - savdoda to'lanmagan qism: `+unpaid`;
  - xaridda to'lanmagan qism: `−unpaid`;
  - kassa turkumlari: jadvaldagi `+` yoki `−` (kontragentli `IN` turkumlar balansni kamaytiradi, kontragentli `OUT` turkumlar oshiradi).
- **Nega.** Jurnal qoldiq jurnali bilan bir xil g'oya: har bir qarz o'zgarishi manbasi (`SALE`, `PURCHASE`, `CASH`) bilan yoziladi, kontragent kartochkasida tarix chiqadi (`GET /counterparties/:id/entries`).
- **Muqobil: kontragentda `balance` ustuni.** Rad etildi (3.1 dagi sabab).
- Kontragent arxivlanishi uchun balans nolga teng bo'lishi shart, aks holda `HAS_BALANCE`.

### 3.7 Ortiqcha to'lov rad etiladi, kassa manfiy bo'lmaydi

- **Qaror.**
  - Ortiqcha to'lov: `CUSTOMER_DEBT_PAYMENT`, `LOAN_RETURNED` summasi kontragent balansidan oshsa, `SUPPLIER_PAYMENT`, `LOAN_REPAID` summasi `−balans` dan oshsa — `OVERPAYMENT` (`details`: `balance`, `amount`).
  - Kassa: har qanday `OUT` amal (qo'lda chiqim yoki to'lovli xarid) kassa qoldig'idan katta bo'lsa — `INSUFFICIENT_CASH` (`details`: `balance`, `required`).
  - Hujjatda: `paidAmount > totalAmount` — `VALIDATION_ERROR`; `paidAmount < totalAmount` va kontragent yo'q — `COUNTERPARTY_REQUIRED` (posting paytida).
  - Savdo: tanlangan ombordagi qoldiq yetmasa `INSUFFICIENT_STOCK`; bir mahsulot va omborning barcha qatorlari yig'ilib solishtiriladi.
- **Nega.** Ortiqcha to'lov kontragent balansini teskari ishoraga o'tkazib yuboradi (qarz qarama-qarshisiga aylanadi), manfiy kassa esa real hayotda bo'lmaydi. Eng arzon himoya — yozishdan oldin rad etish.
- **Muqobil: ruxsat berib, ogohlantirish.** Rad etildi: xato jurnalga tushgach to'g'rilash faqat teskari yozuv bilan bo'ladi.
- **Chegara.** Ssenariy aynan chegarani tekshiradi: Ali qarzi 66 000.00 bo'lganda 66 000.01 rad etiladi, 66 000.00 qabul qilinadi.

### 3.8 Boshlang'ich qoldiq: soxta foydaning oldini olish

- **Qaror.** Tovar uchun maxsus `OPENING` turdagi inventarizatsiya, pul uchun `OPENING_BALANCE` kassa turkumi.
  - `OPENING` da har bir qatorga `unitCost` majburiy, `REGULAR` da taqiqlangan (`validateDraft`).
  - `OPENING` faqat shu omborda shu mahsulotlar bo'yicha qoldiq nol bo'lsa bajariladi, aks holda `OPENING_STOCK_EXISTS` (`details.items[].expectedQty`).
  - Jurnalga sanalgan miqdor kiradi, `avg_cost` o'rtacha tannarx formulasi bilan yangilanadi.
  - P&L da `OPENING` summasi `excludedFromPnl.openingStockValue`, `OPENING_BALANCE` esa `excludedFromPnl.openingBalance` ga tushadi — foydaga qo'shilmaydi.
- **Nega.** Mavjud tovar va pulni tizimga kiritish daromad emas.
- **Muqobil 1: boshlang'ich tovarni xarid sifatida kiritish.** Rad etildi: soxta qarz va soxta kassa chiqimi paydo bo'ladi.
- **Muqobil 2: `REGULAR` inventarizatsiya bilan kiritish.** Rad etildi: `REGULAR` da musbat farq P&L da "ortiqcha" bo'lib foydaga qo'shiladi.

### 3.9 Inventarizatsiya farqi P&L da ikki tomonlama

- **Qaror.** Faqat bajarilgan `REGULAR` inventarizatsiya qatorlari hisobga olinadi. `farq = sanalgan − kutilgan` (kutilgan — jurnal bo'yicha shu ombordagi qoldiq). `diffAmount = round(avg_cost × farq, 2)`. P&L da `shortage` (manfiy qatorlar yig'indisi) va `surplus` (musbat qatorlar yig'indisi) alohida ko'rsatiladi, `netProfit` ga ikkalasining yig'indisi (`inventoryDiff.total`) qo'shiladi.
- **Nega.** Kamomad — haqiqiy yo'qotish, ortiqcha — haqiqiy topilma. Faqat birini hisoblash foydani buzadi.
- **Muqobil: faqat kamomadni hisoblash (ehtiyotkor variant).** Rad etildi: ortiqcha chiqsa foyda sun'iy kam ko'rinadi, hisobot nomuvofiq bo'ladi.
- Farq nol bo'lmasa `stock_movements` ga `INVENTORY` harakati yoziladi (qoldiq sanalganga tenglashadi).

### 3.10 Pul — Decimal, API da string

- **Qaror.** DB: pul `Decimal(18,2)`, tannarx `Decimal(18,4)`. Backend `Prisma.Decimal` bilan hisoblaydi (`round` — half-up). `DecimalSerializerInterceptor` javobdagi barcha Decimal'ni string qiladi: 2 xona, `avgCost` va `unitCost` uchun 4 xona. Kirishda pul `^\d{1,16}(\.\d{1,2})?$`, tannarx `^\d{1,14}(\.\d{1,4})?$` regex'idan o'tadi va string kelishi shart. Sana maydonlari (`date`) `YYYY-MM-DD`, vaqt belgilari ISO.
- **Nega.** Ikkilik suzuvchi nuqta (`double`) 0.1 + 0.2 kabi xato beradi; pul hisobida ruxsat etilmaydi. String — JSON'da aniqlikni yo'qotmaydi.
- **Muqobil: butun son (tiyin).** Qo'llanmadi: tannarx 4 xona va blok narxini donaga bo'lish kasrli hisob talab qiladi.
- Mobile ham shunday: `Decimal.parse`, yuborishda `toStringAsFixed(2)` (tannarx uchun 4).

### 3.11 2 darajali ombor va arxivlash qoidalari

- **Ombor.** Ildiz ombor va uning sub-omborlari, xolos (`INVALID_WAREHOUSE_LEVEL`: sub-ombor ichida sub-ombor yaratib bo'lmaydi; arxivlangan ildiz ostiga yaratib bo'lmaydi — `ARCHIVED_ENTITY`). Nom noyob: ildiz uchun alohida, sub-ombor uchun ota ostida (`UNIQUE (name, parent_id) NULLS NOT DISTINCT`). Qoldiq ham ildizda, ham sub-omborda turishi mumkin; `/reports/stock?warehouseId=<ildiz>` sub-omborlarni ham qo'shadi.
- **Arxivlash, o'chirish emas.** Yozuvlar hujjat va jurnal bilan bog'langan (`onDelete: Restrict`), shuning uchun mahsulot, ombor va kontragent arxivlanadi:
  - mahsulot: qoldig'i nolga teng bo'lsa (`HAS_STOCK`, `details.qty`);
  - ombor: qoldig'i nol va faol sub-omborlari yo'q (`HAS_STOCK`, `details.reason` = `WAREHOUSE_HAS_STOCK` yoki `HAS_ACTIVE_CHILDREN`);
  - kontragent: balansi nol (`HAS_BALANCE`).
- Arxivlangan mahsulot, ombor yoki kontragent yangi hujjatda ishlatilsa — `ARCHIVED_ENTITY` (`details.entity`, `details.ids`). Ro'yxatlar odatda arxivlanganlarni qaytarmaydi (`includeArchived=true` bilan qaytaradi).
- **Muqobil: 3+ daraja yoki o'chirish.** Daraxt chuqurligi tarixiy hisobotni murakkablashtiradi (ildiz filtri), o'chirish esa jurnal yaxlitligini buzadi.

### 3.12 Xato formati va kodlar

Barcha xatolar bitta shaklda (`AllExceptionsFilter`):

```json
{ "statusCode": 409, "code": "INSUFFICIENT_STOCK", "message": "Insufficient stock", "details": { } }
```

`message` — inglizcha texnik matn; foydalanuvchi matnini mobile `code` va `details` dan quradi. Prisma xatolari moslanadi: `P2002` → `DUPLICATE`, `P2003` → `REFERENCE_ERROR`, `P2025` → `NOT_FOUND`. Boshqa `HttpException` — status bo'yicha kod (`400` → `VALIDATION_ERROR`, `404` → `NOT_FOUND`, qolganlari status nomi). Kutilmagan xato — `500 INTERNAL_ERROR`.

| Kod | HTTP | Qachon | `details` |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | DTO validatsiyasi; `paidAmount > totalAmount`; qo'lda kiritib bo'lmaydigan turkum; `unitCost` qoidasi | `errors[{field, constraints}]` yoki `paidAmount`/`totalAmount`, `items`, `category` |
| `NOT_FOUND` | 404 | Yozuv yo'q (hujjat, mahsulot, havola) | `entity`, `ids` (havola uchun) |
| `DOCUMENT_NOT_DRAFT` | 409 | Bajarilgan hujjatni o'zgartirish, o'chirish, qayta bajarish | `status` |
| `INSUFFICIENT_STOCK` | 409 | Savdoda qoldiq yetmaydi | `items[{productId, productName, warehouseId, warehouseName, available, requested}]` (dona) |
| `INSUFFICIENT_CASH` | 409 | Chiqim yoki xarid to'lovi kassadan katta | `balance`, `required` |
| `OVERPAYMENT` | 409 | To'lov kontragent qarzidan oshadi | `balance`, `amount` |
| `COUNTERPARTY_REQUIRED` | 400 | Nasiya yoki kontragent majburiy turkum, kontragent yo'q | `unpaidAmount` yoki `category` |
| `OPENING_STOCK_EXISTS` | 409 | Boshlang'ich inventarizatsiya, omborda qoldiq bor | `warehouseId`, `items[{productId, productName, expectedQty}]` |
| `INVALID_WAREHOUSE_LEVEL` | 400 | Sub-ombor ichida sub-ombor | `parentId` |
| `HAS_STOCK` | 409 | Qoldiqli mahsulot yoki ombor, faol sub-omborli ombor arxivlanmoqda | `qty` / `reason` + `products` yoki `children` |
| `ARCHIVED_ENTITY` | 409 | Arxivlangan yozuv ishlatildi | `entity`, `ids` |
| `DUPLICATE` | 409 | Noyoblik buzildi (masalan, mahsulot nomi) | `model`, `constraint` |
| `REFERENCE_ERROR` | 409 | Bog'liqlik buzildi | `model`, `constraint` |
| `HAS_BALANCE` | 409 | Balansli kontragent arxivlanmoqda | `balance` |

## 4. P&L formulasi

Davr (`from`, `to`) ikki chegarasi ham kiradi; hujjatlar `date` bo'yicha filtrlanadi.

```
revenue         = bajarilgan (POSTED) savdolar totalAmount yig'indisi
cogs            = shu savdolar totalCost yig'indisi
grossProfit     = revenue − cogs
otherIncome     = OTHER_INCOME kassa kirimlari
expenses.total  = EXPENSE_TRANSPORT + EXPENSE_RENT + EXPENSE_OTHER
inventoryDiff   = shortage (REGULAR farq < 0, manfiy) + surplus (REGULAR farq > 0)

netProfit = grossProfit + otherIncome − expenses.total + inventoryDiff.total
```

**Foydaga kirmagan harakatlar** (`excludedFromPnl`, har biri alohida ko'rsatiladi):

| Maydon | Manba |
|---|---|
| `customerDebtPayments` | `CUSTOMER_DEBT_PAYMENT` |
| `loansReturned` | `LOAN_RETURNED` |
| `loansTaken` | `LOAN_TAKEN` |
| `loansGiven` | `LOAN_GIVEN` |
| `loansRepaid` | `LOAN_REPAID` |
| `supplierPayments` | `SUPPLIER_PAYMENT` |
| `ownerWithdrawals` | `OWNER_WITHDRAWAL` |
| `openingBalance` | `OPENING_BALANCE` |
| `openingStockValue` | bajarilgan `OPENING` inventarizatsiyalar `totalDiffAmount` yig'indisi |

Mobile ilovada bu blok P&L kartasi ostida chiqadi va izoh bilan keladi: "Qarz, qarz qaytarish va kapital harakatlari foyda yoki zarar emas."

## 5. Isbot: 10 qadamli ssenariy

`scripts/scenario-test.mjs` ishlayotgan serverga HTTP orqali so'rov yuboradi va har bir natijani kutilgan qiymat bilan solishtiradi (farq bo'lsa to'xtaydi).

**Ishga tushirish** (PowerShell, backend ishlab turgan bo'lishi kerak; `DATABASE_URL` `.env` dan olinadi):

```powershell
$env:CONFIRM_RESET = "yes"
npm run test:scenario
```

> **Diqqat.** Skript DB ning 12 ta biznes jadvalini `TRUNCATE` qiladi. `CONFIRM_RESET=yes` bo'lmasa ishga tushmaydi. Faqat sinov bazasida ishlating. Manzil `API_URL` o'zgaruvchisi bilan beriladi, standart `http://localhost:3000/api`. `npm run seed:demo` ham xuddi shu ssenariy bilan bazani tozalab, demo ma'lumot yuklaydi.

**Boshlang'ich ma'lumot.** Mahsulot Cola 1.5L (blokda 6 dona; dona 12 000, blok 66 000); omborlar: Asosiy, uning ichida Zaxira va Sovutgich; kontragentlar: Ulgurji (yetkazib beruvchi), Ali (mijoz), Vali va Sardor (boshqa).

| № | Qadam | Kassa keyin | Qoldiq (Zaxira) | Kontragent balansi | Izoh |
|---|---|---|---|---|---|
| 1 | `OPENING_BALANCE` 2 000 000 | 2 000 000 | — | — | foydaga kirmaydi |
| 2 | `OPENING` inventarizatsiya: 12 dona, tannarx 7 800 | 2 000 000 | 12 | — | qiymat 93 600, foydaga kirmaydi; `avgCost` 7 800 |
| 3 | Xarid (Ulgurji): 10 blok × 54 000 = 540 000, to'landi 300 000 | 1 700 000 | 72 | Ulgurji −240 000 | blok narxi 9 000/dona; `avgCost` = (93 600 + 540 000) / 72 = **8 800** |
| 4 | Savdo (Ali): 5 blok × 66 000 + 3 dona × 12 000 = 366 000, to'landi 200 000 | 1 900 000 | 39 | Ali +166 000 | tannarx 33 × 8 800 = **290 400**, yalpi foyda **75 600** |
| 5 | `CUSTOMER_DEBT_PAYMENT` Ali 100 000 | 2 000 000 | 39 | Ali +66 000 | foydaga kirmaydi |
| 6 | `LOAN_GIVEN` Vali 300 000 | 1 700 000 | 39 | Vali +300 000 | foydaga kirmaydi |
| 7 | `LOAN_TAKEN` Sardor 500 000 | 2 200 000 | 39 | Sardor −500 000 | foydaga kirmaydi |
| 8 | `EXPENSE_TRANSPORT` 40 000 | 2 160 000 | 39 | — | xarajat −40 000 |
| 9 | `REGULAR` inventarizatsiya: sanaldi 37, kutilgan 39 | 2 160 000 | 37 | — | farq −2 dona × 8 800 = **−17 600** |
| 10 | `OWNER_WITHDRAWAL` 100 000 | **2 060 000** | 37 | — | foydaga kirmaydi |

(Savdo bosqichida skript avval to'ldiruvchi qoralama yaratib, `PUT` bilan qatorlarni almashtiradi va faqat keyin bajaradi.)

**Kutilgan yakuniy natija** (skriptdagi `MAIN_STATE`):

| Ko'rsatkich | Qiymat |
|---|---|
| Savdo daromadi / tannarx / yalpi foyda | 366 000 / 290 400 / **75 600** |
| Boshqa daromad / yo'l kira / ijara | 0 / 40 000 / 0 |
| Inventarizatsiya farqi (kamomad / ortiqcha / jami) | −17 600 / 0 / −17 600 |
| **Sof foyda** | 75 600 + 0 − 40 000 − 17 600 = **18 000** |
| **Kassa qoldig'i** | **2 060 000** |
| Kontragent balanslari | Ali 66 000; Vali 300 000; Ulgurji −240 000; Sardor −500 000 |
| Cola qoldig'i | 37 dona = 6 blok + 1 dona (Zaxira), qiymati 325 600 (37 × 8 800) |
| Foydaga kirmaganlar | nasiya to'lovi 100 000; olingan qarz 500 000; berilgan qarz 300 000; egasi olgan 100 000; boshlang'ich kassa 2 000 000; boshlang'ich tovar 93 600 |
| Savdo hisoboti | 1 ta hujjat; to'langan 200 000; nasiya 166 000 |

Skript bundan tashqari tekshiradi: 14 ta turkum (faqat `SALE_PAYMENT` va `PURCHASE_PAYMENT` qo'lda emas); xato holatlari (`OVERPAYMENT` ikki xil, `INSUFFICIENT_CASH`, `COUNTERPARTY_REQUIRED`, qo'lda `SALE_PAYMENT`, kontragent kerak bo'lmagan turkumda kontragent berilishi, `from > to`, qayta bajarish, bajarilganni o'chirish) va xatolardan keyin holat o'zgarmasligi; ortiqcha inventarizatsiya (Fanta: kutilgan 10, sanaldi 13, farq +15 000, `avgCost` o'zgarmaydi; P&L da ortiqcha 15 000, jami −2 600); qolgan kassa turkumlarining muvaffaqiyatli yo'llari va chegara (66 000.00 qabul, 66 000.01 rad); sana formatlari; yakuniy holatda sof foyda −92 000, kassa 1 821 000.

### Qarzni foydaga qo'shadigan tizim shu ssenariyda nima ko'rsatadi

Quyidagi raqamlar kodda yo'q — ssenariy raqamlari bilan qilingan hisob-kitob: har bir qator alohida noto'g'ri qoida tadbiq etilsa, to'g'ri 18 000 qanday o'zgarishi.

| Noto'g'ri qoida | Hisob | Ko'rsatadigan "foyda" | Xato |
|---|---|---|---|
| Qarz olishni daromad deb hisoblash (`LOAN_TAKEN`) | 18 000 + 500 000 | 518 000 | +500 000 |
| Qarz berishni xarajat deb hisoblash (`LOAN_GIVEN`) | 18 000 − 300 000 | −282 000 | −300 000 (zarar ko'rinadi, aslida Vali qarzdor) |
| Egasi olgan pulni xarajat deb hisoblash | 18 000 − 100 000 | −82 000 | −100 000 |
| Mijoz nasiya to'lovini yana daromad qilish | 18 000 + 100 000 | 118 000 | savdo daromadi allaqachon 366 000 da sanalgan, ikki marta |
| Boshlang'ich kassani daromad qilish | 18 000 + 2 000 000 | 2 018 000 | +2 000 000 |
| Boshlang'ich tovarni daromad qilish | 18 000 + 93 600 | 111 600 | +93 600 |
| Hammasi birga | 18 000 + 500 000 − 300 000 − 100 000 + 100 000 + 2 000 000 + 93 600 | **2 311 600** | taxminan 128 baravar |
| "Foyda = kassa o'zgarishi" (boshlang'ich qoldiqsiz) | 2 060 000 − 2 000 000 | 60 000 | 3,3 baravar; nasiya, tovar zaxirasi va kamomadni ko'rmaydi |

Shu sababli tizimda foyda kassadan emas, turkumga bog'langan formuladan hisoblanadi (3.5 va 4-bo'lim), kassa qoldig'i esa alohida ko'rsatkich sifatida qoladi.

## 6. Mobile arxitektura

**Tuzilma — feature-first:**

```
lib/
  main.dart, app.dart
  core/
    config/    API_BASE_URL (--dart-define)
    di/        get_it
    errors/    AppFailure
    format/    pul, sana, qoldiq formatlari
    models/    StockQty
    network/   dio client, guarded(), json yordamchilari
    router/    go_router, AppShell
    state/     ListState, LoadState
    widgets/   umumiy widgetlar
  features/
    products, warehouses, stock, counterparties,
    documents, cash, reports
      data/          modellar, repository
      presentation/  cubit, sahifalar
```

- **Holat boshqaruvi — Cubit.** Ro'yxat ekranlari (mahsulot, ombor, kontragent, hujjatlar, kassa, hisobotlar) uchun cubit'lar ilova darajasida `MultiBlocProvider` da yaratiladi va ishga tushganda yuklanadi. Bitta ekranga tegishlilari marshrut yaratilganda tug'iladi: kontragent tafsiloti, savdo/xarid formasi, inventarizatsiya formasi, kassa formasidagi kontragent balansi, savdo va qoldiq hisobotlari. Cubit'lar `get_it` fabrikalaridan olinadi, repository'lar yagona nusxa. Poyga holatini (eski javob yangisini bosib ketishi) token bilan oldini oladigan cubit'lar bor (hujjatlar, kassa, hisobotlar).
- **Navigatsiya.** `StatefulShellRoute.indexedStack`, 5 tab: Hisobotlar (boshlang'ich sahifa), Hujjatlar, Kassa, Ombor, Kontragentlar. Formalar va tafsilotlar tab ustidan alohida marshrutlarda ochiladi. Hisobotlar yoki Kassa tabiga o'tilganda ma'lumot yangidan yuklanadi.
- **dio va xatolar.** `createDio()` interceptor ulaydi: javob `{statusCode, code, message, details}` bo'lsa `AppFailure(code, message, details)` yasaydi, javob umuman yo'q bo'lsa `NETWORK_ERROR`, boshqasi `UNKNOWN_ERROR`. Repository'lar `guarded()` orqali chaqiradi, shunda UI faqat `AppFailure` ko'radi. `AppFailure.userMessage` kod bo'yicha o'zbekcha matn quradi va `details` dan raqamlarni qo'shadi (yetishmagan qoldiq qatorlari, kassa qoldig'i, kontragent balansi). `message` (inglizcha) foydalanuvchiga ko'rsatilmaydi. `ErrorView` "Qayta urinish" tugmasi bilan, ro'yxat ichidagi yangilash xatosi uchun `ErrorBanner`.
- **Decimal.** Pul va tannarx `Decimal.parse` bilan o'qiladi (backend string beradi), hisob-kitob (qator summasi, jami, nasiya, yalpi foyda) `Decimal` da. Backendga `toStringAsFixed(2)` (tannarx uchun 4) yuboriladi. Kod bazasida pul uchun `double` yo'q. `MoneyField` faqat raqam va kasr xonalarini o'tkazadi (pul 2 xona, tannarx 4).
- **Formatlash.** Pul "366 000 so'm" (kasr bo'lsa 2 xona), API sanasi `YYYY-MM-DD`, ekranda `dd.MM.yyyy`, "bugun" Toshkent vaqti (UTC+5) bo'yicha. Qoldiq "37 dona · 6 blok + 1 dona".
- **Tarmoq.** Manzil `--dart-define=API_BASE_URL=...` bilan beriladi; berilmasa ilova tushuntiruvchi ekran ko'rsatadi. Manifestda `INTERNET` ruxsati va `usesCleartextTraffic="true"` (backend lokal tarmoqda HTTP).

## 7. Ataylab scope'dan tashqarida qoldirilganlar

Quyidagilar kodda yo'q (mos endpoint yoki mexanizm mavjud emas). Sabab ustunidagi izohlar loyiha qarori sifatida berilgan.

| Nima | Holat | Sabab |
|---|---|---|
| Omborlar orasida ko'chirish | Yo'q: ko'chirish hujjati ham, endpoint ham yo'q | Qamrovni chegaralash. Kerak bo'lsa jurnalga yangi `source_type` va juft harakat qo'shiladi. Hozir qoldiq farqini inventarizatsiya to'g'rilaydi. |
| Bajarilgan hujjatni bekor qilish | Yo'q: bajarilgan hujjat o'zgarmaydi, o'chirilmaydi (`DOCUMENT_NOT_DRAFT`) | Bekor qilish tannarx, o'rtacha tannarx va kontragent balansini qayta hisoblashni talab qiladi, jurnal o'zgarmas bo'lib qolishi hisobot ishonchini beradi. Xato bajarilsa, to'g'rilash: yangi hujjat yoki inventarizatsiya. |
| Login va rollar | Yo'q: backendda autentifikatsiya va CORS sozlamasi yo'q, mobile ilovada kirish ekrani yo'q | Hozirgi shakl — bitta do'kon egasi va lokal tarmoq. Internetga ochishdan oldin qo'shilishi shart. |
| Sahifalash | Yo'q: ro'yxat endpoint'lari barcha yozuvni qaytaradi (`skip`/`take` yo'q) | Do'kon ma'lumot hajmi kichik. Hujjatlar va kassa operatsiyalari ko'payganda birinchi bo'lib sahifalash va davr filtri zarur bo'ladi (hozir hujjat va kassa ro'yxatlarida `from`/`to` filtri backendda bor, mobile ro'yxatlarida ishlatilmaydi). |
| Lokalizatsiya (sana tanlagich va tizim menyulari) | Inglizcha qoladi | `flutter_localizations` `intl 0.20.2` talab qiladi, loyihada `intl ^0.20.3`; paket versiyasini o'zgartirmaslik qarori qabul qilingan. |
