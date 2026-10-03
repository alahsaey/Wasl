import React from 'react';
import { Palette, Check, Sparkles, Layers, Sliders, Type, Shapes, Image as ImageIcon, LayoutList } from 'lucide-react';
import { UserThemeConfig, ThemePresetId, ButtonStyle, ButtonShadow, ImageShape } from '../../types';
import { THEME_PRESETS } from '../../services/storage';
import { ImageUploadInput } from '../common/ImageUploadInput';

interface ThemeSelectorProps {
  currentTheme: UserThemeConfig;
  onChange: (updated: Partial<UserThemeConfig>) => void;
}

const PRESET_OPTIONS: { id: ThemePresetId; title: string; subtitle: string; previewBg: string; previewAccent: string }[] = [
  { id: 'minimal', title: 'مينيمال البسيط', subtitle: 'نقاء أبيض وأناقة عصرية', previewBg: '#fafafa', previewAccent: '#0f172a' },
  { id: 'business', title: 'الأعمال والشركات', subtitle: 'أزرق ملكي ورصانة مهنية', previewBg: '#f1f5f9', previewAccent: '#1e3a8a' },
  { id: 'creator', title: 'صناع المحتوى', subtitle: 'حيوية وطاقة متجددة', previewBg: '#fff1f2', previewAccent: '#ec4899' },
  { id: 'dark', title: 'الداكن العصري', subtitle: 'أسود فاخر بلمسات إيميرالد', previewBg: '#09090b', previewAccent: '#10b981' },
  { id: 'luxury', title: 'الفخامة الملكية', subtitle: 'ذهبي كلاسيكي وخلفية دافئة', previewBg: '#0c0a09', previewAccent: '#d97706' },
  { id: 'elegant', title: 'الأنيق الهادئ', subtitle: 'بنفسجي راقٍ وراحة بصرية', previewBg: '#fdf4ff', previewAccent: '#9333ea' },
  { id: 'gradient', title: 'التدرج اللوني', subtitle: 'أمواج لونية حديثة وثلاثية', previewBg: 'linear-gradient(135deg, #4f46e5, #ec4899)', previewAccent: '#ffffff' },
  { id: 'glass', title: 'الزجاجي الفائق', subtitle: 'تأثير Glassmorphism شفاف', previewBg: 'linear-gradient(135deg, #0f172a, #0369a1)', previewAccent: '#38bdf8' },
];

