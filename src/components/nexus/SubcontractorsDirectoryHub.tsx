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
import { GuidedStepBanner } from './GuidedStepBanner';

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
    "id": "sub-01",
    "nexusCode": "SUB-ALUM-001",
    "tradeCode": "SUB-ALUM",
    "tradeLabelAr": "أعمال الألومنيوم والـ UPVC SUB-ALUM",
    "name": "A-ALUM001-Youssef Ahmed",
    "craftsmanTitle": "أعمال الألومنيوم والـ UPVC (Aluminum & UPVC Works)",
    "phone": "01010001379",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -192868.0,
    "retentionHeldEgp": 28225.15,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ALUM-001) — أعمال الألومنيوم والـ UPVC.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-02",
    "nexusCode": "SUB-ALUM-002",
    "tradeCode": "SUB-ALUM",
    "tradeLabelAr": "أعمال الألومنيوم والـ UPVC SUB-ALUM",
    "name": "A-ALUM003-Peter Samir",
    "craftsmanTitle": "أعمال الألومنيوم والـ UPVC (Aluminum & UPVC Works)",
    "phone": "01010002758",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 350.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ALUM-002) — أعمال الألومنيوم والـ UPVC.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-03",
    "nexusCode": "SUB-ALUM-003",
    "tradeCode": "SUB-ALUM",
    "tradeLabelAr": "أعمال الألومنيوم والـ UPVC SUB-ALUM",
    "name": "ALUM-Emil Amir",
    "craftsmanTitle": "أعمال الألومنيوم والـ UPVC (Aluminum & UPVC Works)",
    "phone": "01010004137",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -3400.0,
    "retentionHeldEgp": 1305.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ALUM-003) — أعمال الألومنيوم والـ UPVC.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-04",
    "nexusCode": "SUB-CARP-001",
    "tradeCode": "SUB-CRP",
    "tradeLabelAr": "نجارة أسطرجي وتشطيب أثاث SUB-CRP",
    "name": "A-CARP-OSTOGY-Ibrahim Ramsis",
    "craftsmanTitle": "نجارة أسطرجي وتشطيب أثاث (Furniture Polishing & Wood Finishing)",
    "phone": "01010005516",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 2250.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-CARP-001) — نجارة أسطرجي وتشطيب أثاث.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-05",
    "nexusCode": "SUB-CARP-002",
    "tradeCode": "SUB-CRP",
    "tradeLabelAr": "أعمال النجارة والباب والشباك SUB-CRP",
    "name": "CARP-Hany Gerges",
    "craftsmanTitle": "أعمال النجارة والباب والشباك (Carpentry, Doors & Windows)",
    "phone": "01010006895",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 2765.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-CARP-002) — أعمال النجارة والباب والشباك.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-06",
    "nexusCode": "SUB-CARP-003",
    "tradeCode": "SUB-CRP",
    "tradeLabelAr": "أعمال النجارة والتركيبات SUB-CRP",
    "name": "C-CARP001 John",
    "craftsmanTitle": "أعمال النجارة والتركيبات (Specialized Contracting Works)",
    "phone": "01010008274",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -872412.0,
    "retentionHeldEgp": 19074.9,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-CARP-003) — أعمال النجارة والتركيبات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-07",
    "nexusCode": "SUB-CARP-004",
    "tradeCode": "SUB-CRP",
    "tradeLabelAr": "أعمال النجارة والتركيبات SUB-CRP",
    "name": "C-CARP004 Basaem Narose",
    "craftsmanTitle": "أعمال النجارة والتركيبات (Specialized Contracting Works)",
    "phone": "01010009653",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -133860.0,
    "retentionHeldEgp": 18917.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-CARP-004) — أعمال النجارة والتركيبات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-08",
    "nexusCode": "SUB-CARP-005",
    "tradeCode": "SUB-CRP",
    "tradeLabelAr": "أعمال النجارة والتركيبات SUB-CRP",
    "name": "C-CARP005-Ramsis",
    "craftsmanTitle": "أعمال النجارة والتركيبات (Specialized Contracting Works)",
    "phone": "01010011032",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 2250.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-CARP-005) — أعمال النجارة والتركيبات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-09",
    "nexusCode": "SUB-CIVL-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال مدنية وحفر ردم وإرساء SUB-PLS",
    "name": "Civilworks-Eslam Ahmed",
    "craftsmanTitle": "أعمال مدنية وحفر ردم وإرساء (Specialized Contracting Works)",
    "phone": "01010012411",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -15000.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-CIVL-001) — أعمال مدنية وحفر ردم وإرساء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-10",
    "nexusCode": "SUB-ELEC-001",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "A-ELEC008 Gamal Abdelazim",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010013790",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 8.0,
    "retentionHeldEgp": 3250.4,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-001) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-11",
    "nexusCode": "SUB-ELEC-002",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "A-ELEC011-Mohamed Salah",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010015169",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 190.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-002) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-12",
    "nexusCode": "SUB-ELEC-003",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "A-ELEC-Hamada",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010016548",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -18012.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-003) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-13",
    "nexusCode": "SUB-ELEC-004",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "C-ELEC002-Tamer Rouman",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010017927",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 500.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-004) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-14",
    "nexusCode": "SUB-ELEC-005",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "ELEC-Hussein Ali",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010019306",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 2000.0,
    "retentionHeldEgp": 2150.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-005) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-15",
    "nexusCode": "SUB-ELEC-006",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "ELEC-Kerolls Emad",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010020685",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -2500.0,
    "retentionHeldEgp": 75.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-006) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-16",
    "nexusCode": "SUB-ELEC-007",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "Elec-Labor Alaa Fathy",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010022064",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -268876.0,
    "retentionHeldEgp": 30005.1,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-007) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-17",
    "nexusCode": "SUB-ELEC-008",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "Elec-Labor Fam Eshak",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010023443",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -35110.0,
    "retentionHeldEgp": 1455.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-008) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-18",
    "nexusCode": "SUB-ELEC-009",
    "tradeCode": "SUB-ELC",
    "tradeLabelAr": "شبكات وتأسيس وتشطيب الكهرباء SUB-ELC",
    "name": "ELEC-Mohamed Saber",
    "craftsmanTitle": "شبكات وتأسيس وتشطيب الكهرباء (Specialized Contracting Works)",
    "phone": "01010024822",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -13500.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-ELEC-009) — شبكات وتأسيس وتشطيب الكهرباء.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-19",
    "nexusCode": "SUB-FINS-001",
    "tradeCode": "SUB-INS",
    "tradeLabelAr": "أعمال الكورنيش والـ Cornices SUB-INS",
    "name": "A-COR-001-Mohamed",
    "craftsmanTitle": "أعمال الكورنيش والـ Cornices (Specialized Contracting Works)",
    "phone": "01010026201",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 132482.0,
    "retentionHeldEgp": 8819.7,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-FINS-001) — أعمال الكورنيش والـ Cornices.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-20",
    "nexusCode": "SUB-FLOR-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أرضيات باركيه وخشب SUB-PLS",
    "name": "A-PARQ001 Eshak Yacoub",
    "craftsmanTitle": "أرضيات باركيه وخشب (Specialized Contracting Works)",
    "phone": "01010027580",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 13401.0,
    "retentionHeldEgp": 2160.05,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-FLOR-001) — أرضيات باركيه وخشب.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-21",
    "nexusCode": "SUB-FURN-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "تركيبات وتوريد أثاث ومطابخ SUB-PLS",
    "name": "A-FUT002 Wael Mahmoud",
    "craftsmanTitle": "تركيبات وتوريد أثاث ومطابخ (Specialized Contracting Works)",
    "phone": "01010028959",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -4945.0,
    "retentionHeldEgp": 337.8,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-FURN-001) — تركيبات وتوريد أثاث ومطابخ.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-22",
    "nexusCode": "SUB-GENR-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال عامة وتوريد عمالة يوميات SUB-PLS",
    "name": "Ibrahim Hassan",
    "craftsmanTitle": "أعمال عامة وتوريد عمالة يوميات (Specialized Contracting Works)",
    "phone": "01010030338",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 5994.0,
    "retentionHeldEgp": 449.85,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GENR-001) — أعمال عامة وتوريد عمالة يوميات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-23",
    "nexusCode": "SUB-GENR-002",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال عامة وتوريد عمالة يوميات SUB-PLS",
    "name": "Mohamed Hamad",
    "craftsmanTitle": "أعمال عامة وتوريد عمالة يوميات (Specialized Contracting Works)",
    "phone": "01010031717",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 19400.0,
    "retentionHeldEgp": 3540.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GENR-002) — أعمال عامة وتوريد عمالة يوميات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-24",
    "nexusCode": "SUB-GLAS-001",
    "tradeCode": "SUB-ALUM",
    "tradeLabelAr": "أعمال الزجاج والواجهات السيكوريت SUB-ALUM",
    "name": "C-GLAS001 Mohammed Abd Elsalam",
    "craftsmanTitle": "أعمال الزجاج والواجهات السيكوريت (Specialized Contracting Works)",
    "phone": "01010033096",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -167451.0,
    "retentionHeldEgp": 14698.4,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GLAS-001) — أعمال الزجاج والواجهات السيكوريت.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-25",
    "nexusCode": "SUB-GLAS-002",
    "tradeCode": "SUB-ALUM",
    "tradeLabelAr": "زجاج مصفح وLamination SUB-ALUM",
    "name": "C-GLAS008-Mahmoud-lamination",
    "craftsmanTitle": "زجاج مصفح وLamination (Specialized Contracting Works)",
    "phone": "01010034475",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 3000.0,
    "retentionHeldEgp": 150.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GLAS-002) — زجاج مصفح وLamination.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-26",
    "nexusCode": "SUB-GYPS-001",
    "tradeCode": "SUB-GYP",
    "tradeLabelAr": "أسقف معلقة وجبس بورد SUB-GYP",
    "name": "C-GYPS006 Ibrahim Mostaf",
    "craftsmanTitle": "أسقف معلقة وجبس بورد (Specialized Contracting Works)",
    "phone": "01010035854",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -850065.0,
    "retentionHeldEgp": 10289.85,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GYPS-001) — أسقف معلقة وجبس بورد.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-27",
    "nexusCode": "SUB-GYPS-002",
    "tradeCode": "SUB-GYP",
    "tradeLabelAr": "أسقف معلقة وجبس بورد SUB-GYP",
    "name": "C-GYPS008-Mansour Mohamed",
    "craftsmanTitle": "أسقف معلقة وجبس بورد (Specialized Contracting Works)",
    "phone": "01010037233",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -92261.0,
    "retentionHeldEgp": 9670.55,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GYPS-002) — أسقف معلقة وجبس بورد.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-28",
    "nexusCode": "SUB-GYPS-003",
    "tradeCode": "SUB-GYP",
    "tradeLabelAr": "أسقف معلقة وجبس بورد SUB-GYP",
    "name": "Gypsum-Sl-Wael Nabil",
    "craftsmanTitle": "أسقف معلقة وجبس بورد (Specialized Contracting Works)",
    "phone": "01010038612",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -109144.0,
    "retentionHeldEgp": 10272.8,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-GYPS-003) — أسقف معلقة وجبس بورد.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-29",
    "nexusCode": "SUB-HEAT-001",
    "tradeCode": "SUB-HEAT",
    "tradeLabelAr": "أنظمة تدفئة أرضية وتدفئة مركزية SUB-HEAT",
    "name": "EC-HEAT001-Echo Heating-Mahmoud",
    "craftsmanTitle": "أنظمة تدفئة أرضية وتدفئة مركزية (Specialized Contracting Works)",
    "phone": "01010039991",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 22450.0,
    "retentionHeldEgp": 3622.5,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-HEAT-001) — أنظمة تدفئة أرضية وتدفئة مركزية.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-30",
    "nexusCode": "SUB-HVAC-001",
    "tradeCode": "SUB-HVAC",
    "tradeLabelAr": "التكييف والتهوية والتبريد SUB-HVAC",
    "name": "A.COND-Labor Aziz Ibrahim",
    "craftsmanTitle": "التكييف والتهوية والتبريد (Specialized Contracting Works)",
    "phone": "01010041370",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -399450.0,
    "retentionHeldEgp": 17765.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-HVAC-001) — التكييف والتهوية والتبريد.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-31",
    "nexusCode": "SUB-HVAC-002",
    "tradeCode": "SUB-HVAC",
    "tradeLabelAr": "التكييف والتهوية والتبريد SUB-HVAC",
    "name": "A-ACND004-Mohamed Gamal",
    "craftsmanTitle": "التكييف والتهوية والتبريد (Specialized Contracting Works)",
    "phone": "01010042749",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -51000.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-HVAC-002) — التكييف والتهوية والتبريد.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-32",
    "nexusCode": "SUB-INSU-001",
    "tradeCode": "SUB-INS",
    "tradeLabelAr": "أعمال العزل المائي والحراري SUB-INS",
    "name": "A-INSUL001 Ramadan",
    "craftsmanTitle": "أعمال العزل المائي والحراري (Waterproofing & Thermal Insulation)",
    "phone": "01010044128",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -13342.0,
    "retentionHeldEgp": 895.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-INSU-001) — أعمال العزل المائي والحراري.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-33",
    "nexusCode": "SUB-LAND-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "لاندسكيب وحوائط خضراء وزراعة SUB-PLS",
    "name": "Poula Noshy-Green wall",
    "craftsmanTitle": "لاندسكيب وحوائط خضراء وزراعة (Specialized Contracting Works)",
    "phone": "01010045507",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -60000.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-LAND-001) — لاندسكيب وحوائط خضراء وزراعة.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-34",
    "nexusCode": "SUB-MARB-001",
    "tradeCode": "SUB-MRB",
    "tradeLabelAr": "أعمال جلي وتركيب الرخام والجرانيت SUB-MRB",
    "name": "A-MARB002 EshakSaad Habib",
    "craftsmanTitle": "أعمال جلي وتركيب الرخام والجرانيت (Specialized Contracting Works)",
    "phone": "01010046886",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -327915.0,
    "retentionHeldEgp": 19501.25,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-MARB-001) — أعمال جلي وتركيب الرخام والجرانيت.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-35",
    "nexusCode": "SUB-MARB-002",
    "tradeCode": "SUB-MRB",
    "tradeLabelAr": "أعمال جلي وتركيب الرخام والجرانيت SUB-MRB",
    "name": "MARB-Labor Malak Fadl",
    "craftsmanTitle": "أعمال جلي وتركيب الرخام والجرانيت (Specialized Contracting Works)",
    "phone": "01010048265",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -1324316.0,
    "retentionHeldEgp": 42482.5,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-MARB-002) — أعمال جلي وتركيب الرخام والجرانيت.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-36",
    "nexusCode": "SUB-MECH-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال ميكانيكا ومعدات SUB-PLS",
    "name": "Andrew MECH",
    "craftsmanTitle": "أعمال ميكانيكا ومعدات (Specialized Contracting Works)",
    "phone": "01010049644",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -60020.0,
    "retentionHeldEgp": 1000.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-MECH-001) — أعمال ميكانيكا ومعدات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-37",
    "nexusCode": "SUB-MECH-002",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال ميكانيكا ومعدات SUB-PLS",
    "name": "MEC-Youssef Ali",
    "craftsmanTitle": "أعمال ميكانيكا ومعدات (Specialized Contracting Works)",
    "phone": "01010051023",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -687228.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-MECH-002) — أعمال ميكانيكا ومعدات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-38",
    "nexusCode": "SUB-MSRY-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال المباني والـ Masonry SUB-PLS",
    "name": "1003-Saiid Awad Saiid Awad",
    "craftsmanTitle": "أعمال المباني والـ Masonry (Specialized Contracting Works)",
    "phone": "01010052402",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 58800.0,
    "retentionHeldEgp": 6005.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-MSRY-001) — أعمال المباني والـ Masonry.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-39",
    "nexusCode": "SUB-MSRY-002",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال المباني والـ Masonry SUB-PLS",
    "name": "1007-Ezzat Masoud",
    "craftsmanTitle": "أعمال المباني والـ Masonry (Specialized Contracting Works)",
    "phone": "01010053781",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 1000.0,
    "retentionHeldEgp": 200.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-MSRY-002) — أعمال المباني والـ Masonry.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-40",
    "nexusCode": "SUB-PLST-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال بياض المحارة واللياسة SUB-PLS",
    "name": "A-PLAST-Mina",
    "craftsmanTitle": "أعمال بياض المحارة واللياسة (Specialized Contracting Works)",
    "phone": "01010055160",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -6600.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PLST-001) — أعمال بياض المحارة واللياسة.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-41",
    "nexusCode": "SUB-PLST-002",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال بياض المحارة واللياسة SUB-PLS",
    "name": "C-PLST001-Gad Ali",
    "craftsmanTitle": "أعمال بياض المحارة واللياسة (Specialized Contracting Works)",
    "phone": "01010056539",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -29780.0,
    "retentionHeldEgp": 1523.5,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PLST-002) — أعمال بياض المحارة واللياسة.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-42",
    "nexusCode": "SUB-PLST-003",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال بياض المحارة واللياسة SUB-PLS",
    "name": "C-PLST008-Hany Saleh Ali",
    "craftsmanTitle": "أعمال بياض المحارة واللياسة (Specialized Contracting Works)",
    "phone": "01010057918",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 700.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PLST-003) — أعمال بياض المحارة واللياسة.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-43",
    "nexusCode": "SUB-PLUM-001",
    "tradeCode": "SUB-PLM",
    "tradeLabelAr": "شبكات تغذية وصرف صحي (سباكة) SUB-PLM",
    "name": "A-PLUM013- Milad Asham",
    "craftsmanTitle": "شبكات تغذية وصرف صحي (سباكة) (Specialized Contracting Works)",
    "phone": "01010059297",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -434762.0,
    "retentionHeldEgp": 26577.5,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PLUM-001) — شبكات تغذية وصرف صحي (سباكة).",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-44",
    "nexusCode": "SUB-PLUM-002",
    "tradeCode": "SUB-PLM",
    "tradeLabelAr": "شبكات تغذية وصرف صحي (سباكة) SUB-PLM",
    "name": "PLUMB-Labor Raouf Shafik",
    "craftsmanTitle": "شبكات تغذية وصرف صحي (سباكة) (Specialized Contracting Works)",
    "phone": "01010060676",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -37584.0,
    "retentionHeldEgp": 6204.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PLUM-002) — شبكات تغذية وصرف صحي (سباكة).",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-45",
    "nexusCode": "SUB-PTNG-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال النقاشة والدهانات SUB-PLS",
    "name": "A-PAIN010 Abdel Nasser Mahmoud",
    "craftsmanTitle": "أعمال النقاشة والدهانات (Specialized Contracting Works)",
    "phone": "01010062055",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -106413.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PTNG-001) — أعمال النقاشة والدهانات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-46",
    "nexusCode": "SUB-PTNG-002",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال النقاشة والدهانات SUB-PLS",
    "name": "C-PAIN001 Ashraf Mohamed",
    "craftsmanTitle": "أعمال النقاشة والدهانات (Specialized Contracting Works)",
    "phone": "01010063434",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 132482.0,
    "retentionHeldEgp": 8819.7,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PTNG-002) — أعمال النقاشة والدهانات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-47",
    "nexusCode": "SUB-PTNG-003",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال النقاشة والدهانات SUB-PLS",
    "name": "PAIN-Labor Ibrahim Romani",
    "craftsmanTitle": "أعمال النقاشة والدهانات (Specialized Contracting Works)",
    "phone": "01010064813",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -84167.0,
    "retentionHeldEgp": 27274.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PTNG-003) — أعمال النقاشة والدهانات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-48",
    "nexusCode": "SUB-PTNG-004",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "أعمال النقاشة والدهانات SUB-PLS",
    "name": "PAIN-Labor Monir ( HAbib Samir )",
    "craftsmanTitle": "أعمال النقاشة والدهانات (Specialized Contracting Works)",
    "phone": "01010066192",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -267300.0,
    "retentionHeldEgp": 150.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-PTNG-004) — أعمال النقاشة والدهانات.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-49",
    "nexusCode": "SUB-SHUT-001",
    "tradeCode": "SUB-PLS",
    "tradeLabelAr": "شيش حصيرة وأبواب حماية UPVC SUB-PLS",
    "name": "C-SHUT001 Mohammed Hassan-upvc",
    "craftsmanTitle": "شيش حصيرة وأبواب حماية UPVC (Specialized Contracting Works)",
    "phone": "01010067571",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-SHUT-001) — شيش حصيرة وأبواب حماية UPVC.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-50",
    "nexusCode": "SUB-STEL-001",
    "tradeCode": "SUB-STL",
    "tradeLabelAr": "أعمال الكريتال والحديد والـ Steel (كرم مطاوع) SUB-STL",
    "name": "A-STEL001-Karam Metawea",
    "craftsmanTitle": "أعمال الكريتال والحديد والـ Steel (كرم مطاوع) (Specialized Contracting Works)",
    "phone": "01010068950",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -4250.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-STEL-001) — أعمال الكريتال والحديد والـ Steel (كرم مطاوع).",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-51",
    "nexusCode": "SUB-STEL-002",
    "tradeCode": "SUB-STL",
    "tradeLabelAr": "أعمال الكريتال والحديد والـ Steel SUB-STL",
    "name": "A-STEL-Mina Adel",
    "craftsmanTitle": "أعمال الكريتال والحديد والـ Steel (Specialized Contracting Works)",
    "phone": "01010070329",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -18000.0,
    "retentionHeldEgp": 8000.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-STEL-002) — أعمال الكريتال والحديد والـ Steel.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-52",
    "nexusCode": "SUB-STEL-003",
    "tradeCode": "SUB-STL",
    "tradeLabelAr": "أعمال الكريتال والمنشآت المعدنية SUB-STL",
    "name": "C-STEL003-Ayman",
    "craftsmanTitle": "أعمال الكريتال والمنشآت المعدنية (Specialized Contracting Works)",
    "phone": "01010071708",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -14850.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-STEL-003) — أعمال الكريتال والمنشآت المعدنية.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-53",
    "nexusCode": "SUB-STEL-004",
    "tradeCode": "SUB-STL",
    "tradeLabelAr": "أعمال الكريتال والحديد والـ Steel SUB-STL",
    "name": "C-STEL005-Abanoub khalil",
    "craftsmanTitle": "أعمال الكريتال والحديد والـ Steel (Specialized Contracting Works)",
    "phone": "01010073087",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -17450.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-STEL-004) — أعمال الكريتال والحديد والـ Steel.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-54",
    "nexusCode": "SUB-TILE-001",
    "tradeCode": "SUB-TILE",
    "tradeLabelAr": "تركيب سيراميك وبورسلين وبلاط SUB-TILE",
    "name": "A-CERA025-Gerges",
    "craftsmanTitle": "تركيب سيراميك وبورسلين وبلاط (Specialized Contracting Works)",
    "phone": "01010074466",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": 0.0,
    "retentionHeldEgp": 2765.0,
    "pillars": {
      "quality": "A",
      "pricing": "B",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-TILE-001) — تركيب سيراميك وبورسلين وبلاط.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-55",
    "nexusCode": "SUB-TILE-002",
    "tradeCode": "SUB-TILE",
    "tradeLabelAr": "تركيب سيراميك وبورسلين وبلاط SUB-TILE",
    "name": "A-CERA-Samer",
    "craftsmanTitle": "تركيب سيراميك وبورسلين وبلاط (Specialized Contracting Works)",
    "phone": "01010075845",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -31600.0,
    "retentionHeldEgp": 0.0,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-TILE-002) — تركيب سيراميك وبورسلين وبلاط.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  },
  {
    "id": "sub-56",
    "nexusCode": "SUB-TILE-003",
    "tradeCode": "SUB-TILE",
    "tradeLabelAr": "تركيب سيراميك وبورسلين وبلاط SUB-TILE",
    "name": "CERA-Labor Samuel Ezzat",
    "craftsmanTitle": "تركيب سيراميك وبورسلين وبلاط (Specialized Contracting Works)",
    "phone": "01010077224",
    "workNature": "مصنعيات فقط",
    "assignedProjects": [
      "C096",
      "C063"
    ],
    "ledgerAccountCount": 1,
    "activeBalanceEgp": -247034.0,
    "retentionHeldEgp": 16057.55,
    "pillars": {
      "quality": "A",
      "pricing": "A",
      "schedule": "A",
      "ethics": "A"
    },
    "overallGrade": "A",
    "ceoNotes": "مسجل في قاعدة بيانات مقاولي الباطن Nexus (SUB-TILE-003) — تركيب سيراميك وبورسلين وبلاط.",
    "lastEvaluatedBy": "Pierre Afifi (1001) + Technical Office",
    "lastEvaluatedDate": "2026-10-15"
  }
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
    return 'bg-[#123524]/10 text-[#123524] border-[#123524]/25';
  }
  if (grade === 'B') {
    return 'bg-amber-500/15 text-[#b45309] border-amber-500/30';
  }
  return 'bg-rose-500/15 text-red-700 border-rose-500/30';
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

  // KPI Metrics (Reflecting Live Nexus 56 Subcontractors & 63 Contractor Ledger Accounts)
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
      ceoNotes: newSubNotes.trim() || 'تم التسجيل والاعتماد المبدئي في دليل مقاولي الباطن Nexus.',
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
    <div className="space-y-6 text-[#192631] text-start">
      <GuidedStepBanner
        lifecycleStageNumber={4}
        moduleTitleEn="56 Subcontractors Directory, CEO Ratings & Statements"
        moduleTitleAr="دليل الـ 56 مقاول باطن وتقييم الإدارة والمستخلصات"
        activeStepId={activeSubTab}
        onSelectStep={(id) => setActiveSubTab(id as any)}
        steps={[
          {
            id: 'directory',
            stepNum: 1,
            titleEn: 'Select & Rate Subcontractor (CEO A/B/C Matrix)',
            titleAr: 'اختيار وتقييم مقاول الباطن (مصفوفة A/B/C)',
            actionHintEn: 'Filter across 13 trade specialties and update 4-pillar CEO ratings (Quality, Price, Schedule, Ethics).',
            actionHintAr: 'فلتر بين 13 تخصص هندسي وحدّث تقييم الإدارة الرباعي (الجودة، السعر، المواعيد، التعامل).',
          },
          {
            id: 'statements',
            stepNum: 2,
            titleEn: 'Verify Site Inspection (SIR) & Issue Statement (ST)',
            titleAr: 'مراجعة استلام الموقع وإصدار مستخلص مقاول (ST)',
            actionHintEn: 'Verify site engineer SIR approval, calculate 5% workmanship retention, and approve ST statement.',
            actionHintAr: 'تأكد من اعتماد استلام مهندس الموقع (SIR) واحتسب خصم 5% تأمين أعمال واعتمد المستخلص (ST).',
          },
          {
            id: 'cpo_rcb',
            stepNum: 3,
            titleEn: 'Issue Cash Payment Order (CPO) & Custody (RCB)',
            titleAr: 'إصدار أمر دفع نقدي (CPO) أو تسوية عهدة (RCB)',
            actionHintEn: 'Generate standardized CPO/RCB coding sheet codes and route to Merna Maged (Accounting) for payout.',
            actionHintAr: 'أصدر كود أمر الدفع النقدي (CPO) أو تسوية العهدة (RCB) وأرسله لأستاذة ميرنا ماجد للصرف.',
          },
        ]}
      />

      {/* Top Status Banner */}
      {statusBanner && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#123524] shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-[#123524] hover:text-[#192631] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Live ERP Sync Badge */}
      <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e04b2a]/10 border border-orange-500/25 text-[#e04b2a] text-[11px] font-black tracking-wide mb-2">
              <HardHat className="w-3.5 h-3.5" />
              <span>Nexus LIVE · /subcontractors & /contractor-accounts</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-[#192631]">
              دليل مقاولي الباطن والصنايعية وتقييم الإدارة{' '}
              <span className="text-[#e04b2a]">(56 Subcontractors & ST/CPO Hub)</span>
            </h2>
            <p className="text-[#192631]/70 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              منظومة إدارة ومراقبة مقاولي الباطن والصنايعية (13 تخصص هندسي)، مصفوفة تقييم الإدارة الرباعية{' '}
              <span className="text-[#192631] font-bold">(A / B / C)</span>، مستخلصات المقاولين{' '}
              <span className="font-mono text-[#e04b2a]">(ST)</span> مع استقطاع 5% تأمين أعمال، وأوامر الدفع النقدي{' '}
              <span className="font-mono text-[#123524]">(CPO)</span> وتسويات العهد{' '}
              <span className="font-mono text-[#192631]">(RCB)</span>.
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
              className="px-4 py-2.5 rounded-xl bg-[#192631]/[0.05] hover:bg-[#192631]/[0.05] border border-[#192631]/10 text-[#192631] text-xs font-bold flex items-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-[#e04b2a]" />
              <span>+ مستخلص مقاول (ST)</span>
            </button>
          </div>
        </div>

        {/* 1. Top KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#192631]/70">إجمالي المسجلين بالدليل الرسمي</p>
              <p className="text-2xl font-black text-[#192631] mt-1">
                {kpiStats.registeredCount}{' '}
                <span className="text-xs font-bold text-[#e04b2a]">مقاول باطن وصنايعي مسجل</span>
              </p>
              <p className="text-[11px] text-[#192631]/60 mt-1">موزعين على 13 تخصص تشطيبات و MEP</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#e04b2a]/10 border border-[#e04b2a]/25 flex items-center justify-center text-[#e04b2a]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#192631]/70">حسابات الأستاذ النشطة للمقاولين</p>
              <p className="text-2xl font-black text-[#123524] mt-1">
                {kpiStats.ledgerAccountsCount}{' '}
                <span className="text-xs font-bold text-[#123524]">حساب مقاول باطن</span>
              </p>
              <p className="text-[11px] text-[#192631]/60 mt-1">مربوطة بمراكز تكلفة المشاريع (C096, C063, C091)</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#123524]/10 border border-[#123524]/25 flex items-center justify-center text-[#123524]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#192631]/70">نخبة التصنيف الأول (CEO Grade A)</p>
              <p className="text-2xl font-black text-[#192631] mt-1">
                {kpiStats.gradeACount} / {subcontractors.length}{' '}
                <span className="text-xs font-bold text-[#192631]">Grade A - ممتاز</span>
              </p>
              <p className="text-[11px] text-[#192631]/60 mt-1">تقييم رباعي: الجودة · السعر · المواعيد · التعامل</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#192631]">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#192631]/70">إجمالي تأمين الأعمال المحتجز (5%)</p>
              <p className="text-2xl font-black text-[#b45309] mt-1">
                {kpiStats.totalRetentionEgp.toLocaleString()}{' '}
                <span className="text-xs font-bold text-[#b45309]">ج.م (Retention)</span>
              </p>
              <p className="text-[11px] text-[#192631]/60 mt-1">يُرد بعد الاستلام النهائي وفترة الضمان</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#b45309]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white/85 backdrop-blur-xl p-1.5 rounded-2xl border border-[#192631]/10">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={clsx(
            'flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all',
            activeSubTab === 'directory'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-[#192631]/70 hover:text-[#192631] hover:bg-[#192631]/[0.05]'
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
              : 'text-[#192631]/70 hover:text-[#192631] hover:bg-[#192631]/[0.05]'
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
              : 'text-[#192631]/70 hover:text-[#192631] hover:bg-[#192631]/[0.05]'
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
          <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#192631]/60 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المقاول، الكود (SUB-TILE-001)، رقم الهاتف، أو كود المشروع (C096)..."
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#192631] placeholder-[#192631]/40 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter by Work Nature */}
                <div className="flex items-center gap-1.5 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#e04b2a]" />
                  <span className="text-[11px] text-[#192631]/70 font-bold">طبيعة العمل:</span>
                  <select
                    value={selectedWorkNature}
                    onChange={(e) => setSelectedWorkNature(e.target.value as 'الكل' | WorkNatureType)}
                    className="bg-transparent text-xs font-bold text-[#192631] focus:outline-none"
                  >
                    <option value="الكل" className="bg-white/85 backdrop-blur-xl">
                      الكل (Labor & Supply)
                    </option>
                    <option value="مصنعيات فقط" className="bg-white/85 backdrop-blur-xl">
                      مصنعيات فقط (Labor Only)
                    </option>
                    <option value="توريد وتركيب" className="bg-white/85 backdrop-blur-xl">
                      توريد وتركيب (Supply & Install)
                    </option>
                  </select>
                </div>

                {/* Filter by Overall Grade */}
                <div className="flex items-center gap-1.5 bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#123524]" />
                  <span className="text-[11px] text-[#192631]/70 font-bold">التقييم العام:</span>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as 'ALL' | GradeTier)}
                    className="bg-transparent text-xs font-bold text-[#192631] focus:outline-none"
                  >
                    <option value="ALL" className="bg-white/85 backdrop-blur-xl">
                      كل الفئات (A / B / C)
                    </option>
                    <option value="A" className="bg-white/85 backdrop-blur-xl">
                      Grade A - ممتاز
                    </option>
                    <option value="B" className="bg-white/85 backdrop-blur-xl">
                      Grade B - جيد جداً
                    </option>
                    <option value="C" className="bg-white/85 backdrop-blur-xl">
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
                        ? 'bg-[#e04b2a]/10 border-orange-500 text-[#e04b2a] shadow-sm'
                        : 'bg-[#f5f5f5]/85 border-[#192631]/10 text-[#192631]/70 hover:text-[#192631] hover:border-[#192631]/10'
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
            <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#123524]/10 border border-[#123524]/25 flex items-center justify-center text-[#123524] font-black text-xs">
                1
              </span>
              <div>
                <p className="text-xs font-black text-[#192631]">جودة التنفيذ والاستلام الهندسي</p>
                <p className="text-[11px] text-[#192631]/70">Quality of Execution & SIR Pass Rate</p>
              </div>
            </div>
            <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#192631] font-black text-xs">
                2
              </span>
              <div>
                <p className="text-xs font-black text-[#192631]">مناسبة الأسعار للسوق</p>
                <p className="text-[11px] text-[#192631]/70">Price Competitiveness vs BOQ Target</p>
              </div>
            </div>
            <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#b45309] font-black text-xs">
                3
              </span>
              <div>
                <p className="text-xs font-black text-[#192631]">الالتزام بالمواعيد والبرنامج الزمني</p>
                <p className="text-[11px] text-[#192631]/70">Schedule Commitment & Manpower</p>
              </div>
            </div>
            <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-xl p-3.5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[#192631] font-black text-xs">
                4
              </span>
              <div>
                <p className="text-xs font-black text-[#192631]">التعامل والأخلاقيات بالموقع</p>
                <p className="text-[11px] text-[#192631]/70">Site Dealing, Safety & Material Care</p>
              </div>
            </div>
          </div>

          {/* Subcontractors Matrix Table */}
          <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="bg-[#f5f5f5]/85 border-b border-[#192631]/10 text-[#192631]/70 font-black">
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
                    <th className="py-3.5 px-4 text-start">تقييم الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredSubcontractors.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-[#e04b2a] bg-[#e04b2a]/10 border border-[#e04b2a]/25 px-2.5 py-1 rounded-lg inline-block">
                          {sub.nexusCode}
                        </span>
                        <p className="text-[11px] text-[#192631]/70 mt-1">{sub.tradeLabelAr}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-black text-[#192631] text-sm">{sub.name}</p>
                        <p className="text-[11px] text-[#192631]/70 mt-0.5">{sub.craftsmanTitle}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#192631]/60 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-[#123524]" />
                          <span>{sub.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={clsx(
                            'px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block',
                            sub.workNature === 'مصنعيات فقط'
                              ? 'bg-sky-500/10 text-[#192631] border-sky-500/25'
                              : 'bg-purple-500/10 text-[#192631] border-purple-500/25'
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
                              className="px-2 py-0.5 rounded-md bg-[#192631]/[0.05] border border-[#192631]/10 text-[#192631] font-mono text-[11px] font-bold"
                            >
                              {proj}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#192631]/60 mt-1">
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
                        <p className="text-[10px] text-[#192631]/70 mt-1 max-w-[180px] truncate" title={sub.ceoNotes}>
                          {sub.ceoNotes}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#192631]">
                          {sub.activeBalanceEgp.toLocaleString()} <span className="text-[10px] text-[#192631]/70">ج.م</span>
                        </p>
                        <p className="text-[11px] text-[#b45309] font-semibold mt-0.5">
                          تأمين 5%: {sub.retentionHeldEgp.toLocaleString()} ج.م
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-start">
                        <button
                          onClick={() => handleOpenEvaluation(sub)}
                          className="px-3 py-1.5 rounded-xl bg-[#192631]/[0.05] hover:bg-[#e04b2a]/10 border border-[#192631]/10 hover:border-[#e04b2a]/25 text-[#192631] hover:text-[#e04b2a] text-[11px] font-bold inline-flex items-center gap-1.5 transition-all"
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
          <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[#e04b2a] text-xs font-black">
                <Scale className="w-4 h-4" />
                <span>معادلة المستخلص القياسية (Nexus ST Engine) + بوابة الاستلام الهندسي (SIR Gate)</span>
              </div>
              <p className="text-xs text-[#192631]/85 leading-relaxed">
                صافي المستحق للصرف = إجمالي قيمة الأعمال المنفذة (السابقة + الحالية) −{' '}
                <span className="text-[#b45309] font-bold">5% تأمين أعمال (Workmanship Retention)</span> −{' '}
                <span className="text-red-700 font-bold">خصومات خامات محملة على المقاول أو تلفيات</span> − الدفعات
                السابقة. يشترط اعتماد <span className="font-mono text-[#123524]">SIR</span> من مهندس الموقع قبل الصرف.
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
                  className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 space-y-4 hover:border-[#192631]/10 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#192631]/10 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-3 py-1 rounded-lg bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a]">
                          {st.stCode}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#192631]/[0.05] border border-[#192631]/10 text-xs font-bold text-[#192631]">
                          {st.projectName}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 text-xs font-bold text-[#192631]">
                          {st.statementNumber}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[#192631] mt-2">
                        {st.subcontractorName}{' '}
                        <span className="text-xs font-mono text-[#192631]/70">({st.subcontractorCode})</span>
                      </h3>
                      <p className="text-xs text-[#192631]/70 mt-0.5">{st.workDescription}</p>
                    </div>

                    {/* SIR Inspection Gate Badge */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => handleToggleSirApproval(st.id)}
                        className={clsx(
                          'px-3.5 py-2 rounded-xl text-xs font-black border flex items-center gap-2 transition-all',
                          st.sirApproved
                            ? 'bg-[#123524]/10 border-[#123524]/25 text-[#123524]'
                            : 'bg-rose-500/15 border-rose-500/30 text-red-700 animate-pulse'
                        )}
                      >
                        {st.sirApproved ? (
                          <>
                            <ClipboardCheck className="w-4 h-4 text-[#123524]" />
                            <span>SIR معتمد هندسياً ({st.sirCode})</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-700" />
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
                              : 'bg-[#192631]/[0.05] text-[#192631]/60 border border-[#192631]/10 cursor-not-allowed'
                          )}
                        >
                          <BadgeDollarSign className="w-4 h-4" />
                          <span>اعتماد المستخلص وإصدار أمر دفع (CPO)</span>
                        </button>
                      ) : (
                        <span className="px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-[#192631] text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم إصدار أمر الدفع CPO للحسابات</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detailed Quantities & Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 text-xs">
                    <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-3">
                      <p className="text-[10px] text-[#192631]/70 font-bold">الكمية السابقة</p>
                      <p className="text-sm font-black text-[#192631] mt-1">
                        {st.previousQty} <span className="text-[10px] text-[#192631]/70">{st.unit}</span>
                      </p>
                    </div>

                    <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-3">
                      <p className="text-[10px] text-[#192631]/70 font-bold">الكمية الحالية المنفذة</p>
                      <p className="text-sm font-black text-[#e04b2a] mt-1">
                        +{st.currentQty} <span className="text-[10px] text-[#192631]/70">{st.unit}</span>
                      </p>
                    </div>

                    <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-3">
                      <p className="text-[10px] text-[#192631]/70 font-bold">إجمالي الكمية والفئة</p>
                      <p className="text-sm font-black text-[#192631] mt-1">
                        {calc.totalCumulativeQty} {st.unit} × {st.unitPrice} ج.م
                      </p>
                    </div>

                    <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-3">
                      <p className="text-[10px] text-[#192631]/70 font-bold">إجمالي قيمة الأعمال</p>
                      <p className="text-sm font-black text-[#192631] mt-1">
                        {calc.grossWorkValue.toLocaleString()} <span className="text-[10px] text-[#192631]/70">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
                      <p className="text-[10px] text-[#b45309] font-bold">تأمين أعمال 5% (Retention)</p>
                      <p className="text-sm font-black text-[#b45309] mt-1">
                        −{calc.retention5Percent.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3">
                      <p className="text-[10px] text-red-700 font-bold">خصومات خامات / تلفيات</p>
                      <p className="text-sm font-black text-red-700 mt-1">
                        −{st.deductionsMaterialsEgp.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-3">
                      <p className="text-[10px] text-[#192631]/70 font-bold">الدفعات السابقة المصروفة</p>
                      <p className="text-sm font-black text-[#192631]/85 mt-1">
                        −{st.previousPaymentsEgp.toLocaleString()} <span className="text-[10px]">ج.م</span>
                      </p>
                    </div>

                    <div className="bg-[#123524]/10 border border-emerald-500/35 rounded-xl p-3">
                      <p className="text-[10px] text-[#123524] font-black">صافي المستحق للصرف</p>
                      <p className="text-base font-black text-[#123524] mt-1">
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
          <div className="xl:col-span-5 bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
              <div>
                <span className="text-[11px] font-black text-[#e04b2a] uppercase tracking-wider">
                  STANDARDIZED CODING SHEET ENGINE
                </span>
                <h3 className="text-lg font-black text-[#192631] mt-0.5">
                  إصدار كود أمر دفع نقدي (CPO) أو تسوية عهدة (RCB)
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-[#e04b2a]" />
            </div>

            <form onSubmit={handleEmitCashOrder} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">نوع المستند المالي</label>
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
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="CPO">CPO - أمر دفع نقدي لمقاول باطن</option>
                    <option value="RCB">RCB - تسوية عهدة مهندس موقع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">كود المشروع</label>
                  <select
                    value={genProjectCode}
                    onChange={(e) => setGenProjectCode(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
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
                  <label className="block text-[#192631]/70 font-bold mb-1">الرقم التسلسلي (Seq)</label>
                  <input
                    type="text"
                    value={genSeqNumber}
                    onChange={(e) => setGenSeqNumber(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">الاسم المختصر بالكود (Tag)</label>
                  <input
                    type="text"
                    value={genShortTag}
                    onChange={(e) => setGenShortTag(e.target.value)}
                    placeholder="SayedTile أو EngPierre"
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#192631]/70 font-bold mb-1">اسم المستفيد (مقاول باطن / مهندس عهدة)</label>
                <input
                  type="text"
                  value={genBeneficiary}
                  onChange={(e) => setGenBeneficiary(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">المبلغ الصافي (ج.م)</label>
                  <input
                    type="number"
                    value={genAmount}
                    onChange={(e) => setGenAmount(Number(e.target.value))}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#123524] font-black"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">وسيلة الصرف (أ. ميرنا ماجد)</label>
                  <select
                    value={genChannel}
                    onChange={(e) =>
                      setGenChannel(e.target.value as 'InstaPay' | 'خزينة نقدية (Cash)' | 'تحويل بنكي')
                    }
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="InstaPay">InstaPay (انستا باي فوري)</option>
                    <option value="خزينة نقدية (Cash)">خزينة نقدية (Cash)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#192631]/70 font-bold mb-1">المستخلص أو محضر الاستلام المرتبط (ST / SIR)</label>
                <input
                  type="text"
                  value={genLinkedDoc}
                  onChange={(e) => setGenLinkedDoc(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#e04b2a] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#192631]/70 font-bold mb-1">البيان المحاسبي والغرض من الصرف</label>
                <textarea
                  rows={2}
                  value={genPurpose}
                  onChange={(e) => setGenPurpose(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                />
              </div>

              {/* Live Generated Code Box */}
              <div className="bg-[#f5f5f5]/85 border border-[#e04b2a]/25 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#192631]/70 font-bold">الكود القياسي المولد تلقائياً (شيت التكويد):</p>
                  <p className="font-mono text-xs font-black text-[#e04b2a] mt-0.5">{generatedStandardCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(generatedStandardCode)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#192631]/[0.05] hover:bg-[#192631]/[0.05] text-[#192631]/85 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedCode === generatedStandardCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#123524]" />
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
          <div className="xl:col-span-7 bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#192631]">
                  سجل أوامر الدفع النقدي (CPO) وتسويات العهد (RCB)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  مربوط مباشرة بدفتر أستاذ مقاولي الباطن (63 حساب) ومراجعة أ. ميرنا ماجد (الحسابات)
                </p>
              </div>
              <Receipt className="w-5 h-5 text-[#123524]" />
            </div>

            <div className="space-y-3">
              {cashOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#192631]/10 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-md font-mono text-[11px] font-black border',
                          ord.docType === 'CPO'
                            ? 'bg-[#123524]/10 text-[#123524] border-[#123524]/25'
                            : 'bg-sky-500/15 text-[#192631] border-sky-500/30'
                        )}
                      >
                        {ord.docType}
                      </span>
                      <span className="font-mono text-xs font-black text-[#192631]">{ord.officialCode}</span>
                      <button
                        onClick={() => handleCopyCode(ord.officialCode)}
                        className="text-[#192631]/70 hover:text-[#e04b2a] transition-colors"
                        title="نسخ الكود الرسمي"
                      >
                        {copiedCode === ord.officialCode ? (
                          <Check className="w-3.5 h-3.5 text-[#123524]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs font-bold text-[#192631]">
                      المستفيد: {ord.beneficiaryName}{' '}
                      <span className="font-mono text-[11px] text-[#e04b2a]">
                        ({ord.subcontractorOrEngineerCode})
                      </span>
                    </p>
                    <p className="text-xs text-[#192631]/70">{ord.purposeAr}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#192631]/70 pt-1">
                      <span>
                        المستند المرجعي: <strong className="font-mono text-[#192631]">{ord.linkedStOrSirCode}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        المسؤول المالي: <strong className="text-[#123524]">{ord.accountingOfficer}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        القناة: <strong className="text-[#e04b2a]">{ord.paymentChannel}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                    <div className="text-start">
                      <p className="text-lg font-black text-[#123524]">
                        {ord.amountEgp.toLocaleString()} <span className="text-xs">ج.م</span>
                      </p>
                      <p className="text-[10px] text-[#192631]/60 font-mono">{ord.date}</p>
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
                      <span className="px-2.5 py-1 rounded-lg bg-[#123524]/10 border border-[#123524]/25 text-[#123524] text-[11px] font-bold flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 bg-[#192631]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
              <div>
                <span className="text-[11px] font-mono font-black text-[#e04b2a]">
                  {evaluatingSub.nexusCode} · CEO 4-PILLAR MATRIX
                </span>
                <h3 className="text-lg font-black text-[#192631] mt-0.5">
                  تقييم الإدارة والمكتب الفني: {evaluatingSub.name}
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingSub(null)}
                className="text-[#192631]/70 hover:text-[#192631] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">
                    1. جودة التنفيذ والاستلام الهندسي
                  </label>
                  <select
                    value={evalQuality}
                    onChange={(e) => setEvalQuality(e.target.value as GradeTier)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="A">A - ممتاز (استلام من أول مرة)</option>
                    <option value="B">B - جيد جداً (ملاحظات طفيفة)</option>
                    <option value="C">C - مقبول / تحت الملاحظة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">2. مناسبة الأسعار للسوق</label>
                  <select
                    value={evalPricing}
                    onChange={(e) => setEvalPricing(e.target.value as GradeTier)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="A">A - منافس جداً ومطابق للموازنة</option>
                    <option value="B">B - مناسب لسعر السوق</option>
                    <option value="C">C - مرتفع عن الموازنة المستهدفة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">
                    3. الالتزام بالمواعيد والبرنامج الزمني
                  </label>
                  <select
                    value={evalSchedule}
                    onChange={(e) => setEvalSchedule(e.target.value as GradeTier)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="A">A - التزام كامل وعمالة كافية</option>
                    <option value="B">B - التزام متوسط</option>
                    <option value="C">C - تأخيرات متكررة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">
                    4. التعامل والأخلاقيات بالموقع
                  </label>
                  <select
                    value={evalEthics}
                    onChange={(e) => setEvalEthics(e.target.value as GradeTier)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="A">A - تعاون ممتاز وحفاظ على الخامات</option>
                    <option value="B">B - جيد</option>
                    <option value="C">C - يحتاج توجيه ومراقبة هالك</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#192631]/85 font-bold mb-1">جهة التقييم المعتمدة</label>
                <input
                  type="text"
                  value={evalReviewer}
                  onChange={(e) => setEvalReviewer(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                />
              </div>

              <div>
                <label className="block text-[#192631]/85 font-bold mb-1">
                  ملاحظات الإدارة التنفيذية والمكتب الفني
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingSub(null)}
                  className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-[#192631]/85 font-bold"
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
        <div className="fixed inset-0 z-50 bg-[#192631]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
              <h3 className="text-lg font-black text-[#192631]">تسجيل مقاول باطن / صنايعي جديد بالدليل</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-[#192631]/70 hover:text-[#192631] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubcontractor} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">التخصص الهندسي (كود البادئة)</label>
                  <select
                    value={newSubTrade}
                    onChange={(e) => setNewSubTrade(e.target.value as Exclude<TradeSpecialtyCode, 'ALL'>)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    {TRADE_SPECIALTIES.filter((t) => t.code !== 'ALL').map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">طبيعة العمل</label>
                  <select
                    value={newSubNature}
                    onChange={(e) => setNewSubNature(e.target.value as WorkNatureType)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="مصنعيات فقط">مصنعيات فقط (Labor Only)</option>
                    <option value="توريد وتركيب">توريد وتركيب (Supply & Install)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#192631]/85 font-bold mb-1">اسم المقاول / الصنايعي أو الورشة</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="مثال: الأسطى حسن عبد الرحمن للرخام..."
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">الوصف الفني الدقيق</label>
                  <input
                    type="text"
                    value={newSubTitle}
                    onChange={(e) => setNewSubTitle(e.target.value)}
                    placeholder="تركيب أرضيات وحوائط..."
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">رقم الموبايل / InstaPay</label>
                  <input
                    type="text"
                    value={newSubPhone}
                    onChange={(e) => setNewSubPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#192631]/85 font-bold mb-1">أكواد المشاريع المسندة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={newSubProjects}
                  onChange={(e) => setNewSubProjects(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#192631]/85 font-bold mb-1">ملاحظات هندسية مبدئية</label>
                <textarea
                  rows={2}
                  value={newSubNotes}
                  onChange={(e) => setNewSubNotes(e.target.value)}
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-[#192631]/85 font-bold"
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
        <div className="fixed inset-0 z-50 bg-[#192631]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/85 backdrop-blur-xl border border-[#192631]/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
              <h3 className="text-lg font-black text-[#192631]">تحرير مستخلص مقاول باطن جديد (كود ST)</h3>
              <button
                onClick={() => setShowCreateStModal(false)}
                className="text-[#192631]/70 hover:text-[#192631] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStatement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">كود المشروع</label>
                  <select
                    value={stProjectCode}
                    onChange={(e) => setStProjectCode(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                  >
                    <option value="C096">C096 - فيلا التجمع الخامس</option>
                    <option value="C063">C063 - شقة الشيخ زايد</option>
                    <option value="C091">C091 - مشروع نيو كايرو</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">المقاول المسجل</label>
                  <select
                    value={stSubCode}
                    onChange={(e) => setStSubCode(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
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
                  <label className="block text-[#192631]/85 font-bold mb-1">رقم المستخلص</label>
                  <input
                    type="text"
                    value={stNumber}
                    onChange={(e) => setStNumber(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/85 font-bold mb-1">كود محضر الاستلام الهندسي (SIR)</label>
                  <input
                    type="text"
                    value={stSirCode}
                    onChange={(e) => setStSirCode(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#123524] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#192631]/85 font-bold mb-1">بيان الأعمال المنفذة بالمستخلص</label>
                <input
                  type="text"
                  required
                  value={stWorkDesc}
                  onChange={(e) => setStWorkDesc(e.target.value)}
                  placeholder="مثال: تركيب بورسلين أرضيات مقاس 60×120..."
                  className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                />
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={stUnit}
                    onChange={(e) => setStUnit(e.target.value)}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">كمية سابقة</label>
                  <input
                    type="number"
                    value={stPrevQty}
                    onChange={(e) => setStPrevQty(Number(e.target.value))}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">كمية حالية</label>
                  <input
                    type="number"
                    value={stCurrQty}
                    onChange={(e) => setStCurrQty(Number(e.target.value))}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#e04b2a] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">فئة الوحدة (ج.م)</label>
                  <input
                    type="number"
                    value={stUnitPrice}
                    onChange={(e) => setStUnitPrice(Number(e.target.value))}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">خصومات خامات / هالك على المقاول (ج.م)</label>
                  <input
                    type="number"
                    value={stDeductions}
                    onChange={(e) => setStDeductions(Number(e.target.value))}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-red-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#192631]/70 font-bold mb-1">الدفعات السابقة المصروفة (ج.م)</label>
                  <input
                    type="number"
                    value={stPrevPayments}
                    onChange={(e) => setStPrevPayments(Number(e.target.value))}
                    className="w-full bg-[#f5f5f5]/85 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stSirApproved}
                  onChange={(e) => setStSirApproved(e.target.checked)}
                  className="rounded border-[#192631]/10 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-[#123524] font-bold">
                  محضر الاستلام الهندسي (SIR) موقع ومعتمد من مهندس الموقع (م. بيير / م. معتز)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateStModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-[#192631]/85 font-bold"
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
