/**
 * Nexus Document Coding System, Abbreviations Matrix, and 51 Submittal Clauses
 * Source: Nexus Engineering / REA Submittals & Document Control Standards
 */

export type SubmittalLogTypeCode = 'MS' | 'DR' | 'MIR' | 'SL' | 'SIR';
export type SubmittalCategoryCode = 'AR' | 'CV' | 'EL' | 'MC';
export type SubmittalCategoryKey = 'ARCH' | 'CIVIL' | 'ELEC' | 'MECH';

export interface SubmittalLogType {
  code: 'MS' | 'DR' | 'MIR' | 'SL' | 'SIR';
  nameEn: string;
  nameAr: string;
  description: string;
}

export interface SubmittalCategoryDef {
  code: 'AR' | 'CV' | 'EL' | 'MC';
  key: 'ARCH' | 'CIVIL' | 'ELEC' | 'MECH';
  nameEn: string;
  nameAr: string;
  color: string;
}

export interface SubmittalSubCategoryDef {
  id: number;
  categoryKey: 'ARCH' | 'CIVIL' | 'ELEC' | 'MECH';
  catCode: 'AR' | 'CV' | 'EL' | 'MC';
  subCode: string;
  descriptionEn: string;
  descriptionAr: string;
  exampleMsCode: string;
}

