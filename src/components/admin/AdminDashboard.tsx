/**
 * AdminDashboard.tsx
 * Executive Control Center & Analytics Dashboard for SARTHI Owner (Mihir Jani).
 * Displays system metrics, user registry, telemetry indicators, and security enforcement.
 */
import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Activity,
  Clock,
  Layers,
  CheckCircle2,
  ListTodo,
  BookOpen,
  Database,
  Search,
  Lock,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { adminService } from '../../services/admin/adminService';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = adminService.isAdminUser(currentUser);
  const data = adminService.getAdminDashboardData();
  const { metrics, users } = data;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1C2541] rounded-2xl p-8 border border-red-500/30 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-300 mb-6">
            The SARTHI Admin Control Center is strictly restricted to authorized system owners.
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-[#0B132B] p-3 rounded-lg border border-slate-700">
            Current Account: {currentUser.email || currentUser.name || 'Anonymous User'}
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 p-4 sm:p-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-[#F5B50A] p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center text-[#F5B50A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">SARTHI Owner Control Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Confidential
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              System Owner: <span className="text-blue-300 font-semibold">Mihir Jani</span> • Real-time Application Telemetry
            </p>
          </div>
        </div>

        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-[#1C2541] hover:bg-[#25325c] text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Cloud Mode State Indicator */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          metrics.isCloudActive
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wide">Storage Mode: {metrics.isCloudActive ? 'CLOUD FIRESTORE' : 'LOCAL STORAGE'}</div>
            <div className="text-xs opacity-80">{metrics.statusMessage}</div>
          </div>
        </div>
        <div className="text-[11px] font-mono px-3 py-1 rounded bg-black/40 border border-white/10">
          Sync Status: Ready
        </div>
      </div>

      {/* 12 Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalRegisteredUsers}</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's New Users</span>
            <UserPlus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">+{metrics.todaysNewUsers}</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Daily Active Users (DAU)</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.dailyActiveUsers}</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Weekly Active Users (WAU)</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.weeklyActiveUsers}</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monthly Active Users (MAU)</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.monthlyActiveUsers}</div>
        </div>

        {/* Metric 6 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Session Duration</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{metrics.avgSessionDuration}</div>
        </div>

        {/* Metric 7 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Most Used Module</span>
            <Layers className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl font-black text-white">{metrics.mostUsedModule}</div>
        </div>

        {/* Metric 8 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Habits Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.totalHabitsCompleted}</div>
        </div>

        {/* Metric 9 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Tasks Created</span>
            <ListTodo className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalTasksCreated}</div>
        </div>

        {/* Metric 10 */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Journal Entries</span>
            <BookOpen className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalJournalEntries}</div>
        </div>

        {/* Metric 11: Most Active Users */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-3 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Most Active Users</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-2">
            {metrics.mostActiveUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate max-w-[120px]">{u.name}</span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                  Score: {u.activityScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 12: Latest Registered Users */}
        <div className="bg-[#1C2541] p-5 rounded-2xl border border-slate-800 space-y-3 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Latest Registered Users</span>
            <UserPlus className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2">
            {metrics.latestRegisteredUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate max-w-[120px]">{u.name}</span>
                <span className="text-[10px] text-slate-400">{u.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin User Table Section */}
      <div className="bg-[#1C2541] rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">System User Directory</h2>
            <p className="text-xs text-slate-400">Complete listing of registered user accounts and security attributes.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B132B] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B132B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Signup Date</th>
                <th className="p-3">Last Login</th>
                <th className="p-3">Device</th>
                <th className="p-3">Storage Mode</th>
                <th className="p-3">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 text-xs">
                    No matching registered users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-white">{u.name}</td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{u.mobile}</td>
                    <td className="p-3 text-slate-400">{u.signupDate}</td>
                    <td className="p-3 text-slate-400">{u.lastLogin}</td>
                    <td className="p-3 text-slate-400 max-w-[120px] truncate">{u.device}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {u.storageMode}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.accountStatus}
                      </span>
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
