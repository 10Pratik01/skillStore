import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.role !== 'STUDENT') {
                setLoading(false);
                return;
            }
            try {
                // Hardcoded studentId=1 for demo since user info object does not currently hold DB PK ID.
                const studentId = 1; 
                
                const [enrollmentsRes, transactionsRes] = await Promise.all([
                    axios.get(`/api/orders/student/${studentId}/enrollments`),
                    axios.get(`/api/orders/student/${studentId}/transactions`)
                ]);
                
                setEnrollments(enrollmentsRes.data);
                setTransactions(transactionsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) return <div className="p-8 text-center text-primary">Loading dashboard...</div>;

    if (user?.role === 'INSTRUCTOR') {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8">Instructor Dashboard</h2>
                <div className="glass p-6 text-center text-secondary">
                    Instructor features (Course Creation & Management) are coming soon!
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.username}</h2>
            <p className="text-secondary mb-8">Manage your learning journey.</p>
            
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
                <button 
                    onClick={() => setActiveTab('courses')}
                    className={`font-semibold transition-colors duration-200 ${activeTab === 'courses' ? 'text-primary' : 'text-secondary hover:text-white'}`}
                >
                    My Courses
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`font-semibold transition-colors duration-200 ${activeTab === 'billing' ? 'text-primary' : 'text-secondary hover:text-white'}`}
                >
                    Billing History
                </button>
            </div>

            {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.length === 0 ? (
                        <div className="col-span-full text-center text-secondary py-12">You are not enrolled in any courses yet.</div>
                    ) : (
                        enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="glass p-6 flex flex-col justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2 bg-green-400/10 px-2 py-1 rounded inline-block">Enrolled</span>
                                    <h3 className="text-xl font-bold text-white mb-2">Course ID: {enrollment.courseId}</h3>
                                    <p className="text-secondary text-sm mb-4">You have full lifetime access to this course.</p>
                                </div>
                                <button className="btn-secondary w-full py-2 text-sm mt-4">Go to Course</button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="glass overflow-hidden rounded-xl">
                    <table className="w-full text-left text-sm text-secondary">
                        <thead className="text-xs uppercase bg-background/50 text-white">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Course ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{tx.transactionId}</td>
                                        <td className="px-6 py-4">{tx.courseId}</td>
                                        <td className="px-6 py-4">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-semibold text-white">${tx.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${tx.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
