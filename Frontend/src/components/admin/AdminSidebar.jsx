import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { label: 'Users', icon: '👥', path: '/admin/users' },
  { label: 'Courses', icon: '📚', path: '/admin/courses' },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-8 shrink-0 min-h-screen">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-500 to-orange-400 text-white font-extrabold text-lg flex items-center justify-center shadow-lg">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-textMain capitalize truncate max-w-[120px]">{user?.username}</p>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Admin</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${location.pathname === item.path ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}
          >
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
  );
};

export default AdminSidebar;
