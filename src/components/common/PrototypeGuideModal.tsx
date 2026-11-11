import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  WifiOff,
  UserCheck,
  Wrench,
  Headphones,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Camera,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
    setScrollProgress(progress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm shadow-blue-500/20">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Company.ai — Prototype Guide
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                  Quick Guide
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Everything you need to understand and test this home services prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <span>Read:</span>
              <span className="font-bold text-blue-600">{scrollProgress}%</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              title="Close guide"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="h-1 bg-slate-100 w-full shrink-0">
          <div
            className="h-full bg-blue-600 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Scrollable Content Body */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 text-slate-700 text-sm leading-relaxed bg-white"
        >
          {/* Section 1: Overview in Plain English */}
          <section className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>What is this prototype?</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              A fair, evidence-based escrow system for home services (like plumbing and electrical repairs).
            </p>
            <p className="text-xs text-slate-600">
              In home services, customers worry about paying for unfinished work, and service providers worry about not getting paid after doing honest work. 
              This prototype demonstrates how <strong>escrow payments, before/after photos, and clear deadlines</strong> protect both parties without relying on one person's word.
            </p>
          </section>

          {/* Section 2: The 4 Switchable Personas */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>1. The 4 Personas (Switch anytime in the top bar)</span>
            </h3>
            <p className="text-xs text-slate-600">
              You can switch between any of these roles at any time to experience the job from all sides:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Persona: Customer */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                  <span>Customer (Priya Sharma)</span>
                </div>
                <p className="text-xs text-slate-600">
                  The person who booked the job. Can approve work start, review extra work discovered on-site, inspect before/after photos upon completion, release payment, or dispute specific defective items.
                </p>
              </div>

              {/* Persona: Provider */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Wrench className="w-3.5 h-3.5" />
                  </span>
                  <span>Provider (Ravi Kumar)</span>
                </div>
                <p className="text-xs text-slate-600">
                  The service professional on site. Requests approval to start work, requests extra work if hidden defects are found, captures mandatory before & after photos for every task, and submits completion (even when offline).
                </p>
              </div>

              {/* Persona: On-Site Contact */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Contact Link (Ananya)</span>
                </div>
                <p className="text-xs text-slate-600">
                  The roommate or family member present at home. Uses a simulated SMS link to approve work start, authorize extra work, and check completed work from their phone.
                </p>
              </div>

              {/* Persona: Support */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="p-1.5 rounded-lg bg-slate-200 text-slate-800">
                    <Headphones className="w-3.5 h-3.5" />
                  </span>
                  <span>Support Desk (Vikram)</span>
                </div>
                <p className="text-xs text-slate-600">
                  The platform arbitrator. Only gets involved if a customer disputes a task. Reviews the photo evidence packet from both sides and issues a fair decision (refund, release to provider, or split).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Core Rules & How Money Moves */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>2. Core Rules & How Money Moves</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">
                  🔒 Safe Escrow at Booking
                </span>
                <p className="text-slate-600">
                  When a job is booked, the full payment (₹2,000 for Kitchen Sink Repair) is held safely by the platform. The provider knows payment is guaranteed, but funds are only released once work is verified.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">
                  📸 Mandatory Before & After Photos
                </span>
                <p className="text-slate-600">
                  The provider cannot mark a job as complete with just a checkbox. They must upload a clear "Before" and "After" photo for each individual task so the customer can see the work done.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">
                  ⏱️ 24-Hour Review Window & Auto-Release
                </span>
                <p className="text-slate-600">
                  Once work is submitted, the customer has 24 hours to review the photos and confirm or report an issue. If the customer does nothing for 24 hours, funds automatically release to the provider so they aren't left waiting.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">
                  ⚖️ The Fair-Pay Rule (Partial Dispute Withholding)
                </span>
                <p className="text-slate-600">
                  If there is an issue with only one item in a multi-task job, only that specific item's money is put on hold for Support review. <strong>Undisputed tasks are immediately paid out to the provider</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">
                  📡 Offline Resilience
                </span>
                <p className="text-slate-600">
                  If the technician loses internet signal in a basement or bathroom, actions and photos are saved safely in an offline queue. As soon as signal returns, everything syncs automatically.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: How to Test & Navigate */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>3. How to Test & Navigate This Prototype</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  Reset Demo
                </span>
                <p className="text-slate-600">
                  Restores the entire prototype back to the fresh initial state anytime you want to try a new flow.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Fast-Forward Timer (1h, 12h, 23h, 24h)
                </span>
                <p className="text-slate-600">
                  When a job is in review, use these buttons to fast-forward time and watch reminder notifications and automatic 24h payout.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  Signal Connected / Offline Toggle
                </span>
                <p className="text-slate-600">
                  Click to simulate disconnecting internet and test how the provider can still work and queue submissions locally.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Notification Feed (Bell Icon)
                </span>
                <p className="text-slate-600">
                  Click the Bell icon near this button to view simulated push notifications and SMS text alerts sent to each persona.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Step-by-Step Suggested Walkthrough */}
          <section className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <span className="font-bold text-blue-300 block uppercase tracking-wider">
              💡 Suggested 2-Minute Test Run
            </span>
            <ol className="list-decimal pl-4 space-y-1 text-slate-300">
              <li>Switch to <strong>Provider</strong> and click <em>"Request Start of Work"</em>.</li>
              <li>Switch to <strong>Customer</strong> and click <em>"Approve Work Start"</em>.</li>
              <li>As Provider, click <em>"Complete Job"</em> and attach Before & After photos for each task.</li>
              <li>In the top bar, click <strong>24h Fast-Forward</strong> to see automatic payout release, or switch to Customer to inspect the photos and test a dispute!</li>
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Click <strong>Reset demo</strong> anytime to restart.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Got it, Explore Prototype</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
