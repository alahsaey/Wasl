import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  DollarSign,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Shield,
  BarChart2,
  Globe,
  Tag,
} from 'lucide-react';
import { SubscriptionPlan } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';

interface PlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onPlanSaved: (updatedPlan: SubscriptionPlan) => void;
}

export const PlanEditModal: React.FC<PlanEditModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanSaved,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<number>(0);
  const [currency, setCurrency] = useState('SAR');
  const [maxLinks, setMaxLinks] = useState<number>(999);
  const [isUnlimitedLinks, setIsUnlimitedLinks] = useState(true);
  const [hasAnalytics, setHasAnalytics] = useState(true);
  const [hasCustomDomain, setHasCustomDomain] = useState(false);
  const [removeBranding, setRemoveBranding] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setNameEn(plan.nameEn);
      setPriceMonthly(plan.priceMonthly);
      setCurrency(plan.currency || 'SAR');
      setMaxLinks(plan.maxLinks);
      setIsUnlimitedLinks(plan.maxLinks >= 999);
      setHasAnalytics(plan.hasAnalytics);
      setHasCustomDomain(plan.hasCustomDomain);
      setRemoveBranding(plan.removeBranding);
      setFeatures([...plan.features]);
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedPlan: SubscriptionPlan = {
        ...plan,
        name: name.trim() || plan.name,
        nameEn: nameEn.trim() || plan.nameEn,
        priceMonthly: Number(priceMonthly) || 0,
        currency: currency.trim() || 'SAR',
        maxLinks: isUnlimitedLinks ? 999 : Number(maxLinks) || 5,
        hasAnalytics,
        hasCustomDomain,
        removeBranding,
        features: features.filter((f) => f.trim().length > 0),
      };

      const allPlans = StorageService.getPlans();
      const planIdx = allPlans.findIndex((p) => p.id === plan.id);
      if (planIdx !== -1) {
        allPlans[planIdx] = updatedPlan;
        StorageService.savePlans(allPlans);
      }

      // Record Audit Log
      const currentUser = StorageService.getUsers().find((u) => u.role === 'super_admin');
      StorageService.addAuditLog({
        actorId: currentUser?.id || 'admin',
        actorName: currentUser?.fullName || 'مدير المنصة',
        actorRole: 'super_admin',
        action: 'تعديل أسعار وباقة',
        targetId: plan.id,
        targetName: updatedPlan.name,
        details: `تم تحديث سعر باقة (${updatedPlan.name}) إلى ${updatedPlan.priceMonthly} ${updatedPlan.currency}`,
        ip: '192.168.1.1',
      });

      showToast(`تم تحديث باقة "${updatedPlan.name}" والأسعار بنجاح!`, 'success');
      onPlanSaved(updatedPlan);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء حفظ الباقة', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto font-cairo">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                تعديل أسعار وبيانات الباقة
              </h3>
              <p className="text-xs text-slate-500">{plan.name} ({plan.nameEn})</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Price and Currency Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
              تسعير الباقة الشهري والعملة
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  السعر الشهري (أدخل 0 للباقة المجانية)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                    {currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  العملة المعروضة
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="SAR"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          {/* Plan Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اسم الباقة (عربي)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اسم الباقة (إنجليزي)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30 dir-ltr text-right"
              />
            </div>
          </div>

          {/* Links Limit */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                الحد الأقصى لعدد الروابط والعناصر
              </label>
              <label className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnlimitedLinks}
                  onChange={(e) => {
                    setIsUnlimitedLinks(e.target.checked);
                    if (e.target.checked) setMaxLinks(999);
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>روابط غير محدودة (∞)</span>
              </label>
            </div>

            {!isUnlimitedLinks && (
              <input
                type="number"
                min="1"
                max="500"
                value={maxLinks}
                onChange={(e) => setMaxLinks(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            )}
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              صلاحيات ومميزات الباقة
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">إحصائيات متقدمة</div>
                  <div className="text-[11px] text-slate-500">تمكين العضو من متابعة النقرات ومصدر الزوار</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasAnalytics}
                onChange={(e) => setHasAnalytics(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">إزالة شعار المنصة</div>
                  <div className="text-[11px] text-slate-500">إخفاء توقيع منصة نشرك في أسفل صفحة العضو</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={removeBranding}
                onChange={(e) => setRemoveBranding(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">دومين ونطاق مخصص</div>
                  <div className="text-[11px] text-slate-500">إمكانية ربط نطاق الشركة الخاص</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasCustomDomain}
                onChange={(e) => setHasCustomDomain(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Included Features Bullet Points */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              بنود المميزات المكتوبة في بطاقة الباقة
            </label>

            <div className="space-y-2">
              {features.map((feat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition shrink-0"
                    title="حذف البند"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add feature line */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="أضف ميزة جديدة (مثال: أولوية الدعم الفني 24/7)..."
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات والأسعار'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
