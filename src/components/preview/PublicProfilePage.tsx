import React, { useEffect, useState } from 'react';
import { QrCode, Share2, CheckCircle2, ArrowRight } from 'lucide-react';
import { User, Block, UserThemeConfig } from '../../types';
import { StorageService } from '../../services/storage';
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

  // Fetch live updates from Cloud Firestore on mount to ensure barcode viewers always see latest changes
  useEffect(() => {
    if (isPreview) return;
    let isMounted = true;

    StorageService.fetchPublicProfileFromCloud(user.username).then((cloud) => {
      if (cloud && isMounted) {
        setCurrentUser(cloud.user);
        setBlocks(cloud.blocks);
        if (cloud.theme) {
          setTheme(cloud.theme);
        }
      }
    });

    return () => {
      isMounted = false;
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

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/?u=${currentUser.username}` : `https://nashrak.sa/${currentUser.username}`;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 font-cairo flex flex-col items-center ${
        isPreview ? 'py-6 px-4' : 'py-10 px-4'
      }`}
      style={{
        ...getContainerBackground(),
        color: theme.textColor,
      }}
    >
      {/* Top bar for standalone public view (option to return or platform branding) */}
      {!isPreview && onBackToApp && (
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </button>
          <div className="text-[11px] opacity-75 font-medium">منصة نشرك</div>
        </div>
      )}

      {/* Main Content Column (Mobile First) */}
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
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

        {/* Dynamic Blocks List */}
        <div className="w-full space-y-3.5">
          {blocks.length === 0 ? (
            <div className="text-center py-10 opacity-60 text-xs">
              لم تتم إضافة أي روابط أو عناصر بعد.
            </div>
          ) : (
            blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                theme={theme}
                isInteractive={!isPreview}
              />
            ))
          )}
        </div>

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
          <div className="pt-4 pb-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium opacity-60 hover:opacity-100 transition"
            >
              <span>صُنعت بواسطة</span>
              <span className="font-bold underline decoration-dotted">روابط نشرك</span>
            </a>
          </div>
        )}
      </div>

      {/* QR Code & Share Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={pageUrl}
        title={user.fullName}
        userName={user.username}
      />
    </div>
  );
};
