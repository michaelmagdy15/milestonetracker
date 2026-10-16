import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { TenantProvider } from './context/TenantContext';
import { WorkflowProvider } from './context/WorkflowContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Engineers } from './pages/Engineers';
import { Entries } from './pages/Entries';
import { Reports } from './pages/Reports';
import { Attendance } from './pages/Attendance';
import { BOQViewer } from './pages/BOQViewer';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { ClientDashboard } from './pages/ClientDashboard';
import { Profile } from './pages/Profile';
import { Financials } from './pages/Financials';
import { Emails } from './pages/Emails';
import { Meetings } from './pages/Meetings';
import { HelpGuide } from './pages/HelpGuide';
import { OrganizationSettings } from './pages/OrganizationSettings';
import { ContractingERP } from './pages/ContractingERP';
import { DocumentControlHub } from './components/nexus/DocumentControlHub';
import { SubcontractorsDirectoryHub } from './components/nexus/SubcontractorsDirectoryHub';
import { ExtractsStatementsHub } from './components/nexus/ExtractsStatementsHub';
import { ProcurementWarehouseHub } from './components/nexus/ProcurementWarehouseHub';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Lightweight component that captures the Zoho OAuth callback code,
 * stashes it in sessionStorage, and redirects to /emails.
 * This runs OUTSIDE ProtectedRoute so the code is never lost
 * even if auth hasn't loaded yet.
 */
const ZohoCallbackRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    sessionStorage.setItem('zoho_pending_code', code);
  }
  return <Navigate to="/emails" replace />;
};

const ProtectedRoute = ({ children, requireAdmin, requireEngineerOrAdmin, skipDataWait }: { children: React.ReactNode, requireAdmin?: boolean, requireEngineerOrAdmin?: boolean, skipDataWait?: boolean }) => {
  const { user, role, isLoadingAuth } = useAuth();
  const { isLoading: isLoadingData } = useData();

  if (isLoadingAuth || (!skipDataWait && user && isLoadingData)) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 glass-card px-8 py-6 rounded-2xl">
          <div className="w-12 h-12 border-4 border-[#e04b2a]/20 border-t-[#e04b2a] rounded-full animate-spin"></div>
          <p className="text-[#192631]/70 font-black uppercase tracking-[0.2em] text-[10px]">
            Synchronizing Session {isLoadingAuth ? '(Auth)' : '(Data)'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireEngineerOrAdmin && role === 'client') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRoute = () => {
  const { role } = useAuth();
  if (role === 'client') return <ClientDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <TenantProvider>
          <Router>
            <AuthProvider>
              <DataProvider>
                <WorkflowProvider>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: 'rgba(255, 255, 255, 0.92)',
                      color: '#192631',
                      border: '1px solid rgba(25, 38, 49, 0.12)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 12px 32px -8px rgba(25, 38, 49, 0.12)',
                      fontWeight: 600,
                    },
                  }}
                />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* Zoho OAuth callback — must be OUTSIDE ProtectedRoute */}
                  <Route path="/emails/callback" element={<ZohoCallbackRedirect />} />

                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<HomeRoute />} />
                          <Route path="/entries" element={<ProtectedRoute requireEngineerOrAdmin><Entries /></ProtectedRoute>} />
                          <Route path="/attendance" element={<ProtectedRoute requireEngineerOrAdmin><Attendance /></ProtectedRoute>} />
                          <Route path="/reports" element={<ProtectedRoute requireAdmin><Reports /></ProtectedRoute>} />
                          <Route path="/projects" element={<ProtectedRoute requireEngineerOrAdmin><Projects /></ProtectedRoute>} />
                          <Route path="/projects/:id" element={<ProjectDetails />} />
                          <Route path="/boq" element={<ProtectedRoute requireEngineerOrAdmin><BOQViewer /></ProtectedRoute>} />
                          <Route path="/submittals" element={<ProtectedRoute requireEngineerOrAdmin skipDataWait><DocumentControlHub /></ProtectedRoute>} />
                          <Route path="/variations-rfis" element={<ProtectedRoute requireEngineerOrAdmin><ContractingERP defaultTab="variations" /></ProtectedRoute>} />
                          <Route path="/procurement" element={<ProtectedRoute requireEngineerOrAdmin><ProcurementWarehouseHub /></ProtectedRoute>} />
                          <Route path="/subcontractors" element={<ProtectedRoute requireEngineerOrAdmin><SubcontractorsDirectoryHub /></ProtectedRoute>} />
                          <Route path="/extracts" element={<ProtectedRoute requireEngineerOrAdmin><ExtractsStatementsHub /></ProtectedRoute>} />
                          <Route path="/contracting-erp" element={<ProtectedRoute requireEngineerOrAdmin><ContractingERP /></ProtectedRoute>} />
                          <Route path="/meetings" element={<ProtectedRoute requireEngineerOrAdmin><Meetings /></ProtectedRoute>} />
                          <Route path="/engineers" element={<ProtectedRoute requireEngineerOrAdmin><Engineers /></ProtectedRoute>} />
                          <Route path="/emails/*" element={<ProtectedRoute requireEngineerOrAdmin skipDataWait><Emails /></ProtectedRoute>} />
                          <Route path="/financials" element={<ProtectedRoute requireAdmin><Financials /></ProtectedRoute>} />
                          <Route path="/settings" element={<ProtectedRoute requireAdmin><OrganizationSettings /></ProtectedRoute>} />
                          <Route path="/help" element={<HelpGuide />} />
                          <Route path="/profile" element={<Profile />} />
                          {/* Fallback for authenticated users */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
                </WorkflowProvider>
              </DataProvider>
            </AuthProvider>
          </Router>
        </TenantProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
