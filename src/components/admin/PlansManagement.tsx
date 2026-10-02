import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Sparkles, Star, Pencil, DollarSign, RefreshCw } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { SubscriptionPlan } from '../../types';
import { PlanEditModal } from './PlanEditModal';

export const PlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(StorageService.getPlans());
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SubscriptionPlan | null>(null);

  const refreshPlans = () => {
    setPlans(StorageService.getPlans());
  };

  useEffect(() => {
    refreshPlans();
    const unsub = StorageService.subscribeToStorage(refreshPlans);
    return unsub;
  }, []);

  return (
    <div className="space-y-6 text-right font-cairo">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            إدارة الباقات والاشتراكات
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            تحكّم في أسعار الباقات الشهرية والسنوية، العملات، الحدود، والمميزات الممنوحة للأعضاء
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isBusiness = plan.id === 'business';
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition relative group ${
                isBusiness
                  ? 'bg-slate-900 text-white border-emerald-500/50 shadow-xl ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isBusiness
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isPro
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {plan.nameEn}
                    </span>
                    {isBusiness && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>الأكثر طلباً</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Edit Icon */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForEdit(plan)}
                    className={`p-1.5 rounded-xl border transition ${
                      isBusiness
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    title="تعديل السعر والمميزات"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-black tracking-tight">{plan.priceMonthly}</span>
                    <span className="text-xs font-bold opacity-75">{plan.currency || 'SAR'} / شهرياً</span>
                  </div>
                </div>

                {/* Limits */}
                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                    isBusiness ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="opacity-75">عدد الروابط:</span>
                    <span className="font-bold">{plan.maxLinks >= 999 ? 'غير محدود (∞)' : `${plan.maxLinks} روابط`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-75">القوالب المتاحة:</span>
                    <span className="font-bold">{plan.allowedThemes?.length || 8} قوالب</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-75">إحصائيات متقدمة:</span>
                    <span className={`font-bold ${plan.hasAnalytics ? 'text-emerald-500' : 'opacity-60'}`}>
                      {plan.hasAnalytics ? 'مفعلة' : 'غير متاحة'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-75">إزالة شعار المنصة:</span>
                    <span className={`font-bold ${plan.removeBranding ? 'text-emerald-500' : 'opacity-60'}`}>
                      {plan.removeBranding ? 'متاحة' : 'غير متاحة'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold opacity-80">المميزات المشمولة:</div>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForEdit(plan)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-sm ${
                    isBusiness
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>تعديل السعر والمميزات</span>
                </button>
                <div className="text-center text-[11px] opacity-60">
                  يتم تخصيص الباقة للعضو مباشرة من لوحة الإدارة
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Edit Modal */}
      <PlanEditModal
        isOpen={!!selectedPlanForEdit}
        onClose={() => setSelectedPlanForEdit(null)}
        plan={selectedPlanForEdit}
        onPlanSaved={() => refreshPlans()}
      />
    </div>
  );
};

