import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updatePassword,
    updateProfile,
    sendPasswordResetEmail,
    type User as FirebaseUser,
} from 'firebase/auth';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
} from 'firebase/firestore';
import { firebaseAuth, secondaryFirebaseAuth, firestoreDb } from './firebase';
import type { Organization } from '../types';

const DB_STORAGE_KEY = 'whitelabel_firebase_cache_v3';
const SESSION_STORAGE_KEY = 'whitelabel_firebase_session_v3';
const LEGACY_AUTH_KEY = 'dec-tracker-auth';

export const PIERRE_OWNER_EMAIL = 'pierre@nexus-contracting.com';
export const PIERRE_OWNER_PASSWORD = 'Pierre@Nexus2026!';
export const PIERRE_OWNER_ID = 'owner-pierre-afifi-001';

export const MICHAEL_SYSADMIN_EMAIL = 'michael@nexus-contracting.com';
export const MICHAEL_SYSADMIN_PASSWORD = 'Michael@Nexus2026!';
export const MICHAEL_SYSADMIN_ID = 'sysadmin-michael-001';

export const DEFAULT_ADMIN_EMAIL = PIERRE_OWNER_EMAIL;
export const DEFAULT_ADMIN_PASSWORD = PIERRE_OWNER_PASSWORD;
export const DEFAULT_ADMIN_ID = PIERRE_OWNER_ID;
export const DEFAULT_ORG_ID = 'org-default';

export interface StoredAuthUser {
    id: string;
    email: string;
    password?: string;
    user_metadata: {
        name?: string;
        full_name?: string;
        role?: string;
        organization_id?: string;
        hourly_rate?: number;
        weekly_goal_hours?: number;
    };
    created_at: string;
}

interface LocalDatabase {
    users: StoredAuthUser[];
    organizations: Organization[];
    projects: any[];
    engineers: any[];
    entries: any[];
    attendance: any[];
    milestones: any[];
    tasks: any[];
    leave_requests: any[];
    notifications: any[];
    meetings: any[];
    project_files: any[];
    time_entries: any[];
    app_usage_log: any[];
    audit_log: any[];
    office_expenses: any[];
    project_phases: any[];
    performance_evaluations: any[];
    boq_items: any[];
    subcontractors: any[];
    payment_applications: any[];
    variation_orders: any[];
    rfis: any[];
    app_settings: Array<{ id?: string; key: string; value: string; organization_id?: string; updated_at?: string }>;
}

const ALL_TABLES: Array<keyof LocalDatabase> = [
    'users',
    'organizations',
    'projects',
    'engineers',
    'entries',
    'attendance',
    'milestones',
    'tasks',
    'leave_requests',
    'notifications',
    'meetings',
    'project_files',
    'time_entries',
    'app_usage_log',
    'audit_log',
    'office_expenses',
    'project_phases',
    'performance_evaluations',
    'boq_items',
    'subcontractors',
    'payment_applications',
    'variation_orders',
    'rfis',
    'app_settings',
];

const getCollectionName = (table: keyof LocalDatabase) => `mt_${String(table)}`;

const stripUndefined = (obj: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.keys(obj).forEach(k => {
        if (obj[k] !== undefined) {
            cleaned[k] = obj[k];
        }
    });
    return cleaned;
};

const getSeedUsersAndEngineers = (now: string) => {
    const pierreUser: StoredAuthUser = {
        id: PIERRE_OWNER_ID,
        email: PIERRE_OWNER_EMAIL,
        password: PIERRE_OWNER_PASSWORD,
        user_metadata: {
            name: 'Eng. Pierre Afifi',
            full_name: 'Eng. Pierre Afifi',
            role: 'admin',
            organization_id: DEFAULT_ORG_ID,
            hourly_rate: 250,
            weekly_goal_hours: 45,
        },
        created_at: now,
    };

    const michaelUser: StoredAuthUser = {
        id: MICHAEL_SYSADMIN_ID,
        email: MICHAEL_SYSADMIN_EMAIL,
        password: MICHAEL_SYSADMIN_PASSWORD,
        user_metadata: {
            name: 'Michael (System Administrator)',
            full_name: 'Michael (System Administrator)',
            role: 'admin',
            organization_id: DEFAULT_ORG_ID,
            hourly_rate: 250,
            weekly_goal_hours: 45,
        },
        created_at: now,
    };

    const pierreEngineer = {
        id: PIERRE_OWNER_ID,
        organization_id: DEFAULT_ORG_ID,
        email: PIERRE_OWNER_EMAIL,
        name: 'Eng. Pierre Afifi',
        role: 'admin',
        hourly_rate: 250,
        weekly_goal_hours: 45,
        location: 'El Nozha El Gedida HQ',
        skills: ['Owner & Founder', 'Architecture', 'Turnkey Contracting', 'Cost Control'],
        created_at: now,
    };

    const michaelEngineer = {
        id: MICHAEL_SYSADMIN_ID,
        organization_id: DEFAULT_ORG_ID,
        email: MICHAEL_SYSADMIN_EMAIL,
        name: 'Michael (System Administrator)',
        role: 'admin',
        hourly_rate: 250,
        weekly_goal_hours: 45,
        location: 'El Nozha El Gedida HQ',
        skills: ['System Administration', 'Platform Architecture', 'Security', 'Operations'],
        created_at: now,
    };

    return {
        users: [pierreUser, michaelUser],
        engineers: [pierreEngineer, michaelEngineer],
    };
};

