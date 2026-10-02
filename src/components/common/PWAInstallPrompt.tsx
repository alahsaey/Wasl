import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Already installed, do not show banner
    }

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(isIosDevice);

    // 3. Listen for Chrome / Android / Edge / Desktop beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user previously dismissed banner in last 24 hours
      const lastDismissed = localStorage.getItem('wasl_pwa_dismissed_time');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > 24 * 60 * 60 * 1000) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS banner if on iOS Safari and not standalone
    if (isIosDevice) {
      const lastDismissed = localStorage.getItem('wasl_pwa_dismissed_time');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > 24 * 60 * 60 * 1000) {
        setShowBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback instruction for browsers without active prompt event
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('wasl_pwa_dismissed_time', Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Banner for PWA Install */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 font-cairo">
          <div className="p-4 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl text-white relative overflow-hidden flex items-center justify-between gap-3">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left/Right Content */}
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <BrandLogo size="md" variant="glass" />
              <div className="min-w-0 text-right">
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <span>تثبيت تطبيق وصل</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  أضف منصة وصل لشاشتك الرئيسية كلوحة تحكم وتطبيق أصلي
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 relative z-10">
              <button
                type="button"
                onClick={handleInstallClick}
                className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>تثبيت</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Manual Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-cairo animate-in fade-in duration-200 text-right">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 text-white shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" variant="badge" />
                <h3 className="font-extrabold text-base">تثبيت تطبيق وصل</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يمكنك إضافة منصة «وصل» مباشرة إلى الشاشة الرئيسية لجوالك للحصول على تجربة استخدام سريعة وممتازة كأنك تستخدم تطبيقاً مثالياً:
            </p>

            <div className="space-y-3 text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-200">اضغط على خيار المشاركة (Share)</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>في أسفل متصفح Safari أو خيارات المتصفح</span>
                    <Share className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-700/50 pt-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-200">اختر «إضافة إلى الشاشة الرئيسية»</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>ابحث عن خيار Add to Home Screen</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-700/50 pt-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-200">اضغط «إضافة (Add)» لتثبيت الأيقونة</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    سيظهر تطبيق «وصل» بأيقونته الرسمية الشفافة في شاشتك الرئيسية فوراً.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
            >
              فهمت ذلك، تم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
