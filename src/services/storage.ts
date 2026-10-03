import {
  User,
  Block,
  UserThemeConfig,
  SubscriptionPlan,
  AnalyticsEvent,
  AuditLog,
  PlatformSettings,
  SocialPlatform,
  ThemePresetId,
} from '../types';
import { CloudSyncService } from './cloudSync';

// Default theme configuration
export const DEFAULT_THEME: UserThemeConfig = {
  presetId: 'minimal',
  primaryColor: '#059669', // Emerald
  backgroundColor: '#f8fafc',
  backgroundType: 'solid',
  textColor: '#0f172a',
  cardBgColor: '#ffffff',
  cardTextColor: '#0f172a',
  buttonStyle: 'soft',
  buttonShadow: 'subtle',
  borderRadius: 'rounded-xl',
  fontFamily: 'Cairo',
  imageShape: 'circle',
  showVerifiedBadge: true,
  showBranding: false,
};

export const THEME_PRESETS: Record<ThemePresetId, UserThemeConfig> = {
  minimal: {
    presetId: 'minimal',
    primaryColor: '#0f172a',
    backgroundColor: '#fafafa',
    backgroundType: 'solid',
    textColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardTextColor: '#0f172a',
    buttonStyle: 'outline',
    buttonShadow: 'none',
    borderRadius: 'rounded-lg',
    fontFamily: 'Cairo',
    imageShape: 'circle',
    showVerifiedBadge: true,
    showBranding: true,
  },
  business: {
    presetId: 'business',
    primaryColor: '#1e3a8a', // Deep Blue
    backgroundColor: '#f1f5f9',
    backgroundType: 'solid',
    textColor: '#0f172a',
    cardBgColor: '#ffffff',
    cardTextColor: '#0f172a',
    buttonStyle: 'solid',
    buttonShadow: 'subtle',
    borderRadius: 'rounded-xl',
    fontFamily: 'Cairo',
    imageShape: 'squircle',
    showVerifiedBadge: true,
    showBranding: false,
  },
  creator: {
    presetId: 'creator',
    primaryColor: '#ec4899', // Pink
    backgroundColor: '#fff1f2',
    backgroundType: 'solid',
    textColor: '#881337',
    cardBgColor: '#ffffff',
    cardTextColor: '#1c1917',
    buttonStyle: 'solid',
    buttonShadow: 'glow',
    borderRadius: 'rounded-full',
    fontFamily: 'Cairo',
    imageShape: 'circle',
    showVerifiedBadge: true,
    showBranding: false,
  },
  dark: {
    presetId: 'dark',
    primaryColor: '#10b981', // Emerald glow
    backgroundColor: '#09090b', // Deep zinc
    backgroundType: 'solid',
    textColor: '#f4f4f5',
    cardBgColor: '#18181b',
    cardTextColor: '#fafafa',
    buttonStyle: 'solid',
    buttonShadow: 'glow',
    borderRadius: 'rounded-2xl',
    fontFamily: 'Cairo',
    imageShape: 'circle',
    showVerifiedBadge: true,
    showBranding: false,
  },
  luxury: {
    presetId: 'luxury',
    primaryColor: '#d97706', // Gold / Amber
    backgroundColor: '#0c0a09', // Warm dark
    backgroundType: 'solid',
    textColor: '#fef3c7',
    cardBgColor: '#1c1917',
    cardTextColor: '#fef3c7',
    buttonStyle: 'outline',
    buttonShadow: 'subtle',
    borderRadius: 'rounded-lg',
    fontFamily: 'Cairo',
    imageShape: 'squircle',
    showVerifiedBadge: true,
    showBranding: false,
  },
  elegant: {
    presetId: 'elegant',
    primaryColor: '#9333ea', // Violet
    backgroundColor: '#fdf4ff',
    backgroundType: 'solid',
    textColor: '#4c1d95',
    cardBgColor: '#ffffff',
    cardTextColor: '#3b0764',
    buttonStyle: 'soft',
    buttonShadow: 'subtle',
    borderRadius: 'rounded-2xl',
    fontFamily: 'Cairo',
    imageShape: 'circle',
    showVerifiedBadge: true,
    showBranding: false,
  },
  gradient: {
    presetId: 'gradient',
    primaryColor: '#4f46e5',
    backgroundColor: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
    backgroundType: 'gradient',
    textColor: '#ffffff',
    cardBgColor: 'rgba(255, 255, 255, 0.92)',
    cardTextColor: '#1e1b4b',
    buttonStyle: 'solid',
    buttonShadow: 'elevated',
    borderRadius: 'rounded-2xl',
    fontFamily: 'Cairo',
    imageShape: 'circle',
    showVerifiedBadge: true,
    showBranding: false,
  },
  glass: {
    presetId: 'glass',
    primaryColor: '#0284c7', // Sky
    backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
    backgroundType: 'mesh',
    textColor: '#f8fafc',
    cardBgColor: 'rgba(255, 255, 255, 0.12)',
    cardTextColor: '#f8fafc',
    buttonStyle: 'glass',
    buttonShadow: 'glow',
    borderRadius: 'rounded-2xl',
    fontFamily: 'Cairo',
    imageShape: 'squircle',
    showVerifiedBadge: true,
    showBranding: false,
  },
};

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'المجانية',
    nameEn: 'Free',
    priceMonthly: 0,
    currency: 'SAR',
    maxLinks: 5,
    maxPages: 1,
    allowedThemes: ['minimal', 'business'],
    hasAnalytics: false,
    hasCustomDomain: false,
    removeBranding: false,
    features: ['حتى 5 روابط وعناصر', 'قالبان أساسيان', 'رمز QR عادي', 'صفحة متجاوبة مع الجوال'],
  },
  {
    id: 'pro',
    name: 'المحترفين',
    nameEn: 'Pro',
    priceMonthly: 49,
    currency: 'SAR',
    maxLinks: 30,
    maxPages: 2,
    allowedThemes: ['minimal', 'business', 'creator', 'dark', 'elegant'],
    hasAnalytics: true,
    hasCustomDomain: false,
    removeBranding: true,
    features: [
      'حتى 30 رابطاً وعنصراً',
      'جميع القوالب المتقدمة',
      'إحصائيات وتحليلات الزيارات',
      'إزالة شعار المنصة',
      'تخصيص كامل للألوان والخطوط',
      'تحميل QR بجودة طباعة فائقة',
    ],
  },
  {
    id: 'business',
    name: 'الأعمال والشركات',
    nameEn: 'Business',
    priceMonthly: 129,
    currency: 'SAR',
    maxLinks: 999,
    maxPages: 5,
    allowedThemes: ['minimal', 'business', 'creator', 'dark', 'luxury', 'elegant', 'gradient', 'glass'],
    hasAnalytics: true,
    hasCustomDomain: true,
    removeBranding: true,
    features: [
      'روابط وعناصر غير محدودة',
      'كافة القوالب والأنماط الفاخرة',
      'إحصائيات متقدمة ومصدر الزوار',
      'إزالة شعار المنصة بالكامل',
      'أولوية الدعم الفني 24/7',
      'ربط دومين مخصص',
      'تحميل كرت العمل الرقمي vCard',
    ],
  },
];

