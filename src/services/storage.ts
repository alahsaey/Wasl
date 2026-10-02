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

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const seedUsers: User[] = [
      {
        id: 'user-admin-1',
        fullName: 'عبدالله السعدون',
        username: 'admin',
        email: 'admin@nashrak.sa',
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
        email: 'saleh@example.com',
        phone: '+966501234567',
        role: 'member',
        status: 'active',
        planId: 'business',
        planExpiresAt: '2027-06-30',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        bio: 'مستشار أعمال ومؤسس شركات ناشئة | أساعد رواد الأعمال في بناء ونمو مشاريعهم الرقمية والتوسع الاستثماري.',
        createdAt: '2026-01-15T09:30:00Z',
        updatedAt: '2026-03-20T14:15:00Z',
        lastLoginAt: '2026-04-01T08:20:00Z',
      },
      {
        id: 'user-noura-3',
        fullName: 'نورة القحطاني',
        username: 'noura',
        email: 'noura.design@example.com',
        phone: '+966509876543',
        role: 'member',
        status: 'active',
        planId: 'pro',
        planExpiresAt: '2026-12-31',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        bio: 'مصممة واجهات وهوية رقمية UI/UX | شغوفة بتحويل الأفكار المعقدة إلى منتجات جميلة وسلسة الاستخدام.',
        createdAt: '2026-02-01T11:00:00Z',
        updatedAt: '2026-03-10T16:00:00Z',
        lastLoginAt: '2026-03-29T19:40:00Z',
      },
      {
        id: 'user-tuwaiq-4',
        fullName: 'مجموعة الأفق التقنية',
        username: 'alofooq',
        email: 'info@alofooq.sa',
        phone: '+966112233445',
        role: 'member',
        status: 'active',
        planId: 'business',
        planExpiresAt: '2027-10-15',
        avatarUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&auto=format&fit=crop&q=80',
        bio: 'حلول التحول الرقمي، الحوسبة السحابية، والاستشارات التقنية للمؤسسات الحكومية والخاصة في المملكة.',
        createdAt: '2026-02-15T13:45:00Z',
        updatedAt: '2026-03-18T10:00:00Z',
        lastLoginAt: '2026-03-31T11:20:00Z',
      },
      {
        id: 'user-tariq-5',
        fullName: 'طارق الدوسري',
        username: 'tariq',
        email: 'tariq@example.com',
        phone: '+966556789012',
        role: 'member',
        status: 'suspended',
        planId: 'free',
        planExpiresAt: '2026-05-01',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        bio: 'كاتب ومصوّر فوتوغرافي، مهتم بتوثيق الطبيعة والتراث العمراني.',
        createdAt: '2026-03-05T15:20:00Z',
        updatedAt: '2026-03-25T11:10:00Z',
        lastLoginAt: '2026-03-15T14:00:00Z',
      },
    ];

    const seedPasswords: Record<string, string> = {
      'user-admin-1': 'admin123',
      'user-saleh-2': 'saleh123',
      'user-noura-3': 'noura123',
      'user-tuwaiq-4': 'alofooq123',
      'user-tariq-5': 'tariq123',
    };

    const seedThemes: Record<string, UserThemeConfig> = {
      'user-admin-1': THEME_PRESETS.dark,
      'user-saleh-2': {
        ...THEME_PRESETS.business,
        primaryColor: '#0284c7',
        buttonStyle: 'soft',
        borderRadius: 'rounded-xl',
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
      // Blocks for Saleh Al-Yassin
      {
        id: 'block-saleh-1',
        userId: 'user-saleh-2',
        type: 'whatsapp',
        title: 'محادثة مباشرة عبر واتساب',
        subtitle: 'تواصل سريع ومباشر بخصوص الاستشارات والمشاريع',
        phone: '966501234567',
        message: 'السلام عليكم أ. صالح، وصلت إليك عن طريق صفحتك الرقمية وأرغب بحجز استشارة أعمال.',
        isActive: true,
        order: 1,
        clicksCount: 342,
        highlight: true,
        badge: 'متاح للرد السريع',
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T10:00:00Z',
      },
      {
        id: 'block-saleh-2',
        userId: 'user-saleh-2',
        type: 'link',
        title: 'موقعي الإلكتروني والمدونة',
        subtitle: 'مقالات في ريادة الأعمال واستراتيجيات التوسع',
        url: 'https://example.com/saleh-blog',
        isActive: true,
        order: 2,
        clicksCount: 512,
        createdAt: '2026-01-16T10:10:00Z',
        updatedAt: '2026-01-16T10:10:00Z',
      },
      {
        id: 'block-saleh-3',
        userId: 'user-saleh-2',
        type: 'social_links',
        title: 'حساباتي في منصات التواصل',
        isActive: true,
        order: 3,
        clicksCount: 220,
        socials: [
          {
            id: 'soc-1',
            platform: 'x',
            usernameOrUrl: 'saleh_alyassin',
            formattedUrl: 'https://x.com/saleh_alyassin',
            isActive: true,
          },
          {
            id: 'soc-2',
            platform: 'linkedin',
            usernameOrUrl: 'saleh-alyassin',
            formattedUrl: 'https://linkedin.com/in/saleh-alyassin',
            isActive: true,
          },
          {
            id: 'soc-3',
            platform: 'youtube',
            usernameOrUrl: '@SalehBusiness',
            formattedUrl: 'https://youtube.com/@SalehBusiness',
            isActive: true,
          },
          {
            id: 'soc-4',
            platform: 'instagram',
            usernameOrUrl: 'saleh.alyassin',
            formattedUrl: 'https://instagram.com/saleh.alyassin',
            isActive: true,
          },
        ],
        createdAt: '2026-01-16T10:20:00Z',
        updatedAt: '2026-01-16T10:20:00Z',
      },
      {
        id: 'block-saleh-4',
        userId: 'user-saleh-2',
        type: 'pdf',
        title: 'تحميل الملف التعريفي وسيرة الإنجازات (PDF)',
        subtitle: 'ملف تعريفي شامل بصيغة PDF يتضمن سابقة المشاريع',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Saleh-Profile-2026.pdf',
        isActive: true,
        order: 4,
        clicksCount: 184,
        createdAt: '2026-01-16T10:30:00Z',
        updatedAt: '2026-01-16T10:30:00Z',
      },
      {
        id: 'block-saleh-5',
        userId: 'user-saleh-2',
        type: 'location',
        title: 'المكتب الرئيسي والاستشارات الحضورية',
        subtitle: 'حي الصحافة، طريق أنس بن مالك، الرياض',
        locationAddress: 'حي الصحافة، طريق أنس بن مالك، الرياض، المملكة العربية السعودية',
        url: 'https://maps.google.com/?q=Riyadh+Saudi+Arabia',
        isActive: true,
        order: 5,
        clicksCount: 88,
        createdAt: '2026-01-16T10:40:00Z',
        updatedAt: '2026-01-16T10:40:00Z',
      },
      {
        id: 'block-saleh-6',
        userId: 'user-saleh-2',
        type: 'contact_card',
        title: 'حفظ بيانات الاتصال في هاتفك (vCard)',
        subtitle: 'أضف صالح مباشرة إلى جهات الاتصال بضغطة زر',
        phone: '+966501234567',
        email: 'saleh@example.com',
        isActive: true,
        order: 6,
        clicksCount: 295,
        createdAt: '2026-01-16T10:50:00Z',
        updatedAt: '2026-01-16T10:50:00Z',
      },

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

    // Seed realistic analytics
    const seedAnalytics: AnalyticsEvent[] = [];
    const devices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet'];
    const browsers = ['Safari Mobile', 'Chrome Mobile', 'Chrome Desktop', 'Firefox', 'Edge'];
    const referrers = ['Instagram Bio', 'X / Twitter', 'WhatsApp Direct', 'LinkedIn Post', 'Google Search', 'Direct Link'];

    // Generate recent 30 days events for Saleh
    const now = new Date();
    for (let i = 25; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const viewsCount = Math.floor(Math.random() * 25) + 15;
      for (let v = 0; v < viewsCount; v++) {
        seedAnalytics.push({
          id: `evt-${i}-${v}`,
          userId: 'user-saleh-2',
          type: 'page_view',
          timestamp: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          country: 'المملكة العربية السعودية',
        });
      }
      // Add clicks
      const clicksCount = Math.floor(viewsCount * 0.45);
      for (let c = 0; c < clicksCount; c++) {
        seedAnalytics.push({
          id: `evt-clk-${i}-${c}`,
          userId: 'user-saleh-2',
          type: 'link_click',
          blockId: seedBlocks[Math.floor(Math.random() * 3)].id,
          timestamp: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          country: 'المملكة العربية السعودية',
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(seedPasswords));
    localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(seedThemes));
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(seedBlocks));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(seedAuditLogs));
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(seedAnalytics));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
};

