import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

const STATUS_STYLE = {
  PUBLISHED: 'bg-green-50 text-green-700',
  DRAFT:     'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

const AdminCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [warnModal, setWarnModal] = useState(null);
  const [warnMsg, setWarnMsg] = useState('');
  const [warnSev, setWarnSev] = useState('WARNING');

  useEffect(() => {
    axios.get('/api/courses').then(r => setCourses(r.data || [])).catch(() => setCourses([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await axios.delete(`/api/courses/${id}`); setCourses(p => p.filter(c => c.id !== id)); }
    catch { alert('Delete failed.'); } finally { setDeleting(null); }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    setUpdatingStatus(courseId);
    try {
      await axios.patch(`/api/courses/${courseId}/status?status=${newStatus}`);
      setCourses(p => p.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
    } catch { alert('Status update failed.'); } finally { setUpdatingStatus(null); }
  };

  const handleIssueWarning = async () => {
    if (!warnMsg.trim() || !warnModal) return;
    try {
      await axios.post('/api/community/warnings', {
        issuedByUserId: user?.id || 1,
        issuedByName: user?.username || 'Admin',
        issuedByRole: 'ADMIN',
        courseId: warnModal.courseId,
        message: warnMsg,
        severity: warnSev,
      });
      setWarnModal(null); setWarnMsg(''); setWarnSev('WARNING');
      alert('Warning issued!');
    } catch { alert('Failed to issue warning.'); }
  };

  const filtered = courses.filter(c => {
    const matchStatus = statusFilter === 'ALL' || (c.status || 'DRAFT') === statusFilter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.instructorName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-secondary text-sm font-medium mb-1">Admin Panel</p>
            <h1 className="text-4xl font-extrabold text-textMain">Course Management</h1>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Total', value: courses.length, color: 'text-primary' },
              { label: 'Published', value: courses.filter(c => c.status === 'PUBLISHED').length, color: 'text-green-600' },
              { label: 'Enrollments', value: courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0), color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-soft text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-secondary font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 mb-6 flex gap-4 items-center">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or instructor..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <div className="flex gap-1.5">
            {['ALL','PUBLISHED','DRAFT','COMPLETED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${statusFilter === s ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>
                {s}{s !== 'ALL' && ` (${courses.filter(c => (c.status||'DRAFT') === s).length})`}
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
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [...Array(4)].map((_,i) => <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-xl animate-pulse"/></td></tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={6} className="px-6 py-12 text-center text-secondary">No courses found.</td></tr>
                  : filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center text-lg">
                            {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover"/> : '📚'}
                          </div>
                          <div>
                            <p className="font-bold text-textMain max-w-[180px] truncate">{c.title}</p>
                            <p className="text-xs text-secondary">{c.category || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => c.instructorId && navigate(`/admin/users/${c.instructorId}`)}
                          className="text-xs text-secondary hover:text-primary font-semibold transition-colors">
                          {c.instructorName || `#${c.instructorId}`}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-semibold">{(c.enrollmentCount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 font-extrabold text-primary">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                      <td className="px-6 py-4">
                        <select
                          value={c.status || 'DRAFT'}
                          onChange={e => handleStatusChange(c.id, e.target.value)}
                          disabled={updatingStatus === c.id}
                          className={`text-[11px] font-extrabold rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer ${STATUS_STYLE[c.status || 'DRAFT']}`}
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <button onClick={() => navigate(`/admin/courses/${c.id}`)}
                            className="text-xs bg-primary/10 text-primary rounded-lg py-1.5 px-3 font-bold hover:bg-primary/20 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => setWarnModal({ courseId: c.id, title: c.title })}
                            className="text-xs bg-amber-50 text-amber-700 rounded-lg py-1.5 px-3 font-bold hover:bg-amber-100 transition-colors">
                            ⚠️ Warn
                          </button>
                          <button onClick={() => handleDelete(c.id, c.title)} disabled={deleting === c.id}
                            className="text-xs bg-red-50 text-red-500 rounded-lg py-1.5 px-3 font-bold hover:bg-red-100 disabled:opacity-50 transition-colors">
                            {deleting === c.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-secondary font-medium">
              Showing {filtered.length} of {courses.length} courses
            </div>
          )}
        </div>
      </main>

      {/* Issue Warning Modal */}
      {warnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-extrabold text-textMain mb-1">⚠️ Issue Warning</h3>
            <p className="text-secondary text-sm mb-5">Course: <strong>{warnModal.title}</strong></p>
            <div className="space-y-4">
              <div className="flex gap-2">
                {['INFO','WARNING','CRITICAL'].map(s => (
                  <button key={s} onClick={() => setWarnSev(s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border-2 transition-all ${
                      warnSev === s
                        ? s==='INFO' ? 'border-blue-400 bg-blue-50 text-blue-700' : s==='WARNING' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 text-secondary'
                    }`}>
                    {s==='INFO'?'ℹ️':s==='WARNING'?'⚠️':'🔴'} {s}
                  </button>
                ))}
              </div>
              <textarea value={warnMsg} onChange={e => setWarnMsg(e.target.value)} rows={4}
                className="input-field resize-none text-sm w-full" placeholder="Warning message for the course instructor..." />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setWarnModal(null); setWarnMsg(''); }} className="flex-1 btn-secondary py-3">Cancel</button>
              <button onClick={handleIssueWarning} disabled={!warnMsg.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-2xl disabled:opacity-50 transition-all">
                Issue Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
