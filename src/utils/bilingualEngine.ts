// ─── Nexus Bilingual & BiDi Directionality Engine ───
// Guarantees 100% clean LTR (English) and RTL (Arabic) rendering across all pages and hubs,
// preventing broken parentheses, backwards BiDi tokens, or mixed-language collisions.

const AR_CHAR_RE = /[\u0600-\u06FF]/;
const EN_WORD_RE = /[A-Za-z]{2,}/;

// Exact Arabic -> English UI Dictionary
export const AR_TO_EN_EXACT: Record<string, string> = {
    // Sub-tabs & Hub Navigation
    // Hub Headers, Subtitles, Badges & Action Buttons
    'مركز قيادة السيولة التنفيذية، الخزن والبنوك، حدود وأقساط الكروت الـ 7، ومراجعة E-Works': 'Executive Liquidity Command, Cash & Bank Vaults, Credit Card Limits & E-Works Audit',
    'مراقبة لحظية لإجمالي السيولة القابلة للصرف، أرصدة الـ 6 خزن وحسابات بنكية، حدود الـ 7 كروت ائتمانية، ومصفوفة ربحية الـ 46 مشروع نشط': 'Real-time monitoring of spendable liquidity, 7 cash & bank accounts, 9 corporate credit card limits, and 77 active project profitability matrix',
    'تسجيل حركة خزينة أو تحويل بنكي': 'Record Treasury or Bank Transaction',
    'مزامنة اللقطة الحية': 'Sync Live Snapshot',
    'نقدية + ائتمان متاح': 'Cash + Available Credit',
    '6 حسابات نشطة': '7 Active Accounts',
    '7 كروت مشتريات': '9 Purchasing Cards',
    'موزعة على خزينة النزهة، بنك CIB، البنك الأهلي NBE (أفراد Debit)، بنك QNB، فودافون كاش، وعهدة المواقع': 'Distributed across Main Vault, CIB, NBE, QNB, Vodafone Cash, and Site Custodies',
    'دفعات التعاقد والتمويل والمستخلصات': 'Contract Down Payments, Funding & Extracts',
    'مقاولي الباطن، اليوميات، وتأمين الأعمال': 'Subcontractors, Daily Labor & Workmanship Retention',
    'أرصدة الخزن والبنوك والتحويلات (6 حسابات)': 'Cash Vaults, Bank Accounts & Transfers (7 Accounts)',
    'حدود كروت الائتمان الـ 7 وجدول الأقساط الشهرية (أقساط الكروت)': 'Corporate Credit Cards (9) & Monthly Installments',
    'ربحية وموقف السيولة للـ 46 مشروع نشط': '77 Projects Profitability & Cashflow Matrix',
    'مراجعة ترحيل بيانات E-Works للنظام الجديد (/eworks/review)': 'E-Works Legacy ERP Migration Audit (/eworks/review)',
    'مركز المشتريات المربوط بالاعتمادات، ماسح فواتير الواتساب (OCR)، حسابات ميرنا، ولوجستيات المخازن الأربعة': 'Submittal-Gated Procurement, WhatsApp/OCR Bill Scanner, Accounting & 4-Warehouse Custody Hub',
    'تطبيق صارم لقاعدة م. بيير صفوت: حظر إصدار أي أمر شراء (NPO) إلا بعد اعتماد الخامة (Code A / B)، مع ماسح ضوئي لفواتير الموانين اليدوية، دورة PR/POP مع أ. ميرنا ماجد، وتتبع أسطول ميلاد هارون والمخازن الـ 4.': 'Strict enforcement of Eng. Pierre Afifi’s gatekeeper rule: no Purchase Order (NPO) without Consultant Material Approval (Code A/B), OCR scanner for handwritten bills, PR/POP accounting chain, and 4-warehouse custody.',
    'مركز التحكم في المستندات، سجل الاعتمادات (51 بند)، والترانسميتال الرسمي': 'Document Control Hub, 51-Clause Submittals Register & Formal Transmittals',
    'محرك التسعير الهندسي R02، تحليل أسعار الوحدة (11 مركب)، وتوزيع التكاليف غير المباشرة': 'R02 Engineering Pricing Engine, 11-Component Unit Rate Analyzer & Site Overheads Allocation',
    'مستخلصات الأعمال الجارية (PDF 1)، كشف حساب العميل (PDF 2)، وطلبات الصرف الرسمية (PDF 3)': 'Cumulative Works Extracts (PDF 1), Client Account Statement (PDF 2) & Official Payment Requests (PDF 3)',
    'دليل مقاولي الباطن والصنايعية (56 مقاول)، مصفوفة تقييم الإدارة A/B/C، والمستخلصات وأوامر الدفع (ST / CPO)': '56 Subcontractors & Craftsmen Directory, CEO 4-Pillar A/B/C Rating Matrix, Statements (ST) & Cash Orders (CPO)',
    'تتبع مواقع المهندسين والموظفين بالـ GPS (16 موظف)، التمام المفاجئ، ودورة البصمة والمرتبات (21 إلى 20)': 'Live Staff GPS Whereabouts (16 Staff), Surprise Roll Call & 21→20 Biometric Payroll Cycle',
    '1. أوامر الشراء المربوطة بالاعتمادات (NPO)': '1. Submittal-Gated Purchase Orders (NPO)',
    '2. ماسح فواتير الواتساب والموانين (PO-OCR)': '2. WhatsApp & Handwritten Bill OCR Scanner',
    '3. حسابات ميرنا (PR/POP) ولوجستيات ميلاد': '3. Accounting (PR/POP) & Fleet Logistics',
    '4. المخازن الأربعة والعهدة واستلام الموقع': '4. 4-Warehouse Custody & Site Receiving',
    '1. سجل مقاولي الباطن وتقييم الإدارة A/B/C (56 مقاول)': '1. Subcontractors Directory & CEO A/B/C Matrix (56)',
    '2. مستخلصات مقاولي الباطن (كود ST & تأمين 5%)': '2. Subcontractor Statements (ST & 5% Retention)',
    '3. أوامر الدفع النقدي (CPO) وتسويات العهد (RCB)': '3. Cash Payment Orders (CPO) & Custody (RCB)',
    '1. أين الموظفون الآن & مواقع المشروعات GPS': '1. Live Staff GPS Whereabouts & Geofence Zones',
    '2. تمام حالي مفاجئ (/hr/surprise-check)': '2. Surprise GPS Roll Call (/hr/surprise-check)',
    '3. شيت الحضور والبصمة الشهري (دورة 21 إلى 20)': '3. Monthly Attendance & Payroll Cycle (21→20)',
    '4. طلبات الإجازات والسلف والعهد والقرارات الإدارية': '4. Leave, Advances, Petty Cash & Directives',
    '1. مستخلص أعمال جاري (PDF 1: Works Extract 4)': '1. Cumulative Works Extract (PDF 1: Extract 4)',
    '2. كشف حساب عميل (PDF 2: Michael Saber · 101020069)': '2. Client Account Statement (PDF 2: 101020069)',
    '3. طلب صرف / سداد رسمي (PDF 3: Serial 4)': '3. Official Payment Request Voucher (PDF 3)',
    'سجل الاعتمادات والاستلامات': 'Submittals & Inspection Register',
    'مولد الإيميلات الرسمية والترانسميتال': 'Official Email & Transmittal Generator',
    'مولد تكويد الملفات والفولدرات القياسي': 'Standard File & Folder Coding Engine',
    'دليل الأكواد والـ 51 بند القياسي': '51 Submittal Clauses & Coding Guide',
    'خريطة الأعمال R02 (34 باقة / 839 بند)': 'R02 Work Map & BOQ (34 Packages / 839 Items)',
    'تحليل سعر الوحدة التفصيلي (11 مركب)': 'Deep Unit Rate Breakdown (11 Components)',
    'التكاليف غير المباشرة وتوزيعها النسبي': 'Site Overheads & Proportional Allocation',
    'الهوامش والتضخم ومحاكي التفاوض والخصم': 'Markups, Inflation & Negotiation Simulator',
    'أرصدة الخزن والبنوك والتحويلات': 'Cash Vaults, Bank Accounts & Transfers',
    'حدود كروت الائتمان الـ 7 وجدول الأقساط الشهرية': 'Corporate Credit Cards & Installment Plans',
    'ربحية وموقف السيولة للـ 46 مشروع': 'Active Projects Profitability & Cashflow Matrix',
    'مراجعة ترحيل بيانات E-Works للنظام الجديد': 'E-Works Legacy ERP Migration Audit',

    // Common Table Headers & KPI Labels
    'الكود': 'Code',
    'كود': 'Code',
    'المشروع': 'Project',
    'العميل': 'Client',
    'الحالة': 'Status',
    'الإيراد': 'Revenue',
    'التكلفة المباشرة': 'Direct Cost',
    'الربح': 'Profit',
    'الهامش': 'Margin %',
    'التاريخ': 'Date',
    'تاريخ': 'Date',
    'البيان': 'Description',
    'البيان / ملاحظات': 'Description / Notes',
    'الوحدة': 'Unit',
    'الكمية': 'Quantity',
    'الكمية السابقة': 'Previous Qty',
    'الكمية الحالية المنفذة': 'Current Executed Qty',
    'كمية سابقة': 'Prev Qty',
    'كمية حالية': 'Curr Qty',
    'سعر الوحدة (ج.م)': 'Unit Price (EGP)',
    'فئة الوحدة (ج.م)': 'Unit Rate (EGP)',
    'الإجمالي': 'Total',
    'اجمالي': 'Total',
    'الإجمالي (ج.م)': 'Total (EGP)',
    'المبلغ الصافي (ج.م)': 'Net Amount (EGP)',
    'الرصيد': 'Balance',
    'الرصيد الفعلي المتاح حالياً': 'Current Available Balance',
    'مدين': 'Debit',
    'دائن': 'Credit',
    'مسلسل': 'Serial #',
    'رقم السند': 'Voucher #',
    'نوع السند': 'Document Type',
    'نوع الحركة': 'Transaction Type',
    'طريقة الدفع': 'Payment Method',
    'البنك': 'Bank',
    'البنك / الخزينة': 'Bank / Cash Vault',
    'الحساب البنكي / الخزينة': 'Bank Account / Vault',
    'العملة': 'Currency',
    'الكارت والبنك': 'Card & Bank',
    'المستخدم': 'Used Balance',
    'الحد الكلي': 'Credit Limit',
    'المتاح للصرف': 'Available Limit',
    'القسط الشهري': 'Monthly Installment',
    'الاستحقاق القادم': 'Next Due Date',
    'المدفوع / المتبقي': 'Paid / Remaining',
    'قيمة التعاقد': 'Contract Value',
    'إجمالي المتحصلات من العميل': 'Client Collections',
    'إجمالي المتحصلات من العملاء': 'Total Client Collections',
    'إجمالي المصروفات الفعلية': 'Actual Site Expenses',
    'إجمالي المصروفات الفعلية والتوريدات': 'Total Actual Expenses & Supplies',
    'صافي سيولة المشروع': 'Net Project Cashflow',
    'نسبة الربح الفعلي': 'Actual Profit Margin %',
    'نسبة الإشراف': 'Supervision Fee %',
    'العميل والمنطقة': 'Client & Zone',
    'كود واسم المشروع': 'Project Code & Name',
    'كود المشروع': 'Project Code',
    'كود الموقع': 'Site Code',
    'اسم الموقع / المشروع': 'Site / Project Name',
    'الموقع الجغرافي': 'Geographic Location',
    'الموظف / المهندس': 'Employee / Engineer',
    'الموظف والموقع': 'Employee & Site',
    'المهندس / المشرف': 'Engineer / Supervisor',
    'المهندسون والمشرفون المعينون': 'Assigned Engineers & Supervisors',
    'القسم والمشروع': 'Department & Project',
    'بصمة الحضور': 'Check-In Time',
    'حالة التحقق': 'Verification Status',
    'زمن الاستجابة': 'Response Time',
    'دقة الـ GPS والصورة': 'GPS & Photo Accuracy',
    'الأثر الإداري / الجزاء التلقائي': 'Administrative Action / Auto Penalty',
    'الراتب الأساسي': 'Base Salary',
    'ساعات الإضافي': 'Overtime Hours',
    'دقائق التأخير': 'Late Minutes',
    'خصم التأخير والجزاءات': 'Late & Penalty Deductions',
    'سلف وعهد (RCB)': 'Advances & Custody (RCB)',
    'المكافآت والحوافز': 'Bonuses & Incentives',
    'الصافي المستحق': 'Net Payable',
    'صافي المستحق': 'Net Payable',
    'صافي المستحق للصرف': 'Net Payable Amount',
    'جاهزية الصرف': 'Disbursement Readiness',
    'اسم المقاول / الصنايعي': 'Subcontractor / Craftsman Name',
    'اسم المقاول / الصنايعي أو الورشة': 'Subcontractor / Workshop Name',
    'كود Nexus والتخصص': 'Nexus Code & Specialty',
    'طبيعة العمل': 'Work Nature',
    'طبيعة العمل:': 'Work Nature:',
    'المشاريع المسندة': 'Assigned Projects',
    'تقييم الإدارة': 'CEO Evaluation',
    '1. جودة التنفيذ': '1. Execution Quality',
    '2. مناسبة الأسعار': '2. Price Competitiveness',
    '2. مناسبة الأسعار للسوق': '2. Market Price Competitiveness',
    '3. الالتزام بالمواعيد': '3. Schedule Commitment',
    '4. التعامل بالموقع': '4. Site Dealing & Ethics',
    'جودة التنفيذ': 'Execution Quality',
    'جودة التنفيذ والاستلام الهندسي': 'Execution Quality & Engineering Handover',
    'مناسبة الأسعار': 'Price Competitiveness',
    'مناسبة الأسعار للسوق': 'Market Price Competitiveness',
    'الالتزام بالمواعيد': 'Schedule Commitment',
    'الالتزام بالمواعيد والبرنامج الزمني': 'Schedule & Timeline Commitment',
    'التعامل بالموقع': 'Site Ethics',
    'التعامل والأخلاقيات بالموقع': 'Site Dealing & Professional Ethics',
    'التصنيف العام': 'Overall Grade',
    'الرصيد وتأمين 5%': 'Balance & 5% Retention',
    'الدفعات السابقة المصروفة': 'Previous Disbursed Payments',
    'الدفعات السابقة المصروفة (ج.م)': 'Previous Disbursed Payments (EGP)',
    'بيان الأعمال المنفذة بالمستخلص': 'Executed Works Description in Statement',
    'تحديث التقييم A/B/C': 'Update A/B/C Rating',
    '+ مستخلص مقاول (ST)': '+ New Statement (ST)',
    '+ تسجيل مقاول باطن / صنايعي جديد': '+ Register Subcontractor',
    '+ تحرير مستخلص مقاول باطن جديد (ST)': '+ Create Subcontractor Statement (ST)',
    '+ تسجيل دفعة عميل / ترحيل مستخلص للكشف': '+ Record Client Payment / Post Extract',
    '+ إنشاء طلب صرف جديد (New PR)': '+ Create Payment Request (New PR)',
    'طباعة / تصدير PDF رسمي': 'Print / Export Official PDF',
    'طباعة المستخلص بالتصميم الرسمي': 'Print Official Works Extract',
    'طباعة كشف الحساب الرسمي (PDF 2)': 'Print Official Client Statement (PDF 2)',
    'معاينة وطباعة مستند الصرف الرسمي (PDF 3)': 'Preview & Print Payment Request (PDF 3)',
    'إرسال طلب تمام مفاجئ بالـ GPS والصورة الحية': 'Trigger Surprise Live GPS & Photo Roll Call',
    'إجمالي البنود القياسية': 'Total Standard Items',
    'إجمالي الرواتب الأساسية': 'Total Base Salaries',
    'إجمالي السجل الهندسي': 'Total Submittals Register',
    'إجمالي العملية': 'Total Transaction Value',
    'إجمالي القيمة': 'Total Value',
    'إجمالي الكمية والفئة': 'Total Qty & Rate',
    'إجمالي المسجلين بالدليل الرسمي': 'Total Registered in Directory',
    'إجمالي تأمين الأعمال المحتجز (5%)': 'Total Workmanship Retention Held (5%)',
    'إجمالي تقييم المخازن الأربعة وعهدة المواقع': 'Total 4-Warehouse & Site Custody Valuation',
    'إجمالي قيمة الأعمال': 'Gross Work Value',
    'حسابات الأستاذ النشطة للمقاولين': 'Active Contractor Ledger Accounts',
    'نخبة التصنيف الأول (CEO Grade A)': 'Top-Tier Rated (CEO Grade A)',
    'مقاول باطن وصنايعي مسجل': 'Registered Subcontractors & Craftsmen',
    'حساب مقاول باطن': 'Contractor Ledger Accounts',
    'موزعين على 13 تخصص تشطيبات و MEP': 'Across 13 Finishing & MEP Trades',
    'مربوطة بمراكز تكلفة المشاريع (C096, C063, C091)': 'Linked to Project Cost Centers (C096, C063, C091)',
    'تقييم رباعي: الجودة · السعر · المواعيد · التعامل': '4-Pillar Rating: Quality · Pricing · Schedule · Ethics',
    'يُرد بعد الاستلام النهائي وفترة الضمان': 'Released upon Final Handover & Warranty Period',
    'تحرير مستخلص مقاول باطن جديد (كود ST)': 'Create New Subcontractor Statement (ST)',
    'تسجيل مقاول باطن / صنايعي جديد بالدليل': 'Register New Subcontractor / Craftsman',
    'اعتماد المستخلص وإصدار أمر دفع (CPO)': 'Approve Statement & Issue Cash Order (CPO)',
    'بانتظار استلام مهندس الموقع (اضغط لاعتماد SIR)': 'Pending Site Engineer Inspection (Click to Approve SIR)',
    'تم إصدار أمر الدفع CPO للحسابات': 'CPO Disbursed to Accounting',
    'تم الصرف والترحيل للأستاذ': 'Disbursed & Posted to General Ledger',
    'تأكيد الصرف (أ. ميرنا)': 'Confirm Disbursement (Merna Maged)',
    'إصدار وإرسال إلى أ. ميرنا ماجد (قسم الحسابات) للصرف': 'Issue & Send to Merna Maged (Accounting) for Disbursement',
    'CPO - أمر دفع نقدي لمقاول باطن': 'CPO - Subcontractor Cash Payment Order',
    'RCB - تسوية عهدة مهندس موقع': 'RCB - Site Engineer Petty Cash Reconciliation',
    'الكل': 'All',
    'ج.م': 'EGP',
    'حاضر': 'Present',
    'غايب': 'Absent',
    'مفتوح': 'Active / Open',
    'تم النسخ': 'Copied',
    'نسخ الكود': 'Copy Code',
    'إضافة بند': 'Add Line Item',
    'تحويل بنكي': 'Bank Transfer',
};

