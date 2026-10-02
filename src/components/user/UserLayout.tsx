import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sliders,
  Palette,
  BarChart3,
  ExternalLink,
  LogOut,
  ShieldAlert,
  ArrowRight,
  Menu,
  X,
  User as UserIcon,
  Fingerprint,
} from 'lucide-react';
import { User } from '../../types';
import { AuthService } from '../../services/auth';
import { UserDashboard } from './UserDashboard';
import { ProfileBuilder } from './ProfileBuilder';
import { ThemeSelector } from './ThemeSelector';
import { AnalyticsOverview } from './AnalyticsOverview';
import { SecuritySettings } from './SecuritySettings';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';

interface UserLayoutProps {
  user: User;
  impersonator: User | null;
  onOpenPublicView: () => void;
  onUserUpdated: (u: User) => void;
  onLogout: () => void;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  user,
  impersonator,
  onOpenPublicView,
  onUserUpdated,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'theme' | 'analytics' | 'security'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  const handleExitImpersonation = () => {
    AuthService.exitImpersonation();
    showToast('تمت العودة للوحة تحكم الإدارة العليا بنجاح', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-cairo">
      {/* 1. Admin Impersonation Notice Bar (Req 23 & 24) */}
      {impersonator && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-40 sticky top-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              أنت تتصفح حالياً بصفتك: <strong className="underline">{user.fullName}</strong> (@{user.username})
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 py-1 px-3 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition text-[11px]"
          >
            <span>إنهاء وضع المحاكاة والعودة للوحة الإدارة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand & Page Links */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                ن
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight block leading-tight">
                  روابط نشرك
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">لوحة تحكم العضو</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 pr-6 border-r border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                  activeTab === 'builder'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>محرر الصفحة</span>
              </button>

              <button
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                  activeTab === 'theme'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>القوالب والتصميم</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                  activeTab === 'analytics'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>الإحصائيات</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                  activeTab === 'security'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                <span>الأمان والبصمة</span>
              </button>
            </nav>
          </div>

          {/* Left Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenPublicView}
              className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              title="زيارة صفحتك العامة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">زيارة صفحتي</span>
            </button>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`
                  }
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-1">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-right"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('builder');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-right"
            >
              <Sliders className="w-4 h-4" />
              <span>محرر الصفحة</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('theme');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-right"
            >
              <Palette className="w-4 h-4" />
              <span>القوالب والتصميم</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('analytics');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-right"
            >
              <BarChart3 className="w-4 h-4" />
              <span>الإحصائيات</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('security');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-right"
            >
              <Fingerprint className="w-4 h-4" />
              <span>الأمان والبصمة</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs text-right text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-t border-slate-100 dark:border-slate-800 mt-2 pt-3"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </header>

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <UserDashboard
            user={user}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenPublicView={onOpenPublicView}
          />
        )}

        {activeTab === 'builder' && (
          <ProfileBuilder
            user={user}
            onUserUpdated={onUserUpdated}
            onOpenPublicView={onOpenPublicView}
          />
        )}

        {activeTab === 'theme' && (
          <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <ThemeSelector
              currentTheme={StorageService.getUserTheme(user.id)}
              onChange={(updated) => {
                StorageService.saveUserTheme(user.id, updated);
                onUserUpdated(user);
              }}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto">
            <AnalyticsOverview userId={user.id} />
          </div>
        )}

        {activeTab === 'security' && (
          <SecuritySettings user={user} />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        منصة روابط نشرك المفضلة © 2026. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
};
