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
            },
          ]
      : [];

  // Initialize task-specific before/after evidence for each booked task
  const [taskEvidences, setTaskEvidences] = useState<Record<string, { before: string; after: string }>>(() => {
    const initial: Record<string, { before: string; after: string }> = {};
    state.bookedTasks.forEach((task, idx) => {
      initial[task.id] = {
        before: idx === 0 ? SAMPLE_IMAGES.task1Before : SAMPLE_IMAGES.task2Before,
        after: idx === 0 ? SAMPLE_IMAGES.task1After : SAMPLE_IMAGES.task2After,
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

    const formattedTaskCompletions: TaskCompletionEvidence[] = state.bookedTasks.map((task, idx) => ({
      taskId: task.id,
      taskName: task.name,
      beforePhotoUrl: taskEvidences[task.id]?.before || (idx === 0 ? SAMPLE_IMAGES.task1Before : SAMPLE_IMAGES.task2Before),
      afterPhotoUrl: taskEvidences[task.id]?.after || (idx === 0 ? SAMPLE_IMAGES.task1After : SAMPLE_IMAGES.task2After),
    }));

    const primaryBefore = formattedTaskCompletions[0]?.beforePhotoUrl || SAMPLE_IMAGES.task1Before;
    const primaryAfter = formattedTaskCompletions[0]?.afterPhotoUrl || SAMPLE_IMAGES.task1After;

    submitCompletion(primaryBefore, primaryAfter, formattedTaskCompletions);
    onClose();
  };

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
              <p className="text-xs text-slate-500">Attach Before & After photos for booked job tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline indicator banner */}
        {state.isOffline && (
          <div className="bg-amber-500/10 border-b border-amber-300/60 px-5 py-2.5 flex items-center gap-2 text-amber-900 text-xs">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Device Offline:</strong> Completion and photos will be stored locally and queued for upload when back online.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Provide Before & After verification photos for each booked task. Review countdown starts upon platform receipt.
            </div>

            {/* Booked Tasks List with Before/After uploads */}
            {state.bookedTasks.map((task, index) => (
              <div key={task.id} className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
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
                      <div className="flex items-center gap-1.5">
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] font-bold flex items-center gap-0.5">
                          <Upload className="w-3 h-3" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(task.id, 'before', e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handlePhotoChange(
                              task.id,
                              'before',
                              index === 0 ? SAMPLE_IMAGES.task1Before : SAMPLE_IMAGES.task2Before
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
                          taskEvidences[task.id]?.before ||
                          (index === 0 ? SAMPLE_IMAGES.task1Before : SAMPLE_IMAGES.task2Before)
                        }
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
                      <div className="flex items-center gap-1.5">
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] font-bold flex items-center gap-0.5">
                          <Upload className="w-3 h-3" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(task.id, 'after', e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handlePhotoChange(
                              task.id,
                              'after',
                              index === 0 ? SAMPLE_IMAGES.task1After : SAMPLE_IMAGES.task2After
                            )
                          }
                          className="text-[9px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Preset
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-900 relative">
                      <img
                        src={
                          taskEvidences[task.id]?.after ||
                          (index === 0 ? SAMPLE_IMAGES.task1After : SAMPLE_IMAGES.task2After)
                        }
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

            {/* Approved Extra Work Items (Included in total, no photos required) */}
            {approvedExtraItems.length > 0 && (
              <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/40 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Approved Extra Work ({approvedExtraItems.length} item{approvedExtraItems.length > 1 ? 's' : ''})
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    +₹{approvedExtraItems.reduce((acc, it) => acc + it.price, 0)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Approved extra work is included in the completed scope and final total (no photos required for extra work).
                </p>
                <div className="space-y-1.5">
                  {approvedExtraItems.map((extraItem, extraIdx) => (
                    <div
                      key={extraItem.id || extraIdx}
                      className="flex justify-between items-center text-xs p-2.5 bg-white rounded-xl border border-emerald-100"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{extraIdx + 1}. {extraItem.description}</div>
                        <div className="text-[11px] text-slate-500">Reason: {extraItem.reason}</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">+₹{extraItem.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
