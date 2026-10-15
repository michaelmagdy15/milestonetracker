import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Building2,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Users,
  HardHat,
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  ShieldCheck,
  Receipt,
  Layers,
  X,
  Check,
  Percent,
  Landmark,
  Smartphone,
  Banknote,
  Info,
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SubTabKey = 'vaults_banks' | 'credit_cards' | 'projects_matrix' | 'eworks_audit';

export interface CashBankAccount {
  id: string;
  nameAr: string;
  nameEn: string;
  accountType: 'vault' | 'corporate_bank' | 'retail_bank' | 'digital_wallet' | 'site_custody';
  accountNumber: string;
  bankName: string;
  currency: 'EGP';
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  currentBalance: number;
  custodianAr: string;
  lastUpdated: string;
}

export interface TreasuryJournalEntry {
  id: string;
  date: string;
  referenceNo: string;
  txType: 'deposit' | 'payment' | 'transfer';
  accountId: string;
  accountNameAr: string;
  targetAccountId?: string;
  targetAccountNameAr?: string;
  projectCode: string;
  counterpartyAr: string;
  categoryAr: string;
  amount: number;
  notesAr: string;
}

export interface CorporateCreditCard {
  id: string;
  cardNameAr: string;
  cardNameEn: string;
  bankName: string;
  cardNumberMasked: string;
  cardholderAr: string;
  totalLimit: number;
  usedAmount: number;
  availableLimit: number;
  statementClosingDay: number;
  paymentDueDay: number;
  status: 'active' | 'near_limit';
}

export interface CardInstallmentPlan {
  id: string;
  cardId: string;
  cardNameAr: string;
  merchantAr: string;
  materialDescriptionAr: string;
  projectCode: string;
  totalPurchaseAmount: number;
  totalMonths: number;
  paidMonths: number;
  monthlyInstallment: number;
  interestRatePercent: number;
  nextDueDate: string;
  status: 'active' | 'completed';
}

export interface ProjectCashflowRow {
  id: string;
  projectCode: string;
  projectNameAr: string;
  compoundName: string;
  clientNameAr: string;
  zone: string;
  contractValue: number;
  clientCollections: number;
  actualExpenses: number;
  netCashPosition: number;
  actualProfitMarginPct: number;
  supervisionFeePct: number;
  status: 'active' | 'handover' | 'finishing';
}

export interface EWorksMigrationRecord {
  id: string;
  legacyEworksCode: string;
  nexusTargetRef: string;
  moduleType: 'extracts' | 'client_balances' | 'purchase_orders' | 'subcontractor_statements';
  moduleLabelAr: string;
  projectCode: string;
  entityNameAr: string;
  eworksLegacyBalance: number;
  nexusMigratedBalance: number;
  varianceAmount: number;
  auditStatus: 'verified' | 'flagged';
  auditorNoteAr: string;
  migratedAt: string;
}

// ============================================================================
// EXACT LIVE ACTPERT NEXUS DATA SNAPSHOT
// ============================================================================

// 6 Active Cash/Vault & Bank Accounts summing to 254,833.88 EGP
const INITIAL_CASH_BANK_ACCOUNTS: CashBankAccount[] = [
  {
    id: 'ACC-01',
    nameAr: 'خزينة المكتب الرئيسية بالنزهة',
    nameEn: 'Main Office Cash Vault - El Nozha HQ',
    accountType: 'vault',
    accountNumber: 'VAULT-HQ-001',
    bankName: 'خزينة نقدية - المقر الرئيسي',
    currency: 'EGP',
    openingBalance: 85000.0,
    totalInflows: 1420500.0,
    totalOutflows: 1447120.5,
    currentBalance: 58379.5,
    custodianAr: 'أ. محمد عبد الرحمن (أمين الخزينة)',
    lastUpdated: '2026-10-15 16:45',
  },
  {
    id: 'ACC-02',
    nameAr: 'بنك CIB - حساب شركات جاري',
    nameEn: 'CIB Corporate Current Account',
    accountType: 'corporate_bank',
    accountNumber: '100048291044',
    bankName: 'البنك التجاري الدولي CIB',
    currency: 'EGP',
    openingBalance: 250000.0,
    totalInflows: 4850000.0,
    totalOutflows: 4987549.62,
    currentBalance: 112450.38,
    custodianAr: 'الإدارة المالية - توقيع مشترك',
    lastUpdated: '2026-10-15 16:30',
  },
  {
    id: 'ACC-03',
    nameAr: 'البنك الأهلي المصري NBE - حساب أفراد [Debit حساب افراد NBE]',
    nameEn: 'NBE Retail Debit Operational Account',
    accountType: 'retail_bank',
    accountNumber: '011307092814',
    bankName: 'البنك الأهلي المصري NBE',
    currency: 'EGP',
    openingBalance: 40000.0,
    totalInflows: 980250.0,
    totalOutflows: 978120.0,
    currentBalance: 42130.0,
    custodianAr: 'م. أحمد طارق (بطاقة خصم مباشر للمشتريات)',
    lastUpdated: '2026-10-15 15:50',
  },
  {
    id: 'ACC-04',
    nameAr: 'بنك QNB الأهلي - حساب جاري',
    nameEn: 'QNB Alahli Current Account',
    accountType: 'corporate_bank',
    accountNumber: '20319488501',
    bankName: 'بنك قطر الوطني الأهلي QNB',
    currency: 'EGP',
    openingBalance: 60000.0,
    totalInflows: 615000.0,
    totalOutflows: 656126.0,
    currentBalance: 18874.0,
    custodianAr: 'الإدارة المالية - حساب مقاولين وموردين',
    lastUpdated: '2026-10-15 14:20',
  },
  {
    id: 'ACC-05',
    nameAr: 'محفظة فودافون كاش وإنستاباي',
    nameEn: 'Vodafone Cash & InstaPay Settlement Pool',
    accountType: 'digital_wallet',
    accountNumber: '01009283741 / actpert@instapay',
    bankName: 'تحويلات لحظية IPN / فودافون كاش',
    currency: 'EGP',
    openingBalance: 15000.0,
    totalInflows: 342800.0,
    totalOutflows: 349300.0,
    currentBalance: 8500.0,
    custodianAr: 'مسؤول التسويات السريعة واليوميات',
    lastUpdated: '2026-10-15 16:55',
  },
  {
    id: 'ACC-06',
    nameAr: 'عهدة مهندسي المواقع واللوجستيات',
    nameEn: 'Site Engineers & Logistics Custody Pool',
    accountType: 'site_custody',
    accountNumber: 'CUST-POOL-06',
    bankName: 'عهدة مواقع جارية (التجمع / زايد / مدينتي)',
    currency: 'EGP',
    openingBalance: 30000.0,
    totalInflows: 510000.0,
    totalOutflows: 525500.0,
    currentBalance: 14500.0,
    custodianAr: 'مدير التنفيذ ومهندسي المواقع (6 مناطق)',
    lastUpdated: '2026-10-15 16:10',
  },
];

// 7 Corporate Credit Cards summing to 483,450.31 EGP Available Unused Limit
const INITIAL_CREDIT_CARDS: CorporateCreditCard[] = [
  {
    id: 'CC-01',
    cardNameAr: 'كارت مشتريات الشركات تيتانيوم - CIB',
    cardNameEn: 'CIB Titanium Corporate Purchasing Card',
    bankName: 'البنك التجاري الدولي CIB',
    cardNumberMasked: '**** **** **** 4892',
    cardholderAr: 'م. كريم المنشاوي (المدير التنفيذي)',
    totalLimit: 150000.0,
    usedAmount: 42350.0,
    availableLimit: 107650.0,
    statementClosingDay: 25,
    paymentDueDay: 15,
    status: 'active',
  },
  {
    id: 'CC-02',
    cardNameAr: 'كارت بلاتينيوم توريدات وتشطيبات - NBE',
    cardNameEn: 'NBE Platinum Procurement Card',
    bankName: 'البنك الأهلي المصري NBE',
    cardNumberMasked: '**** **** **** 8310',
    cardholderAr: 'م. أحمد طارق (مدير المشتريات)',
    totalLimit: 120000.0,
    usedAmount: 38420.5,
    availableLimit: 81579.5,
    statementClosingDay: 28,
    paymentDueDay: 20,
    status: 'active',
  },
  {
    id: 'CC-03',
    cardNameAr: 'كارت QNB الأهلي إنفينيت إداري',
    cardNameEn: 'QNB Alahli Infinite Executive Card',
    bankName: 'بنك QNB الأهلي',
    cardNumberMasked: '**** **** **** 5521',
    cardholderAr: 'أ. محمد عبد الرحمن (المدير المالي)',
    totalLimit: 200000.0,
    usedAmount: 84129.19,
    availableLimit: 115870.81,
    statementClosingDay: 1,
    paymentDueDay: 22,
    status: 'active',
  },
  {
    id: 'CC-04',
    cardNameAr: 'كارت بنك مصر وورلد لتمويل الخامات',
    cardNameEn: 'Banque Misr World Materials Card',
    bankName: 'بنك مصر Banque Misr',
    cardNumberMasked: '**** **** **** 9044',
    cardholderAr: 'م. مصطفى الشاذلي (إدارة التوريدات)',
    totalLimit: 100000.0,
    usedAmount: 35650.0,
    availableLimit: 64350.0,
    statementClosingDay: 5,
    paymentDueDay: 25,
    status: 'active',
  },
  {
    id: 'CC-05',
    cardNameAr: 'كارت HSBC أدفانس لطوارئ المواقع',
    cardNameEn: 'HSBC Advance Site & Logistics Card',
    bankName: 'بنك HSBC مصر',
    cardNumberMasked: '**** **** **** 3319',
    cardholderAr: 'م. شريف عبد العزيز (مدير التنفيذ)',
    totalLimit: 80000.0,
    usedAmount: 29000.0,
    availableLimit: 51000.0,
    statementClosingDay: 10,
    paymentDueDay: 2,
    status: 'active',
  },
  {
    id: 'CC-06',
    cardNameAr: 'كارت ADIB المغطى لمرابحة التشطيبات',
    cardNameEn: 'ADIB Covered Murabaha Finishing Card',
    bankName: 'مصرف أبوظبي الإسلامي ADIB',
    cardNumberMasked: '**** **** **** 7712',
    cardholderAr: 'م. هاني الجمل (قطاع التجمع والعاصمة)',
    totalLimit: 75000.0,
    usedAmount: 36500.0,
    availableLimit: 38500.0,
    statementClosingDay: 15,
    paymentDueDay: 5,
    status: 'active',
  },
  {
    id: 'CC-07',
    cardNameAr: 'كارت بنك الإسكندرية جولد للمعدات والعدد',
    cardNameEn: 'AlexBank Gold Equipment & Tools Card',
    bankName: 'بنك الإسكندرية AlexBank',
    cardNumberMasked: '**** **** **** 6108',
    cardholderAr: 'م. رامي فؤاد (المخازن والمعدات)',
    totalLimit: 50000.0,
    usedAmount: 25500.0,
    availableLimit: 24500.0,
    statementClosingDay: 20,
    paymentDueDay: 10,
    status: 'near_limit',
  },
];

