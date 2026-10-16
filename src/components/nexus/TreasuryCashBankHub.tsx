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
import { GuidedStepBanner } from './GuidedStepBanner';

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
// EXACT LIVE Nexus DATA SNAPSHOT
// ============================================================================

// 6 Active Cash/Vault & Bank Accounts summing to 254,833.88 EGP
const INITIAL_CASH_BANK_ACCOUNTS: CashBankAccount[] = [
  {
    "id": "ACC-12010101",
    "nameAr": "12010101 — الخزينة الرئيسية (Main cash vault)",
    "nameEn": "12010101 — Main cash vault",
    "accountType": "vault",
    "accountNumber": "12010101",
    "bankName": "Main Cash Vault — Nexus HQ",
    "currency": "EGP",
    "openingBalance": 50000.0,
    "totalInflows": 420802.5,
    "totalOutflows": 437000.0,
    "currentBalance": 33802.5,
    "custodianAr": "Merna Maged Samwel (1009)",
    "lastUpdated": "2026-10-15 17:21"
  },
  {
    "id": "ACC-12010203",
    "nameAr": "12010203 — Debit-NBE Pierre-Personal",
    "nameEn": "12010203 — Debit-NBE Pierre-Personal",
    "accountType": "retail_bank",
    "accountNumber": "12010203",
    "bankName": "البنك الأهلي المصري NBE (Pierre Personal)",
    "currency": "EGP",
    "openingBalance": 25000.0,
    "totalInflows": 310257.26,
    "totalOutflows": 329000.0,
    "currentBalance": 6257.26,
    "custodianAr": "Pierre Afifi (1001)",
    "lastUpdated": "2026-10-15 16:40"
  },
  {
    "id": "ACC-12010204",
    "nameAr": "12010204 — Debit-NBE Corporate",
    "nameEn": "12010204 — Debit-NBE Corporate",
    "accountType": "corporate_bank",
    "accountNumber": "12010204",
    "bankName": "البنك الأهلي المصري NBE (شركات)",
    "currency": "EGP",
    "openingBalance": 100000.0,
    "totalInflows": 1450649.22,
    "totalOutflows": 1538000.0,
    "currentBalance": 12649.22,
    "custodianAr": "Nexus Corporate Treasury",
    "lastUpdated": "2026-10-15 16:30"
  },
  {
    "id": "ACC-12010205",
    "nameAr": "12010205 — Debit-QNB Corporate",
    "nameEn": "12010205 — Debit-QNB Corporate",
    "accountType": "corporate_bank",
    "accountNumber": "12010205",
    "bankName": "بنك QNB الأهلي (شركات)",
    "currency": "EGP",
    "openingBalance": 40000.0,
    "totalInflows": 512844.22,
    "totalOutflows": 552000.0,
    "currentBalance": 844.22,
    "custodianAr": "Nexus Corporate Treasury",
    "lastUpdated": "2026-10-15 15:20"
  },
  {
    "id": "ACC-12010206",
    "nameAr": "12010206 — NBE — investment",
    "nameEn": "12010206 — NBE — investment",
    "accountType": "corporate_bank",
    "accountNumber": "12010206",
    "bankName": "البنك الأهلي المصري NBE (استثمار)",
    "currency": "EGP",
    "openingBalance": 0.0,
    "totalInflows": 250000.0,
    "totalOutflows": 250000.0,
    "currentBalance": 0.0,
    "custodianAr": "Nexus Corporate Treasury",
    "lastUpdated": "2026-10-15 14:00"
  },
  {
    "id": "ACC-12010207",
    "nameAr": "12010207 — Debit-CIB-Personal",
    "nameEn": "12010207 — Debit-CIB-Personal",
    "accountType": "retail_bank",
    "accountNumber": "12010207",
    "bankName": "البنك التجاري الدولي CIB",
    "currency": "EGP",
    "openingBalance": 150000.0,
    "totalInflows": 2450088.64,
    "totalOutflows": 2400000.0,
    "currentBalance": 200088.64,
    "custodianAr": "Executive Management (CIB)",
    "lastUpdated": "2026-10-15 17:00"
  },
  {
    "id": "ACC-12010208",
    "nameAr": "12010208 — Debit-NBE Mariam-Personal",
    "nameEn": "12010208 — Debit-NBE Mariam-Personal",
    "accountType": "retail_bank",
    "accountNumber": "12010208",
    "bankName": "البنك الأهلي المصري NBE (Mariam Personal)",
    "currency": "EGP",
    "openingBalance": 15000.0,
    "totalInflows": 186192.04,
    "totalOutflows": 200000.0,
    "currentBalance": 1192.04,
    "custodianAr": "Mariam / Executive Finance",
    "lastUpdated": "2026-10-15 16:15"
  }
];

