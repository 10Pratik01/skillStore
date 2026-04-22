import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';

const ROLE_TABS = ['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axios.get('/api/users').then(r => setUsers(r.data || [])).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleColor = (role) => {
    if (role === 'ADMIN') return 'bg-red-50 text-red-500';
    if (role === 'INSTRUCTOR') return 'bg-purple-50 text-purple-600';
    return 'bg-blue-50 text-blue-600';
  };
  const avatarColor = (role) => {
    if (role === 'ADMIN') return 'from-red-500 to-orange-400';
    if (role === 'INSTRUCTOR') return 'from-purple-500 to-pink-400';
    return 'from-primary to-purple-400';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-secondary text-sm font-medium mb-1">Admin Panel</p>
            <h1 className="text-4xl font-extrabold text-textMain">User Management</h1>
          </div>
          <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-soft text-center">
            <p className="text-2xl font-extrabold text-primary">{users.length}</p>
            <p className="text-xs text-secondary font-medium">Total Users</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          {/* Role tabs */}
          <div className="flex gap-1.5 shrink-0">
            {ROLE_TABS.map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all ${roleFilter === r ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>
                {r} {r !== 'ALL' && `(${users.filter(u => u.role === r).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-secondary text-xs uppercase font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-secondary">No users found matching your filters.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarColor(u.role)} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                        {(u.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold text-textMain">{u.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary text-xs">{u.email || '–'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${roleColor(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-secondary text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '–'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/admin/users/${u.id}`)} className="text-xs bg-primary/10 text-primary rounded-lg py-1.5 px-3 font-bold hover:bg-primary/20 transition-colors">
                        View →
                      </button>
                      <button onClick={() => handleDelete(u.id, u.username)} disabled={deleting === u.id} className="text-xs bg-red-50 text-red-500 rounded-lg py-1.5 px-3 font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                        {deleting === u.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-secondary font-medium">
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
