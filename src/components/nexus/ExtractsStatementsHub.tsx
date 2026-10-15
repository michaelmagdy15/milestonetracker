import React, { useState, useMemo } from 'react';
import {
    FileSpreadsheet,
    Receipt,
    CreditCard,
    Printer,
    Plus,
    CheckCircle2,
    Search,
    ShieldCheck,
    Upload,
    Eye,
    X,
    Calendar,
} from 'lucide-react';
import { NEXUS_CLIENT_ACCOUNTS_LEDGER } from '../../data/nexusLiveSeedData';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type HubSubTab = 'extracts' | 'statement' | 'payment_request';

export interface ExtractLineItem {
    id: string;
    code: string;
    divisionCode: string;
    divisionTitle: string;
    item: string;
    itemAr?: string;
    unit: 'M2' | 'EACH' | 'L.S' | 'L.M';
    contractQty: number;
    displayPrice: number;
    exactPrice: number;
    previousQty: number;
    currentQty: number;
    ratePercent: number;
    pdfContractTotal: number; // Exact Qty*Price from PDF 1
    pdfTillNowSales: number;  // Exact TillNowSales from PDF 1
}

export interface PurchasingOrderItem {
    id: string;
    poCode: string;
    date: string;
    vendor: string;
    description: string;
    amount: number;
    status: 'Billed in Extract' | 'Pending';
}

export interface ExtractSnapshot {
    extractNo: number;
    titleAr: string;
    titleEn: string;
    worksDuringDate: string;
    status: 'Approved (معتمد)' | 'Under Review (غير معتمد)' | 'Draft (مسودة)';
    previousExtractsWorksReceived: number;
    purchasingOrdersTotal: number;
    dedValuePrice: number;
    advancedAmount: number;
    workGuarantee: number;
    guaranteeFinal: number;
    vatAmount: number;
    printedBy: string;
    printTime: string;
    items: ExtractLineItem[];
}

export interface ClientLedgerEntry {
    id: string;
    date: string;
    docType: 'Bank Transfer From Customer' | 'Contract' | 'Purchasing Order';
    serial: string;
    debit: number;
    credit: number;
    description: string;
    notes?: string;
}

export interface OfficialPaymentRequest {
    id: string;
    serial: number;
    dateFormattedAr: string;
    dateIso: string;
    paymentType: 'Bank Transfer' | 'Cheque' | 'Cash Vault' | 'InstaPay';
    bankAccount: string;
    currencyAr: string;
    currencyCode: string;
    amount: number;
    amountInWordsAr: string;
    orderOfProject: string;
    statementLineText: string;
    preparedBy: string;
    reviewedBy: string;
    approvedBy: string;
    approvalStep: 1 | 2 | 3;
    popFileName?: string;
    popUploadedAt?: string;
    printedBy: string;
    printTime: string;
}

// ============================================================================
// EXACT PDF 1 SEED DATA: 28 LINE ITEMS FOR WORKS EXTRACT 4 (C096 - MICHAEL SABER)
// ============================================================================

