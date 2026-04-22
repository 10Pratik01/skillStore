import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Welcome Back</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-secondary text-sm mb-1">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-secondary text-sm mb-1">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-6">
            Sign In
          </button>
        </form>
        <div className="mt-6 p-4 rounded-lg border border-white/10 bg-white/5 text-xs text-secondary space-y-1">
          <p className="font-semibold text-white">Seeded demo accounts</p>
          <p>student1 / password123</p>
          <p>instructor1 / password123</p>
          <p>admin1 / password123</p>
        </div>
        <p className="mt-6 text-center text-secondary text-sm">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