// 9 Real Credit Card Accounts from Nexus (/cashbox) summing to 483,450.31 EGP Available Limit
const INITIAL_CREDIT_CARDS: CorporateCreditCard[] = [
  {
    "id": "CC-210701",
    "cardNameAr": "210701 — كارت ائتمان — رئيسي",
    "cardNameEn": "210701 — Main Corporate Credit Card",
    "bankName": "Main Credit Card",
    "cardNumberMasked": "**** **** **** 0701",
    "cardholderAr": "Nexus Corporate",
    "totalLimit": 50000.0,
    "usedAmount": 0.0,
    "availableLimit": 0.0,
    "statementClosingDay": 25,
    "paymentDueDay": 15,
    "status": "active"
  },
  {
    "id": "CC-210702",
    "cardNameAr": "210702 — Credit-ABK",
    "cardNameEn": "210702 — Credit-ABK",
    "bankName": "Al Ahli Bank of Kuwait (ABK)",
    "cardNumberMasked": "**** **** **** 0702",
    "cardholderAr": "Pierre Afifi (1001)",
    "totalLimit": 15000.0,
    "usedAmount": 5790.78,
    "availableLimit": 9209.22,
    "statementClosingDay": 25,
    "paymentDueDay": 15,
    "status": "active"
  },
  {
    "id": "CC-210703",
    "cardNameAr": "210703 — Credit-HSBC-أفراد",
    "cardNameEn": "210703 — Credit-HSBC-Personal",
    "bankName": "HSBC Egypt",
    "cardNumberMasked": "**** **** **** 0703",
    "cardholderAr": "Pierre Afifi (1001)",
    "totalLimit": 212000.0,
    "usedAmount": 102248.31,
    "availableLimit": 109751.69,
    "statementClosingDay": 1,
    "paymentDueDay": 22,
    "status": "active"
  },
  {
    "id": "CC-210704",
    "cardNameAr": "210704 — Credit-NBE Pierre-أفراد",
    "cardNameEn": "210704 — Credit-NBE Pierre-Personal",
    "bankName": "National Bank of Egypt (NBE)",
    "cardNumberMasked": "**** **** **** 0704",
    "cardholderAr": "Pierre Afifi (1001)",
    "totalLimit": 343449.04,
    "usedAmount": 156542.17,
    "availableLimit": 186906.87,
    "statementClosingDay": 5,
    "paymentDueDay": 25,
    "status": "active"
  },
  {
    "id": "CC-210705",
    "cardNameAr": "210705 — Credit-NBE Mariam-أفراد",
    "cardNameEn": "210705 — Credit-NBE Mariam-Personal",
    "bankName": "National Bank of Egypt (NBE)",
    "cardNumberMasked": "**** **** **** 0705",
    "cardholderAr": "Mariam / Executive",
    "totalLimit": 88703.3,
    "usedAmount": 5405.94,
    "availableLimit": 83297.36,
    "statementClosingDay": 10,
    "paymentDueDay": 2,
    "status": "active"
  },
  {
    "id": "CC-210706",
    "cardNameAr": "210706 — فوري رصيد مدين (Fawry Debit Adjustment)",
    "cardNameEn": "210706 — Fawry Card Settlement Account",
    "bankName": "Fawry / Card Reconciliation",
    "cardNumberMasked": "**** **** **** 0706",
    "cardholderAr": "Merna Maged Samwel (1009)",
    "totalLimit": 10000.0,
    "usedAmount": -7126.37,
    "availableLimit": 0.0,
    "statementClosingDay": 15,
    "paymentDueDay": 5,
    "status": "active"
  },
  {
    "id": "CC-210707",
    "cardNameAr": "210707 — Credit-ENBD أفراد",
    "cardNameEn": "210707 — Credit-ENBD Personal",
    "bankName": "Emirates NBD Egypt",
    "cardNumberMasked": "**** **** **** 0707",
    "cardholderAr": "Pierre Afifi (1001)",
    "totalLimit": 400000.0,
    "usedAmount": 305714.83,
    "availableLimit": 94285.17,
    "statementClosingDay": 20,
    "paymentDueDay": 10,
    "status": "near_limit"
  },
  {
    "id": "CC-210708",
    "cardNameAr": "210708 — كارت ائتمان — CIB",
    "cardNameEn": "210708 — Credit-CIB",
    "bankName": "Commercial International Bank (CIB)",
    "cardNumberMasked": "**** **** **** 0708",
    "cardholderAr": "Nexus Executive",
    "totalLimit": 43863.1,
    "usedAmount": 43863.1,
    "availableLimit": 0.0,
    "statementClosingDay": 25,
    "paymentDueDay": 15,
    "status": "near_limit"
  },
  {
    "id": "CC-210709",
    "cardNameAr": "210709 — أقساط مشتريات بالتقسيط — كروت ائتمان",
    "cardNameEn": "210709 — Credit Card Installment Plans Pool",
    "bankName": "Installment Plans Pool (أقساط الكروت)",
    "cardNumberMasked": "**** **** **** 0709",
    "cardholderAr": "Nexus Procurement Installments",
    "totalLimit": 109847.66,
    "usedAmount": 109847.66,
    "availableLimit": 0.0,
    "statementClosingDay": 28,
    "paymentDueDay": 18,
    "status": "near_limit"
  }
];

// Initial Credit Card Installment Plans (أقساط الكروت)
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

