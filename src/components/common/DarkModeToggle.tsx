import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { getIsDarkMode, setDarkMode, subscribeToDarkMode } from '../../utils/darkMode';
import { useToast } from './Toast';

interface DarkModeToggleProps {
  variant?: 'switch' | 'button' | 'card';
  showLabel?: boolean;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  variant = 'switch',
  showLabel = true,
}) => {
  const [isDark, setIsDark] = useState<boolean>(getIsDarkMode());
  const { showToast } = useToast();

  useEffect(() => {
    setIsDark(getIsDarkMode());
    const unsub = subscribeToDarkMode((dark) => {
      setIsDark(dark);
    });
    return unsub;
  }, []);

  const handleToggle = () => {
    const nextState = !isDark;
    setIsDark(nextState);
    setDarkMode(nextState);
    showToast(
      nextState ? 'تم تفعيل الوضع المظلم الفاخر 🌙' : 'تم تفعيل الوضع النهاري المشرق ☀️',
      'info'
    );
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
        title={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع المظلم'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-500" />
        )}
        {showLabel && (
          <span className="hidden sm:inline">
            {isDark ? 'الوضع النهاري' : 'الوضع المظلم'}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 font-cairo transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            {isDark ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                الوضع المظلم الفاخر (Dark Mode)
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>مظهر احترافي</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تفعيل المظهر الليلي الداكن لراحة العين أثناء العمل وإضفاء لمسة فخامة على الواجهة
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={handleToggle}
          dir="ltr"
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            isDark ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
              isDark ? 'translate-x-7 bg-slate-900 text-amber-300' : 'translate-x-0 bg-white text-slate-700'
            }`}
          >
            {isDark ? <Moon className="w-3.5 h-3.5 fill-current text-amber-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </span>
        </button>
      </div>
    );
  }

  // Switch variant
  return (
    <div className="flex items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
      {showLabel && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          <span>الوضع المظلم</span>
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={handleToggle}
        dir="ltr"
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          isDark ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {isDark ? <Moon className="w-3 h-3 text-indigo-600 fill-current" /> : <Sun className="w-3 h-3 text-amber-500" />}
        </span>
      </button>
    </div>
  );
};
