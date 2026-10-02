import React, { useRef, useState } from 'react';
import { Upload, Camera, Link as LinkIcon, Check, Sparkles, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';
import { useToast } from './Toast';

// Lightweight curated avatar links
const AVATAR_PRESETS = [
  { id: 'p1', name: 'رجل أعمال', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'p2', name: 'سيدة أعمال', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
  { id: 'p3', name: 'مصمم محترف', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'p4', name: 'شاب مبدع', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { id: 'p5', name: 'أيقونة تجريدية', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
  { id: 'p6', name: 'شعار أنيق', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
];

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  fallbackName?: string;
  shape?: 'circle' | 'square';
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label = 'الصورة أو الشعار',
  value,
  onChange,
  fallbackName = 'نشرك',
  shape = 'circle',
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)', 'error');
      return;
    }

    try {
      setCompressing(true);
      setCompressionInfo(null);

      // Compress and resize image client-side to keep saving lightweight
      const result = await compressImage(file, 300, 0.8);

      onChange(result.dataUrl);
      setCompressing(false);
      setCompressionInfo(`تم ضغط الصورة وتخفيفها بنجاح: ${result.sizeKb} KB (من أصل ${result.originalSizeKb} KB)`);
      showToast('تم تحميل وضغط الصورة من جهازك بنجاح!', 'success');
    } catch (err: any) {
      setCompressing(false);
      showToast('تعذر معالجة الصورة، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setCompressionInfo(null);
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName)}`;

  return (
    <div className="space-y-3 font-cairo text-right">
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
        {/* Preview image */}
        <div className="relative group shrink-0">
          <div
            className={`w-20 h-20 overflow-hidden border-2 border-emerald-500 shadow-md bg-white dark:bg-slate-800 flex items-center justify-center ${
              shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            {compressing ? (
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            ) : (
              <img
                src={value || defaultAvatar}
                alt={fallbackName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              />
            )}
          </div>

          {/* Quick upload overlay icon button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`absolute inset-0 bg-slate-950/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
              shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
            title="تغيير الصورة من جهازك"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {label}
            </span>

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>إزالة الصورة</span>
              </button>
            )}
          </div>

          {/* Upload Button & Links */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              disabled={compressing}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              {compressing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من جهازك</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{showUrlInput ? 'إخفاء الرابط' : 'إدخال رابط مباشر'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>صور جاهزة</span>
            </button>
          </div>

          {/* Compression badge info */}
          {compressionInfo && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{compressionInfo}</span>
            </div>
          )}

          {/* Direct URL input (optional expandable) */}
          {showUrlInput && (
            <div className="pt-2 space-y-1">
              <label className="text-[11px] text-slate-500">
                رابط الصورة المباشر (JPG أو PNG)
              </label>
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Preset gallery */}
          {showPresets && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500">
                اختر صورة جاهزة خفيفة برابط مباشر:
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.url);
                      setCompressionInfo(null);
                    }}
                    className="p-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-white dark:bg-slate-900 flex flex-col items-center gap-1 transition"
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate w-full text-center">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