export interface NexusFileCodingItem {
  code: string;
  pattern: string;
  exampleCode: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface NexusFileCodingRule {
  id: string;
  sectionCode: string;
  folderName: string;
  departmentEn: string;
  departmentAr: string;
  purposeEn: string;
  purposeAr: string;
  syntaxFormula: string;
  items: NexusFileCodingItem[];
}

export interface NexusAbbreviationEntry {
  code: string;
  meaningEn: string;
  meaningAr: string;
  department: string;
  departmentAr: string;
  sampleCode: string;
  category: 'FOLDER' | 'TENDER' | 'DOC_CONTROL' | 'TECHNICAL' | 'FINANCE_PROCUREMENT' | 'SUBMITTAL_TYPE' | 'DISCIPLINE';
}

/**
 * 5 Standard Submittal Log Types
 */
export const SUBMITTAL_LOG_TYPES: SubmittalLogType[] = [
  {
    code: 'MS',
    nameEn: 'Material Submittal',
    nameAr: 'اعتماد خامات وعينات',
    description: 'Technical datasheets, physical samples, compliance statements, and manufacturer catalogs submitted for consultant/client approval prior to procurement.',
  },
  {
    code: 'DR',
    nameEn: 'Shop Drawing Submittal',
    nameAr: 'اعتماد رسومات تشغيلية',
    description: 'Detailed fabrication, coordination, and installation shop drawings prepared by the technical office for site execution approval.',
  },
  {
    code: 'MIR',
    nameEn: 'Material Inspection Request',
    nameAr: 'طلب فحص واستلام خامات بالموقع',
    description: 'On-site inspection and verification of delivered materials against approved Material Submittals (MS), delivery notes, and batch certificates.',
  },
  {
    code: 'SL',
    nameEn: 'Supplier / Vendor List Submittal',
    nameAr: 'اعتماد قائمة موردين ومقاولي باطن',
    description: 'Pre-qualification packages, company profiles, previous experience, and commercial registrations for proposed suppliers, manufacturers, and subcontractors.',
  },
  {
    code: 'SIR',
    nameEn: 'Site Inspection Request',
    nameAr: 'طلب فحص واستلام أعمال بالموقع',
    description: 'Formal request for consultant/engineer inspection and sign-off on executed site works (WIR/SIR) before proceeding to subsequent stages.',
  },
];

export const NEXUS_SUBMITTAL_LOG_TYPES = SUBMITTAL_LOG_TYPES;

/**
 * 4 Main Engineering Disciplines / Submittal Categories
 */
export const SUBMITTAL_CATEGORIES: SubmittalCategoryDef[] = [
  {
    code: 'AR',
    key: 'ARCH',
    nameEn: 'Architectural & Interior Finishes',
    nameAr: 'الأعمال المعمارية والتشطيبات الداخلية',
    color: '#3b82f6', // Blue
  },
  {
    code: 'CV',
    key: 'CIVIL',
    nameEn: 'Civil & Structural Works',
    nameAr: 'الأعمال المدنية والإنشائية',
    color: '#f59e0b', // Amber
  },
  {
    code: 'EL',
    key: 'ELEC',
    nameEn: 'Electrical & Light Current',
    nameAr: 'الأعمال الكهربائية والتيار الخفيف',
    color: '#eab308', // Yellow/Gold
  },
  {
    code: 'MC',
    key: 'MECH',
    nameEn: 'Mechanical, Plumbing & HVAC (MEP)',
    nameAr: 'الأعمال الميكانيكية والصحية والتكييف',
    color: '#10b981', // Emerald
  },
];

export const NEXUS_SUBMITTAL_CATEGORIES = SUBMITTAL_CATEGORIES;

/**
 * Complete 51 Submittal Clauses across ARCH (28), CIVIL (8), ELEC (7), and MECH (8)
 */
export const SUBMITTAL_SUBCATEGORIES: SubmittalSubCategoryDef[] = [
  // ==================== ARCH (AR) — Clauses 1 to 28 ====================
  {
    id: 1,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'DE',
    descriptionEn: 'Demolishing & Construction Works',
    descriptionAr: 'أعمال التعديلات والتكسير والمباني',
    exampleMsCode: 'MSARDE01',
  },
  {
    id: 2,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'DS',
    descriptionEn: 'Doors',
    descriptionAr: 'الأبواب الخشبية والمصفحة',
    exampleMsCode: 'MSARDS01',
  },
  {
    id: 3,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'MS',
    descriptionEn: 'Marble & Stone',
    descriptionAr: 'الرخام والجرانيت والأحجار',
    exampleMsCode: 'MSARMS01',
  },
  {
    id: 4,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'PS',
    descriptionEn: 'Plaster Works',
    descriptionAr: 'أعمال البياض واللياسة',
    exampleMsCode: 'MSARPS01',
  },
  {
    id: 5,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'WI',
    descriptionEn: 'Thermal Insulation Works',
    descriptionAr: 'أعمال العزل الحراري',
    exampleMsCode: 'MSARWI01',
  },
  {
    id: 6,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'HI',
    descriptionEn: 'Waterproofing / Moisture Insulation',
    descriptionAr: 'أعمال العزل المائي والرطوبة',
    exampleMsCode: 'MSARHI01',
  },
  {
    id: 7,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'TL',
    descriptionEn: 'Ceramic & Porcelain Tiles',
    descriptionAr: 'أعمال السيراميك والبورسلين',
    exampleMsCode: 'MSARTL01',
  },
  {
    id: 8,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'GP',
    descriptionEn: 'Gypsum Board & Suspended Ceilings',
    descriptionAr: 'أعمال الجبس بورد والأسقف المعلقة',
    exampleMsCode: 'MSARGP01',
  },
  {
    id: 9,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'PN',
    descriptionEn: 'Painting & Putty Works',
    descriptionAr: 'أعمال الدهانات والمعجون',
    exampleMsCode: 'MSARPN01',
  },
  {
    id: 10,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'WP',
    descriptionEn: 'Wallpaper & Wall Cladding',
    descriptionAr: 'أعمال ورق الحائط والتجاليد',
    exampleMsCode: 'MSARWP01',
  },
  {
    id: 11,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'FT',
    descriptionEn: 'Furniture & Fixed Joinery',
    descriptionAr: 'الأثاث الثابت والأخشاب',
    exampleMsCode: 'MSARFT01',
  },
  {
    id: 12,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'AL',
    descriptionEn: 'Aluminum Windows & Shutters',
    descriptionAr: 'أعمال الألوميتال والشتر',
    exampleMsCode: 'MSARAL01',
  },
  {
    id: 13,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'SH',
    descriptionEn: 'Shower Cabins & Securit Glass',
    descriptionAr: 'كبائن الشاور والزجاج السيكوريت',
    exampleMsCode: 'MSARSH01',
  },
  {
    id: 14,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'CPD',
    descriptionEn: 'Carpentry Doors & Frames',
    descriptionAr: 'حلوق وأبواب نجارة',
    exampleMsCode: 'MSARCPD01',
  },
  {
    id: 15,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'CPU',
    descriptionEn: 'Carpentry Dressing & Wardrobes',
    descriptionAr: 'غرف الملابس والدريسنج',
    exampleMsCode: 'MSARCPU01',
  },
  {
    id: 16,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'CPF',
    descriptionEn: 'Carpentry Kitchens & Vanity Units',
    descriptionAr: 'المطابخ ووحدات الحمامات',
    exampleMsCode: 'MSARCPF01',
  },
  {
    id: 17,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'CPA',
    descriptionEn: 'Carpentry Accessories & Hardware',
    descriptionAr: 'إكسسوارات وخردوات النجارة',
    exampleMsCode: 'MSARCPA01',
  },
  {
    id: 18,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'HD',
    descriptionEn: 'Handrails & Metal Balustrades',
    descriptionAr: 'الهاندريل والدرابزين المعدني/الزجاجي',
    exampleMsCode: 'MSARHD01',
  },
  {
    id: 19,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'SP',
    descriptionEn: 'Swimming Pools & Water Features',
    descriptionAr: 'حمامات السباحة والنوافير',
    exampleMsCode: 'MSARSP01',
  },
  {
    id: 20,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'PQ',
    descriptionEn: 'Parquet & HDF Flooring',
    descriptionAr: 'الأرضيات الباركيه والـ HDF',
    exampleMsCode: 'MSARPQ01',
  },
  {
    id: 21,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'MB',
    descriptionEn: 'Masonry Bricks & Blocks',
    descriptionAr: 'الطوب والبلوك الأسمنتي/الطفلي',
    exampleMsCode: 'MSARMB01',
  },
  {
    id: 22,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'SS',
    descriptionEn: 'Structural Steel & Pergolas',
    descriptionAr: 'الأعمال المعدنية والبرجولات',
    exampleMsCode: 'MSARSS01',
  },
  {
    id: 23,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'CR',
    descriptionEn: 'Curtains & Roller Blinds',
    descriptionAr: 'الستائر والفرش',
    exampleMsCode: 'MSARCR01',
  },
  {
    id: 24,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'PR',
    descriptionEn: 'Protective Coatings & Epoxy',
    descriptionAr: 'الدهانات الإيبوكسية والحماية',
    exampleMsCode: 'MSARPR01',
  },
  {
    id: 25,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'LS',
    descriptionEn: 'Hardscape & Landscape Works',
    descriptionAr: 'أعمال اللاندسكيب والهاردسكيب',
    exampleMsCode: 'MSARLS01',
  },
  {
    id: 26,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'MQ',
    descriptionEn: 'Mosquito Nets & Fly Screens',
    descriptionAr: 'سلك الناموس والبلسيه',
    exampleMsCode: 'MSARMQ01',
  },
  {
    id: 27,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'CL',
    descriptionEn: 'Facade Cladding & GRC/FUTEC',
    descriptionAr: 'تجاليد الواجهات والفيوتك والـ GRC',
    exampleMsCode: 'MSARCL01',
  },
  {
    id: 28,
    categoryKey: 'ARCH',
    catCode: 'AR',
    subCode: 'TG',
    descriptionEn: 'Tempered Glass Partitions',
    descriptionAr: 'قواطع الزجاج السيكوريت',
    exampleMsCode: 'MSARTG01',
  },

  // ==================== CIVIL (CV) — Clauses 29 to 36 ====================
  {
    id: 29,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'DN',
    descriptionEn: 'Dewatering & Excavation',
    descriptionAr: 'أعمال الحفر ونزح المياه',
    exampleMsCode: 'MSCVDN01',
  },
  {
    id: 30,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'CN',
    descriptionEn: 'Plain & Reinforced Concrete',
    descriptionAr: 'الخرسانة العادية والمسلحة',
    exampleMsCode: 'MSCVCN01',
  },
  {
    id: 31,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'FN',
    descriptionEn: 'Foundations & Soil Replacement',
    descriptionAr: 'الأساسات والإحلال',
    exampleMsCode: 'MSCVFN01',
  },
  {
    id: 32,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'AS',
    descriptionEn: 'Asphalt & Road Works',
    descriptionAr: 'أعمال الأسفلت والطرق',
    exampleMsCode: 'MSCVAS01',
  },
  {
    id: 33,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'CT',
    descriptionEn: 'Concrete Testing & Grouting',
    descriptionAr: 'اختبارات الخرسانة والجراوت',
    exampleMsCode: 'MSCVCT01',
  },
  {
    id: 34,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'ST',
    descriptionEn: 'Steel Reinforcement Rebar',
    descriptionAr: 'حديد التسليح',
    exampleMsCode: 'MSCVST01',
  },
  {
    id: 35,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'CC',
    descriptionEn: 'Chemical Anchors & Epoxies',
    descriptionAr: 'تزريع الأشاير والكيماويات',
    exampleMsCode: 'MSCVCC01',
  },
  {
    id: 36,
    categoryKey: 'CIVIL',
    catCode: 'CV',
    subCode: 'CO',
    descriptionEn: 'Concrete Curing & Admixtures',
    descriptionAr: 'إضافات ومعالجة الخرسانة',
    exampleMsCode: 'MSCVCO01',
  },

  // ==================== ELEC (EL) — Clauses 37 to 43 ====================
  {
    id: 37,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'EL',
    descriptionEn: 'Electrical Conduits, Wires & Panels',
    descriptionAr: 'اللوحات والخراطيم والأسلاك الكهربائية',
    exampleMsCode: 'MSELEL01',
  },
  {
    id: 38,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'LW',
    descriptionEn: 'Light Current, CCTV, Data & Smart Home',
    descriptionAr: 'التيار الخفيف، الكاميرات، الداتا والسمارت هوم',
    exampleMsCode: 'MSELLW01',
  },
  {
    id: 39,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'LT',
    descriptionEn: 'Lighting Fixtures, Spots & LED Profiles',
    descriptionAr: 'وحدات الإضاءة والسبوتات والبروفايل ليد',
    exampleMsCode: 'MSELLT01',
  },
  {
    id: 40,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'SW',
    descriptionEn: 'Wiring Devices, Switches & Sockets',
    descriptionAr: 'اللقم والمفاتيح والبرايز والشاسيهات',
    exampleMsCode: 'MSELSW01',
  },
  {
    id: 41,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'CB',
    descriptionEn: 'Main Feeder Cables & Cable Trays',
    descriptionAr: 'الكابلات الرئيسية وحوامل الكابلات',
    exampleMsCode: 'MSELCB01',
  },
  {
    id: 42,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'GN',
    descriptionEn: 'Generators, UPS & Stabilizers',
    descriptionAr: 'المولدات ومثبتات الجهد والـ UPS',
    exampleMsCode: 'MSELGN01',
  },
  {
    id: 43,
    categoryKey: 'ELEC',
    catCode: 'EL',
    subCode: 'EA',
    descriptionEn: 'Earthing & Lightning Protection',
    descriptionAr: 'نظام التأريض ومانع الصواعق',
    exampleMsCode: 'MSELEA01',
  },

  // ==================== MECH (MC) — Clauses 44 to 51 ====================
  {
    id: 44,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'PL',
    descriptionEn: 'Plumbing Water Supply & Drainage Pipes',
    descriptionAr: 'مواسير التغذية والصرف الصحي',
    exampleMsCode: 'MSMCPL01',
  },
  {
    id: 45,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'AC',
    descriptionEn: 'HVAC Split, Concealed & VRF Systems',
    descriptionAr: 'أعمال التكييف والداكت والـ VRF',
    exampleMsCode: 'MSMCAC01',
  },
  {
    id: 46,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'CS',
    descriptionEn: 'Sanitary Ware, Mixers & Concealed Cisterns',
    descriptionAr: 'الأجهزة الصحية والخلاطات وصناديق الدفن',
    exampleMsCode: 'MSMCCS01',
  },
  {
    id: 47,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'FF',
    descriptionEn: 'Fire Fighting & Alarm Systems',
    descriptionAr: 'أنظمة مكافحة الحريق والإنذار',
    exampleMsCode: 'MSMCFF01',
  },
  {
    id: 48,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'HT',
    descriptionEn: 'Underfloor & Central Heating Systems',
    descriptionAr: 'أنظمة التدفئة المركزية وتدفئة الأرضيات',
    exampleMsCode: 'MSMCHT01',
  },
  {
    id: 49,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'VT',
    descriptionEn: 'Ventilation & Exhaust Fans',
    descriptionAr: 'مراوح الشفط والتهوية الميكانيكية',
    exampleMsCode: 'MSMCVT01',
  },
  {
    id: 50,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'PM',
    descriptionEn: 'Booster & Submersible Pumps',
    descriptionAr: 'طلمبات رفع المياه والغاطسة',
    exampleMsCode: 'MSMCPM01',
  },
  {
    id: 51,
    categoryKey: 'MECH',
    catCode: 'MC',
    subCode: 'WH',
    descriptionEn: 'Water Heaters, Boilers & Filters',
    descriptionAr: 'السخانات والغلايات وفلاتر معالجة المياه',
    exampleMsCode: 'MSMCWH01',
  },
];

export const NEXUS_SUBMITTAL_SUBCATEGORIES = SUBMITTAL_SUBCATEGORIES;
export const NEXUS_SUBMITTAL_CLAUSES = SUBMITTAL_SUBCATEGORIES;

/**
 * Complete Nexus File-Coding Standards from Team CSV
 */
export const NEXUS_FILE_CODING_RULES: NexusFileCodingRule[] = [
  {
    id: '01-TDC',
    sectionCode: '01. TDC',
    folderName: '01. TDC (Tender Documents)',
    departmentEn: 'Tendering & Contracts',
    departmentAr: 'إدارة العطاءات والمناقصات',
    purposeEn: 'Baseline client tender package documents, BOQs, tender drawings, specifications, and vendor lists.',
    purposeAr: 'مستندات طرح العطاء الأساسية، المقايسات، رسومات الطرح، المواصفات الفنية، وقوائم الموردين المعتمدين.',
    syntaxFormula: '[ProjectCode]-TDC-[DocType]-[Discipline?]-[RevNo]',
    items: [
      {
        code: 'RFP',
        pattern: 'C000-TDC-RFP-00',
        exampleCode: 'C000-TDC-RFP-00',
        titleEn: 'Request for Proposal (RFP)',
        titleAr: 'كراسة الشروط وطلب تقديم العروض',
        descriptionEn: 'Client invitation to tender, commercial conditions, and scope instructions.',
        descriptionAr: 'خطاب الدعوة للعطاء والشروط العامة والخاصة ونطاق الأعمال.',
      },
      {
        code: 'BOQ',
        pattern: 'C000-TDC-BOQ-00',
        exampleCode: 'C000-TDC-BOQ-00',
        titleEn: 'Bill of Quantities (Unpriced Tender BOQ)',
        titleAr: 'مقايسة الأعمال الكمية (بدون أسعار)',
        descriptionEn: 'Official baseline Bill of Quantities issued with tender documents.',
        descriptionAr: 'جدول الكميات والمقايسة التعاقدية الصادرة من الاستشاري/المالك.',
      },
      {
        code: 'DWG',
        pattern: 'C000-TDC-DWG-[DISC]-00',
        exampleCode: 'C000-TDC-DWG-AR-00',
        titleEn: 'Tender Drawings by Discipline (AR / CV / EL / MC)',
        titleAr: 'رسومات الطرح والتعاقد حسب التخصص',
        descriptionEn: 'Issued-for-tender or contract drawings segregated by discipline code (e.g., AR, CV, EL, MC).',
        descriptionAr: 'المخططات الهندسية الخاصة بالعطاء مقسمة حسب التخصص (معماري، إنشائي، كهرباء، ميكانيكا).',
      },
      {
        code: 'SPC',
        pattern: 'C000-TDC-SPC-00',
        exampleCode: 'C000-TDC-SPC-00',
        titleEn: 'Technical Specifications',
        titleAr: 'المواصفات الفنية للمشروع',
        descriptionEn: 'Standard and particular technical specifications governing materials and workmanship.',
        descriptionAr: 'المواصفات الفنية العامة والخاصة المعتمدة لتنفيذ البنود.',
      },
      {
        code: 'VND',
        pattern: 'C000-TDC-VND-00',
        exampleCode: 'C000-TDC-VND-00',
        titleEn: 'Approved Vendor List (AVL)',
        titleAr: 'قائمة الموردين والمصنعين المعتمدين',
        descriptionEn: 'Client/Consultant master list of pre-approved manufacturers and suppliers.',
        descriptionAr: 'قائمة الشركات والمصانع المعتمدة من الاستشاري لتوريد الخامات.',
      },
    ],
  },
  {
    id: '02-DC',
    sectionCode: '02. DC',
    folderName: '02. DC (Document Control)',
    departmentEn: 'Document Control & Project Management',
    departmentAr: 'مراقبة المستندات وإدارة المشروعات',
    purposeEn: 'Registers, transmittals, RFIs, minutes of meetings, and site inspection logs.',
    purposeAr: 'سجلات المشروع، حافظات الإرسال، طلبات الاستفسار الفني، محاضر الاجتماعات، وتقارير الموقع.',
    syntaxFormula: '[ProjectCode]-DC-[DocType]-[SeqNo]',
    items: [
      {
        code: 'LOG',
        pattern: 'C000-DC-LOG-00',
        exampleCode: 'C000-DC-LOG-00',
        titleEn: 'Master Submittal & Document Control Log',
        titleAr: 'السجل الرئيسي للاعتمادات والمستندات',
        descriptionEn: 'Central tracking log for submittals (MS, DR, MIR, SL, SIR), RFIs, and correspondence.',
        descriptionAr: 'شيت المتابعة المركزي لحالة الاعتمادات والمراسلات ونسب الإنجاز.',
      },
      {
        code: 'TRN',
        pattern: 'C000-DC-TRN-0001',
        exampleCode: 'C000-DC-TRN-0001',
        titleEn: 'Document Transmittal Note',
        titleAr: 'حافظة إرسال مستندات وعينات',
        descriptionEn: 'Official cover sheet logging outgoing or incoming physical samples, drawings, and documents.',
        descriptionAr: 'نموذج تسليم واستلام رسمي للمستندات أو العينات بين المقاول والاستشاري.',
      },
      {
        code: 'RFI',
        pattern: 'C000-DC-RFI-0001',
        exampleCode: 'C000-DC-RFI-0001',
        titleEn: 'Request for Information (RFI)',
        titleAr: 'طلب استفسار وتوضيح فني',
        descriptionEn: 'Formal query raised to resolve design discrepancies, missing dimensions, or site clashes.',
        descriptionAr: 'طلب رسمي للاستشاري لتوضيح تعارض في الرسومات أو تفاصيل تنفيذية.',
      },
      {
        code: 'MOM',
        pattern: 'C000-DC-MOM-0001',
        exampleCode: 'C000-DC-MOM-0001',
        titleEn: 'Minutes of Meeting (MOM)',
        titleAr: 'محضر اجتماع دوري / تنسيقي',
        descriptionEn: 'Recorded decisions, action items, owners, and target dates from progress meetings.',
        descriptionAr: 'توثيق قرارات الاجتماعات والمهام المطلوبة وتواريخ التنفيذ.',
      },
      {
        code: 'SIT',
        pattern: 'C000-DC-SIT-0001',
        exampleCode: 'C000-DC-SIT-0001',
        titleEn: 'Site Instruction / Site Report',
        titleAr: 'تعليمات موقع / تقرير معاينة موقع',
        descriptionEn: 'Field observations, site instructions, or daily/weekly site progress documentation.',
        descriptionAr: 'تقرير حالة الموقع أو تعليمات الاستشاري الصادرة أثناء المرور الميداني.',
      },
    ],
  },
  {
    id: '03-TC',
    sectionCode: '03. TC',
    folderName: '03. TC (Technical / Tendering & Pricing)',
    departmentEn: 'Technical Office & Cost Estimation',
    departmentAr: 'المكتب الفني والتسعير',
    purposeEn: 'Priced BOQs, dry/indirect cost rate breakdowns, technical sketches, and variation orders.',
    purposeAr: 'المقايسات المسعرة، تحليل الأسعار، الاسكتشات الفنية، وأوامر التغيير.',
    syntaxFormula: '[ProjectCode]-TC-[DocType]-[RevOrSeq]',
    items: [
      {
        code: 'PRC',
        pattern: 'C000-TC-PRC-R00',
        exampleCode: 'C000-TC-PRC-R00',
        titleEn: 'Priced Financial Offer / Priced BOQ',
        titleAr: 'العرض المالي والمقايسة المسعرة',
        descriptionEn: 'Commercial offer sheet with unit selling rates, total item values, and revision tracking.',
        descriptionAr: 'جدول الكميات مسعراً شاملاً فئات البيع والإجماليات لكل مراجعة.',
      },
      {
        code: 'RAT',
        pattern: 'C000-TC-rat-R00',
        exampleCode: 'C000-TC-rat-R00',
        titleEn: 'Rates Breakdown & Cost Analysis Sheet',
        titleAr: 'شيت تحليل الأسعار والتكلفة المباشرة (Dry Cost)',
        descriptionEn: 'Detailed breakdown of material, labor, equipment, wastage, and markup per BOQ item.',
        descriptionAr: 'تفصيل التكلفة المباشرة (خامات، مصنعيات، هالك) ونسبة الربح والمصاريف الإدارية.',
      },
      {
        code: 'SKT',
        pattern: 'C000-TC-SKT-0001',
        exampleCode: 'C000-TC-SKT-0001',
        titleEn: 'Technical Sketch / Coordination Proposal',
        titleAr: 'اسكتش فني / مقترح تعديل معماري أو تنفيذي',
        descriptionEn: 'Quick engineering sketch or design modification proposal prior to full shop drawing issue.',
        descriptionAr: 'رسم توضيحي سريع لحل تفصيلة بالموقع أو اقتراح تعديل قبل إصدار الشوب دروينج.',
      },
      {
        code: 'VOO',
        pattern: 'C000-TC-VOO-0001',
        exampleCode: 'C000-TC-VOO-0001',
        titleEn: 'Variation Order (VO)',
        titleAr: 'أمر تغيير / بنود مستجدة (Variation Order)',
        descriptionEn: 'Cost and schedule impact assessment for newly added items or scope changes.',
        descriptionAr: 'حصر وتسعير البنود الإضافية أو التعديلات غير الواردة في المقايسة الأصلية.',
      },
    ],
  },
  {
    id: '04-CONTRACTS-FINANCE',
    sectionCode: '04. C000 / MC000 / FIN',
    folderName: '04. Contracting, Procurement & Financial Operations',
    departmentEn: 'Contracts, Procurement & Project Accounting',
    departmentAr: 'التعاقدات والمشتريات والحسابات',
    purposeEn: 'Master project folders, management contracts, purchase orders, petty cash, payments, subcontractor statements, and client invoices.',
    purposeAr: 'ملفات التعاقد، عقود الإدارة، أوامر الشراء، تسويات العهد، إثباتات الدفع، ومستخلصات المقاولين والعملاء.',
    syntaxFormula: '[ProjectCode]-[DocType]-[SeqNo]_[PartyName]_[DateOrExtractNo]',
    items: [
      {
        code: 'C000',
        pattern: 'C000_Client Name_YYYY_MM_DD_Location',
        exampleCode: 'C000_Client Name_YYYY_MM_DD_Location',
        titleEn: 'Contracting / Active Turnkey Project Root Folder',
        titleAr: 'ملف مشروع مقاولات متكامل (Turnkey / Lump Sum)',
        descriptionEn: 'Standard naming convention for main contracting project directories.',
        descriptionAr: 'التسمية القياسية للمجلد الرئيسي لمشروعات المقاولات والتشطيبات المتكاملة.',
      },
      {
        code: 'MC000',
        pattern: 'MC000_Client Name_YYYY_MM_DD_Location',
        exampleCode: 'MC000_Client Name_YYYY_MM_DD_Location',
        titleEn: 'Management Contract Project Root Folder (Cost-Plus / PM)',
        titleAr: 'ملف مشروع إدارة وتنفيذ بنسبة إشراف (Management Contract)',
        descriptionEn: 'Standard naming convention for Cost-Plus or Project Management fee contracts.',
        descriptionAr: 'التسمية القياسية للمشروعات المدارة بنظام نسبة الإشراف (Cost Plus).',
      },
      {
        code: 'NPO',
        pattern: 'C000-NPO-0001_Vendor_YYYY-MM-DD',
        exampleCode: 'C000-NPO-0001_Vendor_YYYY-MM-DD',
        titleEn: 'Normal Purchase Order (NPO)',
        titleAr: 'أمر توريد / شراء قياسي للموردين',
        descriptionEn: 'Issued purchase order to material suppliers with itemized quantities, prices, and delivery terms.',
        descriptionAr: 'أمر شراء رسمي صادر للمورد يحدد الكميات والأسعار ومواعيد التوريد.',
      },
      {
        code: 'RCB',
        pattern: 'C000-RCB-0001_Holder_YYYY-MM-DD',
        exampleCode: 'C000-RCB-0001_Holder_YYYY-MM-DD',
        titleEn: 'Reconciliation of Petty Cash Balance (عهدة)',
        titleAr: 'تسوية عهدة نقدية للموقع',
        descriptionEn: 'Site engineer or supervisor petty cash settlement sheet with attached receipts.',
        descriptionAr: 'كشف تسوية مصروفات العهدة النقدية لمهندس أو مشرف الموقع مرفقاً بالفواتير.',
      },
      {
        code: 'POP',
        pattern: 'C000-POP-0001_Beneficiary_YYYY-MM-DD',
        exampleCode: 'C000-POP-0001_Beneficiary_YYYY-MM-DD',
        titleEn: 'Proof of Payment (Bank Transfer / Check / Cash Receipt)',
        titleAr: 'إيصال / إثبات سداد وتحويل بنكي',
        descriptionEn: 'Archived bank transfer slip, InstaPay receipt, check copy, or signed cash voucher.',
        descriptionAr: 'مستند إثبات الدفع (صورة تحويل بنكي، إنستا باي، شيك، أو إيصال استلام نقدية).',
      },
      {
        code: 'CPO',
        pattern: 'C000-CPO-0001_Subcontractor_YYYY-MM-DD',
        exampleCode: 'C000-CPO-0001_Subcontractor_YYYY-MM-DD',
        titleEn: 'Cash Payment Order (أمر دفع)',
        titleAr: 'أمر صرف نقدي / دفعة مقاول باطن',
        descriptionEn: 'Internal payment authorization signed by technical office and project manager prior to disbursement.',
        descriptionAr: 'إذن صرف معتمد من المكتب الفني ومدير المشروع لصرف دفعة لمقاول أو مورد.',
      },
      {
        code: 'ST',
        pattern: 'C000-ST-0001_Subcontractor_No01',
        exampleCode: 'C000-ST-0001_Subcontractor_No01',
        titleEn: 'Subcontractor Statement (مستخلص مقاول باطن)',
        titleAr: 'مستخلص أعمال مقاول باطن',
        descriptionEn: 'Cumulative measurement sheet and financial statement for subcontractor executed works.',
        descriptionAr: 'مستخلص جاري أو ختامي يحسب كميات الأعمال المنفذة لمقاول الباطن والخصومات والاستقطاعات.',
      },
      {
        code: 'INV',
        pattern: 'C000-INV-0004_Client_YYYY-MM-DD',
        exampleCode: 'C000-INV-0004_Client_YYYY-MM-DD',
        titleEn: 'Client Invoice / Works Extract (مستخلص عميل)',
        titleAr: 'مطالبة مالية / مستخلص أعمال للعميل',
        descriptionEn: 'Official progress payment application or tax invoice submitted to the client.',
        descriptionAr: 'المطالبة المالية أو المستخلص المقدم للمالك لصرف الدفعات المرحلية.',
      },
    ],
  },
];

/**
 * Complete Dictionary of All 32 Nexus Abbreviations
 */
export const NEXUS_ABBREVIATIONS_DICTIONARY: NexusAbbreviationEntry[] = [
  // Main Folders / Divisions
  {
    code: 'TDC',
    meaningEn: 'Tender Documents',
    meaningAr: 'مستندات العطاء والطرح',
    department: 'Tendering & Contracts',
    departmentAr: 'العطاءات والتعاقدات',
    sampleCode: '01. TDC / C000-TDC-RFP-00',
    category: 'FOLDER',
  },
  {
    code: 'DC',
    meaningEn: 'Document Control',
    meaningAr: 'مراقبة المستندات (الدي سي)',
    department: 'Document Control',
    departmentAr: 'مراقبة المستندات',
    sampleCode: '02. DC / C000-DC-LOG-00',
    category: 'FOLDER',
  },
  {
    code: 'TC',
    meaningEn: 'Technical / Tendering & Costing',
    meaningAr: 'المكتب الفني والتسعير',
    department: 'Technical Office',
    departmentAr: 'المكتب الفني',
    sampleCode: '03. TC / C000-TC-PRC-R00',
    category: 'FOLDER',
  },

  // Tender Document Types
  {
    code: 'RFP',
    meaningEn: 'Request for Proposal',
    meaningAr: 'كراسة الشروط وطلب تقديم العروض',
    department: 'Tendering & Contracts',
    departmentAr: 'العطاءات والتعاقدات',
    sampleCode: 'C000-TDC-RFP-00',
    category: 'TENDER',
  },
  {
    code: 'BOQ',
    meaningEn: 'Bill of Quantities',
    meaningAr: 'جدول الكميات ومقايسة الأعمال',
    department: 'Tendering & Quantity Surveying',
    departmentAr: 'الحصر والعطاءات',
    sampleCode: 'C000-TDC-BOQ-00',
    category: 'TENDER',
  },
  {
    code: 'DWG',
    meaningEn: 'Engineering Drawings',
    meaningAr: 'الرسومات والمخططات الهندسية',
    department: 'Engineering / Design',
    departmentAr: 'الإدارة الهندسية',
    sampleCode: 'C000-TDC-DWG-AR-00',
    category: 'TENDER',
  },
  {
    code: 'SPC',
    meaningEn: 'Technical Specifications',
    meaningAr: 'المواصفات الفنية القياسية',
    department: 'Engineering / QA-QC',
    departmentAr: 'الجودة والمواصفات الفنية',
    sampleCode: 'C000-TDC-SPC-00',
    category: 'TENDER',
  },
  {
    code: 'VND',
    meaningEn: 'Approved Vendor List',
    meaningAr: 'قائمة الموردين المعتمدين',
    department: 'Procurement & Engineering',
    departmentAr: 'المشتريات والمكتب الفني',
    sampleCode: 'C000-TDC-VND-00',
    category: 'TENDER',
  },

  // Document Control Codes
  {
    code: 'LOG',
    meaningEn: 'Master Tracking Log / Register',
    meaningAr: 'سجل المتابعة الرئيسي للاعتمادات',
    department: 'Document Control',
    departmentAr: 'مراقبة المستندات',
    sampleCode: 'C000-DC-LOG-00',
    category: 'DOC_CONTROL',
  },
  {
    code: 'TRN',
    meaningEn: 'Document Transmittal',
    meaningAr: 'حافظة إرسال وتسليم مستندات',
    department: 'Document Control',
    departmentAr: 'مراقبة المستندات',
    sampleCode: 'C000-DC-TRN-0001',
    category: 'DOC_CONTROL',
  },
  {
    code: 'RFI',
    meaningEn: 'Request for Information',
    meaningAr: 'طلب استفسار وتوضيح فني',
    department: 'Technical Office & Site',
    departmentAr: 'المكتب الفني والتنفيذ',
    sampleCode: 'C000-DC-RFI-0001',
    category: 'DOC_CONTROL',
  },
  {
    code: 'MOM',
    meaningEn: 'Minutes of Meeting',
    meaningAr: 'محضر اجتماع',
    department: 'Project Management',
    departmentAr: 'إدارة المشروعات',
    sampleCode: 'C000-DC-MOM-0001',
    category: 'DOC_CONTROL',
  },
  {
    code: 'SIT',
    meaningEn: 'Site Instruction / Site Report',
    meaningAr: 'تقرير موقع / تعليمات موقعية',
    department: 'Site Execution',
    departmentAr: 'إدارة التنفيذ بالموقع',
    sampleCode: 'C000-DC-SIT-0001',
    category: 'DOC_CONTROL',
  },

  // Technical & Pricing Codes
  {
    code: 'PRC',
    meaningEn: 'Priced Offer / Commercial BOQ',
    meaningAr: 'المقايسة المسعرة والعرض المالي',
    department: 'Cost Estimation & Pricing',
    departmentAr: 'التسعير والدراسات',
    sampleCode: 'C000-TC-PRC-R00',
    category: 'TECHNICAL',
  },
  {
    code: 'RAT',
    meaningEn: 'Rates Breakdown Analysis',
    meaningAr: 'تحليل الأسعار والتكلفة المباشرة',
    department: 'Cost Estimation & Pricing',
    departmentAr: 'التسعير ومراقبة التكاليف',
    sampleCode: 'C000-TC-rat-R00',
    category: 'TECHNICAL',
  },
  {
    code: 'SKT',
    meaningEn: 'Technical Sketch',
    meaningAr: 'اسكتش فني / تفصيلة تنفيذية',
    department: 'Technical Office',
    departmentAr: 'المكتب الفني',
    sampleCode: 'C000-TC-SKT-0001',
    category: 'TECHNICAL',
  },
  {
    code: 'VOO',
    meaningEn: 'Variation Order',
    meaningAr: 'أمر تغيير / أعمال إضافية مستجدة',
    department: 'Contracts & Cost Control',
    departmentAr: 'العقود ومراقبة التكاليف',
    sampleCode: 'C000-TC-VOO-0001',
    category: 'TECHNICAL',
  },

  // Procurement & Finance Codes
  {
    code: 'NPO',
    meaningEn: 'Normal Purchase Order',
    meaningAr: 'أمر شراء وتوريد خامات',
    department: 'Procurement',
    departmentAr: 'إدارة المشتريات',
    sampleCode: 'C000-NPO-0001_Vendor_YYYY-MM-DD',
    category: 'FINANCE_PROCUREMENT',
  },
  {
    code: 'RCB',
    meaningEn: 'Reconciliation of Petty Cash Balance',
    meaningAr: 'تسوية عهدة نقدية (عهدة موقع)',
    department: 'Project Accounting & Site',
    departmentAr: 'حسابات المشروعات والموقع',
    sampleCode: 'C000-RCB-0001_Holder_YYYY-MM-DD',
    category: 'FINANCE_PROCUREMENT',
  },
  {
    code: 'POP',
    meaningEn: 'Proof of Payment',
    meaningAr: 'إثبات سداد / إيصال تحويل بنكي',
    department: 'Finance & Treasury',
    departmentAr: 'الإدارة المالية والخزينة',
    sampleCode: 'C000-POP-0001_Beneficiary_YYYY-MM-DD',
    category: 'FINANCE_PROCUREMENT',
  },
  {
    code: 'CPO',
    meaningEn: 'Cash Payment Order',
    meaningAr: 'أمر صرف نقدي / استحقاق دفع',
    department: 'Finance & Project Controls',
    departmentAr: 'الحسابات ومراقبة التكاليف',
    sampleCode: 'C000-CPO-0001_Subcontractor_YYYY-MM-DD',
    category: 'FINANCE_PROCUREMENT',
  },
  {
    code: 'ST',
    meaningEn: 'Subcontractor Statement',
    meaningAr: 'مستخلص مقاول باطن',
    department: 'Quantity Surveying & Finance',
    departmentAr: 'الحصر والمستخلصات',
    sampleCode: 'C000-ST-0001_Subcontractor_No01',
    category: 'FINANCE_PROCUREMENT',
  },
  {
    code: 'INV',
    meaningEn: 'Client Invoice / Works Extract',
    meaningAr: 'مستخلص عميل / فاتورة مطالبة مالية',
    department: 'Finance & Contracts',
    departmentAr: 'الإدارة المالية والتعاقدات',
    sampleCode: 'C000-INV-0004_Client_YYYY-MM-DD',
    category: 'FINANCE_PROCUREMENT',
  },

  // Submittal Log Types
  {
    code: 'MS',
    meaningEn: 'Material Submittal',
    meaningAr: 'اعتماد خامات وعينات',
    department: 'Technical Office & QA/QC',
    departmentAr: 'المكتب الفني والجودة',
    sampleCode: 'MSARGP01',
    category: 'SUBMITTAL_TYPE',
  },
  {
    code: 'DR',
    meaningEn: 'Shop Drawing Submittal',
    meaningAr: 'اعتماد رسومات تشغيلية (Shop Drawings)',
    department: 'Technical Office',
    departmentAr: 'المكتب الفني',
    sampleCode: 'DRARGP01',
    category: 'SUBMITTAL_TYPE',
  },
  {
    code: 'MIR',
    meaningEn: 'Material Inspection Request',
    meaningAr: 'طلب فحص واستلام خامات بالموقع',
    department: 'QA/QC & Site Execution',
    departmentAr: 'الجودة والتنفيذ بالموقع',
    sampleCode: 'MIRARGP01',
    category: 'SUBMITTAL_TYPE',
  },
  {
    code: 'SL',
    meaningEn: 'Supplier / Vendor List Submittal',
    meaningAr: 'اعتماد موردين ومقاولي باطن',
    department: 'Procurement & Technical Office',
    departmentAr: 'المشتريات والمكتب الفني',
    sampleCode: 'SLARGP01',
    category: 'SUBMITTAL_TYPE',
  },
  {
    code: 'SIR',
    meaningEn: 'Site Inspection Request',
    meaningAr: 'طلب فحص واستلام أعمال بالموقع',
    department: 'Site Execution & QA/QC',
    departmentAr: 'التنفيذ والجودة بالموقع',
    sampleCode: 'SIRARGP01',
    category: 'SUBMITTAL_TYPE',
  },

  // Engineering Disciplines
  {
    code: 'AR',
    meaningEn: 'Architectural & Interior Works',
    meaningAr: 'الأعمال المعمارية والتشطيبات',
    department: 'Architectural Engineering',
    departmentAr: 'القسم المعماري',
    sampleCode: 'MSARGP01 / C000-TDC-DWG-AR-00',
    category: 'DISCIPLINE',
  },
  {
    code: 'CV',
    meaningEn: 'Civil & Structural Works',
    meaningAr: 'الأعمال المدنية والإنشائية',
    department: 'Civil & Structural Engineering',
    departmentAr: 'القسم المدني والإنشائي',
    sampleCode: 'MSCVCN01 / C000-TDC-DWG-CV-00',
    category: 'DISCIPLINE',
  },
  {
    code: 'EL',
    meaningEn: 'Electrical & Light Current Works',
    meaningAr: 'الأعمال الكهربائية والتيار الخفيف',
    department: 'Electrical Engineering (MEP)',
    departmentAr: 'قسم الكهرباء والتيار الخفيف',
    sampleCode: 'MSELEL01 / C000-TDC-DWG-EL-00',
    category: 'DISCIPLINE',
  },
  {
    code: 'MC',
    meaningEn: 'Mechanical, Plumbing & HVAC Works',
    meaningAr: 'الأعمال الميكانيكية والصحية والتكييف',
    department: 'Mechanical Engineering (MEP)',
    departmentAr: 'قسم الميكانيكا والصحية والتكييف',
    sampleCode: 'MSMCPL01 / C000-TDC-DWG-MC-00',
    category: 'DISCIPLINE',
  },
];

/**
 * Generates a standardized Nexus submittal code.
 * Examples:
 * - generateSubmittalCode('MS', 'AR', 'GP', 1) => 'MSARGP01'
 * - generateSubmittalCode('MS', 'AR', 'GP', 1, 1) => 'MSARGP01-R01'
 */
export function generateSubmittalCode(
  logType: string,
  catCode: string,
  subCode: string,
  seq: number,
  rev?: number
): string {
  const cleanLog = (logType || 'MS').trim().toUpperCase();
  const cleanCat = (catCode || 'AR').trim().toUpperCase();
  const cleanSub = (subCode || 'DE').trim().toUpperCase();
  const seqNum = Number.isFinite(seq) && seq > 0 ? Math.floor(seq) : 1;
  const paddedSeq = String(seqNum).padStart(2, '0');

  const baseCode = `${cleanLog}${cleanCat}${cleanSub}${paddedSeq}`;

  if (rev !== undefined && rev !== null && Number.isFinite(rev) && rev > 0) {
    const paddedRev = String(Math.floor(rev)).padStart(2, '0');
    return `${baseCode}-R${paddedRev}`;
  }

  return baseCode;
}
