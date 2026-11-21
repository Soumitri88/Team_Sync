import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DemoTourBar } from './components/DemoTourBar';
import { EvidenceModal } from './components/EvidenceModal';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SimulationPage } from './pages/SimulationPage';
import { EventsPage } from './pages/EventsPage';
import { TraceGraphPage } from './pages/TraceGraphPage';
import { CanaryTwinPage } from './pages/CanaryTwinPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { IncidentResponsePage } from './pages/IncidentResponsePage';
import { EvidenceLedgerPage } from './pages/EvidenceLedgerPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './context/AuthContext';
import { useSecurity } from './context/SecurityContext';

export function App() {
  const { isAuthenticated } = useAuth();
  const { demoActive } = useSecurity();
  const [currentPath, setCurrentPath] = useState('/');
  const [inspectedItem, setInspectedItem] = useState(null);

  // If not logged in, render cybersecurity terminal login
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setCurrentPath('/')} />;
  }

  const handleNavigate = (path) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectEvidence = (item) => {
    setInspectedItem(item);
  };

  const renderActivePage = () => {
    switch (currentPath) {
      case '/':
        return <DashboardPage onNavigate={handleNavigate} onInspectEvidence={handleInspectEvidence} />;
      case '/simulation':
        return <SimulationPage onNavigate={handleNavigate} onInspectEvidence={handleInspectEvidence} />;
      case '/events':
        return <EventsPage onInspectEvidence={handleInspectEvidence} />;
      case '/tracegraph':
        return <TraceGraphPage onInspectEvidence={handleInspectEvidence} />;
      case '/canary-twin':
        return <CanaryTwinPage onInspectEvidence={handleInspectEvidence} />;
      case '/blast-radius':
        return <BlastRadiusPage onNavigate={handleNavigate} />;
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
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-6 py-6 relative">
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
    </div>
  );
}

export default App;
