import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Block, UserThemeConfig } from '../types';

/**
 * CloudSyncService:
 * Realtime persistence via Cloud Firestore with onSnapshot listeners
 * ensuring that any changes made on ANY device (PC or Phone)
 * reflect INSTANTLY in milliseconds on all other connected devices and public views.
 */
export const CloudSyncService = {
  /**
   * Push a user's profile, credentials, blocks, and theme to Firestore
   */
  syncProfileToCloud: async (
    user: User,
    blocks: Block[],
    theme?: UserThemeConfig,
    password?: string
  ): Promise<boolean> => {
    try {
      const cleanUsername = user.username.toLowerCase().trim();

      // 1. Save user profile doc
      await setDoc(
        doc(db, 'users', user.id),
        {
          ...user,
          username: cleanUsername,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Save username pointer for ultra-fast lookup by username
      await setDoc(
        doc(db, 'usernames', cleanUsername),
        {
          userId: user.id,
          username: cleanUsername,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 3. Save password if provided
      if (password) {
        await setDoc(
          doc(db, 'passwords', user.id),
          {
            userId: user.id,
            password,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // 4. Save user blocks list (overwriting deleted blocks completely)
      await setDoc(doc(db, 'blocks', user.id), {
        userId: user.id,
        blocks: blocks.map((b) => ({
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

      // 5. Save theme if provided
      if (theme) {
        await setDoc(
          doc(db, 'themes', user.id),
          {
            ...theme,
            userId: user.id,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      return true;
    } catch (error) {
      console.warn('Cloud sync error (fallback to local):', error);
      return false;
    }
  },

  /**
   * Fetch live profile and password from Cloud Firestore by username
   */
  fetchProfileFromCloud: async (
    username: string
  ): Promise<{ user: User; blocks: Block[]; theme?: UserThemeConfig; password?: string } | null> => {
    try {
      const cleanUsername = username.toLowerCase().trim();

      let targetUserId: string | null = null;
      let userData: User | null = null;

      // 1. Try pointer doc in usernames collection
      const usernameSnap = await getDoc(doc(db, 'usernames', cleanUsername));
      if (usernameSnap.exists()) {
        targetUserId = usernameSnap.data()?.userId;
      }

      // 2. Query users collection directly if needed
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

      // 3. Fetch user document
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

      // 6. Fetch password document
      let password: string | undefined;
      const passSnap = await getDoc(doc(db, 'passwords', targetUserId));
      if (passSnap.exists()) {
        password = passSnap.data()?.password;
      }

      return {
        user: userData,
        blocks,
        theme,
        password,
      };
    } catch (error) {
      console.warn('Failed to fetch profile from cloud Firestore:', error);
      return null;
    }
  },

  /**
   * Subscribe to real-time live updates from Cloud Firestore for a given username.
   * Fires the callback INSTANTLY on ALL devices whenever any profile data, avatar, password, or blocks change!
   */
  subscribeToUserProfile: (
    username: string,
    onData: (data: { user: User; blocks: Block[]; theme?: UserThemeConfig; password?: string }) => void
  ): Unsubscribe => {
    const cleanUsername = username.toLowerCase().trim();
    let unsubUser: Unsubscribe | null = null;
    let unsubBlocks: Unsubscribe | null = null;
    let unsubTheme: Unsubscribe | null = null;
    let unsubPass: Unsubscribe | null = null;

    let currentUserId: string | null = null;
    let currentUserData: User | null = null;
    let currentBlocksData: Block[] = [];
    let currentThemeData: UserThemeConfig | undefined = undefined;
    let currentPasswordData: string | undefined = undefined;

    const notifyIfReady = () => {
      if (currentUserData) {
        onData({
          user: currentUserData,
          blocks: currentBlocksData,
          theme: currentThemeData,
          password: currentPasswordData,
        });
      }
    };

    // Listen to the username pointer doc
    const usernameRef = doc(db, 'usernames', cleanUsername);
    const unsubPointer = onSnapshot(usernameRef, (pointerSnap) => {
      if (pointerSnap.exists()) {
        const targetId = pointerSnap.data()?.userId;
        if (targetId && targetId !== currentUserId) {
          currentUserId = targetId;

          if (unsubUser) unsubUser();
          if (unsubBlocks) unsubBlocks();
          if (unsubTheme) unsubTheme();
          if (unsubPass) unsubPass();

          // 1. User doc live listener
          unsubUser = onSnapshot(doc(db, 'users', targetId), (userSnap) => {
            if (userSnap.exists()) {
              currentUserData = userSnap.data() as User;
              notifyIfReady();
            }
          });

          // 2. Blocks doc live listener
          unsubBlocks = onSnapshot(doc(db, 'blocks', targetId), (blocksSnap) => {
            if (blocksSnap.exists()) {
              const bData = blocksSnap.data();
              if (Array.isArray(bData?.blocks)) {
                currentBlocksData = bData.blocks;
                notifyIfReady();
              }
            }
          });

          // 3. Theme doc live listener
          unsubTheme = onSnapshot(doc(db, 'themes', targetId), (themeSnap) => {
            if (themeSnap.exists()) {
              currentThemeData = themeSnap.data() as UserThemeConfig;
              notifyIfReady();
            }
          });

          // 4. Password doc live listener
          unsubPass = onSnapshot(doc(db, 'passwords', targetId), (passSnap) => {
            if (passSnap.exists()) {
              currentPasswordData = passSnap.data()?.password;
              notifyIfReady();
            }
          });
        }
      }
    });

    return () => {
      if (unsubPointer) unsubPointer();
      if (unsubUser) unsubUser();
      if (unsubBlocks) unsubBlocks();
      if (unsubTheme) unsubTheme();
      if (unsubPass) unsubPass();
    };
  },
};
