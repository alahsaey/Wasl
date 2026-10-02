import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Block, UserThemeConfig } from '../types';

/**
 * CloudSyncService:
 * Realtime persistence via Cloud Firestore ensuring that any changes made in the dashboard
 * are immediately visible to anyone scanning the QR code on any device or visiting on Netlify.
 */
export const CloudSyncService = {
  /**
   * Push a user's profile, blocks, and theme to Firestore
   */
  syncProfileToCloud: async (
    user: User,
    blocks: Block[],
    theme?: UserThemeConfig
  ): Promise<boolean> => {
    try {
      const cleanUsername = user.username.toLowerCase().trim();

      // 1. Save user profile doc
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 2. Save username pointer for ultra-fast lookup by username
      await setDoc(doc(db, 'usernames', cleanUsername), {
        userId: user.id,
        username: cleanUsername,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 3. Save user blocks list (overwriting deleted blocks completely so removals reflect immediately)
      await setDoc(doc(db, 'blocks', user.id), {
        userId: user.id,
        blocks: blocks.map((b) => ({
          ...b,
          // ensure clean object for Firestore
          id: b.id,
          title: b.title || '',
          subtitle: b.subtitle || '',
          type: b.type,
          url: b.url || '',
          phone: b.phone || '',
          message: b.message || '',
          imageUrl: b.imageUrl || '',
          order: b.order,
          isActive: b.isActive,
          clicksCount: b.clicksCount || 0,
        })),
        updatedAt: new Date().toISOString(),
      });

      // 4. Save theme if provided
      if (theme) {
        await setDoc(doc(db, 'themes', user.id), {
          ...theme,
          userId: user.id,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return true;
    } catch (error) {
      console.warn('Cloud sync error (fallback to local):', error);
      return false;
    }
  },

  /**
   * Fetch live profile from Cloud Firestore by username (called on QR code scan & public page visit)
   */
  fetchProfileFromCloud: async (
    username: string
  ): Promise<{ user: User; blocks: Block[]; theme?: UserThemeConfig } | null> => {
    try {
      const cleanUsername = username.toLowerCase().trim();

      let targetUserId: string | null = null;
      let userData: User | null = null;

      // 1. Try pointer doc in usernames collection
      const usernameSnap = await getDoc(doc(db, 'usernames', cleanUsername));
      if (usernameSnap.exists()) {
        targetUserId = usernameSnap.data()?.userId;
      }

      // 2. If not found by pointer, query users collection directly
      if (!targetUserId) {
        const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const firstDoc = querySnap.docs[0];
          targetUserId = firstDoc.id;
          userData = firstDoc.data() as User;
        }
      }

      if (!targetUserId) {
        return null;
      }

      // 3. Fetch user document if not already loaded
      if (!userData) {
        const userSnap = await getDoc(doc(db, 'users', targetUserId));
        if (userSnap.exists()) {
          userData = userSnap.data() as User;
        }
      }

      if (!userData) {
        return null;
      }

      // 4. Fetch blocks document
      let blocks: Block[] = [];
      const blocksSnap = await getDoc(doc(db, 'blocks', targetUserId));
      if (blocksSnap.exists()) {
        const data = blocksSnap.data();
        if (Array.isArray(data?.blocks)) {
          blocks = data.blocks;
        }
      }

      // 5. Fetch theme document
      let theme: UserThemeConfig | undefined;
      const themeSnap = await getDoc(doc(db, 'themes', targetUserId));
      if (themeSnap.exists()) {
        theme = themeSnap.data() as UserThemeConfig;
      }

      return {
        user: userData,
        blocks,
        theme,
      };
    } catch (error) {
      console.warn('Failed to fetch profile from cloud Firestore:', error);
      return null;
    }
  },
};
