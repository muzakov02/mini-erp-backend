# Mini ERP — do'kon egasi uchun qo'llanma

Bu qo'llanma ilovadan kundalik foydalanish uchun. Misollar bir xil raqamlar bilan yuritiladi, shunda hisobotlarni solishtirish oson.

## 1. Ilova tablari

Pastda beshta bo'lim bor:

| Tab | Nima uchun |
|---|---|
| **Hisobotlar** | Ilova shu yerdan ochiladi. Kassa qoldig'i, sof foyda, savdo va qoldiq hisobotlari. |
| **Hujjatlar** | Savdo, Xarid va Inventarizatsiya. Ro'yxat, yangi hujjat, holat bo'yicha saralash (Qoralama / Bajarilgan). |
| **Kassa** | Kassadagi pul va barcha kirim-chiqimlar. Yangi kirim yoki chiqim kiritish. |
| **Ombor** | Ikki bo'lim: **Mahsulotlar** (nomi, qoldig'i, narxi) va **Omborlar** (ombor va sub-omborlar). |
| **Kontragentlar** | Mijozlar, yetkazib beruvchilar va boshqalar. Kim kimga qancha qarzdor ekani ko'rinadi. |

Ro'yxatni pastga tortib qo'yib yuborsangiz, yangilanadi.

**Kontragent balansi qanday o'qiladi:**

- yashil "**Bizga qarz: X**" — kontragent sizga qarz;
- qizil "**Biz qarzmiz: X**" — siz kontragentga qarzsiz;
- kulrang "**Hisob-kitob yo'q**" — hisob teng.

## 2. Birinchi qadamlar

Ishni shu tartibda boshlang:

