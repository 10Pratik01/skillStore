import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Client } from '@stomp/stompjs';

// ── Notification Bell ────────────────────────────────────────────────────────
const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get(`/api/community/notifications/user/${userId}`).then(r => setNotifications(r.data || [])).catch(() => {});
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const client = new Client({
      webSocketFactory: () => new WebSocket(`${proto}://${window.location.host}/ws/community/websocket`),
      reconnectDelay: 5000,
      onConnect: () => client.subscribe(`/topic/notifications/${userId}`, msg => {
        if (msg.body) setNotifications(p => [JSON.parse(msg.body), ...p]);
      }),
    });
    client.activate();
    return () => client.deactivate();
  }, [userId]);

  const markRead = async (id) => {
    try { await axios.patch(`/api/community/notifications/read/${id}`); } catch (e) {}
    setNotifications(p => p.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative w-11 h-11 rounded-full bg-white border border-gray-100 shadow-soft flex items-center justify-center text-secondary hover:text-primary transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">{notifications.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-3xl shadow-soft z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h4 className="font-extrabold text-textMain text-sm">Notifications</h4>
            {notifications.length > 0 && <button onClick={() => setNotifications([])} className="text-xs text-primary font-bold hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0
              ? <p className="text-center text-secondary text-sm p-6">All caught up! 🎉</p>
              : notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} className="p-4 hover:bg-gray-50 cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm">🔔</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-textMain leading-snug">{n.message}</p>
                    <p className="text-[11px] text-secondary mt-1 font-medium">{n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : ''}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Circular Progress Ring ────────────────────────────────────────────────────
const ProgressRing = ({ pct, size = 64, stroke = 6 }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#6c48f2" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
};

// ── Mock weekly activity data ────────────────────────────────────────────────
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const genActivity = () => WEEK_DAYS.map(day => ({ day, lessons: Math.floor(Math.random() * 6) }));

// ── Dashboard Page ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityData] = useState(genActivity());

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== 'STUDENT') { setLoading(false); return; }
      try {
        const studentId = user?.id || 1;
        const [eRes, tRes] = await Promise.all([
          axios.get(`/api/orders/student/${studentId}/enrollments`),
          axios.get(`/api/orders/student/${studentId}/transactions`),
        ]);
        const enrolls = eRes.data || [];
        setEnrollments(enrolls);
        setTransactions(tRes.data || []);

        // Progress per course
        const pMap = {};
        await Promise.all(enrolls.map(async e => {
          try {
            const pRes = await axios.get(`/api/orders/student/${studentId}/progress/${e.courseId}`);
            pMap[e.courseId] = pRes.data || [];
          } catch (e) { pMap[e.courseId] = []; }
        }));
        setProgressData(pMap);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user) fetchData();
  }, [user]);

  if (user?.role === 'INSTRUCTOR') { navigate('/instructor/dashboard'); return null; }
  if (user?.role === 'ADMIN') { navigate('/admin/dashboard'); return null; }

  const completedCourses = enrollments.filter(e => {
    const p = progressData[e.courseId] || [];
    return p.length > 0 && p.every(l => l.completed);
  }).length;

  const totalLessonsCompleted = Object.values(progressData).flat().filter(l => l.completed).length;

  // Pie data
  const pieData = [
    { name: 'Completed', value: completedCourses || 1 },
    { name: 'In Progress', value: Math.max(enrollments.length - completedCourses, 0) },
  ];

  const COLORS = ['#6c48f2', '#e0d9fd'];

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-0px)] bg-background overflow-hidden">

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-8 shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
        {/* User */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white font-extrabold text-lg flex items-center justify-center shadow-soft-purple shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-textMain capitalize truncate">{user?.username}</p>
            <p className="text-xs text-secondary font-medium">Student</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'courses', label: 'My Courses', icon: '📚' },
            { key: 'billing', label: 'Billing', icon: '💳' },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === item.key ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <button onClick={() => navigate('/courses')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-secondary hover:bg-gray-50 hover:text-textMain transition-all">
            <span>🔍</span>Find Courses
          </button>
        </nav>

        <div className="px-4 mt-4">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-50 transition-all">
            <span>🚪</span>Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-textMain mb-1 capitalize">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-secondary">Here's your learning progress at a glance.</p>
          </div>
          <NotificationBell userId={user?.id || 1} />
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Enrolled', value: enrollments.length, icon: '📚', color: 'bg-blue-50 text-blue-600' },
                { label: 'Completed', value: completedCourses, icon: '🏆', color: 'bg-green-50 text-green-600' },
                { label: 'In Progress', value: enrollments.length - completedCourses, icon: '⚡', color: 'bg-amber-50 text-amber-600' },
                { label: 'Lessons Done', value: totalLessonsCompleted, icon: '✅', color: 'bg-purple-50 text-purple-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
                  <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center text-xl mb-4`}>{s.icon}</div>
                  <p className="text-secondary text-sm font-medium mb-1">{s.label}</p>
                  <p className="text-3xl font-extrabold text-textMain">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Area chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
                <h3 className="font-extrabold text-textMain mb-1">Weekly Activity</h3>
                <p className="text-secondary text-xs mb-5">Lessons completed this week</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c48f2" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6c48f2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '13px' }} />
                    <Area type="monotone" dataKey="lessons" stroke="#6c48f2" strokeWidth={3} fill="url(#areaGrad)" dot={{ fill: '#6c48f2', r: 5, strokeWidth: 0 }} activeDot={{ r: 7, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft flex flex-col items-center justify-center">
                <h3 className="font-extrabold text-textMain mb-1 self-start">Course Status</h3>
                <p className="text-secondary text-xs mb-4 self-start">Completion breakdown</p>
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
                <div className="flex gap-4 mt-4">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            {enrollments.length > 0 && (
              <div>
                <h3 className="font-extrabold text-textMain mb-4 text-lg">Continue Learning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {enrollments.slice(0, 3).map(e => {
                    const p = progressData[e.courseId] || [];
                    const done = p.filter(l => l.completed).length;
                    const pct = p.length > 0 ? Math.round((done / p.length) * 100) : 0;
                    return (
                      <div key={e.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-soft-purple transition-all cursor-pointer group" onClick={() => navigate(`/courses/${e.courseId}/learn`)}>
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">📚</div>
                          <ProgressRing pct={pct} size={52} stroke={5} />
                        </div>
                        <h4 className="font-extrabold text-textMain mb-1 group-hover:text-primary transition-colors">Course {e.courseId}</h4>
                        <p className="text-secondary text-xs mb-4 font-medium">{done}/{p.length || '?'} lessons complete</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-primary font-extrabold text-sm mt-2">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MY COURSES TAB ───────────────────────────────────────── */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-textMain">My Courses</h2>
              <button onClick={() => navigate('/courses')} className="btn-secondary text-sm">Find more courses →</button>
            </div>
            {enrollments.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-textMain mb-2">No courses yet</h3>
                <p className="text-secondary mb-6">Explore our catalog to start learning.</p>
                <button onClick={() => navigate('/courses')} className="btn-primary shadow-soft-purple">Explore Courses →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map(e => {
                  const p = progressData[e.courseId] || [];
                  const done = p.filter(l => l.completed).length;
                  const pct = p.length > 0 ? Math.round((done / p.length) * 100) : 0;
                  return (
                    <div key={e.id} onClick={() => navigate(`/courses/${e.courseId}/learn`)}
                      className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 cursor-pointer hover:-translate-y-1 hover:shadow-soft-purple transition-all group">
                      <div className="w-full h-28 bg-gradient-to-br from-primary/10 to-purple-200/30 rounded-2xl mb-5 flex items-center justify-center text-4xl">📚</div>
                      <h4 className="font-extrabold text-textMain mb-1 group-hover:text-primary transition-colors">Course {e.courseId}</h4>
                      <p className="text-secondary text-xs mb-4">{done} of {p.length || '?'} lessons complete</p>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-secondary">Progress</span>
                        <span className="text-xs font-extrabold text-primary">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {/* Add course card */}
                <div onClick={() => navigate('/courses')}
                  className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-6 cursor-pointer flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-primary flex items-center justify-center text-2xl mb-3 group-hover:bg-primary group-hover:text-white transition-all">+</div>
                  <p className="font-extrabold text-textMain mb-1">Find a Course</p>
                  <p className="text-secondary text-xs">Browse 580+ courses</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BILLING TAB ──────────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <div>
            <h2 className="text-2xl font-extrabold text-textMain mb-6">Billing History</h2>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-secondary">No transactions yet.</td></tr>
                  ) : transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-secondary">{tx.transactionId}</td>
                      <td className="px-6 py-4 font-semibold text-textMain">Course {tx.courseId}</td>
                      <td className="px-6 py-4 text-secondary">{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '–'}</td>
                      <td className="px-6 py-4 font-extrabold text-primary">${tx.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
