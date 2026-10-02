import React from 'react';
import { ExternalLink, Eye, MousePointerClick, Layers, CheckCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface PagesOverviewProps {
  onViewPublicProfile: (username: string) => void;
}

export const PagesOverview: React.FC<PagesOverviewProps> = ({ onViewPublicProfile }) => {
  const users = StorageService.getUsers().filter((u) => u.role === 'member');
  const allBlocks = StorageService.getAllBlocks();
  const allThemes = StorageService.getAllThemes();

  return (
    <div className="space-y-6 text-right font-cairo">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          دليل الصفحات الرقمية المنشورة
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          استعراض ومراقبة جميع صفحات الأعضاء المنشورة على المنصة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const userBlocks = allBlocks.filter((b) => b.userId === user.id);
          const userTheme = allThemes[user.id];
          const summary = StorageService.getUserAnalyticsSummary(user.id);

          return (
            <div
              key={user.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
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
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <span>{user.fullName}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </h3>
                    <div className="text-xs font-mono text-emerald-600">domain.com/{user.username}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {user.status === 'active' ? 'نشط' : 'معطل'}
                </span>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {user.bio || 'لا توجد نبذة مضافة'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">العناصر</span>
                  <span className="font-bold text-xs">{userBlocks.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">الزيارات</span>
                  <span className="font-bold text-xs">{summary.totalViews}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">النقرات</span>
                  <span className="font-bold text-xs">{summary.totalClicks}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onViewPublicProfile(user.username)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              >
                <span>مشاهدة الصفحة العامة</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
