import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [comments, setComments] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const uRes = await axios.get(`/api/users/${userId}`);
        const u = uRes.data;
        setUser(u);

        if (u.role === 'STUDENT') {
          const [eRes, cmRes, cpRes] = await Promise.all([
            axios.get(`/api/orders/student/${userId}/enrollments`).catch(() => ({ data: [] })),
            axios.get(`/api/community/user/${userId}/comments`).catch(() => ({ data: [] })),
            axios.get(`/api/community/user/${userId}/posts`).catch(() => ({ data: [] })),
          ]);
          const enrolls = eRes.data || [];
          setEnrollments(enrolls);
          setComments(cmRes.data || []);
          setCommunityPosts(cpRes.data || []);
          // Fetch progress per course
          const pMap = {};
          await Promise.all(enrolls.map(async e => {
            try {
              const pRes = await axios.get(`/api/orders/student/${userId}/progress/${e.courseId}`);
              pMap[e.courseId] = pRes.data || [];
            } catch (e) { pMap[e.courseId] = []; }
          }));
          setProgressData(pMap);
        }

        if (u.role === 'INSTRUCTOR') {
          const cRes = await axios.get(`/api/courses/instructor/${userId}`).catch(() => ({ data: [] }));
          setInstructorCourses(cRes.data || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [userId]);

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!user) return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center text-secondary">User not found.</main>
    </div>
  );

  const roleColor = user.role === 'ADMIN' ? 'from-red-500 to-orange-400' : user.role === 'INSTRUCTOR' ? 'from-purple-500 to-pink-400' : 'from-primary to-purple-400';
  const roleBadge = user.role === 'ADMIN' ? 'bg-red-50 text-red-500' : user.role === 'INSTRUCTOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600';

  const STUDENT_TABS = ['overview', 'courses', 'comments', 'community'];
  const INSTRUCTOR_TABS = ['overview', 'courses'];
  const tabs = user.role === 'STUDENT' ? STUDENT_TABS : INSTRUCTOR_TABS;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Back */}
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Users
        </button>

        {/* User Hero */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-8 mb-6 flex items-center gap-6">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${roleColor} text-white text-3xl font-extrabold flex items-center justify-center shadow-soft-purple shrink-0`}>
            {(user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-textMain">{user.username}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${roleBadge}`}>{user.role}</span>
            </div>
            <p className="text-secondary text-sm">{user.email}</p>
            {user.createdAt && <p className="text-secondary text-xs mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={async () => { if (window.confirm(`Delete "${user.username}"?`)) { await axios.delete(`/api/users/${userId}`); navigate('/admin/users'); } }}
              className="bg-red-50 text-red-500 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
              🗑 Delete Account
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-0">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-bold text-sm capitalize transition-all border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-textMain'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ──────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {user.role === 'STUDENT' && <>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-primary mb-1">{enrollments.length}</p><p className="text-secondary text-sm font-medium">Enrolled Courses</p></div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-green-500 mb-1">{enrollments.filter(e => { const p = progressData[e.courseId] || []; return p.length > 0 && p.every(l => l.completed); }).length}</p><p className="text-secondary text-sm font-medium">Completed</p></div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-amber-500 mb-1">{comments.length}</p><p className="text-secondary text-sm font-medium">Comments</p></div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-blue-500 mb-1">{communityPosts.length}</p><p className="text-secondary text-sm font-medium">Community Posts</p></div>
            </>}
            {user.role === 'INSTRUCTOR' && <>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-primary mb-1">{instructorCourses.length}</p><p className="text-secondary text-sm font-medium">Courses Created</p></div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-green-500 mb-1">{instructorCourses.reduce((a, c) => a + (c.enrollmentCount || 0), 0)}</p><p className="text-secondary text-sm font-medium">Total Students</p></div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-amber-500 mb-1">${instructorCourses.reduce((a, c) => a + ((c.enrollmentCount || 0) * (c.price || 0)), 0).toFixed(0)}</p><p className="text-secondary text-sm font-medium">Revenue</p></div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-center"><p className="text-3xl font-extrabold text-blue-500 mb-1">{(instructorCourses.reduce((a, c) => a + (c.averageRating || 0), 0) / (instructorCourses.filter(c => c.averageRating).length || 1)).toFixed(1)}</p><p className="text-secondary text-sm font-medium">Avg Rating</p></div>
            </>}
          </div>
        )}

        {/* ── COURSES TAB (STUDENT) ─────────────────────── */}
        {activeTab === 'courses' && user.role === 'STUDENT' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
                <tr><th className="px-6 py-4">Course ID</th><th className="px-6 py-4">Progress</th><th className="px-6 py-4">Completed</th><th className="px-6 py-4">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enrollments.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-secondary">No enrollments yet.</td></tr>
                ) : enrollments.map(e => {
                  const p = progressData[e.courseId] || [];
                  const done = p.filter(l => l.completed).length;
                  const pct = p.length > 0 ? Math.round((done / p.length) * 100) : 0;
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-textMain">Course #{e.courseId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-100 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                          <span className="font-bold text-primary text-xs">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary text-xs">{done}/{p.length || '?'} lessons</td>
                      <td className="px-6 py-4">
                        <button onClick={() => navigate(`/admin/courses/${e.courseId}`)} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors">View Course</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── COURSES TAB (INSTRUCTOR) ──────────────────── */}
        {activeTab === 'courses' && user.role === 'INSTRUCTOR' && (
          <div className="space-y-4">
            {instructorCourses.length === 0 ? (
              <div className="text-center py-12 text-secondary">This instructor has no courses.</div>
            ) : instructorCourses.map(c => (
              <div key={c.id} className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-textMain text-lg mb-1">{c.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-secondary">
                      <span>👥 {c.enrollmentCount || 0} students</span>
                      <span>💰 {c.price === 0 ? 'Free' : `$${c.price}`}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${c.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{c.status || 'DRAFT'}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/admin/courses/${c.id}`)} className="text-xs bg-primary/10 text-primary px-3 py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors">
                    Full Details →
                  </button>
                </div>
                {/* Sections preview */}
                {(c.sections || []).slice(0, 2).map(s => (
                  <div key={s.id} className="mt-3 ml-2 border-l-2 border-gray-100 pl-4">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">{s.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {(s.lessons || []).slice(0, 4).map(l => (
                        <span key={l.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          {l.type === 'video' ? '🎬' : l.type === 'assignment' ? '📎' : l.type === 'quiz' ? '❓' : '📄'} {l.title?.slice(0, 20)}
                        </span>
                      ))}
                      {(s.lessons || []).length > 4 && <span className="text-[10px] text-secondary">+{s.lessons.length - 4} more</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── COMMENTS TAB ─────────────────────────────── */}
        {activeTab === 'comments' && (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-secondary bg-white rounded-3xl border border-gray-100">No comments found.</div>
            ) : comments.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider">{c.lessonTitle || `Lesson #${c.lessonId}`}</p>
                  <span className="text-xs text-secondary">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-textMain text-sm leading-relaxed">{c.content}</p>
                {c.mentions?.length > 0 && (
                  <div className="flex gap-1 mt-2">{c.mentions.map((m, j) => <span key={j} className="text-primary text-xs font-bold bg-primary/5 px-2 py-0.5 rounded-full">@{m}</span>)}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── COMMUNITY TAB ────────────────────────────── */}
        {activeTab === 'community' && (
          <div className="space-y-3">
            {communityPosts.length === 0 ? (
              <div className="text-center py-12 text-secondary bg-white rounded-3xl border border-gray-100">No community messages found.</div>
            ) : communityPosts.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider">{p.courseTitle || `Course #${p.courseId}`}</p>
                  <span className="text-xs text-secondary">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-textMain text-sm leading-relaxed">{p.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUserDetail;