const createInitialDatabase = (): LocalDatabase => {
    const now = new Date().toISOString();
    const defaultOrg: Organization = {
        id: DEFAULT_ORG_ID,
        name: 'NEXUS CONTRACTING',
        slug: 'nexus-contracting',
        tagline: 'Architecture, Turnkey Contracting & ERP Platform',
        logoUrl: '',
        faviconUrl: '',
        primaryColor: '#e04b2a',
        themeSurface: 'obsidian',
        currency: 'EGP',
        branches: ['El Nozha El Gedida HQ', 'New Cairo - 5th Settlement', 'Madinaty', 'Sheikh Zayed'],
        email: PIERRE_OWNER_EMAIL,
        phone: '+20 127 899 5447',
        address: 'El Nozha El Gedida, Cairo',
        city: 'Cairo',
        country: 'Egypt',
        plan: 'Enterprise',
        createdAt: now,
    };

    const { users, engineers } = getSeedUsersAndEngineers(now);

    return {
        users,
        organizations: [defaultOrg],
        projects: [],
        engineers,
        entries: [],
        attendance: [],
        milestones: [],
        tasks: [],
        leave_requests: [],
        notifications: [
            {
                id: 'notif-welcome-1',
                organization_id: DEFAULT_ORG_ID,
                engineer_id: PIERRE_OWNER_ID,
                message: 'Welcome to NEXUS CONTRACTING! Your workspace is ready.',
                is_read: false,
                created_at: now,
            }
        ],
        meetings: [],
        project_files: [],
        time_entries: [],
        app_usage_log: [],
        audit_log: [],
        office_expenses: [],
        project_phases: [
            { id: 'phase-1', organization_id: DEFAULT_ORG_ID, name: 'Mobilization & Concept', order_index: 0, created_at: now },
            { id: 'phase-2', organization_id: DEFAULT_ORG_ID, name: 'Detailed Engineering', order_index: 1, created_at: now },
            { id: 'phase-3', organization_id: DEFAULT_ORG_ID, name: 'Procurement & Submittals', order_index: 2, created_at: now },
            { id: 'phase-4', organization_id: DEFAULT_ORG_ID, name: 'Site Execution & Construction', order_index: 3, created_at: now },
            { id: 'phase-5', organization_id: DEFAULT_ORG_ID, name: 'Testing, Commissioning & Handover', order_index: 4, created_at: now },
        ],
        performance_evaluations: [],
        boq_items: [],
        subcontractors: [],
        payment_applications: [],
        variation_orders: [],
        rfis: [],
        app_settings: [
            { id: 'target_hours', key: 'target_hours', value: '100', organization_id: DEFAULT_ORG_ID, updated_at: now }
        ],
    };
};

if (typeof window !== 'undefined') {
    localStorage.removeItem(LEGACY_AUTH_KEY);
}

const loadDb = (): LocalDatabase => {
    if (typeof window === 'undefined') return createInitialDatabase();
    try {
        const raw = localStorage.getItem(DB_STORAGE_KEY);
        if (!raw) {
            const initial = createInitialDatabase();
            localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
            return initial;
        }
        const parsed = JSON.parse(raw) as LocalDatabase;
        if (!parsed.organizations || parsed.organizations.length === 0) {
            parsed.organizations = createInitialDatabase().organizations;
        }
        if (!parsed.users) parsed.users = [];
        if (!parsed.engineers) parsed.engineers = [];

        // Always ensure Pierre (Owner) and Michael (System Administrator) accounts exist
        const { users: seedUsers, engineers: seedEngineers } = getSeedUsersAndEngineers(new Date().toISOString());
        for (const su of seedUsers) {
            const idx = parsed.users.findIndex(u => u.email.toLowerCase() === su.email.toLowerCase());
            if (idx === -1) {
                parsed.users.push(su);
            } else if (!parsed.users[idx].password) {
                parsed.users[idx].password = su.password;
                parsed.users[idx].user_metadata = { ...parsed.users[idx].user_metadata, role: 'admin' };
            }
        }
        for (const se of seedEngineers) {
            const idx = parsed.engineers.findIndex(e => e.email?.toLowerCase() === se.email.toLowerCase());
            if (idx === -1) {
                parsed.engineers.push(se);
            } else {
                parsed.engineers[idx].role = 'admin';
            }
        }

        if (!parsed.boq_items) parsed.boq_items = [];
        if (!parsed.subcontractors) parsed.subcontractors = [];
        if (!parsed.payment_applications) parsed.payment_applications = [];
        if (!parsed.variation_orders) parsed.variation_orders = [];
        if (!parsed.rfis) parsed.rfis = [];
        return parsed;
    } catch {
        const initial = createInitialDatabase();
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }
};

const saveDb = (db: LocalDatabase) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
};

// Realtime table listeners
type TableChangeListener = (payload: { table: string; eventType: string }) => void;
const tableListeners = new Set<TableChangeListener>();

