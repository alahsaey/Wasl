import React, { useEffect, useState } from 'react';
import { QrCode, Share2, CheckCircle2, LogIn, ArrowRight, Home } from 'lucide-react';
import { User, Block, UserThemeConfig } from '../../types';
import { StorageService, mergeBlocks } from '../../services/storage';
import { CloudSyncService } from '../../services/cloudSync';
import { BlockRenderer } from './BlockRenderer';
import { QRCodeModal } from '../common/QRCodeModal';

interface PublicProfilePageProps {
  user: User;
  blocks?: Block[];
  theme?: UserThemeConfig;
  isPreview?: boolean; // True when rendered inside phone mockup in builder; False when viewed full page
  onBackToApp?: () => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  user,
  blocks: propBlocks,
  theme: propTheme,
  isPreview = false,
  onBackToApp,
}) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [blocks, setBlocks] = useState<Block[]>(propBlocks || []);
  const [theme, setTheme] = useState<UserThemeConfig>(propTheme || StorageService.getUserTheme(user.id));
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    if (propBlocks) {
      setBlocks(propBlocks);
    } else {
      setBlocks(StorageService.getUserBlocks(user.id));
    }
  }, [user.id, propBlocks]);

  useEffect(() => {
    if (propTheme) {
      setTheme(propTheme);
    } else {
      setTheme(StorageService.getUserTheme(user.id));
    }
  }, [user.id, propTheme]);

  // Real-time live Cloud Firestore listener for instant multi-device sync
  useEffect(() => {
    if (isPreview) return;

    // 1. Initial Cloud fetch
    StorageService.fetchPublicProfileFromCloud(user.username).then((cloud) => {
      if (cloud) {
        setCurrentUser(cloud.user);
        setBlocks(cloud.blocks);
        if (cloud.theme) {
          setTheme(cloud.theme);
        }
      }
    });

    // 2. Real-time live listener (onSnapshot)
    const unsub = CloudSyncService.subscribeToUserProfile(user.username, (data) => {
      if (data.user) {
        setCurrentUser(data.user);
        setBlocks((prev) => mergeBlocks(prev, data.blocks));
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    });

    return () => {
      unsub();
    };
  }, [user.username, isPreview]);

  // Track page view only once on real public page visit
  useEffect(() => {
    if (!isPreview) {
      StorageService.recordEvent({
        userId: currentUser.id,
        type: 'page_view',
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
        referrer: document.referrer || 'Direct',
      });
    }
  }, [isPreview, currentUser.id]);

  // Handle navigate to dashboard / login
  const handleGoToApp = () => {
    if (onBackToApp) {
      onBackToApp();
    } else if (typeof window !== 'undefined') {
      window.location.href = window.location.origin;
    }
  };

  // Compute profile image shape
  const getImageShapeClass = () => {
    if (theme.imageShape === 'squircle') return 'rounded-3xl';
    if (theme.imageShape === 'square') return 'rounded-none';
    if (theme.imageShape === 'rounded') return 'rounded-2xl';
    return 'rounded-full';
  };

  // Background style
  const getContainerBackground = () => {
    if (theme.backgroundType === 'gradient' || theme.backgroundType === 'mesh') {
      return { background: theme.backgroundColor };
    }
    return { backgroundColor: theme.backgroundColor };
  };

  const pageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?u=${currentUser.username}`
      : `https://wasl-sa.netlify.app/?u=${currentUser.username}`;

  const currentLayout = theme.layoutMode || 'innovative';
  const isGridMode = currentLayout === 'innovative' || currentLayout === 'modern';

  // Helper to render blocks with grid grouping
  const renderBlocksList = () => {
    if (blocks.length === 0) {
      return (
        <div className="text-center py-10 opacity-60 text-xs">
          لم تتم إضافة أي روابط أو عناصر بعد.
        </div>
      );
    }

    if (!isGridMode) {
      // List Mode: standard full-width stack
      return (
        <div className="w-full space-y-3.5">
          {blocks.map((block, index) => (
            <BlockRenderer
              key={`${block.id}-${index}`}
              block={block}
              theme={theme}
              isInteractive={!isPreview}
              isGridMode={false}
            />
          ))}
        </div>
      );
    }

    // Grid Mode: Group contiguous grid-compatible blocks into 2-column grid
    const isGridType = (type: string) =>
      ['link', 'whatsapp', 'phone', 'email', 'website', 'pdf', 'location', 'contact_card', 'video'].includes(type);

    const activeBlocks = blocks.filter((b) => b.isActive);
    const groups: { type: 'grid' | 'full'; items: typeof blocks }[] = [];

    let currentGridGroup: typeof blocks = [];

    activeBlocks.forEach((b) => {
      if (isGridType(b.type)) {
        currentGridGroup.push(b);
      } else {
        if (currentGridGroup.length > 0) {
          groups.push({ type: 'grid', items: [...currentGridGroup] });
          currentGridGroup = [];
        }
        groups.push({ type: 'full', items: [b] });
      }
    });

    if (currentGridGroup.length > 0) {
      groups.push({ type: 'grid', items: [...currentGridGroup] });
    }

    return (
      <div className="w-full space-y-3.5">
        {groups.map((group, groupIdx) => {
          if (group.type === 'full') {
            return group.items.map((b, bIdx) => (
              <BlockRenderer
                key={`${b.id}-${groupIdx}-${bIdx}`}
                block={b}
                theme={theme}
                isInteractive={!isPreview}
                isGridMode={false}
              />
            ));
          }

          return (
            <div key={`grid-group-${groupIdx}`} className="grid grid-cols-2 gap-3 sm:gap-3.5 w-full">
              {group.items.map((b, bIdx) => (
                <BlockRenderer
                  key={`${b.id}-${groupIdx}-${bIdx}`}
                  block={b}
                  theme={theme}
                  isInteractive={!isPreview}
                  isGridMode={true}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-300 font-cairo flex flex-col items-center overflow-x-hidden ${
        isPreview ? 'py-6 px-4' : 'py-6 px-4 pb-20'
      }`}
      style={{
        ...getContainerBackground(),
        color: theme.textColor,
      }}
    >
      {/* Custom Background Image Overlay (Single, non-repeating image with transparency) */}
      {theme.backgroundImageUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-no-repeat bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url(${theme.backgroundImageUrl})`,
            opacity: theme.bgImageOpacity !== undefined ? theme.bgImageOpacity : 0.35,
            backgroundAttachment: 'fixed',
          }}
        />
      )}

      {/* Dynamic Animated Background Effects */}
      {theme.bgEffect && theme.bgEffect !== 'none' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {theme.bgEffect === 'stars' && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent animate-pulse" />
          )}
          {theme.bgEffect === 'particles' && (
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl animate-ping" />
              <div className="absolute top-2/3 right-1/4 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            </div>
          )}
          {theme.bgEffect === 'glow' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-indigo-500/15 to-amber-500/20 blur-3xl animate-pulse" />
          )}
        </div>
      )}

      {/* Top bar for standalone public view (Always visible for easy Dashboard / Login access) */}
      {!isPreview && (
        <div className="relative z-10 w-full max-w-md mb-6 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handleGoToApp}
            className="flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg border border-slate-700/60 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            title="الدخول إلى لوحة التحكم أو تسجيل الدخول"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>لوحة التحكم / الدخول</span>
          </button>

          <div className="text-[11px] font-bold opacity-80 bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            منصة نشرك
          </div>
        </div>
      )}

      {/* Main Content Column (Mobile First) */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2 w-full">
          {/* Avatar with glow/shadow */}
          <div className="relative group">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 overflow-hidden shadow-xl border-4 transition-transform duration-300 group-hover:scale-105 ${getImageShapeClass()}`}
              style={{ borderColor: theme.primaryColor }}
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}`
                }
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            {theme.showVerifiedBadge && (
              <div
                className="absolute bottom-1 -left-1 p-1 rounded-full shadow-md bg-white text-emerald-600"
                title="حساب معتمد"
              >
                <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
            )}
          </div>

          {/* Full Name & Username */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{currentUser.fullName}</h1>
            <p className="text-xs sm:text-sm font-mono opacity-80 dir-ltr text-center">
              @{currentUser.username}
            </p>
          </div>

          {/* Bio */}
          {currentUser.bio && (
            <p className="text-xs sm:text-sm opacity-90 max-w-sm leading-relaxed px-4 text-center font-normal">
              {currentUser.bio}
            </p>
          )}
        </div>

        {/* Dynamic Blocks List (Grid 2-Columns Layout default or List) */}
        {renderBlocksList()}

        {/* Footer Actions: QR & Share */}
        <div className="pt-6 w-full flex items-center justify-center gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/20 transition shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>رمز QR</span>
          </button>
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/20 transition shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة الصفحة</span>
          </button>
        </div>

        {/* Platform Branding Badge (unless hidden) */}
        {theme.showBranding && (
          <div className="pt-4 pb-4 text-center">
            <button
              onClick={handleGoToApp}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium opacity-60 hover:opacity-100 transition"
            >
              <span>صُنعت بواسطة</span>
              <span className="font-bold underline decoration-dotted">روابط نشرك</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Quick Action Button for Instant Dashboard / Login */}
      {!isPreview && (
        <button
          type="button"
          onClick={handleGoToApp}
          className="fixed bottom-4 left-4 z-40 flex items-center gap-2 py-2 px-3.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700/80 backdrop-blur-lg transition-all hover:scale-105 active:scale-95"
          title="الدخول إلى لوحة التحكم"
        >
          <LogIn className="w-3.5 h-3.5 text-emerald-400" />
          <span>لوحة التحكم</span>
        </button>
      )}

      {/* QR Code & Share Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={pageUrl}
        title={currentUser.fullName}
        userName={currentUser.username}
      />
    </div>
  );
};
