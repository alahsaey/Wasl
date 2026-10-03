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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-current shadow-sm group ${getSocialGlowShadow(soc.platform)}`}
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
          <div className={`w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 transition-all duration-300 ${getSocialGlowShadow('whatsapp')}`}>
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
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group relative overflow-hidden`}
          style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
        >
          <div className={`w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-300 ${getSocialGlowShadow('whatsapp')}`}>
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
          <div className={`w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${getSocialGlowShadow('whatsapp')}`}>
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
          <div className={`w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 transition-all duration-300 ${getSocialGlowShadow('email')}`}>
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
          className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group relative overflow-hidden`}
        >
          <div className={`w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-300 ${getSocialGlowShadow('email')}`}>
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
          <div className={`w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${getSocialGlowShadow('email')}`}>
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
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30 text-white transition-all duration-300 ${getSocialGlowShadow(detectedSocial)}`}
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
        className={`${getButtonClasses()} flex flex-col items-center justify-center text-center p-4 py-5 gap-2.5 h-full group relative overflow-hidden`}
        style={block.highlight ? { border: `2px solid ${theme.primaryColor}` } : undefined}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white transition-all duration-300 ${getSocialGlowShadow(detectedSocial)}`}
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
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white transition-all duration-300 ${getSocialGlowShadow(detectedSocial)}`}
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

// Social Icon Glow Shadow on Hover
export const getSocialGlowShadow = (platform?: string | null) => {
  switch (platform) {
    case 'whatsapp':
      return 'group-hover:shadow-[0_0_28px_rgba(37,211,102,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-[#25D366]/30';
    case 'snapchat':
      return 'group-hover:shadow-[0_0_28px_rgba(255,252,0,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-amber-300/40';
    case 'telegram':
      return 'group-hover:shadow-[0_0_28px_rgba(34,158,217,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-[#229ED9]/30';
    case 'tiktok':
      return 'group-hover:shadow-[0_0_28px_rgba(254,44,85,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-rose-500/30';
    case 'instagram':
      return 'group-hover:shadow-[0_0_28px_rgba(225,48,108,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-pink-500/30';
    case 'youtube':
      return 'group-hover:shadow-[0_0_28px_rgba(255,0,0,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-red-500/30';
    case 'x':
      return 'group-hover:shadow-[0_0_28px_rgba(255,255,255,0.75)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-white/30';
    case 'linkedin':
      return 'group-hover:shadow-[0_0_28px_rgba(10,102,194,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-[#0A66C2]/30';
    case 'facebook':
      return 'group-hover:shadow-[0_0_28px_rgba(24,119,242,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-[#1877F2]/30';
    case 'email':
      return 'group-hover:shadow-[0_0_28px_rgba(168,85,247,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-purple-500/30';
    case 'phone':
      return 'group-hover:shadow-[0_0_28px_rgba(37,99,235,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-blue-500/30';
    case 'contact_card':
      return 'group-hover:shadow-[0_0_28px_rgba(99,102,241,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-indigo-500/30';
    case 'pdf':
      return 'group-hover:shadow-[0_0_28px_rgba(244,63,94,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-rose-500/30';
    case 'location':
      return 'group-hover:shadow-[0_0_28px_rgba(239,68,68,0.85)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-red-500/30';
    default:
      return 'group-hover:shadow-[0_0_28px_rgba(16,185,129,0.7)] group-hover:scale-115 group-hover:-rotate-3 group-hover:ring-4 group-hover:ring-emerald-500/30';
  }
};

// Social Icons helper (Official high-fidelity brand SVGs)
export const getSocialIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm5.812 8.012c-.148 1.56-.75 5.38-1.12 7.33-.16.82-.47 1.1-.76 1.12-.63.06-1.11-.41-1.72-.81-.96-.63-1.5-1.02-2.43-1.63-1.08-.71-.38-1.1.24-1.74.16-.17 2.96-2.71 3.01-2.93.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.25-.02-.11.02-1.92 1.22-5.42 3.59-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.78-3.34 3.7-1.54 4.47-1.81 4.97-1.82.11 0 .35.03.51.16.13.11.17.26.19.37.01.07.03.26.01.41z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M12.001 2c-3.58 0-5.748 2.457-5.748 4.792 0 .914.364 2.164.887 2.932-.143.193-.482.686-.906.686-.178 0-.381-.07-.584-.191-.186-.112-.393-.191-.564-.191-.32 0-.584.223-.584.509 0 .524.773 1.293 1.83 1.62-.057.447-.193 1.137-.732 1.556-.372.289-.915.422-1.614.422-.266 0-.528-.024-.778-.073-.284-.055-.542.138-.588.423-.046.284.14.551.424.607.333.065.688.098 1.042.098 1.04 0 1.883-.244 2.507-.726.299.309.73.528 1.25.642.179 1.171.867 2.213 2.161 2.531.84.207 1.764.207 2.604 0 1.294-.318 1.982-1.36 2.161-2.531.52-.114.951-.333 1.25-.642.624.482 1.467.726 2.507.726.354 0 .709-.033 1.042-.098.284-.056.47-.323.424-.607-.046-.285-.304-.478-.588-.423-.25.049-.512.073-.778.073-.699 0-1.242-.133-1.614-.422-.539-.419-.675-1.109-.732-1.556 1.057-.327 1.83-1.096 1.83-1.62 0-.286-.264-.509-.584-.509-.171 0-.378.079-.564.191-.203.121-.406.191-.584.191-.424 0-.763-.493-.906-.686.523-.768.887-2.018.887-2.932C17.749 4.457 15.581 2 12.001 2z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 003 15.68 6.33 6.33 0 009.33 22a6.33 6.33 0 006.33-6.33V9.08a8.22 8.22 0 004.93 1.61V7.24a4.84 4.84 0 01-1-.55z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026l.032-.026z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case 'discord':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      );
    default:
      return <Globe className="w-5 h-5" />;
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