const notifyTableChange = (table: string, eventType: string) => {
    tableListeners.forEach(listener => {
        try {
            listener({ table, eventType });
        } catch {
            // ignore
        }
    });
};

// Set up live Firestore onSnapshot listeners to keep local cache in sync with Cloud Firestore
let firestoreSubscriptionsStarted = false;
const startFirestoreSync = () => {
    if (typeof window === 'undefined' || firestoreSubscriptionsStarted) return;
    firestoreSubscriptionsStarted = true;

    ALL_TABLES.forEach(table => {
        const colRef = collection(firestoreDb, getCollectionName(table));
        onSnapshot(
            colRef,
            snapshot => {
                const db = loadDb();
                const remoteDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                if (remoteDocs.length > 0 || (table !== 'organizations' && table !== 'engineers' && table !== 'users')) {
                    (db[table] as any[]) = remoteDocs;
                    saveDb(db);
                    notifyTableChange(String(table), 'SYNC');
                }
            },
            err => {
                console.warn(`Firestore listener notice for ${String(table)}:`, err.message);
            }
        );
    });
};

if (typeof window !== 'undefined') {
    startFirestoreSync();
}

// Auth state listeners
type AuthStateCallback = (event: string, session: any) => void;
const authListeners = new Set<AuthStateCallback>();

const buildSession = (user: StoredAuthUser) => ({
    access_token: `fb-token-${user.id}`,
    refresh_token: `fb-refresh-${user.id}`,
    expires_in: 86400,
    token_type: 'bearer',
    user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {},
        app_metadata: { provider: 'firebase' },
        aud: 'authenticated',
        created_at: user.created_at,
    },
});

const getStoredSession = () => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const setStoredSession = (session: any | null) => {
    if (typeof window === 'undefined') return;
    if (!session) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
};

const notifyAuthChange = (event: string, session: any) => {
    authListeners.forEach(cb => {
        try {
            cb(event, session);
        } catch {
            // ignore
        }
    });
};

// Keep Firebase Auth state synchronized
if (typeof window !== 'undefined') {
    onAuthStateChanged(firebaseAuth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
            const db = loadDb();
            const existingUser = db.users.find(u => u.id === fbUser.uid || u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
            const existingEng = db.engineers.find(e => e.id === fbUser.uid || e.email?.toLowerCase() === (fbUser.email || '').toLowerCase());
            const storedUser: StoredAuthUser = existingUser || {
                id: fbUser.uid,
                email: fbUser.email || DEFAULT_ADMIN_EMAIL,
                user_metadata: {
                    name: fbUser.displayName || existingEng?.name || (fbUser.email || 'User').split('@')[0],
                    full_name: fbUser.displayName || existingEng?.name || (fbUser.email || 'User').split('@')[0],
                    role: existingEng?.role || (fbUser.email === DEFAULT_ADMIN_EMAIL ? 'admin' : 'engineer'),
                    organization_id: existingEng?.organization_id || DEFAULT_ORG_ID,
                },
                created_at: new Date().toISOString(),
            };
            const session = buildSession(storedUser);
            setStoredSession(session);
        }
    });
}

// ─── Chainable Query Builder (Backed by Cloud Firestore + Local Cache) ─────
class FirebaseQueryBuilder implements PromiseLike<{ data: any; error: any }> {
    private table: keyof LocalDatabase;
    private operation: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
    private payload: any = null;
    private upsertOpts: { onConflict?: string } = {};
    private filters: Array<(row: any) => boolean> = [];
    private orderConfig: { column: string; ascending: boolean } | null = null;
    private rangeConfig: { from: number; to: number } | null = null;
    private limitCount: number | null = null;
    private isSingle = false;

    constructor(table: keyof LocalDatabase) {
        this.table = table;
    }

    select(_columns: string = '*') {
        return this;
    }

    insert(values: any | any[]) {
        this.operation = 'insert';
        this.payload = values;
        return this;
    }

    update(values: any) {
        this.operation = 'update';
        this.payload = values;
        return this;
    }

    upsert(values: any | any[], opts?: { onConflict?: string }) {
        this.operation = 'upsert';
        this.payload = values;
        this.upsertOpts = opts || {};
        return this;
    }

    delete() {
        this.operation = 'delete';
        return this;
    }

    eq(column: string, value: any) {
        this.filters.push((row) => row[column] === value);
        return this;
    }

    neq(column: string, value: any) {
        this.filters.push((row) => row[column] !== value);
        return this;
    }

    not(column: string, operator: string, value: any) {
        if (operator === 'is' && value === null) {
            this.filters.push((row) => row[column] !== null && row[column] !== undefined);
        } else {
            this.filters.push((row) => row[column] !== value);
        }
        return this;
    }

    gte(column: string, value: any) {
        this.filters.push((row) => row[column] >= value);
        return this;
    }

    lte(column: string, value: any) {
        this.filters.push((row) => row[column] <= value);
        return this;
    }

    in(column: string, values: any[]) {
        this.filters.push((row) => values.includes(row[column]));
        return this;
    }

    order(column: string, opts?: { ascending?: boolean }) {
        this.orderConfig = { column, ascending: opts?.ascending ?? true };
        return this;
    }

