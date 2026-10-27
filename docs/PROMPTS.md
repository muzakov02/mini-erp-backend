# AI promptlari

Loyiha to'liq AI yordamida bajarildi. Ikki xil vosita ishlatildi:

1. **Claude (claude.ai, Opus)** — TZ tahlili, tuzoqlarni aniqlash, domen modeli, baza sxemasi, API kontrakti va Claude Code uchun promptlarni tayyorlash.
2. **Claude Code (terminal)** — kodni yozish, ishga tushirish va tekshirish. Backend sessiyasi Opus, mobile sessiyasi Sonnet modelida ishladi.

Ish tartibi: avval rejalashtirish suhbatida har bir qaror men bilan kelishildi, keyin har bir bosqich uchun alohida prompt Claude Code'ga berildi va uning natijasi (build, analyze, test) rejalashtirish suhbatida tekshirilib, keyingi bosqichga o'tildi.

Quyida barcha promptlar berilgan tartibda keltirilgan.

---

## 1-qism. Rejalashtirish suhbati (Claude, claude.ai)

Bu yerda mening Claude'ga yozgan asosiy xabarlarim aynan keltirilgan. Bu suhbatda kod yozilmagan — faqat tahlil, qarorlar va reja.

### 1.1. TZ berildi

```text
xullas men bitta kompaniyaga suhbatga topshirdim suhbat yakunida esa menga bitta kichik loyiha uchun tz berishdi va uni bir kun ichida to'liq formatda chiqarish talabi qo'yildi , ya'ni to'liq degan dizayn , front va backendni o'z ichiga oladi
https://telegra.ph/Texnik-topshiriq-Ichimliklar-dokoni-uchun-mini-ERP-10-20
mana tz
```

### 1.2. Ish tartibi va cheklovlar

```text
hop biz b varinat flutter mobile yo'lidan yuramiz chunki bu bizning ustunlik tomonimiz
1) tz bilan yaxshilab tanishilinadi
2)keyin loyiha mobileda qilinadi va loyihaga mos backend dasturlash tili tanlanadi
3)hozircha hech qanday amaliy ish qilinmaydi va chuqur strategiya va ish qanday qilish haqida yo'l xaritasi tuziladi
4) loyiha uchun yo'l haritasi tuzishda hech qanday tavakkal ish qilinmaydi men bilan maslahatlashgan holatda
5)taxmin qilma , tushunmagan yoki ikkilangan joyingda menga ayt
6) loyiha tzsida bir nechta tuzoqlar bor , nasiya va shunga o'xshash joylar bilan bog'liq shunga jiddiy ahamiyat ber
7) loyihaga alohida dizayn chizdirmaymiz bunga ancha vaqt va token ketadi shuning uchun dizayn soddaroq shaklda qilamiz, shuning dizaynni qanday ishlash yo'l haritasiga kiritma
8) loyiha yo'l haritasi tuzishda har jihatda yaxshilab e'tibor ber va aniq aniq qismlarga bo'l va har bir qism ustida keyinchalik alohiada ishlaymiz
9)loyiha yo'l haritasidagi oxirgi ish bu loyihani git hubga push qilish va u haqida read me yozish buni ham xaritaga kirtishni unutma va eng oxirgi qiladiga ish bo'ladi
```

### 1.3. Claude bergan 15 ta aniqlashtiruvchi savolga javoblarim

```text
1)tz 20- kui chiqqan bo'lsa ham menga hozir berishdi , bizdagi deadline bu 27 oktyabr soat 18:00 gacha
2)bunda NestJS
3) nasiya savdo kerak , ya'niyam o'zing tzdan kelib chiqib tavsiya ber
4) ha tasdiqlayman kerak
5) tannarx usuli
6) blok narxi alohida donaga alohida
7) ikklasi ham tz da aytilganku
Foydalanuvchi ombor yarata olishi va uning ichida sub-omborlar yarata olishi kerak. Mahsulotlar shu omborlar va sub-omborlarda joylashadi — mahsulot joylashuvi aynan shu orqali ko'rinadi.
8) xozircha shart emas
9) hozircha shart emas
10) savolga yaxshi tushunmadim
11) bunda ham savolni yaxshi tushunmadimm , tzda bu haqida bormi , buni ham yaxshilab ko'rib chiqamiz
12) hozircha kerak emas
13) bu ishga kirish uchun berilgan mashq shuning uchun hozir localdan foydalanamiz
14) o'zbekcha
15) jar biriga alohida
```

### 1.4. Claude tavsiyalarini tasdiqlash

Claude nasiya mexanizmi, o'rtacha tannarx, inventarizatsiya farqi, boshlang'ich qoldiq, "Egasi olgan pul" turkumi, kassaning manfiy bo'lmasligi va savdoda narxning avtomatik tushishini tavsiya qildi va har birini misol bilan tushuntirdi:

```text
1) ha
2)ha
3)ha
4)ha
5) ha
6) ha
7) ha
```

