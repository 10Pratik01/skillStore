import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axios.get('/api/courses').then(r => setCourses(r.data || [])).catch(() => setCourses([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete course "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e) { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = courses.filter(c => {
    const matchStatus = statusFilter === 'ALL' || (c.status || 'DRAFT') === statusFilter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.instructorName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const accessIcon = (type) => type === 'PASSWORD_PROTECTED' ? '🔒' : type === 'INVITE_ONLY' ? '✉️' : '🌍';

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-secondary text-sm font-medium mb-1">Admin Panel</p>
            <h1 className="text-4xl font-extrabold text-textMain">Course Management</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-soft text-center">
              <p className="text-2xl font-extrabold text-primary">{courses.length}</p>
              <p className="text-xs text-secondary font-medium">Total Courses</p>
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-soft text-center">
              <p className="text-2xl font-extrabold text-green-500">{courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0)}</p>
              <p className="text-xs text-secondary font-medium">Total Enrollments</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or instructor..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
          </div>
          <div className="flex gap-1.5 shrink-0">
            {['ALL', 'PUBLISHED', 'DRAFT'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all ${statusFilter === s ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>
                {s} {s !== 'ALL' && `(${courses.filter(c => (c.status || 'DRAFT') === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-xl animate-pulse" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-secondary">No courses found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        {c.thumbnailUrl
                          ? <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                          : <div className="w-full h-full flex items-center justify-center text-lg">📚</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-textMain line-clamp-1 max-w-[180px]">{c.title}</p>
                        <p className="text-xs text-secondary">{c.category || 'General'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => c.instructorId && navigate(`/admin/users/${c.instructorId}`)} className="text-secondary text-xs hover:text-primary font-semibold transition-colors">
                      {c.instructorName || `#${c.instructorId}`}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-semibold text-textMain">{(c.enrollmentCount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-extrabold text-primary">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                  <td className="px-6 py-4 text-sm">{accessIcon(c.accessType)} {c.accessType?.replace('_', ' ') || 'PUBLIC'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${(c.status || 'DRAFT') === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status || 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/admin/courses/${c.id}`)} className="text-xs bg-primary/10 text-primary rounded-lg py-1.5 px-3 font-bold hover:bg-primary/20 transition-colors">View →</button>
                      <button onClick={() => handleDelete(c.id, c.title)} disabled={deleting === c.id} className="text-xs bg-red-50 text-red-500 rounded-lg py-1.5 px-3 font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                        {deleting === c.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-secondary font-medium">
              Showing {filtered.length} of {courses.length} courses
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCourses;
