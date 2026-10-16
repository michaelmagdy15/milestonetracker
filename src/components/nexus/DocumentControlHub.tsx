import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  Plus,
  Search,
  Copy,
  Check,
  FolderGit2,
  BookOpen,
  Mail,
  FileCode2,
  Upload,
  ShieldCheck,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  History,
  Paperclip,
} from 'lucide-react';
import { GuidedStepBanner } from './GuidedStepBanner';

// ============================================================================
// TYPES & STANDALONE ENTERPRISE DATA (RACE-CONDITION IMMUNE)
// ============================================================================

export type LogTypeCode = 'MS' | 'DR' | 'MIR' | 'SL' | 'SIR';
export type DisciplineKey = 'ARCH' | 'CIVIL' | 'ELEC' | 'MECH';
export type DisciplineShortCode = 'AR' | 'CV' | 'EL' | 'MC';
export type SubmittalStatusCode = 'A' | 'B' | 'C' | 'D' | 'Under Review' | 'To Submit';

export interface SubmittalClause {
  id: number;
  discipline: DisciplineKey;
  disciplineShort: DisciplineShortCode;
  code: string;
  nameEn: string;
  nameAr: string;
  typicalLogTypes: LogTypeCode[];
  boqRefExample: string;
}

export interface SubmittalRecord {
  id: string;
  code: string; // e.g. MSARGP01
  revision: string; // e.g. Rev 00
  projectCode: string; // e.g. C096
  projectName: string; // e.g. Azad New Cairo
  logType: LogTypeCode;
  discipline: DisciplineKey;
  disciplineShort: DisciplineShortCode;
  clauseCode: string;
  clauseNameEn: string;
  clauseNameAr: string;
  titleEn: string;
  titleAr: string;
  manufacturerOrSub: string;
  status: SubmittalStatusCode;
  submittedDate: string;
  responseDate?: string;
  consultantName: string;
  consultantEmail: string;
  attachments: { name: string; type: 'pdf' | 'dwg' | 'xlsx'; size: string }[];
  notes: string;
  procurementUnlocked: boolean;
}

export interface TransmittalEmailRecord {
  id: string;
  transmittalNo: string;
  projectCode: string;
  projectName: string;
  recipientName: string;
  recipientEmail: string;
  ccEmails: string;
  subject: string;
  submittalCodes: string[];
  sentAt: string;
  folderPath: string;
  language: 'Bilingual' | 'English' | 'Arabic';
  bodyPreview: string;
}

export interface FileCodingRule {
  categoryCode: string;
  folderPrefix: string;
  nameEn: string;
  nameAr: string;
  pattern: string;
  example: string;
  subtypes: { code: string; labelEn: string; labelAr: string }[];
}

export const NEXUS_PROJECTS = [
  {
    code: 'C096',
    name: 'C096 - Azad New Cairo',
    nameAr: 'مشروع أزاد التجمع الخامس',
    consultant: 'ECG Engineering Consultants Group',
    consultantEmail: 'dc.azad@ecg-consultants.com',
    ownerRepEmail: 'pm.azad@tameer-dev.com',
  },
  {
    code: 'C063',
    name: 'C063 - Madinaty Commercial Hub',
    nameAr: 'مشروع مدينتي الإداري التجاري',
    consultant: 'Dar Al-Handasah Consultants',
    consultantEmail: 'submittals.madinaty@dar.com',
    ownerRepEmail: 'tech.office@tmg-holding.com',
  },
  {
    code: 'C091',
    name: 'C091 - Mountain View iCity',
    nameAr: 'مشروع ماونتن فيو آي سيتي',
    consultant: 'EHAF Consulting Engineers',
    consultantEmail: 'doc.control@ehaf-mv.com',
    ownerRepEmail: 'engineering@dmg-mountainview.com',
  },
  {
    code: 'MC014',
    name: 'MC014 - Headquarters Fit-Out',
    nameAr: 'عقد إدارة تشطيبات المقر الرئيسي',
    consultant: 'ACE Moharram Bakhoum',
    consultantEmail: 'reviews@ace-consultants.com',
    ownerRepEmail: 'owner.rep@client-hq.com',
  },
];

export const LOG_TYPES: {
  code: LogTypeCode;
  nameEn: string;
  nameAr: string;
  badgeColor: string;
  desc: string;
}[] = [
  {
    code: 'MS',
    nameEn: 'Material Submittal',
    nameAr: 'اعتماد خامات وعينات',
    badgeColor: 'bg-[#e04b2a]/10 text-[#e04b2a] border-[#e04b2a]/25',
    desc: 'Technical datasheets, samples & compliance statement before PO',
  },
  {
    code: 'DR',
    nameEn: 'Shop Drawing',
    nameAr: 'رسومات تشغيلية (شوب دروينج)',
    badgeColor: 'bg-sky-500/15 text-[#192631] border-sky-500/30',
    desc: 'Detailed AutoCAD .dwg & .pdf coordination drawings',
  },
  {
    code: 'MIR',
    nameEn: 'Material Inspection Request',
    nameAr: 'طلب فحص واستلام تشوينات (MIR)',
    badgeColor: 'bg-[#123524]/10 text-[#123524] border-[#123524]/25',
    desc: 'On-site delivery inspection matching approved MS & delivery note',
  },
  {
    code: 'SL',
    nameEn: 'Supplier / Vendor List',
    nameAr: 'اعتماد قائمة موردين / مصنعين',
    badgeColor: 'bg-purple-500/15 text-[#192631] border-purple-500/30',
    desc: 'Prequalification & vendor approval dossier',
  },
  {
    code: 'SIR',
    nameEn: 'Site Inspection Request',
    nameAr: 'طلب استلام أعمال بالموقع (SIR/WIR)',
    badgeColor: 'bg-amber-500/15 text-[#b45309] border-amber-500/30',
    desc: 'Consultant inspection of executed site works for IPC',
  },
];

export const DISCIPLINES: {
  key: DisciplineKey;
  short: DisciplineShortCode;
  nameEn: string;
  nameAr: string;
  clauseCount: number;
  color: string;
}[] = [
  {
    key: 'ARCH',
    short: 'AR',
    nameEn: 'Architectural & Finishes',
    nameAr: 'معماري وتشطيبات',
    clauseCount: 28,
    color: 'text-[#e04b2a] bg-[#e04b2a]/10 border-[#e04b2a]/25',
  },
  {
    key: 'CIVIL',
    short: 'CV',
    nameEn: 'Civil & Structural',
    nameAr: 'مدني وإنشائي',
    clauseCount: 8,
    color: 'text-[#b45309] bg-amber-500/10 border-amber-500/30',
  },
  {
    key: 'ELEC',
    short: 'EL',
    nameEn: 'Electrical & Light Current',
    nameAr: 'كهرباء وتيار خفيف',
    clauseCount: 7,
    color: 'text-[#192631] bg-sky-500/10 border-sky-500/30',
  },
  {
    key: 'MECH',
    short: 'MC',
    nameEn: 'Mechanical (HVAC, Plumb, Fire)',
    nameAr: 'ميكانيكا (تكييف، صحي، حريق)',
    clauseCount: 8,
    color: 'text-[#123524] bg-[#123524]/10 border-[#123524]/25',
  },
];

