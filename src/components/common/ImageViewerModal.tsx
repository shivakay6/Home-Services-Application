import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface Props {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<Props> = ({ imageUrl, title = 'Photo Evidence', onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 text-white border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <ZoomIn className="w-4 h-4 text-blue-400" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
