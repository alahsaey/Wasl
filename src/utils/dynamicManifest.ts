import { StorageService } from '../services/storage';

/**
 * Dynamically updates the browser favicon, apple-touch-icon, and PWA Web App Manifest
 * in real-time to match the uploaded Admin/Platform Brand Icon across all domains and installs.
 */
export function updateDynamicFaviconAndManifest(customLogoUrl?: string) {
  if (typeof window === 'undefined') return;

  const logoUrl = customLogoUrl || StorageService.getAdminAvatar() || '/icon.svg';

  // 1. Update Favicon
  let favIcon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!favIcon) {
    favIcon = document.createElement('link');
    favIcon.rel = 'icon';
    document.head.appendChild(favIcon);
  }
  favIcon.href = logoUrl;

  // 2. Update Apple Touch Icon
  let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (!appleIcon) {
    appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    document.head.appendChild(appleIcon);
  }
  appleIcon.href = logoUrl;

  // 3. Update PWA Manifest dynamically
  try {
    const settings = StorageService.getSettings();
    const manifestData = {
      id: '/',
      name: settings?.platformName || 'روابط نشرك | منصة الهوية الرقمية',
      short_name: 'روابط نشرك',
      description: settings?.tagline || 'منصة SaaS متكاملة لإنشاء وإدارة صفحات الهوية الرقمية والروابط الذكية.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#0f172a',
      background_color: '#020617',
      icons: [
        {
          src: logoUrl,
          sizes: '192x192 512x512',
          type: logoUrl.startsWith('data:image/svg') || logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'any',
        },
        {
          src: logoUrl,
          sizes: '512x512',
          type: logoUrl.startsWith('data:image/svg') || logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], {
      type: 'application/json',
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;
  } catch (e) {
    console.warn('Could not update dynamic manifest:', e);
  }
}