1. **Omborlar.** Ombor tabi → *Omborlar* → "Ombor qo'shish". Masalan, "Asosiy". Uning ichida bo'lim kerak bo'lsa, ombor qatorini oching va "Sub-ombor qo'shish" ni bosing (masalan, "Zaxira", "Sovutgich"). Sub-ombor ichida yana sub-ombor ochib bo'lmaydi. Nomni o'zgartirish va arxivlash qatorning o'ng tomonidagi menyuda.
2. **Mahsulotlar.** Ombor tabi → *Mahsulotlar* → "Mahsulot qo'shish". Kiritiladi: nomi, **blokdagi dona soni** (masalan, 6), **dona narxi** (12 000), **blok narxi** (66 000). Narxlar sotuvda avtomatik tushadi.
3. **Kontragentlar.** Kontragentlar tabi → "Kontragent qo'shish". Nomi, telefon (ixtiyoriy) va turi: Mijoz, Yetkazib beruvchi yoki Boshqa. Qarz oluvchi yoki qarz beruvchi odamlar uchun "Boshqa" ni tanlang.
4. **Boshlang'ich qoldiq** — ilovadan foydalanishni boshlagan kunda do'konda allaqachon bor narsa:
   - **Tovar.** Hujjatlar → *Inventarizatsiya* → yangi hujjat → turi **"Boshlang'ich"**. Omborni tanlang, har bir mahsulot uchun *sanalgan miqdor* (dona hisobida; yonida blokka aylantirilgani ko'rinadi) va **tannarx** (1 dona qanchaga tushgan) kiriting. "Bajarish" ni bosing. Boshlang'ich tovar faqat bir marta, o'sha omborda hali qoldig'i yo'q bo'lganda kiritiladi.
   - **Pul.** Kassa → "Yangi operatsiya" → **Kirim** → turkum **"Boshlang'ich qoldiq"** → summa.

   Boshlang'ich qoldiq foydaga qo'shilmaydi: bu allaqachon bor tovar va pul, daromad emas. Shuning uchun uni xarid yoki oddiy inventarizatsiya sifatida kiritmang.

## 3. Hujjatlar

Har bir hujjat avval **Qoralama** bo'ladi. Qoralama hech narsaga ta'sir qilmaydi: qoldiq, kassa va qarzlar o'zgarmaydi. Uni tahrirlash va o'chirish mumkin. **Bajarish** tugmasidan keyin hujjat **Bajarilgan** bo'ladi, qoldiq, kassa va qarzlar o'zgaradi va hujjatni endi o'zgartirib ham, o'chirib ham bo'lmaydi. Bajarishdan oldin ilova o'zgarishlarni o'zi saqlaydi.

### Xarid (tovar kirimi)

1. Hujjatlar → *Xarid* → "Yangi hujjat".
2. Sanani tanlang (kelajak sanani tanlab bo'lmaydi). Yetkazib beruvchini tanlang.
3. "Qator qo'shish": mahsulot, ombor, birlik (**Dona** yoki **Blok**), miqdor va narx. Xaridda narx qo'lda kiritiladi (blok tanlansa — bir blokning narxi).
4. Pastda **To'langan summa**ni kiriting. "To'liq to'landi" tugmasi jami summani qo'yadi. To'lanmagan qism **"Nasiyaga: X"** deb ko'rinadi — bu sizning yetkazib beruvchiga qarzingiz.
5. **Saqlash** (qoralama sifatida), **Bajarish** yoki **O'chirish**.

Bajarishdan oldin ilova Jami, To'langan va Nasiyaga summalarni ko'rsatib so'raydi. Bajarilganda ombor qoldig'i oshadi, to'langan pul kassadan chiqadi, nasiya qismi yetkazib beruvchi oldidagi qarzga yoziladi.

### Savdo

1. Hujjatlar → *Savdo* → "Yangi hujjat".
2. Sana va kontragent. Kontragentni tanlash ixtiyoriy, lekin **nasiya bo'lsa kontragent majburiy**.
3. "Qator qo'shish": mahsulot, ombor, Dona/Blok, miqdor. **Narx mahsulotdan o'zi tushadi** (dona yoki blok narxi), xohlasangiz o'zgartirasiz. Mahsulot va ombor tanlanganda **"Mavjud: 37 dona · 6 blok + 1 dona"** ko'rinadi. Miqdor mavjuddan ko'p bo'lsa, ogohlantirish chiqadi.
4. Qator summasi va Jami o'zi hisoblanadi.
5. **To'langan summa** ni kiriting yoki "To'liq to'landi" ni bosing. To'lanmagan qism **"Nasiyaga: X"** — mijoz sizga qarz. Kontragent tanlanmagan bo'lsa, ilova qizil matn bilan ogohlantiradi.
6. **Saqlash**, **Bajarish** yoki **O'chirish**.

Bajarilgan savdoni ochsangiz, ko'rish rejimi chiqadi: qatorlar, jami, to'langan, nasiya, shuningdek **tannarx** va **yalpi foyda**.

### Inventarizatsiya (sanash)

Ombordagi tovarni sanab chiqib, ilova bilan solishtirish uchun.

1. Hujjatlar → *Inventarizatsiya* → "Yangi hujjat".
2. Turi: **Oddiy** (haqiqiy sanash) yoki **Boshlang'ich** (2-bo'limga qarang). Sana va omborni tanlang.
3. "Qator qo'shish": mahsulot va **sanalgan miqdor** (dona). Bitta mahsulotni ikki marta qo'shib bo'lmaydi. Boshlang'ich turida har qatorga **tannarx** ham kiritiladi.
4. **Bajarish.** Ilova ombordagi qoldiqni sanalgan miqdorga tenglashtiradi.

Bajarilgach har qatorda ko'rinadi: **kutilgan** (ilova bo'yicha), **sanalgan**, **farq** (kam bo'lsa qizil, ortiq bo'lsa yashil) va farq summasi. Pastda **Jami farq**. Kamomad foydani kamaytiradi, ortiqcha oshiradi.

## 4. Kassa

Kassa tabining yuqorisida kassadagi pul turadi. Pastda barcha operatsiyalar: sana, turkum, kontragent, summa (kirim yashil "+", chiqim qizil "−"). Turkum bo'yicha saralash mumkin.

Yangi operatsiya: "Yangi operatsiya" → **Kirim** yoki **Chiqim** → turkum, summa, sana, izoh. Turkum kontragent talab qilsa, kontragentni tanlang. Shunda uning **joriy balansi** ko'rinadi.

Savdo va xarid to'lovlari kassaga o'zi tushadi (hujjat bajarilganda), ularni qo'lda kiritmang.

