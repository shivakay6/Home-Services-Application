import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import { SAMPLE_IMAGES } from '../../data/sampleAssets';
import { CheckCircle2, X, Camera, WifiOff, Upload, Sparkles } from 'lucide-react';
import { TaskCompletionEvidence } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderCompletionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, submitCompletion } = useJob();

  const approvedExtraItems =
    state.extraWork && state.extraWork.status === 'approved'
      ? state.extraWork.items && state.extraWork.items.length > 0
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
      : [];

  // Initialize task-specific before/after evidence for each booked task and approved extra item
  const [taskEvidences, setTaskEvidences] = useState<Record<string, { before: string; after: string }>>(() => {
    const initial: Record<string, { before: string; after: string }> = {};
    state.bookedTasks.forEach((task, idx) => {
      initial[task.id] = {
        before: idx === 0 ? SAMPLE_IMAGES.task1Before : SAMPLE_IMAGES.task2Before,
        after: idx === 0 ? SAMPLE_IMAGES.task1After : SAMPLE_IMAGES.task2After,
      };
    });

    approvedExtraItems.forEach((extraItem) => {
      initial[extraItem.id] = {
        before: extraItem.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered,
        after: SAMPLE_IMAGES.afterWork,
      };
    });

    return initial;
  });

  if (!isOpen) return null;

  const handlePhotoChange = (taskId: string, type: 'before' | 'after', url: string) => {
    setTaskEvidences((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { before: '', after: '' }),
        [type]: url,
      },
    }));
  };

  const handleFileUpload = (taskId: string, type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handlePhotoChange(taskId, type, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedTaskCompletions: TaskCompletionEvidence[] = state.bookedTasks.map((task) => ({
      taskId: task.id,
      taskName: task.name,
      beforePhotoUrl: taskEvidences[task.id]?.before || SAMPLE_IMAGES.task1Before,
      afterPhotoUrl: taskEvidences[task.id]?.after || SAMPLE_IMAGES.task1After,
    }));

    approvedExtraItems.forEach((extraItem) => {
      formattedTaskCompletions.push({
        taskId: extraItem.id,
        taskName: `${extraItem.description} (Extra)`,
        beforePhotoUrl: taskEvidences[extraItem.id]?.before || extraItem.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered,
        afterPhotoUrl: taskEvidences[extraItem.id]?.after || SAMPLE_IMAGES.afterWork,
      });
    });

    const primaryBefore = formattedTaskCompletions[0]?.beforePhotoUrl || SAMPLE_IMAGES.beforeWork;
    const primaryAfter = formattedTaskCompletions[0]?.afterPhotoUrl || SAMPLE_IMAGES.afterWork;

    submitCompletion(primaryBefore, primaryAfter, formattedTaskCompletions);
    onClose();
  };

  const totalItemsCount = state.bookedTasks.length + approvedExtraItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Submit Job Completion</h3>
              <p className="text-xs text-slate-500">Attach Before & After photos for each job item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Banner */}
        {state.isOffline && (
          <div className="bg-amber-500/10 border-b border-amber-300/60 px-5 py-2.5 flex items-center gap-2 text-amber-900 text-xs">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Device Offline:</strong> Completion evidence photos will be stored locally and synced when signal is connected.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Job Scope & Summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-700">
              <span className="font-semibold">Base Scope ({state.bookedTasks.length} tasks):</span>
              <span className="font-mono">₹{state.financials.baseBookingTotal}</span>
            </div>
            {approvedExtraItems.length > 0 && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Approved Extra Scope ({approvedExtraItems.length} items):
                </span>
                <span className="font-mono">+₹{approvedExtraItems.reduce((s, it) => s + it.price, 0)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
              <span>Total Payable from Escrow:</span>
              <span className="font-mono text-sm text-emerald-700">₹{state.financials.payableTotal}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Evidence for Each Job Item ({totalItemsCount} item{totalItemsCount > 1 ? 's' : ''}):
              </label>
              <span className="text-[11px] text-slate-500">Before & After required</span>
            </div>

            {/* Booked Tasks List with Before/After upload for each */}
            {state.bookedTasks.map((task, idx) => (
              <div key={task.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{task.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">₹{task.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Before Photo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Before Work Photo</span>
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] flex items-center gap-0.5">
                        <Upload className="w-3 h-3" /> Change
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileUpload(task.id, 'before', e)}
                        />
                      </label>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 relative">
                      <img
                        src={taskEvidences[task.id]?.before || SAMPLE_IMAGES.task1Before}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Before Work
                      </span>
                    </div>
                  </div>

                  {/* After Photo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                      <span>After Work Photo</span>
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] flex items-center gap-0.5">
                        <Upload className="w-3 h-3" /> Change
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileUpload(task.id, 'after', e)}
                        />
                      </label>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-900 relative">
                      <img
                        src={taskEvidences[task.id]?.after || SAMPLE_IMAGES.task1After}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-emerald-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        After Work
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Approved Extra Work Items List with Before/After upload for each */}
            {approvedExtraItems.map((extraItem, extraIdx) => (
              <div key={extraItem.id} className="border border-amber-200 rounded-2xl p-4 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">
                      +{extraIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {extraItem.description} (Approved Extra)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900">₹{extraItem.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Condition Before</span>
                      <div className="flex items-center gap-1.5">
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] font-bold flex items-center gap-0.5">
                          <Upload className="w-3 h-3" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(extraItem.id, 'before', e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handlePhotoChange(
                              extraItem.id,
                              'before',
                              extraItem.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered
                            )
                          }
                          className="text-[9px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Preset
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 relative">
                      <img
                        src={
                          taskEvidences[extraItem.id]?.before ||
                          extraItem.photoUrl ||
                          SAMPLE_IMAGES.extraWorkDiscovered
                        }
                        alt="Extra Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Before Work
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                      <span>Finished Installation</span>
                      <div className="flex items-center gap-1.5">
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] font-bold flex items-center gap-0.5">
                          <Upload className="w-3 h-3" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(extraItem.id, 'after', e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handlePhotoChange(extraItem.id, 'after', SAMPLE_IMAGES.afterWork)}
                          className="text-[9px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Preset
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-900 relative">
                      <img
                        src={taskEvidences[extraItem.id]?.after || SAMPLE_IMAGES.afterWork}
                        alt="Extra After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-emerald-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        After Work
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {state.isOffline ? 'Queue Completion Offline' : 'Submit Completion with Photos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
