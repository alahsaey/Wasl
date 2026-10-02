import React from 'react';
import { ExternalLink, Smartphone, Copy, Check, Sparkles } from 'lucide-react';
import { User, Block, UserThemeConfig } from '../../types';
import { PublicProfilePage } from './PublicProfilePage';
import { useToast } from '../common/Toast';

interface LivePhonePreviewProps {
  user: User;
  blocks: Block[];
  theme: UserThemeConfig;
  onOpenPublicView: () => void;
}

export const LivePhonePreview: React.FC<LivePhonePreviewProps> = ({
  user,
  blocks,
  theme,
  onOpenPublicView,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { showToast } = useToast();

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?u=${user.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('تم نسخ رابط صفحتك العامة!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center sticky top-6">
      {/* Top action bar */}
      <div className="w-full max-w-[340px] mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>المعاينة المباشرة</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 hover:text-emerald-600 transition"
            title="نسخ الرابط"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'منسوخ' : 'نسخ'}</span>
          </button>
          <span>·</span>
          <button
            onClick={onOpenPublicView}
            className="flex items-center gap-1 hover:text-emerald-600 font-medium transition"
            title="فتح الصفحة كاملة"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>عرض حي</span>
          </button>
        </div>
      </div>

      {/* Phone Shell */}
      <div className="relative w-[340px] h-[670px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 overflow-hidden flex flex-col">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full flex items-center justify-end px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 ring-1 ring-white/10" />
        </div>

        {/* Screen Bezel Area */}
        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[38px] overflow-y-auto overflow-x-hidden relative shadow-inner custom-scrollbar">
          <PublicProfilePage
            user={user}
            blocks={blocks}
            theme={theme}
            isPreview={true}
          />
        </div>

        {/* Home Indicator bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-32 h-1 bg-white/40 rounded-full" />
      </div>

      {/* Helper text */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>تتحدث المعاينة فورياً مع أي تعديل</span>
      </div>
    </div>
  );
};
