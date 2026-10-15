import React, { useState, useMemo } from 'react';
import {
  HardHat,
  Users,
  Award,
  FileCheck2,
  Wallet,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Phone,
  Wrench,
  Copy,
  Check,
  X,
  Star,
  ClipboardCheck,
  CreditCard,
  Receipt,
  Sparkles,
  Scale,
  Edit3,
  BadgeDollarSign,
} from 'lucide-react';
import clsx from 'clsx';

export type TradeSpecialtyCode =
  | 'ALL'
  | 'SUB-ALUM'
  | 'SUB-GYP'
  | 'SUB-TILE'
  | 'SUB-PLM'
  | 'SUB-ELC'
  | 'SUB-HVAC'
  | 'SUB-PNT'
  | 'SUB-MRB'
  | 'SUB-CRP'
  | 'SUB-STL'
  | 'SUB-PLS'
  | 'SUB-INS'
  | 'SUB-HEAT';

export type GradeTier = 'A' | 'B' | 'C';
export type WorkNatureType = 'مصنعيات فقط' | 'توريد وتركيب';

export interface SubcontractorRecord {
  id: string;
  nexusCode: string;
  tradeCode: Exclude<TradeSpecialtyCode, 'ALL'>;
  tradeLabelAr: string;
  name: string;
  craftsmanTitle: string;
  phone: string;
  workNature: WorkNatureType;
  assignedProjects: string[];
  ledgerAccountCount: number;
  activeBalanceEgp: number;
  retentionHeldEgp: number;
  pillars: {
    quality: GradeTier; // جودة التنفيذ والاستلام الهندسي
    pricing: GradeTier; // مناسبة الأسعار للسوق
    schedule: GradeTier; // الالتزام بالمواعيد والبرنامج الزمني
    ethics: GradeTier; // التعامل والأخلاقيات بالموقع
  };
  overallGrade: GradeTier;
  ceoNotes: string;
  lastEvaluatedBy: string;
  lastEvaluatedDate: string;
}

export interface SubcontractorStatementST {
  id: string;
  stCode: string; // e.g. C096-ST-0004_Subcontractor_No04
  projectCode: string;
  projectName: string;
  subcontractorCode: string;
  subcontractorName: string;
  tradeLabel: string;
  statementNumber: string;
  workDescription: string;
  unit: string;
  previousQty: number;
  currentQty: number;
  unitPrice: number;
  deductionsMaterialsEgp: number;
  previousPaymentsEgp: number;
  sirCode: string;
  sirApproved: boolean;
  siteEngineer: string;
  status: 'draft_sir_pending' | 'tech_office_verified' | 'ceo_approved' | 'disbursed_cpo';
  date: string;
}

export interface CashOrderOrReconciliation {
  id: string;
  docType: 'CPO' | 'RCB';
  officialCode: string; // e.g., C096-CPO-0018_SayedTile_2026-10-12 or C096-RCB-0009_EngPierre_2026-10-12
  projectCode: string;
  projectName: string;
  beneficiaryName: string;
  subcontractorOrEngineerCode: string;
  linkedStOrSirCode: string;
  amountEgp: number;
  paymentChannel: 'InstaPay' | 'خزينة نقدية (Cash)' | 'تحويل بنكي';
  accountingOfficer: string; // Merna Maged
  purposeAr: string;
  date: string;
  status: 'pending_merna' | 'executed_paid' | 'settled_ledger';
}

export const TRADE_SPECIALTIES: {
  code: TradeSpecialtyCode;
  labelAr: string;
  labelEn: string;
}[] = [
  { code: 'ALL', labelAr: 'الكل (All 13 Trades)', labelEn: 'All Trades' },
  { code: 'SUB-ALUM', labelAr: 'ألوميتال وزجاج SUB-ALUM', labelEn: 'Aluminum & Glass' },
  { code: 'SUB-GYP', labelAr: 'جبس بورد وأسقف SUB-GYP', labelEn: 'Gypsum Board & Ceilings' },
  { code: 'SUB-TILE', labelAr: 'سيراميك وبورسلين SUB-TILE', labelEn: 'Ceramics & Porcelain' },
  { code: 'SUB-PLM', labelAr: 'سباكة وصحي SUB-PLM', labelEn: 'Plumbing & Sanitary' },
  { code: 'SUB-ELC', labelAr: 'كهرباء وتيار خفيف SUB-ELC', labelEn: 'Electrical & Low Current' },
  { code: 'SUB-HVAC', labelAr: 'تكييف وتبريد SUB-HVAC', labelEn: 'HVAC & Cooling' },
  { code: 'SUB-PNT', labelAr: 'نقاشة ودهانات SUB-PNT', labelEn: 'Painting & Finishes' },
  { code: 'SUB-MRB', labelAr: 'رخام وجرانيت SUB-MRB', labelEn: 'Marble & Granite' },
  { code: 'SUB-CRP', labelAr: 'نجارة وأبواب SUB-CRP', labelEn: 'Carpentry & Doors' },
  { code: 'SUB-STL', labelAr: 'حدادة وكريتال SUB-STL', labelEn: 'Steel & Wrought Iron' },
  { code: 'SUB-PLS', labelAr: 'محارة ومباني SUB-PLS', labelEn: 'Plastering & Masonry' },
  { code: 'SUB-INS', labelAr: 'عزل مائي وحراري SUB-INS', labelEn: 'Water & Thermal Insulation' },
  { code: 'SUB-HEAT', labelAr: 'تدفئة مركزية SUB-HEAT', labelEn: 'Central Heating' },
];