    range(from: number, to: number) {
        this.rangeConfig = { from, to };
        return this;
    }

    limit(count: number) {
        this.limitCount = count;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    maybeSingle() {
        this.isSingle = true;
        return this;
    }

    private async executeAsync(): Promise<{ data: any; error: any }> {
        try {
            const db = loadDb();
            const tableData: any[] = (db[this.table] as any[]) || [];
            const colName = getCollectionName(this.table);
            const matchesFilters = (row: any) => this.filters.every(fn => fn(row));

            if (this.operation === 'select') {
                let result = tableData.filter(matchesFilters);

                if (this.orderConfig) {
                    const { column, ascending } = this.orderConfig;
                    result = [...result].sort((a, b) => {
                        const va = a[column] ?? '';
                        const vb = b[column] ?? '';
                        if (va < vb) return ascending ? -1 : 1;
                        if (va > vb) return ascending ? 1 : -1;
                        return 0;
                    });
                }

                if (this.rangeConfig) {
                    result = result.slice(this.rangeConfig.from, this.rangeConfig.to + 1);
                } else if (this.limitCount !== null) {
                    result = result.slice(0, this.limitCount);
                }

                if (this.isSingle) {
                    return { data: result[0] || null, error: null };
                }
                return { data: result, error: null };
            }

            if (this.operation === 'insert') {
                const items = Array.isArray(this.payload) ? this.payload : [this.payload];
                const now = new Date().toISOString();
                const session = getStoredSession();
                const activeOrgId = localStorage.getItem('whitelabel_active_org_id') || session?.user?.user_metadata?.organization_id || DEFAULT_ORG_ID;

                const inserted = items.map(item => stripUndefined({
                    id: item.id || item.key || crypto.randomUUID(),
                    organization_id: item.organization_id || activeOrgId,
                    created_at: item.created_at || now,
                    ...item,
                }));

                (db[this.table] as any[]) = [...tableData, ...inserted];
                saveDb(db);
                notifyTableChange(String(this.table), 'INSERT');

                // Persist to Cloud Firestore
                await Promise.allSettled(
                    inserted.map(row => setDoc(doc(firestoreDb, colName, String(row.id)), row))
                );

                return {
                    data: this.isSingle ? inserted[0] : inserted,
                    error: null,
                };
            }

            if (this.operation === 'update') {
                const updatedRows: any[] = [];
                (db[this.table] as any[]) = tableData.map(row => {
                    if (matchesFilters(row)) {
                        const next = stripUndefined({ ...row, ...this.payload });
                        updatedRows.push(next);
                        return next;
                    }
                    return row;
                });

                if (this.table === 'engineers' && updatedRows.length > 0) {
                    db.users = db.users.map(u => {
                        const matchingEng = updatedRows.find(e => e.id === u.id);
                        if (matchingEng) {
                            return {
                                ...u,
                                user_metadata: {
                                    ...u.user_metadata,
                                    name: matchingEng.name,
                                    role: matchingEng.role,
                                }
                            };
                        }
                        return u;
                    });
                }

                saveDb(db);
                notifyTableChange(String(this.table), 'UPDATE');

                await Promise.allSettled(
                    updatedRows.map(row => setDoc(doc(firestoreDb, colName, String(row.id || row.key)), row, { merge: true }))
                );

                return {
                    data: this.isSingle ? updatedRows[0] || null : updatedRows,
                    error: null,
                };
            }

            if (this.operation === 'upsert') {
                const items = Array.isArray(this.payload) ? this.payload : [this.payload];
                const conflictKey = this.upsertOpts.onConflict || 'id';
                const now = new Date().toISOString();
                const session = getStoredSession();
                const activeOrgId = localStorage.getItem('whitelabel_active_org_id') || session?.user?.user_metadata?.organization_id || DEFAULT_ORG_ID;

                const nextTable = [...tableData];
                const upserted: any[] = [];

                for (const item of items) {
                    const idx = nextTable.findIndex(r => r[conflictKey] !== undefined && r[conflictKey] === item[conflictKey]);
                    if (idx >= 0) {
                        nextTable[idx] = stripUndefined({ ...nextTable[idx], ...item });
                        upserted.push(nextTable[idx]);
                    } else {
                        const docId = item.id || item[conflictKey] || crypto.randomUUID();
                        const created = stripUndefined({
                            id: docId,
                            organization_id: item.organization_id || activeOrgId,
                            created_at: item.created_at || now,
                            ...item,
                        });
                        nextTable.push(created);
                        upserted.push(created);
                    }
                }

                (db[this.table] as any[]) = nextTable;
                saveDb(db);
                notifyTableChange(String(this.table), 'UPSERT');

                await Promise.allSettled(
                    upserted.map(row => {
                        const docId = String(row.id || row[conflictKey] || crypto.randomUUID());
                        return setDoc(doc(firestoreDb, colName, docId), { ...row, id: docId }, { merge: true });
                    })
                );

                return {
                    data: this.isSingle ? upserted[0] || null : upserted,
                    error: null,
                };
            }

            if (this.operation === 'delete') {
                const toDelete = tableData.filter(row => matchesFilters(row));
                const remaining = tableData.filter(row => !matchesFilters(row));
                (db[this.table] as any[]) = remaining;
                saveDb(db);
                notifyTableChange(String(this.table), 'DELETE');

                await Promise.allSettled(
                    toDelete.map(row => deleteDoc(doc(firestoreDb, colName, String(row.id || row.key))))
                );

                return { data: null, error: null };
            }

            return { data: null, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err?.message || 'Firestore operation failed' } };
        }
    }

