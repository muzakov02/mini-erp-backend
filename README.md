# Mini ERP — backend

Ichimliklar do'koni uchun mini-ERP backend. Savdo, xarid, inventarizatsiya, kassa, kontragent hisob-kitoblari va hisobotlarni (qoldiq, savdo, foyda va zarar) REST API orqali beradi. Qoldiq dona va blokda ko'rsatiladi, sof foyda kassadan emas, bajarilgan hujjatlar va xarajatlardan hisoblanadi.

Mobile ilova (Flutter, Android): <https://github.com/muzakov02/mini-erp-mobile>

## Imkoniyatlar

- Mahsulotlar (blok va dona narxi), 2 darajali omborlar, kontragentlar (arxivlash qoidalari bilan)
- Savdo, xarid, inventarizatsiya: qoralama → bajarish
- Qoldiq harakatlar jurnalidan hisoblanadi, ombor bo'yicha ko'rinadi
- Harakatlanuvchi o'rtacha tannarx
- Kassa (14 turkum), kontragent nasiya va qarz hisobi
- Hisobotlar: foyda va zarar, savdo, qoldiq
- Pul `Decimal`, API da string; barcha xatolar bitta formatda (`statusCode`, `code`, `message`, `details`)

## Stack

- NestJS 12, TypeScript, class-validator, Swagger
- Prisma 7.10.1 (`@prisma/adapter-pg`), PostgreSQL
- Vitest (testlar), oxlint, prettier

## Talablar

- **Node.js 24** (`package.json` da `engines` yo'q; loyiha Node v24.14.0 bilan ishlab chiqilgan)
- **PostgreSQL 15+** — migratsiyada `NULLS NOT DISTINCT` ishlatilgan, u 15-versiyadan boshlab bor
- Lokal PostgreSQL yoki Neon kabi bulutli PostgreSQL ishlaydi

## Ishga tushirish

Barcha buyruqlar PowerShell uchun, loyiha papkasida bajariladi.

1. Paketlarni o'rnatish (`postinstall` Prisma klientini o'zi yaratadi):

```powershell
npm install
```

2. `.env` faylini yaratish va ichiga o'z `DATABASE_URL` ingizni yozish. Fayl gitga qo'shilmasin, parol va ulanish satrini hech kimga bermang:

```powershell
Copy-Item .env.example .env
```

3. Migratsiyalarni bazaga qo'llash:

```powershell
npx prisma migrate deploy
```

4. Yig'ish va ishga tushirish:

```powershell
npm run build
```

```powershell
npm run start
```

Server `3000` portda ishlaydi (`PORT` o'zgaruvchisi bilan o'zgartiriladi). API manzili: `http://localhost:3000/api`. Swagger hujjati: `http://localhost:3000/api/docs`.

Boshqa buyruqlar: `npm run start:dev` (kuzatuv rejimida), `npm run lint`, `npm test`, `npm run test:e2e`.

## Demo ma'lumotlar va avtomatik sinov

> **DIQQAT: bu ikki buyruq bazadagi BARCHA biznes ma'lumotni O'CHIRADI** (12 ta jadval `TRUNCATE` qilinadi) va keyin o'z ma'lumotini yozadi. Faqat sinov bazasida ishlating. `CONFIRM_RESET=yes` berilmasa, ikkalasi ham ishlamaydi.
>
> Ikkalasi ham ishlab turgan serverga so'rov yuboradi (avval `npm run start`), bazaga `.env` dagi `DATABASE_URL` orqali ulanadi. Server manzili boshqa bo'lsa, `API_URL` o'zgaruvchisini bering (standart `http://localhost:3000/api`).

PowerShell'da tasdiqni berish:

```powershell
$env:CONFIRM_RESET = "yes"
```

Demo ma'lumotni yuklash:

```powershell
npm run seed:demo
```

Avtomatik ssenariy sinovi (10 qadamli asosiy ssenariy, xato holatlari, kutilgan natijalar bilan solishtirish):

```powershell
npm run test:scenario
```

Tugagach, tasdiqni o'chirib qo'ying:

```powershell
Remove-Item Env:CONFIRM_RESET
```

## Telefondan ulanish

1. Kompyuter va telefon **bitta Wi-Fi tarmog'ida** bo'lishi kerak.
2. Kompyuterning IP manzilini aniqlang (`IPv4 Address`):

```powershell
ipconfig
```

3. Mobile ilovani `http://<kompyuter-IP>:3000/api` manzili bilan ishga tushiring (mobile repo README ga qarang).
4. Windows xavfsizlik devori (firewall) 3000-portga kirishni to'sishi mumkin. Telefon ulana olmasa, shu portga kiruvchi ulanishga ruxsat bering.

## Hujjatlar

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — loyiha nega aynan shunday qurilgan
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) — do'kon egasi uchun qo'llanma
- [docs/PROMPTS.md](docs/PROMPTS.md)

## Loyiha tuzilmasi

```
src/
  main.ts          kirish nuqtasi (prefiks /api, Swagger)
  app.module.ts    global pipe, filtr, interceptor
  common/          xato kodlari, filtr, validatsiya, Decimal serializer
  products/  warehouses/  counterparties/
  sales/  purchases/  inventories/  documents/   hujjatlar va umumiy mantiq
  cash/            kassa va turkumlar
  stock/           qoldiq hisobi
  reports/         foyda va zarar, savdo, qoldiq hisobotlari
  prisma/          Prisma xizmati
  generated/       Prisma klienti (avtomatik)
prisma/            schema.prisma, migrations/
scripts/           seed-demo.mjs, scenario-test.mjs
test/              e2e testlar
docs/              hujjatlar
```
