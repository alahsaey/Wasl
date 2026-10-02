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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              ن
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block leading-tight">
                روابط نشرك
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block leading-tight">
                لوحة تحكم Admin
              </span>
            </div>
          </div>
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
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-white dark:bg-slate-900 h-full p-4 flex flex-col z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm">روابط نشرك (Admin)</div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm">لوحة الإدارة</span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>عضو جديد</span>
          </button>
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