const INITIAL_SUBCONTRACTORS: SubcontractorRecord[] = [
  {
    id: 'sub-01',
    nexusCode: 'SUB-TILE-001',
    tradeCode: 'SUB-TILE',
    tradeLabelAr: 'سيراميك وبورسلين SUB-TILE',
    name: 'الأسطى سيد عبد الواحد (Sayed Tile)',
    craftsmanTitle: 'مقاول تركيب بورسلين وسيراميك ألواح كبيرة',
    phone: '01004589211',
    workNature: 'مصنعيات فقط',
    assignedProjects: ['C096', 'C063', 'C091'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 42500,
    retentionHeldEgp: 11250,
    pillars: { quality: 'A', pricing: 'A', schedule: 'A', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'التزام ممتاز بليزر المنسوب واستلام هندسي من أول مرة في مشروع C096.',
    lastEvaluatedBy: 'م. أحمد (CEO) + م. بيير',
    lastEvaluatedDate: '2026-10-12',
  },
  {
    id: 'sub-02',
    nexusCode: 'SUB-ALUM-001',
    tradeCode: 'SUB-ALUM',
    tradeLabelAr: 'ألوميتال وزجاج SUB-ALUM',
    name: 'شركة الدلتا للألوميتال والواجهات (م. هاني فوزي)',
    craftsmanTitle: 'مقاول قطاعات PS وجامبو وشيش حصيرة',
    phone: '01223901455',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096', 'C088'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 118000,
    retentionHeldEgp: 24500,
    pillars: { quality: 'A', pricing: 'B', schedule: 'A', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'جودة قطاعات وإكسسوارات ممتازة، السعر أعلى قليلاً من السوق لكن مضمون.',
    lastEvaluatedBy: 'م. أحمد (CEO)',
    lastEvaluatedDate: '2026-10-10',
  },
  {
    id: 'sub-03',
    nexusCode: 'SUB-GYP-001',
    tradeCode: 'SUB-GYP',
    tradeLabelAr: 'جبس بورد وأسقف SUB-GYP',
    name: 'مقاول محمود الشافعي للأسقف المعلقة',
    craftsmanTitle: 'فني ومقاول جبس بورد كناوف وبيوت نور',
    phone: '01118742309',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096', 'C063', 'C077'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 36800,
    retentionHeldEgp: 8400,
    pillars: { quality: 'A', pricing: 'A', schedule: 'B', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'تقفيل زوايا الفريز ممتاز وشاسيهات 0.4 مم معتمدة.',
    lastEvaluatedBy: 'م. معتز (المكتب الفني)',
    lastEvaluatedDate: '2026-10-09',
  },
  {
    id: 'sub-04',
    nexusCode: 'SUB-PLM-001',
    tradeCode: 'SUB-PLM',
    tradeLabelAr: 'سباكة وصحي SUB-PLM',
    name: 'الأسطى كرم أبو العلا للصحي والعزل',
    craftsmanTitle: 'مقاول تأسيس وتشطيب سباكة وصناديق دفن Grohe',
    phone: '01093321876',
    workNature: 'مصنعيات فقط',
    assignedProjects: ['C096', 'C091'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 29400,
    retentionHeldEgp: 6900,
    pillars: { quality: 'A', pricing: 'A', schedule: 'A', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'اختبار كبس المواسير على 15 بار بدون أي ملاحظات بمحضر استلام رسمي.',
    lastEvaluatedBy: 'م. بيير (مهندس الموقع)',
    lastEvaluatedDate: '2026-10-11',
  },
  {
    id: 'sub-05',
    nexusCode: 'SUB-ELC-001',
    tradeCode: 'SUB-ELC',
    tradeLabelAr: 'كهرباء وتيار خفيف SUB-ELC',
    name: 'م. طارق النجار للمقاولات الكهربائية والسمارت',
    craftsmanTitle: 'مقاول كهرباء ولوحات توزيع وتيار خفيف KNX',
    phone: '01065412980',
    workNature: 'مصنعيات فقط',
    assignedProjects: ['C096', 'C063', 'C088'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 54000,
    retentionHeldEgp: 14200,
    pillars: { quality: 'A', pricing: 'B', schedule: 'A', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'تنظيم اللوحات والترقيم (Labeling) مطابق لأعلى معايير Actpert.',
    lastEvaluatedBy: 'م. أحمد (CEO)',
    lastEvaluatedDate: '2026-10-08',
  },
  {
    id: 'sub-06',
    nexusCode: 'SUB-HVAC-001',
    tradeCode: 'SUB-HVAC',
    tradeLabelAr: 'تكييف وتبريد SUB-HVAC',
    name: 'المتحدة لأنظمة التكييف الكونسيلد والـ VRF',
    craftsmanTitle: 'مقاول دكتات صاج وتأسيس مواسير نحاس',
    phone: '01287654321',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096', 'C091'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 95000,
    retentionHeldEgp: 19500,
    pillars: { quality: 'A', pricing: 'B', schedule: 'B', ethics: 'A' },
    overallGrade: 'B',
    ceoNotes: 'جودة العزل ومجاري الهواء ممتازة، يحتاج متابعة مبكرة في الجدول الزمني.',
    lastEvaluatedBy: 'م. معتز (المكتب الفني)',
    lastEvaluatedDate: '2026-10-06',
  },
  {
    id: 'sub-07',
    nexusCode: 'SUB-PNT-001',
    tradeCode: 'SUB-PNT',
    tradeLabelAr: 'نقاشة ودهانات SUB-PNT',
    name: 'الأسطى رجب المنياوي للدهانات والديكور',
    craftsmanTitle: 'مقاول نقاشة وجوتن فينوماستيك والقطيفة',
    phone: '01145678902',
    workNature: 'مصنعيات فقط',
    assignedProjects: ['C063', 'C096'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 31200,
    retentionHeldEgp: 7800,
    pillars: { quality: 'A', pricing: 'A', schedule: 'B', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'استلام حوائط على الكشاف المائل ممتاز ونظافة الموقع عالية.',
    lastEvaluatedBy: 'م. بيير (مهندس الموقع)',
    lastEvaluatedDate: '2026-10-07',
  },
  {
    id: 'sub-08',
    nexusCode: 'SUB-MRB-001',
    tradeCode: 'SUB-MRB',
    tradeLabelAr: 'رخام وجرانيت SUB-MRB',
    name: 'الحاج فرج شق الثعبان للرخام المستورد',
    craftsmanTitle: 'مقاول توريد وتركيب رخام إمبرادور وكرارة ودرج',
    phone: '01009988776',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096', 'C088'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 142000,
    retentionHeldEgp: 28000,
    pillars: { quality: 'A', pricing: 'B', schedule: 'B', ethics: 'B' },
    overallGrade: 'B',
    ceoNotes: 'الرخام فرز أول ممتاز ولكن يلزم مطابقة عينات التوريد قبل القطع بالورشة.',
    lastEvaluatedBy: 'م. أحمد (CEO)',
    lastEvaluatedDate: '2026-10-04',
  },
  {
    id: 'sub-09',
    nexusCode: 'SUB-CRP-001',
    tradeCode: 'SUB-CRP',
    tradeLabelAr: 'نجارة وأبواب SUB-CRP',
    name: 'ورشة المهندس للأبواب المصفحة والأخشاب الطبيعية',
    craftsmanTitle: 'مقاول أبواب قشرة جوز تركي وتجاليد حوائط',
    phone: '01271122334',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C063', 'C091'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 67500,
    retentionHeldEgp: 13500,
    pillars: { quality: 'A', pricing: 'B', schedule: 'C', ethics: 'A' },
    overallGrade: 'B',
    ceoNotes: 'دهان الأستر والتركيب ممتاز، يوجد تأخير 4 أيام في توريد الحلوق.',
    lastEvaluatedBy: 'م. معتز (المكتب الفني)',
    lastEvaluatedDate: '2026-10-02',
  },
  {
    id: 'sub-10',
    nexusCode: 'SUB-STL-001',
    tradeCode: 'SUB-STL',
    tradeLabelAr: 'حدادة وكريتال SUB-STL',
    name: 'الأسطى عادل الحديدي للكريتال والليزر CNC',
    craftsmanTitle: 'مقاول درابزينات وشاسيهات حديد ومظلات',
    phone: '01122334455',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096', 'C077'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 41000,
    retentionHeldEgp: 6200,
    pillars: { quality: 'B', pricing: 'A', schedule: 'B', ethics: 'B' },
    overallGrade: 'B',
    ceoNotes: 'اللحامات جيدة وتحتاج صنفرة وبرايمر إيبوكسي قبل التوريد للموقع.',
    lastEvaluatedBy: 'م. بيير (مهندس الموقع)',
    lastEvaluatedDate: '2026-09-29',
  },
  {
    id: 'sub-11',
    nexusCode: 'SUB-PLS-001',
    tradeCode: 'SUB-PLS',
    tradeLabelAr: 'محارة ومباني SUB-PLS',
    name: 'المعلم صابر الصعيدي للمباني والمحارة بؤج وأوتار',
    craftsmanTitle: 'مقاول تعديلات معمارية ومحارة تربيع وزوايا',
    phone: '01011223399',
    workNature: 'مصنعيات فقط',
    assignedProjects: ['C096', 'C063', 'C091'],
    ledgerAccountCount: 2,
    activeBalanceEgp: 38900,
    retentionHeldEgp: 9100,
    pillars: { quality: 'A', pricing: 'A', schedule: 'A', ethics: 'B' },
    overallGrade: 'A',
    ceoNotes: 'تربيع الغرف واستلام البؤج والأوتار بالزاوية الليزر دقيق جداً.',
    lastEvaluatedBy: 'م. بيير (مهندس الموقع)',
    lastEvaluatedDate: '2026-10-05',
  },
  {
    id: 'sub-12',
    nexusCode: 'SUB-INS-001',
    tradeCode: 'SUB-INS',
    tradeLabelAr: 'عزل مائي وحراري SUB-INS',
    name: 'شركة سيكا برو للعزل الكيميائي والممبرين',
    craftsmanTitle: 'مقاول عزل حمامات وأسطح وحمامات سباحة Sika 107',
    phone: '01055667788',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096', 'C088'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 27500,
    retentionHeldEgp: 5500,
    pillars: { quality: 'A', pricing: 'A', schedule: 'A', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'شهادة ضمان 10 سنوات واختبار غمر مياه 48 ساعة ناجح 100%.',
    lastEvaluatedBy: 'م. أحمد (CEO)',
    lastEvaluatedDate: '2026-10-11',
  },
  {
    id: 'sub-13',
    nexusCode: 'SUB-HEAT-001',
    tradeCode: 'SUB-HEAT',
    tradeLabelAr: 'تدفئة مركزية SUB-HEAT',
    name: 'أكوا هيت للتدفئة المركزية وتحت البلاط (Underfloor)',
    craftsmanTitle: 'مقاول شبكات تدفئة أرضية وغلايات ودفايات حائطية',
    phone: '01200334455',
    workNature: 'توريد وتركيب',
    assignedProjects: ['C096'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 64000,
    retentionHeldEgp: 12800,
    pillars: { quality: 'A', pricing: 'B', schedule: 'A', ethics: 'A' },
    overallGrade: 'A',
    ceoNotes: 'تنفيذ شبكة التدفئة الأرضية قبل البورسلين مع اختبار ضغط مستمر.',
    lastEvaluatedBy: 'م. أحمد (CEO)',
    lastEvaluatedDate: '2026-10-03',
  },
  {
    id: 'sub-14',
    nexusCode: 'SUB-TILE-002',
    tradeCode: 'SUB-TILE',
    tradeLabelAr: 'سيراميك وبورسلين SUB-TILE',
    name: 'الأسطى جمعة عبد السلام للسيراميك',
    craftsmanTitle: 'مقاول تركيب سيراميك حوائط وأرضيات',
    phone: '01198765432',
    workNature: 'مصنعيات فقط',
    assignedProjects: ['C077'],
    ledgerAccountCount: 1,
    activeBalanceEgp: 14200,
    retentionHeldEgp: 4800,
    pillars: { quality: 'C', pricing: 'A', schedule: 'C', ethics: 'B' },
    overallGrade: 'C',
    ceoNotes: 'تحت الملاحظة: تم خصم هالك 4 كراتين سيراميك بسبب عدم ضبط الغلايق قبل اللصق.',
    lastEvaluatedBy: 'م. معتز (المكتب الفني)',
    lastEvaluatedDate: '2026-10-01',
  },
];

const INITIAL_STATEMENTS_ST: SubcontractorStatementST[] = [
  {
    id: 'st-004',
    stCode: 'C096-ST-0004_Subcontractor_No04',
    projectCode: 'C096',
    projectName: 'فيلا التجمع الخامس - C096',
    subcontractorCode: 'SUB-TILE-001',
    subcontractorName: 'الأسطى سيد عبد الواحد (Sayed Tile)',
    tradeLabel: 'سيراميك وبورسلين SUB-TILE',
    statementNumber: 'مستخلص رقم (04) جاري',
    workDescription: 'تركيب بورسلين 120×60 للريسبشن والطرقة + وزرات مشطوفة بمادة لصق C2TE',
    unit: 'م2',
    previousQty: 140,
    currentQty: 85,
    unitPrice: 260,
    deductionsMaterialsEgp: 1850, // خصم صليبات وميزان كلبيش محمل على المقاول
    previousPaymentsEgp: 33500,
    sirCode: 'C096-SIR-0029_PorcelainReception_2026-10-11',
    sirApproved: true,
    siteEngineer: 'م. بيير (Eng. Pierre)',
    status: 'ceo_approved',
    date: '2026-10-12',
  },
  {
    id: 'st-005',
    stCode: 'C096-ST-0005_Subcontractor_No02',
    projectCode: 'C096',
    projectName: 'فيلا التجمع الخامس - C096',
    subcontractorCode: 'SUB-GYP-001',
    subcontractorName: 'مقاول محمود الشافعي للأسقف المعلقة',
    tradeLabel: 'جبس بورد وأسقف SUB-GYP',
    statementNumber: 'مستخلص رقم (02) جاري',
    workDescription: 'توريد وتركيب أسقف جبس بورد أخضر وأبيض شاسيهات 0.4 مم للدور الأول + بيوت نور مخفي',
    unit: 'م2',
    previousQty: 95,
    currentQty: 65,
    unitPrice: 480,
    deductionsMaterialsEgp: 0,
    previousPaymentsEgp: 41000,
    sirCode: 'C096-SIR-0031_GypsumFirstFloor_2026-10-13',
    sirApproved: true,
    siteEngineer: 'م. بيير (Eng. Pierre)',
    status: 'tech_office_verified',
    date: '2026-10-13',
  },
  {
    id: 'st-006',
    stCode: 'C063-ST-0003_Subcontractor_No03',
    projectCode: 'C063',
    projectName: 'شقة الشيخ زايد - C063',
    subcontractorCode: 'SUB-ELC-001',
    subcontractorName: 'م. طارق النجار للمقاولات الكهربائية والسمارت',
    tradeLabel: 'كهرباء وتيار خفيف SUB-ELC',
    statementNumber: 'مستخلص رقم (03) سحب أسلاك ولوحات',
    workDescription: 'سحب أسلاك السويدي وتقفيل لوحة القواطع الرئيسية ABB واختبار الدوائر',
    unit: 'نقطة',
    previousQty: 180,
    currentQty: 90,
    unitPrice: 195,
    deductionsMaterialsEgp: 1200, // خصم هالك بواطات
    previousPaymentsEgp: 31500,
    sirCode: 'C063-SIR-0018_ElecWiring_2026-10-14',
    sirApproved: false,
    siteEngineer: 'م. معتز (Eng. Moataz)',
    status: 'draft_sir_pending',
    date: '2026-10-14',
  },
];

const INITIAL_CASH_ORDERS: CashOrderOrReconciliation[] = [
  {
    id: 'cpo-018',
    docType: 'CPO',
    officialCode: 'C096-CPO-0018_SayedTile_2026-10-12',
    projectCode: 'C096',
    projectName: 'فيلا التجمع الخامس - C096',
    beneficiaryName: 'الأسطى سيد عبد الواحد (Sayed Tile)',
    subcontractorOrEngineerCode: 'SUB-TILE-001',
    linkedStOrSirCode: 'C096-ST-0004_Subcontractor_No04',
    amountEgp: 20237.5,
    paymentChannel: 'InstaPay',
    accountingOfficer: 'أ. ميرنا ماجد (Merna Maged - Accounting)',
    purposeAr: 'صرف صافي المستحق عن مستخلص رقم 04 لأعمال بورسلين الريسبشن بعد خصم 5% تأمين أعمال',
    date: '2026-10-12',
    status: 'executed_paid',
  },
  {
    id: 'rcb-009',
    docType: 'RCB',
    officialCode: 'C096-RCB-0009_EngPierre_2026-10-12',
    projectCode: 'C096',
    projectName: 'فيلا التجمع الخامس - C096',
    beneficiaryName: 'م. بيير (Eng. Pierre - Site Engineer)',
    subcontractorOrEngineerCode: 'ENG-PIERRE-01',
    linkedStOrSirCode: 'C096-SIR-0029_PorcelainReception_2026-10-11',
    amountEgp: 6850,
    paymentChannel: 'InstaPay',
    accountingOfficer: 'أ. ميرنا ماجد (Merna Maged - Accounting)',
    purposeAr: 'تسوية عهدة موقع رقم 09 (مشالات، تشوين بورسلين، إكراميات، ومهمات سريعة بالموقع)',
    date: '2026-10-12',
    status: 'settled_ledger',
  },
  {
    id: 'cpo-019',
    docType: 'CPO',
    officialCode: 'C096-CPO-0019_MahmoudGypsum_2026-10-13',
    projectCode: 'C096',
    projectName: 'فيلا التجمع الخامس - C096',
    beneficiaryName: 'مقاول محمود الشافعي للأسقف المعلقة',
    subcontractorOrEngineerCode: 'SUB-GYP-001',
    linkedStOrSirCode: 'C096-ST-0005_Subcontractor_No02',
    amountEgp: 32060,
    paymentChannel: 'تحويل بنكي',
    accountingOfficer: 'أ. ميرنا ماجد (Merna Maged - Accounting)',
    purposeAr: 'أمر دفع نقدي عن مستخلص جبس بورد رقم 02 بعد مراجعة المكتب الفني (م. معتز)',
    date: '2026-10-13',
    status: 'pending_merna',
  },
];

function computeOverallGrade(pillars: SubcontractorRecord['pillars']): GradeTier {
  const scoreMap: Record<GradeTier, number> = { A: 3, B: 2, C: 1 };
  const avg =
    (scoreMap[pillars.quality] +
      scoreMap[pillars.pricing] +
      scoreMap[pillars.schedule] +
      scoreMap[pillars.ethics]) /
    4;
  if (avg >= 2.6) return 'A';
  if (avg >= 1.85) return 'B';
  return 'C';
}

function getGradeBadgeClasses(grade: GradeTier) {
  if (grade === 'A') {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
  if (grade === 'B') {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
}

export const SubcontractorsDirectoryHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'statements' | 'cpo_rcb'>('directory');

  // Directory State & Filters
  const [subcontractors, setSubcontractors] = useState<SubcontractorRecord[]>(INITIAL_SUBCONTRACTORS);
  const [selectedTrade, setSelectedTrade] = useState<TradeSpecialtyCode>('ALL');
  const [selectedWorkNature, setSelectedWorkNature] = useState<'الكل' | WorkNatureType>('الكل');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | GradeTier>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Sub-Tab 1
  const [evaluatingSub, setEvaluatingSub] = useState<SubcontractorRecord | null>(null);
  const [evalQuality, setEvalQuality] = useState<GradeTier>('A');
  const [evalPricing, setEvalPricing] = useState<GradeTier>('A');
  const [evalSchedule, setEvalSchedule] = useState<GradeTier>('A');
  const [evalEthics, setEvalEthics] = useState<GradeTier>('A');
  const [evalNotes, setEvalNotes] = useState('');
  const [evalReviewer, setEvalReviewer] = useState('م. أحمد (CEO) + م. معتز (المكتب الفني)');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newSubTrade, setNewSubTrade] = useState<Exclude<TradeSpecialtyCode, 'ALL'>>('SUB-TILE');
  const [newSubName, setNewSubName] = useState('');
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubNature, setNewSubNature] = useState<WorkNatureType>('مصنعيات فقط');
  const [newSubProjects, setNewSubProjects] = useState('C096, C063');
  const [newSubNotes, setNewSubNotes] = useState('');

  // Sub-Tab 2: Statements (ST)
  const [statements, setStatements] = useState<SubcontractorStatementST[]>(INITIAL_STATEMENTS_ST);
  const [showCreateStModal, setShowCreateStModal] = useState(false);
  const [stProjectCode, setStProjectCode] = useState('C096');
  const [stSubCode, setStSubCode] = useState('SUB-TILE-001');
  const [stNumber, setStNumber] = useState('مستخلص رقم (05) جاري');
  const [stWorkDesc, setStWorkDesc] = useState('');
  const [stUnit, setStUnit] = useState('م2');
  const [stPrevQty, setStPrevQty] = useState(100);
  const [stCurrQty, setStCurrQty] = useState(45);
  const [stUnitPrice, setStUnitPrice] = useState(260);
  const [stDeductions, setStDeductions] = useState(500);
  const [stPrevPayments, setStPrevPayments] = useState(24700);
  const [stSirCode, setStSirCode] = useState('C096-SIR-0034_SiteInspection_2026-10-15');
  const [stSirApproved, setStSirApproved] = useState(true);

  // Sub-Tab 3: CPO & RCB Generator
  const [cashOrders, setCashOrders] = useState<CashOrderOrReconciliation[]>(INITIAL_CASH_ORDERS);
  const [genDocType, setGenDocType] = useState<'CPO' | 'RCB'>('CPO');
  const [genProjectCode, setGenProjectCode] = useState('C096');
  const [genSeqNumber, setGenSeqNumber] = useState('0020');
  const [genShortTag, setGenShortTag] = useState('SayedTile');
  const [genBeneficiary, setGenBeneficiary] = useState('الأسطى سيد عبد الواحد (Sayed Tile)');
  const [genSubOrEngCode, setGenSubOrEngCode] = useState('SUB-TILE-001');
  const [genLinkedDoc, setGenLinkedDoc] = useState('C096-ST-0004_Subcontractor_No04');
  const [genAmount, setGenAmount] = useState(18500);
  const [genChannel, setGenChannel] = useState<'InstaPay' | 'خزينة نقدية (Cash)' | 'تحويل بنكي'>('InstaPay');
  const [genPurpose, setGenPurpose] = useState(
    'دفعة مستخلص أعمال سيراميك وبورسلين بعد اعتماد الاستلام الهندسي SIR والمكتب الفني'
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const flashNotification = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4500);
  };

  // Filtered Subcontractors
  const filteredSubcontractors = useMemo(() => {
    return subcontractors.filter((sub) => {
      if (selectedTrade !== 'ALL' && sub.tradeCode !== selectedTrade) return false;
      if (selectedWorkNature !== 'الكل' && sub.workNature !== selectedWorkNature) return false;
      if (selectedGrade !== 'ALL' && sub.overallGrade !== selectedGrade) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = sub.name.toLowerCase().includes(q);
        const matchCode = sub.nexusCode.toLowerCase().includes(q);
        const matchPhone = sub.phone.includes(q);
        const matchProj = sub.assignedProjects.some((p) => p.toLowerCase().includes(q));
        if (!matchName && !matchCode && !matchPhone && !matchProj) return false;
      }
      return true;
    });
  }, [subcontractors, selectedTrade, selectedWorkNature, selectedGrade, searchQuery]);

  // KPI Metrics (Reflecting Live Actpert Nexus 56 Subcontractors & 63 Contractor Ledger Accounts)
  const kpiStats = useMemo(() => {
    const baseRegisteredCount = 56 + (subcontractors.length - INITIAL_SUBCONTRACTORS.length);
    const baseLedgerAccounts = 63 + (subcontractors.length - INITIAL_SUBCONTRACTORS.length);
    const gradeACount = subcontractors.filter((s) => s.overallGrade === 'A').length;
    const totalRetentionEgp = subcontractors.reduce((acc, s) => acc + s.retentionHeldEgp, 0);
    return {
      registeredCount: baseRegisteredCount,
      ledgerAccountsCount: baseLedgerAccounts,
      gradeACount,
      totalRetentionEgp,
    };
  }, [subcontractors]);

  // Open Evaluation Modal
  const handleOpenEvaluation = (sub: SubcontractorRecord) => {
    setEvaluatingSub(sub);
    setEvalQuality(sub.pillars.quality);
    setEvalPricing(sub.pillars.pricing);
    setEvalSchedule(sub.pillars.schedule);
    setEvalEthics(sub.pillars.ethics);
    setEvalNotes(sub.ceoNotes);
  };

  // Save Evaluation Modal
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingSub) return;
    const updatedPillars = {
      quality: evalQuality,
      pricing: evalPricing,
      schedule: evalSchedule,
      ethics: evalEthics,
    };
    const newOverall = computeOverallGrade(updatedPillars);
    const today = new Date().toISOString().split('T')[0];

    setSubcontractors((prev) =>
      prev.map((s) =>
        s.id === evaluatingSub.id
          ? {
              ...s,
              pillars: updatedPillars,
              overallGrade: newOverall,
              ceoNotes: evalNotes,
              lastEvaluatedBy: evalReviewer,
              lastEvaluatedDate: today,
            }
          : s
      )
    );
    setEvaluatingSub(null);
    flashNotification(
      `تم تحديث تقييم المقاول ${evaluatingSub.name} (${evaluatingSub.nexusCode}) إلى التصنيف العام Grade ${newOverall}`
    );
  };

  // Register New Subcontractor
  const handleRegisterSubcontractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const tradeInfo = TRADE_SPECIALTIES.find((t) => t.code === newSubTrade);
    const existingInTrade = subcontractors.filter((s) => s.tradeCode === newSubTrade).length;
    const nextCode = `${newSubTrade}-${String(existingInTrade + 1).padStart(3, '0')}`;
    const newRecord: SubcontractorRecord = {
      id: `sub-${Date.now()}`,
      nexusCode: nextCode,
      tradeCode: newSubTrade,
      tradeLabelAr: tradeInfo?.labelAr || newSubTrade,
      name: newSubName.trim(),
      craftsmanTitle: newSubTitle.trim() || 'مقاول باطن متخصص',
      phone: newSubPhone.trim() || '01000000000',
      workNature: newSubNature,
      assignedProjects: newSubProjects
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      ledgerAccountCount: 1,
      activeBalanceEgp: 0,
      retentionHeldEgp: 0,
      pillars: { quality: 'A', pricing: 'A', schedule: 'A', ethics: 'A' },
      overallGrade: 'A',
      ceoNotes: newSubNotes.trim() || 'تم التسجيل والاعتماد المبدئي في دليل مقاولي الباطن Actpert Nexus.',
      lastEvaluatedBy: 'م. أحمد (CEO)',
      lastEvaluatedDate: new Date().toISOString().split('T')[0],
    };
    setSubcontractors((prev) => [newRecord, ...prev]);
    setShowRegisterModal(false);
    setNewSubName('');
    setNewSubTitle('');
    setNewSubPhone('');
    setNewSubNotes('');
    flashNotification(`تم تسجيل مقاول الباطن الجديد بكود رسمي ${nextCode} وفتح حساب أستاذ مقاولين له.`);
  };

  // Calculate ST Statement Financials
  const calculateStatementMetrics = (st: {
    previousQty: number;
    currentQty: number;
    unitPrice: number;
    deductionsMaterialsEgp: number;
    previousPaymentsEgp: number;
  }) => {
    const totalCumulativeQty = st.previousQty + st.currentQty;
    const grossWorkValue = totalCumulativeQty * st.unitPrice;
    const currentPeriodGross = st.currentQty * st.unitPrice;
    const retention5Percent = grossWorkValue * 0.05; // 5% تأمين أعمال
    const netPayable = Math.max(
      0,
      grossWorkValue - retention5Percent - st.deductionsMaterialsEgp - st.previousPaymentsEgp
    );
    return {
      totalCumulativeQty,
      grossWorkValue,
      currentPeriodGross,
      retention5Percent,
      netPayable,
    };
  };

  // Toggle SIR Inspection approval for ST
  const handleToggleSirApproval = (stId: string) => {
    setStatements((prev) =>
      prev.map((st) => {
        if (st.id !== stId) return st;
        const nextSir = !st.sirApproved;
        return {
          ...st,
          sirApproved: nextSir,
          status: nextSir && st.status === 'draft_sir_pending' ? 'tech_office_verified' : st.status,
        };
      })
    );
    flashNotification('تم تحديث حالة محضر الاستلام الهندسي للموقع (SIR) المرتبط بالمستخلص.');
  };

  // Approve ST & Generate CPO automatically
  const handleApproveStatementAndEmitCpo = (st: SubcontractorStatementST) => {
    if (!st.sirApproved) {
      flashNotification('تنبيه هندسي: لا يمكن اعتماد المستخلص للصرف قبل اعتماد محضر الاستلام الهندسي (SIR Approved)!');
      return;
    }
    const metrics = calculateStatementMetrics(st);
    const today = new Date().toISOString().split('T')[0];
    const nextCpoNum = String(cashOrders.filter((c) => c.docType === 'CPO').length + 18).padStart(4, '0');
    const cleanSubTag = st.subcontractorCode.replace('SUB-', '');
    const cpoCode = `${st.projectCode}-CPO-${nextCpoNum}_${cleanSubTag}_${today}`;

    setStatements((prev) =>
      prev.map((item) => (item.id === st.id ? { ...item, status: 'disbursed_cpo' } : item))
    );

    const newCpo: CashOrderOrReconciliation = {
      id: `cpo-${Date.now()}`,
      docType: 'CPO',
      officialCode: cpoCode,
      projectCode: st.projectCode,
      projectName: st.projectName,
      beneficiaryName: st.subcontractorName,
      subcontractorOrEngineerCode: st.subcontractorCode,
      linkedStOrSirCode: st.stCode,
      amountEgp: metrics.netPayable,
      paymentChannel: 'InstaPay',
      accountingOfficer: 'أ. ميرنا ماجد (Merna Maged - Accounting)',
      purposeAr: `صرف صافي ${st.statementNumber} (${st.workDescription}) بعد استقطاع 5% تأمين أعمال (${metrics.retention5Percent.toLocaleString()} ج.م)`,
      date: today,
      status: 'pending_merna',
    };

    setCashOrders((prev) => [newCpo, ...prev]);
    flashNotification(`تم اعتماد المستخلص ${st.stCode} وإصدار أمر دفع نقدي ${cpoCode} إلى أ. ميرنا ماجد (الحسابات).`);
  };

  // Create New ST Statement
  const handleCreateStatement = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subcontractors.find((s) => s.nexusCode === stSubCode) || subcontractors[0];
    const nextIdx = String(statements.length + 4).padStart(4, '0');
    const stCode = `${stProjectCode}-ST-${nextIdx}_Subcontractor_No0${statements.length + 2}`;
    const newSt: SubcontractorStatementST = {
      id: `st-${Date.now()}`,
      stCode,
      projectCode: stProjectCode,
      projectName: `مشروع ${stProjectCode}`,
      subcontractorCode: sub.nexusCode,
      subcontractorName: sub.name,
      tradeLabel: sub.tradeLabelAr,
      statementNumber: stNumber,
      workDescription: stWorkDesc.trim() || 'أعمال تنفيذية بالموقع طبقا للمقايسة والرسومات التنفيذية',
      unit: stUnit,
      previousQty: Number(stPrevQty),
      currentQty: Number(stCurrQty),
      unitPrice: Number(stUnitPrice),
      deductionsMaterialsEgp: Number(stDeductions),
      previousPaymentsEgp: Number(stPrevPayments),
      sirCode: stSirCode,
      sirApproved: stSirApproved,
      siteEngineer: 'م. بيير (Eng. Pierre)',
      status: stSirApproved ? 'tech_office_verified' : 'draft_sir_pending',
      date: new Date().toISOString().split('T')[0],
    };
    setStatements((prev) => [newSt, ...prev]);
    setShowCreateStModal(false);
    setStWorkDesc('');
    flashNotification(`تم إنشاء مستخلص مقاول باطن جديد بكود قياسي: ${stCode}`);
  };

  // Standardized CPO / RCB Code Preview
  const generatedStandardCode = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const cleanTag = genShortTag.replace(/[^a-zA-Z0-9_-]/g, '') || 'Contractor';
    return `${genProjectCode}-${genDocType}-${genSeqNumber}_${cleanTag}_${today}`;
  }, [genProjectCode, genDocType, genSeqNumber, genShortTag]);

  const handleEmitCashOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const newOrder: CashOrderOrReconciliation = {
      id: `ord-${Date.now()}`,
      docType: genDocType,
      officialCode: generatedStandardCode,
      projectCode: genProjectCode,
      projectName: `مشروع ${genProjectCode}`,
      beneficiaryName: genBeneficiary,
      subcontractorOrEngineerCode: genSubOrEngCode,
      linkedStOrSirCode: genLinkedDoc,
      amountEgp: Number(genAmount),
      paymentChannel: genChannel,
      accountingOfficer: 'أ. ميرنا ماجد (Merna Maged - Accounting)',
      purposeAr: genPurpose,
      date: today,
      status: 'pending_merna',
    };
    setCashOrders((prev) => [newOrder, ...prev]);
    const nextNum = String(Number(genSeqNumber) + 1).padStart(4, '0');
    setGenSeqNumber(nextNum);
    flashNotification(`تم إصدار الكود الرسمي ${generatedStandardCode} وإرساله إلى أ. ميرنا ماجد للتنفيذ المالي.`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right">
      {/* Top Status Banner */}
      {statusBanner && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-emerald-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Live ERP Sync Badge */}
      <div className="bg-gradient-to-l from-[#171717] via-[#141414] to-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-[11px] font-black tracking-wide mb-2">
              <HardHat className="w-3.5 h-3.5" />
              <span>ACTPERT NEXUS LIVE · /subcontractors & /contractor-accounts</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white">
              دليل مقاولي الباطن والصنايعية وتقييم الإدارة{' '}
              <span className="text-orange-400">(56 Subcontractors & ST/CPO Hub)</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              منظومة إدارة ومراقبة مقاولي الباطن والصنايعية (13 تخصص هندسي)، مصفوفة تقييم الإدارة الرباعية{' '}
              <span className="text-slate-200 font-bold">(A / B / C)</span>، مستخلصات المقاولين{' '}
              <span className="font-mono text-orange-300">(ST)</span> مع استقطاع 5% تأمين أعمال، وأوامر الدفع النقدي{' '}
              <span className="font-mono text-emerald-300">(CPO)</span> وتسويات العهد{' '}
              <span className="font-mono text-sky-300">(RCB)</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ تسجيل مقاول باطن / صنايعي جديد</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('statements');
                setShowCreateStModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-orange-400" />
              <span>+ مستخلص مقاول (ST)</span>
            </button>
          </div>
        </div>

        {/* 1. Top KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400">إجمالي المسجلين بالدليل الرسمي</p>
              <p className="text-2xl font-black text-white mt-1">
                {kpiStats.registeredCount}{' '}
                <span className="text-xs font-bold text-orange-400">مقاول باطن وصنايعي مسجل</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">موزعين على 13 تخصص تشطيبات و MEP</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400">حسابات الأستاذ النشطة للمقاولين</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {kpiStats.ledgerAccountsCount}{' '}
                <span className="text-xs font-bold text-emerald-300">حساب مقاول باطن</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">مربوطة بمراكز تكلفة المشاريع (C096, C063, C091)</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400">نخبة التصنيف الأول (CEO Grade A)</p>
              <p className="text-2xl font-black text-sky-400 mt-1">
                {kpiStats.gradeACount} / {subcontractors.length}{' '}
                <span className="text-xs font-bold text-sky-300">Grade A - ممتاز</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">تقييم رباعي: الجودة · السعر · المواعيد · التعامل</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400">إجمالي تأمين الأعمال المحتجز (5%)</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {kpiStats.totalRetentionEgp.toLocaleString()}{' '}
                <span className="text-xs font-bold text-amber-300">ج.م (Retention)</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">يُرد بعد الاستلام النهائي وفترة الضمان</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#141414] p-1.5 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={clsx(
            'flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all',
            activeSubTab === 'directory'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <HardHat className="w-4 h-4" />
          <span>1. سجل مقاولي الباطن وتقييم الإدارة A/B/C (56 مقاول)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('statements')}
          className={clsx(
            'flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all',
            activeSubTab === 'statements'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>2. مستخلصات مقاولي الباطن (كود ST & تأمين 5%)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cpo_rcb')}
          className={clsx(
            'flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all',
            activeSubTab === 'cpo_rcb'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span>3. أوامر الدفع النقدي (CPO) وتسويات العهد (RCB)</span>
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB 1: 56 SUBCONTRACTORS DIRECTORY & CEO 4-PILLAR EVALUATION MATRIX
         ===================================================================== */}
      {activeSubTab === 'directory' && (
        <div className="space-y-5">
          {/* Trade Specialty Chips + Work Nature + Overall Grade Filters */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المقاول، الكود (SUB-TILE-001)، رقم الهاتف، أو كود المشروع (C096)..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter by Work Nature */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] text-slate-400 font-bold">طبيعة العمل:</span>
                  <select
                    value={selectedWorkNature}
                    onChange={(e) => setSelectedWorkNature(e.target.value as 'الكل' | WorkNatureType)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="الكل" className="bg-[#141414]">
                      الكل (Labor & Supply)
                    </option>
                    <option value="مصنعيات فقط" className="bg-[#141414]">
                      مصنعيات فقط (Labor Only)
                    </option>
                    <option value="توريد وتركيب" className="bg-[#141414]">
                      توريد وتركيب (Supply & Install)
                    </option>
                  </select>
                </div>

                {/* Filter by Overall Grade */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-slate-400 font-bold">التقييم العام:</span>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as 'ALL' | GradeTier)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="ALL" className="bg-[#141414]">
                      كل الفئات (A / B / C)
                    </option>
                    <option value="A" className="bg-[#141414]">
                      Grade A - ممتاز
                    </option>
                    <option value="B" className="bg-[#141414]">
                      Grade B - جيد جداً
                    </option>
                    <option value="C" className="bg-[#141414]">
                      Grade C - مقبول / تحت الملاحظة
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* 13 Trade Specialties Horizontal Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {TRADE_SPECIALTIES.map((trade) => {
                const isActive = selectedTrade === trade.code;
                return (
                  <button
                    key={trade.code}
                    onClick={() => setSelectedTrade(trade.code)}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all',
                      isActive
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    )}
                  >
                    {trade.labelAr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Pillar Evaluation Matrix Legend */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                1
              </span>
              <div>
                <p className="text-xs font-black text-white">جودة التنفيذ والاستلام الهندسي</p>
                <p className="text-[11px] text-slate-400">Quality of Execution & SIR Pass Rate</p>
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-xs">
                2
              </span>
              <div>
                <p className="text-xs font-black text-white">مناسبة الأسعار للسوق</p>
                <p className="text-[11px] text-slate-400">Price Competitiveness vs BOQ Target</p>
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                3
              </span>
              <div>
                <p className="text-xs font-black text-white">الالتزام بالمواعيد والبرنامج الزمني</p>
                <p className="text-[11px] text-slate-400">Schedule Commitment & Manpower</p>
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-xs">
                4
              </span>
              <div>
                <p className="text-xs font-black text-white">التعامل والأخلاقيات بالموقع</p>
                <p className="text-[11px] text-slate-400">Site Dealing, Safety & Material Care</p>
              </div>
            </div>
          </div>

          {/* Subcontractors Matrix Table */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-black/60 border-b border-white/10 text-slate-400 font-black">
                    <th className="py-3.5 px-4">كود Nexus والتخصص</th>
                    <th className="py-3.5 px-4">اسم المقاول / الصنايعي</th>
                    <th className="py-3.5 px-4">طبيعة العمل</th>
                    <th className="py-3.5 px-4">المشاريع المسندة</th>
                    <th className="py-3.5 px-3 text-center">1. جودة التنفيذ</th>
                    <th className="py-3.5 px-3 text-center">2. مناسبة الأسعار</th>
                    <th className="py-3.5 px-3 text-center">3. الالتزام بالمواعيد</th>
                    <th className="py-3.5 px-3 text-center">4. التعامل بالموقع</th>
                    <th className="py-3.5 px-4 text-center">التصنيف العام</th>
                    <th className="py-3.5 px-4">الرصيد وتأمين 5%</th>
                    <th className="py-3.5 px-4 text-left">تقييم الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubcontractors.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg inline-block">
                          {sub.nexusCode}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">{sub.tradeLabelAr}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-black text-white text-sm">{sub.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sub.craftsmanTitle}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{sub.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={clsx(
                            'px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block',
                            sub.workNature === 'مصنعيات فقط'
                              ? 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/25'
                          )}
                        >
                          {sub.workNature}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.assignedProjects.map((proj) => (
                            <span
                              key={proj}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200 font-mono text-[11px] font-bold"
                            >
                              {proj}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {sub.ledgerAccountCount} حساب أستاذ مفتوح
                        </p>
                      </td>

                      {/* 4 CEO Pillars */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'w-7 h-7 rounded-lg font-black text-xs inline-flex items-center justify-center border',
                            getGradeBadgeClasses(sub.pillars.quality)
                          )}
                        >
                          {sub.pillars.quality}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'w-7 h-7 rounded-lg font-black text-xs inline-flex items-center justify-center border',
                            getGradeBadgeClasses(sub.pillars.pricing)
                          )}
                        >
                          {sub.pillars.pricing}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'w-7 h-7 rounded-lg font-black text-xs inline-flex items-center justify-center border',
                            getGradeBadgeClasses(sub.pillars.schedule)
                          )}
                        >
                          {sub.pillars.schedule}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={clsx(
                            'w-7 h-7 rounded-lg font-black text-xs inline-flex items-center justify-center border',
                            getGradeBadgeClasses(sub.pillars.ethics)
                          )}
                        >
                          {sub.pillars.ethics}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div
                          className={clsx(
                            'px-3 py-1 rounded-xl font-black text-xs inline-flex items-center gap-1 border',
                            getGradeBadgeClasses(sub.overallGrade)
                          )}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Grade {sub.overallGrade}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] truncate" title={sub.ceoNotes}>
                          {sub.ceoNotes}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">
                          {sub.activeBalanceEgp.toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span>
                        </p>
                        <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          تأمين 5%: {sub.retentionHeldEgp.toLocaleString()} ج.م
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-left">
                        <button
                          onClick={() => handleOpenEvaluation(sub)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 text-slate-200 hover:text-orange-300 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تحديث التقييم A/B/C</span>
                        </button>
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
          SUB-TAB 2: SUBCONTRACTOR STATEMENTS (مستخلصات مقاولي الباطن - كود ST)
         ===================================================================== */}
      {activeSubTab === 'statements' && (
        <div className="space-y-5">
          {/* ST Formula & SIR Gate Explanation Banner */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-black">
                <Scale className="w-4 h-4" />
                <span>معادلة المستخلص القياسية (Actpert ST Engine) + بوابة الاستلام الهندسي (SIR Gate)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                صافي المستحق للصرف = إجمالي قيمة الأعمال المنفذة (السابقة + الحالية) −{' '}
                <span className="text-amber-400 font-bold">5% تأمين أعمال (Workmanship Retention)</span> −{' '}
                <span className="text-rose-400 font-bold">خصومات خامات محملة على المقاول أو تلفيات</span> − الدفعات
                السابقة. يشترط اعتماد <span className="font-mono text-emerald-400">SIR</span> من مهندس الموقع قبل الصرف.
              </p>
            </div>
            <button
              onClick={() => setShowCreateStModal(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black flex items-center gap-2 shrink-0 shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ تحرير مستخلص مقاول باطن جديد (ST)</span>
            </button>
          </div>

          {/* Statements Cards */}
          <div className="space-y-4">
            {statements.map((st) => {
              const calc = calculateStatementMetrics(st);
              return (
                <div
                  key={st.id}
                  className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300">
                          {st.stCode}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-200">
                          {st.projectName}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 text-xs font-bold text-sky-300">
                          {st.statementNumber}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mt-2">
                        {st.subcontractorName}{' '}
                        <span className="text-xs font-mono text-slate-400">({st.subcontractorCode})</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{st.workDescription}</p>
                    </div>

                    {/* SIR Inspection Gate Badge */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => handleToggleSirApproval(st.id)}
                        className={clsx(
                          'px-3.5 py-2 rounded-xl text-xs font-black border flex items-center gap-2 transition-all',
                          st.sirApproved
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
                        )}
                      >
                        {st.sirApproved ? (
                          <>
                            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                            <span>SIR معتمد هندسياً ({st.sirCode})</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>بانتظار استلام مهندس الموقع (اضغط لاعتماد SIR)</span>
                          </>
                        )}
                      </button>

                      {st.status !== 'disbursed_cpo' ? (
                        <button
                          onClick={() => handleApproveStatementAndEmitCpo(st)}
                          className={clsx(
                            'px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all',
                            st.sirApproved
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                          )}
                        >
                          <BadgeDollarSign className="w-4 h-4" />
                          <span>اعتماد المستخلص وإصدار أمر دفع (CPO)</span>
                        </button>
                      ) : (
                        <span className="px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم إصدار أمر الدفع CPO للحسابات</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detailed Quantities & Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 text-xs">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold">الكمية السابقة</p>
                      <p className="text-sm font-black text-white mt-1">
                        {st.previousQty} <span className="text-[10px] text-slate-400">{st.unit}</span>
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold">الكمية الحالية المنفذة</p>
                      <p className="text-sm font-black text-orange-400 mt-1">
                        +{st.currentQty} <span className="text-[10px] text-slate-400">{st.unit}</span>
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold">إجمالي الكمية والفئة</p>
                      <p className="text-sm font-black text-white mt-1">
                        {calc.totalCumulativeQty} {st.unit} × {st.unitPrice} ج.م
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold">إجمالي قيمة الأعمال</p>
                      <p className="text-sm font-black text-white mt-1">
                        {calc.grossWorkValue.toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
                      <p className="text-[10px] text-amber-300 font-bold">تأمين أعمال 5% (Retention)</p>
                      <p className="text-sm font-black text-amber-400 mt-1">
                        −{calc.retention5Percent.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3">
                      <p className="text-[10px] text-rose-300 font-bold">خصومات خامات / تلفيات</p>
                      <p className="text-sm font-black text-rose-400 mt-1">
                        −{st.deductionsMaterialsEgp.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold">الدفعات السابقة المصروفة</p>
                      <p className="text-sm font-black text-slate-300 mt-1">
                        −{st.previousPaymentsEgp.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-xl p-3">
                      <p className="text-[10px] text-emerald-300 font-black">صافي المستحق للصرف</p>
                      <p className="text-base font-black text-emerald-400 mt-1">
                        {calc.netPayable.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: CASH PAYMENT ORDERS (CPO) & PETTY CASH RECONCILIATIONS (RCB)
         ===================================================================== */}
      {activeSubTab === 'cpo_rcb' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* One-Click Standardized CPO / RCB Generator */}
          <div className="xl:col-span-5 bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[11px] font-black text-orange-400 uppercase tracking-wider">
                  STANDARDIZED CODING SHEET ENGINE
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  إصدار كود أمر دفع نقدي (CPO) أو تسوية عهدة (RCB)
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>

            <form onSubmit={handleEmitCashOrder} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">نوع المستند المالي</label>
                  <select
                    value={genDocType}
                    onChange={(e) => {
                      const val = e.target.value as 'CPO' | 'RCB';
                      setGenDocType(val);
                      if (val === 'RCB') {
                        setGenShortTag('EngPierre');
                        setGenBeneficiary('م. بيير (Eng. Pierre - Site Engineer)');
                        setGenSubOrEngCode('ENG-PIERRE-01');
                        setGenPurpose('تسوية عهدة مهندس الموقع (مشتريات سريعة ومشالات وتشوينات)');
                      } else {
                        setGenShortTag('SayedTile');
                        setGenBeneficiary('الأسطى سيد عبد الواحد (Sayed Tile)');
                        setGenSubOrEngCode('SUB-TILE-001');
                        setGenPurpose('أمر دفع نقدي عن مستخلص أعمال معتمد بعد خصم 5% تأمين أعمال');
                      }
                    }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="CPO">CPO - أمر دفع نقدي لمقاول باطن</option>
                    <option value="RCB">RCB - تسوية عهدة مهندس موقع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">كود المشروع</label>
                  <select
                    value={genProjectCode}
                    onChange={(e) => setGenProjectCode(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="C096">C096 - فيلا التجمع الخامس</option>
                    <option value="C063">C063 - شقة الشيخ زايد</option>
                    <option value="C091">C091 - مشروع نيو كايرو</option>
                    <option value="C088">C088 - وحدة المعادي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">الرقم التسلسلي (Seq)</label>
                  <input
                    type="text"
                    value={genSeqNumber}
                    onChange={(e) => setGenSeqNumber(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">الاسم المختصر بالكود (Tag)</label>
                  <input
                    type="text"
                    value={genShortTag}
                    onChange={(e) => setGenShortTag(e.target.value)}
                    placeholder="SayedTile أو EngPierre"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">اسم المستفيد (مقاول باطن / مهندس عهدة)</label>
                <input
                  type="text"
                  value={genBeneficiary}
                  onChange={(e) => setGenBeneficiary(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">المبلغ الصافي (ج.م)</label>
                  <input
                    type="number"
                    value={genAmount}
                    onChange={(e) => setGenAmount(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-emerald-400 font-black"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">وسيلة الصرف (أ. ميرنا ماجد)</label>
                  <select
                    value={genChannel}
                    onChange={(e) =>
                      setGenChannel(e.target.value as 'InstaPay' | 'خزينة نقدية (Cash)' | 'تحويل بنكي')
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="InstaPay">InstaPay (انستا باي فوري)</option>
                    <option value="خزينة نقدية (Cash)">خزينة نقدية (Cash)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">المستخلص أو محضر الاستلام المرتبط (ST / SIR)</label>
                <input
                  type="text"
                  value={genLinkedDoc}
                  onChange={(e) => setGenLinkedDoc(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-orange-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">البيان المحاسبي والغرض من الصرف</label>
                <textarea
                  rows={2}
                  value={genPurpose}
                  onChange={(e) => setGenPurpose(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Live Generated Code Box */}
              <div className="bg-black/60 border border-orange-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">الكود القياسي المولد تلقائياً (شيت التكويد):</p>
                  <p className="font-mono text-xs font-black text-orange-400 mt-0.5">{generatedStandardCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(generatedStandardCode)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedCode === generatedStandardCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>إصدار وإرسال إلى أ. ميرنا ماجد (قسم الحسابات) للصرف</span>
              </button>
            </form>
          </div>

          {/* CPO & RCB Ledger List */}
          <div className="xl:col-span-7 bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">
                  سجل أوامر الدفع النقدي (CPO) وتسويات العهد (RCB)
                </h3>
                <p className="text-xs text-slate-400">
                  مربوط مباشرة بدفتر أستاذ مقاولي الباطن (63 حساب) ومراجعة أ. ميرنا ماجد (الحسابات)
                </p>
              </div>
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-3">
              {cashOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-md font-mono text-[11px] font-black border',
                          ord.docType === 'CPO'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        )}
                      >
                        {ord.docType}
                      </span>
                      <span className="font-mono text-xs font-black text-white">{ord.officialCode}</span>
                      <button
                        onClick={() => handleCopyCode(ord.officialCode)}
                        className="text-slate-400 hover:text-orange-400 transition-colors"
                        title="نسخ الكود الرسمي"
                      >
                        {copiedCode === ord.officialCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs font-bold text-slate-200">
                      المستفيد: {ord.beneficiaryName}{' '}
                      <span className="font-mono text-[11px] text-orange-400">
                        ({ord.subcontractorOrEngineerCode})
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">{ord.purposeAr}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>
                        المستند المرجعي: <strong className="font-mono text-slate-200">{ord.linkedStOrSirCode}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        المسؤول المالي: <strong className="text-emerald-300">{ord.accountingOfficer}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        القناة: <strong className="text-orange-300">{ord.paymentChannel}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                    <div className="text-left">
                      <p className="text-lg font-black text-emerald-400">
                        {ord.amountEgp.toLocaleString()} <span className="text-xs">ج.م</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">{ord.date}</p>
                    </div>

                    {ord.status === 'pending_merna' ? (
                      <button
                        onClick={() => {
                          setCashOrders((prev) =>
                            prev.map((c) => (c.id === ord.id ? { ...c, status: 'executed_paid' } : c))
                          );
                          flashNotification(`تم تأكيد صرف ${ord.officialCode} بواسطة أ. ميرنا ماجد عبر ${ord.paymentChannel}.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تأكيد الصرف (أ. ميرنا)</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم الصرف والترحيل للأستاذ</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CEO / TECHNICAL OFFICE 4-PILLAR A/B/C EVALUATION MODAL
         ===================================================================== */}
      {evaluatingSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[11px] font-mono font-black text-orange-400">
                  {evaluatingSub.nexusCode} · CEO 4-PILLAR MATRIX
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  تقييم الإدارة والمكتب الفني: {evaluatingSub.name}
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingSub(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    1. جودة التنفيذ والاستلام الهندسي
                  </label>
                  <select
                    value={evalQuality}
                    onChange={(e) => setEvalQuality(e.target.value as GradeTier)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="A">A - ممتاز (استلام من أول مرة)</option>
                    <option value="B">B - جيد جداً (ملاحظات طفيفة)</option>
                    <option value="C">C - مقبول / تحت الملاحظة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">2. مناسبة الأسعار للسوق</label>
                  <select
                    value={evalPricing}
                    onChange={(e) => setEvalPricing(e.target.value as GradeTier)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="A">A - منافس جداً ومطابق للموازنة</option>
                    <option value="B">B - مناسب لسعر السوق</option>
                    <option value="C">C - مرتفع عن الموازنة المستهدفة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    3. الالتزام بالمواعيد والبرنامج الزمني
                  </label>
                  <select
                    value={evalSchedule}
                    onChange={(e) => setEvalSchedule(e.target.value as GradeTier)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="A">A - التزام كامل وعمالة كافية</option>
                    <option value="B">B - التزام متوسط</option>
                    <option value="C">C - تأخيرات متكررة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    4. التعامل والأخلاقيات بالموقع
                  </label>
                  <select
                    value={evalEthics}
                    onChange={(e) => setEvalEthics(e.target.value as GradeTier)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="A">A - تعاون ممتاز وحفاظ على الخامات</option>
                    <option value="B">B - جيد</option>
                    <option value="C">C - يحتاج توجيه ومراقبة هالك</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">جهة التقييم المعتمدة</label>
                <input
                  type="text"
                  value={evalReviewer}
                  onChange={(e) => setEvalReviewer(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  ملاحظات الإدارة التنفيذية والمكتب الفني
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingSub(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black"
                >
                  حفظ واعتماد التقييم الرباعي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: REGISTER NEW SUBCONTRACTOR MODAL
         ===================================================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white">تسجيل مقاول باطن / صنايعي جديد بالدليل</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubcontractor} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التخصص الهندسي (كود البادئة)</label>
                  <select
                    value={newSubTrade}
                    onChange={(e) => setNewSubTrade(e.target.value as Exclude<TradeSpecialtyCode, 'ALL'>)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {TRADE_SPECIALTIES.filter((t) => t.code !== 'ALL').map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">طبيعة العمل</label>
                  <select
                    value={newSubNature}
                    onChange={(e) => setNewSubNature(e.target.value as WorkNatureType)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="مصنعيات فقط">مصنعيات فقط (Labor Only)</option>
                    <option value="توريد وتركيب">توريد وتركيب (Supply & Install)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المقاول / الصنايعي أو الورشة</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="مثال: الأسطى حسن عبد الرحمن للرخام..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الوصف الفني الدقيق</label>
                  <input
                    type="text"
                    value={newSubTitle}
                    onChange={(e) => setNewSubTitle(e.target.value)}
                    placeholder="تركيب أرضيات وحوائط..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الموبايل / InstaPay</label>
                  <input
                    type="text"
                    value={newSubPhone}
                    onChange={(e) => setNewSubPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">أكواد المشاريع المسندة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={newSubProjects}
                  onChange={(e) => setNewSubProjects(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ملاحظات هندسية مبدئية</label>
                <textarea
                  rows={2}
                  value={newSubNotes}
                  onChange={(e) => setNewSubNotes(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black"
                >
                  تسجيل وتوليد كود SUB الرسمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: CREATE NEW SUBCONTRACTOR STATEMENT (ST) MODAL
         ===================================================================== */}
      {showCreateStModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white">تحرير مستخلص مقاول باطن جديد (كود ST)</h3>
              <button
                onClick={() => setShowCreateStModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStatement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود المشروع</label>
                  <select
                    value={stProjectCode}
                    onChange={(e) => setStProjectCode(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="C096">C096 - فيلا التجمع الخامس</option>
                    <option value="C063">C063 - شقة الشيخ زايد</option>
                    <option value="C091">C091 - مشروع نيو كايرو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المقاول المسجل</label>
                  <select
                    value={stSubCode}
                    onChange={(e) => setStSubCode(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {subcontractors.map((s) => (
                      <option key={s.id} value={s.nexusCode}>
                        {s.nexusCode} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم المستخلص</label>
                  <input
                    type="text"
                    value={stNumber}
                    onChange={(e) => setStNumber(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود محضر الاستلام الهندسي (SIR)</label>
                  <input
                    type="text"
                    value={stSirCode}
                    onChange={(e) => setStSirCode(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-emerald-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">بيان الأعمال المنفذة بالمستخلص</label>
                <input
                  type="text"
                  required
                  value={stWorkDesc}
                  onChange={(e) => setStWorkDesc(e.target.value)}
                  placeholder="مثال: تركيب بورسلين أرضيات مقاس 60×120..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={stUnit}
                    onChange={(e) => setStUnit(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">كمية سابقة</label>
                  <input
                    type="number"
                    value={stPrevQty}
                    onChange={(e) => setStPrevQty(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">كمية حالية</label>
                  <input
                    type="number"
                    value={stCurrQty}
                    onChange={(e) => setStCurrQty(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-orange-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">فئة الوحدة (ج.م)</label>
                  <input
                    type="number"
                    value={stUnitPrice}
                    onChange={(e) => setStUnitPrice(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">خصومات خامات / هالك على المقاول (ج.م)</label>
                  <input
                    type="number"
                    value={stDeductions}
                    onChange={(e) => setStDeductions(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-rose-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">الدفعات السابقة المصروفة (ج.م)</label>
                  <input
                    type="number"
                    value={stPrevPayments}
                    onChange={(e) => setStPrevPayments(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stSirApproved}
                  onChange={(e) => setStSirApproved(e.target.checked)}
                  className="rounded border-white/20 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-emerald-300 font-bold">
                  محضر الاستلام الهندسي (SIR) موقع ومعتمد من مهندس الموقع (م. بيير / م. معتز)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateStModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black"
                >
                  حفظ المستخلص وحساب الصافي (خصم 5% تأمين)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorsDirectoryHub;
