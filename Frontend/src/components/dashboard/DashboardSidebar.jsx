import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { key: 'overview',  label: 'Overview',    icon: '📊' },
  { key: 'courses',   label: 'My Courses',  icon: '📚' },
  { key: 'billing',   label: 'Billing',     icon: '💳' },
];

const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-8 shrink-0 shadow-[4px_0_20px_rgba(0,0,0,0.02)]">
      {/* User Card */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 bg-primary/5 rounded-2xl px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-white font-extrabold text-base flex items-center justify-center shadow-soft-purple shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-textMain text-sm truncate capitalize">{user?.username}</p>
            <p className="text-xs text-secondary font-medium">{user?.role?.toLowerCase() || 'student'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV.map(item => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === item.key
                ? 'bg-primary text-white shadow-soft-purple'
                : 'text-secondary hover:bg-gray-50 hover:text-textMain'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="pt-4 border-t border-gray-100 mt-4">
          <button
            onClick={() => navigate('/courses')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-secondary hover:bg-gray-50 hover:text-textMain transition-all"
          >
            <span>🔍</span>Find Courses
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-secondary hover:bg-gray-50 hover:text-textMain transition-all"
          >
            <span>🏠</span>Home
          </button>
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-4 mt-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <span>🚪</span>Sign Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