// Exact English -> Arabic UI Dictionary for RTL Mode
export const EN_TO_AR_EXACT: Record<string, string> = {
    // Sidebar & Main Navigation
    'Overview & Projects': 'نظرة عامة والمشاريع',
    'Dashboard': 'لوحة القيادة التنفيذية',
    'Projects': 'المشاريع والعقود',
    'Meetings': 'الاجتماعات والمحاضر',
    'Daily Entries': 'اليوميات وسجل الأنشطة',
    'Engineering & Technical': 'المكتب الفني والهندسي',
    'BOQ & R02 Pricing': 'المقايسات وتسعير R02',
    'Submittals & Coding': 'الاعتمادات والتكويد الهندسي',
    'Variations & RFIs': 'أوامر التغيير والاستفسارات',
    'Emails & Transmittals': 'المراسلات والترانسميتال',
    'Procurement & Field': 'المشتريات والمخازن والتنفيذ',
    'Procurement & Stores': 'أوامر الشراء والمخازن (4)',
    'Subcontractors': 'مقاولو الباطن والصنايعية',
    'Engineers & Team': 'المهندسون وفريق العمل',
    'Attendance & GPS': 'الحضور وبصمة الـ GPS',
    'Finance & System': 'الإدارة المالية والنظام',
    'Extracts & Ledger': 'المستخلصات وكشوف الحساب',
    'Financials & Treasury': 'المالية والخزينة والبنوك',
    'Reports': 'التقارير والتحليلات',
    'White-Label Studio': 'إعدادات الهوية المؤسسية',
    'Help Guide': 'دليل تشغيل النظام',
    'My Profile': 'الملف الشخصي',
    'Active Company Workspace': 'مساحة عمل الشركة النشطة',
    'Notifications': 'الإشعارات والتنبيهات',
    'No new notifications': 'لا توجد إشعارات جديدة',

    // Page Headers & Buttons
    // Split Header Words & Subtitles for Clean RTL Mode
    'Financial': 'الإشراف',
    'Oversight': 'المالي والخزينة',
    'Monitor project budgets, operational costs, and generate invoices.': 'مراقبة ميزانيات المشاريع، التكاليف التشغيلية، الخزينة والبنوك، وإصدار المستخلصات والفواتير.',
    'HOW SYSTEM WORKS': 'آلية عمل النظام الهندسي والمالي',
    'Treasury, 7 Credit Cards & 46 Projects (738,284 EGP)': 'الخزينة، كروت الائتمان ومصفوفة المشاريع (738,284 ج.م)',
    'Works Extracts & Client Ledger (PDF 1–3)': 'مستخلصات الأعمال وكشف حساب العميل (PDF 1–3)',
    'Client Projects & Invoicing': 'حسابات ومشاريع العملاء والفوترة',
    'Project': 'مكتبة',
    'Library': 'المشاريع والعقود',
    'Manage and monitor active DEC engineering ventures.': 'إدارة ومراقبة المشاريع الهندسية، العقود، ونسب الإنجاز والمستخلصات.',
    'Engineering & Staff': 'قائمة المهندسين',
    'Roster (16)': 'وموظفي الشركة (16)',
    'Subcontractors &': 'دليل مقاولي الباطن',
    'Craftsmen (56)': 'والصنايعية (56)',
    'Contractor Ledger': 'كشوف حسابات',
    'Accounts (63)': 'المقاولين (63)',
    'In-House Staff (16)': 'مهندسو وموظفو الشركة (16)',
    '56 Subcontractors & CPO/ST': '56 مقاول باطن والمستخلصات ST/CPO',
    '63 Contractor Accounts': '63 حساب أستاذ مقاولين',
    'Recruit Specialist': 'إضافة مهندس جديد',
    '46 Projects': '46 مشروع',
    '43 Clients': '43 عميل',
    '63 Accounts': '63 حساب مقاول',
    'Project Library': 'مكتبة المشاريع والعقود',
    'Manage Phases': 'إدارة المراحل',
    'Initiate Project': 'إضافة مشروع جديد',
    'All Projects': 'جميع المشاريع',
    'Contracting Portfolio': 'محفظة المقاولات المتكاملة',
    'Contract Value': 'قيمة التعاقد',
    'Work Achieved': 'الأعمال المنفذة',
    'Collected': 'المحصّل من العميل',
    'Net Balance Due': 'صافي الرصيد المستحق',
    'Works Extracts': 'مستخلصات الأعمال',
    'R02 BOQ & Rates': 'مقايسة R02 وتحليل الأسعار',
    '51 Submittals': 'سجل الاعتمادات (51)',
    'POs & Custody': 'أوامر الشراء والعهدة',
    'Inspect Venture & Tasks': 'فحص المشروع والمهام',
    'Financial Oversight': 'الإشراف المالي والخزينة',
    'Treasury, Cards & 46 Projects': 'الخزينة والكروت ومصفوفة المشاريع',
    'Extracts, Ledger & PR': 'المستخلصات وكشف الحساب وأوامر الصرف',
    'Office Operations': 'مصاريف التشغيل والمكاتب',
    'Project Profitability': 'ربحية المشاريع والتدفقات',
    'Zoho Books Export': 'تصدير الحسابات Zoho Books',
    'Live GPS, Surprise Check & 21→20 Cycle': 'الـ GPS المباشر، التمام المفاجئ ودورة 21→20',
    'Weekly Roster': 'جدول الحضور الأسبوعي',
    'Leave Bank': 'رصيد وطلبات الإجازات',
    'Engineers & Subcontractors': 'المهندسون ومقاولو الباطن',
    '56 Subcontractors & ST/CPO': 'دليل 56 مقاول باطن والمستخلصات ST/CPO',
    'Internal Engineering Team': 'فريق المهندسين والمكتب الفني',
};