    then<TResult1 = { data: any; error: any }, TResult2 = never>(
        onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.executeAsync().then(onfulfilled, onrejected);
    }
}

// ─── Firebase-Backed Client (Drop-in Compatible) ───────────────────────────
export const supabase = {
    from: (table: string) => new FirebaseQueryBuilder(table as keyof LocalDatabase),

    auth: {
        getSession: async () => {
            const session = getStoredSession();
            return { data: { session }, error: null };
        },

        getUser: async () => {
            const session = getStoredSession();
            return { data: { user: session?.user || null }, error: null };
        },

        setSession: async ({ access_token }: { access_token: string; refresh_token: string }) => {
            const session = getStoredSession();
            if (session && session.access_token === access_token) {
                return { data: { session, user: session.user }, error: null };
            }
            return { data: { session: null, user: null }, error: null };
        },

        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
            let normalizedEmail = email.trim().toLowerCase();
            if (normalizedEmail === 'pierre') normalizedEmail = PIERRE_OWNER_EMAIL;
            if (normalizedEmail === 'michael') normalizedEmail = MICHAEL_SYSADMIN_EMAIL;

            const isBuiltInAdmin =
                normalizedEmail === PIERRE_OWNER_EMAIL || normalizedEmail === MICHAEL_SYSADMIN_EMAIL;

            try {
                // 1. Authenticate against live Firebase Authentication
                const cred = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
                const fbUser = cred.user;
                const db = loadDb();

                let existingEng = db.engineers.find(e => e.id === fbUser.uid || e.email?.toLowerCase() === normalizedEmail);
                if (!existingEng) {
                    const now = new Date().toISOString();
                    const defaultName =
                        normalizedEmail === PIERRE_OWNER_EMAIL
                            ? 'Eng. Pierre Afifi'
                            : normalizedEmail === MICHAEL_SYSADMIN_EMAIL
                            ? 'Michael (System Administrator)'
                            : fbUser.displayName || normalizedEmail.split('@')[0];
                    existingEng = {
                        id: fbUser.uid,
                        organization_id: DEFAULT_ORG_ID,
                        email: normalizedEmail,
                        name: defaultName,
                        role: isBuiltInAdmin ? 'admin' : 'engineer',
                        hourly_rate: isBuiltInAdmin ? 250 : 150,
                        weekly_goal_hours: isBuiltInAdmin ? 45 : 40,
                        location: 'El Nozha El Gedida HQ',
                        skills: [],
                        created_at: now,
                    };
                    db.engineers.push(existingEng);
                    await setDoc(doc(firestoreDb, 'mt_engineers', fbUser.uid), existingEng, { merge: true });
                } else if (isBuiltInAdmin) {
                    existingEng.role = 'admin';
                }

                const storedUser: StoredAuthUser = {
                    id: fbUser.uid,
                    email: normalizedEmail,
                    user_metadata: {
                        name: existingEng.name,
                        full_name: existingEng.name,
                        role: isBuiltInAdmin ? 'admin' : existingEng.role || 'engineer',
                        organization_id: existingEng.organization_id || DEFAULT_ORG_ID,
                        hourly_rate: existingEng.hourly_rate || 0,
                        weekly_goal_hours: existingEng.weekly_goal_hours || 40,
                    },
                    created_at: existingEng.created_at || new Date().toISOString(),
                };

                const userIdx = db.users.findIndex(u => u.id === fbUser.uid || u.email.toLowerCase() === normalizedEmail);
                if (userIdx >= 0) db.users[userIdx] = storedUser;
                else db.users.push(storedUser);
                saveDb(db);

                await setDoc(doc(firestoreDb, 'mt_users', fbUser.uid), storedUser, { merge: true });

                const session = buildSession(storedUser);
                setStoredSession(session);
                if (storedUser.user_metadata.organization_id) {
                    localStorage.setItem('whitelabel_active_org_id', storedUser.user_metadata.organization_id);
                }
                notifyAuthChange('SIGNED_IN', session);
                return { data: { user: session.user, session }, error: null };
            } catch (fbErr: any) {
                // Fallback check in local users store (including Pierre Owner & Michael SysAdmin accounts)
                const db = loadDb();
                const localUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
                if (localUser) {
                    // Best-effort sync to Firebase Auth if not yet created in cloud
                    try {
                        const createdCred = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
                        if (localUser.user_metadata?.name) {
                            await updateProfile(createdCred.user, { displayName: localUser.user_metadata.name });
                        }
                        await Promise.allSettled([
                            setDoc(doc(firestoreDb, 'mt_users', createdCred.user.uid), stripUndefined({ ...localUser, id: createdCred.user.uid }), { merge: true }),
                        ]);
                    } catch {
                        // Ignore if already exists or offline
                    }

                    const session = buildSession(localUser);
                    setStoredSession(session);
                    if (localUser.user_metadata?.organization_id) {
                        localStorage.setItem('whitelabel_active_org_id', localUser.user_metadata.organization_id);
                    }
                    notifyAuthChange('SIGNED_IN', session);
                    return { data: { user: session.user, session }, error: null };
                }
                return {
                    data: { user: null, session: null },
                    error: { message: 'Invalid login credentials. Please check your email/username and password.' },
                };
            }
        },

        signUp: async ({
            email,
            password,
            options,
        }: {
            email: string;
            password: string;
            options?: { data?: Record<string, any> };
        }) => {
            const normalizedEmail = email.trim().toLowerCase();
            try {
                const cred = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
                const fbUser = cred.user;
                const meta = options?.data || {};
                const now = new Date().toISOString();
                const orgId = meta.organization_id || localStorage.getItem('whitelabel_active_org_id') || DEFAULT_ORG_ID;
                const role = meta.role || 'engineer';
                const displayName = meta.full_name || meta.name || normalizedEmail.split('@')[0];

                await updateProfile(fbUser, { displayName });

                const newUser: StoredAuthUser = {
                    id: fbUser.uid,
                    email: normalizedEmail,
                    user_metadata: {
                        name: displayName,
                        full_name: displayName,
                        role,
                        organization_id: orgId,
                        hourly_rate: meta.hourly_rate || 0,
                        weekly_goal_hours: meta.weekly_goal_hours || 40,
                    },
                    created_at: now,
                };

                const newEngineer = {
                    id: fbUser.uid,
                    organization_id: orgId,
                    email: normalizedEmail,
                    name: displayName,
                    role,
                    hourly_rate: meta.hourly_rate || 0,
                    weekly_goal_hours: meta.weekly_goal_hours || 40,
                    location: meta.location || 'Main Office',
                    skills: [],
                    created_at: now,
                };

                const db = loadDb();
                db.users.push(newUser);
                db.engineers.push(newEngineer);
                saveDb(db);

                await Promise.allSettled([
                    setDoc(doc(firestoreDb, 'mt_users', fbUser.uid), newUser),
                    setDoc(doc(firestoreDb, 'mt_engineers', fbUser.uid), newEngineer),
                ]);

                const session = buildSession(newUser);
                setStoredSession(session);
                localStorage.setItem('whitelabel_active_org_id', orgId);
                notifyAuthChange('SIGNED_IN', session);
                notifyTableChange('engineers', 'INSERT');

                return { data: { user: session.user, session }, error: null };
            } catch (err: any) {
                return {
                    data: { user: null, session: null },
                    error: { message: err?.message || 'Failed to create Firebase Auth account.' },
                };
            }
        },

        updateUser: async (updates: { password?: string; data?: Record<string, any> }) => {
            const session = getStoredSession();
            if (!session?.user) {
                return { data: { user: null }, error: { message: 'Not authenticated' } };
            }

            try {
                if (updates.password && firebaseAuth.currentUser) {
                    await updatePassword(firebaseAuth.currentUser, updates.password);
                }
                if (updates.data?.name && firebaseAuth.currentUser) {
                    await updateProfile(firebaseAuth.currentUser, { displayName: updates.data.name });
                }
            } catch (e) {
                console.warn('Firebase Auth updateUser warning:', e);
            }

            const db = loadDb();
            const idx = db.users.findIndex(u => u.id === session.user.id);
            if (idx >= 0) {
                if (updates.data) {
                    db.users[idx].user_metadata = {
                        ...db.users[idx].user_metadata,
                        ...updates.data,
                    };
                }
                saveDb(db);
                await setDoc(doc(firestoreDb, 'mt_users', session.user.id), db.users[idx], { merge: true });
                const nextSession = buildSession(db.users[idx]);
                setStoredSession(nextSession);
                notifyAuthChange('USER_UPDATED', nextSession);
                return { data: { user: nextSession.user }, error: null };
            }

            return { data: { user: session.user }, error: null };
        },

        resetPasswordForEmail: async (email: string, _opts?: any): Promise<{ data: Record<string, never>; error: { message: string } | null }> => {
            try {
                await sendPasswordResetEmail(firebaseAuth, email.trim().toLowerCase());
            } catch (err: any) {
                return { data: {}, error: { message: err?.message || 'Password reset failed' } };
            }
            return { data: {}, error: null };
        },

        signOut: async () => {
            try {
                await firebaseSignOut(firebaseAuth);
            } catch {
                // ignore
            }
            setStoredSession(null);
            notifyAuthChange('SIGNED_OUT', null);
            return { error: null };
        },

        onAuthStateChange: (callback: AuthStateCallback) => {
            authListeners.add(callback);
            return {
                data: {
                    subscription: {
                        unsubscribe: () => {
                            authListeners.delete(callback);
                        },
                    },
                },
            };
        },
    },

    channel: (_name: string) => {
        const handlers: Array<{ table: string; cb: () => void }> = [];
        const listener: TableChangeListener = ({ table }) => {
            handlers.forEach(h => {
                if (h.table === table || h.table === '*') h.cb();
            });
        };

        const channelObj = {
            on: (_type: string, filter: { event?: string; schema?: string; table?: string }, cb: () => void) => {
                handlers.push({ table: filter?.table || '*', cb });
                return channelObj;
            },
            subscribe: () => {
                tableListeners.add(listener);
                return channelObj;
            },
            _listener: listener,
        };
        return channelObj;
    },

    removeChannel: (channelObj: any) => {
        if (channelObj?._listener) {
            tableListeners.delete(channelObj._listener);
        }
        return Promise.resolve();
    },

    removeAllChannels: () => {
        tableListeners.clear();
        return Promise.resolve();
    },
};