Domen modelidan keyingi savollar (ombor chuqurligi, qatorda ombor tanlash, ortiqcha to'lov, inventarizatsiya bitta omborda):

```text
1) 2- daraja
2) ma'qul
3) rad etish
4) ma'qul
```

Baza sxemasi va API kontraktidan keyingi qoidalar:

```text
hammasiga roziman ma'qul
```

```text
kichik qarorlarni hammasi ma'qul va biz A yo'ldan yurmaiz claude code orqali yozamiz
```

```text
ma'qul
```
(qarzi bor kontragentni arxivlash taqiqlanishi haqida)

```text
1) telefonimda
android
```

Qolgan xabarlarim — muhitni sozlash (PostgreSQL o'rnatish urinishi, Neon bazasini yaratish, telefonni tarmoq orqali ulash) bo'yicha skrinshotlar va qisqa tasdiqlar edi.

---

## 2-qism. Backend — Claude Code (Opus)

Papka: `D:\projects\mini-erp-backend`

### 2.1. Skelet va baza sxemasi

````text
Ichimliklar do'koni uchun mini-ERP backend'ini quryapmiz. Bu bosqichda faqat loyiha skeleti va baza sxemasi. Biznes logika (hujjatlarni bajarish, hisobotlar) keyingi bosqichda — hozir yozma.

Stack: NestJS (oxirgi barqaror versiya), TypeScript, Prisma, PostgreSQL (Neon). Joriy papka: D:\projects\mini-erp-backend. Muhit: Windows, PowerShell — buyruqlarni && bilan zanjirlama.

Prisma'ning o'rnatilgan versiyasini tekshir va aynan shu versiyaning rasmiy hujjatidagi sozlash usulidan foydalan, eski versiya naqshlarini taxmin qilma.

1. Skelet
- Nest loyihasini joriy papkada yarat (npm).
- Global prefiks /api.
- Global ValidationPipe (whitelist, forbidNonWhitelisted, transform).
- Swagger: /api/docs.
- ConfigModule, DATABASE_URL .env dan.
- PrismaModule + PrismaService (global).
- Global exception filter. Barcha xatolar shu formatda qaytadi:
  { "statusCode": number, "code": string, "message": string, "details": object | null }
  Biznes xatolar uchun AppException(code, message, statusCode, details) klassi yarat.
  Kodlar: VALIDATION_ERROR(400), NOT_FOUND(404), DOCUMENT_NOT_DRAFT(409), INSUFFICIENT_STOCK(409), INSUFFICIENT_CASH(409), OVERPAYMENT(409), COUNTERPARTY_REQUIRED(400), OPENING_STOCK_EXISTS(409), INVALID_WAREHOUSE_LEVEL(400), HAS_STOCK(409), ARCHIVED_ENTITY(409).
  ValidationPipe xatolari ham VALIDATION_ERROR formatiga o'tsin.
- Decimal qiymatlar JSON javobda string bo'lib chiqsin (masalan "366000.00").
- .env.example (DATABASE_URL=), .gitignore da .env bo'lsin.

2. Prisma sxemasi
Umumiy: id — Int autoincrement; pul — Decimal @db.Decimal(18,2); tannarx — Decimal @db.Decimal(18,4); miqdor — Int (dona); har jadvalda createdAt, updatedAt. Jadval va ustun nomlari bazada snake_case (@@map, @map).

Enumlar:
CounterpartyType: CUSTOMER, SUPPLIER, OTHER
DocumentStatus: DRAFT, POSTED
UnitType: UNIT, BLOCK
InventoryType: REGULAR, OPENING
CashDirection: IN, OUT
CashCategory: SALE_PAYMENT, CUSTOMER_DEBT_PAYMENT, LOAN_RETURNED, LOAN_TAKEN, OTHER_INCOME, OPENING_BALANCE, PURCHASE_PAYMENT, SUPPLIER_PAYMENT, LOAN_GIVEN, LOAN_REPAID, EXPENSE_TRANSPORT, EXPENSE_RENT, EXPENSE_OTHER, OWNER_WITHDRAWAL
StockSource: SALE, PURCHASE, INVENTORY
CounterpartySource: SALE, PURCHASE, CASH

Product: name (unique), unitsPerBlock Int, salePriceUnit, salePriceBlock (pul), avgCost (tannarx, default 0), isArchived (default false).

Warehouse: name, parentId (ixtiyoriy, Warehouse ga o'zaro bog'lanish), isArchived. Unique (name, parentId).

Counterparty: name, phone (ixtiyoriy), type, isArchived.

Sale: date (@db.Date), counterpartyId (ixtiyoriy), status (default DRAFT), totalAmount, paidAmount (default 0), totalCost (ixtiyoriy, pul), postedAt (ixtiyoriy), note (ixtiyoriy).
SaleItem: saleId (onDelete Cascade), productId, warehouseId, unitType, quantity Int, price, amount, qtyInUnits Int, unitCost (tannarx, ixtiyoriy), costAmount (pul, ixtiyoriy).

Purchase: date, counterpartyId (ixtiyoriy), status, totalAmount, paidAmount, postedAt, note.
PurchaseItem: purchaseId (Cascade), productId, warehouseId, unitType, quantity, price, amount, qtyInUnits, unitCost (tannarx).

Inventory: date, type, warehouseId, status, postedAt, totalDiffAmount (pul, ixtiyoriy), note.
InventoryItem: inventoryId (Cascade), productId, countedQty Int, expectedQty Int?, diffQty Int?, unitCost (tannarx, ixtiyoriy), diffAmount (pul, ixtiyoriy). Unique (inventoryId, productId).

StockMovement: productId, warehouseId, quantity Int (ishorali), unitCost (tannarx), sourceType StockSource, sourceId Int, date. Index (productId, warehouseId), index (date).

CashOperation: date, direction, category, amount (pul), counterpartyId (ixtiyoriy), sourceType StockSource? emas — alohida ixtiyoriy maydon: sourceType (SALE yoki PURCHASE uchun CounterpartySource dan foydalan, ixtiyoriy), sourceId Int?, note. Index (date), index (category).

CounterpartyEntry: counterpartyId, amount (pul, ishorali: + u bizga qarz, − biz unga qarz), sourceType CounterpartySource, sourceId Int, date. Index (counterpartyId).

Barcha foreign key'lar (Cascade ko'rsatilganlardan tashqari) onDelete: Restrict.

3. Migratsiya
.env.example ni yaratgandan keyin TO'XTA va menga ayt. .env faylini o'zim yarataman va ulanish satrini qo'yaman. Men "tayyor" deganimdan keyin birinchi migratsiyani (init) ishga tushir.

4. Tekshiruv
- npm run build xatosiz
- Server ishga tushadi, /api/docs ochiladi
- Bazada jadvallar yaratilgani tasdiqlansin (prisma migrate status yoki shunga o'xshash)
Har birining natijasini ko'rsat.

Qoidalar: komment yozma. README yoki boshqa .md fayl yaratma. git commit qilma. Biznes modullar (products, sales va h.k.) bu bosqichda YARATILMAYDI.
````

Davomi (migratsiyadan oldin):

```text
tayyor. Migratsiyadan oldin: Warehouse dagi unique (name, parentId) ildiz omborlarda (parentId = NULL) ham ishlashi kerak. Init migratsiyani --create-only bilan yarat, unique index'ni NULLS NOT DISTINCT bilan qilib SQL'ni tahrirla, keyin migratsiyani qo'lla. Agar bazaga ulanishda xato bo'lsa, xato matnini ko'rsat va to'xta. So'ng serverni ishga tushirib /api/docs ni tekshir va natijalarni ko'rsat.
```

### 2.2. Ma'lumotnomalar

````text
6-bosqich: ma'lumotnomalar — mahsulotlar, omborlar, kontragentlar. Mavjud kod tuzilmasi va naqshlariga amal qil. Hujjatlar, kassa va hisobotlar bu bosqichda YOZILMAYDI.

Umumiy:
- Pul qiymatlari kirishda string: ^\d+(\.\d{1,2})?$ . Javobda Decimal string (mavjud interceptor).
- Barcha DTO'larda Swagger dekoratorlari.
- Nomlar trim qilinadi, bo'sh bo'lmasin.
- Prisma xatolarini global filter'da moslashtir: P2002 -> 409 DUPLICATE, P2003 -> 409 REFERENCE_ERROR, P2025 -> 404 NOT_FOUND. DUPLICATE, REFERENCE_ERROR, HAS_BALANCE(409) kodlarini error-code ga qo'sh.

Umumiy StockService (keyingi bosqichlarda ham ishlatiladi):
- Qoldiq faqat stock_movements.quantity yig'indisidan hisoblanadi, products jadvalida qoldiq maydoni yo'q.
- getQty(productId, warehouseId?) — warehouseId berilmasa barcha omborlar bo'yicha.
- formatQty(qty, unitsPerBlock) -> { units, blocks, remainder }. Misol: 37 dona, blokda 6 -> { units: 37, blocks: 6, remainder: 1 }.

1. Products — /products
- GET ?includeArchived=false — ro'yxat, har birida stock: { units, blocks, remainder } (barcha omborlar bo'yicha).
- GET /:id
- POST { name, unitsPerBlock (Int > 0), salePriceUnit, salePriceBlock }
- PATCH /:id — name, unitsPerBlock, salePriceUnit, salePriceBlock. avgCost API orqali hech qachon o'zgartirilmaydi.
- POST /:id/archive — umumiy qoldiq 0 bo'lmasa HAS_STOCK.

2. Warehouses — /warehouses (faqat 2 daraja: ombor -> sub-ombor)
- GET ?includeArchived=false — daraxt: ildiz omborlar, har birida children.
- POST { name, parentId? } — parentId bo'lsa: mavjud bo'lishi, arxivlanmagan bo'lishi (aks holda ARCHIVED_ENTITY) va o'zi ildiz bo'lishi shart (aks holda INVALID_WAREHOUSE_LEVEL).
- PATCH /:id — faqat name. parentId o'zgarmaydi.
- POST /:id/archive — o'zida qoldiq bo'lsa yoki arxivlanmagan sub-ombori bo'lsa HAS_STOCK (details da sababi).

3. Counterparties — /counterparties
- GET ?includeArchived=false — ro'yxat, har birida balance = counterparty_entries.amount yig'indisi (+ u bizga qarz, − biz unga qarz).
- GET /:id
- POST { name, phone?, type: CUSTOMER | SUPPLIER | OTHER }
- PATCH /:id
- POST /:id/archive — balance 0 bo'lmasa HAS_BALANCE.
- GET /:id/entries — hisob-kitob tarixi, sana bo'yicha kamayish tartibida.

Tekshiruv:
- npm run build xatosiz
- Serverni ishga tushirib har bir endpointni HTTP orqali sina, jumladan xato holatlarini: noto'g'ri body (VALIDATION_ERROR), takror nom (DUPLICATE), 3-daraja ombor (INVALID_WAREHOUSE_LEVEL), arxivlangan ota ombor (ARCHIVED_ENTITY), mavjud bo'lmagan id (NOT_FOUND). Har birining javobini qisqa ko'rsat.
- Sinovdan keyin sinov ma'lumotlarini bazadan o'chir, baza bo'sh qolsin.

Qoidalar: komment yozma, .md fayl yaratma, git commit qilma. Yakunda: yaratilgan/o'zgartirilgan fayllar ro'yxati va tekshirilmagan qismlar.
````

### 2.3. Hujjatlar va bajarish mexanizmi (yadro)

````text
Avval kichik tuzatish: IsMoney regex'ini ^\d{1,16}(\.\d{1,2})?$ ga o'zgartir — Decimal(18,2) ga sig'maydigan qiymat 500 emas, 400 VALIDATION_ERROR qaytarsin.

7-bosqich: Savdo, Xarid, Inventarizatsiya hujjatlari va ularni bajarish. Bu loyihaning yadrosi — har bir qoidaga aniq amal qil. Mavjud StockService va naqshlardan foydalan. Kassa CRUD va hisobotlar bu bosqichda YOZILMAYDI.

UMUMIY (uchala hujjat uchun bir xil naqsh): /sales, /purchases, /inventories
- GET ?status=&from=&to= — ro'yxat (kontragent/ombor nomi, jami summa, holat)
- GET /:id — qatorlari bilan (mahsulot va ombor nomi)
- POST — qoralama yaratish
- PUT /:id — qoralamani to'liq almashtirish (qatorlar ham)
- DELETE /:id — faqat qoralama
- POST /:id/post — bajarish
- Holat DRAFT emas bo'lsa PUT/DELETE/post -> DOCUMENT_NOT_DRAFT.
- date bugundan keyin bo'lsa VALIDATION_ERROR. "Bugun" Asia/Tashkent vaqt zonasida.
- Mahsulot, ombor, kontragent mavjud va arxivlanmagan bo'lishi shart (ARCHIVED_ENTITY) — saqlashda ham, bajarishda ham.
- Summalar (amount, totalAmount) serverda hisoblanadi, klientdan olinmaydi.

QORALAMA (savdo va xarid):
Body: { date, counterpartyId?, paidAmount, note?, items: [{ productId, warehouseId, unitType: UNIT|BLOCK, quantity (Int > 0), price }] }
- items bo'sh bo'lmasin.
- amount = quantity × price; qtyInUnits = BLOCK bo'lsa quantity × unitsPerBlock, aks holda quantity.
- paidAmount ≤ totalAmount, aks holda VALIDATION_ERROR.

BAJARISH — QAT'IY QOIDALAR:
- Butun bajarish bitta interaktiv Prisma tranzaksiyasida: yo hammasi yoziladi, yo hech narsa.
- Tranzaksiya boshida ishtirok etgan mahsulot qatorlarini id tartibida SELECT ... FOR UPDATE bilan qulfla.
- Ikki marta bajarishning oldini olish: holatni DRAFT -> POSTED ga shartli yangilash (where status = DRAFT), yangilangan qator 0 bo'lsa DOCUMENT_NOT_DRAFT.
- qtyInUnits bajarishda qayta hisoblanadi.
- Tovar harakati va pul yozuvlarining date maydoni = hujjat sanasi. sourceType/sourceId to'ldiriladi.
- To'lanmagan qism (totalAmount − paidAmount > 0) bo'lsa va counterpartyId yo'q bo'lsa -> COUNTERPARTY_REQUIRED.

Kassa qoldig'i: umumiy servis yarat (keyingi bosqichda kassa moduli ham ishlatadi): balance = IN summalari − OUT summalari (cash_operations).

XARID bajarilganda:
1. Har qator: dona tannarxi = UNIT bo'lsa price, BLOCK bo'lsa price ÷ unitsPerBlock (4 xona).
2. O'rtacha tannarx har qator uchun ketma-ket: joriyQoldiq = mahsulotning BARCHA omborlardagi qoldig'i; yangiAvg = (joriyQoldiq × avgCost + qtyInUnits × donaTannarxi) ÷ (joriyQoldiq + qtyInUnits), 4 xonaga yaxlitlanadi; products.avgCost yangilanadi.
3. stock_movements: +qtyInUnits, unitCost = dona tannarxi.
4. paidAmount > 0: kassa qoldig'i < paidAmount bo'lsa INSUFFICIENT_CASH; aks holda cash_operations: OUT, PURCHASE_PAYMENT, kontragent, sourceType PURCHASE.
5. To'lanmagan qism > 0: counterparty_entries: −(totalAmount − paidAmount), sourceType PURCHASE.

SAVDO bajarilganda:
1. Qatorlarni (productId, warehouseId) bo'yicha guruhla va har guruh uchun SHU ombordagi qoldiqni tekshir. Yetmasa INSUFFICIENT_STOCK, details.items da barcha yetmaganlar: productId, productName, warehouseId, warehouseName, available, requested.
2. Har qator: unitCost = mahsulotning joriy avgCost (shu paytda qotiriladi); costAmount = qtyInUnits × unitCost (2 xona). sales.totalCost = yig'indi.
3. stock_movements: −qtyInUnits, unitCost.
4. paidAmount > 0: cash_operations: IN, SALE_PAYMENT, sourceType SALE.
5. To'lanmagan qism > 0: counterparty_entries: +(totalAmount − paidAmount), sourceType SALE.
Savdo avgCost'ni o'zgartirmaydi.

INVENTARIZATSIYA:
Body: { date, type: REGULAR|OPENING, warehouseId, note?, items: [{ productId, countedQty (Int ≥ 0), unitCost? }] }
- Bitta hujjatda mahsulot takrorlanmaydi. Faqat ko'rsatilgan ombor (sub-omborlari hisobga olinmaydi). Ro'yxatga kirmagan mahsulotlar o'zgarmaydi.
- OPENING: har qatorda unitCost majburiy (≥ 0). REGULAR: unitCost kiritilmaydi.
Bajarilganda har qator:
- expectedQty = shu ombordagi joriy qoldiq; diffQty = countedQty − expectedQty.
- OPENING: expectedQty ≠ 0 bo'lsa OPENING_STOCK_EXISTS. Harakat: +countedQty, kiritilgan unitCost bilan. avgCost xariddagi formula bilan yangilanadi (joriyQoldiq — barcha omborlar bo'yicha). diffAmount = countedQty × unitCost.
- REGULAR: unitCost = joriy avgCost; diffAmount = diffQty × unitCost (2 xona); diffQty ≠ 0 bo'lsa harakat diffQty bilan. avgCost o'zgarmaydi.
- inventories.totalDiffAmount = diffAmount yig'indisi.

