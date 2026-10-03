import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck, ShieldAlert, Key, CheckCircle2, Lock, Smartphone, RefreshCw } from 'lucide-react';
import { User } from '../../types';
import { BiometricService, BiometricRegistration } from '../../services/biometrics';
import { StorageService } from '../../services/storage';
import { BiometricSetupModal } from '../common/BiometricModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DarkModeToggle } from '../common/DarkModeToggle';
import { useToast } from '../common/Toast';

interface SecuritySettingsProps {
  user: User;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const { showToast } = useToast();
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<BiometricRegistration | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const checkBiometricStatus = () => {
    const isReg = BiometricService.isRegisteredForUser(user.id);
    setIsBiometricRegistered(isReg);

    if (isReg) {
      const reg = BiometricService.getRegistrations().find((r) => r.userId === user.id) || null;
      setUserRegistration(reg);
    } else {
      setUserRegistration(null);
    }
  };

  useEffect(() => {
    checkBiometricStatus();
  }, [user.id]);

  const handleDeactivateBiometrics = () => {
    BiometricService.unregister(user.id, user.fullName);
    checkBiometricStatus();
    setShowDeactivateDialog(false);
    showToast('تم إلغاء تفعيل البصمة لهذا الجهاز', 'info');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('كلمة المرور الجديدة يجب أن تتكون من 6 خانات على الأقل', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
      return;
    }

    const passwords = StorageService.getPasswords();
    const currentValid = passwords[user.id];

    if (!currentValid || currentValid !== currentPassword) {
      showToast('كلمة المرور الحالية غير صحيحة', 'error');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      StorageService.resetPassword(user.id, newPassword);
      StorageService.addAuditLog({
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'تغيير كلمة المرور',
        details: 'قام العضو بتغيير كلمة المرور الخاصة بحسابه بنجاح',
        ip: '192.168.1.1',
      });
      setPasswordLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('تم تحديث كلمة المرور بنجاح!', 'success');
    }, 200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-right font-cairo">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          إعدادات الحساب والأمان والمظهر
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          تخصيص الوضع المظلم (Dark Mode)، تفعيل الدخول بالبصمة الحيوية، وتغيير كلمة المرور
        </p>
      </div>

      {/* 0. Dark Mode Switch Card */}
      <DarkModeToggle variant="card" />

      {/* 1. Biometrics Section */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-emerald-600" />
              <span>تسجيل الدخول بالبصمة الحيوية (Biometric Login)</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
              تتيح لك البصمة تسجيل الدخول الفوري والآمن لحسابك من هذا الجهاز دون الحاجة لكتابة كلمة المرور في كل مرة، مع اشتراط مطابقة وتأكيد كلمة المرور لربط البصمة بصاحب الحساب فقط.
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
                <span>غير مفعّلة حالياً</span>
              </span>
            )}
          </div>
        </div>

        {/* Biometrics Card State */}
        {isBiometricRegistered && userRegistration ? (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تم تأكيد مطابقة البصمة لحساب @{user.username} بنجاح</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  تاريخ التفعيل: {new Date(userRegistration.registeredAt).toLocaleDateString('ar-SA')} · نوع الجهاز: {userRegistration.deviceLabel}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeactivateDialog(true)}
                  className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl transition"
                >
                  إلغاء تفعيل البصمة
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span>قم بربط بصمة هاتفك أو جهازك بحسابك الآن</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  يتطلب التفعيل إدخال كلمة مرور حسابك مرة واحدة لمطابقة هويتك وحماية حسابك من المتطفلين.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSetupModalOpen(true)}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
              >
                <Fingerprint className="w-4 h-4" />
                <span>تفعيل البصمة ومطابقة الحساب</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Password Change Section */}
      <form
        onSubmit={handleChangePassword}
        className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            <span>تغيير كلمة المرور</span>
          </h3>
          <p className="text-xs text-slate-500">
            احرص على استخدام كلمة مرور قوية تتضمن أحرفاً وأرقاماً لحماية حسابك
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 خانات على الأقل"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            {passwordLoading ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}
          </button>
        </div>
      </form>

      {/* Biometric Setup Modal */}
      <BiometricSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        user={user}
        onSuccess={checkBiometricStatus}
      />

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        title="تأكيد إلغاء البصمة"
        message="هل ترغب حقاً في إلغاء تسجيل البصمة لهذا الجهاز؟ سيتعين عليك استخدام كلمة المرور لتسجيل الدخول مستقبلاً."
        confirmText="نعم، إلغاء البصمة"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={handleDeactivateBiometrics}
        onCancel={() => setShowDeactivateDialog(false)}
      />
    </div>
  );
};
