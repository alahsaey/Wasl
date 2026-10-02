import { User, Block, UserThemeConfig } from '../types';

export interface CompactProfileData {
  u: {
    id?: string;
    fn: string;
    un: string;
    av?: string;
    bio?: string;
    em?: string;
    ph?: string;
  };
  b: Array<{
    id: string;
    t: string;
    ti: string;
    st?: string;
    u?: string;
    ph?: string;
    m?: string;
    im?: string;
    o: number;
    a: boolean;
    hl?: boolean;
    bg?: string;
    so?: any[];
  }>;
  th?: {
    p: string;
    pc: string;
    bc: string;
    bt: string;
    tc: string;
    cc?: string;
    ctc?: string;
  };
  ts: number;
}

/**
 * Encode user profile, blocks, and theme into a compact, URL-safe base64 string
 */
export function encodeProfileToPayload(
  user: User,
  blocks: Block[],
  theme?: UserThemeConfig
): string {
  try {
    const compact: CompactProfileData = {
      u: {
        id: user.id,
        fn: user.fullName,
        un: user.username,
        av: user.avatarUrl,
        bio: user.bio,
        em: user.email,
        ph: user.phone,
      },
      b: blocks.map((b) => ({
        id: b.id,
        t: b.type,
        ti: b.title || '',
        st: b.subtitle,
        u: b.url,
        ph: b.phone,
        m: b.message,
        im: b.imageUrl,
        o: b.order,
        a: b.isActive,
        hl: b.highlight,
        bg: b.badge,
        so: b.socials,
      })),
      th: theme
        ? {
            p: theme.presetId,
            pc: theme.primaryColor,
            bc: theme.backgroundColor,
            bt: theme.backgroundType,
            tc: theme.textColor,
            cc: theme.cardBgColor,
            ctc: theme.cardTextColor,
          }
        : undefined,
      ts: Date.now(),
    };

    const json = JSON.stringify(compact);
    // Encode UTF-8 string safely to base64 for URL query
    const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    ));
    return encoded;
  } catch (err) {
    console.error('Failed to encode profile payload:', err);
    return '';
  }
}

/**
 * Decode a URL payload back into full User, Blocks, and Theme
 */
export function decodeProfileFromPayload(
  payloadStr: string
): { user: User; blocks: Block[]; theme?: UserThemeConfig } | null {
  try {
    const decodedUri = atob(payloadStr)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('');
    const json = decodeURIComponent(decodedUri);
    const compact: CompactProfileData = JSON.parse(json);

    if (!compact || !compact.u || !Array.isArray(compact.b)) {
      return null;
    }

    const user: User = {
      id: compact.u.id || `user-${compact.u.un}`,
      fullName: compact.u.fn,
      username: compact.u.un,
      email: compact.u.em || `${compact.u.un}@example.com`,
      phone: compact.u.ph || '',
      role: 'member',
      status: 'active',
      planId: 'business',
      avatarUrl: compact.u.av,
      bio: compact.u.bio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date(compact.ts || Date.now()).toISOString(),
    };

    const blocks: Block[] = compact.b.map((b) => ({
      id: b.id,
      userId: user.id,
      type: b.t as any,
      title: b.ti,
      subtitle: b.st,
      url: b.u,
      phone: b.ph,
      message: b.m,
      imageUrl: b.im,
      order: b.o,
      isActive: b.a !== false,
      highlight: b.hl,
      badge: b.bg,
      socials: b.so,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    let theme: UserThemeConfig | undefined;
    if (compact.th) {
      theme = {
        presetId: compact.th.p as any,
        primaryColor: compact.th.pc,
        backgroundColor: compact.th.bc,
        backgroundType: compact.th.bt as any,
        textColor: compact.th.tc,
        cardBgColor: compact.th.cc || '#ffffff',
        cardTextColor: compact.th.ctc || '#0f172a',
        buttonStyle: 'soft',
        buttonShadow: 'subtle',
        borderRadius: 'rounded-xl',
        fontFamily: 'Cairo',
        imageShape: 'circle',
        showVerifiedBadge: true,
        showBranding: true,
      };
    }

    return { user, blocks, theme };
  } catch (err) {
    console.warn('Failed to decode profile payload:', err);
    return null;
  }
}