// ─── White-Label & Account Management Helpers (Firebase + Firestore) ───────

/**
 * Completely resets all accounts and Firestore data back to a clean slate with the default Admin account.
 */
export const resetAllPlatformAccountsAndData = async () => {
    const initial = createInitialDatabase();
    saveDb(initial);

    // Clear and re-seed Firestore mt_* collections
    try {
        for (const table of ALL_TABLES) {
            const colName = getCollectionName(table);
            const snap = await getDocs(collection(firestoreDb, colName));
            const batch = writeBatch(firestoreDb);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();

            const seedRows = (initial[table] as any[]) || [];
            for (const row of seedRows) {
                const docId = String(row.id || row.key || crypto.randomUUID());
                await setDoc(doc(firestoreDb, colName, docId), stripUndefined({ ...row, id: docId }));
            }
        }
    } catch (err) {
        console.warn('Firestore reset warning:', err);
    }

    const adminUser = initial.users[0];
    const session = buildSession(adminUser);
    setStoredSession(session);
    localStorage.setItem('whitelabel_active_org_id', DEFAULT_ORG_ID);
    notifyAuthChange('SIGNED_IN', session);
    notifyTableChange('engineers', 'RESET');
    notifyTableChange('projects', 'RESET');
    notifyTableChange('organizations', 'RESET');
    return {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
    };
};