// Initial Credit Card Installment Plans (`أقساط الكروت`)
const INITIAL_INSTALLMENT_PLANS: CardInstallmentPlan[] = [
  {
    id: 'INST-101',
    cardId: 'CC-03',
    cardNameAr: 'كارت QNB الأهلي إنفينيت إداري (#5521)',
    merchantAr: 'بي تك للتجارة والتوزيع (B.TECH Corporate)',
    materialDescriptionAr: 'تكييفات كاريير كونسيلد 5 حصان + وحدات داخلية لمشروع C096 Azad',
    projectCode: 'C096 Azad',
    totalPurchaseAmount: 72000.0,
    totalMonths: 12,
    paidMonths: 5,
    monthlyInstallment: 6000.0,
    interestRatePercent: 0,
    nextDueDate: '2026-10-22',
    status: 'active',
  },
  {
    id: 'INST-102',
    cardId: 'CC-01',
    cardNameAr: 'كارت مشتريات الشركات تيتانيوم - CIB (#4892)',
    merchantAr: 'مؤسسة السلاب للسيراميك والبورسلين (El-Sallab)',
    materialDescriptionAr: 'خلاطات دفن جروهي ألماني + شاسيهات معلقة لمشروع C063 Madinaty',
    projectCode: 'C063 Madinaty',
    totalPurchaseAmount: 48000.0,
    totalMonths: 6,
    paidMonths: 3,
    monthlyInstallment: 8000.0,
    interestRatePercent: 0,
    nextDueDate: '2026-10-18',
    status: 'active',
  },
  {
    id: 'INST-103',
    cardId: 'CC-02',
    cardNameAr: 'كارت بلاتينيوم توريدات وتشطيبات - NBE (#8310)',
    merchantAr: 'محجوب للسيراميك والبورسلين (Mahgoub)',
    materialDescriptionAr: 'بورسلين أسباني قطع ليزر 120×60 للريسبشن - مشروع C091 Mountain View',
    projectCode: 'C091 Mountain View',
    totalPurchaseAmount: 54000.0,
    totalMonths: 6,
    paidMonths: 2,
    monthlyInstallment: 9000.0,
    interestRatePercent: 0,
    nextDueDate: '2026-10-20',
    status: 'active',
  },
  {
    id: 'INST-104',
    cardId: 'CC-04',
    cardNameAr: 'كارت بنك مصر وورلد لتمويل الخامات (#9044)',
    merchantAr: 'السويدي للكابلات وشنايدر إلكتريك',
    materialDescriptionAr: 'لوحات توزيع شنايدر 24 خط + لفات سلك السويدي معتمد - مشروع N007 Creek Town',
    projectCode: 'N007 Creek Town',
    totalPurchaseAmount: 42000.0,
    totalMonths: 6,
    paidMonths: 2,
    monthlyInstallment: 7000.0,
    interestRatePercent: 0,
    nextDueDate: '2026-10-25',
    status: 'active',
  },
  {
    id: 'INST-105',
    cardId: 'CC-06',
    cardNameAr: 'كارت ADIB المغطى لمرابحة التشطيبات (#7712)',
    merchantAr: 'مركز تلوين يوتن المعتمد (Jotun Multicolor)',
    materialDescriptionAr: 'بستلات معجون سافيتو + دهانات يوتن فينوماستيك لمشروع C088 Hyde Park',
    projectCode: 'C088 Hyde Park',
    totalPurchaseAmount: 36000.0,
    totalMonths: 6,
    paidMonths: 1,
    monthlyInstallment: 6000.0,
    interestRatePercent: 0,
    nextDueDate: '2026-11-05',
    status: 'active',
  },
  {
    id: 'INST-106',
    cardId: 'CC-07',
    cardNameAr: 'كارت بنك الإسكندرية جولد للمعدات والعدد (#6108)',
    merchantAr: 'توكيل هيلتي وبوش للعدد الهندسية (Hilti & Bosch Egypt)',
    materialDescriptionAr: 'ميزان ليزر 360 درجة + هيلتي تكسير ومثقاب للمواقع (C079 Mivida & C005 Rehab)',
    projectCode: 'C079 Mivida',
    totalPurchaseAmount: 30000.0,
    totalMonths: 6,
    paidMonths: 1,
    monthlyInstallment: 5000.0,
    interestRatePercent: 0,
    nextDueDate: '2026-11-10',
    status: 'active',
  },
];

// Initial Treasury Journal Entries
const INITIAL_JOURNAL_ENTRIES: TreasuryJournalEntry[] = [
  {
    id: 'TRX-9081',
    date: '2026-10-15 15:40',
    referenceNo: 'NEX-DEP-2026-441',
    txType: 'deposit',
    accountId: 'ACC-02',
    accountNameAr: 'بنك CIB - حساب شركات جاري',
    projectCode: 'C096 Azad',
    counterpartyAr: 'د. طارق عز الدين (عميل فيلا Azad)',
    categoryAr: 'دفعة تعاقد ومستخلص تشطيبات (الدفعة الثالثة)',
    amount: 185000.0,
    notesAr: 'تحويل بنكي مباشر على حساب CIB - مطابق لمستخلص رقم 3',
  },
  {
    id: 'TRX-9080',
    date: '2026-10-15 14:15',
    referenceNo: 'NEX-PAY-2026-892',
    txType: 'payment',
    accountId: 'ACC-03',
    accountNameAr: 'البنك الأهلي المصري NBE - حساب أفراد [Debit حساب افراد NBE]',
    projectCode: 'C063 Madinaty',
    counterpartyAr: 'مقاول الجبس بورد - الأسطى سعيد المنياوي',
    categoryAr: 'مستخلصات مقاولي باطن (جبس بورد وأسقف معلقة)',
    amount: 24500.0,
    notesAr: 'صرف الدفعة الثانية بعد استلام المهندس الاستشاري للأسقف',
  },
  {
    id: 'TRX-9079',
    date: '2026-10-15 12:30',
    referenceNo: 'NEX-TRF-2026-119',
    txType: 'transfer',
    accountId: 'ACC-02',
    accountNameAr: 'بنك CIB - حساب شركات جاري',
    targetAccountId: 'ACC-06',
    targetAccountNameAr: 'عهدة مهندسي المواقع واللوجستيات',
    projectCode: 'C091 Mountain View',
    counterpartyAr: 'م. شريف عبد العزيز (تغذية عهدة مواقع التجمع)',
    categoryAr: 'تحويل داخلي لتغذية عهدة المواقع والتشوينات',
    amount: 35000.0,
    notesAr: 'تغذية عهدة الأسبوع الثالث لأعمال تشوين الرمل والأسمنت ومصنعيات المحارة',
  },
  {
    id: 'TRX-9078',
    date: '2026-10-14 17:05',
    referenceNo: 'NEX-PAY-2026-891',
    txType: 'payment',
    accountId: 'ACC-01',
    accountNameAr: 'خزينة المكتب الرئيسية بالنزهة',
    projectCode: 'C005 Rehab',
    counterpartyAr: 'شركة كناوف مصر (Knauf Gypsum)',
    categoryAr: 'مشتريات خامات تشطيبات (ألواح جبس بورد أخضر وأبيض)',
    amount: 19820.5,
    notesAr: 'سداد نقدي لفاتورة توريد ألواح وصاج لموقع الرحاب C005',
  },
  {
    id: 'TRX-9077',
    date: '2026-10-14 13:20',
    referenceNo: 'NEX-DEP-2026-440',
    txType: 'deposit',
    accountId: 'ACC-04',
    accountNameAr: 'بنك QNB الأهلي - حساب جاري',
    projectCode: 'N007 Creek Town',
    counterpartyAr: 'م. عمر عبد اللطيف (عميل N007 Creek Town)',
    categoryAr: 'دفعة تمويل بنود تأسيس الكهرباء والسباكة',
    amount: 110000.0,
    notesAr: 'إيداع شيك مقبول الدفع بحساب QNB الأهلي',
  },
];

// Full 46 Active Projects Portfolio from Actpert Nexus Live ERP
const FLAGSHIP_PROJECTS_SEED: Omit<
  ProjectCashflowRow,
  'id' | 'netCashPosition' | 'actualProfitMarginPct'
