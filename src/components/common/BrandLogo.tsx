import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'clean' | 'badge' | 'glass';
  className?: string;
  showText?: boolean;
  subtitle?: string;
  customAvatar?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'badge',
  className = '',
  showText = false,
  subtitle,
  customAvatar,
}) => {
  const [adminAvatar, setAdminAvatar] = useState<string>(
    customAvatar || StorageService.getAdminAvatar()
  );

  useEffect(() => {
    if (customAvatar) {
      setAdminAvatar(customAvatar);
      return;
    }
    const update = () => {
      setAdminAvatar(StorageService.getAdminAvatar());
    };
    update();
    const unsub = StorageService.subscribeToStorage(update);
    return unsub;
  }, [customAvatar]);

  const sizeMap = {
    xs: { icon: 'w-6 h-6', box: 'w-7 h-7 rounded-lg', text: 'text-xs' },
    sm: { icon: 'w-7 h-7', box: 'w-8 h-8 rounded-xl', text: 'text-sm' },
    md: { icon: 'w-9 h-9', box: 'w-10 h-10 rounded-2xl', text: 'text-base' },
    lg: { icon: 'w-12 h-12', box: 'w-14 h-14 rounded-2xl', text: 'text-lg' },
    xl: { icon: 'w-16 h-16', box: 'w-20 h-20 rounded-3xl', text: 'text-2xl' },
  };

  const selectedSize = sizeMap[size];

  // Render the exact Admin Account Avatar cleanly without background box if variant="clean"
  const renderedIcon = (
    <div className={`${selectedSize.icon} overflow-hidden rounded-full flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-slate-700/40 shadow-xs`}>
      <img
        src={adminAvatar}
        alt="شعار المنصة - أيقونة المسؤول"
        className="w-full h-full object-cover select-none"
        crossOrigin="anonymous"
      />
    </div>
  );

  return (
    <div className={`inline-flex items-center gap-2.5 font-cairo ${className}`}>
      {variant === 'clean' ? (
        renderedIcon
      ) : variant === 'glass' ? (
        <div
          className={`${selectedSize.box} bg-white/10 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 flex items-center justify-center p-0.5 shadow-lg rounded-2xl`}
        >
          {renderedIcon}
        </div>
      ) : (
        <div
          className={`${selectedSize.box} bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center p-0.5 shadow-sm rounded-2xl`}
        >
          {renderedIcon}
        </div>
      )}

      {showText && (
        <div className="text-right">
          <span className={`font-extrabold tracking-tight block leading-tight ${selectedSize.text} text-slate-900 dark:text-slate-100`}>
            روابط نشرك
          </span>
          {subtitle && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
