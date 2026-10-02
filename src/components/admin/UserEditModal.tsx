import React, { useState, useEffect } from 'react';
import { User, SubscriptionPlanId, AccountStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/ConfirmDialog';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { useToast } from '../common/Toast';
import { Key } from 'lucide-react';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [planId, setPlanId] = useState<SubscriptionPlanId>('free');
  const [planExpiresAt, setPlanExpiresAt] = useState('');
  const [status, setStatus] = useState<AccountStatus>('active');
  const [newPassword, setNewPassword] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [bgImageOpacity, setBgImageOpacity] = useState(0.35);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
      setPlanId(user.planId);
      setPlanExpiresAt(user.planExpiresAt || '2027-12-31');
      setStatus(user.status);
      setNewPassword('');

      const theme = StorageService.getUserTheme(user.id);
      setBackgroundImageUrl(theme?.backgroundImageUrl || '');
      setBgImageOpacity(theme?.bgImageOpacity !== undefined ? theme.bgImageOpacity : 0.35);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    StorageService.updateUser(user.id, {
      fullName,
      email,
      phone,
      avatarUrl,
      planId,
      planExpiresAt,
      status,
    });

    StorageService.saveUserTheme(user.id, {
      backgroundImageUrl,
      bgImageOpacity,
    });

    StorageService.syncUserToCloud(user.id).catch(() => {});

    if (newPassword.trim().length > 0) {
      StorageService.resetPassword(user.id, newPassword.trim());
      StorageService.addAuditLog({
        actorId: 'admin',
        actorName: 'مدير النظام',
        actorRole: 'super_admin',
        action: 'إعادة تعيين كلمة مرور مستخدم',
        targetId: user.id,
        targetName: user.fullName,
        details: `تم تعيين كلمة مرور جديدة للعضو ${user.fullName}`,
        ip: '192.168.1.1',
      });
    }

    StorageService.addAuditLog({
      actorId: 'admin',
      actorName: 'مدير النظام',
      actorRole: 'super_admin',
      action: 'تعديل بيانات عضو',
      targetId: user.id,
      targetName: user.fullName,
      details: `تحديث بيانات العضو ${user.fullName} (${user.username})، الباقة: ${planId}، الحالة: ${status}`,
      ip: '192.168.1.1',
    });

    showToast('تم حفظ التعديلات بنجاح!', 'success');
    onUserUpdated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل حساب: ${user.fullName}`}
      description={`اسم المستخدم: @${user.username} | تاريخ التسجيل: ${new Date(user.createdAt).toLocaleDateString('ar-SA')}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right font-cairo">
        {/* Avatar Upload */}
        <ImageUploadInput
          label="الصورة الشخصية أو الشعار (Avatar)"
          value={avatarUrl}
          onChange={(url) => setAvatarUrl(url)}
          fallbackName={fullName}
        />

        {/* Custom Background Image Upload */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <ImageUploadInput
            label="صورة خلفية الصفحة المخصصة للحساب"
            value={backgroundImageUrl}
            onChange={(url) => setBackgroundImageUrl(url)}
          />
          {backgroundImageUrl && (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>شفافية صورة الخلفية</span>
                <span className="text-emerald-600 font-bold">{Math.round(bgImageOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={bgImageOpacity}
                onChange={(e) => setBgImageOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            الاسم الكامل
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
            />
          </div>
        </div>

        {/* Plan & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              الباقة
            </label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value as SubscriptionPlanId)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none"
            >
              <option value="free">المجانية (Free)</option>
              <option value="pro">المحترفين (Pro)</option>
              <option value="business">الأعمال والشركات (Business)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              حالة الحساب
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none"
            >
              <option value="active">نشط ومفعّل (Active)</option>
              <option value="suspended">معلق (Suspended)</option>
            </select>
          </div>
        </div>

        {/* Expiration date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            تاريخ انتهاء الاشتراك
          </label>
          <input
            type="date"
            value={planExpiresAt}
            onChange={(e) => setPlanExpiresAt(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none"
          />
        </div>

        {/* Reset Password */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>إعادة تعيين كلمة المرور (اختياري)</span>
          </label>
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="اترك هذا الحقل فارغاً إذا كنت لا ترغب بتغيير كلمة المرور"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            حفظ التعديلات
          </button>
        </div>
      </form>
    </Modal>
  );
};
