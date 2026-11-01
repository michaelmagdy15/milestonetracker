import React, { useState, useEffect } from 'react';
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
    RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export const FieldCompanionApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'gps' | 'qr' | 'snag' | 'boq'>('gps');
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
    const [punchTime, setPunchTime] = useState<string | null>(null);

    // Geofence states
    const siteCoordinates = { lat: 24.5384, lng: 54.4339, name: 'Saadiyat Cultural Pavilion (Zone 4)' };
    const userDistance = 38; // 38 meters away (inside 150m boundary)

    // Surprise Roll-Call Modal (تمام مفاجئ)
    const [showRollCall, setShowRollCall] = useState<boolean>(false);
    const [rollCallCountdown, setRollCallCountdown] = useState<number>(60);

    // QR Blueprint Scanner State
    const [scannedDrawing, setScannedDrawing] = useState<{
        sheet: string;
        rev: string;
        title: string;
        status: 'IFC Approved' | 'Superseded Warning' | 'Pending Consultant';
        discrepancy?: string;
    } | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(false);

    // Voice & Snag Logger
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [snagDescription, setSnagDescription] = useState<string>('');
    const [snagPhotoAttached, setSnagPhotoAttached] = useState<boolean>(false);
    const [pendingOfflineLogs, setPendingOfflineLogs] = useState<number>(0);

    // BOQ Daily Slider Values
    const [rebarProgress, setRebarProgress] = useState<number>(65);
    const [formworkProgress, setFormworkProgress] = useState<number>(80);
    const [concretePourProgress, setConcretePourProgress] = useState<number>(45);

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

    const handleGpsPunchIn = () => {
        if (userDistance > 150) {
            toast.error(`Outside Site Geofence! You are ${userDistance}m away (Max: 150m).`);
            return;
        }
        setIsPunchedIn(true);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setPunchTime(timeStr);
        toast.success(`Verified On-Site! Geofenced punch-in confirmed at ${timeStr}`);
    };

    const triggerSurpriseRollCall = () => {
        setRollCallCountdown(60);
        setShowRollCall(true);
    };

    const confirmRollCall = () => {
        setShowRollCall(false);
        toast.success('Surprise Roll-Call (تمام مفاجئ) verified! +5 EPI points logged.');
    };

    const simulateQrScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setScannedDrawing({
                sheet: 'DEC-STR-B02-C12',
                rev: 'Rev 04',
                title: 'Basement 02 Foundation & Retaining Wall Reinforcement',
                status: 'IFC Approved',
            });
            toast.success('Drawing QR Verified: Rev 04 is currently IFC Approved on site!');
        }, 1200);
    };

    const simulateVoiceRecord = () => {
        if (!isRecording) {
            setIsRecording(true);
            toast('Recording site audio memo...', { icon: '🎙️' });
            setTimeout(() => {
                setIsRecording(false);
                setSnagDescription('Reinforcement cover spacers on grid axis C-4 missing 50mm requirement. Instructed subcontractor to fix before concrete pour.');
                toast.success('Voice transcription converted to structured WIR snag notice!');
            }, 2500);
        }
    };

    const handleSubmitSnag = () => {
        if (!snagDescription) {
            toast.error('Please record or type a snag description.');
            return;
        }
        if (!isOnline) {
            setPendingOfflineLogs(prev => prev + 1);
            toast('Stored in Offline Local Queue. Will auto-sync when back online.', { icon: '💾' });
        } else {
            toast.success('Site inspection notice & snag logged to Document Control!');
        }
        setSnagDescription('');
        setSnagPhotoAttached(false);
    };

    const handleSyncOffline = () => {
        if (pendingOfflineLogs === 0) {
            toast('All offline logs are already synchronized.', { icon: '✨' });
            return;
        }
        setPendingOfflineLogs(0);
        toast.success('Synchronized all offline site logs with Cloud Document Control!');
    };

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-orange-glow">
                            <Smartphone className="w-4 h-4" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Field Companion Mobile Suite
                        </h1>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            v2.4 Field OS
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                        Engineered for Resident Civil, MEP & Fit-Out Site Engineers. High-contrast site visibility, offline sync, geofencing & QR verification.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={triggerSurpriseRollCall}
                        className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all"
                    >
                        <Clock className="w-3.5 h-3.5" /> Trigger Roll-Call Test (تمام مفاجئ)
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
                        {isOnline ? 'Online (Site 5G)' : 'Offline (Basement Mode)'}
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
                            Head Office spot-check protocol. Verify your active GPS position on <strong className="text-white">Saadiyat Cultural Pavilion</strong> before the timer expires.
                        </p>

                        <div className="text-4xl font-black font-mono text-orange-400 mb-6">
                            00:{rollCallCountdown.toString().padStart(2, '0')}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmRollCall}
                                className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-mono font-bold text-sm shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> I AM ON SITE (VERIFY GPS)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Device Simulator Frame (Centered) */}
            <div className="flex justify-center">
                <div className="w-full max-w-[420px] bg-[#0c0c0c] border-[6px] border-[#222] rounded-[48px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative min-h-[760px]">
                    {/* Top Device Speaker Notch / Dynamic Island */}
                    <div className="h-6 bg-[#0c0c0c] flex items-center justify-between px-7 pt-2 select-none z-20">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">09:41</span>
                        <div className="w-24 h-4 bg-black rounded-full border border-white/10 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500/80 mr-1.5 animate-pulse"></span>
                            <span className="text-[8px] font-mono text-slate-400">DEC FIELD OS</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                            <span>100%</span>
                        </div>
                    </div>

                    {/* App Header Inside Simulator */}
                    <div className="p-4 bg-gradient-to-b from-[#181818] to-[#121212] border-b border-white/5 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-400 block">
                                Civil Resident Engineer
                            </span>
                            <h3 className="text-sm font-black text-white font-mono">
                                Eng. Mohamed Saber
                            </h3>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                                <MapPin className="w-2.5 h-2.5 text-emerald-400" /> {siteCoordinates.name}
                            </span>
                        </div>
                        {pendingOfflineLogs > 0 && (
                            <button
                                onClick={handleSyncOffline}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse"
                            >
                                <RefreshCw className="w-2.5 h-2.5" /> Sync ({pendingOfflineLogs})
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
                                            Zone 4 Polygon Boundary: <strong className="text-emerald-400">Within {userDistance}m</strong> of site datum.
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] text-left space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Site Coordinates:</span>
                                            <span className="text-slate-300">{siteCoordinates.lat}°N, {siteCoordinates.lng}°E</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">GPS Accuracy:</span>
                                            <span className="text-emerald-400 font-bold">&plusmn; 3.2m (RTK High Precision)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Anti-Spoofing Status:</span>
                                            <span className="text-emerald-400 font-bold">Hardware Keystore Signed</span>
                                        </div>
                                    </div>

                                    {isPunchedIn ? (
                                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-center">
                                            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                                            Active On Site Since {punchTime}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGpsPunchIn}
                                            className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> PUNCH IN (SITE GEOFENCE)
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
                                            <span className="text-white font-bold text-sm">6.5 hrs</span>
                                        </div>
                                        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                                            <span className="text-slate-500 text-[10px] block">Roll-Call Score</span>
                                            <span className="text-emerald-400 font-bold text-sm">100% (2/2)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: QR BLUEPRINT VERIFIER */}
                        {activeTab === 'qr' && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 text-center space-y-3">
                                    <div className="relative w-48 h-48 mx-auto rounded-2xl bg-black/80 border-2 border-dashed border-orange-500/40 overflow-hidden flex flex-col items-center justify-center">
                                        {isScanning && (
                                            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce top-1/2"></div>
                                        )}
                                        <QrCode className="w-16 h-16 text-slate-600 mb-2" />
                                        <span className="text-[10px] text-slate-400">Point at drawing title block QR</span>
                                    </div>

                                    <button
                                        onClick={simulateQrScan}
                                        disabled={isScanning}
                                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                        {isScanning ? 'Scanning Blueprint...' : 'Scan Drawing QR Stamp'}
                                    </button>
                                </div>

                                {scannedDrawing && (
                                    <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                                Verified Drawing
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {scannedDrawing.status}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-bold text-xs">{scannedDrawing.sheet} ({scannedDrawing.rev})</h4>
                                        <p className="text-[11px] text-slate-300">{scannedDrawing.title}</p>
                                        <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 flex justify-between">
                                            <span>Issued: 28 Oct 2026</span>
                                            <span className="text-emerald-400 font-bold">Approved For Construction</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: VOICE & PHOTO SNAG LOGGER */}
                        {activeTab === 'snag' && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                            Quick WIR / Snag Notice
                                        </span>
                                        <button
                                            onClick={simulateVoiceRecord}
                                            className={clsx(
                                                'px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all',
                                                isRecording
                                                    ? 'bg-red-500 text-white border-red-400 animate-pulse'
                                                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            )}
                                        >
                                            <Mic className="w-3 h-3" />
                                            {isRecording ? 'Listening...' : 'Voice Dictate'}
                                        </button>
                                    </div>

                                    <textarea
                                        value={snagDescription}
                                        onChange={(e) => setSnagDescription(e.target.value)}
                                        placeholder="Record voice or type site observation / snag item..."
                                        rows={3}
                                        className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 outline-none text-xs"
                                    />

                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setSnagPhotoAttached(!snagPhotoAttached)}
                                            className={clsx(
                                                'px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all',
                                                snagPhotoAttached
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                                            )}
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                            {snagPhotoAttached ? 'Photo Attached (1)' : 'Snap Photo'}
                                        </button>

                                        <button
                                            onClick={handleSubmitSnag}
                                            className="px-4 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center gap-1"
                                        >
                                            <Send className="w-3 h-3" /> Submit Log
                                        </button>
                                    </div>
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
                                            Slide to record today's verified work package installation.
                                        </p>
                                    </div>

                                    {/* Slider 1 */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-white font-bold">Package 02 - Rebar Fixing</span>
                                            <span className="text-orange-400 font-bold">{rebarProgress}% (13 T)</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={rebarProgress}
                                            onChange={(e) => setRebarProgress(Number(e.target.value))}
                                            className="w-full accent-orange-500 cursor-pointer"
                                        />
                                    </div>

                                    {/* Slider 2 */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-white font-bold">Package 02 - Shuttering / Formwork</span>
                                            <span className="text-cyan-400 font-bold">{formworkProgress}% (320 m²)</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formworkProgress}
                                            onChange={(e) => setFormworkProgress(Number(e.target.value))}
                                            className="w-full accent-cyan-400 cursor-pointer"
                                        />
                                    </div>

                                    {/* Slider 3 */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-white font-bold">Package 03 - Ready-Mix Concrete Pour</span>
                                            <span className="text-emerald-400 font-bold">{concretePourProgress}% (45 m³)</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={concretePourProgress}
                                            onChange={(e) => setConcretePourProgress(Number(e.target.value))}
                                            className="w-full accent-emerald-400 cursor-pointer"
                                        />
                                    </div>

                                    <button
                                        onClick={() => toast.success('Daily BOQ Progress synced with Master Extract & Billing!')}
                                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-orange-glow hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Save Daily BOQ Progress
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Simulator Bottom Navigation Bar */}
                    <div className="p-2 bg-[#121212] border-t border-white/5 grid grid-cols-4 gap-1 text-center font-mono">
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
                            <span className="text-[9px] font-bold">QR Verify</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('snag')}
                            className={clsx(
                                'p-2 rounded-xl flex flex-col items-center gap-1 transition-all',
                                activeTab === 'snag' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'
                            )}
                        >
                            <Mic className="w-4 h-4" />
                            <span className="text-[9px] font-bold">Voice Snag</span>
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
                    </div>

                    {/* Bottom Home Indicator Bar */}
                    <div className="h-4 bg-[#0c0c0c] flex items-center justify-center pb-1">
                        <div className="w-28 h-1 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
