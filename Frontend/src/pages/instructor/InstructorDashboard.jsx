import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const genRevenue = () => MONTH_LABELS.slice(0, new Date().getMonth() + 1).map(m => ({ month: m, revenue: Math.floor(Math.random() * 3000) + 500 }));

const StatCard = ({ icon, label, value, color = 'bg-primary/10 text-primary' }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
    <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center text-xl mb-4`}>{icon}</div>
    <p className="text-secondary text-sm font-medium mb-1">{label}</p>
    <p className="text-3xl font-extrabold text-textMain">{value}</p>
  </div>
);

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData] = useState(genRevenue());

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          axios.get(`/api/courses/instructor/${user.id}`),
          axios.get(`/api/courses/instructor/${user.id}/analytics`).catch(() => ({ data: null })),
        ]);
        setCourses(cRes.data || []);
        setAnalytics(aRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const totalStudents = analytics?.totalStudents || courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0);
  const totalRevenue = analytics?.totalRevenue || courses.reduce((a, c) => a + ((c.enrollmentCount || 0) * (c.price || 0)), 0);
  const avgRating = analytics?.avgRating || (courses.filter(c => c.averageRating).reduce((a, c, _, arr) => a + c.averageRating / arr.length, 0));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-8 shrink-0">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white font-extrabold text-lg flex items-center justify-center shadow-soft-purple">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-textMain capitalize truncate max-w-[120px]">{user?.username}</p>
              <p className="text-xs text-primary font-bold">Instructor</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { label: 'Overview', icon: '📊', path: '/instructor/dashboard' },
            { label: 'Create Course', icon: '➕', path: '/instructor/course-builder' },
            { label: 'Grading Queue', icon: '✏️', path: '/instructor/grading' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-secondary hover:bg-gray-50 hover:text-textMain transition-all">
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="px-4">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-50 transition-all">
            <span>🚪</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-secondary text-sm font-medium mb-1">Welcome back,</p>
            <h1 className="text-4xl font-extrabold text-textMain capitalize">{user?.username} 👋</h1>
          </div>
          <button onClick={() => navigate('/instructor/course-builder')} className="btn-primary flex items-center gap-2 shadow-soft-purple">
            <span className="text-lg">+</span> New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon="🧑‍🎓" label="Total Students" value={totalStudents.toLocaleString()} />
          <StatCard icon="💰" label="Total Revenue" value={`$${Math.round(totalRevenue).toLocaleString()}`} color="bg-green-50 text-green-600" />
          <StatCard icon="📚" label="Active Courses" value={courses.length} color="bg-blue-50 text-blue-600" />
          <StatCard icon="⭐" label="Avg. Rating" value={avgRating > 0 ? avgRating.toFixed(1) : '–'} color="bg-amber-50 text-amber-600" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
            <h3 className="font-extrabold text-textMain mb-1">Revenue Growth</h3>
            <p className="text-secondary text-xs mb-5">Monthly earnings this year</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c48f2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6c48f2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6c48f2" strokeWidth={3} fill="url(#revGrad)" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
            <h3 className="font-extrabold text-textMain mb-1">Student Enrollments</h3>
            <p className="text-secondary text-xs mb-5">Per course breakdown</p>
            {courses.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-secondary text-sm">No course data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={courses.slice(0, 6).map(c => ({ name: c.title?.slice(0, 14) + '...', students: c.enrollmentCount || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '13px' }} />
                  <Bar dataKey="students" fill="#6c48f2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Course List */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-extrabold text-textMain">My Courses</h2>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-textMain mb-2">No courses yet</h3>
              <p className="text-secondary mb-6">Create your first course to get started.</p>
              <button onClick={() => navigate('/instructor/course-builder')} className="btn-primary shadow-soft-purple">Create Course →</button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Students</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Access</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg shrink-0">📚</div>
                          <div>
                            <p className="font-bold text-textMain line-clamp-1">{c.title}</p>
                            <p className="text-xs text-secondary">{c.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-textMain">{(c.enrollmentCount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {c.averageRating ? <span className="flex items-center gap-1 font-bold text-amber-500">⭐ {c.averageRating.toFixed(1)}</span> : <span className="text-secondary text-xs">No ratings</span>}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-primary">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${c.accessType === 'PUBLIC' ? 'bg-green-50 text-green-600' : c.accessType === 'PASSWORD_PROTECTED' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                          {c.accessType === 'PUBLIC' ? '🌍 Public' : c.accessType === 'PASSWORD_PROTECTED' ? '🔒 Protected' : '✉️ Invite Only'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/instructor/courses/${c.id}`)} className="text-xs btn-secondary py-1.5 px-3">Studio</button>
                          <button onClick={() => navigate(`/instructor/courses/${c.id}/grading`)} className="text-xs bg-primary/10 text-primary rounded-lg py-1.5 px-3 font-bold hover:bg-primary/20 transition-colors">Grade</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
