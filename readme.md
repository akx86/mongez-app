# Mongez App - Customer MVP 🚀

تطبيق "منجز" هو منصة توصيل طلبات مبنية بأحدث تقنيات الـ Mobile Development، يهدف لتقديم تجربة مستخدم سريعة، سلسة، وقابلة للتوسع (Scalable) باستخدام معمارية نظيفة (Clean Architecture).

## 🛠️ Tech Stack (التكنولوجيا المستخدمة)

- **Framework:** React Native + Expo (SDK 51+)
- **Routing:** Expo Router (File-based routing)
- **Styling:** NativeWind v4 (Tailwind CSS) + Global CSS
- **State Management:** \* Server State: `@tanstack/react-query`
  - Client State: `Zustand` (with AsyncStorage persistence)
- **API Client:** Axios (with Interceptors for Token injection)
- **Authentication:** Firebase Auth (Phone Authentication)
- **Typography:** خط تاجوال (Tajawal)

---

## 📂 Architecture & Folder Structure

تم بناء التطبيق باستخدام مفهوم Domain-Driven Design (DDD) لفصل الـ UI عن الـ Business Logic:

mongez-app/
│
├── app/
│ ├── (tabs)/
│ │ ├── index.tsx
│ │ ├── orders.tsx
│ │ └── profile.tsx
│ ├── (auth)/ ✅ غيّرتها
│ │ ├── login.tsx
│ │ └── otp-verify.tsx ✅ بدل register (عندك OTP مش register)
│ ├── \_layout.tsx
│ └── +not-found.tsx
│
├── src/
│ ├── api/
│ │ ├── client.ts
│ │ ├── products/ ✅ تقسيم بالـ domain
│ │ │ ├── queries.ts
│ │ │ └── mutations.ts
│ │ └── orders/
│ │ ├── queries.ts
│ │ └── mutations.ts
│ │
│ ├── services/ ✅ زيادة
│ │ └── firebase.ts
│ │
│ ├── components/
│ │ ├── ui/
│ │ ├── domain/
│ │ └── layouts/
│ │
│ ├── hooks/
│ ├── store/
│ ├── types/
│ ├── utils/
│ └── constants/
│ ├── theme.ts
│ └── config.ts ⚠️ بس من .env
│
├── assets/ ✅ زيادة
│ ├── images/
│ └── icons/
│
├── .env ✅ زيادة (وفي .gitignore)
├── .env.example ✅ زيادة (للـ team)
├── app.json
├── babel.config.js
├── tailwind.config.js
└── package.json

## 🧠 Technical Decisions (القرارات الهندسية)

1. Authentication Flow (Lazy Auth / Guest Mode)
   تم تطبيق نظام "وضع الزائر". يمكن للمستخدمين تصفح التطبيق، رؤية المنتجات، وإضافتها للسلة دون الحاجة لتسجيل الدخول. يتم طلب تسجيل الدخول فقط عند تنفيذ إجراءات حساسة (Action Guard) مثل تأكيد الطلب (Checkout) أو الدخول للملف الشخصي، لزيادة نسبة الـ Conversion Rate.

2. State Management Strategy
   Auth Store: يعتمد على Firebase كـ Single Source of Truth. لا يتم عمل Persist لبيانات المستخدم محلياً لمنع تعارض الـ Tokens، ويتم الاعتماد على حالة isHydrated لإدارة التوجيه السليم.

Cart Store: يستخدم Zustand Middleware (persist) لحفظ السلة في AsyncStorage، مع تطبيق مبدأ الـ Immutability في تعديل الكميات وحماية منطقية لحذف المنتج إذا وصلت كميته لصفر.

3. API Integration & Error Handling
   تم تغليف Axios بـ Interceptors تقوم بـ:

حقن الـ Firebase ID Token تلقائياً في الـ Headers لكل طلب.

اعتراض الردود (Responses) التي تحمل كود 401 Unauthorized لتسجيل خروج المستخدم تلقائياً من التطبيق بالكامل.

إيقاف الـ Retry التلقائي في React Query لعمليات الـ Mutations لمنع تكرار الطلبات (Double Ordering).

4. Type Safety & Contracts
   تم توحيد الـ schema.types.ts ليكون مطابقاً تماماً للـ Express.js Backend (DTOs)، مع معالجة تعارضات البيانات مثل تحويل الـ Timestamp الخاص بـ Firebase Admin إلى string ليتناسب مع عمليات الـ Serialization الخاصة بـ JSON.

5. UI/UX Foundations
   التحكم اليدوي في الـ Splash Screen لضمان عدم ظهور التطبيق إلا بعد تحميل الخطوط (Tajawal) ومعرفة حالة الـ Auth لتجنب الـ UI Flickering.

إنشاء مكونات أساسية (ScreenWrapper, Button, Input) تدعم الـ SafeAreaView السليمة والتعامل مع لوحة المفاتيح بشكل ممتاز (keyboardShouldPersistTaps).

## APIs (API Routes Documentation)

1. مجموعة راوتس المصادقة والحساب (Auth & Profile)
   [POST] /api/auth/register
   الوصف: استكمال بيانات الحساب وإنشاء ملف العميل/السائق لأول مرة في قاعدة البيانات وضبط الصلاحيات (Custom Claims).

