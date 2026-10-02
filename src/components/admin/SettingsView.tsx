import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/auth';
import { BiometricService, BiometricRegistration } from '../../services/biometrics';
import { useToast } from '../common/Toast';
import {
  Settings,
  Shield,
  Globe,
  MessageSquare,
  Fingerprint,
  CheckCircle2,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Database,
} from 'lucide-react';
import { BiometricSetupModal } from '../common/BiometricModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(StorageService.getSettings());
  const currentUser = AuthService.getInitialState().user;
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Biometrics states
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<BiometricRegistration | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const checkBiometrics = () => {
    if (!currentUser) return;
    const isReg = BiometricService.isRegisteredForUser(currentUser.id);
    setIsBiometricRegistered(isReg);
    if (isReg) {
      const reg = BiometricService.getRegistrations().find((r) => r.userId === currentUser.id) || null;
      setUserRegistration(reg);
    } else {
      setUserRegistration(null);
    }
  };

  useEffect(() => {
    checkBiometrics();
  }, [currentUser?.id]);

  const handleDeactivate = () => {
    if (!currentUser) return;
    BiometricService.unregister(currentUser.id, currentUser.fullName);
    checkBiometrics();
    setShowDeactivateDialog(false);
    showToast('تم إلغاء تفعيل البصمة لهذا الجهاز', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    StorageService.addAuditLog({
      actorId: 'admin',
      actorName: 'مدير النظام',
      actorRole: 'super_admin',
      action: 'تحديث إعدادات المنصة',
      details: 'تم تحديث اسم المنصة ومعلومات الاتصال العامة',
      ip: '192.168.1.1',
    });
    showToast('تم حفظ إعدادات المنصة بنجاح!', 'success');
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nashrak-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف النسخة الاحتياطية بنجاح!', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = StorageService.importAllData(content);
      if (success) {
        showToast('تم استيراد كافة البيانات بنجاح! جاري تحديث الصفحة...', 'success');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast('الملف غير صالح أو التنسيق غير متطابق', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    StorageService.resetToDefaults();
    setShowResetDialog(false);
    showToast('تمت استعادة البيانات الافتراضية بنجاح!', 'info');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="max-w-3xl space-y-6 text-right font-cairo">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          إعدادات النظام والمنصة
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          التحكم بهوية المنصة، سياسة الأمان والدخول بالبصمة، والدعم الفني
        </p>
      </div>

      {/* Biometrics Card for Admin Account */}
      {currentUser && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-600" />
                <span>تسجيل الدخول بالبصمة الحيوية لحسابك ({currentUser.fullName})</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                تفعيل البصمة ومطابقة الحساب يسمح لك بالدخول الفوري إلى لوحة تحكم الإدارة العليا عبر بصمة هذا الجهاز دون كتابة كلمة المرور في كل مرة.
              </p>
            </div>

            <div className="shrink-0">
              {isBiometricRegistered ? (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مفعّلة على هذا الجهاز</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold">
                  <span>غير مفعّلة</span>
                </span>
              )}
            </div>
          </div>

          {isBiometricRegistered && userRegistration ? (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>البصمة مطابقة ومفعّلة بنجاح</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  تاريخ التفعيل: {new Date(userRegistration.registeredAt).toLocaleDateString('ar-SA')} · {userRegistration.deviceLabel}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeactivateDialog(true)}
                className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-50 transition"
              >
                إلغاء البصمة
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                اضغط لتفعيل البصمة ومطابقة الحساب عبر إدخال كلمة المرور الحالية.
              </div>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(true)}
                className="flex items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
              >
                <Fingerprint className="w-4 h-4" />
                <span>تفعيل البصمة ومطابقة الحساب</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Platform Branding & Support Form */}
      <form
        onSubmit={handleSave}
        className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
      >
        {/* Admin & Platform Logo Section */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-white dark:bg-slate-800 shrink-0">
              <img
                src={StorageService.getAdminAvatar()}
                alt="أيقونة المسؤول وشعار المنصة"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                أيقونة وشعار المنصة الرسمي (أيقونة المسؤول)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تُعتمد هذه الأيقونة تلقائياً كشعار رسمي للمنصة، وتظهر مفرغة ونظيفة بدون خلفية أثناء تثبيت التطبيق على الجوال أو الكمبيوتر.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>تغيير الأيقونة</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const b64 = ev.target?.result as string;
                  if (b64) {
                    const admin = StorageService.getUsers().find((u) => u.role === 'super_admin' || u.id === 'user-admin-1');
                    if (admin) {
                      StorageService.updateUser(admin.id, { avatarUrl: b64 });
                      showToast('تم تحديث أيقونة المسؤول وشعار المنصة بنجاح!', 'success');
                    }
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            اسم المنصة
          </label>
          <input
            type="text"
            required
            value={settings.platformName}
            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            الشعار التسويقي (Tagline)
          </label>
          <input
            type="text"
            required
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              بريد الدعم الفني
            </label>
            <input
              type="email"
              required
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              رقم واتساب الدعم الفني
            </label>
            <input
              type="text"
              value={settings.supportWhatsApp}
              onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
            />
          </div>
        </div>

        {/* Registration policy (Controlled by admin) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">
              التسجيل مغلق (إنشاء الحسابات حصرياً عبر الإدارة)
            </span>
            <span className="text-[11px] text-slate-500">
              حسب سياسة المنصة المحددة، يقوم مدير النظام بإنشاء وتفعيل حسابات الأعضاء مباشرة لمنع المتطفلين.
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            مفعّل
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            حفظ إعدادات النظام
          </button>
        </div>
      </form>

      {/* Backup, Export & Import Data Card (Essential for GitHub & cross-domain transfers) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>النسخ الاحتياطي ونقل بيانات المنصة (Export & Import)</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            استخدم هذه الميزة لنقل حساباتك وصفحاتك وروابطك من بيئة العمل إلى موقعك على GitHub بنقرة واحدة، أو للاحتفاظ بنسخة احتياطية كاملة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تحميل نسخة احتياطية (تصدير JSON)</span>
          </button>

          {/* Import JSON */}
          <div>
            <input
              ref={backupInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>استيراد بيانات (ملف JSON)</span>
            </button>
          </div>

          {/* Reset to defaults */}
          <button
            type="button"
            onClick={() => setShowResetDialog(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استعادة البيانات الافتراضية</span>
          </button>
        </div>
      </div>

      {/* Setup Modal */}
      {currentUser && (
        <BiometricSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          user={currentUser}
          onSuccess={checkBiometrics}
        />
      )}

      {/* Deactivate dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        title="تأكيد إلغاء البصمة"
        message="هل ترغب في إلغاء تسجيل البصمة لهذا الجهاز؟ سيتعين عليك استخدام كلمة المرور لتسجيل الدخول."
        confirmText="نعم، إلغاء البصمة"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={handleDeactivate}
        onCancel={() => setShowDeactivateDialog(false)}
      />

      {/* Reset to defaults dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        title="تأكيد استعادة البيانات الافتراضية"
        message="هل أنت متأكد من رغبتك في استعادة الحسابات والبيانات الأولية؟ سيتم مسح أي تعديلات غير محفوظة."
        confirmText="نعم، استعادة البيانات"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};
