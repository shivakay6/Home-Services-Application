import React, { useRef } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon } from 'lucide-react';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
  helperText?: string;
  presetSamples?: {
    label: string;
    photo1: string;
    photo2: string;
  };
  samplePresets?: {
    label: string;
    photos: string[];
  }[];
}

export const TwoPhotoUploader: React.FC<Props> = ({
  photos,
  onChange,
  label = 'Evidence Photos (2 required)',
  presetSamples,
  samplePresets,
}) => {
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const next = [...photos];
          next[index] = reader.result;
          onChange(next);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (index: number) => {
    const next = [...photos];
    next[index] = '';
    onChange(next);
  };

  const handleUsePreset = (p1: string, p2: string) => {
    onChange([p1, p2]);
  };

  const hasPhoto1 = !!photos[0];
  const hasPhoto2 = !!photos[1];
  const count = (hasPhoto1 ? 1 : 0) + (hasPhoto2 ? 1 : 0);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
          </label>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {presetSamples && (
            <button
              type="button"
              onClick={() => handleUsePreset(presetSamples.photo1, presetSamples.photo2)}
              className="text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" />
              Use Sample Photos
            </button>
          )}

          {samplePresets && samplePresets.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUsePreset(sp.photos[0], sp.photos[1])}
              className="text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" />
              {sp.label}
            </button>
          ))}

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              count === 2
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {count === 2 && <Check className="w-3 h-3 text-emerald-600" />}
            {count}/2 Attached
          </span>
        </div>
      </div>

      {/* Two photo slots */}
      <div className="grid grid-cols-2 gap-3">
        {/* Photo Slot 1 */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef1}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(0, e)}
          />

          {hasPhoto1 ? (
            <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-900 aspect-video shadow-xs">
              <img
                src={photos[0]}
                alt="Evidence 1"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Photo 1
              </span>
              <button
                type="button"
                onClick={() => handleRemove(0)}
                className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full shadow-xs transition-colors"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef1.current?.click()}
                className="absolute bottom-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef1.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer group"
            >
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-1 transition-colors" />
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600">
                Upload Photo 1
              </span>
              <span className="text-[9px] text-slate-400">Click to choose image</span>
            </button>
          )}
        </div>

        {/* Photo Slot 2 */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef2}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(1, e)}
          />

          {hasPhoto2 ? (
            <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-900 aspect-video shadow-xs">
              <img
                src={photos[1]}
                alt="Evidence 2"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Photo 2
              </span>
              <button
                type="button"
                onClick={() => handleRemove(1)}
                className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full shadow-xs transition-colors"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef2.current?.click()}
                className="absolute bottom-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef2.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer group"
            >
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-1 transition-colors" />
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600">
                Upload Photo 2
              </span>
              <span className="text-[9px] text-slate-400">Click to choose image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
