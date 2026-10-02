import React, { useState } from 'react';
import {
  LogIn,
  Lock,
  User as UserIcon,
  Fingerprint,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { AuthService } from '../../services/auth';
import { BiometricService } from '../../services/biometrics';
import { useToast } from '../common/Toast';
import { BrandLogo } from '../common/BrandLogo';

interface LoginFormProps {
  onSuccess: () => void;
  onViewDemoPage: (username: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onViewDemoPage }) => {
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard password login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = AuthService.login(identifier, password);
      setLoading(false);
      if (res.success) {
        showToast(`أهلاً بك مجدداً، ${res.user?.fullName}`, 'success');
        onSuccess();
      } else {
        setError(res.error || 'حدث خطأ أثناء تسجيل الدخول');
        showToast(res.error || 'خطأ في تسجيل الدخول', 'error');
      }
    }, 250);
  };

  // Biometric login
  const handleBiometricLogin = async () => {
    setError(null);
    setBiometricLoading(true);

    try {
      const res = await BiometricService.authenticate();
      setBiometricLoading(false);

      if (res.success && res.user) {
        showToast(`تم التحقق من البصمة بنجاح. أهلاً بك، ${res.user.fullName}`, 'success');
        onSuccess();
      } else {
        setError(res.error || 'فشل التحقق بالبصمة الحيوية.');
      }
    } catch (err: any) {
      setBiometricLoading(false);
      setError(err?.message || 'حدث خطأ أثناء الاتصال بمستشعر البصمة.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-cairo text-right relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <BrandLogo size="lg" variant="badge" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            روابط نشرك المفضلة
          </h1>
          <p className="text-xs text-slate-400">
            بوابة الدخول الآمنة إلى لوحة تحكم الهوية الرقمية
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">تسجيل الدخول إلى حسابك</h2>
            <p className="text-xs text-slate-400">
              أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور الخاصة بحسابك
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>اسم المستخدم أو البريد الإلكتروني</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="saleh أو saleh@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>كلمة المرور</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition font-mono dir-ltr text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>جاري التحقق من الحساب...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Biometric Login Button */}
          <div className="pt-4 border-t border-slate-700/60 space-y-3">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
              className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>
                {biometricLoading
                  ? 'جاري التحقق عبر مستشعر البصمة...'
                  : 'تسجيل الدخول بالبصمة الحيوية'}
              </span>
            </button>
          </div>
        </div>

        {/* Public profile quick link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onViewDemoPage('saleh')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <span>زيارة صفحة نموذجية عامة (/saleh)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
