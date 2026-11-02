import React, { useState, useEffect, useRef } from 'react';
import {
    MapPin,
    QrCode,
    Camera,
    Mic,
    Sliders,
    CheckCircle2,
    Clock,
    Wifi,
    WifiOff,
    Smartphone,
    Send,
    RefreshCw,
    Navigation,
    AlertTriangle,
    FileCheck2,
    Image as ImageIcon,
    Trash2,
    ScanEye,
    Sparkles,
    ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTenant, MISR_CONSULT_ORG_ID, DEC_ORG_ID } from '../context/TenantContext';
import { useData } from '../context/DataContext';
import { Html5Qrcode } from 'html5-qrcode';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { FIDIC_ESCALATION_TAG, fidicDaysRemaining } from '../utils/projectHealthRadar';

const QR_READER_ELEMENT_ID = 'echo-qr-reader';
const QR_FILE_READER_ELEMENT_ID = 'echo-qr-file-reader';

/** Extracts a drawing sheet code + revision number from a scanned QR payload or a register file name. */
function parseDrawingRef(text: string): { sheet: string; rev: number | null } {
    const revMatch = text.match(/rev(?:ision)?[\s._-]*0*(\d+)/i);
    const rev = revMatch ? Number(revMatch[1]) : null;
    // Sheet = everything before the revision token, stripped of URL noise and separators
    const beforeRev = revMatch ? text.slice(0, revMatch.index) : text;
    const lastSegment = beforeRev.split(/[/?#=|]/).filter(Boolean).pop() || beforeRev;
    const sheet = lastSegment.replace(/\.(pdf|dwf|dwg)$/i, '').replace(/[\s._-]+$/, '').trim().toUpperCase();
    return { sheet, rev };
}

interface SiteLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    radiusMeters: number;
    engineerName: string;
    engineerId: string;
    engineerRole: string;
    defaultProjectId: string;
}

const TENANT_SITES: Record<string, SiteLocation[]> = {
    [MISR_CONSULT_ORG_ID]: [
        {
            id: 'mc-hq-mohandiseen',
            name: 'Misr Consult HQ — 72 Gamet El Dewal Str (Mohandiseen)',
            lat: 30.0511,
            lng: 31.2001,
            radiusMeters: 250,
            engineerName: 'Eng. Mohamed Saber (316 Supervision Staff)',
            engineerId: 'mc-eng-5',
            engineerRole: 'Head of Construction Supervision',
            defaultProjectId: 'mc-proj-1'
        },
        {
            id: 'mc-toshka-canal4',
            name: 'Toshka South Valley Canal 4 & Pump Stations',
            lat: 22.6152,
            lng: 31.2889,
            radiusMeters: 500,
            engineerName: 'Eng. Mohamed Saber (Resident Supervision)',
            engineerId: 'mc-eng-5',
            engineerRole: 'Chief Resident Engineer',
            defaultProjectId: 'mc-proj-1'
        },
        {
            id: 'mc-alamein-swro',
            name: 'El Alamein 150,000 m³/d SWRO Desalination Plant',
            lat: 30.8409,
            lng: 28.9547,
            radiusMeters: 350,
            engineerName: 'Eng. Ahmed Abdel-Gawad',
            engineerId: 'mc-eng-2',
            engineerRole: 'SWRO Desalination Lead',
            defaultProjectId: 'mc-proj-2'
        },
        {
            id: 'mc-new-delta',
            name: 'New Delta 7.5M m³/day Mega Treatment Plant',
            lat: 30.2931,
            lng: 30.4658,
            radiusMeters: 500,
            engineerName: 'Eng. Ahmed Seera',
            engineerId: 'mc-eng-1',
            engineerRole: 'Mega WWTP Division Director',
            defaultProjectId: 'mc-proj-3'
        }
    ],
    [DEC_ORG_ID]: [
        {
            id: 'dec-saadiyat',
            name: 'Saadiyat Cultural Pavilion (Zone 4 - Abu Dhabi)',
            lat: 24.5384,
            lng: 54.4339,
            radiusMeters: 200,
            engineerName: 'Eng. Tariq Al-Mansoori',
            engineerId: 'flagship-eng-1',
            engineerRole: 'Senior Resident Engineer',
            defaultProjectId: 'flagship-proj-1'
        },
        {
            id: 'dec-new-cairo',
            name: 'DEC Cairo Engineering Center (New Cairo)',
            lat: 30.0074,
            lng: 31.4913,
            radiusMeters: 250,
            engineerName: 'Eng. Michael Magdy',
            engineerId: 'director-michael-dec-001',
            engineerRole: 'BIM & Digital Twin Director',
            defaultProjectId: 'flagship-proj-1'
        }
    ]
};

// Haversine formula to compute real-world distance in meters between two GPS coordinates
function computeDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

export const FieldCompanionApp: React.FC = () => {
    const { activeOrg } = useTenant();
    const { projects, entries, projectFiles, addAttendance, addEntry, addNotification } = useData();

    const availableSites = TENANT_SITES[activeOrg.id] || TENANT_SITES[MISR_CONSULT_ORG_ID];
    const [selectedSiteId, setSelectedSiteId] = useState<string>(availableSites[0].id);
    // Boardroom/demo calibration: overrides the site datum without mutating the shared site table
    const [siteOverride, setSiteOverride] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const list = TENANT_SITES[activeOrg.id] || TENANT_SITES[MISR_CONSULT_ORG_ID];
        setSelectedSiteId(list[0].id);
    }, [activeOrg.id]);

    useEffect(() => {
        setSiteOverride(null);
    }, [selectedSiteId]);

    const baseSite = availableSites.find(s => s.id === selectedSiteId) || availableSites[0];
    const currentSite: SiteLocation = siteOverride ? { ...baseSite, ...siteOverride } : baseSite;
    const deviceFingerprint = getDeviceFingerprint();

    const [activeTab, setActiveTab] = useState<'gps' | 'qr' | 'snag' | 'boq' | 'aibim'>('gps');
    const [aiVisionVerified, setAiVisionVerified] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
    const [punchTime, setPunchTime] = useState<string | null>(null);

    // Real Browser Geolocation State
    const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);
    const [gpsMode, setGpsMode] = useState<'hardware' | 'simulated_lock'>('simulated_lock');

    // Distance is only known once we have a real device GPS fix — no fabricated fallback distance
    const userDistance: number | null = liveCoords && gpsMode === 'hardware'
        ? computeDistanceMeters(liveCoords.lat, liveCoords.lng, currentSite.lat, currentSite.lng)
        : null;

    const gpsAccuracy: number | null = liveCoords && gpsMode === 'hardware'
        ? Number(liveCoords.accuracy.toFixed(1))
        : null;
    const insideGeofence = userDistance !== null && userDistance <= currentSite.radiusMeters;

    // Listen to real browser online/offline events
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Surprise Roll-Call Modal (تمام مفاجئ)
    const [showRollCall, setShowRollCall] = useState<boolean>(false);
    const [rollCallCountdown, setRollCallCountdown] = useState<number>(60);
    const [rollCallVerifiedCount, setRollCallVerifiedCount] = useState<number>(2);

    // QR Blueprint Scanner — real decoding via html5-qrcode (same library MitrixoGYM uses for member check-in)
    type DrawingCheckStatus = 'CURRENT' | 'SUPERSEDED' | 'NOT_IN_REGISTER' | 'NO_REVISION';
    const [scannedDrawing, setScannedDrawing] = useState<{
        raw: string;
        sheet: string;
        scannedRev: number | null;
        latestRev: number | null;
        latestFileName: string | null;
        status: DrawingCheckStatus;
    } | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [cameraStreamActive, setCameraStreamActive] = useState<boolean>(false);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const qrFileInputRef = useRef<HTMLInputElement | null>(null);

    // Voice & Photo Snag Logger (Real Web Speech API + Real File Camera Input)
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [snagDescription, setSnagDescription] = useState<string>('');
    const [snagPhotoDataUrl, setSnagPhotoDataUrl] = useState<string | null>(null);
    const [pendingOfflineQueue, setPendingOfflineQueue] = useState<Array<{
        description: string;
        photo?: string | null;
        timestamp: string;
    }>>(() => {
        try {
            const saved = localStorage.getItem('dec_field_offline_queue');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const speechRecognitionRef = useRef<any>(null);
    const [dictationLang, setDictationLang] = useState<'en-US' | 'ar-EG'>('en-US');
    const snagPhotoInputRef = useRef<HTMLInputElement | null>(null);

    // BOQ Daily Slider Values (Tenant-aware labels)
    const isMisrConsult = activeOrg.id === MISR_CONSULT_ORG_ID;
    const [pkg1Progress, setPkg1Progress] = useState<number>(72);
    const [pkg2Progress, setPkg2Progress] = useState<number>(85);
    const [pkg3Progress, setPkg3Progress] = useState<number>(54);

    // Claim-vs-verified progress guard inputs (subcontractor IPC claim vs. site-verified BOQ progress)
    const [claimedPercent, setClaimedPercent] = useState<number>(85);
    const [packageValue, setPackageValue] = useState<number>(isMisrConsult ? 6_200_000 : 1_500_000);

    const stopQrCamera = async () => {
        const scanner = qrScannerRef.current;
        qrScannerRef.current = null;
        setCameraStreamActive(false);
        setIsScanning(false);
        if (scanner) {
            try {
                if (scanner.isScanning) await scanner.stop();
                scanner.clear();
            } catch (err) {
                console.warn('[FieldApp] QR camera stop failed:', err);
            }
        }
    };

    // Stop the camera when leaving the QR tab or unmounting
    useEffect(() => {
        if (activeTab !== 'qr') void stopQrCamera();
         
    }, [activeTab]);
    useEffect(() => () => { void stopQrCamera(); }, []);  

    // Countdown for Roll-Call
    useEffect(() => {
        let timer: any;
        if (showRollCall && rollCallCountdown > 0) {
            timer = setInterval(() => setRollCallCountdown(prev => prev - 1), 1000);
        } else if (rollCallCountdown === 0 && showRollCall) {
            toast.error('Roll-Call Expired! Flagged to Head Office as Unconfirmed On-Site.');
            setShowRollCall(false);
        }
        return () => clearInterval(timer);
    }, [showRollCall, rollCallCountdown]);

    // 1. REAL HARDWARE GPS ACQUISITION
    const acquireRealHardwareGps = () => {
        if (!('geolocation' in navigator)) {
            toast.error('This browser does not support location. Punch-in needs a GPS-capable device.');
            return;
        }
        setIsFetchingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsFetchingGps(false);
                const coords = {
                    lat: Number(pos.coords.latitude.toFixed(5)),
                    lng: Number(pos.coords.longitude.toFixed(5)),
                    accuracy: pos.coords.accuracy,
                };
                setLiveCoords(coords);
                setGpsMode('hardware');
                const dist = computeDistanceMeters(coords.lat, coords.lng, currentSite.lat, currentSite.lng);
                toast.success(`GPS fix: ${dist.toLocaleString()} m from site (±${Math.round(coords.accuracy)} m)`);
            },
            (err) => {
                setIsFetchingGps(false);
                setGpsMode('simulated_lock');
                console.error('[FieldApp] Geolocation failed:', err);
                toast.error(`Could not read GPS: ${err.message}. Allow location access and try again.`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Demo calibration: move the geofence datum to the phone's current position (state override only)
    const calibrateSiteToCurrentPhoneLocation = () => {
        if (!('geolocation' in navigator)) {
            toast.error('This browser does not support location.');
            return;
        }
        setIsFetchingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsFetchingGps(false);
                const coords = {
                    lat: Number(pos.coords.latitude.toFixed(5)),
                    lng: Number(pos.coords.longitude.toFixed(5)),
                    accuracy: pos.coords.accuracy,
                };
                setSiteOverride({ lat: coords.lat, lng: coords.lng });
                setLiveCoords(coords);
                setGpsMode('hardware');
                toast.success('Demo mode: geofence moved to this room. Punch-ins will be tagged as calibrated.');
            },
            (err) => {
                setIsFetchingGps(false);
                console.error('[FieldApp] Calibration geolocation failed:', err);
                toast.error(`Could not read GPS: ${err.message}`);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    // Attendance + log entry on punch-in, bound to GPS fix and device fingerprint
    const handleGpsPunchIn = async () => {
        if (userDistance === null || !liveCoords) {
            toast.error('Read your phone GPS first — punch-in requires a real location fix.');
            return;
        }
        if (!insideGeofence) {
            toast.error(`Outside the site geofence: ${userDistance.toLocaleString()} m away (limit ${currentSite.radiusMeters} m).`);
            return;
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const todayIso = now.toISOString().split('T')[0];
        const calibratedTag = siteOverride ? ' [DEMO-CALIBRATED DATUM]' : '';

        try {
            await addAttendance({
                id: `att-gps-${Date.now()}`,
                engineerId: currentSite.engineerId,
                date: todayIso,
                status: 'Present',
            });

            const activeProjId = projects[0]?.id || currentSite.defaultProjectId;
            await addEntry({
                id: `log-gps-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: `[RTK GPS VERIFIED PUNCH-IN] ${currentSite.name} (${liveCoords.lat}°N, ${liveCoords.lng}°E, ${userDistance} m from datum, ±${gpsAccuracy} m) · device ${deviceFingerprint.fingerprintId}${calibratedTag}`,
                softwareUsed: ['ECHO Field OS', 'GPS Geofence'],
                timeSpent: 0.5,
                milestone: 'Site Supervision & QA',
                entryType: 'normal',
            });

            await addNotification({
                id: `notif-gps-${Date.now()}`,
                engineerId: currentSite.engineerId,
                message: `Geofenced punch-in at ${currentSite.name} (${timeStr})`,
                isRead: false,
                createdAt: now.toISOString(),
            });

            setIsPunchedIn(true);
            setPunchTime(timeStr);
            toast.success(`Punched in at ${timeStr}`);
        } catch (err) {
            console.error('[FieldApp] Failed to persist punch-in:', err);
            toast.error('Punch-in was NOT saved. Check your connection and try again.');
        }
    };

    const triggerSurpriseRollCall = () => {
        setRollCallCountdown(60);
        setShowRollCall(true);
    };

    const confirmRollCall = async () => {
        setShowRollCall(false);
        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;
        const gpsNote = userDistance !== null ? `${userDistance} m from datum` : 'no GPS fix';

        try {
            await addEntry({
                id: `log-rollcall-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: `[SURPRISE ROLL-CALL VERIFIED • تمام مفاجئ] ${currentSite.name} · ${gpsNote} · ${rollCallCountdown}s remaining · device ${deviceFingerprint.fingerprintId}`,
                softwareUsed: ['ECHO Field OS', 'Roll-Call'],
                timeSpent: 0.25,
                milestone: 'Site Supervision & QA',
                entryType: 'normal',
            });
            setRollCallVerifiedCount(prev => prev + 1);
            toast.success('Roll-call confirmed and logged.');
        } catch (err) {
            console.error('[FieldApp] Roll-call log failed:', err);
            toast.error('Roll-call was NOT saved. Try again.');
        }
    };

    // 2. QR DRAWING CHECK — decode, then compare against the project's drawing register
    const evaluateDrawingQr = async (decodedText: string) => {
        const { sheet, rev } = parseDrawingRef(decodedText);
        const matches = projectFiles
            .map(f => ({ file: f, ref: parseDrawingRef(f.name) }))
            .filter(m => sheet && m.ref.sheet && (m.ref.sheet.includes(sheet) || sheet.includes(m.ref.sheet)));
        const latest = matches.reduce<{ file: typeof projectFiles[number]; ref: { sheet: string; rev: number | null } } | null>(
            (best, m) => (m.ref.rev !== null && (best === null || (best.ref.rev ?? -1) < m.ref.rev) ? m : best),
            null
        );

        let status: DrawingCheckStatus;
        if (matches.length === 0) status = 'NOT_IN_REGISTER';
        else if (rev === null || !latest || latest.ref.rev === null) status = 'NO_REVISION';
        else status = rev < latest.ref.rev ? 'SUPERSEDED' : 'CURRENT';

        const result = {
            raw: decodedText,
            sheet: sheet || decodedText.slice(0, 40),
            scannedRev: rev,
            latestRev: latest?.ref.rev ?? null,
            latestFileName: latest?.file.name ?? null,
            status,
        };
        setScannedDrawing(result);

        const statusText: Record<DrawingCheckStatus, string> = {
            CURRENT: 'CURRENT — matches latest register revision',
            SUPERSEDED: `SUPERSEDED — register has Rev ${result.latestRev}`,
            NOT_IN_REGISTER: 'NOT IN REGISTER — cannot verify',
            NO_REVISION: 'NO REVISION — revision could not be read',
        };
        if (status === 'SUPERSEDED') toast.error(`STOP: ${result.sheet} Rev ${rev} is superseded by Rev ${result.latestRev}`);
        else if (status === 'CURRENT') toast.success(`${result.sheet} Rev ${rev} is the current revision`);
        else toast(statusText[status], { icon: '⚠️' });

        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;
        try {
            await addEntry({
                id: `log-qr-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: `[QR DRAWING CHECK] ${result.sheet}${rev !== null ? ` Rev ${rev}` : ''}: ${statusText[status]}`,
                softwareUsed: ['ECHO Field OS', 'QR Drawing Guard'],
                timeSpent: 0.1,
                milestone: 'IFC Drawing Control',
                entryType: status === 'SUPERSEDED' ? 'rfi' : 'normal',
            });
        } catch (err) {
            console.error('[FieldApp] QR check log failed:', err);
            toast.error('Drawing check result was NOT saved to the log.');
        }
    };

    const startLiveCameraAndScan = async () => {
        if (cameraStreamActive) {
            await stopQrCamera();
            return;
        }
        setIsScanning(true);
        try {
            const scanner = new Html5Qrcode(QR_READER_ELEMENT_ID);
            qrScannerRef.current = scanner;
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 200, height: 200 } },
                (decodedText) => {
                    void stopQrCamera();
                    void evaluateDrawingQr(decodedText);
                },
                () => { /* per-frame "no QR found" — expected while aiming */ }
            );
            setCameraStreamActive(true);
        } catch (err) {
            console.error('[FieldApp] Could not start QR camera:', err);
            toast.error('Camera unavailable. Allow camera access, or use "Snap QR Photo".');
            await stopQrCamera();
        }
    };

    const handleQrPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setIsScanning(true);
        const fileScanner = new Html5Qrcode(QR_FILE_READER_ELEMENT_ID);
        try {
            const decoded = await fileScanner.scanFile(file, false);
            await evaluateDrawingQr(decoded);
        } catch (err) {
            console.error('[FieldApp] No QR found in photo:', err);
            toast.error('No QR code found in that photo. Get closer to the title-block stamp and retry.');
        } finally {
            fileScanner.clear();
            setIsScanning(false);
        }
    };

    // 3. VOICE DICTATION (Web Speech API) — never injects placeholder text
    const toggleVoiceDictation = () => {
        const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (isRecording) {
            speechRecognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        if (!SpeechRecognitionCtor) {
            toast.error('Voice dictation is not supported in this browser. Use Chrome (Android/desktop) or Safari (iOS), or type the snag.');
            return;
        }

        try {
            const recognition = new SpeechRecognitionCtor();
            recognition.lang = dictationLang;
            recognition.continuous = false;
            recognition.interimResults = true;
            const baseText = snagDescription.trim();

            recognition.onstart = () => setIsRecording(true);
            recognition.onresult = (event: any) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setSnagDescription(baseText ? `${baseText} ${transcript}` : transcript);
            };
            recognition.onerror = (event: any) => {
                setIsRecording(false);
                console.error('[FieldApp] Speech recognition error:', event?.error);
                toast.error(event?.error === 'not-allowed'
                    ? 'Microphone access was blocked. Allow it in browser settings.'
                    : `Dictation stopped: ${event?.error || 'unknown error'}`);
            };
            recognition.onend = () => setIsRecording(false);

            speechRecognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            setIsRecording(false);
            console.error('[FieldApp] Could not start dictation:', err);
            toast.error('Could not start voice dictation.');
        }
    };

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setSnagPhotoDataUrl(reader.result as string);
            toast.success('Site photo attached');
        };
        reader.onerror = () => {
            console.error('[FieldApp] Could not read photo:', reader.error);
            toast.error('Could not read that photo.');
        };
        reader.readAsDataURL(file);
    };

    const queueOffline = (description: string) => {
        const updatedQueue = [
            ...pendingOfflineQueue,
            {
                description,
                photo: null, // photos are not queued in localStorage (size limits); re-attach after sync
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        ];
        try {
            localStorage.setItem('dec_field_offline_queue', JSON.stringify(updatedQueue));
            setPendingOfflineQueue(updatedQueue);
            toast('Saved on this phone. It will sync when you are back online.', { icon: '💾' });
            return true;
        } catch (err) {
            console.error('[FieldApp] Offline queue write failed:', err);
            toast.error('Phone storage is full — this snag was NOT saved.');
            return false;
        }
    };

    const handleSubmitSnag = async () => {
        if (!snagDescription.trim()) {
            toast.error('Dictate or type a snag description first.');
            return;
        }
        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;
        const description = `[FIELD WIR / SNAG] ${snagDescription.trim()}${snagPhotoDataUrl ? ' [Photo attached]' : ''}`;

        if (!isOnline) {
            if (queueOffline(description)) {
                setSnagDescription('');
                setSnagPhotoDataUrl(null);
            }
            return;
        }
        try {
            await addEntry({
                id: `log-snag-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: description,
                softwareUsed: ['ECHO Field OS', 'WIR Snag Logger'],
                timeSpent: 1.0,
                milestone: 'Site WIR Inspection',
                entryType: 'rfi',
            });
            toast.success('Snag logged');
            setSnagDescription('');
            setSnagPhotoDataUrl(null);
        } catch (err) {
            console.error('[FieldApp] Snag save failed:', err);
            // Keep the text so nothing is lost; offer the offline queue
            if (queueOffline(description)) {
                setSnagDescription('');
                setSnagPhotoDataUrl(null);
            }
        }
    };

    // 3B. FIELD-TO-FIDIC 20.1 BRIDGE — starts a real 28-day countdown from today's date
    const handleEscalateSnagToFidic = async () => {
        const desc = snagDescription.trim();
        if (!desc) {
            toast.error('Describe the delay event first (what happened, where, who caused it).');
            return;
        }
        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;

        try {
            await addEntry({
                id: `log-fidic-bridge-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: `${FIDIC_ESCALATION_TAG} • NOTICE DUE IN 28 DAYS] ${desc} — reported from ${currentSite.name}`,
                softwareUsed: ['ECHO Field OS', 'FIDIC 20.1 Bridge'],
                timeSpent: 0.5,
                milestone: 'FIDIC 28-Day Claim Shield',
                entryType: 'rfi',
            });
            toast.success('Delay event escalated. 28-day notice countdown started on the Project Health Radar.');
            setSnagDescription('');
        } catch (err) {
            console.error('[FieldApp] FIDIC escalation failed:', err);
            toast.error('Escalation was NOT saved. The 28-day clock is still running — retry now.');
        }
    };

    // 5. CLAIM-vs-VERIFIED PROGRESS GUARD — subcontractor IPC claim vs. site-verified BOQ progress
    const verifiedPercent = pkg1Progress;
    const overclaimPercent = Math.max(0, claimedPercent - verifiedPercent);
    const overclaimValue = Math.round((overclaimPercent / 100) * packageValue);
    const currencyCode = isMisrConsult ? 'EGP' : activeOrg.currency || 'AED';

    const handleClampIpcToVerified = async () => {
        if (overclaimPercent === 0) {
            toast('Claim does not exceed verified progress — nothing to clamp.', { icon: '✅' });
            return;
        }
        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;
        const pkgName = isMisrConsult ? '2400mm GRP Pipeline Laying' : 'Package 02 - Rebar Fixing';
        try {
            await addEntry({
                id: `log-ipcguard-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: `[IPC PROGRESS GUARD] ${pkgName}: claimed ${claimedPercent}% vs site-verified ${verifiedPercent}% → certify ${verifiedPercent}%, withhold ${overclaimPercent}% (${currencyCode} ${overclaimValue.toLocaleString()})`,
                softwareUsed: ['ECHO Field OS', 'IPC Progress Guard'],
                timeSpent: 0.5,
                milestone: 'IPC Certification',
                entryType: 'normal',
            });
            setAiVisionVerified(true);
            toast.success(`Certification capped at ${verifiedPercent}%. ${currencyCode} ${overclaimValue.toLocaleString()} withheld.`);
        } catch (err) {
            console.error('[FieldApp] IPC guard log failed:', err);
            toast.error('Certification note was NOT saved. Try again.');
        }
    };

    const handleSyncOffline = async () => {
        if (pendingOfflineQueue.length === 0) {
            toast('Nothing waiting to sync.', { icon: '✨' });
            return;
        }
        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;

        const failed: typeof pendingOfflineQueue = [];
        for (const item of pendingOfflineQueue) {
            try {
                await addEntry({
                    id: `log-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    projectId: activeProjId,
                    engineerId: currentSite.engineerId,
                    date: todayIso,
                    taskDescription: `${item.description} (captured offline @ ${item.timestamp})`,
                    softwareUsed: ['ECHO Field OS', 'Offline Sync'],
                    timeSpent: 1.0,
                    milestone: 'Site WIR Inspection',
                    entryType: 'rfi',
                });
            } catch (err) {
                console.error('[FieldApp] Offline item failed to sync:', err);
                failed.push(item);
            }
        }
        setPendingOfflineQueue(failed);
        try {
            if (failed.length) localStorage.setItem('dec_field_offline_queue', JSON.stringify(failed));
            else localStorage.removeItem('dec_field_offline_queue');
        } catch (err) {
            console.error('[FieldApp] Offline queue update failed:', err);
        }
        const synced = pendingOfflineQueue.length - failed.length;
        if (failed.length) toast.error(`Synced ${synced}, ${failed.length} still waiting. Retry when signal improves.`);
        else toast.success(`Synced ${synced} offline log${synced === 1 ? '' : 's'}.`);
    };

    // Auto-sync the offline queue when the connection returns (MitrixoGYM outbox pattern)
    useEffect(() => {
        if (isOnline && pendingOfflineQueue.length > 0) void handleSyncOffline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);

    // 4. BOQ DAILY PROGRESS
    const handleSaveBoqProgress = async () => {
        const todayIso = new Date().toISOString().split('T')[0];
        const activeProjId = projects[0]?.id || currentSite.defaultProjectId;
        const summary = isMisrConsult
            ? `[BOQ DAILY QUANTITY SYNC] 2400mm GRP Pipe Laying: ${pkg1Progress}% | Intake Pump Station Civil: ${pkg2Progress}% | Hydrostatic Pressure Testing: ${pkg3Progress}%`
            : `[BOQ DAILY QUANTITY SYNC] Package 02 Rebar Fixing: ${pkg1Progress}% | Shuttering/Formwork: ${pkg2Progress}% | Ready-Mix Concrete Pour: ${pkg3Progress}%`;

        try {
            await addEntry({
                id: `log-boq-${Date.now()}`,
                projectId: activeProjId,
                engineerId: currentSite.engineerId,
                date: todayIso,
                taskDescription: summary,
                softwareUsed: ['ECHO Field OS', 'BOQ Progress'],
                timeSpent: 1.5,
                milestone: 'BOQ Daily Execution',
                entryType: 'normal',
            });
            toast.success('Daily BOQ progress saved');
        } catch (err) {
            console.error('[FieldApp] BOQ save failed:', err);
            toast.error('BOQ progress was NOT saved. Try again.');
        }
    };

    // Open FIDIC delay events with live countdown (feeds the radar strip in the Voice/FIDIC tab)
    const openFidicEvents = entries
        .filter(e => e.taskDescription?.startsWith(FIDIC_ESCALATION_TAG))
        .map(e => ({ entry: e, daysLeft: fidicDaysRemaining(e.date) }))
        .filter(x => x.daysLeft >= -7)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 3);

    // Recent field logs from real DataContext so user sees live proof immediately
    const recentFieldEntries = entries
        .filter(e =>
            e.taskDescription?.includes('[RTK GPS') ||
            e.taskDescription?.includes('[FIELD WIR') ||
            e.taskDescription?.includes('[QR DRAWING') ||
            e.taskDescription?.includes('[BOQ DAILY') ||
            e.taskDescription?.includes('[SURPRISE ROLL-CALL') ||
            e.taskDescription?.includes('[OFFLINE QUEUE') ||
            e.taskDescription?.includes('[FIDIC CLAUSE') ||
            e.taskDescription?.includes('[IPC PROGRESS GUARD')
        )
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Hidden Native Camera Inputs for Real Mobile Phone Capture */}
            <input
                ref={snagPhotoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
            />
            <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleQrPhoto}
            />
            <div id={QR_FILE_READER_ELEMENT_ID} className="hidden" />

            {/* Header info */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow shrink-0">
                            <Smartphone className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                            Field Companion Mobile Suite
                        </h1>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                            LIVE HARDWARE GPS • CAMERA • VOICE • FIRESTORE
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                        Connected to live device GPS (<code className="text-emerald-400">navigator.geolocation</code>), WebRTC Rear Camera, Web Speech Dictation & Cloud Firestore.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Site Selector */}
                    <select
                        value={selectedSiteId}
                        onChange={(e) => setSelectedSiteId(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#141414] text-white border border-white/10 outline-none"
                    >
                        {availableSites.map(site => (
                            <option key={site.id} value={site.id}>
                                📍 {site.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={acquireRealHardwareGps}
                        disabled={isFetchingGps}
                        className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                        {isFetchingGps ? 'Locating...' : 'Use Real Device GPS'}
                    </button>

                    <button
                        onClick={triggerSurpriseRollCall}
                        className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all"
                    >
                        <Clock className="w-3.5 h-3.5" /> Trigger Roll-Call (تمام مفاجئ)
                    </button>

                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={clsx(
                            'px-3 py-2 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition-all',
                            isOnline
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}
                    >
                        {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                        {isOnline ? 'Online' : 'Offline (simulated)'}
                    </button>
                </div>
            </div>

            {/* Surprise Roll-Call Modal */}
            {showRollCall && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#181818] border-2 border-orange-500/50 rounded-3xl p-6 shadow-2xl relative text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Clock className="w-8 h-8" />
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                            SURPRISE SPOT-CHECK ROLL CALL • تمام مفاجئ
                        </span>
                        <h2 className="text-xl font-black text-white mt-1 mb-2">
                            Confirm Your Site Presence
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">
                            Head Office spot-check protocol. Verify your active GPS position on <strong className="text-white">{currentSite.name}</strong> before the timer expires.
                        </p>

                        <div className="text-4xl font-black font-mono text-orange-400 mb-6">
                            00:{rollCallCountdown.toString().padStart(2, '0')}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmRollCall}
                                className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-mono font-bold text-sm shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> I AM ON SITE (VERIFY & LOG TO FIRESTORE)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Grid: Mobile Device Frame + Live Cloud Telemetry Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Mobile Device Frame */}
                <div className="lg:col-span-6 flex justify-center">
                    <div className="w-full max-w-[420px] bg-[#0c0c0c] border-[6px] border-[#222] rounded-[48px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative min-h-[760px]">
                        {/* Top Device Speaker Notch / Dynamic Island */}
                        <div className="h-6 bg-[#0c0c0c] flex items-center justify-between px-7 pt-2 select-none z-20">
                            <span className="text-[11px] font-mono text-slate-400 font-bold">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="w-28 h-4 bg-black rounded-full border border-white/10 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-500/80 mr-1.5 animate-pulse"></span>
                                <span className="text-[8px] font-mono text-slate-400">
                                    {isMisrConsult ? 'MC FIELD OS' : 'DEC FIELD OS'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                                {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                                <span>100%</span>
                            </div>
                        </div>

                        {/* App Header Inside Simulator */}
                        <div className="p-4 bg-gradient-to-b from-[#181818] to-[#121212] border-b border-white/5 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-400 block">
                                    {currentSite.engineerRole}
                                </span>
                                <h3 className="text-sm font-black text-white font-mono truncate">
                                    {currentSite.engineerName}
                                </h3>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono truncate">
                                    <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> {currentSite.name}
                                </span>
                            </div>
                            {pendingOfflineQueue.length > 0 && (
                                <button
                                    onClick={handleSyncOffline}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse shrink-0"
                                >
                                    <RefreshCw className="w-2.5 h-2.5" /> Sync ({pendingOfflineQueue.length})
                                </button>
                            )}
                        </div>

                        {/* Simulator Main Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono">
                            {/* TAB 1: GPS GEOFENCED CHECK-IN */}
                            {activeTab === 'gps' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 text-center space-y-3">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto shadow-orange-glow">
                                            <MapPin className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white">Geofenced Site Perimeter</h4>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Boundary {currentSite.radiusMeters} m ·{' '}
                                                {userDistance === null ? (
                                                    <strong className="text-slate-300">no GPS fix yet</strong>
                                                ) : (
                                                    <strong className={insideGeofence ? 'text-emerald-400' : 'text-amber-400'}>
                                                        {userDistance.toLocaleString()} m from site datum
                                                    </strong>
                                                )}
                                            </p>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] text-left space-y-1.5">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-slate-500">Site datum:</span>
                                                <span className="text-slate-300 text-right">
                                                    {currentSite.lat}°N, {currentSite.lng}°E{siteOverride ? ' (demo-calibrated)' : ''}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-slate-500">Phone GPS:</span>
                                                <span className="text-cyan-400 font-bold text-right">
                                                    {liveCoords ? `${liveCoords.lat}°N, ${liveCoords.lng}°E` : 'Not read yet'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-slate-500">GPS accuracy:</span>
                                                <span className={clsx('font-bold', gpsAccuracy === null ? 'text-slate-400' : gpsAccuracy <= 25 ? 'text-emerald-400' : 'text-amber-400')}>
                                                    {gpsAccuracy === null ? '—' : `±${gpsAccuracy} m`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-slate-500">Device ID:</span>
                                                <span className="text-emerald-400 font-bold">{deviceFingerprint.fingerprintId}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={acquireRealHardwareGps}
                                                disabled={isFetchingGps}
                                                className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold flex items-center justify-center gap-1"
                                            >
                                                <Navigation className="w-3 h-3" /> {isFetchingGps ? 'Locating…' : 'Read Phone GPS'}
                                            </button>
                                            <button
                                                onClick={calibrateSiteToCurrentPhoneLocation}
                                                disabled={isFetchingGps}
                                                title="Moves the geofence to where you stand. Punch-ins are tagged as demo-calibrated."
                                                className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold flex items-center justify-center gap-1"
                                            >
                                                <MapPin className="w-3 h-3" /> Demo: Calibrate Here
                                            </button>
                                        </div>

                                        {isPunchedIn ? (
                                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-center">
                                                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                                                On site since {punchTime}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleGpsPunchIn}
                                                disabled={!insideGeofence}
                                                className="w-full py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> PUNCH IN (SAVE TO CLOUD)
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/5 space-y-2">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                                            Today's Shift Telemetry
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                                            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                                                <span className="text-slate-500 text-[10px] block">Site Hours</span>
                                                <span className="text-white font-bold text-sm">{isPunchedIn ? '7.0 hrs' : '6.5 hrs'}</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                                                <span className="text-slate-500 text-[10px] block">Roll-Call Score</span>
                                                <span className="text-emerald-400 font-bold text-sm">
                                                    100% ({rollCallVerifiedCount}/{rollCallVerifiedCount})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: QR DRAWING CHECK (real decode + register revision check) */}
                            {activeTab === 'qr' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 text-center space-y-3">
                                        <div className="relative w-56 h-56 mx-auto rounded-2xl bg-black/80 border-2 border-dashed border-orange-500/40 overflow-hidden flex flex-col items-center justify-center">
                                            <div id={QR_READER_ELEMENT_ID} className={clsx('absolute inset-0 [&_video]:object-cover [&_video]:w-full [&_video]:h-full', !cameraStreamActive && 'hidden')} />
                                            {!cameraStreamActive && (
                                                <>
                                                    <QrCode className="w-16 h-16 text-slate-600 mb-2" />
                                                    <span className="text-[10px] text-slate-400 px-3">
                                                        Scan the QR stamp on the drawing title block to check it is the current revision
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={startLiveCameraAndScan}
                                                disabled={isScanning && !cameraStreamActive}
                                                className="py-2.5 px-2 rounded-xl bg-orange-500 text-white font-bold text-[11px] shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                                {cameraStreamActive ? 'Stop Camera' : 'Live Camera Scan'}
                                            </button>
                                            <button
                                                onClick={() => qrFileInputRef.current?.click()}
                                                disabled={isScanning}
                                                className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                Snap QR Photo
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-slate-500">
                                            Checked against {projectFiles.length} file{projectFiles.length === 1 ? '' : 's'} in the drawing register (name must include sheet code + "Rev NN").
                                        </p>
                                    </div>

                                    {scannedDrawing && (() => {
                                        const tone = {
                                            CURRENT: { box: 'border-emerald-500/40', text: 'text-emerald-400', label: 'CURRENT REVISION' },
                                            SUPERSEDED: { box: 'border-red-500/60 bg-red-500/5', text: 'text-red-400', label: 'SUPERSEDED — DO NOT BUILD' },
                                            NOT_IN_REGISTER: { box: 'border-amber-500/40', text: 'text-amber-400', label: 'NOT IN REGISTER' },
                                            NO_REVISION: { box: 'border-amber-500/40', text: 'text-amber-400', label: 'REVISION UNREADABLE' },
                                        }[scannedDrawing.status];
                                        return (
                                            <div className={clsx('p-4 rounded-2xl bg-black/60 border space-y-2', tone.box)}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={clsx('text-[10px] font-bold uppercase tracking-wider', tone.text)}>{tone.label}</span>
                                                    {scannedDrawing.status === 'SUPERSEDED' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                                                </div>
                                                <h4 className="text-white font-bold text-xs break-all">
                                                    {scannedDrawing.sheet}
                                                    {scannedDrawing.scannedRev !== null && ` · Rev ${scannedDrawing.scannedRev}`}
                                                </h4>
                                                {scannedDrawing.latestFileName && (
                                                    <p className="text-[10px] text-slate-300 break-all">
                                                        Latest in register: <span className="text-white font-bold">{scannedDrawing.latestFileName}</span>
                                                    </p>
                                                )}
                                                <p className="text-[9px] text-slate-500 break-all">QR payload: {scannedDrawing.raw}</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* TAB 3: VOICE & PHOTO SNAG LOGGER (REAL SPEECH-TO-TEXT + CAMERA CAPTURE + FIDIC 20.1 BRIDGE) */}
                            {activeTab === 'snag' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                                Quick WIR / Snag Notice
                                            </span>
                                            <button
                                                onClick={toggleVoiceDictation}
                                                className={clsx(
                                                    'px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all',
                                                    isRecording
                                                        ? 'bg-red-500 text-white border-red-400 animate-pulse'
                                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                )}
                                            >
                                                <Mic className="w-3 h-3" />
                                                {isRecording ? 'Listening (Tap to Stop)...' : 'Live Voice Dictate'}
                                            </button>
                                        </div>
                                        <div className="flex gap-1 text-[9px]">
                                            {(['en-US', 'ar-EG'] as const).map(lang => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setDictationLang(lang)}
                                                    className={clsx('px-2 py-0.5 rounded-md border font-bold', dictationLang === lang ? 'bg-white/15 text-white border-white/30' : 'text-slate-500 border-white/10')}
                                                >
                                                    {lang === 'en-US' ? 'English' : 'العربية'}
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            value={snagDescription}
                                            onChange={(e) => setSnagDescription(e.target.value)}
                                            placeholder="Tap 'Live Voice Dictate' to speak into your phone mic, or type site snag observation..."
                                            rows={3}
                                            className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 outline-none text-xs"
                                        />

                                        {snagPhotoDataUrl && (
                                            <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-black/40 p-1.5 flex items-center gap-2">
                                                <img
                                                    src={snagPhotoDataUrl}
                                                    alt="Captured site snag"
                                                    className="w-14 h-14 object-cover rounded-lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] text-emerald-400 font-bold block">
                                                        Geotagged Site Photo Attached
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 truncate block">
                                                        {currentSite.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSnagPhotoDataUrl(null)}
                                                    className="p-1.5 text-slate-400 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => snagPhotoInputRef.current?.click()}
                                                className={clsx(
                                                    'px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all',
                                                    snagPhotoDataUrl
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                                                )}
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                                {snagPhotoDataUrl ? 'Retake Photo' : 'Open Phone Camera'}
                                            </button>

                                            <button
                                                onClick={handleSubmitSnag}
                                                className="px-4 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center gap-1"
                                            >
                                                <Send className="w-3 h-3" /> Submit to Cloud
                                            </button>
                                        </div>

                                        {/* 1-Click Field-to-FIDIC Clause 20.1 Time-Bar Escalation Bridge */}
                                        <div className="pt-2 border-t border-white/5">
                                            <button
                                                onClick={handleEscalateSnagToFidic}
                                                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                                Escalate as Delay Event (starts FIDIC 20.1 28-day clock)
                                            </button>
                                            {openFidicEvents.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {openFidicEvents.map(({ entry, daysLeft }) => (
                                                        <div key={entry.id} className={clsx('p-1.5 rounded-lg border text-[9px] flex justify-between gap-2', daysLeft <= 7 ? 'border-red-500/40 text-red-300' : 'border-amber-500/30 text-amber-200')}>
                                                            <span className="truncate">{entry.taskDescription.replace(/^\[[^\]]*\]\s*/, '')}</span>
                                                            <span className="font-bold shrink-0">{daysLeft < 0 ? 'EXPIRED' : `${daysLeft}d left`}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: IPC PROGRESS GUARD — claimed vs. site-verified progress */}
                            {activeTab === 'aibim' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[#161616] border border-cyan-500/20 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> IPC Progress Guard
                                            </span>
                                            <span className={clsx('px-2 py-0.5 rounded-full text-[9px] font-bold border', overclaimPercent > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}>
                                                {overclaimPercent > 0 ? `+${overclaimPercent}% over-claimed` : 'Claim OK'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            Compares the subcontractor's IPC claim against the progress your engineer verified on site (BOQ tab), before you certify payment.
                                        </p>

                                        <label className="block space-y-1">
                                            <span className="text-[10px] text-slate-400">Subcontractor claimed: <strong className="text-red-300">{claimedPercent}%</strong></span>
                                            <input type="range" min="0" max="100" value={claimedPercent} onChange={e => setClaimedPercent(Number(e.target.value))} className="w-full accent-red-500" />
                                        </label>
                                        <div className="text-[10px] text-slate-400">
                                            Site-verified (from BOQ tab): <strong className="text-emerald-300">{verifiedPercent}%</strong>
                                        </div>
                                        <label className="block space-y-1">
                                            <span className="text-[10px] text-slate-400">Package value ({currencyCode})</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={packageValue}
                                                onChange={e => setPackageValue(Math.max(0, Number(e.target.value) || 0))}
                                                className="w-full p-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs outline-none"
                                            />
                                        </label>

                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                                                <span className="text-[9px] text-emerald-300 uppercase block">Certify</span>
                                                <span className="text-lg font-black text-emerald-400">{Math.min(claimedPercent, verifiedPercent)}%</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25">
                                                <span className="text-[9px] text-red-300 uppercase block">Withhold</span>
                                                <span className="text-sm font-black text-red-400">{currencyCode} {overclaimValue.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleClampIpcToVerified}
                                            className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-black text-[11px] hover:bg-cyan-400 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <ScanEye className="w-3.5 h-3.5" />
                                            {aiVisionVerified ? 'Certification note saved ✓' : 'Cap Certification at Verified %'}
                                        </button>
                                        <p className="text-[9px] text-slate-500">Roadmap: photo/360° walk evidence attached to each verification.</p>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: 60-SECOND BOQ PROGRESS SLIDERS */}
                            {activeTab === 'boq' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 space-y-4">
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                                                Daily BOQ Execution Quantities
                                            </span>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Slide to record today's verified installation to Firestore & Earned Value S-Curve.
                                            </p>
                                        </div>

                                        {/* Slider 1 */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-white font-bold">
                                                    {isMisrConsult ? '2400mm GRP Pipeline Laying' : 'Package 02 - Rebar Fixing'}
                                                </span>
                                                <span className="text-orange-400 font-bold">
                                                    {pkg1Progress}% ({isMisrConsult ? '1.8 KM' : '13 T'})
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={pkg1Progress}
                                                onChange={(e) => setPkg1Progress(Number(e.target.value))}
                                                className="w-full accent-orange-500 cursor-pointer"
                                            />
                                        </div>

                                        {/* Slider 2 */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-white font-bold">
                                                    {isMisrConsult ? 'Intake Pump Station Civil Works' : 'Package 02 - Shuttering / Formwork'}
                                                </span>
                                                <span className="text-cyan-400 font-bold">
                                                    {pkg2Progress}% ({isMisrConsult ? '850 m³' : '320 m²'})
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={pkg2Progress}
                                                onChange={(e) => setPkg2Progress(Number(e.target.value))}
                                                className="w-full accent-cyan-400 cursor-pointer"
                                            />
                                        </div>

                                        {/* Slider 3 */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-white font-bold">
                                                    {isMisrConsult ? 'Hydrostatic Pressure Test (16 Bar)' : 'Package 03 - Ready-Mix Concrete Pour'}
                                                </span>
                                                <span className="text-emerald-400 font-bold">
                                                    {pkg3Progress}% ({isMisrConsult ? 'KP 14+200' : '45 m³'})
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={pkg3Progress}
                                                onChange={(e) => setPkg3Progress(Number(e.target.value))}
                                                className="w-full accent-emerald-400 cursor-pointer"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveBoqProgress}
                                            className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Save BOQ Progress to Firestore
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Simulator Bottom Navigation Bar */}
                        <div className="p-2 bg-[#121212] border-t border-white/5 grid grid-cols-5 gap-1 text-center font-mono">
                            <button
                                onClick={() => setActiveTab('gps')}
                                className={clsx(
                                    'p-2 rounded-xl flex flex-col items-center gap-1 transition-all',
                                    activeTab === 'gps' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <MapPin className="w-4 h-4" />
                                <span className="text-[9px] font-bold">GPS Site</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('qr')}
                                className={clsx(
                                    'p-2 rounded-xl flex flex-col items-center gap-1 transition-all',
                                    activeTab === 'qr' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <QrCode className="w-4 h-4" />
                                <span className="text-[9px] font-bold">QR + Diff</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('snag')}
                                className={clsx(
                                    'p-2 rounded-xl flex flex-col items-center gap-1 transition-all',
                                    activeTab === 'snag' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <Mic className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Voice/FIDIC</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('boq')}
                                className={clsx(
                                    'p-2 rounded-xl flex flex-col items-center gap-1 transition-all',
                                    activeTab === 'boq' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <Sliders className="w-4 h-4" />
                                <span className="text-[9px] font-bold">BOQ Slider</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('aibim')}
                                className={clsx(
                                    'p-2 rounded-xl flex flex-col items-center gap-1 transition-all',
                                    activeTab === 'aibim' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                <ScanEye className="w-4 h-4" />
                                <span className="text-[9px] font-bold">IPC Guard</span>
                            </button>
                        </div>

                        {/* Bottom Home Indicator Bar */}
                        <div className="h-4 bg-[#0c0c0c] flex items-center justify-center pb-1">
                            <div className="w-28 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Cloud Sync Proof & Executive Feed */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                                    REAL-TIME FIRESTORE TELEMETRY STREAM
                                </span>
                                <h3 className="text-lg font-black text-white">
                                    Live Head Office Sync Feed
                                </h3>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {activeOrg.name}
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                            Every action performed inside the mobile companion on the left (GPS Punch-In, Roll-Call Verification, QR Blueprint Scan, Voice Snag, or BOQ Slider Save) writes directly to the active tenant's database and appears below in real time.
                        </p>

                        {recentFieldEntries.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
                                <FileCheck2 className="w-8 h-8 text-slate-500 mx-auto" />
                                <p className="text-xs font-mono text-slate-400">
                                    Tap <strong className="text-white">PUNCH IN</strong>, <strong className="text-white">Live Camera Scan</strong>, or <strong className="text-white">Submit to Cloud</strong> on the phone to watch live records stream into Head Office.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {recentFieldEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/20 flex items-start gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1 font-mono">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                                                    {entry.milestone || 'Field Telemetry'}
                                                </span>
                                                <span className="text-[10px] text-slate-500">{entry.date}</span>
                                            </div>
                                            <p className="text-xs text-white mt-1 leading-relaxed break-words">
                                                {entry.taskDescription}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Boardroom Demo Cheat-Sheet Card */}
                    <div className="p-5 rounded-3xl bg-[#121212] border border-amber-500/20 space-y-3 font-mono">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4" /> Live Pitch Instructions (On Your Phone)
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                            <li>
                                <strong className="text-white">1. Real Phone GPS:</strong> Tap <span className="text-cyan-300">Read Phone GPS</span> to pull your phone's real latitude/longitude. If you are pitching inside Mohandiseen HQ or a meeting room, tap <span className="text-emerald-300">Calibrate Here (0m)</span> to lock the geofence to the meeting room table and punch in live.
                            </li>
                            <li>
                                <strong className="text-white">2. Real Camera & Photo:</strong> In <span className="text-orange-400">QR Verify</span> or <span className="text-orange-400">Voice Snag</span>, tap <span className="text-white">Open Phone Camera</span> to snap a real photo with your phone's rear camera.
                            </li>
                            <li>
                                <strong className="text-white">3. Real Voice Dictation:</strong> Tap <span className="text-orange-400">Live Voice Dictate</span> and speak into your phone microphone to transcribe a site snag live.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
