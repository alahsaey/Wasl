import { User } from '../types';
import { StorageService } from './storage';

const SESSION_KEY = 'nashrak_auth_session';
const IMPERSONATOR_KEY = 'nashrak_auth_impersonator';

export interface AuthState {
  user: User | null;
  impersonator: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

type AuthListener = (state: AuthState) => void;
const listeners: Set<AuthListener> = new Set();

const notify = (state: AuthState) => {
  listeners.forEach((l) => l(state));
};

export const AuthService = {
  getInitialState: (): AuthState => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      const user: User | null = stored ? JSON.parse(stored) : null;
      const storedImp = localStorage.getItem(IMPERSONATOR_KEY);
      const impersonator: User | null = storedImp ? JSON.parse(storedImp) : null;

      // Validate user still exists in DB
      if (user) {
        const freshUser = StorageService.getUserById(user.id);
        if (!freshUser || freshUser.status === 'suspended') {
          AuthService.logout();
          return { user: null, impersonator: null, isAuthenticated: false, isSuperAdmin: false };
        }
        return {
          user: freshUser,
          impersonator,
          isAuthenticated: true,
          isSuperAdmin: (impersonator || freshUser).role === 'super_admin',
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { user: null, impersonator: null, isAuthenticated: false, isSuperAdmin: false };
  },

  login: (identifier: string, pass: string): { success: boolean; user?: User; error?: string } => {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    const users = StorageService.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني غير مسجل في النظام' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'هذا الحساب معطل حالياً من قِبل إدارة المنصة. يرجى التواصل مع الدعم.' };
    }

    const passwords = StorageService.getPasswords();
    const validPass = passwords[user.id];

    // Strictly verify correct password (no backdoors)
    if (!validPass || validPass !== pass) {
      return { success: false, error: 'كلمة المرور غير صحيحة، يرجى التحقق وإعادة المحاولة.' };
    }

    // Update last login
    StorageService.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    const freshUser = StorageService.getUserById(user.id)!;

    localStorage.setItem(SESSION_KEY, JSON.stringify(freshUser));
    localStorage.removeItem(IMPERSONATOR_KEY);

    // Audit log
    StorageService.addAuditLog({
      actorId: freshUser.id,
      actorName: freshUser.fullName,
      actorRole: freshUser.role,
      action: 'تسجيل دخول ناجح',
      details: `تم تسجيل الدخول بواسطة كلمة المرور (${identifier})`,
      ip: '192.168.1.1',
    });

    const state: AuthState = {
      user: freshUser,
      impersonator: null,
      isAuthenticated: true,
      isSuperAdmin: freshUser.role === 'super_admin',
    };
    notify(state);

    return { success: true, user: freshUser };
  },

  loginWithBiometrics: (user: User): { success: boolean; user: User } => {
    StorageService.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    const freshUser = StorageService.getUserById(user.id)!;

    localStorage.setItem(SESSION_KEY, JSON.stringify(freshUser));
    localStorage.removeItem(IMPERSONATOR_KEY);

    StorageService.addAuditLog({
      actorId: freshUser.id,
      actorName: freshUser.fullName,
      actorRole: freshUser.role,
      action: 'تسجيل دخول ناجح بالبصمة الحيوية',
      details: `تم التحقق والمطابقة بالبصمة الحيوية لجهاز ${freshUser.fullName}`,
      ip: '192.168.1.1',
    });

    const state: AuthState = {
      user: freshUser,
      impersonator: null,
      isAuthenticated: true,
      isSuperAdmin: freshUser.role === 'super_admin',
    };
    notify(state);

    return { success: true, user: freshUser };
  },

  impersonateUser: (targetUserId: string, currentAdmin: User): boolean => {
    const targetUser = StorageService.getUserById(targetUserId);
    if (!targetUser) return false;

    localStorage.setItem(IMPERSONATOR_KEY, JSON.stringify(currentAdmin));
    localStorage.setItem(SESSION_KEY, JSON.stringify(targetUser));

    // Audit log for impersonation (Req 23 & 24)
    StorageService.addAuditLog({
      actorId: currentAdmin.id,
      actorName: currentAdmin.fullName,
      actorRole: 'super_admin',
      action: 'دخول Admin إلى حساب مستخدم (Impersonation)',
      targetId: targetUser.id,
      targetName: targetUser.fullName,
      details: `قام مدير النظام بالدخول إلى لوحة تحكم العضو ${targetUser.fullName} (@${targetUser.username}) للمساعدة`,
      ip: '192.168.1.1',
    });

    notify({
      user: targetUser,
      impersonator: currentAdmin,
      isAuthenticated: true,
      isSuperAdmin: true,
    });

    return true;
  },

  exitImpersonation: () => {
    try {
      const storedImp = localStorage.getItem(IMPERSONATOR_KEY);
      if (storedImp) {
        const admin: User = JSON.parse(storedImp);
        localStorage.setItem(SESSION_KEY, JSON.stringify(admin));
        localStorage.removeItem(IMPERSONATOR_KEY);

        StorageService.addAuditLog({
          actorId: admin.id,
          actorName: admin.fullName,
          actorRole: 'super_admin',
          action: 'إنهاء جلسة الدخول كالمستخدم',
          details: 'تم إنهاء وضع المحاكاة والعودة إلى لوحة تحكم الإدارة العليا',
          ip: '192.168.1.1',
        });

        notify({
          user: admin,
          impersonator: null,
          isAuthenticated: true,
          isSuperAdmin: true,
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  logout: () => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const u = JSON.parse(stored);
        StorageService.addAuditLog({
          actorId: u.id,
          actorName: u.fullName,
          actorRole: u.role,
          action: 'تسجيل خروج',
          details: 'قام المستخدم بتسجيل الخروج من الجلسة',
          ip: '192.168.1.1',
        });
      } catch {}
    }

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(IMPERSONATOR_KEY);

    notify({
      user: null,
      impersonator: null,
      isAuthenticated: false,
      isSuperAdmin: false,
    });
  },

  subscribe: (listener: AuthListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  updateCurrentUserState: (updatedUser: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    const current = AuthService.getInitialState();
    notify({
      ...current,
      user: updatedUser,
    });
  },
};
