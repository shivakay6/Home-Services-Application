import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import {
  AlertCircle,
  ShieldAlert,
  Check,
  X,
  Camera,
  Upload,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../../data/sampleAssets';
import { TaskDisputeEvidence } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reporter?: 'customer' | 'contact';
}

export const CustomerDisputeModal: React.FC<Props> = ({ isOpen, onClose, reporter = 'customer' }) => {
  const { state, raiseDispute } = useJob();

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

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(['task-1']);
  const [selectedExtraItemIds, setSelectedExtraItemIds] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReasonText, setOtherReasonText] = useState<string>('');

  // Per-task SINGLE photo: Each ticked item can upload ONLY ONE image
  const [taskSinglePhoto, setTaskSinglePhoto] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      'task-1': SAMPLE_IMAGES.disputeDefect1,
      'task-2': SAMPLE_IMAGES.incompleteObstruction,
    };
    approvedExtraItems.forEach((extraItem) => {
      initial[extraItem.id] = extraItem.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered;
    });
    return initial;
  });

  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({
    'task-1': 'Valve seal still leaking under sink.',
    'task-2': 'Chemical drain flush was not executed properly.',
  });

  if (!isOpen) return null;

  // The 6 reasons specified in requirements
  const workProblemReasons = [
    'The work was not done',
    'The work is unfinished',
    'The work quality is poor',
    'The wrong part or item was used',
    'The after photo is the same as the before photo',
    'Other',
  ];

  // Calculate disputed amount for ticked items
  let disputed = 0;
  state.bookedTasks.forEach((t) => {
    if (selectedTaskIds.includes(t.id)) disputed += t.price;
  });
  approvedExtraItems.forEach((extraItem) => {
    if (selectedExtraItemIds.includes(extraItem.id)) {
      disputed += extraItem.price;
    }
  });

  const total = state.financials.payableTotal;
  const effectiveDisputed = disputed;
  const undisputed = Math.max(0, total - effectiveDisputed);

  const toggleTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((t) => t !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const toggleExtraItem = (id: string) => {
    if (selectedExtraItemIds.includes(id)) {
      setSelectedExtraItemIds(selectedExtraItemIds.filter((itId) => itId !== id));
    } else {
      setSelectedExtraItemIds([...selectedExtraItemIds, id]);
    }
  };

  const isAllSelected =
    selectedTaskIds.length === state.bookedTasks.length &&
    (approvedExtraItems.length === 0 || selectedExtraItemIds.length === approvedExtraItems.length);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTaskIds([]);
      setSelectedExtraItemIds([]);
    } else {
      setSelectedTaskIds(state.bookedTasks.map((t) => t.id));
      setSelectedExtraItemIds(approvedExtraItems.map((it) => it.id));
    }
  };

  const handlePhotoUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setTaskSinglePhoto((prev) => ({
            ...prev,
            [itemId]: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if at least one item is ticked AND a reason is chosen
  const hasSelectedItems = selectedTaskIds.length > 0 || selectedExtraItemIds.length > 0;
  const isReasonValid = selectedReason && (selectedReason !== 'Other' || otherReasonText.trim().length > 0);
  const isFormValid = hasSelectedItems && isReasonValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalDescription =
      selectedReason === 'Other'
        ? otherReasonText.trim()
        : selectedReason;

    // Compile task-level dispute evidence (only ONE photo per ticked item)
    const taskDisputes: TaskDisputeEvidence[] = [];
    const allCollectedPhotos: string[] = [];

    state.bookedTasks.forEach((t) => {
      if (selectedTaskIds.includes(t.id)) {
        const photo = taskSinglePhoto[t.id] || SAMPLE_IMAGES.disputeDefect1;
        allCollectedPhotos.push(photo);
        taskDisputes.push({
          taskId: t.id,
          taskName: t.name,
          price: t.price,
          problemDescription: taskNotes[t.id] || finalDescription,
          photos: [photo],
        });
      }
    });

    approvedExtraItems.forEach((extraItem) => {
      if (selectedExtraItemIds.includes(extraItem.id)) {
        const extraPhoto = taskSinglePhoto[extraItem.id] || extraItem.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered;
        allCollectedPhotos.push(extraPhoto);
        taskDisputes.push({
          taskId: extraItem.id,
          taskName: `${extraItem.description} (Approved Extra)`,
          price: extraItem.price,
          problemDescription: taskNotes[extraItem.id] || finalDescription,
          photos: [extraPhoto],
        });
      }
    });

    const allDisputedIds = [...selectedTaskIds, ...selectedExtraItemIds];
    const disputeExtra = selectedExtraItemIds.length > 0;

    raiseDispute(
      allDisputedIds,
      disputeExtra,
      finalDescription,
      reporter,
      taskDisputes,
      allCollectedPhotos,
      selectedReason,
      otherReasonText.trim()
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Report a Work Problem</h3>
              <p className="text-xs text-slate-500">
                Tick only the items you dispute • Undisputed tasks are released to provider
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: TICK ITEMS TO DISPUTE (LIST EVERY PRICED ITEM SEPARATELY) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Tick Items You Dispute:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({selectedTaskIds.length + selectedExtraItemIds.length} of {state.bookedTasks.length + approvedExtraItems.length} ticked)
                </span>
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                {isAllSelected ? 'Deselect All' : 'Select All Items'}
              </button>
            </div>

            <div className="space-y-2">
              {/* Base Booked Tasks */}
              {state.bookedTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => toggleTask(task.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{task.name}</div>
                          <span className="text-[11px] text-slate-500">Base booking scope</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs">₹{task.price}</span>
                    </div>

                    {isSelected && (
                      <div className="p-3.5 pt-0 space-y-2.5 border-t border-rose-200/60 bg-white/80">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-rose-600" />
                            Evidence Photo of Defect (1 Image):
                          </span>
                          <label className="text-rose-600 hover:text-rose-700 cursor-pointer text-[10px] font-bold flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handlePhotoUpload(task.id, e)}
                            />
                          </label>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-rose-200 aspect-video bg-slate-900 relative max-w-sm">
                          <img
                            src={taskSinglePhoto[task.id] || SAMPLE_IMAGES.disputeDefect1}
                            alt="Defect"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Defect Image (1)
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Specific notes on {task.name}:
                          </label>
                          <input
                            type="text"
                            value={taskNotes[task.id] || ''}
                            onChange={(e) => setTaskNotes({ ...taskNotes, [task.id]: e.target.value })}
                            placeholder="e.g. Work quality poor or unfinished..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Extra Work Items Listed Separately if Approved */}
              {approvedExtraItems.map((extraItem) => {
                const isSelected = selectedExtraItemIds.includes(extraItem.id);
                return (
                  <div
                    key={extraItem.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => toggleExtraItem(extraItem.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{extraItem.description}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.2 rounded">
                              Approved Extra
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">Reason: {extraItem.reason}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs">₹{extraItem.price}</span>
                    </div>

                    {isSelected && (
                      <div className="p-3.5 pt-0 space-y-2.5 border-t border-rose-200/60 bg-white/80">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-rose-600" />
                            Evidence Photo for Extra Work (1 Image):
                          </span>
                          <label className="text-rose-600 hover:text-rose-700 cursor-pointer text-[10px] font-bold flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handlePhotoUpload(extraItem.id, e)}
                            />
                          </label>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-rose-200 aspect-video bg-slate-900 relative max-w-sm">
                          <img
                            src={taskSinglePhoto[extraItem.id] || extraItem.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered}
                            alt="Defect Extra"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Defect Image (1)
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Specific notes on {extraItem.description}:
                          </label>
                          <input
                            type="text"
                            value={taskNotes[extraItem.id] || ''}
                            onChange={(e) => setTaskNotes({ ...taskNotes, [extraItem.id]: e.target.value })}
                            placeholder="e.g. Extra work was not completed properly..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PICK REASON FROM THE 6 REASONS */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Pick Reason for Work Problem:
            </label>
            <div className="space-y-1.5">
              {workProblemReasons.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <div
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/60 font-bold text-rose-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{reason}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedReason === 'Other' && (
              <div className="pt-1 animate-in fade-in">
                <textarea
                  rows={2}
                  required
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Please state what the problem with the work is..."
                  className="w-full text-xs p-2.5 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-rose-50/20"
                />
              </div>
            )}
          </div>

          {/* ESCROW BREAKDOWN SUMMARY CARD */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Job Escrow (Base + Approved Extras):</span>
              <span className="font-mono font-bold text-slate-900">₹{total}</span>
            </div>

            <div className="flex justify-between items-center text-rose-700 font-bold">
              <span>Amount Withheld for Dispute:</span>
              <span className="font-mono text-sm">₹{effectiveDisputed}</span>
            </div>

            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>Undisputed Amount (Auto-released to provider):</span>
              <span className="font-mono">₹{undisputed}</span>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              <strong>Consarc Fair-Pay Rule:</strong> Only the disputed line items are withheld. Undisputed tasks are released to the provider.
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Submit Problem Report (₹{effectiveDisputed} Disputed)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