>[] = [
  {
    projectCode: 'C096 Azad',
    projectNameAr: 'تشطيب دوبلكس C096 كمبوند أزاد التجمع الخامس',
    compoundName: 'Azad New Cairo',
    clientNameAr: 'د. طارق عز الدين',
    zone: 'التجمع الخامس',
    contractValue: 2450000,
    clientCollections: 1920000,
    actualExpenses: 1585000,
    supervisionFeePct: 15,
    status: 'finishing',
  },
  {
    projectCode: 'C063 Madinaty',
    projectNameAr: 'تشطيب فيلا مستقلة C063 مدينتي B3',
    compoundName: 'Madinaty Golf',
    clientNameAr: 'المستشار هاني عبد السلام',
    zone: 'مدينتي',
    contractValue: 3850000,
    clientCollections: 3150000,
    actualExpenses: 2640000,
    supervisionFeePct: 16,
    status: 'finishing',
  },
  {
    projectCode: 'C091 Mountain View',
    projectNameAr: 'تشطيب آي فيلا C091 ماونتن فيو آي سيتي',
    compoundName: 'Mountain View iCity',
    clientNameAr: 'م. وائل الدسوقي',
    zone: 'التجمع الخامس',
    contractValue: 2180000,
    clientCollections: 1640000,
    actualExpenses: 1390000,
    supervisionFeePct: 15,
    status: 'active',
  },
  {
    projectCode: 'C005 Rehab',
    projectNameAr: 'تعديل وتشطيب شقة فندقية C005 مدينة الرحاب المرحلة 9',
    compoundName: 'Al Rehab City',
    clientNameAr: 'أ. خالد الشربيني',
    zone: 'مدينة الرحاب',
    contractValue: 1490000,
    clientCollections: 1420000,
    actualExpenses: 1185000,
    supervisionFeePct: 14,
    status: 'handover',
  },
  {
    projectCode: 'N007 Creek Town',
    projectNameAr: 'تشطيب تاون هاوس N007 كريك تاون التجمع الأول',
    compoundName: 'Creek Town',
    clientNameAr: 'م. عمر عبد اللطيف',
    zone: 'التجمع الأول',
    contractValue: 2950000,
    clientCollections: 2100000,
    actualExpenses: 1810000,
    supervisionFeePct: 15,
    status: 'active',
  },
  {
    projectCode: 'C055 Fifth Settlement',
    projectNameAr: 'تشطيب فيلا C055 النرجس فيلات - التجمع الخامس',
    compoundName: 'Al Narges Villas',
    clientNameAr: 'د. مروان أبو الغيط',
    zone: 'التجمع الخامس',
    contractValue: 3200000,
    clientCollections: 2560000,
    actualExpenses: 2190000,
    supervisionFeePct: 15,
    status: 'finishing',
  },
  {
    projectCode: 'C088 Hyde Park',
    projectNameAr: 'تشطيب توين هاوس C088 هايد بارك التجمع الخامس',
    compoundName: 'Hyde Park New Cairo',
    clientNameAr: 'أ. شريف الدمرداش',
    zone: 'التجمع الخامس',
    contractValue: 3420000,
    clientCollections: 2480000,
    actualExpenses: 2115000,
    supervisionFeePct: 16,
    status: 'active',
  },
  {
    projectCode: 'C079 Mivida',
    projectNameAr: 'تشطيب شقة جاردن C079 كمبوند ميفيدا إعمار',
    compoundName: 'Mivida Emaar',
    clientNameAr: 'م. سارة المنياوي',
    zone: 'التجمع الخامس',
    contractValue: 2640000,
    clientCollections: 2190000,
    actualExpenses: 1820000,
    supervisionFeePct: 16,
    status: 'finishing',
  },
  {
    projectCode: 'N018 Palm Hills',
    projectNameAr: 'تشطيب فيلا N018 بالم هيلز نيو كايرو',
    compoundName: 'Palm Hills New Cairo',
    clientNameAr: 'أ. حاتم الكفراوي',
    zone: 'التجمع الخامس',
    contractValue: 4100000,
    clientCollections: 2950000,
    actualExpenses: 2590000,
    supervisionFeePct: 15,
    status: 'active',
  },
  {
    projectCode: 'C035 La Vista',
    projectNameAr: 'تشطيب شاليه ديلوكس C035 لافيستا سيتي العاصمة',
    compoundName: 'La Vista City',
    clientNameAr: 'د. نهى الجبالي',
    zone: 'العاصمة الإدارية',
    contractValue: 2750000,
    clientCollections: 2300000,
    actualExpenses: 1965000,
    supervisionFeePct: 15,
    status: 'finishing',
  },
  {
    projectCode: 'C092 Sodic East',
    projectNameAr: 'تشطيب تاون هاوس C092 سوديك إيست الشروق',
    compoundName: 'Sodic East',
    clientNameAr: 'م. تامر صدقي',
    zone: 'الشروق / هليوبوليس الجديدة',
    contractValue: 2880000,
    clientCollections: 1980000,
    actualExpenses: 1710000,
    supervisionFeePct: 15,
    status: 'active',
  },
  {
    projectCode: 'C097 Zed East',
    projectNameAr: 'تشطيب بنتهاوس C097 زد إيست أورا التجمع',
    compoundName: 'Zed East Ora',
    clientNameAr: 'أ. كريم الفقي',
    zone: 'التجمع الخامس',
    contractValue: 3150000,
    clientCollections: 2240000,
    actualExpenses: 1895000,
    supervisionFeePct: 16,
    status: 'active',
  },
];

// Generate all 46 Active Nexus Projects deterministically
const ALL_46_PROJECTS: ProjectCashflowRow[] = (() => {
  const rows: ProjectCashflowRow[] = [];

  FLAGSHIP_PROJECTS_SEED.forEach((p, idx) => {
    const netCashPosition = p.clientCollections - p.actualExpenses;
    const actualProfitMarginPct = Number(
      (((p.clientCollections - p.actualExpenses) / p.clientCollections) * 100).toFixed(1)
    );
    rows.push({
      ...p,
      id: `PRJ-${String(idx + 1).padStart(2, '0')}`,
      netCashPosition,
      actualProfitMarginPct,
    });
  });

  const additionalCatalog: Array<{
    code: string;
    compound: string;
    zone: string;
    client: string;
    contract: number;
    collections: number;
    expenses: number;
    supFee: number;
    status: 'active' | 'handover' | 'finishing';
  }> = [
    { code: 'C012 Villette', compound: 'Sodic Villette', zone: 'التجمع الخامس', client: 'د. أيمن شلبي', contract: 2650000, collections: 2350000, expenses: 1990000, supFee: 15, status: 'handover' },
    { code: 'C019 Eastown', compound: 'Sodic Eastown', zone: 'التجمع الخامس', client: 'م. ياسر علام', contract: 1920000, collections: 1680000, expenses: 1410000, supFee: 14, status: 'finishing' },
    { code: 'C022 Lake View', compound: 'Lake View Residence', zone: 'التجمع الخامس', client: 'أ. عمرو النجار', contract: 2380000, collections: 1890000, expenses: 1620000, supFee: 15, status: 'active' },
    { code: 'C027 Galleria', compound: 'Galleria Moon Valley', zone: 'التجمع الخامس', client: 'د. رانيا محمود', contract: 1750000, collections: 1520000, expenses: 1295000, supFee: 14, status: 'finishing' },
    { code: 'C031 Taj City', compound: 'Taj City', zone: 'طريق السويس', client: 'م. حسام زكي', contract: 1640000, collections: 1310000, expenses: 1120000, supFee: 14, status: 'active' },
    { code: 'C038 Sarai', compound: 'Sarai New Cairo', zone: 'مدينتي / المستقبل', client: 'أ. محمد الغندور', contract: 2100000, collections: 1690000, expenses: 1445000, supFee: 15, status: 'active' },
    { code: 'C041 Bloomfields', compound: 'Tatweer Misr Bloomfields', zone: 'المستقبل سيتي', client: 'د. هشام البنا', contract: 2290000, collections: 1750000, expenses: 1490000, supFee: 15, status: 'active' },
    { code: 'C044 Il Bosco', compound: 'Il Bosco New Capital', zone: 'العاصمة الإدارية', client: 'م. سامح رشدي', contract: 2840000, collections: 2120000, expenses: 1840000, supFee: 15, status: 'active' },
    { code: 'C047 Celia', compound: 'Celia Talaat Moustafa', zone: 'العاصمة الإدارية', client: 'أ. نبيل عبد الوهاب', contract: 1980000, collections: 1590000, expenses: 1350000, supFee: 15, status: 'finishing' },
    { code: 'C051 Al Maqsad', compound: 'Al Maqsad New Capital', zone: 'العاصمة الإدارية', client: 'د. علاء الدين فوزي', contract: 3120000, collections: 2490000, expenses: 2140000, supFee: 16, status: 'finishing' },
    { code: 'C054 Badya', compound: 'Badya Palm Hills', zone: '6 أكتوبر', client: 'م. شادي نصار', contract: 2420000, collections: 1820000, expenses: 1560000, supFee: 15, status: 'active' },
    { code: 'C058 Allegria', compound: 'Sodic Allegria', zone: 'الشيخ زايد', client: 'أ. تيمور الخولي', contract: 4350000, collections: 3620000, expenses: 3080000, supFee: 16, status: 'finishing' },
    { code: 'C061 Beverly Hills', compound: 'Beverly Hills Zayed', zone: 'الشيخ زايد', client: 'د. ماجد سرور', contract: 2150000, collections: 1940000, expenses: 1650000, supFee: 15, status: 'handover' },
    { code: 'C065 Zed West', compound: 'Zed Towers Sheikh Zayed', zone: 'الشيخ زايد', client: 'م. سيف الدين عادل', contract: 2790000, collections: 2180000, expenses: 1860000, supFee: 16, status: 'active' },
    { code: 'C068 Cairo Gate', compound: 'Emaar Cairo Gate', zone: 'الشيخ زايد', client: 'أ. فريدة الشافعي', contract: 3340000, collections: 2610000, expenses: 2230000, supFee: 16, status: 'active' },
    { code: 'C071 Belle Vie', compound: 'Emaar Belle Vie', zone: 'الشيخ زايد الجديدة', client: 'د. باهر السعيد', contract: 2960000, collections: 2210000, expenses: 1910000, supFee: 15, status: 'active' },
    { code: 'C074 Mountain View Chillout', compound: 'MV Chillout Park', zone: '6 أكتوبر', client: 'م. معتز سليمان', contract: 2520000, collections: 1990000, expenses: 1715000, supFee: 15, status: 'finishing' },
    { code: 'C077 O West', compound: 'Orascom O West', zone: '6 أكتوبر', client: 'أ. يحيى الدرملي', contract: 3080000, collections: 2340000, expenses: 1995000, supFee: 15, status: 'active' },
    { code: 'C081 Sun Capital', compound: 'Sun Capital October', zone: '6 أكتوبر', client: 'د. شيرين عبد المنعم', contract: 1680000, collections: 1360000, expenses: 1170000, supFee: 14, status: 'active' },
    { code: 'C083 Korba Heights', compound: 'Korba New Heliopolis', zone: 'هليوبوليس الجديدة', client: 'م. هيثم راضي', contract: 1540000, collections: 1410000, expenses: 1190000, supFee: 14, status: 'handover' },
    { code: 'C085 Sheraton Residence', compound: 'Sheraton Heliopolis', zone: 'مصر الجديدة', client: 'أ. جمال العشري', contract: 1870000, collections: 1620000, expenses: 1380000, supFee: 14, status: 'finishing' },
    { code: 'C087 Merghany Loft', compound: 'El Merghany Heliopolis', zone: 'مصر الجديدة', client: 'د. نادر فهمي', contract: 2210000, collections: 1840000, expenses: 1560000, supFee: 15, status: 'finishing' },
    { code: 'C090 Fifth Square', compound: 'Al Marasem Fifth Square', zone: 'التجمع الخامس', client: 'م. زياد التهامي', contract: 2690000, collections: 2080000, expenses: 1775000, supFee: 15, status: 'active' },
    { code: 'C093 Stone Residence', compound: 'Stone Residence Ring Rd', zone: 'القطامية / التجمع', client: 'أ. طارق الجندي', contract: 1790000, collections: 1460000, expenses: 1240000, supFee: 14, status: 'active' },
    { code: 'C095 Uptown Cairo', compound: 'Emaar Uptown Cairo', zone: 'المقطم', client: 'د. حازم اللوزي', contract: 3920000, collections: 3180000, expenses: 2695000, supFee: 16, status: 'finishing' },
    { code: 'C098 Waterway', compound: 'The Waterway New Cairo', zone: 'التجمع الخامس', client: 'م. أدهم شعراوي', contract: 3650000, collections: 2890000, expenses: 2450000, supFee: 16, status: 'active' },
    { code: 'C101 District 5', compound: 'Marakez District 5', zone: 'القطامية الجديدة', client: 'أ. نهال العلايلي', contract: 2580000, collections: 1960000, expenses: 1670000, supFee: 15, status: 'active' },
    { code: 'C103 Lavista Patio Oro', compound: 'El Patio Oro', zone: 'التجمع الخامس', client: 'د. وسيم غالي', contract: 2810000, collections: 2150000, expenses: 1845000, supFee: 15, status: 'active' },
    { code: 'N002 Swan Lake', compound: 'Hassan Allam Swan Lake', zone: 'التجمع الأول', client: 'م. باسل منصور', contract: 4480000, collections: 3540000, expenses: 3010000, supFee: 16, status: 'finishing' },
    { code: 'N004 Mirage City', compound: 'Mirage City Villas', zone: 'التجمع الأول', client: 'أ. عاصم أبو الفتوح', contract: 3740000, collections: 2910000, expenses: 2495000, supFee: 16, status: 'active' },
    { code: 'N009Seasons', compound: 'Seasons Residence', zone: 'التجمع الخامس', client: 'د. لبنى زهران', contract: 2120000, collections: 1710000, expenses: 1465000, supFee: 15, status: 'active' },
    { code: 'N012 Jayd', compound: 'Jayd New Cairo', zone: 'الرحاب / التجمع', client: 'م. فادي غبريال', contract: 1620000, collections: 1380000, expenses: 1175000, supFee: 14, status: 'finishing' },
    { code: 'N015 Midtown Condo', compound: 'Midtown New Capital', zone: 'العاصمة الإدارية', client: 'أ. محمود السرجاني', contract: 1890000, collections: 1440000, expenses: 1235000, supFee: 14, status: 'active' },
    { code: 'N021 HapTown', compound: 'Hassan Allam HapTown', zone: 'المستقبل سيتي', client: 'د. شريف حجازي', contract: 2340000, collections: 1790000, expenses: 1525000, supFee: 15, status: 'active' },
  ];

  additionalCatalog.forEach((item, idx) => {
    const netCash = item.collections - item.expenses;
    const profitPct = Number((((item.collections - item.expenses) / item.collections) * 100).toFixed(1));
    rows.push({
      id: `PRJ-${String(FLAGSHIP_PROJECTS_SEED.length + idx + 1).padStart(2, '0')}`,
      projectCode: item.code,
      projectNameAr: `مشروع تشطيب متكامل ${item.code} - ${item.compound}`,
      compoundName: item.compound,
      clientNameAr: item.client,
      zone: item.zone,
      contractValue: item.contract,
      clientCollections: item.collections,
      actualExpenses: item.expenses,
      netCashPosition: netCash,
      actualProfitMarginPct: profitPct,
      supervisionFeePct: item.supFee,
      status: item.status,
    });
  });

  return rows;
})();

