import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Radar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Navigation,
  BatteryCharging,
  Smartphone,
  Camera,
  Send,
  CalendarRange,
  FileText,
  Wallet,
  Scale,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Truck,
  Warehouse,
  Check,
  X,
  Eye,
  BellRing,
  Timer,
  SlidersHorizontal,
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SubTabId = 'whereabouts' | 'surprise-check' | 'payroll-cycle' | 'staff-requests';

type GeofenceStatus = 'within_geofence' | 'fleet_route' | 'late_unregistered';

interface StaffWhereabouts {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  assignedZone: string;
  currentGpsLabel: string;
  coordinates: { lat: number; lng: number };
  distanceFromCenterMeters: number;
  allowedRadiusMeters: number;
  geofenceStatus: GeofenceStatus;
  checkInTime: string;
  lastPingTime: string;
  batteryLevel: number;
  deviceModel: string;
  activeTask: string;
  rcbCustodyCode?: string;
}

interface ProjectSiteGeofence {
  id: string;
  siteCode: string;
  siteName: string;
  category: 'HQ' | 'Project Site' | 'Warehouse';
  latitude: number;
  longitude: number;
  allowedRadiusMeters: 150 | 200 | 250;
  assignedEngineers: string[];
  activeHeadcount: number;
  strictPhotoRequired: boolean;
  status: 'Active' | 'Standby';
}

interface SurpriseRollCallLog {
  id: string;
  batchCode: string;
  triggeredAt: string;
  triggeredBy: string;
  targetScope: string;
  employeeName: string;
  employeeRole: string;
  siteZone: string;
  responseTimeMinutes: number | null;
  gpsAccuracyMeters: number | null;
  livePhotoVerified: boolean;
  status: 'Verified' | 'Late Response' | 'Missed - Auto Penalty';
  penaltyApplied: string;
}

interface PayrollCycleRecord {
  id: string;
  empCode: string;
  name: string;
  role: string;
  primarySite: string;
  baseSalaryEgp: number;
  cycleWorkingDays: number;
  presentDays: number;
  siteOvertimeHours: number;
  overtimeValueEgp: number;
  lateMinutesTotal: number;
  lateDeductionEgp: number;
  approvedLeaveDays: number;
  pettyCashAndAdvanceDeductionEgp: number;
  rcbSettlementStatus: string;
  bonusesEgp: number;
  penaltiesEgp: number;
  readinessStatus: 'Ready for Disbursement' | 'Pending RCB Clearance' | 'HR Review';
}

type RequestCategory = 'leave' | 'advance' | 'petty_cash' | 'directive';

interface StaffRequestItem {
  id: string;
  reqCode: string;
  employeeName: string;
  employeeRole: string;
  category: RequestCategory;
  categoryLabelAr: string;
  title: string;
  details: string;
  dateSubmitted: string;
  amountEgp?: number;
  rcbCode?: string;
  leaveDays?: number;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Enforced';
  approverNote: string;
}

// ============================================================================
// INITIAL REALISTIC Nexus DATA (16 STAFF, SITES, LOGS, 21->20 CYCLE)
// ============================================================================

