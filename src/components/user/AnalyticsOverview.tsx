import React, { useMemo, useState } from 'react';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Smartphone,
  Compass,
  Globe,
  Trash2,
  Check,
  Link as LinkIcon,
  Crown,
  Award,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { DailyGrowthChart } from './DailyGrowthChart';

interface AnalyticsOverviewProps {
  userId: string;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ userId }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [clearedMsg, setClearedMsg] = useState(false);

  const summary = useMemo(() => {
    return StorageService.getUserAnalyticsSummary(userId);
  }, [userId, refreshKey]);

  const handleClearAnalytics = () => {
    if (window.confirm('هل أنت تأكد من مسح وتصفير كافة بيانات الإحصائيات والزيارات الحالية للبدء من جديد حقيقياً 100%؟')) {
      StorageService.clearAnalytics(userId);
      setRefreshKey((prev) => prev + 1);
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 3000);
    }
  };

  const totalDevices = (summary.devices.mobile + summary.devices.desktop + summary.devices.tablet) || 1;
  const mobilePct = Math.round((summary.devices.mobile / totalDevices) * 100);
  const desktopPct = Math.round((summary.devices.desktop / totalDevices) * 100);
  const tabletPct = Math.round((summary.devices.tablet / totalDevices) * 100);

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Analytics Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <span>إحصائيات وزيارات الصفحة الدقيقة 100%</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              تتبع حي حقيقي
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            يتم تسجيل وتتبع الزيارات والتفاعلات بدقة تامة دون أي تزييف أو توليد عشوائي.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {clearedMsg && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>تم تصفير البيانات بنجاح</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 rounded-xl transition shadow-2xs"
            title="مسح وتصفير كافة بيانات الزيارات الحالية والإحصائيات"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح وتصفير البيانات</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">مشاهدات الصفحة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {summary.totalViews.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">إجمالي الزيارات المسجلة</div>
        </div>

        {/* Total Link Clicks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الضغطات على الروابط</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {summary.totalClicks.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">تفاعل الزوار مع أزرارك</div>
        </div>

        {/* CTR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">معدل التفاعل (CTR)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 dir-ltr text-right">
            {summary.ctr}
          </div>
          <div className="text-[11px] text-slate-400">نسبة النقر لكل زيارة</div>
        </div>

        {/* Primary Traffic Source */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">أعلى مصدر للزيارات</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {summary.topReferrers[0]?.name || 'روابط مباشرة'}
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.topReferrers[0] ? `${summary.topReferrers[0].count} زيارة` : 'زيارات بدون وسيط'}
          </div>
        </div>
      </div>

      {/* Daily Growth Line Chart (30-Day Trend) */}
      <DailyGrowthChart
        userId={userId}
        onRefresh={() => setRefreshKey((prev) => prev + 1)}
      />

      {/* User Links Performance Section (Ranked by Highest Clicks First) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
              <span>إحصائية تفاعل الأزرار والروابط المضافة (الأعلى زيارة أولاً)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ترتيب تلقائي لجميع الروابط المضافة من الأكثر نقراً وتفاعلاً إلى الأقل
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            {summary.userLinksPerformance ? summary.userLinksPerformance.length : 0} عنصر مضاف
          </span>
        </div>

        {!summary.userLinksPerformance || summary.userLinksPerformance.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            لم تقم بإضافة أي روابط أو أزرار بعد. قم بإضافة عناصر جديدة من تبويب المحتوى لعرض إحصائياتها هنا!
          </div>
        ) : (
          <div className="space-y-3">
            {summary.userLinksPerformance.map((link, idx) => {
              const totalLinkClicks = summary.totalClicks || 1;
              const pct = Math.round((link.clicks / totalLinkClicks) * 100);
              const isTopRanked = idx === 0 && link.clicks > 0;

              return (
                <div
                  key={link.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isTopRanked
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-400/60 dark:border-amber-500/40 ring-2 ring-amber-400/20 shadow-md'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Rank Badge & Link Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Tag */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                            : idx === 2
                            ? 'bg-amber-700/30 text-amber-900 dark:text-amber-200 border border-amber-600/30'
                            : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {idx === 0 ? <Crown className="w-5 h-5 fill-slate-950" /> : `#${idx + 1}`}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {link.title}
                          </span>
                          {isTopRanked && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-2xs shrink-0 flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-amber-950" />
                              <span>الأكثر زيارة</span>
                            </span>
                          )}
                          {!link.isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              غير معطل
                            </span>
                          )}
                        </div>
                        {link.subtitle && (
                          <p className="text-xs text-slate-500 truncate dir-ltr text-right mt-0.5">
                            {link.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats Metric */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                      <div className="text-right sm:text-left">
                        <div className="flex items-center gap-1.5 justify-end">
                          <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                            {link.clicks.toLocaleString('ar-SA')}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">نقرة / زيارة</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          تُمثّل {pct}% من إجمالي النقرات
                        </div>
                      </div>

                      {link.url && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition shadow-2xs"
                          title="فتح الرابط في نافذة جديدة"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTopRanked ? 'bg-gradient-to-r from-amber-500 to-emerald-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(pct, link.clicks > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown: Devices & Top Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>توزيع الأجهزة المستخدمة</span>
          </h4>

          {/* Visual Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
            <div
              style={{ width: `${mobilePct}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`جوال: ${mobilePct}%`}
            />
            <div
              style={{ width: `${desktopPct}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`كمبيوتر: ${desktopPct}%`}
            />
            <div
              style={{ width: `${tabletPct}%` }}
              className="bg-purple-500 h-full transition-all"
              title={`لوحي: ${tabletPct}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <span className="text-xs font-bold block">{mobilePct}%</span>
                <span className="text-[11px] text-slate-500">الجوال ({summary.devices.mobile})</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div>
                <span className="text-xs font-bold block">{desktopPct}%</span>
                <span className="text-[11px] text-slate-500">الكمبيوتر ({summary.devices.desktop})</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <div>
                <span className="text-xs font-bold block">{tabletPct}%</span>
                <span className="text-[11px] text-slate-500">أجهزة لوحية ({summary.devices.tablet})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>مصادر الزوار (Top Referrers)</span>
          </h4>

          {summary.topReferrers.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">لا توجد بيانات مصادر بعد</div>
          ) : (
            <div className="space-y-2.5">
              {summary.topReferrers.map((ref, idx) => {
                const pct = Math.round((ref.count / (summary.totalViews || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ref.name}</span>
                      <span className="text-slate-500">{ref.count} زيارة ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Country Breakdown Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>إحصائية وعدد الزيارات حسب كل دولة</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {summary.countries ? summary.countries.length : 0} دول مسجلة
          </span>
        </div>

        {!summary.countries || summary.countries.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">لا توجد بيانات زيارات دولية بعد</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.countries.map((c, idx) => {
              const pct = Math.round((c.count / (summary.totalViews || 1)) * 100);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{c.flag}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                        {c.name}
                      </span>
                      <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 block">
                      {c.count.toLocaleString('ar-SA')} زيارة
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