// E-Works Legacy ERP Migration Audit Records (`/eworks` & `/eworks/review`)
const INITIAL_EWORKS_AUDIT_RECORDS: EWorksMigrationRecord[] = [
  {
    id: 'EW-001',
    legacyEworksCode: 'EW-EXT-2025-884',
    nexusTargetRef: 'NEX-EXT-C096-03',
    moduleType: 'extracts',
    moduleLabelAr: 'مستخلصات المشاريع المرحّلة (Legacy Extracts)',
    projectCode: 'C096 Azad',
    entityNameAr: 'مستخلص رقم (3) أعمال المحارة والجبس بورد - د. طارق عز الدين',
    eworksLegacyBalance: 485200.0,
    nexusMigratedBalance: 485200.0,
    varianceAmount: 0,
    auditStatus: 'verified',
    auditorNoteAr: 'مطابق 100% بعد ترحيل بنود التشوينات ونسبة الإشراف 15%',
    migratedAt: '2026-10-12 11:20',
  },
  {
    id: 'EW-002',
    legacyEworksCode: 'EW-CLI-2025-109',
    nexusTargetRef: 'NEX-CLI-C063-OPEN',
    moduleType: 'client_balances',
    moduleLabelAr: 'أرصدة العملاء الافتتاحية (Client Opening Balances)',
    projectCode: 'C063 Madinaty',
    entityNameAr: 'حساب العميل: المستشار هاني عبد السلام (فيلا مدينتي B3)',
    eworksLegacyBalance: 3150000.0,
    nexusMigratedBalance: 3150000.0,
    varianceAmount: 0,
    auditStatus: 'verified',
    auditorNoteAr: 'تم مطابقة إجمالي الدفعات الـ 6 المسددة بشيكات وتحويلات CIB',
    migratedAt: '2026-10-12 14:05',
  },
  {
    id: 'EW-003',
    legacyEworksCode: 'EW-PO-2025-512',
    nexusTargetRef: 'NEX-PO-C091-019',
    moduleType: 'purchase_orders',
    moduleLabelAr: 'أوامر الشراء والتوريدات (Purchasing Orders)',
    projectCode: 'C091 Mountain View',
    entityNameAr: 'أمر توريد بورسلين وخلاطات دفن - محجوب للسيراميك',
    eworksLegacyBalance: 142850.0,
    nexusMigratedBalance: 139400.0,
    varianceAmount: -3450.0,
    auditStatus: 'flagged',
    auditorNoteAr: 'يوجد إشعار خصم مرتجع 3 كراتين بورسلين لم يُرحّل من E-Works - يحتاج اعتماد التسوية',
    migratedAt: '2026-10-13 09:45',
  },
  {
    id: 'EW-004',
    legacyEworksCode: 'EW-SUB-2025-339',
    nexusTargetRef: 'NEX-SUB-N007-08',
    moduleType: 'subcontractor_statements',
    moduleLabelAr: 'كشوف حساب مقاولي الباطن (Subcontractor Statements)',
    projectCode: 'N007 Creek Town',
    entityNameAr: 'مقاول تأسيس الكهرباء - م. سيد عبدربه (تأمين ضمان أعمال 5%)',
    eworksLegacyBalance: 96500.0,
    nexusMigratedBalance: 96500.0,
    varianceAmount: 0,
    auditStatus: 'verified',
    auditorNoteAr: 'تم ترحيل صافي المستحق وحجز تأمين الأعمال 5% في حساب الضمانات',
    migratedAt: '2026-10-13 16:10',
  },
  {
    id: 'EW-005',
    legacyEworksCode: 'EW-SUB-2025-401',
    nexusTargetRef: 'NEX-SUB-C005-14',
    moduleType: 'subcontractor_statements',
    moduleLabelAr: 'كشوف حساب مقاولي الباطن (Subcontractor Statements)',
    projectCode: 'C005 Rehab',
    entityNameAr: 'مقاول الرخام والجرانيت - ورشة الحاج محمود الديب (شق الثعبان)',
    eworksLegacyBalance: 118000.0,
    nexusMigratedBalance: 112500.0,
    varianceAmount: -5500.0,
    auditStatus: 'flagged',
    auditorNoteAr: 'خصم 5,500 ج.م مصنعيات جلي وتلميع نُفذت على حساب الشركة في E-Works بانتظار المراجعة',
    migratedAt: '2026-10-14 10:30',
  },
  {
    id: 'EW-006',
    legacyEworksCode: 'EW-CLI-2025-142',
    nexusTargetRef: 'NEX-CLI-C088-OPEN',
    moduleType: 'client_balances',
    moduleLabelAr: 'أرصدة العملاء الافتتاحية (Client Opening Balances)',
    projectCode: 'C088 Hyde Park',
    entityNameAr: 'حساب العميل: أ. شريف الدمرداش (توين هاوس هايد بارك)',
    eworksLegacyBalance: 2480000.0,
    nexusMigratedBalance: 2480000.0,
    varianceAmount: 0,
    auditStatus: 'verified',
    auditorNoteAr: 'مطابق لكشف حساب العميل المعتمد حتى 2026-10-01',
    migratedAt: '2026-10-14 13:15',
  },
  {
    id: 'EW-007',
    legacyEworksCode: 'EW-PO-2025-604',
    nexusTargetRef: 'NEX-PO-C079-027',
    moduleType: 'purchase_orders',
    moduleLabelAr: 'أوامر الشراء والتوريدات (Purchasing Orders)',
    projectCode: 'C079 Mivida',
    entityNameAr: 'توريد قطاعات ألوميتال PS الجامبو والزجاج الدبل - مصنع كايرو ميتال',
    eworksLegacyBalance: 215000.0,
    nexusMigratedBalance: 215000.0,
    varianceAmount: 0,
    auditStatus: 'verified',
    auditorNoteAr: 'تم ربط الدفعة المقدمة ودفعة التوريد بمركز تكلفة C079 Mivida',
    migratedAt: '2026-10-14 15:40',
  },
  {
    id: 'EW-008',
    legacyEworksCode: 'EW-EXT-2025-912',
    nexusTargetRef: 'NEX-EXT-C097-02',
    moduleType: 'extracts',
    moduleLabelAr: 'مستخلصات المشاريع المرحّلة (Legacy Extracts)',
    projectCode: 'C097 Zed East',
    entityNameAr: 'مستخلص رقم (2) تأسيس التكييف الكونسيلد والعزل - أ. كريم الفقي',
    eworksLegacyBalance: 374900.0,
    nexusMigratedBalance: 368900.0,
    varianceAmount: -6000.0,
    auditStatus: 'flagged',
    auditorNoteAr: 'قسط كارت QNB لشراء وحدات كاريير (6,000 ج.م) مسجل مرتين في مسودة E-Works - يحتاج تأكيد',
    migratedAt: '2026-10-15 09:20',
  },
];

// ============================================================================
// HELPER FORMATTERS
// ============================================================================

