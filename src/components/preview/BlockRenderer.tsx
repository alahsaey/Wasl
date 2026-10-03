import React from 'react';
import {
  Link as LinkIcon,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  FileText,
  MapPin,
  UserCheck,
  ExternalLink,
  Download,
  Play,
  Share2,
  Clock,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Block, UserThemeConfig, SocialPlatform } from '../../types';
import { StorageService } from '../../services/storage';

interface BlockRendererProps {
  block: Block;
  theme: UserThemeConfig;
  isInteractive?: boolean;
  isGridMode?: boolean;
  onBlockClick?: (block: Block) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  theme,
  isInteractive = true,
  isGridMode,
  onBlockClick,
}) => {
  if (!block.isActive) return null;

  const currentLayout = theme.layoutMode || 'innovative';

  const handleClick = (e: React.MouseEvent, url?: string) => {
    if (onBlockClick) {
      onBlockClick(block);
    }

    if (!isInteractive) {
      e.preventDefault();
      return;
    }

    if (url) {
      // Record analytics
      StorageService.recordEvent({
        userId: block.userId,
        type: 'link_click',
        blockId: block.id,
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
        referrer: document.referrer || 'Direct',
      });
    }
  };

  // Compute button styling for classic/innovative layouts
  const getButtonClasses = () => {
    const radius = theme.borderRadius || 'rounded-2xl';

    let shadowClass = '';
    if (theme.buttonShadow === 'subtle') shadowClass = 'shadow-sm';
    else if (theme.buttonShadow === 'elevated') shadowClass = 'shadow-lg hover:shadow-xl';
    else if (theme.buttonShadow === 'glow') shadowClass = 'shadow-md shadow-emerald-500/20';

    let styleClass = '';
    if (theme.buttonStyle === 'solid') {
      styleClass = 'bg-white/95 text-slate-900 hover:bg-white border border-transparent shadow-sm';
    } else if (theme.buttonStyle === 'outline') {
      styleClass = 'bg-transparent border border-current hover:bg-white/10';
    } else if (theme.buttonStyle === 'soft') {
      styleClass = 'bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-white text-slate-900';
    } else if (theme.buttonStyle === 'glass') {
      styleClass = 'bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 text-white';
    } else {
      styleClass = 'bg-white text-slate-900 border border-slate-200';
    }

    return `w-full transition-all duration-200 transform active:scale-[0.98] ${radius} ${shadowClass} ${styleClass}`;
  };

  // Social Links block
  if (block.type === 'social_links' && block.socials && block.socials.length > 0) {
    return (
      <div className="w-full py-2 col-span-2">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {block.socials
            .filter((s) => s.isActive)
            .map((soc) => (
              <a
                key={soc.id}
                href={isInteractive ? soc.formattedUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleClick(e, soc.formattedUrl)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-current shadow-sm"
                title={soc.platform}
              >
                {getSocialIcon(soc.platform)}
              </a>
            ))}
        </div>
      </div>
    );
  }

  // Countdown Block
  if (block.type === 'countdown') {
    const target = block.targetDate ? new Date(block.targetDate).getTime() : Date.now() + 86400000 * 3;
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return (
      <div className="w-full col-span-2 p-4 rounded-3xl bg-slate-900/85 text-white border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-2.5 text-center my-1">
        <div className="flex items-center justify-center gap-2 text-emerald-400">
          <Clock className="w-4 h-4 animate-spin" />
          <span className="font-extrabold text-xs uppercase tracking-wider">{block.title || 'عدّاد تنازلي للحدث'}</span>
        </div>
        {block.subtitle && <p className="text-xs text-slate-300">{block.subtitle}</p>}
        <div className="grid grid-cols-4 gap-2 pt-1 font-mono">
          <div className="p-2 bg-white/10 rounded-2xl border border-white/10">
            <span className="block text-base font-black text-emerald-400">{days}</span>
            <span className="text-[10px] opacity-75">يوم</span>
          </div>
          <div className="p-2 bg-white/10 rounded-2xl border border-white/10">
            <span className="block text-base font-black text-emerald-400">{hours}</span>
            <span className="text-[10px] opacity-75">ساعة</span>
          </div>
          <div className="p-2 bg-white/10 rounded-2xl border border-white/10">
            <span className="block text-base font-black text-emerald-400">{minutes}</span>
            <span className="text-[10px] opacity-75">دقيقة</span>
          </div>
          <div className="p-2 bg-white/10 rounded-2xl border border-white/10">
            <span className="block text-base font-black text-emerald-400">{seconds}</span>
            <span className="text-[10px] opacity-75">ثانية</span>
          </div>
        </div>
      </div>
    );
  }

  // Contact Form Block
  if (block.type === 'contact_form') {
    return <ContactFormWidget block={block} isInteractive={isInteractive} handleClick={handleClick} />;
  }

  // Heading Block
  if (block.type === 'heading') {
    return (
      <div className="w-full pt-4 pb-1 text-center col-span-2">
        <h3 className="font-bold text-lg tracking-tight" style={{ color: theme.textColor }}>
          {block.title}
        </h3>
        {block.subtitle && (
          <p className="text-xs opacity-75 mt-0.5" style={{ color: theme.textColor }}>
            {block.subtitle}
          </p>
        )}
      </div>
    );
  }

  // Divider Block
  if (block.type === 'divider') {
    return (
      <div className="w-full py-2 flex items-center justify-center col-span-2">
        <div className="w-24 h-0.5 bg-current opacity-20 rounded-full" />
      </div>
    );
  }

  // Text Block
  if (block.type === 'text') {
    return (
      <div
        className={`w-full p-4 rounded-xl text-center text-sm leading-relaxed backdrop-blur-sm border col-span-2 ${
          theme.buttonStyle === 'glass' ? 'bg-white/10 border-white/15' : 'bg-white/70 border-slate-200/50'
        }`}
      >
        <p className="font-medium whitespace-pre-line">{block.content || block.title}</p>
      </div>
    );
  }

  // Image Block
  if (block.type === 'image' && block.imageUrl) {
    return (
      <div className="w-full overflow-hidden rounded-2xl shadow-sm border border-black/5 bg-black/5 col-span-2">
        <img
          src={block.imageUrl}
          alt={block.title || 'صورة'}
          className="w-full h-48 object-cover transition-transform hover:scale-105 duration-300"
          loading="lazy"
        />
        {block.title && (
          <div className="p-2.5 text-center text-xs font-medium backdrop-blur-sm bg-white/80 text-slate-800">
            {block.title}
          </div>
        )}
      </div>
    );
  }

  // Video Block
  if (block.type === 'video') {
    const isEmbeddable = block.videoUrl?.includes('youtube.com') || block.videoUrl?.includes('youtu.be');
    let embedSrc = block.videoUrl || '';
    if (block.videoUrl?.includes('youtu.be/')) {
      const vidId = block.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      embedSrc = `https://www.youtube-nocookie.com/embed/${vidId}`;
    } else if (block.videoUrl?.includes('watch?v=')) {
      const vidId = block.videoUrl.split('watch?v=')[1]?.split('&')[0];
      embedSrc = `https://www.youtube-nocookie.com/embed/${vidId}`;
    }

    if (isEmbeddable && embedSrc.includes('/embed/')) {
      return (
        <div className="w-full rounded-2xl overflow-hidden shadow-sm aspect-video border border-black/10 col-span-2">
          <iframe
            src={embedSrc}
            title={block.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (currentLayout === 'modern') {
      return (
        <a
          href={isInteractive ? block.videoUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, block.videoUrl)}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group text-current"
        >
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
        </a>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <a
          href={isInteractive ? block.videoUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, block.videoUrl)}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group`}
        >
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <Play className="w-6 h-6 fill-current" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          </div>
        </a>
      );
    }

    // Classic
    return (
      <a
        href={isInteractive ? block.videoUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, block.videoUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block">{block.title}</span>
            <span className="text-xs opacity-75 block">{block.subtitle || 'مشاهدة الفيديو'}</span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // PDF Document Block
  if (block.type === 'pdf') {
    if (currentLayout === 'modern') {
      return (
        <a
          href={isInteractive ? block.url : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, block.url)}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group text-current"
        >
          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
        </a>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <a
          href={isInteractive ? block.url : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, block.url)}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group`}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          </div>
        </a>
      );
    }

    // Classic
    return (
      <a
        href={isInteractive ? block.url : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, block.url)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block">{block.title}</span>
            <span className="text-xs opacity-75 block">{block.subtitle || 'تحميل وقراءة ملف PDF'}</span>
          </div>
        </div>
        <Download className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // Location / Google Maps Block
  if (block.type === 'location') {
    if (currentLayout === 'modern') {
      return (
        <a
          href={isInteractive ? block.url || (block.locationAddress ? `https://maps.google.com/?q=${encodeURIComponent(block.locationAddress)}` : '#') : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, block.url || block.locationAddress)}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group text-current"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
        </a>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <a
          href={isInteractive ? block.url || (block.locationAddress ? `https://maps.google.com/?q=${encodeURIComponent(block.locationAddress)}` : '#') : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, block.url || block.locationAddress)}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          </div>
        </a>
      );
    }

    // Classic
    return (
      <a
        href={isInteractive ? block.url || (block.locationAddress ? `https://maps.google.com/?q=${encodeURIComponent(block.locationAddress)}` : '#') : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, block.url || block.locationAddress)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block">{block.title}</span>
            <span className="text-xs opacity-75 block">{block.locationAddress || block.subtitle || 'عرض على خرائط Google'}</span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // Contact Card (vCard)
  if (block.type === 'contact_card') {
    const handleDownloadVCard = (e: React.MouseEvent) => {
      handleClick(e, 'vcard');
      if (!isInteractive) return;

      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${block.title}`,
        block.phone ? `TEL;TYPE=CELL:${block.phone}` : '',
        block.email ? `EMAIL:${block.email}` : '',
        block.url ? `URL:${block.url}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${block.title.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if (currentLayout === 'modern') {
      return (
        <button
          type="button"
          onClick={handleDownloadVCard}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group text-current"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
        </button>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <button
          type="button"
          onClick={handleDownloadVCard}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          </div>
        </button>
      );
    }

    // Classic
    return (
      <button
        type="button"
        onClick={handleDownloadVCard}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block">{block.title}</span>
            <span className="text-xs opacity-75 block">{block.subtitle || 'حفظ جهة الاتصال في هاتفك (vCard)'}</span>
          </div>
        </div>
        <Download className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </button>
    );
  }

  // WhatsApp Block
  if (block.type === 'whatsapp') {
    const cleanPhone = (block.phone || '').replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(block.message || 'السلام عليكم، تواصلت معك عبر صفحتك الرقمية.');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

    if (currentLayout === 'modern') {
      return (
        <a
          href={isInteractive ? whatsappUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, whatsappUrl)}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group relative text-current"
          style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
        >
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
          {block.badge && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
              {block.badge}
            </span>
          )}
        </a>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <a
          href={isInteractive ? whatsappUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, whatsappUrl)}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group relative`}
          style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <MessageCircle className="w-6 h-6 fill-current" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
            {block.badge && (
              <span className="mt-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {block.badge}
              </span>
            )}
          </div>
        </a>
      );
    }

    // Classic
    return (
      <a
        href={isInteractive ? whatsappUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, whatsappUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group relative`}
        style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm block leading-snug">{block.title}</span>
              {block.badge && (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {block.badge}
                </span>
              )}
            </div>
            {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 opacity-80 group-hover:opacity-100 transition shrink-0">
          <span>محادثة</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    );
  }

  // Phone Call Block
  if (block.type === 'phone') {
    const phoneUrl = `tel:${block.phone || ''}`;

    if (currentLayout === 'modern') {
      return (
        <a
          href={isInteractive ? phoneUrl : undefined}
          onClick={(e) => handleClick(e, phoneUrl)}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group text-current"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <Phone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
        </a>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <a
          href={isInteractive ? phoneUrl : undefined}
          onClick={(e) => handleClick(e, phoneUrl)}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <Phone className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          </div>
        </a>
      );
    }

    // Classic
    return (
      <a
        href={isInteractive ? phoneUrl : undefined}
        onClick={(e) => handleClick(e, phoneUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Phone className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block">{block.title}</span>
            <span className="text-xs opacity-75 block font-mono dir-ltr text-right">{block.phone || block.subtitle}</span>
          </div>
        </div>
        <Phone className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // Email Block
  if (block.type === 'email') {
    const mailtoUrl = `mailto:${block.email || ''}`;

    if (currentLayout === 'modern') {
      return (
        <a
          href={isInteractive ? mailtoUrl : undefined}
          onClick={(e) => handleClick(e, mailtoUrl)}
          className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group text-current"
        >
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 group-hover:scale-110 transition duration-300">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
          </div>
        </a>
      );
    }

    if (currentLayout === 'innovative') {
      return (
        <a
          href={isInteractive ? mailtoUrl : undefined}
          onClick={(e) => handleClick(e, mailtoUrl)}
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group`}
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-300">
            <Mail className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          </div>
        </a>
      );
    }

    // Classic
    return (
      <a
        href={isInteractive ? mailtoUrl : undefined}
        onClick={(e) => handleClick(e, mailtoUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block">{block.title}</span>
            {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
          </div>
        </div>
        <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // Auto-detect social platform for standard direct links
  const detectedSocial = StorageService.detectSocialPlatform(block.title, block.url || '');

  if (currentLayout === 'modern') {
    return (
      <a
        href={isInteractive ? block.url || '#' : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, block.url)}
        className="w-full rounded-full py-3 px-3.5 flex items-center gap-2.5 bg-gradient-to-r from-white/30 via-white/15 to-white/5 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-emerald-400 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group relative text-current"
        style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 text-white group-hover:scale-110 transition duration-300"
          style={{ backgroundColor: detectedSocial ? getSocialColor(detectedSocial) : theme.primaryColor }}
        >
          {detectedSocial ? (
            getSocialIcon(detectedSocial)
          ) : block.type === 'website' ? (
            <Globe className="w-5 h-5" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <span className="font-extrabold text-xs sm:text-sm block truncate">{block.title}</span>
        </div>
        {block.badge && (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
            {block.badge}
          </span>
        )}
      </a>
    );
  }

  if (currentLayout === 'innovative') {
    return (
      <a
        href={isInteractive ? block.url || '#' : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, block.url)}
        className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group relative`}
        style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white group-hover:scale-110 transition duration-300"
          style={{ backgroundColor: detectedSocial ? getSocialColor(detectedSocial) : theme.primaryColor }}
        >
          {detectedSocial ? (
            getSocialIcon(detectedSocial)
          ) : block.type === 'website' ? (
            <Globe className="w-6 h-6" />
          ) : (
            <LinkIcon className="w-6 h-6" />
          )}
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="font-bold text-xs sm:text-sm block leading-snug">{block.title}</span>
          {block.badge && (
            <span className="mt-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              {block.badge}
            </span>
          )}
        </div>
      </a>
    );
  }

  // Default Standard Link / Button / Website (Classic)
  return (
    <a
      href={isInteractive ? block.url || '#' : undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => handleClick(e, block.url)}
      className={`${getButtonClasses()} flex items-center justify-between p-4 group relative`}
      style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white"
          style={{ backgroundColor: detectedSocial ? getSocialColor(detectedSocial) : theme.primaryColor }}
        >
          {detectedSocial ? (
            getSocialIcon(detectedSocial)
          ) : block.type === 'website' ? (
            <Globe className="w-5 h-5" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            {block.badge && (
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {block.badge}
              </span>
            )}
          </div>
          {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition shrink-0" />
    </a>
  );
};

// Social Brand Colors helper
export const getSocialColor = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'x':
      return '#000000';
    case 'snapchat':
      return '#FFFC00';
    case 'instagram':
      return '#E1306C';
    case 'tiktok':
      return '#000000';
    case 'youtube':
      return '#FF0000';
    case 'whatsapp':
      return '#25D366';
    case 'telegram':
      return '#229ED9';
    case 'linkedin':
      return '#0A66C2';
    case 'facebook':
      return '#1877F2';
    case 'threads':
      return '#000000';
    case 'pinterest':
      return '#BD081C';
    case 'github':
      return '#24292e';
    case 'behance':
      return '#1769FF';
    case 'discord':
      return '#5865F2';
    case 'twitch':
      return '#9146FF';
    case 'spotify':
      return '#1DB954';
    case 'podcast':
      return '#8925AC';
    case 'kwai':
      return '#FF5000';
    default:
      return '#10b981';
  }
};

// Social Icons helper
export const getSocialIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case 'whatsapp':
      return <MessageCircle className="w-5 h-5 fill-current" />;
    case 'x':
      return <span className="font-extrabold text-sm font-sans">𝕏</span>;
    case 'instagram':
    case 'tiktok':
    case 'snapchat':
    case 'youtube':
    case 'telegram':
    case 'linkedin':
    case 'facebook':
    case 'threads':
    case 'pinterest':
    case 'github':
    case 'behance':
    case 'discord':
    case 'twitch':
    case 'spotify':
    case 'podcast':
    case 'kwai':
      return <Globe className="w-5 h-5" />;
    default:
      return <LinkIcon className="w-5 h-5" />;
  }
};

// Contact Form Widget Subcomponent
const ContactFormWidget: React.FC<{
  block: Block;
  isInteractive: boolean;
  handleClick: (e: React.MouseEvent, url?: string) => void;
}> = ({ block, isInteractive, handleClick }) => {
  const [name, setName] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleClick(e as any, 'contact_message');
    if (!msg.trim()) return;

    StorageService.addAuditLog({
      actorId: 'visitor',
      actorName: name || 'زائر الصفحة',
      actorRole: 'member',
      action: 'إرسال رسالة مباشرة',
      targetId: block.userId,
      targetName: block.title,
      details: `رسالة من (${name || 'زائر'}): ${msg}`,
      ip: '127.0.0.1',
    });

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMsg('');
      setName('');
    }, 4000);
  };

  return (
    <div className="w-full col-span-2 p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-lg space-y-3 text-right my-1">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{block.title || 'أرسل لي رسالة مباشرة'}</h4>
      </div>
      {block.subtitle && <p className="text-xs text-slate-500">{block.subtitle}</p>}

      {sent ? (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold text-center border border-emerald-200">
          ✨ تم إرسال رسالتك بنجاح! شكرًا لتواصلك.
        </div>
      ) : (
        <form onSubmit={handleSubmitMessage} className="space-y-2.5">
          <input
            type="text"
            placeholder="اسمك أو بريدك الإلكتروني (اختياري)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
          />
          <textarea
            rows={2}
            required
            placeholder="اكتب رسالتك أو استفسارك هنا..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none resize-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال الرسالة السريعة</span>
          </button>
        </form>
      )}
    </div>
  );
};
