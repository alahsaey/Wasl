import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  ShieldAlert,
  UserX,
  UserCheck,
  Key,
  LogIn,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { User, AccountStatus, SubscriptionPlanId } from '../../types';
import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/auth';
import { UserCreateModal } from './UserCreateModal';
import { UserEditModal } from './UserEditModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

interface UsersManagementProps {
  currentAdmin: User;
  onImpersonate: (user: User) => void;
  onViewPublicProfile: (username: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  currentAdmin,
  onImpersonate,
  onViewPublicProfile,
}) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlanId>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [impersonateTarget, setImpersonateTarget] = useState<User | null>(null);

  const refreshUsers = () => {
    setUsers(StorageService.getUsers());
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter - show members first, but also admin
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesPlan = planFilter === 'all' || u.planId === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [users, search, statusFilter, planFilter]);

  // Toggle Suspend / Activate
  const handleToggleStatus = (user: User) => {
    if (user.role === 'super_admin') {
      showToast('لا يمكن تعطيل حساب مدير المنصة الرئيسي', 'error');
      return;
    }
    const newStatus: AccountStatus = user.status === 'active' ? 'suspended' : 'active';
    StorageService.updateUser(user.id, { status: newStatus });
    StorageService.addAuditLog({
      actorId: currentAdmin.id,
      actorName: currentAdmin.fullName,
      actorRole: 'super_admin',
      action: newStatus === 'active' ? 'تفعيل حساب مستخدم' : 'تعطيل حساب مستخدم',
      targetId: user.id,
      targetName: user.fullName,
      details: `تم تغيير حالة حساب ${user.fullName} إلى ${newStatus}`,
      ip: '192.168.1.1',
    });
    refreshUsers();
    showToast(newStatus === 'active' ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', 'info');
  };

  // Delete User
  const confirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'super_admin') {
      showToast('لا يمكن حذف حساب مدير النظام الرئيسي', 'error');
      setUserToDelete(null);
      return;
    }

    StorageService.deleteUser(userToDelete.id);
    StorageService.addAuditLog({
      actorId: currentAdmin.id,
      actorName: currentAdmin.fullName,
      actorRole: 'super_admin',
      action: 'حذف مستخدم نهائياً',
      targetId: userToDelete.id,
      targetName: userToDelete.fullName,
      details: `تم حذف حساب وبيانات ${userToDelete.fullName} (@${userToDelete.username})`,
      ip: '192.168.1.1',
    });
    refreshUsers();
    showToast('تم حذف العضو بنجاح', 'success');
    setUserToDelete(null);
  };

  // Impersonate
  const confirmImpersonation = () => {
    if (!impersonateTarget) return;
    AuthService.impersonateUser(impersonateTarget.id, currentAdmin);
    onImpersonate(impersonateTarget);
    setImpersonateTarget(null);
    showToast(`تم الدخول بنجاح كـ ${impersonateTarget.fullName}`, 'info');
  };

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            إدارة الأعضاء والمستخدمين
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            التحكم بالحسابات، الصلاحيات، الباقات، والدخول كمستخدم لتقديم الدعم
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء عضو جديد</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم، أو البريد..."
            className="w-full pr-10 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط (Active)</option>
            <option value="suspended">معطل (Suspended)</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">الباقة:</label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium outline-none"
          >
            <option value="all">جميع الباقات</option>
            <option value="free">المجانية (Free)</option>
            <option value="pro">المحترفين (Pro)</option>
            <option value="business">الأعمال (Business)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">العضو</th>
                <th className="py-3.5 px-4">اسم المستخدم والصفحة</th>
                <th className="py-3.5 px-4">الباقة</th>
                <th className="py-3.5 px-4">حالة الحساب</th>
                <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                <th className="py-3.5 px-4">آخر دخول</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لم يتم العثور على أي مستخدمين مطابقين لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                          <img
                            src={
                              user.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`
                            }
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{user.fullName}</span>
                            {user.role === 'super_admin' && (
                              <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 px-1.5 py-0.2 rounded">
                                مدير
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Username & Public URL */}
                    <td className="py-3.5 px-4 font-mono">
                      <button
                        onClick={() => onViewPublicProfile(user.username)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                        title="فتح الصفحة العامة"
                      >
                        <span>/{user.username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.planId === 'business'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : user.planId === 'pro'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {user.planId === 'business'
                          ? 'الأعمال (Business)'
                          : user.planId === 'pro'
                          ? 'المحترفين (Pro)'
                          : 'المجانية (Free)'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        <span>{user.status === 'active' ? 'نشط' : 'معطل'}</span>
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </td>

                    {/* Last login */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ar-SA') : 'لم يدخل بعد'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Impersonate (الدخول كالمستخدم) */}
                        {user.role !== 'super_admin' && (
                          <button
                            onClick={() => setImpersonateTarget(user)}
                            className="py-1 px-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200/60 flex items-center gap-1 transition"
                            title="الدخول إلى لوحة تحكم العضو"
                          >
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                            <span>دخول اللوحة</span>
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="تعديل البيانات"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Suspend / Activate toggle */}
                        {user.role !== 'super_admin' && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition ${
                              user.status === 'active'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            {user.status === 'active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Delete */}
                        {user.role !== 'super_admin' && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                            title="حذف العضو"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={refreshUsers}
        onImpersonate={onImpersonate}
      />

      {/* Edit Modal */}
      <UserEditModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={refreshUsers}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="تأكيد حذف العضو"
        message={`هل أنت متأكد من حذف حساب العضو "${userToDelete?.fullName}"؟ سيتم حذف صفحته وروابطه نهائياً.`}
        confirmText="نعم، حذف الحساب"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Impersonation Confirm */}
      <ConfirmDialog
        isOpen={!!impersonateTarget}
        title="تأكيد الدخول كالمستخدم (Admin Impersonation)"
        message={`أنت على وشك الدخول كـ "${impersonateTarget?.fullName}". سيتم تسجيل هذا الإجراء في سجل الرقابة (Audit Log). ستتمكن من العودة للوحة الإدارة في أي لحظة.`}
        confirmText="متابعة والدخول للحساب"
        cancelText="إلغاء"
        isDestructive={false}
        onConfirm={confirmImpersonation}
        onCancel={() => setImpersonateTarget(null)}
      />
    </div>
  );
};
