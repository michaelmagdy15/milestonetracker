# NEXUS CONTRACTING ERP — Master Platform Architecture & Migration Documentation (`master.md`)

**Live Production URL:** [`https://milestonetracker.web.app`](https://milestonetracker.web.app)  
**Repository:** `DEC-MILESTONE-TRACKER` (`main` branch)  
**Brand Identity:** Official **NEXUS CONTRACTING** Brand Guideline (`Pages 1–15`)

---

## 1. Brand Identity, Vector Logo & Glassmorphic Light Design System

### 1.1 Pure Native Vector Logo Extraction (`public/nexus-logo.svg` & `public/nexus-symbol.svg`)
- Extracted the **100% unmodified internal vector `<path>` geometry** directly from **Page 2 and Page 3** of the official **NEXUS CONTRACTING Brand Guideline PDF** using PyMuPDF (`page.get_svg_image()`):
  - **Symbol (`D16`, `D17`, `D18`):** 3 converging/diverging geometric elements with their exact native Bezier curves (`#e04b2a` Nexus Orange), preserving the wider top-left/middle openings and the rotated converging right gap with zero raster noise, zero white halo, and zero border artifacts.
  - **Wordmark (`D0`–`D4` & `D5`–`D15`):** Exact native vector letterforms for **`NEXUS`** (`Alte Haas Grotesk`) and **`CONTRACTING`** (`Aventa`) in `#192631` Squid Ink.
- Exported to:
  - [`public/nexus-logo.svg`](public/nexus-logo.svg) & [`public/nexus-symbol.svg`](public/nexus-symbol.svg) (used by [`src/components/Logo.tsx`](src/components/Logo.tsx))
  - [`public/nexus-logo.png`](public/nexus-logo.png), [`public/nexus-symbol.png`](public/nexus-symbol.png), and [`src/assets/logo.png`](src/assets/logo.png) (lossless high-DPI RGBA renders directly from the pure vector paths).

### 1.2 Official Color Palette & Light Glassmorphic UI (`src/index.css`)
- **Primary Palette:**
  - **Squid Ink:** `#192631` (`RGB: 25, 38, 49`) — Primary headings, ink typography, structural borders.
  - **Nexus Orange:** `#e04b2a` (`RGB: 224, 75, 42`) — Brand symbol, primary CTAs, active navigation indicators.
- **Secondary Palette:**
  - **Phthalo Green:** `#123524` (`RGB: 18, 53, 36`) — Approved/verified badges, positive financial metrics.
  - **Coral:** `#ff7f50` (`RGB: 255, 127, 80`) — Secondary highlights and gradients.
- **Monochrome & Surfaces:**
  - **Light Gray Canvas:** `#f5f5f5` (`RGB: 245, 245, 245`) with subtle architectural blueprint dot grid (`24px × 24px`).
  - **Frosted Glassmorphic Cards:** `rgba(255, 255, 255, 0.78)` with `backdrop-filter: blur(22px) saturate(160%)` and `1px solid rgba(25, 38, 49, 0.09)` borders.

---

## 2. Unified Sidebar Architecture & Native Module Integration

Instead of isolating ERP features inside a single tab, all 15 modules are integrated as first-class routes in [`src/App.tsx`](src/App.tsx) and [`src/components/Layout.tsx`](src/components/Layout.tsx):

| Section | Route | Module Name | Live Badge | Core Component |
| :--- | :--- | :--- | :--- | :--- |
| **Overview & Projects** | `/` | **Dashboard** | — | [`src/pages/Dashboard.tsx`](src/pages/Dashboard.tsx) |
| | `/projects` | **Projects** | `77` | [`src/pages/Projects.tsx`](src/pages/Projects.tsx) |
| | `/meetings` | **Meetings** | — | [`src/pages/Meetings.tsx`](src/pages/Meetings.tsx) |
| | `/entries` | **Daily Entries** | — | [`src/pages/Entries.tsx`](src/pages/Entries.tsx) |
| **Engineering & Technical** | `/boq` | **BOQ & R02 Pricing** | `839` | [`src/pages/BOQViewer.tsx`](src/pages/BOQViewer.tsx) + [`src/components/nexus/PricingEngineHub.tsx`](src/components/nexus/PricingEngineHub.tsx) |
| | `/submittals` | **Submittals & Coding** | `51` | [`src/components/nexus/DocumentControlHub.tsx`](src/components/nexus/DocumentControlHub.tsx) |
| | `/variations-rfis` | **Variations & RFIs** | — | [`src/components/nexus/VariationsRfisHub.tsx`](src/components/nexus/VariationsRfisHub.tsx) |
| | `/emails` | **Emails & Transmittals** | — | [`src/pages/Emails.tsx`](src/pages/Emails.tsx) |
| **Procurement & Field** | `/procurement` | **Procurement & Stores** | `4` | [`src/components/nexus/ProcurementWarehouseHub.tsx`](src/components/nexus/ProcurementWarehouseHub.tsx) |
| | `/subcontractors` | **Subcontractors** | `56` | [`src/components/nexus/SubcontractorsDirectoryHub.tsx`](src/components/nexus/SubcontractorsDirectoryHub.tsx) |
| | `/engineers` | **Engineers & Team** | `16` | [`src/pages/Engineers.tsx`](src/pages/Engineers.tsx) |
| | `/attendance` | **Attendance & GPS** | `21→20` | [`src/pages/Attendance.tsx`](src/pages/Attendance.tsx) + [`src/components/nexus/HrWhereaboutsHub.tsx`](src/components/nexus/HrWhereaboutsHub.tsx) |
| **Finance & System** | `/extracts` | **Extracts & Ledger** | `80` | [`src/components/nexus/ExtractsStatementsHub.tsx`](src/components/nexus/ExtractsStatementsHub.tsx) |
| | `/financials` | **Financials & Treasury** | `16` | [`src/pages/Financials.tsx`](src/pages/Financials.tsx) + [`src/components/nexus/TreasuryCashBankHub.tsx`](src/components/nexus/TreasuryCashBankHub.tsx) |
| | `/reports` | **Reports** | — | [`src/pages/Reports.tsx`](src/pages/Reports.tsx) |
| | `/settings` | **White-Label Studio** | — | [`src/pages/WhiteLabelStudio.tsx`](src/pages/WhiteLabelStudio.tsx) |
| | `/help` | **Help Guide** | — | [`src/pages/HelpGuide.tsx`](src/pages/HelpGuide.tsx) |

---

## 3. 100% Actpert Nexus ERP Data Migration (`https://nexus.actpert.com/`)

All live production data extracted via REA from Actpert Nexus ERP and the uploaded project documents is stored in [`src/data/nexusLiveSeedData.ts`](src/data/nexusLiveSeedData.ts), [`src/data/nexusR02Data.ts`](src/data/nexusR02Data.ts), and [`src/data/nexusCodingData.ts`](src/data/nexusCodingData.ts):

1. **77 Unique Real Projects (`NEXUS_LIVE_PROJECTS`):**
   - **46 Active Execution Projects** + **31 Historical / E-Works Projects** (`C002` through `C103`, `MC005`, `N001` through `N027`).
   - Total Revenue: `26,955,588 EGP` | Direct Costs: `23,319,656 EGP` | Gross Profit: `3,635,932 EGP`.
2. **80 Client & Project Ledger Accounts (`NEXUS_CLIENT_ACCOUNTS_LEDGER`):**
   - Account Codes `101020001` through `101020080` (`38,283,167.23 EGP` Total Debit / `37,062,649.38 EGP` Total Credit).
3. **Exact C096 Uploaded PDFs (`Michael & Mona - Azad 5th Settlement`, Contract `000055`):**
   - **PDF 1 (`Works Extract 4` — `13-10-2026`):** All 28 line items across 13 divisions + VOs + POs (`Total Actual Work: 1,042,730 EGP`, `Purchasing Orders: 47,079 EGP`, `Total Work Achieved: 909,969 EGP`, `Previous Payments: 745,073 EGP`, `Net Payable: 164,896 EGP`).
   - **PDF 2 (`Client Account Statement` — Account `101020069`):** All 10 ledger transactions (`Total Debit: 957,048.10 EGP`, `Total Credit: 850,000.00 EGP`, `Final Balance: 107,048.10 EGP`).
   - **PDF 3 (`Payment Request` — Serial `4`, `12 October 2026`):** `150,000.00 EGP` Bank Transfer to `Debit حساب افراد NBE`.
4. **34 R02 Work Packages & 839 Standard BOQ Sub-Items (`NEXUS_R02_WORK_PACKAGES`):**
   - Complete R02 library (`M` Material, `L` Labor, `S` Supply & Install) + Eng. Pierre Afifi's **11-Component Unit Rate Breakdown Analyzer** (Porcelain 60×120cm, Knauf Gypsum Board, Internal Plastering, Concealed Cisterns), proportional site overheads distribution, inflation & risk markups, and traffic-light client discount negotiation simulator.
5. **51 Submittal Clauses & File Coding Engine (`NEXUS_CODING_DATA`):**
   - **28 Architectural (`AR`)**, **8 Civil (`CV`)**, **7 Electrical (`EL`)**, and **8 Mechanical (`MC`)** clauses (`MS`, `DR`, `MIR`, `SL`, `SIR`) + standardized document naming generator (`TDC`, `DC`, `TC`, `NPO`, `RCB`, `POP`, `CPO`, `ST`, `INV`).
6. **Submittal-Gated Procurement, OCR Bill Scanner & 4 Warehouses (`ProcurementWarehouseHub.tsx`):**
   - Strict gatekeeper blocking `NPO` creation unless Material Submittal is approved (`Code A` or `Code B`).
   - Handwritten / WhatsApp `Mawan` bill OCR scanner with optional `14% VAT` toggle and lump-sum/percentage discount.
   - Accounting (`Merna Maged` `PR` ➔ `POP`) & Fleet Logistics (`Milad Haroun` Company Vehicle / Uber Bike / Heavy Truck) across **4 Warehouses** (`Ring Road 1`, `Ring Road 2`, `Nozha HQ Valuable Custody`, `Project Site Custody`).
7. **56 Registered Subcontractors & 63 Contractor Ledger Accounts (`NEXUS_SUBCONTRACTORS` & `NEXUS_CONTRACTOR_ACCOUNTS`):**
   - Full trades directory (`SUB-ALUM` to `SUB-HEAT`), CEO 4-pillar `A/B/C` evaluation matrix (Quality, Pricing, Schedule, Site Ethics), Subcontractor Statements (`ST` with 5% retention), and Cash Payment Orders (`CPO`).
8. **16 Real Actpert Staff, GPS Geofencing & `21→20` Payroll Cycle (`NEXUS_HR_STAFF`):**
   - Employee IDs `1001` (`Pierre Afifi`) through `1030` (`Mina Fahim`), live GPS site check-ins, Surprise GPS Roll Call (`/hr/surprise-check`), and `21st → 20th` monthly payroll cycle.
9. **Treasury Cash/Bank Vaults (7 Accounts) & Corporate Credit Cards (9 Cards):**
   - **Total Spendable Liquidity:** `738,284.19 EGP` (`254,833.88 EGP` Cash & Banks + `483,450.31 EGP` Unused Credit Card Limits out of `1,169,000.00 EGP` total card limits).

---

## 4. Bidirectional Language Engine (`EN — LTR` & `العربية — RTL`)

- Implemented in [`src/context/LanguageContext.tsx`](src/context/LanguageContext.tsx), [`src/utils/bilingualEngine.ts`](src/utils/bilingualEngine.ts), and [`src/index.css`](src/index.css).
- One-click header toggle switches the entire document between **English (`dir="ltr"`)** and **Arabic (`dir="rtl"`)**:
  - Automatically docks the sidebar on the left (`LTR`) or right (`RTL`).
  - Translates navigation labels, page titles, hub headers, table columns, status badges, and action buttons into pure English (`LTR`) or pure Arabic (`RTL`), eliminating broken BiDi parentheses.
  - Isolates numeric badges, project codes, and currency figures with `unicode-bidi: isolate` and `dir="ltr"`.

---

## 5. Installed Engineering & Product Skill Packs

The following skill ecosystems have been installed into both `C:\Users\Mi5a\.gemini\config\skills` and `.agent/skills`:

1. **`JuliusBrussee/caveman`** (`caveman`, `caveman-commit`, `caveman-compress`, `caveman-discover`, `caveman-evidence-review`, `caveman-explore`, `caveman-review`, etc.)
2. **`obra/superpowers`** (`brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `subagent-driven-development`, `dispatching-parallel-agents`, etc.)
3. **`mksglu/context-mode`** (`context-mode`, `ctx-doctor`, `ctx-index`, `ctx-insight`, `ctx-purge`, `ctx-search`, `ctx-stats`, `ctx-upgrade`)
4. **`xerj-org/xerj`** (`xerj-code`, `architect-review`, `security-auditor`, `vibe-code-auditor`, etc.)
5. **`garrytan/gstack` (58 skills):**
   - `gstack`, `autoplan`, `benchmark`, `benchmark-models`, `browse`, `canary`, `careful`, `codex`, `connect-chrome`, `context-restore`, `context-save`, `cso`, `design-consultation`, `design-html`, `design-review`, `design-shotgun`, `deslop-shared-libs`, `devex-review`, `diagram`, `document-generate`, `document-release`, `eval-plan`, `freeze`, `gstack-upgrade`, `guard`, `health`, `investigate`, `ios-clean`, `ios-design-review`, `ios-fix`, `ios-qa`, `ios-sync`, `land-and-deploy`, `landing-report`, `gstack-learn`, `make-pdf`, `office-hours`, `open-gstack-browser`, `pair-agent`, `plan-ceo-review`, `plan-design-review`, `plan-devex-review`, `plan-eng-review`, `plan-tune`, `qa`, `qa-only`, `retro`, `gstack-review`, `scrape`, `setup-browser-cookies`, `setup-deploy`, `setup-gbrain`, `gstack-ship`, `skillify`, `spec`, `sync-gbrain`, `test-audit`, `unfreeze`.

---

## 6. Guided Step-by-Step UX & Lifecycle Workflow Architecture (`/plan-ceo-review`)

Implemented across 12 modules via 10 parallel agents to eliminate feature overload and guide every user step-by-step:

1. **Global Active Project & Guided Mode Context ([`src/context/WorkflowContext.tsx`](src/context/WorkflowContext.tsx)):**
   - Persists `activeProjectCode` (`C096`, `C063`, `C091`, etc., or `ALL`), `viewComplexity` (`'guided'` vs `'full'`), and `activePersona` (`'ceo'`, `'technical'`, `'accounting'`, `'logistics'`).
2. **Top Bar Active Project Switcher, Persistent 6-Step Lifecycle Bar & Collapsible Sidebar ([`src/components/Layout.tsx`](src/components/Layout.tsx)):**
   - **📌 Active Project Pill:** Pin any of the 77 Actpert projects in the header so all screens stay focused on that project.
   - **⚡ Guided Mode vs. Full ERP Toggle:** Guided Mode highlights the 6 core numbered stages in the sidebar and groups the 9 secondary utilities into a clean *"More Tools & Admin (9)"* accordion.
   - **Persistent 6-Step Contracting Lifecycle Strip:** Always shows where you are in the project journey (`① BOQ & Pricing` ➔ `② Submittals & Approvals` ➔ `③ Buy & Warehouses` ➔ `④ Site & Subcontractors` ➔ `⑤ Client Extracts & Ledger` ➔ `⑥ Treasury & Cashflow`) with 1-click stage jumping and a **"Next Stage ➔"** button.
3. **"Start Here: Your 3 Simple Steps Today" Role Command Center ([`src/pages/Dashboard.tsx`](src/pages/Dashboard.tsx)):**
   - Tailored 3-step daily action cards for **CEO (`Eng. Mohamed`)**, **Technical Office (`Eng. Pierre Afifi`)**, **Accounting (`Merna Maged`)**, and **Logistics (`Milad Haroun`)**, plus an interactive **Active Project 6-Stage Progress Map**.
4. **Numbered Step-by-Step Wizards Inside All 6 ERP Hubs ([`src/components/nexus/GuidedStepBanner.tsx`](src/components/nexus/GuidedStepBanner.tsx)):**
   - Integrated into [`PricingEngineHub.tsx`](src/components/nexus/PricingEngineHub.tsx) (Stage 1), [`DocumentControlHub.tsx`](src/components/nexus/DocumentControlHub.tsx) (Stage 2), [`ProcurementWarehouseHub.tsx`](src/components/nexus/ProcurementWarehouseHub.tsx) (Stage 3), [`SubcontractorsDirectoryHub.tsx`](src/components/nexus/SubcontractorsDirectoryHub.tsx) (Stage 4), [`ExtractsStatementsHub.tsx`](src/components/nexus/ExtractsStatementsHub.tsx) (Stage 5), and [`TreasuryCashBankHub.tsx`](src/components/nexus/TreasuryCashBankHub.tsx) (Stage 6), plus project pinning in [`Projects.tsx`](src/pages/Projects.tsx) and the interactive 6-step playbook in [`HelpGuide.tsx`](src/pages/HelpGuide.tsx).
