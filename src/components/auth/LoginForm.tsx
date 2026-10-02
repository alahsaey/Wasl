import React, { useState, useRef } from 'react';
import {
  LogIn,
  Lock,
  User as UserIcon,
  Fingerprint,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Upload,
  Copy,
  Check,
  X,
  FileJson,
} from 'lucide-react';
import { AuthService } from '../../services/auth';
import { BiometricService } from '../../services/biometrics';
import { StorageService } from '../../services/storage';
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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFillCredentials = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setCopiedAccount(user);
    showToast(`تم تعبئة بيانات حساب @${user}`, 'info');
    setShowHelpModal(false);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = StorageService.importAllData(content);
      if (success) {
        showToast('تم استيراد كافة بيانات الحسابات بنجاح!', 'success');
        setShowHelpModal(false);
      } else {
        showToast('الملف غير صالح أو التنسيق غير متطابق', 'error');
      }
    };
    reader.readAsText(file);
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
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">تسجيل الدخول إلى حسابك</h2>
              <p className="text-xs text-slate-400">
                أدخل اسم المستخدم أو البريد الإلكتروني وكلمة المرور الخاصة بحسابك
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-slate-400 hover:text-emerald-400 transition p-1"
              title="مساعدة في بيانات الحسابات الأولية"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
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

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>هل تواجه صعوبة في الدخول؟</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                دليل الحسابات وكلمات المرور
              </button>
            </div>
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-cairo">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-right space-y-4 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400">
              <HelpCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">دليل بيانات الدخول ونقل المنصة</h3>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-xs text-emerald-300 leading-relaxed">
              💡 <strong>ملاحظة هامة لنشر الموقع على GitHub:</strong><br />
              بيانات الدخول مخزنة محلياً في ذاكرة متصفحك. عند فتح الموقع لأول مرة على نطاق GitHub الجديد، تتوفر الحسابات الافتراضية التالية، أو يمكنك استيراد بياناتك السابقة.
            </div>

            {/* Default Accounts List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 block">
                الحسابات الافتراضية المتوفرة (اضغط لتعبئة البيانات فوراً):
              </span>

              {/* 1. Saleh */}
              <button
                type="button"
                onClick={() => handleFillCredentials('saleh', 'saleh123')}
                className="w-full p-3 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-emerald-500 flex items-center justify-between text-right transition group"
              >
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                    صالح الياسين (عضوية متكاملة)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    المستخدم: <strong className="text-white">saleh</strong> | كلمة المرور: <strong className="text-emerald-400">saleh123</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  استخدام
                </span>
              </button>

              {/* 2. Admin */}
              <button
                type="button"
                onClick={() => handleFillCredentials('admin', 'admin123')}
                className="w-full p-3 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-purple-500 flex items-center justify-between text-right transition group"
              >
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-purple-400">
                    مدير النظام الرئيسي (لوحة الإدارة العليا)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    المستخدم: <strong className="text-white">admin</strong> | كلمة المرور: <strong className="text-purple-400">admin123</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg">
                  استخدام
                </span>
              </button>

              {/* 3. Noura */}
              <button
                type="button"
                onClick={() => handleFillCredentials('noura', 'noura123')}
                className="w-full p-3 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-emerald-500 flex items-center justify-between text-right transition group"
              >
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-emerald-400">
                    نورة القحطاني (عضوية مصممة)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    المستخدم: <strong className="text-white">noura</strong> | كلمة المرور: <strong className="text-emerald-400">noura123</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-white px-2 py-1">
                  استخدام
                </span>
              </button>
            </div>

            {/* Import Backup File */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 block">
                هل لديك ملف نسخ احتياطي من منصة أخرى؟
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJson}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>استيراد ملف البيانات (Backup JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