const INITIAL_STAFF_WHEREABOUTS: StaffWhereabouts[] = [
  {
    "id": "STF-01",
    "code": "1001",
    "name": "Pierre Afifi — بيير صفوت (1001)",
    "role": "Technical Office & Operations Lead (Technical Office & Controls)",
    "department": "Technical Office & Controls",
    "assignedZone": "مشروع C096 أزاد التجمع الخامس",
    "currentGpsLabel": "NXTP — Maadi Bathroom Repairs (26Q0006) (حاضر)",
    "coordinates": {
      "lat": 29.9602,
      "lng": 31.2569
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "10:23",
    "lastPingTime": "مفتوح 9.49 س (أول→آخر)",
    "batteryLevel": 87,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1001"
  },
  {
    "id": "STF-02",
    "code": "1002",
    "name": "Mina Gerges Shawky — مينا جرجس (1002)",
    "role": "Senior Site Execution Engineer (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مشروع C096 أزاد التجمع الخامس",
    "currentGpsLabel": "NXTP — Maadi Bathroom Repairs (26Q0006) (حاضر)",
    "coordinates": {
      "lat": 29.9602,
      "lng": 31.2569
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "10:28",
    "lastPingTime": "مفتوح 9.39 س (أول→آخر)",
    "batteryLevel": 86,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1002"
  },
  {
    "id": "STF-03",
    "code": "1003",
    "name": "Saiid Awad — سعيد عوض (1003)",
    "role": "Site Execution Supervisor (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (آخر ظهور GPS)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 85,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1003"
  },
  {
    "id": "STF-04",
    "code": "1005",
    "name": "Susanna Michael Abelmassih — سوسنة ميخائيل (1005)",
    "role": "Operations & Project Coordinator (Operation)",
    "department": "Executive Management",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (حاضر)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "09:24",
    "lastPingTime": "مفتوح 10.47 س (أول→آخر)",
    "batteryLevel": 84,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1005"
  },
  {
    "id": "STF-05",
    "code": "1006",
    "name": "Mario Gerges — ماريو جرجس (1006)",
    "role": "Site Execution Engineer (Mokattam) (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مشروع C063 مدينتي",
    "currentGpsLabel": "Abd El-hay — Mokattam (آخر ظهور GPS)",
    "coordinates": {
      "lat": 30.0119,
      "lng": 31.3055
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 83,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1006"
  },
  {
    "id": "STF-06",
    "code": "1007",
    "name": "Ezzat Masoud — عزت مسعود (1007)",
    "role": "Site Supervisor (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (آخر ظهور GPS)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 82,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1007"
  },
  {
    "id": "STF-07",
    "code": "1009",
    "name": "Merna Maged Samwel — ميرنا ماجد (1009)",
    "role": "Finance & HR Manager (Finance & HR)",
    "department": "Finance & Procurement",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (حاضر)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "08:59",
    "lastPingTime": "17:21 8.36 س (أول→آخر)",
    "batteryLevel": 81,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1009"
  },
  {
    "id": "STF-08",
    "code": "1014",
    "name": "Shery Gerges — شيرى جرجس (1014)",
    "role": "Technical Office Engineer (Technical office)",
    "department": "Technical Office & Controls",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (حاضر)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "09:11",
    "lastPingTime": "17:03 7.87 س (أول→آخر)",
    "batteryLevel": 80,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1014"
  },
  {
    "id": "STF-09",
    "code": "1016",
    "name": "Milad Haron — ميلاد هارون (1016)",
    "role": "Logistics, Fleet & Purchasing Officer (Logistics & Warehouses)",
    "department": "Logistics & Warehouses",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (آخر ظهور GPS)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 79,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1016"
  },
  {
    "id": "STF-10",
    "code": "1019",
    "name": "Reda Abdellatif Mahmoud — رضا عبداللطيف محمود (1019)",
    "role": "Site Execution Engineer (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مشروع C096 أزاد التجمع الخامس",
    "currentGpsLabel": "NXTP — Maadi Bathroom Repairs (26Q0006) (حاضر)",
    "coordinates": {
      "lat": 29.9602,
      "lng": 31.2569
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "08:49",
    "lastPingTime": "مفتوح 11.05 س (أول→آخر)",
    "batteryLevel": 78,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1019"
  },
  {
    "id": "STF-11",
    "code": "1022",
    "name": "Lama Mohamed — لمى محمد (1022)",
    "role": "Technical Office Architect (Technical office)",
    "department": "Technical Office & Controls",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (آخر ظهور GPS)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 77,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1022"
  },
  {
    "id": "STF-12",
    "code": "1023",
    "name": "Mohamed Islam — محمد إسلام (1023)",
    "role": "Site Execution Engineer (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مشروع C096 أزاد التجمع الخامس",
    "currentGpsLabel": "NXTP — Maadi Bathroom Repairs (26Q0006) (آخر ظهور GPS)",
    "coordinates": {
      "lat": 29.9602,
      "lng": 31.2569
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 76,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1023"
  },
  {
    "id": "STF-13",
    "code": "1026",
    "name": "Eid Gries — عيد جريس (1026)",
    "role": "Field Operations Specialist (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مشروع C096 أزاد التجمع الخامس",
    "currentGpsLabel": "NXTP — Maadi Bathroom Repairs (26Q0006) (حاضر)",
    "coordinates": {
      "lat": 29.9602,
      "lng": 31.2569
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "09:27",
    "lastPingTime": "15:39 6.2 س (أول→آخر)",
    "batteryLevel": 75,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1026"
  },
  {
    "id": "STF-14",
    "code": "1027",
    "name": "Joshua Gomma — جوشوا جمعة (1027)",
    "role": "HQ Operations & Controls (Technical Office & Controls)",
    "department": "Technical Office & Controls",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (حاضر)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "09:12",
    "lastPingTime": "مفتوح 10.67 س (أول→آخر)",
    "batteryLevel": 74,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1027"
  },
  {
    "id": "STF-15",
    "code": "1028",
    "name": "Ahmed Abdel Mohsan — أحمد عبدالمحسن (1028)",
    "role": "Site Execution Engineer (Site Execution)",
    "department": "Site Execution",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (آخر ظهور GPS)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 240,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "late_unregistered",
    "checkInTime": "—",
    "lastPingTime": "—",
    "batteryLevel": 73,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (غائب اليوم)",
    "rcbCustodyCode": "RCB-1028"
  },
  {
    "id": "STF-16",
    "code": "1030",
    "name": "Mina Fahim — مينا عاطف فهيم (1030)",
    "role": "Technical Office QS Engineer (Technical office)",
    "department": "Technical Office & Controls",
    "assignedZone": "مقر الشركة بالنزهة",
    "currentGpsLabel": "المكتب — Nexus (حاضر)",
    "coordinates": {
      "lat": 30.1124,
      "lng": 31.3439
    },
    "distanceFromCenterMeters": 15,
    "allowedRadiusMeters": 150,
    "geofenceStatus": "within_geofence",
    "checkInTime": "09:02",
    "lastPingTime": "مفتوح 10.84 س (أول→آخر)",
    "batteryLevel": 72,
    "deviceModel": "Nexus GPS Mobile App",
    "activeTask": "سجل حضور Nexus اليومي (حاضر بالموقع)",
    "rcbCustodyCode": "RCB-1030"
  }
];

const INITIAL_PROJECT_SITES: ProjectSiteGeofence[] = [
  {
    id: 'SITE-01',
    siteCode: 'HQ-NOZHA',
    siteName: 'مقر الشركة بالنزهة',
    category: 'HQ',
    latitude: 30.1124,
    longitude: 31.3439,
    allowedRadiusMeters: 150,
    assignedEngineers: ['بيير صفوت', 'ميرنا ماجد', 'ميلاد هارون', 'م. سارة وجيه'],
    activeHeadcount: 4,
    strictPhotoRequired: false,
    status: 'Active',
  },
  {
    id: 'SITE-02',
    siteCode: 'C096-AZAD',
    siteName: 'مشروع C096 أزاد التجمع الخامس',
    category: 'Project Site',
    latitude: 30.0258,
    longitude: 31.4882,
    allowedRadiusMeters: 150,
    assignedEngineers: ['م. أبانوب مدحت', 'م. كيرلس صبحي', 'مشرف / هاني شوقي'],
    activeHeadcount: 3,
    strictPhotoRequired: true,
    status: 'Active',
  },
  {
    id: 'SITE-03',
    siteCode: 'C063-MADINATY',
    siteName: 'مشروع C063 مدينتي',
    category: 'Project Site',
    latitude: 30.0894,
    longitude: 31.6391,
    allowedRadiusMeters: 200,
    assignedEngineers: ['م. فادي نبيل', 'م. مينا عزت', 'مشرف / وليد عبد السلام'],
    activeHeadcount: 2,
    strictPhotoRequired: true,
    status: 'Active',
  },
  {
    id: 'SITE-04',
    siteCode: 'C091-MVIEW',
    siteName: 'مشروع C091 ماونتن فيو',
    category: 'Project Site',
    latitude: 30.0642,
    longitude: 31.5471,
    allowedRadiusMeters: 200,
    assignedEngineers: ['م. بيشوي عادل', 'مشرف / رمضان عبد التواب', 'م. ديفيد سمير'],
    activeHeadcount: 1,
    strictPhotoRequired: true,
    status: 'Active',
  },
  {
    id: 'SITE-05',
    siteCode: 'WH-RING1',
    siteName: 'مخزن الدائري 1',
    category: 'Warehouse',
    latitude: 30.0488,
    longitude: 31.3852,
    allowedRadiusMeters: 150,
    assignedEngineers: ['أمين مخزن / محروس سيد', 'كابتن / طارق فاروق'],
    activeHeadcount: 1,
    strictPhotoRequired: true,
    status: 'Active',
  },
  {
    id: 'SITE-06',
    siteCode: 'WH-RING2',
    siteName: 'مخزن الدائري 2',
    category: 'Warehouse',
    latitude: 30.0512,
    longitude: 31.3910,
    allowedRadiusMeters: 150,
    assignedEngineers: ['أمين مخزن / شعبان خلف'],
    activeHeadcount: 1,
    strictPhotoRequired: true,
    status: 'Active',
  },
];

const INITIAL_SURPRISE_LOGS: SurpriseRollCallLog[] = [
  {
    id: 'SRC-01',
    batchCode: 'ROLL-2026-1015-A',
    triggeredAt: '2026-10-15 11:15 ص',
    triggeredBy: 'بيير صفوت (CEO)',
    targetScope: 'مشروع C096 أزاد التجمع الخامس + C063 مدينتي',
    employeeName: 'م. أبانوب مدحت',
    employeeRole: 'مدير مشروع أول',
    siteZone: 'مشروع C096 أزاد التجمع الخامس',
    responseTimeMinutes: 2,
    gpsAccuracyMeters: 18,
    livePhotoVerified: true,
    status: 'Verified',
    penaltyApplied: 'لا يوجد - التزام فوري ✅',
  },
  {
    id: 'SRC-02',
    batchCode: 'ROLL-2026-1015-A',
    triggeredAt: '2026-10-15 11:15 ص',
    triggeredBy: 'بيير صفوت (CEO)',
    targetScope: 'مشروع C096 أزاد التجمع الخامس + C063 مدينتي',
    employeeName: 'م. كيرلس صبحي',
    employeeRole: 'مهندس موقع تنفيذي',
    siteZone: 'مشروع C096 أزاد التجمع الخامس',
    responseTimeMinutes: 4,
    gpsAccuracyMeters: 35,
    livePhotoVerified: true,
    status: 'Verified',
    penaltyApplied: 'لا يوجد - التزام فوري ✅',
  },
  {
    id: 'SRC-03',
    batchCode: 'ROLL-2026-1015-A',
    triggeredAt: '2026-10-15 11:15 ص',
    triggeredBy: 'بيير صفوت (CEO)',
    targetScope: 'مشروع C096 أزاد التجمع الخامس + C063 مدينتي',
    employeeName: 'م. فادي نبيل',
    employeeRole: 'مدير موقع',
    siteZone: 'مشروع C063 مدينتي',
    responseTimeMinutes: 3,
    gpsAccuracyMeters: 29,
    livePhotoVerified: true,
    status: 'Verified',
    penaltyApplied: 'لا يوجد - التزام فوري ✅',
  },
  {
    id: 'SRC-04',
    batchCode: 'ROLL-2026-1015-A',
    triggeredAt: '2026-10-15 11:15 ص',
    triggeredBy: 'بيير صفوت (CEO)',
    targetScope: 'مشروع C096 أزاد التجمع الخامس + C063 مدينتي',
    employeeName: 'مشرف / وليد عبد السلام',
    employeeRole: 'مشرف سباكة وعزل مائي',
    siteZone: 'مشروع C063 مدينتي',
    responseTimeMinutes: null,
    gpsAccuracyMeters: null,
    livePhotoVerified: false,
    status: 'Missed - Auto Penalty',
    penaltyApplied: 'خصم نصف يوم تلقائي (تجاوز مهلة الـ 10 دقائق)',
  },
  {
    id: 'SRC-05',
    batchCode: 'ROLL-2026-1012-B',
    triggeredAt: '2026-10-12 02:30 م',
    triggeredBy: 'ميرنا ماجد (HR Manager)',
    targetScope: 'جميع المواقع والمخازن',
    employeeName: 'م. بيشوي عادل',
    employeeRole: 'مهندس موقع أول',
    siteZone: 'مشروع C091 ماونتن فيو',
    responseTimeMinutes: 2,
    gpsAccuracyMeters: 22,
    livePhotoVerified: true,
    status: 'Verified',
    penaltyApplied: 'لا يوجد - التزام فوري ✅',
  },
  {
    id: 'SRC-06',
    batchCode: 'ROLL-2026-1012-B',
    triggeredAt: '2026-10-12 02:30 م',
    triggeredBy: 'ميرنا ماجد (HR Manager)',
    targetScope: 'جميع المواقع والمخازن',
    employeeName: 'أمين مخزن / محروس سيد',
    employeeRole: 'أمين مخزن العدد والخامات',
    siteZone: 'مخزن الدائري 1',
    responseTimeMinutes: 5,
    gpsAccuracyMeters: 14,
    livePhotoVerified: true,
    status: 'Verified',
    penaltyApplied: 'لا يوجد - التزام فوري ✅',
  },
  {
    id: 'SRC-07',
    batchCode: 'ROLL-2026-1012-B',
    triggeredAt: '2026-10-12 02:30 م',
    triggeredBy: 'ميرنا ماجد (HR Manager)',
    targetScope: 'جميع المواقع والمخازن',
    employeeName: 'مشرف / رمضان عبد التواب',
    employeeRole: 'مشرف معماري',
    siteZone: 'مشروع C091 ماونتن فيو',
    responseTimeMinutes: 9,
    gpsAccuracyMeters: 142,
    livePhotoVerified: true,
    status: 'Late Response',
    penaltyApplied: 'لفت نظر إداري (استجابة في الدقيقة 9)',
  },
];

const INITIAL_PAYROLL_CYCLE: PayrollCycleRecord[] = [
  {
    "id": "PAY-01",
    "empCode": "1001",
    "name": "Pierre Afifi — بيير صفوت (1001)",
    "role": "Technical Office & Operations Lead (Technical Office & Controls)",
    "primarySite": "NXTP — Maadi Bathroom Repairs",
    "baseSalaryEgp": 18000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1001)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-02",
    "empCode": "1002",
    "name": "Mina Gerges Shawky — مينا جرجس (1002)",
    "role": "Senior Site Execution Engineer (Site Execution)",
    "primarySite": "NXTP — Maadi Bathroom Repairs",
    "baseSalaryEgp": 18000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1002)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-03",
    "empCode": "1003",
    "name": "Saiid Awad — سعيد عوض (1003)",
    "role": "Site Execution Supervisor (Site Execution)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 18000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1003)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-04",
    "empCode": "1005",
    "name": "Susanna Michael Abelmassih — سوسنة ميخائيل (1005)",
    "role": "Operations & Project Coordinator (Operation)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 18000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1005)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-05",
    "empCode": "1006",
    "name": "Mario Gerges — ماريو جرجس (1006)",
    "role": "Site Execution Engineer (Mokattam) (Site Execution)",
    "primarySite": "Abd El-hay — Mokattam",
    "baseSalaryEgp": 18000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1006)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-06",
    "empCode": "1007",
    "name": "Ezzat Masoud — عزت مسعود (1007)",
    "role": "Site Supervisor (Site Execution)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1007)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-07",
    "empCode": "1009",
    "name": "Merna Maged Samwel — ميرنا ماجد (1009)",
    "role": "Finance & HR Manager (Finance & HR)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1009)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-08",
    "empCode": "1014",
    "name": "Shery Gerges — شيرى جرجس (1014)",
    "role": "Technical Office Engineer (Technical office)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1014)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-09",
    "empCode": "1016",
    "name": "Milad Haron — ميلاد هارون (1016)",
    "role": "Logistics, Fleet & Purchasing Officer (Logistics & Warehouses)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1016)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-10",
    "empCode": "1019",
    "name": "Reda Abdellatif Mahmoud — رضا عبداللطيف محمود (1019)",
    "role": "Site Execution Engineer (Site Execution)",
    "primarySite": "NXTP — Maadi Bathroom Repairs",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1019)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-11",
    "empCode": "1022",
    "name": "Lama Mohamed — لمى محمد (1022)",
    "role": "Technical Office Architect (Technical office)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1022)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-12",
    "empCode": "1023",
    "name": "Mohamed Islam — محمد إسلام (1023)",
    "role": "Site Execution Engineer (Site Execution)",
    "primarySite": "NXTP — Maadi Bathroom Repairs",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1023)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-13",
    "empCode": "1026",
    "name": "Eid Gries — عيد جريس (1026)",
    "role": "Field Operations Specialist (Site Execution)",
    "primarySite": "NXTP — Maadi Bathroom Repairs",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1026)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-14",
    "empCode": "1027",
    "name": "Joshua Gomma — جوشوا جمعة (1027)",
    "role": "HQ Operations & Controls (Technical Office & Controls)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1027)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-15",
    "empCode": "1028",
    "name": "Ahmed Abdel Mohsan — أحمد عبدالمحسن (1028)",
    "role": "Site Execution Engineer (Site Execution)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 22,
    "siteOvertimeHours": 0,
    "overtimeValueEgp": 0,
    "lateMinutesTotal": 45,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 2,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1028)",
    "bonusesEgp": 0,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  },
  {
    "id": "PAY-16",
    "empCode": "1030",
    "name": "Mina Fahim — مينا عاطف فهيم (1030)",
    "role": "Technical Office QS Engineer (Technical office)",
    "primarySite": "المكتب — Nexus",
    "baseSalaryEgp": 14000,
    "cycleWorkingDays": 26,
    "presentDays": 25,
    "siteOvertimeHours": 12,
    "overtimeValueEgp": 1200,
    "lateMinutesTotal": 10,
    "lateDeductionEgp": 0,
    "approvedLeaveDays": 1,
    "pettyCashAndAdvanceDeductionEgp": 0,
    "rcbSettlementStatus": "مطابق لسجل البصمة (1030)",
    "bonusesEgp": 1000,
    "penaltiesEgp": 0,
    "readinessStatus": "Ready for Disbursement"
  }
];