التأمين (Authentication): يتطلب حاملاً لتوكن فايربيز (Firebase ID Token) في الـ Headers (Authorization: Bearer <token>).

الـ Request Body:

JSON
{
"role": "customer", // أو "driver"
"full_name": "أحمد خالد", // لا يقل عن 3 أحرف
"address_details": { // اختياري عند التسجيل
"city": "القاهرة",
"street": "شارع التحرير",
"building": "عمارة 5",
"coordinates": { "lat": 30.044, "lng": 31.235 }
}
}
الـ Response الناجح (201 Created):

JSON
{
"success": true,
"message": "تم إنشاء الحساب وإعطاء الصلاحيات بنجاح",
"data": { "user": { ... }, "accessToken": "<token>" }
}
الأخطاء المتوقعة: 400 Bad Request (بيانات ناقصة أو اسم الحقل خطأ)، 401 Unauthorized (التوكن مفقود أو منتهي).

[POST] /api/auth/login
الوصف: تسجيل الدخول للمستخدم المسجل سابقاً وجلب بيانات ملفه الشخصي بالكامل من قسمه الخاص.

التأمين (Authentication): يتطلب (Authorization: Bearer <token>).

الـ Request Body: لا يوجد (يتم الاعتماد على التوكن المفكك).

الـ Response الناجح (200 OK):

JSON
{
"success": true,
"message": "تم تسجيل الدخول بنجاح",
"data": { // كائن الـ Customer أو Driver الكامل من Firestore
"id": "UID",
"full_name": "...",
"phone": "...",
"role": "customer",
"is_blocked": false,
"address_details": { ... }
}
}
الأخطاء المتوقعة: 403 Forbidden (حساب غير مكتمل البيانات ويجب توجيهه لشاشة الـ profile-setup)، 404 Not Found (التوكن سليم بفايربيز ولكن لا يوجد سجل في Firestore).

[PUT] /api/auth/fcm-token
الوصف: تحديث توكن الإشعارات (Push Notifications Token) للجهاز الحالي.

التأمين (Authentication): يتطلب (Authorization: Bearer <token>).

الـ Request Body:

JSON
{ "fcm_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" }
الـ Response الناجح (200 OK):

JSON
{ "success": true, "message": "تم تحديث توكن الإشعارات بنجاح" } 2. مجموعة راوتس الخرائط والعناوين (Maps & Address)
[GET] /api/maps/geocode
الوصف: تحويل إحداثيات خطوط الطول والعرض لعنوان نصي حقيقي (اسم الشارع والمحافظة) عبر جوجل مابس (Proxy آمن).

التأمين (Authentication): يتطلب (Authorization: Bearer <token>).

الـ Request Query Params: /api/maps/geocode?lat=30.0444&lng=31.2357

الـ Response الناجح (200 OK):

JSON
{
"success": true,
"data": {
"formatted_address": "ش التحرير، الدقي، قسم الدقي، الجيزة 12511، مصر",
"place_id": "ChIJ2V..."
}
}
الأخطاء المتوقعة: 404 Not Found (إحداثيات في الصحراء أو مكان غير مفسر جغرافياً).

[PUT] /api/customers/address
الوصف: حفظ أو تحديث عنوان التوصيل الأساسي في بروفايل العميل (تُستدعى في الـ Checkout).

التأمين (Authentication): يتطلب (Authorization: Bearer <token>).

الـ Request Body:

JSON
{
"city": "الجيزة",
"street": "شارع التحرير",
"building": "رقم 12",
"floor": "الدور الرابع", // اختياري
"apartment": "شقة 8", // اختياري
"coordinates": { "lat": 30.0444, "lng": 31.2357 }
}
الـ Response الناجح (200 OK):

JSON
{ "success": true, "message": "تم حفظ العنوان بنجاح", "data": { ... } } 3. مجموعة راوتس الطلبات (Orders Flow)
[POST] /api/orders
الوصف: إنشاء طلب جديد وحساب المسافة بالهافرساين وتحديد رسوم التوصيل والمجموع النهائي وتحديث حالة مجانية التوصيل في أجزاء من الملي ثانية داخل Transaction محمي.

التأمين (Authentication): يتطلب (Authorization: Bearer <token>).

الـ Request Body:

JSON
{
"vendor*id": "معرف*المطعم",
"payment*method": "cash", // أو "visa"
"items": [
{ "id": "معرف*المنتج*1", "quantity": 2 },
{ "id": "معرف*المنتج_2", "quantity": 1 }
],
"delivery_address": { // العنوان الفعلي الحالي للطلب
"city": "الجيزة",
"street": "شارع التحرير",
"building": "رقم 12",
"coordinates": { "lat": 30.0444, "lng": 31.2357 }
}
}
الـ Response الناجح (201 Created):

JSON
{
"success": true,
"message": "تم إنشاء الطلب بنجاح",
"data": { "orderId": "معرف*الطلب*الجديد" }
}
الأخطاء المتوقعة: 400 Bad Request (المنتج غير متاح، المطعم مغلق)، 403 Forbidden (الحساب محظور أو عدد الطلبات الوهمية تجاوز 3).
