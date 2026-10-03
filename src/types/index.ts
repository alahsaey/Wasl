export type UserRole = 'super_admin' | 'member';

export type AccountStatus = 'active' | 'suspended' | 'pending';

export type SubscriptionPlanId = 'free' | 'pro' | 'business';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  nameEn: string;
  priceMonthly: number;
  currency: string;
  maxLinks: number;
  maxPages: number;
  allowedThemes: string[];
  hasAnalytics: boolean;
  hasCustomDomain: boolean;
  removeBranding: boolean;
  features: string[];
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  planId: SubscriptionPlanId;
  planExpiresAt?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isFirstLogin?: boolean;
}

export type BlockType =
  | 'link'
  | 'text'
  | 'image'
  | 'video'
  | 'social_links'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'website'
  | 'pdf'
  | 'button'
  | 'divider'
  | 'heading'
  | 'location'
  | 'contact_card';

export interface Block {
  id: string;
  userId: string;
  type: BlockType;
  title: string;
  subtitle?: string;
  url?: string;
  isActive: boolean;
  order: number;
  clicksCount: number;
  icon?: string;
  // Specific block data
  content?: string; // For text, heading
  phone?: string; // For phone, whatsapp
  message?: string; // For whatsapp prefilled message
  email?: string; // For email
  imageUrl?: string; // For image
  videoUrl?: string; // For video
  fileUrl?: string; // For pdf
  fileName?: string;
  locationAddress?: string;
  socials?: SocialAccount[];
  highlight?: boolean;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export type SocialPlatform =
  | 'x'
  | 'snapchat'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'whatsapp'
  | 'telegram'
  | 'linkedin'
  | 'facebook'
  | 'threads'
  | 'pinterest'
  | 'github'
  | 'behance'
  | 'discord'
  | 'twitch'
  | 'spotify'
  | 'podcast'
  | 'kwai'
  | 'website';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  usernameOrUrl: string;
  formattedUrl: string;
  isActive: boolean;
}

export type ThemePresetId =
  | 'minimal'
  | 'business'
  | 'creator'
  | 'dark'
  | 'luxury'
  | 'elegant'
  | 'gradient'
  | 'glass';

export type ButtonStyle = 'solid' | 'outline' | 'soft' | 'glass';
export type ButtonShadow = 'none' | 'subtle' | 'glow' | 'elevated';
export type ImageShape = 'circle' | 'rounded' | 'squircle' | 'square';

export interface UserThemeConfig {
  presetId: ThemePresetId;
  primaryColor: string;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'mesh';
  textColor: string;
  cardBgColor: string;
  cardTextColor: string;
  buttonStyle: ButtonStyle;
  buttonShadow: ButtonShadow;
  borderRadius: string; // e.g., 'rounded-none' | 'rounded-lg' | 'rounded-2xl' | 'rounded-full'
  fontFamily: string; // 'Cairo' | 'IBM Plex Sans Arabic' | 'Tajawal'
  imageShape: ImageShape;
  showVerifiedBadge: boolean;
  showBranding: boolean;
  backgroundImageUrl?: string;
  bgImageOpacity?: number;
  layoutMode?: 'grid' | 'list'; // 'grid' (2 items per row, icon top, text bottom) | 'list' (1 item per row)
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  type: 'page_view' | 'link_click';
  blockId?: string;
  timestamp: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  referrer: string;
  country?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  ip: string;
  timestamp: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  contactEmail: string;
  allowPublicRegistration: boolean;
  defaultPlanId: SubscriptionPlanId;
  footerText: string;
  supportWhatsApp: string;
}