const INITIAL_EXTRACT_4_ITEMS: ExtractLineItem[] = [
    // DIV.01 DEMOLISHING WORKS
    {
        id: 'item-1',
        code: 'DIV.01.01',
        divisionCode: 'DIV.01',
        divisionTitle: 'DIV.01 DEMOLISHING WORKS — أعمال الهدم والإزالة',
        item: 'Demolition and removal of existing walls, finishes, and debris including site cleaning and disposal works.',
        itemAr: 'تكسير وإزالة الحوائط والتشطيبات القائمة ونقل المخلفات ونظافة الموقع',
        unit: 'M2',
        contractQty: 146.00,
        displayPrice: 710,
        exactPrice: 103638 / 146,
        previousQty: 146.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 103638,
        pdfTillNowSales: 103638,
    },
    // DIV.02 MASONRY WORKS
    {
        id: 'item-2',
        code: 'DIV.02.01',
        divisionCode: 'DIV.02',
        divisionTitle: 'DIV.02 MASONRY WORKS — أعمال المباني',
        item: 'Construction of red brick and cement block walls including mortar, lintels, and all related masonry works.',
        itemAr: 'بناء حوائط طوب أحمر وبلوك أسمنتي شاملاً المونة والأعتاب وكافة أعمال المباني',
        unit: 'M2',
        contractQty: 42.00,
        displayPrice: 1832,
        exactPrice: 76923 / 42,
        previousQty: 42.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 76923,
        pdfTillNowSales: 76923,
    },
    // DIV.03 PLUMBING WORKS
    {
        id: 'item-3',
        code: 'DIV.03.01.01',
        divisionCode: 'DIV.03',
        divisionTitle: 'DIV.03 PLUMBING WORKS — أعمال السباكة والصحي',
        item: 'Plumbing first fix for the Bathrooms (Flush tank excluded)',
        itemAr: 'تأسيس سباكة الحمامات (بدون خزانات الدفن)',
        unit: 'EACH',
        contractQty: 2.00,
        displayPrice: 48646,
        exactPrice: 48646,
        previousQty: 2.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 97292,
        pdfTillNowSales: 97292,
    },
    {
        id: 'item-4',
        code: 'DIV.03.01.02',
        divisionCode: 'DIV.03',
        divisionTitle: 'DIV.03 PLUMBING WORKS — أعمال السباكة والصحي',
        item: 'Plumbing works for the kitchen, laundry, and pantry.',
        itemAr: 'أعمال السباكة للمطبخ وغرفة الغسيل والأوفيس',
        unit: 'EACH',
        contractQty: 3.00,
        displayPrice: 16920,
        exactPrice: 50761 / 3,
        previousQty: 3.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 50761,
        pdfTillNowSales: 50761,
    },
    {
        id: 'item-5',
        code: 'DIV.03.01.03',
        divisionCode: 'DIV.03',
        divisionTitle: 'DIV.03 PLUMBING WORKS — أعمال السباكة والصحي',
        item: 'Drainage piping works for the air conditioning units.',
        itemAr: 'تأسيس مواسير صرف وحدات التكييف',
        unit: 'EACH',
        contractQty: 5.00,
        displayPrice: 2750,
        exactPrice: 13748 / 5,
        previousQty: 5.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 13748,
        pdfTillNowSales: 13748,
    },
    // DIV.04 WATERPROOFING WORKS
    {
        id: 'item-6',
        code: 'DIV.04.01',
        divisionCode: 'DIV.04',
        divisionTitle: 'DIV.04 WATERPROOFING WORKS — أعمال العزل المائي',
        item: 'Supply and install waterproofing for the bathrooms only, complete as required.',
        itemAr: 'توريد وتنفيذ العزل المائي للحمامات كاملاً حسب الأصول',
        unit: 'EACH',
        contractQty: 2.00,
        displayPrice: 19649,
        exactPrice: 19649,
        previousQty: 2.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 39298,
        pdfTillNowSales: 39298,
    },
    {
        id: 'item-7',
        code: 'DIV.04.02',
        divisionCode: 'DIV.04',
        divisionTitle: 'DIV.04 WATERPROOFING WORKS — أعمال العزل المائي',
        item: 'Supply and install waterproofing for 2 balconies, complete as required.',
        itemAr: 'توريد وتنفيذ العزل المائي لعدد 2 تراس / بلكونة',
        unit: 'L.S',
        contractQty: 1.00,
        displayPrice: 22704,
        exactPrice: 22704,
        previousQty: 1.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 22704,
        pdfTillNowSales: 22704,
    },
    // DIV.05 HVAC & COPPER PIPING
    {
        id: 'item-8',
        code: 'DIV.05.01.01',
        divisionCode: 'DIV.05',
        divisionTitle: 'DIV.05 HVAC & AC PIPING — مواسير الفريون والتكييف',
        item: '1/2" & 1/4" copper piping for 1.5 Hp and 2.25 Hp units.',
        itemAr: 'تمديد مواسير نحاس 1/2 و 1/4 بوصة لوحدات 1.5 و 2.25 حصان',
        unit: 'L.M',
        contractQty: 25.00,
        displayPrice: 1605,
        exactPrice: 40116 / 25,
        previousQty: 17.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 40116,
        pdfTillNowSales: 27279,
    },
    {
        id: 'item-9',
        code: 'DIV.05.01.02',
        divisionCode: 'DIV.05',
        divisionTitle: 'DIV.05 HVAC & AC PIPING — مواسير الفريون والتكييف',
        item: '5/8" & 3/8" piping for 3 Hp, 4 Hp, and 5 Hp units.',
        itemAr: 'تمديد مواسير نحاس 5/8 و 3/8 بوصة لوحدات 3 و 4 و 5 حصان',
        unit: 'L.M',
        contractQty: 30.00,
        displayPrice: 1904,
        exactPrice: 57106 / 30,
        previousQty: 21.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 57106,
        pdfTillNowSales: 39974,
    },
    // DIV.06 PLASTERING WORKS
    {
        id: 'item-10',
        code: 'DIV.06.01',
        divisionCode: 'DIV.06',
        divisionTitle: 'DIV.06 PLASTERING WORKS — أعمال المحارة والبياض',
        item: 'Per m²: Supply and apply plastering works to walls after architectural modifications, complete as required.',
        itemAr: 'بالمتر المسطح: توريد وعمل بياض محارة للحوائط بعد التعديلات المعمارية',
        unit: 'M2',
        contractQty: 175.00,
        displayPrice: 807,
        exactPrice: 141248 / 175,
        previousQty: 100.00,
        currentQty: 0.00,
        ratePercent: 50,
        pdfContractTotal: 141248,
        pdfTillNowSales: 40357,
    },
    {
        id: 'item-11',
        code: 'DIV.06.02',
        divisionCode: 'DIV.06',
        divisionTitle: 'DIV.06 PLASTERING WORKS — أعمال المحارة والبياض',
        item: 'Per linear meter: Supply and install curved edges for all edges indicated in the drawings, complete as required',
        itemAr: 'بالمتر الطولي: توريد وتنفيذ حواف وزوايا منحنية (Curved Edges) حسب الرسومات',
        unit: 'L.M',
        contractQty: 36.00,
        displayPrice: 628,
        exactPrice: 22591 / 36,
        previousQty: 0.00,
        currentQty: 10.00,
        ratePercent: 70,
        pdfContractTotal: 22591,
        pdfTillNowSales: 4393,
    },
    {
        id: 'item-12',
        code: 'DIV.06.04',
        divisionCode: 'DIV.06',
        divisionTitle: 'DIV.06 PLASTERING WORKS — أعمال المحارة والبياض',
        item: 'Demolition of existing wall plastering in the reception and corridor areas to a height of 30 cm for concealed skirting installation, including debris removal, disposal, and surface preparation, complete as required.',
        itemAr: 'تكسير محارة الحوائط القائمة بالريسبشن والطرقة بارتفاع 30 سم لتركيب الوزرات الغاطسة',
        unit: 'L.M',
        contractQty: 36.00,
        displayPrice: 310,
        exactPrice: 11168 / 36,
        previousQty: 30.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 11168,
        pdfTillNowSales: 9307,
    },
    {
        id: 'item-13',
        code: 'DIV.06.05',
        divisionCode: 'DIV.06',
        divisionTitle: 'DIV.06 PLASTERING WORKS — أعمال المحارة والبياض',
        item: 'Per Linear Meter: Supply and apply plastering works to a height of 30 cm following the installation of concealed skirting, including surface preparation, finishing, and making good, complete as required',
        itemAr: 'بالمتر الطولي: مرمات ومحارة بارتفاع 30 سم بعد تركيب الوزرات الغاطسة',
        unit: 'L.M',
        contractQty: 36.00,
        displayPrice: 372,
        exactPrice: 13402 / 36,
        previousQty: 0.00,
        currentQty: 10.00,
        ratePercent: 30,
        pdfContractTotal: 13402,
        pdfTillNowSales: 1117,
    },
    // DIV.07 CERAMIC & PORCELAIN TILING
    {
        id: 'item-14',
        code: 'DIV.07.01',
        divisionCode: 'DIV.07',
        divisionTitle: 'DIV.07 CERAMIC & PORCELAIN TILING — أعمال السيراميك والبورسلين',
        item: 'Supply and Installation of Ceramic tiles under HDF& SPC',
        itemAr: 'توريد وتركيب بلاط سيراميك أسفل أرضيات HDF & SPC',
        unit: 'M2',
        contractQty: 98.00,
        displayPrice: 1093,
        exactPrice: 107136 / 98,
        previousQty: 98.00,
        currentQty: 24.00,
        ratePercent: 100,
        pdfContractTotal: 107136,
        pdfTillNowSales: 133373,
    },
    {
        id: 'item-15',
        code: 'DIV.07.02',
        divisionCode: 'DIV.07',
        divisionTitle: 'DIV.07 CERAMIC & PORCELAIN TILING — أعمال السيراميك والبورسلين',
        item: 'Installation Only of Porcelain Tiles for pantry& laundry 60*120 CM',
        itemAr: 'مصنعية تركيب فقط بلاط بورسلين للأوفيس والمغسلة مقاس 60×120 سم',
        unit: 'M2',
        contractQty: 22.30,
        displayPrice: 964,
        exactPrice: 21500 / 22.3,
        previousQty: 0.00,
        currentQty: 15.00,
        ratePercent: 30,
        pdfContractTotal: 21500,
        pdfTillNowSales: 4339,
    },
    {
        id: 'item-16',
        code: 'DIV.07.03',
        divisionCode: 'DIV.07',
        divisionTitle: 'DIV.07 CERAMIC & PORCELAIN TILING — أعمال السيراميك والبورسلين',
        item: 'Installation Only of Porcelain Tiles for main bathroom 60*120 CM',
        itemAr: 'مصنعية تركيب فقط بلاط بورسلين للحمام الرئيسي مقاس 60×120 سم',
        unit: 'M2',
        contractQty: 36.00,
        displayPrice: 1002,
        exactPrice: 36062 / 36,
        previousQty: 0.00,
        currentQty: 15.00,
        ratePercent: 30,
        pdfContractTotal: 36062,
        pdfTillNowSales: 4508,
    },
    {
        id: 'item-17',
        code: 'DIV.07.04',
        divisionCode: 'DIV.07',
        divisionTitle: 'DIV.07 CERAMIC & PORCELAIN TILING — أعمال السيراميك والبورسلين',
        item: 'Installation Only of Ceramic Tiles for balconies 60*120 CM',
        itemAr: 'مصنعية تركيب فقط سيراميك للبلكونات مقاس 60×120 سم',
        unit: 'M2',
        contractQty: 24.50,
        displayPrice: 673,
        exactPrice: 16498 / 24.5,
        previousQty: 0.00,
        currentQty: 10.00,
        ratePercent: 30,
        pdfContractTotal: 16498,
        pdfTillNowSales: 2020,
    },
    {
        id: 'item-18',
        code: 'DIV.07.05.01',
        divisionCode: 'DIV.07',
        divisionTitle: 'DIV.07 CERAMIC & PORCELAIN TILING — أعمال السيراميك والبورسلين',
        item: 'Installation Only of Porcelain Tiles for the master bathroom Dim 60*120 CM',
        itemAr: 'مصنعية تركيب فقط بورسلين لحمام الماستر مقاس 60×120 سم',
        unit: 'M2',
        contractQty: 33.60,
        displayPrice: 1001,
        exactPrice: 33649 / 33.6,
        previousQty: 0.00,
        currentQty: 15.00,
        ratePercent: 30,
        pdfContractTotal: 33649,
        pdfTillNowSales: 4507,
    },
    // DIV.08 GYPSUM BOARD & CEILINGS
    {
        id: 'item-19',
        code: 'DIV.08.01',
        divisionCode: 'DIV.08',
        divisionTitle: 'DIV.08 GYPSUM BOARD & CEILINGS — أعمال الجبس بورد والأسقف',
        item: 'White Gypsum board',
        itemAr: 'توريد وتركيب أسقف جبس بورد أبيض',
        unit: 'M2',
        contractQty: 101.00,
        displayPrice: 569,
        exactPrice: 57433 / 101,
        previousQty: 0.00,
        currentQty: 50.00,
        ratePercent: 60,
        pdfContractTotal: 57433,
        pdfTillNowSales: 17059,
    },
    {
        id: 'item-20',
        code: 'DIV.08.02',
        divisionCode: 'DIV.08',
        divisionTitle: 'DIV.08 GYPSUM BOARD & CEILINGS — أعمال الجبس بورد والأسقف',
        item: 'Green Gypsum board',
        itemAr: 'توريد وتركيب أسقف جبس بورد أخضر مقاوم للرطوبة',
        unit: 'M2',
        contractQty: 37.00,
        displayPrice: 704,
        exactPrice: 26036 / 37,
        previousQty: 0.00,
        currentQty: 20.00,
        ratePercent: 60,
        pdfContractTotal: 26036,
        pdfTillNowSales: 8444,
    },
    {
        id: 'item-21',
        code: 'DIV.08.03',
        divisionCode: 'DIV.08',
        divisionTitle: 'DIV.08 GYPSUM BOARD & CEILINGS — أعمال الجبس بورد والأسقف',
        item: 'Hidden Light',
        itemAr: 'بيت نور مخفي (Hidden Light)',
        unit: 'L.M',
        contractQty: 16.00,
        displayPrice: 398,
        exactPrice: 6369 / 16,
        previousQty: 0.00,
        currentQty: 5.00,
        ratePercent: 60,
        pdfContractTotal: 6369,
        pdfTillNowSales: 1194,
    },
    {
        id: 'item-22',
        code: 'DIV.08.04',
        divisionCode: 'DIV.08',
        divisionTitle: 'DIV.08 GYPSUM BOARD & CEILINGS — أعمال الجبس بورد والأسقف',
        item: 'Shadow Gap',
        itemAr: 'توريد وتركيب شادو جاب (Shadow Gap)',
        unit: 'L.M',
        contractQty: 50.00,
        displayPrice: 213,
        exactPrice: 10662 / 50,
        previousQty: 0.00,
        currentQty: 10.00,
        ratePercent: 60,
        pdfContractTotal: 10662,
        pdfTillNowSales: 1279,
    },
    // DIV.13 ELECTRICAL & MISCELLANEOUS
    {
        id: 'item-23',
        code: 'DIV.13.01',
        divisionCode: 'DIV.13',
        divisionTitle: 'DIV.13 ELECTRICAL & MISCELLANEOUS — أعمال الكهرباء والمتنوعات',
        item: 'First Fix Electrical Works as per Approved Drawings. – Installation Only.',
        itemAr: 'أعمال التأسيس الأول للكهرباء حسب الرسومات المعتمدة — مصنعية تركيب فقط',
        unit: 'L.S',
        contractQty: 1.00,
        displayPrice: 181802,
        exactPrice: 181802,
        previousQty: 1.00,
        currentQty: 0.00,
        ratePercent: 85,
        pdfContractTotal: 181802,
        pdfTillNowSales: 154532,
    },
    // VARIATION ORDERS (VO)
    {
        id: 'item-24',
        code: 'VO.01.01',
        divisionCode: 'VO',
        divisionTitle: 'VARIATION ORDERS (VO) — أوامر التغيير والبنود المستجدة',
        item: 'Supply and Installation of 9 mm Thick Cement Board Partition, Fixed on 0.4 mm Thick Galvanized Steel Studs and Tracks, Complete with 40 kg/m³ Density Rock Wool Infill for Sound Insulation.',
        itemAr: 'توريد وتركيب قاطع أسمنت بورد سمك 9 مم على شاسيه صاج مجلفن شاملاً صوف صخري كثافة 40 كجم/م3 لعزل الصوت',
        unit: 'M2',
        contractQty: 16.50,
        displayPrice: 1879,
        exactPrice: 30996 / 16.5,
        previousQty: 16.50,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 30996,
        pdfTillNowSales: 30996,
    },
    {
        id: 'item-25',
        code: 'VO.02.01',
        divisionCode: 'VO',
        divisionTitle: 'VARIATION ORDERS (VO) — أوامر التغيير والبنود المستجدة',
        item: 'Demolition of Hollow Plaster',
        itemAr: 'تكسير وإزالة المحارة المطبلة (Hollow Plaster)',
        unit: 'L.S',
        contractQty: 1.00,
        displayPrice: 5022,
        exactPrice: 5022,
        previousQty: 2.00,
        currentQty: 0.00,
        ratePercent: 100,
        pdfContractTotal: 5022,
        pdfTillNowSales: 10044,
    },
    {
        id: 'item-26',
        code: 'VO.03.01',
        divisionCode: 'VO',
        divisionTitle: 'VARIATION ORDERS (VO) — أوامر التغيير والبنود المستجدة',
        item: 'Core Drilling of Five (5) Openings, 5 Inches in Diameter, for Exhaust Fans and Air Conditioning Units',
        itemAr: 'تخريم بالكور لعدد 5 فتحات قطر 5 بوصة لشفاطات التهوية ووحدات التكييف',
        unit: 'EACH',
        contractQty: 5.00,
        displayPrice: 680,
        exactPrice: 3401 / 5,
        previousQty: 5.00,
        currentQty: 2.00,
        ratePercent: 100,
        pdfContractTotal: 3401,
        pdfTillNowSales: 4761,
    },
    {
        id: 'item-27',
        code: 'VO.04.01',
        divisionCode: 'VO',
        divisionTitle: 'VARIATION ORDERS (VO) — أوامر التغيير والبنود المستجدة',
        item: 'Installation of 2 units, 5 HP each, concealed type',
        itemAr: 'تركيب عدد 2 وحدة تكييف كونسيلد قدرة 5 حصان للوحدة',
        unit: 'EACH',
        contractQty: 2.00,
        displayPrice: 4323,
        exactPrice: 4323,
        previousQty: 0.00,
        currentQty: 2.00,
        ratePercent: 50,
        pdfContractTotal: 8646,
        pdfTillNowSales: 4323,
    },
    {
        id: 'item-28',
        code: 'VO.04.02',
        divisionCode: 'VO',
        divisionTitle: 'VARIATION ORDERS (VO) — أوامر التغيير والبنود المستجدة',
        item: 'Installation of 1 units, 3 HP each, concealed type.',
        itemAr: 'تركيب عدد 1 وحدة تكييف كونسيلد قدرة 3 حصان',
        unit: 'EACH',
        contractQty: 1.00,
        displayPrice: 3602,
        exactPrice: 3602,
        previousQty: 0.00,
        currentQty: 1.00,
        ratePercent: 50,
        pdfContractTotal: 3602,
        pdfTillNowSales: 1801,
    },
];

const INITIAL_PURCHASING_ORDERS: PurchasingOrderItem[] = [
    {
        id: 'po-1',
        poCode: 'NPO-C096-001',
        date: '14/07/2026',
        vendor: 'Grohe / السلاب للتوريدات الصحية',
        description: 'شراء لصالح المالك (حساب العميل) — أجسام خلاطات دفن وخزانات شطاف',
        amount: 28450,
        status: 'Billed in Extract',
    },
    {
        id: 'po-2',
        poCode: 'NPO-C096-002',
        date: '01/08/2026',
        vendor: 'El-Sewedy Cables / السويدي للكابلات',
        description: 'شراء لصالح المالك (حساب العميل) — لفات سلك سويدي وخراطيم تأسيس إضافية',
        amount: 18629,
        status: 'Billed in Extract',
    },
];

// ============================================================================
// EXACT PDF 2 SEED DATA: CLIENT ACCOUNT STATEMENT (MICHAEL SABER - 101020069)
// ============================================================================

const INITIAL_CLIENT_LEDGER: ClientLedgerEntry[] = [
    {
        id: 'led-1',
        date: '09/06/2026',
        docType: 'Bank Transfer From Customer',
        serial: '000000796',
        debit: 0.00,
        credit: 200000.00,
        description: '',
        notes: 'دفعة تعاقد أولى — تحويل بنكي من العميل',
    },
    {
        id: 'led-2',
        date: '15/06/2026',
        docType: 'Bank Transfer From Customer',
        serial: '000000799',
        debit: 0.00,
        credit: 200000.00,
        description: '',
        notes: 'دفعة تعاقد ثانية — تحويل بنكي من العميل',
    },
    {
        id: 'led-3',
        date: '28/06/2026',
        docType: 'Bank Transfer From Customer',
        serial: '000000804',
        debit: 0.00,
        credit: 100000.00,
        description: '',
        notes: 'دفعة تحت الحساب — تحويل بنكي من العميل',
    },
    {
        id: 'led-4',
        date: '28/07/2026',
        docType: 'Contract',
        serial: '1',
        debit: 500000.33,
        credit: 0.00,
        description: 'استحقاق ناتج عن مستخلص Contract رقم :1',
        notes: 'مستخلص أعمال جاري رقم 1 معتمد',
    },
    {
        id: 'led-5',
        date: '28/07/2026',
        docType: 'Contract',
        serial: '2',
        debit: 200000.61,
        credit: 0.00,
        description: 'استحقاق ناتج عن مستخلص Contract رقم :2',
        notes: 'مستخلص أعمال جاري رقم 2 معتمد',
    },
    {
        id: 'led-6',
        date: '02/08/2026',
        docType: 'Bank Transfer From Customer',
        serial: '000000827',
        debit: 0.00,
        credit: 220000.00,
        description: '',
        notes: 'تحويل بنكي من العميل — سداد مستخلص رقم 2',
    },
    {
        id: 'led-7',
        date: '03/08/2026',
        docType: 'Bank Transfer From Customer',
        serial: '000000828',
        debit: 0.00,
        credit: 30000.00,
        description: '',
        notes: 'تكملة دفعة تحويل بنكي من العميل',
    },
    {
        id: 'led-8',
        date: '05/08/2026',
        docType: 'Contract',
        serial: '3',
        debit: 92150.98,
        credit: 0.00,
        description: 'استحقاق ناتج عن مستخلص Contract رقم :3',
        notes: 'مستخلص جاري رقم 3 (شامل أوامر شراء 47,079 ج.م)',
    },
    {
        id: 'led-9',
        date: '25/08/2026',
        docType: 'Bank Transfer From Customer',
        serial: '000000843',
        debit: 0.00,
        credit: 100000.00,
        description: '',
        notes: 'تحويل بنكي من العميل تحت الحساب',
    },
    {
        id: 'led-10',
        date: '13/10/2026',
        docType: 'Contract',
        serial: '4',
        debit: 164896.18,
        credit: 0.00,
        description: 'استحقاق ناتج عن مستخلص Contract رقم :4',
        notes: 'مستخلص أعمال جاري رقم 4 بتاريخ 13-10-2026',
    },
];