| Qanday holat | Turkum | Kontragent | Foydaga ta'siri | Qarzga ta'siri |
|---|---|---|---|---|
| Mijoz oldingi nasiyasini to'ladi | Kirim → **Mijoz nasiyani to'ladi** | kerak | yo'q | mijozning qarzi kamayadi |
| Berib qo'ygan qarzingiz qaytdi | Kirim → **Berilgan qarz qaytdi** | kerak | yo'q | uning qarzi kamayadi |
| Birovdan qarz oldingiz | Kirim → **Qarz oldik** | kerak | yo'q | sizning qarzingiz oshadi |
| Savdodan tashqari daromad | Kirim → **Boshqa daromad** | kerak emas | foydani oshiradi | — |
| Boshlang'ich kassa | Kirim → **Boshlang'ich qoldiq** | kerak emas | yo'q | — |
| Yetkazib beruvchiga qarzni to'ladingiz | Chiqim → **Yetkazib beruvchiga to'lov** | kerak | yo'q | sizning qarzingiz kamayadi |
| Birovga qarz berdingiz | Chiqim → **Qarz berdik** | kerak | yo'q | uning qarzi oshadi |
| Olgan qarzingizni qaytardingiz | Chiqim → **Olgan qarzni to'ladik** | kerak | yo'q | sizning qarzingiz kamayadi |
| Yo'l kira | Chiqim → **Yo'l kira** | kerak emas | foydani kamaytiradi | — |
| Ijara | Chiqim → **Ijara** | kerak emas | foydani kamaytiradi | — |
| Boshqa xarajat | Chiqim → **Boshqa xarajat** | kerak emas | foydani kamaytiradi | — |
| Egasi do'kondan pul oldi | Chiqim → **Egasi olgan pul** | kerak emas | yo'q | — |

Qoida: kontragent faqat kerak bo'lgan turkumlarda tanlanadi; boshqa turkumlarda bu maydon chiqmaydi.

## 5. Hisobotlarni o'qish

### Davr

Hisobotlar tabida yuqorida davrni tanlang: **Bugun**, **Shu oy** (oyning 1-kunidan bugungacha), **Barchasi** yoki **Oraliq** (ikki sana tanlanadi). Davr foyda hisobotiga va savdo hisobotiga qo'llanadi. Kassa qoldig'i har doim hozirgi holat.

### Sof foyda

Foyda kartasi quyidagicha o'qiladi:

```
Savdo daromadi
− Tannarx
= Yalpi foyda
+ Boshqa daromad
− Xarajatlar (yo'l kira, ijara, boshqa)
± Inventarizatsiya farqi (kamomad minus, ortiqcha plyus)
= SOF FOYDA
```

Musbat sof foyda yashil, manfiy qizil.

### Nega sof foyda va kassa qoldig'i har xil?

Misol (yuqoridagi raqamlar bilan): ilovani 2 000 000 so'm kassa va 12 dona tovar (tannarxi 93 600) bilan boshladingiz, so'ng ishlarni quyidagicha qildingiz:

- Yetkazib beruvchidan 540 000 so'mlik tovar oldingiz, 300 000 to'ladingiz, 240 000 qarz qoldi.
- Ali ismli mijozga 366 000 so'mlik tovar sotdingiz, 200 000 oldingiz, 166 000 nasiya. Keyin u 100 000 to'ladi, 66 000 qarzi qoldi.
- Birovga 300 000 qarz berdingiz, boshqasidan 500 000 qarz oldingiz.
- Yo'l kira 40 000 so'm. Egasi 100 000 so'm olgan.
- Ombor sanalganda 2 dona kam chiqdi (17 600 so'm).

Natija:

| | |
|---|---|
| **Kassa qoldig'i** | 2 000 000 + 200 000 + 100 000 − 300 000 + 500 000 − 300 000 − 40 000 − 100 000 = **2 060 000** |
| **Sof foyda** | sotuv 366 000 − tannarx 290 400 = 75 600; yo'l kira −40 000; kamomad −17 600; jami **18 000** |

Farq sabablari:

- Olingan qarz (500 000) kassaga kirdi, lekin bu sizning daromadingiz emas, qaytarishingiz kerak.
- Berilgan qarz (300 000) kassadan chiqdi, lekin xarajat emas, qaytib keladi.
- Egasi olgan pul (100 000) kassadan chiqdi, lekin do'kon xarajati emas.
- Xarid uchun to'langan pul (300 000) kassadan chiqdi; tovarning faqat sotilgan qismi tannarxga kirdi (290 400), qolgani omborda turibdi.
- Sotuvning 66 000 so'mi hali olinmagan: foydada bor, kassada yo'q.
- Kamomad (17 600) kassadan pul chiqarmaydi, lekin foydani kamaytiradi.
- Boshlang'ich kassa va boshlang'ich tovar foydaga qo'shilmaydi.

### Foydaga kirmagan pul harakatlari

Foyda kartasi ostida alohida blok bor. Unda qarz, qarz qaytarish, egasi olgan pul va boshlang'ich qoldiqlar alohida qatorlarda turadi: mijozlarning nasiya to'lovi, berilgan va olingan qarzlar, qaytarilgan qarzlar, yetkazib beruvchilarga to'lov, egasi olgan pul, boshlang'ich kassa va boshlang'ich tovar qiymati. Blok izohi: **"Qarz, qarz qaytarish va kapital harakatlari foyda yoki zarar emas."** Bu pul kassaga kirib-chiqqan, lekin foydaga ta'sir qilmagan.

### Savdo hisoboti

Hisobotlar → "Savdo hisoboti": hujjatlar soni, daromad, tannarx, yalpi foyda, to'langan va nasiya. Pastda mahsulotlar bo'yicha (nechta sotilgani, daromad, foyda) va savdo hujjatlari ro'yxati. Hujjatni bossangiz, u ochiladi.

### Qoldiq hisoboti

Hisobotlar → "Qoldiq hisoboti": ombor bo'yicha saralash (**Barchasi** yoki aniq ombor; sub-ombor "Asosiy / Zaxira" ko'rinishida). Har bir mahsulot uchun jami qoldiq, qaysi omborda qancha turgani va qiymati. Eng pastda **Umumiy qiymat**. Asosiy omborni tanlasangiz, uning sub-omborlari ham hisobga olinadi.