const PRESET_PALETTES = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#ea580c', // Orange
  '#d97706', // Amber Gold
  '#0f172a', // Slate Dark
  '#dc2626', // Crimson Red
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onChange }) => {
  const handleApplyPreset = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS[presetId];
    if (preset) {
      onChange(preset);
    }
  };

  return (
    <div className="space-y-8 text-right">
      {/* 1. Theme Presets Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>القوالب الجاهزة المصممة مسبقاً</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">اختر نمطاً أساسياً وابدأ بتخصيصه كما يحلو لك</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_OPTIONS.map((opt) => {
            const isSelected = currentTheme.presetId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleApplyPreset(opt.id)}
                className={`relative flex flex-col p-3 rounded-2xl border text-right transition-all group ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Visual miniature preview bar */}
                <div
                  className="w-full h-14 rounded-xl mb-2.5 p-2 flex flex-col justify-between overflow-hidden shadow-inner border border-black/5"
                  style={{ background: opt.previewBg }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: opt.previewAccent }} />
                  <div className="w-full h-2 rounded-full bg-white/40 backdrop-blur-sm" />
                </div>

                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{opt.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {opt.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Colors Customization */}
      <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>تخصيص الألوان والهوية البصرية</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Color */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              اللون الرئيسي (الأزرار والتمييز)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentTheme.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
              />
              <div className="flex flex-wrap gap-1.5 flex-1">
                {PRESET_PALETTES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange({ primaryColor: color })}
                    className="w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Background Style */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              لون خلفية الصفحة
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentTheme.backgroundColor.startsWith('#') ? currentTheme.backgroundColor : '#f8fafc'}
                onChange={(e) =>
                  onChange({
                    backgroundColor: e.target.value,
                    backgroundType: 'solid',
                  })
                }
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
              />
              <span className="text-xs font-mono text-slate-500">
                {currentTheme.backgroundType === 'gradient' ? 'تدرج ديناميكي' : currentTheme.backgroundColor}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Button Styles & Layout Grid Mode */}
      <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>تخطيط وعرض أزرار التواصل والروابط</span>
        </h4>

        {/* Layout Mode Selection (Grid 2-Columns vs List 1-Column) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
            طريقة عرض الأزرار والروابط في صفحتك
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onChange({ layoutMode: 'grid' })}
              className={`p-3 rounded-xl border text-right transition flex flex-col items-center justify-center gap-1.5 ${
                (currentTheme.layoutMode || 'grid') === 'grid'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <LayoutList className="w-4 h-4 text-emerald-600" />
                <span>شبكة (زرّين في الصف)</span>
              </div>
              <span className="text-[10px] opacity-75 text-center">أيقونة بالمنتصف بالأعلى والاسم تحتها مباشرة</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ layoutMode: 'list' })}
              className={`p-3 rounded-xl border text-right transition flex flex-col items-center justify-center gap-1.5 ${
                currentTheme.layoutMode === 'list'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>قائمة (زر واحد بالصف)</span>
              </div>
              <span className="text-[10px] opacity-75 text-center">أزرار عريضة ممتدة بعرض الصفحة</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Button Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              نمط التعبئة (Button Style)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['solid', 'soft', 'outline', 'glass'] as ButtonStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChange({ buttonStyle: style })}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                    currentTheme.buttonStyle === style
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {style === 'solid' && 'ممتلئ'}
                  {style === 'soft' && 'ناعم'}
                  {style === 'outline' && 'محدد'}
                  {style === 'glass' && 'زجاجي'}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              انحناء واستدارة الحواف
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'حادة', val: 'rounded-none' },
                { label: 'بسيطة', val: 'rounded-lg' },
                { label: 'عصرية', val: 'rounded-2xl' },
                { label: 'دائرية', val: 'rounded-full' },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => onChange({ borderRadius: r.val })}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                    currentTheme.borderRadius === r.val
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Button Shadow */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              تأثير الظل (Shadow)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'subtle', 'glow', 'elevated'] as ButtonShadow[]).map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => onChange({ buttonShadow: sh })}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                    currentTheme.buttonShadow === sh
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {sh === 'none' && 'بدون'}
                  {sh === 'subtle' && 'خفيف'}
                  {sh === 'glow' && 'توهج'}
                  {sh === 'elevated' && 'بارز'}
                </button>
              ))}
            </div>
          </div>

          {/* Image Shape */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              شكل الصورة الشخصية
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'دائري', val: 'circle' as ImageShape },
                { label: 'مربع دائري', val: 'squircle' as ImageShape },
                { label: 'مربع حاد', val: 'square' as ImageShape },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => onChange({ imageShape: s.val })}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border transition ${
                    currentTheme.imageShape === s.val
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Toggles */}
      <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              شارة التحقق (Verified Badge)
            </span>
            <span className="text-[11px] text-slate-500">عرض علامة التوثيق بجانب اسمك في صفحتك العامة</span>
          </div>
          <input
            type="checkbox"
            checked={currentTheme.showVerifiedBadge}
            onChange={(e) => onChange({ showVerifiedBadge: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              إظهار شعار المنصة بالأسفل
            </span>
            <span className="text-[11px] text-slate-500">عرض عبارة "صُنعت بواسطة روابط نشرك" في التذييل</span>
          </div>
          <input
            type="checkbox"
            checked={currentTheme.showBranding}
            onChange={(e) => onChange({ showBranding: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
        </div>
      </section>

      {/* 5. Custom Transparent Background Image */}
      <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>صورة خلفية مخصصة للفيلم / الصفحة</span>
        </h4>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              تحميل صورة خلفية مخصصة (تُعرض صورة واحدة فقط غير مكررة خلف الأزرار)
            </label>
            <ImageUploadInput
              label="صورة خلفية مخصصة"
              value={currentTheme.backgroundImageUrl || ''}
              onChange={(url) => onChange({ backgroundImageUrl: url })}
            />
          </div>

          {currentTheme.backgroundImageUrl && (
            <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  درجة شفافية صورة الخلفية (تأثير الشفافية دون المساس بالأزرار)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {Math.round((currentTheme.bgImageOpacity !== undefined ? currentTheme.bgImageOpacity : 0.35) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={currentTheme.bgImageOpacity !== undefined ? currentTheme.bgImageOpacity : 0.35}
                onChange={(e) => onChange({ bgImageOpacity: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ✨ <strong>مميزات الصورة الحية</strong>: تظهر الصورة مرة واحدة بشكل ثابت وشفاف خلف جميع العناصر، وتتحرك وتتمدد بسلاسة مع التمرير عند إضافة أزرار جديدة دون التأثير على وضوح الأزرار والروابط.
              </p>
              <button
                type="button"
                onClick={() => onChange({ backgroundImageUrl: '', bgImageOpacity: 0.35 })}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold transition pt-1 block"
              >
                إزالة صورة الخلفية
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