/**
 * Returns all user accounts on the platform for Admin management.
 */
export const getPlatformAccounts = () => {
    const db = loadDb();
    return db.engineers.map(eng => {
        const u = db.users.find(user => user.id === eng.id);
        const org = db.organizations.find(o => o.id === (eng.organization_id || u?.user_metadata?.organization_id));
        return {
            id: eng.id,
            email: eng.email || u?.email || `${eng.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
            name: eng.name,
            role: eng.role || 'engineer',
            organizationId: eng.organization_id || DEFAULT_ORG_ID,
            organizationName: org?.name || 'Default Workspace',
            location: eng.location || 'Main Office',
            hourlyRate: eng.hourly_rate || 0,
            createdAt: eng.created_at || u?.created_at || new Date().toISOString(),
        };
    });
};

/**
 * Allows an Admin to directly provision a new user account in Firebase Auth + Firestore without losing their current session.
 */
export const adminCreateAccount = async (params: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'engineer' | 'client';
    organizationId: string;
    location?: string;
    hourlyRate?: number;
    weeklyGoalHours?: number;
}) => {
    const db = loadDb();
    const normalizedEmail = params.email.trim().toLowerCase();
    if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        throw new Error('An account with this email already exists.');
    }

    let uid: string = crypto.randomUUID();
    try {
        const cred = await createUserWithEmailAndPassword(secondaryFirebaseAuth, normalizedEmail, params.password);
        uid = cred.user.uid;
        await firebaseSignOut(secondaryFirebaseAuth);
    } catch (fbErr: any) {
        if (fbErr?.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered in Firebase Auth.');
        }
        console.warn('Secondary Firebase Auth creation note:', fbErr);
    }

    const now = new Date().toISOString();
    const newUser: StoredAuthUser = {
        id: uid,
        email: normalizedEmail,
        password: params.password,
        user_metadata: {
            name: params.name.trim(),
            full_name: params.name.trim(),
            role: params.role,
            organization_id: params.organizationId,
            hourly_rate: params.hourlyRate || 0,
            weekly_goal_hours: params.weeklyGoalHours || 40,
        },
        created_at: now,
    };

    const newEngineer = {
        id: uid,
        organization_id: params.organizationId,
        email: normalizedEmail,
        name: params.name.trim(),
        role: params.role,
        hourly_rate: params.hourlyRate || 0,
        weekly_goal_hours: params.weeklyGoalHours || 40,
        location: params.location || 'Main Office',
        skills: [],
        created_at: now,
    };

    db.users.push(newUser);
    db.engineers.push(newEngineer);
    saveDb(db);

    await Promise.allSettled([
        setDoc(doc(firestoreDb, 'mt_users', uid), newUser),
        setDoc(doc(firestoreDb, 'mt_engineers', uid), newEngineer),
    ]);

    notifyTableChange('engineers', 'INSERT');
    return newUser;
};

/**
 * Allows an Admin to delete a user account from Firestore and local store.
 */
export const adminDeleteAccount = async (userId: string) => {
    const db = loadDb();
    db.users = db.users.filter(u => u.id !== userId);
    db.engineers = db.engineers.filter(e => e.id !== userId);
    saveDb(db);

    await Promise.allSettled([
        deleteDoc(doc(firestoreDb, 'mt_users', userId)),
        deleteDoc(doc(firestoreDb, 'mt_engineers', userId)),
    ]);

    notifyTableChange('engineers', 'DELETE');
};

/**
 * Allows an Admin to update a user's role or name in Firestore.
 */
export const adminUpdateAccount = async (userId: string, updates: { password?: string; role?: string; name?: string }) => {
    const db = loadDb();
    let updatedUser: StoredAuthUser | null = null;
    let updatedEng: any = null;

    db.users = db.users.map(u => {
        if (u.id !== userId) return u;
        updatedUser = {
            ...u,
            password: updates.password || u.password,
            user_metadata: {
                ...u.user_metadata,
                role: updates.role || u.user_metadata.role,
                name: updates.name || u.user_metadata.name,
            },
        };
        return updatedUser;
    });

    db.engineers = db.engineers.map(e => {
        if (e.id !== userId) return e;
        updatedEng = {
            ...e,
            role: updates.role || e.role,
            name: updates.name || e.name,
        };
        return updatedEng;
    });

    saveDb(db);

    if (updatedUser) await setDoc(doc(firestoreDb, 'mt_users', userId), stripUndefined(updatedUser), { merge: true });
    if (updatedEng) await setDoc(doc(firestoreDb, 'mt_engineers', userId), stripUndefined(updatedEng), { merge: true });

    notifyTableChange('engineers', 'UPDATE');
};

/**
 * Self-serve onboarding: registers a new Contracting Company workspace in Firebase Auth & Firestore + logs in.
 */
export const registerContractingCompany = async (params: {
    companyName: string;
    tagline?: string;
    primaryColor: string;
    currency: string;
    branches: string[];
    logoUrl?: string;
    city?: string;
    country?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}) => {
    const db = loadDb();
    const normalizedEmail = params.adminEmail.trim().toLowerCase();

    let userId: string = crypto.randomUUID();
    try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, params.adminPassword);
        userId = cred.user.uid;
        await updateProfile(cred.user, { displayName: params.adminName.trim() });
    } catch (fbErr: any) {
        if (fbErr?.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists in Firebase.');
        }
        throw new Error(fbErr?.message || 'Failed to register Firebase account.');
    }

    const now = new Date().toISOString();
    const orgId = `org-${crypto.randomUUID().slice(0, 8)}`;
    const slug = params.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || orgId;

    const newOrg: Organization = {
        id: orgId,
        name: params.companyName.trim(),
        slug,
        tagline: params.tagline?.trim() || 'Contracting & Engineering Milestone Tracker',
        logoUrl: params.logoUrl || '',
        faviconUrl: params.logoUrl || '',
        primaryColor: params.primaryColor || '#f3822d',
        themeSurface: 'obsidian',
        currency: params.currency || 'AED',
        branches: params.branches.length > 0 ? params.branches : ['Main Office', 'Site Office'],
        email: normalizedEmail,
        city: params.city || 'Dubai',
        country: params.country || 'UAE',
        plan: 'Enterprise',
        createdAt: now,
    };

    const adminUser: StoredAuthUser = {
        id: userId,
        email: normalizedEmail,
        user_metadata: {
            name: params.adminName.trim(),
            full_name: params.adminName.trim(),
            role: 'admin',
            organization_id: orgId,
            hourly_rate: 150,
            weekly_goal_hours: 40,
        },
        created_at: now,
    };

    const adminEngineer = {
        id: userId,
        organization_id: orgId,
        email: normalizedEmail,
        name: params.adminName.trim(),
        role: 'admin',
        hourly_rate: 150,
        weekly_goal_hours: 40,
        location: newOrg.branches[0] || 'Main Office',
        skills: ['Project Management', 'Contracting'],
        created_at: now,
    };

    db.organizations.push(newOrg);
    db.users.push(adminUser);
    db.engineers.push(adminEngineer);

    const defaultPhases = [
        'Mobilization & Concept',
        'Detailed Engineering',
        'Procurement & Submittals',
        'Site Execution & Construction',
        'Testing, Commissioning & Handover',
    ];
    const phaseDocs = defaultPhases.map((phaseName, idx) => ({
        id: crypto.randomUUID(),
        organization_id: orgId,
        name: phaseName,
        order_index: idx,
        created_at: now,
    }));
    db.project_phases.push(...phaseDocs);

    saveDb(db);

    await Promise.allSettled([
        setDoc(doc(firestoreDb, 'mt_organizations', orgId), stripUndefined(newOrg)),
        setDoc(doc(firestoreDb, 'mt_users', userId), stripUndefined(adminUser)),
        setDoc(doc(firestoreDb, 'mt_engineers', userId), stripUndefined(adminEngineer)),
        ...phaseDocs.map(p => setDoc(doc(firestoreDb, 'mt_project_phases', p.id), p)),
    ]);

    const session = buildSession(adminUser);
    setStoredSession(session);
    localStorage.setItem('whitelabel_active_org_id', orgId);
    notifyAuthChange('SIGNED_IN', session);
    notifyTableChange('organizations', 'INSERT');
    notifyTableChange('engineers', 'INSERT');

    return { organization: newOrg, user: session.user };
};
