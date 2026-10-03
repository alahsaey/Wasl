import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  MessageCircle,
  Share2,
  FileText,
  MapPin,
  UserCheck,
  Video,
  Image as ImageIcon,
  Type,
  Phone,
  Mail,
  Minus,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Block, BlockType, SocialPlatform, SocialAccount } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/ConfirmDialog';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { useToast } from '../common/Toast';
import { getSocialIcon, getSocialColor } from '../preview/BlockRenderer';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialBlock?: Block | null;
  initialType?: BlockType;
  onSave: (block: Block) => void;
}

const SOCIAL_PLATFORMS: { id: SocialPlatform; name: string; defaultPlaceholder: string }[] = [
  { id: 'snapchat', name: 'سناب شات (Snapchat)', defaultPlaceholder: 'اسم المستخدم في سناب' },
  { id: 'instagram', name: 'انستقرام (Instagram)', defaultPlaceholder: 'اسم المستخدم في انستقرام' },
  { id: 'tiktok', name: 'تيك توك (TikTok)', defaultPlaceholder: 'اسم المستخدم في تيك توك' },
  { id: 'x', name: 'منصة X (تويتر)', defaultPlaceholder: 'اسم المستخدم في X' },
  { id: 'whatsapp', name: 'واتساب (WhatsApp)', defaultPlaceholder: 'رقم الهاتف مع مفتاح الدولة' },
  { id: 'telegram', name: 'تيليجرام (Telegram)', defaultPlaceholder: 'اسم المستخدم في تيليجرام' },
  { id: 'youtube', name: 'يوتيوب (YouTube)', defaultPlaceholder: 'اسم القناة أو رابطها' },
  { id: 'linkedin', name: 'لينكد إن (LinkedIn)', defaultPlaceholder: 'اسم المعرف في لينكد إن' },
  { id: 'facebook', name: 'فيسبوك (Facebook)', defaultPlaceholder: 'اسم الحساب أو الرابط' },
  { id: 'threads', name: 'ثريدز (Threads)', defaultPlaceholder: 'اسم المستخدم في ثريدز' },
  { id: 'pinterest', name: 'بنترست (Pinterest)', defaultPlaceholder: 'اسم المستخدم في بنترست' },
  { id: 'behance', name: 'بيهانس (Behance)', defaultPlaceholder: 'اسم المستخدم في بيهانس' },
  { id: 'github', name: 'جيت هاب (GitHub)', defaultPlaceholder: 'اسم المستخدم في GitHub' },
  { id: 'discord', name: 'ديسكورد (Discord)', defaultPlaceholder: 'رابط الخادم أو الدعوة' },
  { id: 'twitch', name: 'تويتش (Twitch)', defaultPlaceholder: 'اسم القناة في تويتش' },
  { id: 'spotify', name: 'سبوتيفاي (Spotify)', defaultPlaceholder: 'رابط الملف أو قائمة التشغيل' },
  { id: 'podcast', name: 'بودكاست (Podcast)', defaultPlaceholder: 'رابط البودكاست' },
  { id: 'kwai', name: 'كواي (Kwai)', defaultPlaceholder: 'اسم المستخدم في كواي' },
  { id: 'website', name: 'موقع إلكتروني (Website)', defaultPlaceholder: 'https://example.com' },
];

