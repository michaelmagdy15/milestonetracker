import React, { useState, useMemo } from 'react';
import {
    Calculator,
    Lock,
    Unlock,
    Layers,
    Sliders,
    HardHat,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Search,
    Sparkles,
    Plus,
    Wrench,
    Package,
    Scale,
    Info,
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface R02WorkPackageMeta {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    division: 'Civil & Architectural' | 'MEP & Smart Systems' | 'Woodwork, Aluminum & Glass' | 'External & Landscape';
    standardItemCount: number;
    defaultWastePct: number;
}

export interface BOQLineItem {
    id: string;
    packageCode: string;
    code: string;
    titleAr: string;
    titleEn: string;
    unit: string;
    qty: number;
    directMaterialM: number; // خامات (M)
    directLaborL: number;    // مصنعيات (L)
    subcontractS: number;    // مقاول باطن / توريد وتركيب (S)
    wastePct: number;
    hasGranularPreset?: string;
    notes?: string;
}

export interface GranularAnalyzerPreset {
    id: string;
    boqCode: string;
    nameAr: string;
    nameEn: string;
    unit: string;
    // 10-11 Granular Components from Eng. Pierre's Audio Recording
    baseMaterialSupply: number;       // 1. سعر المتر التوريد الأساسي
    wastePct: number;                 // 2. نسبة الهالك % (10% - 15% غلايق وتقطيع)
    adhesiveBagPrice: number;         // 3a. سعر شكارة مادة اللصق (سيتوكس U 50 كجم)
    adhesiveBagCoverageM2: number;    // 3b. معدل فرد الشكارة بالمتر المربع
    mortarScreedCost: number;         // 3c. مونة اللياسة / فرشة الأسمنت
    sandThicknessM3PerM2: number;     // 4a. سمك رمل الرديم النظيف (م3 لكل م2)
    sandPricePerM3: number;           // 4b. سعر المتر المكعب رمل
    transportNolonPerUnit: number;    // 5. نولون نقل وتشوين للموقع
    liftingTashweenPerUnit: number;   // 6. تطليع وتشوين للدور بالونش أو العمالة
    directInstallLabor: number;       // 7. مصنعية التركيب بالصلايب والكلبسات
    miter45RatioMlPerM2: number;      // 8a. نسبة المتر الطولي شطف 45 درجة ووزرات لكل م2
    miter45RatePerMl: number;         // 8b. سعر المتر الطولي تقطيع وشطف 45 درجة
    groutAndCleaningPerUnit: number;  // 9. سقية الفواصل والتنظيف
    protectionLayersPerUnit: number;  // 10. مشمع وكرتون وجبس حماية بعد التركيب
    engineerNoteAr: string;
}

export interface SiteOverheadResource {
    id: string;
    roleAr: string;
    roleEn: string;
    count: number;
    baseMonthlyEgp: number;
    allowanceMonthlyEgp: number;
    category: 'Supervision' | 'Site Labor' | 'HSE & Safety' | 'Logistics & Fleet' | 'Utilities & Mobilization';
    descriptionAr: string;
}

export interface TenderProjectOption {
    id: string;
    code: string;
    clientName: string;
    projectNameAr: string;
    projectNameEn: string;
    location: string;
    contractNo: string;
    defaultDurationMonths: number;
    areaM2: number;
}

// ============================================================================
// 34 NEXUS R02 WORK PACKAGES (839 STANDARD ITEMS MAP)
// ============================================================================

export const NEXUS_R02_34_PACKAGES: R02WorkPackageMeta[] = [
    { id: 'PKG-01', code: 'R02-01', nameAr: 'أعمال التجهيزات والرفع المساحي والتعديلات المعمارية', nameEn: 'Site Mobilization, Survey & Demolition', division: 'Civil & Architectural', standardItemCount: 28, defaultWastePct: 5 },
    { id: 'PKG-02', code: 'R02-02', nameAr: 'أعمال الحفر والإحلال والردم الهندسي', nameEn: 'Excavation, Replacement & Backfilling', division: 'Civil & Architectural', standardItemCount: 19, defaultWastePct: 8 },
    { id: 'PKG-03', code: 'R02-03', nameAr: 'أعمال الخرسانات العادية والمسلحة والأساسات', nameEn: 'Plain & Reinforced Concrete Works', division: 'Civil & Architectural', standardItemCount: 34, defaultWastePct: 6 },
    { id: 'PKG-04', code: 'R02-04', nameAr: 'أعمال المباني والقواطيع الطوبية (أحمر وأسمنتي وخفيف)', nameEn: 'Masonry & Blockwork Partitions', division: 'Civil & Architectural', standardItemCount: 26, defaultWastePct: 8 },
    { id: 'PKG-05', code: 'R02-05', nameAr: 'أعمال العزل المائي والحراري (أسطح وحمامات وبدروم)', nameEn: 'Waterproofing & Thermal Insulation', division: 'Civil & Architectural', standardItemCount: 31, defaultWastePct: 10 },
    { id: 'PKG-06', code: 'R02-06', nameAr: 'أعمال البياض والمحارة الداخلية والخارجية (بؤج وأوتار)', nameEn: 'Internal & External Cement Plastering', division: 'Civil & Architectural', standardItemCount: 24, defaultWastePct: 10 },
    { id: 'PKG-07', code: 'R02-07', nameAr: 'أعمال الأسقف المعلقة والجبس بورد (كناوف وبيت نور)', nameEn: 'Gypsum Board & Suspended Ceilings', division: 'Civil & Architectural', standardItemCount: 38, defaultWastePct: 12 },
    { id: 'PKG-08', code: 'R02-08', nameAr: 'أعمال الكرانيش والبانوهات الجبسية والفيوتك (Orac)', nameEn: 'Moldings, Cornices & Polyurethane Futec', division: 'Civil & Architectural', standardItemCount: 22, defaultWastePct: 10 },
    { id: 'PKG-09', code: 'R02-09', nameAr: 'أعمال أرضيات وحوائط البورسلين والسيراميك', nameEn: 'Porcelain & Ceramic Flooring & Cladding', division: 'Civil & Architectural', standardItemCount: 42, defaultWastePct: 12 },
    { id: 'PKG-10', code: 'R02-10', nameAr: 'أعمال الرخام والجرانيت (أرضيات ودرج سلم وتكسيات)', nameEn: 'Marble & Granite Works & Stairs', division: 'Civil & Architectural', standardItemCount: 36, defaultWastePct: 15 },
    { id: 'PKG-11', code: 'R02-11', nameAr: 'أعمال الأرضيات الخشبية والباركيه و HDF/SPC', nameEn: 'Hardwood Parquet, HDF & SPC Flooring', division: 'Woodwork, Aluminum & Glass', standardItemCount: 21, defaultWastePct: 10 },
    { id: 'PKG-12', code: 'R02-12', nameAr: 'أعمال الدهانات الداخلية والديكورية والقطيفة (جوتن)', nameEn: 'Internal & Decorative Paints (Jotun)', division: 'Civil & Architectural', standardItemCount: 33, defaultWastePct: 8 },
    { id: 'PKG-13', code: 'R02-13', nameAr: 'أعمال دهانات الواجهات الخارجية والجرافيو والسافيتو', nameEn: 'External Facade Paints & Saveto Plaster', division: 'Civil & Architectural', standardItemCount: 18, defaultWastePct: 8 },
    { id: 'PKG-14', code: 'R02-14', nameAr: 'أعمال ورق الحائط والتكسيات الجلدية والقماشية', nameEn: 'Wallpaper & Acoustic Fabric Wall Panels', division: 'Civil & Architectural', standardItemCount: 16, defaultWastePct: 12 },
    { id: 'PKG-15', code: 'R02-15', nameAr: 'أعمال الأبواب الخشبية والحلوق والتجاليد و WPC', nameEn: 'Wooden Doors, Frames & Wall Cladding', division: 'Woodwork, Aluminum & Glass', standardItemCount: 35, defaultWastePct: 7 },
    { id: 'PKG-16', code: 'R02-16', nameAr: 'أعمال الدريسنج روم والخزائن والمطابخ الثابتة', nameEn: 'Dressing Rooms, Wardrobes & Kitchens', division: 'Woodwork, Aluminum & Glass', standardItemCount: 24, defaultWastePct: 6 },
    { id: 'PKG-17', code: 'R02-17', nameAr: 'أعمال قطاعات الألوميتال والشتر والواجهات الزجاجية', nameEn: 'Aluminum Windows, Shutters & Curtain Walls', division: 'Woodwork, Aluminum & Glass', standardItemCount: 32, defaultWastePct: 5 },
    { id: 'PKG-18', code: 'R02-18', nameAr: 'أعمال الزجاج السيكوريت وكبائن الشاور والمرايات', nameEn: 'Tempered Glass, Shower Cabins & Mirrors', division: 'Woodwork, Aluminum & Glass', standardItemCount: 23, defaultWastePct: 5 },
    { id: 'PKG-19', code: 'R02-19', nameAr: 'أعمال الكريتال والحديد المشغول والهاندريل استانلس', nameEn: 'Metalwork, Wrought Iron & Handrails', division: 'Woodwork, Aluminum & Glass', standardItemCount: 20, defaultWastePct: 6 },
    { id: 'PKG-20', code: 'R02-20', nameAr: 'أعمال تأسيس السباكة الداخلية (تغذية وصرف وعزل صوتي)', nameEn: 'Plumbing Rough-In (Supply & Drainage)', division: 'MEP & Smart Systems', standardItemCount: 39, defaultWastePct: 8 },
    { id: 'PKG-21', code: 'R02-21', nameAr: 'أعمال تشطيب السباكة والأجهزة الصحية وصناديق الطرد المدفونة', nameEn: 'Sanitary Ware, Mixers & Concealed Cisterns', division: 'MEP & Smart Systems', standardItemCount: 34, defaultWastePct: 3 },
    { id: 'PKG-22', code: 'R02-22', nameAr: 'أعمال شبكات المياه والخزانات والمضخات والفلاتر المركزية', nameEn: 'Water Tanks, Booster Pumps & Filtration', division: 'MEP & Smart Systems', standardItemCount: 18, defaultWastePct: 5 },
    { id: 'PKG-23', code: 'R02-23', nameAr: 'أعمال تأسيس الكهرباء والخراطيم والعلب ولوحات التوزيع', nameEn: 'Electrical Rough-In, Conduits & Panels', division: 'MEP & Smart Systems', standardItemCount: 44, defaultWastePct: 10 },
    { id: 'PKG-24', code: 'R02-24', nameAr: 'أعمال سحب الأسلاك والكابلات الكهربائية (السويدي)', nameEn: 'Electrical Cabling & Wiring (El-Sewedy)', division: 'MEP & Smart Systems', standardItemCount: 29, defaultWastePct: 10 },
    { id: 'PKG-25', code: 'R02-25', nameAr: 'أعمال تشطيب الكهرباء واللقم والمفاتيح والبرايز', nameEn: 'Wiring Devices, Switches & Sockets', division: 'MEP & Smart Systems', standardItemCount: 26, defaultWastePct: 3 },
    { id: 'PKG-26', code: 'R02-26', nameAr: 'أعمال وحدات الإضاءة الداخلية والخارجية والليد بروفايل', nameEn: 'Architectural Lighting, Spots & LED Profiles', division: 'MEP & Smart Systems', standardItemCount: 27, defaultWastePct: 5 },
    { id: 'PKG-27', code: 'R02-27', nameAr: 'أعمال التيار الخفيف (داتا، دش، كاميرات، إنتركوم، صوتيات)', nameEn: 'Low Current (CCTV, Data, Audio & Intercom)', division: 'MEP & Smart Systems', standardItemCount: 22, defaultWastePct: 8 },
    { id: 'PKG-28', code: 'R02-28', nameAr: 'أعمال السمارت هوم والتحكم الذكي (KNX / Wireless)', nameEn: 'Smart Home Automation Systems (KNX)', division: 'MEP & Smart Systems', standardItemCount: 16, defaultWastePct: 4 },
    { id: 'PKG-29', code: 'R02-29', nameAr: 'أعمال التكييف الكونسيلد والاسبليت وتأسيس النحاس والصاج', nameEn: 'HVAC Split, Concealed Ducts & Copper Piping', division: 'MEP & Smart Systems', standardItemCount: 29, defaultWastePct: 8 },
    { id: 'PKG-30', code: 'R02-30', nameAr: 'أعمال التدفئة المركزية وتدفئة الأرضيات والغاز الطبيعي', nameEn: 'Underfloor Heating, Boilers & Gas Piping', division: 'MEP & Smart Systems', standardItemCount: 14, defaultWastePct: 6 },
    { id: 'PKG-31', code: 'R02-31', nameAr: 'أعمال اللاندسكيب والهاردسكيب والبرجولات الخارجية', nameEn: 'Landscape, Hardscape & Pergolas', division: 'External & Landscape', standardItemCount: 25, defaultWastePct: 10 },
    { id: 'PKG-32', code: 'R02-32', nameAr: 'أعمال حمامات السباحة والنوافير والعزل والميكانيكا', nameEn: 'Swimming Pools, Water Features & MEP', division: 'External & Landscape', standardItemCount: 19, defaultWastePct: 8 },
    { id: 'PKG-33', code: 'R02-33', nameAr: 'أعمال الأسوار الخارجية والبوابات الأوتوماتيكية', nameEn: 'Boundary Walls & Automated Gates', division: 'External & Landscape', standardItemCount: 15, defaultWastePct: 7 },
    { id: 'PKG-34', code: 'R02-34', nameAr: 'أعمال النظافة النهائية والاختبارات والتسليم الابتدائي', nameEn: 'Testing, Commissioning & Final Handover', division: 'External & Landscape', standardItemCount: 14, defaultWastePct: 2 },
];

// ============================================================================
// ENG. PIERRE'S 4 DEEP UNIT RATE ANALYZER PRESETS (FROM AUDIO RECORDING)
// ============================================================================

export const PIERRE_GRANULAR_PRESETS: Record<string, GranularAnalyzerPreset> = {
    'PORCELAIN-60X120': {
        id: 'PORCELAIN-60X120',
        boqCode: 'R02-09.01',
        nameAr: 'توريد وتركيب أرضيات بورسلين 60×120 سم قطع ليزر بمادة سيتوكس U شاملة الرمل واللياسة والحماية',
        nameEn: 'Supply & Install 60×120cm Laser-Cut Porcelain Flooring with CETOX U, Sand Bed & Protection',
        unit: 'm²',
        baseMaterialSupply: 650,       // 1. سعر المتر التوريد
        wastePct: 12,                  // 2. نسبة الهالك 12% (+78 ج.م)
        adhesiveBagPrice: 280,         // 3a. شكارة سيتوكس U زنة 50 كجم = 280 ج.م
        adhesiveBagCoverageM2: 10,     // 3b. تفرد 10 م2 = 28 ج.م/م2
        mortarScreedCost: 34,          // 3c. مونة لياسة أسفل البورسلين = 34 ج.م/م2
        sandThicknessM3PerM2: 0.12,    // 4a. رمل رديم نظيف سمك 12 سم (0.12 م3/م2)
        sandPricePerM3: 350,           // 4b. سعر المتر المكعب رمل 350 ج.م = 42 ج.م/م2
        transportNolonPerUnit: 25,     // 5. نولون نقل وتشوين للموقع = 25 ج.م/م2
        liftingTashweenPerUnit: 30,    // 6. تطليع وتشوين للدور بالونش/العمالة = 30 ج.م/م2
        directInstallLabor: 180,       // 7. مصنعية التركيب بالصلايب والكلبسات = 180 ج.م/م2
        miter45RatioMlPerM2: 0.35,     // 8a. نسبة التقطيع وشطف 45 درجة ووزرات = 0.35 م.ط/م2
        miter45RatePerMl: 60,          // 8b. فئة المتر الطولي شطف 45 درجة ووزرات = 60 ج.م = 21 ج.م/م2
        groutAndCleaningPerUnit: 15,   // 9. سقية الفواصل إيبوكسي/سيتوكس والتنظيف = 15 ج.م/م2
        protectionLayersPerUnit: 22,   // 10. مشمع وكرتون وجبس حماية بعد التركيب = 22 ج.م/م2
        engineerNoteAr: 'قاعدة م. بيير: لا يصح تسعير البورسلين كـ (بلاطة + مصنعية فقط)! يجب تحميل الهالك (10-15% للغلايق)، مادة اللصق سيتوكس U، مونة اللياسة، رمل الرديم، النولون والتطليع، شطف الـ 45 درجة بالمتر الطولي، وطبقات الحماية (مشمع وكرتون وجبس) حتى التسليم.',
    },
    'KNAUF-GYPSUM': {
        id: 'KNAUF-GYPSUM',
        boqCode: 'R02-07.01',
        nameAr: 'توريد وتركيب أسقف معلقة جبس بورد كناوف ألماني بالصاج المحمل 0.6 مم والمعجون الفيبر',
        nameEn: 'Supply & Install Knauf Gypsum Board Suspended Ceiling with 0.6mm Heavy Metal Framing',
        unit: 'm²',
        baseMaterialSupply: 240,       // ألواح كناوف + صاج أوميجا وسي وأنجل وتياش
        wastePct: 12,                  // هالك التقطيع والدورانات 12%
        adhesiveBagPrice: 220,         // شكارة معجون كناوف جوينت كومباوند + شريط فيبر
        adhesiveBagCoverageM2: 11,     // 20 ج.م/م2
        mortarScreedCost: 18,          // مسامير وأكمام نحاس وفيشر وتثبيت
        sandThicknessM3PerM2: 0,
        sandPricePerM3: 0,
        transportNolonPerUnit: 15,     // نولون نقل الألواح والصاج
        liftingTashweenPerUnit: 20,    // تطليع الألواح للأدوار العليا بدون كسر
        directInstallLabor: 110,       // مصنعية تركيب الشاسيه والألواح
        miter45RatioMlPerM2: 0.4,      // بيت نور / شادو جاب بالمتر الطولي منسوب للمتر المربع
        miter45RatePerMl: 55,          // 22 ج.م/م2 فرق تشكيل بيت النور والزوايا الفريز
        groutAndCleaningPerUnit: 14,   // سحب 3 سكاكين معجون على الفواصل والصنفرة
        protectionLayersPerUnit: 8,    // سقالات داخلية ومشمع حماية الأرضيات أثناء التركيب
        engineerNoteAr: 'يشمل التحليل ألواح كناوف الأصلية، صاج ثقيل 0.6 مم، تياش مسمار 8 مم، هالك التقطيع 12%، ومصنعية تفتيح الاسبوتات ومسارات الليد بروفايل.',
    },
    'INTERNAL-PLASTER': {
        id: 'INTERNAL-PLASTER',
        boqCode: 'R02-06.01',
        nameAr: 'أعمال بياض تخشين داخلي للحوائط والأسقف على بؤج وأوتار بمونة الأسمنت والرمل والشبك الفايبر',
        nameEn: 'Internal Cement Plastering with Dots & Screeds (Boaj & Awtar), Fiber Mesh & Spatterdash',
        unit: 'm²',
        baseMaterialSupply: 52,        // أسمنت بورتلاندي عادي (محتوى 300 كجم/م3 مونة)
        wastePct: 15,                  // هالك تساقط المونة واختلاف استواء المباني 15%
        adhesiveBagPrice: 180,         // أديبوند 65 للطرطشة المسمارية + شبك فايبر وزوايا فريسبيكو
        adhesiveBagCoverageM2: 12,     // 15 ج.م/م2
        mortarScreedCost: 12,          // جبس وأسمنت للبؤج والأوتار بالخيط والميزان الليزر
        sandThicknessM3PerM2: 0.035,   // رمل حرش نظيف ملوح للطرطشة والبطانة (3.5 سم متوسط بالتربيات)
        sandPricePerM3: 350,           // 12.25 ج.م/م2
        transportNolonPerUnit: 10,     // نولون نقل الأسمنت والرمل
        liftingTashweenPerUnit: 18,    // تطليع الرمل والأسمنت وتخمير المونة
        directInstallLabor: 95,        // مصنعية طرطشة + بؤج وأوتار + ملو وتخشين وتأميم العلب
        miter45RatioMlPerM2: 0.25,     // تركيب زوايا فريسبيكو مجلفنة على الأميات والفتحات
        miter45RatePerMl: 40,          // 10 ج.م/م2
        groutAndCleaningPerUnit: 8,    // رش مياه للمعالجة لمدة 7 أيام وكحت الساقط وتنظيف الأرضية
        protectionLayersPerUnit: 5,    // حماية حلوق الألوميتال وعلب الكهرباء أثناء الطرطشة والملو
        engineerNoteAr: 'تحليل بند المحارة الهندسية على البؤج والأوتار: يراعي تربيات الحوائط غير المستوية وهالك المونة المتساقطة ومعالجة الرش بالمياه.',
    },
    'CONCEALED-CISTERN': {
        id: 'CONCEALED-CISTERN',
        boqCode: 'R02-21.02',
        nameAr: 'توريد وتركيب صندوق طرد مدفون جروهي ألماني كامل بالمرحاض المعلق والتقفيل الأسمنتي والعزل',
        nameEn: 'Supply & Install Grohe Rapid SL Concealed Cistern + Wall-Hung WC + Masonry Enclosure',
        unit: 'No (عدد)',
        baseMaterialSupply: 14500,     // شاسيه جروهي الأصلي + الضاغط + القعدة المعلقة بالسيديلي سوفت كلوز
        wastePct: 3,                   // هالك قطع التوصيل والجلب 3%
        adhesiveBagPrice: 450,         // مستلزمات عزل وتثبيت كيميائي (أنكر كيميائي + سيكا)
        adhesiveBagCoverageM2: 1,      // 450 ج.م للوحدة
        mortarScreedCost: 380,         // مباني طوب مصمت وتقفيل وتلبيش أسمنتي حول الشاسيه
        sandThicknessM3PerM2: 0.25,    // رمل ومونة تثبيت القاعدة
        sandPricePerM3: 350,           // 87.5 ج.م
        transportNolonPerUnit: 200,    // نولون نقل الأجهزة الصحية
        liftingTashweenPerUnit: 150,   // تطليع وتشوين آمن للحمام
        directInstallLabor: 1400,      // مصنعية سباك تأسيس شاسيه + تركيب المرحاض المعلق والضاغط
        miter45RatioMlPerM2: 2.5,      // شطف زوايا البورسلين 45 درجة حول جلسة الصندوق المدفون
        miter45RatePerMl: 120,         // 300 ج.م للوحدة
        groutAndCleaningPerUnit: 150,  // سيليكون مضاد للبكتيريا واختبار كبس وعدم تسريب
        protectionLayersPerUnit: 180,  // تغليف القاعدة والضاغط الكروم لحين التسليم النهائي
        engineerNoteAr: 'تسعير الصندوق المدفون لا يقتصر على الشاسيه والسباك، بل يشمل المباني المصمتة حول الشاسيه، شطف زوايا البورسلين 45 درجة للجلسة، والتغليف.',
    },
};

// ============================================================================
// INITIAL BOQ ITEMS ACROSS WORK PACKAGES (FOR C096 VILLA TENDER)
// ============================================================================

const INITIAL_BOQ_ITEMS: BOQLineItem[] = [
    {
        id: 'BOQ-01',
        packageCode: 'R02-01',
        code: 'R02-01.04',
        titleAr: 'تعديلات معمارية وتكسير حوائط مباني شاملة نقل المخلفات للمقالب العمومية',
        titleEn: 'Architectural Demolition & Debris Removal Cart-Away',
        unit: 'm²',
        qty: 85,
        directMaterialM: 15,
        directLaborL: 165,
        subcontractS: 60,
        wastePct: 5,
    },
    {
        id: 'BOQ-02',
        packageCode: 'R02-05',
        code: 'R02-05.02',
        titleAr: 'عزل مائي للحمامات والمطبخ بلفائف البيتومين المسلح ودهان سيكا توب سيل 107 بوزرة 30 سم',
        titleEn: 'Bathroom & Kitchen Waterproofing (Bitumen Membrane + SikaTop Seal 107)',
        unit: 'm²',
        qty: 68,
        directMaterialM: 295,
        directLaborL: 95,
        subcontractS: 0,
        wastePct: 10,
    },
    {
        id: 'BOQ-03',
        packageCode: 'R02-06',
        code: 'R02-06.01',
        titleAr: 'أعمال بياض تخشين داخلي للحوائط والأسقف على بؤج وأوتار بمونة الأسمنت والرمل والشبك الفايبر',
        titleEn: 'Internal Cement Plastering with Dots & Screeds (Boaj & Awtar)',
        unit: 'm²',
        qty: 640,
        directMaterialM: 109.05,
        directLaborL: 128,
        subcontractS: 0,
        wastePct: 15,
        hasGranularPreset: 'INTERNAL-PLASTER',
    },
    {
        id: 'BOQ-04',
        packageCode: 'R02-07',
        code: 'R02-07.01',
        titleAr: 'توريد وتركيب أسقف معلقة جبس بورد كناوف ألماني بالصاج المحمل 0.6 مم والمعجون الفيبر',
        titleEn: 'Supply & Install Knauf Gypsum Board Suspended Ceiling (0.6mm Framing)',
        unit: 'm²',
        qty: 290,
        directMaterialM: 314.8,
        directLaborL: 181,
        subcontractS: 0,
        wastePct: 12,
        hasGranularPreset: 'KNAUF-GYPSUM',
    },
    {
        id: 'BOQ-05',
        packageCode: 'R02-09',
        code: 'R02-09.01',
        titleAr: 'توريد وتركيب أرضيات بورسلين 60×120 سم قطع ليزر بمادة سيتوكس U شاملة الرمل واللياسة والحماية',
        titleEn: 'Supply & Install 60×120cm Laser-Cut Porcelain Flooring with CETOX U & Protection',
        unit: 'm²',
        qty: 245,
        directMaterialM: 854,
        directLaborL: 271,
        subcontractS: 0,
        wastePct: 12,
        hasGranularPreset: 'PORCELAIN-60X120',
    },
    {
        id: 'BOQ-06',
        packageCode: 'R02-10',
        code: 'R02-10.03',
        titleAr: 'توريد وتركيب درج سلم رخام امبرادور إسباني نائم 4 سم وقائم 2 سم بالتلميع والحماية',
        titleEn: 'Spanish Emperador Marble Stair Treads (4cm) & Risers (2cm) with Polishing',
        unit: 'm.l',
        qty: 42,
        directMaterialM: 1650,
        directLaborL: 380,
        subcontractS: 0,
        wastePct: 15,
    },
    {
        id: 'BOQ-07',
        packageCode: 'R02-12',
        code: 'R02-12.01',
        titleAr: 'أعمال دهانات حوائط وأسقف جوتن فينوماستيك مذهل (سيلر + 3 سكاكين معجون + بطانة + 2 وش نهائي)',
        titleEn: 'Jotun Fenomastic Wonderwall Paint System (Sealer + 3 Putty Coats + 2 Topcoats)',
        unit: 'm²',
        qty: 780,
        directMaterialM: 98,
        directLaborL: 85,
        subcontractS: 0,
        wastePct: 8,
    },
    {
        id: 'BOQ-08',
        packageCode: 'R02-15',
        code: 'R02-15.02',
        titleAr: 'توريد وتركيب أبواب داخلية قشرة جوز طبيعي شاملة الحلق الصنوبر والكالون المغناطيسي والدهان الأستر',
        titleEn: 'Natural Walnut Veneer Internal Doors with Magnetic Locks & PU Finish',
        unit: 'No (عدد)',
        qty: 14,
        directMaterialM: 0,
        directLaborL: 850,
        subcontractS: 11500,
        wastePct: 5,
    },
    {
        id: 'BOQ-09',
        packageCode: 'R02-17',
        code: 'R02-17.01',
        titleAr: 'توريد وتركيب شبابيك ألوميتال قطاع جامبو PS دبل جلاس 24 مم عاكس للصوت والحرارة بالشتر الأوتوماتيك',
        titleEn: 'Heavy-Duty Aluminum Double-Glazed Windows with Motorized Somfy Shutters',
        unit: 'm²',
        qty: 56,
        directMaterialM: 0,
        directLaborL: 0,
        subcontractS: 6800,
        wastePct: 5,
    },
    {
        id: 'BOQ-10',
        packageCode: 'R02-20',
        code: 'R02-20.01',
        titleAr: 'تأسيس شبكة تغذية وصرف لحمام رئيسي كامل بمواسير بانينجر ألماني وصرف كاسيل معزول صوتياً',
        titleEn: 'Master Bathroom Plumbing Rough-In (Banninger PPR & Acoustic Drainage)',
        unit: 'Set (طقم)',
        qty: 4,
        directMaterialM: 14200,
        directLaborL: 5500,
        subcontractS: 0,
        wastePct: 8,
    },
    {
        id: 'BOQ-11',
        packageCode: 'R02-21',
        code: 'R02-21.02',
        titleAr: 'توريد وتركيب صندوق طرد مدفون جروهي ألماني كامل بالمرحاض المعلق والتقفيل الأسمنتي والعزل',
        titleEn: 'Supply & Install Grohe Rapid SL Concealed Cistern + Wall-Hung WC',
        unit: 'No (عدد)',
        qty: 4,
        directMaterialM: 15852.5,
        directLaborL: 2380,
        subcontractS: 0,
        wastePct: 3,
        hasGranularPreset: 'CONCEALED-CISTERN',
    },
    {
        id: 'BOQ-12',
        packageCode: 'R02-24',
        code: 'R02-24.01',
        titleAr: 'توريد وسحب أسلاك وكابلات السويدي المعتمدة للإنارة والبرايز والتكييفات ولوحات التوزيع الفرعية',
        titleEn: 'El-Sewedy Copper Wiring & Cabling for Lighting, Power & HVAC Feeds',
        unit: 'L.S (مقطوعية)',
        qty: 1,
        directMaterialM: 168000,
        directLaborL: 46000,
        subcontractS: 0,
        wastePct: 10,
    },
    {
        id: 'BOQ-13',
        packageCode: 'R02-29',
        code: 'R02-29.01',
        titleAr: 'تأسيس وتوريد وتركيب نظام تكييف كونسيلد كاريير للريسبشن شاملة الصاج المجلفن والعزل والجريلات الطولية',
        titleEn: 'Carrier Concealed Ducted HVAC System with GI Ducting, Insulation & Linear Grilles',
        unit: 'Sys (نظام)',
        qty: 2,
        directMaterialM: 18500,
        directLaborL: 9500,
        subcontractS: 84000,
        wastePct: 8,
    },
];

// ============================================================================
// INITIAL SITE OVERHEAD RESOURCES (ENG. PIERRE'S AUDIO BREAKDOWN)
// ============================================================================

const INITIAL_SITE_OVERHEADS: SiteOverheadResource[] = [
    {
        id: 'OVH-01',
        roleAr: 'مهندس موقع مقيم (Site Engineer)',
        roleEn: 'Resident Site Engineer (Base + Allowance)',
        count: 1,
        baseMonthlyEgp: 5000,
        allowanceMonthlyEgp: 2000,
        category: 'Supervision',
        descriptionAr: 'راتب أساسي 5,000 ج.م + بدل انتقالات واتصالات 2,000 ج.م = 7,000 ج.م/شهر',
    },
    {
        id: 'OVH-02',
        roleAr: 'مشرف موقع بموتوسيكل (Site Supervisor / Runner)',
        roleEn: 'Site Supervisor / Procurement Runner with Motorbike',
        count: 1,
        baseMonthlyEgp: 6000,
        allowanceMonthlyEgp: 1500,
        category: 'Supervision',
        descriptionAr: 'مشرف استلامات ومتابعة يومية وتوريدات سريعة بالموتوسيكل = 7,500 ج.م/شهر',
    },
    {
        id: 'OVH-03',
        roleAr: '2 عامل موقع دائمين (نظافة وتشوين ومساعدة)',
        roleEn: '2 Dedicated Site Laborers (Housekeeping & Tashween)',
        count: 2,
        baseMonthlyEgp: 4000,
        allowanceMonthlyEgp: 0,
        category: 'Site Labor',
        descriptionAr: '2 عامل موقع × 4,000 ج.م للنظافة الدورية ورفع المخلفات وحماية البنود = 8,000 ج.م/شهر',
    },
    {
        id: 'OVH-04',
        roleAr: 'إشراف ومهمات سلامة وصحة مهنية (HSE & PPE)',
        roleEn: 'HSE Supervisor Allocation & Safety PPE / Extinguishers',
        count: 1,
        baseMonthlyEgp: 3500,
        allowanceMonthlyEgp: 1500,
        category: 'HSE & Safety',
        descriptionAr: 'مهمات وقاية شخصية، طفايات حريق، لوحات إرشادية، وإشراف سلامة = 5,000 ج.م/شهر',
    },
    {
        id: 'OVH-05',
        roleAr: 'سيارات الشركة والانتقالات والوقود (Fleet & Trips)',
        roleEn: 'Company Fleet Allocation, Fuel & Site Visits',
        count: 1,
        baseMonthlyEgp: 4500,
        allowanceMonthlyEgp: 0,
        category: 'Logistics & Fleet',
        descriptionAr: 'تحميل نصيب المشروع من سيارات الشركة، زيارات المكتب الفني، والوقود = 4,500 ج.م/شهر',
    },
    {
        id: 'OVH-06',
        roleAr: 'تجهيزات الموقع وكهرباء ومياه وحراسة مؤقتة',
        roleEn: 'Temporary Site Utilities, Mobilization & Security',
        count: 1,
        baseMonthlyEgp: 3000,
        allowanceMonthlyEgp: 0,
        category: 'Utilities & Mobilization',
        descriptionAr: 'استهلاك كهرباء ومياه، لوحة كهرباء مؤقتة، كشافات، ومخزن العدد = 3,000 ج.م/شهر',
    },
];

const TENDER_PROJECTS: TenderProjectOption[] = [
    {
        id: 'C096',
        code: 'C096',
        clientName: 'Michael & Mona Azad',
        projectNameAr: 'C096 - فيلا مايكل وممنى أزاد (التجمع الخامس)',
        projectNameEn: 'C096 - Michael & Mona Azad 5th Settlement',
        location: 'New Cairo - 5th Settlement (Katameya Dunes)',
        contractNo: '000055',
        defaultDurationMonths: 6,
        areaM2: 420,
    },
    {
        id: 'C098',
        code: 'C098',
        clientName: 'Dr. Tarek El-ersh',
        projectNameAr: 'C098 - عطاء فيلا القاهرة الجديدة (النرجس فيلات)',
        projectNameEn: 'C098 - New Cairo Villa Tender',
        location: 'New Cairo - Narges Villas',
        contractNo: '000058',
        defaultDurationMonths: 8,
        areaM2: 560,
    },
    {
        id: 'C063',
        code: 'C063',
        clientName: 'Eng. Sherif Mansour',
        projectNameAr: 'C063 - فيلا مدينتي (منطقة الفيلات B3)',
        projectNameEn: 'C063 - Madinaty Villa',
        location: 'Madinaty - Golf Villas B3',
        contractNo: '000042',
        defaultDurationMonths: 5,
        areaM2: 350,
    },
];

// ============================================================================
// MAIN COMPONENT: PricingEngineHub
// ============================================================================

export const PricingEngineHub: React.FC = () => {
    // 1. Top Tender Header & Contract Lock State
    const [selectedTenderId, setSelectedTenderId] = useState<string>('C096');
    const [selectedRevision, setSelectedRevision] = useState<'R00' | 'R01' | 'R02 - Final'>('R02 - Final');
    const [projectDurationMonths, setProjectDurationMonths] = useState<number>(6);
    const [isContractLocked, setIsContractLocked] = useState<boolean>(false);
    const [lockedTimestamp, setLockedTimestamp] = useState<string | null>(null);

    // Sub-tabs Navigation
    const [activeSubTab, setActiveSubTab] = useState<'boq_map' | 'deep_analyzer' | 'site_overheads' | 'commercial_sim'>('boq_map');

    // 2. Sub-Tab 1 State: R02 Work Map & BOQ Builder
    const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
    const [selectedPackageCode, setSelectedPackageCode] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [boqItems, setBoqItems] = useState<BOQLineItem[]>(INITIAL_BOQ_ITEMS);

    // New BOQ Line Modal / Quick Row
    const [newCode, setNewCode] = useState<string>('R02-09.05');
    const [newTitleAr, setNewTitleAr] = useState<string>('');
    const [newUnit, setNewUnit] = useState<string>('m²');
    const [newQty, setNewQty] = useState<number>(50);
    const [newM, setNewM] = useState<number>(450);
    const [newL, setNewL] = useState<number>(150);
    const [newS, setNewS] = useState<number>(0);

    // 3. Sub-Tab 2 State: Eng. Pierre's Deep Unit Rate Analyzer
    const [activePresetKey, setActivePresetKey] = useState<string>('PORCELAIN-60X120');
    const [targetBoqItemIdForPush, setTargetBoqItemIdForPush] = useState<string>('BOQ-05');
    const [analyzerState, setAnalyzerState] = useState<GranularAnalyzerPreset>(PIERRE_GRANULAR_PRESETS['PORCELAIN-60X120']);
    const [pushSuccessMessage, setPushSuccessMessage] = useState<string | null>(null);

    // 4. Sub-Tab 3 State: Site Overheads & Proportional Distribution
    const [siteOverheads, setSiteOverheads] = useState<SiteOverheadResource[]>(INITIAL_SITE_OVERHEADS);

    // 5. Sub-Tab 4 State: Commercial Markups, Inflation & Negotiation Simulator
    const [riskContingencyPct, setRiskContingencyPct] = useState<number>(5.0);
    const [adminGaPct, setAdminGaPct] = useState<number>(6.0);
    const [monthlyInflationRatePct, setMonthlyInflationRatePct] = useState<number>(1.5); // × durationMonths = 9%
    const [targetProfitPct, setTargetProfitPct] = useState<number>(18.0);
    const [negotiationBufferPct, setNegotiationBufferPct] = useState<number>(4.0);

    // Tax settings
    const vatTaxPct = 14.0;
    const tableTaxPct = 5.0;
    const withholdingTaxPct = 1.0;
    const [activeTaxMode, setActiveTaxMode] = useState<'vat_14' | 'contracting_5' | 'net_untaxed'>('contracting_5');

    // Client Negotiation Discount Simulator
    const [clientDiscountPct, setClientDiscountPct] = useState<number>(3.5);

    const activeTender = useMemo(
        () => TENDER_PROJECTS.find((p) => p.id === selectedTenderId) || TENDER_PROJECTS[0],
        [selectedTenderId]
    );

    // ========================================================================
    // FINANCIAL & PRICING ENGINE CALCULATIONS
    // ========================================================================

    // 1. Monthly & Total Site Overheads
    const monthlySiteOverheadEgp = useMemo(() => {
        return siteOverheads.reduce(
            (sum, item) => sum + item.count * (item.baseMonthlyEgp + item.allowanceMonthlyEgp),
            0
        );
    }, [siteOverheads]);

    const totalSiteOverheadsEgp = useMemo(() => {
        return monthlySiteOverheadEgp * projectDurationMonths;
    }, [monthlySiteOverheadEgp, projectDurationMonths]);

    // 2. Total Direct BOQ Cost (M + L + S)
    const totalDirectBoqCostEgp = useMemo(() => {
        return boqItems.reduce((sum, item) => {
            const unitDirect = item.directMaterialM + item.directLaborL + item.subcontractS;
            return sum + unitDirect * item.qty;
        }, 0);
    }, [boqItems]);

    // 3. Proportional Site Overhead Multiplier % (نسبة التحميل غير المباشر على كل بند)
    const proportionalOverheadPct = useMemo(() => {
        if (totalDirectBoqCostEgp <= 0) return 0;
        return (totalSiteOverheadsEgp / totalDirectBoqCostEgp) * 100;
    }, [totalSiteOverheadsEgp, totalDirectBoqCostEgp]);

    // 4. Inflation Impact % = monthlyInflationRatePct * projectDurationMonths
    const cumulativeInflationPct = useMemo(() => {
        return Number((monthlyInflationRatePct * projectDurationMonths).toFixed(2));
    }, [monthlyInflationRatePct, projectDurationMonths]);

    // 5. Combined Commercial Markup % applied on top of (Direct + Allocated Site Overhead)
    const totalCommercialMarkupPct = useMemo(() => {
        return riskContingencyPct + adminGaPct + cumulativeInflationPct + targetProfitPct + negotiationBufferPct;
    }, [riskContingencyPct, adminGaPct, cumulativeInflationPct, targetProfitPct, negotiationBufferPct]);

    // 6. Enriched BOQ Rows with automatic Site Overhead allocation + Commercial Markups
    const enrichedBoqRows = useMemo(() => {
        const ovhFactor = totalDirectBoqCostEgp > 0 ? totalSiteOverheadsEgp / totalDirectBoqCostEgp : 0;
        const markupFactor = totalCommercialMarkupPct / 100;

        return boqItems.map((item) => {
            const unitDirectCost = item.directMaterialM + item.directLaborL + item.subcontractS;
            const allocatedUnitOverhead = unitDirectCost * ovhFactor;
            const unitBreakEvenCost = unitDirectCost + allocatedUnitOverhead;
            const unitCommercialMarkup = unitBreakEvenCost * markupFactor;
            const finalSellingUnitPrice = unitBreakEvenCost + unitCommercialMarkup;
            const totalLineDirectCost = unitDirectCost * item.qty;
            const totalLineOverhead = allocatedUnitOverhead * item.qty;
            const totalLineSellingPrice = finalSellingUnitPrice * item.qty;

            return {
                ...item,
                unitDirectCost,
                allocatedUnitOverhead,
                unitBreakEvenCost,
                unitCommercialMarkup,
                finalSellingUnitPrice,
                totalLineDirectCost,
                totalLineOverhead,
                totalLineSellingPrice,
            };
        });
    }, [boqItems, totalDirectBoqCostEgp, totalSiteOverheadsEgp, totalCommercialMarkupPct]);

    // 7. Filtered BOQ Rows
    const filteredBoqRows = useMemo(() => {
        return enrichedBoqRows.filter((row) => {
            const pkg = NEXUS_R02_34_PACKAGES.find((p) => p.code === row.packageCode);
            if (selectedDivision !== 'ALL' && pkg?.division !== selectedDivision) return false;
            if (selectedPackageCode !== 'ALL' && row.packageCode !== selectedPackageCode) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    row.code.toLowerCase().includes(q) ||
                    row.titleAr.toLowerCase().includes(q) ||
                    row.titleEn.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [enrichedBoqRows, selectedDivision, selectedPackageCode, searchQuery]);

    // 8. Grand Tender Totals & Negotiation Traffic-Light Calculation
    const tenderTotals = useMemo(() => {
        const directCost = totalDirectBoqCostEgp;
        const indirectSiteOverhead = totalSiteOverheadsEgp;
        const totalPrimeCost = directCost + indirectSiteOverhead; // التكلفة المباشرة + غير المباشرة للموقع

        const riskValue = totalPrimeCost * (riskContingencyPct / 100);
        const adminGaValue = totalPrimeCost * (adminGaPct / 100);
        const inflationValue = totalPrimeCost * (cumulativeInflationPct / 100);
        const costFloorBeforeProfit = totalPrimeCost + riskValue + adminGaValue + inflationValue;

        const targetProfitValue = totalPrimeCost * (targetProfitPct / 100);
        const negotiationBufferValue = totalPrimeCost * (negotiationBufferPct / 100);

        const grossSellingBeforeTax = costFloorBeforeProfit + targetProfitValue + negotiationBufferValue;

        // Client Requested Discount Simulation
        const discountValueEgp = grossSellingBeforeTax * (clientDiscountPct / 100);
        const netSellingAfterDiscount = grossSellingBeforeTax - discountValueEgp;

        // Remaining Profit after Discount
        const remainingProfitEgp = netSellingAfterDiscount - costFloorBeforeProfit;
        const remainingProfitPctOfPrime = totalPrimeCost > 0 ? (remainingProfitEgp / totalPrimeCost) * 100 : 0;

        // Traffic Light Zone per Eng. Pierre's Audio Rule:
        // GREEN: discountValueEgp <= negotiationBufferValue (Safe inside buffer; full target profit intact)
        // AMBER: discountValueEgp > negotiationBufferValue && netSellingAfterDiscount >= costFloorBeforeProfit (Eats into target profit margin)
        // RED: netSellingAfterDiscount < costFloorBeforeProfit (DANGER: Cuts into Risk/Inflation/Admin or Direct+Indirect Cost!)
        let zone: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
        if (netSellingAfterDiscount < costFloorBeforeProfit) {
            zone = 'RED';
        } else if (discountValueEgp > negotiationBufferValue) {
            zone = 'AMBER';
        }

        // Tax Calculation on Net Selling After Discount
        const appliedTaxRate =
            activeTaxMode === 'vat_14'
                ? vatTaxPct
                : activeTaxMode === 'contracting_5'
                ? tableTaxPct
                : 0;
        const salesTaxValue = netSellingAfterDiscount * (appliedTaxRate / 100);
        const withholdingDeductionValue =
            activeTaxMode === 'net_untaxed' ? 0 : netSellingAfterDiscount * (withholdingTaxPct / 100);
        const finalContractPayableIncTax = netSellingAfterDiscount + salesTaxValue - withholdingDeductionValue;

        return {
            directCost,
            indirectSiteOverhead,
            totalPrimeCost,
            riskValue,
            adminGaValue,
            inflationValue,
            costFloorBeforeProfit,
            targetProfitValue,
            negotiationBufferValue,
            grossSellingBeforeTax,
            discountValueEgp,
            netSellingAfterDiscount,
            remainingProfitEgp,
            remainingProfitPctOfPrime,
            zone,
            salesTaxValue,
            withholdingDeductionValue,
            finalContractPayableIncTax,
        };
    }, [
        totalDirectBoqCostEgp,
        totalSiteOverheadsEgp,
        riskContingencyPct,
        adminGaPct,
        cumulativeInflationPct,
        targetProfitPct,
        negotiationBufferPct,
        clientDiscountPct,
        activeTaxMode,
        vatTaxPct,
        tableTaxPct,
        withholdingTaxPct,
    ]);

    // ========================================================================
    // DEEP UNIT RATE ANALYZER (11 COMPONENTS) LIVE BREAKDOWN
    // ========================================================================

    const granularBreakdown = useMemo(() => {
        const c1_baseMaterial = analyzerState.baseMaterialSupply;
        const c2_wasteCost = c1_baseMaterial * (analyzerState.wastePct / 100);
        const c3a_adhesivePerM2 =
            analyzerState.adhesiveBagCoverageM2 > 0
                ? analyzerState.adhesiveBagPrice / analyzerState.adhesiveBagCoverageM2
                : 0;
        const c3b_mortarScreed = analyzerState.mortarScreedCost;
        const c4_sandBackfill = analyzerState.sandThicknessM3PerM2 * analyzerState.sandPricePerM3;
        const c5_transportNolon = analyzerState.transportNolonPerUnit;
        const c6_liftingTashween = analyzerState.liftingTashweenPerUnit;
        const c7_directInstallLabor = analyzerState.directInstallLabor;
        const c8_miter45Linear = analyzerState.miter45RatioMlPerM2 * analyzerState.miter45RatePerMl;
        const c9_groutAndCleaning = analyzerState.groutAndCleaningPerUnit;
        const c10_protectionLayers = analyzerState.protectionLayersPerUnit;

        // Material Group (M) = Base Material + Waste + Adhesive + Mortar + Sand + Protection Materials (50%)
        const computedDirectMaterialM = Number(
            (
                c1_baseMaterial +
                c2_wasteCost +
                c3a_adhesivePerM2 +
                c3b_mortarScreed +
                c4_sandBackfill +
                c10_protectionLayers * 0.5
            ).toFixed(2)
        );

        // Labor & Logistics Group (L) = Nolon + Tashween + Direct Install + 45° Miter + Grout/Cleaning + Protection Labor (50%)
        const computedDirectLaborL = Number(
            (
                c5_transportNolon +
                c6_liftingTashween +
                c7_directInstallLabor +
                c8_miter45Linear +
                c9_groutAndCleaning +
                c10_protectionLayers * 0.5
            ).toFixed(2)
        );

        const totalDirectUnitRate = Number((computedDirectMaterialM + computedDirectLaborL).toFixed(2));
        const allocatedUnitOverhead = Number(
            (totalDirectUnitRate * (proportionalOverheadPct / 100)).toFixed(2)
        );
        const breakEvenUnitCost = Number((totalDirectUnitRate + allocatedUnitOverhead).toFixed(2));
        const commercialMarkupUnit = Number(
            (breakEvenUnitCost * (totalCommercialMarkupPct / 100)).toFixed(2)
        );
        const finalSellingUnitPrice = Number((breakEvenUnitCost + commercialMarkupUnit).toFixed(2));

        // Composition buckets for the visual bar
        const bucketRawAndBonding = c1_baseMaterial + c3a_adhesivePerM2 + c3b_mortarScreed + c4_sandBackfill;
        const bucketWaste = c2_wasteCost;
        const bucketLogisticsTashween = c5_transportNolon + c6_liftingTashween;
        const bucketLaborAndMiter = c7_directInstallLabor + c8_miter45Linear + c9_groutAndCleaning;
        const bucketProtection = c10_protectionLayers;

        return {
            c1_baseMaterial,
            c2_wasteCost,
            c3a_adhesivePerM2,
            c3b_mortarScreed,
            c4_sandBackfill,
            c5_transportNolon,
            c6_liftingTashween,
            c7_directInstallLabor,
            c8_miter45Linear,
            c9_groutAndCleaning,
            c10_protectionLayers,
            computedDirectMaterialM,
            computedDirectLaborL,
            totalDirectUnitRate,
            allocatedUnitOverhead,
            breakEvenUnitCost,
            commercialMarkupUnit,
            finalSellingUnitPrice,
            bucketRawAndBonding,
            bucketWaste,
            bucketLogisticsTashween,
            bucketLaborAndMiter,
            bucketProtection,
        };
    }, [analyzerState, proportionalOverheadPct, totalCommercialMarkupPct]);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleSelectTender = (tenderId: string) => {
        if (isContractLocked) return;
        setSelectedTenderId(tenderId);
        const found = TENDER_PROJECTS.find((t) => t.id === tenderId);
        if (found) {
            setProjectDurationMonths(found.defaultDurationMonths);
        }
    };

    const handleLockContract = () => {
        setIsContractLocked(true);
        setLockedTimestamp(new Date().toLocaleString('en-GB', { hour12: false }));
    };

    const handleUnlockContractOverride = () => {
        setIsContractLocked(false);
        setLockedTimestamp(null);
    };

    const handleUpdateBoqField = (
        id: string,
        field: 'qty' | 'directMaterialM' | 'directLaborL' | 'subcontractS',
        value: number
    ) => {
        if (isContractLocked) return;
        setBoqItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: Math.max(0, value) } : item))
        );
    };

    const handleOpenDeepAnalyzerForBoqRow = (item: BOQLineItem) => {
        setTargetBoqItemIdForPush(item.id);
        if (item.hasGranularPreset && PIERRE_GRANULAR_PRESETS[item.hasGranularPreset]) {
            setActivePresetKey(item.hasGranularPreset);
            setAnalyzerState({ ...PIERRE_GRANULAR_PRESETS[item.hasGranularPreset] });
        } else {
            // Synthesize a custom granular breakdown matching the item's M and L
            setActivePresetKey('CUSTOM');
            const baseMat = Math.round(item.directMaterialM * 0.72);
            const remMat = Math.max(0, item.directMaterialM - baseMat * 1.1);
            const installLab = Math.round(item.directLaborL * 0.7);
            const remLab = Math.max(0, item.directLaborL - installLab);
            setAnalyzerState({
                id: 'CUSTOM',
                boqCode: item.code,
                nameAr: item.titleAr,
                nameEn: item.titleEn,
                unit: item.unit,
                baseMaterialSupply: baseMat,
                wastePct: item.wastePct || 10,
                adhesiveBagPrice: Math.round(remMat * 5),
                adhesiveBagCoverageM2: 10,
                mortarScreedCost: Math.round(remMat * 0.5),
                sandThicknessM3PerM2: 0,
                sandPricePerM3: 350,
                transportNolonPerUnit: Math.round(remLab * 0.35),
                liftingTashweenPerUnit: Math.round(remLab * 0.35),
                directInstallLabor: installLab,
                miter45RatioMlPerM2: 0,
                miter45RatePerMl: 50,
                groutAndCleaningPerUnit: Math.round(remLab * 0.15),
                protectionLayersPerUnit: Math.round(remLab * 0.15),
                engineerNoteAr: 'تحليل تفصيلي مخصص لهذا البند موزع على التوريد، الهالك، التشوين، المصنعية، والحماية.',
            });
        }
        setActiveSubTab('deep_analyzer');
    };

    const handlePushAnalyzerToBoq = () => {
        if (isContractLocked) return;
        setBoqItems((prev) =>
            prev.map((item) =>
                item.id === targetBoqItemIdForPush
                    ? {
                          ...item,
                          directMaterialM: granularBreakdown.computedDirectMaterialM,
                          directLaborL: granularBreakdown.computedDirectLaborL,
                          wastePct: analyzerState.wastePct,
                      }
                    : item
            )
        );
        const targetItem = boqItems.find((b) => b.id === targetBoqItemIdForPush);
        setPushSuccessMessage(
            `تم ترحيل السعر المحلل (${granularBreakdown.totalDirectUnitRate.toLocaleString()} ج.م تكلفة مباشرة/وحدة | ${granularBreakdown.finalSellingUnitPrice.toLocaleString()} ج.م سعر بيعي/وحدة) إلى البند ${targetItem?.code || ''}`
        );
        setTimeout(() => setPushSuccessMessage(null), 5000);
    };

    const handleAddQuickBoqItem = () => {
        if (isContractLocked || !newTitleAr.trim()) return;
        const pkgCode = selectedPackageCode !== 'ALL' ? selectedPackageCode : 'R02-09';
        const newItem: BOQLineItem = {
            id: `BOQ-${Date.now()}`,
            packageCode: pkgCode,
            code: newCode || `${pkgCode}.99`,
            titleAr: newTitleAr,
            titleEn: newTitleAr,
            unit: newUnit,
            qty: newQty,
            directMaterialM: newM,
            directLaborL: newL,
            subcontractS: newS,
            wastePct: 10,
        };
        setBoqItems((prev) => [newItem, ...prev]);
        setNewTitleAr('');
    };

    const handleUpdateOverheadRow = (
        id: string,
        field: 'count' | 'baseMonthlyEgp' | 'allowanceMonthlyEgp',
        value: number
    ) => {
        if (isContractLocked) return;
        setSiteOverheads((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: Math.max(0, value) } : row))
        );
    };

    const formatEgp = (val: number) =>
        new Intl.NumberFormat('en-EG', { maximumFractionDigits: 1 }).format(val);

    return (
        <div className="space-y-6 text-[#192631]">
            {/* ====================================================================
                1. TOP TENDER HEADER & CONTRACT LOCK BANNER
               ==================================================================== */}
            <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#192631]/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#e04b2a]/10 text-[#e04b2a] border border-[#e04b2a]/25">
                                <Calculator className="w-3.5 h-3.5" />
                                Actpert Nexus R02 Pricing Engine
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-[#192631] border border-blue-500/30">
                                34 Work Packages • 839 Standard Items
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                                Eng. Pierre Unit Rate Methodology
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-[#192631] tracking-tight mt-1">
                            محرك التسعير الهندسي والتحليل التفصيلي للبنود والمقايسات (Nexus R02 Tender Hub)
                        </h2>
                        <p className="text-xs text-[#192631]/70">
                            تحليل أسعار الوحدات (خامات + هالك + سيتوكس + رمل + تشوين + مصنعيات + حماية) مع التوزيع النسبي التلقائي للمصاريف غير المباشرة ومحاكي التفاوض التجاري
                        </p>
                    </div>

                    {/* Convert to Locked Contract / CEO Override Action */}
                    <div className="flex items-center gap-3 self-start lg:self-center">
                        {!isContractLocked ? (
                            <button
                                onClick={handleLockContract}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-[#192631] font-bold text-xs shadow-lg shadow-emerald-900/40 border border-emerald-400/30 transition-all cursor-pointer"
                            >
                                <Lock className="w-4 h-4" />
                                <span>Convert to Locked Contract (تحويل لمقايسة تعاقدية مشفرة ومغلقة)</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleUnlockContractOverride}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#b45309] font-bold text-xs border border-amber-500/40 transition-all cursor-pointer"
                            >
                                <Unlock className="w-4 h-4" />
                                <span>CEO Override / Create New Revision (فك القفل لإصدار مراجعة جديدة)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tender Controls Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                    {/* Project / Tender Selector */}
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-wider mb-1.5">
                            Select Tender / Project (المشروع / العطاء)
                        </label>
                        <select
                            disabled={isContractLocked}
                            value={selectedTenderId}
                            onChange={(e) => handleSelectTender(e.target.value)}
                            className="w-full rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 px-3.5 py-2.5 text-sm font-bold text-[#192631] focus:outline-none focus:border-orange-500 disabled:opacity-60"
                        >
                            {TENDER_PROJECTS.map((proj) => (
                                <option key={proj.id} value={proj.id} className="bg-white/80 backdrop-blur-xl text-[#192631]">
                                    {proj.projectNameEn} — ({proj.projectNameAr})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Revision Selector */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-wider mb-1.5">
                            Tender Revision (رقم المراجعة)
                        </label>
                        <select
                            disabled={isContractLocked}
                            value={selectedRevision}
                            onChange={(e) => setSelectedRevision(e.target.value as 'R00' | 'R01' | 'R02 - Final')}
                            className="w-full rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 px-3.5 py-2.5 text-sm font-bold text-[#e04b2a] focus:outline-none focus:border-orange-500 disabled:opacity-60"
                        >
                            <option value="R00" className="bg-white/80 backdrop-blur-xl text-[#192631]">R00 — Initial Concept Estimate</option>
                            <option value="R01" className="bg-white/80 backdrop-blur-xl text-[#192631]">R01 — Value Engineered BOQ</option>
                            <option value="R02 - Final" className="bg-white/80 backdrop-blur-xl text-[#e04b2a]">R02 - Final — Nexus Standard Baseline</option>
                        </select>
                    </div>

                    {/* Project Duration (Months) */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#192631]/70 uppercase tracking-wider mb-1.5">
                            Project Duration (مدة التنفيذ بالشهور)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                max={36}
                                disabled={isContractLocked}
                                value={projectDurationMonths}
                                onChange={(e) => setProjectDurationMonths(Math.max(1, Number(e.target.value) || 1))}
                                className="w-full rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 px-3.5 py-2.5 text-sm font-black text-[#123524] focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                            />
                            <span className="text-xs font-bold text-[#192631]/70 whitespace-nowrap">Months (شهور)</span>
                        </div>
                    </div>
                </div>

                {/* Locked Contract Baseline Security Banner */}
                {isContractLocked && (
                    <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-amber-950/60 border border-[#123524]/25 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#123524]/10 border border-emerald-400/40 text-[#123524] mt-0.5">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                                        Contract Baseline Locked (ContractNo: {activeTender.contractNo})
                                    </span>
                                    <span className="text-xs font-bold text-[#b45309]">
                                        Revision: {selectedRevision} • Locked at {lockedTimestamp}
                                    </span>
                                </div>
                                <p className="text-xs text-[#192631] mt-1 leading-relaxed">
                                    Original BOQ quantities & unit rates are immutable. Any post-contract changes must be issued via{' '}
                                    <span className="font-bold text-[#b45309] underline">Variation Orders (VO / أوامر التغيير)</span> or{' '}
                                    <span className="font-bold text-red-700 underline">Deductions (خصومات الأعمال)</span>.
                                </p>
                            </div>
                        </div>
                        <div className="text-start shrink-0">
                            <div className="text-[10px] uppercase tracking-wider text-[#192631]/70">Locked Contract Value</div>
                            <div className="text-lg font-black text-[#123524]">
                                {formatEgp(tenderTotals.netSellingAfterDiscount)} EGP
                            </div>
                        </div>
                    </div>
                )}

                {/* Executive Live KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
                    <div className="rounded-xl bg-white/[0.03] border border-[#192631]/10 p-3">
                        <div className="text-[10px] font-bold text-[#192631]/70 uppercase">Direct Cost (M + L + S)</div>
                        <div className="text-base font-black text-[#192631] mt-0.5">
                            {formatEgp(tenderTotals.directCost)} <span className="text-[10px] text-[#192631]/70">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631]/60 mt-0.5">التكلفة المباشرة للبنود</div>
                    </div>

                    <div className="rounded-xl bg-blue-500/[0.07] border border-blue-500/20 p-3">
                        <div className="text-[10px] font-bold text-[#192631] uppercase">
                            Site Overheads ({projectDurationMonths} mos)
                        </div>
                        <div className="text-base font-black text-[#192631] mt-0.5">
                            {formatEgp(tenderTotals.indirectSiteOverhead)} <span className="text-[10px] text-[#192631]">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631] font-semibold mt-0.5">
                            +{proportionalOverheadPct.toFixed(2)}% تحميل نسبي/بند
                        </div>
                    </div>

                    <div className="rounded-xl bg-purple-500/[0.07] border border-purple-500/20 p-3">
                        <div className="text-[10px] font-bold text-[#192631] uppercase">Risk + Admin + Inflation</div>
                        <div className="text-base font-black text-[#192631] mt-0.5">
                            {(riskContingencyPct + adminGaPct + cumulativeInflationPct).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-[#192631] mt-0.5">
                            تضخم {cumulativeInflationPct}% + مخاطر {riskContingencyPct}% + إدارة {adminGaPct}%
                        </div>
                    </div>

                    <div className="rounded-xl bg-amber-500/[0.07] border border-amber-500/20 p-3">
                        <div className="text-[10px] font-bold text-[#b45309] uppercase">Gross Tender Price</div>
                        <div className="text-base font-black text-[#b45309] mt-0.5">
                            {formatEgp(tenderTotals.grossSellingBeforeTax)} <span className="text-[10px] text-[#b45309]">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#b45309] mt-0.5">قبل خصم التفاوض والضرائب</div>
                    </div>

                    <div className="rounded-xl bg-emerald-500/[0.08] border border-emerald-500/25 p-3">
                        <div className="text-[10px] font-bold text-[#123524] uppercase">
                            Net Selling (-{clientDiscountPct}% Disc.)
                        </div>
                        <div className="text-base font-black text-[#123524] mt-0.5">
                            {formatEgp(tenderTotals.netSellingAfterDiscount)} <span className="text-[10px]">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#123524] mt-0.5">
                            شامل الضريبة: {formatEgp(tenderTotals.finalContractPayableIncTax)} ج.م
                        </div>
                    </div>

                    <div
                        className={`rounded-xl p-3 border ${
                            tenderTotals.zone === 'GREEN'
                                ? 'bg-[#123524]/10 border-[#123524]/25 text-[#123524]'
                                : tenderTotals.zone === 'AMBER'
                                ? 'bg-amber-500/10 border-amber-500/30 text-[#b45309]'
                                : 'bg-rose-500/15 border-rose-500/40 text-red-700'
                        }`}
                    >
                        <div className="text-[10px] font-bold uppercase flex items-center justify-between">
                            <span>Negotiation Safety</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#f5f5f5]/85">
                                {tenderTotals.zone} ZONE
                            </span>
                        </div>
                        <div className="text-base font-black mt-0.5">
                            {tenderTotals.remainingProfitPctOfPrime.toFixed(1)}% Net Margin
                        </div>
                        <div className="text-[10px] opacity-90 mt-0.5">
                            صافي الربح: {formatEgp(tenderTotals.remainingProfitEgp)} ج.م
                        </div>
                    </div>
                </div>
            </div>

            {/* ====================================================================
                SUB-TABS NAVIGATION BAR
               ==================================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                    onClick={() => setActiveSubTab('boq_map')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                        activeSubTab === 'boq_map'
                            ? 'bg-[#e04b2a]/10 border-[#e04b2a]/25 text-[#192631] shadow-lg shadow-orange-950/30'
                            : 'bg-white/85 backdrop-blur-xl border-[#192631]/10 text-[#192631]/70 hover:text-[#192631] hover:border-[#192631]/10'
                    }`}
                >
                    <div className="p-2 rounded-lg bg-[#e04b2a]/10 text-[#e04b2a] shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-black truncate">1. R02 Work Map & BOQ Builder</div>
                        <div className="text-[11px] text-[#192631]/70 truncate">خريطة الأعمال R02 (34 باقة / 839 بند)</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveSubTab('deep_analyzer')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                        activeSubTab === 'deep_analyzer'
                            ? 'bg-[#123524]/10 border-[#123524]/25 text-[#192631] shadow-lg shadow-emerald-950/30'
                            : 'bg-white/85 backdrop-blur-xl border-[#192631]/10 text-[#192631]/70 hover:text-[#192631] hover:border-[#192631]/10'
                    }`}
                >
                    <div className="p-2 rounded-lg bg-[#123524]/10 text-[#123524] shrink-0">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-black truncate">2. Eng. Pierre's Deep Unit Analyzer</div>
                        <div className="text-[11px] text-[#192631]/70 truncate">تحليل سعر الوحدة التفصيلي (11 مركب)</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveSubTab('site_overheads')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                        activeSubTab === 'site_overheads'
                            ? 'bg-blue-500/15 border-blue-500/50 text-white shadow-lg shadow-blue-950/30'
                            : 'bg-white/85 backdrop-blur-xl border-[#192631]/10 text-[#192631]/70 hover:text-[#192631] hover:border-[#192631]/10'
                    }`}
                >
                    <div className="p-2 rounded-lg bg-blue-500/20 text-[#192631] shrink-0">
                        <HardHat className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-black truncate">3. Site Overheads & Allocation</div>
                        <div className="text-[11px] text-[#192631]/70 truncate">التكاليف غير المباشرة وتوزيعها النسبي</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveSubTab('commercial_sim')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                        activeSubTab === 'commercial_sim'
                            ? 'bg-purple-500/15 border-purple-500/50 text-[#192631] shadow-lg shadow-purple-950/30'
                            : 'bg-white/85 backdrop-blur-xl border-[#192631]/10 text-[#192631]/70 hover:text-[#192631] hover:border-[#192631]/10'
                    }`}
                >
                    <div className="p-2 rounded-lg bg-purple-500/20 text-[#192631] shrink-0">
                        <Sliders className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-black truncate">4. Markups, Inflation & Negotiation</div>
                        <div className="text-[11px] text-[#192631]/70 truncate">الهوامش والتضخم ومحاكي التفاوض والخصم</div>
                    </div>
                </button>
            </div>

            {/* ====================================================================
                SUB-TAB 1: NEXUS R02 WORK MAP & BOQ BUILDER (34 PACKAGES / 839 ITEMS)
               ==================================================================== */}
            {activeSubTab === 'boq_map' && (
                <div className="space-y-6">
                    {/* 34 Work Packages Browser */}
                    <div className="rounded-2xl border border-[#192631]/10 bg-white/85 backdrop-blur-xl p-5 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-black text-[#192631] flex items-center gap-2">
                                    <Package className="w-4 h-4 text-[#e04b2a]" />
                                    <span>خريطة الأعمال القياسية R02 (34 Work Packages • 839 Standard Items)</span>
                                </h3>
                                <p className="text-xs text-[#192631]/70 mt-0.5">
                                    اختر قسم الأعمال أو الباقة لتصفية بنود المقايسة أو اضغط على أي بند لفتح شاشة تحليل السعر التفصيلي (11 عنصر تكلفة)
                                </p>
                            </div>

                            {/* Division Filter Pills */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {(['ALL', 'Civil & Architectural', 'MEP & Smart Systems', 'Woodwork, Aluminum & Glass', 'External & Landscape'] as const).map(
                                    (div) => (
                                        <button
                                            key={div}
                                            onClick={() => {
                                                setSelectedDivision(div);
                                                setSelectedPackageCode('ALL');
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                selectedDivision === div
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-[#192631]/[0.05] text-[#192631]/85 hover:bg-[#192631]/[0.05]'
                                            }`}
                                        >
                                            {div === 'ALL' ? 'كل الأقسام (34 باقة)' : div}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Horizontal Scrollable / Grid of 34 Packages */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                            <button
                                onClick={() => setSelectedPackageCode('ALL')}
                                className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                                    selectedPackageCode === 'ALL'
                                        ? 'bg-[#e04b2a]/10 border-orange-500 text-[#192631]'
                                        : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/85 hover:border-white/25'
                                }`}
                            >
                                <div className="flex items-center justify-between text-[10px] font-black text-[#e04b2a]">
                                    <span>ALL R02</span>
                                    <span>839 Items</span>
                                </div>
                                <div className="text-xs font-bold mt-1 truncate">عرض كل باقات المقايسة</div>
                                <div className="text-[10px] text-[#192631]/70 mt-0.5">34 Work Packages</div>
                            </button>

                            {NEXUS_R02_34_PACKAGES.filter(
                                (p) => selectedDivision === 'ALL' || p.division === selectedDivision
                            ).map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() =>
                                        setSelectedPackageCode(pkg.code === selectedPackageCode ? 'ALL' : pkg.code)
                                    }
                                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                                        selectedPackageCode === pkg.code
                                            ? 'bg-[#e04b2a]/10 border-orange-500 text-[#192631]'
                                            : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/85 hover:border-white/25'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-[10px] font-black">
                                        <span className="text-[#e04b2a]">{pkg.code}</span>
                                        <span className="text-[#192631]/70">{pkg.standardItemCount} بند</span>
                                    </div>
                                    <div className="text-xs font-bold mt-1 line-clamp-1" title={pkg.nameAr}>
                                        {pkg.nameAr}
                                    </div>
                                    <div className="text-[10px] text-[#192631]/60 truncate mt-0.5">{pkg.nameEn}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Quick Add BOQ Item Row */}
                    <div className="rounded-2xl border border-[#192631]/10 bg-white/85 backdrop-blur-xl p-5 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-[#192631]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث بكود البند أو الوصف (مثال: بورسلين، جبس بورد، محارة، جروهي، سيتوكس، R02-09)..."
                                    className="w-full rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 pl-10 pr-4 py-2.5 text-xs text-[#192631] placeholder:text-[#192631]/60 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[#192631]/85 bg-[#192631]/[0.05] px-3.5 py-2 rounded-xl border border-[#192631]/10">
                                <Info className="w-4 h-4 text-[#192631] shrink-0" />
                                <span>
                                    نسبة التحميل غير المباشر للموقع تُحسب تلقائياً:{' '}
                                    <strong className="text-[#192631]">+{proportionalOverheadPct.toFixed(2)}%</strong> | الهوامش والتضخم والربح:{' '}
                                    <strong className="text-[#192631]">+{totalCommercialMarkupPct.toFixed(1)}%</strong>
                                </span>
                            </div>
                        </div>

                        {/* Quick Add Row (Disabled when Contract is Locked) */}
                        {!isContractLocked && (
                            <div className="grid grid-cols-2 sm:grid-cols-8 gap-2 pt-2 border-t border-[#192631]/10 items-end">
                                <div>
                                    <label className="block text-[10px] text-[#192631]/70 mb-1">Code (كود)</label>
                                    <input
                                        type="text"
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value)}
                                        className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2.5 py-1.5 text-xs text-[#192631]"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] text-[#192631]/70 mb-1">BOQ Item Title (بيان الأعمال)</label>
                                    <input
                                        type="text"
                                        value={newTitleAr}
                                        onChange={(e) => setNewTitleAr(e.target.value)}
                                        placeholder="أضف بند جديد للمقايسة..."
                                        className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2.5 py-1.5 text-xs text-[#192631]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#192631]/70 mb-1">Unit / Qty</label>
                                    <div className="flex gap-1">
                                        <input
                                            type="text"
                                            value={newUnit}
                                            onChange={(e) => setNewUnit(e.target.value)}
                                            className="w-14 rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2 py-1.5 text-xs text-[#192631]"
                                        />
                                        <input
                                            type="number"
                                            value={newQty}
                                            onChange={(e) => setNewQty(Number(e.target.value) || 0)}
                                            className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2 py-1.5 text-xs text-[#192631]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#192631]/70 mb-1">Material (M خامات)</label>
                                    <input
                                        type="number"
                                        value={newM}
                                        onChange={(e) => setNewM(Number(e.target.value) || 0)}
                                        className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2.5 py-1.5 text-xs text-[#123524]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#192631]/70 mb-1">Labor (L مصنعيات)</label>
                                    <input
                                        type="number"
                                        value={newL}
                                        onChange={(e) => setNewL(Number(e.target.value) || 0)}
                                        className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2.5 py-1.5 text-xs text-[#b45309]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#192631]/70 mb-1">Subcontract (S باطن)</label>
                                    <input
                                        type="number"
                                        value={newS}
                                        onChange={(e) => setNewS(Number(e.target.value) || 0)}
                                        className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2.5 py-1.5 text-xs text-[#192631]"
                                    />
                                </div>
                                <div>
                                    <button
                                        onClick={handleAddQuickBoqItem}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>إضافة بند</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Interactive BOQ Pricing Table */}
                        <div className="overflow-x-auto rounded-xl border border-[#192631]/10">
                            <table className="w-full text-start border-collapse">
                                <thead>
                                    <tr className="bg-[#f5f5f5]/85 text-[11px] font-black uppercase text-[#192631]/70 border-b border-[#192631]/10">
                                        <th className="py-3 px-3">Code</th>
                                        <th className="py-3 px-3 min-w-[260px]">BOQ Item Description (بيان الأعمال)</th>
                                        <th className="py-3 px-2 text-center">Unit</th>
                                        <th className="py-3 px-2 text-start">Qty</th>
                                        <th className="py-3 px-2 text-start text-[#123524]">Material (M)</th>
                                        <th className="py-3 px-2 text-start text-[#b45309]">Labor (L)</th>
                                        <th className="py-3 px-2 text-start text-[#192631]">Sub (S)</th>
                                        <th className="py-3 px-2 text-start text-[#192631]">Direct Unit</th>
                                        <th className="py-3 px-2 text-start text-[#192631]">
                                            Site Ovh (+{proportionalOverheadPct.toFixed(1)}%)
                                        </th>
                                        <th className="py-3 px-2 text-start text-[#192631]">
                                            Markups (+{totalCommercialMarkupPct.toFixed(1)}%)
                                        </th>
                                        <th className="py-3 px-3 text-start text-[#e04b2a]">
                                            Selling Rate (سعر البيع)
                                        </th>
                                        <th className="py-3 px-3 text-start text-[#123524]">Total Selling (EGP)</th>
                                        <th className="py-3 px-3 text-center">Granular Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#192631]/10 text-xs">
                                    {filteredBoqRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="py-3 px-3 font-mono font-bold text-[#e04b2a] whitespace-nowrap">
                                                {row.code}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="font-bold text-[#192631] leading-snug">{row.titleAr}</div>
                                                <div className="text-[11px] text-[#192631]/70">{row.titleEn}</div>
                                            </td>
                                            <td className="py-3 px-2 text-center font-semibold text-[#192631]/85">
                                                {row.unit}
                                            </td>
                                            <td className="py-3 px-2 text-start">
                                                <input
                                                    type="number"
                                                    disabled={isContractLocked}
                                                    value={row.qty}
                                                    onChange={(e) =>
                                                        handleUpdateBoqField(row.id, 'qty', Number(e.target.value) || 0)
                                                    }
                                                    className="w-16 text-start rounded bg-[#f5f5f5]/85 border border-[#192631]/10 px-1.5 py-1 text-xs font-bold text-[#192631] disabled:opacity-60"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-start">
                                                <input
                                                    type="number"
                                                    disabled={isContractLocked}
                                                    value={row.directMaterialM}
                                                    onChange={(e) =>
                                                        handleUpdateBoqField(
                                                            row.id,
                                                            'directMaterialM',
                                                            Number(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-20 text-start rounded bg-[#f5f5f5]/85 border border-[#123524]/25 px-1.5 py-1 text-xs font-bold text-[#123524] disabled:opacity-60"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-start">
                                                <input
                                                    type="number"
                                                    disabled={isContractLocked}
                                                    value={row.directLaborL}
                                                    onChange={(e) =>
                                                        handleUpdateBoqField(
                                                            row.id,
                                                            'directLaborL',
                                                            Number(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-18 text-start rounded bg-[#f5f5f5]/85 border border-amber-500/30 px-1.5 py-1 text-xs font-bold text-[#b45309] disabled:opacity-60"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-start">
                                                <input
                                                    type="number"
                                                    disabled={isContractLocked}
                                                    value={row.subcontractS}
                                                    onChange={(e) =>
                                                        handleUpdateBoqField(
                                                            row.id,
                                                            'subcontractS',
                                                            Number(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-20 text-start rounded bg-[#f5f5f5]/85 border border-cyan-500/30 px-1.5 py-1 text-xs font-bold text-[#192631] disabled:opacity-60"
                                                />
                                            </td>
                                            <td className="py-3 px-2 text-start font-black text-[#192631] whitespace-nowrap">
                                                {formatEgp(row.unitDirectCost)}
                                            </td>
                                            <td className="py-3 px-2 text-start font-semibold text-[#192631] whitespace-nowrap">
                                                +{formatEgp(row.allocatedUnitOverhead)}
                                            </td>
                                            <td className="py-3 px-2 text-start font-semibold text-[#192631] whitespace-nowrap">
                                                +{formatEgp(row.unitCommercialMarkup)}
                                            </td>
                                            <td className="py-3 px-3 text-start font-black text-[#e04b2a] bg-orange-500/[0.06] whitespace-nowrap">
                                                {formatEgp(row.finalSellingUnitPrice)}
                                            </td>
                                            <td className="py-3 px-3 text-start font-black text-[#123524] bg-emerald-500/[0.06] whitespace-nowrap">
                                                {formatEgp(row.totalLineSellingPrice)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={() => handleOpenDeepAnalyzerForBoqRow(row)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#123524]/10 hover:bg-emerald-500/25 text-[#123524] border border-[#123524]/25 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>Deep Breakdown (تحليل السعر)</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-[#f5f5f5]/85 border-t-2 border-[#192631]/10 text-xs font-black">
                                        <td colSpan={7} className="py-3.5 px-3 text-start text-[#192631]/85">
                                            إجمالي بنود المقايسة المعروضة (Totals Before Negotiation Discount):
                                        </td>
                                        <td className="py-3.5 px-2 text-start text-[#192631]">
                                            {formatEgp(tenderTotals.directCost)} EGP
                                        </td>
                                        <td className="py-3.5 px-2 text-start text-[#192631]">
                                            +{formatEgp(tenderTotals.indirectSiteOverhead)} EGP
                                        </td>
                                        <td className="py-3.5 px-2 text-start text-[#192631]">
                                            +{formatEgp(
                                                tenderTotals.grossSellingBeforeTax - tenderTotals.totalPrimeCost
                                            )}{' '}
                                            EGP
                                        </td>
                                        <td className="py-3.5 px-3 text-start text-[#e04b2a]">—</td>
                                        <td className="py-3.5 px-3 text-start text-[#123524] text-sm">
                                            {formatEgp(tenderTotals.grossSellingBeforeTax)} EGP
                                        </td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================================
                SUB-TAB 2: ENG. PIERRE'S DEEP UNIT RATE ANALYZER (11 COMPONENTS)
               ==================================================================== */}
            {activeSubTab === 'deep_analyzer' && (
                <div className="space-y-6">
                    {/* Preset Selector & Target BOQ Link */}
                    <div className="rounded-2xl border border-[#192631]/10 bg-white/85 backdrop-blur-xl p-5 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#192631]/10 pb-4">
                            <div>
                                <h3 className="text-base font-black text-[#192631] flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-[#123524]" />
                                    <span>
                                        تحليل أسعار البنود التفصيلي — منهجية م. بيير (11 مركب تكلفة للوحدة)
                                    </span>
                                </h3>
                                <p className="text-xs text-[#192631]/70 mt-1">
                                    اختر أحد النماذج القياسية (البورسلين 60×120، الجبس بورد كناوف، المحارة على بؤج وأوتار، أو صندوق الطرد المدفون) أو عدّل أي عنصر لترحيله فوراً للمقايسة
                                </p>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {Object.values(PIERRE_GRANULAR_PRESETS).map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => {
                                            setActivePresetKey(preset.id);
                                            setAnalyzerState({ ...preset });
                                            const matchingBoq = boqItems.find(
                                                (b) => b.hasGranularPreset === preset.id
                                            );
                                            if (matchingBoq) setTargetBoqItemIdForPush(matchingBoq.id);
                                        }}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            activePresetKey === preset.id
                                                ? 'bg-[#123524]/10 border-emerald-500 text-[#123524] shadow-lg'
                                                : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/85 hover:border-white/25'
                                        }`}
                                    >
                                        {preset.boqCode} — {preset.nameAr.split(' ').slice(0, 4).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Eng. Pierre's Audio Rule Callout */}
                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-100 leading-relaxed">
                                <span className="font-black text-[#b45309]">ملاحظة المكتب الفني (Eng. Pierre Audio Methodology): </span>
                                {analyzerState.engineerNoteAr}
                            </div>
                        </div>

                        {pushSuccessMessage && (
                            <div className="rounded-xl bg-[#123524]/10 border border-[#123524]/25 p-3 text-xs font-bold text-[#123524] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{pushSuccessMessage}</span>
                            </div>
                        )}

                        {/* 10/11 Interactive Granular Inputs Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
                            {/* Column 1: Raw Materials, Waste, Adhesive & Backfill (Components 1 to 4) */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-4 space-y-4">
                                <div className="flex items-center justify-between border-b border-[#192631]/10 pb-2.5">
                                    <span className="text-xs font-black text-[#123524] uppercase tracking-wider">
                                        أولاً: الخامات والهالك والمون (Materials & Waste)
                                    </span>
                                    <span className="text-xs font-black text-[#123524]">
                                        {formatEgp(granularBreakdown.computedDirectMaterialM)} ج.م/{analyzerState.unit}
                                    </span>
                                </div>

                                {/* 1. Base Material Cost */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-[#192631]">
                                            1. سعر المتر التوريد الأساسي (Base Material)
                                        </span>
                                        <span className="font-black text-[#123524]">
                                            {formatEgp(granularBreakdown.c1_baseMaterial)} EGP
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={analyzerState.baseMaterialSupply}
                                        onChange={(e) =>
                                            setAnalyzerState((s) => ({
                                                ...s,
                                                baseMaterialSupply: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-lg bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-3 py-2 text-xs font-bold text-[#192631]"
                                    />
                                </div>

                                {/* 2. Material Waste % (10% - 15% for cuts/closers) */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-[#192631]">
                                            2. نسبة الهالك والتقطيع والغلايق (Waste %: {analyzerState.wastePct}%)
                                        </span>
                                        <span className="font-black text-[#b45309]">
                                            +{formatEgp(granularBreakdown.c2_wasteCost)} EGP
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={0}
                                            max={25}
                                            step={1}
                                            value={analyzerState.wastePct}
                                            onChange={(e) =>
                                                setAnalyzerState((s) => ({
                                                    ...s,
                                                    wastePct: Number(e.target.value),
                                                }))
                                            }
                                            className="flex-1 accent-amber-400"
                                        />
                                        {[10, 12, 15].map((pct) => (
                                            <button
                                                key={pct}
                                                onClick={() =>
                                                    setAnalyzerState((s) => ({ ...s, wastePct: pct }))
                                                }
                                                className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer ${
                                                    analyzerState.wastePct === pct
                                                        ? 'bg-amber-500 text-black'
                                                        : 'bg-[#192631]/[0.05] text-[#192631]/85'
                                                }`}
                                            >
                                                {pct}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Adhesive / Mortar (CETOX U + Screed) */}
                                <div className="space-y-2 pt-1 border-t border-[#192631]/10">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-[#192631]">
                                            3. مادة اللصق (سيتوكس U) ومونة اللياسة
                                        </span>
                                        <span className="font-black text-[#123524]">
                                            +{formatEgp(granularBreakdown.c3a_adhesivePerM2 + granularBreakdown.c3b_mortarScreed)} EGP
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">سعر الشكارة</label>
                                            <input
                                                type="number"
                                                value={analyzerState.adhesiveBagPrice}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        adhesiveBagPrice: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">معدل الفرد (م²)</label>
                                            <input
                                                type="number"
                                                value={analyzerState.adhesiveBagCoverageM2}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        adhesiveBagCoverageM2: Math.max(0.1, Number(e.target.value) || 1),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">مونة لياسة/م²</label>
                                            <input
                                                type="number"
                                                value={analyzerState.mortarScreedCost}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        mortarScreedCost: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Sand Backfilling (رمل رديم نظيف سمك 10-15 سم) */}
                                <div className="space-y-2 pt-1 border-t border-[#192631]/10">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-[#192631]">
                                            4. رمل رديم نظيف (سمك 10-15 سم)
                                        </span>
                                        <span className="font-black text-[#123524]">
                                            +{formatEgp(granularBreakdown.c4_sandBackfill)} EGP
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">السمك/الكمية (م³/م²)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={analyzerState.sandThicknessM3PerM2}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        sandThicknessM3PerM2: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">سعر م³ الرمل (EGP)</label>
                                            <input
                                                type="number"
                                                value={analyzerState.sandPricePerM3}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        sandPricePerM3: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Logistics, Installation, 45° Miter, Grout & Protection (Components 5 to 10) */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-4 space-y-3.5">
                                <div className="flex items-center justify-between border-b border-[#192631]/10 pb-2.5">
                                    <span className="text-xs font-black text-[#b45309] uppercase tracking-wider">
                                        ثانياً: النولون والتشوين والمصنعيات والحماية
                                    </span>
                                    <span className="text-xs font-black text-[#b45309]">
                                        {formatEgp(granularBreakdown.computedDirectLaborL)} ج.م/{analyzerState.unit}
                                    </span>
                                </div>

                                {/* 5 & 6: Nolon & Lifting Tashween */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="font-bold text-[#192631]/85">5. نولون نقل للموقع</span>
                                            <span className="font-black text-[#192631]">+{analyzerState.transportNolonPerUnit}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={analyzerState.transportNolonPerUnit}
                                            onChange={(e) =>
                                                setAnalyzerState((s) => ({
                                                    ...s,
                                                    transportNolonPerUnit: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full rounded-lg bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2.5 py-1.5 text-xs font-bold text-[#192631]"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="font-bold text-[#192631]/85">6. تطليع وتشوين للدور</span>
                                            <span className="font-black text-[#192631]">+{analyzerState.liftingTashweenPerUnit}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={analyzerState.liftingTashweenPerUnit}
                                            onChange={(e) =>
                                                setAnalyzerState((s) => ({
                                                    ...s,
                                                    liftingTashweenPerUnit: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full rounded-lg bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2.5 py-1.5 text-xs font-bold text-[#192631]"
                                        />
                                    </div>
                                </div>

                                {/* 7. Direct Installation Labor */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-[#192631]">
                                            7. مصنعية التركيب بالصلايب والكلبسات (Install Labor)
                                        </span>
                                        <span className="font-black text-[#b45309]">
                                            +{formatEgp(granularBreakdown.c7_directInstallLabor)} EGP
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={analyzerState.directInstallLabor}
                                        onChange={(e) =>
                                            setAnalyzerState((s) => ({
                                                ...s,
                                                directInstallLabor: Math.max(0, Number(e.target.value) || 0),
                                            }))
                                        }
                                        className="w-full rounded-lg bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-3 py-1.5 text-xs font-bold text-[#192631]"
                                    />
                                </div>

                                {/* 8. Linear Cutting & 45° Miter Edge Trimming */}
                                <div className="space-y-1.5 pt-1 border-t border-[#192631]/10">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-[#192631]">
                                            8. تقطيع وزوايا شطف 45 درجة ووزرات (بالمتر الطولي)
                                        </span>
                                        <span className="font-black text-[#b45309]">
                                            +{formatEgp(granularBreakdown.c8_miter45Linear)} EGP
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">معامل م.ط لكل م²</label>
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={analyzerState.miter45RatioMlPerM2}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        miter45RatioMlPerM2: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-[#192631]/70">فئة المتر الطولي شطف</label>
                                            <input
                                                type="number"
                                                value={analyzerState.miter45RatePerMl}
                                                onChange={(e) =>
                                                    setAnalyzerState((s) => ({
                                                        ...s,
                                                        miter45RatePerMl: Math.max(0, Number(e.target.value) || 0),
                                                    }))
                                                }
                                                className="w-full rounded bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2 py-1.5 text-xs font-bold text-[#192631]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 9 & 10: Grout/Cleaning & Floor Protection Layers */}
                                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[#192631]/10">
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="font-bold text-[#192631]/85">9. سقية الفواصل والتنظيف</span>
                                            <span className="font-black text-[#b45309]">+{analyzerState.groutAndCleaningPerUnit}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={analyzerState.groutAndCleaningPerUnit}
                                            onChange={(e) =>
                                                setAnalyzerState((s) => ({
                                                    ...s,
                                                    groutAndCleaningPerUnit: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full rounded-lg bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2.5 py-1.5 text-xs font-bold text-[#192631]"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="font-bold text-[#192631]/85">10. مشمع وكرتون وجبس حماية</span>
                                            <span className="font-black text-red-700">+{analyzerState.protectionLayersPerUnit}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={analyzerState.protectionLayersPerUnit}
                                            onChange={(e) =>
                                                setAnalyzerState((s) => ({
                                                    ...s,
                                                    protectionLayersPerUnit: Math.max(0, Number(e.target.value) || 0),
                                                }))
                                            }
                                            className="w-full rounded-lg bg-white/80 backdrop-blur-xl border border-[#192631]/10 px-2.5 py-1.5 text-xs font-bold text-[#192631]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Live Unit Rate Summary, Composition Bar & Push to BOQ */}
                            <div className="rounded-xl bg-gradient-to-b from-emerald-950/40 via-black/50 to-black/60 border border-[#123524]/25 p-4 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-[#192631]/10 pb-2.5">
                                        <span className="text-xs font-black text-[#192631] uppercase">
                                            ملخص تكلفة وسعر بيع الوحدة ({analyzerState.unit})
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-[#123524]/10 text-[#123524] text-[10px] font-black">
                                            {analyzerState.boqCode}
                                        </span>
                                    </div>

                                    {/* Visual Cost Composition Bar */}
                                    <div className="space-y-1.5">
                                        <div className="text-[11px] font-bold text-[#192631]/85">
                                            Visual Cost Composition (توزيع عناصر التكلفة المباشرة):
                                        </div>
                                        <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#f5f5f5]/85 border border-[#192631]/10">
                                            <div
                                                style={{
                                                    width: `${
                                                        (granularBreakdown.bucketRawAndBonding /
                                                            Math.max(1, granularBreakdown.totalDirectUnitRate)) *
                                                        100
                                                    }%`,
                                                }}
                                                className="bg-emerald-500"
                                                title="Raw Material + Adhesive + Sand"
                                            />
                                            <div
                                                style={{
                                                    width: `${
                                                        (granularBreakdown.bucketWaste /
                                                            Math.max(1, granularBreakdown.totalDirectUnitRate)) *
                                                        100
                                                    }%`,
                                                }}
                                                className="bg-amber-400"
                                                title="Material Waste %"
                                            />
                                            <div
                                                style={{
                                                    width: `${
                                                        (granularBreakdown.bucketLogisticsTashween /
                                                            Math.max(1, granularBreakdown.totalDirectUnitRate)) *
                                                        100
                                                    }%`,
                                                }}
                                                className="bg-cyan-400"
                                                title="Nolon & Tashween"
                                            />
                                            <div
                                                style={{
                                                    width: `${
                                                        (granularBreakdown.bucketLaborAndMiter /
                                                            Math.max(1, granularBreakdown.totalDirectUnitRate)) *
                                                        100
                                                    }%`,
                                                }}
                                                className="bg-purple-400"
                                                title="Installation Labor & 45° Miter"
                                            />
                                            <div
                                                style={{
                                                    width: `${
                                                        (granularBreakdown.bucketProtection /
                                                            Math.max(1, granularBreakdown.totalDirectUnitRate)) *
                                                        100
                                                    }%`,
                                                }}
                                                className="bg-rose-400"
                                                title="Floor Protection Layers"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-[10px] text-[#192631]/85 pt-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                خامات ومون: {formatEgp(granularBreakdown.bucketRawAndBonding)} ج.م
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                هالك ({analyzerState.wastePct}%): {formatEgp(granularBreakdown.bucketWaste)} ج.م
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                                نولون وتشوين: {formatEgp(granularBreakdown.bucketLogisticsTashween)} ج.م
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                                مصنعية وشطف 45°: {formatEgp(granularBreakdown.bucketLaborAndMiter)} ج.م
                                            </span>
                                            <span className="flex items-center gap-1.5 col-span-2">
                                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                                طبقات حماية (مشمع وكرتون وجبس): {formatEgp(granularBreakdown.bucketProtection)} ج.م
                                            </span>
                                        </div>
                                    </div>

                                    {/* Waterfall Price Buildup */}
                                    <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-3 space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-[#192631]/70">إجمالي التكلفة المباشرة للوحدة (M + L):</span>
                                            <span className="font-black text-[#192631]">
                                                {formatEgp(granularBreakdown.totalDirectUnitRate)} EGP/{analyzerState.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[#192631]">
                                            <span>+ نصيب الوحدة من مصاريف الموقع (+{proportionalOverheadPct.toFixed(1)}%):</span>
                                            <span className="font-bold">+{formatEgp(granularBreakdown.allocatedUnitOverhead)} EGP</span>
                                        </div>
                                        <div className="flex justify-between border-t border-[#192631]/10 pt-1.5 font-bold text-[#192631]">
                                            <span>= تكلفة التعادل الفعلي (Break-Even Unit Cost):</span>
                                            <span>{formatEgp(granularBreakdown.breakEvenUnitCost)} EGP</span>
                                        </div>
                                        <div className="flex justify-between text-[#192631]">
                                            <span>+ المخاطر والإدارة والتضخم والربح (+{totalCommercialMarkupPct.toFixed(1)}%):</span>
                                            <span className="font-bold">+{formatEgp(granularBreakdown.commercialMarkupUnit)} EGP</span>
                                        </div>
                                        <div className="flex justify-between border-t border-[#123524]/25 pt-2 text-sm font-black text-[#123524]">
                                            <span>سعر الوحدة البيعي النهائي (Selling Rate):</span>
                                            <span>
                                                {formatEgp(granularBreakdown.finalSellingUnitPrice)} EGP/{analyzerState.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Push Rate to BOQ Item Control */}
                                <div className="space-y-2 pt-2 border-t border-[#192631]/10">
                                    <label className="block text-[10px] font-bold text-[#192631]/70 uppercase">
                                        اختر بند المقايسة لترحيل هذا السعر المحلل إليه:
                                    </label>
                                    <select
                                        value={targetBoqItemIdForPush}
                                        onChange={(e) => setTargetBoqItemIdForPush(e.target.value)}
                                        className="w-full rounded-lg bg-[#f5f5f5]/85 border border-[#192631]/10 px-2.5 py-2 text-xs font-bold text-[#192631]"
                                    >
                                        {boqItems.map((b) => (
                                            <option key={b.id} value={b.id} className="bg-white/80 backdrop-blur-xl">
                                                {b.code} — {b.titleAr.slice(0, 55)}...
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        disabled={isContractLocked}
                                        onClick={handlePushAnalyzerToBoq}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[#192631] font-black text-xs shadow-lg disabled:opacity-50 cursor-pointer"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        <span>Push Rate to BOQ Item (ترحيل السعر المحلل إلى بند المقايسة)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================================
                SUB-TAB 3: SITE OVERHEADS & PROPORTIONAL DISTRIBUTION
               ==================================================================== */}
            {activeSubTab === 'site_overheads' && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-[#192631]/10 bg-white/85 backdrop-blur-xl p-5 space-y-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#192631]/10 pb-4">
                            <div>
                                <h3 className="text-base font-black text-[#192631] flex items-center gap-2">
                                    <HardHat className="w-5 h-5 text-[#192631]" />
                                    <span>
                                        التكاليف غير المباشرة للموقع وتوزيعها النسبي على البنود (Site Overheads & Allocation)
                                    </span>
                                </h3>
                                <p className="text-xs text-[#192631]/70 mt-1">
                                    تُحسب التكاليف الشهرية لطاقم الإشراف والعمالة الدائمة والسلامة والانتقالات × مدة المشروع ({projectDurationMonths} شهور) وتُحمل نسبياً على كل بند في المقايسة
                                </p>
                            </div>

                            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5">
                                <div>
                                    <div className="text-[10px] font-bold text-[#192631] uppercase">
                                        Monthly Overhead × {projectDurationMonths} Months
                                    </div>
                                    <div className="text-sm font-black text-[#192631]">
                                        {formatEgp(monthlySiteOverheadEgp)} EGP/mo × {projectDurationMonths} ={' '}
                                        <span className="text-[#192631]">{formatEgp(totalSiteOverheadsEgp)} EGP</span>
                                    </div>
                                </div>
                                <div className="pl-3 border-l border-blue-500/30 text-start">
                                    <div className="text-[10px] font-bold text-[#123524] uppercase">
                                        Proportional Multiplier
                                    </div>
                                    <div className="text-base font-black text-[#123524]">
                                        +{proportionalOverheadPct.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editable Monthly Site Overheads Table */}
                        <div className="overflow-x-auto rounded-xl border border-[#192631]/10">
                            <table className="w-full text-start border-collapse">
                                <thead>
                                    <tr className="bg-[#f5f5f5]/85 text-[11px] font-black uppercase text-[#192631]/70 border-b border-[#192631]/10">
                                        <th className="py-3 px-3">Resource / Role (البيان / الوظيفة بالموقع)</th>
                                        <th className="py-3 px-3">Category</th>
                                        <th className="py-3 px-2 text-center">Count (العدد)</th>
                                        <th className="py-3 px-3 text-start">Base Salary / Cost (أساسي شهري)</th>
                                        <th className="py-3 px-3 text-start">Allowance (بدل انتقالات/مهمات)</th>
                                        <th className="py-3 px-3 text-start text-[#192631]">Monthly Total (شهري)</th>
                                        <th className="py-3 px-3 text-start text-[#123524]">
                                            Total for {projectDurationMonths} Months (إجمالي المدة)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#192631]/10 text-xs">
                                    {siteOverheads.map((row) => {
                                        const monthlyRow =
                                            row.count * (row.baseMonthlyEgp + row.allowanceMonthlyEgp);
                                        const durationRow = monthlyRow * projectDurationMonths;
                                        return (
                                            <tr key={row.id} className="hover:bg-white/[0.03]">
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-[#192631]">{row.roleAr}</div>
                                                    <div className="text-[11px] text-[#192631]/70">{row.descriptionAr}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded bg-[#192631]/[0.05] border border-[#192631]/10 text-[11px] text-[#192631]/85">
                                                        {row.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        disabled={isContractLocked}
                                                        value={row.count}
                                                        onChange={(e) =>
                                                            handleUpdateOverheadRow(
                                                                row.id,
                                                                'count',
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-16 text-center rounded bg-[#f5f5f5]/85 border border-[#192631]/10 px-2 py-1 text-xs font-bold text-[#192631]"
                                                    />
                                                </td>
                                                <td className="py-3 px-3 text-start">
                                                    <input
                                                        type="number"
                                                        disabled={isContractLocked}
                                                        value={row.baseMonthlyEgp}
                                                        onChange={(e) =>
                                                            handleUpdateOverheadRow(
                                                                row.id,
                                                                'baseMonthlyEgp',
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-24 text-start rounded bg-[#f5f5f5]/85 border border-[#192631]/10 px-2 py-1 text-xs font-bold text-[#192631]"
                                                    />
                                                </td>
                                                <td className="py-3 px-3 text-start">
                                                    <input
                                                        type="number"
                                                        disabled={isContractLocked}
                                                        value={row.allowanceMonthlyEgp}
                                                        onChange={(e) =>
                                                            handleUpdateOverheadRow(
                                                                row.id,
                                                                'allowanceMonthlyEgp',
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-24 text-start rounded bg-[#f5f5f5]/85 border border-[#192631]/10 px-2 py-1 text-xs font-bold text-[#b45309]"
                                                    />
                                                </td>
                                                <td className="py-3 px-3 text-start font-black text-[#192631]">
                                                    {formatEgp(monthlyRow)} EGP
                                                </td>
                                                <td className="py-3 px-3 text-start font-black text-[#123524] bg-emerald-500/[0.05]">
                                                    {formatEgp(durationRow)} EGP
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-[#f5f5f5]/85 border-t-2 border-[#192631]/10 text-xs font-black">
                                        <td colSpan={5} className="py-3.5 px-3 text-start text-[#192631]/85">
                                            إجمالي المصاريف غير المباشرة للموقع (Total Indirect Site Overheads):
                                        </td>
                                        <td className="py-3.5 px-3 text-start text-[#192631] text-sm">
                                            {formatEgp(monthlySiteOverheadEgp)} EGP/mo
                                        </td>
                                        <td className="py-3.5 px-3 text-start text-[#123524] text-sm">
                                            {formatEgp(totalSiteOverheadsEgp)} EGP
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mathematical Formula Explanation Card */}
                        <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="md:col-span-2 space-y-1">
                                <div className="text-xs font-black text-[#192631] uppercase">
                                    معادلة التوزيع النسبي التلقائي على البنود (Proportional Overhead Distribution Formula)
                                </div>
                                <p className="text-xs text-[#192631]/85 leading-relaxed">
                                    بدلاً من وضع المصاريف غير المباشرة كبند منفصل يرفضه العميل عند التفاوض، يقوم محرك Nexus R02 بقسمة إجمالي مصاريف الموقع غير المباشرة (
                                    <strong>{formatEgp(totalSiteOverheadsEgp)} ج.م</strong>) على إجمالي التكلفة المباشرة للمقايسة (
                                    <strong>{formatEgp(totalDirectBoqCostEgp)} ج.م</strong>) فينتج معامل تحميل نسبي قدره{' '}
                                    <strong className="text-[#123524]">+{proportionalOverheadPct.toFixed(2)}%</strong> يُضاف تلقائياً داخل تكلفة كل وحدة في المقايسة.
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-3 text-center">
                                <div className="text-[11px] text-[#192631]/70">معامل التحميل غير المباشر لكل بند</div>
                                <div className="text-2xl font-black text-[#123524] mt-1">
                                    +{proportionalOverheadPct.toFixed(2)}%
                                </div>
                                <div className="text-[10px] text-[#192631]/70 mt-0.5">
                                    ({formatEgp(totalSiteOverheadsEgp)} ÷ {formatEgp(totalDirectBoqCostEgp)})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================================
                SUB-TAB 4: COMMERCIAL MARKUPS, INFLATION & NEGOTIATION SIMULATOR
               ==================================================================== */}
            {activeSubTab === 'commercial_sim' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Columns: Markups, Inflation & Taxes Controls */}
                    <div className="lg:col-span-7 rounded-2xl border border-[#192631]/10 bg-white/85 backdrop-blur-xl p-5 space-y-5">
                        <div className="border-b border-[#192631]/10 pb-3">
                            <h3 className="text-base font-black text-[#192631] flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-[#192631]" />
                                <span>الهوامش التجارية، معامل التضخم، والضرائب (Markups, Inflation & Taxes)</span>
                            </h3>
                            <p className="text-xs text-[#192631]/70 mt-1">
                                ضبط نسب المخاطر والمصاريف الإدارية ومعامل التضخم الشهري وهامش الربح المستهدف
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Risk Contingency % */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-3.5">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-[#192631]">
                                        1. نسبة المخاطر الفنية والتنفيذية (Risk Contingency %)
                                    </span>
                                    <span className="font-black text-[#b45309]">
                                        {riskContingencyPct.toFixed(1)}% (+{formatEgp(tenderTotals.riskValue)} EGP)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={15}
                                    step={0.5}
                                    disabled={isContractLocked}
                                    value={riskContingencyPct}
                                    onChange={(e) => setRiskContingencyPct(Number(e.target.value))}
                                    className="w-full accent-amber-400"
                                />
                            </div>

                            {/* Admin / Head Office G&A % */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-3.5">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-[#192631]">
                                        2. المصاريف الإدارية والعمومية للمقر الرئيسي (Admin / Head Office G&A %)
                                    </span>
                                    <span className="font-black text-[#192631]">
                                        {adminGaPct.toFixed(1)}% (+{formatEgp(tenderTotals.adminGaValue)} EGP)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={15}
                                    step={0.5}
                                    disabled={isContractLocked}
                                    value={adminGaPct}
                                    onChange={(e) => setAdminGaPct(Number(e.target.value))}
                                    className="w-full accent-blue-400"
                                />
                            </div>

                            {/* Inflation Impact % (Monthly Rate × Project Duration) */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-purple-500/30 p-3.5">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-[#192631]">
                                        3. معامل التضخم خلال مدة المشروع ({monthlyInflationRatePct}%/شهر × {projectDurationMonths} شهور)
                                    </span>
                                    <span className="font-black text-[#192631]">
                                        {cumulativeInflationPct.toFixed(1)}% (+{formatEgp(tenderTotals.inflationValue)} EGP)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={4}
                                    step={0.25}
                                    disabled={isContractLocked}
                                    value={monthlyInflationRatePct}
                                    onChange={(e) => setMonthlyInflationRatePct(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                                <div className="text-[11px] text-[#192631]/70 mt-1">
                                    يغطي زيادات أسعار الخامات والوقود المتوقعة طوال فترة التنفيذ ({projectDurationMonths} شهور)
                                </div>
                            </div>

                            {/* Target Profit Margin % & Negotiation Buffer % */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#123524]/25 p-3.5">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-[#192631]">4. هامش الربح المستهدف (Target Profit)</span>
                                        <span className="font-black text-[#123524]">
                                            {targetProfitPct.toFixed(1)}% (+{formatEgp(tenderTotals.targetProfitValue)} EGP)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={5}
                                        max={35}
                                        step={0.5}
                                        disabled={isContractLocked}
                                        value={targetProfitPct}
                                        onChange={(e) => setTargetProfitPct(Number(e.target.value))}
                                        className="w-full accent-emerald-400"
                                    />
                                </div>

                                <div className="rounded-xl bg-[#f5f5f5]/85 border border-teal-500/30 p-3.5">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-[#192631]">5. هامش أمان التفاوض (Buffer %)</span>
                                        <span className="font-black text-teal-300">
                                            {negotiationBufferPct.toFixed(1)}% (+{formatEgp(tenderTotals.negotiationBufferValue)} EGP)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={12}
                                        step={0.5}
                                        disabled={isContractLocked}
                                        value={negotiationBufferPct}
                                        onChange={(e) => setNegotiationBufferPct(Number(e.target.value))}
                                        className="w-full accent-teal-400"
                                    />
                                </div>
                            </div>

                            {/* Tax Structure Selector */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-3.5 space-y-2.5">
                                <div className="text-xs font-bold text-[#192631]">
                                    6. المعاملة الضريبية للعقد (Taxes: VAT {vatTaxPct}% | Table Tax {tableTaxPct}% | Withholding {withholdingTaxPct}%)
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setActiveTaxMode('contracting_5')}
                                        className={`p-2.5 rounded-lg border text-xs font-bold text-start cursor-pointer ${
                                            activeTaxMode === 'contracting_5'
                                                ? 'bg-[#e04b2a]/10 border-orange-500 text-[#e04b2a]'
                                                : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/70'
                                        }`}
                                    >
                                        <div>ضريبة جدول مقاولات ({tableTaxPct}%)</div>
                                        <div className="text-[10px] opacity-80">+ خصم منبع {withholdingTaxPct}%</div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTaxMode('vat_14')}
                                        className={`p-2.5 rounded-lg border text-xs font-bold text-start cursor-pointer ${
                                            activeTaxMode === 'vat_14'
                                                ? 'bg-[#e04b2a]/10 border-orange-500 text-[#e04b2a]'
                                                : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/70'
                                        }`}
                                    >
                                        <div>ضريبة قيمة مضافة كاملة ({vatTaxPct}%)</div>
                                        <div className="text-[10px] opacity-80">+ خصم منبع {withholdingTaxPct}%</div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTaxMode('net_untaxed')}
                                        className={`p-2.5 rounded-lg border text-xs font-bold text-start cursor-pointer ${
                                            activeTaxMode === 'net_untaxed'
                                                ? 'bg-[#e04b2a]/10 border-orange-500 text-[#e04b2a]'
                                                : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/70'
                                        }`}
                                    >
                                        <div>تعاقد أهلي صافي (بدون ضرائب)</div>
                                        <div className="text-[10px] opacity-80">0% ضريبة مبيعات</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 5 Columns: Interactive Client Negotiation Discount Simulator (Eng. Pierre's Traffic-Light Rule) */}
                    <div className="lg:col-span-5 rounded-2xl border border-[#192631]/10 bg-white/85 backdrop-blur-xl p-5 flex flex-col justify-between space-y-5">
                        <div className="space-y-4">
                            <div className="border-b border-[#192631]/10 pb-3">
                                <h3 className="text-base font-black text-[#192631] flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-[#123524]" />
                                    <span>محاكي التفاوض والخصم التجاري مع العميل</span>
                                </h3>
                                <p className="text-xs text-[#192631]/70 mt-1">
                                    اختبر تأثير الخصم المطلوب من العميل قبل الموافقة عليه لحماية التكلفة المباشرة وغير المباشرة
                                </p>
                            </div>

                            {/* Client Discount Slider */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#192631]">
                                        خصم التفاوض المطلوب من العميل (Client Discount %):
                                    </span>
                                    <span className="text-lg font-black text-[#e04b2a]">
                                        {clientDiscountPct.toFixed(1)}% (-{formatEgp(tenderTotals.discountValueEgp)} EGP)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={30}
                                    step={0.5}
                                    value={clientDiscountPct}
                                    onChange={(e) => setClientDiscountPct(Number(e.target.value))}
                                    className="w-full accent-orange-500"
                                />
                                <div className="flex justify-between text-[10px] text-[#192631]/70">
                                    <span>0% (بدون خصم)</span>
                                    <span>حد الأمان ({negotiationBufferPct}%)</span>
                                    <span>حد التعادل بدون ربح</span>
                                    <span>30%</span>
                                </div>
                            </div>

                            {/* Live Traffic-Light Indicator (GREEN / AMBER / RED ZONE) */}
                            {tenderTotals.zone === 'GREEN' && (
                                <div className="rounded-xl bg-[#123524]/10 border-2 border-emerald-500 p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-[#123524] font-black text-sm">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <span>GREEN ZONE — آمن للموافقة (Within Negotiation Buffer)</span>
                                    </div>
                                    <p className="text-xs text-emerald-100 leading-relaxed">
                                        الخصم المطلوب ({clientDiscountPct}%) يقع بالكامل داخل هامش أمان التفاوض ({negotiationBufferPct}%). هامش الربح المستهدف للشركة ({targetProfitPct}%) محمي بالكامل بالإضافة إلى تغطية التضخم والمخاطر ومصاريف الموقع.
                                    </p>
                                </div>
                            )}

                            {tenderTotals.zone === 'AMBER' && (
                                <div className="rounded-xl bg-amber-500/15 border-2 border-amber-500 p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-[#b45309] font-black text-sm">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <span>AMBER ZONE — تآكل هامش الربح الصافي (Profit Erosion Warning)</span>
                                    </div>
                                    <p className="text-xs text-amber-100 leading-relaxed">
                                        الخصم تجاوز هامش التفاوض وبدأ يقتطع من صافي ربح الشركة! انخفض صافي الربح إلى{' '}
                                        <strong>{tenderTotals.remainingProfitPctOfPrime.toFixed(1)}%</strong> ({formatEgp(tenderTotals.remainingProfitEgp)} ج.م). يتطلب موافقة مدير التسعير أو الإدارة العليا.
                                    </p>
                                </div>
                            )}

                            {tenderTotals.zone === 'RED' && (
                                <div className="rounded-xl bg-rose-500/20 border-2 border-rose-500 p-4 space-y-2 animate-pulse">
                                    <div className="flex items-center gap-2 text-red-700 font-black text-sm">
                                        <ShieldAlert className="w-5 h-5 shrink-0" />
                                        <span>RED ZONE (DANGER) — خطر: الخصم يمس التكلفة الفعلية والمصاريف غير المباشرة!</span>
                                    </div>
                                    <p className="text-xs text-rose-100 leading-relaxed">
                                        تحذير م. بيير: هذا الخصم التهم الربح بالكامل وبدأ يقتطع من مخصص التضخم والمخاطر والتكلفة الفعلية للموقع! الموافقة على هذا الخصم تعني تحقيق خسارة مباشرة قدرها{' '}
                                        <strong>{formatEgp(Math.abs(tenderTotals.remainingProfitEgp))} ج.م</strong>.
                                    </p>
                                </div>
                            )}

                            {/* Financial Waterfall Summary */}
                            <div className="rounded-xl bg-[#f5f5f5]/85 border border-[#192631]/10 p-4 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#192631]/70">1. إجمالي التكلفة المباشرة للبنود (Direct M+L+S):</span>
                                    <span className="font-bold text-[#192631]">{formatEgp(tenderTotals.directCost)} EGP</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#192631]/70">2. المصاريف غير المباشرة للموقع ({projectDurationMonths} شهور):</span>
                                    <span className="font-bold text-[#192631]">+{formatEgp(tenderTotals.indirectSiteOverhead)} EGP</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#192631]/70">3. المخاطر + الإدارة + التضخم ({riskContingencyPct + adminGaPct + cumulativeInflationPct}%):</span>
                                    <span className="font-bold text-[#192631]">
                                        +{formatEgp(tenderTotals.riskValue + tenderTotals.adminGaValue + tenderTotals.inflationValue)} EGP
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-[#192631]/10 pt-1.5 font-black text-[#192631]">
                                    <span>= الحد الأدنى للتكلفة قبل الربح (Cost Floor):</span>
                                    <span>{formatEgp(tenderTotals.costFloorBeforeProfit)} EGP</span>
                                </div>
                                <div className="flex justify-between text-[#123524]">
                                    <span>+ الربح المستهدف وهامش التفاوض ({targetProfitPct + negotiationBufferPct}%):</span>
                                    <span className="font-bold">
                                        +{formatEgp(tenderTotals.targetProfitValue + tenderTotals.negotiationBufferValue)} EGP
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-[#192631]/10 pt-1.5 font-black text-[#b45309]">
                                    <span>= إجمالي العطاء قبل الخصم (Gross Tender):</span>
                                    <span>{formatEgp(tenderTotals.grossSellingBeforeTax)} EGP</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>- خصم التفاوض الممنوح للعميل (-{clientDiscountPct}%):</span>
                                    <span className="font-bold">-{formatEgp(tenderTotals.discountValueEgp)} EGP</span>
                                </div>
                                <div className="flex justify-between border-t border-[#123524]/25 pt-2 text-sm font-black text-[#123524]">
                                    <span>= صافي قيمة التعاقد بعد الخصم (Net Contract):</span>
                                    <span>{formatEgp(tenderTotals.netSellingAfterDiscount)} EGP</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-[#192631]/70 pt-1">
                                    <span>الإجمالي المستحق شامل الضريبة وخصم المنبع:</span>
                                    <span className="font-bold text-[#192631]">
                                        {formatEgp(tenderTotals.finalContractPayableIncTax)} EGP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingEngineHub;
