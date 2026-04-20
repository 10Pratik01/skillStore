import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';

// Placeholder Pages
const Home = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-screen">
    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Master New Skills with <span className="text-primary">SkillStore</span></h1>
    <p className="text-xl text-secondary mb-8 max-w-2xl">The ultimate platform for learning and teaching.</p>
    <Link to="/courses" className="btn-primary text-xl px-8 py-4">Explore Courses</Link>
  </div>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="glass fixed top-0 w-full z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10 px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary tracking-wider">SkillStore.</Link>
            <div className="flex gap-4 items-center">
                <Link to="/courses" className="text-white hover:text-primary transition-colors">Courses</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" className="text-white hover:text-primary transition-colors">Dashboard</Link>
                        <button onClick={logout} className="btn-secondary text-sm py-2 px-4">Logout ({user.username})</button>
                    </>
                ) : (
                    <Link to="/login" className="btn-primary text-sm py-2 px-6">Sign In</Link>
                )}
            </div>
        </nav>
    )
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background flex flex-col pt-20">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
