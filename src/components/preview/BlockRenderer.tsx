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
        className={`${getButtonClasses()} flex items-center justify-between p-3.5 group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // WhatsApp Block (Requirement 7)
  if (block.type === 'whatsapp') {
    const waUrl = StorageService.formatWhatsAppUrl(block.phone || '', block.message);
    return (
      <a
        href={isInteractive ? waUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, waUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group relative overflow-hidden`}
        style={block.highlight ? { border: `2px solid #22c55e` } : undefined}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-5 h-5" />
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
        <div className="flex items-center gap-1 text-emerald-600 shrink-0 font-medium text-xs">
          <span>محادثة</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    );
  }

  // PDF Download Block
  if (block.type === 'pdf') {
    return (
      <a
        href={isInteractive ? block.fileUrl : undefined}
        target="_blank"
        download={block.fileName || 'document.pdf'}
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, block.fileUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0 text-xs font-medium">
          <Download className="w-4 h-4" />
        </div>
      </a>
    );
  }

  // Location Block
  if (block.type === 'location') {
    const mapsUrl =
      block.url ||
      `https://maps.google.com/?q=${encodeURIComponent(block.locationAddress || block.title)}`;
    return (
      <a
        href={isInteractive ? mapsUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => handleClick(e, mapsUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            {block.locationAddress && (
              <span className="text-xs opacity-75 block mt-0.5">{block.locationAddress}</span>
            )}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // Contact Card vCard Block
  if (block.type === 'contact_card') {
    const handleVCard = (e: React.MouseEvent) => {
      handleClick(e, 'vcard');
      if (!isInteractive) return;

      const vcardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${block.title}\nTEL:${block.phone || ''}\nEMAIL:${
        block.email || ''
      }\nEND:VCARD`;
      const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${block.title}.vcf`;
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <button
        onClick={handleVCard}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group text-right`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            <span className="text-xs opacity-75 block mt-0.5">
              {block.subtitle || 'حفظ جهة الاتصال مباشرة في هاتفك'}
            </span>
          </div>
        </div>
        <Download className="w-4 h-4 opacity-60 group-hover:opacity-100 transition shrink-0" />
      </button>
    );
  }

  // Phone Block
  if (block.type === 'phone') {
    const telUrl = `tel:${block.phone || block.title}`;
    return (
      <a
        href={isInteractive ? telUrl : undefined}
        onClick={(e) => handleClick(e, telUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Phone className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
          </div>
        </div>
        <Phone className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

  // Email Block
  if (block.type === 'email') {
    const mailtoUrl = `mailto:${block.email || block.title}`;
    return (
      <a
        href={isInteractive ? mailtoUrl : undefined}
        onClick={(e) => handleClick(e, mailtoUrl)}
        className={`${getButtonClasses()} flex items-center justify-between p-4 group`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="font-bold text-sm block leading-snug">{block.title}</span>
            {block.subtitle && <span className="text-xs opacity-75 block mt-0.5">{block.subtitle}</span>}
          </div>
        </div>
        <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
      </a>
    );
  }

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
          style={{ backgroundColor: theme.primaryColor }}
        >
          {block.type === 'website' ? <Globe className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
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

// Social Icon helper
export const getSocialIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case 'x':
      return <span className="font-bold text-sm">𝕏</span>;
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
    case 'snapchat':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.029 0C5.393 0 0 5.393 0 12.029c0 6.637 5.393 12.03 12.029 12.03 6.637 0 12.03-5.393 12.03-12.03C24.059 5.393 18.666 0 12.029 0zm0 18.667c-1.393 0-2.457-.318-3.33-.87-.417-.263-.889-.356-1.365-.262-.316.062-.647.03-.935-.094-.288-.124-.52-.338-.65-.618-.128-.28-.15-.599-.06-.893.09-.294.283-.541.539-.693.308-.184.664-.287 1.026-.301 1.258-.052 1.838-.98 1.954-1.202.115-.221.054-.367-.015-.479-.069-.112-.224-.265-.583-.437-1.385-.662-2.147-1.89-2.147-3.454 0-2.733 2.457-4.952 5.599-4.952 3.143 0 5.6 2.219 5.6 4.952 0 1.565-.762 2.792-2.147 3.454-.359.172-.514.325-.583.437-.069.112-.13.258-.015.479.116.222.696 1.15 1.954 1.202.362.014.718.117 1.026.301.256.152.449.399.539.693.09.294.068.613-.06.893-.13.28-.362.494-.65.618-.288.124-.619.156-.935.094-.476-.094-.948-.001-1.365.262-.873.552-1.937.87-3.33.87z" />
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
    default:
      return <Globe className="w-5 h-5" />;
  }
};
