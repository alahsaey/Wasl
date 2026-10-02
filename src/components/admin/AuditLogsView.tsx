import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';
import { StorageService } from '../../services/storage';

export const AuditLogsView: React.FC = () => {
  const [logs] = useState(StorageService.getAuditLogs());
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.actorName.toLowerCase().includes(search.toLowerCase()) ||
        (l.targetName && l.targetName.toLowerCase().includes(search.toLowerCase())) ||
        (l.details && l.details.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [logs, search]);

  return (
    <div className="space-y-6 text-right font-cairo">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          سجل العمليات والرقابة (Audit Log)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          توثيق آمن وغير قابل للتعديل لجميع العمليات الإدارية، تسجيلات الدخول، والمحاكاة مع عناوين IP
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بنوع العملية، المنفّذ، العضو المستهدف..."
          className="w-full text-xs bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">الوقت والتاريخ</th>
                <th className="py-3.5 px-4">المنفّذ</th>
                <th className="py-3.5 px-4">الصلاحية</th>
                <th className="py-3.5 px-4">العملية</th>
                <th className="py-3.5 px-4">التفاصيل</th>
                <th className="py-3.5 px-4">المستهدف</th>
                <th className="py-3.5 px-4 font-mono text-left dir-ltr">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لا توجد سجلات مطابقة.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={`${log.id}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {log.actorName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.actorRole === 'super_admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.actorRole === 'super_admin' ? 'Super Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {log.targetName || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-left dir-ltr">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
