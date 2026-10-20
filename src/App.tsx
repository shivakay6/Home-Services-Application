import React from 'react';
import { JobProvider, useJob } from './context/JobContext';
import { DemoControls } from './components/common/DemoControls';
import { Navbar } from './components/common/Navbar';
import { CustomerApp } from './components/customer/CustomerApp';
import { ProviderApp } from './components/provider/ProviderApp';
import { SupportDashboard } from './components/support/SupportDashboard';
import { ContactSingleUseLinkView } from './components/contact/ContactSingleUseLinkView';
import { CheckCircle2, Shield, Clock, Users } from 'lucide-react';

const MainContent: React.FC = () => {
  const { persona, state } = useJob();

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-800 antialiased">
      {/* Line 1: Prototype Controls (Signal, Timer, Shifted Reset Demo) */}
      <DemoControls />

      {/* Line 2: In-App Controls (Consarc.ai Logo, Job ID, Status, 4 Persona Buttons, Notification Button) */}
      <Navbar />

      {/* Main Persona Workspaces */}
      <main className="flex-1 pb-12">
        {persona === 'customer' && <CustomerApp />}
        {persona === 'provider' && <ProviderApp />}
        {persona === 'support' && <SupportDashboard />}
        {persona === 'contact' && <ContactSingleUseLinkView />}
      </main>

      {/* Footer Design Principle & Assignment Legend */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              C
            </div>
            <span className="font-semibold text-slate-800">Consarc.ai Product Management Prototype</span>
            <span className="text-slate-400">•</span>
            <span>Home Services Job Completion, Payment & Disputes</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              <Shield className="w-3.5 h-3.5" />
              "Money follows evidence and time, not one person's word."
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <JobProvider>
      <MainContent />
    </JobProvider>
  );
}
