import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import { Persona } from '../../types';
import {
  User,
  Wrench,
  Headphones,
  Link as LinkIcon,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { CompanyLogo } from './CompanyLogo';

export const Navbar: React.FC = () => {
  const { state, persona, setPersona, isGuideOpen, setIsGuideOpen, isGuideHighlighted } = useJob();
  const [showNotifs, setShowNotifs] = useState(false);

  const personas: { id: Persona; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      id: 'customer',
      label: 'Customer',
      sub: state.customerName,
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'provider',
      label: 'Service Provider',
      sub: state.providerName,
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      id: 'support',
      label: 'Support Agent',
      sub: 'Agent Dashboard',
      icon: <Headphones className="w-4 h-4" />,
    },
  ];

  // Core status styling
  const getStatusBadge = () => {
    switch (state.coreStatus) {
      case 'in_progress':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Job In Progress',
        };
      case 'completion_queued_offline':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
          label: 'Queued Offline (No Signal)',
        };
      case 'in_review':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: `In 24h Review (${Math.max(0, 24 - state.simulatedElapsedHours)}h left)`,
        };
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Confirmed — Payout Initiated',
        };
      case 'released':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Payment Released',
        };
      case 'disputed':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: `Disputed (₹${state.financials.amountHeld} held)`,
        };
      case 'incomplete_reported':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Incomplete Reported',
        };
      case 'cancelled':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Job Cancelled / Refunded',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: state.coreStatus,
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Company.ai logo, Job ID & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <CompanyLogo className="w-8 h-8 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm tracking-tight">Company.ai</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                    Home Services
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {state.jobId} • {state.serviceName}
                </div>
              </div>
            </div>

            {/* Current Shared State Pill (Payable amount removed) */}
            <div className="hidden sm:flex items-center pl-3 border-l border-slate-200">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge.bg}`}
              >
                {statusBadge.icon}
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Right: The 4 Person Buttons & Notification button on the SAME line */}
          <div className="flex items-center gap-2">
            {/* The 4 Persona Switcher buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {personas.map((p) => {
                const isActive = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{p.icon}</span>
                    <span>{p.label}</span>
                    <span
                      className={`hidden lg:inline text-[10px] font-normal px-1 rounded ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      {p.sub}
                    </span>
                  </button>
                );
              })}

              {/* 4th Person: On-site Contact Link (Ananya) button */}
              <button
                onClick={() => setPersona('contact')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  persona === 'contact'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
                title="View on-site contact single-use link experience as Ananya"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Contact Link</span>
                {state.contactLinkUsed && (
                  <span className="text-[10px] bg-purple-900/40 text-purple-200 px-1 rounded">Used</span>
                )}
              </button>
            </div>

            {/* Notification button on the SAME line as the 4 person buttons */}
            <button
              onClick={() => setShowNotifs(true)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title="Open simulated notifications and SMS feed"
            >
              <Bell className="w-4 h-4" />
              {state.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {state.notifications.length}
                </span>
              )}
            </button>

            {/* Top Right Prototype Guide Icon Button */}
            <div className="relative">
              <button
                onClick={() => setIsGuideOpen(true)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isGuideHighlighted
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xl shadow-amber-400/50 ring-4 ring-amber-400 ring-offset-2 animate-bounce'
                    : 'text-slate-700 bg-slate-50 hover:text-blue-700 hover:bg-blue-50 border-slate-200 hover:border-blue-300'
                }`}
                title="Open Prototype Guide & Complete Specification"
                aria-label="Open Prototype Guide"
              >
                <ScrollText className={`w-4 h-4 ${isGuideHighlighted ? 'text-slate-950' : 'text-blue-600'}`} />
                <span className="hidden sm:inline">Prototype Guide</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isGuideHighlighted ? 'bg-slate-950 animate-ping' : 'bg-blue-600 animate-pulse'
                  }`}
                />
              </button>

              {/* 5-second attention callout tooltip when reset demo is clicked */}
              {isGuideHighlighted && (
                <div className="absolute right-0 top-full mt-2.5 w-64 p-3 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl border-2 border-amber-400 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block text-xs">Reset Demo Clicked!</span>
                      <span className="text-[11px] text-slate-300 leading-tight block mt-0.5">
                        Click here anytime to read the complete prototype explanation and test guide.
                      </span>
                    </div>
                  </div>
                  <div className="absolute -top-2 right-6 w-3.5 h-3.5 bg-slate-900 border-t-2 border-l-2 border-amber-400 transform rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
    </>
  );
};
