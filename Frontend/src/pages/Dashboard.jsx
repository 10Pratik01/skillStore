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

const InstructorDashboard = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [managingCourse, setManagingCourse] = useState(null); // The course currently being managed
    
    // Add Course UI state
    const [formData, setFormData] = useState({ title: '', description: '', price: 0, category: '' });
    
    // Add Section UI state
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [sectionTitle, setSectionTitle] = useState('');
    
    // Add Lesson UI state definition
    const [addingLessonForSection, setAddingLessonForSection] = useState(null); // section ID
    const [lessonData, setLessonData] = useState({ title: '', type: 'video', videoUrl: '', content: '' });

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/courses/instructor/${user.id}`);
            setCourses(res.data);
            
            // If they are currently managing a course, refresh its data too
            if (managingCourse) {
                const updated = res.data.find(c => c.id === managingCourse.id);
                if (updated) setManagingCourse(updated);
            }
        } catch (e) {
            console.error("Failed to fetch courses", e);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (user?.id) fetchCourses();
    }, [user]);

    const handleSubmitCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/courses', { ...formData, instructorId: user.id });
            setIsCreating(false);
            setFormData({ title: '', description: '', price: 0, category: '' });
            fetchCourses();
        } catch (e) {
            console.error("Failed to create course", e);
        }
    };
    
    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/courses/${managingCourse.id}/sections`, { title: sectionTitle });
            setIsAddingSection(false);
            setSectionTitle('');
            
            // Refresh courses so we get the new section
            const res = await axios.get(`/api/courses/${managingCourse.id}`);
            setManagingCourse(res.data);
            fetchCourses();
        } catch (e) {
            console.error("Failed to add section", e);
        }
    };
    
    const handleAddLesson = async (e, sectionId) => {
        e.preventDefault();
        try {
            await axios.post(`/api/courses/sections/${sectionId}/lessons`, lessonData);
            setAddingLessonForSection(null);
            setLessonData({ title: '', type: 'video', videoUrl: '', content: '' });
            
            // Refresh course details
            const res = await axios.get(`/api/courses/${managingCourse.id}`);
            setManagingCourse(res.data);
            fetchCourses();
        } catch (e) {
            console.error("Failed to add lesson", e);
        }
    };

    // Sub-view: Managing a specific course
    if (managingCourse) {
        return (
            <div className="p-8 max-w-7xl mx-auto slide-up">
                <button onClick={() => setManagingCourse(null)} className="text-secondary hover:text-white mb-6 transition-colors flex items-center">
                    &larr; Back to Studio
                </button>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-bold text-white">{managingCourse.title}</h2>
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold tracking-wide">{managingCourse.status || 'DRAFT'}</span>
                        </div>
                        <p className="text-secondary max-w-2xl">{managingCourse.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
                            <h3 className="text-xl font-bold text-white">Curriculum</h3>
                            <button onClick={() => setIsAddingSection(!isAddingSection)} className="btn-secondary text-sm px-4 py-2">
                                {isAddingSection ? 'Cancel' : '+ Add Section'}
                            </button>
                        </div>
                        
                        {isAddingSection && (
                            <form onSubmit={handleAddSection} className="glass p-6 slide-up">
                                <label className="block text-sm font-semibold text-secondary mb-2">Section Title</label>
                                <div className="flex gap-4">
                                    <input type="text" required value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="e.g. Introduction to React" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                                    <button type="submit" className="btn-primary px-6">Save</button>
                                </div>
                            </form>
                        )}
                        
                        {(!managingCourse.sections || managingCourse.sections.length === 0) ? (
                            <div className="glass p-8 text-center text-secondary border-dashed border-2 border-white/10">
                                This course has no content yet. Start by adding a section!
                            </div>
                        ) : (
                            managingCourse.sections.map((section, idx) => (
                                <div key={section.id || idx} className="glass overflow-hidden">
                                    <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                                        <h4 className="font-bold text-white tracking-wide">Section {idx + 1}: {section.title}</h4>
                                    </div>
                                    <div className="p-0">
                                        {(!section.lessons || section.lessons.length === 0) ? (
                                            <div className="p-4 text-center text-sm text-secondary">No lessons in this section.</div>
                                        ) : (
                                            <div className="divide-y divide-white/5 bg-background/50">
                                                {section.lessons.map((lesson, lIdx) => (
                                                    <div key={lesson.id || lIdx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-primary/20 p-2 rounded-full text-primary">
                                                                {lesson.type === 'video' ? (
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                )}
                                                            </div>
                                                            <span className="text-white font-medium">{lIdx + 1}. {lesson.title}</span>
                                                        </div>
                                                        <span className="text-xs text-secondary bg-white/5 px-2 py-1 rounded">{lesson.isPreview ? 'Free Preview' : 'Paid'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/10 bg-black/20">
                                        {addingLessonForSection === section.id ? (
                                            <form onSubmit={(e) => handleAddLesson(e, section.id)} className="space-y-4 slide-up p-4 border border-white/10 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-bold text-white text-sm">Add New Lesson</h5>
                                                    <button type="button" onClick={() => setAddingLessonForSection(null)} className="text-secondary hover:text-white text-xl leading-none">&times;</button>
                                                </div>
                                                <div>
                                                    <input type="text" required placeholder="Lesson Title" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                                </div>
                                                <div className="flex gap-4">
                                                    <select value={lessonData.type} onChange={e => setLessonData({...lessonData, type: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
                                                        <option value="video">Video</option>
                                                        <option value="text">Article / Text</option>
                                                    </select>
                                                </div>
                                                {lessonData.type === 'video' ? (
                                                    <input type="text" placeholder="Video URL (S3, YouTube, etc)" value={lessonData.videoUrl} onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                                ) : (
                                                    <textarea placeholder="Lesson Content..." value={lessonData.content} onChange={e => setLessonData({...lessonData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary h-24"></textarea>
                                                )}
                                                <button type="submit" className="btn-primary w-full py-2 text-sm">Save Lesson</button>
                                            </form>
                                        ) : (
                                            <button onClick={() => setAddingLessonForSection(section.id)} className="text-sm font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1">
                                                <span>+</span> Add Lesson
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Course Metrics</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-secondary text-sm font-semibold">Total Price</span>
                                    <span className="text-2xl font-bold text-green-400">${managingCourse.price}</span>
                                </div>
                                <div>
                                    <span className="block text-secondary text-sm font-semibold">Average Rating</span>
                                    <span className="text-xl text-yellow-400 font-bold">{managingCourse.averageRating || 'Unrated'} ★</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default view: List of courses
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Instructor Studio</h2>
                    <p className="text-secondary">Manage your courses, content, and track students.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="btn-primary"
                >
                    {isCreating ? 'Cancel' : 'Create New Course'}
                </button>
            </div>

            {isCreating && (
                <div className="glass p-6 mb-8 slide-up">
                    <h3 className="text-xl font-bold text-white mb-4">Create Course</h3>
                    <form onSubmit={handleSubmitCourse} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-1">Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-1">Description</label>
                            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors h-24"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-1">Category</label>
                                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-1">Price ($)</label>
                                <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full py-3">Publish Course Draft</button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-secondary">Loading courses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length === 0 ? (
                        <div className="col-span-full glass p-8 text-center text-secondary">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            <p>You haven't created any courses yet.</p>
                            <button onClick={() => setIsCreating(true)} className="text-primary hover:text-white mt-2 transition-colors">Create your first course</button>
                        </div>
                    ) : (
                        courses.map(course => (
                            <div key={course.id} className="glass overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                                <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 flex flex-col items-center justify-center relative">
                                    <span className="absolute top-3 right-3 bg-black/50 text-xs px-2 py-1 rounded-full text-white tracking-wide font-semibold">{course.status || 'DRAFT'}</span>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white leading-tight">{course.title}</h3>
                                        <span className="text-primary font-bold ml-4">${course.price}</span>
                                    </div>
                                    <p className="text-secondary text-sm mb-4 line-clamp-2">{course.description}</p>
                                    <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-sm font-semibold">
                                        <span className="text-secondary">{course.category}</span>
                                        <button onClick={() => setManagingCourse(course)} className="text-primary hover:text-white transition-colors">Manage &rarr;</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [progressData, setProgressData] = useState({});
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
                const studentId = user?.id || 1; // updated to use real user.id if available
                
                const [enrollmentsRes, transactionsRes] = await Promise.all([
                    axios.get(`/api/orders/student/${studentId}/enrollments`),
                    axios.get(`/api/orders/student/${studentId}/transactions`)
                ]);
                
                const enrolls = enrollmentsRes.data;
                setEnrollments(enrolls);
                setTransactions(transactionsRes.data);
                
                // Fetch progress maps for enrolled courses
                try {
                    const progressPromises = enrolls.map(e => axios.get(`/api/orders/student/${studentId}/progress/${e.courseId}`));
                    const progressResults = await Promise.all(progressPromises);
                    const pMap = {};
                    enrolls.forEach((e, idx) => {
                        pMap[e.courseId] = progressResults[idx].data;
                    });
                    setProgressData(pMap);
                } catch (e) {
                    console.log("Progress not currently available.");
                }

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
        return <InstructorDashboard user={user} />;
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
                                    <div className="w-full mb-4">
                                        <div className="flex justify-between text-xs mb-1 text-secondary">
                                            <span>Progress</span>
                                            <span>{Math.min(100, (progressData[enrollment.courseId]?.filter(p => p.completed).length || 0) * 20)}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5">
                                            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (progressData[enrollment.courseId]?.filter(p => p.completed).length || 0) * 20)}%` }}></div>
                                        </div>
                                    </div>
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
