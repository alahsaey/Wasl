import React, { useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  Eye,
  MousePointerClick,
  TrendingUp,
  UserPlus,
  ExternalLink,
  Shield,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateUser: () => void;
  onViewPublicProfile: (username: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenCreateUser,
  onViewPublicProfile,
}) => {
  const users = StorageService.getUsers();
  const blocks = StorageService.getAllBlocks();
  const analytics = StorageService.getAnalytics();
  const auditLogs = StorageService.getAuditLogs();

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const suspendedUsers = users.filter((u) => u.status === 'suspended').length;
    const totalPages = users.filter((u) => u.role === 'member').length;

    const pageViews = analytics.filter((e) => e.type === 'page_view').length;
    const linkClicks = analytics.filter((e) => e.type === 'link_click').length;

    // Top visited pages
    const pageVisitsCount: Record<string, number> = {};
    analytics
      .filter((e) => e.type === 'page_view')
      .forEach((e) => {
        pageVisitsCount[e.userId] = (pageVisitsCount[e.userId] || 0) + 1;
      });

    const topPages = Object.entries(pageVisitsCount)
      .map(([userId, count]) => {
        const user = users.find((u) => u.id === userId);
        return {
          user,
          count,
        };
      })
      .filter((item) => item.user !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top clicked links
    const topBlocks = [...blocks]
      .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalPages,
      pageViews,
      linkClicks,
      topPages,
      topBlocks,
    };
  }, [users, blocks, analytics]);

  return (
    <div className="space-y-8 text-right font-cairo">
      {/* Top Banner & Quick Create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl border border-slate-700/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>لوحة تحكم المالك والمدير العام (Super Admin)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            مرحباً بك في إدارة منصة "روابط نشرك المفضلة"
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            متابعة شاملة لجميع الأعضاء، الصفحات العامة المنشورة، ونشاط المنصة في الوقت الفعلي.
          </p>
        </div>

        <button
          onClick={onOpenCreateUser}
          className="flex items-center justify-center gap-2 py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ إنشاء عضو جديد</span>
        </button>
      </div>

      {/* Primary KPI Grid (6 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي المستخدمين</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {stats.totalUsers}
          </div>
          <div className="text-[11px] text-slate-400">حسابات مسجلة</div>
        </div>

        {/* Active Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">المستخدمون النشطون</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {stats.activeUsers}
          </div>
          <div className="text-[11px] text-slate-400">صفحات نشطة بالكامل</div>
        </div>

        {/* Suspended Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">المعطلون</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {stats.suspendedUsers}
          </div>
          <div className="text-[11px] text-slate-400">حسابات موقوفة مؤقتاً</div>
        </div>

        {/* Total Pages */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي الصفحات</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {stats.totalPages}
          </div>
          <div className="text-[11px] text-slate-400">صفحات بروفايل</div>
        </div>

        {/* Total Views */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي الزيارات</span>
            <Eye className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {stats.pageViews.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">مشاهدة للصفحات</div>
        </div>

        {/* Total Clicks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي الضغطات</span>
            <MousePointerClick className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {stats.linkClicks.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400">نقرات تفاعلية</div>
        </div>
      </div>

      {/* Two Column Layout: Top Pages & Top Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Visited Pages */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>أكثر الصفحات الرقمية زيارة</span>
            </h3>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs text-emerald-600 hover:underline font-semibold"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3">
            {stats.topPages.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد زيارات مسجلة بعد</p>
            ) : (
              stats.topPages.map(({ user, count }, idx) => {
                if (!user) return null;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-xs text-slate-400">
                        #{idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                        <img
                          src={
                            user.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`
                          }
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {count.toLocaleString('ar-SA')} زيارة
                      </span>
                      <button
                        onClick={() => onViewPublicProfile(user.username)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                        title="فتح الصفحة"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Most Clicked Links */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-emerald-600" />
              <span>أكثر الروابط والعناصر تفاعلاً ونقراً</span>
            </h3>
            <span className="text-xs text-slate-400">على مستوى المنصة</span>
          </div>

          <div className="space-y-3">
            {stats.topBlocks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد نقرات مسجلة بعد</p>
            ) : (
              stats.topBlocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-xs text-slate-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                        {block.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {block.type === 'whatsapp'
                          ? 'محادثة واتساب'
                          : block.type === 'pdf'
                          ? 'تحميل PDF'
                          : 'رابط خارجي'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    {(block.clicksCount || 0).toLocaleString('ar-SA')} نقرة
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent System Activity / Audit Log Preview */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>سجل العمليات والرقابة الأخير (Audit Log)</span>
          </h3>
          <button
            onClick={() => onNavigateTab('activities')}
            className="text-xs text-emerald-600 hover:underline font-semibold"
          >
            عرض سجل العمليات كاملاً
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {auditLogs.slice(0, 5).map((log, idx) => (
            <div key={`${log.id}-${idx}`} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-slate-100">{log.action}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{log.details}</span>
              </div>
              <div className="text-[11px] text-slate-400 shrink-0 font-mono">
                {new Date(log.timestamp).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
