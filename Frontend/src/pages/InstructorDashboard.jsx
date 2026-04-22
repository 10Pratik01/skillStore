import React from 'react';
import InstructorSidebar from '../components/InstructorSidebar';
import { Bell, Users, DollarSign, Book, TrendingUp, Plus, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, change, isPositive, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-primary/10 rounded-2xl text-primary">
        <Icon size={24} />
      </div>
      {change && (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-purple-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
          {isPositive ? '+' : ''}{change}
        </span>
      )}
    </div>
    <div>
      <p className="text-secondary text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-textMain">{value}</h3>
    </div>
  </motion.div>
);

const InstructorDashboard = () => {
  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <InstructorSidebar />
      
      <main className="flex-1 ml-64 p-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-secondary text-lg mb-1">Welcome back, Sarah</p>
            <h1 className="text-4xl font-bold text-textMain tracking-tight">Overview</h1>
          </div>
          <button className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-primary transition-colors">
            <Bell size={24} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={Users} title="Total Students" value="1,248" change="12%" isPositive={true} index={0} />
          <StatCard icon={DollarSign} title="Monthly Revenue" value="$12,450" change="8%" isPositive={true} index={1} />
          <StatCard icon={Book} title="Active Courses" value="6" index={2} />
          <StatCard icon={TrendingUp} title="Completion Rate" value="84%" change="-2%" isPositive={false} index={3} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-50"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-textMain">Revenue Growth</h2>
              <select className="bg-gray-50 border border-gray-100 text-gray-600 text-sm rounded-xl px-4 py-2 outline-none">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-2xl w-full flex items-end relative overflow-hidden">
              {/* Fake Chart Illustration */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full absolute bottom-0">
                <path d="M0,150 L0,120 C50,120 80,80 120,80 C160,80 180,130 220,130 C260,130 280,30 320,30 C350,30 360,110 390,110 C420,110 450,20 500,20 L500,150 Z" fill="none" stroke="currentColor" className="text-primary" strokeWidth="4" />
                <circle cx="120" cy="80" r="6" className="fill-white stroke-primary" strokeWidth="3" />
                <circle cx="220" cy="130" r="6" className="fill-white stroke-primary" strokeWidth="3" />
                <circle cx="320" cy="30" r="6" className="fill-white stroke-primary" strokeWidth="3" />
                <circle cx="390" cy="110" r="6" className="fill-white stroke-primary" strokeWidth="3" />
                <circle cx="500" cy="20" r="6" className="fill-white stroke-primary" strokeWidth="3" />
              </svg>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-textMain mb-2">Quick Actions</h2>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-primary rounded-3xl p-6 text-white shadow-soft-purple relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                <Plus size={20} />
              </div>
              <h3 className="text-xl font-bold mb-1">Create New<br/>Course</h3>
              <p className="text-primary-100 text-sm opacity-90">Draft a new syllabus</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                <Megaphone size={20} />
              </div>
              <h3 className="text-xl font-bold text-textMain mb-1">Make<br/>Announcement</h3>
              <p className="text-secondary text-sm">Notify all students</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