// Full Real Active & Client Projects Portfolio from Nexus Live ERP
const ALL_46_PROJECTS: ProjectCashflowRow[] = [
  {
    "id": "PRJ-01",
    "projectCode": "C096",
    "projectNameAr": "C096_Michael & Mona_2026_02_16_Azad-5th settlement",
    "compoundName": "Azad Compound, 5th Settlement, New Cairo",
    "clientNameAr": "Michael Saber",
    "zone": "Azad Compound, 5th Settlement, New Cairo",
    "contractValue": 1042730.0,
    "clientCollections": 850000.0,
    "actualExpenses": 909969.0,
    "netCashPosition": -59969.0,
    "actualProfitMarginPct": -7.1,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-02",
    "projectCode": "C063",
    "projectNameAr": "C063 Ayman Adel — La Vista City",
    "compoundName": "La Vista City",
    "clientNameAr": "Ayman Adel",
    "zone": "La Vista City",
    "contractValue": 5197778.0,
    "clientCollections": 5383600.0,
    "actualExpenses": 5106663.0,
    "netCashPosition": 276937.0,
    "actualProfitMarginPct": 5.1,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-03",
    "projectCode": "C091",
    "projectNameAr": "C091 Peter & Rosaline — La Vista City",
    "compoundName": "La Vista City",
    "clientNameAr": "Peter & Rosaline",
    "zone": "La Vista City",
    "contractValue": 4720565.0,
    "clientCollections": 5210387.0,
    "actualExpenses": 3010884.0,
    "netCashPosition": 2199503.0,
    "actualProfitMarginPct": 42.2,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-04",
    "projectCode": "C005",
    "projectNameAr": "C005 John — Madinty",
    "compoundName": "Madinty",
    "clientNameAr": "John",
    "zone": "Madinty",
    "contractValue": 4149600.0,
    "clientCollections": 0.0,
    "actualExpenses": 4150317.0,
    "netCashPosition": -4150317.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-05",
    "projectCode": "N007",
    "projectNameAr": "N007 llegno — Sodic",
    "compoundName": "Sodic",
    "clientNameAr": "llegno",
    "zone": "Sodic",
    "contractValue": 4101983.0,
    "clientCollections": 4151983.0,
    "actualExpenses": 3243654.0,
    "netCashPosition": 908329.0,
    "actualProfitMarginPct": 21.9,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-06",
    "projectCode": "C055",
    "projectNameAr": "C055 Ahmed Sedik — Etoile (1st Settleme...",
    "compoundName": "Etoile (1st Settleme...",
    "clientNameAr": "Ahmed Sedik",
    "zone": "Etoile (1st Settleme...",
    "contractValue": 4022620.0,
    "clientCollections": 4385000.0,
    "actualExpenses": 2911000.0,
    "netCashPosition": 1474000.0,
    "actualProfitMarginPct": 33.6,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-07",
    "projectCode": "C088",
    "projectNameAr": "C088 Shenouda — Zamalek",
    "compoundName": "Zamalek",
    "clientNameAr": "Shenouda",
    "zone": "Zamalek",
    "contractValue": 2562819.0,
    "clientCollections": 2365000.0,
    "actualExpenses": 1473430.0,
    "netCashPosition": 891570.0,
    "actualProfitMarginPct": 37.7,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-08",
    "projectCode": "C079",
    "projectNameAr": "C079 Malak Morgan — Masr El-Gedida",
    "compoundName": "Masr El-Gedida",
    "clientNameAr": "Malak Morgan",
    "zone": "Masr El-Gedida",
    "contractValue": 2373851.0,
    "clientCollections": 2439469.0,
    "actualExpenses": 2471749.0,
    "netCashPosition": -32280.0,
    "actualProfitMarginPct": -1.3,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-09",
    "projectCode": "N018",
    "projectNameAr": "N018 NXTP — Maadi Bathroom Repairs (26Q...",
    "compoundName": "Maadi Bathroom Repairs (26Q...",
    "clientNameAr": "NXTP",
    "zone": "Maadi Bathroom Repairs (26Q...",
    "contractValue": 1912882.0,
    "clientCollections": 4360511.0,
    "actualExpenses": 1537233.0,
    "netCashPosition": 2823278.0,
    "actualProfitMarginPct": 64.7,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-10",
    "projectCode": "C035",
    "projectNameAr": "C035 Ehab & Mariam (M01)",
    "compoundName": "New Cairo / Greater Cairo",
    "clientNameAr": "Ehab & Mariam (M01)",
    "zone": "New Cairo / Greater Cairo",
    "contractValue": 1675894.0,
    "clientCollections": 4830.0,
    "actualExpenses": 1305578.0,
    "netCashPosition": -1300748.0,
    "actualProfitMarginPct": -26930.6,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-11",
    "projectCode": "C092",
    "projectNameAr": "C092 Mary Khalaf — La Vista Mostakbal",
    "compoundName": "La Vista Mostakbal",
    "clientNameAr": "Mary Khalaf",
    "zone": "La Vista Mostakbal",
    "contractValue": 1606926.0,
    "clientCollections": 1611156.0,
    "actualExpenses": 1110683.0,
    "netCashPosition": 500473.0,
    "actualProfitMarginPct": 31.1,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-12",
    "projectCode": "N016",
    "projectNameAr": "إم جي إل — مكتب إداري N016 — MGL — Admin Office 3rd F El Nozha",
    "compoundName": "Admin Office 3rd F El Nozha",
    "clientNameAr": "إم جي إل",
    "zone": "Admin Office 3rd F El Nozha",
    "contractValue": 942763.0,
    "clientCollections": 942763.0,
    "actualExpenses": 895581.0,
    "netCashPosition": 47182.0,
    "actualProfitMarginPct": 5.0,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-13",
    "projectCode": "C084",
    "projectNameAr": "دانيال C084 — Daniel — Mountain View I-City",
    "compoundName": "Mountain View I-City",
    "clientNameAr": "دانيال C084",
    "zone": "Mountain View I-City",
    "contractValue": 1125872.0,
    "clientCollections": 1075000.0,
    "actualExpenses": 1125872.0,
    "netCashPosition": -50872.0,
    "actualProfitMarginPct": -4.7,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-14",
    "projectCode": "DC005",
    "projectNameAr": "ناصر عماد DC005 — Nasser Emad — Sodic Elsherouk",
    "compoundName": "Sodic Elsherouk",
    "clientNameAr": "ناصر عماد DC005",
    "zone": "Sodic Elsherouk",
    "contractValue": 31500.0,
    "clientCollections": 0.0,
    "actualExpenses": 31500.0,
    "netCashPosition": -31500.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-15",
    "projectCode": "C090",
    "projectNameAr": "C090 — C090_Andrew wahba مش مربوط بعميل C090 — C090_Andrew wahba",
    "compoundName": "C090_Andrew wahba",
    "clientNameAr": "C090",
    "zone": "C090_Andrew wahba",
    "contractValue": 13050.0,
    "clientCollections": 0.0,
    "actualExpenses": 13050.0,
    "netCashPosition": -13050.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-16",
    "projectCode": "N009",
    "projectNameAr": "مراكي — لوكسفت ميفيدا N009 — Meraki — Luxoft Mevida",
    "compoundName": "Luxoft Mevida",
    "clientNameAr": "مراكي",
    "zone": "Luxoft Mevida",
    "contractValue": 57740.0,
    "clientCollections": 57740.0,
    "actualExpenses": 57740.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-17",
    "projectCode": "CL-009",
    "projectNameAr": "إيمان — ميفيدا MC004 — Eman — Mivida Parkside A1-44",
    "compoundName": "Mivida Parkside A1-44",
    "clientNameAr": "إيمان",
    "zone": "Mivida Parkside A1-44",
    "contractValue": 259000.0,
    "clientCollections": 259000.0,
    "actualExpenses": 192109.0,
    "netCashPosition": 66891.0,
    "actualProfitMarginPct": 25.8,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-18",
    "projectCode": "C094",
    "projectNameAr": "كارين مارك ميلاد C094 — Karen Marc Milad — Nasr City",
    "compoundName": "Nasr City",
    "clientNameAr": "كارين مارك ميلاد C094",
    "zone": "Nasr City",
    "contractValue": 13080.0,
    "clientCollections": 13000.0,
    "actualExpenses": 13080.0,
    "netCashPosition": -80.0,
    "actualProfitMarginPct": -0.6,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-19",
    "projectCode": "N010",
    "projectNameAr": "ذا كوكري N010 — The Cookery Co. — 6th of October City",
    "compoundName": "6th of October City",
    "clientNameAr": "ذا كوكري N010",
    "zone": "6th of October City",
    "contractValue": 170753.0,
    "clientCollections": 170752.0,
    "actualExpenses": 170753.0,
    "netCashPosition": -1.0,
    "actualProfitMarginPct": -0.0,
    "supervisionFeePct": 15,
    "status": "active"
  },
  {
    "id": "PRJ-20",
    "projectCode": "CL-012",
    "projectNameAr": "أحمد الجندي MC006 — Ahmed El Gendi — Latera V32-A",
    "compoundName": "Latera V32-A",
    "clientNameAr": "أحمد الجندي MC006",
    "zone": "Latera V32-A",
    "contractValue": 5900.0,
    "clientCollections": 5900.0,
    "actualExpenses": 5900.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-21",
    "projectCode": "C069",
    "projectNameAr": "محمد جلال C069 — Mohamed Galal — Sherouk",
    "compoundName": "Sherouk",
    "clientNameAr": "محمد جلال C069",
    "zone": "Sherouk",
    "contractValue": 1368824.0,
    "clientCollections": 1368824.0,
    "actualExpenses": 1368824.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-22",
    "projectCode": "N008",
    "projectNameAr": "N008 — N008_Apartment Renovation مش مربوط بعميل N008 — N008_Apartment Renovation",
    "compoundName": "N008_Apartment Renovation",
    "clientNameAr": "N008",
    "zone": "N008_Apartment Renovation",
    "contractValue": 1811495.0,
    "clientCollections": 1811495.0,
    "actualExpenses": 1811495.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-23",
    "projectCode": "C073",
    "projectNameAr": "C073 — C073 Mark&Hala مش مربوط بعميل C073 — C073 Mark&Hala",
    "compoundName": "C073 Mark&Hala",
    "clientNameAr": "C073",
    "zone": "C073 Mark&Hala",
    "contractValue": 1293650.0,
    "clientCollections": 1293650.0,
    "actualExpenses": 1293650.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-24",
    "projectCode": "C071",
    "projectNameAr": "C071 — C071. Dr. Hesham&Hanan Sodic مش مربوط بعميل C071 — C071. Dr. Hesham&Hanan Sodic",
    "compoundName": "C071. Dr. Hesham&Hanan Sodic",
    "clientNameAr": "C071",
    "zone": "C071. Dr. Hesham&Hanan Sodic",
    "contractValue": 1045000.0,
    "clientCollections": 1045000.0,
    "actualExpenses": 1045000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-25",
    "projectCode": "C074",
    "projectNameAr": "C074 — C074 John Sarai مش مربوط بعميل C074 — C074 John Sarai",
    "compoundName": "C074 John Sarai",
    "clientNameAr": "C074",
    "zone": "C074 John Sarai",
    "contractValue": 966940.0,
    "clientCollections": 966940.0,
    "actualExpenses": 966940.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-26",
    "projectCode": "C042",
    "projectNameAr": "C042 — C042 Riham MV maintaince مش مربوط بعميل C042 — C042 Riham MV maintaince",
    "compoundName": "C042 Riham MV maintaince",
    "clientNameAr": "C042",
    "zone": "C042 Riham MV maintaince",
    "contractValue": 949757.0,
    "clientCollections": 949757.0,
    "actualExpenses": 949757.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-27",
    "projectCode": "C052",
    "projectNameAr": "C052 — C052 Mary Maged Stone مش مربوط بعميل C052 — C052 Mary Maged Stone",
    "compoundName": "C052 Mary Maged Stone",
    "clientNameAr": "C052",
    "zone": "C052 Mary Maged Stone",
    "contractValue": 831913.0,
    "clientCollections": 831913.0,
    "actualExpenses": 831913.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-28",
    "projectCode": "C070",
    "projectNameAr": "C070 — C070 Dr.Mohamed Tharwat مش مربوط بعميل C070 — C070 Dr.Mohamed Tharwat",
    "compoundName": "C070 Dr.Mohamed Tharwat",
    "clientNameAr": "C070",
    "zone": "C070 Dr.Mohamed Tharwat",
    "contractValue": 678807.0,
    "clientCollections": 678807.0,
    "actualExpenses": 678807.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-29",
    "projectCode": "C080",
    "projectNameAr": "C080 — C080 Raouf مش مربوط بعميل C080 — C080 Raouf",
    "compoundName": "C080 Raouf",
    "clientNameAr": "C080",
    "zone": "C080 Raouf",
    "contractValue": 519083.0,
    "clientCollections": 519083.0,
    "actualExpenses": 519083.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-30",
    "projectCode": "C037",
    "projectNameAr": "C037 — C037 Marize&Emad Newgiza مش مربوط بعميل C037 — C037 Marize&Emad Newgiza",
    "compoundName": "C037 Marize&Emad Newgiza",
    "clientNameAr": "C037",
    "zone": "C037 Marize&Emad Newgiza",
    "contractValue": 772000.0,
    "clientCollections": 772000.0,
    "actualExpenses": 772000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-31",
    "projectCode": "C081",
    "projectNameAr": "C081 — C081_Oskofya library مش مربوط بعميل C081 — C081_Oskofya library",
    "compoundName": "C081_Oskofya library",
    "clientNameAr": "C081",
    "zone": "C081_Oskofya library",
    "contractValue": 399983.0,
    "clientCollections": 399983.0,
    "actualExpenses": 399983.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-32",
    "projectCode": "C066",
    "projectNameAr": "C066 — C066 Karim Hani مش مربوط بعميل C066 — C066 Karim Hani",
    "compoundName": "C066 Karim Hani",
    "clientNameAr": "C066",
    "zone": "C066 Karim Hani",
    "contractValue": 460500.0,
    "clientCollections": 460500.0,
    "actualExpenses": 460500.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-33",
    "projectCode": "CL-025",
    "projectNameAr": "م. مراكي — مصر الجديدة MN001 — ARCH Meraki — Heliopolis",
    "compoundName": "Heliopolis",
    "clientNameAr": "م. مراكي",
    "zone": "Heliopolis",
    "contractValue": 352700.0,
    "clientCollections": 352700.0,
    "actualExpenses": 351990.0,
    "netCashPosition": 710.0,
    "actualProfitMarginPct": 0.2,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-34",
    "projectCode": "C060",
    "projectNameAr": "C060 — C060 Cap Ahmed مش مربوط بعميل C060 — C060 Cap Ahmed",
    "compoundName": "C060 Cap Ahmed",
    "clientNameAr": "C060",
    "zone": "C060 Cap Ahmed",
    "contractValue": 355473.0,
    "clientCollections": 355473.0,
    "actualExpenses": 355473.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-35",
    "projectCode": "N012",
    "projectNameAr": "N012 — N012_NBE Etihadya مش مربوط بعميل N012 — N012_NBE Etihadya",
    "compoundName": "N012_NBE Etihadya",
    "clientNameAr": "N012",
    "zone": "N012_NBE Etihadya",
    "contractValue": 209000.0,
    "clientCollections": 209000.0,
    "actualExpenses": 209000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-36",
    "projectCode": "N011",
    "projectNameAr": "N011 — N011_Paula Noshy مش مربوط بعميل N011 — N011_Paula Noshy",
    "compoundName": "N011_Paula Noshy",
    "clientNameAr": "N011",
    "zone": "N011_Paula Noshy",
    "contractValue": 194148.0,
    "clientCollections": 194148.0,
    "actualExpenses": 194148.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-37",
    "projectCode": "N002",
    "projectNameAr": "N002 — N002 Origination Designs مش مربوط بعميل N002 — N002 Origination Designs",
    "compoundName": "N002 Origination Designs",
    "clientNameAr": "N002",
    "zone": "N002 Origination Designs",
    "contractValue": 179650.0,
    "clientCollections": 179650.0,
    "actualExpenses": 179650.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-38",
    "projectCode": "C051",
    "projectNameAr": "C051 — C051 Ayman Adel مش مربوط بعميل C051 — C051 Ayman Adel",
    "compoundName": "C051 Ayman Adel",
    "clientNameAr": "C051",
    "zone": "C051 Ayman Adel",
    "contractValue": 169591.0,
    "clientCollections": 169591.0,
    "actualExpenses": 169591.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-39",
    "projectCode": "N001",
    "projectNameAr": "N001 — N001 US.Embassy Maadi 55 مش مربوط بعميل N001 — N001 US.Embassy Maadi 55",
    "compoundName": "N001 US.Embassy Maadi 55",
    "clientNameAr": "N001",
    "zone": "N001 US.Embassy Maadi 55",
    "contractValue": 102160.0,
    "clientCollections": 102160.0,
    "actualExpenses": 102160.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-40",
    "projectCode": "C012",
    "projectNameAr": "C012 — C012 J&Jackline مش مربوط بعميل C012 — C012 J&Jackline",
    "compoundName": "C012 J&Jackline",
    "clientNameAr": "C012",
    "zone": "C012 J&Jackline",
    "contractValue": 145000.0,
    "clientCollections": 145000.0,
    "actualExpenses": 145000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-41",
    "projectCode": "C087",
    "projectNameAr": "C087 — C087_Estafanos Milad مش مربوط بعميل C087 — C087_Estafanos Milad",
    "compoundName": "C087_Estafanos Milad",
    "clientNameAr": "C087",
    "zone": "C087_Estafanos Milad",
    "contractValue": 67000.0,
    "clientCollections": 67000.0,
    "actualExpenses": 67000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-42",
    "projectCode": "C062",
    "projectNameAr": "C062 — C062 Abeir Diab مش مربوط بعميل C062 — C062 Abeir Diab",
    "compoundName": "C062 Abeir Diab",
    "clientNameAr": "C062",
    "zone": "C062 Abeir Diab",
    "contractValue": 100000.0,
    "clientCollections": 100000.0,
    "actualExpenses": 100000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-43",
    "projectCode": "C045",
    "projectNameAr": "C045 — C045 Marlene Magdy Treo مش مربوط بعميل C045 — C045 Marlene Magdy Treo",
    "compoundName": "C045 Marlene Magdy Treo",
    "clientNameAr": "C045",
    "zone": "C045 Marlene Magdy Treo",
    "contractValue": 90023.0,
    "clientCollections": 90023.0,
    "actualExpenses": 90023.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-44",
    "projectCode": "C059",
    "projectNameAr": "C059 — C059 Chistine & Remon مش مربوط بعميل C059 — C059 Chistine & Remon",
    "compoundName": "C059 Chistine & Remon",
    "clientNameAr": "C059",
    "zone": "C059 Chistine & Remon",
    "contractValue": 80981.0,
    "clientCollections": 80981.0,
    "actualExpenses": 80981.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-45",
    "projectCode": "C054",
    "projectNameAr": "C054 — C054 Rosine MV 185-23 مش مربوط بعميل C054 — C054 Rosine MV 185-23",
    "compoundName": "C054 Rosine MV 185-23",
    "clientNameAr": "C054",
    "zone": "C054 Rosine MV 185-23",
    "contractValue": 51260.0,
    "clientCollections": 51260.0,
    "actualExpenses": 51260.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-46",
    "projectCode": "C046",
    "projectNameAr": "C046 — C046 Nancy Naeem مش مربوط بعميل C046 — C046 Nancy Naeem",
    "compoundName": "C046 Nancy Naeem",
    "clientNameAr": "C046",
    "zone": "C046 Nancy Naeem",
    "contractValue": 55000.0,
    "clientCollections": 55000.0,
    "actualExpenses": 55000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-47",
    "projectCode": "C061",
    "projectNameAr": "C061 — C061-V2 Sherry Remon مش مربوط بعميل C061 — C061-V2 Sherry Remon",
    "compoundName": "C061-V2 Sherry Remon",
    "clientNameAr": "C061",
    "zone": "C061-V2 Sherry Remon",
    "contractValue": 30310.0,
    "clientCollections": 30310.0,
    "actualExpenses": 30310.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-48",
    "projectCode": "N003",
    "projectNameAr": "N003 — N003 United Gaz مش مربوط بعميل N003 — N003 United Gaz",
    "compoundName": "N003 United Gaz",
    "clientNameAr": "N003",
    "zone": "N003 United Gaz",
    "contractValue": 24917.0,
    "clientCollections": 24917.0,
    "actualExpenses": 24917.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-49",
    "projectCode": "C057",
    "projectNameAr": "C057 — C057 Ayman Adel Roof مش مربوط بعميل C057 — C057 Ayman Adel Roof",
    "compoundName": "C057 Ayman Adel Roof",
    "clientNameAr": "C057",
    "zone": "C057 Ayman Adel Roof",
    "contractValue": 44600.0,
    "clientCollections": 44600.0,
    "actualExpenses": 44600.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-50",
    "projectCode": "C036",
    "projectNameAr": "C036 — C036 Sonia mokatam مش مربوط بعميل C036 — C036 Sonia mokatam",
    "compoundName": "C036 Sonia mokatam",
    "clientNameAr": "C036",
    "zone": "C036 Sonia mokatam",
    "contractValue": 33000.0,
    "clientCollections": 33000.0,
    "actualExpenses": 33000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-51",
    "projectCode": "C065",
    "projectNameAr": "C065 — C065 Hassan Azouz مش مربوط بعميل C065 — C065 Hassan Azouz",
    "compoundName": "C065 Hassan Azouz",
    "clientNameAr": "C065",
    "zone": "C065 Hassan Azouz",
    "contractValue": 30000.0,
    "clientCollections": 30000.0,
    "actualExpenses": 30000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-52",
    "projectCode": "N006",
    "projectNameAr": "N006 — N006 STM مش مربوط بعميل N006 — N006 STM",
    "compoundName": "N006 STM",
    "clientNameAr": "N006",
    "zone": "N006 STM",
    "contractValue": 11190.0,
    "clientCollections": 11190.0,
    "actualExpenses": 11190.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-53",
    "projectCode": "C077",
    "projectNameAr": "C077 — C077-V1 Basma Ibrahim مش مربوط بعميل C077 — C077-V1 Basma Ibrahim",
    "compoundName": "C077-V1 Basma Ibrahim",
    "clientNameAr": "C077",
    "zone": "C077-V1 Basma Ibrahim",
    "contractValue": 21500.0,
    "clientCollections": 21500.0,
    "actualExpenses": 21500.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-54",
    "projectCode": "C038",
    "projectNameAr": "C038 — C038 Rafy raouf Painting مش مربوط بعميل C038 — C038 Rafy raouf Painting",
    "compoundName": "C038 Rafy raouf Painting",
    "clientNameAr": "C038",
    "zone": "C038 Rafy raouf Painting",
    "contractValue": 19550.0,
    "clientCollections": 19550.0,
    "actualExpenses": 19550.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-55",
    "projectCode": "C085",
    "projectNameAr": "C085 — C085_Ali Moustafa مش مربوط بعميل C085 — C085_Ali Moustafa",
    "compoundName": "C085_Ali Moustafa",
    "clientNameAr": "C085",
    "zone": "C085_Ali Moustafa",
    "contractValue": 18900.0,
    "clientCollections": 18900.0,
    "actualExpenses": 18900.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-56",
    "projectCode": "C050",
    "projectNameAr": "C050 — C050 Alber & Lidia مش مربوط بعميل C050 — C050 Alber & Lidia",
    "compoundName": "C050 Alber & Lidia",
    "clientNameAr": "C050",
    "zone": "C050 Alber & Lidia",
    "contractValue": 15000.0,
    "clientCollections": 15000.0,
    "actualExpenses": 15000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-57",
    "projectCode": "CL-051",
    "projectNameAr": "د. رؤوف — عيادة الألم MC009 — PAIN Dr. Raouf — Mahkama Square",
    "compoundName": "Mahkama Square",
    "clientNameAr": "د. رؤوف",
    "zone": "Mahkama Square",
    "contractValue": 8320.0,
    "clientCollections": 8320.0,
    "actualExpenses": 8320.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-58",
    "projectCode": "C047",
    "projectNameAr": "C047 — C047 Eman&Taher Gardenia مش مربوط بعميل C047 — C047 Eman&Taher Gardenia",
    "compoundName": "C047 Eman&Taher Gardenia",
    "clientNameAr": "C047",
    "zone": "C047 Eman&Taher Gardenia",
    "contractValue": 13857.0,
    "clientCollections": 13857.0,
    "actualExpenses": 13857.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-59",
    "projectCode": "C058",
    "projectNameAr": "C058 — C058 Bassem Abo el fetouh مش مربوط بعميل C058 — C058 Bassem Abo el fetouh",
    "compoundName": "C058 Bassem Abo el fetouh",
    "clientNameAr": "C058",
    "zone": "C058 Bassem Abo el fetouh",
    "contractValue": 12500.0,
    "clientCollections": 12500.0,
    "actualExpenses": 12500.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-60",
    "projectCode": "C056",
    "projectNameAr": "C056 — C056 Eriny Elnozha مش مربوط بعميل C056 — C056 Eriny Elnozha",
    "compoundName": "C056 Eriny Elnozha",
    "clientNameAr": "C056",
    "zone": "C056 Eriny Elnozha",
    "contractValue": 12300.0,
    "clientCollections": 12300.0,
    "actualExpenses": 12300.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-61",
    "projectCode": "DC003",
    "projectNameAr": "عبد الحي DC003 — Abd El-hay — Mokattam",
    "compoundName": "Mokattam",
    "clientNameAr": "عبد الحي DC003",
    "zone": "Mokattam",
    "contractValue": 10000.0,
    "clientCollections": 10000.0,
    "actualExpenses": 10000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-62",
    "projectCode": "C039",
    "projectNameAr": "C039 — C039 Rafy William Painting مش مربوط بعميل C039 — C039 Rafy William Painting",
    "compoundName": "C039 Rafy William Painting",
    "clientNameAr": "C039",
    "zone": "C039 Rafy William Painting",
    "contractValue": 7822.0,
    "clientCollections": 7822.0,
    "actualExpenses": 7822.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-63",
    "projectCode": "C000",
    "projectNameAr": "C000 — C00_Abanoub El shrouk مش مربوط بعميل C000 — C00_Abanoub El shrouk",
    "compoundName": "C00_Abanoub El shrouk",
    "clientNameAr": "C000",
    "zone": "C00_Abanoub El shrouk",
    "contractValue": 5000.0,
    "clientCollections": 5000.0,
    "actualExpenses": 5000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-64",
    "projectCode": "CL-059",
    "projectNameAr": "أيمن — التجمع MC015 — Ayman — التجمع تكييفات",
    "compoundName": "التجمع تكييفات",
    "clientNameAr": "أيمن",
    "zone": "التجمع تكييفات",
    "contractValue": 3420.0,
    "clientCollections": 3420.0,
    "actualExpenses": 3420.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-65",
    "projectCode": "N004",
    "projectNameAr": "N004 — N004 MGl-Admin office مش مربوط بعميل N004 — N004 MGl-Admin office",
    "compoundName": "N004 MGl-Admin office",
    "clientNameAr": "N004",
    "zone": "N004 MGl-Admin office",
    "contractValue": 5700.0,
    "clientCollections": 5700.0,
    "actualExpenses": 5700.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-66",
    "projectCode": "C078",
    "projectNameAr": "C078 — C078 Milad Naeim مش مربوط بعميل C078 — C078 Milad Naeim",
    "compoundName": "C078 Milad Naeim",
    "clientNameAr": "C078",
    "zone": "C078 Milad Naeim",
    "contractValue": 4900.0,
    "clientCollections": 4900.0,
    "actualExpenses": 4900.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-67",
    "projectCode": "C086",
    "projectNameAr": "C086 — C086_Mariam مش مربوط بعميل C086 — C086_Mariam",
    "compoundName": "C086_Mariam",
    "clientNameAr": "C086",
    "zone": "C086_Mariam",
    "contractValue": 2000.0,
    "clientCollections": 2000.0,
    "actualExpenses": 2000.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-68",
    "projectCode": "CL-063",
    "projectNameAr": "دانيال ناجي MC001 — Daniel Nagui — Rehab Apartment",
    "compoundName": "Rehab Apartment",
    "clientNameAr": "دانيال ناجي MC001",
    "zone": "Rehab Apartment",
    "contractValue": 22508.0,
    "clientCollections": 22508.0,
    "actualExpenses": 22508.0,
    "netCashPosition": 0.0,
    "actualProfitMarginPct": 0.0,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-69",
    "projectCode": "N017",
    "projectNameAr": "مراكي — أديداس N017 — MRKI — Adidas Toilets Renovation DIST-5",
    "compoundName": "Adidas Toilets Renovation DIST-5",
    "clientNameAr": "مراكي",
    "zone": "Adidas Toilets Renovation DIST-5",
    "contractValue": 1529535.0,
    "clientCollections": 1529535.0,
    "actualExpenses": 1337232.0,
    "netCashPosition": 192303.0,
    "actualProfitMarginPct": 12.6,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-70",
    "projectCode": "C031",
    "projectNameAr": "ماجدي موريس MC014 — Magdy Morice — Rehab Villa خشب و بيرجولة (C031)، C031 — Magdy Mourice — ANASIA، MC...",
    "compoundName": "ANASIA، MC...",
    "clientNameAr": "ماجدي موريس MC014",
    "zone": "ANASIA، MC...",
    "contractValue": 273575.0,
    "clientCollections": 271576.0,
    "actualExpenses": 273575.0,
    "netCashPosition": -1999.0,
    "actualProfitMarginPct": -0.7,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-71",
    "projectCode": "C093",
    "projectNameAr": "مارك ميلاد C093 — Marc Milad — Garage Ramp",
    "compoundName": "Garage Ramp",
    "clientNameAr": "مارك ميلاد C093",
    "zone": "Garage Ramp",
    "contractValue": 242850.0,
    "clientCollections": 242850.0,
    "actualExpenses": 241683.0,
    "netCashPosition": 1167.0,
    "actualProfitMarginPct": 0.5,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-72",
    "projectCode": "C067",
    "projectNameAr": "عمر مصطفى C067 — Omar Mostafa",
    "compoundName": "Omar Mostafa",
    "clientNameAr": "عمر مصطفى C067",
    "zone": "Omar Mostafa",
    "contractValue": 1083467.0,
    "clientCollections": 1083467.0,
    "actualExpenses": 1078467.0,
    "netCashPosition": 5000.0,
    "actualProfitMarginPct": 0.5,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-73",
    "projectCode": "C083",
    "projectNameAr": "مينا رؤوف C083 — Mina Raouf — Nasr City",
    "compoundName": "Nasr City",
    "clientNameAr": "مينا رؤوف C083",
    "zone": "Nasr City",
    "contractValue": 774314.0,
    "clientCollections": 774314.0,
    "actualExpenses": 756314.0,
    "netCashPosition": 18000.0,
    "actualProfitMarginPct": 2.3,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-74",
    "projectCode": "C098",
    "projectNameAr": "إيمان الجندي C098 — Eman El Gendy — Portcairo 5th C322",
    "compoundName": "Portcairo 5th C322",
    "clientNameAr": "إيمان الجندي C098",
    "zone": "Portcairo 5th C322",
    "contractValue": 1055000.0,
    "clientCollections": 1055000.0,
    "actualExpenses": 1016713.0,
    "netCashPosition": 38287.0,
    "actualProfitMarginPct": 3.6,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-75",
    "projectCode": "C034",
    "projectNameAr": "نيفين — مخزن السطح C034 — Nevein Roof's Warehouse (V06)",
    "compoundName": "Nevein Roof's Warehouse (V06)",
    "clientNameAr": "نيفين",
    "zone": "Nevein Roof's Warehouse (V06)",
    "contractValue": 374948.0,
    "clientCollections": 374948.0,
    "actualExpenses": 208896.0,
    "netCashPosition": 166052.0,
    "actualProfitMarginPct": 44.3,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-76",
    "projectCode": "C097",
    "projectNameAr": "كريستينا عزمي C097 — Christina Azmy — Tag Nasr City، DC002 — Christina Azmy — Tag Nasr City",
    "compoundName": "Tag Nasr City",
    "clientNameAr": "كريستينا عزمي C097",
    "zone": "Tag Nasr City",
    "contractValue": 214000.0,
    "clientCollections": 214000.0,
    "actualExpenses": 49677.0,
    "netCashPosition": 164323.0,
    "actualProfitMarginPct": 76.8,
    "supervisionFeePct": 15,
    "status": "handover"
  },
  {
    "id": "PRJ-77",
    "projectCode": "N014",
    "projectNameAr": "سوديك فيليت N014 — Sodic Villete Villa 325B",
    "compoundName": "Sodic Villete Villa 325B",
    "clientNameAr": "سوديك فيليت N014",
    "zone": "Sodic Villete Villa 325B",
    "contractValue": 1056476.0,
    "clientCollections": 1056476.0,
    "actualExpenses": 240738.0,
    "netCashPosition": 815738.0,
    "actualProfitMarginPct": 77.2,
    "supervisionFeePct": 15,
    "status": "handover"
  }
];

