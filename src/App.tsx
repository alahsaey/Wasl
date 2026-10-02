import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/common/Toast';
import { LoginForm } from './components/auth/LoginForm';
import { AdminLayout } from './components/admin/AdminLayout';
import { UserLayout } from './components/user/UserLayout';
import { PublicProfilePage } from './components/preview/PublicProfilePage';
import { AuthService, AuthState } from './services/auth';
import { StorageService } from './services/storage';
import { CloudSyncService } from './services/cloudSync';
import { User } from './types';
import { decodeProfileFromPayload } from './utils/profilePayload';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(AuthService.getInitialState());
  const [publicViewUsername, setPublicViewUsername] = useState<string | null>(null);
  const [cloudLoadedUser, setCloudLoadedUser] = useState<User | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);

  // Check initial URL parameters for public page (e.g. ?u=saleh or ?p=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('u');
      const payloadParam = params.get('p');

      // 1. Direct Instant Payload in URL / QR code (highest priority, 0ms latency)
      if (payloadParam) {
        const decoded = decodeProfileFromPayload(payloadParam);
        if (decoded) {
          StorageService.saveProfileFromDecoded(decoded);
          setPublicViewUsername(decoded.user.username.toLowerCase());
          setCloudLoadedUser(decoded.user);
          return;
        }
      }

      // 2. Standard username parameter
      if (userParam) {
        setPublicViewUsername(userParam.toLowerCase());
      }
    }
  }, []);

  // Sync public user from Cloud Firestore when requested (QR scan / public URL)
  useEffect(() => {
    if (publicViewUsername) {
      const local = StorageService.getUserByUsername(publicViewUsername);
      if (local) {
        setCloudLoadedUser(local);
      } else {
        setCloudLoading(true);
      }

      StorageService.fetchPublicProfileFromCloud(publicViewUsername)
        .then((cloud) => {
          if (cloud) {
            setCloudLoadedUser(cloud.user);
          }
        })
        .finally(() => {
          setCloudLoading(false);
        });

      // Realtime listener for live sync across all devices
      const unsubLive = CloudSyncService.subscribeToUserProfile(publicViewUsername, (data) => {
        if (data.user) {
          setCloudLoadedUser(data.user);
          StorageService.saveCloudSnapshot(data);
        }
      });

      return () => {
        unsubLive();
      };
    } else {
      setCloudLoadedUser(null);
    }
  }, [publicViewUsername]);

  // Subscribe to auth state updates
  useEffect(() => {
    const unsub = AuthService.subscribe((state) => {
      setAuthState(state);
    });
    return unsub;
  }, []);

  // Live Cloud Firestore real-time sync for authenticated user
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.username) {
      const username = authState.user.username;

      StorageService.fetchPublicProfileFromCloud(username).then((cloud) => {
        if (cloud && cloud.user) {
          AuthService.updateCurrentUserState(cloud.user);
        }
      });

      const unsubUserLive = CloudSyncService.subscribeToUserProfile(username, (data) => {
        if (data.user) {
          StorageService.saveCloudSnapshot(data);
          AuthService.updateCurrentUserState(data.user);
        }
      });

      return () => {
        unsubUserLive();
      };
    }
  }, [authState.isAuthenticated, authState.user?.id]);

  // Update SEO Title and Meta dynamically based on route (Req 17)
  useEffect(() => {
    if (publicViewUsername) {
      const publicUser = StorageService.getUserByUsername(publicViewUsername);
      if (publicUser) {
        document.title = `${publicUser.fullName} | روابط وحسابات التواصل`;
        return;
      }
    }

    if (authState.isAuthenticated && authState.user) {
      if (authState.user.role === 'super_admin' && !authState.impersonator) {
        document.title = 'لوحة تحكم الإدارة العليا | روابط نشرك المفضلة';
      } else {
        document.title = `لوحة التحكم | ${authState.user.fullName}`;
      }
      return;
    }

    document.title = 'روابط نشرك المفضلة | منصة الهوية الرقمية والروابط للأفراد والشركات';
  }, [publicViewUsername, authState]);

  // Navigate to public view
  const handleOpenPublicView = (username?: string) => {
    const target = username || authState.user?.username;
    if (target) {
      setPublicViewUsername(target);
      // update URL without full reload
      const newUrl = `${window.location.pathname}?u=${target}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  // Back from public view
  const handleBackToApp = () => {
    setPublicViewUsername(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  // Update user profile in session
  const handleUserUpdated = (updatedUser: User) => {
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  };

  // 1. PUBLIC PROFILE VIEW (e.g., domain.com/?u=saleh or user clicked "زيارة صفحتي")
  if (publicViewUsername) {
    if (cloudLoading && !cloudLoadedUser) {
      return (
        <ToastProvider>
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-cairo text-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold">جاري تحميل أحدث بيانات الصفحة الرقمية...</p>
          </div>
        </ToastProvider>
      );
    }

    const targetUser = cloudLoadedUser || StorageService.getUserByUsername(publicViewUsername);

    if (!targetUser) {
      return (
        <ToastProvider>
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-cairo text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold">الصفحة غير موجودة</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              لم يتم العثور على أي صفحة رقمية نشطة باسم المستخدم: @{publicViewUsername}
            </p>
            <button
              onClick={handleBackToApp}
              className="mt-6 py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
            >
              العودة للرئيسية
            </button>
          </div>
        </ToastProvider>
      );
    }

    return (
      <ToastProvider>
        <PublicProfilePage
          user={targetUser}
          onBackToApp={handleBackToApp}
        />
      </ToastProvider>
    );
  }

  // 2. AUTHENTICATION VIEW (If not logged in)
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <ToastProvider>
        <LoginForm
          onSuccess={() => {}}
          onViewDemoPage={(username) => handleOpenPublicView(username)}
        />
      </ToastProvider>
    );
  }

  // 3. SUPER ADMIN DASHBOARD
  // If user is super_admin and NOT currently impersonating another user
  if (authState.user.role === 'super_admin' && !authState.impersonator) {
    return (
      <ToastProvider>
        <AdminLayout
          adminUser={authState.user}
          onLogout={() => AuthService.logout()}
          onImpersonate={(member) => {
            // Handled inside AuthService, state updates automatically
          }}
          onViewPublicProfile={(username) => handleOpenPublicView(username)}
        />
      </ToastProvider>
    );
  }

  // 4. MEMBER DASHBOARD (Or Admin Impersonating a Member)
  return (
    <ToastProvider>
      <UserLayout
        user={authState.user}
        impersonator={authState.impersonator}
        onOpenPublicView={() => handleOpenPublicView(authState.user!.username)}
        onUserUpdated={handleUserUpdated}
        onLogout={() => AuthService.logout()}
      />
    </ToastProvider>
  );
}
