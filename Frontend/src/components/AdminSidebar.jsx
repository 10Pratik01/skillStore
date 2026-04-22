import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, ShieldAlert } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-surface h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col pt-6 pb-8 z-10">
      {/* Brand */}
      <div className="px-8 mb-10">
        <h1 className="text-xl font-bold text-red-600 tracking-wide mb-1">SkillStore Admin</h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-textMain">Admin Portal</p>
            <p className="text-xs text-secondary">Superuser</p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-red-600 text-white shadow-soft' 
                  : 'text-secondary hover:bg-gray-50 hover:text-textMain'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-secondary'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action */}
      <div className="px-4 mt-auto">
        <Link 
          to="/" 
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Back to App
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
