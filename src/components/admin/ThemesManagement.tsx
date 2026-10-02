import React from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { THEME_PRESETS } from '../../services/storage';
import { ThemePresetId } from '../../types';

export const ThemesManagement: React.FC = () => {
  const presets = Object.entries(THEME_PRESETS) as [ThemePresetId, typeof THEME_PRESETS['minimal']][];

  return (
    <div className="space-y-6 text-right font-cairo">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          إدارة القوالب والتصاميم (Themes Engine)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          القوالب الـ 8 المدمجة في المنصة والمتاحة للأعضاء مع دعم التخصيص الكامل للخطوط والألوان والأزرار
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {presets.map(([key, config]) => (
          <div
            key={key}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            {/* Visual preview */}
            <div
              className="w-full h-36 rounded-2xl p-4 flex flex-col justify-between shadow-inner border border-black/5 overflow-hidden"
              style={{
                background: config.backgroundColor,
                color: config.textColor,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: config.primaryColor }}
                />
                <span className="text-xs font-bold font-mono">@{key}</span>
              </div>

              <div
                className={`py-2 px-3 text-center text-xs font-bold ${
                  config.buttonStyle === 'solid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : config.buttonStyle === 'glass'
                    ? 'bg-white/20 backdrop-blur-md'
                    : 'border border-current'
                } ${config.borderRadius}`}
              >
                زر تجريبي للرابط
              </div>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase">
                  {key}
                </h3>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  نشط
                </span>
              </div>
              <p className="text-xs text-slate-400">
                نمط الأزرار: {config.buttonStyle} · شكل الصورة: {config.imageShape}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
