import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Block, UserThemeConfig } from '../types';

export const CloudSyncService = {
  /**
   * Sync complete user profile, blocks, theme, and password to Cloud Firestore
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

      // 4. Save user blocks list (including all properties and socials)
      await setDoc(doc(db, 'blocks', user.id), {
        userId: user.id,
        blocks: blocks.map((b) => ({
          id: b.id,
          userId: b.userId || user.id,
          title: b.title || '',
          subtitle: b.subtitle || '',
          type: b.type || 'link',
          url: b.url || '',
          phone: b.phone || '',
          email: b.email || '',
          message: b.message || '',
          content: b.content || '',
          imageUrl: b.imageUrl || '',
          videoUrl: b.videoUrl || '',
          fileUrl: b.fileUrl || '',
          fileName: b.fileName || '',
          locationAddress: b.locationAddress || '',
          socials: Array.isArray(b.socials)
            ? b.socials.map((s) => ({
                id: s.id,
                platform: s.platform,
                usernameOrUrl: s.usernameOrUrl || '',
                formattedUrl: s.formattedUrl || '',
                isActive: s.isActive !== false,
              }))
            : [],
          highlight: Boolean(b.highlight),
          badge: b.badge || '',
          order: typeof b.order === 'number' ? b.order : 0,
          isActive: b.isActive !== false,
          clicksCount: typeof b.clicksCount === 'number' ? b.clicksCount : 0,
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString(),
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
    let hasLoadedBlocks = false;
    let currentThemeData: UserThemeConfig | undefined = undefined;
    let currentPasswordData: string | undefined = undefined;

    const notifyIfReady = () => {
      if (currentUserData && hasLoadedBlocks) {
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
            hasLoadedBlocks = true;
            if (blocksSnap.exists()) {
              const bData = blocksSnap.data();
              if (Array.isArray(bData?.blocks)) {
                currentBlocksData = bData.blocks;
              } else {
                currentBlocksData = [];
              }
            } else {
              currentBlocksData = [];
            }
            notifyIfReady();
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

  /**
   * Fetch all registered users, blocks, themes, and passwords from Cloud Firestore.
   * Ensures that when the site is opened on ANY domain/host, all user updates are synchronized.
   */
  fetchAllDataFromCloud: async (): Promise<{
    users: User[];
    blocksMap: Record<string, Block[]>;
    themesMap: Record<string, UserThemeConfig>;
    passwordsMap: Record<string, string>;
  } | null> => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) return null;

      const users: User[] = [];
      usersSnap.forEach((d) => {
        if (d.exists()) {
          users.push(d.data() as User);
        }
      });

      const blocksSnap = await getDocs(collection(db, 'blocks'));
      const blocksMap: Record<string, Block[]> = {};
      blocksSnap.forEach((d) => {
        if (d.exists()) {
          const data = d.data();
          if (Array.isArray(data?.blocks)) {
            blocksMap[d.id] = data.blocks;
          }
        }
      });

      const themesSnap = await getDocs(collection(db, 'themes'));
      const themesMap: Record<string, UserThemeConfig> = {};
      themesSnap.forEach((d) => {
        if (d.exists()) {
          themesMap[d.id] = d.data() as UserThemeConfig;
        }
      });

      const passwordsSnap = await getDocs(collection(db, 'passwords'));
      const passwordsMap: Record<string, string> = {};
      passwordsSnap.forEach((d) => {
        if (d.exists() && d.data()?.password) {
          passwordsMap[d.id] = d.data().password;
        }
      });

      return {
        users,
        blocksMap,
        themesMap,
        passwordsMap,
      };
    } catch (e) {
      console.warn('fetchAllDataFromCloud error:', e);
      return null;
    }
  },
};
