import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseBuilder from './pages/instructor/CourseBuilder';
import CourseStudio from './pages/instructor/CourseStudio';
import GradingQueue from './pages/instructor/GradingQueue';
import CourseWarnings from './pages/instructor/CourseWarnings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminCourseDetail from './pages/admin/AdminCourseDetail';
import NotificationCenter from './components/NotificationCenter';



const Navbar = () => {
    const { user, logout } = useAuth();

    const dashPath = user?.role === 'INSTRUCTOR' ? '/instructor/dashboard'
      : user?.role === 'ADMIN' ? '/admin/dashboard'
      : '/dashboard';

    return (
        <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 px-6 py-3.5 flex justify-between items-center shadow-sm">
            <Link to="/" className="text-[22px] font-extrabold text-primary tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-400 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shadow-soft-purple">SS</div>
              SkillStore
            </Link>

            <div className="hidden md:flex gap-8 items-center font-semibold text-sm">
                <Link to="/courses" className="text-textMain hover:text-primary transition-colors">Explore</Link>
                {user && <Link to={dashPath} className="text-textMain hover:text-primary transition-colors">Dashboard</Link>}
            </div>

            <div className="flex gap-3 items-center">
                {user ? (
                    <>
                        <NotificationCenter userId={user.id} />
                        <div className="relative group cursor-pointer">
                          <Link to={dashPath}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          </Link>
                          <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-soft hidden group-hover:block z-50 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-primary/5">
                              <p className="font-extrabold text-textMain truncate">{user.username}</p>
                              <p className="text-xs text-secondary font-medium capitalize">{user.role?.toLowerCase()}</p>
                            </div>
                            <div className="p-2">
                              <Link to={dashPath} className="flex items-center gap-2 px-4 py-2.5 text-sm text-textMain hover:bg-gray-50 rounded-xl font-semibold transition-colors">📊 Dashboard</Link>
                              <Link to="/courses" className="flex items-center gap-2 px-4 py-2.5 text-sm text-textMain hover:bg-gray-50 rounded-xl font-semibold transition-colors">🔍 Browse Courses</Link>
                              <button onClick={logout} className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl font-semibold transition-colors">🚪 Sign Out</button>
                            </div>
                          </div>
                        </div>
                    </>
                ) : (
                    <>
                      <Link to="/login" className="text-textMain font-bold hover:text-primary transition-colors text-sm">Log in</Link>
                      <Link to="/register" className="btn-primary py-2.5 px-5 text-sm rounded-full shadow-soft-purple">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = [
    location.pathname.startsWith('/instructor'),
    location.pathname.startsWith('/admin'),
    location.pathname.startsWith('/login'),
    location.pathname.startsWith('/register'),
    location.pathname.endsWith('/learn'),
  ].some(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses/:courseId/learn" element={<CoursePlayer />} />

            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/course-builder" element={<CourseBuilder />} />
            <Route path="/instructor/courses/:courseId" element={<CourseStudio />} />
            <Route path="/instructor/courses/:courseId/grading" element={<GradingQueue />} />
            <Route path="/instructor/grading" element={<GradingQueue />} />
            <Route path="/instructor/warnings" element={<CourseWarnings />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
