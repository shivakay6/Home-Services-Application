import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import { AlertTriangle, X, Check } from 'lucide-react';
import { TwoPhotoUploader } from '../common/TwoPhotoUploader';
import { SAMPLE_IMAGES } from '../../data/sampleAssets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerIncompleteReportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { state, reportJobNotDoneCustomer } = useJob();
  const [selectedQuickReason, setSelectedQuickReason] = useState<string>('');
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([
    SAMPLE_IMAGES.customerPhoto1,
    SAMPLE_IMAGES.customerPhoto2,
  ]);

  if (!isOpen) return null;

  const quickReasons = [
    'The provider did not arrive',
    'The provider arrived but did not start the work',
    'The provider left before finishing',
    'The provider did not have the parts or tools needed',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedQuickReason === 'Other' ? reason.trim() : (selectedQuickReason || reason.trim());
    if (!finalReason) return;
    reportJobNotDoneCustomer(finalReason, photos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Report Job Not Done</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason:
            </label>
            <div className="space-y-1.5">
              {quickReasons.map((qr) => {
                const isSelected = selectedQuickReason === qr;
                return (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => {
                      setSelectedQuickReason(qr);
                      if (qr !== 'Other') setReason('');
                    }}
                    className={`w-full text-left text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{qr}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedQuickReason === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Describe the reason:
              </label>
              <textarea
                rows={2}
                value={reason}
                required
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                placeholder="Specify what happened..."
              />
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <TwoPhotoUploader
              photos={photos}
              onChange={setPhotos}
              label="Evidence Photos (2 Required)"
              presetSamples={{
                label: 'Sample Photos',
                photo1: SAMPLE_IMAGES.customerPhoto1,
                photo2: SAMPLE_IMAGES.customerPhoto2,
              }}
            />
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex justify-between items-center">
            <span>Refund request: <strong className="text-slate-800">₹{state.financials.payableTotal}</strong></span>
            <span>24h review window</span>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedQuickReason || (selectedQuickReason === 'Other' && !reason.trim())}
              className="flex-1 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold shadow-xs transition-colors"
            >
              Initiate Refund Request (₹{state.financials.payableTotal})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
