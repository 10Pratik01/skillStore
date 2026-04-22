import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseBuilder from './pages/CourseBuilder';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';



const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="glass-panel sticky top-4 z-50 mx-4 px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-[22px] font-bold text-primary tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-soft-purple">school</div>
              LuminaLearn
            </Link>
            
            <div className="hidden md:flex gap-8 items-center font-semibold text-sm">
                <Link to="/courses" className="text-primary border-b-2 border-primary pb-1">Explore</Link>
                <Link to="/community" className="text-textMain hover:text-primary transition-colors">Community</Link>
                <Link to="/resources" className="text-textMain hover:text-primary transition-colors">Resources</Link>
            </div>

            <div className="flex gap-5 items-center">
                {user ? (
                    <>
                        <button className="text-primary hover:text-primaryHover">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <button className="text-primary hover:text-primaryHover">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </button>
                        <div className="relative group cursor-pointer">
                          <Link to="/dashboard">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          </Link>
                          <div className="absolute right-0 mt-2 w-48 glass hidden group-hover:block slide-up">
                            <div className="p-4 border-b border-gray-100">
                              <p className="font-bold text-textMain truncate">{user.username}</p>
                              <p className="text-xs text-secondary">{user.role}</p>
                            </div>
                            <div className="p-2">
                              <Link to="/dashboard" className="block px-4 py-2 text-sm text-textMain hover:bg-gray-50 rounded-lg">Dashboard</Link>
                              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg font-semibold">Sign Out</button>
                            </div>
                          </div>
                        </div>
                    </>
                ) : (
                    <>
                      <Link to="/login" className="text-textMain font-bold hover:text-primary transition-colors">Log in</Link>
                      <Link to="/register" className="btn-primary py-2.5 px-5 text-sm rounded-full shadow-soft-purple">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

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

            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/course-builder" element={<CourseBuilder />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
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