export const BlockEditorModal: React.FC<BlockEditorModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialBlock,
  initialType = 'link',
  onSave,
}) => {
  const { showToast } = useToast();
  const [type, setType] = useState<BlockType>(initialType);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [badge, setBadge] = useState('');
  const [socials, setSocials] = useState<SocialAccount[]>([]);

  useEffect(() => {
    if (initialBlock) {
      setType(initialBlock.type);
      setTitle(initialBlock.title || '');
      setSubtitle(initialBlock.subtitle || '');
      setUrl(initialBlock.url || '');
      setPhone(initialBlock.phone || '');
      setEmail(initialBlock.email || '');
      setMessage(initialBlock.message || '');
      setContent(initialBlock.content || '');
      setImageUrl(initialBlock.imageUrl || '');
      setVideoUrl(initialBlock.videoUrl || '');
      setLocationAddress(initialBlock.locationAddress || '');
      setTargetDate(initialBlock.targetDate || '');
      setHighlight(initialBlock.highlight || false);
      setBadge(initialBlock.badge || '');
      setSocials(initialBlock.socials || []);
    } else {
      setType(initialType);
      setTitle('');
      setSubtitle('');
      setUrl('');
      setPhone('');
      setEmail('');
      setMessage('');
      setContent('');
      setImageUrl('');
      setVideoUrl('');
      setLocationAddress('');
      setTargetDate('');
      setHighlight(false);
      setBadge('');
      setSocials([]);

      // Set defaults for convenient block types
      if (initialType === 'whatsapp') {
        setTitle('تواصل عبر واتساب');
        setMessage('السلام عليكم، وصلت إليكم عن طريق صفحتكم وأرغب في الاستفسار.');
      } else if (initialType === 'countdown') {
        setTitle('العد التنازلي لإطلاق الفعالية/المنتج');
        setSubtitle('سارع بالتسجيل والاستفادة قبل انتهاء الوقت!');
        // Default target date: 3 days in future
        const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16);
        setTargetDate(inThreeDays);
      } else if (initialType === 'contact_form') {
        setTitle('أرسل لي رسالة مباشرة');
        setSubtitle('يسعدني استقبال رسائلك واستفساراتك في أي وقت');
      } else if (initialType === 'social_links') {
        setTitle('حسابات التواصل الاجتماعي');
        setSocials([
          { id: '1', platform: 'snapchat', usernameOrUrl: '', formattedUrl: '', isActive: true },
          { id: '2', platform: 'instagram', usernameOrUrl: '', formattedUrl: '', isActive: true },
          { id: '3', platform: 'tiktok', usernameOrUrl: '', formattedUrl: '', isActive: true },
          { id: '4', platform: 'x', usernameOrUrl: '', formattedUrl: '', isActive: true },
        ]);
      } else if (initialType === 'location') {
        setTitle('موقعنا الجغرافي');
      } else if (initialType === 'contact_card') {
        setTitle('بطاقة الاتصال السريعة');
        setSubtitle('اضغط لحفظ جهة الاتصال في هاتفك');
      }
    }
  }, [initialBlock, initialType, isOpen]);

  // Quick preset button for direct link
  const handleSelectSocialPreset = (p: { id: SocialPlatform; name: string }) => {
    const arabicName = p.name.split(' (')[0];
    setTitle(arabicName);
    if (!url) {
      if (p.id === 'snapchat') setUrl('https://snapchat.com/add/');
      else if (p.id === 'instagram') setUrl('https://instagram.com/');
      else if (p.id === 'tiktok') setUrl('https://tiktok.com/@');
      else if (p.id === 'x') setUrl('https://x.com/');
      else if (p.id === 'telegram') setUrl('https://t.me/');
      else if (p.id === 'youtube') setUrl('https://youtube.com/@');
      else if (p.id === 'linkedin') setUrl('https://linkedin.com/in/');
      else if (p.id === 'facebook') setUrl('https://facebook.com/');
    }
  };

  // Handle Social Accounts add/remove/edit
  const handleAddSocial = () => {
    setSocials([
      ...socials,
      {
        id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        platform: 'snapchat',
        usernameOrUrl: '',
        formattedUrl: '',
        isActive: true,
      },
    ]);
  };

  const handleUpdateSocial = (index: number, key: keyof SocialAccount, val: any) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [key]: val };
    if (key === 'usernameOrUrl' || key === 'platform') {
      updated[index].formattedUrl = StorageService.formatSocialUrl(
        updated[index].platform,
        updated[index].usernameOrUrl
      );
    }
    setSocials(updated);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const normalizeUrl = (input: string) => {
    if (!input) return '';
    const trimmed = input.trim();
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('mailto:') && !trimmed.startsWith('tel:')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && type !== 'divider' && type !== 'social_links') {
      showToast('يرجى إدخال عنوان العنصر', 'error');
      return;
    }

    const cleanUrl = normalizeUrl(url);

    const saved = StorageService.saveBlock({
      id: initialBlock?.id,
      userId,
      type,
      title: title || (type === 'divider' ? 'فاصل' : 'حسابات التواصل'),
      subtitle,
      url: cleanUrl,
      phone,
      email,
      message,
      content,
      imageUrl,
      videoUrl: normalizeUrl(videoUrl),
      locationAddress,
      targetDate,
      socials,
      highlight,
      badge,
      isActive: initialBlock ? initialBlock.isActive : true,
      order: initialBlock ? initialBlock.order : 99,
    });

    onSave(saved);
    showToast(initialBlock ? 'تم تحديث العنصر وحفظه سحابياً ☁️' : 'تمت إضافة العنصر ونشره سحابياً ☁️', 'success');
    onClose();
  };

  const detectedPlatform = StorageService.detectSocialPlatform(title, url);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBlock ? 'تعديل العنصر' : 'إضافة عنصر جديد إلى الصفحة'}
      description="اختر نوع العنصر وأدخل تفاصيله لتظهر مباشرة في صفحتك"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-right font-cairo">
        {/* Type Selector (only on create) */}
        {!initialBlock && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                نوع العنصر
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                اختر نوع المحتوى أو المنصة لإضافتها مباشرة
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 custom-scrollbar">
              {[
                { id: 'link', label: 'رابط مباشر', icon: <LinkIcon className="w-5 h-5 text-emerald-600" />, blockType: 'link' as BlockType },
                { id: 'snapchat', label: 'سناب شات', icon: getSocialIcon('snapchat'), blockType: 'link' as BlockType, socialPlatform: 'snapchat' as SocialPlatform },
                { id: 'whatsapp', label: 'واتساب مباشر', icon: getSocialIcon('whatsapp'), blockType: 'whatsapp' as BlockType },
                { id: 'instagram', label: 'انستقرام', icon: getSocialIcon('instagram'), blockType: 'link' as BlockType, socialPlatform: 'instagram' as SocialPlatform },
                { id: 'tiktok', label: 'تيك توك', icon: getSocialIcon('tiktok'), blockType: 'link' as BlockType, socialPlatform: 'tiktok' as SocialPlatform },
                { id: 'x', label: 'منصة X', icon: getSocialIcon('x'), blockType: 'link' as BlockType, socialPlatform: 'x' as SocialPlatform },
                { id: 'telegram', label: 'تيليجرام', icon: getSocialIcon('telegram'), blockType: 'link' as BlockType, socialPlatform: 'telegram' as SocialPlatform },
                { id: 'youtube', label: 'يوتيوب', icon: getSocialIcon('youtube'), blockType: 'link' as BlockType, socialPlatform: 'youtube' as SocialPlatform },
                { id: 'linkedin', label: 'لينكد إن', icon: getSocialIcon('linkedin'), blockType: 'link' as BlockType, socialPlatform: 'linkedin' as SocialPlatform },
                { id: 'facebook', label: 'فيسبوك', icon: getSocialIcon('facebook'), blockType: 'link' as BlockType, socialPlatform: 'facebook' as SocialPlatform },
                { id: 'social_links', label: 'شريط تواصل', icon: <Share2 className="w-5 h-5 text-indigo-500" />, blockType: 'social_links' as BlockType },
                { id: 'contact_card', label: 'بطاقة vCard', icon: <UserCheck className="w-5 h-5 text-blue-500" />, blockType: 'contact_card' as BlockType },
                { id: 'location', label: 'موقع جغرافي', icon: <MapPin className="w-5 h-5 text-rose-500" />, blockType: 'location' as BlockType },
                { id: 'pdf', label: 'ملف PDF', icon: <FileText className="w-5 h-5 text-amber-500" />, blockType: 'pdf' as BlockType },
                { id: 'heading', label: 'عنوان فرعي', icon: <Type className="w-5 h-5 text-purple-500" />, blockType: 'heading' as BlockType },
                { id: 'text', label: 'نص / اقتباس', icon: <Type className="w-5 h-5 text-slate-500" />, blockType: 'text' as BlockType },
                { id: 'video', label: 'فيديو يوتيوب', icon: <Video className="w-5 h-5 text-red-500" />, blockType: 'video' as BlockType },
                { id: 'image', label: 'صورة', icon: <ImageIcon className="w-5 h-5 text-teal-500" />, blockType: 'image' as BlockType },
                { id: 'phone', label: 'اتصال هاتف', icon: <Phone className="w-5 h-5 text-emerald-500" />, blockType: 'phone' as BlockType },
                { id: 'email', label: 'بريد إلكتروني', icon: <Mail className="w-5 h-5 text-sky-500" />, blockType: 'email' as BlockType },
                { id: 'divider', label: 'فاصل مرئي', icon: <Minus className="w-5 h-5 text-slate-400" />, blockType: 'divider' as BlockType },
              ].map((item) => {
                const isSelected =
                  item.socialPlatform
                    ? type === 'link' && (title === item.label || url.includes(item.id))
                    : type === item.blockType && (!title || !['سناب شات', 'انستقرام', 'تيك توك', 'منصة X', 'تيليجرام', 'يوتيوب', 'لينكد إن', 'فيسبوك'].includes(title));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setType(item.blockType);
                      if (item.socialPlatform) {
                        setTitle(item.label);
                        if (item.id === 'snapchat') setUrl('https://snapchat.com/add/');
                        else if (item.id === 'instagram') setUrl('https://instagram.com/');
                        else if (item.id === 'tiktok') setUrl('https://tiktok.com/@');
                        else if (item.id === 'x') setUrl('https://x.com/');
                        else if (item.id === 'telegram') setUrl('https://t.me/');
                        else if (item.id === 'youtube') setUrl('https://youtube.com/@');
                        else if (item.id === 'linkedin') setUrl('https://linkedin.com/in/');
                        else if (item.id === 'facebook') setUrl('https://facebook.com/');
                      } else if (item.blockType === 'whatsapp') {
                        setTitle('تواصل عبر واتساب');
                        setMessage('السلام عليكم، تواصلت معك عبر صفحتك الرقمية.');
                      } else if (item.blockType === 'location') {
                        setTitle('موقعنا الجغرافي');
                      } else if (item.blockType === 'contact_card') {
                        setTitle('بطاقة الاتصال السريعة');
                        setSubtitle('اضغط لحفظ جهة الاتصال في هاتفك');
                      } else if (item.blockType === 'social_links' && socials.length === 0) {
                        setTitle('حسابات التواصل الاجتماعي');
                        setSocials([
                          { id: '1', platform: 'snapchat', usernameOrUrl: '', formattedUrl: '', isActive: true },
                          { id: '2', platform: 'instagram', usernameOrUrl: '', formattedUrl: '', isActive: true },
                          { id: '3', platform: 'tiktok', usernameOrUrl: '', formattedUrl: '', isActive: true },
                          { id: '4', platform: 'x', usernameOrUrl: '', formattedUrl: '', isActive: true },
                        ]);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-600 font-extrabold shadow-sm ring-2 ring-emerald-500/20 scale-[1.02]'
                        : 'border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-6 h-6 mb-1.5 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-[11px] leading-tight font-bold truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Fields based on Type */}

        {/* 1. Divider doesn't need title */}
        {type === 'divider' ? (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500">
            سيتم وضع خط فاصل أنيق بين العناصر لترتيب الصفحة.
          </div>
        ) : (
          <>

            {/* Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {type === 'heading' ? 'نص العنوان الرئيسي' : 'عنوان الزر / العنصر'}
                </label>
                {detectedPlatform && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: getSocialColor(detectedPlatform) }}
                  >
                    <span className="w-3 h-3 flex items-center justify-center">
                      {getSocialIcon(detectedPlatform)}
                    </span>
                    <span>تم التعرف على أيقونة المنصة تلقائياً</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'link'
                    ? 'مثال: سناب، انستقرام، موقعي، حجز استشارة...'
                    : type === 'whatsapp'
                    ? 'مثال: محادثة مباشرة عبر واتساب'
                    : 'اكتب عنواناً جذاباً...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>

            {/* Subtitle */}
            {type !== 'social_links' && type !== 'image' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  وصف مختصر إضافي (اختياري)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="مثال: متاح للاستفسارات طوال أيام الأسبوع"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            )}
          </>
        )}

        {/* 2. Direct Link / Website */}
        {(type === 'link' || type === 'website') && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              الرابط أو اسم المستخدم (URL)
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="مثال: https://snapchat.com/add/username أو snapchat.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
            <p className="text-[11px] text-slate-500">
              يمكنك كتابة الرابط مع https:// أو بدونها، وسيتم ضبط الرابط تلقائياً.
            </p>
          </div>
        )}

        {/* 3. WhatsApp Fields */}
        {type === 'whatsapp' && (
          <div className="space-y-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                رقم الواتساب مع مفتاح الدولة (مثال: 966500000000)
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="966500000000"
                className="w-full px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                رسالة الترحيب المجهزة مسبقاً (تظهر للزائر فور فتح المحادثة)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="السلام عليكم، وصلت إليكم عن طريق صفحتكم وأرغب في الاستفسار."
                className="w-full px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Countdown specific field */}
        {type === 'countdown' && (
          <div className="space-y-1 p-3.5 bg-slate-900 text-white rounded-xl border border-emerald-500/30">
            <label className="text-xs font-bold text-emerald-400 block">
              تاريخ ووقت انتهاء العد التنازلي
            </label>
            <input
              type="datetime-local"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-mono outline-none border border-slate-700"
            />
            <p className="text-[11px] text-slate-400">
              سيظهر عدّاد حي بالساعات والدقائق والثواني متبقي حتى هذا التاريخ.
            </p>
          </div>
        )}

        {/* 4. Social Accounts Block */}
        {type === 'social_links' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                أيقونات التواصل الاجتماعي المضافة ({socials.length})
              </label>
              <button
                type="button"
                onClick={handleAddSocial}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة أيقونة منصة</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto p-1">
              {socials.map((soc, idx) => {
                const currentPlatformConfig =
                  SOCIAL_PLATFORMS.find((p) => p.id === soc.platform) || SOCIAL_PLATFORMS[0];
                return (
                  <div
                    key={soc.id || idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs"
                      style={{ backgroundColor: getSocialColor(soc.platform) }}
                    >
                      {getSocialIcon(soc.platform)}
                    </div>

                    <select
                      value={soc.platform}
                      onChange={(e) =>
                        handleUpdateSocial(idx, 'platform', e.target.value as SocialPlatform)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={soc.usernameOrUrl}
                      onChange={(e) => handleUpdateSocial(idx, 'usernameOrUrl', e.target.value)}
                      placeholder={currentPlatformConfig.defaultPlaceholder}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSocial(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                      title="حذف الأيقونة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              يمكنك إدخال اسم المستخدم مباشرة مثل @saleh أو رابط الحساب الكامل، وسيتم توليد الرابط الصحيح فوراً.
            </p>
          </div>
        )}

        {/* 5. Phone or Contact Card */}
        {(type === 'phone' || type === 'contact_card') && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966500000000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        )}

        {/* 6. Email */}
        {(type === 'email' || type === 'contact_card') && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        )}

        {/* 7. PDF Document */}
        {type === 'pdf' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              رابط ملف PDF التعريفي
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/company-profile.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        )}

        {/* 8. Location */}
        {type === 'location' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                العنوان النصي للموقع
              </label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="الرياض، طريق الملك فهد، برج المملكة"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                رابط خرائط جوجل (Google Maps URL - اختياري)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          </div>
        )}

        {/* 9. Video */}
        {type === 'video' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              رابط الفيديو (YouTube أو Vimeo)
            </label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        )}

        {/* 10. Image */}
        {type === 'image' && (
          <div className="space-y-2">
            <ImageUploadInput
              label="صورة العنصر المعروضة"
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              shape="square"
            />
          </div>
        )}

        {/* 11. Text / Quote */}
        {type === 'text' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              المحتوى النصي
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب رسالة أو ملاحظة أو اقتباساً لجمهورك..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        )}

        {/* Badge & Highlight Options for standard link */}
        {(type === 'link' || type === 'whatsapp') && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                شارة مميزة (Badge)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="مثال: جديد، الأهم..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="highlight"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="highlight" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                تمييز الزر بإطار بارز (Highlight)
              </label>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
          >
            {initialBlock ? 'حفظ التعديلات' : 'إضافة العنصر ونشره'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
