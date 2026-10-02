import React, { useMemo } from 'react';
import { Eye, MousePointerClick, TrendingUp, Smartphone, Monitor, Tablet, Compass, Calendar } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface AnalyticsOverviewProps {
  userId: string;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ userId }) => {
  const summary = useMemo(() => {
    return StorageService.getUserAnalyticsSummary(userId);
  }, [userId]);

  const totalDevices = (summary.devices.mobile + summary.devices.desktop + summary.devices.tablet) || 1;
  const mobilePct = Math.round((summary.devices.mobile / totalDevices) * 100);
  const desktopPct = Math.round((summary.devices.desktop / totalDevices) * 100);
  const tabletPct = Math.round((summary.devices.tablet / totalDevices) * 100);

  return (
    <div className="space-y-6 text-right font-cairo">
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
    </div>
  );
};