// Phrase-level replacements for Arabic -> English (applied when language === 'en')
const AR_PHRASES_TO_EN: Array<[RegExp, string]> = [
    [/حاصل جمع النقدية الفعلية بالخزن والبنوك/g, 'Sum of Actual Cash & Bank Balances'],
    [/الرصيد غير المستخدم بالكروت/g, 'Unused Credit Card Limit'],
    [/من إجمالي حدود ائتمانية/g, 'Out of total credit limits'],
    [/المستخدم حالياً:/g, 'Currently Used:'],
    [/مركز قيادة السيولة التنفيذية، الخزن والبنوك، حدود وأقساط الكروت الـ 7، ومراجعة E-Works/g, 'Executive Liquidity Command, Cash & Bank Vaults, Credit Card Limits & E-Works Audit'],
    [/مراقبة لحظية لإجمالي السيولة القابلة للصرف، أرصدة الـ 6 خزن وحسابات بنكية، حدود الـ 7 كروت ائتمانية، ومصفوفة ربحية الـ 46 مشروع نشط/g, 'Real-time monitoring of spendable liquidity, 7 cash & bank accounts, 9 corporate credit card limits, and 77 active project profitability matrix'],
    [/إجمالي السيولة المتاحة للصرف/g, 'Total Spendable Liquidity'],
    [/النقدية الفعلية بالخزن والبنوك/g, 'Actual Cash & Bank Balances'],
    [/الحد الائتماني المتاح بالكروت/g, 'Unused Credit Card Limits'],
    [/محفظة المشاريع النشطة/g, 'Active Projects Portfolio'],
    [/حسابات العملاء الفعالة/g, 'Active Client Accounts'],
    [/حسابات المقاولين والمصنعيات/g, 'Contractor Ledger Accounts'],
    [/خريطة الأعمال القياسية R02 وبناء المقايسة/g, 'Standard R02 Work Map & BOQ Builder'],
    [/خريطة الأعمال القياسية R02/g, 'Standard R02 Work Map'],
    [/تحليل أسعار البنود التفصيلي/g, 'Granular Unit Rate Breakdown Analyzer'],
    [/التكاليف غير المباشرة وتوزيعها النسبي على البنود/g, 'Site Overheads & Proportional Item Allocation'],
    [/الهوامش التجارية، معامل التضخم، والضرائب/g, 'Commercial Markups, Inflation & Taxes'],
    [/محاكي التفاوض والخصم التجاري مع العميل/g, 'Client Negotiation & Commercial Discount Simulator'],
    [/سجل الاعتمادات والاستلامات/g, 'Submittals & Site Inspections Register'],
    [/مولد الإيميلات الرسمية والترانسميتال/g, 'Formal Consultant Email & Transmittal Generator'],
    [/مولد تكويد الملفات والفولدرات القياسي/g, 'Standardized File & Folder Code Generator'],
    [/دليل الأكواد والـ 51 بند القياسي/g, '51 Submittal Clauses & Coding Reference'],
    [/أوامر الشراء المربوطة باعتمادات الخامات/g, 'Submittal-Gated Purchase Orders'],
    [/ماسح فواتير الواتساب والفواتير اليدوية للموانين/g, 'WhatsApp & Handwritten Supplier Bill OCR Scanner'],
    [/إدارة المخازن الأربعة والعهدة واستلام الموقع/g, '4-Warehouse Inventory & Site Custody Tracker'],
    [/مستخلصات الأعمال الجارية وكشف حساب العميل وطلبات الصرف/g, 'Cumulative Works Extracts, Client Ledger & Payment Requests'],
    [/دليل مقاولي الباطن والصنايعية/g, 'Subcontractors & Craftsmen Directory'],
    [/سجل مقاولي الباطن وتقييم الإدارة/g, 'Subcontractors Directory & CEO Rating Matrix'],
    [/مستخلصات مقاولي الباطن/g, 'Subcontractor Statements (ST)'],
    [/أوامر الدفع النقدي للمقاولين/g, 'Contractor Cash Payment Orders (CPO)'],
    [/تسويات العهد/g, 'Petty Cash Reconciliations (RCB)'],
    [/أين الموظفون الآن/g, 'Live Staff GPS Whereabouts'],
    [/مواقع المشروعات GPS/g, 'Project Sites GPS Geofencing'],
    [/تمام حالي مفاجئ/g, 'Surprise GPS Roll Call'],
    [/شيت الحضور والبصمة الشهري/g, 'Monthly Biometric & GPS Attendance Sheet'],
    [/طلبات الإجازات والسلف والعهد والقرارات الإدارية/g, 'Leave Requests, Salary Advances, Custody & Directives'],
    [/مصنعيات فقط/g, 'Labor Only'],
    [/توريد وتركيب/g, 'Supply & Install'],
    [/قيد التنفيذ/g, 'Active Execution'],
    [/غير معتمد/g, 'Unapproved Draft'],
    [/معتمد بملاحظات/g, 'Approved as Noted'],
    [/معتمد بدون ملاحظات/g, 'Approved'],
    [/يعاد التقديم/g, 'Revise & Resubmit'],
    [/مرفوض/g, 'Rejected'],
    [/قيد المراجعة/g, 'Under Review'],
    [/مطلوب تقديمه/g, 'Pending Submission'],
    [/مقر الشركة بالنزهة/g, 'Nozha HQ Office'],
    [/مخزن الدائري 1/g, 'Ring Road Warehouse 1'],
    [/مخزن الدائري 2/g, 'Ring Road Warehouse 2'],
    [/مشروع C096 أزاد التجمع الخامس/g, 'Project C096 Azad 5th Settlement'],
    [/مشروع C096 أزاد/g, 'Project C096 Azad'],
    [/مشروع C063 مدينتي/g, 'Project C063 Madinaty'],
    [/مشروع C091 ماونتن فيو/g, 'Project C091 Mountain View'],
    [/المكتب — Nexus/g, 'Nexus HQ Office'],
    [/خريطة الدخول/g, '(Entry Map)'],
    [/خريطة الخروج/g, '(Exit Map)'],
    [/فتح الخريطة/g, 'Open GPS Map'],
    [/مفيش تحصيل/g, 'No collection yet'],
    [/مقاول باطن عام/g, 'General Subcontractor'],
    [/أعمال الألومنيوم والـ UPVC/g, 'Aluminum & UPVC Works'],
    [/نجارة أسطرجي وتشطيب أثاث/g, 'Wood Finishing & Joinery'],
    [/أعمال النجارة والباب والشباك/g, 'Carpentry, Doors & Windows'],
    [/أعمال الكهرباء والتيار الخفيف/g, 'Electrical & Low Current'],
    [/توريد وتركيب مصاعد/g, 'Elevators Supply & Install'],
    [/أعمال الحدادة والكريتال/g, 'Steel & Wrought Iron'],
    [/أعمال الزجاج والمرايات والشاور/g, 'Tempered Glass & Shower Cabins'],
    [/أعمال الجبس بورد والأسقف المعلقة/g, 'Gypsum Board & Ceilings'],
    [/أعمال التكييف والتهوية/g, 'HVAC & Ventilation'],
    [/أعمال العزل المائي والحراري/g, 'Waterproofing & Insulation'],
    [/أعمال اللاندسكيب والزراعة/g, 'Landscaping & Hardscape'],
    [/أعمال الرخام والجرانيت/g, 'Marble & Granite'],
    [/أعمال المباني والمحارة/g, 'Masonry & Plastering'],
    [/أعمال الدهانات والنقاشة/g, 'Painting & Finishes'],
    [/أعمال الباركيه والأرضيات الخشبية/g, 'Parquet & HDF Flooring'],
    [/أعمال السباكة والصحي/g, 'Plumbing & Sanitary'],
    [/أعمال السيراميك والبورسلين/g, 'Ceramics & Porcelain Tiling'],
    [/دهانات ونقاشة/g, 'Painting & Finishes'],
    [/باركيه/g, 'Parquet Flooring'],
    [/ألوميتال وزجاج/g, 'Aluminum & Glass'],
    [/جبس بورد وأسقف/g, 'Gypsum & Ceilings'],
    [/سيراميك وبورسلين/g, 'Ceramics & Porcelain'],
    [/سباكة وصحي/g, 'Plumbing & Sanitary'],
    [/كهرباء وتيار خفيف/g, 'Electrical & Low Current'],
    [/تكييف وتبريد/g, 'HVAC & Cooling'],
    [/نقاشة ودهانات/g, 'Painting & Finishes'],
    [/رخام وجرانيت/g, 'Marble & Granite'],
    [/نجارة وأبواب/g, 'Carpentry & Doors'],
    [/حدادة وكريتال/g, 'Steel & Wrought Iron'],
    [/محارة ومباني/g, 'Plastering & Masonry'],
    [/عزل مائي وحراري/g, 'Water & Thermal Insulation'],
    [/تدفئة مركزية/g, 'Central Heating'],
    [/داخل النطاق الجغرافي/g, 'Inside Geofence'],
    [/داخل النطاق/g, 'Inside Geofence'],
    [/مأمورية خارجية/g, 'Field Transit'],
    [/تأخير \/ لم يسجل/g, 'Late / Unregistered'],
    [/تأخير \/ خارج النطاق/g, 'Outside Geofence'],
    [/سجل حضور Nexus اليومي/g, 'Nexus Daily Attendance Log'],
    [/حاضر بالموقع/g, 'Present on Site'],
    [/غائب اليوم/g, 'Absent Today'],
    [/آخر ظهور GPS/g, 'Last GPS Ping'],
    [/مطابق لسجل البصمة/g, 'Verified Biometric Log'],
    [/مسجل في قاعدة بيانات مقاولي الباطن/g, 'Registered in Subcontractors Database'],
    [/ج\.م/g, 'EGP'],
];

