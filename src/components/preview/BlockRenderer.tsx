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

  const gridMode = isGridMode !== undefined ? isGridMode : (theme.layoutMode || 'grid') === 'grid';

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

  // Compute button styling based on theme
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

    if (gridMode) {
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
    if (gridMode) {
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
    if (gridMode) {
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

    if (gridMode) {
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

    if (gridMode) {
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

    if (gridMode) {
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

    if (gridMode) {
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

  if (gridMode) {
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

  // Default Standard Link / Button / Website (List Mode)
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