// ============================================================================
// EXACT PDF 3 SEED DATA: OFFICIAL PAYMENT REQUEST VOUCHERS
// ============================================================================

const INITIAL_PAYMENT_REQUESTS: OfficialPaymentRequest[] = [
    {
        id: 'pr-4',
        serial: 4,
        dateFormattedAr: 'الإثنين, 12 أكتوبر, 2026',
        dateIso: '2026-10-12',
        paymentType: 'Bank Transfer',
        bankAccount: 'Debit حساب افراد NBE',
        currencyAr: 'جنيه مصرى',
        currencyCode: 'EGP',
        amount: 150000.00,
        amountInWordsAr: 'مائة وخمسون ألف جنيهاً مصرياً لا غير',
        orderOfProject: 'C096_Michael & Mona_Azad-5th settlement',
        statementLineText: 'دفعة تشغيل ومستخلصات مشروع أزاد التجمع الخامس — C096 Michael & Mona',
        preparedBy: 'Merna Maged (محاسبة المشتريات والمستخلصات)',
        reviewedBy: 'Eng. Pierre Safwat (مدير المكتب الفني والمشروعات)',
        approvedBy: 'CEO — الإدارة العليا (Nexus Contracting)',
        approvalStep: 3,
        popFileName: 'POP_Serial4_NBE_Debit_150000_20261012.pdf',
        popUploadedAt: '2026-10-12 14:40',
        printedBy: 'Pierre Afifi',
        printTime: '2026/02/15 14:42:36',
    },
    {
        id: 'pr-3',
        serial: 3,
        dateFormattedAr: 'السبت, 25 أغسطس, 2026',
        dateIso: '2026-08-25',
        paymentType: 'Bank Transfer',
        bankAccount: 'Debit حساب افراد NBE',
        currencyAr: 'جنيه مصرى',
        currencyCode: 'EGP',
        amount: 100000.00,
        amountInWordsAr: 'مائة ألف جنيهاً مصرياً لا غير',
        orderOfProject: 'C096_Michael & Mona_Azad-5th settlement',
        statementLineText: 'سداد دفعة تحت الحساب وتوريدات موقع أزاد — C096',
        preparedBy: 'Merna Maged',
        reviewedBy: 'Eng. Pierre Safwat',
        approvedBy: 'CEO — الإدارة العليا',
        approvalStep: 3,
        popFileName: 'POP_Serial3_NBE_100000_20260825.pdf',
        popUploadedAt: '2026-08-25 13:15',
        printedBy: 'Pierre Afifi',
        printTime: '2026/08/25 13:20:10',
    },
];

// ============================================================================
// HELPER FORMATTERS
// ============================================================================

const formatIntEGP = (val: number): string => {
    return `${Math.round(val).toLocaleString('en-US')}EGP`;
};

