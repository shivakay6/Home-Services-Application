import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import {
  Headphones,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  DollarSign,
  User,
  Wrench,
  Camera,
  Check,
  Split,
  FileText,
  History,
  Eye,
  ZoomIn,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ImageViewerModal } from '../common/ImageViewerModal';

export const SupportDashboard: React.FC = () => {
  const {
    state,
    recordSupportDisputeDecision,
    recordSupportIncompleteDecision,
    loadScenario,
  } = useJob();

  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'financials'>('evidence');

  // Adjudication selection (Strictly 3 options: full refund to customer, release to provider, 50-50 split)
  const [selectedOutcome, setSelectedOutcome] = useState<'refund_to_customer' | 'release_to_provider' | 'split'>('refund_to_customer');

  const [adjudicationRationale, setAdjudicationRationale] = useState<string>(
    'Reviewed statements and evidence submitted by both customer and provider. Decision applied in accordance with Consarc platform fair-pay guidelines.'
  );

  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);

  // Case states
  const isIncompleteChallenged =
    !!state.incompleteReport && state.incompleteReport.status === 'challenged_escalated_to_support';
  const isIncompleteResolved =
    !!state.incompleteReport && state.incompleteReport.status === 'support_resolved';
  const hasDispute =
    !!state.dispute && state.dispute.disputedAmount > 0;
  const isDisputeResolved =
    !!state.dispute?.supportDecision;

  // Non-completion classification: only appears in Support queue once challenged or resolved
  const isNonCompletionCase = isIncompleteChallenged || isIncompleteResolved;

  // Workmanship problem dispute: only appears when no incomplete job report is active and dispute is active/appealed/resolved
  const isWorkmanshipCase =
    !state.incompleteReport &&
    !!state.dispute &&
    (state.coreStatus === 'disputed' || !!state.dispute.supportDecision || state.disputeStatus === 'appealed');

  // Does any case exist in Support (active escalation OR previously resolved)?
  const hasCaseRecord = isNonCompletionCase || isWorkmanshipCase;

  const isCaseResolved = isIncompleteResolved || isDisputeResolved;

  const caseType = isNonCompletionCase
    ? 'Non-Completion Escalation'
    : state.disputeStatus === 'appealed'
    ? 'Rule Decision Appeal'
    : hasDispute
    ? 'Workmanship Problem Dispute'
    : 'Platform Escalation';

  // Total amount under adjudication
  const totalInEscrow = isNonCompletionCase
    ? state.financials.payableTotal
    : state.dispute?.disputedAmount || state.financials.amountHeld || state.financials.payableTotal;

  // Outcome calculation:
  // For Non-completion:
  //  - refund_to_customer: 100% full refund to customer, 0 to provider
  //  - release_to_provider: visit fee (₹500 default) to provider, remaining (total - 500) refunded to customer
  //  - No 50-50 split here!
  // For Work Problem:
  //  - refund_to_customer: 100% of disputed items refunded to customer, 0 to provider
  //  - release_to_provider: 100% released to provider, 0 to customer
  //  - split: 50-50 split
  const getOutcomeAmounts = (outcome: 'refund_to_customer' | 'release_to_provider' | 'split') => {
    if (isNonCompletionCase) {
      if (outcome === 'refund_to_customer') {
        return { customer: totalInEscrow, provider: 0 };
      }
      if (outcome === 'release_to_provider') {
        const visitFee = 500;
        const customerRefund = Math.max(0, totalInEscrow - visitFee);
        return { customer: customerRefund, provider: visitFee };
      }
      return { customer: totalInEscrow, provider: 0 };
    }

    if (outcome === 'refund_to_customer') {
      return { customer: totalInEscrow, provider: 0 };
    }
    if (outcome === 'release_to_provider') {
      return { customer: 0, provider: totalInEscrow };
    }
    // 50-50 split
    const half = Math.round(totalInEscrow / 2);
    return { customer: half, provider: totalInEscrow - half };
  };

  const previewAmounts = getOutcomeAmounts(selectedOutcome);
  const splitAmounts = getOutcomeAmounts('split');

  // Resolve handlers
  const handleApplyDecision = () => {
    const { customer, provider } = previewAmounts;

    if (isNonCompletionCase) {
      const decisionOutcome = selectedOutcome === 'split' ? 'refund_to_customer' : selectedOutcome;
      recordSupportIncompleteDecision(
        decisionOutcome as 'refund_to_customer' | 'release_to_provider',
        adjudicationRationale
      );
    } else {
      recordSupportDisputeDecision(
        selectedOutcome,
        adjudicationRationale,
        provider,
        customer
      );
    }
  };

  // If there has NEVER been an escalated case in this session, show initial empty queue
  if (!hasCaseRecord) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Support Console Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Support Operations Console</h1>
              <p className="text-xs text-slate-500">Tier-2 Escalation & Adjudication Desk</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Queue Clear • 0 Active Escalations
          </span>
        </div>

        {/* Clean Empty State Card */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-8 md:p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-4 shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-base font-bold text-slate-900 mb-1">Queue is Clear</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {state.incompleteReport?.status === 'pending_24h_challenge'
              ? 'Job reported not done. In 24h challenge window. Escalates to Support only if challenged with photos.'
              : 'No active escalations. Cases route here only when a claim is actively challenged with evidence photos.'}
          </p>
        </div>
      </div>
    );
  }

  // Gather photos
  const customerPhotos =
    state.incompleteReport?.customerPhotos ||
    state.dispute?.customerPhotos ||
    [];

  const providerPhotos =
    state.incompleteReport?.providerPhotos ||
    (state.completion
      ? [state.completion.beforePhotoUrl, state.completion.afterPhotoUrl]
      : []);

  const totalPhotosCount = customerPhotos.length + providerPhotos.length;

  // Active Decision Record if already resolved
  const activeDecision =
    state.incompleteReport?.supportDecision || state.dispute?.supportDecision;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Support Operations Dashboard</h1>
              {isCaseResolved ? (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Resolved • Adjudication Applied
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  1 Escalation Requiring Decision
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Job: <strong className="text-slate-200">{state.jobId}</strong> • {state.serviceName} • Parties: {state.customerName} & {state.providerName}
            </p>
          </div>
        </div>

        {/* Global Financial Metrics Bar */}
        <div className="flex items-center gap-4 bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-700/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Total Escrow</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              ₹{state.financials.payableTotal.toLocaleString()}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Under Adjudication</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              ₹{totalInEscrow.toLocaleString()}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Refunded to Date</span>
            <span className="font-mono font-bold text-blue-400 text-sm">
              ₹{state.financials.amountRefunded.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue List (Maintains item permanently with status updated) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Case Queue
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isCaseResolved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {isCaseResolved ? '1 Case (Resolved)' : '1 Case Pending'}
              </span>
            </div>

            {/* Case Queue Item Card */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                isCaseResolved
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-blue-500 bg-blue-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs">{state.jobId}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCaseResolved
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {isCaseResolved ? 'Status: Resolved' : 'Status: Escalated'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Customer: <strong>{state.customerName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Provider: <strong>{state.providerName}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Type: <strong className="text-slate-800">{caseType}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Disputed Amount:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">₹{totalInEscrow}</span>
              </div>

              {/* Photos indicator */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100/70 px-2.5 py-1 rounded-xl">
                <Camera className="w-3.5 h-3.5 text-blue-700" />
                <span>{totalPhotosCount} Evidence Photos Available</span>
              </div>

              {/* Status explanation */}
              {isCaseResolved && activeDecision && (
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-emerald-800">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Decision Applied: {activeDecision.outcome.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-700">
                    <span>Customer Refund: ₹{activeDecision.customerAmount}</span>
                    <span>Provider Payout: ₹{activeDecision.providerAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Display & Adjudication Desk */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
            {/* Packet Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900">
                    Case Evidence & Adjudication: {state.jobId}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isCaseResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCaseResolved ? 'Resolved' : 'Pending Adjudication'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {caseType} • Review all text statements and attached evidence photos below
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'evidence'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Evidence & All Photos ({totalPhotosCount})
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Audit Timeline ({state.events.length})
                </button>
                <button
                  onClick={() => setActiveTab('financials')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'financials'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Financial Ledger
                </button>
              </div>
            </div>

            {/* TAB 1: EVIDENCE (Identical complete structure for both Incomplete and Problem Report) */}
            {activeTab === 'evidence' && (
              <div className="p-6 space-y-6">
                {/* 1. If Incomplete Job: Customer vs Provider statements and exact 4 photos */}
                {isNonCompletionCase && state.incompleteReport && (
                  <div className="space-y-5">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Challenged Non-Completion Claim • 4 Photos Submitted
                      </span>
                      <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                        Pending Adjudication
                      </span>
                    </div>

                    {/* Side-by-Side Statements and 4 Photos Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Customer Card */}
                      <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>Customer: {state.customerName}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            2 Customer Photos
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 font-semibold block">Customer Stated Reason:</span>
                          <p className="font-semibold text-slate-900 pt-0.5 bg-white p-3 rounded-xl border border-blue-100 text-[11px] leading-relaxed">
                            "{state.incompleteReport.customerReason || state.incompleteReport.reason}"
                          </p>
                        </div>

                        {state.incompleteReport.challengedBy === 'customer' && (
                          <div>
                            <span className="text-[11px] text-rose-600 font-semibold block">Customer Counter-Challenge:</span>
                            <p className="text-slate-800 italic pt-0.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-[11px]">
                              "{state.incompleteReport.challengeReason}"
                            </p>
                          </div>
                        )}

                        {/* Customer 2 Uploaded Photos */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                            Customer Evidence Photos (2 of 4):
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {customerPhotos.map((photo, idx) => (
                              <div
                                key={idx}
                                onClick={() => setViewingImage({ url: photo, title: `Customer Evidence Photo ${idx + 1}` })}
                                className="relative group rounded-xl overflow-hidden border-2 border-blue-200 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-blue-500 transition-colors"
                              >
                                <img src={photo} alt={`Customer ${idx + 1}`} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                                <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                                  Customer #{idx + 1}
                                </span>
                                <span className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="w-3 h-3" />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Provider Card */}
                      <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Wrench className="w-4 h-4 text-emerald-600" />
                            <span>Provider: {state.providerName}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            2 Provider Photos
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 font-semibold block">Provider Stated Reason:</span>
                          <p className="font-semibold text-slate-900 pt-0.5 bg-white p-3 rounded-xl border border-emerald-100 text-[11px] leading-relaxed">
                            "{state.incompleteReport.providerReason || state.incompleteReport.reason}"
                          </p>
                        </div>

                        {state.incompleteReport.challengedBy === 'provider' && (
                          <div>
                            <span className="text-[11px] text-rose-600 font-semibold block">Provider Counter-Challenge:</span>
                            <p className="text-slate-800 italic pt-0.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-[11px]">
                              "{state.incompleteReport.challengeReason || state.incompleteReport.providerPerspective}"
                            </p>
                          </div>
                        )}

                        {/* Provider 2 Uploaded Photos */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            Provider Evidence Photos (2 of 4):
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {providerPhotos.map((photo, idx) => (
                              <div
                                key={idx}
                                onClick={() => setViewingImage({ url: photo, title: `Provider Evidence Photo ${idx + 1}` })}
                                className="relative group rounded-xl overflow-hidden border-2 border-emerald-200 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-emerald-500 transition-colors"
                              >
                                <img src={photo} alt={`Provider ${idx + 1}`} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                                <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                                  Provider #{idx + 1}
                                </span>
                                <span className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="w-3 h-3" />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. If Work Problem Dispute: Display all selected line items, custom text, and all pictures */}
                {!isNonCompletionCase && (
                  <div className="space-y-5">
                    {/* Customer Reported Problem Details */}
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-950">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          Customer Reported Work Problem
                        </span>
                        <span className="font-mono bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold">
                          ₹{state.dispute?.disputedAmount || state.financials.amountHeld} Held
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-rose-200">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Overall Description:</span>
                        <p className="text-slate-900 font-semibold text-xs mt-0.5">
                          "{state.dispute?.problemDescription || 'Customer reported incomplete or unsatisfactory work on line items.'}"
                        </p>
                      </div>

                      {/* Disputed Tasks & Defect Photos */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Disputed Line Items & Evidence:
                        </span>
                        {state.bookedTasks
                          .filter((t) => state.dispute?.disputedTaskIds.includes(t.id))
                          .map((t) => {
                            const taskEv = state.dispute?.taskDisputes?.find((td) => td.taskId === t.id);
                            return (
                              <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                                <div className="flex justify-between items-center font-bold text-slate-900 text-xs">
                                  <span>{t.name}</span>
                                  <span className="font-mono text-rose-600">₹{t.price}</span>
                                </div>
                                {taskEv?.problemDescription && (
                                  <p className="text-[11px] text-slate-600 italic">
                                    Notes: "{taskEv.problemDescription}"
                                  </p>
                                )}
                                {taskEv?.photos && taskEv.photos.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {taskEv.photos.map((p, pIdx) => (
                                      <div
                                        key={pIdx}
                                        onClick={() => setViewingImage({ url: p, title: `${t.name} Defect Photo` })}
                                        className="relative rounded-lg overflow-hidden border border-rose-200 aspect-video bg-slate-900 cursor-pointer"
                                      >
                                        <img src={p} alt="Defect" className="w-full h-full object-cover" />
                                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                          Defect Photo
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {/* Extra Work Disputed Items */}
                        {(state.extraWork?.items && state.extraWork.items.length > 0
                          ? state.extraWork.items
                          : state.extraWork
                          ? [
                              {
                                id: state.extraWork.id,
                                description: state.extraWork.description,
                                price: state.extraWork.price,
                                reason: state.extraWork.reason,
                                photoUrl: state.extraWork.photoUrl,
                              },
                            ]
                          : []
                        )
                          .filter((it) => state.dispute?.disputedTaskIds.includes(it.id))
                          .map((extraItem) => {
                            const taskEv = state.dispute?.taskDisputes?.find((td) => td.taskId === extraItem.id);
                            return (
                              <div key={extraItem.id} className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                                <div className="flex justify-between items-center font-bold text-slate-900 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span>{extraItem.description}</span>
                                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.2 rounded">
                                      Approved Extra
                                    </span>
                                  </div>
                                  <span className="font-mono text-rose-600">₹{extraItem.price}</span>
                                </div>
                                {taskEv?.problemDescription && (
                                  <p className="text-[11px] text-slate-600 italic">
                                    Notes: "{taskEv.problemDescription}"
                                  </p>
                                )}
                                {taskEv?.photos && taskEv.photos.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {taskEv.photos.map((p, pIdx) => (
                                      <div
                                        key={pIdx}
                                        onClick={() =>
                                          setViewingImage({
                                            url: p,
                                            title: `${extraItem.description} Defect Photo`,
                                          })
                                        }
                                        className="relative rounded-lg overflow-hidden border border-rose-200 aspect-video bg-slate-900 cursor-pointer"
                                      >
                                        <img src={p} alt="Defect" className="w-full h-full object-cover" />
                                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                          Defect Photo
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Provider Completion Evidence: Before & After Photos */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Provider Work Completion Photos (Before & After for each job item)
                        </span>
                        <span className="text-[10px] text-slate-500">Submitted by {state.providerName}</span>
                      </div>

                      {state.completion?.taskCompletions && state.completion.taskCompletions.length > 0 ? (
                        <div className="space-y-3">
                          {state.completion.taskCompletions.map((tc) => (
                            <div key={tc.taskId} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                              <span className="font-bold text-slate-900 block text-xs">{tc.taskName}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div
                                  onClick={() => setViewingImage({ url: tc.beforePhotoUrl, title: `${tc.taskName} - Before` })}
                                  className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                                >
                                  <img src={tc.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    Before Work
                                  </span>
                                </div>
                                <div
                                  onClick={() => setViewingImage({ url: tc.afterPhotoUrl, title: `${tc.taskName} - After` })}
                                  className="relative rounded-lg overflow-hidden border border-emerald-300 aspect-video bg-slate-900 cursor-pointer"
                                >
                                  <img src={tc.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-1 left-1 bg-emerald-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    After Work
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : state.completion ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => setViewingImage({ url: state.completion!.beforePhotoUrl, title: 'Before Work' })}
                            className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                          >
                            <img src={state.completion.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Before Work
                            </span>
                          </div>
                          <div
                            onClick={() => setViewingImage({ url: state.completion!.afterPhotoUrl, title: 'After Work' })}
                            className="relative rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-900 cursor-pointer"
                          >
                            <img src={state.completion.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-emerald-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              After Work
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px]">No completion evidence found.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Extra Work Scope & Approval Status Evidence Packet Section */}
                {state.extraWork && (
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-amber-950">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Evidence Packet: On-Site Extra Work Items ({state.extraWork.items?.length || 1} Item{(state.extraWork.items?.length || 1) > 1 ? 's' : ''})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          state.extraWork.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : state.extraWork.status === 'declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        Approval Status: {state.extraWork.status === 'approved' ? 'Approved' : state.extraWork.status === 'declined' ? 'Declined' : 'Awaiting Approval'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(state.extraWork.items && state.extraWork.items.length > 0
                        ? state.extraWork.items
                        : [
                            {
                              id: state.extraWork.id,
                              description: state.extraWork.description,
                              price: state.extraWork.price,
                              reason: state.extraWork.reason,
                              photoUrl: state.extraWork.photoUrl,
                            },
                          ]
                      ).map((item, idx) => {
                        const isDisputed = state.dispute?.disputedTaskIds.includes(item.id);
                        const taskEv = state.dispute?.taskDisputes?.find((td) => td.taskId === item.id);

                        return (
                          <div key={item.id || idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-slate-900 flex-wrap">
                                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-mono shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span>{item.description}</span>
                                  <span
                                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                      state.extraWork?.status === 'approved'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : state.extraWork?.status === 'declined'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}
                                  >
                                    Status: {state.extraWork?.status}
                                  </span>
                                  {isDisputed && (
                                    <span className="text-[9px] bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded font-bold">
                                      Disputed by Customer
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600 pl-7">
                                  <strong>Provider Justification:</strong> {item.reason}
                                </p>
                                {state.extraWork?.respondedBy && (
                                  <p className="text-[10px] text-slate-500 pl-7">
                                    Decision recorded by {state.extraWork.respondedBy === 'contact' ? 'On-site Contact (Ananya Rao)' : 'Customer (Priya Sharma)'}
                                    {state.extraWork.respondedAt ? ` at ${state.extraWork.respondedAt}` : ''}.
                                  </p>
                                )}
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                                ₹{item.price}
                              </span>
                            </div>

                            {/* Inspection Photo & Disputed Counter-Photo */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-7">
                              {item.photoUrl && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold text-slate-600 block">
                                    Provider Scope Evidence Photo:
                                  </span>
                                  <div
                                    onClick={() => setViewingImage({ url: item.photoUrl, title: `${item.description} - Provider Scope Photo` })}
                                    className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video max-h-28 bg-slate-900 cursor-pointer"
                                  >
                                    <img src={item.photoUrl} alt={item.description} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      Provider Photo
                                    </span>
                                  </div>
                                </div>
                              )}
                              {isDisputed && taskEv?.photos?.[0] && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold text-rose-600 block">
                                    Customer Dispute Defect Photo:
                                  </span>
                                  <div
                                    onClick={() => setViewingImage({ url: taskEv.photos[0], title: `${item.description} - Customer Dispute Evidence` })}
                                    className="relative rounded-lg overflow-hidden border border-rose-300 aspect-video max-h-28 bg-slate-900 cursor-pointer"
                                  >
                                    <img src={taskEv.photos[0]} alt="Customer dispute" className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 left-1 bg-rose-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      Customer Photo
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-amber-200 text-slate-700 flex justify-between items-center text-xs font-semibold">
                      <span>Total Extra Work Scope:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₹{state.extraWork.totalPrice || state.extraWork.price} ({state.extraWork.status})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AUDIT TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="p-6 space-y-3">
                <div className="space-y-3">
                  {state.events.map((evt) => (
                    <div key={evt.id} className="flex gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="font-mono text-slate-400 w-16 shrink-0 text-[11px] font-bold">{evt.timestamp}</div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{evt.title}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded font-medium">
                            {evt.actor}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIAL LEDGER */}
            {activeTab === 'financials' && (
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Escrow</span>
                    <span className="font-mono text-base font-bold text-slate-900">₹{state.financials.payableTotal}</span>
                  </div>
                  <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
                    <span className="text-[10px] text-rose-600 uppercase block font-semibold">
                      {isCaseResolved ? 'Escrow Status' : 'Held in Escrow'}
                    </span>
                    <span className="font-mono text-base font-bold text-rose-700">
                      {isCaseResolved ? '₹0' : `₹${state.financials.amountHeld || totalInEscrow}`}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {isCaseResolved ? 'Fully Settled' : 'Pending Adjudication'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
                    <span className="text-[10px] text-blue-600 uppercase block font-semibold">
                      {isCaseResolved ? 'Refunded to Customer' : 'Projected Customer Refund'}
                    </span>
                    <span className="font-mono text-base font-bold text-blue-700">
                      ₹{isCaseResolved ? state.financials.amountRefunded : previewAmounts.customer}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {isCaseResolved ? 'Settled to Priya Sharma' : `Based on: ${selectedOutcome.replace(/_/g, ' ')}`}
                    </span>
                  </div>
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 uppercase block font-semibold">
                      {isCaseResolved ? 'Paid to Provider' : 'Projected Provider Payout'}
                    </span>
                    <span className="font-mono text-base font-bold text-emerald-700">
                      ₹{isCaseResolved
                        ? state.financials.amountPaidOrInitiated
                        : (isNonCompletionCase
                            ? previewAmounts.provider
                            : (state.dispute ? state.dispute.undisputedAmount + previewAmounts.provider : previewAmounts.provider))}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {isCaseResolved ? 'Settled to Ravi Kumar' : `Based on: ${selectedOutcome.replace(/_/g, ' ')}`}
                    </span>
                  </div>
                </div>

                {/* Ledger Breakdown Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Escrow Ledger & Transaction Records</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isCaseResolved ? 'Settled Final Ledger' : `Projected on Selected: ${selectedOutcome.replace(/_/g, ' ').toUpperCase()}`}
                    </span>
                  </div>
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-50/50 text-slate-500 uppercase border-b border-slate-100 text-[10px]">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Transaction Item</th>
                        <th className="px-4 py-2 font-semibold">Party</th>
                        <th className="px-4 py-2 font-semibold">Type</th>
                        <th className="px-4 py-2 font-semibold text-right">Amount</th>
                        <th className="px-4 py-2 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="px-4 py-2 text-slate-800 font-sans font-medium">Customer Escrow Deposit</td>
                        <td className="px-4 py-2 text-slate-600 font-sans">Priya Sharma</td>
                        <td className="px-4 py-2 text-emerald-700 font-sans font-semibold">Deposit</td>
                        <td className="px-4 py-2 text-right font-bold text-slate-900">₹{state.financials.baseBookingTotal}</td>
                        <td className="px-4 py-2 text-right font-sans">
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">Escrowed</span>
                        </td>
                      </tr>
                      {state.extraWork?.status === 'approved' && (
                        <>
                          {(state.extraWork.items && state.extraWork.items.length > 0
                            ? state.extraWork.items
                            : [
                                {
                                  id: state.extraWork.id,
                                  description: state.extraWork.description,
                                  price: state.extraWork.price,
                                  reason: state.extraWork.reason,
                                  photoUrl: state.extraWork.photoUrl,
                                },
                              ]
                          ).map((extraItem, idx) => (
                            <tr key={extraItem.id || idx}>
                              <td className="px-4 py-2 text-slate-800 font-sans font-medium">
                                Extra Scope: {extraItem.description}
                              </td>
                              <td className="px-4 py-2 text-slate-600 font-sans">
                                {state.extraWork?.respondedBy === 'contact' ? 'On-site Contact' : 'Customer'}
                              </td>
                              <td className="px-4 py-2 text-emerald-700 font-sans font-semibold">Approved Extra</td>
                              <td className="px-4 py-2 text-right font-bold text-slate-900">+₹{extraItem.price}</td>
                              <td className="px-4 py-2 text-right font-sans">
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  Escrowed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                      {state.dispute && state.dispute.undisputedAmount > 0 && (
                        <tr>
                          <td className="px-4 py-2 text-slate-800 font-sans font-medium">Undisputed Scope Payout</td>
                          <td className="px-4 py-2 text-slate-600 font-sans">Ravi Kumar</td>
                          <td className="px-4 py-2 text-slate-700 font-sans font-semibold">Disbursal</td>
                          <td className="px-4 py-2 text-right font-bold text-emerald-700">₹{state.dispute.undisputedAmount}</td>
                          <td className="px-4 py-2 text-right font-sans">
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">Released</span>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-2 text-slate-800 font-sans font-medium">
                          {isNonCompletionCase
                            ? (selectedOutcome === 'refund_to_customer' ? 'Full Refund to Customer' : '₹500 Visit Fee to Provider')
                            : (selectedOutcome === 'refund_to_customer' ? 'Full Refund to Customer' : selectedOutcome === 'release_to_provider' ? 'Release Escrow to Provider' : '50-50 Split Settlement')}
                        </td>
                        <td className="px-4 py-2 text-slate-600 font-sans">
                          {selectedOutcome === 'refund_to_customer' ? 'Customer' : selectedOutcome === 'release_to_provider' ? 'Provider' : 'Split'}
                        </td>
                        <td className="px-4 py-2 text-blue-700 font-sans font-semibold">
                          {isCaseResolved ? 'Settled Adjudication' : 'Selected Option'}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-blue-800">
                          ₹{isCaseResolved ? (activeDecision?.customerAmount ?? state.financials.amountRefunded) : previewAmounts.customer} cust / ₹{isCaseResolved ? (activeDecision?.providerAmount ?? state.financials.amountPaidOrInitiated) : previewAmounts.provider} prov
                        </td>
                        <td className="px-4 py-2 text-right font-sans">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isCaseResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isCaseResolved ? 'Applied' : 'Selected (Draft)'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADJUDICATION DESK (STRICTLY 3 OPTIONS) */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Support Agent Adjudication Desk</span>
                </div>
                {isCaseResolved && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Adjudication Completed & Applied
                  </span>
                )}
              </div>

              {/* If Case is ALREADY Resolved: Display settled determination summary and allow re-adjudication if needed */}
              {isCaseResolved && activeDecision && (
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-xs space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Applied Decision: {activeDecision.outcome.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <span className="text-[11px] text-emerald-800 font-mono font-bold">
                      Settled at {activeDecision.decidedAt}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Agent Rationale Recorded:
                    </span>
                    <p className="text-slate-800 text-[11px] leading-relaxed">
                      "{activeDecision.rationale}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-blue-200 text-center">
                      <span className="text-[10px] text-slate-500 block font-semibold">Refunded to Priya Sharma (Customer)</span>
                      <span className="font-mono text-base font-bold text-blue-700">₹{activeDecision.customerAmount}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 block font-semibold">Released to Ravi Kumar (Provider)</span>
                      <span className="font-mono text-base font-bold text-emerald-700">₹{activeDecision.providerAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Determination Options:
                  - Job Not Done (Non-completion): Exactly 2 options (Full refund to customer, Release to provider with ₹500 visit fee). No 50-50 split allowed!
                  - Work Problem Dispute: Exactly 3 options (Full refund to customer, Release to provider, 50-50 split).
              */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="block font-bold text-slate-800 uppercase tracking-wider">
                    {isNonCompletionCase ? 'Determination:' : 'Refund Decision:'}
                  </span>
                  {isNonCompletionCase && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200">
                      ₹500 Visit Fee Rule
                    </span>
                  )}
                </div>

                <div className={`grid gap-3 ${isNonCompletionCase ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                  {/* Option 1: Full Refund to Customer */}
                  <button
                    type="button"
                    onClick={() => setSelectedOutcome('refund_to_customer')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedOutcome === 'refund_to_customer'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">Full Refund to Customer</span>
                      {selectedOutcome === 'refund_to_customer' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-3" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      ₹{totalInEscrow} to customer • ₹0 to provider
                    </div>
                  </button>

                  {/* Option 2: Release to Provider */}
                  <button
                    type="button"
                    onClick={() => setSelectedOutcome('release_to_provider')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedOutcome === 'release_to_provider'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">
                        {isNonCompletionCase ? 'Release Visit Fee to Provider' : 'Release to Provider'}
                      </span>
                      {selectedOutcome === 'release_to_provider' && (
                        <Check className="w-4 h-4 text-emerald-600 stroke-3" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {isNonCompletionCase
                        ? `₹500 visit fee to provider • ₹${Math.max(0, totalInEscrow - 500)} to customer`
                        : `₹${totalInEscrow} to provider • ₹0 to customer`}
                    </div>
                  </button>

                  {/* Option 3: 50-50 Split (ONLY for Work Problem disputes, NEVER for non-completion) */}
                  {!isNonCompletionCase && (
                    <button
                      type="button"
                      onClick={() => setSelectedOutcome('split')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedOutcome === 'split'
                          ? 'border-purple-500 bg-purple-50/80 text-purple-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs">50-50 Split</span>
                        {selectedOutcome === 'split' && (
                          <Check className="w-4 h-4 text-purple-600 stroke-3" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        ₹{splitAmounts.customer} to customer • ₹{splitAmounts.provider} to provider
                      </div>
                    </button>
                  )}
                </div>

                {/* Real-time Calculation Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700">Calculated Distribution:</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono font-bold">
                    <span className="text-blue-700">Customer Refund: ₹{previewAmounts.customer}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-700">Provider Payout: ₹{previewAmounts.provider}</span>
                  </div>
                </div>

                {/* Agent Rationale */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Agent Finding & Rationale:
                  </label>
                  <textarea
                    rows={2}
                    value={adjudicationRationale}
                    onChange={(e) => setAdjudicationRationale(e.target.value)}
                    placeholder="Provide evidence-based rationale for this decision..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Submit Decision Button */}
                <button
                  type="button"
                  onClick={handleApplyDecision}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isCaseResolved
                    ? 'Re-apply Support Decision & Update User Portals'
                    : 'Apply Support Decision & Settle Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Lightbox Modal */}
      <ImageViewerModal
        imageUrl={viewingImage?.url || null}
        title={viewingImage?.title}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
};
