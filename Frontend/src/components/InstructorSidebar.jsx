import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, MessageSquare, Settings, UserCircle2 } from 'lucide-react';

const InstructorSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { name: 'Assignments', path: '/instructor/assignments', icon: ClipboardList },
    { name: 'Messages', path: '/instructor/messages', icon: MessageSquare },
    { name: 'Settings', path: '/instructor/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-surface h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col pt-6 pb-8">
      {/* Brand */}
      <div className="px-8 mb-10">
        <h1 className="text-xl font-bold text-primary tracking-wide mb-1">LuminaLearn</h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
            <UserCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-textMain">Instructor Portal</p>
            <p className="text-xs text-secondary">Course Builder Active</p>
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
                  ? 'bg-primary text-white shadow-soft-purple' 
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
          to="/instructor/course-builder" 
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-primary font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Create New Course
        </Link>
      </div>
    </div>
  );
};

export default InstructorSidebar;
