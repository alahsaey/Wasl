import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, Key, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { User } from '../../types';
import { BiometricService } from '../../services/biometrics';
import { Modal } from './ConfirmDialog';
import { useToast } from './Toast';

interface BiometricSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

export const BiometricSetupModal: React.FC<BiometricSetupModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await BiometricService.register(user, password);
      setLoading(false);

      if (res.success) {
        showToast('تم تفعيل وتأكيد مطابقة البصمة بنجاح لهذا الجهاز!', 'success');
        setPassword('');
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'تعذر تفعيل البصمة. يرجى التحقق من كلمة المرور.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'حدث خطأ أثناء الاتصال بمستشعر البصمة.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تفعيل البصمة الحيوية ومطابقة الحساب"
      description="حماية إضافية تتيح لك الدخول السريع والآمن إلى حسابك دون الحاجة لكتابة كلمة المرور."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleActivate} className="space-y-5 text-right font-cairo">
        {/* Visual icon badge */}
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Fingerprint className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              ربط البصمة بحساب: {user.fullName}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              اسم المستخدم: @{user.username}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          لضمان عدم تفعيل البصمة إلا لصاحب الحساب الشرعي، يرجى مطابقة الحساب عبر إدخال كلمة المرور الحالية:
        </p>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>كلمة مرور الحساب للتأكيد والمطابقة</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور الحالية"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            {loading ? (
              <span>جاري التحقق من المستشعر...</span>
            ) : (
              <>
                <Fingerprint className="w-4 h-4" />
                <span>مطابقة وتفعيل البصمة</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
