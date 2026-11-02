/**
 * Device fingerprinting for field punch-ins.
 * Ported from MitrixoGYM CRM (src/utils/deviceFingerprint.ts), where it binds reception
 * check-ins to a known workstation. In ECHO it binds a GPS punch-in to the phone that made it,
 * so one engineer cannot punch in for a colleague from a different device unnoticed.
 *
 * This is a browser fingerprint (stable per browser profile), NOT a hardware attestation.
 */

export interface DeviceFingerprintPayload {
    fingerprintId: string;
    userAgent: string;
    platform: string;
    language: string;
    hardwareConcurrency: number;
    screenResolution: string;
    pixelRatio: number;
    timezone: string;
    webglRenderer: string;
    collectedAt: string;
}

const STORAGE_KEY = 'echo_device_fingerprint_v1';

function fnv1aHash(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

function readWebglRenderer(): string {
    try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (!gl) return 'no-webgl';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext) return 'webgl-masked';
        return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'unknown');
    } catch {
        return 'webgl-error';
    }
}

export function collectDeviceFingerprint(): DeviceFingerprintPayload {
    const nav = navigator;
    const parts = {
        userAgent: nav.userAgent,
        platform: nav.platform || 'unknown',
        language: nav.language || 'unknown',
        hardwareConcurrency: nav.hardwareConcurrency || 0,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        webglRenderer: readWebglRenderer(),
    };
    const fingerprintId = `DEV-${fnv1aHash(JSON.stringify(parts)).toUpperCase()}`;
    return { fingerprintId, ...parts, collectedAt: new Date().toISOString() };
}

/** Returns a cached fingerprint (stable across reloads), collecting one if needed. */
export function getDeviceFingerprint(): DeviceFingerprintPayload {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached) as DeviceFingerprintPayload;
    } catch (err) {
        console.warn('[Fingerprint] Could not read cached fingerprint:', err);
    }
    const fresh = collectDeviceFingerprint();
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch (err) {
        console.warn('[Fingerprint] Could not cache fingerprint:', err);
    }
    return fresh;
}
