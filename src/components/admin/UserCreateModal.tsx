import React, { useState } from 'react';
import { UserPlus, Copy, Check, ShieldCheck, Key } from 'lucide-react';
import { SubscriptionPlanId, AccountStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/ConfirmDialog';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { useToast } from '../common/Toast';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tempPassword, setTempPassword] = useState('Pass' + Math.floor(100000 + Math.random() * 900000));
  const [planId, setPlanId] = useState<SubscriptionPlanId>('business');
  const [planExpiresAt, setPlanExpiresAt] = useState('2027-12-31');
  const [status, setStatus] = useState<AccountStatus>('active');

  // Success state with credentials
  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    username: string;
    email: string;
    pass: string;
    pageUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      showToast('يرجى إدخال اسم مستخدم صحيح باللغة الإنجليزية', 'error');
      return;
    }

    // Check username uniqueness
    const existing = StorageService.getUserByUsername(cleanUsername);
    if (existing) {
      showToast('اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم آخر', 'error');
      return;
    }

    const newUser = StorageService.createUser(
      {
        fullName,
        username: cleanUsername,
        email,
        phone,
        avatarUrl,
        role: 'member',
        status,
        planId,
        planExpiresAt,
        bio: 'مرحباً بكم في صفحتي الرقمية عبر منصة نشرك.',
      },
      tempPassword
    );

    // Audit log
    StorageService.addAuditLog({
      actorId: 'admin',
      actorName: 'مدير النظام',
      actorRole: 'super_admin',
      action: 'إنشاء حساب عضو جديد',
      targetId: newUser.id,
      targetName: newUser.fullName,
      details: `تم إنشاء حساب ${newUser.fullName} (@${cleanUsername}) على باقة ${planId}`,
      ip: '192.168.1.1',
    });

    onUserCreated();
    showToast('تم إنشاء حساب العضو بنجاح!', 'success');

    setCreatedCredentials({
      fullName,
      username: cleanUsername,
      email,
      pass: tempPassword,
      pageUrl: `${window.location.origin}/?u=${cleanUsername}`,
    });
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `مرحباً ${createdCredentials.fullName}،\nتم تجهيز حسابك وصفحتك الرقمية على منصة روابط نشرك المفضلة:\n\n• رابط صفحتك: ${createdCredentials.pageUrl}\n• تسجيل الدخول: ${createdCredentials.email} أو ${createdCredentials.username}\n• كلمة المرور: ${createdCredentials.pass}\n\nيمكنك تسجيل الدخول وإكمال روابطك ومعلوماتك في أي وقت.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('تم نسخ بيانات الدخول لإرسالها للعضو', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setCreatedCredentials(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setTempPassword('Pass' + Math.floor(100000 + Math.random() * 900000));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdCredentials ? 'بيانات دخول العضو الجديد' : 'إنشاء عضو جديد وتفعيل صفحته'}
      description={
        createdCredentials
          ? 'تم إنشاء الحساب بنجاح. يمكنك الآن نسخ بيانات الدخول وإرسالها للمستخدم مباشرة.'
          : 'أدخل بيانات العضو الجديد لتوليد حسابه ورابط صفحته الرقمية فوراً.'
      }
      maxWidth="max-w-lg"
    >
      {createdCredentials ? (
        <div className="space-y-5 text-right font-cairo">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>الحساب جاهز ومفعّل</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <p>
                <strong>الاسم:</strong> {createdCredentials.fullName}
              </p>
              <p>
                <strong>اسم المستخدم:</strong> @{createdCredentials.username}
              </p>
              <p>
                <strong>البريد:</strong> {createdCredentials.email}
              </p>
              <p>
                <strong>كلمة المرور المؤقتة:</strong> {createdCredentials.pass}
              </p>
              <p>
                <strong>الرابط العام:</strong> {createdCredentials.pageUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ الرسالة الكاملة!' : 'نسخ بيانات الدخول للمستخدم'}</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="py-3 px-5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-right font-cairo">
          {/* Avatar Upload */}
          <ImageUploadInput
            label="الصورة الشخصية أو الشعار للعضو الجديد (اختياري)"
            value={avatarUrl}
            onChange={(url) => setAvatarUrl(url)}
            fallbackName={fullName || 'عضو جديد'}
          />

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              الاسم الكامل للعضو
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: فيصل الغامدي"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              اسم المستخدم (المعرّف الخاص بالرابط)
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <span className="text-xs font-mono text-slate-400 dir-ltr">domain.com/</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="faisal"
                className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100 outline-none dir-ltr text-left"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              أحرف إنجليزية صغيرة وأرقام فقط، بدون مسافات.
            </p>
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
                placeholder="faisal@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                رقم الهاتف (اختياري)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966500000000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
              />
            </div>
          </div>

          {/* Temp Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              كلمة المرور المؤقتة
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono dir-ltr text-left outline-none"
              />
              <button
                type="button"
                onClick={() => setTempPassword('Pass' + Math.floor(100000 + Math.random() * 900000))}
                className="py-2 px-3 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-medium"
              >
                توليد عشوائي
              </button>
            </div>
          </div>

          {/* Plan & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                الباقة المخصصة
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
                <option value="suspended">معلق مؤقتاً (Suspended)</option>
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء العضو وإصدار الصفحة</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
