import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon, label, value, sub, color = 'bg-primary/10 text-primary' }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
    <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center text-xl mb-4`}>{icon}</div>
    <p className="text-secondary text-sm font-medium mb-1">{label}</p>
    <p className="text-3xl font-extrabold text-textMain">{value}</p>
    {sub && <p className="text-xs text-secondary mt-1 font-medium">{sub}</p>}
  </div>
);

const PIE_COLORS = ['#6c48f2', '#a78bfa', '#f59e0b'];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          axios.get('/api/users').catch(() => ({ data: [] })),
          axios.get('/api/courses').catch(() => ({ data: [] })),
        ]);
        setUsers(uRes.data || []);
        setCourses(cRes.data || []);
      } catch (e) {} finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const students = users.filter(u => u.role === 'STUDENT');
  const instructors = users.filter(u => u.role === 'INSTRUCTOR');
  const admins = users.filter(u => u.role === 'ADMIN');
  const totalEnrollments = courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0);
  const totalRevenue = courses.reduce((a, c) => a + ((c.enrollmentCount || 0) * (c.price || 0)), 0);

  const pieData = [
    { name: 'Students', value: students.length || 1 },
    { name: 'Instructors', value: instructors.length || 0 },
    { name: 'Admins', value: admins.length || 0 },
  ];

  const topCourses = [...courses].sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)).slice(0, 6);
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  const recentCourses = [...courses].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-10">
          <p className="text-secondary text-sm font-medium mb-1">Admin Panel</p>
          <h1 className="text-4xl font-extrabold text-textMain">Platform Overview</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon="👥" label="Total Users" value={loading ? '–' : users.length} sub={`${students.length} students · ${instructors.length} instructors`} />
          <StatCard icon="📚" label="Total Courses" value={loading ? '–' : courses.length} color="bg-blue-50 text-blue-600" />
          <StatCard icon="🎓" label="Total Enrollments" value={loading ? '–' : totalEnrollments.toLocaleString()} color="bg-green-50 text-green-600" />
          <StatCard icon="💰" label="Platform Revenue" value={loading ? '–' : `$${Math.round(totalRevenue).toLocaleString()}`} color="bg-amber-50 text-amber-600" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Bar chart - top courses */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
            <h3 className="font-extrabold text-textMain mb-1">Top Courses by Enrollment</h3>
            <p className="text-secondary text-xs mb-5">Most popular courses on the platform</p>
            {topCourses.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-secondary text-sm">No course data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topCourses.map(c => ({ name: (c.title || '').slice(0, 12) + '…', students: c.enrollmentCount || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '13px' }} />
                  <Bar dataKey="students" fill="#6c48f2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart - user breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft flex flex-col items-center justify-center">
            <h3 className="font-extrabold text-textMain mb-1 self-start">User Roles</h3>
            <p className="text-secondary text-xs mb-4 self-start">Breakdown by role</p>
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div className="flex flex-col gap-2 mt-4 self-start w-full">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} /><span className="text-secondary font-semibold">{d.name}</span></div>
                  <span className="font-extrabold text-textMain">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-textMain">Recent Registrations</h3>
              <button onClick={() => window.location.href = '/admin/users'} className="text-primary text-xs font-bold hover:underline">View all →</button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers.length === 0 ? (
                <p className="text-center text-secondary text-sm p-6">No users found.</p>
              ) : recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${u.role === 'ADMIN' ? 'bg-gradient-to-tr from-red-500 to-orange-400' : u.role === 'INSTRUCTOR' ? 'bg-gradient-to-tr from-purple-500 to-pink-400' : 'bg-gradient-to-tr from-primary to-purple-400'}`}>
                    {(u.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-textMain text-sm truncate">{u.username}</p>
                    <p className="text-xs text-secondary truncate">{u.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'ADMIN' ? 'bg-red-50 text-red-500' : u.role === 'INSTRUCTOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-textMain">Recent Courses</h3>
              <button onClick={() => window.location.href = '/admin/courses'} className="text-primary text-xs font-bold hover:underline">View all →</button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentCourses.length === 0 ? (
                <p className="text-center text-secondary text-sm p-6">No courses found.</p>
              ) : recentCourses.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-base">📚</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-textMain text-sm truncate">{c.title}</p>
                    <p className="text-xs text-secondary">{c.enrollmentCount || 0} enrolled · {c.price === 0 ? 'Free' : `$${c.price}`}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${c.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status || 'DRAFT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