export const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'روابط نشرك المفضلة',
  tagline: 'منصة الهوية الرقمية والروابط للأفراد والشركات',
  contactEmail: 'support@nashrak.sa',
  allowPublicRegistration: false, // As specified in prompt: admin creates member accounts!
  defaultPlanId: 'pro',
  footerText: 'منصة روابط نشرك المفضلة © 2026. جميع الحقوق محفوظة.',
  supportWhatsApp: '+966500000000',
};

/**
 * Smart block merge function to prevent snapshot echoes from deleting locally created blocks
 */
export function mergeBlocks(localBlocks: Block[], cloudBlocks: Block[]): Block[] {
  const map = new Map<string, Block>();

  // 1. Add cloud blocks
  if (Array.isArray(cloudBlocks)) {
    cloudBlocks.forEach((b) => {
      if (b && b.id) {
        map.set(b.id, b);
      }
    });
  }

  // 2. Merge local blocks (do not drop local blocks if they are newer or not in cloud yet)
  if (Array.isArray(localBlocks)) {
    localBlocks.forEach((b) => {
      if (b && b.id) {
        const existing = map.get(b.id);
        if (!existing) {
          map.set(b.id, b);
        } else {
          const localTime = new Date(b.updatedAt || 0).getTime();
          const cloudTime = new Date(existing.updatedAt || 0).getTime();
          if (localTime >= cloudTime) {
            map.set(b.id, b);
          }
        }
      }
    });
  }

  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'nashrak_users',
  PASSWORDS: 'nashrak_passwords',
  BLOCKS: 'nashrak_blocks',
  THEMES: 'nashrak_user_themes',
  PLANS: 'nashrak_plans',
  ANALYTICS: 'nashrak_analytics',
  AUDIT_LOGS: 'nashrak_audit_logs',
  SETTINGS: 'nashrak_settings',
  CURRENT_USER: 'nashrak_current_user',
  IMPERSONATOR: 'nashrak_impersonator',
};

// Listener callbacks for reactive updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
};

