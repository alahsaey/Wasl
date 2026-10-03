import React, { useState, useEffect } from 'react';
import {
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Palette,
  LayoutList,
  User as UserIcon,
  Upload,
  BarChart2,
  ExternalLink,
  Cloud,
} from 'lucide-react';
import { User, Block, BlockType, UserThemeConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { LivePhonePreview } from '../preview/LivePhonePreview';
import { BlockEditorModal } from './BlockEditorModal';
import { ThemeSelector } from './ThemeSelector';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { useToast } from '../common/Toast';
import { getSocialIcon } from '../preview/BlockRenderer';

interface ProfileBuilderProps {
  user: User;
  onUserUpdated: (u: User) => void;
  onOpenPublicView: () => void;
}

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({
  user,
  onUserUpdated,
  onOpenPublicView,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'blocks' | 'profile' | 'theme'>('blocks');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState<UserThemeConfig>(StorageService.getUserTheme(user.id));

  // Profile fields state
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(theme.backgroundImageUrl || '');
  const [bgImageOpacity, setBgImageOpacity] = useState(
    theme.bgImageOpacity !== undefined ? theme.bgImageOpacity : 0.35
  );

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [newBlockType, setNewBlockType] = useState<BlockType>('link');
  const [blockToDelete, setBlockToDelete] = useState<Block | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadData = () => {
    setBlocks(StorageService.getUserBlocks(user.id));
    const currentTheme = StorageService.getUserTheme(user.id);
    setTheme(currentTheme);
    setBackgroundImageUrl(currentTheme.backgroundImageUrl || '');
    setBgImageOpacity(currentTheme.bgImageOpacity !== undefined ? currentTheme.bgImageOpacity : 0.35);
  };

  useEffect(() => {
    loadData();
    // Auto-sync current profile to cloud on mount so public link/QR is always up to date
    StorageService.syncUserToCloud(user.id).catch(() => {});

    const unsub = StorageService.subscribeToStorage(loadData);
    return unsub;
  }, [user.id]);

  const handleManualCloudSync = async () => {
    setSyncing(true);
    const success = await StorageService.syncUserToCloud(user.id);
    setSyncing(false);
    if (success) {
      showToast('تمت المزامنة السحابية وتحديث الباركود بنجاح ☁️ — التعديلات نشطة الآن لكل المشاهدين!', 'success');
    } else {
      showToast('تم الحفظ محلياً. تحقق من اتصال الإنترنت للمزامنة السحابية', 'info');
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = StorageService.updateUser(user.id, {
      fullName,
      bio,
      avatarUrl,
    });

    const updatedTheme = StorageService.saveUserTheme(user.id, {
      backgroundImageUrl,
      bgImageOpacity,
    });
    setTheme(updatedTheme);

    if (updatedUser) {
      onUserUpdated(updatedUser);
      await StorageService.syncUserToCloud(user.id);
      showToast('تم حفظ صورة الملف وصورة الخلفية وبياناتك ونشرها سحابياً بنجاح! ☁️', 'success');
    }
  };

  // Block Actions
  const handleToggleBlock = (blockId: string) => {
    StorageService.toggleBlockActive(blockId);
  };

  const handleDeleteBlock = (block: Block) => {
    setBlockToDelete(block);
  };

  const confirmDeleteBlock = () => {
    if (!blockToDelete) return;
    StorageService.deleteBlock(blockToDelete.id);
    showToast('تم حذف العنصر', 'info');
    setBlockToDelete(null);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setBlocks(reordered);
    StorageService.reorderBlocks(
      user.id,
      reordered.map((b) => b.id)
    );
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...blocks];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setBlocks(reordered);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      StorageService.reorderBlocks(
        user.id,
        blocks.map((b) => b.id)
      );
      setDraggedIndex(null);
      showToast('تم حفظ الترتيب الجديد', 'success');
    }
  };

  // Theme change
  const handleThemeChange = (updates: Partial<UserThemeConfig>) => {
    const updated = StorageService.saveUserTheme(user.id, updates);
    setTheme(updated);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8 font-cairo">
      {/* Left/Main Column: Settings & Builder Controls */}
      <div className="flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'blocks'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>الروابط والعناصر ({blocks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>البيانات الشخصية</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition ${
              activeTab === 'theme'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>التصميم والقالب</span>
          </button>
        </div>

        {/* Tab 1: BLOCKS / LINKS */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            {/* Quick Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  إدارة محتوى الصفحة
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  أعد ترتيب العناصر بالسحب والإفلات أو أزرار الأسهم
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualCloudSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition border border-slate-200 dark:border-slate-700"
                  title="تحديث ونشر التعديلات سحابياً فوراً لجميع ماسحي الباركود"
                >
                  <Cloud className={`w-4 h-4 ${syncing ? 'animate-bounce text-emerald-500' : 'text-emerald-600'}`} />
                  <span>{syncing ? 'جاري المزامنة...' : 'تحديث ونشر الباركود ☁️'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBlock(null);
                    setNewBlockType('link');
                    setIsEditorOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عنصر جديد</span>
                </button>
              </div>
            </div>

            {/* Quick One-Click Social Launchers */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">إضافة سريعة:</span>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('link');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-[#FFFC00]/15 text-amber-900 dark:text-amber-300 border border-amber-300/40 hover:bg-[#FFFC00]/30 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-amber-600">{getSocialIcon('snapchat')}</span>
                <span>سناب شات</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('whatsapp');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-emerald-600">{getSocialIcon('whatsapp')}</span>
                <span>واتساب</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('link');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-sky-600">{getSocialIcon('telegram')}</span>
                <span>تيليجرام</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('link');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-pink-500/15 text-pink-800 dark:text-pink-300 border border-pink-500/30 hover:bg-pink-500/25 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-pink-600">{getSocialIcon('instagram')}</span>
                <span>انستقرام</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('link');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-900/10 text-slate-900 dark:text-slate-200 border border-slate-400/30 hover:bg-slate-900/20 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-slate-900 dark:text-slate-100">{getSocialIcon('tiktok')}</span>
                <span>تيك توك</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('link');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-900/10 text-slate-900 dark:text-slate-200 border border-slate-400/30 hover:bg-slate-900/20 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-slate-900 dark:text-slate-100">{getSocialIcon('x')}</span>
                <span>منصة X</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBlock(null);
                  setNewBlockType('social_links');
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition"
              >
                <span className="w-4 h-4 flex items-center justify-center text-indigo-600">🌐</span>
                <span>شريط أيقونات شامل</span>
              </button>
            </div>

            {/* Blocks List */}
            {blocks.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                  <LayoutList className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  صفحتك لا تحتوي على أي عناصر حالياً
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ابدأ بإضافة رابط موقعك، حسابات التواصل، محادثة واتساب المباشرة أو ملف سيرتك الذاتية.
                </p>
                <button
                  onClick={() => {
                    setEditingBlock(null);
                    setNewBlockType('link');
                    setIsEditorOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول عنصر</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {blocks.map((block, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-sm ${
                      !block.isActive
                        ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/40 border-dashed'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    } ${draggedIndex === index ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.01]' : ''}`}
                  >
                    {/* Right side: Drag handle & info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
                        title="اسحب لإعادة الترتيب"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate block">
                            {block.title}
                          </span>
                          {block.badge && (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                              {block.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-mono text-[11px] opacity-75">
                            {block.type === 'whatsapp'
                              ? 'واتساب مباشر'
                              : block.type === 'social_links'
                              ? `سوشيال ميديا (${block.socials?.length || 0})`
                              : block.type === 'pdf'
                              ? 'ملف PDF'
                              : block.type === 'location'
                              ? 'موقع جغرافي'
                              : block.type === 'contact_card'
                              ? 'بطاقة vCard'
                              : block.url || 'رابط'}
                          </span>
                          {block.clicksCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <BarChart2 className="w-3 h-3" />
                                <span>{block.clicksCount} نقرة</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Left side: Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {/* Move up / down buttons */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveBlock(index, 'up')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="تحريك لأعلى"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === blocks.length - 1}
                        onClick={() => handleMoveBlock(index, 'down')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="تحريك لأسفل"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleBlock(block.id)}
                        className={`p-1.5 rounded-lg transition ${
                          block.isActive
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={block.isActive ? 'إخفاء العنصر' : 'إظهار العنصر'}
                      >
                        {block.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBlock(block);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="تعديل العنصر"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="حذف العنصر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-right"
          >
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                معلومات الملف التعريفي
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تظهر هذه البيانات في أعلى صفحتك الرقمية لجميع الزوار
              </p>
            </div>

            {/* Avatar upload / input with client-side compression */}
            <ImageUploadInput
              label="1. الصورة الشخصية أو الشعار الخاص بك (Avatar)"
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
              fallbackName={fullName}
              shape={theme.imageShape === 'circle' ? 'circle' : 'square'}
            />

            {/* Custom Background Image upload */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <ImageUploadInput
                label="2. صورة خلفية الصفحة المخصصة (تظهر مفرغة وشفافة خلف صفحتك)"
                value={backgroundImageUrl}
                onChange={(url) => setBackgroundImageUrl(url)}
              />

              {backgroundImageUrl && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      درجة شفافية صورة الخلفية
                    </label>
                    <span className="font-mono font-bold text-emerald-600">
                      {Math.round(bgImageOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={bgImageOpacity}
                    onChange={(e) => setBgImageOpacity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundImageUrl('');
                      setBgImageOpacity(0.35);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    إزالة صورة الخلفية
                  </button>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                الاسم الكامل المعروض
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="صالح الياسين"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>

            {/* Username / Custom Link */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                اسم المستخدم والرابط العام الخاص بك
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-mono text-slate-600">
                <span className="opacity-60">domain.com/</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{user.username}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                اسم المستخدم مرتبط برابط صفحتك ويتم تعيينه من قِبل إدارة المنصة.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                النبذة التعريفية (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="مستشار أعمال ومؤسس شركات ناشئة | مهتم بالتقنية والتحول الرقمي والاستثمار..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: THEME & APPEARANCE */}
        {activeTab === 'theme' && (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <ThemeSelector currentTheme={theme} onChange={handleThemeChange} />
          </div>
        )}
      </div>

      {/* Right Column: Live Phone Mockup Preview (Always in sync) */}
      <div className="hidden lg:block shrink-0">
        <LivePhonePreview
          user={{
            ...user,
            fullName,
            bio,
            avatarUrl,
          }}
          blocks={blocks}
          theme={theme}
          onOpenPublicView={onOpenPublicView}
        />
      </div>

      {/* Block Editor Modal */}
      <BlockEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        userId={user.id}
        initialBlock={editingBlock}
        initialType={newBlockType}
        onSave={() => loadData()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!blockToDelete}
        title="تأكيد حذف العنصر"
        message={`هل أنت متأكد من حذف "${blockToDelete?.title}"؟ لن يظهر مجدداً في صفحتك العامة.`}
        confirmText="نعم، حذف العنصر"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={confirmDeleteBlock}
        onCancel={() => setBlockToDelete(null)}
      />
    </div>
  );
};