/**
 * Normalizes any UI or data text string for the active language ('en' LTR or 'ar' RTL)
 * so that mixed "Arabic (English)" or "English (Arabic)" strings never split parentheses
 * or render in the wrong language direction.
 */
export function normalizeBilingualString(raw: string, lang: 'en' | 'ar'): string {
    if (!raw) return raw;
    const trimmed = raw.trim();
    if (!trimmed) return raw;

    const leadingSpace = raw.match(/^\s*/)?.[0] || '';
    const trailingSpace = raw.match(/\s*$/)?.[0] || '';

    if (lang === 'en') {
        // 1. Exact dictionary match
        if (AR_TO_EN_EXACT[trimmed]) {
            return leadingSpace + AR_TO_EN_EXACT[trimmed] + trailingSpace;
        }

        // 2. If no Arabic characters exist at all, keep as-is
        if (!AR_CHAR_RE.test(trimmed)) {
            return raw;
        }

        // 3. Handle "CODE — Arabic (English)" e.g. "12010101 — الخزينة الرئيسية (Main cash vault)"
        const codeArEnMatch = trimmed.match(/^([0-9A-Z\-_#]+)\s*[—\-·]\s*[^()]*[\u0600-\u06FF][^()]*\(\s*([A-Za-z0-9][^()]+)\s*\)$/);
        if (codeArEnMatch) {
            return `${leadingSpace}${codeArEnMatch[1]} — ${codeArEnMatch[2].trim()}${trailingSpace}`;
        }

        // 4. Handle "English Name — Arabic Name (Code)" e.g. "Pierre Afifi — بيير صفوت عفيفي (1001)"
        const enArCodeMatch = trimmed.match(/^([A-Za-z][A-Za-z\s.&'-]+)\s*[—\-·]\s*[\u0600-\u06FF][^()]*(\(\d+\))?$/);
        if (enArCodeMatch) {
            const suffix = enArCodeMatch[2] ? ` ${enArCodeMatch[2]}` : '';
            return `${leadingSpace}${enArCodeMatch[1].trim()}${suffix}${trailingSpace}`;
        }

        // 5. Handle "Arabic (English)" where English has real words
        const arThenEnParen = trimmed.match(/^(?:(\d+\.\s*))?([^()]*[\u0600-\u06FF][^()]*)\(\s*([^()]*[A-Za-z]{3,}[^()]*)\s*\)$/);
        if (arThenEnParen && !AR_CHAR_RE.test(arThenEnParen[3])) {
            const prefixNum = arThenEnParen[1] || '';
            return `${leadingSpace}${prefixNum}${arThenEnParen[3].trim()}${trailingSpace}`;
        }

        // 6. Handle "English (Arabic)" where outer is English and inner is Arabic
        const enThenArParen = trimmed.match(/^([^()]*[A-Za-z]{2,}[^()]*)\(\s*([^()]*[\u0600-\u06FF][^()]*)\s*\)(.*)$/);
        if (enThenArParen && !AR_CHAR_RE.test(enThenArParen[1])) {
            const rest = enThenArParen[3] && !AR_CHAR_RE.test(enThenArParen[3]) ? enThenArParen[3] : '';
            return `${leadingSpace}${enThenArParen[1].trim()}${rest}${trailingSpace}`;
        }

        // 7. Handle "English — Arabic" or "Arabic — English"
        if (trimmed.includes('—') || trimmed.includes('•') || trimmed.includes('·')) {
            const parts = trimmed.split(/\s*[—•·]\s*/);
            const enParts = parts.filter(p => EN_WORD_RE.test(p) && !AR_CHAR_RE.test(p));
            if (enParts.length > 0 && enParts.length < parts.length) {
                return `${leadingSpace}${enParts.join(' · ')}${trailingSpace}`;
            }
        }

        // 8. Apply phrase-level replacements
        let updated = trimmed;
        for (const [regex, replacement] of AR_PHRASES_TO_EN) {
            updated = updated.replace(regex, replacement);
        }

        // Strip leftover Arabic parentheticals if English exists outside
        if (EN_WORD_RE.test(updated) && AR_CHAR_RE.test(updated)) {
            updated = updated.replace(/\(\s*[^()]*[\u0600-\u06FF][^()]*\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
        }

        return leadingSpace + updated + trailingSpace;
    } else {
        // lang === 'ar' (RTL mode)
        // 1. Exact English -> Arabic dictionary match
        if (EN_TO_AR_EXACT[trimmed]) {
            return leadingSpace + EN_TO_AR_EXACT[trimmed] + trailingSpace;
        }

        // 2. Handle "English Name — Arabic Name (Code)" -> keep Arabic Name (Code)
        const enArCodeMatch = trimmed.match(/^([A-Za-z][A-Za-z\s.&'-]+)\s*[—\-·]\s*([\u0600-\u06FF].*)$/);
        if (enArCodeMatch) {
            return `${leadingSpace}${enArCodeMatch[2].trim()}${trailingSpace}`;
        }

        // 3. Handle "Arabic (Long English Translation)" -> strip long English parentheticals that split across lines in RTL,
        //    but keep short codes like (NPO), (ST), (RCB), (CPO), (SIR), (1001), (C096) isolated with LRI/PDI!
        const arWithEnParen = trimmed.match(/^([^()]*[\u0600-\u06FF][^()]*)\(\s*([A-Za-z0-9\s/_&-]+)\s*\)$/);
        if (arWithEnParen) {
            const arPart = arWithEnParen[1].trim();
            const enPart = arWithEnParen[2].trim();
            if (enPart.length <= 10) {
                return `${leadingSpace}${arPart} (\u2066${enPart}\u2069)${trailingSpace}`;
            }
            return `${leadingSpace}${arPart}${trailingSpace}`;
        }

        // 4. Handle "English (Arabic)" -> return Arabic part!
        const enWithArParen = trimmed.match(/^([^()]*[A-Za-z]{2,}[^()]*)\(\s*([^()]*[\u0600-\u06FF][^()]*)\s*\)$/);
        if (enWithArParen && !AR_CHAR_RE.test(enWithArParen[1])) {
            return `${leadingSpace}${enWithArParen[2].trim()}${trailingSpace}`;
        }

        return raw;
    }
}