// Initial Seed Data
const initStorage = () => {
  if (typeof window === 'undefined') return;

  const STORAGE_VERSION = 'v8_realtime_cloud_authoritative';
  if (!localStorage.getItem(STORAGE_KEYS.USERS) || localStorage.getItem('wasl_storage_version') !== STORAGE_VERSION) {
        const seedUsers: User[] = [
      {
        id: 'user-admin-1',
        fullName: 'Saleh Alyassin',
        username: 'admin',
        email: 'Shalyassin@sar.com.sa',
        phone: '+966551122334',
        role: 'super_admin',
        status: 'active',
        planId: 'business',
        planExpiresAt: '2028-12-31',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        bio: 'مدير المنصة العام | مسؤول إدارة النظام والأعضاء والهوية المؤسسية.',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-03-01T12:00:00Z',
        lastLoginAt: new Date().toISOString(),
      },
      {
        id: 'user-saleh-2',
        fullName: 'صالح الياسين',
        username: 'saleh',
        email: 'mtjar1188@gmail.com',
        phone: '+966500680180',
        role: 'member',
        status: 'active',
        planId: 'business',
        planExpiresAt: '2027-06-30',
        avatarUrl: 'data:image/jpeg;base64,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',
        bio: 'مستشار أعمال ومؤسس شركات منصات | أساعد رواد الأعمال في بناء ونمو مشاريعهم الرقمية والتوسع الاستثماري.',
        createdAt: '2026-01-15T09:30:00Z',
        updatedAt: '2026-10-02T21:39:39.035Z',
        lastLoginAt: '2026-10-02T21:32:02.263Z',
      },
      {
        id: 'user-1790955554296-ex3h9',
        fullName: 'Tooma',
        username: 'tooma',
        email: 'Miss.fo0o.fo0o@hotmail.com',
        phone: '',
        role: 'member',
        status: 'active',
        planId: 'free',
        planExpiresAt: '2027-12-31',
        avatarUrl: '',
        bio: 'مرحباً بكم في صفحتي الرقمية عبر منصة نشرك.',
        createdAt: '2026-10-02T16:52:46.564Z',
        updatedAt: '2026-10-02T16:52:46.564Z',
        lastLoginAt: '2026-10-02T16:52:46.564Z',
      },
    ];

    const seedPasswords: Record<string, string> = {
      'user-admin-1': 'SHM@!#3254*sa',
      'user-saleh-2': 'SHM@!#3254*sa',
      'user-1790955554296-ex3h9': 'TO@1020*shm',
    };

    const seedThemes: Record<string, UserThemeConfig> = {
      'user-admin-1': THEME_PRESETS.dark,
      'user-saleh-2': {
        ...THEME_PRESETS.glass,
        presetId: 'glass',
        primaryColor: '#0284c7',
        backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
        backgroundImageUrl: "data:image/jpeg;base64,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",
        borderRadius: 'rounded-2xl',
        bgImageOpacity: 0.25,
        buttonShadow: 'glow',
        cardTextColor: '#f8fafc',
        imageShape: 'squircle',
        showBranding: false,
      },
      'user-noura-3': {
        ...THEME_PRESETS.creator,
        primaryColor: '#8b5cf6',
        backgroundColor: '#faf5ff',
      },
      'user-tuwaiq-4': THEME_PRESETS.luxury,
      'user-tariq-5': THEME_PRESETS.minimal,
    };

    const seedBlocks: Block[] = [
      // Blocks for Saleh Al-Yassin (100% Real Synchronized Blocks)
      {"highlight":false,"email":"","isActive":true,"createdAt":"2026-10-02T21:24:05.250Z","phone":"+966500680180","locationAddress":"","updatedAt":"2026-10-02T21:24:05.250Z","userId":"user-saleh-2","badge":"","fileUrl":"","clicksCount":0,"type":"whatsapp","imageUrl":"","message":"السلام عليكم، وصلت إليكم عن طريق صفحتكم وأرغب في الاستفسار.","order":1,"socials":[],"content":"","url":"","id":"block-1790976245250-vexk","videoUrl":"","fileName":"","subtitle":"","title":"تواصل عبر واتساب"},
      {"locationAddress":"","type":"whatsapp","subtitle":"واتساب مباشر","videoUrl":"","fileName":"","order":1,"clicksCount":344,"content":"","socials":[],"imageUrl":"","message":"السلام عليكم أ. صالح، وصلت إليك عن طريق صفحتك الرقمية.","title":"واتساب","userId":"user-saleh-2","email":"","fileUrl":"","phone":"966501234567","url":"","createdAt":"2026-01-16T10:00:00Z","highlight":true,"isActive":true,"id":"block-saleh-1","updatedAt":"2026-01-16T10:00:00Z","badge":"وصل"},
      {"createdAt":"2026-01-16T10:10:00Z","title":"بوت التحدث ا...","highlight":false,"imageUrl":"","updatedAt":"2026-01-16T10:10:00Z","userId":"user-saleh-2","socials":[],"content":"","order":2,"locationAddress":"","fileName":"","videoUrl":"","subtitle":"https://t.me/alahsaeybot","id":"block-saleh-2","clicksCount":1,"message":"","type":"link","badge":"","fileUrl":"","isActive":true,"phone":"","url":"https://t.me/alahsaeybot","email":""},
      {"fileName":"","videoUrl":"","subtitle":"","title":"تيليجرام","createdAt":"2026-10-02T19:13:12.954Z","highlight":false,"fileUrl":"","updatedAt":"2026-10-02T19:13:12.954Z","order":3,"url":"https://t.me/alahsaeybot","imageUrl":"","userId":"user-saleh-2","badge":"","clicksCount":0,"id":"block-1790968392954-2iye","message":"","phone":"","socials":[],"content":"","email":"","type":"link","locationAddress":"","isActive":true},
      {"order":4,"message":"","isActive":true,"locationAddress":"","socials":[],"content":"","title":"انستقرام","type":"link","clicksCount":0,"imageUrl":"","phone":"","email":"","id":"block-1790968436436-vc8m","url":"https://www.instagram.com/alahsaey?stkn=YzZ0N244eDNiM2lv","badge":"","userId":"user-saleh-2","updatedAt":"2026-10-02T19:13:56.436Z","fileName":"","videoUrl":"","subtitle":"","createdAt":"2026-10-02T19:13:56.436Z","highlight":false,"fileUrl":""},
      {"imageUrl":"","url":"https://x.com/alahsaey","email":"","userId":"user-saleh-2","type":"link","phone":"","id":"block-1790968483135-x9d7","fileUrl":"","fileName":"","videoUrl":"","subtitle":"","badge":"","isActive":true,"socials":[],"content":"","order":5,"message":"","locationAddress":"","updatedAt":"2026-10-02T19:14:43.135Z","clicksCount":0,"highlight":false,"title":"منصة X","createdAt":"2026-10-02T19:14:43.135Z"},

      // Blocks for Noura
      {
        id: 'block-noura-1',
        userId: 'user-noura-3',
        type: 'link',
        title: 'معرض أعمالي على Behance',
        subtitle: 'تصاميم الهويات وتطبيقات الجوال الحديثة',
        url: 'https://behance.net/noura-design',
        isActive: true,
        order: 1,
        clicksCount: 410,
        highlight: true,
        badge: 'أحدث المشاريع',
        createdAt: '2026-02-02T10:00:00Z',
        updatedAt: '2026-02-02T10:00:00Z',
      },
      {
        id: 'block-noura-2',
        userId: 'user-noura-3',
        type: 'whatsapp',
        title: 'طلب تصميم جديد أو هوية بصرية',
        phone: '966509876543',
        message: 'مرحباً نورة، معجب/ة بأعمالك وأرغب في مناقشة تصميم مشروع جديد.',
        isActive: true,
        order: 2,
        clicksCount: 198,
        createdAt: '2026-02-02T10:15:00Z',
        updatedAt: '2026-02-02T10:15:00Z',
      },
    ];

    const seedAuditLogs: AuditLog[] = [
      {
        id: 'audit-1',
        actorId: 'user-admin-1',
        actorName: 'عبدالله السعدون',
        actorRole: 'super_admin',
        action: 'تهيئة النظام وقاعدة البيانات',
        details: 'تم إطلاق منصة روابط نشرك المفضلة وضبط الباقات الأساسية',
        ip: '192.168.1.10',
        timestamp: '2026-01-01T10:05:00Z',
      },
      {
        id: 'audit-2',
        actorId: 'user-admin-1',
        actorName: 'عبدالله السعدون',
        actorRole: 'super_admin',
        action: 'إنشاء حساب عضو',
        targetId: 'user-saleh-2',
        targetName: 'صالح الياسين',
        details: 'إنشاء حساب جديد على باقة الأعمال وتعيين الرابط /saleh',
        ip: '192.168.1.10',
        timestamp: '2026-01-15T09:30:00Z',
      },
      {
        id: 'audit-3',
        actorId: 'user-admin-1',
        actorName: 'عبدالله السعدون',
        actorRole: 'super_admin',
        action: 'تعطيل حساب مستخدم',
        targetId: 'user-tariq-5',
        targetName: 'طارق الدوسري',
        details: 'تعليق الحساب مؤقتاً بانتهاء فترة التجربة وتجديد الباقة',
        ip: '192.168.1.10',
        timestamp: '2026-03-25T11:10:00Z',
      },
    ];

    // STRICT 100% REAL ANALYTICS (Zero fake seed data)
    const seedAnalytics: AnalyticsEvent[] = [];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(seedPasswords));
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(seedThemes));
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(seedBlocks));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(seedAuditLogs));
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(seedAnalytics));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem('wasl_storage_version', STORAGE_VERSION);
  } else {
    // Purge any legacy mock analytics
    const STORAGE_VERSION = 'v8_realtime_cloud_authoritative';
    if (localStorage.getItem('wasl_storage_version') !== STORAGE_VERSION) {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify([]));
      localStorage.setItem('wasl_storage_version', STORAGE_VERSION);
    }
  }
};