// All 51 Standard Submittal Clauses (28 ARCH + 8 CIVIL + 7 ELEC + 8 MECH = 51)
export const FIFTY_ONE_CLAUSES: SubmittalClause[] = [
  // ARCH (28 Clauses)
  { id: 1, discipline: 'ARCH', disciplineShort: 'AR', code: 'MS', nameEn: 'Masonry & Blockwork', nameAr: 'أعمال المباني والطوب', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-01' },
  { id: 2, discipline: 'ARCH', disciplineShort: 'AR', code: 'PL', nameEn: 'Plastering & Rendering', nameAr: 'أعمال المحارة والبياض', typicalLogTypes: ['MS', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-02' },
  { id: 3, discipline: 'ARCH', disciplineShort: 'AR', code: 'WP', nameEn: 'Waterproofing & Thermal Insulation', nameAr: 'العزل المائي والحراري', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-03' },
  { id: 4, discipline: 'ARCH', disciplineShort: 'AR', code: 'TL', nameEn: 'Ceramic & Porcelain Tiles', nameAr: 'سيراميك وبورسلين', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-04' },
  { id: 5, discipline: 'ARCH', disciplineShort: 'AR', code: 'MR', nameEn: 'Marble & Granite Works', nameAr: 'الرخام والجرانيت', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-05' },
  { id: 6, discipline: 'ARCH', disciplineShort: 'AR', code: 'GP', nameEn: 'Gypsum Board & False Ceilings', nameAr: 'جبس بورد وأسقف معلقة', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-06' },
  { id: 7, discipline: 'ARCH', disciplineShort: 'AR', code: 'PT', nameEn: 'Paints & Decorative Coatings', nameAr: 'الدهانات الداخلية والخارجية', typicalLogTypes: ['MS', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-07' },
  { id: 8, discipline: 'ARCH', disciplineShort: 'AR', code: 'WD', nameEn: 'Wooden Doors & Joinery', nameAr: 'الأبواب الخشبية والنجارة', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-08' },
  { id: 9, discipline: 'ARCH', disciplineShort: 'AR', code: 'MT', nameEn: 'Hollow Metal & Fire-Rated Doors', nameAr: 'الأبواب المعدنية وأبواب الطوارئ', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-09' },
  { id: 10, discipline: 'ARCH', disciplineShort: 'AR', code: 'AL', nameEn: 'Aluminum Windows & Curtain Walls', nameAr: 'قطاعات الألومنيوم والواجهات الزجاجية', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-10' },
  { id: 11, discipline: 'ARCH', disciplineShort: 'AR', code: 'GL', nameEn: 'Architectural Glazing & Mirrors', nameAr: 'الأعمال الزجاجية والمرايا', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-11' },
  { id: 12, discipline: 'ARCH', disciplineShort: 'AR', code: 'HW', nameEn: 'Door Hardware & Ironmongery', nameAr: 'إكسسوارات وكوالين الأبواب', typicalLogTypes: ['MS', 'MIR', 'SL'], boqRefExample: 'BOQ-AR-12' },
  { id: 13, discipline: 'ARCH', disciplineShort: 'AR', code: 'RF', nameEn: 'Raised Flooring Systems', nameAr: 'الأرضيات المرفوعة (Raised Floor)', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-13' },
  { id: 14, discipline: 'ARCH', disciplineShort: 'AR', code: 'PK', nameEn: 'HDF & Wooden Parquet Flooring', nameAr: 'أرضيات باركيه و HDF', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-14' },
  { id: 15, discipline: 'ARCH', disciplineShort: 'AR', code: 'EP', nameEn: 'Epoxy & Polyurethane Flooring', nameAr: 'أرضيات الإيبوكسي والصناعية', typicalLogTypes: ['MS', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-15' },
  { id: 16, discipline: 'ARCH', disciplineShort: 'AR', code: 'CL', nameEn: 'Interior & Exterior Wall Cladding', nameAr: 'التجاليد الداخلية والخارجية', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-16' },
  { id: 17, discipline: 'ARCH', disciplineShort: 'AR', code: 'GR', nameEn: 'GRC / GRP Facade Panels', nameAr: 'وحدات واجهات GRC و GRP', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-17' },
  { id: 18, discipline: 'ARCH', disciplineShort: 'AR', code: 'HR', nameEn: 'Stainless & Glass Handrails', nameAr: 'الهاندريل والدرابزين', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-18' },
  { id: 19, discipline: 'ARCH', disciplineShort: 'AR', code: 'SN', nameEn: 'Signage & Wayfinding Graphics', nameAr: 'اللوحات الإرشادية واللافتات', typicalLogTypes: ['MS', 'DR', 'MIR'], boqRefExample: 'BOQ-AR-19' },
  { id: 20, discipline: 'ARCH', disciplineShort: 'AR', code: 'AC', nameEn: 'Acoustic Panels & Baffles', nameAr: 'العوازل والتجاليد الصوتية', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-20' },
  { id: 21, discipline: 'ARCH', disciplineShort: 'AR', code: 'SK', nameEn: 'Skirting, Trims & Edge Profiles', nameAr: 'الوزرات وبروفايلات التشطيب', typicalLogTypes: ['MS', 'MIR'], boqRefExample: 'BOQ-AR-21' },
  { id: 22, discipline: 'ARCH', disciplineShort: 'AR', code: 'AD', nameEn: 'Tile Adhesives, Grouts & Sealants', nameAr: 'مواد اللصق والسيلكون والروبة', typicalLogTypes: ['MS', 'MIR', 'SL'], boqRefExample: 'BOQ-AR-22' },
  { id: 23, discipline: 'ARCH', disciplineShort: 'AR', code: 'EJ', nameEn: 'Expansion Joint Covers', nameAr: 'أغطية فواصل التمدد والمباني', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-23' },
  { id: 24, discipline: 'ARCH', disciplineShort: 'AR', code: 'FN', nameEn: 'Fixed & Loose Furniture (FF&E)', nameAr: 'الأثاث الثابت والمتحرك', typicalLogTypes: ['MS', 'DR', 'MIR'], boqRefExample: 'BOQ-AR-24' },
  { id: 25, discipline: 'ARCH', disciplineShort: 'AR', code: 'KT', nameEn: 'Pantries, Kitchenettes & Millwork', nameAr: 'البوفيهات وكبائن المطابخ', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-25' },
  { id: 26, discipline: 'ARCH', disciplineShort: 'AR', code: 'TP', nameEn: 'Compact HPL Toilet Partitions', nameAr: 'قواطع الحمامات (Compact HPL)', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-26' },
  { id: 27, discipline: 'ARCH', disciplineShort: 'AR', code: 'LS', nameEn: 'Hardscape, Interlock & Curbstones', nameAr: 'اللاندسكيب والإنترلوك والبردورات', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-AR-27' },
  { id: 28, discipline: 'ARCH', disciplineShort: 'AR', code: 'DE', nameEn: 'General Arch Design & Coordination', nameAr: 'تنسيق معماري عام ومخططات مجمعة', typicalLogTypes: ['DR', 'SIR'], boqRefExample: 'BOQ-AR-28' },

  // CIVIL (8 Clauses)
  { id: 29, discipline: 'CIVIL', disciplineShort: 'CV', code: 'EX', nameEn: 'Excavation, Backfilling & Soil Compaction', nameAr: 'أعمال الحفر والردم والإحلال', typicalLogTypes: ['MS', 'DR', 'SIR'], boqRefExample: 'BOQ-CV-01' },
  { id: 30, discipline: 'CIVIL', disciplineShort: 'CV', code: 'PC', nameEn: 'Plain Concrete & Blinding', nameAr: 'الخرسانة العادية وفرشة النظافة', typicalLogTypes: ['MS', 'DR', 'SIR'], boqRefExample: 'BOQ-CV-02' },
  { id: 31, discipline: 'CIVIL', disciplineShort: 'CV', code: 'RC', nameEn: 'Reinforced Concrete & Mix Design', nameAr: 'الخرسانة المسلحة وتصميم الخلطة', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-CV-03' },
  { id: 32, discipline: 'CIVIL', disciplineShort: 'CV', code: 'RB', nameEn: 'Steel Reinforcement Rebar & Mesh', nameAr: 'حديد التسليح والشبك الملحوم', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-CV-04' },
  { id: 33, discipline: 'CIVIL', disciplineShort: 'CV', code: 'ST', nameEn: 'Structural Steel & Metal Decking', nameAr: 'المنشآت والهياكل المعدنية', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-CV-05' },
  { id: 34, discipline: 'CIVIL', disciplineShort: 'CV', code: 'AD', nameEn: 'Concrete Admixtures & Curing Compounds', nameAr: 'إضافات الخرسانة ومواد المعالجة', typicalLogTypes: ['MS', 'MIR', 'SL'], boqRefExample: 'BOQ-CV-06' },
  { id: 35, discipline: 'CIVIL', disciplineShort: 'CV', code: 'GR', nameEn: 'Non-Shrink Grout & Repair Mortars', nameAr: 'المونة غير القابلة للانكماش وإصلاح الخرسانة', typicalLogTypes: ['MS', 'MIR', 'SIR'], boqRefExample: 'BOQ-CV-07' },
  { id: 36, discipline: 'CIVIL', disciplineShort: 'CV', code: 'AN', nameEn: 'Chemical Epoxy & Mechanical Anchors', nameAr: 'مواد تزريع الأشاير والأكمون', typicalLogTypes: ['MS', 'MIR', 'SIR'], boqRefExample: 'BOQ-CV-08' },

  // ELEC (7 Clauses)
  { id: 37, discipline: 'ELEC', disciplineShort: 'EL', code: 'CB', nameEn: 'LV/MV Power Cables & Wires', nameAr: 'كابلات وأسلاك القوى الكهربائية', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-01' },
  { id: 38, discipline: 'ELEC', disciplineShort: 'EL', code: 'CN', nameEn: 'PVC Conduits, EMT & Cable Trays', nameAr: 'المواسير وحوامل الكابلات (Cable Trays)', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-02' },
  { id: 39, discipline: 'ELEC', disciplineShort: 'EL', code: 'PN', nameEn: 'Distribution Panels, MDB & Switchgear', nameAr: 'لوحات التوزيع الكهربائية والقواطع', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-03' },
  { id: 40, discipline: 'ELEC', disciplineShort: 'EL', code: 'LT', nameEn: 'Indoor & Outdoor Lighting Fixtures', nameAr: 'وحدات وكشافات الإضاءة', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-04' },
  { id: 41, discipline: 'ELEC', disciplineShort: 'EL', code: 'WD', nameEn: 'Wiring Accessories, Switches & Sockets', nameAr: 'المفاتيح والبرايز ولقم الكهرباء', typicalLogTypes: ['MS', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-05' },
  { id: 42, discipline: 'ELEC', disciplineShort: 'EL', code: 'LW', nameEn: 'Light Current (CCTV, Data, Fire Alarm, AV)', nameAr: 'التيار الخفيف (كاميرات، داتا، إنذار حريق)', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-06' },
  { id: 43, discipline: 'ELEC', disciplineShort: 'EL', code: 'ER', nameEn: 'Earthing & Lightning Protection System', nameAr: 'نظام التأريض ومانعة الصواعق', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-EL-07' },

  // MECH (8 Clauses)
  { id: 44, discipline: 'MECH', disciplineShort: 'MC', code: 'WS', nameEn: 'Domestic Water Supply PPR/PEX Piping & Valves', nameAr: 'شبكة مواسير ومحابس تغذية المياه', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-01' },
  { id: 45, discipline: 'MECH', disciplineShort: 'MC', code: 'DR', nameEn: 'uPVC/HDPE Drainage & Storm Piping', nameAr: 'شبكة مواسير الصرف الصحي وصرف المطر', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-02' },
  { id: 46, discipline: 'MECH', disciplineShort: 'MC', code: 'CS', nameEn: 'Sanitary Ware, Mixers & Bathroom Accessories', nameAr: 'الأجهزة الصحية والخلاطات', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-03' },
  { id: 47, discipline: 'MECH', disciplineShort: 'MC', code: 'FF', nameEn: 'Firefighting Piping, Sprinklers & Hose Cabinets', nameAr: 'شبكة مكافحة الحريق والرشاشات والصناديق', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-04' },
  { id: 48, discipline: 'MECH', disciplineShort: 'MC', code: 'PM', nameEn: 'Water Booster, Sump & Fire Pumps', nameAr: 'طلمبات المياه والصرف ومكافحة الحريق', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-05' },
  { id: 49, discipline: 'MECH', disciplineShort: 'MC', code: 'AC', nameEn: 'HVAC DX, VRF, Chillers & Fan Coil Units', nameAr: 'وحدات التكييف المركزية والـ VRF والاسبليت', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-06' },
  { id: 50, discipline: 'MECH', disciplineShort: 'MC', code: 'DC', nameEn: 'GI Ductwork, Thermal Insulation & Grilles', nameAr: 'مجاري الهواء الصاج والعزل ومخارج الهواء', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-07' },
  { id: 51, discipline: 'MECH', disciplineShort: 'MC', code: 'BM', nameEn: 'BMS, Actuators & Mechanical Controls', nameAr: 'نظام إدارة المباني والتحكم الميكانيكي', typicalLogTypes: ['MS', 'DR', 'MIR', 'SIR'], boqRefExample: 'BOQ-MC-08' },
];

export const FILE_CODING_RULES: FileCodingRule[] = [
  {
    categoryCode: 'TDC',
    folderPrefix: '01. TDC - Tender Documents',
    nameEn: 'Tender Documents & RFP Package',
    nameAr: 'مستندات الطرح والمناقصة',
    pattern: '[ProjectCode]-TDC-[Subtype]-[Seq]-[Rev]_[Date]',
    example: 'C096-TDC-RFP-0001-R00_2026-10-15.pdf',
    subtypes: [
      { code: 'RFP', labelEn: 'Request for Proposal / Conditions', labelAr: 'كراسة الشروط والطرح' },
      { code: 'BOQ', labelEn: 'Blank / Issued Bill of Quantities', labelAr: 'مقايسة الأعمال المطروحة' },
      { code: 'SPC', labelEn: 'Technical Specifications & Vendor List', labelAr: 'المواصفات الفنية وقائمة الموردين' },
      { code: 'DWG-AR', labelEn: 'Tender Architectural Drawings', labelAr: 'رسومات الطرح المعمارية' },
      { code: 'DWG-MEP', labelEn: 'Tender MEP Drawings', labelAr: 'رسومات الطرح الكهروميكانيكية' },
    ],
  },
  {
    categoryCode: 'DC',
    folderPrefix: '02. DC - Document Control',
    nameEn: 'Document Control & Submittals Logs',
    nameAr: 'مراقبة المستندات وسجلات الاعتمادات',
    pattern: '[ProjectCode]-DC-[LogType][Disc][Clause][Seq]-[Rev]_[Date]',
    example: 'C096-DC-MSARGP01-R00_2026-10-15.pdf',
    subtypes: [
      { code: 'MS', labelEn: 'Material Submittal Package', labelAr: 'حافظة اعتماد خامات' },
      { code: 'DR', labelEn: 'Shop Drawing Submittal', labelAr: 'حافظة رسومات شوب دروينج' },
      { code: 'MIR', labelEn: 'Material Inspection Request', labelAr: 'طلب فحص تشوينات' },
      { code: 'SIR', labelEn: 'Site Inspection Request', labelAr: 'طلب استلام أعمال بالموقع' },
      { code: 'TRN', labelEn: 'Official Consultant Transmittal', labelAr: 'ترانسميتال رسمي للاستشاري' },
    ],
  },
  {
    categoryCode: 'TC',
    folderPrefix: '03. TC - Technical & Pricing',
    nameEn: 'Technical Studies, Rate Analysis & Pricing',
    nameAr: 'الدراسات الفنية والتسعير وتحليل الأسعار',
    pattern: '[ProjectCode]-TC-[Subtype]-[Seq]-[Rev]_[Party]',
    example: 'C096-TC-RAT-0004-R01_GypsumBoardAnalysis.xlsx',
    subtypes: [
      { code: 'PRC', labelEn: 'Priced BOQ & Commercial Offer', labelAr: 'المقايسة المسعرة والعرض المالي' },
      { code: 'RAT', labelEn: 'Dry Cost & Rate Breakdown Sheet', labelAr: 'شيت تحليل الأسعار (Dry Cost)' },
      { code: 'QTN', labelEn: 'Supplier / Subcontractor Quotation', labelAr: 'عرض سعر مورد أو مقاول باطن' },
      { code: 'CMP', labelEn: 'Commercial Comparison Sheet', labelAr: 'شيت مقارنة عروض الأسعار' },
    ],
  },
  {
    categoryCode: 'C000',
    folderPrefix: '04. C000 - Contracting Projects',
    nameEn: 'Contracting Execution Master Folder',
    nameAr: 'ملفات مشاريع المقاولات التنفيذية',
    pattern: '[ProjectCode]-CON-[Subtype]-[Seq]-[Rev]_[Date]',
    example: 'C096-CON-BaselineSchedule-0001-R02_2026-10-15.pdf',
    subtypes: [
      { code: 'CTR', labelEn: 'Signed Main Contract & Addenda', labelAr: 'العقد الرئيسي وملاحقه' },
      { code: 'SCH', labelEn: 'Primavera / Master Time Schedule', labelAr: 'البرنامج الزمني للمشروع' },
      { code: 'QS', labelEn: 'Quantity Survey & As-Built Sheets', labelAr: 'حصر الكميات الهندسي' },
      { code: 'VO', labelEn: 'Variation Order Dossier', labelAr: 'ملف أوامر التغيير والمستجدات' },
    ],
  },
  {
    categoryCode: 'MC000',
    folderPrefix: '05. MC000 - Management Contracts',
    nameEn: 'Management & Cost-Plus Contracts',
    nameAr: 'عقود الإدارة ونسبة الإشراف',
    pattern: '[ProjectCode]-MC-[Subtype]-[Seq]-[Rev]_[Date]',
    example: 'MC014-MC-MPR-0003-R00_2026-10-15.pdf',
    subtypes: [
      { code: 'MPR', labelEn: 'Monthly Progress & Fee Report', labelAr: 'التقرير الشهري ونسبة الإدارة' },
      { code: 'PKG', labelEn: 'Trade Package Award Recommendation', labelAr: 'توصية ترسية باكيدج أعمال' },
    ],
  },
  {
    categoryCode: 'NPO',
    folderPrefix: '06. FIN / NPO - Normal Purchase Order',
    nameEn: 'Normal Purchase Order (Approved Material)',
    nameAr: 'أمر شراء قياسي (خامات معتمدة)',
    pattern: '[ProjectCode]-NPO-[Seq]-[Rev]_[Party]_[Date]',
    example: 'C096-NPO-0042-R00_KnaufEgypt_2026-10-15.pdf',
    subtypes: [
      { code: 'MAT', labelEn: 'Permanent Site Material PO', labelAr: 'أمر شراء خامات دائمة للموقع' },
      { code: 'EQP', labelEn: 'Equipment / Plant Purchase Order', labelAr: 'أمر شراء معدات أو مهمات' },
    ],
  },
  {
    categoryCode: 'RCB',
    folderPrefix: '06. FIN / RCB - Reconciliation of Petty Cash',
    nameEn: 'Reconciliation of Petty Cash Custody',
    nameAr: 'استعاضة وتسوية عهدة الموقع النقدية',
    pattern: '[ProjectCode]-RCB-[Seq]-[Rev]_[Party]_[Date]',
    example: 'C096-RCB-0018-R00_EngAhmedCustody_2026-10-15.xlsx',
    subtypes: [
      { code: 'SIT', labelEn: 'Site Engineer Custody Settlement', labelAr: 'تسوية عهدة مهندس الموقع' },
      { code: 'LOG', labelEn: 'Logistics & Transport Petty Cash', labelAr: 'تسوية عهدة النقل والمشتريات النثرية' },
    ],
  },
  {
    categoryCode: 'POP',
    folderPrefix: '06. FIN / POP - Proof of Payment',
    nameEn: 'Bank Transfer / Check Proof of Payment',
    nameAr: 'إيصال تحويل بنكي / إثبات سداد',
    pattern: '[ProjectCode]-POP-[Seq]_[Party]_[Date]',
    example: 'C096-POP-0109_ElSwedyCables_2026-10-15.pdf',
    subtypes: [
      { code: 'BNK', labelEn: 'Wire Transfer / InstaPay Swift Receipt', labelAr: 'إيصال تحويل بنكي' },
      { code: 'CHK', labelEn: 'Issued Bank Check Copy', labelAr: 'صورة شيك بنكي منصرف' },
    ],
  },
  {
    categoryCode: 'CPO',
    folderPrefix: '06. FIN / CPO - Cash Payment Order',
    nameEn: 'Direct Cash Payment Order',
    nameAr: 'أمر دفع نقدي مباشر',
    pattern: '[ProjectCode]-CPO-[Seq]_[Party]_[Date]',
    example: 'C096-CPO-0055_SiteLaborerAdvance_2026-10-15.pdf',
    subtypes: [
      { code: 'ADV', labelEn: 'Urgent Cash Advance / Downpayment', labelAr: 'دفعة نقدية عاجلة تحت الحساب' },
      { code: 'EXP', labelEn: 'Direct Site Expense Voucher', labelAr: 'إذن صرف مصروف مباشر' },
    ],
  },
  {
    categoryCode: 'ST',
    folderPrefix: '06. FIN / ST - Subcontractor Statement',
    nameEn: 'Subcontractor Interim Payment Certificate (IPC)',
    nameAr: 'مستخلص مقاول باطن (جاري / ختامي)',
    pattern: '[ProjectCode]-ST-[Seq]-[Rev]_[Party]_[Date]',
    example: 'C096-ST-0006-R00_AlNourPlastering_2026-10-15.xlsx',
    subtypes: [
      { code: 'IPC', labelEn: 'Running Subcontractor Statement', labelAr: 'مستخلص مقاول باطن جاري' },
      { code: 'FIN', labelEn: 'Final Subcontractor Clearance Statement', labelAr: 'مستخلص ختامي وإخلاء طرف' },
    ],
  },
  {
    categoryCode: 'INV',
    folderPrefix: '06. FIN / INV - Client Extract & Invoice',
    nameEn: 'Client Interim Payment Extract & Tax Invoice',
    nameAr: 'مستخلص المالك والفاتورة الضريبية',
    pattern: '[ProjectCode]-INV-[Seq]-[Rev]_[Party]_[Date]',
    example: 'C096-INV-0004-R00_TameerDevelopment_2026-10-15.pdf',
    subtypes: [
      { code: 'EXT', labelEn: 'Owner Certified Work Extract', labelAr: 'مستخلص أعمال معتمد للمالك' },
      { code: 'TAX', labelEn: 'E-Invoice Tax Portal Receipt', labelAr: 'الفاتورة الإلكترونية الضريبية' },
    ],
  },
];

export const ABBREVIATIONS_DICTIONARY = [
  { code: 'TDC', category: 'Folder Structure', en: 'Tender Documents & Conditions', ar: 'مستندات الطرح والمناقصة (01. TDC)' },
  { code: 'DC', category: 'Folder Structure', en: 'Document Control & Submittals', ar: 'مراقبة المستندات والاعتمادات (02. DC)' },
  { code: 'TC', category: 'Folder Structure', en: 'Technical Office & Pricing Studies', ar: 'المكتب الفني والدراسات والتسعير (03. TC)' },
  { code: 'C000', category: 'Project Prefix', en: 'General Contracting Project Code (e.g. C096)', ar: 'كود مشاريع المقاولات المتكاملة (04. C000)' },
  { code: 'MC000', category: 'Project Prefix', en: 'Management / Cost-Plus Contract Code', ar: 'كود عقود الإدارة والإشراف (MC000)' },
  { code: 'MS', category: 'Submittal Log', en: 'Material Submittal', ar: 'طلب اعتماد مواد وخامات وعينات' },
  { code: 'DR', category: 'Submittal Log', en: 'Shop Drawing Submittal', ar: 'طلب اعتماد رسومات تنفيذية (شوب دروينج)' },
  { code: 'MIR', category: 'Submittal Log', en: 'Material Inspection Request', ar: 'طلب فحص واستلام تشوينات موردة للموقع' },
  { code: 'SL', category: 'Submittal Log', en: 'Supplier / Manufacturer Qualification List', ar: 'طلب اعتماد مورد أو مصنع (قائمة الموردين)' },
  { code: 'SIR', category: 'Submittal Log', en: 'Site Inspection Request (Work Inspection)', ar: 'طلب استلام أعمال منفذة بالموقع من الاستشاري' },
  { code: 'NPO', category: 'Finance & Procurement', en: 'Normal Purchase Order (Linked to Code A/B MS)', ar: 'أمر شراء قياسي (مربوط باعتماد الخامة)' },
  { code: 'RCB', category: 'Finance & Procurement', en: 'Reconciliation of Petty Cash Balance', ar: 'كشف استعاضة وتسوية عهدة نقدية' },
  { code: 'POP', category: 'Finance & Procurement', en: 'Proof of Payment (Bank Swift / InstaPay / Check)', ar: 'إثبات سداد مالي أو إيصال تحويل بنكي' },
  { code: 'CPO', category: 'Finance & Procurement', en: 'Cash Payment Order', ar: 'أمر دفع نقدي مباشر' },
  { code: 'ST', category: 'Finance & Procurement', en: 'Subcontractor Statement (Interim/Final Extract)', ar: 'مستخلص أعمال مقاول باطن' },
  { code: 'INV', category: 'Finance & Procurement', en: 'Client Extract & Official Tax Invoice', ar: 'مستخلص المالك والفاتورة الضريبية' },
];

const INITIAL_SUBMITTALS: SubmittalRecord[] = [
  {
    id: 'sub-1',
    code: 'MSARGP01',
    revision: 'Rev 00',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    logType: 'MS',
    discipline: 'ARCH',
    disciplineShort: 'AR',
    clauseCode: 'GP',
    clauseNameEn: 'Gypsum Board & False Ceilings',
    clauseNameAr: 'جبس بورد وأسقف معلقة',
    titleEn: 'Knauf Moisture Resistant Gypsum Board 12.5mm & Galvanized Steel Framing System',
    titleAr: 'اعتماد ألواح جبس بورد كناوف مقاوم للرطوبة 12.5 مم مع قطاعات الصاج المجلفن',
    manufacturerOrSub: 'Knauf Egypt / Saint-Gobain',
    status: 'A',
    submittedDate: '2026-10-02',
    responseDate: '2026-10-09',
    consultantName: 'ECG Engineering Consultants Group',
    consultantEmail: 'dc.azad@ecg-consultants.com',
    attachments: [
      { name: 'C096-DC-MSARGP01-R00_TechnicalDatasheet.pdf', type: 'pdf', size: '4.2 MB' },
      { name: 'C096-DC-MSARGP01-R00_ComplianceStatement.xlsx', type: 'xlsx', size: '840 KB' },
    ],
    notes: 'Approved without comments. Material unlocked for Procurement NPO creation.',
    procurementUnlocked: true,
  },
  {
    id: 'sub-2',
    code: 'DRARDE01',
    revision: 'Rev 01',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    logType: 'DR',
    discipline: 'ARCH',
    disciplineShort: 'AR',
    clauseCode: 'DE',
    clauseNameEn: 'General Arch Design & Coordination',
    clauseNameAr: 'تنسيق معماري عام ومخططات مجمعة',
    titleEn: 'Reflected Ceiling Plan (RCP) Combined Services Coordination - Building B2 Ground Floor',
    titleAr: 'مخطط الأسقف المعلقة المجمع مع التكييف والإضاءة والحريق - مبنى B2 الدور الأرضي',
    manufacturerOrSub: 'Nexus Technical Office',
    status: 'B',
    submittedDate: '2026-10-05',
    responseDate: '2026-10-12',
    consultantName: 'ECG Engineering Consultants Group',
    consultantEmail: 'dc.azad@ecg-consultants.com',
    attachments: [
      { name: 'C096-DC-DRARDE01-R01_RCP_Plot.pdf', type: 'pdf', size: '6.8 MB' },
      { name: 'C096-DC-DRARDE01-R01_CAD_Source.dwg', type: 'dwg', size: '11.4 MB' },
    ],
    notes: 'Approved as noted (Code B): Maintain 150mm clearance around linear slot diffusers in Lobby.',
    procurementUnlocked: true,
  },
  {
    id: 'sub-3',
    code: 'MSELLW04',
    revision: 'Rev 00',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    logType: 'MS',
    discipline: 'ELEC',
    disciplineShort: 'EL',
    clauseCode: 'LW',
    clauseNameEn: 'Light Current (CCTV, Data, Fire Alarm, AV)',
    clauseNameAr: 'التيار الخفيف (كاميرات، داتا، إنذار حريق)',
    titleEn: 'Addressable Fire Alarm Control Panel & Optical Smoke Detectors (Honeywell Gent)',
    titleAr: 'اعتماد لوحة إنذار الحريق المعنونة والحساسات الدخانية ماركة هانيويل',
    manufacturerOrSub: 'Honeywell / Gent UK',
    status: 'Under Review',
    submittedDate: '2026-10-13',
    consultantName: 'ECG Engineering Consultants Group',
    consultantEmail: 'dc.azad@ecg-consultants.com',
    attachments: [
      { name: 'C096-DC-MSELLW04-R00_HoneywellCatalog.pdf', type: 'pdf', size: '8.1 MB' },
      { name: 'C096-DC-MSELLW04-R00_UL_CivilDefenseCert.pdf', type: 'pdf', size: '2.3 MB' },
    ],
    notes: 'Submitted via Transmittal TRN-0012. Awaiting MEP Consultant action.',
    procurementUnlocked: false,
  },
  {
    id: 'sub-4',
    code: 'MIRARTL02',
    revision: 'Rev 00',
    projectCode: 'C063',
    projectName: 'C063 - Madinaty Commercial Hub',
    logType: 'MIR',
    discipline: 'ARCH',
    disciplineShort: 'AR',
    clauseCode: 'TL',
    clauseNameEn: 'Ceramic & Porcelain Tiles',
    clauseNameAr: 'سيراميك وبورسلين',
    titleEn: 'Inspection of 1,450 m2 Delivered 60x120cm Full-Body Porcelain Floor Tiles (Gemma Batch #44)',
    titleAr: 'فحص واستلام تشوينات 1450 م2 بورسلين أرضيات 60×120 سم الجوهرة دفعة رقم 44',
    manufacturerOrSub: 'Cleopatra / Gemma Ceramics',
    status: 'A',
    submittedDate: '2026-10-08',
    responseDate: '2026-10-09',
    consultantName: 'Dar Al-Handasah Consultants',
    consultantEmail: 'submittals.madinaty@dar.com',
    attachments: [
      { name: 'C063-DC-MIRARTL02-R00_SignedMIR.pdf', type: 'pdf', size: '3.1 MB' },
    ],
    notes: 'Site storage verified and batch numbers match approved sample MSARTL01.',
    procurementUnlocked: true,
  },
  {
    id: 'sub-5',
    code: 'MSMCCB01',
    revision: 'Rev 00',
    projectCode: 'C091',
    projectName: 'C091 - Mountain View iCity',
    logType: 'MS',
    discipline: 'MECH',
    disciplineShort: 'MC',
    clauseCode: 'CS',
    clauseNameEn: 'Sanitary Ware, Mixers & Bathroom Accessories',
    clauseNameAr: 'الأجهزة الصحية والخلاطات',
    titleEn: 'Concealed Cisterns, Wall-Hung WC Bowls & Chrome Basin Mixers (Duravit / Grohe)',
    titleAr: 'اعتماد خزانات الدفن والكراسي المعلقة وخلاطات الأحواض (ديورافيت / جروهي)',
    manufacturerOrSub: 'Duravit Egypt / Grohe AG',
    status: 'C',
    submittedDate: '2026-10-03',
    responseDate: '2026-10-11',
    consultantName: 'EHAF Consulting Engineers',
    consultantEmail: 'doc.control@ehaf-mv.com',
    attachments: [
      { name: 'C091-DC-MSMCCS01-R00_SanitarySubmittal.pdf', type: 'pdf', size: '5.5 MB' },
    ],
    notes: 'Code C (Revise & Resubmit): Provide water-flow consumption certificate & physical chrome finish sample board.',
    procurementUnlocked: false,
  },
  {
    id: 'sub-6',
    code: 'SLCVRC01',
    revision: 'Rev 00',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    logType: 'SL',
    discipline: 'CIVIL',
    disciplineShort: 'CV',
    clauseCode: 'RC',
    clauseNameEn: 'Reinforced Concrete & Mix Design',
    clauseNameAr: 'الخرسانة المسلحة وتصميم الخلطة',
    titleEn: 'Prequalification of Ready-Mix Concrete Batching Plant Supplier (Lafarge Holcim Egypt)',
    titleAr: 'اعتماد مورد ومحطة خلط الخرسانة الجاهزة (لافارج هولسيم مصر)',
    manufacturerOrSub: 'Lafarge Ready-Mix Egypt',
    status: 'A',
    submittedDate: '2026-09-25',
    responseDate: '2026-10-01',
    consultantName: 'ECG Engineering Consultants Group',
    consultantEmail: 'dc.azad@ecg-consultants.com',
    attachments: [
      { name: 'C096-DC-SLCVRC01-R00_VendorPrequalification.pdf', type: 'pdf', size: '9.4 MB' },
    ],
    notes: 'Approved Vendor (Code A). Backup batch plant in New Cairo Industrial Zone verified.',
    procurementUnlocked: true,
  },
  {
    id: 'sub-7',
    code: 'SIRARWP03',
    revision: 'Rev 00',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    logType: 'SIR',
    discipline: 'ARCH',
    disciplineShort: 'AR',
    clauseCode: 'WP',
    clauseNameEn: 'Waterproofing & Thermal Insulation',
    clauseNameAr: 'العزل المائي والحراري',
    titleEn: '48-Hour Flood Test Inspection for Wet Areas Bituminous Membrane Waterproofing - Zone A',
    titleAr: 'طلب استلام واختبار غمر المياه لمدة 48 ساعة لعزل الحمامات والمناطق الرطبة - زون A',
    manufacturerOrSub: 'Bitumode / Site Execution Team',
    status: 'To Submit',
    submittedDate: '2026-10-16',
    consultantName: 'ECG Engineering Consultants Group',
    consultantEmail: 'dc.azad@ecg-consultants.com',
    attachments: [
      { name: 'C096-DC-SIRARWP03-R00_ChecklistAndLayout.pdf', type: 'pdf', size: '1.9 MB' },
    ],
    notes: 'Ready for transmittal dispatch to Resident Engineer.',
    procurementUnlocked: false,
  },
  {
    id: 'sub-8',
    code: 'MSARPT02',
    revision: 'Rev 00',
    projectCode: 'C063',
    projectName: 'C063 - Madinaty Commercial Hub',
    logType: 'MS',
    discipline: 'ARCH',
    disciplineShort: 'AR',
    clauseCode: 'PT',
    clauseNameEn: 'Paints & Decorative Coatings',
    clauseNameAr: 'الدهانات الداخلية والخارجية',
    titleEn: 'Non-Approved Local Acrylic Putty Alternative Submission',
    titleAr: 'تقديم معجون أكريليك بديل خارج قائمة الموردين المعتمدة',
    manufacturerOrSub: 'Local Non-Listed Vendor',
    status: 'D',
    submittedDate: '2026-10-01',
    responseDate: '2026-10-04',
    consultantName: 'Dar Al-Handasah Consultants',
    consultantEmail: 'submittals.madinaty@dar.com',
    attachments: [
      { name: 'C063-DC-MSARPT02-R00_Datasheet.pdf', type: 'pdf', size: '1.2 MB' },
    ],
    notes: 'Rejected (Code D): Manufacturer is not listed in Contract Vendor List (Jotun / Sipes / GLC only).',
    procurementUnlocked: false,
  },
];

const INITIAL_TRANSMITTAL_HISTORY: TransmittalEmailRecord[] = [
  {
    id: 'trn-1',
    transmittalNo: 'TRN-0013',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    recipientName: 'ECG Engineering Consultants Group',
    recipientEmail: 'dc.azad@ecg-consultants.com',
    ccEmails: 'pm.azad@tameer-dev.com; tech.office@nexus-nexus.com',
    subject: '[C096 - Azad New Cairo] Submittal Transmittal TRN-0013: MSARGP01 - Knauf Gypsum Board System (Rev 00)',
    submittalCodes: ['MSARGP01', 'DRARDE01'],
    sentAt: '2026-10-05 14:22',
    folderPath: '/Projects/C096 - Azad New Cairo/02. DC - Document Control/emails/TRN-0013',
    language: 'Bilingual',
    bodyPreview: 'Dear Consultant / السادة استشاري المشروع المحترمين، Please find attached official Submittal Transmittal TRN-0013 for your review and approval...',
  },
  {
    id: 'trn-2',
    transmittalNo: 'TRN-0012',
    projectCode: 'C096',
    projectName: 'C096 - Azad New Cairo',
    recipientName: 'ECG Engineering Consultants Group',
    recipientEmail: 'dc.azad@ecg-consultants.com',
    ccEmails: 'pm.azad@tameer-dev.com; mep.lead@nexus-nexus.com',
    subject: '[C096 - Azad New Cairo] Submittal Transmittal TRN-0012: MSELLW04 - Honeywell Fire Alarm System (Rev 00)',
    submittalCodes: ['MSELLW04'],
    sentAt: '2026-10-13 11:05',
    folderPath: '/Projects/C096 - Azad New Cairo/02. DC - Document Control/emails/TRN-0012',
    language: 'Bilingual',
    bodyPreview: 'Formal submission of Light Current Material Submittal MSELLW04 with UL Certificates & Compliance matrix...',
  },
];

// ============================================================================
// HELPER FUNCTIONS FOR BADGES
// ============================================================================

const getStatusBadge = (status: SubmittalStatusCode) => {
  switch (status) {
    case 'A':
      return {
        label: 'Code A • Approved (معتمد بدون ملاحظات)',
        short: 'Code A - Approved',
        classes: 'bg-[#123524]/10 text-[#123524] border-[#123524]/25',
        icon: CheckCircle2,
      };
    case 'B':
      return {
        label: 'Code B • Approved as Noted (معتمد بملاحظات)',
        short: 'Code B - Approved as Noted',
        classes: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
        icon: CheckCircle2,
      };
    case 'C':
      return {
        label: 'Code C • Revise & Resubmit (يعاد التقديم)',
        short: 'Code C - Revise & Resubmit',
        classes: 'bg-amber-500/15 text-[#b45309] border-amber-500/30',
        icon: AlertTriangle,
      };
    case 'D':
      return {
        label: 'Code D • Rejected (مرفوض)',
        short: 'Code D - Rejected',
        classes: 'bg-rose-500/15 text-red-700 border-rose-500/30',
        icon: XCircle,
      };
    case 'Under Review':
      return {
        label: 'Under Consultant Review (قيد المراجعة لدى الاستشاري)',
        short: 'Under Review (قيد المراجعة)',
        classes: 'bg-sky-500/15 text-[#192631] border-sky-500/30',
        icon: Clock,
      };
    case 'To Submit':
      return {
        label: 'Pending Submission (مطلوب تقديمه)',
        short: 'Pending (مطلوب تقديمه)',
        classes: 'bg-slate-500/20 text-[#192631]/85 border-slate-500/30',
        icon: FileText,
      };
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DocumentControlHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'transmittal' | 'filecoder' | 'matrix'>('register');

  // Submittals Register State
  const [submittals, setSubmittals] = useState<SubmittalRecord[]>(INITIAL_SUBMITTALS);
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterLogType, setFilterLogType] = useState<string>('ALL');
  const [filterDiscipline, setFilterDiscipline] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Submittal Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newProjectCode, setNewProjectCode] = useState('C096');
  const [newLogType, setNewLogType] = useState<LogTypeCode>('MS');
  const [newDiscipline, setNewDiscipline] = useState<DisciplineKey>('ARCH');
  const [newClauseCode, setNewClauseCode] = useState<string>('GP');
  const [newRevision, setNewRevision] = useState<string>('Rev 00');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newTitleAr, setNewTitleAr] = useState<string>('');
  const [newManufacturer, setNewManufacturer] = useState<string>('');
  const [newAttachments, setNewAttachments] = useState<{ name: string; type: 'pdf' | 'dwg' | 'xlsx'; size: string }[]>([
    { name: 'Technical_Datasheet_Compliance.pdf', type: 'pdf', size: '3.8 MB' },
    { name: 'Coordination_ShopDrawing.dwg', type: 'dwg', size: '7.2 MB' },
  ]);

  // Transmittal Generator State (Tab 2)
  const [selectedSubmittalIds, setSelectedSubmittalIds] = useState<string[]>(['sub-1', 'sub-7']);
  const [transmittalProject, setTransmittalProject] = useState<string>('C096');
  const [transmittalLanguage, setTransmittalLanguage] = useState<'Bilingual' | 'English' | 'Arabic'>('Bilingual');
  const [customRecipientEmail, setCustomRecipientEmail] = useState<string>('dc.azad@ecg-consultants.com');
  const [customCcEmail, setCustomCcEmail] = useState<string>('pm.azad@tameer-dev.com; tech.office@nexus-nexus.com');
  const [transmittalRemarks] = useState<string>(
    'Kindly review and return with formal Consultant Action Code (A/B) within the contractual 7-day review period so site execution and procurement PO issuance can proceed on schedule.'
  );
  const [transmittalHistory, setTransmittalHistory] = useState<TransmittalEmailRecord[]>(INITIAL_TRANSMITTAL_HISTORY);
  const [copiedEmailField, setCopiedEmailField] = useState<string | null>(null);

  // Interactive File & Folder Naming Generator State (Tab 3)
  const [coderCategory, setCoderCategory] = useState<string>('DC');
  const [coderProject, setCoderProject] = useState<string>('C096');
  const [coderSubtype, setCoderSubtype] = useState<string>('MS');
  const [coderDisciplineShort, setCoderDisciplineShort] = useState<DisciplineShortCode>('AR');
  const [coderClause, setCoderClause] = useState<string>('GP');
  const [coderSequence, setCoderSequence] = useState<string>('0001');
  const [coderRevision, setCoderRevision] = useState<string>('R00');
  const [coderPartyOrDesc, setCoderPartyOrDesc] = useState<string>('KnaufGypsum');
  const [coderDate, setCoderDate] = useState<string>('2026-10-15');
  const [coderExtension, setCoderExtension] = useState<'pdf' | 'dwg' | 'xlsx'>('pdf');
  const [copiedPathKey, setCopiedPathKey] = useState<string | null>(null);

  // 51-Clause Matrix Filter State (Tab 4)
  const [matrixDisciplineFilter, setMatrixDisciplineFilter] = useState<string>('ALL');
  const [matrixSearch, setMatrixSearch] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // ============================================================================
  // COMPUTED VALUES: SUBMITTALS REGISTER & AUTO-CODE GENERATOR
  // ============================================================================

  const kpiStats = useMemo(() => {
    const total = submittals.length;
    const codeA = submittals.filter((s) => s.status === 'A').length;
    const codeB = submittals.filter((s) => s.status === 'B').length;
    const codeC = submittals.filter((s) => s.status === 'C').length;
    const codeD = submittals.filter((s) => s.status === 'D').length;
    const underReview = submittals.filter((s) => s.status === 'Under Review').length;
    const toSubmit = submittals.filter((s) => s.status === 'To Submit').length;
    const unlockedCount = submittals.filter((s) => s.procurementUnlocked).length;
    return { total, codeA, codeB, approvedTotal: codeA + codeB, codeC, codeD, underReview, toSubmit, unlockedCount };
  }, [submittals]);

  const filteredSubmittals = useMemo(() => {
    return submittals.filter((item) => {
      if (filterProject !== 'ALL' && item.projectCode !== filterProject) return false;
      if (filterLogType !== 'ALL' && item.logType !== filterLogType) return false;
      if (filterDiscipline !== 'ALL' && item.discipline !== filterDiscipline) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.code.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.titleAr.toLowerCase().includes(q) ||
          item.clauseNameEn.toLowerCase().includes(q) ||
          item.clauseNameAr.toLowerCase().includes(q) ||
          item.manufacturerOrSub.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [submittals, filterProject, filterLogType, filterDiscipline, filterStatus, searchQuery]);

  // Clauses available for selected discipline in New Submittal Modal
  const availableModalClauses = useMemo(() => {
    return FIFTY_ONE_CLAUSES.filter((c) => c.discipline === newDiscipline);
  }, [newDiscipline]);

  // Auto-generate official Nexus Submittal Code: [LogType][DisciplineShort][ClauseCode][2-digit Seq]
  const autoGeneratedModalCode = useMemo(() => {
    const discObj = DISCIPLINES.find((d) => d.key === newDiscipline);
    const shortDisc = discObj ? discObj.short : 'AR';
    const prefix = `${newLogType}${shortDisc}${newClauseCode}`;
    const existingWithPrefix = submittals.filter(
      (s) => s.projectCode === newProjectCode && s.code.startsWith(prefix)
    );
    const nextSeq = String(existingWithPrefix.length + 1).padStart(2, '0');
    return `${prefix}${nextSeq}`;
  }, [newLogType, newDiscipline, newClauseCode, newProjectCode, submittals]);

  // Handle Status Change on any row (Code A / B unlocks Material for Procurement PO)
  const handleStatusChange = (id: string, nextStatus: SubmittalStatusCode) => {
    setSubmittals((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const unlocked = nextStatus === 'A' || nextStatus === 'B';
        return {
          ...item,
          status: nextStatus,
          procurementUnlocked: unlocked,
          responseDate:
            nextStatus === 'A' || nextStatus === 'B' || nextStatus === 'C' || nextStatus === 'D'
              ? new Date().toISOString().slice(0, 10)
              : item.responseDate,
        };
      })
    );
    const target = submittals.find((s) => s.id === id);
    if (target) {
      if (nextStatus === 'A' || nextStatus === 'B') {
        showToast(
          `✅ ${target.code} marked as Code ${nextStatus} — Material is now UNLOCKED for Procurement PO (NPO) creation!`
        );
      } else {
        showToast(`🔄 ${target.code} status updated to ${nextStatus} (Procurement PO locked until Code A/B).`);
      }
    }
  };

  // Handle jumping from a row directly to Consultant Email Generator
  const handleQuickEmailForRow = (item: SubmittalRecord) => {
    setTransmittalProject(item.projectCode);
    setSelectedSubmittalIds([item.id]);
    setCustomRecipientEmail(item.consultantEmail);
    setActiveTab('transmittal');
    showToast(`📧 Loaded ${item.code} (${item.revision}) into Consultant Transmittal Email Generator.`);
  };

  // Create New Submittal
  const handleCreateSubmittal = (e: React.FormEvent) => {
    e.preventDefault();
    const projectObj = NEXUS_PROJECTS.find((p) => p.code === newProjectCode) || NEXUS_PROJECTS[0];
    const discObj = DISCIPLINES.find((d) => d.key === newDiscipline) || DISCIPLINES[0];
    const clauseObj =
      FIFTY_ONE_CLAUSES.find((c) => c.discipline === newDiscipline && c.code === newClauseCode) ||
      FIFTY_ONE_CLAUSES[0];

    const created: SubmittalRecord = {
      id: `sub-${Date.now()}`,
      code: autoGeneratedModalCode,
      revision: newRevision,
      projectCode: projectObj.code,
      projectName: projectObj.name,
      logType: newLogType,
      discipline: newDiscipline,
      disciplineShort: discObj.short,
      clauseCode: clauseObj.code,
      clauseNameEn: clauseObj.nameEn,
      clauseNameAr: clauseObj.nameAr,
      titleEn: newTitleEn.trim() || `${clauseObj.nameEn} - Official ${newLogType} Package`,
      titleAr: newTitleAr.trim() || `تقديم اعتماد ${clauseObj.nameAr} (${autoGeneratedModalCode})`,
      manufacturerOrSub: newManufacturer.trim() || 'Approved Vendor List Selection',
      status: 'To Submit',
      submittedDate: new Date().toISOString().slice(0, 10),
      consultantName: projectObj.consultant,
      consultantEmail: projectObj.consultantEmail,
      attachments: newAttachments.map((att) => ({
        ...att,
        name: `${projectObj.code}-DC-${autoGeneratedModalCode}-${newRevision.replace(' ', '')}_${att.name}`,
      })),
      notes: 'Auto-coded via Nexus Engine. Ready for Consultant Transmittal.',
      procurementUnlocked: false,
    };

    setSubmittals((prev) => [created, ...prev]);
    setIsNewModalOpen(false);
    setNewTitleEn('');
    setNewTitleAr('');
    setNewManufacturer('');
    showToast(`✨ Generated Official Submittal Code ${created.code} (${created.revision}) & added to Register!`);
  };

  // ============================================================================
  // COMPUTED VALUES: AUTO-EMAIL & TRANSMITTAL GENERATOR (TAB 2)
  // ============================================================================

  const activeTransmittalProjectObj = useMemo(
    () => NEXUS_PROJECTS.find((p) => p.code === transmittalProject) || NEXUS_PROJECTS[0],
    [transmittalProject]
  );

  const selectedSubmittalObjects = useMemo(
    () => submittals.filter((s) => selectedSubmittalIds.includes(s.id)),
    [submittals, selectedSubmittalIds]
  );

  const nextTransmittalNo = useMemo(() => {
    const num = transmittalHistory.length + 13;
    return `TRN-${String(num).padStart(4, '0')}`;
  }, [transmittalHistory]);

  const generatedEmailContent = useMemo(() => {
    const firstItem = selectedSubmittalObjects[0];
    const codesSummary =
      selectedSubmittalObjects.map((s) => `${s.code} (${s.revision})`).join(', ') || 'No Submittals Selected';
    const headlineTitle =
      selectedSubmittalObjects.length === 1 && firstItem
        ? `${firstItem.code} - ${firstItem.titleEn} (${firstItem.revision})`
        : `${selectedSubmittalObjects.length} Submittals Package [${codesSummary}]`;

    const subject = `[${activeTransmittalProjectObj.code} - ${activeTransmittalProjectObj.name.replace(
      `${activeTransmittalProjectObj.code} - `,
      ''
    )}] Submittal Transmittal ${nextTransmittalNo}: ${headlineTitle}`;

    const rowsTextEn = selectedSubmittalObjects
      .map(
        (s, idx) =>
          `  ${idx + 1}. [${s.code}] (${s.revision}) | Type: ${s.logType} | Discipline: ${s.discipline} (${
            s.clauseCode
          } - ${s.clauseNameEn})\n     Title: ${s.titleEn}\n     Supplier/Origin: ${
            s.manufacturerOrSub
          }\n     Attachments: ${s.attachments.map((a) => a.name).join(', ')}`
      )
      .join('\n\n');

    const rowsTextAr = selectedSubmittalObjects
      .map(
        (s, idx) =>
          `  ${idx + 1}. كود الاعتماد: [${s.code}] (${s.revision}) | النوع: ${s.logType} | التخصص: ${
            s.clauseNameAr
          }\n     البيان: ${s.titleAr}\n     المورد / المصنع: ${s.manufacturerOrSub}`
      )
      .join('\n\n');

    let body = '';
    if (transmittalLanguage === 'Bilingual') {
      body = `Dear ${activeTransmittalProjectObj.consultant} Document Control & Resident Engineering Team,
السادة / ${activeTransmittalProjectObj.consultant} - جهاز الإشراف ومراقبة المستندات المحترمين،

Greetings from Nexus Technical Office.
تحية طيبة وبعد،،،

Please find enclosed Official Submittal Transmittal (${nextTransmittalNo}) for Project [${activeTransmittalProjectObj.name} / ${activeTransmittalProjectObj.nameAr}] for your kind technical review and formal approval action:
مرفق لسيادتكم حافظة الإرسال الرسمية رقم (${nextTransmittalNo}) الخاصة بمشروع (${activeTransmittalProjectObj.nameAr}) وذلك للمراجعة الفنية والاعتماد:

--------------------------------------------------------------------------------
📋 SCHEDULE OF SUBMITTED DOCUMENTS / جدول المستندات والاعتمادات المرفقة:
--------------------------------------------------------------------------------
${rowsTextEn || '  (Select at least one submittal from the checklist on the left)'}

--- الملخص باللغة العربية ---
${rowsTextAr || '  (يرجى اختيار اعتماد واحد على الأقل من القائمة)'}
--------------------------------------------------------------------------------

🔗 Cloud Server & CAD/Datasheet Archive Path (/emails):
/Projects/${activeTransmittalProjectObj.name}/02. DC - Document Control/emails/${nextTransmittalNo}/

📝 Technical Office Remarks / ملاحظات المكتب الفني:
${transmittalRemarks}

Best Regards / وتفضلوا بقبول فائق الاحترام،
Eng. Pierre & Technical Office Document Control Team
Nexus Construction & Engineering ERP`;
    } else if (transmittalLanguage === 'English') {
      body = `Dear ${activeTransmittalProjectObj.consultant} Document Control & Resident Engineering Team,

Please find enclosed Official Submittal Transmittal (${nextTransmittalNo}) for Project [${activeTransmittalProjectObj.name}] for your technical review and formal action code (A/B):

--------------------------------------------------------------------------------
SCHEDULE OF SUBMITTED DOCUMENTS (${nextTransmittalNo}):
--------------------------------------------------------------------------------
${rowsTextEn || '  (No submittals selected)'}
--------------------------------------------------------------------------------

Archive Folder Path:
/Projects/${activeTransmittalProjectObj.name}/02. DC - Document Control/emails/${nextTransmittalNo}/

Technical Office Notes:
${transmittalRemarks}

Best Regards,
Technical Office & Document Control Department
Nexus ERP`;
    } else {
      body = `السادة / ${activeTransmittalProjectObj.consultant} (إدارة الإشراف ومراقبة المستندات) المحترمين،،،
تحية طيبة وبعد،

نتشرف بإرسال حافظة الاعتمادات الرسمية رقم (${nextTransmittalNo}) الخاصة بمشروع [${activeTransmittalProjectObj.nameAr}] للمراجعة الفنية وإفادتنا بكود الاعتماد الرسمي (Code A / Code B) للبدء في إجراءات التوريد والتنفيذ:

--------------------------------------------------------------------------------
جدول الاعتمادات والمخططات المرفقة (${nextTransmittalNo}):
--------------------------------------------------------------------------------
${rowsTextAr || '  (لم يتم اختيار اعتمادات)'}
--------------------------------------------------------------------------------

مسار الأرشفة القياسي بالمشروع:
/Projects/${activeTransmittalProjectObj.name}/02. DC - Document Control/emails/${nextTransmittalNo}/

ملاحظات المكتب الفني:
${transmittalRemarks}

وتفضلوا بقبول فائق الاحترام والتقدير،،،
إدارة المكتب الفني ومراقبة المستندات - Nexus`;
    }

    return { subject, body };
  }, [
    selectedSubmittalObjects,
    activeTransmittalProjectObj,
    nextTransmittalNo,
    transmittalLanguage,
    transmittalRemarks,
  ]);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmailField(key);
    setTimeout(() => setCopiedEmailField(null), 2500);
  };

  const handleSendAndLogTransmittal = () => {
    if (selectedSubmittalObjects.length === 0) {
      showToast('⚠️ Please select at least one Submittal or Shop Drawing to include in the Transmittal.');
      return;
    }
    const newRecord: TransmittalEmailRecord = {
      id: `trn-${Date.now()}`,
      transmittalNo: nextTransmittalNo,
      projectCode: activeTransmittalProjectObj.code,
      projectName: activeTransmittalProjectObj.name,
      recipientName: activeTransmittalProjectObj.consultant,
      recipientEmail: customRecipientEmail,
      ccEmails: customCcEmail,
      subject: generatedEmailContent.subject,
      submittalCodes: selectedSubmittalObjects.map((s) => s.code),
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      folderPath: `/Projects/${activeTransmittalProjectObj.name}/02. DC - Document Control/emails/${nextTransmittalNo}`,
      language: transmittalLanguage,
      bodyPreview: generatedEmailContent.body.slice(0, 160) + '...',
    };

    // Also update any "To Submit" submittals in the package to "Under Review"
    setSubmittals((prev) =>
      prev.map((s) =>
        selectedSubmittalIds.includes(s.id) && s.status === 'To Submit'
          ? { ...s, status: 'Under Review', notes: `Dispatched via ${nextTransmittalNo} to Consultant.` }
          : s
      )
    );

    setTransmittalHistory((prev) => [newRecord, ...prev]);
    showToast(
      `🚀 Transmittal ${nextTransmittalNo} logged in /emails & status updated to "Under Consultant Review"!`
    );
  };

  // ============================================================================
  // COMPUTED VALUES: FILE & FOLDER NAMING GENERATOR (TAB 3)
  // ============================================================================

  const activeCodingRule = useMemo(
    () => FILE_CODING_RULES.find((r) => r.categoryCode === coderCategory) || FILE_CODING_RULES[0],
    [coderCategory]
  );

  const generatedFileAndFolder = useMemo(() => {
    const cleanParty = coderPartyOrDesc.trim().replace(/\s+/g, '') || 'General';
    const seq2 = coderSequence.slice(-2).padStart(2, '0');
    const seq4 = coderSequence.padStart(4, '0');
    const projObj = NEXUS_PROJECTS.find((p) => p.code === coderProject) || NEXUS_PROJECTS[0];

    let fileName = '';
    let subFolder = '';

    if (coderCategory === 'DC') {
      // Official Nexus DC Submittal code inside filename
      const subCode = `${coderSubtype}${coderDisciplineShort}${coderClause}${seq2}`;
      fileName = `${coderProject}-DC-${subCode}-${coderRevision}_${cleanParty}_${coderDate}.${coderExtension}`;
      subFolder = `${coderSubtype} - ${coderDisciplineShort} (${coderClause})`;
    } else if (coderCategory === 'TDC' || coderCategory === 'TC' || coderCategory === 'C000' || coderCategory === 'MC000') {
      const catTag = coderCategory === 'C000' ? 'CON' : coderCategory === 'MC000' ? 'MC' : coderCategory;
      fileName = `${coderProject}-${catTag}-${coderSubtype}-${seq4}-${coderRevision}_${cleanParty}_${coderDate}.${coderExtension}`;
      subFolder = `${coderSubtype}`;
    } else {
      // Financial / Procurement codes: NPO, RCB, POP, CPO, ST, INV
      fileName = `${coderProject}-${coderCategory}-${seq4}-${coderRevision}_${cleanParty}_${coderDate}.${coderExtension}`;
      subFolder = `${coderDate.slice(0, 7)} (${coderSubtype})`;
    }

    const folderPath = `/Projects/${projObj.name}/${activeCodingRule.folderPrefix}/${subFolder}/`;
    const fullArchiveUri = `${folderPath}${fileName}`;

    return { fileName, folderPath, fullArchiveUri };
  }, [
    coderCategory,
    coderProject,
    coderSubtype,
    coderDisciplineShort,
    coderClause,
    coderSequence,
    coderRevision,
    coderPartyOrDesc,
    coderDate,
    coderExtension,
    activeCodingRule,
  ]);

  // ============================================================================
  // COMPUTED VALUES: 51-CLAUSE MATRIX FILTER (TAB 4)
  // ============================================================================

  const filteredClauses = useMemo(() => {
    return FIFTY_ONE_CLAUSES.filter((c) => {
      if (matrixDisciplineFilter !== 'ALL' && c.discipline !== matrixDisciplineFilter) return false;
      if (matrixSearch.trim()) {
        const q = matrixSearch.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.nameAr.toLowerCase().includes(q) ||
          c.discipline.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [matrixDisciplineFilter, matrixSearch]);

  return (
    <div className="space-y-6 text-[#192631]">
      {/* Guided Lifecycle Step Banner */}
      <GuidedStepBanner
        lifecycleStageNumber={2}
        moduleTitleEn="Submittals Register & Document Coding"
        moduleTitleAr="سجل الاعتمادات الهندسية وتكويد المستندات"
        activeStepId={activeTab}
        onSelectStep={(id) => setActiveTab(id as any)}
        steps={[
          {
            id: 'register',
            stepNum: 1,
            titleEn: 'Log Submittal & Track Code A/B Approval',
            titleAr: 'تسجيل الاعتماد ومتابعة كود A/B',
            actionHintEn: 'Log MS/DR/MIR/SL/SIR packages and update consultant status to Code A/B to unlock PO.',
            actionHintAr: 'سجل اعتمادات MS/DR/MIR/SL/SIR وحدث حالة الاستشاري إلى كود A/B لفتح أمر الشراء.',
          },
          {
            id: 'transmittal',
            stepNum: 2,
            titleEn: 'Generate Formal Consultant Transmittal Email',
            titleAr: 'توليد إيميل الترانسميتال الرسمي للاستشاري',
            actionHintEn: 'Select pending submittals and dispatch a bilingual transmittal email to the consultant.',
            actionHintAr: 'اختر الاعتمادات الجاهزة وأرسل إيميل الترانسميتال الرسمي ثنائي اللغة للاستشاري.',
          },
          {
            id: 'filecoder',
            stepNum: 3,
            titleEn: 'Generate Standard File & Folder Code',
            titleAr: 'توليد الكود القياسي للملفات والفولدرات',
            actionHintEn: 'Build standardized file names and server folder paths for DC, TDC, NPO, and RCB records.',
            actionHintAr: 'أنشئ أسماء الملفات ومسارات الأرشفة القياسية لمستندات DC وTDC وNPO وRCB.',
          },
          {
            id: 'matrix',
            stepNum: 4,
            titleEn: 'Reference 51 Submittal Clauses & Abbreviations',
            titleAr: 'مصفوفة الـ 51 بند اعتماد ودليل الاختصارات',
            actionHintEn: 'Browse all 51 architectural, civil, electrical, and mechanical submittal clause codes.',
            actionHintAr: 'استعرض جميع أكواد الـ 51 بند المعتمدة للتخصصات المعمارية والمدنية والكهربائية والميكانيكية.',
          },
        ]}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#123524]/25 bg-white/80 backdrop-blur-md px-4 py-3 text-sm font-medium text-[#123524] shadow-2xl backdrop-blur-md">
          <Sparkles className="h-4 w-4 shrink-0 text-[#123524]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e04b2a]/25 bg-[#e04b2a]/10 px-3 py-1 text-xs font-semibold text-[#e04b2a]">
              <FileCode2 className="h-3.5 w-3.5" />
              <span>Nexus • DOCUMENT CONTROL & CODING ENGINE (02. DC)</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#192631] sm:text-3xl">
              Document Control, Submittals Register & Auto-Transmittal Hub
            </h2>
            <p className="max-w-3xl text-sm text-[#192631]/70">
              Unified 51-Clause Submittal Matrix (MS / DR / MIR / SL / SIR), Consultant Action Gatekeeper (`Code A & B`
              Procurement PO Unlocker), Eng. Pierre’s Auto-Email Transmittal Generator, and Standard File Naming Engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e04b2a] px-4 py-2.5 text-sm font-semibold text-[#192631] shadow-lg shadow-indigo-600/25 transition hover:bg-[#c83e1f]"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Submittal / Auto-Code</span>
            </button>
            <button
              onClick={() => setActiveTab('transmittal')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#123524]/25 bg-[#123524]/10 px-4 py-2.5 text-sm font-semibold text-[#123524] transition hover:bg-[#123524]/10"
            >
              <Mail className="h-4 w-4" />
              <span>Generate Consultant Email</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Sub-Tabs Navigation */}
        <div className="mt-6 grid grid-cols-1 gap-2 border-t border-[#192631]/10 pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-start transition ${
              activeTab === 'register'
                ? 'border-indigo-500 bg-[#e04b2a]/10 text-[#192631] shadow-md shadow-indigo-500/10'
                : 'border-[#192631]/10 bg-white/80 backdrop-blur-md text-[#192631]/70 hover:border-[#192631]/10 hover:text-[#192631]'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e04b2a]/10 text-[#e04b2a]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold uppercase tracking-wider text-[#e04b2a]">
                Tab 1 • MS / DR / MIR / SL / SIR
              </div>
              <div className="truncate text-sm font-bold text-[#192631]">Submittals & Inspection Register</div>
              <div className="truncate text-xs text-[#192631]/70">سجل الاعتمادات والاستلامات</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('transmittal')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-start transition ${
              activeTab === 'transmittal'
                ? 'border-emerald-500 bg-[#123524]/10 text-[#192631] shadow-md shadow-emerald-500/10'
                : 'border-[#192631]/10 bg-white/80 backdrop-blur-md text-[#192631]/70 hover:border-[#192631]/10 hover:text-[#192631]'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#123524]/10 text-[#123524]">
              <Send className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold uppercase tracking-wider text-[#123524]">
                Tab 2 • Eng. Pierre Workflow
              </div>
              <div className="truncate text-sm font-bold text-[#192631]">Auto-Email & Transmittal Engine</div>
              <div className="truncate text-xs text-[#192631]/70">مولد الإيميلات الرسمية والترانسميتال</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('filecoder')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-start transition ${
              activeTab === 'filecoder'
                ? 'border-amber-500 bg-amber-500/15 text-white shadow-md shadow-amber-500/10'
                : 'border-[#192631]/10 bg-white/80 backdrop-blur-md text-[#192631]/70 hover:border-[#192631]/10 hover:text-[#192631]'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-[#b45309]">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold uppercase tracking-wider text-[#b45309]">
                Tab 3 • TDC / DC / NPO / RCB
              </div>
              <div className="truncate text-sm font-bold text-[#192631]">File & Folder Naming Builder</div>
              <div className="truncate text-xs text-[#192631]/70">مولد تكويد الملفات والفولدرات القياسي</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-start transition ${
              activeTab === 'matrix'
                ? 'border-sky-500 bg-sky-500/15 text-white shadow-md shadow-sky-500/10'
                : 'border-[#192631]/10 bg-white/80 backdrop-blur-md text-[#192631]/70 hover:border-[#192631]/10 hover:text-[#192631]'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-[#192631]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold uppercase tracking-wider text-[#192631]">
                Tab 4 • 28 AR / 8 CV / 7 EL / 8 MC
              </div>
              <div className="truncate text-sm font-bold text-[#192631]">51-Clause Matrix & Dictionary</div>
              <div className="truncate text-xs text-[#192631]/70">دليل الأكواد والـ 51 بند القياسي</div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: SUBMITTALS & INSPECTION REGISTER
         ===================================================================== */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#192631]/70">
                <span>Total Submittals</span>
                <Layers className="h-4 w-4 text-[#e04b2a]" />
              </div>
              <div className="mt-2 text-2xl font-bold text-[#192631]">{kpiStats.total}</div>
              <div className="mt-1 text-xs text-[#192631]/70">إجمالي السجل الهندسي</div>
            </div>

            <div className="rounded-xl border border-[#123524]/25 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#123524]">
                <span>Approved (A & B)</span>
                <CheckCircle2 className="h-4 w-4 text-[#123524]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#123524]">{kpiStats.approvedTotal}</span>
                <span className="text-xs text-[#123524]/80">
                  (A: {kpiStats.codeA} | B: {kpiStats.codeB})
                </span>
              </div>
              <div className="mt-1 text-xs text-[#123524]/80">متاح لأوامر الشراء (PO Unlocked)</div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#b45309]">
                <span>Revise & Resubmit (C)</span>
                <AlertTriangle className="h-4 w-4 text-[#b45309]" />
              </div>
              <div className="mt-2 text-2xl font-bold text-[#b45309]">{kpiStats.codeC}</div>
              <div className="mt-1 text-xs text-[#b45309]/80">Code C • يعاد التقديم بملاحظات</div>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-red-700">
                <span>Rejected (Code D)</span>
                <XCircle className="h-4 w-4 text-red-700" />
              </div>
              <div className="mt-2 text-2xl font-bold text-red-700">{kpiStats.codeD}</div>
              <div className="mt-1 text-xs text-red-700/80">Code D • مرفوض من الاستشاري</div>
            </div>

            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#192631]">
                <span>Under Review</span>
                <Clock className="h-4 w-4 text-[#192631]" />
              </div>
              <div className="mt-2 text-2xl font-bold text-[#192631]">{kpiStats.underReview}</div>
              <div className="mt-1 text-xs text-[#192631]/80">قيد المراجعة لدى الاستشاري</div>
            </div>

            <div className="rounded-xl border border-[#192631]/10 bg-[#192631]/[0.05] p-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#192631]/85">
                <span>Pending Submission</span>
                <FileText className="h-4 w-4 text-[#192631]/70" />
              </div>
              <div className="mt-2 text-2xl font-bold text-[#192631]">{kpiStats.toSubmit}</div>
              <div className="mt-1 text-xs text-[#192631]/70">مطلوب تقديمه (جاهز للإرسال)</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-4 shadow-lg">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#192631]/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code (MSARGP01), item, vendor..."
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 py-2 pl-9 pr-3 text-sm text-[#192631] placeholder-[#192631]/40 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Project Filter */}
              <div>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Projects (جميع المشاريع)</option>
                  {NEXUS_PROJECTS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Log Type Filter */}
              <div>
                <select
                  value={filterLogType}
                  onChange={(e) => setFilterLogType(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Log Types (MS / DR / MIR / SL / SIR)</option>
                  {LOG_TYPES.map((lt) => (
                    <option key={lt.code} value={lt.code}>
                      {lt.code} - {lt.nameEn} ({lt.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Discipline Filter */}
              <div>
                <select
                  value={filterDiscipline}
                  onChange={(e) => setFilterDiscipline(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Disciplines (ARCH / CIVIL / ELEC / MECH)</option>
                  {DISCIPLINES.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.key} ({d.short}) - {d.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Status Codes (جميع الحالات)</option>
                  <option value="A">Code A - Approved (معتمد)</option>
                  <option value="B">Code B - Approved as Noted (معتمد بملاحظات)</option>
                  <option value="C">Code C - Revise & Resubmit (يعاد التقديم)</option>
                  <option value="D">Code D - Rejected (مرفوض)</option>
                  <option value="Under Review">Under Consultant Review (قيد المراجعة)</option>
                  <option value="To Submit">Pending Submission (مطلوب تقديمه)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submittals Register Table */}
          <div className="overflow-hidden rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#192631]/10 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#e04b2a]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#192631]">
                  Official Submittals & Inspections Log ({filteredSubmittals.length} Records)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#192631]/70">
                <span className="inline-flex items-center gap-1 rounded-md border border-[#123524]/25 bg-[#123524]/10 px-2 py-0.5 text-[#123524]">
                  <Unlock className="h-3 w-3" /> Code A / Code B = Unlocks Material for Procurement PO (NPO)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-xs uppercase tracking-wider text-[#192631]/70">
                    <th className="px-4 py-3">Nexus Code & Rev</th>
                    <th className="px-4 py-3">Project & Log</th>
                    <th className="px-4 py-3">Discipline & Clause</th>
                    <th className="px-4 py-3">Submittal Description & Vendor</th>
                    <th className="px-4 py-3">Consultant Status & PO Gate</th>
                    <th className="px-4 py-3 text-start">Quick Actions (إجراءات سريعة)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredSubmittals.map((item) => {
                    const statusMeta = getStatusBadge(item.status);
                    const StatusIcon = statusMeta.icon;
                    const logTypeMeta = LOG_TYPES.find((l) => l.code === item.logType);
                    return (
                      <tr key={item.id} className="transition hover:bg-[#192631]/[0.05]">
                        {/* Code & Revision */}
                        <td className="whitespace-nowrap px-4 py-3.5 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#e04b2a]">{item.code}</span>
                            <span className="rounded border border-[#192631]/10 bg-[#192631]/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-[#192631]/85">
                              {item.revision}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-[#192631]/60">Submitted: {item.submittedDate}</div>
                          {item.responseDate && (
                            <div className="text-[11px] text-[#123524]/80">Reply: {item.responseDate}</div>
                          )}
                        </td>

                        {/* Project & Log Type */}
                        <td className="whitespace-nowrap px-4 py-3.5 align-top">
                          <div className="font-semibold text-[#192631]">{item.projectCode}</div>
                          <div className="text-xs text-[#192631]/70">{item.projectName.split(' - ')[1]}</div>
                          {logTypeMeta && (
                            <span
                              className={`mt-1.5 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${logTypeMeta.badgeColor}`}
                            >
                              {item.logType} • {logTypeMeta.nameAr}
                            </span>
                          )}
                        </td>

                        {/* Discipline & Clause */}
                        <td className="whitespace-nowrap px-4 py-3.5 align-top">
                          <div className="inline-flex items-center gap-1.5 rounded-md border border-[#192631]/10 bg-[#192631]/[0.05] px-2 py-0.5 text-xs font-semibold text-[#192631]">
                            <span>{item.discipline}</span>
                            <span className="text-[#192631]/60">/</span>
                            <span className="font-mono text-[#e04b2a]">{item.clauseCode}</span>
                          </div>
                          <div className="mt-1 text-xs font-medium text-[#192631]/85">{item.clauseNameEn}</div>
                          <div className="text-xs text-[#192631]/70">{item.clauseNameAr}</div>
                        </td>

                        {/* Submittal Title, Attachments & Vendor */}
                        <td className="max-w-md px-4 py-3.5 align-top">
                          <div className="font-medium text-[#192631]">{item.titleEn}</div>
                          <div className="mt-0.5 text-xs text-[#192631]/85">
                            {item.titleAr}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#192631]/70">
                            <span className="rounded bg-[#192631]/[0.05] px-2 py-0.5 text-[#192631]/85">
                              🏭 {item.manufacturerOrSub}
                            </span>
                            {item.attachments.map((att, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded border border-[#192631]/10 bg-[#f5f5f5]/90 px-2 py-0.5 font-mono text-[11px] text-[#192631]/70"
                              >
                                <Paperclip className="h-3 w-3 text-[#e04b2a]" />
                                {att.name} ({att.size})
                              </span>
                            ))}
                          </div>
                          {item.notes && <div className="mt-1.5 text-xs italic text-[#192631]/70">“{item.notes}”</div>}
                        </td>

                        {/* Status Badge & Procurement PO Gate */}
                        <td className="whitespace-nowrap px-4 py-3.5 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusMeta.classes}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            <span>{statusMeta.short}</span>
                          </span>

                          <div className="mt-2">
                            {item.procurementUnlocked ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-[#123524]/25 bg-[#123524]/10 px-2 py-0.5 text-[11px] font-semibold text-[#123524]">
                                <Unlock className="h-3 w-3" /> PO Creation Unlocked (متاح لأمر الشراء)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-red-700">
                                <Lock className="h-3 w-3" /> PO Locked (يتطلب Code A/B)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-start align-top">
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => handleQuickEmailForRow(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e04b2a]/25 bg-[#e04b2a]/10 px-2.5 py-1.5 text-xs font-semibold text-[#e04b2a] transition hover:bg-[#c83e1f]/25"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Generate Consultant Email (إرسال إيميل للاستشاري)</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <span className="mr-1 text-[11px] text-[#192631]/70">Change Status:</span>
                              {(['A', 'B', 'C', 'D', 'Under Review'] as SubmittalStatusCode[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleStatusChange(item.id, st)}
                                  title={`Set status to ${st}`}
                                  className={`rounded px-2 py-0.5 text-xs font-bold transition ${
                                    item.status === st
                                      ? 'bg-[#e04b2a] text-[#192631] shadow'
                                      : 'border border-[#192631]/10 bg-[#192631]/[0.05] text-[#192631]/85 hover:border-slate-500'
                                  }`}
                                >
                                  {st === 'Under Review' ? 'Rev' : st}
                                </button>
                              ))}
                            </div>
                          </div>
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
          TAB 2: AUTO-EMAIL & TRANSMITTAL GENERATOR (ENG. PIERRE WORKFLOW)
         ===================================================================== */}
      {activeTab === 'transmittal' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Package Selector & Recipient Configuration */}
          <div className="space-y-5 lg:col-span-5">
            <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#192631]">1. Select Submittals & Consultant</h3>
                  <p className="text-xs text-[#192631]/70">
                    اختر الاعتمادات أو الشوب دروينج لتوليد إيميل الترانسميتال الرسمي أوتوماتيكياً
                  </p>
                </div>
                <span className="rounded-lg border border-[#123524]/25 bg-[#123524]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#123524]">
                  {nextTransmittalNo}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    Project (المشروع)
                  </label>
                  <select
                    value={transmittalProject}
                    onChange={(e) => {
                      const code = e.target.value;
                      setTransmittalProject(code);
                      const proj = NEXUS_PROJECTS.find((p) => p.code === code);
                      if (proj) {
                        setCustomRecipientEmail(proj.consultantEmail);
                        setCustomCcEmail(`${proj.ownerRepEmail}; tech.office@nexus-nexus.com`);
                      }
                    }}
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-emerald-500 focus:outline-none"
                  >
                    {NEXUS_PROJECTS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                      Consultant Email (To)
                    </label>
                    <input
                      type="text"
                      value={customRecipientEmail}
                      onChange={(e) => setCustomRecipientEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                      Owner Rep & Tech Office (CC)
                    </label>
                    <input
                      type="text"
                      value={customCcEmail}
                      onChange={(e) => setCustomCcEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-xs text-[#192631] focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Language Mode */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    Transmittal Template Language (لغة الإيميل الرسمي)
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {(['Bilingual', 'English', 'Arabic'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setTransmittalLanguage(lang)}
                        className={`rounded-xl border py-2 text-xs font-semibold transition ${
                          transmittalLanguage === lang
                            ? 'border-emerald-500 bg-[#123524]/10 text-[#123524]'
                            : 'border-[#192631]/10 bg-[#f5f5f5]/90 text-[#192631]/70 hover:border-slate-600'
                        }`}
                      >
                        {lang === 'Bilingual' ? 'Bilingual (عربي + EN)' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checklist of Submittals */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                      Attach Submittals / Shop Drawings ({selectedSubmittalIds.length} Selected)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSubmittalIds(
                          submittals.filter((s) => s.projectCode === transmittalProject).map((s) => s.id)
                        )
                      }
                      className="text-xs font-medium text-[#e04b2a] hover:underline"
                    >
                      Select All Project Items
                    </button>
                  </div>

                  <div className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-2.5">
                    {submittals.map((s) => {
                      const isChecked = selectedSubmittalIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 transition ${
                            isChecked
                              ? 'border-[#123524]/25 bg-[#123524]/10'
                              : 'border-[#192631]/10 bg-white/80 backdrop-blur-md hover:border-[#192631]/10'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubmittalIds((prev) => [...prev, s.id]);
                              } else {
                                setSelectedSubmittalIds((prev) => prev.filter((id) => id !== s.id));
                              }
                            }}
                            className="mt-1 h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-[#e04b2a]">
                                {s.code} ({s.revision})
                              </span>
                              <span className="rounded bg-[#192631]/[0.05] px-1.5 py-0.5 text-[10px] text-[#192631]/85">
                                {s.projectCode} • {s.logType}
                              </span>
                            </div>
                            <div className="truncate text-xs text-[#192631]">{s.titleEn}</div>
                            <div className="truncate text-[11px] text-[#192631]/70">
                              {s.titleAr}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Preview & Sent History */}
          <div className="space-y-5 lg:col-span-7">
            <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#192631]/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#192631]">
                    2. Auto-Generated Formal Transmittal Email Preview
                  </h3>
                  <p className="text-xs text-[#192631]/70">
                    جاهز للنسخ أو الإرسال المباشر مع الأرشفة التلقائية في فولدر /emails بالمشروع
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopyText(
                        'full',
                        `Subject: ${generatedEmailContent.subject}\nTo: ${customRecipientEmail}\nCC: ${customCcEmail}\n\n${generatedEmailContent.body}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#192631]/10 bg-[#192631]/[0.05] px-3 py-1.5 text-xs font-semibold text-[#192631] transition hover:border-slate-600"
                  >
                    {copiedEmailField === 'full' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#123524]" />
                        <span className="text-[#123524]">Copied Full Email!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Subject + Body</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSendAndLogTransmittal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send & Log in Project Correspondence (/emails)</span>
                  </button>
                </div>
              </div>

              {/* Subject Preview */}
              <div className="mt-4 rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3">
                <div className="flex items-center justify-between text-xs text-[#192631]/70">
                  <span className="font-semibold uppercase">Auto-Formatted Subject Line:</span>
                  <button
                    onClick={() => handleCopyText('subject', generatedEmailContent.subject)}
                    className="inline-flex items-center gap-1 text-[#e04b2a] hover:underline"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedEmailField === 'subject' ? 'Copied!' : 'Copy Subject'}
                  </button>
                </div>
                <div className="mt-1 font-mono text-xs font-semibold text-[#123524]">
                  {generatedEmailContent.subject}
                </div>
              </div>

              {/* Body Preview */}
              <div className="mt-3">
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4 font-sans text-xs leading-relaxed text-[#192631]">
                  {generatedEmailContent.body}
                </pre>
              </div>
            </div>

            {/* Sent Transmittal History Log (/emails) */}
            <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#123524]" />
                  <h4 className="text-sm font-bold text-[#192631]">
                    Logged Project Correspondence & Sent Transmittals (/emails)
                  </h4>
                </div>
                <span className="text-xs text-[#192631]/70">{transmittalHistory.length} Archived Dispatches</span>
              </div>

              <div className="mt-3 space-y-2.5">
                {transmittalHistory.map((trn) => (
                  <div
                    key={trn.id}
                    className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3 text-xs transition hover:border-[#192631]/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#123524]/10 px-2 py-0.5 font-mono font-bold text-[#123524]">
                          {trn.transmittalNo}
                        </span>
                        <span className="font-semibold text-[#192631]">{trn.subject}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#192631]/70">{trn.sentAt}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-[#192631]/70">
                      <span>To: {trn.recipientEmail}</span>
                      <span>•</span>
                      <span>Submittals: {trn.submittalCodes.join(', ')}</span>
                      <span>•</span>
                      <span className="font-mono text-[#e04b2a]">{trn.folderPath}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: INTERACTIVE FILE & FOLDER NAMING GENERATOR
         ===================================================================== */}
      {activeTab === 'filecoder' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Interactive Builder Controls */}
          <div className="space-y-5 lg:col-span-7">
            <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
              <div className="border-b border-[#192631]/10 pb-3">
                <h3 className="text-base font-bold text-[#192631]">
                  Interactive File & Folder Naming Builder (مولد تكويد الملفات والفولدرات القياسي)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  Enforces the uploaded spreadsheet coding rules across 01. TDC, 02. DC, 03. TC, 04. C000,
                  MC000, and Financial Vouchers (`NPO`, RCB, POP, CPO, ST, INV).
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Category Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    1. Standard Document Category (فئة المستند / الفولدر الرئيسي)
                  </label>
                  <select
                    value={coderCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value;
                      setCoderCategory(nextCat);
                      const rule = FILE_CODING_RULES.find((r) => r.categoryCode === nextCat);
                      if (rule && rule.subtypes[0]) {
                        setCoderSubtype(rule.subtypes[0].code);
                      }
                    }}
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2.5 text-sm text-[#192631] focus:border-amber-500 focus:outline-none"
                  >
                    {FILE_CODING_RULES.map((rule) => (
                      <option key={rule.categoryCode} value={rule.categoryCode}>
                        [{rule.categoryCode}] {rule.folderPrefix} — {rule.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Code */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    2. Project Code (كود المشروع)
                  </label>
                  <select
                    value={coderProject}
                    onChange={(e) => setCoderProject(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-amber-500 focus:outline-none"
                  >
                    {NEXUS_PROJECTS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Subtype */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    3. Document Subtype (النوع الفرعي)
                  </label>
                  <select
                    value={coderSubtype}
                    onChange={(e) => setCoderSubtype(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-amber-500 focus:outline-none"
                  >
                    {activeCodingRule.subtypes.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.code} — {st.labelEn} ({st.labelAr})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extra Discipline & 51-Clause pickers when Category === 'DC' */}
                {coderCategory === 'DC' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#e04b2a]">
                        DC Discipline Code (AR / CV / EL / MC)
                      </label>
                      <select
                        value={coderDisciplineShort}
                        onChange={(e) => {
                          const sh = e.target.value as DisciplineShortCode;
                          setCoderDisciplineShort(sh);
                          const firstClause = FIFTY_ONE_CLAUSES.find((c) => c.disciplineShort === sh);
                          if (firstClause) setCoderClause(firstClause.code);
                        }}
                        className="mt-1.5 w-full rounded-xl border border-[#e04b2a]/25 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-indigo-500 focus:outline-none"
                      >
                        {DISCIPLINES.map((d) => (
                          <option key={d.short} value={d.short}>
                            {d.short} — {d.nameEn} ({d.nameAr})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#e04b2a]">
                        51-Clause Sub-Category (كود البند)
                      </label>
                      <select
                        value={coderClause}
                        onChange={(e) => setCoderClause(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-[#e04b2a]/25 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-indigo-500 focus:outline-none"
                      >
                        {FIFTY_ONE_CLAUSES.filter((c) => c.disciplineShort === coderDisciplineShort).map((c) => (
                          <option key={c.id} value={c.code}>
                            {c.code} — {c.nameEn} ({c.nameAr})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Sequence & Revision */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    4. Sequence Number (رقم المسلسل)
                  </label>
                  <input
                    type="text"
                    value={coderSequence}
                    onChange={(e) => setCoderSequence(e.target.value)}
                    placeholder="0001"
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 font-mono text-sm text-[#192631] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    5. Revision Code (رقم الإصدار)
                  </label>
                  <select
                    value={coderRevision}
                    onChange={(e) => setCoderRevision(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 font-mono text-sm text-[#192631] focus:border-amber-500 focus:outline-none"
                  >
                    <option value="R00">R00 (First Issue)</option>
                    <option value="R01">R01 (Revision 1)</option>
                    <option value="R02">R02 (Revision 2)</option>
                    <option value="R03">R03 (Revision 3)</option>
                    <option value="FINAL">FINAL (Approved Final)</option>
                  </select>
                </div>

                {/* Vendor / Party / Description & Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                    6. Supplier / Party / Subject Tag (اسم المورد أو البيان)
                  </label>
                  <input
                    type="text"
                    value={coderPartyOrDesc}
                    onChange={(e) => setCoderPartyOrDesc(e.target.value)}
                    placeholder="KnaufEgypt / AlNourPlastering"
                    className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                      Date (التاريخ)
                    </label>
                    <input
                      type="date"
                      value={coderDate}
                      onChange={(e) => setCoderDate(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-2.5 py-2 text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#192631]/70">
                      Ext (الامتداد)
                    </label>
                    <select
                      value={coderExtension}
                      onChange={(e) => setCoderExtension(e.target.value as 'pdf' | 'dwg' | 'xlsx')}
                      className="mt-1.5 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-2.5 py-2 font-mono text-xs text-[#192631] focus:border-amber-500 focus:outline-none"
                    >
                      <option value="pdf">.pdf</option>
                      <option value="dwg">.dwg (CAD)</option>
                      <option value="xlsx">.xlsx (Excel)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel: Standardized Filename & Folder Path */}
          <div className="space-y-5 lg:col-span-5">
            <div className="rounded-2xl border border-amber-500/30 bg-white/80 backdrop-blur-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b45309]">
                <Sparkles className="h-4 w-4" />
                <span>Generated Standard Output (جاهز للنسخ الفوري)</span>
              </div>

              {/* Standardized Filename */}
              <div className="mt-4 rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4">
                <div className="flex items-center justify-between text-xs text-[#192631]/70">
                  <span>Official Standardized File Name (اسم الملف القياسي):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedFileAndFolder.fileName);
                      setCopiedPathKey('file');
                      setTimeout(() => setCopiedPathKey(null), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-[#b45309] hover:bg-amber-500/30"
                  >
                    {copiedPathKey === 'file' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedPathKey === 'file' ? 'Copied!' : 'Copy Filename'}</span>
                  </button>
                </div>
                <div className="mt-2 break-all font-mono text-sm font-bold text-[#b45309]">
                  {generatedFileAndFolder.fileName}
                </div>
              </div>

              {/* Standardized Server Folder Path */}
              <div className="mt-3 rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4">
                <div className="flex items-center justify-between text-xs text-[#192631]/70">
                  <span>Target Server / Cloud Folder Path (مسار الفولدر القياسي):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedFileAndFolder.folderPath);
                      setCopiedPathKey('folder');
                      setTimeout(() => setCopiedPathKey(null), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#e04b2a]/10 px-2.5 py-1 text-xs font-semibold text-[#e04b2a] hover:bg-[#c83e1f]/30"
                  >
                    {copiedPathKey === 'folder' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedPathKey === 'folder' ? 'Copied!' : 'Copy Folder Path'}</span>
                  </button>
                </div>
                <div className="mt-2 break-all font-mono text-xs text-[#e04b2a]">
                  {generatedFileAndFolder.folderPath}
                </div>
              </div>

              {/* Complete URI */}
              <div className="mt-3 rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-4">
                <div className="flex items-center justify-between text-xs text-[#192631]/70">
                  <span>Full Archive URI (المسار الكامل شامل الملف):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedFileAndFolder.fullArchiveUri);
                      setCopiedPathKey('full');
                      setTimeout(() => setCopiedPathKey(null), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#123524] hover:underline"
                  >
                    {copiedPathKey === 'full' ? 'Copied URI!' : 'Copy Full URI'}
                  </button>
                </div>
                <div className="mt-1.5 break-all font-mono text-[11px] text-[#192631]/85">
                  {generatedFileAndFolder.fullArchiveUri}
                </div>
              </div>
            </div>

            {/* Quick Reference Card for All 11 Folder & Financial Categories */}
            <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#192631]/85">
                Standard Folder & Voucher Coding Rules Summary
              </h4>
              <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
                {FILE_CODING_RULES.map((rule) => (
                  <div
                    key={rule.categoryCode}
                    onClick={() => {
                      setCoderCategory(rule.categoryCode);
                      if (rule.subtypes[0]) setCoderSubtype(rule.subtypes[0].code);
                    }}
                    className={`cursor-pointer rounded-lg border p-2.5 text-xs transition ${
                      coderCategory === rule.categoryCode
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-[#192631]/10 bg-[#f5f5f5]/90 hover:border-[#192631]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#b45309]">{rule.folderPrefix}</span>
                      <span className="text-[#192631]/70">{rule.nameAr}</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#192631]/70">Example: {rule.example}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: 51-CLAUSE SUBMITTAL MATRIX & ABBREVIATIONS DICTIONARY
         ===================================================================== */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Discipline Summary Pill Bar (28 ARCH + 8 CIVIL + 7 ELEC + 8 MECH = 51) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <button
              onClick={() => setMatrixDisciplineFilter('ALL')}
              className={`rounded-xl border p-3.5 text-start transition ${
                matrixDisciplineFilter === 'ALL'
                  ? 'border-indigo-500 bg-[#e04b2a]/10 text-[#192631]'
                  : 'border-[#192631]/10 bg-white/80 backdrop-blur-md text-[#192631]/85 hover:border-[#192631]/10'
              }`}
            >
              <div className="text-xs font-semibold uppercase text-[#e04b2a]">All Disciplines</div>
              <div className="mt-1 text-2xl font-bold">51 Clauses</div>
              <div className="text-xs text-[#192631]/70">إجمالي البنود القياسية</div>
            </button>

            {DISCIPLINES.map((d) => (
              <button
                key={d.key}
                onClick={() => setMatrixDisciplineFilter(d.key)}
                className={`rounded-xl border p-3.5 text-start transition ${
                  matrixDisciplineFilter === d.key
                    ? 'border-indigo-500 bg-[#e04b2a]/10 text-[#192631]'
                    : 'border-[#192631]/10 bg-white/80 backdrop-blur-md text-[#192631]/85 hover:border-[#192631]/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#e04b2a]">
                    {d.key} ({d.short})
                  </span>
                  <span className="rounded bg-[#192631]/[0.05] px-2 py-0.5 font-mono text-xs text-[#192631]">
                    {d.clauseCount} Clauses
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold text-[#192631]">{d.nameEn}</div>
                <div className="text-xs text-[#192631]/70">{d.nameAr}</div>
              </button>
            ))}
          </div>

          {/* Search Bar for 51 Clauses */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#192631]/70" />
              <input
                type="text"
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                placeholder="Search 51 Clauses by code (GP, TL, LW, CS, RC) or Arabic/English name..."
                className="w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 py-2 pl-9 pr-4 text-sm text-[#192631] placeholder-[#192631]/40 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-[#192631]/70">
              Showing <span className="font-bold text-[#192631]">{filteredClauses.length}</span> of 51 Standard Clauses
            </div>
          </div>

          {/* 51-Clause Matrix Table */}
          <div className="overflow-hidden rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-[#192631]/10 bg-[#f5f5f5]/90 text-xs uppercase tracking-wider text-[#192631]/70">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Discipline</th>
                    <th className="px-4 py-3">Clause Code</th>
                    <th className="px-4 py-3">Clause Name (English)</th>
                    <th className="px-4 py-3 text-start">اسم البند (عربي)</th>
                    <th className="px-4 py-3">Example Nexus Submittal Code</th>
                    <th className="px-4 py-3 text-start">Use in Submittal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredClauses.map((clause) => {
                    const exampleCode = `MS${clause.disciplineShort}${clause.code}01`;
                    return (
                      <tr key={clause.id} className="transition hover:bg-[#192631]/[0.05]">
                        <td className="px-4 py-2.5 font-mono text-xs text-[#192631]/60">{clause.id}</td>
                        <td className="px-4 py-2.5">
                          <span className="rounded border border-[#192631]/10 bg-[#192631]/[0.05] px-2 py-0.5 font-mono text-xs font-semibold text-[#192631]">
                            {clause.discipline} ({clause.disciplineShort})
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-sm font-bold text-[#192631]">{clause.code}</td>
                        <td className="px-4 py-2.5 font-medium text-[#192631]">{clause.nameEn}</td>
                        <td className="px-4 py-2.5 text-start font-medium text-[#192631]">
                          {clause.nameAr}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-[#e04b2a]">{exampleCode}</td>
                        <td className="px-4 py-2.5 text-start">
                          <button
                            onClick={() => {
                              setNewDiscipline(clause.discipline);
                              setNewClauseCode(clause.code);
                              setIsNewModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#e04b2a]/25 bg-[#e04b2a]/10 px-2.5 py-1 text-xs font-semibold text-[#e04b2a] hover:bg-[#c83e1f]/20"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Create {exampleCode}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Document Control & Finance Abbreviations Dictionary */}
          <div className="rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-5 shadow-xl">
            <h3 className="text-base font-bold text-[#192631]">
              Official Document Control & Financial Coding Dictionary (قاموس الاختصارات والأكواد القياسي)
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ABBREVIATIONS_DICTIONARY.map((abbr) => (
                <div
                  key={abbr.code}
                  className="rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 p-3.5 transition hover:border-[#192631]/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#e04b2a]/10 px-2 py-0.5 font-mono text-sm font-bold text-[#e04b2a]">
                      {abbr.code}
                    </span>
                    <span className="text-[11px] text-[#192631]/70">{abbr.category}</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#192631]">{abbr.en}</div>
                  <div className="mt-1 text-xs text-[#192631]/70">
                    {abbr.ar}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: + NEW SUBMITTAL / AUTO-GENERATE NEXUS CODE
         ===================================================================== */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192631]/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#192631]/10 bg-white/80 backdrop-blur-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#192631]">
                  + New Submittal & Auto-Code Generator (توليد كود اعتماد جديد)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  Select Log Type + Discipline + 51-Clause Sub-Category to auto-build the official Nexus code.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-lg border border-[#192631]/10 bg-[#192631]/[0.05] px-3 py-1 text-xs font-semibold text-[#192631]/85 hover:bg-[#192631]/[0.12]"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmittal} className="mt-5 space-y-4">
              {/* Live Generated Code Preview Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e04b2a]/25 bg-indigo-950/40 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#e04b2a]">
                    Official Auto-Generated Nexus Code
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-2xl font-extrabold text-[#192631]">{autoGeneratedModalCode}</span>
                    <span className="rounded bg-[#e04b2a]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#e04b2a]">
                      {newRevision}
                    </span>
                  </div>
                </div>
                <div className="text-start text-xs text-[#192631]/85">
                  <div>
                    Formula: <span className="font-mono text-[#e04b2a]">[LogType][Disc][Clause][Seq]</span>
                  </div>
                  <div className="text-[#192631]/70">Project: {newProjectCode}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#192631]/70">Project (المشروع)</label>
                  <select
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  >
                    {NEXUS_PROJECTS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#192631]/70">
                    Log Type (نوع السجل: MS/DR/MIR/SL/SIR)
                  </label>
                  <select
                    value={newLogType}
                    onChange={(e) => setNewLogType(e.target.value as LogTypeCode)}
                    className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  >
                    {LOG_TYPES.map((lt) => (
                      <option key={lt.code} value={lt.code}>
                        {lt.code} — {lt.nameEn} ({lt.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#192631]/70">
                    Discipline (التخصص الهندسي)
                  </label>
                  <select
                    value={newDiscipline}
                    onChange={(e) => {
                      const d = e.target.value as DisciplineKey;
                      setNewDiscipline(d);
                      const firstClause = FIFTY_ONE_CLAUSES.find((c) => c.discipline === d);
                      if (firstClause) setNewClauseCode(firstClause.code);
                    }}
                    className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  >
                    {DISCIPLINES.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.key} ({d.short}) — {d.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#192631]/70">
                    Sub-Category Clause (البند من الـ 51 بند)
                  </label>
                  <select
                    value={newClauseCode}
                    onChange={(e) => setNewClauseCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  >
                    {availableModalClauses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {c.nameEn} ({c.nameAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#192631]/70">Revision (الإصدار)</label>
                  <select
                    value={newRevision}
                    onChange={(e) => setNewRevision(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 font-mono text-sm text-[#192631]"
                  >
                    <option value="Rev 00">Rev 00 (Initial Submission)</option>
                    <option value="Rev 01">Rev 01 (Resubmission 1)</option>
                    <option value="Rev 02">Rev 02 (Resubmission 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#192631]/70">
                    Manufacturer / Supplier / Origin (المورد / المصنع)
                  </label>
                  <input
                    type="text"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    placeholder="e.g. Knauf Egypt / El-Swedy / Grohe"
                    className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#192631]/70">
                  Submittal Title (English Description)
                </label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Acoustic Gypsum Board Ceiling System with Shadow Gap Profiles"
                  className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#192631]/70">
                  وصف الاعتماد باللغة العربية
                </label>
                <input
                  type="text"
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: اعتماد نظام الأسقف المعلقة الجبسية العازلة للصوت شاملة البروفايلات"
                  className="mt-1 w-full rounded-xl border border-[#192631]/10 bg-[#f5f5f5]/90 px-3 py-2 text-sm text-[#192631]"
                />
              </div>

              {/* Simulated File Attachment Upload (.pdf, .dwg) */}
              <div className="rounded-xl border border-dashed border-[#192631]/10 bg-[#f5f5f5]/90 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#192631]/85">
                    <Upload className="h-4 w-4 text-[#e04b2a]" />
                    <span>Attached Submittal Package Files (.pdf Datasheets / .dwg Shop Drawings)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNewAttachments((prev) => [
                        ...prev,
                        {
                          name: `Sample_TestReport_${prev.length + 1}.pdf`,
                          type: 'pdf',
                          size: '2.4 MB',
                        },
                      ])
                    }
                    className="rounded-lg bg-[#192631]/[0.05] px-2.5 py-1 text-xs font-medium text-[#e04b2a] hover:bg-[#192631]/[0.12]"
                  >
                    + Simulate Attach .PDF/.DWG
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {newAttachments.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#192631]/10 bg-white/80 backdrop-blur-md px-2.5 py-1 font-mono text-xs text-[#192631]/85"
                    >
                      <Paperclip className="h-3 w-3 text-[#e04b2a]" />
                      {newProjectCode}-DC-{autoGeneratedModalCode}-{newRevision.replace(' ', '')}_{att.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#192631]/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-[#192631]/10 bg-[#192631]/[0.05] px-4 py-2 text-sm font-medium text-[#192631]/85 hover:bg-[#192631]/[0.12]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#e04b2a] px-5 py-2 text-sm font-bold text-[#192631] shadow-lg shadow-indigo-600/30 hover:bg-[#c83e1f]"
                >
                  Register {autoGeneratedModalCode} ({newRevision})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentControlHub;