// Initialize on load
initStorage();

export const StorageService = {
  subscribe: subscribeToStorage,
  subscribeToStorage: subscribeToStorage,
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

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyListeners();
    return users[index];
  },

  deleteUser: (id: string): boolean => {
    let users = StorageService.getUsers();
    users = users.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Remove user blocks
    let blocks = StorageService.getAllBlocks();
    blocks = blocks.filter((b) => b.userId !== id);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));

    notifyListeners();
    return true;
  },

  resetPassword: (id: string, newPass: string) => {
    const passwords = StorageService.getPasswords();
    passwords[id] = newPass;
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    notifyListeners();
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
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getUserBlocks: (userId: string): Block[] => {
    return StorageService.getAllBlocks()
      .filter((b) => b.userId === userId)
      .sort((a, b) => a.order - b.order);
  },

  saveBlock: (blockData: Omit<Block, 'id' | 'createdAt' | 'updatedAt' | 'clicksCount'> & { id?: string }): Block => {
    const all = StorageService.getAllBlocks();
    const now = new Date().toISOString();

    if (blockData.id) {
      const index = all.findIndex((b) => b.id === blockData.id);
      if (index !== -1) {
        all[index] = {
          ...all[index],
          ...blockData,
          updatedAt: now,
        };
        localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
        notifyListeners();
        return all[index];
      }
    }

    const newBlock: Block = {
      ...blockData,
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clicksCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    all.push(newBlock);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    notifyListeners();
    return newBlock;
  },

  deleteBlock: (blockId: string): boolean => {
    let all = StorageService.getAllBlocks();
    all = all.filter((b) => b.id !== blockId);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    notifyListeners();
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
  },

  toggleBlockActive: (blockId: string): boolean => {
    const all = StorageService.getAllBlocks();
    const target = all.find((b) => b.id === blockId);
    if (!target) return false;
    target.isActive = !target.isActive;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(all));
    notifyListeners();
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
    return updated;
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

    return {
      totalViews: views.length,
      totalClicks: clicks.length,
      ctr: `${ctr}%`,
      devices,
      topReferrers,
      recentEvents: events.slice(-10).reverse(),
    };
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
  },

  // Helpers for Social Media URL Formatting (Req 6)
  formatSocialUrl: (platform: SocialPlatform, usernameOrUrl: string): string => {
    const val = usernameOrUrl.trim();
    if (val.startsWith('http://') || val.startsWith('https://')) {
      return val;
    }
    const cleanUser = val.replace(/^@/, '');
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${cleanUser}`;
      case 'tiktok':
        return `https://tiktok.com/@${cleanUser}`;
      case 'youtube':
        return cleanUser.startsWith('@') ? `https://youtube.com/${cleanUser}` : `https://youtube.com/@${cleanUser}`;
      case 'x':
        return `https://x.com/${cleanUser}`;
      case 'facebook':
        return `https://facebook.com/${cleanUser}`;
      case 'linkedin':
        return `https://linkedin.com/in/${cleanUser}`;
      case 'snapchat':
        return `https://snapchat.com/add/${cleanUser}`;
      case 'telegram':
        return `https://t.me/${cleanUser}`;
      case 'whatsapp':
        return `https://wa.me/${cleanUser.replace(/[^0-9]/g, '')}`;
      case 'pinterest':
        return `https://pinterest.com/${cleanUser}`;
      case 'threads':
        return `https://threads.net/@${cleanUser}`;
      case 'github':
        return `https://github.com/${cleanUser}`;
      case 'behance':
        return `https://behance.net/${cleanUser}`;
      default:
        return `https://${cleanUser}`;
    }
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
