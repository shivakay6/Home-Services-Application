import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import {
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Eye,
  Lock,
  Wrench,
  DollarSign,
  Camera,
  Scale,
  ShieldAlert,
  FastForward,
  Wifi,
  WifiOff,
  Play,
} from 'lucide-react';
import { CustomerDisputeModal } from '../customer/CustomerDisputeModal';
import { CustomerIncompleteReportModal } from '../customer/CustomerIncompleteReportModal';
import { TwoPhotoUploader } from '../common/TwoPhotoUploader';
import { ImageViewerModal } from '../common/ImageViewerModal';
import { SAMPLE_IMAGES } from '../../data/sampleAssets';

export const ContactSingleUseLinkView: React.FC = () => {
  const {
    state,
    offlineQueue,
    toggleOffline,
    approveStartWork,
    respondExtraWork,
    confirmJobCompletion,
    contestVisitFee,
    acceptIncompleteSettlement,
    reopenUsedContactLink,
  } = useJob();

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [showContestInput, setShowContestInput] = useState(false);
  const [selectedQuickContest, setSelectedQuickContest] = useState('');
  const [contestReason, setContestReason] = useState('');
  const [customerChallengePhotos, setCustomerChallengePhotos] = useState<string[]>([
    SAMPLE_IMAGES.customerPhoto1,
    SAMPLE_IMAGES.customerPhoto2,
  ]);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);

  const quickContestReasons = [
    'I was at the address and available',
    'I gave access to the site',
    'I did not ask the provider to stop',
    'The provider did not contact me or arrive',
    'I approved the extra work in the app',
    'Other',
  ];

  const handleContestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedQuickContest === 'Other' ? contestReason.trim() : (selectedQuickContest || contestReason.trim());
    if (!finalReason) return;
    contestVisitFee(finalReason, customerChallengePhotos);
    setShowContestInput(false);
    setContestReason('');
    setSelectedQuickContest('');
  };

  return (
    <div className="max-w-md mx-auto my-4 bg-slate-100/90 rounded-3xl p-3 shadow-xl border border-slate-300/80">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col min-h-[720px]">
        {/* Browser URL Simulation Bar */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <LinkIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="font-mono text-purple-800 truncate">consarc.ai/review/{state.contactLinkToken}</span>
          </div>
          <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold shrink-0">
            Live Synchronized Link
          </span>
        </div>

        {/* Contact Header */}
        <div className="bg-purple-950 text-white p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                On-Site Contact Portal
              </span>
              <h1 className="text-base font-bold text-white">Welcome, {state.contactName}</h1>
              <p className="text-xs text-purple-200 mt-0.5">
                Reviewing job on behalf of <strong>{state.customerName}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-purple-300 uppercase tracking-wider block font-medium">Job Reference</span>
              <span className="text-xs font-mono font-bold text-white">{state.jobId}</span>
            </div>
          </div>

          <div className="bg-purple-900/60 p-2.5 rounded-xl border border-purple-800 text-[11px] text-purple-200 leading-snug">
            <strong>Identical Live State:</strong> Synchronized with Priya Sharma's booking. Changes made here or on the customer portal update synchronously in real-time.
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="bg-purple-950 px-4 py-2 flex items-center justify-between text-[11px] font-medium border-t border-purple-800">
          <div className="flex items-center gap-1.5">
            {state.isOffline ? (
              <span className="flex items-center gap-1 text-amber-400 font-semibold text-[10px]">
                <WifiOff className="w-3.5 h-3.5" /> No Signal (Offline)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                <Wifi className="w-3.5 h-3.5" /> Connected Online
              </span>
            )}
          </div>
          <button
            onClick={toggleOffline}
            className={`text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors ${
              state.isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-purple-900 text-purple-200 border-purple-700 hover:bg-purple-800'
            }`}
          >
            {state.isOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>

        {/* Offline Banner when offline */}
        {state.isOffline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5 text-[11px]">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              On-Site Portal Offline (No Signal)
            </span>
            <span className="text-[10px] bg-amber-600/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
              {offlineQueue.filter((a) => a.actor === 'customer' || a.actor === 'contact').length > 0
                ? `${offlineQueue.filter((a) => a.actor === 'customer' || a.actor === 'contact').length} Queued Locally`
                : 'Local Mode'}
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Service Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">{state.serviceName}</h2>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span>Provider: {state.providerName}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                {state.coreStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Escrow Protection Indicator */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800 text-[11px]">Consarc Escrow Protection</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-[11px]">₹{state.financials.payableTotal} Total</span>
            </div>
          </div>

          {/* START WORK APPROVAL REQUEST CARD (FOR ON-SITE CONTACT) */}
          {state.startWorkStatus === 'requested' && state.coreStatus === 'in_progress' && !state.incompleteReport && (
            <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-blue-950 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                  Provider Requested Start Work Approval
                </span>
                <span className="text-[10px] bg-blue-200/90 text-blue-900 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  On-Site Action
                </span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                Provider <strong>{state.providerName}</strong> is on site with you and has requested approval to begin work on <strong>{state.serviceName}</strong>.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => approveStartWork('contact')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Start of Work as Contact</span>
                  {state.isOffline && <span className="text-[10px] opacity-80">(Queue Offline)</span>}
                </button>
              </div>
            </div>
          )}

          {/* START WORK APPROVED STATUS BANNER */}
          {state.startWorkStatus === 'approved' && state.coreStatus === 'in_progress' && !state.incompleteReport && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">Work Underway — Start Approved</span>
                  <span className="text-emerald-700 text-[11px]">
                    Authorized by {state.startWorkApprovedBy === 'contact' ? 'You (On-site Contact Ananya)' : 'Customer Priya Sharma'}
                    {state.startWorkApprovedAt ? ` at ${state.startWorkApprovedAt}` : ''}.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 uppercase">
                Active
              </span>
            </div>
          )}

          {/* 1. EXTRA WORK APPROVAL REQUEST CARD (KEEPS ITEMS VISIBLE) */}
          {state.extraWork && (
            <div
              className={`rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in border-2 ${
                state.extraWork.status === 'approved'
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : state.extraWork.status === 'declined'
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <Sparkles
                    className={`w-4 h-4 ${
                      state.extraWork.status === 'approved'
                        ? 'text-emerald-600'
                        : state.extraWork.status === 'declined'
                        ? 'text-slate-500'
                        : 'text-amber-600'
                    }`}
                  />
                  Extra Work on Site ({state.extraWork.items?.length || 1} Item{(state.extraWork.items?.length || 1) > 1 ? 's' : ''})
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      state.extraWork.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : state.extraWork.status === 'declined'
                        ? 'bg-rose-100 text-rose-800'
                        : state.extraWork.status === 'queued_offline'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {state.extraWork.status === 'approved'
                      ? 'Approved'
                      : state.extraWork.status === 'declined'
                      ? 'Declined'
                      : state.extraWork.status === 'queued_offline'
                      ? 'Queued Offline'
                      : 'Awaiting On-Site Approval'}
                  </span>
                  <span className="font-mono text-xs bg-white/90 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-900">
                    +₹{state.extraWork.totalPrice || state.extraWork.price}
                  </span>
                </div>
              </div>

              {/* Status banner */}
              <div
                className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                  state.extraWork.status === 'approved'
                    ? 'bg-emerald-100/70 text-emerald-900'
                    : state.extraWork.status === 'declined'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-amber-100/70 text-amber-900'
                }`}
              >
                {state.extraWork.status === 'approved' ? (
                  <span>
                    ✓ Approved by {state.extraWork.respondedBy === 'contact' ? 'On-site Contact (Ananya)' : 'Customer (Priya Sharma)'}. Total payable updated to ₹{state.financials.payableTotal}.
                  </span>
                ) : state.extraWork.status === 'declined' ? (
                  <span>
                    ✕ Extra work was declined. Base job continues at original price (₹{state.financials.baseBookingTotal}).
                  </span>
                ) : (
                  <span>
                    Provider Ravi Kumar discovered unexpected defects and requested prior approval before starting extra work.
                  </span>
                )}
              </div>

              {/* List each extra item */}
              <div className="space-y-2.5 pt-1">
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
                ).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item.description}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                        +₹{item.price}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Reason:</strong> {item.reason}
                    </p>

                    {item.photoUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500">Inspection Photo:</span>
                        <div
                          onClick={() =>
                            setViewingImage({
                              url: item.photoUrl,
                              title: `${item.description} - Discovered Defect`,
                            })
                          }
                          className="rounded-lg overflow-hidden border border-slate-200 aspect-video max-h-28 bg-slate-900 cursor-pointer relative group"
                        >
                          <img
                            src={item.photoUrl}
                            alt={item.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Photo #{idx + 1} (Tap to zoom)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Combined Total Row */}
              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                <span className="text-slate-700 font-semibold">
                  Combined Extra Total ({(state.extraWork.items?.length || 1)} Item{(state.extraWork.items?.length || 1) > 1 ? 's' : ''}):
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  +₹{state.extraWork.totalPrice || state.extraWork.price}
                </span>
              </div>

              {/* Action Buttons if awaiting approval */}
              {state.extraWork.status === 'awaiting_approval' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => respondExtraWork(true, 'contact')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    Approve as Contact (+₹{state.extraWork.totalPrice || state.extraWork.price})
                  </button>
                  <button
                    onClick={() => respondExtraWork(false, 'contact')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. INCOMPLETE JOB STATE (Identical Mirror of Customer Page) */}
          {state.incompleteReport && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Job Marked as Not Completed
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {state.incompleteReport?.status === 'pending_24h_challenge'
                    ? '24h Challenge Window'
                    : state.incompleteReport?.status === 'challenged_escalated_to_support'
                    ? 'Escalated to Support'
                    : state.incompleteReport?.status === 'support_resolved'
                    ? 'Support Resolved'
                    : 'Settled'}
                </span>
              </div>

              {/* Case A: Customer marked job as not completed */}
              {state.incompleteReport.initialReporter === 'customer' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-900">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Refund Request Initiated
                      </span>
                      <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        ₹{state.incompleteReport.initiatedRefundAmount} Queued
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Full refund is initiated automatically and escrow payment is protected.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-slate-500 block text-[11px] font-semibold">Customer Stated Reason:</span>
                    <p className="font-semibold text-slate-900">
                      "{state.incompleteReport.customerReason || state.incompleteReport.reason}"
                    </p>

                    {/* Customer 2 uploaded photos */}
                    {state.incompleteReport.customerPhotos && state.incompleteReport.customerPhotos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {state.incompleteReport.customerPhotos.map((photo, idx) => (
                          <div
                            key={idx}
                            onClick={() => setViewingImage({ url: photo, title: `Customer Evidence Photo ${idx + 1}` })}
                            className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                          >
                            <img src={photo} alt={`Customer ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Photo {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Case B: Provider marked job as not completed */}
              {state.incompleteReport.initialReporter === 'provider' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 text-amber-950 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Provider Marked Job as Not Completed
                      </span>
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        ₹1,500 Refund Queued
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900">
                      Provider reported unable to complete citing on-site issue and claimed <strong>₹500 Visit Fee</strong>. ₹1,500 is queued for refund.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-slate-500 block text-[11px] font-semibold">Provider's Stated Reason:</span>
                    <p className="font-semibold text-slate-900">
                      "{state.incompleteReport.providerReason || state.incompleteReport.reason}"
                    </p>

                    {/* Provider's 2 photos */}
                    {state.incompleteReport.providerPhotos && state.incompleteReport.providerPhotos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {state.incompleteReport.providerPhotos.map((photo, idx) => (
                          <div
                            key={idx}
                            onClick={() => setViewingImage({ url: photo, title: `Provider Photo ${idx + 1}` })}
                            className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer"
                          >
                            <img src={photo} alt={`Provider ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Provider Photo {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Challenge state */}
                  {state.incompleteReport.status === 'pending_24h_challenge' && (
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2.5">
                      <div className="flex items-center justify-between text-blue-950 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          24-Hour Window to Challenge Visit Fee
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                          24h Left
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        If you disagree with the ₹500 fee, you can challenge it stating why the provider was responsible, along with 2 photos. If unchallenged, ₹1,500 will be refunded and ₹500 released to provider.
                      </p>

                      {!showContestInput ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowContestInput(true)}
                              className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                            >
                              Challenge Visit Fee (Provide 2 Photos)
                            </button>
                            <button
                              onClick={() => acceptIncompleteSettlement('customer')}
                              className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors"
                            >
                              Accept ₹1,500 Refund
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleContestSubmit} className="space-y-3 pt-1 bg-white p-3 rounded-xl border border-amber-300">
                          <div>
                            <span className="block text-xs font-bold text-slate-900">
                              Challenge Visit Fee & Indicated Responsibility:
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Explain why you disagree with provider's claim and attach 2 photos:
                            </p>
                          </div>

                          {/* Quick selections */}
                          <div className="space-y-1">
                            {quickContestReasons.map((qr) => {
                              const isSelected = selectedQuickContest === qr;
                              return (
                                <button
                                  key={qr}
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuickContest(qr);
                                    if (qr !== 'Other') setContestReason('');
                                  }}
                                  className={`w-full text-left text-[11px] px-2.5 py-2 rounded-xl border transition-all flex items-center justify-between ${
                                    isSelected
                                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'
                                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{qr}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Details textarea (opens for Other or optional) */}
                          {(selectedQuickContest === 'Other' || selectedQuickContest) && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                {selectedQuickContest === 'Other' ? 'Describe the reason (Required):' : 'Additional details:'}
                              </label>
                              <textarea
                                rows={2}
                                value={contestReason}
                                required={selectedQuickContest === 'Other'}
                                onChange={(e) => setContestReason(e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                placeholder={selectedQuickContest === 'Other' ? 'Please explain why provider is responsible...' : 'Enter any notes...'}
                              />
                            </div>
                          )}

                          {/* Provision to upload 2 pictures */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <TwoPhotoUploader
                              photos={customerChallengePhotos}
                              onChange={setCustomerChallengePhotos}
                              label="Upload 2 Customer Evidence Photos"
                              helperText="Attach 2 photos showing open premises, call log, or working doorbell."
                              presetSamples={{
                                label: 'Customer Evidence',
                                photo1: SAMPLE_IMAGES.customerPhoto1,
                                photo2: SAMPLE_IMAGES.customerPhoto2,
                              }}
                            />
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowContestInput(false);
                                setContestReason('');
                                setSelectedQuickContest('');
                              }}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!selectedQuickContest || (selectedQuickContest === 'Other' && !contestReason.trim())}
                              className="flex-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                            >
                              Submit Challenge & 2 Photos to Support
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Challenged state */}
                  {state.incompleteReport.status === 'challenged_escalated_to_support' && (
                    <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-2.5">
                      <div className="font-bold text-purple-950 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          Visit Fee Contested • Escalated to Support
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">
                          In Support Queue
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-purple-200 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600 block">Challenge Reason:</span>
                        <p className="font-semibold text-slate-800">
                          "{state.incompleteReport.challengeReason || state.incompleteReport.visitFeeContestReason}"
                        </p>
                      </div>

                      {/* Customer's 2 photos */}
                      {state.incompleteReport.customerPhotos && state.incompleteReport.customerPhotos.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-purple-900 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Customer Uploaded Photos (2):
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {state.incompleteReport.customerPhotos.map((photo, idx) => (
                              <div
                                key={idx}
                                onClick={() => setViewingImage({ url: photo, title: `Customer Photo ${idx + 1}` })}
                                className="relative rounded-lg overflow-hidden border border-purple-300 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-purple-500"
                              >
                                <img src={photo} alt={`Customer ${idx + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Customer Photo #{idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-purple-700 leading-relaxed">
                        Responsibility is contested. All 4 photos and statements are in the <strong>Support Operations Dashboard</strong>.
                      </p>
                    </div>
                  )}

                  {/* Finalized state */}
                  {state.incompleteReport.status === 'unchallenged_finalized' && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Settlement Finalized (Unchallenged)
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        ₹1,500 refunded to customer account; ₹500 fixed visit fee released to provider.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Support Resolved State (Same for both) */}
              {state.incompleteReport.status === 'support_resolved' && state.incompleteReport.supportDecision && (
                <div className="p-3.5 bg-blue-50 rounded-xl border-2 border-blue-300 text-blue-950 space-y-2">
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-blue-900">
                      <Scale className="w-4 h-4 text-blue-600" />
                      Support Adjudication Applied
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
                      Decision Final
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 italic bg-white p-2.5 rounded-lg border border-blue-200">
                    "{state.incompleteReport.supportDecision.rationale}"
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2 bg-white rounded-lg border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Customer Refund</span>
                      <span className="font-mono text-xs font-bold text-blue-800">
                        ₹{state.incompleteReport.supportDecision.customerAmount}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Provider Payout</span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        ₹{state.incompleteReport.supportDecision.providerAmount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. REVIEW COMPLETED WORK (With Task-Level Before & After Photos) */}
          {state.coreStatus === 'in_review' && state.completion && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Inspect Completed Work On-site
                </span>
                <span className="text-xs font-bold text-indigo-900 font-mono">
                  ₹{state.financials.payableTotal}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Ravi Kumar submitted work evidence. Inspect each job item and confirm or report an issue.
              </p>

              {/* Task-Level Before/After Grid */}
              {state.completion.taskCompletions && state.completion.taskCompletions.length > 0 ? (
                <div className="space-y-3">
                  {state.completion.taskCompletions.map((tc, idx) => (
                    <div key={tc.taskId} className="bg-white p-2.5 rounded-xl border border-indigo-100 space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 block">
                        {idx + 1}. {tc.taskName}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={() => setViewingImage({ url: tc.beforePhotoUrl, title: `${tc.taskName} - Before` })}
                          className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 relative aspect-video cursor-pointer"
                        >
                          <img src={tc.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Before Work
                          </span>
                        </div>
                        <div
                          onClick={() => setViewingImage({ url: tc.afterPhotoUrl, title: `${tc.taskName} - After` })}
                          className="rounded-lg overflow-hidden border border-emerald-300 bg-slate-900 relative aspect-video cursor-pointer"
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
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <img src={state.completion.beforePhotoUrl} alt="Before" className="w-full h-24 object-cover" />
                    <div className="p-1 text-[10px] text-center font-semibold text-slate-600">Before Work</div>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-emerald-200 bg-white">
                    <img src={state.completion.afterPhotoUrl} alt="After" className="w-full h-24 object-cover" />
                    <div className="p-1 text-[10px] text-center font-semibold text-emerald-800">After Work</div>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => confirmJobCompletion('contact')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Completion & Release Escrow (₹{state.financials.payableTotal})
                </button>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100/70 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Report Work Problem (Dispute)
                </button>
              </div>
            </div>
          )}

          {/* Normal in_progress action trigger: Available ONLY before work is approved to start */}
          {state.coreStatus === 'in_progress' && state.startWorkStatus !== 'approved' && (
            <div className="pt-2">
              <button
                onClick={() => setShowIncompleteModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/70 text-xs font-semibold text-amber-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Report Job Not Done
              </button>
            </div>
          )}

          {/* 4. DISPUTED WORK PROBLEM STATE & SUPPORT RESOLUTION */}
          {(state.coreStatus === 'disputed' || !!state.dispute) && state.dispute && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between text-rose-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Work Problem Report
                </span>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded font-bold">
                  {state.dispute.supportDecision ? 'Resolved by Support' : 'In Support Review'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1.5 text-xs">
                <span className="text-slate-500 block text-[11px] font-semibold">Reported Issue:</span>
                <p className="font-semibold text-slate-900 leading-relaxed">
                  "{state.dispute.problemDescription}"
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px] font-mono font-bold">
                  <span className="text-rose-700">Disputed Held: ₹{state.dispute.disputedAmount}</span>
                  <span className="text-emerald-700">Undisputed Paid: ₹{state.dispute.undisputedAmount}</span>
                </div>
              </div>

              {/* If Support resolved the dispute */}
              {state.dispute.supportDecision && (
                <div className="p-3 bg-white rounded-xl border border-blue-300 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-950">
                    <span className="flex items-center gap-1.5 text-blue-900">
                      <Scale className="w-4 h-4 text-blue-600" />
                      Support Adjudication Applied
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                      {state.dispute.supportDecision.outcome.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    "{state.dispute.supportDecision.rationale}"
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-[10px] text-blue-700 font-semibold block">Refunded to Customer</span>
                      <span className="font-mono text-sm font-bold text-blue-800">
                        ₹{state.dispute.supportDecision.customerAmount ?? state.dispute.supportDecision.splitCustomerAmount ?? 0}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 font-semibold block">Paid to Provider</span>
                      <span className="font-mono text-sm font-bold text-slate-800">
                        ₹{state.dispute.supportDecision.providerAmount ?? state.dispute.supportDecision.splitProviderAmount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OVERALL REFUND SETTLEMENT BANNER */}
          {state.financials.amountRefunded > 0 && state.coreStatus !== 'incomplete_reported' && !state.incompleteReport && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-emerald-950 space-y-1.5 shadow-2xs">
              <div className="font-bold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Refund Processed & Settled
                </span>
                <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  ₹{state.financials.amountRefunded} Refunded
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Total refund of <strong>₹{state.financials.amountRefunded}</strong> has been credited to Priya Sharma's original payment method. Payout to provider: <strong>₹{state.financials.amountPaidOrInitiated}</strong>.
              </p>
            </div>
          )}

          {/* NORMAL WORK CONFIRMED BANNER */}
          {(state.coreStatus === 'confirmed' || (state.coreStatus === 'released' && !state.dispute && !state.incompleteReport)) && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Work Completed & Confirmed
              </div>
              <p className="text-[11px] text-emerald-800">
                Job complete. Full payment of <strong>₹{state.financials.amountPaidOrInitiated}</strong> released to provider {state.providerName}.
              </p>
            </div>
          )}

          {/* Job Scope & Financial Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <span className="font-semibold text-slate-700 uppercase tracking-wider block">Scope & Financial Summary</span>
            {state.bookedTasks.map((t) => (
              <div key={t.id} className="flex justify-between items-center">
                <span className="text-slate-700">{t.name}</span>
                <span className="font-semibold text-slate-900 font-mono">₹{t.price}</span>
              </div>
            ))}
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
                  <div key={extraItem.id || idx} className="flex justify-between items-center pt-1 border-t border-slate-200 text-emerald-800">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{extraItem.description} (Approved Extra)</span>
                    </span>
                    <span className="font-semibold font-mono">+₹{extraItem.price}</span>
                  </div>
                ))}
              </>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
              <span>Total Payable</span>
              <span className="font-mono text-sm">₹{state.financials.payableTotal}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>Amount Refunded:</span>
              <span className="font-mono font-bold text-blue-700">₹{state.financials.amountRefunded}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>Amount Paid to Provider:</span>
              <span className="font-mono font-bold text-emerald-700">₹{state.financials.amountPaidOrInitiated}</span>
            </div>
          </div>
        </div>
      </div>

      <CustomerDisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        reporter="contact"
      />

      <CustomerIncompleteReportModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
      />

      <ImageViewerModal
        imageUrl={viewingImage?.url || null}
        title={viewingImage?.title}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
};