const INITIAL_STAFF_REQUESTS: StaffRequestItem[] = [
  {
    id: 'REQ-01',
    reqCode: 'NX-REQ-841',
    employeeName: 'م. أبانوب مدحت',
    employeeRole: 'مدير مشروع أول - C096 أزاد',
    category: 'petty_cash',
    categoryLabelAr: 'طلب عهدة موقع نقدية (RCB)',
    title: 'دفعة عهدة تشوينات ومصنعيات سريعة - مشروع أزاد C096',
    details: 'تمويل شراء مستلزمات عزل طارئة ونقل تشوينات أسمنت ومصنعيات يومية لبند المشايات الخارجية.',
    dateSubmitted: '2026-10-15 09:15 ص',
    amountEgp: 25000,
    rcbCode: 'RCB-C096-14',
    status: 'Approved',
    approverNote: 'معتمد من بيير صفوت وميلاد هارون - مربوط بمركز تكلفة C096',
  },
  {
    id: 'REQ-02',
    reqCode: 'NX-REQ-842',
    employeeName: 'م. فادي نبيل',
    employeeRole: 'مدير موقع - C063 مدينتي',
    category: 'petty_cash',
    categoryLabelAr: 'طلب عهدة موقع نقدية (RCB)',
    title: 'استعاضة عهدة موقع مدينتي C063 لتوريد إكسسوارات رخام',
    details: 'شراء زوايا تثبيت ستانلس ومادة كيمابوكسي لتركيبات واجهات الفيلات بمدينتي.',
    dateSubmitted: '2026-10-15 10:05 ص',
    amountEgp: 18500,
    rcbCode: 'RCB-C063-08',
    status: 'Pending',
    approverNote: 'بانتظار مراجعة فواتير العهدة السابقة من أ. ميلاد هارون',
  },
  {
    id: 'REQ-03',
    reqCode: 'NX-REQ-843',
    employeeName: 'م. كيرلس صبحي',
    employeeRole: 'مهندس موقع تنفيذي - C096',
    category: 'advance',
    categoryLabelAr: 'طلب سلفة شخصية',
    title: 'سلفة شخصية تُخصم على دورة راتب 21/09 إلى 20/10',
    details: 'طلب سلفة نقدية عاجلة لظروف عائلية على أن يتم خصمها بالكامل من راتب شهر أكتوبر الحالي.',
    dateSubmitted: '2026-10-14 01:20 م',
    amountEgp: 2000,
    status: 'Approved',
    approverNote: 'معتمد من أ. ميرنا ماجد وتم ترحيلها لعمود استقطاعات السلف في شيت 21->20',
  },
  {
    id: 'REQ-04',
    reqCode: 'NX-REQ-844',
    employeeName: 'م. مينا عزت',
    employeeRole: 'مهندس MEP وكهروميكانيك',
    category: 'leave',
    categoryLabelAr: 'طلب إجازة اعتيادية / عارضة',
    title: 'طلب إجازة اعتيادية لمدة يومين (السبت والأحد)',
    details: 'تم التنسيق مع م. فادي نبيل لتغطية استلامات الكهروميكانيك بموقع مدينتي C063 خلال اليومين.',
    dateSubmitted: '2026-10-14 04:10 م',
    leaveDays: 2,
    status: 'Approved',
    approverNote: 'موافق عليها ومخصومة من رصيد الإجازات السنوية دون المساس بالراتب الأساسي',
  },
  {
    id: 'REQ-05',
    reqCode: 'NX-REQ-845',
    employeeName: 'مشرف / وليد عبد السلام',
    employeeRole: 'مشرف سباكة وعزل مائي - C063',
    category: 'directive',
    categoryLabelAr: 'قرارات إدارية وجزاءات',
    title: 'قرار جزاء إداري: عدم الاستجابة للتمام المفاجئ بالـ GPS',
    details: 'تجاوز مهلة الـ 10 دقائق المحددة في التمام المفاجئ ROLL-2026-1015-A وعدم التواجد داخل نطاق الـ 200 متر بموقع مدينتي.',
    dateSubmitted: '2026-10-15 11:26 ص',
    amountEgp: 600,
    status: 'Enforced',
    approverNote: 'تطبيق لائحة الجزاءات تلقائياً (خصم نصف يوم + إنذار رسمي)',
  },
  {
    id: 'REQ-06',
    reqCode: 'NX-REQ-846',
    employeeName: 'م. بيشوي عادل',
    employeeRole: 'مهندس موقع أول - C091 ماونتن فيو',
    category: 'directive',
    categoryLabelAr: 'قرارات إدارية وجزاءات',
    title: 'قرار مكافأة إجادة: تسليم أعمال العزل والمحارة من أول مرة',
    details: 'صرف مكافأة تميز هندسي لسرعة نهو وتسليم استشاري ماونتن فيو C091 بدون أي ملاحظات (Zero Snags).',
    dateSubmitted: '2026-10-13 05:00 م',
    amountEgp: 1800,
    status: 'Enforced',
    approverNote: 'معتمد من م. بيير صفوت ومُدرج في خانة المكافآت بدورة 21->20',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HrWhereaboutsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTabId>('whereabouts');

  // Sub-Tab 1 States
  const [staffList, setStaffList] = useState<StaffWhereabouts[]>(INITIAL_STAFF_WHEREABOUTS);
  const [projectSites, setProjectSites] = useState<ProjectSiteGeofence[]>(INITIAL_PROJECT_SITES);
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaffForInspect, setSelectedStaffForInspect] = useState<StaffWhereabouts | null>(
    INITIAL_STAFF_WHEREABOUTS[0]
  );

  // Sub-Tab 2 States (Surprise Roll Call)
  const [surpriseLogs, setSurpriseLogs] = useState<SurpriseRollCallLog[]>(INITIAL_SURPRISE_LOGS);
  const [selectedRollCallZones, setSelectedRollCallZones] = useState<string[]>([
    'مشروع C096 أزاد التجمع الخامس',
    'مشروع C063 مدينتي',
    'مشروع C091 ماونتن فيو',
  ]);
  const [activeRollCallBanner, setActiveRollCallBanner] = useState<{
    batchCode: string;
    countdownSeconds: number;
    targetCount: number;
    zonesText: string;
  } | null>(null);

  // Sub-Tab 3 States (21->20 Payroll Cycle)
  const [payrollRecords, setPayrollRecords] = useState<PayrollCycleRecord[]>(INITIAL_PAYROLL_CYCLE);
  const [selectedCycleLabel, setSelectedCycleLabel] = useState<string>('21/09/2026 → 20/10/2026');
  const [payrollSearch, setPayrollSearch] = useState<string>('');

  // Sub-Tab 4 States (Staff Requests)
  const [requestsList, setRequestsList] = useState<StaffRequestItem[]>(INITIAL_STAFF_REQUESTS);
  const [requestCategoryFilter, setRequestCategoryFilter] = useState<string>('ALL');
  const [newReqCategory, setNewReqCategory] = useState<RequestCategory>('petty_cash');
  const [newReqEmployee, setNewReqEmployee] = useState<string>('م. أبانوب مدحت');
  const [newReqTitle, setNewReqTitle] = useState<string>('');
  const [newReqAmount, setNewReqAmount] = useState<string>('');
  const [newReqRcbCode, setNewReqRcbCode] = useState<string>('RCB-C096-22');
  const [newReqLeaveDays, setNewReqLeaveDays] = useState<string>('2');
  const [newReqDetails, setNewReqDetails] = useState<string>('');

  // ============================================================================
  // COMPUTED METRICS
  // ============================================================================

  const whereaboutsStats = useMemo(() => {
    const within = staffList.filter((s) => s.geofenceStatus === 'within_geofence').length;
    const fleet = staffList.filter((s) => s.geofenceStatus === 'fleet_route').length;
    const late = staffList.filter((s) => s.geofenceStatus === 'late_unregistered').length;
    return { total: staffList.length, within, fleet, late };
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesZone = zoneFilter === 'ALL' || s.assignedZone === zoneFilter;
      const matchesStatus = statusFilter === 'ALL' || s.geofenceStatus === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.includes(searchQuery) ||
        s.role.includes(searchQuery) ||
        s.assignedZone.includes(searchQuery) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesStatus && matchesSearch;
    });
  }, [staffList, zoneFilter, statusFilter, searchQuery]);

  const payrollSummary = useMemo(() => {
    let totalBase = 0;
    let totalOvertime = 0;
    let totalBonuses = 0;
    let totalAdvancesAndRcb = 0;
    let totalPenaltiesAndLate = 0;
    let totalNetPayable = 0;

    payrollRecords.forEach((rec) => {
      const net =
        rec.baseSalaryEgp +
        rec.overtimeValueEgp +
        rec.bonusesEgp -
        rec.lateDeductionEgp -
        rec.pettyCashAndAdvanceDeductionEgp -
        rec.penaltiesEgp;

      totalBase += rec.baseSalaryEgp;
      totalOvertime += rec.overtimeValueEgp;
      totalBonuses += rec.bonusesEgp;
      totalAdvancesAndRcb += rec.pettyCashAndAdvanceDeductionEgp;
      totalPenaltiesAndLate += rec.lateDeductionEgp + rec.penaltiesEgp;
      totalNetPayable += net;
    });

    return {
      totalBase,
      totalOvertime,
      totalBonuses,
      totalAdvancesAndRcb,
      totalPenaltiesAndLate,
      totalNetPayable,
    };
  }, [payrollRecords]);

  const filteredPayroll = useMemo(() => {
    return payrollRecords.filter(
      (r) =>
        !payrollSearch.trim() ||
        r.name.includes(payrollSearch) ||
        r.primarySite.includes(payrollSearch) ||
        r.empCode.toLowerCase().includes(payrollSearch.toLowerCase())
    );
  }, [payrollRecords, payrollSearch]);

  const filteredRequests = useMemo(() => {
    return requestsList.filter(
      (req) => requestCategoryFilter === 'ALL' || req.category === requestCategoryFilter
    );
  }, [requestsList, requestCategoryFilter]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefreshGpsPings = () => {
    setStaffList((prev) =>
      prev.map((emp) => {
        if (emp.geofenceStatus === 'within_geofence') {
          const jitter = Math.max(8, Math.min(emp.allowedRadiusMeters - 20, emp.distanceFromCenterMeters + (Math.random() > 0.5 ? 4 : -4)));
          return {
            ...emp,
            distanceFromCenterMeters: Math.round(jitter),
            lastPingTime: 'الآن (مُحدث)',
          };
        }
        return emp;
      })
    );
  };

  const handleToggleSiteRadius = (siteId: string, newRadius: 150 | 200 | 250) => {
    setProjectSites((prev) =>
      prev.map((site) => (site.id === siteId ? { ...site, allowedRadiusMeters: newRadius } : site))
    );
  };

  const handleTriggerSurpriseRollCall = () => {
    if (selectedRollCallZones.length === 0) return;

    const batchId = `ROLL-2026-1015-${Math.floor(10 + Math.random() * 89)}`;
    const targetedStaff = staffList.filter((s) => selectedRollCallZones.includes(s.assignedZone));

    setActiveRollCallBanner({
      batchCode: batchId,
      countdownSeconds: 600,
      targetCount: targetedStaff.length || 6,
      zonesText: selectedRollCallZones.join(' ، '),
    });

    const newEntries: SurpriseRollCallLog[] = (targetedStaff.length > 0
      ? targetedStaff.slice(0, 4)
      : staffList.slice(3, 7)
    ).map((emp, idx) => {
      const isLateOrMissed = emp.geofenceStatus === 'late_unregistered';
      return {
        id: `SRC-NEW-${Date.now()}-${idx}`,
        batchCode: batchId,
        triggeredAt: 'الآن (15/10/2026 - مباشر)',
        triggeredBy: 'بيير صفوت / ميرنا ماجد',
        targetScope: selectedRollCallZones.join(' + '),
        employeeName: emp.name,
        employeeRole: emp.role,
        siteZone: emp.assignedZone,
        responseTimeMinutes: isLateOrMissed ? null : idx + 1,
        gpsAccuracyMeters: isLateOrMissed ? null : emp.distanceFromCenterMeters,
        livePhotoVerified: !isLateOrMissed,
        status: isLateOrMissed ? 'Missed - Auto Penalty' : 'Verified',
        penaltyApplied: isLateOrMissed
          ? 'خصم نصف يوم تلقائي (عدم تأكيد صورة الموقع خلال 10 دقائق)'
          : 'لا يوجد - تم التحقق من الإحداثيات والصورة الحية ✅',
      };
    });

    setSurpriseLogs((prev) => [...newEntries, ...prev]);
  };

  const handleToggleRollCallZone = (zoneName: string) => {
    setSelectedRollCallZones((prev) =>
      prev.includes(zoneName) ? prev.filter((z) => z !== zoneName) : [...prev, zoneName]
    );
  };

  const handleApprovePayrollRecord = (recordId: string) => {
    setPayrollRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              readinessStatus: 'Ready for Disbursement',
              rcbSettlementStatus: r.rcbSettlementStatus.includes('قيد')
                ? 'تمت المطابقة والتسوية النهائية ✅'
                : r.rcbSettlementStatus,
            }
          : r
      )
    );
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim()) return;

    const empObj = staffList.find((s) => s.name === newReqEmployee);
    const categoryLabels: Record<RequestCategory, string> = {
      leave: 'طلب إجازة اعتيادية / عارضة',
      advance: 'طلب سلفة شخصية',
      petty_cash: 'طلب عهدة موقع نقدية (RCB)',
      directive: 'قرارات إدارية وجزاءات',
    };

    const newItem: StaffRequestItem = {
      id: `REQ-${Date.now()}`,
      reqCode: `NX-REQ-${Math.floor(850 + Math.random() * 140)}`,
      employeeName: newReqEmployee,
      employeeRole: empObj ? empObj.role : 'مهندس تنفيذ',
      category: newReqCategory,
      categoryLabelAr: categoryLabels[newReqCategory],
      title: newReqTitle,
      details: newReqDetails || 'تم التسجيل عبر بوابة الموارد البشرية والعهد الميدانية Nexus.',
      dateSubmitted: '2026-10-15 (الآن)',
      amountEgp:
        newReqCategory !== 'leave' && newReqAmount ? Number(newReqAmount) : undefined,
      rcbCode: newReqCategory === 'petty_cash' ? newReqRcbCode : undefined,
      leaveDays: newReqCategory === 'leave' ? Number(newReqLeaveDays) || 1 : undefined,
      status: newReqCategory === 'directive' ? 'Enforced' : 'Pending',
      approverNote:
        newReqCategory === 'directive'
          ? 'تم الإدراج الفوري في شيت دورة 21 إلى 20'
          : 'قيد المراجعة والاعتماد من أ. ميرنا ماجد / أ. ميلاد هارون',
    };

    setRequestsList((prev) => [newItem, ...prev]);
    setNewReqTitle('');
    setNewReqAmount('');
    setNewReqDetails('');
  };

  const handleUpdateRequestStatus = (reqId: string, newStatus: 'Approved' | 'Rejected' | 'Enforced') => {
    setRequestsList((prev) =>
      prev.map((item) =>
        item.id === reqId
          ? {
              ...item,
              status: newStatus,
              approverNote:
                newStatus === 'Approved'
                  ? 'تم الاعتماد النهائي وترحيل الأثر المالي إلى دورة راتب 21->20 ✅'
                  : newStatus === 'Rejected'
                  ? 'تم الرفض لعدم استيفاء مستندات التسوية'
                  : 'قرار إداري نافذ ومُرحل لشيت الرواتب',
            }
          : item
      )
    );
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderGeofenceBadge = (status: GeofenceStatus) => {
    switch (status) {
      case 'within_geofence':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#123524]" />
            داخل النطاق الجغرافي ✅ Within 150m Geofence
          </span>
        );
      case 'fleet_route':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-[#192631] border border-sky-500/30">
            <Truck className="w-3.5 h-3.5 text-[#192631]" />
            مأمورية خارجية 🚗 Fleet Route
          </span>
        );
      case 'late_unregistered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-[#b45309] border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-[#b45309]" />
            تأخير / لم يسجل ⏳
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]/90 text-[#192631] p-4 md:p-6 space-y-6 font-sans text-start">
      {/* =====================================================================
          TOP HEADER BANNER
      ===================================================================== */}
      <div className="bg-white/80 backdrop-blur-xl border border-[#192631]/10 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                <Radar className="w-3.5 h-3.5 animate-pulse" />
                Nexus Live GPS & HR Core
              </span>
              <span className="text-xs text-[#192631]/70 font-mono">
                /whereabouts • /project-sites • /hr/surprise-check • /attendance (21→20) • /my-requests
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#192631] tracking-tight">
              منظومة التواجد الجغرافي GPS، التمام المفاجئ، ودورة الرواتب (21 إلى 20)
            </h1>
            <p className="text-sm text-[#192631]/85 max-w-4xl">
              الرقابة الميدانية اللحظية لعدد <span className="text-[#123524] font-bold">16 موظف ومهندس ومشرف</span> عبر النطاقات الجغرافية للمشروعات (<span className="text-[#e04b2a] font-semibold">مقر النزهة، أزاد C096، مدينتي C063، ماونتن فيو C091، ومخازن الدائري</span>) مع الربط المباشر بدورة الرواتب الشهرية وعهد المواقع <span className="font-mono text-[#b45309]">RCB</span>.
            </p>
          </div>

          {/* Quick KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3.5 py-2.5 text-center">
              <div className="text-xs text-[#192631]/70">قوة العمل الفعالة</div>
              <div className="text-xl font-extrabold text-[#192631] mt-0.5">{whereaboutsStats.total} موظف</div>
              <div className="text-[11px] text-[#123524]">100% مربوط بالـ GPS</div>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-3.5 py-2.5 text-center">
              <div className="text-xs text-[#123524]">داخل النطاق ✅</div>
              <div className="text-xl font-extrabold text-[#123524] mt-0.5">{whereaboutsStats.within}</div>
              <div className="text-[11px] text-[#123524]/80">Within Geofence</div>
            </div>
            <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl px-3.5 py-2.5 text-center">
              <div className="text-xs text-[#192631]">مأمورية متحركة 🚗</div>
              <div className="text-xl font-extrabold text-[#192631] mt-0.5">{whereaboutsStats.fleet}</div>
              <div className="text-[11px] text-[#192631]/80">Fleet Route</div>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl px-3.5 py-2.5 text-center">
              <div className="text-xs text-[#b45309]">تأخير / خارج النطاق ⏳</div>
              <div className="text-xl font-extrabold text-[#b45309] mt-0.5">{whereaboutsStats.late}</div>
              <div className="text-[11px] text-[#b45309]/80">يتطلب متابعة HR</div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-[#192631]/10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('whereabouts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'whereabouts'
                ? 'bg-[#e04b2a] text-[#192631] shadow-lg shadow-indigo-600/30'
                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>1. أين الموظفون الآن & مواقع المشروعات GPS</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-[#f5f5f5]/85 text-indigo-200">16</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('surprise-check')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'surprise-check'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>2. تمام حالي مفاجئ (/hr/surprise-check)</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-[#f5f5f5]/85 text-red-700">10m Ping</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payroll-cycle')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'payroll-cycle'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>3. شيت الحضور والبصمة الشهري (دورة 21 إلى 20)</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-[#f5f5f5]/85 text-[#123524]">21→20</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff-requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'staff-requests'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-white/80 backdrop-blur-md text-[#192631]/85 hover:bg-[#192631]/[0.05] border border-[#192631]/10'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>4. طلبات الإجازات والسلف والعهد والقرارات الإدارية</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-[#f5f5f5]/85 text-amber-100">
              {requestsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          SUB-TAB 1: LIVE GPS STAFF WHEREABOUTS & PROJECT SITES GEOFENCE MAP
      ===================================================================== */}
      {activeTab === 'whereabouts' && (
        <div className="space-y-6">
          {/* Filter & Action Bar */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#192631]/70 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الموظف، الكود، الوظيفة، أو الموقع..."
                  className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl pr-9 pl-3 py-2 text-sm text-[#192631] placeholder-[#192631]/40 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                aria-label="تصفية حسب النطاق الجغرافي"
                className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-sm text-[#192631] focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">جميع المواقع والنطاقات الجغرافية (All Zones)</option>
                <option value="مقر الشركة بالنزهة">مقر الشركة بالنزهة</option>
                <option value="مشروع C096 أزاد التجمع الخامس">مشروع C096 أزاد التجمع الخامس</option>
                <option value="مشروع C063 مدينتي">مشروع C063 مدينتي</option>
                <option value="مشروع C091 ماونتن فيو">مشروع C091 ماونتن فيو</option>
                <option value="مخزن الدائري 1">مخزن الدائري 1</option>
                <option value="مخزن الدائري 2">مخزن الدائري 2</option>
                <option value="في الطريق - مأمورية لوجستيات">في الطريق - مأمورية لوجستيات</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="تصفية حسب حالة النطاق الجغرافي"
                className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-sm text-[#192631] focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">كل حالات التحقق الجغرافي</option>
                <option value="within_geofence">داخل النطاق الجغرافي ✅ Within Geofence</option>
                <option value="fleet_route">مأمورية خارجية 🚗 Fleet Route</option>
                <option value="late_unregistered">تأخير / لم يسجل ⏳</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshGpsPings}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#e04b2a]/20 hover:bg-[#e04b2a]/30 text-[#e04b2a] border border-[#e04b2a]/25 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث إشارات الـ GPS اللحظية
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('surprise-check')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                <BellRing className="w-3.5 h-3.5" />
                إطلاق تمام مفاجئ الآن
              </button>
            </div>
          </div>

          {/* Interactive Geofence Radar Visualization + Live Selected Employee Telemetry */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Visual Geofence Zones Overview */}
            <div className="xl:col-span-2 bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-[#e04b2a]" />
                    خريطة التوزيع الجغرافي الحية للمشروعات والمقرات (Live Geofence Zones)
                  </h2>
                  <p className="text-xs text-[#192631]/70 mt-0.5">
                    اضغط على أي موقع لتصفية المهندسين والمشرفين المتواجدين بداخله حالياً
                  </p>
                </div>
                <span className="text-xs font-mono text-[#123524] bg-[#123524]/10 border border-[#123524]/25 px-2.5 py-1 rounded-lg">
                  GPS Satellites: LOCKED (HDOP 0.8)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    zone: 'مقر الشركة بالنزهة',
                    code: 'HQ-NOZHA',
                    radius: '150m',
                    coords: '30.1124° N, 31.3439° E',
                    icon: Building2,
                    color: 'indigo',
                  },
                  {
                    zone: 'مشروع C096 أزاد التجمع الخامس',
                    code: 'C096-AZAD',
                    radius: '150m',
                    coords: '30.0258° N, 31.4882° E',
                    icon: Radar,
                    color: 'emerald',
                  },
                  {
                    zone: 'مشروع C063 مدينتي',
                    code: 'C063-MADINATY',
                    radius: '200m',
                    coords: '30.0894° N, 31.6391° E',
                    icon: Radar,
                    color: 'emerald',
                  },
                  {
                    zone: 'مشروع C091 ماونتن فيو',
                    code: 'C091-MVIEW',
                    radius: '200m',
                    coords: '30.0642° N, 31.5471° E',
                    icon: Radar,
                    color: 'emerald',
                  },
                  {
                    zone: 'مخزن الدائري 1',
                    code: 'WH-RING1',
                    radius: '150m',
                    coords: '30.0488° N, 31.3852° E',
                    icon: Warehouse,
                    color: 'amber',
                  },
                  {
                    zone: 'مخزن الدائري 2',
                    code: 'WH-RING2',
                    radius: '150m',
                    coords: '30.0512° N, 31.3910° E',
                    icon: Warehouse,
                    color: 'amber',
                  },
                ].map((z) => {
                  const zoneStaff = staffList.filter((s) => s.assignedZone === z.zone);
                  const activeInZone = zoneStaff.filter((s) => s.geofenceStatus === 'within_geofence').length;
                  const IconComp = z.icon;
                  const isSelected = zoneFilter === z.zone;

                  return (
                    <button
                      key={z.code}
                      type="button"
                      onClick={() => setZoneFilter(isSelected ? 'ALL' : z.zone)}
                      className={`text-start p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50'
                          : 'bg-[#f5f5f5]/90 border-[#192631]/10 hover:border-[#192631]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#e04b2a] bg-[#e04b2a]/10 px-2 py-0.5 rounded">
                          {z.code}
                        </span>
                        <span className="text-[11px] font-mono text-[#123524]">
                          نطاق {z.radius}
                        </span>
                      </div>
                      <div className="mt-2 font-bold text-sm text-[#192631] flex items-center gap-1.5">
                        <IconComp className="w-4 h-4 text-[#e04b2a] shrink-0" />
                        <span className="truncate">{z.zone}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[#192631]/70 font-mono">{z.coords}</div>
                      <div className="mt-3 pt-2 border-t border-[#192631]/10 flex items-center justify-between text-xs">
                        <span className="text-[#192631]/85">
                          مسجل بالنطاق: <strong className="text-[#123524]">{activeInZone}</strong> / {zoneStaff.length}
                        </span>
                        <span className="text-[#e04b2a] hover:underline">عرض الموظفين ←</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Telemetry Inspector Card */}
            <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 flex flex-col justify-between">
              {selectedStaffForInspect ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-[#e04b2a]">
                        {selectedStaffForInspect.code} • {selectedStaffForInspect.department}
                      </span>
                      <h3 className="text-lg font-extrabold text-[#192631] mt-0.5">
                        {selectedStaffForInspect.name}
                      </h3>
                      <p className="text-xs text-[#192631]/70">{selectedStaffForInspect.role}</p>
                    </div>
                    <div className="text-start">
                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-[#f5f5f5]/90 px-2.5 py-1 rounded-lg border border-[#192631]/10 text-[#123524]">
                        <BatteryCharging className="w-3.5 h-3.5" />
                        {selectedStaffForInspect.batteryLevel}%
                      </span>
                    </div>
                  </div>

                  <div>{renderGeofenceBadge(selectedStaffForInspect.geofenceStatus)}</div>

                  <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#192631]/70">النطاق الجغرافي المخصص:</span>
                      <span className="font-bold text-[#192631]">{selectedStaffForInspect.assignedZone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#192631]/70">إحداثيات الـ GPS الحالية:</span>
                      <span className="font-mono text-[#e04b2a]">
                        {selectedStaffForInspect.coordinates.lat.toFixed(4)},{' '}
                        {selectedStaffForInspect.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#192631]/70">المسافة عن مركز الموقع:</span>
                      <span className="font-bold text-[#123524]">
                        {selectedStaffForInspect.geofenceStatus === 'fleet_route'
                          ? 'خط سير متحرك (Fleet GPS)'
                          : `${selectedStaffForInspect.distanceFromCenterMeters} متر (المسموح ${selectedStaffForInspect.allowedRadiusMeters}م)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#192631]/70">وقت البصمة / آخر اتصال:</span>
                      <span className="text-[#192631]">
                        {selectedStaffForInspect.checkInTime} • {selectedStaffForInspect.lastPingTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#192631]/70">الجهاز المعتمد:</span>
                      <span className="text-[#192631]/85 font-mono">{selectedStaffForInspect.deviceModel}</span>
                    </div>
                  </div>

                  <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3">
                    <div className="text-[11px] text-[#e04b2a] font-semibold">المهمة الميدانية الجارية الآن:</div>
                    <div className="text-xs text-[#192631] mt-1 leading-relaxed">
                      {selectedStaffForInspect.activeTask}
                    </div>
                    {selectedStaffForInspect.rcbCustodyCode && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono bg-amber-500/15 text-[#b45309] px-2 py-0.5 rounded border border-amber-500/30">
                        <Wallet className="w-3 h-3" />
                        كود العهدة المربوط: {selectedStaffForInspect.rcbCustodyCode}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 pt-3 border-t border-[#192631]/10 flex items-center justify-between text-xs text-[#192631]/70">
                <span>بصمة الجهاز الموثقة (IMEI Bound)</span>
                <span className="text-[#123524] font-semibold">مؤمن ضد Mock GPS ✓</span>
              </div>
            </div>
          </div>

          {/* All 16 Staff Live Whereabouts Table */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 md:p-5 border-b border-[#192631]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#192631] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#123524]" />
                  سجل التواجد اللحظي لجميع موظفي ومهندسي Nexus ({filteredStaff.length} من 16)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  يتضمن حالة التحقق من النطاق الجغرافي (Within 150m/200m Geofence)، وقت البصمة، وحالة الجهاز
                </p>
              </div>
              {zoneFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setZoneFilter('ALL')}
                  className="text-xs text-[#e04b2a] hover:text-[#e04b2a] font-bold"
                >
                  إلغاء فلتر الموقع ({zoneFilter}) ✕
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-[#f5f5f5]/90 text-[#192631]/70 text-xs uppercase border-b border-[#192631]/10">
                  <tr>
                    <th className="py-3.5 px-4">الموظف / المهندس</th>
                    <th className="py-3.5 px-4">الموقع المخصص (Geofence Zone)</th>
                    <th className="py-3.5 px-4">حالة التحقق الجغرافي (Geofence Badge)</th>
                    <th className="py-3.5 px-4">بصمة الحضور</th>
                    <th className="py-3.5 px-4">الجهاز والبطارية</th>
                    <th className="py-3.5 px-4">المهمة الميدانية والعهدة</th>
                    <th className="py-3.5 px-4 text-center">فحص</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredStaff.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedStaffForInspect(emp)}
                      className={`cursor-pointer transition-colors ${
                        selectedStaffForInspect?.id === emp.id
                          ? 'bg-indigo-950/30'
                          : 'hover:bg-[#192631]/[0.05]'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#192631] flex items-center gap-2">
                          <span>{emp.name}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#192631]/[0.05] text-[#192631]/85">
                            {emp.code}
                          </span>
                        </div>
                        <div className="text-xs text-[#192631]/70 mt-0.5">{emp.role}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#192631]">{emp.assignedZone}</div>
                        <div className="text-[11px] text-[#192631]/70 font-mono mt-0.5">
                          {emp.coordinates.lat.toFixed(4)}°N, {emp.coordinates.lng.toFixed(4)}°E
                          {emp.geofenceStatus !== 'fleet_route' && (
                            <span className="mr-1.5 text-[#e04b2a]">
                              ({emp.distanceFromCenterMeters}م / {emp.allowedRadiusMeters}م)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{renderGeofenceBadge(emp.geofenceStatus)}</td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#192631]">{emp.checkInTime}</div>
                        <div className="text-[11px] text-[#192631]/70 mt-0.5">آخر إشارة: {emp.lastPingTime}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-xs text-[#192631]">
                          <Smartphone className="w-3.5 h-3.5 text-[#192631]/70" />
                          <span>{emp.deviceModel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-16 h-1.5 bg-[#192631]/[0.05] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                emp.batteryLevel > 50
                                  ? 'bg-emerald-400'
                                  : emp.batteryLevel > 25
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${emp.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-[#192631]/70">{emp.batteryLevel}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs text-[#192631] line-clamp-2">{emp.activeTask}</div>
                        {emp.rcbCustodyCode && (
                          <span className="mt-1 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-[#b45309] border border-amber-500/30">
                            عهدة: {emp.rcbCustodyCode}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaffForInspect(emp);
                          }}
                          className="p-1.5 rounded-lg bg-[#192631]/[0.05] hover:bg-[#e04b2a] text-[#192631]/85 hover:text-[#192631] transition"
                          title="عرض تفاصيل الـ GPS"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Project Sites GPS Geofence Configuration Table */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 md:p-5 border-b border-[#192631]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#192631] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#e04b2a]" />
                  جدول إعدادات النطاقات الجغرافية لمواقع المشروعات (Project Sites GPS Geofence Configuration)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  إعدادات خطوط الطول والعرض (Latitude / Longitude) ونصف القطر المسموح به للتحقق من بصمة الـ GPS (150m / 200m)
                </p>
              </div>
              <span className="text-xs font-mono text-[#e04b2a] bg-indigo-950/60 border border-indigo-800/50 px-3 py-1 rounded-lg">
                /project-sites • 6 Active Geofences
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-[#f5f5f5]/90 text-[#192631]/70 text-xs uppercase border-b border-[#192631]/10">
                  <tr>
                    <th className="py-3 px-4">كود الموقع</th>
                    <th className="py-3 px-4">اسم الموقع / المشروع</th>
                    <th className="py-3 px-4">التصنيف</th>
                    <th className="py-3 px-4">Latitude (خط العرض)</th>
                    <th className="py-3 px-4">Longitude (خط الطول)</th>
                    <th className="py-3 px-4">نصف القطر المسموح (Radius)</th>
                    <th className="py-3 px-4">المهندسون والمشرفون المعينون</th>
                    <th className="py-3 px-4">شرط الصورة الحية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {projectSites.map((site) => (
                    <tr key={site.id} className="hover:bg-[#192631]/[0.05]">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#e04b2a]">
                        {site.siteCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#192631]">{site.siteName}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#192631]/[0.05] text-[#192631]/85">
                          {site.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#123524]">
                        {site.latitude.toFixed(4)}° N
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#123524]">
                        {site.longitude.toFixed(4)}° E
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 bg-[#f5f5f5]/90 p-1 rounded-lg border border-[#192631]/10">
                          {([150, 200] as const).map((rad) => (
                            <button
                              key={rad}
                              type="button"
                              onClick={() => handleToggleSiteRadius(site.id, rad)}
                              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                                site.allowedRadiusMeters === rad
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-[#192631]/70 hover:text-[#192631]'
                              }`}
                            >
                              {rad}m
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {site.assignedEngineers.map((eng) => (
                            <span
                              key={eng}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-[#192631]/[0.05] text-[#192631] border border-[#192631]/10"
                            >
                              {eng}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {site.strictPhotoRequired ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#123524] font-semibold">
                            <Camera className="w-3.5 h-3.5" />
                            إجباري بالبصمة
                          </span>
                        ) : (
                          <span className="text-xs text-[#192631]/70">GPS + Wi-Fi HQ</span>
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
          SUB-TAB 2: SURPRISE ROLL CALL (/hr/surprise-check)
      ===================================================================== */}
      {activeTab === 'surprise-check' && (
        <div className="space-y-6">
          {/* Surprise Roll Call Control Console */}
          <div className="bg-gradient-to-l from-rose-950/50 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-red-700 border border-rose-500/30">
                  <Timer className="w-3.5 h-3.5" />
                  ميزة Nexus الحصرية • /hr/surprise-check
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#192631]">
                  إطلاق تمام مفاجئ الآن (Surprise GPS & Live Photo Roll Call)
                </h2>
                <p className="text-sm text-[#192631]/85 leading-relaxed">
                  يقوم المدير التنفيذي (<span className="text-[#192631] font-semibold">بيير صفوت</span>) أو مديرة الموارد البشرية (<span className="text-[#192631] font-semibold">ميرنا ماجد</span>) بإرسال إشعار فوري بمؤقت تنازلي مدته <span className="text-red-700 font-bold">10 دقائق فقط</span> لمهندسي ومشرفي المواقع المختارة لتأكيد الإحداثيات الحية والتقاط صورة فورية من داخل الموقع. في حالة عدم الاستجابة خلال المهلة يتم توقيع جزاء تلقائي في شيت الرواتب.
                </p>

                {/* Target Sites Checkboxes */}
                <div className="pt-3">
                  <div className="text-xs font-bold text-[#192631]/70 mb-2">
                    اختر المواقع المستهدفة بالتمام المفاجئ:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'مشروع C096 أزاد التجمع الخامس',
                      'مشروع C063 مدينتي',
                      'مشروع C091 ماونتن فيو',
                      'مخزن الدائري 1',
                      'مخزن الدائري 2',
                    ].map((zone) => {
                      const active = selectedRollCallZones.includes(zone);
                      return (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => handleToggleRollCallZone(zone)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            active
                              ? 'bg-rose-600/25 border-rose-500 text-red-700'
                              : 'bg-[#f5f5f5]/90 border-[#192631]/10 text-[#192631]/70 hover:text-[#192631]'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}
                          {zone}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleTriggerSurpriseRollCall}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm md:text-base font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 transition transform active:scale-95"
                >
                  <Send className="w-5 h-5" />
                  <span>إرسال طلب تمام مفاجئ بالـ GPS والصورة الحية</span>
                </button>
                <span className="text-xs text-[#192631]/70 text-center sm:text-start">
                  Countdown: 10:00 Minutes • Live Camera Only (No Gallery Upload)
                </span>
              </div>
            </div>

            {/* Active Countdown Alert if Triggered */}
            {activeRollCallBanner && (
              <div className="mt-5 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-mono font-extrabold animate-pulse">
                    10m
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#192631]">
                      تم إطلاق دفعة التمام المفاجئ رقم{' '}
                      <span className="font-mono text-red-700">{activeRollCallBanner.batchCode}</span> بنجاح!
                    </div>
                    <div className="text-xs text-red-700/90 mt-0.5">
                      النطاقات المستهدفة: {activeRollCallBanner.zonesText} • تم إرسال تنبيه لـ{' '}
                      {activeRollCallBanner.targetCount} مهندسين ومشرفين.
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#123524]/10 text-[#123524] border border-[#123524]/25 text-xs font-bold">
                  جاري استقبال الإحداثيات والصور الحية...
                </span>
              </div>
            )}
          </div>

          {/* Historical Surprise Roll Call Logs Table */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 md:p-5 border-b border-[#192631]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#192631] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-700" />
                  سجل عمليات التمام المفاجئ وسرعة الاستجابة ودقة الـ GPS (Surprise Check Audit Log)
                </h3>
                <p className="text-xs text-[#192631]/70">
                  يوضح زمن الاستجابة بالدقائق (`2 mins`, 4 mins)، دقة التطابق الجغرافي، والجزاءات التلقائية للمتخلفين
                </p>
              </div>
              <span className="text-xs text-[#192631]/70">
                إجمالي السجلات الموثقة: <strong className="text-[#192631]">{surpriseLogs.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-[#f5f5f5]/90 text-[#192631]/70 text-xs uppercase border-b border-[#192631]/10">
                  <tr>
                    <th className="py-3.5 px-4">كود الدفعة والتوقيت</th>
                    <th className="py-3.5 px-4">المسؤول المطلق للتمام</th>
                    <th className="py-3.5 px-4">المهندس / المشرف</th>
                    <th className="py-3.5 px-4">الموقع الجغرافي</th>
                    <th className="py-3.5 px-4">زمن الاستجابة</th>
                    <th className="py-3.5 px-4">دقة الـ GPS والصورة</th>
                    <th className="py-3.5 px-4">حالة التحقق</th>
                    <th className="py-3.5 px-4">الأثر الإداري / الجزاء التلقائي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {surpriseLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#192631]/[0.05]">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-red-700">{log.batchCode}</div>
                        <div className="text-xs text-[#192631]/70 mt-0.5">{log.triggeredAt}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#192631]/85 font-semibold">
                        {log.triggeredBy}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#192631]">{log.employeeName}</div>
                        <div className="text-xs text-[#192631]/70">{log.employeeRole}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#192631]">
                        {log.siteZone}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.responseTimeMinutes !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                              log.responseTimeMinutes <= 5
                                ? 'bg-[#123524]/10 text-[#123524] border border-[#123524]/25'
                                : 'bg-amber-500/15 text-[#b45309] border border-amber-500/30'
                            }`}
                          >
                            ⚡ {log.responseTimeMinutes} mins
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-rose-500/15 text-red-700 border border-rose-500/30">
                            تجاوز 10 mins ✕
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.gpsAccuracyMeters !== null ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-mono text-[#123524]">
                              دقة {log.gpsAccuracyMeters}m من المركز
                            </div>
                            <div className="text-[11px] text-[#192631]/70 flex items-center gap-1">
                              <Camera className="w-3 h-3 text-[#e04b2a]" />
                              صورة موقع حية موثقة
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-red-700">لم يتم إرسال إحداثيات أو صورة</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.status === 'Verified' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#123524]/10 text-[#123524]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> مطابق تماماً
                          </span>
                        )}
                        {log.status === 'Late Response' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-[#b45309]">
                            <AlertTriangle className="w-3.5 h-3.5" /> استجابة متأخرة
                          </span>
                        )}
                        {log.status === 'Missed - Auto Penalty' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-red-700 border border-rose-500/40">
                            <XCircle className="w-3.5 h-3.5" /> غياب عن التمام (جزاء تلقائي)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#192631]">
                        {log.penaltyApplied}
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
          SUB-TAB 3: NEXUS 21->20 PAYROLL ATTENDANCE CYCLE
      ===================================================================== */}
      {activeTab === 'payroll-cycle' && (
        <div className="space-y-6">
          {/* Cycle Rule Explanation & Summary Cards */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25 mb-2">
                  <CalendarRange className="w-3.5 h-3.5" />
                  قاعدة الرواتب المعتمدة في Nexus (من يوم 21 بالشهر السابق حتى يوم 20 بالشهر الحالي)
                </div>
                <h2 className="text-xl font-extrabold text-[#192631]">
                  شيت البصمة والحضور الشهري (دورة {selectedCycleLabel})
                </h2>
                <p className="text-xs text-[#192631]/70 mt-1">
                  يتم إغلاق البصمة وحساب الإضافي والغياب والسلف وعهد المواقع <span className="font-mono text-[#b45309]">RCB</span> يوم 20 من كل شهر ليتم الصرف المالي في موعده المحدد.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCycleLabel}
                  onChange={(e) => setSelectedCycleLabel(e.target.value)}
                  aria-label="اختيار دورة الرواتب 21 إلى 20"
                  className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#123524]"
                >
                  <option value="21/09/2026 → 20/10/2026">دورة 21/09/2026 → 20/10/2026 (الجارية)</option>
                  <option value="21/08/2026 → 20/09/2026">دورة 21/08/2026 → 20/09/2026 (مغلقة)</option>
                  <option value="21/07/2026 → 20/08/2026">دورة 21/07/2026 → 20/08/2026 (مغلقة)</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#192631]/70 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={payrollSearch}
                    onChange={(e) => setPayrollSearch(e.target.value)}
                    placeholder="بحث عن موظف في الشيت..."
                    className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl pr-8 pl-3 py-2 text-xs text-[#192631] placeholder-[#192631]/40"
                  />
                </div>
              </div>
            </div>

            {/* Financial Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-3">
                <div className="text-[11px] text-[#192631]/70">إجمالي الرواتب الأساسية</div>
                <div className="text-base font-extrabold text-[#192631] mt-1 font-mono">
                  {payrollSummary.totalBase.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-3">
                <div className="text-[11px] text-[#123524]">إضافي المواقع (Overtime)</div>
                <div className="text-base font-extrabold text-[#123524] mt-1 font-mono">
                  +{payrollSummary.totalOvertime.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-3">
                <div className="text-[11px] text-[#e04b2a]">المكافآت والحوافز</div>
                <div className="text-base font-extrabold text-[#e04b2a] mt-1 font-mono">
                  +{payrollSummary.totalBonuses.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-3">
                <div className="text-[11px] text-[#b45309]">استرداد سلف وعهد RCB</div>
                <div className="text-base font-extrabold text-[#b45309] mt-1 font-mono">
                  -{payrollSummary.totalAdvancesAndRcb.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-3">
                <div className="text-[11px] text-red-700">خصم التأخير والجزاءات</div>
                <div className="text-base font-extrabold text-red-700 mt-1 font-mono">
                  -{payrollSummary.totalPenaltiesAndLate.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-xl p-3">
                <div className="text-[11px] text-[#123524] font-bold">صافي الرواتب الجاهز للصرف</div>
                <div className="text-base font-extrabold text-[#123524] mt-1 font-mono">
                  {payrollSummary.totalNetPayable.toLocaleString()} ج.م
                </div>
              </div>
            </div>
          </div>

          {/* 21->20 Attendance & Payroll Sheet Table */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs md:text-sm">
                <thead className="bg-[#f5f5f5]/90 text-[#192631]/70 text-xs uppercase border-b border-[#192631]/10">
                  <tr>
                    <th className="py-3.5 px-3">الموظف والموقع</th>
                    <th className="py-3.5 px-3">الراتب الأساسي</th>
                    <th className="py-3.5 px-3">أيام العمل / الحضور</th>
                    <th className="py-3.5 px-3">ساعات الإضافي</th>
                    <th className="py-3.5 px-3">دقائق التأخير</th>
                    <th className="py-3.5 px-3">إجازات معتمدة</th>
                    <th className="py-3.5 px-3">سلف وعهد (RCB)</th>
                    <th className="py-3.5 px-3">مكافآت / جزاءات</th>
                    <th className="py-3.5 px-3">صافي المستحق</th>
                    <th className="py-3.5 px-3">جاهزية الصرف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192631]/10">
                  {filteredPayroll.map((rec) => {
                    const netSalary =
                      rec.baseSalaryEgp +
                      rec.overtimeValueEgp +
                      rec.bonusesEgp -
                      rec.lateDeductionEgp -
                      rec.pettyCashAndAdvanceDeductionEgp -
                      rec.penaltiesEgp;

                    return (
                      <tr key={rec.id} className="hover:bg-[#192631]/[0.05]">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#192631]">{rec.name}</div>
                          <div className="text-[11px] text-[#192631]/70">
                            {rec.empCode} • {rec.primarySite}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-[#192631]">
                          {rec.baseSalaryEgp.toLocaleString()} ج.م
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-bold text-[#123524]">
                            {rec.presentDays}
                          </span>{' '}
                          / <span className="font-mono text-[#192631]/70">{rec.cycleWorkingDays} يوم</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-mono text-[#123524] font-bold">
                            {rec.siteOvertimeHours} ساعة
                          </div>
                          <div className="text-[11px] font-mono text-[#192631]/70">
                            +{rec.overtimeValueEgp.toLocaleString()} ج.م
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-mono text-[#b45309]">{rec.lateMinutesTotal} د</div>
                          <div className="text-[11px] font-mono text-red-700">
                            {rec.lateDeductionEgp > 0 ? `-${rec.lateDeductionEgp} ج.م` : 'مسامحة'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[#e04b2a]">
                          {rec.approvedLeaveDays} يوم
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-mono font-bold text-[#b45309]">
                            {rec.pettyCashAndAdvanceDeductionEgp > 0
                              ? `-${rec.pettyCashAndAdvanceDeductionEgp.toLocaleString()} ج.م`
                              : '0 ج.م'}
                          </div>
                          <div className="text-[10px] text-[#192631]/70 max-w-[160px] truncate">
                            {rec.rcbSettlementStatus}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-0.5 font-mono text-xs">
                            {rec.bonusesEgp > 0 && (
                              <span className="text-[#123524]">+{rec.bonusesEgp.toLocaleString()} مكافأة</span>
                            )}
                            {rec.penaltiesEgp > 0 && (
                              <span className="text-red-700">-{rec.penaltiesEgp.toLocaleString()} جزاء</span>
                            )}
                            {rec.bonusesEgp === 0 && rec.penaltiesEgp === 0 && (
                              <span className="text-[#192631]/60">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-extrabold text-[#192631] text-sm">
                          {netSalary.toLocaleString()} ج.م
                        </td>
                        <td className="py-3.5 px-3">
                          {rec.readinessStatus === 'Ready for Disbursement' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                              <CheckCircle2 className="w-3 h-3" /> جاهز للصرف
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-[#b45309] border border-amber-500/30">
                                {rec.readinessStatus === 'Pending RCB Clearance'
                                  ? 'معلق تسوية RCB'
                                  : 'مراجعة HR'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleApprovePayrollRecord(rec.id)}
                                className="px-2 py-1 rounded bg-[#e04b2a] hover:bg-[#c83e1f] text-[#192631] text-[10px] font-bold"
                              >
                                اعتماد
                              </button>
                            </div>
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
          SUB-TAB 4: STAFF REQUESTS, PETTY CASH ADVANCES & DIRECTIVES
      ===================================================================== */}
      {activeTab === 'staff-requests' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Submit New Request / Directive Form */}
          <div className="bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 space-y-4 h-fit">
            <div>
              <h2 className="text-lg font-extrabold text-[#192631] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#b45309]" />
                تسجيل طلب جديد / عهدة موقع RCB / قرار إداري
              </h2>
              <p className="text-xs text-[#192631]/70 mt-1">
                يرتبط مباشرة بشيت رواتب دورة 21→20 ومنظومة تسويات عهد المواقع RCB
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#192631]/85 mb-1">
                  نوع الطلب أو القرار الإداري
                </label>
                <select
                  value={newReqCategory}
                  onChange={(e) => setNewReqCategory(e.target.value as RequestCategory)}
                  className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2.5 text-[#192631] focus:outline-none focus:border-amber-500"
                >
                  <option value="petty_cash">طلب عهدة موقع نقدية (يرتبط بكود تسوية RCB)</option>
                  <option value="advance">طلب سلفة شخصية (تُخصم من راتب 21→20)</option>
                  <option value="leave">طلب إجازة اعتيادية / عارضة</option>
                  <option value="directive">قرار إداري / مكافأة أو جزاء خصم</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192631]/85 mb-1">
                  الموظف / المهندس المعني
                </label>
                <select
                  value={newReqEmployee}
                  onChange={(e) => setNewReqEmployee(e.target.value)}
                  className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2.5 text-[#192631] focus:outline-none focus:border-amber-500"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} — {s.assignedZone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192631]/85 mb-1">
                  عنوان الطلب / البند المختصر
                </label>
                <input
                  type="text"
                  required
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  placeholder="مثال: عهدة شراء خامات سباكة عاجلة لمشروع C096..."
                  className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] placeholder-[#192631]/40"
                />
              </div>

              {newReqCategory === 'petty_cash' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#b45309] mb-1">
                      قيمة العهدة (ج.م)
                    </label>
                    <input
                      type="number"
                      value={newReqAmount}
                      onChange={(e) => setNewReqAmount(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#b45309] mb-1">
                      كود التسوية المربوط (RCB)
                    </label>
                    <input
                      type="text"
                      value={newReqRcbCode}
                      onChange={(e) => setNewReqRcbCode(e.target.value)}
                      placeholder="RCB-C096-22"
                      className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#b45309] font-mono"
                    />
                  </div>
                </div>
              )}

              {(newReqCategory === 'advance' || newReqCategory === 'directive') && (
                <div>
                  <label className="block text-xs font-bold text-[#192631]/85 mb-1">
                    القيمة المالية (ج.م)
                  </label>
                  <input
                    type="number"
                    value={newReqAmount}
                    onChange={(e) => setNewReqAmount(e.target.value)}
                    placeholder="2000"
                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                  />
                </div>
              )}

              {newReqCategory === 'leave' && (
                <div>
                  <label className="block text-xs font-bold text-[#192631]/85 mb-1">
                    عدد أيام الإجازة المطلوبة
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={newReqLeaveDays}
                    onChange={(e) => setNewReqLeaveDays(e.target.value)}
                    className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#192631]/85 mb-1">
                  التفاصيل والمبررات الهندسية / الإدارية
                </label>
                <textarea
                  rows={3}
                  value={newReqDetails}
                  onChange={(e) => setNewReqDetails(e.target.value)}
                  placeholder="اكتب تفاصيل الصرف أو سبب الإجازة أو منطوق القرار الإداري..."
                  className="w-full bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl px-3 py-2 text-[#192631] placeholder-[#192631]/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow-lg shadow-amber-600/25 transition"
              >
                إرسال وتوثيق في سجل الطلبات والـ HR
              </button>
            </form>
          </div>

          {/* Requests & Directives Feed */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-md border border-[#192631]/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#192631]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#192631] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#b45309]" />
                  سجل طلبات الموظفين، العهد النقدية RCB، والقرارات الإدارية
                </h3>
                <p className="text-xs text-[#192631]/70">
                  اعتماد مباشر من الإدارة العليا (بيير صفوت) والموارد البشرية (ميرنا ماجد) والحسابات (ميلاد هارون)
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'الكل' },
                  { id: 'petty_cash', label: 'عهد مواقع RCB' },
                  { id: 'advance', label: 'سلف شخصية' },
                  { id: 'leave', label: 'إجازات' },
                  { id: 'directive', label: 'قرارات وجزاءات' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRequestCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      requestCategoryFilter === tab.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#f5f5f5]/90 text-[#192631]/70 hover:text-[#192631] border border-[#192631]/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#f5f5f5]/90 border border-[#192631]/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#e04b2a] bg-[#e04b2a]/10 px-2 py-0.5 rounded">
                        {req.reqCode}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#192631]/[0.05] text-[#b45309]">
                        {req.categoryLabelAr}
                      </span>
                      {req.rcbCode && (
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-[#b45309] border border-amber-500/30">
                          🔗 {req.rcbCode}
                        </span>
                      )}
                      {req.amountEgp !== undefined && (
                        <span className="text-xs font-mono font-extrabold text-[#123524]">
                          {req.amountEgp.toLocaleString()} ج.م
                        </span>
                      )}
                      {req.leaveDays !== undefined && (
                        <span className="text-xs font-mono font-bold text-[#192631]">
                          {req.leaveDays} أيام إجازة
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#192631]">{req.title}</h4>
                    <p className="text-xs text-[#192631]/85 leading-relaxed">{req.details}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#192631]/70">
                      <span>مقدم الطلب: <strong className="text-[#192631]">{req.employeeName}</strong> ({req.employeeRole})</span>
                      <span>•</span>
                      <span>التوقيت: {req.dateSubmitted}</span>
                    </div>
                    <div className="text-[11px] text-[#e04b2a]">
                      ملاحظة الاعتماد: {req.approverNote}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                    {req.status === 'Approved' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#123524]/10 text-[#123524] border border-[#123524]/25">
                        <CheckCircle2 className="w-3.5 h-3.5" /> معتمد ✅
                      </span>
                    )}
                    {req.status === 'Enforced' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-red-700 border border-rose-500/30">
                        <Scale className="w-3.5 h-3.5" /> قرار نافذ ⚡
                      </span>
                    )}
                    {req.status === 'Rejected' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#192631]/[0.05] text-red-700">
                        <XCircle className="w-3.5 h-3.5" /> مرفوض
                      </span>
                    )}
                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateRequestStatus(req.id, 'Approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                        >
                          <Check className="w-3.5 h-3.5" /> اعتماد
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/40 text-red-700 border border-rose-500/30 transition"
                        >
                          <X className="w-3.5 h-3.5" /> رفض
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrWhereaboutsHub;
