import { useEffect, useState } from 'react';
import { Mail, RefreshCw, LogIn, ExternalLink, Inbox, Send, AlertCircle, ArrowLeft, PenSquare, Clock, FileCheck2 } from 'lucide-react';
import {
    getZohoAuthUrl,
    exchangeCodeForTokens,
    getValidAccessToken,
    fetchZohoAccounts,
    fetchZohoEmails,
    fetchZohoEmailsByFolder,
    fetchZohoFolders,
    fetchZohoEmailContent,
    saveZohoTokens,
    clearZohoTokens,
    saveZohoTokensToSupabase,
    loadZohoTokensFromSupabase,
    clearZohoTokensFromSupabase,
    refreshAccessToken,
    type ZohoMailAccount,
    type ZohoFolder
} from '../lib/zoho';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DocumentControlHub } from '../components/nexus/DocumentControlHub';

export const Emails = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const locationRoute = useLocation();
    const { user } = useAuth();

    const [activeMailView, setActiveMailView] = useState<'transmittals' | 'zoho'>(
        locationRoute.pathname === '/submittals' ? 'transmittals' : 'transmittals'
    );
    useEffect(() => {
        if (locationRoute.pathname === '/submittals') setActiveMailView('transmittals');
    }, [locationRoute.pathname]);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [accounts, setAccounts] = useState<ZohoMailAccount[]>([]);
    const [emails, setEmails] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Folder support
    const [folders, setFolders] = useState<ZohoFolder[]>([]);
    const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');

    // Email detail view
    const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
    const [emailContent, setEmailContent] = useState<string>('');
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const pendingCode = sessionStorage.getItem('zoho_pending_code');

        if (code) {
            handleOAuthCallback(code);
        } else if (pendingCode) {
            sessionStorage.removeItem('zoho_pending_code');
            handleOAuthCallback(pendingCode);
        } else {
            checkAuthStatus();
        }
    }, [searchParams]);

    useEffect(() => {
        const handleNewEmail = () => {
            // Silently refresh emails when a new one is detected by the MailNotifier
            if (isConnected) {
                loadEmails(undefined, true);
            }
        };
        window.addEventListener('new-email', handleNewEmail);
        return () => window.removeEventListener('new-email', handleNewEmail);
    }, [isConnected, activeFolder]); // Depend on activeFolder so it fetches the correct folder if changed

    const handleOAuthCallback = async (code: string) => {
        try {
            setIsLoading(true);
            const tokens = await exchangeCodeForTokens(code);
            if (tokens.error) throw new Error(tokens.error);

            saveZohoTokens(tokens);
            setIsConnected(true);

            // Clean up URL
            navigate('/emails', { replace: true });

            // Fetch data now that we're connected
            const token = tokens.access_token;
            const userAccounts = await fetchZohoAccounts(token);
            setAccounts(userAccounts);

            if (userAccounts.length > 0) {
                const primaryAccountId = userAccounts[0].accountId;

                // Save tokens to Supabase for persistence
                if (user?.id && tokens.refresh_token) {
                    await saveZohoTokensToSupabase(user.id, tokens.refresh_token, primaryAccountId);
                }

                // Fetch folders and inbox
                const foldersData = await fetchZohoFolders(token, primaryAccountId);
                setFolders(foldersData);

                const recentEmails = await fetchZohoEmails(token, primaryAccountId);
                setEmails(recentEmails || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to authenticate with Zoho');
            clearZohoTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);

            // Try localStorage first
            let token = await getValidAccessToken();

            // If no local token, try loading from Supabase
            if (!token && user?.id) {
                const stored = await loadZohoTokensFromSupabase(user.id);
                if (stored.refreshToken) {
                    try {
                        const refreshed = await refreshAccessToken(stored.refreshToken);
                        saveZohoTokens(refreshed);
                        token = refreshed.access_token;
                    } catch {
                        // Refresh token expired — user needs to re-auth
                        await clearZohoTokensFromSupabase(user.id);
                    }
                }
            }

            if (token) {
                setIsConnected(true);
                await loadEmails(token);
            } else {
                setIsConnected(false);
            }
        } catch (err) {
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const loadEmails = async (providedToken?: string, quiet = false) => {
        try {
            if (!quiet) setIsLoading(true);
            setError(null);
            const token = providedToken || await getValidAccessToken();
            if (!token) throw new Error('Not authenticated');

            const userAccounts = await fetchZohoAccounts(token);
            if (!quiet) setAccounts(userAccounts);

            if (userAccounts.length > 0) {
                const primaryAccountId = userAccounts[0].accountId;

                // Fetch folders
                const foldersData = await fetchZohoFolders(token, primaryAccountId);
                setFolders(foldersData);

                // Load emails for active folder
                await loadFolderEmails(token, primaryAccountId, foldersData);
            }
        } catch (err: any) {
            if (!quiet) setError(err.message || 'Failed to fetch emails');
            if (err.message?.includes('Not authenticated') || err.message?.includes('token')) {
                setIsConnected(false);
                clearZohoTokens();
            }
        } finally {
            if (!quiet) setIsLoading(false);
        }
    };

    const loadFolderEmails = async (token: string, accountId: string, foldersData?: ZohoFolder[]) => {
        const foldersList = foldersData || folders;
        const targetType = activeFolder === 'inbox' ? 'Inbox' : 'SentMailFolder';
        const folder = foldersList.find(f =>
            f.folderName?.toLowerCase() === (activeFolder === 'inbox' ? 'inbox' : 'sent') ||
            f.folderType === targetType
        );

        if (folder) {
            const folderEmails = await fetchZohoEmailsByFolder(token, accountId, folder.folderId);
            setEmails(folderEmails || []);
        } else {
            // Fallback: use default endpoint for inbox
            const recentEmails = await fetchZohoEmails(token, accountId);
            setEmails(recentEmails || []);
        }
    };

    // Switch folder
    const switchFolder = async (folder: 'inbox' | 'sent') => {
        setActiveFolder(folder);
        setSelectedEmail(null);
        setEmailContent('');
        try {
            setIsLoading(true);
            const token = await getValidAccessToken();
            if (!token || accounts.length === 0) return;
            // Temporarily set active folder to load the right emails
            const foldersList = folders;
            const targetType = folder === 'inbox' ? 'Inbox' : 'SentMailFolder';
            const folderObj = foldersList.find(f =>
                f.folderName?.toLowerCase() === (folder === 'inbox' ? 'inbox' : 'sent') ||
                f.folderType === targetType
            );
            if (folderObj) {
                const folderEmails = await fetchZohoEmailsByFolder(token, accounts[0].accountId, folderObj.folderId);
                setEmails(folderEmails || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to switch folder');
        } finally {
            setIsLoading(false);
        }
    };

    // View email content
    const openEmail = async (email: any) => {
        setSelectedEmail(email);
        setIsLoadingContent(true);
        setEmailContent('');
        try {
            const token = await getValidAccessToken();
            if (!token || accounts.length === 0) return;

            // Find current folder ID
            const targetType = activeFolder === 'inbox' ? 'Inbox' : 'SentMailFolder';
            const folder = folders.find(f =>
                f.folderName?.toLowerCase() === (activeFolder === 'inbox' ? 'inbox' : 'sent') ||
                f.folderType === targetType
            );
            if (folder) {
                const content = await fetchZohoEmailContent(
                    token,
                    accounts[0].accountId,
                    folder.folderId,
                    email.messageId
                );
                setEmailContent(content);
            }
        } catch (err: any) {
            setEmailContent(`<p style="color: #ef4444;">Failed to load email content: ${err.message}</p>`);
        } finally {
            setIsLoadingContent(false);
        }
    };

    const closeEmail = () => {
        setSelectedEmail(null);
        setEmailContent('');
    };

    const handleConnect = () => {
        window.location.href = getZohoAuthUrl();
    };

    const handleDisconnect = async () => {
        clearZohoTokens();
        if (user?.id) {
            await clearZohoTokensFromSupabase(user.id);
        }
        setIsConnected(false);
        setAccounts([]);
        setEmails([]);
        setFolders([]);
        setSelectedEmail(null);
    };

    const formatEmailDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(parseInt(dateString));
        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(date);
    };

    const formatFullDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(parseInt(dateString));
        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(date);
    };

    if (isLoading && activeMailView === 'zoho' && !emails.length && !selectedEmail) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-[#e04b2a]/25 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[#192631]/70 font-mono text-sm tracking-widest uppercase">Loading Mailbox...</p>
            </div>
        );
    }

    // ────── Email Detail View ──────
    if (selectedEmail && activeMailView === 'zoho') {
        return (
            <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto w-full">
                {/* Back button + header */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-[#192631]/10">
                    <button
                        onClick={closeEmail}
                        className="p-2 rounded-lg bg-[#192631]/[0.05] border border-[#192631]/10 text-[#192631]/85 hover:text-[#192631] hover:bg-[#192631]/[0.05] transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-sm md:text-lg font-bold text-[#192631] truncate flex-1">
                        {selectedEmail.subject || '(No Subject)'}
                    </h1>
                </div>

                {/* Email metadata */}
                <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl border border-[#192631]/10 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-[#192631]/10">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-[#e04b2a]/25 flex items-center justify-center shrink-0">
                                <span className="text-[#e04b2a] font-bold text-lg uppercase">
                                    {(selectedEmail.sender || selectedEmail.fromAddress || '?').substring(0, 1)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[#192631] font-semibold truncate">
                                    {selectedEmail.sender || selectedEmail.fromAddress || 'Unknown Sender'}
                                </h3>
                                {selectedEmail.toAddress && (
                                    <p className="text-xs text-[#192631]/60 mt-0.5 truncate">
                                        To: {selectedEmail.toAddress}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-[#192631]/60">
                                    <Clock className="w-3 h-3" />
                                    {formatFullDate(selectedEmail.receivedTime || selectedEmail.sentDateInGMT)}
                                </div>
                            </div>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-[#192631]">
                            {selectedEmail.subject || '(No Subject)'}
                        </h2>
                    </div>

                    {/* Email body */}
                    <div className="p-4 md:p-6">
                        {isLoadingContent ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-3 border-[#e04b2a]/25 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                                <p className="text-[#192631]/60 text-sm">Loading content...</p>
                            </div>
                        ) : (
                            <div
                                className="prose prose-sm max-w-none
                                    [&_a]:text-[#e04b2a] [&_a]:underline
                                    [&_img]:max-w-full [&_img]:rounded-lg
                                    [&_table]:border-collapse [&_td]:border [&_td]:border-[#192631]/10 [&_td]:p-2
                                    [&_blockquote]:border-l-2 [&_blockquote]:border-[#e04b2a]/25 [&_blockquote]:pl-4 [&_blockquote]:text-[#192631]/70
                                    text-[#192631]/85 leading-relaxed break-words overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: emailContent || '<p class="text-[#192631]/60 italic">No content available</p>' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ────── Email & Consultant Transmittals Unified View ──────
    return (
        <div className="space-y-6 w-full">
            {/* Top Mode Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-[#192631]/10 shadow-sm">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#192631] tracking-tight">
                        {locationRoute.pathname === '/submittals' ? (
                            <>Document Control, <span className="text-[#e04b2a]">51 Submittals & Transmittals</span></>
                        ) : (
                            <>Emails, <span className="text-[#e04b2a]">Transmittals & Submittals</span></>
                        )}
                    </h1>
                    <p className="text-[#192631]/70 text-xs md:text-sm mt-1">
                        Official Consultant Submittal Transmittal Generator (MS / DR / MIR / SL / SIR), 51-Clause File Coding & Company Zoho Mailbox
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-[#192631]/[0.05] p-1.5 rounded-2xl border border-[#192631]/10 self-start lg:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveMailView('transmittals')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            activeMailView === 'transmittals'
                                ? 'bg-[#e04b2a] text-white shadow-md shadow-[#e04b2a]/25'
                                : 'text-[#192631]/75 hover:text-[#192631] hover:bg-white/60'
                        }`}
                    >
                        <FileCheck2 className="w-4 h-4" />
                        <span>51 Submittals, Coding & Consultant Transmittals</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveMailView('zoho')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            activeMailView === 'zoho'
                                ? 'bg-[#192631] text-white shadow-md'
                                : 'text-[#192631]/75 hover:text-[#192631] hover:bg-white/60'
                        }`}
                    >
                        <Mail className="w-4 h-4" />
                        <span>Zoho Company Mailbox</span>
                    </button>
                </div>
            </div>

            {activeMailView === 'transmittals' ? (
                <DocumentControlHub />
            ) : (
                <>
                    {/* Zoho Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-[#192631]/10 shadow-sm">
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-[#192631] uppercase tracking-wider">Zoho Company Mailbox</h2>
                            <p className="text-[#192631]/70 text-xs md:text-sm mt-1">Access your Zoho emails directly from the platform.</p>
                        </div>

                {isConnected ? (
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                        {accounts.length > 0 && (
                            <div className="text-xs md:text-sm border border-[#e04b2a]/25 bg-[#e04b2a]/10 text-[#e04b2a] px-3 md:px-4 py-2 rounded-lg hidden sm:block">
                                <span className="opacity-70 mr-2">Account:</span>
                                <span className="font-semibold">{accounts[0].primaryEmailAddress}</span>
                            </div>
                        )}
                        <a
                            href="https://mail.zoho.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs md:text-sm uppercase tracking-wider transition-all cursor-pointer"
                        >
                            <PenSquare className="w-4 h-4" />
                            Compose
                        </a>
                        <button
                            onClick={() => loadEmails()}
                            className="p-2.5 rounded-lg bg-[#192631]/[0.05] border border-[#192631]/10 text-[#192631]/85 hover:text-[#192631] hover:bg-[#192631]/[0.05] transition-all cursor-pointer"
                            title="Refresh Emails"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin opacity-50' : ''}`} />
                        </button>
                        <button
                            onClick={handleDisconnect}
                            className="px-3 md:px-4 py-2 rounded-lg border border-red-500/20 text-red-700 hover:bg-red-500/10 transition-all cursor-pointer text-xs md:text-sm font-semibold uppercase tracking-wider"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                        <LogIn className="w-5 h-5" />
                        Connect Zoho Mail
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Main Content Area */}
            {isConnected && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Sidebar / Folders */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="bg-[#141414] rounded-2xl border border-[#192631]/10 p-3 md:p-4 space-y-1">
                            <button
                                onClick={() => switchFolder('inbox')}
                                className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeFolder === 'inbox'
                                    ? 'bg-[#e04b2a]/10 text-orange-500'
                                    : 'text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
                                    }`}
                            >
                                <Inbox className="w-5 h-5" />
                                Inbox
                                {folders.find(f => f.folderName?.toLowerCase() === 'inbox')?.unreadMessageCount ? (
                                    <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                                        {folders.find(f => f.folderName?.toLowerCase() === 'inbox')?.unreadMessageCount}
                                    </span>
                                ) : null}
                            </button>
                            <button
                                onClick={() => switchFolder('sent')}
                                className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeFolder === 'sent'
                                    ? 'bg-[#e04b2a]/10 text-orange-500'
                                    : 'text-[#192631]/70 hover:bg-[#192631]/[0.05] hover:text-[#192631]'
                                    }`}
                            >
                                <Send className="w-5 h-5" />
                                Sent
                            </button>

                            <div className="my-4 border-t border-[#192631]/10 pt-4">
                                <a
                                    href="https://mail.zoho.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-between gap-3 px-3 md:px-4 py-3 text-[#192631]/60 hover:text-[#e04b2a] rounded-xl font-medium transition-colors cursor-pointer"
                                >
                                    <span className="flex items-center gap-3"><ExternalLink className="w-5 h-5" /> Open in Zoho</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Email List */}
                    <div className="lg:col-span-3 bg-[#141414] rounded-2xl border border-[#192631]/10 overflow-hidden flex flex-col min-h-[400px] md:min-h-[500px]">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                <div className="w-10 h-10 border-4 border-[#e04b2a]/25 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                                <p className="text-[#192631]/60 text-sm">Loading {activeFolder === 'sent' ? 'sent' : 'inbox'} emails...</p>
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#192631]/60">
                                <Mail className="w-16 h-16 opacity-20 mb-4" />
                                <h3 className="text-xl font-medium text-[#192631] mb-2">
                                    {activeFolder === 'sent' ? 'No Sent Emails' : 'Inbox Empty'}
                                </h3>
                                <p>You have no emails to show right now.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#192631]/10">
                                {emails.map((email: any) => {
                                    const isUnread = email.status === '1';
                                    return (
                                        <div
                                            key={email.messageId}
                                            onClick={() => openEmail(email)}
                                            className={`p-3 md:p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 md:gap-4 ${isUnread ? 'bg-orange-500/5' : ''}`}
                                        >
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-[#e04b2a]/25 flex items-center justify-center shrink-0">
                                                <span className="text-[#e04b2a] font-bold text-sm md:text-lg uppercase">
                                                    {(email.sender || email.fromAddress || '?').substring(0, 1)}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className={`truncate font-medium text-sm md:text-base ${isUnread ? 'text-[#192631]' : 'text-[#192631]/85'}`}>
                                                        {activeFolder === 'sent'
                                                            ? (email.toAddress || email.sender || 'Unknown')
                                                            : (email.sender || email.fromAddress || 'Unknown')
                                                        }
                                                    </h3>
                                                    <span className="text-[10px] md:text-xs text-[#192631]/60 whitespace-nowrap">
                                                        {formatEmailDate(email.receivedTime || email.sentDateInGMT)}
                                                    </span>
                                                </div>
                                                <h4 className={`text-xs md:text-sm truncate mb-1 ${isUnread ? 'text-[#192631]/85 font-medium' : 'text-[#192631]/70'}`}>
                                                    {email.subject || '(No Subject)'}
                                                </h4>
                                                <p className="text-[10px] md:text-xs text-[#192631]/60 truncate">
                                                    {email.summary || '...'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

                    {!isConnected && !isLoading && (
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#192631]/10 p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#e04b2a]/10 border-4 border-[#e04b2a]/25 flex items-center justify-center mb-6">
                                <Mail className="w-8 h-8 md:w-10 md:h-10 text-[#e04b2a]" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-[#192631] mb-4">Integrate Zoho Mail</h2>
                            <p className="text-[#192631]/70 max-w-lg mb-8 text-sm md:text-base">
                                Connect your company's Zoho Mail account to securely access your inbox,
                                receive real-time desktop notifications, and manage communications directly from the platform.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="px-6 md:px-8 py-3 md:py-4 bg-[#e04b2a] hover:bg-[#c83e1f] text-white rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-[#e04b2a]/20 cursor-pointer"
                            >
                                Authorize Access
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
