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
} from 'lucide-react';
import { Block, BlockType, SocialPlatform, SocialAccount } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/ConfirmDialog';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { useToast } from '../common/Toast';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialBlock?: Block | null;
  initialType?: BlockType;
  onSave: (block: Block) => void;
}

const SOCIAL_PLATFORMS: { id: SocialPlatform; name: string }[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'x', name: 'منصة X (تويتر)' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'whatsapp', name: 'واتساب' },
  { id: 'telegram', name: 'تيليجرام' },
  { id: 'snapchat', name: 'سناب شات' },
  { id: 'github', name: 'GitHub' },
  { id: 'behance', name: 'Behance' },
  { id: 'threads', name: 'Threads' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'facebook', name: 'Facebook' },
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
      setHighlight(false);
      setBadge('');
      setSocials([]);

      // Set defaults for convenient block types
      if (initialType === 'whatsapp') {
        setTitle('تواصل عبر واتساب');
        setMessage('السلام عليكم، وصلت إليكم عن طريق صفحتكم وأرغب في الاستفسار.');
      } else if (initialType === 'social_links') {
        setTitle('حسابات التواصل الاجتماعي');
        setSocials([
          { id: '1', platform: 'x', usernameOrUrl: '', formattedUrl: '', isActive: true },
          { id: '2', platform: 'instagram', usernameOrUrl: '', formattedUrl: '', isActive: true },
        ]);
      } else if (initialType === 'location') {
        setTitle('موقعنا الجغرافي');
      } else if (initialType === 'contact_card') {
        setTitle('بطاقة الاتصال السريعة');
        setSubtitle('اضغط لحفظ جهة الاتصال في هاتفك');
      }
    }
  }, [initialBlock, initialType, isOpen]);

  // Handle Social Accounts add/remove/edit
  const handleAddSocial = () => {
    setSocials([
      ...socials,
      {
        id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        platform: 'x',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && type !== 'divider' && type !== 'social_links') {
      showToast('يرجى إدخال عنوان العنصر', 'error');
      return;
    }

    const saved = StorageService.saveBlock({
      id: initialBlock?.id,
      userId,
      type,
      title: title || (type === 'divider' ? 'فاصل' : 'حسابات التواصل'),
      subtitle,
      url,
      phone,
      email,
      message,
      content,
      imageUrl,
      videoUrl,
      locationAddress,
      socials,
      highlight,
      badge,
      isActive: initialBlock ? initialBlock.isActive : true,
      order: initialBlock ? initialBlock.order : 99,
    });

    onSave(saved);
    showToast(initialBlock ? 'تم تحديث العنصر بنجاح' : 'تمت إضافة العنصر بنجاح', 'success');
    onClose();
  };

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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              نوع العنصر
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              {[
                { type: 'link' as BlockType, label: 'رابط مباشر', icon: LinkIcon },
                { type: 'whatsapp' as BlockType, label: 'واتساب', icon: MessageCircle },
                { type: 'social_links' as BlockType, label: 'سوشيال ميديا', icon: Share2 },
                { type: 'pdf' as BlockType, label: 'ملف PDF', icon: FileText },
                { type: 'location' as BlockType, label: 'موقع جغرافي', icon: MapPin },
                { type: 'contact_card' as BlockType, label: 'بطاقة اتصال', icon: UserCheck },
                { type: 'heading' as BlockType, label: 'عنوان فرعي', icon: Type },
                { type: 'text' as BlockType, label: 'نص / اقتباس', icon: Type },
                { type: 'video' as BlockType, label: 'فيديو يوتيوب', icon: Video },
                { type: 'image' as BlockType, label: 'صورة', icon: ImageIcon },
                { type: 'phone' as BlockType, label: 'اتصال هاتف', icon: Phone },
                { type: 'email' as BlockType, label: 'بريد إلكتروني', icon: Mail },
                { type: 'divider' as BlockType, label: 'فاصل مرئي', icon: Minus },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                      isSelected
                        ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-600 font-bold shadow-sm'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px] leading-tight">{item.label}</span>
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {type === 'heading' ? 'نص العنوان الرئيسي' : 'عنوان الزر / العنصر'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'link'
                    ? 'مثال: موقعي الإلكتروني، حجز موعد...'
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
              الرابط (URL)
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono dir-ltr text-left focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        )}

        {/* 3. WhatsApp Fields (Req 7) */}
        {type === 'whatsapp' && (
          <div className="space-y-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                رقم الواتساب مع مفتاح الدولة (بدون + أو أصفار إضافية)
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

        {/* 4. Social Accounts Block (Req 6) */}
        {type === 'social_links' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                الحسابات الاجتماعية المضافة
              </label>
              <button
                type="button"
                onClick={handleAddSocial}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة حساب</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {socials.map((soc, idx) => (
                <div
                  key={soc.id || idx}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <select
                    value={soc.platform}
                    onChange={(e) =>
                      handleUpdateSocial(idx, 'platform', e.target.value as SocialPlatform)
                    }
                    className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
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
                    placeholder="اسم المستخدم أو الرابط"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono dir-ltr text-left outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              يدعم النظام المعرفات مباشرة مثل @username أو روابط الحسابات الكاملة.
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
              type="url"
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
                type="url"
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
              type="url"
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
            {initialBlock ? 'حفظ التعديلات' : 'إضافة العنصر'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
