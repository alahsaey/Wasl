import React, { useState } from 'react';
import { Check, Shield, Zap, Sparkles, Star } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { SubscriptionPlan } from '../../types';

export const PlansManagement: React.FC = () => {
  const [plans] = useState<SubscriptionPlan[]>(StorageService.getPlans());

  return (
    <div className="space-y-6 text-right font-cairo">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          إدارة الباقات والاشتراكات
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          مخطط الاشتراكات والحدود الممنوحة للأعضاء (عدد الروابط، القوالب، وإزالة الشعار)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isBusiness = plan.id === 'business';
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition ${
                isBusiness
                  ? 'bg-slate-900 text-white border-emerald-500/50 shadow-xl ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isBusiness
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isPro
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
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

                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black">{plan.priceMonthly}</span>
                    <span className="text-xs opacity-75">{plan.currency} / شهرياً</span>
                  </div>
                </div>

                {/* Limits */}
                <div
                  className={`p-3 rounded-2xl text-xs space-y-1.5 ${
                    isBusiness ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="opacity-75">عدد الروابط:</span>
                    <span className="font-bold">{plan.maxLinks === 999 ? 'غير محدود' : plan.maxLinks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">القوالب المتاحة:</span>
                    <span className="font-bold">{plan.allowedThemes.length} قوالب</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">إحصائيات متقدمة:</span>
                    <span className="font-bold">{plan.hasAnalytics ? 'مفعلة' : 'غير متاحة'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">إزالة شعار المنصة:</span>
                    <span className="font-bold">{plan.removeBranding ? 'متاحة' : 'غير متاحة'}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold opacity-80">المميزات المشمولة:</div>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center text-xs opacity-60">
                يتم تخصيص الباقة للعضو مباشرة من لوحة الإدارة
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