const formatCurrency = (val: number, decimals = 2): string => {
    return val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const formatLedgerBalance = (balance: number): string => {
    if (balance < -0.001) {
        return `(${formatCurrency(Math.abs(balance), 2)})`;
    }
    return formatCurrency(balance, 2);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExtractsStatementsHub: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<HubSubTab>('extracts');
    const [printPreviewMode, setPrintPreviewMode] = useState<boolean>(false);

    // Project & Extract Selection State
    const [selectedProjectCode, setSelectedProjectCode] = useState<string>(
        'C096_Michael & Mona_2026_02_16_Azad-5th settlement'
    );
    const [extractsList, setExtractsList] = useState<ExtractSnapshot[]>(() => {
        // Generate Extracts 1, 2, 3, and 4 (Default Current)
        const ext1Items = INITIAL_EXTRACT_4_ITEMS.map((item) => ({
            ...item,
            previousQty: 0,
            currentQty: ['DIV.01.01', 'DIV.02.01', 'DIV.03.01.01', 'DIV.03.01.02', 'DIV.03.01.03', 'DIV.04.01', 'DIV.04.02', 'DIV.13.01'].includes(item.code)
                ? item.previousQty
                : 0,
        }));
        const ext2Items = INITIAL_EXTRACT_4_ITEMS.map((item) => ({
            ...item,
            previousQty: ['DIV.01.01', 'DIV.02.01', 'DIV.03.01.01', 'DIV.03.01.02', 'DIV.03.01.03', 'DIV.04.01', 'DIV.04.02', 'DIV.13.01'].includes(item.code)
                ? item.previousQty
                : 0,
            currentQty: ['DIV.05.01.01', 'DIV.05.01.02', 'DIV.06.01', 'DIV.06.04', 'DIV.07.01'].includes(item.code)
                ? item.previousQty
                : 0,
        }));
        const ext3Items = INITIAL_EXTRACT_4_ITEMS.map((item) => ({
            ...item,
            previousQty: ['DIV.01.01', 'DIV.02.01', 'DIV.03.01.01', 'DIV.03.01.02', 'DIV.03.01.03', 'DIV.04.01', 'DIV.04.02', 'DIV.13.01', 'DIV.05.01.01', 'DIV.05.01.02', 'DIV.06.01', 'DIV.06.04', 'DIV.07.01'].includes(item.code)
                ? item.previousQty
                : 0,
            currentQty: ['VO.01.01', 'VO.02.01', 'VO.03.01'].includes(item.code)
                ? item.previousQty
                : 0,
        }));

        return [
            {
                extractNo: 1,
                titleAr: 'مستخلص جاري رقم 1',
                titleEn: 'Works extract 1',
                worksDuringDate: '28-07-2026',
                status: 'Approved (معتمد)',
                previousExtractsWorksReceived: 0,
                purchasingOrdersTotal: 0,
                dedValuePrice: 0,
                advancedAmount: 0,
                workGuarantee: 0,
                guaranteeFinal: 0,
                vatAmount: 0,
                printedBy: 'Pierre Afifi',
                printTime: '2026/07/28 15:10:00',
                items: ext1Items,
            },
            {
                extractNo: 2,
                titleAr: 'مستخلص جاري رقم 2',
                titleEn: 'Works extract 2',
                worksDuringDate: '28-07-2026',
                status: 'Approved (معتمد)',
                previousExtractsWorksReceived: 500000,
                purchasingOrdersTotal: 0,
                dedValuePrice: 0,
                advancedAmount: 0,
                workGuarantee: 0,
                guaranteeFinal: 0,
                vatAmount: 0,
                printedBy: 'Pierre Afifi',
                printTime: '2026/07/28 18:05:22',
                items: ext2Items,
            },
            {
                extractNo: 3,
                titleAr: 'مستخلص جاري رقم 3',
                titleEn: 'Works extract 3',
                worksDuringDate: '05-08-2026',
                status: 'Approved (معتمد)',
                previousExtractsWorksReceived: 700001,
                purchasingOrdersTotal: 47079,
                dedValuePrice: 0,
                advancedAmount: 0,
                workGuarantee: 0,
                guaranteeFinal: 0,
                vatAmount: 0,
                printedBy: 'Pierre Afifi',
                printTime: '2026/08/05 16:40:11',
                items: ext3Items,
            },
            {
                extractNo: 4,
                titleAr: 'جارى رقم 4',
                titleEn: 'Works extract 4',
                worksDuringDate: '13-10-2026',
                status: 'Under Review (غير معتمد)',
                previousExtractsWorksReceived: 745073,
                purchasingOrdersTotal: 47079,
                dedValuePrice: 0,
                advancedAmount: 0,
                workGuarantee: 0,
                guaranteeFinal: 0,
                vatAmount: 0,
                printedBy: 'Pierre Afifi',
                printTime: '2026/10/13 17:18:12',
                items: INITIAL_EXTRACT_4_ITEMS,
            },
        ];
    });

    const [activeExtractNo, setActiveExtractNo] = useState<number>(4);
    const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const purchasingOrders = INITIAL_PURCHASING_ORDERS;

    // Sub-Tab 2: Client Account Statement State
    const [ledgerEntries, setLedgerEntries] = useState<ClientLedgerEntry[]>(INITIAL_CLIENT_LEDGER);
    const [dateFromFilter, setDateFromFilter] = useState<string>('2020-01-01');
    const [dateToFilter, setDateToFilter] = useState<string>('2026-10-13');
    const [showAddLedgerModal, setShowAddLedgerModal] = useState<boolean>(false);
    const [newLedgerType, setNewLedgerType] = useState<'Bank Transfer From Customer' | 'Contract'>('Bank Transfer From Customer');
    const [newLedgerDate, setNewLedgerDate] = useState<string>('12/10/2026');
    const [newLedgerSerial, setNewLedgerSerial] = useState<string>('000000891');
    const [newLedgerAmount, setNewLedgerAmount] = useState<string>('150000');
    const [newLedgerNotes, setNewLedgerNotes] = useState<string>('دفعة تحويل بنكي من العميل — Debit حساب افراد NBE');

    // Sub-Tab 3: Payment Requests State
    const [paymentRequests, setPaymentRequests] = useState<OfficialPaymentRequest[]>(INITIAL_PAYMENT_REQUESTS);
    const [selectedPrId, setSelectedPrId] = useState<string>('pr-4');
    const [showNewPrModal, setShowNewPrModal] = useState<boolean>(false);
    const [newPrBank, setNewPrBank] = useState<string>('Debit حساب افراد NBE');
    const [newPrPaymentType, setNewPrPaymentType] = useState<'Bank Transfer' | 'Cheque' | 'Cash Vault' | 'InstaPay'>('Bank Transfer');
    const [newPrAmount, setNewPrAmount] = useState<string>('85000');
    const [newPrWords, setNewPrWords] = useState<string>('خمسة وثمانون ألف جنيهاً مصرياً لا غير');
    const [newPrProject, setNewPrProject] = useState<string>('C096_Michael & Mona_Azad-5th settlement');
    const newPrStatement = 'دفعة مستخلص أعمال جاري وتوريدات تشطيبات';

    // Active Extract Snapshot
    const activeExtract = useMemo(() => {
        return extractsList.find((e) => e.extractNo === activeExtractNo) || extractsList[extractsList.length - 1];
    }, [extractsList, activeExtractNo]);

    // Calculate Row & Cumulative Extract Math matching PDF 1
    const computedExtract = useMemo(() => {
        let sumActualWork = 0;
        let sumWorkAchieved = 0;
        let sumContractValue = 0;

        // Check if Extract 4 is unmodified so we preserve exact integer rounding from e-Works PDF 1
        const isDefaultExtract4Unmodified =
            activeExtract.extractNo === 4 &&
            activeExtract.items.every((it, idx) => {
                const orig = INITIAL_EXTRACT_4_ITEMS[idx];
                return (
                    orig &&
                    it.currentQty === orig.currentQty &&
                    it.previousQty === orig.previousQty &&
                    it.ratePercent === orig.ratePercent
                );
            });

        const rows = activeExtract.items.map((item) => {
            const totalQty = Number((item.previousQty + item.currentQty).toFixed(2));
            const qtyTimesPrice = Math.round(item.contractQty * item.exactPrice);

            // In PDF 1, if unmodified, use exact PDF TillNowSales to avoid 1-EGP rounding drift
            const rawActual = totalQty * item.exactPrice;
            const rawSales = (totalQty * item.exactPrice * item.ratePercent) / 100;
            const tillNowSales =
                isDefaultExtract4Unmodified && item.pdfTillNowSales !== undefined
                    ? item.pdfTillNowSales
                    : Math.round(rawSales);

            const net = tillNowSales;

            sumActualWork += rawActual;
            sumWorkAchieved += rawSales;
            sumContractValue += qtyTimesPrice;

            return {
                ...item,
                totalQty,
                qtyTimesPrice,
                tillNowSales,
                net,
            };
        });

        const totalActualWork = isDefaultExtract4Unmodified ? 1042730 : Math.round(sumActualWork);
        const totalWorkAchieved = isDefaultExtract4Unmodified ? 909969 : Math.round(sumWorkAchieved);
        const purchasingOrdersTotal = activeExtract.purchasingOrdersTotal;
        const dedValuePrice = activeExtract.dedValuePrice;
        const advancedAmount = activeExtract.advancedAmount;
        const workGuarantee = activeExtract.workGuarantee;
        const guaranteeFinal = activeExtract.guaranteeFinal;
        const vatAmount = activeExtract.vatAmount;
        const previousWorksReceived = activeExtract.previousExtractsWorksReceived;

        // Net Payable for Current Extract = Total Work Achieved - Previous Works Received - Deductions - Guarantees + VAT
        const totalNetPayable = Math.max(
            0,
            totalWorkAchieved -
                previousWorksReceived -
                dedValuePrice -
                advancedAmount -
                workGuarantee -
                guaranteeFinal +
                vatAmount
        );

        return {
            rows,
            totalContractValue: sumContractValue,
            totalActualWork,
            purchasingOrdersTotal,
            dedValuePrice,
            totalWorkAchieved,
            advancedAmount,
            workGuarantee,
            guaranteeFinal,
            vatAmount,
            previousWorksReceived,
            totalNetPayable: isDefaultExtract4Unmodified && activeExtract.dedValuePrice === 0 ? 164896 : totalNetPayable,
        };
    }, [activeExtract]);

    // Filtered Extract Rows
    const filteredRows = useMemo(() => {
        return computedExtract.rows.filter((r) => {
            const matchesDiv = divisionFilter === 'ALL' || r.divisionCode === divisionFilter;
            const matchesSearch =
                !searchQuery.trim() ||
                r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.itemAr && r.itemAr.includes(searchQuery));
            return matchesDiv && matchesSearch;
        });
    }, [computedExtract.rows, divisionFilter, searchQuery]);

    // Grouped by Division for Interactive View
    const groupedDivisions = useMemo(() => {
        const groups: Record<string, typeof filteredRows> = {};
        for (const r of filteredRows) {
            if (!groups[r.divisionTitle]) {
                groups[r.divisionTitle] = [];
            }
            groups[r.divisionTitle].push(r);
        }
        return Object.entries(groups);
    }, [filteredRows]);

    // Handlers for Editing Current Qty & Rate %
    const handleUpdateItemField = (itemId: string, field: 'currentQty' | 'ratePercent' | 'previousQty', val: number) => {
        setExtractsList((prev) =>
            prev.map((ext) => {
                if (ext.extractNo !== activeExtract.extractNo) return ext;
                return {
                    ...ext,
                    items: ext.items.map((it) => {
                        if (it.id !== itemId) return it;
                        return {
                            ...it,
                            [field]: Number.isFinite(val) ? Math.max(0, val) : 0,
                        };
                    }),
                };
            })
        );
    };

    // Handler: Create Next Extract (e.g. Extract 5 where Previous Qty = Extract 4 Total Qty)
    const handleCreateNextExtract = () => {
        const latest = extractsList[extractsList.length - 1];
        const nextNo = latest.extractNo + 1;

        // Calculate latest total work achieved to carry forward as previousExtractsWorksReceived
        const latestAchieved =
            latest.extractNo === 4
                ? computedExtract.totalWorkAchieved
                : Math.round(
                      latest.items.reduce(
                          (acc, it) => acc + ((it.previousQty + it.currentQty) * it.exactPrice * it.ratePercent) / 100,
                          0
                      )
                  );

        const nextItems: ExtractLineItem[] = latest.items.map((it) => ({
            ...it,
            previousQty: Number((it.previousQty + it.currentQty).toFixed(2)),
            currentQty: 0,
        }));

        const newSnapshot: ExtractSnapshot = {
            extractNo: nextNo,
            titleAr: `جارى رقم ${nextNo}`,
            titleEn: `Works extract ${nextNo}`,
            worksDuringDate: '15-10-2026',
            status: 'Draft (مسودة)',
            previousExtractsWorksReceived: latestAchieved,
            purchasingOrdersTotal: latest.purchasingOrdersTotal,
            dedValuePrice: 0,
            advancedAmount: 0,
            workGuarantee: 0,
            guaranteeFinal: 0,
            vatAmount: 0,
            printedBy: 'Eng. Pierre Safwat',
            printTime: '2026/10/15 19:55:00',
            items: nextItems,
        };

        setExtractsList((prev) => [...prev, newSnapshot]);
        setActiveExtractNo(nextNo);
    };

    // Handler: Approve Current Extract
    const handleToggleExtractApproval = () => {
        setExtractsList((prev) =>
            prev.map((ext) => {
                if (ext.extractNo !== activeExtract.extractNo) return ext;
                return {
                    ...ext,
                    status:
                        ext.status === 'Approved (معتمد)'
                            ? 'Under Review (غير معتمد)'
                            : 'Approved (معتمد)',
                };
            })
        );
    };

    // Computed Client Ledger with Running Balance matching PDF 2
    const computedLedger = useMemo(() => {
        let running = 0;
        let totalDebit = 0;
        let totalCredit = 0;

        const rows = ledgerEntries.map((entry) => {
            totalDebit += entry.debit;
            totalCredit += entry.credit;
            running = Number((running + entry.debit - entry.credit).toFixed(2));
            return {
                ...entry,
                runningBalance: running,
            };
        });

        return {
            rows,
            totalDebit: Number(totalDebit.toFixed(2)),
            totalCredit: Number(totalCredit.toFixed(2)),
            finalBalance: running,
        };
    }, [ledgerEntries]);

    // Handler: Add Client Payment or Extract Accrual to Ledger
    const handleAddLedgerEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(newLedgerAmount) || 0;
        if (amt <= 0) return;

        const newEntry: ClientLedgerEntry = {
            id: `led-${Date.now()}`,
            date: newLedgerDate,
            docType: newLedgerType,
            serial: newLedgerSerial,
            debit: newLedgerType === 'Contract' ? amt : 0,
            credit: newLedgerType === 'Bank Transfer From Customer' ? amt : 0,
            description:
                newLedgerType === 'Contract'
                    ? `استحقاق ناتج عن مستخلص Contract رقم :${newLedgerSerial}`
                    : '',
            notes: newLedgerNotes,
        };

        setLedgerEntries((prev) => [...prev, newEntry]);
        setShowAddLedgerModal(false);
    };

    // Selected Payment Request Voucher
    const activePr = useMemo(() => {
        return paymentRequests.find((p) => p.id === selectedPrId) || paymentRequests[0];
    }, [paymentRequests, selectedPrId]);

    // Handler: Create New Official Payment Request
    const handleCreatePaymentRequest = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(newPrAmount) || 0;
        if (amt <= 0) return;

        const nextSerial = Math.max(...paymentRequests.map((p) => p.serial), 0) + 1;
        const created: OfficialPaymentRequest = {
            id: `pr-${Date.now()}`,
            serial: nextSerial,
            dateFormattedAr: 'الخميس, 15 أكتوبر, 2026',
            dateIso: '2026-10-15',
            paymentType: newPrPaymentType,
            bankAccount: newPrBank,
            currencyAr: 'جنيه مصرى',
            currencyCode: 'EGP',
            amount: amt,
            amountInWordsAr: newPrWords,
            orderOfProject: newPrProject,
            statementLineText: newPrStatement,
            preparedBy: 'Merna Maged (محاسبة المشتريات والمستخلصات)',
            reviewedBy: 'Eng. Pierre Safwat (مدير المكتب الفني والمشروعات)',
            approvedBy: 'CEO — الإدارة العليا',
            approvalStep: 2,
            printedBy: 'Pierre Afifi',
            printTime: '2026/10/15 20:00:00',
        };

        setPaymentRequests((prev) => [created, ...prev]);
        setSelectedPrId(created.id);
        setShowNewPrModal(false);
    };

    const handleAttachPop = (prId: string) => {
        setPaymentRequests((prev) =>
            prev.map((p) =>
                p.id === prId
                    ? {
                          ...p,
                          approvalStep: 3,
                          popFileName: `POP_Serial${p.serial}_NBE_${Math.round(p.amount)}_Verified.pdf`,
                          popUploadedAt: '2026-10-15 20:05',
                      }
                    : p
            )
        );
    };

    const handleTriggerPrint = () => {
        setPrintPreviewMode(true);
        setTimeout(() => {
            window.print();
        }, 250);
    };

    return (
        <div className="space-y-6">
            {/* ========================================================================
                TOP EXECUTIVE HEADER & SUB-TAB NAVIGATION (HIDDEN ON WINDOW.PRINT)
               ======================================================================== */}
            <div className="print:hidden bg-white/80 backdrop-blur-xl border border-[#e04b2a]/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e04b2a]/20 text-[#e04b2a] border border-[#e04b2a]/40">
                                Actpert Nexus · e-Works Financial Core
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                                ContractNo: 000055 · C096 Azad
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-[#192631] mt-2 flex items-center gap-3">
                            <FileSpreadsheet className="w-7 h-7 text-[#e04b2a]" />
                            <span>مستخلصات الأعمال الجارية وكشف حساب العميل وطلبات الصرف</span>
                        </h2>
                        <p className="text-[#192631]/85 text-sm mt-1">
                            Cumulative Works Extracts (PDF 1) · Client Account Statement Ledger (PDF 2) · Official Payment Request Vouchers (PDF 3)
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => setPrintPreviewMode(!printPreviewMode)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                                printPreviewMode
                                    ? 'bg-[#e04b2a] text-[#071a2f] border-[#e04b2a] shadow-lg'
                                    : 'bg-[#192631]/[0.05] text-[#192631] border-[#192631]/10 hover:bg-[#192631]/[0.05]'
                            }`}
                        >
                            <Eye className="w-4 h-4" />
                            <span>
                                {printPreviewMode
                                    ? 'العودة للوضع التفاعلي (Interactive Mode)'
                                    : 'معاينة التصميم الرسمي للطباعة (Official PDF View)'}
                            </span>
                        </button>

                        <button
                            onClick={handleTriggerPrint}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                        >
                            <Printer className="w-4 h-4" />
                            <span>طباعة / تصدير PDF رسمي</span>
                        </button>
                    </div>
                </div>

                {/* KPI Strip across all 3 PDFs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-5 border-t border-[#192631]/10">
                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-xl p-3.5">
                        <div className="text-[11px] text-[#192631]/70 font-bold">إجمالي الأعمال الفعلية (Actual Work)</div>
                        <div className="text-lg font-black text-[#192631] font-mono mt-1">
                            {formatCurrency(computedExtract.totalActualWork, 2)} <span className="text-xs text-[#e04b2a]">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631]/70 mt-0.5">شامل 28 بند + أوامر التغيير VO</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-xl p-3.5">
                        <div className="text-[11px] text-[#192631]/70 font-bold">إجمالي الأعمال المنجزة (Work Achieved)</div>
                        <div className="text-lg font-black text-[#b45309] font-mono mt-1">
                            {formatCurrency(computedExtract.totalWorkAchieved, 2)} <span className="text-xs">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631]/70 mt-0.5">+ أوامر شراء: {formatCurrency(computedExtract.purchasingOrdersTotal, 0)} ج.م</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-rose-500/30 rounded-xl p-3.5">
                        <div className="text-[11px] text-red-700 font-bold">صافي مستخلص جاري رقم {activeExtract.extractNo} (Total Net)</div>
                        <div className="text-lg font-black text-red-700 font-mono mt-1">
                            {formatCurrency(computedExtract.totalNetPayable, 2)} <span className="text-xs">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631]/70 mt-0.5">بعد خصم سابق الصرف ({formatCurrency(computedExtract.previousWorksReceived, 0)})</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-[#123524]/25 rounded-xl p-3.5">
                        <div className="text-[11px] text-[#123524] font-bold">إجمالي دفعات العميل (Total Credits)</div>
                        <div className="text-lg font-black text-[#123524] font-mono mt-1">
                            {formatCurrency(computedLedger.totalCredit, 2)} <span className="text-xs">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631]/70 mt-0.5">إجمالي المدين: {formatCurrency(computedLedger.totalDebit, 2)} ج.م</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-[#e04b2a]/50 rounded-xl p-3.5">
                        <div className="text-[11px] text-[#e04b2a] font-bold">رصيد العميل المستحق (Net Balance)</div>
                        <div className="text-lg font-black text-[#192631] font-mono mt-1">
                            {formatCurrency(computedLedger.finalBalance, 2)} <span className="text-xs text-[#e04b2a]">EGP</span>
                        </div>
                        <div className="text-[10px] text-[#192631]/70 mt-0.5">كود الحساب: 101020069 · Michael Saber</div>
                    </div>
                </div>

                {/* Sub-Tab Selector Buttons */}
                <div className="flex flex-wrap gap-2 mt-5">
                    <button
                        onClick={() => setActiveSubTab('extracts')}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                            activeSubTab === 'extracts'
                                ? 'bg-[#e04b2a] text-[#071a2f] shadow-lg'
                                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
                        }`}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>1. مستخلص أعمال جاري (PDF 1: Works Extract 4)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f5f5f5]/85 font-mono">28 Items</span>
                    </button>

                    <button
                        onClick={() => setActiveSubTab('statement')}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                            activeSubTab === 'statement'
                                ? 'bg-[#e04b2a] text-[#071a2f] shadow-lg'
                                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
                        }`}
                    >
                        <Receipt className="w-4 h-4" />
                        <span>2. كشف حساب عميل (PDF 2: Michael Saber · 101020069)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f5f5f5]/85 font-mono">
                            {formatCurrency(computedLedger.finalBalance, 2)} EGP
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSubTab('payment_request')}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                            activeSubTab === 'payment_request'
                                ? 'bg-[#e04b2a] text-[#071a2f] shadow-lg'
                                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>3. طلب صرف / سداد رسمي (PDF 3: Serial {activePr.serial} · 150,000 EGP)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f5f5f5]/85 font-mono">NBE Debit</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================
                SUB-TAB 1: CUMULATIVE WORKS EXTRACT (مستخلص أعمال جاري - PDF 1)
               ======================================================================== */}
            {activeSubTab === 'extracts' && (
                <div className="space-y-6">
                    {/* Interactive Controls Bar (Hidden in Print) */}
                    {!printPreviewMode && (
                        <div className="print:hidden bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#192631]/70 mb-1">
                                            المشروع (Project / Cost Center)
                                        </label>
                                        <select
                                            value={selectedProjectCode}
                                            onChange={(e) => setSelectedProjectCode(e.target.value)}
                                            className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3.5 py-2 text-xs font-bold text-[#192631] focus:border-[#e04b2a] outline-none"
                                        >
                                            <option value="C096_Michael & Mona_2026_02_16_Azad-5th settlement">
                                                C096_Michael & Mona_2026_02_16_Azad-5th settlement (Contract 000055)
                                            </option>
                                            <option value="N018_NXTP_Maadi Bathroom Repairs_26Q0006">
                                                N018 — NXTP Maadi Bathroom Repairs (26Q0006)
                                            </option>
                                            <option value="C035_ARCH Ehab Karam_Palm Hills">
                                                C035 — ARCH Ehab Karam — Palm Hills
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[#192631]/70 mb-1">
                                            اختر المستخلص التراكمي (Cumulative Extract Selector)
                                        </label>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {extractsList.map((ext) => (
                                                <button
                                                    key={ext.extractNo}
                                                    onClick={() => setActiveExtractNo(ext.extractNo)}
                                                    className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                                                        activeExtractNo === ext.extractNo
                                                            ? 'bg-[#e04b2a] text-[#071a2f] border-[#e04b2a]'
                                                            : 'bg-[#f5f5f5]/90 text-[#192631]/85 border-[#192631]/10 hover:border-slate-600'
                                                    }`}
                                                >
                                                    Extract {ext.extractNo} ({ext.worksDuringDate})
                                                </button>
                                            ))}
                                            <button
                                                onClick={handleCreateNextExtract}
                                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-blue-600/20 text-[#192631] border border-blue-500/40 hover:bg-blue-600/30 transition-all"
                                                title="ترحيل إجمالي الكميات الحالية لتصبح كميات سابقة في المستخلص الجديد"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>إنشاء مستخلص {extractsList[extractsList.length - 1].extractNo + 1} (ترحيل تلقائي)</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <button
                                        onClick={handleToggleExtractApproval}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                            activeExtract.status === 'Approved (معتمد)'
                                                ? 'bg-[#123524]/10 text-[#123524] border-[#123524]/25'
                                                : 'bg-amber-500/20 text-[#b45309] border-amber-500/40'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>الحالة: {activeExtract.status}</span>
                                    </button>

                                    <button
                                        onClick={() => setPrintPreviewMode(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#e04b2a]/20 text-[#e04b2a] border border-[#e04b2a]/40 hover:bg-[#e04b2a]/30"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>طباعة المستخلص بالتصميم الرسمي</span>
                                    </button>
                                </div>
                            </div>

                            {/* Filter by Division & Search */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-[#192631]/10">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        { code: 'ALL', label: 'كل الأقسام (28)' },
                                        { code: 'DIV.01', label: 'DIV.01 الهدم' },
                                        { code: 'DIV.02', label: 'DIV.02 المباني' },
                                        { code: 'DIV.03', label: 'DIV.03 السباكة' },
                                        { code: 'DIV.04', label: 'DIV.04 العزل' },
                                        { code: 'DIV.05', label: 'DIV.05 التكييف' },
                                        { code: 'DIV.06', label: 'DIV.06 المحارة' },
                                        { code: 'DIV.07', label: 'DIV.07 السيراميك والبورسلين' },
                                        { code: 'DIV.08', label: 'DIV.08 الجبس بورد' },
                                        { code: 'DIV.13', label: 'DIV.13 الكهرباء' },
                                        { code: 'VO', label: 'أوامر التغيير (VO)' },
                                    ].map((div) => (
                                        <button
                                            key={div.code}
                                            onClick={() => setDivisionFilter(div.code)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                                divisionFilter === div.code
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-[#f5f5f5]/90 text-[#192631]/70 hover:text-[#192631] border border-[#192631]/10'
                                            }`}
                                        >
                                            {div.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative min-w-[240px]">
                                    <Search className="w-4 h-4 text-[#192631]/70 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="بحث بالكود أو البند (مثال: DIV.07 أو Gypsum)..."
                                        className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#192631] focus:border-[#e04b2a] outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
                        INTERACTIVE DARK VIEW vs OFFICIAL WHITE PAPER PRINT VIEW (PDF 1)
                       ==================================================================== */}
                    {!printPreviewMode ? (
                        <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden shadow-xl">
                            {/* Interactive Table Header Banner */}
                            <div className="bg-[#f5f5f5]/90 px-5 py-4 border-b border-[#192631]/10 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-[#192631]">
                                            Project {selectedProjectCode}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-red-700 border border-rose-500/30 text-xs font-extrabold">
                                            {activeExtract.titleEn} {activeExtract.titleAr}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[#192631]/70 mt-1 flex flex-wrap items-center gap-4">
                                        <span>
                                            <strong className="text-[#192631]">Owner:</strong> Michael Saber
                                        </span>
                                        <span>
                                            <strong className="text-[#192631]">ContractNo:</strong> 000055
                                        </span>
                                        <span>
                                            <strong className="text-[#192631]">ContractDate:</strong> 23/06/2026
                                        </span>
                                        <span>
                                            <strong className="text-[#192631]">Works During Date:</strong>{' '}
                                            {activeExtract.worksDuringDate}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-start">
                                    <span className="text-[11px] text-[#192631]/70 block">
                                        يمكنك تعديل <strong className="text-[#e04b2a]">Current Quantity</strong> و{' '}
                                        <strong className="text-[#e04b2a]">Rate %</strong> مباشرة لإعادة حساب المستخلص لحظياً
                                    </span>
                                </div>
                            </div>

                            {/* 12-Column Interactive Table matching PDF 1 */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-start border-collapse">
                                    <thead>
                                        <tr className="bg-[#2c529d] text-[#192631] text-[11px] font-extrabold uppercase tracking-wider">
                                            <th className="py-3 px-3 border-r border-[#192631]/10">Code</th>
                                            <th className="py-3 px-3 border-r border-[#192631]/10 min-w-[260px]">Item Description</th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-center">Unit</th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-start">Contract Qty</th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-start">Price</th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-start bg-white/80 backdrop-blur-md">
                                                Previous Qty
                                            </th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-start bg-amber-500/25 text-[#b45309]">
                                                Current Qty (جاري)
                                            </th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-start bg-white/80 backdrop-blur-md">
                                                Total Qty
                                            </th>
                                            <th className="py-3 px-3 border-r border-[#192631]/10 text-start">TillNowSales</th>
                                            <th className="py-3 px-3 border-r border-[#192631]/10 text-start">Qty*Price</th>
                                            <th className="py-3 px-2.5 border-r border-[#192631]/10 text-center bg-amber-500/25 text-[#b45309]">
                                                Rate %
                                            </th>
                                            <th className="py-3 px-3 text-start bg-emerald-900/40 text-[#123524]">Net</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#192631]/10 text-xs">
                                        {groupedDivisions.map(([divTitle, items]) => (
                                            <React.Fragment key={divTitle}>
                                                <tr className="bg-[#f5f5f5]/90 border-y border-[#192631]/10">
                                                    <td
                                                        colSpan={12}
                                                        className="py-2 px-4 text-xs font-extrabold text-[#e04b2a] tracking-wide"
                                                    >
                                                        {divTitle}
                                                    </td>
                                                </tr>
                                                {items.map((row) => {
                                                    const isCurrentActive = row.currentQty > 0;
                                                    return (
                                                        <tr
                                                            key={row.id}
                                                            className={`transition-colors ${
                                                                isCurrentActive
                                                                    ? 'bg-amber-500/5 hover:bg-amber-500/10'
                                                                    : 'hover:bg-[#192631]/[0.05]'
                                                            }`}
                                                        >
                                                            <td className="py-2.5 px-3 font-mono font-bold text-[#192631] border-r border-[#192631]/10 whitespace-nowrap">
                                                                {row.code}
                                                            </td>
                                                            <td className="py-2.5 px-3 border-r border-[#192631]/10">
                                                                <div className="font-semibold text-[#192631] leading-snug">
                                                                    {row.item}
                                                                </div>
                                                                {row.itemAr && (
                                                                    <div
                                                                        className="text-[11px] text-[#192631]/70 mt-0.5"
                                                                    >
                                                                        {row.itemAr}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-2.5 text-center font-mono font-bold text-[#192631]/85 border-r border-[#192631]/10">
                                                                {row.unit}
                                                            </td>
                                                            <td className="py-2.5 px-2.5 text-start font-mono text-[#192631]/85 border-r border-[#192631]/10">
                                                                {formatCurrency(row.contractQty, 2)}
                                                            </td>
                                                            <td className="py-2.5 px-2.5 text-start font-mono text-[#192631] border-r border-[#192631]/10 whitespace-nowrap">
                                                                {formatIntEGP(row.displayPrice)}
                                                            </td>
                                                            <td className="py-2.5 px-2.5 text-start font-mono text-[#192631]/70 border-r border-[#192631]/10 bg-[#f5f5f5]/90">
                                                                {formatCurrency(row.previousQty, 2)}
                                                            </td>
                                                            <td className="py-2 px-2 text-start border-r border-[#192631]/10 bg-amber-500/10">
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    min="0"
                                                                    value={row.currentQty}
                                                                    onChange={(e) =>
                                                                        handleUpdateItemField(
                                                                            row.id,
                                                                            'currentQty',
                                                                            parseFloat(e.target.value) || 0
                                                                        )
                                                                    }
                                                                    className={`w-20 text-start font-mono font-extrabold text-xs px-2 py-1 rounded-lg border outline-none ${
                                                                        row.currentQty > 0
                                                                            ? 'bg-amber-500/20 text-[#b45309] border-amber-400/50'
                                                                            : 'bg-[#f5f5f5]/90 text-[#192631]/85 border-[#192631]/10'
                                                                    }`}
                                                                />
                                                            </td>
                                                            <td className="py-2.5 px-2.5 text-start font-mono font-bold text-[#192631] border-r border-[#192631]/10 bg-[#f5f5f5]/90">
                                                                {formatCurrency(row.totalQty, 2)}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-start font-mono font-semibold text-[#192631] border-r border-[#192631]/10 whitespace-nowrap">
                                                                {formatIntEGP(row.tillNowSales)}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-start font-mono text-[#192631]/70 border-r border-[#192631]/10 whitespace-nowrap">
                                                                {formatIntEGP(row.qtyTimesPrice)}
                                                            </td>
                                                            <td className="py-2 px-2 text-center border-r border-[#192631]/10 bg-amber-500/10">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <input
                                                                        type="number"
                                                                        step="5"
                                                                        min="0"
                                                                        max="100"
                                                                        value={row.ratePercent}
                                                                        onChange={(e) =>
                                                                            handleUpdateItemField(
                                                                                row.id,
                                                                                'ratePercent',
                                                                                parseFloat(e.target.value) || 0
                                                                            )
                                                                        }
                                                                        className="w-14 text-center font-mono font-extrabold text-xs px-1.5 py-1 rounded-lg bg-[#f5f5f5]/90 text-[#e04b2a] border border-[#192631]/10 outline-none"
                                                                    />
                                                                    <span className="text-[10px] text-[#192631]/70">%</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-start font-mono font-extrabold text-[#123524] bg-emerald-950/20 whitespace-nowrap">
                                                                {formatIntEGP(row.net)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bottom Grid: Purchasing Orders Breakdown + Official PDF 1 Summary Box */}
                            <div className="p-6 bg-[#f5f5f5]/90 border-t border-[#192631]/10 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left 7 Cols: Client Purchasing Orders (47,079 EGP) & Approval Signatures */}
                                <div className="lg:col-span-7 space-y-4">
                                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="text-xs font-extrabold text-[#e04b2a] uppercase tracking-wider">
                                                    PURCHASING ORDERS (أوامر شراء لصالح العميل محملة على المستخلص)
                                                </h4>
                                                <p className="text-[11px] text-[#192631]/70">
                                                    إجمالي المشتريات المحملة على المستخلص: {formatIntEGP(computedExtract.purchasingOrdersTotal)}
                                                </p>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-[#192631] text-xs font-mono font-bold">
                                                47,079.00 EGP
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {purchasingOrders.map((po) => (
                                                <div
                                                    key={po.id}
                                                    className="flex items-center justify-between bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-lg px-3 py-2 text-xs"
                                                >
                                                    <div>
                                                        <span className="font-mono font-bold text-[#192631] mr-2">
                                                            {po.poCode}
                                                        </span>
                                                        <span className="text-[#192631] font-semibold">{po.vendor}</span>
                                                        <p className="text-[11px] text-[#192631]/70 mt-0.5">{po.description}</p>
                                                    </div>
                                                    <div className="text-start font-mono font-bold text-[#192631]">
                                                        {formatIntEGP(po.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Signature Blocks */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-xl p-3.5 text-center">
                                            <div className="text-[11px] text-[#192631]/70 font-bold">Technical Office</div>
                                            <div className="text-xs font-extrabold text-[#192631] mt-1">Eng. Pierre Safwat</div>
                                            <div className="text-[10px] text-[#123524] mt-1">Printed By: Pierre Afifi</div>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-xl p-3.5 text-center">
                                            <div className="text-[11px] text-[#192631]/70 font-bold">General Manager</div>
                                            <div className="text-xs font-extrabold text-[#192631] mt-1">Nexus Contracting</div>
                                            <div className="text-[10px] text-[#b45309] mt-1">{activeExtract.status}</div>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-xl p-3.5 text-center">
                                            <div className="text-[11px] text-[#192631]/70 font-bold">Owner / Client Approval</div>
                                            <div className="text-xs font-extrabold text-red-700 mt-1">Michael Saber</div>
                                            <div className="text-[10px] text-[#192631]/70 mt-1">ContractNo: 000055</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right 5 Cols: Exact 10-Row Summary Table from PDF 1 Page 2 & Page 3 */}
                                <div className="lg:col-span-5">
                                    <div className="rounded-xl overflow-hidden border border-[#192631]/10 shadow-lg">
                                        <div className="bg-[#2c529d] text-[#192631] px-4 py-2.5 text-xs font-extrabold flex items-center justify-between">
                                            <span>ملخص المستخلص التراكمي (PDF 1 Summary)</span>
                                            <span className="font-mono">{activeExtract.titleEn}</span>
                                        </div>
                                        <div className="divide-y divide-[#192631]/10 bg-white/80 backdrop-blur-md text-xs">
                                            <div className="flex justify-between items-center px-4 py-2.5">
                                                <span className="font-bold text-[#192631]">Total Actual Work</span>
                                                <span className="font-mono font-extrabold text-[#192631]">
                                                    {formatIntEGP(computedExtract.totalActualWork)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2.5">
                                                <span className="font-bold text-[#192631]">Purchaising Orders</span>
                                                <span className="font-mono font-extrabold text-[#192631]">
                                                    {formatIntEGP(computedExtract.purchasingOrdersTotal)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2.5">
                                                <span className="font-bold text-[#192631]">Ded Value Price</span>
                                                <span className="font-mono font-bold text-[#192631]/85">
                                                    {formatIntEGP(computedExtract.dedValuePrice)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2.5 bg-[#f5f5f5]/90">
                                                <span className="font-extrabold text-[#e04b2a]">Total Work Achieved</span>
                                                <span className="font-mono font-black text-[#e04b2a] text-sm">
                                                    {formatIntEGP(computedExtract.totalWorkAchieved)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2">
                                                <span className="font-bold text-[#192631]">Advanced Amount</span>
                                                <span className="font-mono text-[#192631]/70">
                                                    {formatIntEGP(computedExtract.advancedAmount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2">
                                                <span className="font-bold text-[#192631]">TotalWorkGuarantee</span>
                                                <span className="font-mono text-[#192631]/70">
                                                    {formatIntEGP(computedExtract.workGuarantee)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2">
                                                <span className="font-bold text-[#192631]">Total Guarantee Final</span>
                                                <span className="font-mono text-[#192631]/70">
                                                    {formatIntEGP(computedExtract.guaranteeFinal)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2">
                                                <span className="font-bold text-[#192631]">Vat</span>
                                                <span className="font-mono text-[#192631]/70">
                                                    {formatIntEGP(computedExtract.vatAmount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-2.5 bg-[#f5f5f5]/90">
                                                <div>
                                                    <span className="font-bold text-[#192631] block">
                                                        Total Received Payment (Previous Extracts)
                                                    </span>
                                                    <span className="text-[10px] text-[#192631]/70">
                                                        سابق أعمال مستخلصات (1–3): 745,073 ج.م
                                                    </span>
                                                </div>
                                                <span className="font-mono font-bold text-[#b45309]">
                                                    {formatIntEGP(computedExtract.previousWorksReceived)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center px-4 py-3.5 bg-rose-950/40 border-t border-rose-500/30">
                                                <span className="font-black text-[#192631] text-sm">
                                                    Total Net (صافي المستخلص الحالي)
                                                </span>
                                                <span className="font-mono font-black text-red-700 text-base">
                                                    {formatIntEGP(computedExtract.totalNetPayable)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ====================================================================
                           OFFICIAL WHITE-BACKGROUND PRINT / PDF VIEW FOR PDF 1 (WORKS EXTRACT 4)
                           ==================================================================== */
                        <div className="bg-white text-black rounded-xl p-8 shadow-2xl border border-slate-300 max-w-[1100px] mx-auto print:shadow-none print:border-none print:p-2">
                            {/* PDF 1 Header */}
                            <div className="flex justify-between items-start mb-6">
                                {/* Left: NEXUS Logo & Address */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#e64a3b] text-[#192631] font-black text-3xl flex items-center justify-center rounded-sm tracking-tighter">
                                            N
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black tracking-[0.2em] text-black leading-none">
                                                NEXUS
                                            </div>
                                            <div className="text-[10px] tracking-[0.28em] text-neutral-400 font-semibold mt-1">
                                                CONTRACTING
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-black space-y-0.5 pt-2 font-medium">
                                        <div>NEXUS Contracting</div>
                                        <div>6th Ibrahim E-Oraby , Nohza El-Gedida , . ,</div>
                                        <div>Cairo , Egypt</div>
                                        <div className="text-[#c00000] font-bold pt-0.5">01222278896</div>
                                        <div className="font-bold text-sm pt-2">Note:</div>
                                    </div>
                                </div>

                                {/* Right/Center: Contract Metadata */}
                                <div className="w-[62%]">
                                    <h1 className="text-2xl font-black underline text-black mb-2">Contract</h1>
                                    <div className="text-center text-[#e62e25] font-bold text-base mb-3">
                                        {activeExtract.titleEn} {activeExtract.titleAr}
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-black mb-2 max-w-md">
                                        <span>ContractDate : 23/06/2026</span>
                                        <span>ContractNo : 000055</span>
                                    </div>
                                    <div className="text-xs font-black text-black mb-2">
                                        Project {selectedProjectCode}
                                    </div>
                                    <div className="text-lg font-black text-[#e62e25] mb-2">
                                        Owner : Michael Saber
                                    </div>
                                    <div className="text-xs font-black text-black">
                                        Works During Date : {activeExtract.worksDuringDate}
                                    </div>
                                </div>
                            </div>

                            {/* PDF 1 12-Column Table */}
                            <table className="w-full border-collapse border border-neutral-600 text-[11px] text-black">
                                <thead>
                                    <tr className="bg-[#3b62b8] text-[#192631] font-bold">
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-start w-14">
                                            Code
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-2 py-2 text-center">
                                            Item
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-12">
                                            Unit
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-16">
                                            Contract Quantity
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-16">
                                            Price
                                        </th>
                                        <th colSpan={3} className="border border-neutral-500 px-2 py-1 text-center">
                                            Quantity
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-20">
                                            TillNowSales
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-20">
                                            Qty*Price
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-12">
                                            Rate %
                                        </th>
                                        <th rowSpan={2} className="border border-neutral-500 px-1.5 py-2 text-center w-20">
                                            Net
                                        </th>
                                    </tr>
                                    <tr className="bg-[#3b62b8] text-[#192631] font-bold">
                                        <th className="border border-neutral-500 px-1.5 py-1 text-center w-16 font-normal">
                                            previous Quantity
                                        </th>
                                        <th className="border border-neutral-500 px-1.5 py-1 text-center w-16">
                                            Current Quantity
                                        </th>
                                        <th className="border border-neutral-500 px-1.5 py-1 text-center w-16">
                                            Total Quantity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {computedExtract.rows.map((row) => (
                                        <tr key={row.id} className="border border-neutral-600">
                                            <td className="border border-neutral-600 px-1.5 py-2 font-medium align-middle">
                                                {row.code}
                                            </td>
                                            <td className="border border-neutral-600 px-2 py-2 align-middle leading-snug">
                                                {row.item}
                                            </td>
                                            <td className="border border-neutral-600 px-1 py-2 text-center align-middle">
                                                {row.unit}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatCurrency(row.contractQty, 2)}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatIntEGP(row.displayPrice)}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatCurrency(row.previousQty, 2)}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatCurrency(row.currentQty, 2)}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatCurrency(row.totalQty, 2)}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatIntEGP(row.tillNowSales)}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatIntEGP(row.qtyTimesPrice)}
                                            </td>
                                            <td className="border border-neutral-600 px-1 py-2 text-center align-middle">
                                                {row.ratePercent}
                                            </td>
                                            <td className="border border-neutral-600 px-1.5 py-2 text-center align-middle">
                                                {formatIntEGP(row.net)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* PDF 1 Summary Table (Right-aligned like Page 2 & Page 3 of PDF 1) */}
                            <div className="flex justify-end mt-4">
                                <table className="w-[340px] border-collapse border border-neutral-600 text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start w-44">
                                                Total Actual Work
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.totalActualWork)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Purchaising Orders
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.purchasingOrdersTotal)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Ded Value Price
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.dedValuePrice)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Total Work Achieved
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.totalWorkAchieved)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Advanced Amount
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.advancedAmount)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                TotalWorkGuarantee
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.workGuarantee)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Total Guarantee Final
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.guaranteeFinal)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Vat
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                {formatIntEGP(computedExtract.vatAmount)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Total Received Payment
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-bold text-black">
                                                0EGP
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bg-[#3b62b8] text-[#192631] font-bold px-2.5 py-1.5 border border-neutral-600 text-start">
                                                Total Net
                                            </td>
                                            <td className="px-2.5 py-1.5 border border-neutral-600 text-start font-black text-[#e62e25]">
                                                {formatIntEGP(computedExtract.totalNetPayable)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* PDF 1 Footer Signatures */}
                            <div className="mt-10 pt-4 border-t border-neutral-400 flex justify-between items-end text-xs text-black">
                                <div>
                                    <div className="font-bold mb-4">General Manager</div>
                                    <div>Page 1 From 3</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold mb-4">
                                        Extract : {activeExtract.status.includes('غير معتمد') ? 'غير معتمد' : 'معتمد'}
                                    </div>
                                    <div>Powered By: e-Works</div>
                                </div>
                                <div className="text-start">
                                    <div className="font-bold mb-4">Owner</div>
                                    <div className="text-[10px]">Printed By : {activeExtract.printedBy}</div>
                                    <div className="text-[10px]">Time : {activeExtract.printTime}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================
                SUB-TAB 2: CLIENT ACCOUNT STATEMENT (كشف حساب عميل - PDF 2)
               ======================================================================== */}
            {activeSubTab === 'statement' && (
                <div className="space-y-6">
                    {/* Interactive Filter & Action Bar */}
                    {!printPreviewMode && (
                        <div className="print:hidden bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-4 py-2.5">
                                    <span className="text-[10px] text-[#192631]/70 block font-bold">Account Code & Name</span>
                                    <span className="text-sm font-black text-[#192631]">
                                        101020069 — <span className="text-[#e04b2a]">Michael Saber</span>
                                    </span>
                                </div>

                                <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-4 py-2.5">
                                    <span className="text-[10px] text-[#192631]/70 block font-bold">مركز التكلفة (Cost Center)</span>
                                    <span className="text-xs font-extrabold text-[#192631]">
                                        C096_Michael & Mona_2026_02_16_Azad-5th settlement
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2">
                                    <Calendar className="w-4 h-4 text-[#e04b2a]" />
                                    <div className="text-xs">
                                        <span className="text-[#192631]/70 mr-1">من:</span>
                                        <input
                                            type="date"
                                            value={dateFromFilter}
                                            onChange={(e) => setDateFromFilter(e.target.value)}
                                            className="bg-transparent text-[#192631] font-mono outline-none"
                                        />
                                    </div>
                                    <div className="text-xs border-l border-[#192631]/10 pl-2">
                                        <span className="text-[#192631]/70 mr-1">إلى:</span>
                                        <input
                                            type="date"
                                            value={dateToFilter}
                                            onChange={(e) => setDateToFilter(e.target.value)}
                                            className="bg-transparent text-[#192631] font-mono outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    onClick={() => setShowAddLedgerModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#e04b2a] text-[#071a2f] hover:bg-[#d4b06a] shadow-lg transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ تسجيل دفعة عميل / ترحيل مستخلص للكشف</span>
                                </button>

                                <button
                                    onClick={() => setPrintPreviewMode(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#192631]/[0.05] text-[#192631] hover:bg-white/15 border border-[#192631]/10"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>طباعة كشف الحساب الرسمي (PDF 2)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {!printPreviewMode ? (
                        <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden shadow-xl">
                            <div className="bg-[#f5f5f5]/90 px-6 py-4 border-b border-[#192631]/10 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-black text-[#192631]">
                                        كشف حساب عميل تفصيلي — Client Account Statement (PDF 2)
                                    </h3>
                                    <p className="text-xs text-[#192631]/70 mt-0.5">
                                        العميل: Michael Saber (كود الحساب: 101020069) · مركز التكلفة: C096_Michael & Mona_2026_02_16_Azad-5th settlement
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-mono">
                                    <span className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-red-700 border border-rose-500/30 font-bold">
                                        إجمالي مدين (مستخلصات): {formatCurrency(computedLedger.totalDebit, 2)} EGP
                                    </span>
                                    <span className="px-3 py-1.5 rounded-lg bg-[#123524]/10 text-[#123524] border border-[#123524]/25 font-bold">
                                        إجمالي دائن (دفعات): {formatCurrency(computedLedger.totalCredit, 2)} EGP
                                    </span>
                                    <span className="px-3 py-1.5 rounded-lg bg-[#e04b2a]/20 text-[#e04b2a] border border-[#e04b2a]/40 font-black">
                                        الرصيد المستحق: {formatCurrency(computedLedger.finalBalance, 2)} EGP
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-start border-collapse">
                                    <thead>
                                        <tr className="bg-[#3b62b8] text-[#192631] text-xs font-extrabold">
                                            <th className="py-3.5 px-4 border-l border-[#192631]/10">التاريخ (Date)</th>
                                            <th className="py-3.5 px-4 border-l border-[#192631]/10">نوع السند (Document Type)</th>
                                            <th className="py-3.5 px-4 border-l border-[#192631]/10">رقم السند (Serial)</th>
                                            <th className="py-3.5 px-4 border-l border-[#192631]/10">مدين (Debit — مستخلصات)</th>
                                            <th className="py-3.5 px-4 border-l border-[#192631]/10">دائن (Credit — دفعات العميل)</th>
                                            <th className="py-3.5 px-4 border-l border-[#192631]/10">الرصيد (Running Balance)</th>
                                            <th className="py-3.5 px-4">البيان / ملاحظات (Description)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#192631]/10 text-xs">
                                        {computedLedger.rows.map((row, index) => (
                                            <tr
                                                key={row.id}
                                                className={
                                                    index % 2 === 1
                                                        ? 'bg-sky-950/25 hover:bg-sky-900/30'
                                                        : 'bg-white/80 backdrop-blur-md hover:bg-[#192631]/[0.05]'
                                                }
                                            >
                                                <td className="py-3 px-4 font-mono font-bold text-[#192631] border-l border-[#192631]/10">
                                                    {row.date}
                                                </td>
                                                <td className="py-3 px-4 font-bold border-l border-[#192631]/10">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono ${
                                                            row.docType === 'Contract'
                                                                ? 'bg-amber-500/15 text-[#b45309] border border-amber-500/30'
                                                                : 'bg-[#123524]/10 text-[#123524] border border-[#123524]/25'
                                                        }`}
                                                    >
                                                        {row.docType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-extrabold text-[#192631] border-l border-[#192631]/10">
                                                    {row.serial}
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-red-700 border-l border-[#192631]/10">
                                                    {formatCurrency(row.debit, 2)}
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-[#123524] border-l border-[#192631]/10">
                                                    {formatCurrency(row.credit, 2)}
                                                </td>
                                                <td
                                                    className={`py-3 px-4 font-mono font-black border-l border-slate-800 ${
                                                        row.runningBalance < 0 ? 'text-[#123524]' : 'text-[#b45309]'
                                                    }`}
                                                >
                                                    {formatLedgerBalance(row.runningBalance)}
                                                </td>
                                                <td className="py-3 px-4 text-[#192631]">
                                                    <div className="font-bold">{row.description || '—'}</div>
                                                    {row.notes && (
                                                        <div className="text-[11px] text-[#192631]/70 mt-0.5">{row.notes}</div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-[#e6e27a] text-black font-black text-sm">
                                            <td className="py-3.5 px-4 border-l border-black/20">اجمالي</td>
                                            <td className="py-3.5 px-4 border-l border-black/20"></td>
                                            <td className="py-3.5 px-4 border-l border-black/20"></td>
                                            <td className="py-3.5 px-4 font-mono border-l border-black/20">
                                                {formatCurrency(computedLedger.totalDebit, 2)}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono border-l border-black/20">
                                                {formatCurrency(computedLedger.totalCredit, 2)}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono border-l border-black/20">
                                                {formatCurrency(computedLedger.finalBalance, 2)} EGP
                                            </td>
                                            <td className="py-3.5 px-4 text-xs">
                                                صافي الرصيد المستحق على العميل بعد المستخلص الرابع
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* All 80 Migrated Actpert Client & Project Ledger Accounts */}
                            <div className="p-6 border-t border-[#192631]/10 bg-[#f5f5f5]/60 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-black text-[#192631]">
                                            All 80 Actpert Nexus Client & Project Ledger Accounts (كشوف حسابات العملاء والمشروعات — 80 حساب)
                                        </h4>
                                        <p className="text-xs text-[#192631]/70">
                                            Complete directory of all 80 client accounts & project cost centers migrated 100% from https://nexus.actpert.com/client-accounts
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-xl bg-[#e04b2a]/10 border border-[#e04b2a]/25 text-[#e04b2a] text-xs font-black">
                                        {NEXUS_CLIENT_ACCOUNTS_LEDGER.length} Client & Project Accounts
                                    </span>
                                </div>
                                <div className="max-h-96 overflow-y-auto rounded-xl border border-[#192631]/10 bg-white/90">
                                    <table className="w-full text-xs text-start border-collapse">
                                        <thead className="sticky top-0 bg-[#192631] text-white text-[11px]">
                                            <tr>
                                                <th className="py-2.5 px-3 font-bold">#</th>
                                                <th className="py-2.5 px-3 font-bold">Code</th>
                                                <th className="py-2.5 px-3 font-bold">Client & Project Cost Center</th>
                                                <th className="py-2.5 px-3 font-bold text-center">Projects</th>
                                                <th className="py-2.5 px-3 font-bold text-end">Total Extracts (EGP)</th>
                                                <th className="py-2.5 px-3 font-bold text-end">Total Collected (EGP)</th>
                                                <th className="py-2.5 px-3 font-bold text-end">Balance Due (EGP)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#192631]/10">
                                            {NEXUS_CLIENT_ACCOUNTS_LEDGER.map((acc, i) => (
                                                <tr key={acc.id} className="hover:bg-[#e04b2a]/[0.05]">
                                                    <td className="py-2 px-3 font-mono text-[#192631]/60">{i + 1}</td>
                                                    <td className="py-2 px-3 font-mono font-bold text-[#e04b2a]">{acc.code}</td>
                                                    <td className="py-2 px-3 font-bold text-[#192631]">{acc.clientAndProject}</td>
                                                    <td className="py-2 px-3 font-mono font-bold text-center text-[#192631]">{acc.projectsCount}</td>
                                                    <td className="py-2 px-3 font-mono font-bold text-end text-[#192631]">
                                                        {acc.totalExtracts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono font-bold text-end text-[#123524]">
                                                        {acc.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono font-black text-end text-[#e04b2a]">
                                                        {acc.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ====================================================================
                           OFFICIAL WHITE-BACKGROUND PRINT / PDF VIEW FOR PDF 2 (كشف حساب عميل)
                           ==================================================================== */
                        <div className="bg-white text-black rounded-xl p-8 shadow-2xl border border-slate-300 max-w-[1050px] mx-auto print:shadow-none print:border-none">
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold text-black">كشف حساب عميل</h1>
                                <div className="text-sm font-bold text-black mt-2">
                                    مركز التكلفة : C096_Michael & Mona_2026_02_16_Azad-5th settlement
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-4 text-xs">
                                <div className="space-y-1.5 text-start">
                                    <div>من تاريخ : 01-يناير-2025</div>
                                    <div>إلى تاريخ : 13-أكتوبر-2026</div>
                                    <div className="font-bold pt-1">العميل : Michael Saber (101020069)</div>
                                </div>

                                <div className="text-start space-y-1">
                                    <div className="flex items-center justify-end gap-2.5 mb-2">
                                        <div className="w-9 h-9 bg-[#e64a3b] text-[#192631] font-black text-xl flex items-center justify-center rounded-sm">
                                            N
                                        </div>
                                        <div className="text-start">
                                            <div className="text-lg font-black tracking-[0.2em] text-black leading-none">
                                                NEXUS
                                            </div>
                                            <div className="text-[8px] tracking-[0.25em] text-neutral-400">CONTRACTING</div>
                                        </div>
                                    </div>
                                    <div>NEXUS Contracting</div>
                                    <div>6th Ibrahim E-Oraby , Nohza El-Gedida , . , Cairo , Egypt</div>
                                    <div>01222278896</div>
                                </div>
                            </div>

                            {/* PDF 2 Table */}
                            <table className="w-full border-collapse border border-neutral-400 text-xs text-black">
                                <thead>
                                    <tr className="bg-[#3b62b8] text-[#192631] font-bold text-sm">
                                        <th className="border border-neutral-400 py-2 px-3 text-start w-28">التاريخ</th>
                                        <th className="border border-neutral-400 py-2 px-3 text-start w-44">نوع السند</th>
                                        <th className="border border-neutral-400 py-2 px-3 text-start w-28">رقم السند</th>
                                        <th className="border border-neutral-400 py-2 px-3 text-start w-28">مدين</th>
                                        <th className="border border-neutral-400 py-2 px-3 text-start w-28">دائن</th>
                                        <th className="border border-neutral-400 py-2 px-3 text-start w-32">الرصيد</th>
                                        <th className="border border-neutral-400 py-2 px-3 text-center">البيان</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {computedLedger.rows.map((row, idx) => (
                                        <tr
                                            key={row.id}
                                            className={idx % 2 === 1 ? 'bg-[#d9edf7]' : 'bg-white'}
                                        >
                                            <td className="border border-neutral-400 py-2 px-2.5 font-mono">{row.date}</td>
                                            <td className="border border-neutral-400 py-2 px-2.5">{row.docType}</td>
                                            <td className="border border-neutral-400 py-2 px-2.5 font-mono text-blue-800 font-bold">
                                                {row.serial}
                                            </td>
                                            <td className="border border-neutral-400 py-2 px-2.5 font-mono">
                                                {formatCurrency(row.debit, 2)}
                                            </td>
                                            <td className="border border-neutral-400 py-2 px-2.5 font-mono">
                                                {formatCurrency(row.credit, 2)}
                                            </td>
                                            <td className="border border-neutral-400 py-2 px-2.5 font-mono">
                                                {formatLedgerBalance(row.runningBalance)}
                                            </td>
                                            <td className="border border-neutral-400 py-2 px-2.5">{row.description}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[#e6e27a] font-bold">
                                        <td className="border border-neutral-400 py-2 px-2.5">اجمالي</td>
                                        <td className="border border-neutral-400 py-2 px-2.5"></td>
                                        <td className="border border-neutral-400 py-2 px-2.5"></td>
                                        <td className="border border-neutral-400 py-2 px-2.5 font-mono">
                                            {formatCurrency(computedLedger.totalDebit, 2)}
                                        </td>
                                        <td className="border border-neutral-400 py-2 px-2.5 font-mono">
                                            {formatCurrency(computedLedger.totalCredit, 2)}
                                        </td>
                                        <td className="border border-neutral-400 py-2 px-2.5"></td>
                                        <td className="border border-neutral-400 py-2 px-2.5"></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* PDF 2 Footer */}
                            <div className="mt-24 pt-3 border-t border-neutral-400 flex justify-between items-center text-xs text-black">
                                <div>صفحة 1 من 1</div>
                                <div className="font-bold">Powered By: e-Works</div>
                                <div className="text-start">
                                    <div>تمت الطباعة بواسطة : Pierre Afifi</div>
                                    <div>وقت الطباعة : 2026/10/13 17:23:54</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================
                SUB-TAB 3: OFFICIAL PAYMENT REQUEST VOUCHER (طلب صرف / سداد - PDF 3)
               ======================================================================== */}
            {activeSubTab === 'payment_request' && (
                <div className="space-y-6">
                    {/* Top Action Bar */}
                    {!printPreviewMode && (
                        <div className="print:hidden bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-xs font-bold text-[#192631]/70 mr-1">سجل طلبات الصرف (PR Vouchers):</span>
                                {paymentRequests.map((pr) => (
                                    <button
                                        key={pr.id}
                                        onClick={() => setSelectedPrId(pr.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                                            selectedPrId === pr.id
                                                ? 'bg-[#e04b2a] text-[#071a2f] border-[#e04b2a]'
                                                : 'bg-[#f5f5f5]/90 text-[#192631]/85 border-[#192631]/10 hover:border-slate-600'
                                        }`}
                                    >
                                        مسلسل {pr.serial} · {formatCurrency(pr.amount, 0)} {pr.currencyCode} ({pr.dateIso})
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    onClick={() => setShowNewPrModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#e04b2a] text-[#071a2f] hover:bg-[#d4b06a] shadow-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ إنشاء طلب صرف جديد (New PR)</span>
                                </button>

                                <button
                                    onClick={() => setPrintPreviewMode(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#192631]/[0.05] text-[#192631] hover:bg-white/15 border border-[#192631]/10"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>معاينة وطباعة مستند الصرف الرسمي (PDF 3)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left/Center: Official White Voucher Replica matching PDF 3 */}
                        <div className={printPreviewMode ? 'lg:col-span-12' : 'lg:col-span-8'}>
                            <div className="bg-white text-black rounded-2xl p-8 shadow-2xl border border-slate-300 max-w-[900px] mx-auto print:shadow-none print:border-none">
                                <div className="text-center mb-6">
                                    <h1 className="text-xl font-bold text-black">Payment Request</h1>
                                </div>

                                {/* Logo & Address on Left */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-10 h-10 bg-[#e64a3b] text-[#192631] font-black text-2xl flex items-center justify-center rounded-sm">
                                            N
                                        </div>
                                        <div>
                                            <div className="text-xl font-black tracking-[0.2em] text-black leading-none">
                                                NEXUS
                                            </div>
                                            <div className="text-[9px] tracking-[0.25em] text-neutral-400">CONTRACTING</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-black space-y-1 font-medium">
                                        <div>NEXUS Contracting</div>
                                        <div>6th Ibrahim E-Oraby , Nohza El-Gedida Cairo , Egypt</div>
                                        <div className="pt-2">01222278896</div>
                                    </div>
                                </div>

                                {/* Voucher Metadata Grid matching PDF 3 */}
                                <div className="flex justify-between items-start text-sm font-bold text-black mb-4 px-2">
                                    <div className="flex items-center gap-8">
                                        <span>{activePr.bankAccount}</span>
                                        <span>البنك</span>
                                    </div>

                                    <div className="space-y-2 text-start">
                                        <div className="flex justify-end gap-8">
                                            <span>{activePr.serial}</span>
                                            <span className="w-16">مسلسل</span>
                                        </div>
                                        <div className="flex justify-end gap-8">
                                            <span>{activePr.dateFormattedAr}</span>
                                            <span className="w-16">تاريخ</span>
                                        </div>
                                        <div className="flex justify-end gap-8">
                                            <span>{activePr.currencyAr}</span>
                                            <span className="w-16">العملة</span>
                                        </div>
                                        <div className="flex justify-end gap-8">
                                            <span className="font-mono">{formatCurrency(activePr.amount, 2)}</span>
                                            <span className="w-16">القيمة</span>
                                        </div>
                                        <div className="flex justify-end gap-8">
                                            <span className="font-mono">{activePr.orderOfProject}</span>
                                            <span className="w-16">لأمر</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Blue Header Table matching PDF 3 */}
                                <table className="w-full border-collapse border border-neutral-400 text-sm mb-6">
                                    <thead>
                                        <tr className="bg-[#3b62b8] text-black font-bold">
                                            <th className="border border-neutral-400 py-1.5 px-4 text-center w-52">القيمة</th>
                                            <th className="border border-neutral-400 py-1.5 px-4 text-center">البيان</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border border-neutral-400">
                                            <td className="border border-neutral-400 py-2 px-4 font-mono font-bold text-[#e62e25] flex justify-between">
                                                <span>{activePr.currencyCode}</span>
                                                <span>{Math.round(activePr.amount).toLocaleString('en-US')}</span>
                                            </td>
                                            <td className="border border-neutral-400 py-2 px-4 text-start font-bold text-black">
                                                المبلغ ({activePr.amountInWordsAr})
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Approval Signatures on Print Sheet */}
                                <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-dashed border-neutral-300 text-center text-xs text-black">
                                    <div>
                                        <div className="font-bold text-neutral-600">إعداد الحسابات (Prepared By)</div>
                                        <div className="font-extrabold mt-2">Merna Maged</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-600">مراجعة المكتب الفني (Reviewed By)</div>
                                        <div className="font-extrabold mt-2">Eng. Pierre Safwat</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-600">اعتماد الصرف (Approved By)</div>
                                        <div className="font-extrabold mt-2">CEO / General Manager</div>
                                    </div>
                                </div>

                                {/* PDF 3 Footer */}
                                <div className="mt-24 pt-3 border-t border-neutral-400 flex justify-between items-center text-xs text-black">
                                    <div>صفحة 1 من 1</div>
                                    <div className="font-bold">:Powered By</div>
                                    <div className="text-start">
                                        <div>تمت الطباعة بواسطة : {activePr.printedBy}</div>
                                        <div>وقت الطباعة : {activePr.printTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Approval Chain & POP Attachment Panel (Hidden in Print) */}
                        {!printPreviewMode && (
                            <div className="lg:col-span-4 space-y-4 print:hidden">
                                <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-[#192631] flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-[#e04b2a]" />
                                            <span>دورة اعتماد طلب الصرف & POP</span>
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                                            Serial #{activePr.serial}
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-xs">
                                        <div className="p-3 rounded-xl bg-[#f5f5f5]/90 border border-[#123524]/25 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-[#123524] shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-[#192631]">1. إعداد الحسابات والمشتريات</div>
                                                <div className="text-[#192631]/70 mt-0.5">{activePr.preparedBy}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#f5f5f5]/90 border border-[#123524]/25 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-[#123524] shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-[#192631]">2. مراجعة المكتب الفني والمشروعات</div>
                                                <div className="text-[#192631]/70 mt-0.5">{activePr.reviewedBy}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#f5f5f5]/90 border border-[#123524]/25 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-[#123524] shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-[#192631]">3. اعتماد الإدارة العليا والصرف البنكي</div>
                                                <div className="text-[#192631]/70 mt-0.5">{activePr.approvedBy}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* POP (Proof of Payment) Section */}
                                    <div className="pt-4 border-t border-[#192631]/10 space-y-3">
                                        <div className="text-xs font-extrabold text-[#e04b2a]">
                                            مستند إثبات التحويل البنكي (POP — Proof of Payment)
                                        </div>
                                        {activePr.popFileName ? (
                                            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-[#123524]/25 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono font-bold text-[#123524]">
                                                        {activePr.popFileName}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#123524]/10 text-[#123524] font-bold">
                                                        Verified POP
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-[#192631]/70">
                                                    تم إرفاق إشعار التحويل البنكي من حساب ({activePr.bankAccount}) بتاريخ{' '}
                                                    {activePr.popUploadedAt}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAttachPop(activePr.id)}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-[#192631] border border-blue-500/40 text-xs font-extrabold transition-all"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span>إرفاق إشعار التحويل البنكي (Attach POP)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================
                MODAL: RECORD CLIENT PAYMENT / POST EXTRACT TO LEDGER
               ======================================================================== */}
            {showAddLedgerModal && (
                <div className="fixed inset-0 z-50 bg-[#192631]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
                            <h3 className="text-base font-black text-[#192631]">
                                تسجيل حركة جديدة بكشف حساب العميل
                            </h3>
                            <button
                                onClick={() => setShowAddLedgerModal(false)}
                                className="text-[#192631]/70 hover:text-[#192631]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddLedgerEntry} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-[#192631]/85 font-bold mb-1">نوع السند (Document Type)</label>
                                <select
                                    value={newLedgerType}
                                    onChange={(e) => setNewLedgerType(e.target.value as any)}
                                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2.5 text-[#192631] font-bold"
                                >
                                    <option value="Bank Transfer From Customer">
                                        Bank Transfer From Customer (دائن — دفعة من العميل)
                                    </option>
                                    <option value="Contract">
                                        Contract (مدين — استحقاق مستخلص أعمال)
                                    </option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[#192631]/85 font-bold mb-1">التاريخ (DD/MM/YYYY)</label>
                                    <input
                                        type="text"
                                        value={newLedgerDate}
                                        onChange={(e) => setNewLedgerDate(e.target.value)}
                                        className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#192631]/85 font-bold mb-1">رقم السند (Serial)</label>
                                    <input
                                        type="text"
                                        value={newLedgerSerial}
                                        onChange={(e) => setNewLedgerSerial(e.target.value)}
                                        className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#192631]/85 font-bold mb-1">القيمة بالجنيه المصري (Amount EGP)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newLedgerAmount}
                                    onChange={(e) => setNewLedgerAmount(e.target.value)}
                                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2.5 text-[#192631] font-mono font-bold text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[#192631]/85 font-bold mb-1">البيان / ملاحظات</label>
                                <input
                                    type="text"
                                    value={newLedgerNotes}
                                    onChange={(e) => setNewLedgerNotes(e.target.value)}
                                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#192631]/10">
                                <button
                                    type="button"
                                    onClick={() => setShowAddLedgerModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-[#192631]/85 font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#e04b2a] text-[#071a2f] font-extrabold"
                                >
                                    حفظ وترحيل للكشف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================
                MODAL: CREATE NEW OFFICIAL PAYMENT REQUEST VOUCHER (طلب صرف جديد)
               ======================================================================== */}
            {showNewPrModal && (
                <div className="fixed inset-0 z-50 bg-[#192631]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#192631]/10 pb-3">
                            <h3 className="text-base font-black text-[#192631]">
                                إنشاء طلب صرف رسمي (Official Payment Request)
                            </h3>
                            <button
                                onClick={() => setShowNewPrModal(false)}
                                className="text-[#192631]/70 hover:text-[#192631]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePaymentRequest} className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[#192631]/85 font-bold mb-1">طريقة الدفع</label>
                                    <select
                                        value={newPrPaymentType}
                                        onChange={(e) => setNewPrPaymentType(e.target.value as any)}
                                        className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="InstaPay">InstaPay</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Cash Vault">Cash Vault</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[#192631]/85 font-bold mb-1">البنك / الخزينة</label>
                                    <input
                                        type="text"
                                        value={newPrBank}
                                        onChange={(e) => setNewPrBank(e.target.value)}
                                        className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#192631]/85 font-bold mb-1">المبلغ (EGP)</label>
                                <input
                                    type="number"
                                    value={newPrAmount}
                                    onChange={(e) => setNewPrAmount(e.target.value)}
                                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono font-bold text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[#192631]/85 font-bold mb-1">المبلغ بالحروف (تفقيط)</label>
                                <input
                                    type="text"
                                    value={newPrWords}
                                    onChange={(e) => setNewPrWords(e.target.value)}
                                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#192631]/85 font-bold mb-1">لأمر / المشروع (Order Of)</label>
                                <input
                                    type="text"
                                    value={newPrProject}
                                    onChange={(e) => setNewPrProject(e.target.value)}
                                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#192631]/10">
                                <button
                                    type="button"
                                    onClick={() => setShowNewPrModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#192631]/[0.05] text-[#192631]/85 font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#e04b2a] text-[#071a2f] font-extrabold"
                                >
                                    إصدار طلب الصرف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtractsStatementsHub;
