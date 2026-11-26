import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DemoTourBar } from './components/DemoTourBar';
import { EvidenceModal } from './components/EvidenceModal';
import { LiveJudgeDemoModal } from './components/LiveJudgeDemoModal';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeviceMonitoringPage } from './pages/DeviceMonitoringPage';
import { SimulationPage } from './pages/SimulationPage';
import { EventsPage } from './pages/EventsPage';
import { TraceGraphPage } from './pages/TraceGraphPage';
import { CanaryTwinPage } from './pages/CanaryTwinPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { IncidentResponsePage } from './pages/IncidentResponsePage';
import { EvidenceLedgerPage } from './pages/EvidenceLedgerPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmployeePortalPage } from './pages/EmployeePortalPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';
import { useAuth } from './context/AuthContext';
import { useSecurity } from './context/SecurityContext';

export function App() {
  const { isAuthenticated, activePortal } = useAuth();
  const { isJudgeModalOpen, setIsJudgeModalOpen } = useSecurity();
  const [currentPath, setCurrentPath] = useState('/');
  const [inspectedItem, setInspectedItem] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If not logged in, render authentication page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setCurrentPath('/')} />;
  }

  const handleNavigate = (path) => {
    setCurrentPath(path);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectEvidence = (item) => {
    setInspectedItem(item);
  };

  const renderActivePage = () => {
    if (activePortal === 'customer' && currentPath !== '/settings') {
      return <CustomerPortalPage onNavigate={handleNavigate} />;
    }
    if (activePortal === 'employee' && currentPath !== '/settings') {
      return <EmployeePortalPage onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case '/':
        return <DashboardPage onNavigate={handleNavigate} onInspectEvidence={handleInspectEvidence} />;
      case '/customer-portal':
        return <CustomerPortalPage onNavigate={handleNavigate} />;
      case '/employees':
        return <EmployeeManagementPage onInspectEvidence={handleInspectEvidence} />;
      case '/employee-portal':
        return <EmployeePortalPage onNavigate={handleNavigate} />;
      case '/landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case '/devices':
        return <DeviceMonitoringPage onInspectEvidence={handleInspectEvidence} />;
      case '/simulation':
        return <SimulationPage onNavigate={handleNavigate} onInspectEvidence={handleInspectEvidence} />;
      case '/events':
        return <EventsPage onInspectEvidence={handleInspectEvidence} />;
      case '/tracegraph':
        return <TraceGraphPage onInspectEvidence={handleInspectEvidence} />;
      case '/canary-twin':
        return <CanaryTwinPage onInspectEvidence={handleInspectEvidence} />;
      case '/blast-radius':
        return <BlastRadiusPage onNavigate={handleNavigate} onInspectEvidence={handleInspectEvidence} />;
      case '/incident-response':
        return <IncidentResponsePage onNavigate={handleNavigate} />;
      case '/evidence':
        return <EvidenceLedgerPage onInspectEvidence={handleInspectEvidence} />;
      case '/reports':
        return <ReportsPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} onInspectEvidence={handleInspectEvidence} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#070b14] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Sidebar Navigation: Statically docked on PC/Laptop (md+), Slide-over drawer on Phones/Tablets (<md) */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area: Fills remaining viewport smoothly on all devices */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsMobileNavOpen((prev) => !prev)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 relative min-w-0">
          {renderActivePage()}
        </main>
      </div>

      {/* Guided 9-Step Demo Mode Controller Bar */}
      <DemoTourBar onNavigate={handleNavigate} />

      {/* Forensic Evidence Ledger Modal */}
      {inspectedItem && (
        <EvidenceModal
          item={inspectedItem}
          onClose={() => setInspectedItem(null)}
        />
      )}

      {/* Live 8-Stage Interactive Judge Demo Modal */}
      <LiveJudgeDemoModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
      />
    </div>
  );
}

export default App;
