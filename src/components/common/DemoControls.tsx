import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import {
  Wifi,
  WifiOff,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { ResetConfirmationModal } from './ResetConfirmationModal';

export const DemoControls: React.FC = () => {
  const {
    state,
    offlineQueue,
    resetDemo,
    toggleOffline,
    advanceClockTo,
    reopenUsedContactLink,
  } = useJob();

  const [showResetModal, setShowResetModal] = useState(false);

  // Timer is active ONLY when job is in review (24h review window) or incomplete report pending challenge (24h challenge window)
  const isTimerApplicable =
    state.coreStatus === 'in_review' ||
    state.incompleteReport?.status === 'pending_24h_challenge';

  const timerContextLabel =
    state.coreStatus === 'in_review'
      ? '24h Review Window'
      : state.incompleteReport?.status === 'pending_24h_challenge'
      ? '24h Challenge Window'
      : null;

  return (
    <>
      <div className="bg-slate-900 text-white border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Quick status indicators & Simulation toggles */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200">Prototype Controls</span>
            </div>

            {/* Network control */}
            <button
              onClick={toggleOffline}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                state.isOffline
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={
                state.isOffline
                  ? 'Click to connect online — automatically syncs queued actions to platform'
                  : 'Click to disconnect signal (No Signal Offline) — actions queue locally'
              }
            >
              {state.isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>
                    No signal (Offline)
                    {offlineQueue.length > 0 ? ` • ${offlineQueue.length} queued` : ''}
                  </span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Signal: Connected (Online)</span>
                </>
              )}
            </button>

            {/* Clock controls (Selectable ONLY when applicable: Job Completed or Marked as Not Done) */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                isTimerApplicable
                  ? 'bg-slate-800 border-amber-500/50 text-slate-200 ring-1 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  isTimerApplicable ? 'text-amber-400 animate-pulse' : 'text-slate-600'
                }`}
              />

              {isTimerApplicable ? (
                <span className="text-amber-300 font-semibold pr-1">
                  {timerContextLabel}: {state.simulatedElapsedHours}h elapsed
                </span>
              ) : (
                <span className="text-slate-400 text-[11px] pr-1">
                  Timer Inactive (Requires Job Completed or Not Done)
                </span>
              )}

              <span className="text-slate-700">|</span>

              <button
                onClick={() => advanceClockTo(1)}
                disabled={!isTimerApplicable || state.simulatedElapsedHours >= 1}
                className="px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title={
                  !isTimerApplicable
                    ? 'Timer is not active. Mark job as completed or not done first.'
                    : 'Advance to 1 Hour (1st Reminder)'
                }
              >
                1h
              </button>
              <button
                onClick={() => advanceClockTo(12)}
                disabled={!isTimerApplicable || state.simulatedElapsedHours >= 12}
                className="px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title={
                  !isTimerApplicable
                    ? 'Timer is not active. Mark job as completed or not done first.'
                    : 'Advance to 12 Hours (Midpoint Reminder)'
                }
              >
                12h
              </button>
              <button
                onClick={() => advanceClockTo(23)}
                disabled={!isTimerApplicable || state.simulatedElapsedHours >= 23}
                className="px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title={
                  !isTimerApplicable
                    ? 'Timer is not active. Mark job as completed or not done first.'
                    : 'Advance to 23 Hours (Final 1h Warning)'
                }
              >
                23h
              </button>
              <button
                onClick={() => advanceClockTo(24)}
                disabled={!isTimerApplicable || state.simulatedElapsedHours >= 24}
                className="px-2 py-0.5 rounded bg-blue-600/40 hover:bg-blue-600 text-blue-100 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold"
                title={
                  !isTimerApplicable
                    ? 'Timer is not active. Mark job as completed or not done first.'
                    : state.coreStatus === 'in_review'
                    ? 'Advance to 24h Deadline (Auto-Release Payout)'
                    : 'Advance to 24h Deadline (Finalize Unchallenged Incomplete Settlement)'
                }
              >
                24h Fast-Forward
              </button>
            </div>

            {/* Shifted Reset demo button placed immediately after 24h Fast-Forward */}
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              title="Reset prototype state to initial baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset demo</span>
            </button>

            {/* Contact link test */}
            {state.contactLinkUsed && (
              <button
                onClick={reopenUsedContactLink}
                className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors"
                title="Re-arm single-use link for demonstration"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-arm Ananya's Link</span>
              </button>
            )}
          </div>

          {/* Right side helper info */}
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Prototype control bar: Simulate signal, 24h time progression & state reset.</span>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={resetDemo}
      />
    </>
  );
};
