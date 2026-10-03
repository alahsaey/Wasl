import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Palette,
  CreditCard,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { User } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { UsersManagement } from './UsersManagement';
import { PagesOverview } from './PagesOverview';
import { ThemesManagement } from './ThemesManagement';
import { PlansManagement } from './PlansManagement';
import { AuditLogsView } from './AuditLogsView';
import { SettingsView } from './SettingsView';
import { UserCreateModal } from './UserCreateModal';
import { useToast } from '../common/Toast';
import { BrandLogo } from '../common/BrandLogo';
import { DarkModeToggle } from '../common/DarkModeToggle';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'pages'
  | 'themes'
  | 'plans'
  | 'analytics'
  | 'activities'
  | 'settings';

interface AdminLayoutProps {
  adminUser: User;
  onLogout: () => void;
  onImpersonate: (user: User) => void;
  onViewPublicProfile: (username: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  adminUser,
  onLogout,
  onImpersonate,
  onViewPublicProfile,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showToast } = useToast();

  const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'pages', label: 'الصفحات', icon: FileText },
    { id: 'themes', label: 'القوالب', icon: Palette },
    { id: 'plans', label: 'الباقات', icon: CreditCard },
    { id: 'analytics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'activities', label: 'النشاطات', icon: Activity },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-cairo">
      {/* 1. Desktop RTL Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shrink-0 sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <BrandLogo size="md" variant="badge" showText={true} subtitle="لوحة تحكم Admin" />
        </div>

        {/* Navigation Items (9 items) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Dark Mode Switch */}
          <DarkModeToggle variant="switch" showLabel={true} />

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <img
                src={
                  adminUser.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(adminUser.fullName)}`
                }
                alt={adminUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs truncate">{adminUser.fullName}</div>
              <div className="text-[10px] text-slate-400">مالك النظام</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[100000] lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col z-10 shadow-2xl overflow-y-auto">
            {/* Drawer Header with Quick Logout Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <BrandLogo size="sm" variant="badge" showText={true} subtitle="Admin" />

              <div className="flex items-center gap-1.5">
                {/* Fast Top Logout button - completely immune to any bottom floating badges */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 py-1.5 px-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition border border-rose-200/60 dark:border-rose-900/50"
                  title="تسجيل الخروج السريع"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>

                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom User Area with generous padding (pb-28) to never be blocked by Netlify/floating elements */}
            <div className="pt-3 pb-28 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0 mt-auto">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={
                      adminUser.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(adminUser.fullName)}`
                    }
                    alt={adminUser.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate">{adminUser.fullName}</div>
                  <div className="text-[10px] text-slate-400">مالك النظام</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition shadow-xs border border-rose-200/50 dark:border-rose-900/40"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من النظام</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header with direct Logout Button */}
        <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="فتح القائمة الرئيسية"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm">لوحة الإدارة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>عضو جديد</span>
            </button>

            {/* Direct Logout Icon in Mobile Header - Always accessible at all times */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center gap-1"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="text-[11px] font-bold text-rose-600 hidden sm:inline">خروج</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              onNavigateTab={(tab) => handleSelectTab(tab as AdminTab)}
              onOpenCreateUser={() => setIsCreateModalOpen(true)}
              onViewPublicProfile={onViewPublicProfile}
            />
          )}

          {activeTab === 'users' && (
            <UsersManagement
              currentAdmin={adminUser}
              onImpersonate={onImpersonate}
              onViewPublicProfile={onViewPublicProfile}
            />
          )}

          {activeTab === 'pages' && (
            <PagesOverview onViewPublicProfile={onViewPublicProfile} />
          )}

          {activeTab === 'themes' && <ThemesManagement />}

          {activeTab === 'plans' && <PlansManagement />}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <AdminDashboard
                onNavigateTab={(tab) => handleSelectTab(tab as AdminTab)}
                onOpenCreateUser={() => setIsCreateModalOpen(true)}
                onViewPublicProfile={onViewPublicProfile}
              />
            </div>
          )}

          {activeTab === 'activities' && <AuditLogsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Quick Create Modal */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={() => {
          showToast('تمت إضافة العضو وتحديث القائمة', 'success');
        }}
      />
    </div>
  );
};