## 6. Ko'p uchraydigan xabarlar va nima qilish kerak

| Xabar | Ma'nosi | Nima qilish kerak |
|---|---|---|
| **Omborda mahsulot yetarli emas** va ro'yxat (mahsulot, ombor, mavjud, kerak) | Savdodagi miqdor omborda yo'q | Miqdorni kamaytiring yoki boshqa ombordan tanlang; qoldiq noto'g'ri bo'lsa, avval xaridni yoki inventarizatsiyani kiriting |
| **Kassada mablag' yetarli emas** (kassa qoldig'i va kerakli summa) | Chiqim kassadagi puldan katta | Summani kamaytiring yoki avval kirim kiriting |
| **To'lov summasi kontragent qarzidan oshib ketdi** | To'layotgan summa mavjud qarzdan katta | Kontragent balansini ko'ring, summani qarz miqdoriga tushiring |
| **To'lanmagan qism bor, kontragent tanlanishi shart** | Nasiya bor, lekin kontragent yo'q | Kontragentni tanlang yoki "To'liq to'landi" ni bosing |
| **Bu turkum uchun kontragent tanlanishi shart** | Qarz bilan bog'liq turkum | Kontragentni tanlang |
| **To'langan summa jami summadan oshmasligi kerak** | To'langan jami summadan katta | To'langan summani kamaytiring |
| **Boshlang'ich inventarizatsiya mumkin emas, qoldiq allaqachon bor** (mahsulotlar ro'yxati) | Bu omborda ular bo'yicha qoldiq bor | Boshlang'ich faqat bir marta; keyingi sanashlarni "Oddiy" turida kiriting |
| **Hujjat allaqachon bajarilgan** | Bajarilgan hujjatni o'zgartirib yoki o'chirib bo'lmaydi | Xato bo'lsa: yangi hujjat kiriting yoki inventarizatsiya bilan qoldiqni to'g'rilang |
| **Arxivlangan ... ishlatilgan, boshqasini tanlang** | Hujjatda arxivlangan mahsulot, ombor yoki kontragent bor | Boshqasini tanlang |
| **Mahsulot qoldig'i bor, arxivlab bo'lmaydi** | Qoldiqli mahsulotni arxivlab bo'lmaydi | Avval qoldiqni nolga tushiring (sotish yoki inventarizatsiya) |
| **Omborda mahsulot qoldig'i bor / faol sub-omborlar bor** | Omborni arxivlab bo'lmaydi | Qoldiqni boshqa omborga tushiring (inventarizatsiya) va sub-omborlarni avval arxivlang |
| **Kontragentda hisob-kitob qoldig'i bor, arxivlab bo'lmaydi** | Qarz hali yopilmagan | Qarzni kassa orqali yoping, so'ng arxivlang |
| **Sub-ombor ichida yana sub-ombor yaratib bo'lmaydi** | Faqat ikki daraja | Asosiy ombor ichiga qo'shing |
| **Bunday yozuv allaqachon mavjud** | Masalan, bir xil mahsulot nomi | Boshqa nom kiriting |
| **Kamida bitta qator qo'shing** / **Avval mahsulot va ombor qo'shing** | Hujjat qatorsiz bo'lmaydi | Mahsulot va omborlar mavjudligini tekshiring |
| **Serverga ulanib bo'lmadi** | Internet yoki server o'chiq | Wi-Fi ni va server ishlayotganini tekshiring, "Qayta urinish" ni bosing |
| **Server manzili berilmagan** (ilova ochilganda) | Ilova manzilsiz ishga tushirilgan | Ilovani o'rnatgan mutaxassisga murojaat qiling |
