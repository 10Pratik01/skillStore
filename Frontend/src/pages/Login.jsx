import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      // Role-based redirect
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else if (storedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 md:p-12 w-full max-w-[440px] rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-gray-50/50">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-primary to-purple-400 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-base font-extrabold mx-auto mb-4 shadow-soft-purple">
            SS
          </div>
          <h1 className="text-[28px] font-extrabold text-primary mb-2">SkillStore</h1>
          <p className="text-secondary text-sm font-medium">Welcome back to your learning journey</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-textMain text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </span>
              <input 
                type="text" 
                className="input-field pl-12" 
                placeholder="student@example.com"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-textMain text-xs font-bold uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs font-bold text-primary hover:text-primaryHover">FORGOT?</a>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field pl-12 pr-12 text-lg tracking-widest" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-6 text-[15px] rounded-2xl py-4 shadow-[0_8px_20px_rgba(108,72,242,0.3)]">
            Sign In &rarr;
          </button>
        </form>

        <div className="relative mt-8 mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white px-4 text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors text-textMain font-bold text-xs">
            iOS
          </button>
        </div>

        <p className="mt-8 text-center text-secondary text-sm">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:text-primaryHover transition-colors">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
