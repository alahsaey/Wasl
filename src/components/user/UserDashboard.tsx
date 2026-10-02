import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Share2,
  Sliders,
  Palette,
  Eye,
  MousePointerClick,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Fingerprint,
} from 'lucide-react';
import { User, Block, UserThemeConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { QRCodeModal } from '../common/QRCodeModal';
import { useToast } from '../common/Toast';

interface UserDashboardProps {
  user: User;
  onNavigateTab: (tab: 'builder' | 'analytics' | 'theme' | 'security') => void;
  onOpenPublicView: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onNavigateTab,
  onOpenPublicView,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const blocks = StorageService.getUserBlocks(user.id);
  const summary = StorageService.getUserAnalyticsSummary(user.id);

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?u=${user.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('تم نسخ الرابط المباشر لصفحتك!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 text-right font-cairo">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white shadow-xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>صفحتك الرقمية منشورة ونشطة على الإنترنت</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مرحبًا، {user.fullName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تحكّم بروابطك، معلوماتك، هويتك الرقمية، وتابع زيارات وتفاعل جمهورك في مكان واحد.
            </p>

            {/* Page Link Box */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-xs font-mono flex-1 text-slate-200">
                <span className="truncate select-all dir-ltr text-left flex-1">{publicUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:text-emerald-400 transition"
                  title="نسخ الرابط"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenPublicView}
                className="flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                <span>زيارة الصفحة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition"
            >
              <QrCode className="w-4 h-4" />
              <span>رمز QR</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Blob */}
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Views */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">مشاهدات الصفحة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {summary.totalViews.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">إجمالي الزيارات النشطة</div>
        </div>

        {/* Link Clicks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الضغطات على الروابط</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {summary.totalClicks.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">نقرات الروابط والعناصر</div>
        </div>

        {/* Added Blocks Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">العناصر والروابط</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {blocks.length.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">عناصر نشطة في صفحتك</div>
        </div>

        {/* CTR */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">معدل التفاعل</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 dir-ltr text-right">
            {summary.ctr}
          </div>
          <div className="text-[11px] text-slate-400">نسبة النقر إلى المشاهدات</div>
        </div>
      </div>

      {/* Main Action Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Edit Profile & Content */}
        <button
          onClick={() => onNavigateTab('builder')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-right hover:border-emerald-500/50 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>تعديل المحتوى والروابط</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            أضف روابط جديدة، حسابات التواصل، محادثة واتساب، أو أعد ترتيب عناصرك بالسحب والإفلات.
          </p>
        </button>

        {/* 2. Choose Theme */}
        <button
          onClick={() => onNavigateTab('theme')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-right hover:border-emerald-500/50 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>تخصيص القالب والمظهر</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            اختر من بين 8 قوالب فاخرة وخصص الألوان والخطوط وأشكال الأزرار والصورة الشخصية.
          </p>
        </button>

        {/* 3. Analytics View */}
        <button
          onClick={() => onNavigateTab('analytics')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-right hover:border-emerald-500/50 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>تحليلات وإحصائيات الزوار</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            تعرف على مصادر زوارك، أنواع أجهزتهم، وأكثر الروابط تفاعلاً بالأرقام والرسوم.
          </p>
        </button>

        {/* 4. Security & Biometrics */}
        <button
          onClick={() => onNavigateTab('security')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-right hover:border-emerald-500/50 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>الأمان والبصمة الحيوية</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            تفعيل الدخول ببصمة الإصبع أو الوجه لهذا الجهاز ومطابقة الحساب لحمايته.
          </p>
        </button>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={publicUrl}
        title={user.fullName}
        userName={user.username}
      />
    </div>
  );
};
