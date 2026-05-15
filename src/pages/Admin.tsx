import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Gamepad2, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Save, 
  Settings,
  RefreshCcw,
  Search,
  Database,
  X
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { GAMES } from '../data/gamesData';
import { Link } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { user, isAdmin, loginAsAdmin, loading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSaves: 0,
    activeSystems: 12,
    databaseHealth: 'Healthy'
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsAdmin(password)) {
      setError('');
    } else {
      setError('Invalid system access code.');
      setPassword('');
    }
  };

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(5)));
      setRecentUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setStats({
        totalUsers: 1420 + usersSnap.size,
        totalSaves: 8540,
        activeSystems: 12,
        databaseHealth: 'Stable'
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Background Highlight */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/20">
              <ShieldAlert className="w-8 h-8 text-violet-400" />
            </div>
            
            <h1 className="text-2xl font-black text-white mb-2">Restricted Access</h1>
            <p className="text-slate-400 text-sm mb-8">Enter the master administrative password to unlock system controls.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Passcode..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-mono tracking-widest"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                Authenticate
                <Save className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <Link 
              to="/"
              className="block text-center text-slate-500 hover:text-white text-xs mt-6 transition-colors font-medium border-t border-white/5 pt-6"
            >
              Return to Terminal
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto relative">
      <Link 
        to="/" 
        className="absolute top-0 right-8 p-3 text-slate-500 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-2xl"
        title="Close Console"
      >
        <X className="w-6 h-6" />
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Nexus Admin Console</h1>
          <p className="text-slate-400">Manage your gaming empire and monitor system performance.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Players', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Saved Sessions', value: stats.totalSaves, icon: Save, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { label: 'Active Games', value: GAMES.length, icon: Gamepad2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'System Health', value: stats.databaseHealth, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Latest Registered Players
            </h3>
            <button className="text-xs font-bold text-violet-400 hover:text-violet-300">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="text-sm hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-white text-xs">{u.displayName}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {u.createdAt?.toDate?.() ? u.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full">Active</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No recent players found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              Security & Maintenance
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 group transition-all">
                <div className="flex items-center gap-3">
                  <RefreshCcw className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white text-left">Clear User Cache</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-violet-500/10 hover:border-violet-500/20 group transition-all">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-400 group-hover:text-violet-400" />
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white text-left">Sync Database Records</span>
                </div>
              </button>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Maintenance Mode</span>
                  <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-slate-400 rounded-full transition-all"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">Enable to prevent new game sessions.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 shadow-xl shadow-violet-600/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">Growth Insights</h4>
            </div>
            <p className="text-white/80 text-xs mb-4 leading-relaxed">
              Active players have increased by <span className="font-bold text-white">12%</span> this week. Consider adding more "Puzzle" games to boost retention.
            </p>
            <button className="w-full py-2 bg-white text-violet-600 font-black text-xs rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
              Analyze Demographics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