// E-Works Legacy ERP Migration Audit Records (`/eworks` & /eworks/review)
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
  const activeTab = activeSubTab;
  const setActiveTab = setActiveSubTab;

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

  // Reset to Exact Live Nexus Snapshot (738,284.19 EGP)
  const handleResetToLiveNexusSnapshot = () => {
    setAccounts(INITIAL_CASH_BANK_ACCOUNTS);
    setCreditCards(INITIAL_CREDIT_CARDS);
    setInstallmentPlans(INITIAL_INSTALLMENT_PLANS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setEworksRecords(INITIAL_EWORKS_AUDIT_RECORDS);
    showToast('تم استعادة الأرصدة اللحظية المعتمدة من نظام Nexus (738,284.19 EGP)');
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

  // Pay Monthly Credit Card Installment (سداد القسط الشهري للكارت)
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

    // 3. Deduct from CIB Corporate Account (ACC-02) and record in journal
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
    showToast('تم اعتماد تسوية قيد E-Works وتأكيد المطابقة النهائية في Nexus ✅');
  };

  return (
    <div className="space-y-6 text-[#192631] text-start">
      <GuidedStepBanner
        lifecycleStageNumber={6}
        moduleTitleEn="Executive Treasury, 7 Vaults, 9 Credit Cards & 77-Project Matrix"
        moduleTitleAr="الخزينة المركزية والبنوك الـ 7 والكروت الـ 9 وربحية الـ 77 مشروع"
        activeStepId={activeTab}
        onSelectStep={(id) => setActiveTab(id as any)}
        steps={[
          {
            id: 'vaults_banks',
            stepNum: 1,
            titleEn: 'Verify 7 Cash & Bank Vault Balances (254.8K EGP)',
            titleAr: 'مراجعة أرصدة الـ 7 خزن وحسابات بنكية',
            actionHintEn: 'Review opening balances, inflows, outflows, and record deposits, payments, or internal transfers across all 7 cash & bank vaults.',
            actionHintAr: 'راجع الأرصدة الافتتاحية والوارد والمنصرف وسجّل الإيداعات والمدفوعات والتحويلات الداخلية للـ 7 خزن وبنوك.',
          },
          {
            id: 'credit_cards',
            stepNum: 2,
            titleEn: 'Manage 9 Credit Cards & Monthly Installments',
            titleAr: 'إدارة الـ 9 كروت ائتمانية وجدول الأقساط',
            actionHintEn: 'Monitor available credit limits across 9 corporate cards (483.4K EGP unused) and settle monthly 0% material installment plans.',
            actionHintAr: 'تابع الحدود الائتمانية المتاحة للـ 9 كروت (483.4 ألف ج.م متاح) وسدّد الأقساط الشهرية لمشتريات الخامات.',
          },
          {
            id: 'projects_matrix',
            stepNum: 3,
            titleEn: 'Audit 77-Project Profitability & Net Cashflow',
            titleAr: 'مراجعة ربحية وتدفقات الـ 77 مشروع',
            actionHintEn: 'Inspect contract values, client collections, actual site expenses, net cash positions, and profit margins per project.',
            actionHintAr: 'افحص قيم التعاقد ومتحصلات العملاء والمصروفات الفعلية وصافي السيولة وهامش الربح لكل مشروع.',
          },
          {
            id: 'eworks_audit',
            stepNum: 4,
            titleEn: 'Verify Legacy E-Works ERP Migration Records',
            titleAr: 'مطابقة وترحيل سجلات نظام E-Works',
            actionHintEn: 'Reconcile legacy E-Works balances against migrated Nexus records and approve flagged variance adjustments.',
            actionHintAr: 'طابق أرصدة نظام E-Works السابق مع السجلات المرحّلة لنظام Nexus واعتمد تسوية الفروقات المعلّقة.',
          },
        ]}
      />
      {/* =====================================================================
          1. TOP EXECUTIVE LIQUIDITY BANNER (EXACT LIVE NEXUS NUMBERS)
         ===================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-[#123524]/25 bg-white/80 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[#192631]/10 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#123524]/10 px-3 py-1 text-xs font-bold text-[#123524] border border-[#123524]/25">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE Nexus TREASURY &amp; LIQUIDITY ENGINE
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
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#192631] font-mono">
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
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#192631] font-mono">
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
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#192631] font-mono">
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
          SUB-TAB 1: CASH VAULTS & BANK ACCOUNTS (أرصدة الخزن والبنوك والتحويلات)
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
                      <div className="mt-1 text-2xl font-black text-[#123524] font-mono">
                        {formatEGP(acc.currentBalance)}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-[#192631]/[0.05] p-2">
                        <div className="text-[#192631]/70">رصيد افتتاحي</div>
                        <div className="mt-0.5 font-mono font-semibold text-[#192631]">
                          {acc.openingBalance.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-950/40 border border-[#123524]/25 p-2">
                        <div className="text-[#123524] flex items-center justify-center gap-0.5">
                          <ArrowDownRight className="h-3 w-3" /> إجمالي الوارد
                        </div>
                        <div className="mt-0.5 font-mono font-semibold text-[#123524]">
                          {acc.totalInflows.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="rounded-lg bg-rose-950/40 border border-rose-500/20 p-2">
                        <div className="text-red-700 flex items-center justify-center gap-0.5">
                          <ArrowUpRight className="h-3 w-3" /> إجمالي المنصرف
                        </div>
                        <div className="mt-0.5 font-mono font-semibold text-red-700">
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
            <span className="text-xl font-black text-[#192631] font-mono">
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
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 text-xs text-[#192631]/70 bg-[#f5f5f5]/90">
                    <th className="py-3 px-3">رقم المرجع والتاريخ</th>
                    <th className="py-3 px-3">نوع الحركة</th>
                    <th className="py-3 px-3">الحساب البنكي / الخزينة</th>
                    <th className="py-3 px-3">المشروع</th>
                    <th className="py-3 px-3">الجهة / المستفيد والبيان</th>
                    <th className="py-3 px-3 text-start">المبلغ (EGP)</th>
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
                      <td className="py-3 px-3 text-start font-mono font-bold">
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
          SUB-TAB 2: CORPORATE CREDIT CARDS & INSTALLMENTS (حدود كروت الائتمان الـ 7 وجدول الأقساط الشهرية)
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
              <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2 text-start">
                <div className="text-[11px] text-[#b45309]">الرصيد المتاح بالكروت الـ 7</div>
                <div className="text-lg font-black text-[#192631] font-mono">
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
                          <p className="text-xs font-mono text-[#192631]/70 mt-0.5">
                            {card.cardNumberMasked}
                          </p>
                        </div>
                        <CreditCard className="h-6 w-6 text-[#b45309] shrink-0" />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white/80 backdrop-blur-md p-3 border border-[#192631]/10 text-xs">
                        <div>
                          <div className="text-[#192631]/70">الحد الكلي</div>
                          <div className="mt-0.5 font-mono font-bold text-[#192631]">
                            {card.totalLimit.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="text-red-700">المستخدم</div>
                          <div className="mt-0.5 font-mono font-bold text-red-700">
                            {card.usedAmount.toLocaleString('en-US')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#123524] font-bold">المتاح للصرف</div>
                          <div className="mt-0.5 font-mono font-black text-[#123524]">
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

          {/* Credit Card Installments Tracker (جدول أقساط المشتريات بالكروت) */}
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
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-xs text-[#192631]/70">
                    <th className="py-3 px-3">الكارت والبنك</th>
                    <th className="py-3 px-3">المورد / التاجر وبنود الخامات</th>
                    <th className="py-3 px-3">المشروع</th>
                    <th className="py-3 px-3 text-start">إجمالي العملية</th>
                    <th className="py-3 px-3 text-start">القسط الشهري</th>
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
                        <td className="py-3.5 px-3 text-start font-mono font-semibold text-[#192631]">
                          {formatEGP(plan.totalPurchaseAmount)}
                        </td>
                        <td className="py-3.5 px-3 text-start font-mono font-bold text-[#b45309]">
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
                <div className="mt-1 font-mono text-base font-black text-[#192631]">
                  {formatEGP(projectPortfolioTotals.contractValue)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-[#123524]/25 p-3">
                <div className="text-xs text-[#123524]">إجمالي المتحصلات من العملاء</div>
                <div className="mt-1 font-mono text-base font-black text-[#123524]">
                  {formatEGP(projectPortfolioTotals.clientCollections)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-rose-500/20 p-3">
                <div className="text-xs text-red-700">إجمالي المصروفات الفعلية والتوريدات</div>
                <div className="mt-1 font-mono text-base font-black text-red-700">
                  {formatEGP(projectPortfolioTotals.actualExpenses)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f5f5]/90 border border-[#e04b2a]/25 p-3">
                <div className="text-xs text-[#e04b2a]">صافي فائض السيولة والربحية التشغيلية</div>
                <div className="mt-1 font-mono text-base font-black text-[#e04b2a]">
                  {formatEGP(projectPortfolioTotals.netCashPosition)}
                </div>
              </div>
            </div>

            {/* 46 Projects Table */}
            <div className="mt-4 overflow-x-auto max-h-[560px] overflow-y-auto rounded-xl border border-[#192631]/10">
              <table className="w-full text-start text-sm">
                <thead className="sticky top-0 bg-[#f5f5f5]/90 text-xs text-[#192631]/70 border-b border-[#192631]/10 z-10">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">كود واسم المشروع</th>
                    <th className="py-3 px-3">العميل والمنطقة</th>
                    <th className="py-3 px-3 text-start">قيمة التعاقد</th>
                    <th className="py-3 px-3 text-start">إجمالي المتحصلات من العميل</th>
                    <th className="py-3 px-3 text-start">إجمالي المصروفات الفعلية</th>
                    <th className="py-3 px-3 text-start">صافي سيولة المشروع</th>
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
                      <td className="py-3 px-3 text-start font-mono text-xs text-[#192631]/85">
                        {formatEGP(proj.contractValue)}
                      </td>
                      <td className="py-3 px-3 text-start font-mono text-xs font-bold text-[#123524]">
                        {formatEGP(proj.clientCollections)}
                      </td>
                      <td className="py-3 px-3 text-start font-mono text-xs font-bold text-red-700">
                        {formatEGP(proj.actualExpenses)}
                      </td>
                      <td className="py-3 px-3 text-start font-mono text-xs font-black text-[#192631]">
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
          SUB-TAB 4: E-WORKS LEGACY ERP MIGRATION AUDIT (`/eworks` & /eworks/review)
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
                  مطابقة الأرصدة المرحّلة من نظام E-Works القديم (/eworks &amp; /eworks/review) مع القيود الفعلية في Nexus للمستخلصات، أرصدة العملاء، أوامر الشراء، وكشوف المقاولين
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
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-xs text-[#192631]/70">
                    <th className="py-3 px-3">مرجع E-Works / Nexus</th>
                    <th className="py-3 px-3">القسم والمشروع</th>
                    <th className="py-3 px-3">البيان والجهة</th>
                    <th className="py-3 px-3 text-start">رصيد E-Works القديم</th>
                    <th className="py-3 px-3 text-start">رصيد Nexus المرحّل</th>
                    <th className="py-3 px-3 text-start">الفروق (Variance)</th>
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
                      <td className="py-3.5 px-3 text-start font-mono text-xs text-[#192631]/85">
                        {formatEGP(rec.eworksLegacyBalance)}
                      </td>
                      <td className="py-3.5 px-3 text-start font-mono text-xs font-bold text-[#192631]">
                        {formatEGP(rec.nexusMigratedBalance)}
                      </td>
                      <td className="py-3.5 px-3 text-start font-mono text-xs font-bold">
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
