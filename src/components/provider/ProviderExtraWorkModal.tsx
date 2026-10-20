import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import { SAMPLE_IMAGES } from '../../data/sampleAssets';
import { Sparkles, X, Camera, WifiOff, Upload, Plus, Trash2, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ExtraWorkItemDraft {
  id: string;
  description: string;
  price: string;
  reason: string;
  photoUrl: string;
}

export const ProviderExtraWorkModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, requestExtraWork } = useJob();

  const [items, setItems] = useState<ExtraWorkItemDraft[]>([
    {
      id: 'draft-1',
      description: 'Additional pipe replacement',
      price: '400',
      reason: 'A damaged pipe was discovered during the job.',
      photoUrl: SAMPLE_IMAGES.extraWorkDiscovered,
    },
  ]);

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const newItemId = `draft-${Date.now()}`;
    const nextIndex = items.length + 1;
    // Suggest standard add-on or empty fields
    const suggested =
      nextIndex === 2
        ? {
            description: 'High-pressure brass coupler & valve fitting',
            price: '250',
            reason: 'Corroded coupler required reinforced replacement to prevent water damage.',
            photoUrl: SAMPLE_IMAGES.task1Before,
          }
        : {
            description: `Additional scope item #${nextIndex}`,
            price: '300',
            reason: 'Unforeseen defect discovered during work.',
            photoUrl: SAMPLE_IMAGES.incompleteObstruction,
          };

    setItems((prev) => [
      ...prev,
      {
        id: newItemId,
        description: suggested.description,
        price: suggested.price,
        reason: suggested.reason,
        photoUrl: suggested.photoUrl,
      },
    ]);
  };

  const handleRemoveItem = (idToRemove: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleItemChange = (id: string, field: keyof ExtraWorkItemDraft, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleItemChange(id, 'photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const combinedTotal = items.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
  const newProposedTotal = state.financials.baseBookingTotal + combinedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const formattedItems = items.map((it) => ({
      description: it.description.trim(),
      price: parseFloat(it.price) || 0,
      reason: it.reason.trim(),
      photoUrl: it.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered,
    }));

    requestExtraWork(formattedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Request Extra Work Approval</h3>
              <p className="text-xs text-slate-500">
                Add one or several extra work items in one request with photos
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

        {/* Offline indicator banner */}
        {state.isOffline && (
          <div className="bg-amber-500/10 border-b border-amber-300/60 px-5 py-2.5 flex items-center gap-2 text-amber-900 text-xs">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Device Offline:</strong> Request will be queued locally ("Not sent — will send when connected").
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!isPreviewMode ? (
            <>
              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Extra Work Items ({items.length})
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Total: ₹{combinedTotal}
                  </span>
                </div>

                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3.5 relative transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        Item #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Description of Work:
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          placeholder="e.g. Additional pipe replacement"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Price (₹):
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          placeholder="400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Technical Reason / Justification:
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={item.reason}
                        onChange={(e) => handleItemChange(item.id, 'reason', e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        placeholder="e.g. A damaged pipe was discovered during the job."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                        <span>Photo Evidence of Discovered Issue:</span>
                        <div className="flex items-center gap-2">
                          <label className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-1 text-[11px]">
                            <Upload className="w-3 h-3" /> Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handleFileUpload(item.id, e)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleItemChange(
                                item.id,
                                'photoUrl',
                                index % 2 === 0
                                  ? SAMPLE_IMAGES.extraWorkDiscovered
                                  : SAMPLE_IMAGES.task1Before
                              )
                            }
                            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px]"
                          >
                            <Camera className="w-3 h-3 text-slate-400" /> Sample
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative max-h-36">
                        <img
                          src={item.photoUrl || SAMPLE_IMAGES.extraWorkDiscovered}
                          alt={`Evidence #${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Evidence #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Another Item Button */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Another Extra Work Item
                </button>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Base Job Escrow:</span>
                  <span className="font-mono font-semibold">₹{state.financials.baseBookingTotal}</span>
                </div>
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>Combined Extra Work ({items.length} item{items.length > 1 ? 's' : ''}):</span>
                  <span className="font-mono text-sm">+₹{combinedTotal}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-blue-200 text-slate-900 font-bold">
                  <span>New Proposed Total:</span>
                  <span className="font-mono text-sm text-blue-800">₹{newProposedTotal}</span>
                </div>
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
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Preview Request ({items.length} item{items.length > 1 ? 's' : ''})
                </button>
              </div>
            </>
          ) : (
            /* Preview mode */
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                  <span>Request Summary</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    {items.length} Extra Item{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map((it, idx) => (
                    <div key={it.id} className="p-2.5 bg-white rounded-lg border border-blue-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>
                          {idx + 1}. {it.description}
                        </span>
                        <span className="font-mono text-blue-700">+₹{it.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong>Reason:</strong> {it.reason}
                      </p>
                      <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video max-h-24 bg-slate-900">
                        <img src={it.photoUrl} alt={it.description} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-3 border-t border-blue-200 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Combined Extra Total:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">+₹{combinedTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-blue-900 font-bold">
                    <span>New Proposed Escrow Total:</span>
                    <span className="font-mono text-sm">₹{newProposedTotal}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Back to Edit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {state.isOffline ? 'Queue Offline' : `Send for Approval (+₹${combinedTotal})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
