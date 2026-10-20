import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import { Scale, X, ArrowUpRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appellant: 'customer' | 'provider';
}

export const AppealModal: React.FC<Props> = ({ isOpen, onClose, appellant }) => {
  const { state, appealDecision } = useJob();
  const [reason, setReason] = useState(
    appellant === 'provider'
      ? 'The pipe was severely rusted and posed an immediate flood hazard requiring emergency replacement.'
      : 'The extra pipe was fitted without my verbal or written knowledge, and the old pipe was not retained.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appealDecision(appellant, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Appeal Rule-Based Decision</h3>
              <p className="text-xs text-slate-500">Escalate case to human Support Agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="text-slate-500 font-medium">Original Rule Applied:</div>
            <div className="font-semibold text-slate-900 mt-0.5">
              {state.dispute?.ruleApplied?.name || 'Platform System Rule'}
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {state.dispute?.ruleApplied?.explanation}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for appealing this decision:
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="State why this rule outcome should be reconsidered by human support..."
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              Submit Appeal to Support <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