// Initialize on load
initStorage();

export const StorageService = {
  subscribe: subscribeToStorage,
  subscribeToStorage: subscribeToStorage,
  notify: notifyListeners,
  // --- USERS ---
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getUserById: (id: string): User | undefined => {
    return StorageService.getUsers().find((u) => u.id === id);
  },

  getUserByUsername: (username: string): User | undefined => {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    return StorageService.getUsers().find((u) => u.username.toLowerCase() === clean);
  },

  getAdminAvatar: (): string => {
    try {
      const admin = StorageService.getUsers().find((u) => u.role === 'super_admin' || u.id === 'user-admin-1');
      if (admin?.avatarUrl) return admin.avatarUrl;
      const settings = StorageService.getSettings();
      if ((settings as any)?.logoUrl) return (settings as any).logoUrl;
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    }
  },

  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, tempPassword?: string): User => {
    const users = StorageService.getUsers();
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User = {
      ...userData,
      id,
      username: userData.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Save initial password
    if (tempPassword) {
      const passwords = StorageService.getPasswords();
      passwords[id] = tempPassword;
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    }

    // Assign default theme
    const themes = StorageService.getAllThemes();
    themes[id] = { ...DEFAULT_THEME };
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));

    notifyListeners();

    // Auto-sync new user to Cloud Firestore immediately
    CloudSyncService.syncProfileToCloud(
      newUser,
      [],
      DEFAULT_THEME,
      tempPassword
    ).catch(() => {});

    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = StorageService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedUser = users[index];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyListeners();

    // Auto-sync live profile to Cloud Firestore so all viewers/QR scanners see it immediately
    CloudSyncService.syncProfileToCloud(
      updatedUser,
      StorageService.getUserBlocks(id),
      StorageService.getUserTheme(id)
    ).catch(() => {});

    return updatedUser;
  },

  deleteUser: (id: string): boolean => {
    const user = StorageService.getUserById(id);
    let users = StorageService.getUsers();
    users = users.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Remove user blocks
    let blocks = StorageService.getAllBlocks();
    blocks = blocks.filter((b) => b.userId !== id);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));

    // Remove user theme
    const themes = StorageService.getAllThemes();
    delete themes[id];
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));

    // Remove user password
    const passwords = StorageService.getPasswords();
    delete passwords[id];
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));

    notifyListeners();

    // Auto-delete from Cloud Firestore
    CloudSyncService.deleteUserFromCloud(id, user?.username).catch(() => {});
    return true;
  },

  resetPassword: (id: string, newPass: string) => {
    const passwords = StorageService.getPasswords();
    passwords[id] = newPass;
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    notifyListeners();

    // Auto-sync new password to Cloud Firestore
    const user = StorageService.getUserById(id);
    if (user) {
      CloudSyncService.syncProfileToCloud(
        user,
        StorageService.getUserBlocks(id),
        StorageService.getUserTheme(id),
        newPass
      ).catch(() => {});
    }
  },

  getPasswords: (): Record<string, string> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  // --- BLOCKS / PAGE BUILDER ---
  getAllBlocks: (): Block[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOCKS);
      if (!data) return [];
      const parsed: Block[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      const map = new Map<string, Block>();
      let hadDuplicates = false;

      parsed.forEach((b) => {
        if (b && b.id) {
          if (map.has(b.id)) {
            hadDuplicates = true;
            const existing = map.get(b.id)!;
            const bTime = new Date(b.updatedAt || 0).getTime();
            const exTime = new Date(existing.updatedAt || 0).getTime();
            if (bTime > exTime) {
              map.set(b.id, b);
            }
          } else {
            map.set(b.id, b);
          }
        }
      });

      const uniqueBlocks = Array.from(map.values());
      if (hadDuplicates) {
        localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(uniqueBlocks));
      }

      return uniqueBlocks;
    } catch {
      return [];
    }
  },

  getUserBlocks: (userId: string): Block[] => {
    const userBlocks = StorageService.getAllBlocks().filter((b) => b.userId === userId);
    const map = new Map<string, Block>();
    userBlocks.forEach((b) => {
      if (b && b.id) {
        const existing = map.get(b.id);
        if (!existing || new Date(b.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
          map.set(b.id, b);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  },

  formatSocialUrl: (platform: SocialPlatform, usernameOrUrl: string): string => {
    if (!usernameOrUrl) return '';
    const clean = usernameOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    const user = clean.replace(/^@/, '');
    switch (platform) {
      case 'x':
        return `https://x.com/${user}`;
      case 'snapchat':
        return `https://snapchat.com/add/${user}`;
      case 'instagram':
        return `https://instagram.com/${user}`;
      case 'tiktok':
        return `https://tiktok.com/@${user}`;
      case 'youtube':
        return user.startsWith('UC') || user.startsWith('channel/')
          ? `https://youtube.com/${user}`
          : `https://youtube.com/@${user}`;
      case 'whatsapp':
        return `https://wa.me/${user.replace(/[^0-9]/g, '')}`;
      case 'telegram':
        return `https://t.me/${user}`;
      case 'linkedin':
        return `https://linkedin.com/in/${user}`;
      case 'facebook':
        return `https://facebook.com/${user}`;
      case 'threads':
        return `https://threads.net/@${user}`;
      case 'pinterest':
        return `https://pinterest.com/${user}`;
      case 'github':
        return `https://github.com/${user}`;
      case 'behance':
        return `https://behance.net/${user}`;
      case 'discord':
        return user.startsWith('discord.gg/') ? `https://${user}` : `https://discord.gg/${user}`;
      case 'twitch':
        return `https://twitch.tv/${user}`;
      case 'spotify':
        return `https://open.spotify.com/user/${user}`;
      case 'podcast':
        return `https://podcasts.apple.com/${user}`;
      case 'kwai':
        return `https://kwai-video.com/u/@${user}`;
      case 'website':
      default:
        return `https://${user}`;
    }
  },

  detectSocialPlatform: (title: string, url: string): SocialPlatform | null => {
    const t = (title || '').toLowerCase();
    const u = (url || '').toLowerCase();

    if (t.includes('سناب') || t.includes('snapchat') || u.includes('snapchat.com')) return 'snapchat';
    if (t.includes('واتساب') || t.includes('واتس') || t.includes('whatsapp') || u.includes('wa.me') || u.includes('whatsapp.com')) return 'whatsapp';
    if (t.includes('تويتر') || t.includes('منصة x') || t.includes('x.com') || t.includes('twitter') || u.includes('twitter.com') || u.includes('x.com')) return 'x';
    if (t.includes('انستقرام') || t.includes('انستا') || t.includes('instagram') || u.includes('instagram.com')) return 'instagram';
    if (t.includes('تيك توك') || t.includes('تيكتوك') || t.includes('tiktok') || u.includes('tiktok.com')) return 'tiktok';
    if (t.includes('يوتيوب') || t.includes('youtube') || u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (t.includes('تيليجرام') || t.includes('تلغرام') || t.includes('telegram') || u.includes('t.me') || u.includes('telegram.me')) return 'telegram';
    if (t.includes('لينكد') || t.includes('linkedin') || u.includes('linkedin.com')) return 'linkedin';
    if (t.includes('فيسبوك') || t.includes('facebook') || u.includes('facebook.com') || u.includes('fb.com')) return 'facebook';
    if (t.includes('ثريدز') || t.includes('threads') || u.includes('threads.net')) return 'threads';
    if (t.includes('بنترست') || t.includes('pinterest') || u.includes('pinterest.com')) return 'pinterest';
    if (t.includes('بيهانس') || t.includes('behance') || u.includes('behance.net')) return 'behance';
    if (t.includes('جيت') || t.includes('github') || u.includes('github.com')) return 'github';
    if (t.includes('ديسكورد') || t.includes('discord') || u.includes('discord.gg')) return 'discord';
    if (t.includes('تويتش') || t.includes('twitch') || u.includes('twitch.tv')) return 'twitch';
    if (t.includes('سبوتيفاي') || t.includes('spotify') || u.includes('spotify.com')) return 'spotify';
    if (t.includes('بودكاست') || t.includes('podcast') || u.includes('podcasts.apple.com')) return 'podcast';
    if (t.includes('كواي') || t.includes('kwai') || u.includes('kwai.com')) return 'kwai';

    return null;
  },

  saveBlock: (blockData: Omit<Block, 'id' | 'createdAt' | 'updatedAt' | 'clicksCount'> & { id?: string }): Block => {
    const all = StorageService.getAllBlocks();
    const now = new Date().toISOString();
    let saved: Block;

    if (blockData.id) {
      const index = all.findIndex((b) => b.id === blockData.id);
      if (index !== -1) {
        all[index] = {
          ...all[index],
          ...blockData,
          updatedAt: now,
        };
        saved = all[index];
        localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
        notifyListeners();
      } else {
        saved = {
          ...blockData,
          id: blockData.id,
          clicksCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        all.push(saved);
        localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
        notifyListeners();
      }
    } else {
      const userBlocks = all.filter((b) => b.userId === blockData.userId);
      const maxOrder = userBlocks.length > 0 ? Math.max(...userBlocks.map((b) => b.order || 0)) : 0;
      saved = {
        ...blockData,
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order: blockData.order !== undefined && blockData.order !== 99 ? blockData.order : maxOrder + 1,
        clicksCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      all.push(saved);
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
      notifyListeners();
    }

    // Auto-sync to Cloud Firestore
    const blockUser = StorageService.getUserById(saved.userId);
    if (blockUser) {
      CloudSyncService.syncProfileToCloud(
        blockUser,
        StorageService.getUserBlocks(saved.userId),
        StorageService.getUserTheme(saved.userId)
      ).catch(() => {});
    }

    return saved;
  },

  deleteBlock: (blockId: string): boolean => {
    let all = StorageService.getAllBlocks();
    const target = all.find((b) => b.id === blockId);
    const targetUserId = target?.userId;

    all = all.filter((b) => b.id !== blockId);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    notifyListeners();

    // Auto-sync to Cloud Firestore so removals immediately reflect for all viewers
    if (targetUserId) {
      const blockUser = StorageService.getUserById(targetUserId);
      if (blockUser) {
        CloudSyncService.syncProfileToCloud(
          blockUser,
          StorageService.getUserBlocks(targetUserId),
          StorageService.getUserTheme(targetUserId)
        ).catch(() => {});
      }
    }

    return true;
  },

  reorderBlocks: (userId: string, blockIdsInOrder: string[]) => {
    const all = StorageService.getAllBlocks();
    blockIdsInOrder.forEach((id, index) => {
      const target = all.find((b) => b.id === id && b.userId === userId);
      if (target) {
        target.order = index + 1;
        target.updatedAt = new Date().toISOString();
      }
    });
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    notifyListeners();

    // Auto-sync to Cloud Firestore
    const user = StorageService.getUserById(userId);
    if (user) {
      CloudSyncService.syncProfileToCloud(
        user,
        StorageService.getUserBlocks(userId),
        StorageService.getUserTheme(userId)
      ).catch(() => {});
    }
  },

  toggleBlockActive: (blockId: string): boolean => {
    const all = StorageService.getAllBlocks();
    const target = all.find((b) => b.id === blockId);
    if (!target) return false;
    target.isActive = !target.isActive;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    notifyListeners();

    // Auto-sync to Cloud Firestore
    const blockUser = StorageService.getUserById(target.userId);
    if (blockUser) {
      CloudSyncService.syncProfileToCloud(
        blockUser,
        StorageService.getUserBlocks(target.userId),
        StorageService.getUserTheme(target.userId)
      ).catch(() => {});
    }

    return target.isActive;
  },

  incrementBlockClicks: (blockId: string) => {
    const all = StorageService.getAllBlocks();
    const target = all.find((b) => b.id === blockId);
    if (target) {
      target.clicksCount = (target.clicksCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    }
  },

  // --- THEMES ---
  getAllThemes: (): Record<string, UserThemeConfig> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEMES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getUserTheme: (userId: string): UserThemeConfig => {
    const themes = StorageService.getAllThemes();
    return themes[userId] || DEFAULT_THEME;
  },

  saveUserTheme: (userId: string, themeConfig: Partial<UserThemeConfig>): UserThemeConfig => {
    const themes = StorageService.getAllThemes();
    const current = themes[userId] || DEFAULT_THEME;
    const updated = { ...current, ...themeConfig };
    themes[userId] = updated;
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
    notifyListeners();

    // Auto-sync theme to Cloud Firestore
    const user = StorageService.getUserById(userId);
    if (user) {
      CloudSyncService.syncProfileToCloud(
        user,
        StorageService.getUserBlocks(userId),
        updated
      ).catch(() => {});
    }

    return updated;
  },

  // --- CLOUD SYNC & CROSS-DEVICE PERSISTENCE (NETLIFY / QR CODE LIVE SYNC) ---
  syncUserToCloud: async (userId: string): Promise<boolean> => {
    const user = StorageService.getUserById(userId);
    if (!user) return false;
    const blocks = StorageService.getUserBlocks(userId);
    const theme = StorageService.getUserTheme(userId);
    const passwords = StorageService.getPasswords();
    const pass = passwords[userId];
    return await CloudSyncService.syncProfileToCloud(user, blocks, theme, pass);
  },

  saveCloudSnapshot: (data: { user: User; blocks: Block[]; theme?: UserThemeConfig; password?: string }) => {
    if (!data || !data.user) return;

    // 1. Cache/update user in localStorage
    const users = StorageService.getUsers();
    const existingIdx = users.findIndex(
      (u) => u.id === data.user.id || u.username.toLowerCase() === data.user.username.toLowerCase()
    );
    if (existingIdx !== -1) {
      users[existingIdx] = { ...users[existingIdx], ...data.user };
    } else {
      users.push(data.user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // 2. Authoritative Cloud Blocks (directly assign to this user)
    if (Array.isArray(data.blocks)) {
      let allBlocks = StorageService.getAllBlocks().filter((b) => b.userId !== data.user.id);
      allBlocks.push(...data.blocks);
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(allBlocks));
    }

    // 3. Cache/update theme
    if (data.theme) {
      const themes = StorageService.getAllThemes();
      themes[data.user.id] = data.theme;
      localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
    }

    // 4. Cache/update password
    if (data.password) {
      const passwords = StorageService.getPasswords();
      passwords[data.user.id] = data.password;
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    }

    notifyListeners();
  },

  fetchPublicProfileFromCloud: async (username: string) => {
    try {
      const result = await CloudSyncService.fetchProfileFromCloud(username);
      if (!result) return null;

      StorageService.saveCloudSnapshot(result);
      return result;
    } catch (e) {
      console.warn('fetchPublicProfileFromCloud error:', e);
      return null;
    }
  },

  syncAllFromCloud: async (): Promise<boolean> => {
    try {
      const cloudData = await CloudSyncService.fetchAllDataFromCloud();
      if (!cloudData || !cloudData.users || cloudData.users.length === 0) return false;

      // 1. Cloud users are 100% authoritative!
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cloudData.users));

      // 2. Cloud blocks are 100% authoritative!
      const finalBlocks: Block[] = [];
      Object.values(cloudData.blocksMap).forEach((bList) => {
        if (Array.isArray(bList)) {
          finalBlocks.push(...bList);
        }
      });
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(finalBlocks));

      // 3. Cloud themes are 100% authoritative!
      localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(cloudData.themesMap));

      // 4. Cloud passwords are 100% authoritative!
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(cloudData.passwordsMap));

      // 5. Cloud settings & plans
      if (cloudData.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cloudData.settings));
      }
      if (Array.isArray(cloudData.plans) && cloudData.plans.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(cloudData.plans));
      }

      notifyListeners();
      return true;
    } catch (e) {
      console.warn('syncAllFromCloud error:', e);
      return false;
    }
  },

  // Save decoded profile payload directly to local cache & notify listeners
  saveProfileFromDecoded: (decoded: { user: User; blocks: Block[]; theme?: UserThemeConfig }) => {
    try {
      // 1. Save user
      const users = StorageService.getUsers();
      const existingIdx = users.findIndex(
        (u) => u.id === decoded.user.id || u.username.toLowerCase() === decoded.user.username.toLowerCase()
      );
      if (existingIdx !== -1) {
        users[existingIdx] = { ...users[existingIdx], ...decoded.user };
      } else {
        users.push(decoded.user);
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // 2. Save blocks (overwriting old blocks for this user)
      let allBlocks = StorageService.getAllBlocks();
      allBlocks = allBlocks.filter((b) => b.userId !== decoded.user.id);
      allBlocks.push(...decoded.blocks);
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(allBlocks));

      // 3. Save theme
      if (decoded.theme) {
        const themes = StorageService.getAllThemes();
        themes[decoded.user.id] = decoded.theme;
        localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
      }

      notifyListeners();
    } catch (e) {
      console.error('saveProfileFromDecoded error:', e);
    }
  },

  // --- PLANS ---
  getPlans: (): SubscriptionPlan[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANS);
      return data ? JSON.parse(data) : DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  },

  savePlans: (plans: SubscriptionPlan[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    notifyListeners();
    CloudSyncService.savePlansToCloud(plans).catch(() => {});
  },

  // --- ANALYTICS ---
  getAnalytics: (): AnalyticsEvent[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
    const all = StorageService.getAnalytics();
    const newEvent: AnalyticsEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    all.push(newEvent);

    // Keep size manageable (last 3000 events)
    if (all.length > 3000) {
      all.splice(0, all.length - 3000);
    }

    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(all));
    if (event.type === 'link_click' && event.blockId) {
      StorageService.incrementBlockClicks(event.blockId);
    }
  },

  getUserAnalyticsSummary: (userId: string) => {
    const events = StorageService.getAnalytics().filter((e) => e.userId === userId);
    const views = events.filter((e) => e.type === 'page_view');
    const clicks = events.filter((e) => e.type === 'link_click');
    const ctr = views.length > 0 ? ((clicks.length / views.length) * 100).toFixed(1) : '0';

    // Device breakdown
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    views.forEach((v) => {
      if (v.device in devices) devices[v.device]++;
    });

    // Top Referrers
    const referrersCount: Record<string, number> = {};
    views.forEach((v) => {
      const ref = v.referrer || 'مباشر (Direct)';
      referrersCount[ref] = (referrersCount[ref] || 0) + 1;
    });

    const topReferrers = Object.entries(referrersCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Country Breakdown Calculation (STRICT 100% REAL: ONLY countries that actually appeared in real recorded views!)
    const countryMap: Record<string, { name: string; flag: string; count: number }> = {};

    views.forEach((v) => {
      let rawCountry = v.country || 'غير محدد';
      let name = rawCountry;
      let flag = '🌐';

      if (rawCountry.includes('السعودية')) {
        name = 'المملكة العربية السعودية';
        flag = '🇸🇦';
      } else if (rawCountry.includes('الإمارات')) {
        name = 'الإمارات العربية المتحدة';
        flag = '🇦🇪';
      } else if (rawCountry.includes('الكويت')) {
        name = 'الكويت';
        flag = '🇰🇼';
      } else if (rawCountry.includes('قطر')) {
        name = 'قطر';
        flag = '🇶🇦';
      } else if (rawCountry.includes('مصر')) {
        name = 'مصر';
        flag = '🇪🇬';
      } else if (rawCountry.includes('عُمان')) {
        name = 'سلطنة عُمان';
        flag = '🇴🇲';
      } else if (rawCountry.includes('البحرين')) {
        name = 'البحرين';
        flag = '🇧🇭';
      } else if (rawCountry.includes('الولايات المتحدة')) {
        name = 'الولايات المتحدة';
        flag = '🇺🇸';
      } else if (rawCountry.includes('المملكة المتحدة')) {
        name = 'المملكة المتحدة';
        flag = '🇬🇧';
      } else {
        name = rawCountry.replace(/^[^\s]+\s*/, '') || 'زائر دولي';
        flag = rawCountry.split(' ')[0] || '🌐';
      }

      const key = `${flag} ${name}`;
      if (!countryMap[key]) {
        countryMap[key] = { name, flag, count: 0 };
      }
      countryMap[key].count++;
    });

    const countries = Object.values(countryMap).sort((a, b) => b.count - a.count);

    // Calculate link-by-link performance (Ranked by highest clicks first)
    const blocksMap = new Map<string, number>();
    clicks.forEach((c) => {
      if (c.blockId) {
        blocksMap.set(c.blockId, (blocksMap.get(c.blockId) || 0) + 1);
      }
    });

    const userBlocks = StorageService.getUserBlocks(userId);
    const userLinksPerformance = userBlocks
      .map((b) => {
        const realEventClicks = blocksMap.get(b.id) || 0;
        const totalClicks = Math.max(realEventClicks, b.clicksCount || 0);
        return {
          id: b.id,
          title: b.title || 'رابط بدون عنوان',
          subtitle: b.subtitle || b.url || b.phone || '',
          type: b.type,
          url: b.url,
          clicks: totalClicks,
          isActive: b.isActive,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

    return {
      totalViews: views.length,
      totalClicks: clicks.length,
      ctr: `${ctr}%`,
      devices,
      topReferrers,
      countries,
      userLinksPerformance,
      recentEvents: events.slice(-10).reverse(),
    };
  },

  getDailyGrowthTrend: (userId: string, days = 30) => {
    const events = StorageService.getAnalytics().filter((e) => e.userId === userId);

    const dailyData: {
      date: string;
      displayDate: string;
      weekday: string;
      fullDate: string;
      views: number;
      clicks: number;
      cumulativeViews: number;
      cumulativeClicks: number;
    }[] = [];

    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const viewsByDate: Record<string, number> = {};
    const clicksByDate: Record<string, number> = {};

    events.forEach((ev) => {
      if (!ev.timestamp) return;
      const d = new Date(ev.timestamp);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (ev.type === 'page_view') {
        viewsByDate[key] = (viewsByDate[key] || 0) + 1;
      } else if (ev.type === 'link_click') {
        clicksByDate[key] = (clicksByDate[key] || 0) + 1;
      }
    });

    let runningViews = 0;
    let runningClicks = 0;

    for (let i = days - 1; i >= 0; i--) {
      const cur = new Date(endDate);
      cur.setDate(cur.getDate() - i);
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;

      const dayViews = viewsByDate[key] || 0;
      const dayClicks = clicksByDate[key] || 0;

      runningViews += dayViews;
      runningClicks += dayClicks;

      const m = arabicMonths[cur.getMonth()];
      const dNum = cur.getDate();
      const wDay = arabicDays[cur.getDay()];

      dailyData.push({
        date: key,
        displayDate: `${dNum} ${m}`,
        weekday: wDay,
        fullDate: `${wDay}، ${dNum} ${m} ${cur.getFullYear()}`,
        views: dayViews,
        clicks: dayClicks,
        cumulativeViews: runningViews,
        cumulativeClicks: runningClicks,
      });
    }

    const totalPeriodViews = dailyData.reduce((acc, d) => acc + d.views, 0);
    const totalPeriodClicks = dailyData.reduce((acc, d) => acc + d.clicks, 0);
    const avgDailyViews = (totalPeriodViews / days).toFixed(1);

    let peakDay = dailyData[0] || {
      date: '',
      displayDate: '',
      weekday: '',
      fullDate: '',
      views: 0,
      clicks: 0,
      cumulativeViews: 0,
      cumulativeClicks: 0,
    };
    dailyData.forEach((d) => {
      if (d.views >= peakDay.views) {
        peakDay = d;
      }
    });

    const half = Math.floor(days / 2);
    const firstHalfViews = dailyData.slice(0, half).reduce((acc, d) => acc + d.views, 0);
    const secondHalfViews = dailyData.slice(half).reduce((acc, d) => acc + d.views, 0);

    let growthRate = 0;
    if (firstHalfViews > 0) {
      growthRate = Math.round(((secondHalfViews - firstHalfViews) / firstHalfViews) * 100);
    } else if (secondHalfViews > 0) {
      growthRate = 100;
    }

    return {
      days,
      data: dailyData,
      totalPeriodViews,
      totalPeriodClicks,
      avgDailyViews,
      peakDay,
      growthRate,
    };
  },

  seedDemoAnalytics: (userId: string, count = 45) => {
    const existing = StorageService.getAnalytics();
    const userBlocks = StorageService.getUserBlocks(userId);
    const primaryBlockId = userBlocks[0]?.id;

    const referrers = [
      'منصة X (تويتر)',
      'تطبيق واتساب للأعمال',
      'انستقرام (Bio Link)',
      'روابط مباشرة (Direct)',
      'محرك بحث جوجل',
      'تيك توك',
      'قناة تيليجرام'
    ];
    const devices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet'];
    const countries = [
      '🇸🇦 المملكة العربية السعودية',
      '🇦🇪 الإمارات العربية المتحدة',
      '🇰🇼 الكويت',
      '🇶🇦 قطر',
      '🇪🇬 مصر'
    ];

    const newEvents: AnalyticsEvent[] = [];
    const now = Date.now();
    const msInDay = 86400000;

    // Distribute with an accelerating growth curve over the last 30 days
    for (let i = 0; i < count; i++) {
      // Skew distribution toward recent days to show a positive growth trend
      const progress = Math.pow(Math.random(), 0.7); // bias toward recent
      const dayOffset = Math.floor((1 - progress) * 29);
      const timestamp = new Date(now - dayOffset * msInDay - Math.random() * msInDay * 0.8).toISOString();

      const dev = devices[Math.floor(Math.random() * devices.length)];
      const ref = referrers[Math.floor(Math.random() * referrers.length)];
      const cnt = countries[Math.floor(Math.random() * countries.length)];

      // 1. Page view
      newEvents.push({
        id: `evt-demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        type: 'page_view',
        timestamp,
        device: dev,
        browser: dev === 'mobile' ? 'Mobile Safari' : 'Chrome',
        referrer: ref,
        country: cnt,
      });

      // 2. Chance of a link click (CTR ~ 45%)
      if (Math.random() < 0.45 && primaryBlockId) {
        newEvents.push({
          id: `evt-demo-click-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId,
          type: 'link_click',
          blockId: primaryBlockId,
          timestamp,
          device: dev,
          browser: dev === 'mobile' ? 'Mobile Safari' : 'Chrome',
          referrer: ref,
          country: cnt,
        });
      }
    }

    const merged = [...existing, ...newEvents];
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(merged));
    notifyListeners();
  },

  clearAnalytics: (userId?: string) => {
    if (!userId) {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify([]));
    } else {
      const remaining = StorageService.getAnalytics().filter((e) => e.userId !== userId);
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(remaining));
    }
    notifyListeners();
  },

  // --- AUDIT LOGS ---
  getAuditLogs: (): AuditLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (!data) return [];
      const logs: AuditLog[] = JSON.parse(data);
      const seen = new Set<string>();
      let hasDuplicates = false;
      const sanitized = logs.map((log, idx) => {
        if (!log.id || seen.has(log.id)) {
          hasDuplicates = true;
          const uniqueId = `audit-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
          seen.add(uniqueId);
          return { ...log, id: uniqueId };
        }
        seen.add(log.id);
        return log;
      });
      if (hasDuplicates) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch {
      return [];
    }
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);

    if (logs.length > 500) {
      logs.length = 500;
    }

    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    notifyListeners();
  },

  // --- SETTINGS ---
  getSettings: (): PlatformSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: Partial<PlatformSettings>) => {
    const current = StorageService.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifyListeners();
    CloudSyncService.saveSettingsToCloud(updated).catch(() => {});
  },

  // --- DATA BACKUP & EXPORT/IMPORT (For migrating between domains/GitHub) ---
  exportAllData: (): string => {
    try {
      const payload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        users: StorageService.getUsers(),
        passwords: StorageService.getPasswords(),
        blocks: StorageService.getAllBlocks(),
        themes: JSON.parse(localStorage.getItem(STORAGE_KEYS.THEMES) || '{}'),
        analytics: StorageService.getAnalytics(),
        auditLogs: StorageService.getAuditLogs(),
        settings: StorageService.getSettings(),
        plans: StorageService.getPlans(),
      };
      return JSON.stringify(payload, null, 2);
    } catch (e) {
      console.error('Export error:', e);
      return '';
    }
  },

  importAllData: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.users)) {
        return false;
      }

      if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (data.passwords) localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(data.passwords));
      if (data.blocks) localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(data.blocks));
      if (data.themes) localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(data.themes));
      if (data.analytics) localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(data.analytics));
      if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.plans) localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));

      // Trigger cloud sync for all imported users
      if (Array.isArray(data.users)) {
        data.users.forEach((u: User) => {
          if (u && u.id) {
            StorageService.syncUserToCloud(u.id).catch(() => {});
          }
        });
      }

      notifyListeners();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  resetToDefaults: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    initStorage();
    notifyListeners();
  },

  // Helper for WhatsApp click URL (Req 7)
  formatWhatsAppUrl: (phone: string, message?: string): string => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let url = `https://wa.me/${cleanPhone}`;
    if (message && message.trim().length > 0) {
      url += `?text=${encodeURIComponent(message.trim())}`;
    }
    return url;
  },
};

export function detectVisitorCountry(): { name: string; flag: string } {
  if (typeof window === 'undefined') return { name: 'المملكة العربية السعودية', flag: '🇸🇦' };

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';

    if (timeZone.includes('Riyadh') || lang.includes('SA')) {
      return { name: 'المملكة العربية السعودية', flag: '🇸🇦' };
    }
    if (timeZone.includes('Dubai') || lang.includes('AE')) {
      return { name: 'الإمارات العربية المتحدة', flag: '🇦🇪' };
    }
    if (timeZone.includes('Kuwait') || lang.includes('KW')) {
      return { name: 'الكويت', flag: '🇰🇼' };
    }
    if (timeZone.includes('Qatar') || lang.includes('QA')) {
      return { name: 'قطر', flag: '🇶🇦' };
    }
    if (timeZone.includes('Cairo') || lang.includes('EG')) {
      return { name: 'مصر', flag: '🇪🇬' };
    }
    if (timeZone.includes('Muscat') || lang.includes('OM')) {
      return { name: 'سلطنة عُمان', flag: '🇴🇲' };
    }
    if (timeZone.includes('Bahrain') || lang.includes('BH')) {
      return { name: 'البحرين', flag: '🇧🇭' };
    }
    if (timeZone.includes('America') || lang.includes('US')) {
      return { name: 'الولايات المتحدة', flag: '🇺🇸' };
    }
    if (timeZone.includes('London') || lang.includes('GB')) {
      return { name: 'المملكة المتحدة', flag: '🇬🇧' };
    }

    return { name: 'المملكة العربية السعودية', flag: '🇸🇦' };
  } catch {
    return { name: 'المملكة العربية السعودية', flag: '🇸🇦' };
  }
}
