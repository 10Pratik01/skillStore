import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ username, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 w-full max-w-md mt-10"
      >
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Join SkillStore</h2>
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
            <label className="block text-secondary text-sm mb-1">Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
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
          <div>
            <label className="block text-secondary text-sm mb-1">I want to:</label>
            <div className="flex gap-4 p-2 bg-background/50 rounded-lg border border-secondary/30">
              <label className="flex-1 flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="STUDENT" 
                  checked={role === 'STUDENT'} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="mr-2 accent-primary"
                />
                <span className="text-white text-sm">Learn (Student)</span>
              </label>
              <label className="flex-1 flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="role" 
                  value="INSTRUCTOR" 
                  checked={role === 'INSTRUCTOR'} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="mr-2 accent-primary"
                />
                <span className="text-white text-sm">Teach (Instructor)</span>
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-6">
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-secondary text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
