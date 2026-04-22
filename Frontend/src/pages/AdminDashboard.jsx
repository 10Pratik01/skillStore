import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Users, BookOpen, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-6"
  >
    <div className={`p-4 rounded-2xl ${color}`}>
      <Icon size={32} />
    </div>
    <div>
      <p className="text-secondary text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-textMain">{value}</h3>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, courses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/courses')
        ]);
        setStats({
          users: usersRes.data.length,
          courses: coursesRes.data.length
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-10">
        <div className="mb-10">
          <p className="text-secondary text-lg mb-1">System Overview</p>
          <h1 className="text-4xl font-bold text-textMain tracking-tight">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={Users} 
            title="Total Users" 
            value={stats.users} 
            color="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            icon={BookOpen} 
            title="Total Courses" 
            value={stats.courses} 
            color="bg-green-100 text-green-600" 
          />
          <StatCard 
            icon={DollarSign} 
            title="Total Revenue" 
            value="$45,231" 
            color="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            icon={Activity} 
            title="System Status" 
            value="Healthy" 
            color="bg-teal-100 text-teal-600" 
          />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
