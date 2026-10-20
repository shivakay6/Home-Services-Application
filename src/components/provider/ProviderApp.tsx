import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Wifi,
  Sparkles,
  Camera,
  Send,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Check,
  FastForward,
  Scale,
  Eye,
  Lock,
  Play,
} from 'lucide-react';
import { ProviderExtraWorkModal } from './ProviderExtraWorkModal';
import { ProviderCompletionModal } from './ProviderCompletionModal';
import { ProviderCannotCompleteModal } from './ProviderCannotCompleteModal';
import { AppealModal } from '../common/AppealModal';
import { TwoPhotoUploader } from '../common/TwoPhotoUploader';
import { ImageViewerModal } from '../common/ImageViewerModal';
import { SAMPLE_IMAGES } from '../../data/sampleAssets';

export const ProviderApp: React.FC = () => {
  const {
    state,
    offlineQueue,
    requestStartWork,
    sendQueuedExtraWork,
    toggleOffline,
    providerSubmitPerspective,
    acceptIncompleteSettlement,
  } = useJob();

  const [showExtraWorkModal, setShowExtraWorkModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCannotCompleteModal, setShowCannotCompleteModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showPerspectiveInput, setShowPerspectiveInput] = useState(false);
  const [selectedQuickPerspective, setSelectedQuickPerspective] = useState('');
  const [perspectiveText, setPerspectiveText] = useState('');
  const [providerChallengePhotos, setProviderChallengePhotos] = useState<string[]>([
    SAMPLE_IMAGES.providerPhoto1,
    SAMPLE_IMAGES.providerPhoto2,
  ]);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);

  const isQueuedCompletion = state.coreStatus === 'completion_queued_offline';
  const isQueuedExtraWork = state.extraWork?.status === 'queued_offline';

  const quickProviderPerspectiveReasons = [
    'I was at the address at the booked time',
    'I started the work',
    'The customer refused access or asked me to stop',
    'The customer has already confirmed this job',
    'Other',
  ];

  const handlePerspectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedQuickPerspective === 'Other' ? perspectiveText.trim() : (selectedQuickPerspective || perspectiveText.trim());
    if (!finalReason) return;
    providerSubmitPerspective(finalReason, providerChallengePhotos);
    setShowPerspectiveInput(false);
    setPerspectiveText('');
    setSelectedQuickPerspective('');
  };

  return (
    <div className="max-w-md mx-auto my-4 bg-slate-100/90 rounded-3xl p-3 shadow-xl border border-slate-300/80">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col min-h-[720px]">
        {/* Mobile Status Bar */}
        <div className="bg-slate-900 text-white px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-medium">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            {state.isOffline ? (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <WifiOff className="w-3.5 h-3.5" /> Offline Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> 5G Online
              </span>
            )}
          </div>
        </div>

        {/* Provider App Header */}
        <div className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
              RK
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">Ravi Kumar (Provider)</h2>
              <p className="text-[10px] text-slate-400">Consarc Partner App • Active Job</p>
            </div>
          </div>
          <button
            onClick={toggleOffline}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
              state.isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {state.isOffline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {state.isOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>

        {/* Offline Banner when offline */}
        {state.isOffline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5 text-[11px]">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              Basement / Low Connectivity Mode (No Signal)
            </span>
            <span className="text-[10px] bg-amber-600/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
              {offlineQueue.filter((a) => a.actor === 'provider').length > 0
                ? `${offlineQueue.filter((a) => a.actor === 'provider').length} Queued Locally`
                : 'Local Queue'}
            </span>
          </div>
        )}

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Job Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {state.jobId}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{state.serviceName}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                {state.coreStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-1 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-slate-900">{state.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Service Escrow:</span>
                <span className="font-mono font-bold text-slate-900">₹{state.financials.baseBookingTotal}</span>
              </div>
              {state.extraWork && state.extraWork.status === 'approved' && (
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
                    <div key={extraItem.id || idx} className="flex justify-between text-emerald-700 font-semibold">
                      <span>• {extraItem.description} (Approved):</span>
                      <span className="font-mono">+₹{extraItem.price}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
                <span>Total Escrow Amount:</span>
                <span className="font-mono text-sm text-blue-700">₹{state.financials.payableTotal}</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* FLOW 1: INCOMPLETE JOB CARD (WITH 2-PHOTO UPLOAD & EVIDENCE)  */}
          {/* ============================================================== */}
          {state.incompleteReport && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-3 shadow-xs">
              {/* Header Badge */}
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Job Marked as Not Completed
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {state.incompleteReport?.status === 'pending_24h_challenge'
                    ? '24h Challenge Window'
                    : state.incompleteReport?.status === 'challenged_escalated_to_support'
                    ? 'Escalated to Support'
                    : state.incompleteReport?.status === 'support_resolved'
                    ? 'Support Resolved'
                    : 'Settled'}
                </span>
              </div>

              {/* CASE A: CUSTOMER MARKED JOB AS NOT COMPLETED */}
              {state.incompleteReport.initialReporter === 'customer' && (
                <div className="space-y-3">
                  {/* Money Withheld Banner */}
                  <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-1.5">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-rose-900">
                        <Lock className="w-4 h-4 text-rose-600" />
                        Money Withheld — Customer Marked Job Not Completed
                      </span>
                      <span className="font-mono text-xs font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded">
                        ₹{state.financials.amountHeld} Held
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Escrow payment of ₹{state.financials.amountHeld} is currently withheld. The customer requested a full refund.
                    </p>
                  </div>

                  {/* Customer Reason and 2 Evidence Photos */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-slate-500 block text-[11px] font-semibold">Customer's Stated Reason:</span>
                    <p className="font-semibold text-slate-800">
                      "{state.incompleteReport.customerReason || state.incompleteReport.reason}"
                    </p>

                    {/* Customer's 2 Uploaded Pictures */}
                    {state.incompleteReport.customerPhotos && state.incompleteReport.customerPhotos.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          Customer Uploaded Photos (2):
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {state.incompleteReport.customerPhotos.map((photo, idx) => (
                            <div
                              key={idx}
                              onClick={() => setViewingImage({ url: photo, title: `Customer Photo ${idx + 1}` })}
                              className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-blue-400 transition-colors"
                            >
                              <img src={photo} alt={`Customer ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Photo {idx + 1}
                              </span>
                              <span className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-3 h-3" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status 1: Pending 24h Challenge Window */}
                  {state.incompleteReport.status === 'pending_24h_challenge' && (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 space-y-1">
                        <div className="font-bold flex items-center justify-between text-blue-950">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            24-Hour Challenge Window Active
                          </span>
                          <span className="text-[10px] bg-blue-100 font-mono font-bold px-2 py-0.5 rounded">
                            24h Left
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          You have 24 hours to challenge this claim if the customer was responsible. If you challenge, you will submit your reason & 2 photos, and it will escalate to Support. If unchallenged, the full refund auto-finalizes.
                        </p>
                      </div>

                      {!showPerspectiveInput ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowPerspectiveInput(true)}
                              className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                            >
                              Challenge Claim (Customer Responsible)
                            </button>
                            <button
                              onClick={() => acceptIncompleteSettlement('provider')}
                              className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                            >
                              Accept Refund
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handlePerspectiveSubmit} className="space-y-3 pt-1 bg-white p-3.5 rounded-xl border border-amber-300">
                          <div>
                            <span className="block text-xs font-bold text-slate-900">
                              Challenge Non-Completion Claim:
                            </span>
                            <p className="text-[11px] text-slate-500">
                              State why you were not responsible and customer was responsible for the incomplete job:
                            </p>
                          </div>

                          {/* Quick selection reasons */}
                          <div className="space-y-1">
                            {quickProviderPerspectiveReasons.map((qr) => {
                              const isSelected = selectedQuickPerspective === qr;
                              return (
                                <button
                                  key={qr}
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuickPerspective(qr);
                                    if (qr !== 'Other') setPerspectiveText('');
                                  }}
                                  className={`w-full text-left text-[11px] px-2.5 py-2 rounded-xl border transition-all flex items-center justify-between ${
                                    isSelected
                                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'
                                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{qr}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Empty text box with placeholder alone */}
                          {(selectedQuickPerspective === 'Other' || selectedQuickPerspective) && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                {selectedQuickPerspective === 'Other' ? 'Describe the reason (Required):' : 'Additional details / Statement:'}
                              </label>
                              <textarea
                                rows={2}
                                value={perspectiveText}
                                required={selectedQuickPerspective === 'Other'}
                                onChange={(e) => setPerspectiveText(e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                placeholder={selectedQuickPerspective === 'Other' ? 'Explain what occurred on-site...' : 'Add any additional notes...'}
                              />
                            </div>
                          )}

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <TwoPhotoUploader
                              photos={providerChallengePhotos}
                              onChange={setProviderChallengePhotos}
                              label="Upload 2 Provider Evidence Photos"
                              presetSamples={{
                                label: 'Provider Evidence',
                                photo1: SAMPLE_IMAGES.providerPhoto1,
                                photo2: SAMPLE_IMAGES.providerPhoto2,
                              }}
                            />
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowPerspectiveInput(false);
                                setPerspectiveText('');
                                setSelectedQuickPerspective('');
                              }}
                              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!selectedQuickPerspective || (selectedQuickPerspective === 'Other' && !perspectiveText.trim())}
                              className="flex-1 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                            >
                              Submit Challenge & 2 Photos to Support
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Status 2: Provider Challenged - Escalated to Support */}
                  {state.incompleteReport.status === 'challenged_escalated_to_support' && (
                    <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-purple-900 text-xs space-y-2.5">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          Claim Challenged • Escalated to Support Dashboard
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">
                          In Support Queue
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-purple-200 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600 block">Your Challenge Perspective:</span>
                        <p className="font-semibold text-slate-800">
                          "{state.incompleteReport.providerPerspective || state.incompleteReport.challengeReason}"
                        </p>
                      </div>

                      {/* Display Provider's 2 photos */}
                      {state.incompleteReport.providerPhotos && state.incompleteReport.providerPhotos.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-purple-900 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Your Uploaded Evidence Photos (2):
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {state.incompleteReport.providerPhotos.map((photo, idx) => (
                              <div
                                key={idx}
                                onClick={() => setViewingImage({ url: photo, title: `Your Photo ${idx + 1}` })}
                                className="relative rounded-lg overflow-hidden border border-purple-300 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-purple-500"
                              >
                                <img src={photo} alt={`Provider ${idx + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Your Photo {idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-purple-700 text-[11px] leading-relaxed">
                        Responsibility is disputed. All 4 evidence photos and statements have been routed to the <strong>Support Operations Dashboard</strong>. Support will adjudicate payment.
                      </p>
                    </div>
                  )}

                  {/* Status 3: Finalized Unchallenged */}
                  {state.incompleteReport.status === 'unchallenged_finalized' && (
                    <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-700 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-slate-600" />
                        Job Cancelled & Refund Settled
                      </div>
                      <p className="text-[11px] text-slate-600">
                        24-hour challenge deadline passed without challenge. Full refund settled to customer.
                      </p>
                    </div>
                  )}

                  {/* Status 4: Resolved by Support */}
                  {state.incompleteReport.status === 'support_resolved' && state.incompleteReport.supportDecision && (
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 text-xs text-blue-950 space-y-2 shadow-xs">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-blue-900">
                          <Scale className="w-4 h-4 text-blue-600" />
                          Support Adjudication Applied
                        </span>
                        <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
                          Decision Final
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                          Agent Finding & Rationale:
                        </span>
                        <p className="text-slate-800 text-[11px] font-medium leading-relaxed">
                          "{state.incompleteReport.supportDecision.rationale}"
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                          <span className="text-[10px] text-emerald-700 font-semibold block">Payout to You</span>
                          <span className="font-mono text-sm font-bold text-emerald-800">
                            ₹{state.incompleteReport.supportDecision.providerAmount}
                          </span>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-center">
                          <span className="text-[10px] text-blue-700 font-semibold block">Refund to Customer</span>
                          <span className="font-mono text-sm font-bold text-blue-800">
                            ₹{state.incompleteReport.supportDecision.customerAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CASE B: PROVIDER MARKED JOB AS NOT COMPLETED */}
              {state.incompleteReport.initialReporter === 'provider' && (
                <div className="space-y-3">
                  {/* Banner */}
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-emerald-950 space-y-1.5">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Visit Fee Refund Requested
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {state.incompleteReport.responsibility === 'customer' ? '₹500 Fee Claimed' : 'Full Refund'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {state.incompleteReport.responsibility === 'customer'
                        ? 'You reported unable to complete citing customer responsibility. ₹500 fixed visit fee requested; ₹1,500 balance queued for customer.'
                        : 'You marked job not completed citing provider responsibility. Full refund initiated for customer.'}
                    </p>
                  </div>

                  {/* Provider Stated Reason and 2 Photos */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-2">
                    <span className="text-slate-500 block text-[11px] font-semibold">Your Reported Reason:</span>
                    <p className="font-semibold text-slate-800">
                      "{state.incompleteReport.providerReason || state.incompleteReport.reason}"
                    </p>

                    {/* Provider's 2 Photos */}
                    {state.incompleteReport.providerPhotos && state.incompleteReport.providerPhotos.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-emerald-600" />
                          Your Uploaded Photos (2):
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {state.incompleteReport.providerPhotos.map((photo, idx) => (
                            <div
                              key={idx}
                              onClick={() => setViewingImage({ url: photo, title: `Your Evidence Photo ${idx + 1}` })}
                              className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-emerald-400"
                            >
                              <img src={photo} alt={`Provider ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Photo {idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status 1: Pending customer challenge */}
                  {state.incompleteReport.status === 'pending_24h_challenge' && (
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 text-xs space-y-1.5">
                      <div className="font-bold flex items-center justify-between text-blue-950">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          24h Customer Challenge Window
                        </span>
                        <span className="text-[10px] bg-blue-100 font-mono font-bold px-2 py-0.5 rounded">
                          24h Left
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        Customer has been notified. They have 24 hours to challenge the ₹500 fee. If unchallenged, ₹500 will be settled to your account automatically.
                      </p>
                    </div>
                  )}

                  {/* Status 2: Customer Challenged Visit Fee */}
                  {state.incompleteReport.status === 'challenged_escalated_to_support' && (
                    <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-purple-900 text-xs space-y-2">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          Customer Challenged Visit Fee • Escalated to Support
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">
                          In Support Queue
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-purple-200 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600 block">Customer's Challenge Statement:</span>
                        <p className="font-semibold text-slate-800">
                          "{state.incompleteReport.challengeReason || state.incompleteReport.visitFeeContestReason}"
                        </p>
                      </div>

                      {/* Display Customer's 2 photos if available */}
                      {state.incompleteReport.customerPhotos && state.incompleteReport.customerPhotos.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-purple-900 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Customer Uploaded Evidence Photos (2):
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
                                  Customer Photo {idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-purple-700 text-[11px] leading-relaxed">
                        Responsibility is contested. All 4 photos and statements are now in the <strong>Support Dashboard</strong> for determination.
                      </p>
                    </div>
                  )}

                  {/* Status 3: Finalized Unchallenged */}
                  {state.incompleteReport.status === 'unchallenged_finalized' && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 text-xs text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Fixed Visit Fee Released (Unchallenged)
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Customer did not challenge within 24 hours. ₹{state.incompleteReport.initiatedVisitFeeAmount} released to your account.
                      </p>
                    </div>
                  )}

                  {/* Status 4: Support Resolved */}
                  {state.incompleteReport.status === 'support_resolved' && state.incompleteReport.supportDecision && (
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 text-xs text-blue-950 space-y-2 shadow-xs">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-blue-900">
                          <Scale className="w-4 h-4 text-blue-600" />
                          Support Adjudication Applied
                        </span>
                        <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
                          Decision Final
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-200 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                          Agent Finding & Rationale:
                        </span>
                        <p className="text-slate-800 text-[11px] font-medium leading-relaxed">
                          "{state.incompleteReport.supportDecision.rationale}"
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                          <span className="text-[10px] text-emerald-700 font-semibold block">Payout to You</span>
                          <span className="font-mono text-sm font-bold text-emerald-800">
                            ₹{state.incompleteReport.supportDecision.providerAmount}
                          </span>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-center">
                          <span className="text-[10px] text-blue-700 font-semibold block">Refund to Customer</span>
                          <span className="font-mono text-sm font-bold text-blue-800">
                            ₹{state.incompleteReport.supportDecision.customerAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DISPUTED / PROBLEM REPORTED STATUS CARD FOR PROVIDER */}
          {(state.coreStatus === 'disputed' || state.dispute) && state.dispute && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-rose-950 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Work Problem Dispute Active
                </span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-bold">
                  {state.dispute.supportDecision ? 'Resolved by Support' : 'Under Review'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1.5 text-xs">
                <span className="text-slate-500 block text-[11px] font-semibold">Customer Problem Report:</span>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  "{state.dispute.problemDescription}"
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px] font-mono font-bold">
                  <span className="text-emerald-700">Undisputed Released: ₹{state.dispute.undisputedAmount}</span>
                  <span className="text-rose-700">Held in Escrow: ₹{state.dispute.disputedAmount}</span>
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
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-semibold block">Payout to You</span>
                      <span className="font-mono text-sm font-bold text-emerald-800">
                        ₹{state.dispute.supportDecision.providerAmount ?? state.dispute.supportDecision.splitProviderAmount ?? 0}
                      </span>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-[10px] text-blue-700 font-semibold block">Refund to Customer</span>
                      <span className="font-mono text-sm font-bold text-blue-800">
                        ₹{state.dispute.supportDecision.customerAmount ?? state.dispute.supportDecision.splitCustomerAmount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OVERALL SETTLEMENT BANNER FOR PROVIDER */}
          {state.financials.amountPaidOrInitiated > 0 && state.coreStatus !== 'incomplete_reported' && !state.dispute && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-emerald-950 space-y-1.5 shadow-2xs">
              <div className="font-bold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payout Successfully Settled
                </span>
                <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  ₹{state.financials.amountPaidOrInitiated} Paid
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Total payout of <strong>₹{state.financials.amountPaidOrInitiated}</strong> has been transferred to your registered account.
              </p>
            </div>
          )}

          {/* EXTRA WORK REQUEST CARD FOR PROVIDER */}
          {state.extraWork && (
            <div
              className={`border rounded-2xl p-4 text-xs space-y-3 shadow-2xs ${
                state.extraWork.status === 'approved'
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : state.extraWork.status === 'declined'
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <Sparkles
                    className={`w-4 h-4 ${
                      state.extraWork.status === 'approved'
                        ? 'text-emerald-600'
                        : state.extraWork.status === 'declined'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  />
                  Extra Work Items ({state.extraWork.items?.length || 1})
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    state.extraWork.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : state.extraWork.status === 'declined'
                      ? 'bg-rose-100 text-rose-800'
                      : state.isOffline || state.extraWork.status === 'queued_offline'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {state.extraWork.status === 'approved'
                    ? 'Approved'
                    : state.extraWork.status === 'declined'
                    ? 'Declined'
                    : state.isOffline || state.extraWork.status === 'queued_offline'
                    ? 'Queued Locally'
                    : 'Awaiting Approval'}
                </span>
              </div>

              {/* List of each extra work item */}
              <div className="space-y-2">
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
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span>{item.description}</span>
                      </span>
                      <span className="font-mono text-emerald-700">+₹{item.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>Reason:</strong> {item.reason}
                    </p>
                    {item.photoUrl && (
                      <div
                        onClick={() =>
                          setViewingImage({
                            url: item.photoUrl,
                            title: `${item.description} - Discovered Issue`,
                          })
                        }
                        className="rounded-lg overflow-hidden border border-slate-200 aspect-video max-h-24 bg-slate-900 cursor-pointer relative group"
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.description}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Item #{idx + 1} Photo
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary and updated total */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-slate-800">
                <div className="flex justify-between items-center font-bold">
                  <span>Total Extra Work Amount:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    +₹{state.extraWork.totalPrice || state.extraWork.price}
                  </span>
                </div>
                {state.extraWork.status === 'approved' && (
                  <div className="flex justify-between items-center font-bold text-blue-900 bg-emerald-100/60 p-2 rounded-lg border border-emerald-200">
                    <span>Updated Job Total (Escrow):</span>
                    <span className="font-mono text-sm font-bold text-emerald-800">
                      ₹{state.financials.payableTotal}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-600 font-medium pt-1">
                {state.extraWork.status === 'approved'
                  ? `Customer approved all ${state.extraWork.items?.length || 1} extra items. Escrow total increased to ₹${state.financials.payableTotal}.`
                  : state.extraWork.status === 'declined'
                  ? 'Customer declined this request. Base booking remains ₹2,000.'
                  : state.isOffline || state.extraWork.status === 'queued_offline'
                  ? 'Offline Mode: Request queued locally. Will be transmitted to customer when signal is connected.'
                  : 'Request sent to customer & on-site contact for prior approval before work starts.'}
              </p>
            </div>
          )}

          {/* WORK COMPLETION SUBMITTED CARD FOR PROVIDER */}
          {state.completion &&
            (state.coreStatus === 'in_review' || state.coreStatus === 'completion_queued_offline') &&
            !state.dispute &&
            !state.incompleteReport && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 text-xs space-y-3 shadow-2xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-blue-950">
                    <Camera className="w-4 h-4 text-blue-600" />
                    {state.isOffline || state.coreStatus === 'completion_queued_offline'
                      ? 'Completion Recorded (Offline Queue)'
                      : 'Work Submitted for Customer Review'}
                  </span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold uppercase">
                    {state.isOffline || state.coreStatus === 'completion_queued_offline'
                      ? 'Queued Locally'
                      : 'In Review'}
                  </span>
                </div>

                <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                  {state.isOffline || state.coreStatus === 'completion_queued_offline'
                    ? 'Completion photos saved locally. Status will sync to customer as soon as signal is connected online.'
                    : 'Platform received 2 photos. Customer has 24 hours to review or report an issue. If unchallenged, payout auto-releases.'}
                </p>

                {/* Photos */}
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Uploaded Evidence Photos (2):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() =>
                        setViewingImage({
                          url: state.completion!.beforePhotoUrl,
                          title: 'Before Work Photo',
                        })
                      }
                      className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-blue-400 transition-colors"
                    >
                      <img
                        src={state.completion.beforePhotoUrl}
                        alt="Before work"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Before Work
                      </span>
                    </div>
                    <div
                      onClick={() =>
                        setViewingImage({
                          url: state.completion!.afterPhotoUrl,
                          title: 'After Work Photo',
                        })
                      }
                      className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 cursor-pointer shadow-2xs hover:border-blue-400 transition-colors"
                    >
                      <img
                        src={state.completion.afterPhotoUrl}
                        alt="After work"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        After Work
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Action Buttons for Normal in_progress Flow */}
          {state.coreStatus === 'in_progress' && (
            <div className="pt-2">
              {/* STEP 1A: WORK NOT YET STARTED */}
              {state.startWorkStatus === 'not_started' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                      <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <span>Start Work Step</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Before you can add extra work or mark the job complete, you must first tap <strong>Start work</strong>. This sends a request to customer Priya Sharma or named on-site person Ananya Rao through their link page.
                    </p>
                    <button
                      onClick={requestStartWork}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start work</span>
                      {state.isOffline && (
                        <span className="text-[10px] bg-blue-700/80 px-2 py-0.5 rounded font-normal">
                          Queue Offline
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Report job not done is available from the beginning of the job, before work is approved */}
                  <button
                    onClick={() => setShowCannotCompleteModal(true)}
                    className="w-full py-2 px-4 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-[11px] font-semibold text-amber-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Report job not done (Cannot complete)
                  </button>
                </div>
              )}

              {/* STEP 1B: START WORK REQUEST SENT, PENDING CUSTOMER OR ON-SITE CONTACT APPROVAL */}
              {state.startWorkStatus === 'requested' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        {state.isOffline ? 'Start Work Request Queued (Offline)' : 'Start Work Request Sent — Awaiting Approval'}
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                        {state.isOffline ? 'Offline Queue' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      {state.isOffline
                        ? 'Request saved locally on your device. It will transmit to Priya Sharma or on-site contact Ananya as soon as signal connects online.'
                        : 'Awaiting approval from Priya Sharma or named on-site person Ananya Rao through their link. Once approved, Complete work and Add extra work options will be unlocked.'}
                    </p>
                  </div>

                  {/* Report job not done remains available before work is approved to start */}
                  <button
                    onClick={() => setShowCannotCompleteModal(true)}
                    className="w-full py-2 px-4 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-[11px] font-semibold text-amber-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Report job not done (Cannot complete)
                  </button>
                </div>
              )}

              {/* STEP 2: START OF WORK APPROVED — COMPLETE WORK & ADD EXTRA WORK UNLOCKED */}
              {state.startWorkStatus === 'approved' && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <div>
                        <span className="font-bold block text-xs">Work In Progress — Start Approved</span>
                        <span className="text-emerald-700 text-[11px]">
                          Approved by {state.startWorkApprovedBy === 'contact' ? 'On-site Contact (Ananya)' : 'Customer (Priya Sharma)'}
                          {state.startWorkApprovedAt ? ` at ${state.startWorkApprovedAt}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      Approved
                    </span>
                  </div>

                  <button
                    onClick={() => setShowExtraWorkModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Request Extra Work Approval
                  </button>

                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Mark Job Complete (Upload Photos)
                  </button>

                  {/* NOTE: Report job not done is NO LONGER available to either side once start work is approved. Any problem now goes through problem-report flow after completion. */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProviderExtraWorkModal
        isOpen={showExtraWorkModal}
        onClose={() => setShowExtraWorkModal(false)}
      />

      <ProviderCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />

      <ProviderCannotCompleteModal
        isOpen={showCannotCompleteModal}
        onClose={() => setShowCannotCompleteModal(false)}
      />

      <AppealModal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        appellant="provider"
      />

      {/* Lightbox Modal */}
      <ImageViewerModal
        imageUrl={viewingImage?.url || null}
        title={viewingImage?.title}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
};
