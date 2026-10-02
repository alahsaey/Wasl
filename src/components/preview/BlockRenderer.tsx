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
  isInteractive?: boolean; // If true (e.g. public page), clicks trigger real URLs and track analytics. If false (preview inside builder), clicking is safe or triggers edit.
  onBlockClick?: (block: Block) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  theme,
  isInteractive = true,
  onBlockClick,
}) => {
  if (!block.isActive) return null;

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
    const radius = theme.borderRadius || 'rounded-xl';

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
      <div className="w-full py-2">
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
      <div className="w-full pt-4 pb-1 text-center">
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
      <div className="w-full py-2 flex items-center justify-center">
        <div className="w-24 h-0.5 bg-current opacity-20 rounded-full" />
      </div>
    );
  }

  // Text Block
  if (block.type === 'text') {
    return (
      <div
        className={`w-full p-4 rounded-xl text-center text-sm leading-relaxed backdrop-blur-sm border ${
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
      <div className="w-full overflow-hidden rounded-2xl shadow-sm border border-black/5 bg-black/5">
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
        <div className="w-full rounded-2xl overflow-hidden shadow-sm aspect-video border border-black/10">
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

  // Default Standard Link / Button / Website
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
      return '#24A1DE';
    case 'linkedin':
      return '#0A66C2';
    case 'facebook':
      return '#1877F2';
    case 'threads':
      return '#000000';
    case 'pinterest':
      return '#E60023';
    case 'github':
      return '#24292e';
    case 'behance':
      return '#053eff';
    case 'discord':
      return '#5865F2';
    case 'twitch':
      return '#9146FF';
    case 'spotify':
      return '#1DB954';
    case 'podcast':
      return '#872EC4';
    case 'kwai':
      return '#FF5000';
    case 'website':
    default:
      return '#059669';
  }
};

// Complete High Quality Social Media Icons Suite
export const getSocialIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case 'x':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.029 0C5.393 0 0 5.393 0 12.029c0 6.637 5.393 12.03 12.029 12.03 6.637 0 12.03-5.393 12.03-12.03C24.059 5.393 18.666 0 12.029 0zm0 18.667c-1.393 0-2.457-.318-3.33-.87-.417-.263-.889-.356-1.365-.262-.316.062-.647.03-.935-.094-.288-.124-.52-.338-.65-.618-.128-.28-.15-.599-.06-.893.09-.294.283-.541.539-.693.308-.184.664-.287 1.026-.301 1.258-.052 1.838-.98 1.954-1.202.115-.221.054-.367-.015-.479-.069-.112-.224-.265-.583-.437-1.385-.662-2.147-1.89-2.147-3.454 0-2.733 2.457-4.952 5.599-4.952 3.143 0 5.6 2.219 5.6 4.952 0 1.565-.762 2.792-2.147 3.454-.359.172-.514.325-.583.437-.069.112-.13.258-.015.479.116.222.696 1.15 1.954 1.202.362.014.718.117 1.026.301.256.152.449.399.539.693.09.294.068.613-.06.893-.13.28-.362.494-.65.618-.288.124-.619.156-.935.094-.476-.094-.948-.001-1.365.262-.873.552-1.937.87-3.33.87z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.49 2.77 1.02-.03 2-.54 2.55-1.39.46-.72.63-1.6.61-2.45-.02-3.95-.01-7.9-.01-11.85z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case 'whatsapp':
      return <MessageCircle className="w-5 h-5" />;
    case 'telegram':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'threads':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.83 14.195c-.247 1.777-1.393 3.01-3.13 3.37-1.942.404-3.792-.375-4.838-2.025-.568-.895-.83-1.967-.83-3.21 0-1.242.262-2.315.83-3.21 1.046-1.65 2.896-2.43 4.838-2.025 1.58.328 2.678 1.402 3.045 2.942l-1.898.412c-.225-.945-.88-1.57-1.847-1.745-1.242-.225-2.42.27-3.067 1.282-.39.615-.578 1.388-.578 2.344 0 .956.188 1.728.578 2.344.647 1.013 1.825 1.508 3.067 1.283 1.072-.195 1.792-.892 1.957-1.9-.382.195-.818.293-1.305.293-1.418 0-2.385-.81-2.385-2.002 0-1.193.967-2.003 2.385-2.003 1.425 0 2.453.84 2.505 2.055.038.863-.075 1.71-.328 2.48z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.05-.98-.09-2.48.02-3.55.1-.96.64-5.46.64-5.46s-.16-.33-.16-.82c0-.77.45-1.34 1-1.34.48 0 .7.36.7.79 0 .48-.3 1.2-.46 1.87-.13.56.28 1.01.83 1.01 1 0 1.77-1.05 1.77-2.58 0-1.35-.97-2.3-2.36-2.3-1.6 0-2.55 1.2-2.55 2.45 0 .49.19 1 .42 1.28.05.06.05.11.04.17-.04.18-.14.58-.16.66-.03.11-.09.13-.2.08-.75-.35-1.22-1.44-1.22-2.32 0-1.89 1.37-3.62 3.96-3.62 2.08 0 3.69 1.48 3.69 3.46 0 2.07-1.3 3.73-3.11 3.73-.61 0-1.18-.32-1.37-.69l-.37 1.42c-.14.52-.5 1.18-.75 1.58A12 12 0 1 0 12 0z" />
        </svg>
      );
    case 'github':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case 'behance':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.992 3-3.577 0-5.592-2.317-5.592-5.917 0-3.498 2.05-5.917 5.485-5.917 3.385 0 5.163 2.378 5.163 5.75v1.084h-7.644c.065 1.705 1.262 2.684 2.766 2.684 1.139 0 2.099-.544 2.459-1.684h2.355zm-4.992-5.75c-1.328 0-2.373.864-2.556 2.334h5.053c-.073-1.428-1.077-2.334-2.497-2.334zm-14.734 6.75h-3.5v-13h4.636c2.518 0 4.12 1.353 4.12 3.327 0 1.282-.693 2.34-1.848 2.809 1.48.455 2.292 1.748 2.292 3.308 0 2.348-1.868 3.556-4.417 3.556l-1.283-.000zm.5-8.5h1.725c1.07 0 1.775-.537 1.775-1.458 0-.962-.756-1.458-1.847-1.458h-1.653v2.916zm0 5.416h1.942c1.238 0 2.058-.583 2.058-1.614 0-1.077-.852-1.652-2.138-1.652h-1.862v3.266z" />
        </svg>
      );
    case 'discord':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case 'twitch':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      );
    case 'spotify':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      );
    case 'podcast':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61l1.42-1.42A6.974 6.974 0 0 1 5 10c0-3.87 3.13-7 7-7s7 3.13 7 7c0 1.6-.54 3.07-1.39 4.19l1.42 1.42C20.26 14.07 21 12.12 21 10c0-4.97-4.03-9-9-9zm0 4c-2.76 0-5 2.24-5 5 0 1.3.5 2.49 1.32 3.38l1.42-1.42c-.46-.53-.74-1.21-.74-1.96 0-1.66 1.34-3 3-3s3 1.34 3 3c0 .75-.28 1.43-.74 1.96l1.42 1.42A4.963 4.963 0 0 0 17 10c0-2.76-2.24-5-5-5zm0 3c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2s2-.9 2-2v-5c0-1.1-.9-2-2-2zm-1 11.93c-3.95-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V23h-2v-3.07z" />
        </svg>
      );
    case 'kwai':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm3.5-5.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
        </svg>
      );
    case 'website':
    default:
      return <Globe className="w-5 h-5" />;
  }
};
