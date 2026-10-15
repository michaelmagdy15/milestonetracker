import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  MessageSquare,
  CreditCard,
  Truck,
  Warehouse,
  Lock,
  Unlock,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  Percent,
  UserCheck,
  Sparkles,
  Upload,
  Check,
  X,
  Bike,
  Car,
  FileCheck2,
  Search,
  Trash2,
  Send
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SubmittalStatus = 'Code A' | 'Code B' | 'Code C - Revise' | 'Under Review' | 'To Submit';
type VendorType = 'corporate' | 'local_mawan';
type TransportMode = 'milad_car' | 'uber_bike' | 'external_truck';
type WarehouseId = 'ring_road_1' | 'ring_road_2' | 'nozha_hq' | 'site_custody';

interface MaterialSubmittalOption {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  brand: string;
  discipline: string;
  status: SubmittalStatus;
  approved: boolean;
  defaultUnit: string;
  defaultUnitPrice: number;
  projectCode: string;
}

interface PurchaseOrderLine {
  id: string;
  description: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

interface NexusPurchaseOrder {
  id: string;
  npoCode: string;
  projectCode: string;
  projectName: string;
  submittalCode: string;
  submittalTitle: string;
  submittalStatus: SubmittalStatus;
  vendorName: string;
  vendorType: VendorType;
  createdAt: string;
  createdBy: string;
  lines: PurchaseOrderLine[];
  subtotal: number;
  vatEnabled: boolean;
  vatAmount: number;
  discountType: 'lump_sum' | 'percentage';
  discountValue: number;
  discountAmount: number;
  netPayable: number;
  // Pipeline Stages
  prCode?: string;
  prStatus: 'Pending PR' | 'PR Issued (Merna)' | 'POP Attached (Paid)';
  popRef?: string;
  popDate?: string;
  logisticsStatus: 'Awaiting Payment' | 'Ready for Dispatch' | 'Dispatched (In Transit)' | 'Delivered & Verified';
  transportMode?: TransportMode;
  driverOrCourier?: string;
  tripDetails?: string;
  destinationWarehouse: WarehouseId;
  siteReceiver?: string;
  mirStatus?: 'MIR Approved' | 'Pending MIR';
  sourceNote?: string;
}

interface WarehouseStockItem {
  id: string;
  itemCode: string;
  nameAr: string;
  nameEn: string;
  category: 'High-Value 3rd Fix' | 'Drywall & Ceilings' | 'MEP & Plumbing' | 'Ceramics & Marble' | 'Civil & Bulk' | 'Scaffolding & Tools';
  warehouseId: WarehouseId;
  projectAllocated: string;
  qty: number;
  poQty: number;
  unit: string;
  unitValue: number;
  npoRef: string;
  custodyReceiver: string;
  lastUpdated: string;
  mirStatus: 'MIR Approved' | 'Store Verified' | 'Pending MIR';
  securityLevel: 'Locked Vault (Nozha HQ)' | 'Standard Store' | 'Site Engineer Custody';
}

interface CustodyTransferLog {
  id: string;
  transferCode: string;
  timestamp: string;
  itemTitle: string;
  qty: number;
  unit: string;
  fromWarehouse: WarehouseId;
  toWarehouse: WarehouseId;
  projectCode: string;
  transportMode: TransportMode;
  dispatcher: string;
  receiverName: string;
  status: 'Completed & Signed' | 'In Transit';
}

// ============================================================================
// INITIAL SEED DATA (ENG. PIERRE AUDIO & ACTPERT NEXUS ERP)
// ============================================================================

const SUBMITTAL_REGISTER: MaterialSubmittalOption[] = [
  {
    id: 'ms-1',
    code: 'MSARGP01',
    titleAr: 'ألواح جبس بورد كناوف أبيض وأخضر ومقاوم للحريق',
    titleEn: 'Knauf Gypsum Board (Regular / MR / FR 12.5mm)',
    brand: 'Knauf Egypt',
    discipline: 'Architecture - Drywall',
    status: 'Code A',
    approved: true,
    defaultUnit: 'Board (لوح)',
    defaultUnitPrice: 265,
    projectCode: 'C096'
  },
  {
    id: 'ms-2',
    code: 'MSARTL01',
    titleAr: 'بلاط بورسلين 60×120 قطع ليزر نخب أول',
    titleEn: 'Porcelain Tiles 60x120cm Rectified First Choice',
    brand: 'Cleopatra / Gemma',
    discipline: 'Architecture - Flooring',
    status: 'Code A',
    approved: true,
    defaultUnit: 'm² (م2)',
    defaultUnitPrice: 780,
    projectCode: 'C096'
  },
  {
    id: 'ms-3',
    code: 'MSMCPL01',
    titleAr: 'مواسير وقطع تغذية مياه بولي بروبلين باننجر ألماني',
    titleEn: 'Banninger PPR Pipes & Fittings PN20',
    brand: 'Bänninger Germany',
    discipline: 'MEP - Plumbing',
    status: 'Code B',
    approved: true,
    defaultUnit: 'Linear Meter (م.ط)',
    defaultUnitPrice: 195,
    projectCode: 'C096'
  },
  {
    id: 'ms-4',
    code: 'MSARPN01',
    titleAr: 'دهانات جوتن فينوماستيك مذهل ومعجون تأسيس',
    titleEn: 'Jotun Fenomastic Wonderwall Silk & Putty System',
    brand: 'Jotun Paints',
    discipline: 'Architecture - Finishes',
    status: 'Code A',
    approved: true,
    defaultUnit: 'Pail 18L (بستلة)',
    defaultUnitPrice: 3450,
    projectCode: 'C096'
  },
  {
    id: 'ms-5',
    code: 'MSELLT02',
    titleAr: 'نجف ووحدات إضاءة ديكورية معلقة للريسبشن',
    titleEn: 'Decorative Pendant Chandelier & Custom Brass Units',
    brand: 'Enlight / Custom',
    discipline: 'Electrical - Lighting',
    status: 'Under Review',
    approved: false,
    defaultUnit: 'Unit (وحدة)',
    defaultUnitPrice: 18500,
    projectCode: 'C096'
  },
  {
    id: 'ms-6',
    code: 'MSARMS02',
    titleAr: 'رخام مستورد كلكتا جولد لتجاليد الحوائط',
    titleEn: 'Imported Calacatta Gold Marble Slabs 2cm',
    brand: 'Imported Italian',
    discipline: 'Architecture - Marble',
    status: 'Code C - Revise',
    approved: false,
    defaultUnit: 'm² (م2)',
    defaultUnitPrice: 4600,
    projectCode: 'C096'
  },
  {
    id: 'ms-7',
    code: 'MSARWP01',
    titleAr: 'ورق حائط فينيل قابل للغسيل غرف النوم',
    titleEn: 'Washable Vinyl Textured Wallpaper Rolls',
    brand: 'Arte / Zambaiti',
    discipline: 'Architecture - Wall Finishes',
    status: 'To Submit',
    approved: false,
    defaultUnit: 'Roll (رول)',
    defaultUnitPrice: 2200,
    projectCode: 'C096'
  }
];

const INITIAL_PURCHASE_ORDERS: NexusPurchaseOrder[] = [
  {
    id: 'po-1',
    npoCode: 'C096-NPO-0012_Knauf_2026-10-12',
    projectCode: 'C096',
    projectName: 'مشروع C096 - أزاد التجمع الخامس (Azad Compound)',
    submittalCode: 'MSARGP01',
    submittalTitle: 'Knauf Gypsum Board (Regular / MR 12.5mm)',
    submittalStatus: 'Code A',
    vendorName: 'شركة كناوف مصر للجبس (Knauf Egypt Official)',
    vendorType: 'corporate',
    createdAt: '2026-10-12 10:30',
    createdBy: 'Eng. Pierre / Technical Office',
    lines: [
      { id: 'l1', description: 'ألواح جبس بورد كناوف أخضر مقاوم للرطوبة 12.5مم', unit: 'لوح', qty: 120, unitPrice: 285 },
      { id: 'l2', description: 'ألواح جبس بورد كناوف أبيض عادي 12.5مم', unit: 'لوح', qty: 200, unitPrice: 250 },
      { id: 'l3', description: 'صاج كناوف أوميجا وسي وزوايا 0.5مم ثقيل', unit: 'رابطة', qty: 45, unitPrice: 820 }
    ],
    subtotal: 121100,
    vatEnabled: true,
    vatAmount: 16954,
    discountType: 'lump_sum',
    discountValue: 1054,
    discountAmount: 1054,
    netPayable: 137000,
    prCode: 'PR-2026-0418',
    prStatus: 'POP Attached (Paid)',
    popRef: 'CIB-INSTA-9928410 (مرفق إيصال تحويل بنكي)',
    popDate: '2026-10-13 13:15',
    logisticsStatus: 'Delivered & Verified',
    transportMode: 'external_truck',
    driverOrCourier: 'سيارة نقل جامبو + ونش تطليع واجهة (مقاول نقل)',
    tripDetails: 'توريد من مصنع السويس إلى مخزن الدائري 2 وموقع C096',
    destinationWarehouse: 'ring_road_2',
    siteReceiver: 'أمين مخزن الدائري 2 + م. محمد طارق',
    mirStatus: 'MIR Approved',
    sourceNote: 'Corporate Tax Invoice #KN-88210'
  },
  {
    id: 'po-2',
    npoCode: 'C096-NPO-0015_Banninger_2026-10-14',
    projectCode: 'C096',
    projectName: 'مشروع C096 - أزاد التجمع الخامس (Azad Compound)',
    submittalCode: 'MSMCPL01',
    submittalTitle: 'Banninger PPR Pipes & Grohe Concealed Mixers',
    submittalStatus: 'Code B',
    vendorName: 'الشركة الهندسية لتجارة الصحي وموزع جروهي المعتمد',
    vendorType: 'corporate',
    createdAt: '2026-10-14 14:20',
    createdBy: 'Eng. Pierre',
    lines: [
      { id: 'l1', description: 'مواسير باننجر ألماني 25مم و 32مم PN20 مع القطع', unit: 'مقطوعية', qty: 1, unitPrice: 38500 },
      { id: 'l2', description: 'خلاطات دفن جروهي ألماني (Grohe Rapido SmartBox) + النواكل', unit: 'طقم', qty: 8, unitPrice: 9400 }
    ],
    subtotal: 113700,
    vatEnabled: true,
    vatAmount: 15918,
    discountType: 'percentage',
    discountValue: 5,
    discountAmount: 5685,
    netPayable: 123933,
    prCode: 'PR-2026-0422',
    prStatus: 'POP Attached (Paid)',
    popRef: 'QNB-TRF-774129 (تم السداد بواسطة أ. ميرنا ماجد)',
    popDate: '2026-10-15 11:05',
    logisticsStatus: 'Ready for Dispatch',
    transportMode: 'milad_car',
    driverOrCourier: 'ميلاد هارون (سيارة الشركة)',
    tripDetails: 'نقل الخلاطات والنواكل الثمينة إلى مقر الشركة بالنزهة (خزنة الخامات الغالية)',
    destinationWarehouse: 'nozha_hq',
    siteReceiver: 'مقر الشركة بالنزهة (عهدة مؤمنة)',
    mirStatus: 'MIR Approved',
    sourceNote: 'الخلاطات والنواكل تخزن في مقر النزهة لمنع السرقة أو التلف قبل التشطيب النهائي'
  },
  {
    id: 'po-3',
    npoCode: 'C096-NPO-0018_Mawan_2026-10-15',
    projectCode: 'C096',
    projectName: 'مشروع C096 - أزاد التجمع الخامس (Azad Compound)',
    submittalCode: 'MSARTL01',
    submittalTitle: 'مونة تركيب البورسلين وأسمنت ورمل وتشوينات الموان',
    submittalStatus: 'Code A',
    vendorName: 'الحاج محمود الموان (مورّد محلي - فاتورة يدوية / واتساب)',
    vendorType: 'local_mawan',
    createdAt: '2026-10-15 09:45',
    createdBy: 'AI OCR WhatsApp Scanner',
    lines: [
      { id: 'l1', description: 'رمل حرش نظيف للتشوين واللياسة والتركيب', unit: 'م3', qty: 12, unitPrice: 410 },
      { id: 'l2', description: 'أسمنت لافارج المسلح بورتلاندي عادي', unit: 'طن', qty: 4, unitPrice: 2950 },
      { id: 'l3', description: 'مادة لصق بورسلين سيتوكس (CETOX U) شكارة 25 كجم', unit: 'شكارة', qty: 20, unitPrice: 185.5 }
    ],
    subtotal: 20430,
    vatEnabled: false,
    vatAmount: 0,
    discountType: 'lump_sum',
    discountValue: 430,
    discountAmount: 430,
    netPayable: 20000,
    prCode: 'PR-2026-0426',
    prStatus: 'PR Issued (Merna)',
    logisticsStatus: 'Awaiting Payment',
    transportMode: 'external_truck',
    driverOrCourier: 'جرار نقل الموان + عمال تشوين',
    tripDetails: 'توريد مباشر إلى موقع أزاد C096 - بوابة 3',
    destinationWarehouse: 'site_custody',
    siteReceiver: 'م. أحمد سامي (مهندس الموقع)',
    mirStatus: 'MIR Approved',
    sourceNote: 'رسالة واتساب + فاتورة ورقية يدوية بعد خصم 430 ج.م جبر كسر الفاتورة'
  },
  {
    id: 'po-4',
    npoCode: 'C096-NPO-0019_Jotun_2026-10-15',
    projectCode: 'C096',
    projectName: 'مشروع C096 - أزاد التجمع الخامس (Azad Compound)',
    submittalCode: 'MSARPN01',
    submittalTitle: 'Jotun Fenomastic Wonderwall Silk & Putty System',
    submittalStatus: 'Code A',
    vendorName: 'مركز تلوين جوتن المعتمد - مدينة نصر',
    vendorType: 'corporate',
    createdAt: '2026-10-15 12:10',
    createdBy: 'Eng. Pierre',
    lines: [
      { id: 'l1', description: 'بستلة معجون جوتن شيلد أكرليك داخلي', unit: 'بستلة', qty: 15, unitPrice: 1150 },
      { id: 'l2', description: 'عينات ألوان جوتن فينوماستيك + رولات صنفرة سريعة', unit: 'طقم', qty: 4, unitPrice: 650 }
    ],
    subtotal: 19850,
    vatEnabled: true,
    vatAmount: 2779,
    discountType: 'lump_sum',
    discountValue: 629,
    discountAmount: 629,
    netPayable: 22000,
    prCode: 'PR-2026-0427',
    prStatus: 'POP Attached (Paid)',
    popRef: 'INSTAPAY-881203 (أ. ميرنا ماجد)',
    popDate: '2026-10-15 14:00',
    logisticsStatus: 'Dispatched (In Transit)',
    transportMode: 'uber_bike',
    driverOrCourier: 'أوبر بايك سريع (Uber Bike Express - للعينات والرولات العاجلة)',
    tripDetails: 'توصيل سريع للعينات وأدوات الدهان العاجلة لمهندس الموقع خلال 45 دقيقة',
    destinationWarehouse: 'site_custody',
    siteReceiver: 'م. أحمد سامي (مهندس الموقع)',
    mirStatus: 'MIR Approved'
  }
];

const INITIAL_WAREHOUSE_STOCK: WarehouseStockItem[] = [
  // 1. Ring Road Warehouse 1
  {
    id: 'st-1',
    itemCode: 'WH1-SCF-01',
    nameAr: 'سقالات معدنية ثقيلة وكليبسات ومشايات بلطي',
    nameEn: 'Heavy Duty Steel Scaffolding & Timber Planks',
    category: 'Scaffolding & Tools',
    warehouseId: 'ring_road_1',
    projectAllocated: 'المخزون العام للشركة (General Fleet)',
    qty: 85,
    poQty: 85,
    unit: 'طقم كامل',
    unitValue: 3200,
    npoRef: 'GEN-STOCK-2025',
    custodyReceiver: 'عم ربيع (أمين مخزن الدائري 1)',
    lastUpdated: '2026-10-14 16:00',
    mirStatus: 'Store Verified',
    securityLevel: 'Standard Store'
  },
  {
    id: 'st-2',
    itemCode: 'WH1-POR-04',
    nameAr: 'بلاط بورسلين 60×120 قطع ليزر (رصيد احتياطي + فائض)',
    nameEn: 'Porcelain Tiles 60x120cm Rectified (Buffer Stock)',
    category: 'Ceramics & Marble',
    warehouseId: 'ring_road_1',
    projectAllocated: 'مشروع C096 أزاد',
    qty: 145,
    poQty: 145,
    unit: 'م2',
    unitValue: 780,
    npoRef: 'C096-NPO-0008',
    custodyReceiver: 'عم ربيع (أمين مخزن الدائري 1)',
    lastUpdated: '2026-10-13 11:30',
    mirStatus: 'MIR Approved',
    securityLevel: 'Standard Store'
  },
  // 2. Ring Road Warehouse 2
  {
    id: 'st-3',
    itemCode: 'WH2-GYP-12',
    nameAr: 'باليتات ألواح جبس بورد كناوف (أخضر وأبيض) + صاج',
    nameEn: 'Knauf Gypsum Board Pallets & Galvanized Profiles',
    category: 'Drywall & Ceilings',
    warehouseId: 'ring_road_2',
    projectAllocated: 'مشروع C096 أزاد',
    qty: 240,
    poQty: 320,
    unit: 'لوح',
    unitValue: 265,
    npoRef: 'C096-NPO-0012_Knauf_2026-10-12',
    custodyReceiver: 'أمين مخزن الدائري 2 (المخزن المجاور)',
    lastUpdated: '2026-10-14 09:20',
    mirStatus: 'MIR Approved',
    securityLevel: 'Standard Store'
  },
  {
    id: 'st-4',
    itemCode: 'WH2-INS-08',
    nameAr: 'لفات عزل صوت وصوف صخري ومواسير باننجر طول 4م',
    nameEn: 'Rockwool Acoustic Insulation Rolls & PPR 4m Pipes',
    category: 'MEP & Plumbing',
    warehouseId: 'ring_road_2',
    projectAllocated: 'مشروع C096 أزاد',
    qty: 60,
    poQty: 60,
    unit: 'لفة / ربطة',
    unitValue: 950,
    npoRef: 'C096-NPO-0011',
    custodyReceiver: 'أمين مخزن الدائري 2 (المخزن المجاور)',
    lastUpdated: '2026-10-12 15:10',
    mirStatus: 'MIR Approved',
    securityLevel: 'Standard Store'
  },
  // 3. Nozha HQ Office Safe Storage (High-Value Items)
  {
    id: 'st-5',
    itemCode: 'HQ-GRH-01',
    nameAr: 'خلاطات ونواكل جروهي ألماني (Grohe SmartBox & Faucets)',
    nameEn: 'Grohe Concealed Mixers, Chrome Trim Sets & Rain Showers',
    category: 'High-Value 3rd Fix',
    warehouseId: 'nozha_hq',
    projectAllocated: 'مشروع C096 أزاد (تُصرف وقت التشطيب النهائي فقط)',
    qty: 8,
    poQty: 8,
    unit: 'طقم كامل',
    unitValue: 9400,
    npoRef: 'C096-NPO-0015_Banninger_2026-10-14',
    custodyReceiver: 'إدارة المشتريات - مقر الشركة بالنزهة (خزنة مؤمنة)',
    lastUpdated: '2026-10-15 11:30',
    mirStatus: 'MIR Approved',
    securityLevel: 'Locked Vault (Nozha HQ)'
  },
  {
    id: 'st-6',
    itemCode: 'HQ-SMT-02',
    nameAr: 'مفاتيح سمارت هوم وكوالين ديجيتال وبروفايل ليد مغناطيسي',
    nameEn: 'Smart Home Touch Panels, Smart Door Locks & Magnetic LED Tracks',
    category: 'High-Value 3rd Fix',
    warehouseId: 'nozha_hq',
    projectAllocated: 'مشروع C096 أزاد',
    qty: 24,
    poQty: 24,
    unit: 'قطعة',
    unitValue: 3850,
    npoRef: 'C096-NPO-0014',
    custodyReceiver: 'إدارة المشتريات - مقر الشركة بالنزهة (خزنة مؤمنة)',
    lastUpdated: '2026-10-14 18:00',
    mirStatus: 'MIR Approved',
    securityLevel: 'Locked Vault (Nozha HQ)'
  },
  // 4. Project Site Custody
  {
    id: 'st-7',
    itemCode: 'SITE-GYP-01',
    nameAr: 'دفعة أولى ألواح جبس بورد كناوف مشونة بالموقع للتركيب',
    nameEn: 'Site Staged Knauf Gypsum Boards (Batch 1 Active Installation)',
    category: 'Drywall & Ceilings',
    warehouseId: 'site_custody',
    projectAllocated: 'مشروع C096 أزاد - الدور الثاني',
    qty: 80,
    poQty: 80,
    unit: 'لوح',
    unitValue: 265,
    npoRef: 'C096-NPO-0012_Knauf_2026-10-12',
    custodyReceiver: 'م. أحمد سامي (مهندس الموقع المستلم)',
    lastUpdated: '2026-10-14 12:40',
    mirStatus: 'MIR Approved',
    securityLevel: 'Site Engineer Custody'
  },
  {
    id: 'st-8',
    itemCode: 'SITE-MAW-03',
    nameAr: 'تشوينات أسمنت لافارج ورمل حرش ومادة لصق بورسلين سيتوكس',
    nameEn: 'Lafarge Cement, Screed Sand & CETOX U Tile Adhesive',
    category: 'Civil & Bulk',
    warehouseId: 'site_custody',
    projectAllocated: 'مشروع C096 أزاد',
    qty: 36,
    poQty: 36,
    unit: 'وحدة مجمعة (طن/م3/شكارة)',
    unitValue: 555.5,
    npoRef: 'C096-NPO-0018_Mawan_2026-10-15',
    custodyReceiver: 'م. أحمد سامي (مهندس الموقع المستلم)',
    lastUpdated: '2026-10-15 10:15',
    mirStatus: 'MIR Approved',
    securityLevel: 'Site Engineer Custody'
  }
];

const INITIAL_TRANSFER_LOGS: CustodyTransferLog[] = [
  {
    id: 'tr-1',
    transferCode: 'TRF-2026-089',
    timestamp: '2026-10-14 12:30',
    itemTitle: 'ألواح جبس بورد كناوف (دفعة أولى 80 لوح)',
    qty: 80,
    unit: 'لوح',
    fromWarehouse: 'ring_road_2',
    toWarehouse: 'site_custody',
    projectCode: 'C096 أزاد',
    transportMode: 'external_truck',
    dispatcher: 'ميلاد هارون (توجيه سيارة نقل)',
    receiverName: 'م. أحمد سامي (مهندس موقع C096)',
    status: 'Completed & Signed'
  },
  {
    id: 'tr-2',
    transferCode: 'TRF-2026-091',
    timestamp: '2026-10-15 11:25',
    itemTitle: 'خلاطات ونواكل جروهي ألماني (حفظ بالخزنة لحين التشطيب)',
    qty: 8,
    unit: 'طقم كامل',
    fromWarehouse: 'ring_road_1',
    toWarehouse: 'nozha_hq',
    projectCode: 'C096 أزاد',
    transportMode: 'milad_car',
    dispatcher: 'ميلاد هارون (سيارة الشركة)',
    receiverName: 'مسؤول عهدة مقر النزهة HQ',
    status: 'Completed & Signed'
  }
];

// Preset OCR Templates for Sub-Tab 2
const OCR_PRESETS = [
  {
    id: 'preset-mawan',
    badge: 'رسالة واتساب الموان (رمل + أسمنت + سيتوكس)',
    title: 'WhatsApp Message from El-Hagg Mahmoud El-Mawan (موان الرمل والأسمنت)',
    supplierName: 'الحاج محمود الموان لتوريد مواد البناء',
    projectCode: 'C096',
    submittalCode: 'MSARTL01',
    rawText: `يا باشمهندس بيير صباح الفل.. دي حسابات النقلة اللي نزلت موقع أزاد النهاردة مع الرجالة:
- 12 متر مكعب رمل حرش نضيف للمونة × 410 ج = 4,920 جنيه
- 4 طن أسمنت لافارج المسلح × 2,950 ج = 11,800 جنيه
- 20 شكارة مادة سيتوكس يو (CETOX U) لزق بورسلين × 185.5 ج = 3,710 جنيه
إجمالي الفاتورة = 20,430 جنيه.. وزي ما اتفقنا شيلت لحضرتك الـ 430 جنيه كسر الفاتورة يبقى الصافي 20,000 جنيه خالصين. ابعتلي التحويل مع أستاذة ميرنا الله يباركلك.`,
    vatDefault: false,
    discountType: 'lump_sum' as const,
    discountValue: 430,
    lines: [
      { id: 'ocr-1', description: 'رمل حرش نظيف للتشوين واللياسة والتركيب (12 م3)', unit: 'م3', qty: 12, unitPrice: 410 },
      { id: 'ocr-2', description: 'أسمنت لافارج المسلح بورتلاندي عادي (4 طن)', unit: 'طن', qty: 4, unitPrice: 2950 },
      { id: 'ocr-3', description: 'مادة لصق بورسلين سيتوكس (CETOX U) شكارة 25 كجم', unit: 'شكارة', qty: 20, unitPrice: 185.5 }
    ]
  },
  {
    id: 'preset-handwritten',
    badge: 'فاتورة يدوية #842 (خراطيم وعلب كهرباء مصطفى محمود)',
    title: 'Handwritten Paper Bill #842: Electrical Conduits & Boxes',
    supplierName: 'معرض النور للأدوات الكهربائية والسباكة (فاتورة يدوية)',
    projectCode: 'C096',
    submittalCode: 'MSMCPL01',
    rawText: `بيان فاتورة يدوية رقم #842 - بتاريخ 15/10/2026
المطلوب من السادة / شركة أكتبرت للمقاولات (مشروع أزاد)
- عدد 25 لفة خرطوم سوستة علاء الدين 16مم × 190 ج = 4,750 ج
- عدد 15 لفة خرطوم تأسيس صلب 23مم × 280 ج = 4,200 ج
- عدد 300 علبة ماجيك مصطفى محمود أصلية × 12.5 ج = 3,750 ج
- عدد 10 شيكرتون لحام ياباني أصلي × 45 ج = 450 ج
الإجمالي قبل الخصم: 13,150 ج.م (خصم خاص للمهندس بيير 350 ج.م = الصافي 12,800 ج.م)`,
    vatDefault: false,
    discountType: 'lump_sum' as const,
    discountValue: 350,
    lines: [
      { id: 'ocr-4', description: 'لفة خرطوم سوستة علاء الدين 16مم معتمد', unit: 'لفة', qty: 25, unitPrice: 190 },
      { id: 'ocr-5', description: 'لفة خرطوم تأسيس كهرباء صلب 23مم', unit: 'لفة', qty: 15, unitPrice: 280 },
      { id: 'ocr-6', description: 'علبة ماجيك مصطفى محمود أصلية (تركيب حوائط)', unit: 'قطعة', qty: 300, unitPrice: 12.5 },
      { id: 'ocr-7', description: 'شيكرتون لحام كهرباء ياباني أصلي', unit: 'قطعة', qty: 10, unitPrice: 45 }
    ]
  },
  {
    id: 'preset-gypsum-acc',
    badge: 'فاتورة إكسسوارات جبس ومعجون فيوتك (بضريبة 14%)',
    title: 'Supplier Bill: Drywall Screws, Fiberglass Tape & Joint Compound',
    supplierName: 'المركز المتكامل للجبس بورد والعوازل',
    projectCode: 'C096',
    submittalCode: 'MSARGP01',
    rawText: `عرض سعر / فاتورة توريد إكسسوارات جبس بورد لموقع C096:
- 30 علبة مسمار جبس بورد فوسفاتي 2.5 سم (1000 مسمار) × 165 ج = 4,950 ج
- 18 شيكارة معجون فواصل كناوف يوني فلوت (Uniflott) × 490 ج = 8,820 ج
- 25 بكرة شاش فايبر جلاس للفواصل 90 متر × 95 ج = 2,375 ج
تطبق ضريبة القيمة المضافة 14% لمنح فاتورة إلكترونية رسمية، مع خصم تجاري 5%.`,
    vatDefault: true,
    discountType: 'percentage' as const,
    discountValue: 5,
    lines: [
      { id: 'ocr-8', description: 'علبة مسمار جبس بورد فوسفاتي أسود 2.5 سم (1000 مسمار)', unit: 'علبة', qty: 30, unitPrice: 165 },
      { id: 'ocr-9', description: 'شيكارة معجون فواصل كناوف يوني فلوت (Knauf Uniflott)', unit: 'شكارة', qty: 18, unitPrice: 490 },
      { id: 'ocr-10', description: 'بكرة شاش فايبر جلاس للفواصل والتشققات 90 متر', unit: 'بكرة', qty: 25, unitPrice: 95 }
    ]
  }
];

const WAREHOUSE_META: Record<
  WarehouseId,
  {
    nameAr: string;
    nameEn: string;
    badge: string;
    description: string;
    manager: string;
    colorClass: string;
    borderClass: string;
  }
> = {
  ring_road_1: {
    nameAr: 'مخزن الدائري 1 - الرئيسي',
    nameEn: 'Ring Road Warehouse 1 (Main Bulk & Scaffolding)',
    badge: 'مخزن 1 (الدائري)',
    description: 'تشوينات السقالات المعدنية، العدد، البورسلين الاحتياطي، وفوائض المواقع.',
    manager: 'عم ربيع (أمين المخزن الرئيسي)',
    colorClass: 'bg-blue-500/10 text-[#192631] border-blue-500/30',
    borderClass: 'border-blue-500/40'
  },
  ring_road_2: {
    nameAr: 'مخزن الدائري 2 - المخزن المجاور',
    nameEn: 'Ring Road Warehouse 2 (Adjacent Drywall & MEP)',
    badge: 'مخزن 2 (المجاور)',
    description: 'باليتات الجبس بورد، الصاج، لفات الصوف الصخري، ومواسير التغذية والصرف الطويلة.',
    manager: 'أمين مخزن الدائري 2',
    colorClass: 'bg-[#e04b2a]/10 text-[#e04b2a] border-[#e04b2a]/25',
    borderClass: 'border-[#e04b2a]/25'
  },
  nozha_hq: {
    nameAr: 'مقر الشركة بالنزهة - مخزن الخامات الثمينة',
    nameEn: 'Nozha HQ Office Safe Vault (High-Value 3rd Fix)',
    badge: 'خزنة مقر النزهة HQ',
    description: 'حفظ الخامات الغالية والمعرضة للسرقة أو التلف بالموقع (خلاطات ونواكل جروهي، سمارت هوم، إضاءة).',
    manager: 'إدارة المشتريات - مقر النزهة + ميلاد هارون',
    colorClass: 'bg-amber-500/10 text-[#b45309] border-amber-500/30',
    borderClass: 'border-amber-500/40'
  },
  site_custody: {
    nameAr: 'تشوينات الموقع وعهدة مهندس الموقع',
    nameEn: 'Project Site Custody (Site Engineer Verified)',
    badge: 'عهدة مهندس الموقع',
    description: 'الخامات المستلمة فعلياً داخل الموقع بعهدة مهندس الموقع وتوقيع الاستلام ومطابقة MIR.',
    manager: 'م. أحمد سامي / م. محمد طارق (مهندسي الموقع)',
    colorClass: 'bg-[#123524]/10 text-[#123524] border-[#123524]/25',
    borderClass: 'border-[#123524]/25'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProcurementWarehouseHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'npo' | 'ocr' | 'accounting_logistics' | 'warehouses'>('npo');

  // Shared State
  const [purchaseOrders, setPurchaseOrders] = useState<NexusPurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStockItem[]>(INITIAL_WAREHOUSE_STOCK);
  const [transferLogs, setTransferLogs] = useState<CustodyTransferLog[]>(INITIAL_TRANSFER_LOGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-Tab 1: Create NPO Modal State
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [selectedSubmittalCode, setSelectedSubmittalCode] = useState<string>('MSARGP01');
  const [newPOVendorType, setNewPOVendorType] = useState<VendorType>('corporate');
  const [newPOVendorName, setNewPOVendorName] = useState<string>('شركة كناوف مصر للجبس (Knauf Egypt)');
  const [newPODestination, setNewPODestination] = useState<WarehouseId>('ring_road_2');
  const [newPOQty, setNewPOQty] = useState<number>(100);
  const [newPOUnitPrice, setNewPOUnitPrice] = useState<number>(265);
  const [newPOVatEnabled, setNewPOVatEnabled] = useState<boolean>(true);
  const [newPODiscountValue, setNewPODiscountValue] = useState<number>(500);
  const [searchPOQuery, setSearchPOQuery] = useState<string>('');

  // Sub-Tab 2: AI / OCR WhatsApp & Handwritten Bill Scanner State
  const [activePresetId, setActivePresetId] = useState<string>('preset-mawan');
  const [ocrRawText, setOcrRawText] = useState<string>(OCR_PRESETS[0].rawText);
  const [ocrSupplierName, setOcrSupplierName] = useState<string>(OCR_PRESETS[0].supplierName);
  const [ocrSubmittalCode, setOcrSubmittalCode] = useState<string>(OCR_PRESETS[0].submittalCode);
  const [ocrLines, setOcrLines] = useState<PurchaseOrderLine[]>(OCR_PRESETS[0].lines);
  const [ocrVatEnabled, setOcrVatEnabled] = useState<boolean>(OCR_PRESETS[0].vatDefault);
  const [ocrDiscountType, setOcrDiscountType] = useState<'lump_sum' | 'percentage'>(OCR_PRESETS[0].discountType);
  const [ocrDiscountValue, setOcrDiscountValue] = useState<number>(OCR_PRESETS[0].discountValue);
  const [ocrDestination, setOcrDestination] = useState<WarehouseId>('site_custody');
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);

  // Sub-Tab 4: Warehouse Filter & Transfer Modal State
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<WarehouseId | 'ALL'>('ALL');
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferStockId, setTransferStockId] = useState<string>('st-5');
  const [transferToWarehouse, setTransferToWarehouse] = useState<WarehouseId>('site_custody');
  const [transferQty, setTransferQty] = useState<number>(4);
  const [transferTransportMode, setTransferTransportMode] = useState<TransportMode>('milad_car');
  const [transferReceiverName, setTransferReceiverName] = useState<string>('م. أحمد سامي (مهندس موقع C096 أزاد)');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Currently selected submittal in the "+ Create Purchase Order (NPO)" Modal
  const selectedSubmittalObj = useMemo(() => {
    return SUBMITTAL_REGISTER.find((s) => s.code === selectedSubmittalCode) || SUBMITTAL_REGISTER[0];
  }, [selectedSubmittalCode]);

  // Handle changing submittal in Modal
  const handleSelectSubmittalInModal = (code: string) => {
    setSelectedSubmittalCode(code);
    const found = SUBMITTAL_REGISTER.find((s) => s.code === code);
    if (found) {
      setNewPOUnitPrice(found.defaultUnitPrice);
      setNewPOVendorName(`${found.brand} - المورد المعتمد`);
    }
  };

  // Calculations for Sub-Tab 2 (OCR Bill Scanner)
  const ocrFinancials = useMemo(() => {
    const subtotal = ocrLines.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
    const discountAmount =
      ocrDiscountType === 'lump_sum'
        ? Math.min(ocrDiscountValue, subtotal)
        : Math.round((subtotal * ocrDiscountValue) / 100);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vatAmount = ocrVatEnabled ? Math.round(afterDiscount * 0.14) : 0;
    const netPayable = afterDiscount + vatAmount;
    return { subtotal, discountAmount, afterDiscount, vatAmount, netPayable };
  }, [ocrLines, ocrDiscountType, ocrDiscountValue, ocrVatEnabled]);

  // Load OCR Preset
  const handleLoadOcrPreset = (presetId: string) => {
    const preset = OCR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setIsScanningOcr(true);
    setActivePresetId(presetId);
    setTimeout(() => {
      setOcrRawText(preset.rawText);
      setOcrSupplierName(preset.supplierName);
      setOcrSubmittalCode(preset.submittalCode);
      setOcrLines(preset.lines.map((l) => ({ ...l })));
      setOcrVatEnabled(preset.vatDefault);
      setOcrDiscountType(preset.discountType);
      setOcrDiscountValue(preset.discountValue);
      setIsScanningOcr(false);
      triggerToast(`تم استخراج بنود الفاتورة بالذكاء الاصطناعي من: ${preset.badge}`);
    }, 350);
  };

  // Update OCR Line Item
  const handleUpdateOcrLine = (id: string, field: keyof PurchaseOrderLine, value: string | number) => {
    setOcrLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        return {
          ...line,
          [field]: field === 'description' || field === 'unit' ? String(value) : Number(value) || 0
        };
      })
    );
  };

  const handleAddOcrLine = () => {
    setOcrLines((prev) => [
      ...prev,
      {
        id: `ocr-custom-${Date.now()}`,
        description: 'بند تشوين جديد (اكتب وصف الخامة)',
        unit: 'وحدة',
        qty: 1,
        unitPrice: 500
      }
    ]);
  };

  const handleRemoveOcrLine = (id: string) => {
    if (ocrLines.length <= 1) return;
    setOcrLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Approve & Convert OCR Bill to Official PO + Send to Merna
  const handleConvertOcrToOfficialPO = () => {
    const submittal = SUBMITTAL_REGISTER.find((s) => s.code === ocrSubmittalCode) || SUBMITTAL_REGISTER[0];
    const nextNum = purchaseOrders.length + 17;
    const todayStr = '2026-10-15';
    const newNpoCode = `C096-NPO-00${nextNum}_Mawan_${todayStr}`;
    const newPrCode = `PR-2026-04${nextNum + 10}`;

    const newPO: NexusPurchaseOrder = {
      id: `po-ocr-${Date.now()}`,
      npoCode: newNpoCode,
      projectCode: 'C096',
      projectName: 'مشروع C096 - أزاد التجمع الخامس (Azad Compound)',
      submittalCode: submittal.code,
      submittalTitle: submittal.titleEn,
      submittalStatus: submittal.status,
      vendorName: ocrSupplierName,
      vendorType: 'local_mawan',
      createdAt: '2026-10-15 16:40',
      createdBy: 'Eng. Pierre (via PO-OCR Scanner)',
      lines: ocrLines.map((l) => ({ ...l })),
      subtotal: ocrFinancials.subtotal,
      vatEnabled: ocrVatEnabled,
      vatAmount: ocrFinancials.vatAmount,
      discountType: ocrDiscountType,
      discountValue: ocrDiscountValue,
      discountAmount: ocrFinancials.discountAmount,
      netPayable: ocrFinancials.netPayable,
      prCode: newPrCode,
      prStatus: 'PR Issued (Merna)',
      logisticsStatus: 'Awaiting Payment',
      transportMode: 'external_truck',
      driverOrCourier: 'توريد محلي / بانتظار توجيه ميلاد هارون',
      tripDetails: 'توريد من الموان المحلي بعد مراجعة الفاتورة اليدوية',
      destinationWarehouse: ocrDestination,
      siteReceiver: ocrDestination === 'site_custody' ? 'م. أحمد سامي (مهندس الموقع)' : WAREHOUSE_META[ocrDestination].manager,
      mirStatus: 'MIR Approved',
      sourceNote: 'محولة من ماسح فواتير الواتساب والفواتير اليدوية (PO-OCR)'
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    triggerToast(
      `✅ تم اعتماد الفاتورة اليدوية وإصدار أمر شراء رسمي (${newNpoCode}) بصافي ${ocrFinancials.netPayable.toLocaleString()} ج.م وإرسال طلب صرف (${newPrCode}) إلى أ. ميرنا ماجد (الحسابات)!`
    );
    setActiveSubTab('accounting_logistics');
  };

  // Create Formal PO from Sub-Tab 1 Modal
  const handleCreateSubmittalGatedPO = () => {
    if (!selectedSubmittalObj.approved) return;

    if (newPOVendorType === 'local_mawan') {
      setShowCreatePOModal(false);
      setOcrSubmittalCode(selectedSubmittalObj.code);
      setActiveSubTab('ocr');
      triggerToast('تم التحويل إلى ماسح فواتير الواتساب والفواتير اليدوية للموانين (PO-OCR)');
      return;
    }

    const subtotal = newPOQty * newPOUnitPrice;
    const discountAmount = Math.min(newPODiscountValue, subtotal);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vatAmount = newPOVatEnabled ? Math.round(afterDiscount * 0.14) : 0;
    const netPayable = afterDiscount + vatAmount;

    const nextNum = purchaseOrders.length + 20;
    const brandShort = selectedSubmittalObj.brand.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') || 'Vendor';
    const npoCode = `C096-NPO-00${nextNum}_${brandShort}_2026-10-15`;
    const prCode = `PR-2026-04${nextNum + 12}`;

    const createdPO: NexusPurchaseOrder = {
      id: `po-${Date.now()}`,
      npoCode,
      projectCode: selectedSubmittalObj.projectCode,
      projectName: 'مشروع C096 - أزاد التجمع الخامس (Azad Compound)',
      submittalCode: selectedSubmittalObj.code,
      submittalTitle: selectedSubmittalObj.titleEn,
      submittalStatus: selectedSubmittalObj.status,
      vendorName: newPOVendorName,
      vendorType: 'corporate',
      createdAt: '2026-10-15 16:50',
      createdBy: 'Eng. Pierre / Procurement Gatekeeper',
      lines: [
        {
          id: `line-${Date.now()}`,
          description: `${selectedSubmittalObj.titleAr} (${selectedSubmittalObj.code})`,
          unit: selectedSubmittalObj.defaultUnit,
          qty: newPOQty,
          unitPrice: newPOUnitPrice
        }
      ],
      subtotal,
      vatEnabled: newPOVatEnabled,
      vatAmount,
      discountType: 'lump_sum',
      discountValue: newPODiscountValue,
      discountAmount,
      netPayable,
      prCode,
      prStatus: 'PR Issued (Merna)',
      logisticsStatus: 'Awaiting Payment',
      transportMode: newPODestination === 'nozha_hq' ? 'milad_car' : 'external_truck',
      driverOrCourier: 'بانتظار إرفاق POP وتوجيه ميلاد هارون',
      tripDetails: `توريد إلى ${WAREHOUSE_META[newPODestination].nameAr}`,
      destinationWarehouse: newPODestination,
      siteReceiver: WAREHOUSE_META[newPODestination].manager,
      mirStatus: 'MIR Approved'
    };

    setPurchaseOrders((prev) => [createdPO, ...prev]);
    setShowCreatePOModal(false);
    triggerToast(`✅ تم إصدار أمر الشراء المربوط بالاعتماد (${npoCode}) وتحويله إلى أ. ميرنا ماجد لإصدار طلب الصرف (${prCode})!`);
  };

  // Sub-Tab 3 Actions: Merna POP attachment & Milad Logistics Dispatch
  const handleAttachMernaPOP = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        return {
          ...po,
          prStatus: 'POP Attached (Paid)',
          popRef: `CIB-POP-${Math.floor(100000 + Math.random() * 900000)} (تم إرفاق إيصال السداد - أ. ميرنا ماجد)`,
          popDate: '2026-10-15 17:00',
          logisticsStatus: po.logisticsStatus === 'Awaiting Payment' ? 'Ready for Dispatch' : po.logisticsStatus
        };
      })
    );
    triggerToast('💳 تم إرفاق إثبات الدفع (POP) من أ. ميرنا ماجد (الحسابات) — الطلب جاهز الآن لتوجيه اللوجستيات مع ميلاد هارون!');
  };

  const handleChangeTransportMode = (poId: string, mode: TransportMode) => {
    const modeMeta: Record<TransportMode, { driver: string; trip: string }> = {
      milad_car: {
        driver: 'ميلاد هارون (سيارة الشركة - متابعة عداد الكيلومتر والتانك)',
        trip: 'خط سير سيارة الشركة: مقر النزهة ➔ المورد ➔ المخزن/الموقع'
      },
      uber_bike: {
        driver: 'أوبر بايك / مرسول سريع (Uber Bike Express)',
        trip: 'توصيل فوري للخامات الخفيفة والعينات والمفاتيح والسيليكون والمسامير'
      },
      external_truck: {
        driver: 'سيارة نقل خارجي جامبو + ونش تطليع (External Freight)',
        trip: 'نقل حمولات ثقيلة (جبس بورد / بورسلين / أسمنت ورمل) إلى المخزن أو الموقع'
      }
    };

    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        return {
          ...po,
          transportMode: mode,
          driverOrCourier: modeMeta[mode].driver,
          tripDetails: modeMeta[mode].trip
        };
      })
    );
    triggerToast('🚚 تم تحديث وسيلة النقل في لوحة توجيه اللوجستيات (أ. ميلاد هارون)');
  };

  const handleAdvanceLogisticsStage = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        if (po.logisticsStatus === 'Ready for Dispatch') {
          triggerToast(`🚀 تم انطلاق الشحنة (${po.npoCode}) بإشراف ميلاد هارون!`);
          return { ...po, logisticsStatus: 'Dispatched (In Transit)' };
        }
        if (po.logisticsStatus === 'Dispatched (In Transit)') {
          triggerToast(`📦 تم استلام الشحنة (${po.npoCode}) في ${WAREHOUSE_META[po.destinationWarehouse].nameAr} وتوثيق العهدة!`);
          return { ...po, logisticsStatus: 'Delivered & Verified', mirStatus: 'MIR Approved' };
        }
        return po;
      })
    );
  };

  // Sub-Tab 4 Action: Transfer Stock Between Warehouses / Dispatch to Site
  const selectedSourceStock = useMemo(() => {
    return warehouseStock.find((s) => s.id === transferStockId) || warehouseStock[0];
  }, [warehouseStock, transferStockId]);

  const handleExecuteStockTransfer = () => {
    if (!selectedSourceStock) return;
    if (transferQty <= 0 || transferQty > selectedSourceStock.qty) {
      triggerToast('⚠️ الكمية المطلوب نقلها غير صحيحة أو تتجاوز الرصيد المتاح في المخزن!');
      return;
    }
    if (selectedSourceStock.warehouseId === transferToWarehouse) {
      triggerToast('⚠️ يرجى اختيار مخزن وجهة مختلف عن مخزن المصدر!');
      return;
    }

    const updatedStock: WarehouseStockItem[] = [];
    warehouseStock.forEach((item) => {
      if (item.id === selectedSourceStock.id) {
        const remaining = item.qty - transferQty;
        if (remaining > 0) {
          updatedStock.push({
            ...item,
            qty: remaining,
            lastUpdated: '2026-10-15 17:05'
          });
        }
      } else {
        updatedStock.push(item);
      }
    });

    // Add or merge in destination warehouse
    const destSecurity: WarehouseStockItem['securityLevel'] =
      transferToWarehouse === 'nozha_hq'
        ? 'Locked Vault (Nozha HQ)'
        : transferToWarehouse === 'site_custody'
        ? 'Site Engineer Custody'
        : 'Standard Store';

    updatedStock.unshift({
      id: `st-trf-${Date.now()}`,
      itemCode: `${selectedSourceStock.itemCode}-T`,
      nameAr: selectedSourceStock.nameAr,
      nameEn: selectedSourceStock.nameEn,
      category: selectedSourceStock.category,
      warehouseId: transferToWarehouse,
      projectAllocated: 'مشروع C096 أزاد (محول من المخزن)',
      qty: transferQty,
      poQty: transferQty,
      unit: selectedSourceStock.unit,
      unitValue: selectedSourceStock.unitValue,
      npoRef: selectedSourceStock.npoRef,
      custodyReceiver: transferReceiverName,
      lastUpdated: '2026-10-15 17:05',
      mirStatus: 'MIR Approved',
      securityLevel: destSecurity
    });

    const newLog: CustodyTransferLog = {
      id: `tr-${Date.now()}`,
      transferCode: `TRF-2026-0${transferLogs.length + 92}`,
      timestamp: '2026-10-15 17:05',
      itemTitle: selectedSourceStock.nameAr,
      qty: transferQty,
      unit: selectedSourceStock.unit,
      fromWarehouse: selectedSourceStock.warehouseId,
      toWarehouse: transferToWarehouse,
      projectCode: 'C096 أزاد',
      transportMode: transferTransportMode,
      dispatcher:
        transferTransportMode === 'milad_car'
          ? 'ميلاد هارون (سيارة الشركة)'
          : transferTransportMode === 'uber_bike'
          ? 'أوبر بايك سريع (توجيه ميلاد هارون)'
          : 'سيارة نقل خارجي (توجيه ميلاد هارون)',
      receiverName: transferReceiverName,
      status: 'Completed & Signed'
    };

    setWarehouseStock(updatedStock);
    setTransferLogs((prev) => [newLog, ...prev]);
    setShowTransferModal(false);
    triggerToast(
      `✅ تم تحويل عهدة (${transferQty} ${selectedSourceStock.unit} - ${selectedSourceStock.nameAr}) من ${
        WAREHOUSE_META[selectedSourceStock.warehouseId].badge
      } إلى ${WAREHOUSE_META[transferToWarehouse].badge} بعهدة: ${transferReceiverName}`
    );
  };

  // Summary KPIs
  const kpiStats = useMemo(() => {
    const totalPOValue = purchaseOrders.reduce((s, po) => s + po.netPayable, 0);
    const totalDiscountsSaved = purchaseOrders.reduce((s, po) => s + po.discountAmount, 0);
    const highValueVaultValue = warehouseStock
      .filter((s) => s.warehouseId === 'nozha_hq')
      .reduce((sum, item) => sum + item.qty * item.unitValue, 0);
    const totalWarehouseValue = warehouseStock.reduce((sum, item) => sum + item.qty * item.unitValue, 0);
    return {
      totalPOValue,
      totalDiscountsSaved,
      highValueVaultValue,
      totalWarehouseValue
    };
  }, [purchaseOrders, warehouseStock]);

  const filteredPOs = useMemo(() => {
    if (!searchPOQuery.trim()) return purchaseOrders;
    const q = searchPOQuery.toLowerCase();
    return purchaseOrders.filter(
      (po) =>
        po.npoCode.toLowerCase().includes(q) ||
        po.vendorName.toLowerCase().includes(q) ||
        po.submittalCode.toLowerCase().includes(q) ||
        po.submittalTitle.toLowerCase().includes(q)
    );
  }, [purchaseOrders, searchPOQuery]);

  const filteredWarehouseItems = useMemo(() => {
    if (selectedWarehouseFilter === 'ALL') return warehouseStock;
    return warehouseStock.filter((item) => item.warehouseId === selectedWarehouseFilter);
  }, [warehouseStock, selectedWarehouseFilter]);

  return (
    <div className="space-y-6 text-[#192631] text-start">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-xl border border-[#123524]/25 bg-white/80 backdrop-blur-md px-5 py-4 text-sm font-medium text-[#123524] shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#123524]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Executive Header */}
      <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#123524]/25 bg-[#123524]/10 px-3 py-1 text-xs font-semibold text-[#123524]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Submittal-Gated Procurement (Eng. Pierre Rule)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-[#b45309]">
                <ScanLine className="h-3.5 w-3.5" />
                ماسح فواتير الواتساب والموانين (PO-OCR)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-[#192631]">
                <Warehouse className="h-3.5 w-3.5" />
                مخازن الدائري (1 & 2) + خزنة مقر النزهة + عهدة الموقع
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-[#192631] md:text-3xl">
              منظومة المشتريات المربوطة بالاعتمادات، فواتير الموانين (OCR)، الحسابات واللوجستيات والمخازن الأربعة
            </h1>
            <p className="mt-1 text-sm text-[#192631]/70">
              ربط مباشر بين اعتمادات الخامات (MS Code A/B) ⬅ أوامر الشراء (NPO) ⬅ طلبات الصرف (أ. ميرنا ماجد PR/POP) ⬅ لوجستيات وحركة النقل (أ. ميلاد هارون) ⬅ عهدة المخازن الأربعة ومهندسي الموقع.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreatePOModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              + إصدار أمر شراء (NPO) مربوط باعتماد
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-[#192631] transition hover:bg-cyan-500/20"
            >
              <ArrowRightLeft className="h-4 w-4" />
              + تحويل مخزون / صرف عهدة لموقع
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#192631]/70">إجمالي أوامر الشراء المعتمدة (NPO)</span>
              <ShoppingCart className="h-4 w-4 text-[#123524]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#192631]">
              {kpiStats.totalPOValue.toLocaleString()} <span className="text-xs font-normal text-[#192631]/70">ج.م</span>
            </div>
            <div className="mt-1 text-xs text-[#123524]">
              100% مربوطة باعتمادات (Code A / Code B)
            </div>
          </div>

          <div className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#192631]/70">وفورات الخصم المكتسب وجبر الفواتير</span>
              <Percent className="h-4 w-4 text-[#b45309]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#b45309]">
              {kpiStats.totalDiscountsSaved.toLocaleString()} <span className="text-xs font-normal text-[#192631]/70">ج.م</span>
            </div>
            <div className="mt-1 text-xs text-[#192631]/70">
              خصم مقطوع ونسب مئوية على فواتير الموردين والموانين
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#b45309]">خزنة مقر النزهة (الخامات الثمينة المؤمنة)</span>
              <Lock className="h-4 w-4 text-[#b45309]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#192631]">
              {kpiStats.highValueVaultValue.toLocaleString()} <span className="text-xs font-normal text-[#192631]/70">ج.م</span>
            </div>
            <div className="mt-1 text-xs text-[#b45309]/90">
              خلاطات ونواكل جروهي + سمارت هوم (حماية من السرقة)
            </div>
          </div>

          <div className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#192631]/70">إجمالي تقييم المخازن الأربعة وعهدة المواقع</span>
              <Warehouse className="h-4 w-4 text-[#192631]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#192631]">
              {kpiStats.totalWarehouseValue.toLocaleString()} <span className="text-xs font-normal text-[#192631]/70">ج.م</span>
            </div>
            <div className="mt-1 text-xs text-[#192631]">
              الدائري 1 + الدائري 2 + مقر النزهة + مواقع المشاريع
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-2 md:grid-cols-4">
        <button
          onClick={() => setActiveSubTab('npo')}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition md:text-sm ${
            activeSubTab === 'npo'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>1. أوامر الشراء المربوطة بالاعتمادات (NPO)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ocr')}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition md:text-sm ${
            activeSubTab === 'ocr'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
              : 'text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <ScanLine className="h-4 w-4 shrink-0" />
          <span>2. ماسح فواتير الواتساب والموانين (PO-OCR)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('accounting_logistics')}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition md:text-sm ${
            activeSubTab === 'accounting_logistics'
              ? 'bg-[#e04b2a] text-[#192631] shadow-lg shadow-indigo-600/25'
              : 'text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <Truck className="h-4 w-4 shrink-0" />
          <span>3. حسابات ميرنا (PR/POP) ولوجستيات ميلاد</span>
        </button>

        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition md:text-sm ${
            activeSubTab === 'warehouses'
              ? 'bg-cyan-600 text-[#192631] shadow-lg shadow-cyan-600/25'
              : 'text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <Warehouse className="h-4 w-4 shrink-0" />
          <span>4. المخازن الأربعة والعهدة واستلام الموقع</span>
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB 1: SUBMITTAL-GATED PURCHASE ORDERS (NPO)
         ===================================================================== */}
      {activeSubTab === 'npo' && (
        <div className="space-y-6">
          {/* Strict Gatekeeper Rule Banner */}
          <div className="rounded-2xl border border-[#123524]/25 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-start gap-3.5">
                <div className="rounded-xl bg-[#123524]/10 p-3 text-[#123524]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#192631]">
                    قاعدة الحوكمة الصارمة (Eng. Pierre Procurement Gatekeeper Rule)
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#192631]/85 md:text-sm">
                    يُمنع النظام إصدار أي أمر شراء (NPO) إلا بعد ربطه باعتماد خامة (Material Submittal - MS) حاصل على كود اعتماد{' '}
                    <span className="font-bold text-[#123524]">Code A (Approved)</span> أو{' '}
                    <span className="font-bold text-[#192631]">Code B (Approved as Noted)</span>. أي خامة تحت المراجعة أو مرفوضة (Code C) يتم حظر شرائها تلقائياً لمنع توريد خامات غير معتمدة للموقع.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  onClick={() => {
                    handleSelectSubmittalInModal('MSARGP01');
                    setShowCreatePOModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Unlock className="h-4 w-4" />
                  تجربة اعتماد مفتوح (Code A/B)
                </button>
                <button
                  onClick={() => {
                    handleSelectSubmittalInModal('MSELLT02');
                    setShowCreatePOModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-rose-500/20"
                >
                  <Lock className="h-4 w-4" />
                  تجربة خامة محظورة (Gatekeeper Block)
                </button>
              </div>
            </div>
          </div>

          {/* Submittal Gatekeeper Matrix Preview */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-bold text-[#192631]">
                  سجل اعتمادات الخامات وحالة بوابة المشتريات (Submittal Register Gatekeeper Status)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  اضغط على أي اعتماد خامة لفتح نافذة إصدار أمر الشراء (NPO) أو اختبار الحظر التلقائي
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {SUBMITTAL_REGISTER.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    handleSelectSubmittalInModal(sub.code);
                    setShowCreatePOModal(true);
                  }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    sub.approved
                      ? 'border-[#123524]/25 bg-emerald-950/15 hover:border-emerald-500/60'
                      : 'border-rose-500/30 bg-rose-950/15 hover:border-rose-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#192631]">{sub.code}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        sub.approved
                          ? 'bg-[#123524]/10 text-[#123524]'
                          : 'bg-rose-500/20 text-red-700'
                      }`}
                    >
                      {sub.approved ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {sub.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#192631] line-clamp-1">{sub.titleAr}</div>
                  <div className="mt-0.5 text-[11px] text-[#192631]/70 line-clamp-1">{sub.titleEn}</div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-[#192631]/10 pt-2 text-[11px]">
                    <span className="text-[#192631]/70">{sub.brand}</span>
                    <span className={sub.approved ? 'font-bold text-[#123524]' : 'font-bold text-red-700'}>
                      {sub.approved ? 'مسموح بإصدار NPO ✓' : 'محظور الشراء ⛔'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active NPO Register Table */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="text-base font-bold text-[#192631]">
                  سجل أوامر الشراء الرسمية المربوطة بالاعتمادات (NPO Register)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  يدعم مسار الشركات الموردة الرسمية (Corporate NPO) ومسار الموردين المحليين والموانين (PO-OCR)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[#192631]/60" />
                  <input
                    type="text"
                    value={searchPOQuery}
                    onChange={(e) => setSearchPOQuery(e.target.value)}
                    placeholder="بحث بكود NPO أو المورد أو الاعتماد..."
                    className="w-64 rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 py-2 pr-9 pl-3 text-xs text-[#192631] placeholder-[#192631]/40 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowCreatePOModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  إصدار أمر شراء (NPO)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70">
                    <th className="px-3 py-3 font-semibold">كود أمر الشراء (NPO)</th>
                    <th className="px-3 py-3 font-semibold">اعتماد الخامة (MS)</th>
                    <th className="px-3 py-3 font-semibold">المورد ومسار التوريد</th>
                    <th className="px-3 py-3 font-semibold">الإجمالي والضريبة والخصم</th>
                    <th className="px-3 py-3 font-semibold">الصافي المستحق</th>
                    <th className="px-3 py-3 font-semibold">حسابات ميرنا (PR / POP)</th>
                    <th className="px-3 py-3 font-semibold">الوجهة واللوجستيات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredPOs.map((po) => (
                    <tr key={po.id} className="transition hover:bg-[#192631]/[0.05]">
                      <td className="px-3 py-3.5 align-top">
                        <div className="font-mono text-xs font-bold text-[#123524]">{po.npoCode}</div>
                        <div className="mt-1 text-[11px] text-[#192631]/70">{po.projectName}</div>
                        <div className="mt-0.5 text-[10px] text-[#192631]/60">{po.createdAt}</div>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-[#123524]/25 bg-[#123524]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#123524]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {po.submittalCode} ({po.submittalStatus})
                        </div>
                        <div className="mt-1 text-xs text-[#192631]/85">{po.submittalTitle}</div>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="font-bold text-[#192631]">{po.vendorName}</div>
                        <span
                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            po.vendorType === 'corporate'
                              ? 'bg-blue-500/15 text-[#192631]'
                              : 'bg-amber-500/15 text-[#b45309]'
                          }`}
                        >
                          {po.vendorType === 'corporate'
                            ? '🏢 شركة موردة رسمية (Corporate)'
                            : '🧾 مورّد محلي / موّان (PO-OCR)'}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="text-[#192631]/85">
                          قبل الخصم: <span className="font-semibold">{po.subtotal.toLocaleString()} ج.م</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#b45309]">
                          خصم مكتسب: -{po.discountAmount.toLocaleString()} ج.م
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#192631]/70">
                          ضريبة 14%: {po.vatEnabled ? `+${po.vatAmount.toLocaleString()} ج.م` : 'بدون ضريبة (0 ج.م)'}
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="text-sm font-extrabold text-[#123524]">
                          {po.netPayable.toLocaleString()} ج.م
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#192631]/70">{po.lines.length} بنود توريد</div>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="font-mono text-xs font-semibold text-[#e04b2a]">{po.prCode}</div>
                        <span
                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            po.prStatus === 'POP Attached (Paid)'
                              ? 'bg-[#123524]/10 text-[#123524]'
                              : 'bg-amber-500/20 text-[#b45309]'
                          }`}
                        >
                          {po.prStatus === 'POP Attached (Paid)' ? 'تم السداد وإرفاق POP ✓' : 'بانتظار POP (أ. ميرنا)'}
                        </span>
                        {po.popRef && <div className="mt-1 text-[10px] text-[#192631]/70">{po.popRef}</div>}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="font-semibold text-[#192631]">
                          {WAREHOUSE_META[po.destinationWarehouse].badge}
                        </div>
                        <div className="mt-1 text-[11px] text-[#192631]/85">{po.logisticsStatus}</div>
                        <div className="mt-0.5 text-[10px] text-[#192631]/70">{po.driverOrCourier}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: AI / OCR WHATSAPP & HANDWRITTEN BILL SCANNER (PO-OCR)
         ===================================================================== */}
      {activeSubTab === 'ocr' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-start gap-3.5">
                <div className="rounded-xl bg-amber-500/20 p-3 text-[#b45309]">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#192631]">
                    ماسح فواتير الواتساب والفواتير اليدوية للموانين (AI / OCR WhatsApp & Handwritten Bill Scanner)
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#192631]/85 md:text-sm">
                    صُمم خصيصاً لتنفيذ متطلبات <span className="font-bold text-[#b45309]">م. بيير</span> مع الموردين المحليين وموانين الرمل والأسمنت والطوب والجبس الذين يرسلون فواتير ورقية مكتوبة بخط اليد أو رسائل حساب على الواتساب بدلاً من الفواتير الضريبية، مع تحكم كامل في{' '}
                    <span className="font-bold text-[#123524]">ضريبة القيمة المضافة 14% (اختياري)</span> و
                    <span className="font-bold text-[#192631]">الخصم المكتسب (مبلغ مقطوع لجبر الكسر أو نسبة %)</span> قبل التحويل إلى أ. ميرنا ماجد للصرف.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 One-Click Preset Templates */}
            <div className="mt-4 border-t border-[#192631]/10 pt-4">
              <div className="mb-2 text-xs font-bold text-[#b45309]">
                اختر نموذج فاتورة جاهز للمحاكاة الفورية (3 قوالب عملية من الواقع) أو الصق رسالة واتساب / ارفع صورة الفاتورة:
              </div>
              <div className="flex flex-wrap gap-2.5">
                {OCR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadOcrPreset(preset.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                      activePresetId === preset.id
                        ? 'border-amber-400 bg-amber-500/20 text-[#b45309] shadow-md'
                        : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/85 hover:border-slate-600'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#b45309]" />
                    {preset.badge}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Right Column: WhatsApp / Handwritten Input Simulator (5 cols) */}
            <div className="space-y-4 rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 lg:col-span-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#123524]" />
                  <h3 className="text-sm font-bold text-[#192631]">
                    إدخال نص رسالة الواتساب أو صورة الفاتورة اليدوية
                  </h3>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-[#b45309] hover:bg-amber-500/20">
                  <Upload className="h-3.5 w-3.5" />
                  <span>رفع صورة فاتورة يدوية</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={() => {
                      handleLoadOcrPreset('preset-handwritten');
                    }}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#192631]/85">
                    اسم المورد الفردي / الموّان / المعرض
                  </label>
                  <input
                    type="text"
                    value={ocrSupplierName}
                    onChange={(e) => setOcrSupplierName(e.target.value)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#192631]/85">
                      ربط باعتماد الخامة المعتمد (MS)
                    </label>
                    <select
                      value={ocrSubmittalCode}
                      onChange={(e) => setOcrSubmittalCode(e.target.value)}
                      className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                    >
                      {SUBMITTAL_REGISTER.filter((s) => s.approved).map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.titleAr} ({s.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#192631]/85">
                      مخزن الوجهة / استلام العهدة
                    </label>
                    <select
                      value={ocrDestination}
                      onChange={(e) => setOcrDestination(e.target.value as WarehouseId)}
                      className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                    >
                      <option value="site_custody">تشوينات الموقع وعهدة مهندس الموقع</option>
                      <option value="ring_road_1">مخزن الدائري 1 - الرئيسي</option>
                      <option value="ring_road_2">مخزن الدائري 2 - المخزن المجاور</option>
                      <option value="nozha_hq">مقر الشركة بالنزهة - الخامات الثمينة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#192631]/85">
                    نص رسالة الواتساب أو محتوى الفاتورة الورقية المسحوبة ضوئياً (OCR Raw Text):
                  </label>
                  <textarea
                    rows={7}
                    value={ocrRawText}
                    onChange={(e) => setOcrRawText(e.target.value)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3 text-xs leading-relaxed text-[#123524] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3 text-[11px] text-[#192631]/70">
                  <div className="font-bold text-[#192631]">💡 كيف يعمل محرك الذكاء الاصطناعي (PO-OCR)؟</div>
                  <p className="mt-1">
                    يقوم النظام بتحليل رسائل الموانين أو الصور الملتقطة بالموبايل من الموقع، وتفكيكها إلى جدول بنود رقمي (كمية × فئة = إجمالي) مع تطبيق الخصم المتفق عليه والضريبة الاختيارية لإصدار أمر شراء رسمي (NPO) لقسم الحسابات.
                  </p>
                </div>
              </div>
            </div>

            {/* Left Column: Extracted Line Items & Eng. Pierre's Financial Controls (7 cols) */}
            <div className="space-y-5 rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#192631]">
                    جدول البنود المستخرجة القابل للتعديل (Extracted Line Items Table)
                  </h3>
                  <p className="text-xs text-[#192631]/70">
                    يمكنك تعديل أي كمية أو سعر وحدة أو إضافة بند جديد قبل الاعتماد النهائي
                  </p>
                </div>

                <button
                  onClick={handleAddOcrLine}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#123524]/25 bg-[#123524]/10 px-3 py-1.5 text-xs font-bold text-[#123524] hover:bg-[#123524]/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + إضافة بند للفاتورة
                </button>
              </div>

              {isScanningOcr ? (
                <div className="flex h-48 items-center justify-center rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90">
                  <div className="flex items-center gap-3 text-[#b45309]">
                    <Sparkles className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-bold">جاري قراءة الفاتورة وتحليل الكميات والأسعار...</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#192631]/10">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70">
                        <th className="px-3 py-2.5">بيان الخامة / البند</th>
                        <th className="w-24 px-2 py-2.5">الوحدة</th>
                        <th className="w-24 px-2 py-2.5">الكمية</th>
                        <th className="w-28 px-2 py-2.5">سعر الوحدة (ج.م)</th>
                        <th className="w-28 px-3 py-2.5">الإجمالي (ج.م)</th>
                        <th className="w-10 px-2 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#192631]/10 bg-[#f5f5f5]/90">
                      {ocrLines.map((line) => {
                        const lineTotal = line.qty * line.unitPrice;
                        return (
                          <tr key={line.id}>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => handleUpdateOcrLine(line.id, 'description', e.target.value)}
                                className="w-full rounded-lg border border-[#192631]/10 bg-white/80 backdrop-blur-md px-2.5 py-1.5 text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={line.unit}
                                onChange={(e) => handleUpdateOcrLine(line.id, 'unit', e.target.value)}
                                className="w-full rounded-lg border border-[#192631]/10 bg-white/80 backdrop-blur-md px-2 py-1.5 text-center text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={line.qty}
                                onChange={(e) => handleUpdateOcrLine(line.id, 'qty', e.target.value)}
                                className="w-full rounded-lg border border-[#192631]/10 bg-white/80 backdrop-blur-md px-2 py-1.5 text-center text-xs font-bold text-[#192631] focus:border-amber-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={line.unitPrice}
                                onChange={(e) => handleUpdateOcrLine(line.id, 'unitPrice', e.target.value)}
                                className="w-full rounded-lg border border-[#192631]/10 bg-white/80 backdrop-blur-md px-2 py-1.5 text-center text-xs font-bold text-[#b45309] focus:border-amber-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 font-mono text-xs font-bold text-[#123524]">
                              {lineTotal.toLocaleString()}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={() => handleRemoveOcrLine(line.id)}
                                className="rounded p-1 text-[#192631]/60 hover:bg-rose-500/10 hover:text-red-700"
                                title="حذف البند"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Eng. Pierre's Two Mandatory Financial Controls */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-amber-500/30 bg-[#f5f5f5]/90 p-4 md:grid-cols-2">
                {/* Control 1: Optional 14% VAT Toggle */}
                <div className="flex flex-col justify-between rounded-xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#192631]">
                        1. إضافة ضريبة القيمة المضافة 14% (اختياري)
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#192631]/70">
                        تُفعّل في حال إصدار فاتورة ضريبية وتُغلق في فواتير الموانين النقدية
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOcrVatEnabled((prev) => !prev)}
                      className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition ${
                        ocrVatEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          ocrVatEnabled ? '-translate-x-6' : '-translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#192631]/10 pt-2 text-xs">
                    <span className="text-[#192631]/70">حالة الضريبة (14% VAT):</span>
                    <span className={ocrVatEnabled ? 'font-bold text-[#123524]' : 'font-bold text-[#192631]/70'}>
                      {ocrVatEnabled
                        ? `مفعّلة (+${ocrFinancials.vatAmount.toLocaleString()} ج.م)`
                        : 'غير مفعّلة (0 ج.م - فاتورة موّان بدون ضريبة)'}
                    </span>
                  </div>
                </div>

                {/* Control 2: Lump-Sum or Percentage Discount Input */}
                <div className="flex flex-col justify-between rounded-xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#192631]">
                        2. خصم مكتسب (مبلغ مقطوع أو نسبة %)
                      </span>
                      <div className="flex rounded-lg border border-[#192631]/10 bg-[#f5f5f5]/90 p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setOcrDiscountType('lump_sum')}
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            ocrDiscountType === 'lump_sum'
                              ? 'bg-amber-500 text-slate-950'
                              : 'text-[#192631]/70 hover:text-[#192631]'
                          }`}
                        >
                          مبلغ مقطوع (ج.م)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrDiscountType('percentage')}
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            ocrDiscountType === 'percentage'
                              ? 'bg-amber-500 text-slate-950'
                              : 'text-[#192631]/70 hover:text-[#192631]'
                          }`}
                        >
                          نسبة %
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={ocrDiscountValue}
                        onChange={(e) => setOcrDiscountValue(Number(e.target.value) || 0)}
                        className="w-full rounded-lg border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-1.5 text-xs font-bold text-[#b45309] focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOcrDiscountType('lump_sum');
                          const remainder = ocrFinancials.subtotal % 1000;
                          setOcrDiscountValue(remainder > 0 ? remainder : 430);
                        }}
                        className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-[#b45309] hover:bg-amber-500/20"
                        title="جبر كسر الألف تلقائياً كما في مثال 20,430 إلى 20,000"
                      >
                        جبر الكسر تلقائياً
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-[#192631]/10 pt-2 text-xs">
                    <span className="text-[#192631]/70">قيمة الخصم الفعلي:</span>
                    <span className="font-bold text-[#b45309]">
                      -{ocrFinancials.discountAmount.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Payable Summary & Conversion CTA */}
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#123524]/25 bg-gradient-to-l from-emerald-950/40 to-slate-950 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-4 text-[#192631]/85">
                    <span>إجمالي البنود: {ocrFinancials.subtotal.toLocaleString()} ج.م</span>
                    <span>•</span>
                    <span className="text-[#b45309]">
                      الخصم: -{ocrFinancials.discountAmount.toLocaleString()} ج.م
                    </span>
                    <span>•</span>
                    <span className="text-[#192631]">
                      ضريبة 14%: +{ocrFinancials.vatAmount.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-[#192631]">
                    الصافي النهائي المستحق للصرف (Net Payable):{' '}
                    <span className="text-xl text-[#123524]">
                      {ocrFinancials.netPayable.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConvertOcrToOfficialPO}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 md:text-sm"
                >
                  <Send className="h-4 w-4" />
                  اعتماد وتحويل لأمر شراء رسمي (NPO) + إرسال لميرنا (الحسابات) لطلب صرف (PR)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: MERNA ACCOUNTING (PR / POP) & MILAD LOGISTICS DISPATCH
         ===================================================================== */}
      {activeSubTab === 'accounting_logistics' && (
        <div className="space-y-6">
          {/* Pipeline Flow Header */}
          <div className="rounded-2xl border border-[#e04b2a]/25 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-5">
            <h2 className="text-base font-bold text-[#192631]">
              مسار التكامل بين المكتب الفني ⬅ حسابات أ. ميرنا ماجد (PR / POP) ⬅ لوجستيات أ. ميلاد هارون
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-6">
              {[
                { step: '1. اعتماد الخامة', sub: 'Submittal Approved (A/B)', color: 'border-[#123524]/25 bg-[#123524]/10 text-[#123524]' },
                { step: '2. أمر الشراء', sub: 'PO Issued (NPO)', color: 'border-cyan-500/40 bg-cyan-500/10 text-[#192631]' },
                { step: '3. طلب صرف مالي', sub: 'Payment Request (PR - Merna)', color: 'border-[#e04b2a]/25 bg-[#e04b2a]/10 text-[#e04b2a]' },
                { step: '4. إثبات الدفع', sub: 'Proof of Payment (POP Attached)', color: 'border-amber-500/40 bg-amber-500/10 text-[#b45309]' },
                { step: '5. توجيه اللوجستيات', sub: 'Logistics Dispatched (Milad)', color: 'border-purple-500/40 bg-purple-500/10 text-[#192631]' },
                { step: '6. استلام المخزن/الموقع', sub: 'Warehouse / Site Custody', color: 'border-[#123524]/25 bg-[#123524]/10 text-[#123524]' }
              ].map((st, idx) => (
                <div key={idx} className={`rounded-xl border p-2.5 text-center ${st.color}`}>
                  <div className="font-bold">{st.step}</div>
                  <div className="mt-0.5 text-[10px] opacity-80">{st.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Modes Reference Cards (Milad Haroun Dispatcher) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-white/80 backdrop-blur-md p-4">
              <div className="flex items-center gap-2.5 text-[#192631]">
                <Car className="h-5 w-5" />
                <h3 className="text-sm font-bold">🚗 سيارة الشركة - ميلاد هارون</h3>
              </div>
              <p className="mt-1.5 text-xs text-[#192631]/70">
                تُستخدم لنقل الخامات الثمينة (خلاطات جروهي، سمارت هوم، إضاءة) إلى مقر النزهة أو المواقع مع تتبع عداد الكيلومتر وحصة البنزين وخط السير.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-white/80 backdrop-blur-md p-4">
              <div className="flex items-center gap-2.5 text-[#b45309]">
                <Bike className="h-5 w-5" />
                <h3 className="text-sm font-bold">🏍️ أوبر بايك / مرسول سريع (Uber Bike)</h3>
              </div>
              <p className="mt-1.5 text-xs text-[#192631]/70">
                للخامات الخفيفة والعاجلة جداً (عينات دهانات، مسامير، سيليكون، لقم مفاتيح كهرباء) لتجنب تعطيل الصنايعية بالموقع.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-white/80 backdrop-blur-md p-4">
              <div className="flex items-center gap-2.5 text-[#192631]">
                <Truck className="h-5 w-5" />
                <h3 className="text-sm font-bold">🚛 سيارة نقل خارجي / جامبو / ونش تطليع</h3>
              </div>
              <p className="mt-1.5 text-xs text-[#192631]/70">
                للحمولات الثقيلة (باليتات البورسلين، ألواح الجبس بورد، شكاير الأسمنت والرمل) مع تنسيق ونش التطليع للوحدات المرتفعة.
              </p>
            </div>
          </div>

          {/* Orders Pipeline Cards */}
          <div className="space-y-4">
            {purchaseOrders.map((po) => {
              const isPaid = po.prStatus === 'POP Attached (Paid)';
              return (
                <div
                  key={po.id}
                  className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-md transition hover:border-[#192631]/10"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-[#192631]/10 pb-4 lg:flex-row lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-[#123524]">
                          {po.npoCode}
                        </span>
                        <span className="rounded-md border border-[#192631]/10 bg-[#f5f5f5]/90 px-2 py-0.5 font-mono text-xs text-[#192631]/85">
                          اعتماد: {po.submittalCode} ({po.submittalStatus})
                        </span>
                        <span className="rounded-md border border-[#e04b2a]/25 bg-[#e04b2a]/10 px-2.5 py-0.5 font-mono text-xs font-bold text-[#e04b2a]">
                          {po.prCode}
                        </span>
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-[#192631]">
                        {po.vendorName} — <span className="text-[#123524]">{po.netPayable.toLocaleString()} ج.م</span>
                      </div>
                      <div className="mt-0.5 text-xs text-[#192631]/70">
                        الوجهة المحددة: <span className="font-semibold text-[#192631]">{WAREHOUSE_META[po.destinationWarehouse].nameAr}</span> | المستلم: {po.siteReceiver}
                      </div>
                    </div>

                    {/* Merna Accounting Action */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {!isPaid ? (
                        <button
                          onClick={() => handleAttachMernaPOP(po.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
                        >
                          <CreditCard className="h-4 w-4" />
                          إرفاق إثبات الدفع (POP) - أ. ميرنا ماجد
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#123524]/25 bg-[#123524]/10 px-3.5 py-2 text-xs font-bold text-[#123524]">
                          <CheckCircle2 className="h-4 w-4" />
                          تم السداد وإرفاق POP ({po.popRef})
                        </span>
                      )}

                      {isPaid && po.logisticsStatus !== 'Delivered & Verified' && (
                        <button
                          onClick={() => handleAdvanceLogisticsStage(po.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#e04b2a] px-4 py-2 text-xs font-bold text-[#192631] shadow-lg shadow-indigo-600/20 hover:bg-[#c83e1f]"
                        >
                          <Truck className="h-4 w-4" />
                          {po.logisticsStatus === 'Ready for Dispatch'
                            ? 'تأكيد تحرك الشحنة (ميلاد هارون)'
                            : 'تأكيد وصول واستلام المخزن / الموقع'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logistics Dispatcher Row (Milad Haroun) */}
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <label className="mb-1.5 block text-xs font-bold text-[#192631]/85">
                        توجيه اللوجستيات واختيار وسيلة النقل (أ. ميلاد هارون):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleChangeTransportMode(po.id, 'milad_car')}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center text-[11px] font-bold transition ${
                            po.transportMode === 'milad_car'
                              ? 'border-cyan-400 bg-cyan-500/20 text-[#192631]'
                              : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70 hover:border-[#192631]/10'
                          }`}
                        >
                          <Car className="mb-1 h-4 w-4 text-[#192631]" />
                          <span>سيارة الشركة</span>
                          <span className="text-[9px] font-normal opacity-80">ميلاد هارون</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeTransportMode(po.id, 'uber_bike')}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center text-[11px] font-bold transition ${
                            po.transportMode === 'uber_bike'
                              ? 'border-amber-400 bg-amber-500/20 text-[#b45309]'
                              : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70 hover:border-[#192631]/10'
                          }`}
                        >
                          <Bike className="mb-1 h-4 w-4 text-[#b45309]" />
                          <span>أوبر بايك سريع</span>
                          <span className="text-[9px] font-normal opacity-80">عينات / خفيف</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeTransportMode(po.id, 'external_truck')}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center text-[11px] font-bold transition ${
                            po.transportMode === 'external_truck'
                              ? 'border-purple-400 bg-purple-500/20 text-[#192631]'
                              : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70 hover:border-[#192631]/10'
                          }`}
                        >
                          <Truck className="mb-1 h-4 w-4 text-[#192631]" />
                          <span>نقل خارجي / ونش</span>
                          <span className="text-[9px] font-normal opacity-80">حمولات ثقيلة</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3.5 text-xs lg:col-span-7">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-[#192631]">
                          مسؤول النقل: <span className="text-[#192631]">{po.driverOrCourier}</span>
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            po.logisticsStatus === 'Delivered & Verified'
                              ? 'bg-[#123524]/10 text-[#123524]'
                              : po.logisticsStatus === 'Dispatched (In Transit)'
                              ? 'bg-[#e04b2a]/10 text-[#e04b2a]'
                              : po.logisticsStatus === 'Ready for Dispatch'
                              ? 'bg-cyan-500/20 text-[#192631]'
                              : 'bg-amber-500/20 text-[#b45309]'
                          }`}
                        >
                          {po.logisticsStatus}
                        </span>
                      </div>
                      <div className="mt-2 text-[#192631]/70">{po.tripDetails}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 4: 4-LOCATION WAREHOUSE & CUSTODY TRACKER
         ===================================================================== */}
      {activeSubTab === 'warehouses' && (
        <div className="space-y-6">
          {/* 4 Locations Interactive Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(WAREHOUSE_META) as WarehouseId[]).map((whId) => {
              const meta = WAREHOUSE_META[whId];
              const itemsInWh = warehouseStock.filter((i) => i.warehouseId === whId);
              const totalVal = itemsInWh.reduce((s, i) => s + i.qty * i.unitValue, 0);
              const isSelected = selectedWarehouseFilter === whId;

              return (
                <div
                  key={whId}
                  onClick={() => setSelectedWarehouseFilter(isSelected ? 'ALL' : whId)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? `${meta.borderClass} bg-white/85 backdrop-blur-xl shadow-lg ring-2 ring-cyan-500/40`
                      : 'border-[#192631]/10 bg-white/80 backdrop-blur-md hover:border-[#192631]/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.colorClass}`}>
                      {meta.badge}
                    </span>
                    {whId === 'nozha_hq' ? (
                      <Lock className="h-4 w-4 text-[#b45309]" />
                    ) : whId === 'site_custody' ? (
                      <UserCheck className="h-4 w-4 text-[#123524]" />
                    ) : (
                      <Warehouse className="h-4 w-4 text-[#192631]" />
                    )}
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#192631]">{meta.nameAr}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#192631]/70">{meta.description}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#192631]/10 pt-3 text-xs">
                    <div>
                      <div className="text-[10px] text-[#192631]/60">الأصناف المسجلة</div>
                      <div className="font-bold text-[#192631]">{itemsInWh.length} أصناف</div>
                    </div>
                    <div className="text-start">
                      <div className="text-[10px] text-[#192631]/60">قيمة العهدة الحالية</div>
                      <div className="font-bold text-[#123524]">{totalVal.toLocaleString()} ج.م</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter Bar + Transfer CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#192631]/70">تصفية المخزن:</span>
              <button
                onClick={() => setSelectedWarehouseFilter('ALL')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedWarehouseFilter === 'ALL'
                    ? 'bg-cyan-600 text-[#192631]'
                    : 'bg-[#f5f5f5]/90 text-[#192631]/70 hover:text-[#192631]'
                }`}
              >
                كل المخازن الأربعة ({warehouseStock.length})
              </button>
              {(Object.keys(WAREHOUSE_META) as WarehouseId[]).map((whId) => (
                <button
                  key={whId}
                  onClick={() => setSelectedWarehouseFilter(whId)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedWarehouseFilter === whId
                      ? 'bg-cyan-600 text-[#192631]'
                      : 'bg-[#f5f5f5]/90 text-[#192631]/70 hover:text-[#192631]'
                  }`}
                >
                  {WAREHOUSE_META[whId].badge}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-[#192631] shadow-lg shadow-cyan-600/20 hover:bg-cyan-500"
            >
              <ArrowRightLeft className="h-4 w-4" />
              + تحويل مخزون بين المخازن / صرف للموقع
            </button>
          </div>

          {/* Inventory & Custody Table */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5">
            <h3 className="mb-4 text-base font-bold text-[#192631]">
              سجل الأرصدة والعهدة بالمخازن الأربعة ومطابقة كميات أوامر الشراء (Inventory & Site Custody Verification)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70">
                    <th className="px-3 py-3">كود الصنف والبيان</th>
                    <th className="px-3 py-3">الموقع المخزني (Warehouse)</th>
                    <th className="px-3 py-3">المشروع المخصص</th>
                    <th className="px-3 py-3">الرصيد الفعلي مقابل PO</th>
                    <th className="px-3 py-3">إجمالي القيمة</th>
                    <th className="px-3 py-3">مستلم العهدة والتوقيت</th>
                    <th className="px-3 py-3">حالة الفحص (MIR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredWarehouseItems.map((item) => {
                    const whMeta = WAREHOUSE_META[item.warehouseId];
                    return (
                      <tr key={item.id} className="transition hover:bg-[#192631]/[0.05]">
                        <td className="px-3 py-3.5 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#192631]">{item.itemCode}</span>
                            <span className="rounded bg-[#192631]/[0.05] px-2 py-0.5 text-[10px] text-[#192631]/85">
                              {item.category}
                            </span>
                          </div>
                          <div className="mt-1 font-bold text-[#192631]">{item.nameAr}</div>
                          <div className="text-[11px] text-[#192631]/70">{item.nameEn}</div>
                        </td>

                        <td className="px-3 py-3.5 align-top">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${whMeta.colorClass}`}>
                            {whMeta.badge}
                          </span>
                          <div className="mt-1 text-[10px] text-[#192631]/70">{item.securityLevel}</div>
                        </td>

                        <td className="px-3 py-3.5 align-top">
                          <div className="font-semibold text-[#192631]">{item.projectAllocated}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-[#192631]/70">مرجع: {item.npoRef}</div>
                        </td>

                        <td className="px-3 py-3.5 align-top">
                          <div className="text-sm font-extrabold text-[#192631]">
                            {item.qty} <span className="text-xs font-normal text-[#192631]/70">{item.unit}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#192631]/70">
                            كمية أمر الشراء: {item.poQty} {item.unit}
                          </div>
                        </td>

                        <td className="px-3 py-3.5 align-top font-mono text-xs font-bold text-[#123524]">
                          {(item.qty * item.unitValue).toLocaleString()} ج.م
                        </td>

                        <td className="px-3 py-3.5 align-top">
                          <div className="font-semibold text-[#192631]">{item.custodyReceiver}</div>
                          <div className="mt-0.5 text-[11px] text-[#192631]/70">{item.lastUpdated}</div>
                        </td>

                        <td className="px-3 py-3.5 align-top">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#123524]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#123524]">
                            <FileCheck2 className="h-3 w-3" />
                            {item.mirStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custody Transfer Log */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5">
            <h3 className="mb-3 text-sm font-bold text-[#192631]">
              سجل حركات التحويل بين المخازن وصرف العهدة للمواقع (Custody Transfer & Dispatch Ledger)
            </h3>
            <div className="space-y-2.5">
              {transferLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3.5 text-xs md:flex-row md:items-center"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-[#192631]">{log.transferCode}</span>
                    <span className="font-bold text-[#192631]">
                      {log.itemTitle} ({log.qty} {log.unit})
                    </span>
                    <span className="text-[#192631]/70">
                      من <strong className="text-[#b45309]">{WAREHOUSE_META[log.fromWarehouse].badge}</strong> ⬅ إلى{' '}
                      <strong className="text-[#123524]">{WAREHOUSE_META[log.toWarehouse].badge}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#192631]/70">
                    <span>بواسطة: {log.dispatcher}</span>
                    <span>•</span>
                    <span className="text-[#192631]">المستلم: {log.receiverName}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: + CREATE PURCHASE ORDER (NPO) WITH SUBMITTAL GATEKEEPER
         ===================================================================== */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192631]/40 p-4 backdrop-blur-sm">
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-6 text-[#192631] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-[#123524]" />
                <h3 className="text-lg font-bold text-[#192631]">
                  إصدار أمر شراء جديد مربوط باعتماد خامة (+ Create Submittal-Gated NPO)
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePOModal(false)}
                className="rounded-lg p-1.5 text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Step 1: Select Material Submittal */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#192631]/85">
                  1. اختر اعتماد الخامة (Material Submittal - MS) من سجل المشروع:
                </label>
                <select
                  value={selectedSubmittalCode}
                  onChange={(e) => handleSelectSubmittalInModal(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3.5 py-2.5 text-xs font-bold text-[#192631] focus:border-emerald-500 focus:outline-none"
                >
                  {SUBMITTAL_REGISTER.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.approved ? '🟢 [معتمد - مسموح]' : '⛔ [غير معتمد - محظور]'} {sub.code} — {sub.titleAr} ({sub.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Gatekeeper Status Box */}
              {selectedSubmittalObj.approved ? (
                <div className="rounded-xl border border-[#123524]/25 bg-emerald-950/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#123524]">
                    <Unlock className="h-5 w-5 shrink-0 text-[#123524]" />
                    <span>
                      ✅ بوابة المشتريات مفتوحة (UNLOCKED): الاعتماد ({selectedSubmittalObj.code}) حاصل على ({selectedSubmittalObj.status})
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#192631]/85">
                    الخامة معتمدة رسمياً من الاستشاري ({selectedSubmittalObj.titleEn}) — يُسمح بإصدار أمر الشراء (NPO) وتحويله للحسابات.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-rose-500/70 bg-rose-950/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-red-700">
                    <ShieldAlert className="h-6 w-6 shrink-0 text-red-700" />
                    <span>
                      ⛔ Procurement Gatekeeper Blocked: Cannot issue Purchase Order (NPO) until Material Submittal is Approved (`Code A` or Code B) by the Consultant!
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-red-700">
                    حالة الاعتماد الحالية لـ <strong>{selectedSubmittalObj.code} ({selectedSubmittalObj.titleAr})</strong> هي{' '}
                    <span className="underline">{selectedSubmittalObj.status}</span>. طبقاً لتعليمات م. بيير، تم قفل زر إصدار أمر الشراء تلقائياً لحين الحصول على اعتماد الاستشاري.
                  </p>
                </div>
              )}

              {/* Step 2: Vendor Flow Selection */}
              <div className={selectedSubmittalObj.approved ? 'space-y-4' : 'pointer-events-none opacity-40 space-y-4'}>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#192631]/85">
                    2. اختر مسار المورد (Vendor Flow):
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setNewPOVendorType('corporate')}
                      className={`rounded-xl border p-3 text-start transition ${
                        newPOVendorType === 'corporate'
                          ? 'border-emerald-500 bg-[#123524]/10 text-[#192631]'
                          : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70'
                      }`}
                    >
                      <div className="text-xs font-bold">🏢 شركة موردة رسمية (Corporate Supplier)</div>
                      <div className="mt-1 text-[11px] text-[#192631]/70">
                        أمر شراء رسمي NPO ⬅ أ. ميرنا ماجد (PR / POP) ⬅ التصنيع والتوريد
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewPOVendorType('local_mawan')}
                      className={`rounded-xl border p-3 text-start transition ${
                        newPOVendorType === 'local_mawan'
                          ? 'border-amber-500 bg-amber-500/15 text-white'
                          : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70'
                      }`}
                    >
                      <div className="text-xs font-bold">🧾 مورّد فردي / موّان (Local Supplier / PO-OCR)</div>
                      <div className="mt-1 text-[11px] text-[#192631]/70">
                        تحويل مباشر لماسح فواتير الواتساب والفواتير اليدوية للموانين
                      </div>
                    </button>
                  </div>
                </div>

                {newPOVendorType === 'corporate' && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-[#192631]/85">اسم الشركة الموردة</label>
                        <input
                          type="text"
                          value={newPOVendorName}
                          onChange={(e) => setNewPOVendorName(e.target.value)}
                          className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-[#192631]/85">مخزن الوجهة / استلام العهدة</label>
                        <select
                          value={newPODestination}
                          onChange={(e) => setNewPODestination(e.target.value as WarehouseId)}
                          className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631]"
                        >
                          <option value="ring_road_2">مخزن الدائري 2 - المخزن المجاور</option>
                          <option value="ring_road_1">مخزن الدائري 1 - الرئيسي</option>
                          <option value="nozha_hq">مقر الشركة بالنزهة (الخامات الثمينة المؤمنة)</option>
                          <option value="site_custody">تشوينات الموقع وعهدة مهندس الموقع</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs text-[#192631]/85">
                          الكمية المطلوبة ({selectedSubmittalObj.defaultUnit})
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={newPOQty}
                          onChange={(e) => setNewPOQty(Number(e.target.value) || 1)}
                          className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs font-bold text-[#192631]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-[#192631]/85">سعر الوحدة (ج.م)</label>
                        <input
                          type="number"
                          min={1}
                          value={newPOUnitPrice}
                          onChange={(e) => setNewPOUnitPrice(Number(e.target.value) || 0)}
                          className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs font-bold text-[#123524]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-[#192631]/85">خصم مكتسب مقطوع (ج.م)</label>
                        <input
                          type="number"
                          min={0}
                          value={newPODiscountValue}
                          onChange={(e) => setNewPODiscountValue(Number(e.target.value) || 0)}
                          className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs font-bold text-[#b45309]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3.5 py-2.5 text-xs">
                      <span className="text-[#192631]/85">إضافة ضريبة القيمة المضافة 14% (VAT):</span>
                      <button
                        type="button"
                        onClick={() => setNewPOVatEnabled((prev) => !prev)}
                        className={`rounded-lg px-3 py-1 font-bold transition ${
                          newPOVatEnabled
                            ? 'bg-[#123524]/10 text-[#123524]'
                            : 'bg-[#192631]/[0.05] text-[#192631]/70'
                        }`}
                      >
                        {newPOVatEnabled ? 'مفعّلة (14% VAT ✓)' : 'بدون ضريبة (0%)'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#192631]/10 pt-4">
              <button
                onClick={() => setShowCreatePOModal(false)}
                className="rounded-xl border border-[#192631]/10 px-4 py-2 text-xs font-bold text-[#192631]/85 hover:bg-[#192631]/[0.05]"
              >
                إلغاء
              </button>
              <button
                disabled={!selectedSubmittalObj.approved}
                onClick={handleCreateSubmittalGatedPO}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                  selectedSubmittalObj.approved
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500'
                    : 'cursor-not-allowed bg-rose-950/60 text-red-700 opacity-75'
                }`}
              >
                {selectedSubmittalObj.approved ? (
                  <>
                    <Check className="h-4 w-4" />
                    {newPOVendorType === 'corporate'
                      ? 'إصدار أمر الشراء الرسمي (NPO) وإرساله لميرنا (الحسابات)'
                      : 'الانتقال لماسح فواتير الواتساب والموانين (PO-OCR)'}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    محظور الإصدار (الاعتماد غير مكتمل)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: + TRANSFER STOCK BETWEEN WAREHOUSES / DISPATCH TO SITE
         ===================================================================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192631]/40 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-xl rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-6 text-[#192631] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="h-5 w-5 text-[#192631]" />
                <h3 className="text-base font-bold text-[#192631]">
                  تحويل مخزون بين المخازن الأربعة أو صرف عهدة لموقع (Stock Custody Transfer)
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="rounded-lg p-1.5 text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-[#192631]/85">
                  اختر الصنف المراد نقله (ومخزن المصدر الحالي):
                </label>
                <select
                  value={transferStockId}
                  onChange={(e) => {
                    setTransferStockId(e.target.value);
                    const found = warehouseStock.find((s) => s.id === e.target.value);
                    if (found) {
                      setTransferQty(Math.min(4, found.qty));
                    }
                  }}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2.5 text-xs font-bold text-[#192631]"
                >
                  {warehouseStock.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{WAREHOUSE_META[item.warehouseId].badge}] {item.nameAr} — المتاح: {item.qty} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-[#192631]/85">إلى مخزن الوجهة / الموقع:</label>
                  <select
                    value={transferToWarehouse}
                    onChange={(e) => setTransferToWarehouse(e.target.value as WarehouseId)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs font-bold text-[#192631]"
                  >
                    <option value="site_custody">تشوينات الموقع وعهدة مهندس الموقع (مشروع C096 أزاد)</option>
                    <option value="nozha_hq">مقر الشركة بالنزهة - مخزن الخامات الثمينة</option>
                    <option value="ring_road_1">مخزن الدائري 1 - الرئيسي</option>
                    <option value="ring_road_2">مخزن الدائري 2 - المخزن المجاور</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-[#192631]/85">
                    الكمية المحولة (المتاح: {selectedSourceStock?.qty} {selectedSourceStock?.unit})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedSourceStock?.qty || 1}
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs font-bold text-[#192631]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-[#192631]/85">وسيلة النقل (توجيه أ. ميلاد هارون):</label>
                  <select
                    value={transferTransportMode}
                    onChange={(e) => setTransferTransportMode(e.target.value as TransportMode)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631]"
                  >
                    <option value="milad_car">🚗 سيارة الشركة - ميلاد هارون</option>
                    <option value="uber_bike">🏍️ أوبر بايك / مرسول سريع</option>
                    <option value="external_truck">🚛 سيارة نقل خارجي / جامبو</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-[#192631]/85">اسم المهندس / أمين المخزن المستلم للعهدة:</label>
                  <input
                    type="text"
                    value={transferReceiverName}
                    onChange={(e) => setTransferReceiverName(e.target.value)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#192631]/10 pt-4">
              <button
                onClick={() => setShowTransferModal(false)}
                className="rounded-xl border border-[#192631]/10 px-4 py-2 text-xs font-bold text-[#192631]/85 hover:bg-[#192631]/[0.05]"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteStockTransfer}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-[#192631] shadow-lg shadow-cyan-600/25 hover:bg-cyan-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                تأكيد التحويل وتوقيع استلام العهدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementWarehouseHub;