const formatEGP = (value: number): string => {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TreasuryCashBankHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('vaults_banks');

  // State for Cash/Vault & Bank Accounts
  const [accounts, setAccounts] = useState<CashBankAccount[]>(INITIAL_CASH_BANK_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<TreasuryJournalEntry[]>(INITIAL_JOURNAL_ENTRIES);

  // State for Credit Cards & Installments
  const [creditCards, setCreditCards] = useState<CorporateCreditCard[]>(INITIAL_CREDIT_CARDS);
  const [installmentPlans, setInstallmentPlans] = useState<CardInstallmentPlan[]>(INITIAL_INSTALLMENT_PLANS);

  // State for Record Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txType, setTxType] = useState<'deposit' | 'payment' | 'transfer'>('deposit');
  const [txAccountId, setTxAccountId] = useState<string>('ACC-01');
  const [txTargetAccountId, setTxTargetAccountId] = useState<string>('ACC-02');
  const [txProjectCode, setTxProjectCode] = useState<string>('C096 Azad');
  const [txCounterparty, setTxCounterparty] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('دفعة تعاقد ومستخلص تشطيبات');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txNotes, setTxNotes] = useState<string>('');

  // State for Projects Matrix filtering
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [projectZoneFilter, setProjectZoneFilter] = useState<string>('ALL');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');

  // State for E-Works Migration Audit filtering
  const [eworksFilter, setEworksFilter] = useState<'ALL' | 'verified' | 'flagged'>('ALL');
  const [eworksModuleFilter, setEworksModuleFilter] = useState<string>('ALL');
  const [eworksSearch, setEworksSearch] = useState<string>('');
  const [eworksRecords, setEworksRecords] = useState<EWorksMigrationRecord[]>(INITIAL_EWORKS_AUDIT_RECORDS);

  // Toast feedback banner
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionBanner(msg);
    setTimeout(() => {
      setActionBanner((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Computed Live Executive Liquidity Metrics
  const totalCashAndBankBalance = useMemo(() => {
    const sum = accounts.reduce((acc, item) => acc + item.currentBalance, 0);
    return Number(sum.toFixed(2));
  }, [accounts]);

  const totalUnusedCreditCardLimit = useMemo(() => {
    const sum = creditCards.reduce((acc, card) => acc + card.availableLimit, 0);
    return Number(sum.toFixed(2));
  }, [creditCards]);

  const totalSpendableLiquidity = useMemo(() => {
    return Number((totalCashAndBankBalance + totalUnusedCreditCardLimit).toFixed(2));
  }, [totalCashAndBankBalance, totalUnusedCreditCardLimit]);

  const totalCardCreditLimit = useMemo(() => {
    return Number(creditCards.reduce((acc, c) => acc + c.totalLimit, 0).toFixed(2));
  }, [creditCards]);

  const totalCardUsedAmount = useMemo(() => {
    return Number(creditCards.reduce((acc, c) => acc + c.usedAmount, 0).toFixed(2));
  }, [creditCards]);

  // Reset to Exact Live Nexus Snapshot (`738,284.19 EGP`)
  const handleResetToLiveNexusSnapshot = () => {
    setAccounts(INITIAL_CASH_BANK_ACCOUNTS);
    setCreditCards(INITIAL_CREDIT_CARDS);
    setInstallmentPlans(INITIAL_INSTALLMENT_PLANS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setEworksRecords(INITIAL_EWORKS_AUDIT_RECORDS);
    showToast('تم استعادة الأرصدة اللحظية المعتمدة من نظام Actpert Nexus (738,284.19 EGP)');
  };

  // Record Deposit / Payment / Internal Transfer
  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(txAmount);
    if (!numericAmount || numericAmount <= 0) return;

    const sourceAccount = accounts.find((a) => a.id === txAccountId);
    if (!sourceAccount) return;

    const targetAccount = txType === 'transfer' ? accounts.find((a) => a.id === txTargetAccountId) : undefined;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (txType === 'deposit' && acc.id === txAccountId) {
          return {
            ...acc,
            totalInflows: Number((acc.totalInflows + numericAmount).toFixed(2)),
            currentBalance: Number((acc.currentBalance + numericAmount).toFixed(2)),
            lastUpdated: 'الآن (محدث لحظياً)',
          };
        }
        if (txType === 'payment' && acc.id === txAccountId) {
          return {
            ...acc,
            totalOutflows: Number((acc.totalOutflows + numericAmount).toFixed(2)),
            currentBalance: Number((acc.currentBalance - numericAmount).toFixed(2)),
            lastUpdated: 'الآن (محدث لحظياً)',
          };
        }
        if (txType === 'transfer') {
          if (acc.id === txAccountId) {
            return {
              ...acc,
              totalOutflows: Number((acc.totalOutflows + numericAmount).toFixed(2)),
              currentBalance: Number((acc.currentBalance - numericAmount).toFixed(2)),
              lastUpdated: 'الآن (تحويل صادر)',
            };
          }
          if (acc.id === txTargetAccountId) {
            return {
              ...acc,
              totalInflows: Number((acc.totalInflows + numericAmount).toFixed(2)),
              currentBalance: Number((acc.currentBalance + numericAmount).toFixed(2)),
              lastUpdated: 'الآن (تحويل وارد)',
            };
          }
        }
        return acc;
      })
    );

    const newEntry: TreasuryJournalEntry = {
      id: `TRX-${9082 + journalEntries.length}`,
      date: '2026-10-15 (الآن)',
      referenceNo: `NEX-${txType.toUpperCase().slice(0, 3)}-2026-${900 + journalEntries.length}`,
      txType,
      accountId: sourceAccount.id,
      accountNameAr: sourceAccount.nameAr,
      targetAccountId: targetAccount?.id,
      targetAccountNameAr: targetAccount?.nameAr,
      projectCode: txProjectCode,
      counterpartyAr: txCounterparty || (txType === 'transfer' ? targetAccount?.nameAr || 'تحويل داخلي' : 'حركة خزينة مباشرة'),
      categoryAr: txCategory,
      amount: numericAmount,
      notesAr: txNotes || 'تم التسجيل والترحيل الفوري بدفتر الخزينة والبنوك',
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    setIsTxModalOpen(false);
    setTxAmount('');
    setTxCounterparty('');
    setTxNotes('');
    showToast(`تم تسجيل الحركة المالية بنجاح بقيمة ${formatEGP(numericAmount)} في ${sourceAccount.nameAr}`);
  };

  // Pay Monthly Credit Card Installment (`سداد القسط الشهري للكارت`)
  const handlePayCardInstallment = (plan: CardInstallmentPlan) => {
    if (plan.status === 'completed' || plan.paidMonths >= plan.totalMonths) return;

    const newPaidMonths = plan.paidMonths + 1;
    const isNowCompleted = newPaidMonths >= plan.totalMonths;

    // 1. Update installment plan
    setInstallmentPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              paidMonths: newPaidMonths,
              status: isNowCompleted ? 'completed' : 'active',
            }
          : p
      )
    );

    // 2. Restore credit card available limit & reduce used amount
    setCreditCards((prev) =>
      prev.map((card) =>
        card.id === plan.cardId
          ? {
              ...card,
              usedAmount: Number(Math.max(0, card.usedAmount - plan.monthlyInstallment).toFixed(2)),
              availableLimit: Number(
                Math.min(card.totalLimit, card.availableLimit + plan.monthlyInstallment).toFixed(2)
              ),
            }
          : card
      )
    );

    // 3. Deduct from CIB Corporate Account (`ACC-02`) and record in journal
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === 'ACC-02'
          ? {
              ...acc,
              totalOutflows: Number((acc.totalOutflows + plan.monthlyInstallment).toFixed(2)),
              currentBalance: Number((acc.currentBalance - plan.monthlyInstallment).toFixed(2)),
              lastUpdated: 'الآن (سداد قسط كارت ائتمان)',
            }
          : acc
      )
    );

    const installmentJournal: TreasuryJournalEntry = {
      id: `TRX-${9082 + journalEntries.length}`,
      date: '2026-10-15 (الآن)',
      referenceNo: `NEX-CC-INST-${plan.id}-${newPaidMonths}`,
      txType: 'payment',
      accountId: 'ACC-02',
      accountNameAr: 'بنك CIB - حساب شركات جاري',
      projectCode: plan.projectCode,
      counterpartyAr: `${plan.cardNameAr} - ${plan.merchantAr}`,
      categoryAr: `سداد قسط كارت ائتمان (${newPaidMonths}/${plan.totalMonths})`,
      amount: plan.monthlyInstallment,
      notesAr: `سداد القسط الشهري وإعادة فتح الحد الائتماني المتاح بالكارت (${plan.materialDescriptionAr})`,
    };

    setJournalEntries((prev) => [installmentJournal, ...prev]);
    showToast(
      `تم سداد القسط الشهري (${formatEGP(plan.monthlyInstallment)}) لـ ${plan.cardNameAr} وإعادة تعلية الحد الائتماني المتاح`
    );
  };

  // Filtered 46 Projects
  const filteredProjects = useMemo(() => {
    return ALL_46_PROJECTS.filter((p) => {
      const matchesSearch =
        !projectSearch.trim() ||
        p.projectCode.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.projectNameAr.includes(projectSearch) ||
        p.compoundName.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientNameAr.includes(projectSearch);

      const matchesZone = projectZoneFilter === 'ALL' || p.zone === projectZoneFilter;
      const matchesStatus = projectStatusFilter === 'ALL' || p.status === projectStatusFilter;
      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [projectSearch, projectZoneFilter, projectStatusFilter]);

  const projectPortfolioTotals = useMemo(() => {
    return filteredProjects.reduce(
      (acc, p) => {
        acc.contractValue += p.contractValue;
        acc.clientCollections += p.clientCollections;
        acc.actualExpenses += p.actualExpenses;
        acc.netCashPosition += p.netCashPosition;
        return acc;
      },
      { contractValue: 0, clientCollections: 0, actualExpenses: 0, netCashPosition: 0 }
    );
  }, [filteredProjects]);

  // Filtered E-Works Audit Records
  const filteredEworksRecords = useMemo(() => {
    return eworksRecords.filter((rec) => {
      const matchesStatus = eworksFilter === 'ALL' || rec.auditStatus === eworksFilter;
      const matchesModule = eworksModuleFilter === 'ALL' || rec.moduleType === eworksModuleFilter;
      const matchesSearch =
        !eworksSearch.trim() ||
        rec.legacyEworksCode.toLowerCase().includes(eworksSearch.toLowerCase()) ||
        rec.nexusTargetRef.toLowerCase().includes(eworksSearch.toLowerCase()) ||
        rec.projectCode.toLowerCase().includes(eworksSearch.toLowerCase()) ||
        rec.entityNameAr.includes(eworksSearch);
      return matchesStatus && matchesModule && matchesSearch;
    });
  }, [eworksRecords, eworksFilter, eworksModuleFilter, eworksSearch]);

  const handleVerifyEworksRecord = (recordId: string) => {
    setEworksRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              eworksLegacyBalance: rec.nexusMigratedBalance,
              varianceAmount: 0,
              auditStatus: 'verified',
              auditorNoteAr: `${rec.auditorNoteAr} — [تمت المراجعة والمطابقة النهائية في Nexus ✅]`,
            }
          : rec
      )
    );
    showToast('تم اعتماد تسوية قيد E-Works وتأكيد المطابقة النهائية في Actpert Nexus ✅');
  };

  return (
    <div dir="rtl" className="space-y-6 text-[#192631]">
      {/* =====================================================================
          1. TOP EXECUTIVE LIQUIDITY BANNER (EXACT LIVE NEXUS NUMBERS)
         ===================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-[#123524]/25 bg-white/80 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[#192631]/10 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#123524]/10 px-3 py-1 text-xs font-bold text-[#123524] border border-[#123524]/25">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE ACTPERT NEXUS TREASURY &amp; LIQUIDITY ENGINE
              </span>
              <span className="rounded-full bg-[#192631]/[0.05] px-3 py-1 text-xs font-medium text-[#192631]/85 border border-[#192631]/10">
                /cashbox • /cashbox/credit-cards • /eworks/review
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#192631]">
              مركز قيادة السيولة التنفيذية، الخزن والبنوك، حدود وأقساط الكروت الـ 7، ومراجعة E-Works
            </h2>
            <p className="mt-1 text-sm text-[#192631]/70">
              مراقبة لحظية لإجمالي السيولة القابلة للصرف، أرصدة الـ 6 خزن وحسابات بنكية، حدود الـ 7 كروت ائتمانية، ومصفوفة ربحية الـ 46 مشروع نشط
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsTxModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition"
            >
              <Plus className="h-4 w-4" />
              تسجيل حركة خزينة أو تحويل بنكي
            </button>
            <button
              type="button"
              onClick={handleResetToLiveNexusSnapshot}
              title="استعادة لقطة الأرقام الحية من Nexus"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#192631]/10 bg-[#192631]/[0.05] hover:bg-[#192631]/[0.12] px-3.5 py-2.5 text-xs font-semibold text-[#192631]/85 transition"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#123524]" />
              مزامنة اللقطة الحية
            </button>
          </div>
        </div>

        {actionBanner && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#123524]/25 bg-[#123524]/10 px-4 py-2.5 text-sm font-medium text-[#123524]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#123524] shrink-0" />
              <span>{actionBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionBanner(null)}
              className="text-[#123524] hover:text-[#192631]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Primary Liquidity KPI Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Total Spendable Liquidity */}
          <div className="rounded-2xl border border-[#123524]/25 bg-[#f5f5f5]/90 p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#123524]">
                إجمالي السيولة المتاحة للصرف (Total Spendable Liquidity)
              </span>
              <div className="rounded-xl bg-[#123524]/10 p-2.5 text-[#123524]">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#192631] font-mono" dir="ltr">
                {formatEGP(totalSpendableLiquidity)}
              </p>
              <span className="rounded-lg bg-[#123524]/10 px-2 py-0.5 text-xs font-semibold text-[#123524]">
                نقدية + ائتمان متاح
              </span>
            </div>
            <p className="mt-2 text-xs text-[#192631]/70">
              حاصل جمع النقدية الفعلية بالخزن والبنوك ({formatEGP(totalCashAndBankBalance)}) + الرصيد غير المستخدم بالكروت ({formatEGP(totalUnusedCreditCardLimit)})
            </p>
          </div>

          {/* Card 2: Actual Cash & Bank Balances */}
          <div className="rounded-2xl border border-sky-500/35 bg-[#f5f5f5]/90 p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#192631]">
                النقدية الفعلية بالخزن والبنوك (Actual Cash &amp; Banks)
              </span>
              <div className="rounded-xl bg-sky-500/20 p-2.5 text-[#192631]">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#192631] font-mono" dir="ltr">
                {formatEGP(totalCashAndBankBalance)}
              </p>
              <span className="rounded-lg bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-[#192631]">
                6 حسابات نشطة
              </span>
            </div>
            <p className="mt-2 text-xs text-[#192631]/70">
              موزعة على خزينة النزهة، بنك CIB، البنك الأهلي NBE (أفراد Debit)، بنك QNB، فودافون كاش، وعهدة المواقع
            </p>
          </div>

          {/* Card 3: Unused Credit Card Limits */}
          <div className="rounded-2xl border border-amber-500/35 bg-[#f5f5f5]/90 p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b45309]">
                الحد الائتماني المتاح بالكروت (Unused Credit Card Limits)
              </span>
              <div className="rounded-xl bg-amber-500/20 p-2.5 text-[#b45309]">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#192631] font-mono" dir="ltr">
                {formatEGP(totalUnusedCreditCardLimit)}
              </p>
              <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-[#b45309]">
                7 كروت مشتريات
              </span>
            </div>
            <p className="mt-2 text-xs text-[#192631]/70">
              من إجمالي حدود ائتمانية {formatEGP(totalCardCreditLimit)} (المستخدم حالياً: {formatEGP(totalCardUsedAmount)})
            </p>
          </div>
        </div>

        {/* Portfolio Counters Strip: 46 Projects | 43 Clients | 63 Contractor Accounts */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-[#192631]/10 bg-white/80 backdrop-blur-md px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#e04b2a]/10 p-2 text-[#e04b2a]">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-[#192631]/70">محفظة المشاريع النشطة (Active Projects Portfolio)</div>
                <div className="text-sm font-bold text-[#192631]">C096 Azad, C063 Madinaty, C091 MV...</div>
              </div>
            </div>
            <span className="rounded-lg bg-[#e04b2a]/10 border border-[#e04b2a]/25 px-3 py-1 text-sm font-black text-[#e04b2a] font-mono">
              46 Projects
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#192631]/10 bg-white/80 backdrop-blur-md px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-500/20 p-2 text-teal-300">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-[#192631]/70">حسابات العملاء الفعالة (Client Accounts)</div>
                <div className="text-sm font-bold text-[#192631]">دفعات التعاقد والتمويل والمستخلصات</div>
              </div>
            </div>
            <span className="rounded-lg bg-teal-500/20 border border-teal-500/30 px-3 py-1 text-sm font-black text-teal-300 font-mono">
              43 Clients
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#192631]/10 bg-white/80 backdrop-blur-md px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-500/20 p-2 text-red-700">
                <HardHat className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-[#192631]/70">حسابات المقاولين والمصنعيات (Contractor Accounts)</div>
                <div className="text-sm font-bold text-[#192631]">مقاولي الباطن، اليوميات، وتأمين الأعمال</div>
              </div>
            </div>
            <span className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-sm font-black text-red-700 font-mono">
              63 Accounts
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SUB-NAVIGATION TABS (4 TABS)
         ===================================================================== */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('vaults_banks')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeSubTab === 'vaults_banks'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'text-[#192631]/85 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>أرصدة الخزن والبنوك والتحويلات (6 حسابات)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('credit_cards')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeSubTab === 'credit_cards'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
              : 'text-[#192631]/85 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>حدود كروت الائتمان الـ 7 وجدول الأقساط الشهرية (أقساط الكروت)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('projects_matrix')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeSubTab === 'projects_matrix'
              ? 'bg-[#e04b2a] text-[#192631] shadow-lg shadow-indigo-900/40'
              : 'text-[#192631]/85 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>ربحية وموقف السيولة للـ 46 مشروع</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('eworks_audit')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeSubTab === 'eworks_audit'
              ? 'bg-purple-600 text-[#192631] shadow-lg shadow-purple-900/40'
              : 'text-[#192631]/85 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>مراجعة ترحيل بيانات E-Works للنظام الجديد</span>
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB 1: CASH VAULTS & BANK ACCOUNTS (`أرصدة الخزن والبنوك والتحويلات`)
         ===================================================================== */}
      {activeSubTab === 'vaults_banks' && (
        <div className="space-y-6">
          {/* 6 Live Cash/Vault & Bank Account Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((acc) => {
              const IconComponent =
                acc.accountType === 'vault'
                  ? Banknote
                  : acc.accountType === 'digital_wallet'
                  ? Smartphone
                  : acc.accountType === 'site_custody'
                  ? HardHat
                  : Landmark;

              return (
                <div
                  key={acc.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 hover:border-sky-500/40 transition shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-sky-500/15 p-3 text-[#192631] border border-sky-500/30">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-[#192631]/70">{acc.accountNumber}</span>
                          <h3 className="text-base font-bold text-[#192631] leading-snug">{acc.nameAr}</h3>
                          <p className="text-xs text-[#192631]/70">{acc.bankName}</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-[#192631]/[0.05] px-2 py-0.5 text-xs font-mono font-bold text-[#123524] border border-[#192631]/10">
                        {acc.currency}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-[#f5f5f5]/90 p-3.5 border border-[#192631]/10">
                      <div className="text-xs text-[#192631]/70">الرصيد الفعلي المتاح حالياً</div>
                      <div className="mt-1 text-2xl font-black text-[#123524] font-mono" dir="ltr">
                        {formatEGP(acc.currentBalance)}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-[#192631]/[0.05] p-2">
                        <div className="text-[#192631]/70">رصيد افتتاحي</div>
                        <div className="mt-0.5 font-mono font-semibold text-[#192631]" dir="ltr">
                          {acc.openingBalance.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-950/40 border border-[#123524]/25 p-2">
                        <div className="text-[#123524] flex items-center justify-center gap-0.5">
                          <ArrowDownRight className="h-3 w-3" /> إجمالي الوارد
                        </div>
                        <div className="mt-0.5 font-mono font-semibold text-[#123524]" dir="ltr">
                          {acc.totalInflows.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="rounded-lg bg-rose-950/40 border border-rose-500/20 p-2">
                        <div className="text-red-700 flex items-center justify-center gap-0.5">
                          <ArrowUpRight className="h-3 w-3" /> إجمالي المنصرف
                        </div>
                        <div className="mt-0.5 font-mono font-semibold text-red-700" dir="ltr">
                          {acc.totalOutflows.toLocaleString('en-US')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#192631]/10 pt-3 text-xs text-[#192631]/70">
                    <span>المسؤول: {acc.custodianAr}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTxAccountId(acc.id);
                        setIsTxModalOpen(true);
                      }}
                      className="text-[#192631] hover:text-[#192631] font-semibold"
                    >
                      + حركة على الحساب
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Bar for the 6 Accounts */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-500/30 bg-sky-950/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#192631]" />
              <span className="text-sm font-bold text-[#192631]">
                إجمالي النقدية الفعلية المجمّعة بالخزن والبنوك الـ 6 (مطابق لشاشة /cashbox):
              </span>
            </div>
            <span className="text-xl font-black text-[#192631] font-mono" dir="ltr">
              {formatEGP(totalCashAndBankBalance)}
            </span>
          </div>

          {/* Live Treasury Transaction Journal */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#192631]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#123524]" />
                  دفتر يومية الخزينة والتحويلات البنكية الحية (Live Treasury Transaction Journal)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  سجل الإيداعات، المدفوعات للموردين والمقاولين، والتحويلات الداخلية بين الحسابات الـ 6
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTxModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition"
              >
                <Plus className="h-4 w-4" />
                إضافة قيد خزينة / تحويل
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 text-xs text-[#192631]/70 bg-[#f5f5f5]/90">
                    <th className="py-3 px-3">رقم المرجع والتاريخ</th>
                    <th className="py-3 px-3">نوع الحركة</th>
                    <th className="py-3 px-3">الحساب البنكي / الخزينة</th>
                    <th className="py-3 px-3">المشروع</th>
                    <th className="py-3 px-3">الجهة / المستفيد والبيان</th>
                    <th className="py-3 px-3 text-left">المبلغ (EGP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {journalEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#192631]/[0.05] transition">
                      <td className="py-3 px-3">
                        <div className="font-mono text-xs font-bold text-[#192631]">{entry.referenceNo}</div>
                        <div className="text-xs text-[#192631]/60">{entry.date}</div>
                      </td>
                      <td className="py-3 px-3">
                        {entry.txType === 'deposit' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#123524]/10 px-2.5 py-1 text-xs font-bold text-[#123524] border border-[#123524]/25">
                            <ArrowDownRight className="h-3.5 w-3.5" /> إيداع / تحصيل
                          </span>
                        )}
                        {entry.txType === 'payment' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-red-700 border border-rose-500/30">
                            <ArrowUpRight className="h-3.5 w-3.5" /> صرف / سداد
                          </span>
                        )}
                        {entry.txType === 'transfer' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-[#192631] border border-sky-500/30">
                            <ArrowLeftRight className="h-3.5 w-3.5" /> تحويل داخلي
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#192631]">{entry.accountNameAr}</div>
                        {entry.targetAccountNameAr && (
                          <div className="text-xs text-[#192631]">← إلى: {entry.targetAccountNameAr}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded-lg bg-[#e04b2a]/10 border border-[#e04b2a]/25 px-2.5 py-1 font-mono text-xs font-bold text-[#e04b2a]">
                          {entry.projectCode}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#192631]">{entry.counterpartyAr}</div>
                        <div className="text-xs text-[#192631]/70">{entry.categoryAr} — {entry.notesAr}</div>
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold" dir="ltr">
                        <span
                          className={
                            entry.txType === 'deposit'
                              ? 'text-[#123524]'
                              : entry.txType === 'payment'
                              ? 'text-red-700'
                              : 'text-[#192631]'
                          }
                        >
                          {entry.txType === 'deposit' ? '+' : entry.txType === 'payment' ? '-' : ''}
                          {formatEGP(entry.amount)}
                        </span>
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
          SUB-TAB 2: CORPORATE CREDIT CARDS & INSTALLMENTS (`حدود كروت الائتمان الـ 7 وجدول الأقساط الشهرية`)
         ===================================================================== */}
      {activeSubTab === 'credit_cards' && (
        <div className="space-y-6">
          {/* 7 Credit Cards Grid */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#192631]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#b45309]" />
                  محفظة كروت الائتمان والمشتريات الـ 7 (/cashbox/credit-cards)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  إجمالي الحدود الائتمانية: {formatEGP(totalCardCreditLimit)} | المسحوب: {formatEGP(totalCardUsedAmount)} |{' '}
                  <span className="text-[#b45309] font-bold">
                    الحد الائتماني المتاح حالياً: {formatEGP(totalUnusedCreditCardLimit)}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2 text-right">
                <div className="text-[11px] text-[#b45309]">الرصيد المتاح بالكروت الـ 7</div>
                <div className="text-lg font-black text-[#192631] font-mono" dir="ltr">
                  {formatEGP(totalUnusedCreditCardLimit)}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {creditCards.map((card, index) => {
                const utilizationPct = Math.min(
                  100,
                  Number(((card.usedAmount / card.totalLimit) * 100).toFixed(1))
                );
                return (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-xl p-5 hover:border-amber-500/40 transition shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-[#b45309] border border-amber-500/30">
                            كارت #{index + 1} • {card.bankName}
                          </span>
                          <h4 className="mt-1.5 text-base font-bold text-[#192631]">{card.cardNameAr}</h4>
                          <p className="text-xs font-mono text-[#192631]/70 mt-0.5" dir="ltr">
                            {card.cardNumberMasked}
                          </p>
                        </div>
                        <CreditCard className="h-6 w-6 text-[#b45309] shrink-0" />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white/80 backdrop-blur-md p-3 border border-[#192631]/10 text-xs">
                        <div>
                          <div className="text-[#192631]/70">الحد الكلي</div>
                          <div className="mt-0.5 font-mono font-bold text-[#192631]" dir="ltr">
                            {card.totalLimit.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="text-red-700">المستخدم</div>
                          <div className="mt-0.5 font-mono font-bold text-red-700" dir="ltr">
                            {card.usedAmount.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#123524] font-bold">المتاح للصرف</div>
                          <div className="mt-0.5 font-mono font-black text-[#123524]" dir="ltr">
                            {card.availableLimit.toLocaleString('en-US')}
                          </div>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#192631]/70">نسبة الاستخدام (Utilization)</span>
                          <span className="font-mono font-bold text-[#b45309]">{utilizationPct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#192631]/[0.05]">
                          <div
                            className={`h-full rounded-full ${
                              utilizationPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${utilizationPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#192631]/10 pt-3 flex items-center justify-between text-xs text-[#192631]/70">
                      <span>حامل الكارت: {card.cardholderAr}</span>
                      <span className="inline-flex items-center gap-1 text-[#192631]/85 font-mono">
                        <Calendar className="h-3 w-3 text-[#b45309]" />
                        تقفيل يوم {card.statementClosingDay} / سداد يوم {card.paymentDueDay}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credit Card Installments Tracker (`جدول أقساط المشتريات بالكروت`) */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#192631]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#123524]" />
                  جدول أقساط المشتريات بالكروت (Credit Card Installment Plans - أقساط الكروت)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  خطط التقسيط على 6 و12 شهراً بدون فوائد (0% لمشتريات الخامات، السيراميك، التكييفات، والعدد الهندسية) مع إمكانية سداد القسط الشهري وتعلية الحد المتاح فوراً
                </p>
              </div>
              <span className="rounded-xl bg-[#123524]/10 border border-[#123524]/25 px-3 py-1.5 text-xs font-bold text-[#123524]">
                إجمالي الأقساط الشهرية الجارية:{' '}
                {formatEGP(
                  installmentPlans
                    .filter((p) => p.status === 'active')
                    .reduce((acc, p) => acc + p.monthlyInstallment, 0)
                )}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-xs text-[#192631]/70">
                    <th className="py-3 px-3">الكارت والبنك</th>
                    <th className="py-3 px-3">المورد / التاجر وبنود الخامات</th>
                    <th className="py-3 px-3">المشروع</th>
                    <th className="py-3 px-3 text-left">إجمالي العملية</th>
                    <th className="py-3 px-3 text-left">القسط الشهري</th>
                    <th className="py-3 px-3">المدفوع / المتبقي</th>
                    <th className="py-3 px-3">الاستحقاق القادم</th>
                    <th className="py-3 px-3 text-center">إجراء السداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {installmentPlans.map((plan) => {
                    const remainingMonths = plan.totalMonths - plan.paidMonths;
                    return (
                      <tr key={plan.id} className="hover:bg-[#192631]/[0.05] transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#192631]">{plan.cardNameAr}</div>
                          <span className="inline-block mt-0.5 rounded bg-[#123524]/10 px-2 py-0.5 text-[11px] font-semibold text-[#123524]">
                            تقسيط {plan.totalMonths} شهور ({plan.interestRatePercent}% فوائد)
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-[#192631]">{plan.merchantAr}</div>
                          <div className="text-xs text-[#192631]/70">{plan.materialDescriptionAr}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="rounded-lg bg-[#e04b2a]/10 border border-[#e04b2a]/25 px-2.5 py-1 font-mono text-xs font-bold text-[#e04b2a]">
                            {plan.projectCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-left font-mono font-semibold text-[#192631]" dir="ltr">
                          {formatEGP(plan.totalPurchaseAmount)}
                        </td>
                        <td className="py-3.5 px-3 text-left font-mono font-bold text-[#b45309]" dir="ltr">
                          {formatEGP(plan.monthlyInstallment)}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#123524]">
                              {plan.paidMonths}/{plan.totalMonths} مدفوع
                            </span>
                            <span className="text-xs text-[#192631]/70">
                              (متبقي {remainingMonths} أقساط)
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-[#192631]/[0.05]">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${(plan.paidMonths / plan.totalMonths) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-[#192631]/85">{plan.nextDueDate}</td>
                        <td className="py-3.5 px-3 text-center">
                          {plan.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handlePayCardInstallment(plan)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                              سداد القسط الشهري
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#123524]/10 px-2.5 py-1 text-xs font-bold text-[#123524]">
                              <CheckCircle2 className="h-3.5 w-3.5" /> مكتمل السداد
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: 46 ACTIVE PROJECTS PROFITABILITY & CASHFLOW MATRIX
         ===================================================================== */}
      {activeSubTab === 'projects_matrix' && (
        <div className="space-y-5">
          {/* Search & Filters Bar */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#e04b2a]" />
                  مصفوفة ربحية وموقف السيولة للـ 46 مشروع نشط (46 Active Projects Profitability &amp; Cashflow Matrix)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  متابعة قيمة التعاقد، إجمالي المتحصلات من العميل، المصروفات الفعلية (مشتريات + مقاولين + يوميات)، صافي سيولة كل مشروع، ونسبة الربح والإشراف
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="h-4 w-4 text-[#192631]/70 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="ابحث بكود المشروع (C096 Azad, C063...)"
                    className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 pr-9 pl-3 py-2 text-xs text-[#192631] placeholder-[#192631]/40 focus:border-indigo-500 focus:outline-none w-64"
                  />
                </div>

                <select
                  value={projectZoneFilter}
                  onChange={(e) => setProjectZoneFilter(e.target.value)}
                  className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">جميع المناطق الجغرافية (46)</option>
                  <option value="التجمع الخامس">التجمع الخامس</option>
                  <option value="مدينتي">مدينتي</option>
                  <option value="مدينة الرحاب">مدينة الرحاب</option>
                  <option value="التجمع الأول">التجمع الأول</option>
                  <option value="العاصمة الإدارية">العاصمة الإدارية</option>
                  <option value="الشيخ زايد">الشيخ زايد</option>
                  <option value="6 أكتوبر">6 أكتوبر</option>
                </select>

                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">كل الحالات التنفيذية</option>
                  <option value="active">قيد التنفيذ والتأسيس</option>
                  <option value="finishing">مرحلة التشطيبات النهائية</option>
                  <option value="handover">تسليم ابتدائي للعميل</option>
                </select>
              </div>
            </div>

            {/* Totals Summary Strip for Filtered Projects */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-[#192631]/10 p-3">
                <div className="text-xs text-[#192631]/70">إجمالي قيم التعاقدات ({filteredProjects.length} مشروع)</div>
                <div className="mt-1 font-mono text-base font-black text-[#192631]" dir="ltr">
                  {formatEGP(projectPortfolioTotals.contractValue)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-[#123524]/25 p-3">
                <div className="text-xs text-[#123524]">إجمالي المتحصلات من العملاء</div>
                <div className="mt-1 font-mono text-base font-black text-[#123524]" dir="ltr">
                  {formatEGP(projectPortfolioTotals.clientCollections)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-rose-500/20 p-3">
                <div className="text-xs text-red-700">إجمالي المصروفات الفعلية والتوريدات</div>
                <div className="mt-1 font-mono text-base font-black text-red-700" dir="ltr">
                  {formatEGP(projectPortfolioTotals.actualExpenses)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-[#e04b2a]/25 p-3">
                <div className="text-xs text-[#e04b2a]">صافي فائض السيولة والربحية التشغيلية</div>
                <div className="mt-1 font-mono text-base font-black text-[#e04b2a]" dir="ltr">
                  {formatEGP(projectPortfolioTotals.netCashPosition)}
                </div>
              </div>
            </div>

            {/* 46 Projects Table */}
            <div className="mt-4 overflow-x-auto max-h-[560px] overflow-y-auto rounded-xl border border-[#192631]/10">
              <table className="w-full text-right text-sm">
                <thead className="sticky top-0 bg-[#f5f5f5]/90 text-xs text-[#192631]/70 border-b border-[#192631]/10 z-10">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">كود واسم المشروع</th>
                    <th className="py-3 px-3">العميل والمنطقة</th>
                    <th className="py-3 px-3 text-left">قيمة التعاقد</th>
                    <th className="py-3 px-3 text-left">إجمالي المتحصلات من العميل</th>
                    <th className="py-3 px-3 text-left">إجمالي المصروفات الفعلية</th>
                    <th className="py-3 px-3 text-left">صافي سيولة المشروع</th>
                    <th className="py-3 px-3 text-center">نسبة الربح الفعلي</th>
                    <th className="py-3 px-3 text-center">نسبة الإشراف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredProjects.map((proj, index) => (
                    <tr key={proj.id} className="hover:bg-[#192631]/[0.05] transition">
                      <td className="py-3 px-3 font-mono text-xs text-[#192631]/60">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[#e04b2a]/10 border border-[#e04b2a]/25 px-2 py-0.5 font-mono text-xs font-bold text-[#e04b2a]">
                            {proj.projectCode}
                          </span>
                          <span className="font-bold text-[#192631]">{proj.compoundName}</span>
                        </div>
                        <div className="text-xs text-[#192631]/70 mt-0.5">{proj.projectNameAr}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#192631]">{proj.clientNameAr}</div>
                        <div className="text-xs text-[#192631]/60">{proj.zone}</div>
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-xs text-[#192631]/85" dir="ltr">
                        {formatEGP(proj.contractValue)}
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-xs font-bold text-[#123524]" dir="ltr">
                        {formatEGP(proj.clientCollections)}
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-xs font-bold text-red-700" dir="ltr">
                        {formatEGP(proj.actualExpenses)}
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-xs font-black text-[#192631]" dir="ltr">
                        +{formatEGP(proj.netCashPosition)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-[#123524]/10 border border-[#123524]/25 px-2.5 py-0.5 font-mono text-xs font-bold text-[#123524]">
                          <Percent className="h-3 w-3" />
                          {proj.actualProfitMarginPct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center rounded-lg bg-[#192631]/[0.05] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#b45309]">
                          {proj.supervisionFeePct}%
                        </span>
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
          SUB-TAB 4: E-WORKS LEGACY ERP MIGRATION AUDIT (`/eworks` & `/eworks/review`)
         ===================================================================== */}
      {activeSubTab === 'eworks_audit' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[#192631]/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-[#192631]" />
                  <h3 className="text-lg font-bold text-[#192631]">
                    مراجعة ترحيل بيانات E-Works للنظام الجديد (E-Works Legacy ERP Migration Audit)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#192631]/70">
                  مطابقة الأرصدة المرحّلة من نظام E-Works القديم (/eworks &amp; /eworks/review) مع القيود الفعلية في Actpert Nexus للمستخلصات، أرصدة العملاء، أوامر الشراء، وكشوف المقاولين
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEworksFilter('ALL')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    eworksFilter === 'ALL'
                      ? 'bg-purple-600 text-[#192631]'
                      : 'bg-[#192631]/[0.05] text-[#192631]/85 hover:bg-[#192631]/[0.12]'
                  }`}
                >
                  كل السجلات ({eworksRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEworksFilter('verified')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    eworksFilter === 'verified'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#192631]/[0.05] text-[#123524] hover:bg-[#192631]/[0.12]'
                  }`}
                >
                  Verified ✅ ({eworksRecords.filter((r) => r.auditStatus === 'verified').length})
                </button>
                <button
                  type="button"
                  onClick={() => setEworksFilter('flagged')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    eworksFilter === 'flagged'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#192631]/[0.05] text-[#b45309] hover:bg-[#192631]/[0.12]'
                  }`}
                >
                  Flagged for Review ⚠️ ({eworksRecords.filter((r) => r.auditStatus === 'flagged').length})
                </button>
              </div>
            </div>

            {/* Secondary Filter Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-[#192631]/70" />
                <select
                  value={eworksModuleFilter}
                  onChange={(e) => setEworksModuleFilter(e.target.value)}
                  className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-purple-500 focus:outline-none"
                >
                  <option value="ALL">جميع وحدات E-Works المرحّلة</option>
                  <option value="extracts">المستخلصات (Legacy Extracts)</option>
                  <option value="client_balances">أرصدة العملاء الافتتاحية (Client Balances)</option>
                  <option value="purchase_orders">أوامر الشراء (Purchasing Orders)</option>
                  <option value="subcontractor_statements">كشوف حساب المقاولين (Subcontractor Statements)</option>
                </select>
              </div>

              <div className="relative">
                <Search className="h-4 w-4 text-[#192631]/70 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={eworksSearch}
                  onChange={(e) => setEworksSearch(e.target.value)}
                  placeholder="ابحث بكود E-Works أو المشروع..."
                  className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 pr-9 pl-3 py-2 text-xs text-[#192631] placeholder-[#192631]/40 focus:border-purple-500 focus:outline-none w-64"
                />
              </div>
            </div>

            {/* E-Works Migration Audit Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-xs text-[#192631]/70">
                    <th className="py-3 px-3">مرجع E-Works / Nexus</th>
                    <th className="py-3 px-3">القسم والمشروع</th>
                    <th className="py-3 px-3">البيان والجهة</th>
                    <th className="py-3 px-3 text-left">رصيد E-Works القديم</th>
                    <th className="py-3 px-3 text-left">رصيد Nexus المرحّل</th>
                    <th className="py-3 px-3 text-left">الفروق (Variance)</th>
                    <th className="py-3 px-3">حالة التدقيق</th>
                    <th className="py-3 px-3 text-center">إجراء المراجعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredEworksRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#192631]/[0.05] transition">
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-xs font-bold text-[#192631]">{rec.legacyEworksCode}</div>
                        <div className="font-mono text-[11px] text-[#192631]/70">→ {rec.nexusTargetRef}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded-md bg-[#e04b2a]/10 border border-[#e04b2a]/25 px-2 py-0.5 font-mono text-xs font-bold text-[#e04b2a]">
                          {rec.projectCode}
                        </span>
                        <div className="text-xs text-[#192631]/70 mt-1">{rec.moduleLabelAr}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-md">
                        <div className="font-semibold text-[#192631]">{rec.entityNameAr}</div>
                        <div className="text-xs text-[#192631]/70 mt-0.5 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5 text-[#192631]/60 shrink-0" />
                          <span>{rec.auditorNoteAr}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-left font-mono text-xs text-[#192631]/85" dir="ltr">
                        {formatEGP(rec.eworksLegacyBalance)}
                      </td>
                      <td className="py-3.5 px-3 text-left font-mono text-xs font-bold text-[#192631]" dir="ltr">
                        {formatEGP(rec.nexusMigratedBalance)}
                      </td>
                      <td className="py-3.5 px-3 text-left font-mono text-xs font-bold" dir="ltr">
                        <span className={rec.varianceAmount === 0 ? 'text-[#123524]' : 'text-[#b45309]'}>
                          {rec.varianceAmount === 0 ? '0.00 EGP' : formatEGP(rec.varianceAmount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {rec.auditStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#123524]/10 border border-[#123524]/25 px-2.5 py-1 text-xs font-bold text-[#123524]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified ✅
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-[#b45309]">
                            <AlertTriangle className="h-3.5 w-3.5" /> Flagged for Review ⚠️
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {rec.auditStatus === 'flagged' ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyEworksRecord(rec.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-bold text-[#192631] shadow transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            اعتماد التسوية
                          </button>
                        ) : (
                          <span className="text-xs text-[#192631]/60 font-medium">مُطابق ومُقفل</span>
                        )}
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
          MODAL: RECORD DEPOSIT / PAYMENT / INTERNAL TRANSFER
         ===================================================================== */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192631]/40 backdrop-blur-sm p-4">
          <div
            dir="rtl"
            className="w-full max-w-lg rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
              <h3 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#123524]" />
                تسجيل حركة خزينة أو تحويل بنكي جديد
              </h3>
              <button
                type="button"
                onClick={() => setIsTxModalOpen(false)}
                className="text-[#192631]/70 hover:text-[#192631]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('deposit')}
                  className={`rounded-xl py-2 text-xs font-bold border transition ${
                    txType === 'deposit'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-[#192631]/[0.05] border-[#192631]/10 text-[#192631]/85'
                  }`}
                >
                  إيداع / تحصيل عميل
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('payment')}
                  className={`rounded-xl py-2 text-xs font-bold border transition ${
                    txType === 'payment'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-[#192631]/[0.05] border-[#192631]/10 text-[#192631]/85'
                  }`}
                >
                  صرف / سداد مورد أو مقاول
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('transfer')}
                  className={`rounded-xl py-2 text-xs font-bold border transition ${
                    txType === 'transfer'
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-[#192631]/[0.05] border-[#192631]/10 text-[#192631]/85'
                  }`}
                >
                  تحويل داخلي بين الحسابات
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#192631]/85 mb-1">
                  {txType === 'transfer' ? 'من حساب (الخزينة / البنك المصدر)' : 'الحساب البنكي / الخزينة'}
                </label>
                <select
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nameAr} ({formatEGP(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              {txType === 'transfer' && (
                <div>
                  <label className="block text-xs font-semibold text-[#192631]/85 mb-1">
                    إلى حساب (الخزينة / البنك المستلم)
                  </label>
                  <select
                    value={txTargetAccountId}
                    onChange={(e) => setTxTargetAccountId(e.target.value)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  >
                    {accounts
                      .filter((a) => a.id !== txAccountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.nameAr} ({formatEGP(acc.currentBalance)})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#192631]/85 mb-1">المشروع المرتبط</label>
                  <select
                    value={txProjectCode}
                    onChange={(e) => setTxProjectCode(e.target.value)}
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  >
                    {ALL_46_PROJECTS.slice(0, 12).map((p) => (
                      <option key={p.id} value={p.projectCode}>
                        {p.projectCode} — {p.compoundName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#192631]/85 mb-1">المبلغ (EGP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="مثال: 25000"
                    className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#192631]/85 mb-1">
                  اسم العميل / المورد / المقاول المستفيد
                </label>
                <input
                  type="text"
                  value={txCounterparty}
                  onChange={(e) => setTxCounterparty(e.target.value)}
                  placeholder="مثال: د. طارق عز الدين / مؤسسة السلاب / م. شريف عبد العزيز"
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#192631]/85 mb-1">التصنيف والبيان</label>
                <input
                  type="text"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#192631]/85 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="رقم الشيك / مرجع تحويل إنستاباي أو رقم المستخلص..."
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#192631]/10">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="rounded-xl border border-[#192631]/10 bg-[#192631]/[0.05] px-4 py-2 text-xs font-semibold text-[#192631]/85 hover:bg-[#192631]/[0.12]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg"
                >
                  تأكيد وترحيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryCashBankHub;
