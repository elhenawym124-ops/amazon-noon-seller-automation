# amzain — Amazon / Noon seller automation workspace

مجلد واحد لكل شغل الرفع على أمازون ونون: الكود، بيانات الجلسات، الإعدادات، والمخرجات.
الهدف إن البروفايلات تفضل معزولة عن الكود وعن بعضها، وأي حساب يتفتح من مكان واحد.

## البنية

```
H:\amzain\
├─ profiles\                 جلسات المتصفح (ممنوع تختلط أو تتدخل في Git)
│  ├─ levelup\               حساب Level-Up  (Playwright Chromium)
│  ├─ homevista\             حساب HomeVista (Playwright Chromium)
│  └─ noon-seller\           حساب نون        (Google Chrome)
│
├─ config\accounts\          تعريف كل حساب: البروفايل، البورت، بوابة الدخول
│  ├─ levelup.json
│  ├─ homevista.json
│  └─ noon.json
│
├─ scripts\                  تشغيل وتشخيص
│  ├─ open-account.ps1       اللانشر الموحد
│  ├─ open-levelup.ps1
│  ├─ open-homevista.ps1
│  ├─ open-noon.ps1
│  └─ cdp.js                 عميل CDP سريع (اختياري)
│
├─ amz-upload\               بناء فيدات أمازون ورفعها (Level-Up + HomeVista)
│  ├─ src\                   الكود
│  ├─ config\                عدادات المنتجات
│  ├─ data\                  بيانات المتجر + merged.json
│  ├─ templates\             نماذج أمازون
│  └─ output\feeds|summaries|reports\
├─ hv-pipeline\              خط بيانات HomeVista (سكرابنج → فلترة → listings)
│  ├─ src\ config\ data\ output\
├─ noon-upload\              فيدات نون (NIS / أسعار / مخزون)
│  ├─ src\ config\ data\ output\
├─ browsers\noon-seller\     أدوات وسكريبتات نون + قوالبها
├─ sample10\                 عينة مرجعية
│
├─ docs\                     التوثيق المركزي
├─ secrets\                  credentials.txt (مستثنى من Git)
├─ archive\screenshots\      سكرين شوتس مؤرشفة
├─ logs\                     لوجات الأتمتة القديمة
├─ .gitignore
└─ README.md                 (الملف ده)
```

> `H:\amzain mina` ما زال موجودًا كـ **Junction** بيوجّه لـ `H:\amzain`، عشان كل
> المسارات القديمة المكتوبة داخل السكريبتات تفضل شغالة. بعد ما تتحدث المسارات
> في الكود نقدر نشيله.

## فتح حساب

```powershell
powershell -ExecutionPolicy Bypass -File H:\amzain\scripts\open-homevista.ps1
powershell -ExecutionPolicy Bypass -File H:\amzain\scripts\open-levelup.ps1
powershell -ExecutionPolicy Bypass -File H:\amzain\scripts\open-noon.ps1
```

كل حساب بياخد بورت CDP خاص:

| الحساب | البروفايل | CDP |
|---|---|---|
| Level-Up | `profiles\levelup` | 9443 |
| HomeVista | `profiles\homevista` | 9444 |
| Noon | `profiles\noon-seller` | 9222 |

## قواعد ثابتة

1. **حساب واحد = بروفايل واحد.** ممنوع تفتح حسابين في نفس البروفايل (خطر Linked Account).
2. **البروفايلات مش في Git ومش في مزامنة سحابية.** النسخ الاحتياطي يدوي ومشفّر.
3. **الأسرار في `secrets\` بس.** `credentials.txt` مستثنى من Git.
4. أي مسار جديد في السكريبتات يفضل **نسبي** (`__dirname` / جذر المشروع) مش `H:\...` ثابت.
5. قبل أي دفعة رفع كبيرة: افتح الحساب، اتأكد إن الجلسة شغالة، واعمل batch صغير للتجربة.

## المخرجات

كل موديول بقى مقسوم بنفس الشكل: الكود في `src\`، الإعدادات في `config\`، البيانات في `data\`،
والفيدات والتقارير في `output\`:

| الموديول | التفاصيل |
|---|---|
| `amz-upload` | `amz-upload\README.md` |
| `hv-pipeline` | `hv-pipeline\README.md` |
| `noon-upload` | `noon-upload\README.md` |

## نسخة احتياطية

آخر نسخة كاملة قبل إعادة الترتيب:

```
G:\_amzain_backup_20261120\
├─ levelup-profile\
└─ work\
```