TEKSHIRUV — server ishga tushirilib HTTP orqali quyidagi ssenariy. Kassa API hali yo'q, shuning uchun 1-qadamdagi yozuvni to'g'ridan-to'g'ri bazaga kirit.
Ma'lumot: mahsulot "Cola 1.5L", unitsPerBlock 6, salePriceUnit 12000, salePriceBlock 66000. Ombor "Asosiy" -> sub-omborlar "Zaxira", "Sovutgich". Kontragentlar "Ulgurji" (SUPPLIER), "Ali" (CUSTOMER).
1. cash_operations: IN, OPENING_BALANCE, 2000000.
2. OPENING inventarizatsiya, Zaxira: Cola countedQty 12, unitCost 7800 -> bajar.
3. Xarid Ulgurji'dan: Zaxira, BLOCK, 10, price 54000, paidAmount 300000 -> bajar.
4. Savdo Ali'ga: Zaxira, BLOCK 5 × 66000 va UNIT 3 × 12000, paidAmount 200000 -> bajar.
5. REGULAR inventarizatsiya, Zaxira: Cola countedQty 37 -> bajar.
Kutilgan natijalar (har birini haqiqiy natija bilan yonma-yon ko'rsat):
- 3-qadamdan keyin avgCost = 8800.0000
- savdo totalAmount = 366000.00, totalCost = 290400.00
- 5-qadam: expectedQty 39, diffQty −2, diffAmount −17600.00
- Zaxira qoldig'i 37 = { units 37, blocks 6, remainder 1 }, Sovutgich 0
- Kassa qoldig'i 1900000.00
- Kontragent balance: Ulgurji −240000.00, Ali +166000.00
Xato holatlari ham sinalsin: qayta bajarish (DOCUMENT_NOT_DRAFT), qoldiqdan ko'p savdo (INSUFFICIENT_STOCK), kassadan ko'p to'langan xarid (INSUFFICIENT_CASH), shu omborga ikkinchi OPENING (OPENING_STOCK_EXISTS), kontragentsiz nasiya savdo (COUNTERPARTY_REQUIRED), bajarilgan hujjatni o'chirish (DOCUMENT_NOT_DRAFT).
Biror kutilgan natija mos kelmasa — TO'XTA, farqni ko'rsat, o'zing "tuzatib" raqamni moslashtirma.
Sinovdan keyin barcha sinov ma'lumotlarini o'chir, baza bo'sh qolsin.

Qoidalar: komment yozma, .md fayl yaratma, git commit qilma. Yakunda: fayllar ro'yxati, npm run build natijasi, tekshirilmagan qismlar.
````

### 2.4. Kassa, hisobotlar va to'liq ssenariy

````text
8–10-bosqichlar: kassa moduli, hisobotlar va to'liq ssenariy sinovi. Mavjud CashService (lock() va balans), StockService va naqshlardan foydalan.

0. AVVAL TUZATISH
- Barcha @db.Date maydonlar (date) javobda "YYYY-MM-DD" ko'rinishida chiqsin, global darajada. postedAt, createdAt, updatedAt — ISO bo'lib qoladi.

1. KASSA — /cash
Turkumlar metama'lumoti bitta joyda (kod konstantasi) va mobile uchun endpoint orqali beriladi.
GET /cash/categories -> [{ code, direction, label, manual, requiresCounterparty, affectsPnl, counterpartyEffect }]
code | direction | label | manual | requiresCounterparty | affectsPnl | counterpartyEffect
SALE_PAYMENT | IN | Savdo tushumi | false | false | false | null
CUSTOMER_DEBT_PAYMENT | IN | Mijoz nasiyani to'ladi | true | true | false | -
LOAN_RETURNED | IN | Berilgan qarz qaytdi | true | true | false | -
LOAN_TAKEN | IN | Qarz oldik | true | true | false | -
OTHER_INCOME | IN | Boshqa daromad | true | false | true | null
OPENING_BALANCE | IN | Boshlang'ich qoldiq | true | false | false | null
PURCHASE_PAYMENT | OUT | Xarid to'lovi | false | false | false | null
SUPPLIER_PAYMENT | OUT | Yetkazib beruvchiga to'lov | true | true | false | +
LOAN_GIVEN | OUT | Qarz berdik | true | true | false | +
LOAN_REPAID | OUT | Olgan qarzni to'ladik | true | true | false | +
EXPENSE_TRANSPORT | OUT | Yo'l kira | true | false | true | null
EXPENSE_RENT | OUT | Ijara | true | false | true | null
EXPENSE_OTHER | OUT | Boshqa xarajat | true | false | true | null
OWNER_WITHDRAWAL | OUT | Egasi olgan pul | true | false | false | null

POST /cash/operations { date, category, amount (> 0), counterpartyId?, note? }
- direction klientdan olinmaydi, turkumdan aniqlanadi.
- manual = false turkumlar (SALE_PAYMENT, PURCHASE_PAYMENT) qo'lda kiritilmaydi -> VALIDATION_ERROR.
- requiresCounterparty = true bo'lsa kontragent majburiy (COUNTERPARTY_REQUIRED), mavjud va arxivlanmagan bo'lishi shart. Boshqa turkumlarda counterpartyId berilsa VALIDATION_ERROR.
- date: kelajak emas (Asia/Tashkent).
- Hammasi bitta tranzaksiyada, CashService.lock() bilan; kontragent bo'lsa uning qatori FOR UPDATE.
- OUT: kassa qoldig'i < amount -> INSUFFICIENT_CASH.
- Ortiqcha to'lov (OVERPAYMENT), kontragent balansi bo'yicha:
  CUSTOMER_DEBT_PAYMENT, LOAN_RETURNED: amount > balance bo'lsa (balance ≤ 0 holati ham) -> OVERPAYMENT.
  SUPPLIER_PAYMENT, LOAN_REPAID: amount > −balance bo'lsa -> OVERPAYMENT.
  LOAN_GIVEN, LOAN_TAKEN cheklanmaydi.
  details: { balance, amount }.
- counterpartyEffect bo'lsa counterparty_entries: + yoki − amount, sourceType CASH.
Kassa operatsiyalari o'zgarmas: PUT/PATCH/DELETE yo'q.

GET /cash/operations ?from=&to=&category= — sana va id bo'yicha kamayish tartibida, kontragent nomi va turkum label bilan.
GET /cash/balance -> { balance }

2. HISOBOTLAR — /reports (from/to ixtiyoriy, berilmasa butun davr; from > to bo'lsa VALIDATION_ERROR; faqat POSTED hujjatlar; davr hujjat sanasi bo'yicha)

GET /reports/stock ?warehouseId=
- Arxivlanmagan har bir mahsulot: { productId, name, unitsPerBlock, avgCost, total: {units, blocks, remainder}, stockValue (total.units × avgCost, 2 xona), locations: [{ warehouseId, warehouseName, parentId, parentName, qty: {units, blocks, remainder} }] } — locations da faqat qoldig'i 0 bo'lmaganlar.
- warehouseId ildiz ombor bo'lsa: o'zi + sub-omborlari; sub-ombor bo'lsa faqat o'zi. Shu holda total ham shu filtr bo'yicha.
- Umumiy: { items, totalStockValue }.

GET /reports/sales ?from=&to=
- summary: { count, revenue, cost, grossProfit, paid, unpaid }
- byProduct: [{ productId, name, qty: {units, blocks, remainder}, revenue, cost, grossProfit }] — revenue bo'yicha kamayish
- documents: [{ id, date, counterpartyName, totalAmount, paidAmount, unpaid }]

GET /reports/pnl ?from=&to=
{
  revenue,            // POSTED savdolar totalAmount
  cogs,               // POSTED savdolar totalCost
  grossProfit,        // revenue − cogs
  otherIncome,        // OTHER_INCOME
  expenses: { transport, rent, other, total },
  inventoryDiff: { shortage, surplus, total },   // faqat REGULAR inventarizatsiyalar diffAmount; shortage manfiy yig'indi, surplus musbat
  netProfit,          // grossProfit + otherIncome − expenses.total + inventoryDiff.total
  excludedFromPnl: { customerDebtPayments, loansReturned, loansTaken, loansGiven, loansRepaid, supplierPayments, ownerWithdrawals, openingBalance, openingStockValue }
}
excludedFromPnl — faqat ma'lumot uchun: bu summalar P&L ga KIRMAYDI. openingStockValue = OPENING inventarizatsiyalar totalDiffAmount.

3. TO'LIQ SSENARIY — faqat HTTP API orqali, bazaga to'g'ridan-to'g'ri yozmasdan
Avval bazani tozala (TRUNCATE ... RESTART IDENTITY).
Ma'lumot: "Cola 1.5L" (unitsPerBlock 6, salePriceUnit 12000, salePriceBlock 66000). Ombor "Asosiy" -> "Zaxira", "Sovutgich". Kontragentlar: "Ulgurji" SUPPLIER, "Ali" CUSTOMER, "Vali" OTHER, "Sardor" OTHER.
1. Kassa OPENING_BALANCE 2000000
2. OPENING inventarizatsiya Zaxira: Cola 12, unitCost 7800 -> bajar
3. Xarid Ulgurji: Zaxira BLOCK 10 × 54000, paid 300000 -> bajar
4. Savdo Ali: Zaxira BLOCK 5 × 66000 + UNIT 3 × 12000, paid 200000. Avval boshqa qatorlar bilan qoralama yarat, PUT bilan shu qatorlarga almashtir (PUT muvaffaqiyatli yo'lini sinash), keyin bajar
5. CUSTOMER_DEBT_PAYMENT Ali 100000
6. LOAN_GIVEN Vali 300000
7. LOAN_TAKEN Sardor 500000
8. EXPENSE_TRANSPORT 40000
9. REGULAR inventarizatsiya Zaxira: Cola 37 -> bajar
10. OWNER_WITHDRAWAL 100000

Kutilgan natijalar (har birini haqiqiy bilan yonma-yon jadvalda ko'rsat):
- P&L: revenue 366000.00, cogs 290400.00, grossProfit 75600.00, otherIncome 0.00, expenses.total 40000.00, inventoryDiff.total −17600.00, netProfit 18000.00
- excludedFromPnl: customerDebtPayments 100000.00, loansGiven 300000.00, loansTaken 500000.00, ownerWithdrawals 100000.00, openingBalance 2000000.00, openingStockValue 93600.00
- Kassa qoldig'i: 2060000.00
- Kontragent balanslari: Ali 66000.00, Vali 300000.00, Ulgurji −240000.00, Sardor −500000.00
- Stock: Cola total {37, 6, 1}, Zaxira 37, Sovutgich ro'yxatda yo'q, stockValue 325600.00; warehouseId=Asosiy filtri bilan ham total 37
- Sales: count 1, revenue 366000.00, cost 290400.00, grossProfit 75600.00, paid 200000.00, unpaid 166000.00
- Barcha date maydonlar "YYYY-MM-DD"

Xato holatlari (natijalarni o'zgartirmasligi tekshirilsin):
- Ali'dan 70000 CUSTOMER_DEBT_PAYMENT -> OVERPAYMENT
- Sardor'ga 600000 LOAN_REPAID -> OVERPAYMENT
- 3000000 EXPENSE_OTHER -> INSUFFICIENT_CASH
- Kontragentsiz LOAN_GIVEN -> COUNTERPARTY_REQUIRED
- Qo'lda SALE_PAYMENT -> VALIDATION_ERROR
- EXPENSE_TRANSPORT ga counterpartyId -> VALIDATION_ERROR
- from > to hisobotda -> VALIDATION_ERROR

Biror kutilgan natija mos kelmasa — TO'XTA va farqni ko'rsat, raqamni moslashtirib "tuzatma".
Sinovdan keyin bazani TOZALAMA — ssenariy ma'lumotlari mobile ishlab chiqish uchun qoladi. Faqat xato sinovlarida qolib ketgan qoralama hujjatlar bo'lsa, ularni o'chir.

Qoidalar: komment yozma, .md fayl yaratma, git commit qilma. Yakunda: fayllar ro'yxati, npm run build natijasi, tekshirilmagan qismlar.
````

### 2.5. Sinov va demo ma'lumotlarni repo'ga ko'chirish

````text
10-bosqich yakuni: sinov va demo ma'lumotlarni repo ichiga ko'chirish.

1. scratchpad dagi full-scenario.mjs ni repo ichiga ko'chir: scripts/scenario-test.mjs. U ishlayotgan serverga HTTP orqali ulanadi (API_URL muhit o'zgaruvchisi, standart http://localhost:3000/api), bazani tozalaydi, to'liq ssenariyni va xato holatlarini o'tkazadi, kutilgan/haqiqiy jadvalni chiqaradi va biror mos kelmaslik bo'lsa exit code 1 bilan tugaydi.
   Bazani tozalashdan oldin xavfsizlik: CONFIRM_RESET=yes muhit o'zgaruvchisi bo'lmasa ishlamasin va sababini aytsin.
2. Unga qo'shimcha sinovlar qo'sh (raqamlar qo'lda tekshirilsin):
   - inventarizatsiya ortiqchasi: alohida mahsulotda surplus, P&L dagi inventoryDiff.surplus musbat chiqishi
   - OTHER_INCOME, EXPENSE_RENT, SUPPLIER_PAYMENT, LOAN_RETURNED, LOAN_REPAID muvaffaqiyatli yo'llari va ularning P&L hamda kontragent balansiga ta'siri
   Yakuniy asosiy ssenariy raqamlari o'zgarmasligi uchun bu qo'shimcha sinovlarni ssenariy tekshiruvidan KEYIN, alohida bo'lim qilib o'tkaz.
3. scripts/seed-demo.mjs: bazani tozalaydi va faqat asosiy 10 qadamli ssenariyni (xato sinovlarisiz, qo'shimcha sinovlarsiz) API orqali yuklaydi. Xuddi shu CONFIRM_RESET=yes himoyasi.
4. package.json ga: "test:scenario" va "seed:demo" skriptlari.
5. Tekshiruv: server ishlab turganda test:scenario ni ishga tushir — hammasi o'tishi kerak. So'ng seed:demo ni ishga tushir — baza asosiy ssenariy holatida qolsin (mobile uchun). Ikkalasining natijasini ko'rsat.
6. Serverni to'xtat.

Qoidalar: komment yozma, .md yaratma, git commit qilma. Yakunda fayllar ro'yxati.
````

### 2.6. Dokumentatsiya

Bu prompt mobile sessiyasiga yuborilgan, fayllar backend repo'ning `docs/` papkasiga yozilgan.

````text
18-bosqich: dokumentatsiya. Ruxsat berildi: docs/ papkasida faqat ikkita .md fayl yarat — docs/ARCHITECTURE.md va docs/USER_GUIDE.md. Til: o'zbekcha (lotin). Mobile ilova kodi D:\projects\mini-erp-mobile da — kerak bo'lsa faqat o'qi, o'zgartirma.
Faktlarni faqat kod va scripts/scenario-test.mjs dan ol. Kodda yo'q narsani yozma. Ulanish satri yoki parol hech qayerga yozilmasin.

ARCHITECTURE.md — "Loyiha nega aynan shunday qurilgan":
1. Umumiy ko'rinish: Flutter Android -> REST -> NestJS -> PostgreSQL (Neon). Stack va har birini tanlash sababi qisqa.
2. TZ dagi 3 muammo va yechimi: qoldiq dona/blokda, sof foyda, mahsulot joylashuvi.
3. Asosiy qarorlar, har biri "Qaror / Nega / Muqobil va nega rad etildi" ko'rinishida:
   - qoldiq harakatlar jurnalidan (stock_movements) hisoblanadi, maydonda saqlanmaydi
   - faqat dona saqlanadi, blok — ko'rinish
   - DRAFT -> POSTED, bitta tranzaksiya, FOR UPDATE qulflar, ikki marta bajarish himoyasi
   - harakatlanuvchi o'rtacha tannarx (FIFO emas)
   - P&L kassadan o'qilmaydi: 14 kassa turkumi jadvali (yo'nalish, P&L ta'siri, kontragent ta'siri)
   - nasiya va qarz: kontragent hisob-kitob jurnali va ishora qoidasi
   - ortiqcha to'lov rad etiladi, kassa manfiy bo'lmaydi
   - boshlang'ich qoldiq (OPENING inventarizatsiya, OPENING_BALANCE) — soxta foydaning oldini olish
   - inventarizatsiya farqi P&L da ikki tomonlama
   - pul Decimal, API da string
   - 2 darajali ombor, arxivlash qoidalari
   - xato formati va barcha kodlar jadvali
4. P&L formulasi va "foydaga kirmagan harakatlar" bloki.
5. Isbot: 10 qadamli ssenariy jadvali, kutilgan natijalar, npm run test:scenario. Qarzni foydaga qo'shadigan tizim shu ssenariyda qanday noto'g'ri natija ko'rsatishini raqam bilan izohla.
6. Mobile arxitektura: feature-first, Cubit, dio interceptor va xato kodlari, Decimal.
7. Ataylab scope'dan tashqarida qoldirilganlar: omborlar orasida ko'chirish, bajarilgan hujjatni bekor qilish, login, sahifalash — sababi bilan.

USER_GUIDE.md — do'kon egasi uchun, texnik so'zlarsiz:
1. Ilova tablari.
2. Birinchi qadamlar: omborlar, mahsulotlar, kontragentlar, boshlang'ich qoldiq (tovar — Boshlang'ich inventarizatsiya, pul — Kassa "Boshlang'ich qoldiq").
3. Xarid, Savdo (qoralama -> bajarish, to'langan summa, nasiya), Inventarizatsiya.
4. Kassa: qaysi holatda qaysi turkum — jadval.
5. Hisobotlarni o'qish: sof foyda va kassa qoldig'i nega farq qiladi (ssenariy misolida), foydaga kirmagan harakatlar.
6. Ko'p uchraydigan xato xabarlari va nima qilish kerak.

Kodni o'zgartirma, git commit qilma. Yakunda ikki faylning bo'limlari ro'yxati.
````

---

## 3-qism. Mobile — Claude Code (Sonnet)

Papka: `D:\projects\mini-erp-mobile`

### 3.1. Skelet, Ombor va Kontragentlar

````text
Ichimliklar do'koni mini-ERP uchun Flutter Android ilova. Backend NestJS, D:\projects\mini-erp-backend da — API uchun yagona haqiqat manbai shu backend kodi (controller va DTO fayllari). Uni faqat O'QI, hech narsa o'zgartirma. Taxmin qilma: har bir endpoint, maydon nomi va xato kodini backend kodidan tekshir.

Flutter: D:\dev-tools\flutter_sdk\bin\flutter.bat. Muhit: Windows, PowerShell, && ishlatma.

1. Loyiha
- Joriy papkada: flutter create --org uz.muzakov --project-name mini_erp_mobile --platforms android .
- Paketlar (flutter pub add bilan, mos oxirgi versiyalar): flutter_bloc, equatable, dio, get_it, go_router, decimal, intl.
- AndroidManifest: INTERNET ruxsati (main manifest'da) va android:usesCleartextTraffic="true" — backend lokal HTTP.
- API manzili: --dart-define=API_BASE_URL bilan beriladi, masalan http://192.168.1.10:3000/api. Berilmasa ilova ochilishida tushunarli xato ko'rsatsin.
- UI tili: o'zbekcha (lotin). Material 3, standart widgetlar, oddiy toza ko'rinish. Alohida dizayn yo'q.

2. Arxitektura (feature-first)
lib/core: network (dio client), xatolar, formatlash, umumiy widgetlar, DI (get_it), router.
lib/features/<feature>/data (modellar, repository) va presentation (cubit, sahifalar). Holat boshqaruvi — Cubit.

3. Core
- Backend xato formati: { statusCode, code, message, details }. Dio interceptor uni AppFailure(code, message, details) ga o'giradi. Har kod uchun o'zbekcha foydalanuvchi xabari: VALIDATION_ERROR, NOT_FOUND, DUPLICATE, REFERENCE_ERROR, DOCUMENT_NOT_DRAFT, INSUFFICIENT_STOCK, INSUFFICIENT_CASH, OVERPAYMENT, COUNTERPARTY_REQUIRED, OPENING_STOCK_EXISTS, INVALID_WAREHOUSE_LEVEL, HAS_STOCK, HAS_BALANCE, ARCHIVED_ENTITY. Tarmoq xatosi (server o'chiq) — alohida tushunarli xabar.
- Pul va tannarx backenddan string keladi — Decimal ga o'gir, hech qachon double ishlatma. Backendga string yuboriladi.
- Formatlash: pul "366 000 so'm" (kasr bo'lsa 2 xona), sana API da "YYYY-MM-DD", ekranda dd.MM.yyyy.
- Qoldiq widget'i: { units, blocks, remainder } -> "37 dona · 6 blok + 1 dona".
- Umumiy widgetlar: yuklanish, xato + qayta urinish tugmasi, bo'sh holat, tasdiqlash dialogi, pul kiritish maydoni (faqat raqam va 2 xona kasr).

4. Navigatsiya
Pastki navigatsiya, 5 tab (go_router StatefulShellRoute): Hisobotlar, Hujjatlar, Kassa, Ombor, Kontragentlar. Hisobotlar, Hujjatlar, Kassa hozircha "Tez orada" placeholder.

5. Ombor tabi — ikki bo'lim (TabBar): Mahsulotlar, Omborlar
Mahsulotlar:
- Ro'yxat: nom, qoldiq (widget), dona narxi, blok narxi. Pull-to-refresh.
- Qo'shish/tahrirlash formasi: nom, blokdagi dona soni, dona narxi, blok narxi. Validatsiya.
- Arxivlash (tasdiq dialogi bilan). HAS_STOCK bo'lsa backend xabarini ko'rsat.
Omborlar:
- Daraxt: ildiz omborlar, ichida sub-omborlar (ExpansionTile).
- Ombor qo'shish; ildiz ombor ichiga sub-ombor qo'shish (sub-omborda bu tugma yo'q).
- Nomini o'zgartirish, arxivlash.

6. Kontragentlar tabi
- Ro'yxat: nom, turi, balans. Balans > 0 — yashil "Bizga qarz: X", < 0 — qizil "Biz qarzmiz: X", 0 — kulrang "Hisob-kitob yo'q". Tur bo'yicha filtr.
- Qo'shish/tahrirlash: nom, telefon, turi (Mijoz / Yetkazib beruvchi / Boshqa).
- Batafsil sahifa: balans va hisob-kitob tarixi (entries), arxivlash (HAS_BALANCE xabari bilan).

Tekshiruv:
- flutter analyze — natijani to'liq ko'rsat, 0 issue bo'lishi kerak
- flutter build apk --debug — muvaffaqiyatli
- Qurilmada ishga tushirma — buni men qilaman.

Qoidalar: komment yozma, .md fayl yaratma, git commit qilma. Yakunda: fayllar ro'yxati, analyze natijasi, tekshirilmagan qismlar.
````

### 3.2. Hujjatlar

````text
13-bosqich: Hujjatlar tabi — Savdo, Xarid, Inventarizatsiya. Mavjud core (dio client, AppFailure, Decimal, formatlash, umumiy widgetlar) va naqshlardan foydalan. API — faqat D:\projects\mini-erp-backend kodidan (o'qish uchun), taxmin qilma.

1. Hujjatlar tabi
- Yuqorida segment: Savdo | Xarid | Inventarizatsiya.
- Ro'yxat: #id, sana, kontragent (inventarizatsiyada ombor va turi), jami summa, holat chipi (Qoralama — kulrang, Bajarilgan — yashil). Holat bo'yicha filtr. Pull-to-refresh. FAB — yangi hujjat.

2. Savdo va Xarid formasi (bitta umumiy widget, farqlari parametr bilan)
- Sana (kelajak sanani tanlab bo'lmaydi), kontragent tanlash (ixtiyoriy, faqat arxivlanmaganlar).
- Qatorlar ro'yxati, "Qator qo'shish" — bottom sheet:
  mahsulot tanlash; ombor tanlash (barcha omborlar "Asosiy / Zaxira" ko'rinishida tekis ro'yxat); birlik Dona | Blok; miqdor; narx.
  Savdoda narx mahsulotdan avtomatik tushadi (Dona -> salePriceUnit, Blok -> salePriceBlock), o'zgartirsa bo'ladi. Xaridda narx qo'lda kiritiladi.
  Savdoda tanlangan ombordagi mavjud qoldiq ko'rsatiladi ("Mavjud: 37 dona · 6 blok + 1 dona") — /reports/stock dan.
- Qator summasi va jami summa jonli hisoblanadi (Decimal).
- To'langan summa maydoni + "To'liq to'landi" tugmasi. Pastda: "Nasiyaga: X" (to'lanmagan qism > 0 bo'lsa). To'lanmagan qism bor, kontragent tanlanmagan bo'lsa — ogohlantirish matni.
- Tugmalar: Saqlash (qoralama: POST yoki PUT), O'chirish (faqat qoralama, tasdiq bilan), Bajarish (tasdiq dialogida jami, to'langan, nasiya ko'rsatiladi). Bajarishdan oldin o'zgarishlar avval saqlanadi.

3. Bajarilgan hujjat — faqat o'qish ko'rinishi
- Qatorlar, jami, to'langan, nasiya. Savdoda qo'shimcha: tannarx (totalCost) va yalpi foyda.

4. Inventarizatsiya formasi
- Turi: Oddiy | Boshlang'ich, ombor tanlash, sana.
- Qatorlar: mahsulot, sanalgan miqdor (dona; yonida blokka aylantirilgan ko'rinish), Boshlang'ich turida — tannarx (majburiy).
- Bitta mahsulot ikki marta qo'shilmaydi.
- Bajarilgandan keyin har qatorda: kutilgan, sanalgan, farq (rangli), farq summasi; pastda jami farq.

5. Xatolar — backend details'ini foydalanuvchiga tushunarli ko'rsat:
- INSUFFICIENT_STOCK: har yetmagan qator — mahsulot, ombor, mavjud va so'ralgan miqdor
- INSUFFICIENT_CASH: kassa qoldig'i va kerakli summa
- COUNTERPARTY_REQUIRED, OPENING_STOCK_EXISTS, DOCUMENT_NOT_DRAFT, ARCHIVED_ENTITY — o'zbekcha xabar

Pul hech qachon double emas. Komment yozma, .md yaratma, git commit qilma.
Tekshiruv: flutter analyze — 0 issue (natijani ko'rsat), flutter build apk --debug — muvaffaqiyatli. Yakunda fayllar ro'yxati va tekshirilmagan qismlar.
Muhim: flutter build apk ni ishga tushirma — men parallel ravishda flutter run qilyapman. Faqat flutter analyze bilan tekshir.
````

### 3.3. Kassa va Hisobotlar

````text
Lokalizatsiya kerak emas, intl ni o'zgartirma.

14–15-bosqichlar: Kassa va Hisobotlar tablari. Mavjud core va naqshlardan foydalan, API faqat backend kodidan.

1. Kassa tabi
- Yuqorida kassa qoldig'i kartasi (/cash/balance).
- Operatsiyalar ro'yxati: sana, turkum label, kontragent, summa (IN yashil +, OUT qizil −). Turkum bo'yicha filtr. Pull-to-refresh.
- FAB: Kirim | Chiqim tanlovi -> forma: turkum (faqat /cash/categories dan manual=true va tanlangan direction), summa, sana, izoh. requiresCounterparty bo'lsa kontragent tanlash majburiy va tanlangan kontragentning joriy balansi ko'rsatiladi. Boshqa turkumlarda kontragent maydoni yo'q.
- Xatolar: OVERPAYMENT (balans va summa bilan), INSUFFICIENT_CASH, COUNTERPARTY_REQUIRED.
- Muvaffaqiyatli saqlangach ro'yxat va qoldiq yangilanadi.

2. Hisobotlar tabi — ilovaning BOSHLANG'ICH sahifasi bo'lsin
- Davr tanlagich: Bugun | Shu oy | Barchasi | Oraliq (sana oralig'i). P&L va savdo hisobotiga qo'llanadi.
- Kassa qoldig'i kartasi.
- P&L kartasi: savdo daromadi, tannarx, yalpi foyda, boshqa daromad, xarajatlar (yo'l kira, ijara, boshqa), inventarizatsiya farqi (kamomad, ortiqcha), SOF FOYDA (katta, musbat yashil / manfiy qizil).
- Uning ostida alohida blok "Foydaga kirmagan pul harakatlari" — excludedFromPnl ning har bir qatori o'zbekcha nom bilan va bitta izoh qatori: "Qarz, qarz qaytarish va kapital harakatlari foyda yoki zarar emas."
- "Savdo hisoboti" sahifasiga o'tish: summary (soni, daromad, tannarx, yalpi foyda, to'langan, nasiya), mahsulotlar bo'yicha (qoldiq widget formatida miqdor), hujjatlar ro'yxati (bosilsa savdo hujjati ochiladi).
- "Qoldiq hisoboti" sahifasiga o'tish: ombor filtri (Barchasi yoki har bir ombor "Asosiy / Zaxira" ko'rinishida), har mahsulot: jami qoldiq, joylashuvlar (ombor va miqdor), qiymati; pastda umumiy qiymat.

Komment yozma, .md yaratma, git commit qilma, flutter build apk ishga tushirma. Tekshiruv: flutter analyze 0 issue. Yakunda fayllar ro'yxati va tekshirilmagan qismlar.
````

### 3.4. README (ikkala repo)

````text
19-bosqich: ikkala repo uchun README.md. Ruxsat berildi: D:\projects\mini-erp-backend\README.md va D:\projects\mini-erp-mobile\README.md — faqat shu ikki fayl. Til: o'zbekcha. Faktlarni faqat kod, package.json, pubspec.yaml va docs/ dan ol. Ulanish satri yoki parol yozilmasin.

Backend README.md:
- Loyiha haqida 2–3 jumla (TZ: ichimliklar do'koni uchun mini-ERP) va mobile repo havolasi: https://github.com/muzakov02/mini-erp-mobile
- Asosiy imkoniyatlar ro'yxati qisqa.
- Stack.
- Talablar: Node.js versiyasi (package.json engines yoki ishlatilgan versiya), PostgreSQL 15+ (sababi: migratsiyada NULLS NOT DISTINCT). Lokal PostgreSQL yoki Neon kabi bulutli PostgreSQL ishlaydi.
- Ishga tushirish, PowerShell buyruqlari alohida bloklarda: npm install, .env yaratish (.env.example dan), prisma migratsiyani qo'llash (aynan loyihada ishlatilgan buyruq), npm run build, npm run start. Swagger manzili.
- Demo ma'lumotlar: npm run seed:demo. Avtomatik ssenariy sinovi: npm run test:scenario. Ikkalasi ham bazani TOZALASHI va CONFIRM_RESET=yes talab qilishi haqida aniq ogohlantirish va PowerShell'da qanday berilishi.
- Telefondan ulanish: kompyuter IP manzili, 3000-port, Windows firewall eslatmasi.
- Hujjatlar havolalari: docs/ARCHITECTURE.md, docs/USER_GUIDE.md, docs/PROMPTS.md.
- Loyiha tuzilmasi qisqa (src/ papkalari).

Mobile README.md:
- Loyiha haqida va backend repo havolasi: https://github.com/muzakov02/mini-erp-backend. Hujjatlar backend repo'ning docs/ papkasida ekanini ayt.
- Talablar: Flutter versiyasi (pubspec environment), Android.
- Ishga tushirish: flutter pub get, flutter run --dart-define=API_BASE_URL=http://<kompyuter-IP>:3000/api — telefon va kompyuter bitta Wi-Fi tarmog'ida bo'lishi kerak, emulyatorda 10.0.2.2.
- APK yig'ish buyrug'i (shu dart-define bilan).
- Ekranlar (5 tab) qisqa.
- Arxitektura qisqa: feature-first, Cubit, dio, get_it, go_router, Decimal.

Kodni o'zgartirma, git commit qilma. Yakunda ikki README bo'limlari ro'yxati.
````

---

## Izoh

Claude Code ishlash davomida so'ragan ruxsatlarga (fayl yaratish, shell buyruqlari, Prisma hujjatini o'qish) berilgan qisqa javoblar ("Yes", "tayyor") bu ro'yxatga kiritilmagan — ular yangi ko'rsatma emas, faqat tasdiq.
