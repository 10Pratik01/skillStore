import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';

// ============================================================================
// 1. NOTIFICATION BELL (Restored Logic + Light Theme UI)
// ============================================================================
const NotificationBell = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await axios.get(`/api/community/notifications/user/${userId}`);
                setNotifications(res.data);
            } catch (err) { }
        };
        fetchInitial();

        const stompClient = new Client({
            webSocketFactory: () => new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/community/websocket`),
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
                    if (message.body) {
                        const newNotif = JSON.parse(message.body);
                        setNotifications(prev => [newNotif, ...prev]);
                    }
                });
            }
        });
        stompClient.activate();

        return () => { stompClient.deactivate(); };
    }, [userId]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.patch(`/api/community/notifications/read/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) {}
    };

    return (
        <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden slide-up">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-textMain">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-secondary">No new notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleMarkAsRead(n.id)}>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-textMain mb-1 leading-snug">{n.message}</p>
                                            <p className="text-xs text-secondary font-medium">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// 2. COURSE Q&A (Restored Logic + Light Theme UI)
// ============================================================================
const CourseQA = ({ courseId, userId, userName }) => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/community/course/${courseId}`);
                setPosts(res.data);
            } catch (err) {}
        };
        fetchHistory();

        const stompClient = new Client({
            webSocketFactory: () => new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/community/websocket`),
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe(`/topic/course/${courseId}`, (message) => {
                    if (message.body) {
                        const post = JSON.parse(message.body);
                        setPosts(prev => [...prev, post]);
                    }
                });
            }
        });
        stompClient.activate();
        return () => stompClient.deactivate();
    }, [courseId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        try {
            await axios.post(`/api/community/course/${courseId}/post`, {
                authorId: userId,
                authorName: userName,
                content: newPost
            });
            setNewPost('');
        } catch (err) {}
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-textMain flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                    </div>
                    Live Q&A
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
                {posts.map((p, i) => (
                    <div key={i} className={`flex flex-col ${p.authorId === userId ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] font-medium text-secondary mb-1 uppercase tracking-wider">{p.authorName}</span>
                        <div className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] shadow-sm ${p.authorId === userId ? 'bg-primary text-white rounded-br-sm shadow-soft-purple' : 'bg-white text-textMain border border-gray-100 rounded-bl-sm'}`}>
                            {p.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2 items-center">
                <input 
                    type="text" 
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Ask a question..."
                />
                <button type="submit" className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primaryHover transition-colors shadow-soft-purple shrink-0">
                    <svg className="w-5 h-5 transform rotate-90 translate-y-[-1px] translate-x-[1px]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
            </form>
        </div>
    );
};

// ============================================================================
// 3. STUDENT COURSE PLAYER (Restored Logic + Light Theme UI)
// ============================================================================
const StudentCoursePlayer = ({ courseId, onBack, user }) => {
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [activeTab, setActiveTab] = useState('lesson');
    
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const [cRes, aRes, qRes] = await Promise.all([
                    axios.get(`/api/courses/${courseId}`),
                    axios.get(`/api/assignments/course/${courseId}`),
                    axios.get(`/api/quizzes/course/${courseId}`)
                ]);
                setCourse(cRes.data);
                setAssignments(aRes.data);
                setQuizzes(qRes.data);
                if (cRes.data.sections?.[0]?.lessons?.[0]) {
                    setActiveLesson(cRes.data.sections[0].lessons[0]);
                }
            } catch (err) {
                console.error("Failed to load course player context", err);
            }
        };
        fetchContent();
    }, [courseId]);

    const handleAssignmentSubmit = async (assignmentId) => {
        try {
            await axios.post(`/api/assignments/${assignmentId}/submit`, {
                studentId: user.id || 1,
                courseId: courseId,
                textContent: submissionText
            });
            alert("Assignment Submitted successfully!");
            setSubmissionText('');
        } catch (e) {
            console.error(e);
            alert("Error submitting assignment");
        }
    };

    const handleQuizSubmit = async (quiz) => {
        try {
            const percent = 100;
            await axios.post(`/api/quizzes/${quiz.id}/attempt`, {
                studentId: user.id || 1,
                courseId: courseId,
                scorePercent: percent
            });
            alert(`Quiz completed! You scored ${percent}%`);
        } catch (e) {
            console.error(e);
            alert("Error submitting quiz");
        }
    };

    if (!course) return <div className="text-secondary text-center p-8 font-bold">Loading course player...</div>;

    const ActiveContent = () => {
        if (!activeLesson) return <div className="p-12 text-center text-secondary border-2 border-dashed border-gray-200 rounded-3xl m-8">Select a lesson to begin.</div>;

        if (activeLesson.type === 'video') {
            return (
                <div className="p-8">
                    <h3 className="text-3xl font-extrabold text-textMain mb-6">{activeLesson.title}</h3>
                    <div className="w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden mb-8 relative shadow-soft">
                        <img src={`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80`} alt="Course Video" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                                <svg className="w-10 h-10 text-white translate-x-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeLesson.type === 'text') {
            return (
                <div className="p-8 max-w-4xl">
                    <h3 className="text-3xl font-extrabold text-textMain mb-6">{activeLesson.title}</h3>
                    <div className="glass p-8 text-textMain text-lg leading-relaxed whitespace-pre-wrap border-t-4 border-t-primary shadow-sm rounded-2xl">
                        {activeLesson.content}
                    </div>
                </div>
            );
        }

        if (activeLesson.type === 'assignment') {
            const assignmentData = assignments.find(a => a.lessonId === activeLesson.id) || { instructions: activeLesson.content || 'Please submit your work below.' };
            return (
                <div className="p-8 max-w-4xl">
                    <h3 className="text-3xl font-extrabold text-textMain mb-6">{activeLesson.title} (Assignment)</h3>
                    <div className="glass p-6 text-textMain mb-8 border-l-4 border-l-yellow-400 bg-yellow-50 rounded-2xl shadow-sm">
                        <strong className="text-yellow-600 mb-2 block uppercase text-sm tracking-wider">Instructions:</strong>
                        {assignmentData.instructions}
                    </div>
                    
                    <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-sm">
                        <h4 className="text-lg font-bold text-textMain mb-4">Your Submission</h4>
                        <textarea 
                            value={submissionText} 
                            onChange={e => setSubmissionText(e.target.value)} 
                            className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl p-5 text-textMain focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all mb-6 resize-none"
                            placeholder="Type your answer here..."
                        ></textarea>
                        <button onClick={() => handleAssignmentSubmit(assignmentData.id)} disabled={!submissionText} className="btn-primary py-4 px-8 w-full md:w-auto shadow-soft-purple disabled:opacity-50">Submit Assignment</button>
                    </div>
                </div>
            );
        }
        
        if (activeLesson.type === 'quiz') {
            const quizData = quizzes.find(q => q.lessonId === activeLesson.id);
            return (
                <div className="p-8 max-w-3xl mx-auto mt-10">
                    <div className="glass p-12 text-center border-t-4 border-t-purple-500 shadow-soft rounded-3xl">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                        </div>
                        <h3 className="text-3xl font-extrabold text-textMain mb-4">{activeLesson.title} Assessment</h3>
                        <p className="text-secondary text-lg mb-10">You are about to start a quiz. Make sure you have reviewed the material in this section before proceeding.</p>
                        <button onClick={() => { if(quizData) handleQuizSubmit(quizData); }} className="btn-primary px-10 py-4 shadow-soft-purple text-lg w-full md:w-auto">Start Quiz Now</button>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-200">
                <div className="p-8 pb-4 shrink-0 bg-white border-b border-gray-100 shadow-sm flex items-center gap-4 z-10">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">COURSE JOURNEY</h2>
                        <h1 className="text-2xl font-extrabold text-textMain">{course.title}</h1>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'lesson' && <ActiveContent />}
                    {activeTab === 'qa' && (
                        <div className="flex h-full items-center justify-center bg-gray-50">
                            <CourseQA courseId={courseId} userId={user?.id || 1} userName={user?.username || 'Student'} />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Course Structure */}
            <div className="w-[380px] bg-white h-full overflow-y-auto shadow-[-10px_0_30px_rgba(0,0,0,0.02)] shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex gap-2">
                    <button onClick={() => setActiveTab('lesson')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'lesson' ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>Lessons</button>
                    <button onClick={() => setActiveTab('qa')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'qa' ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>Q&A Forum</button>
                </div>
                
                <div className="p-6 space-y-6">
                    {course.sections?.map((section, sIdx) => (
                        <div key={section.id} className="space-y-3">
                            <h5 className="text-textMain font-bold text-sm uppercase tracking-wider">MODULE {sIdx + 1}: {section.title}</h5>
                            <div className="space-y-2">
                                {section.lessons?.map((lesson, lIdx) => (
                                    <button 
                                        key={lesson.id} 
                                        onClick={() => { setActiveLesson(lesson); setActiveTab('lesson'); }}
                                        className={`w-full text-left p-4 rounded-xl transition-all flex items-start gap-3 border ${activeLesson?.id === lesson.id && activeTab === 'lesson' ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-sm'}`}
                                    >
                                        <div className={`mt-0.5 shrink-0 ${activeLesson?.id === lesson.id && activeTab === 'lesson' ? 'text-primary' : 'text-gray-400'}`}>
                                            {lesson.type === 'video' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                                            {lesson.type === 'text' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                                            {lesson.type === 'assignment' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
                                            {lesson.type === 'quiz' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
                                        </div>
                                        <div>
                                            <span className={`block font-bold text-sm leading-tight mb-1 ${activeLesson?.id === lesson.id && activeTab === 'lesson' ? 'text-primary' : 'text-textMain'}`}>{lesson.title}</span>
                                            <span className="text-xs text-secondary font-medium capitalize">{lesson.type}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// 4. MAIN DASHBOARD (Restored Fetch Logic + Light Theme UI)
// ============================================================================
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [activeCoursePlayer, setActiveCoursePlayer] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.role !== 'STUDENT') {
                setLoading(false);
                return;
            }
            try {
                const studentId = user?.id || 1; 
                const [enrollmentsRes, transactionsRes] = await Promise.all([
                    axios.get(`/api/orders/student/${studentId}/enrollments`),
                    axios.get(`/api/orders/student/${studentId}/transactions`)
                ]);
                
                const enrolls = enrollmentsRes.data;
                setEnrollments(enrolls);
                setTransactions(transactionsRes.data);
                
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

        if (user) fetchDashboardData();
    }, [user]);

    if (activeCoursePlayer) {
        return <StudentCoursePlayer courseId={activeCoursePlayer} onBack={() => setActiveCoursePlayer(null)} user={user} />;
    }

    if (loading) return <div className="p-10 text-center text-primary font-bold text-xl">Loading your workspace...</div>;

    // Optional override for instructor/admin, though routing should handle this usually
    if (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') {
         return <div className="p-10">Please access your respective dashboard from the navigation.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-80px)] bg-background overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-surface border-r border-gray-100 flex flex-col pt-8 h-full shrink-0 z-10 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
                <div className="px-6 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-400 shadow-soft-purple flex items-center justify-center text-white text-xl font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                        <h3 className="font-bold text-textMain capitalize">{user?.username || 'Student'}</h3>
                        <p className="text-xs text-secondary font-medium">Student Portal</p>
                    </div>
                </div>

                <div className="flex-1 px-4 space-y-2">
                    <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'courses' ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/courses')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-gray-50 hover:text-textMain font-semibold transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Find Courses
                    </button>
                    <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'billing' ? 'bg-primary text-white shadow-soft-purple' : 'text-secondary hover:bg-gray-50 hover:text-textMain'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        Billing History
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-10">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-textMain mb-2 capitalize">Welcome back, {user?.username}! <span className="inline-block animate-wave">👋</span></h1>
                        <p className="text-secondary text-lg">You're making great progress. Keep it up!</p>
                    </div>
                    <NotificationBell userId={user?.id || 1} />
                </div>

                {activeTab === 'courses' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {/* Continue Learning Widget */}
                            <div className="glass p-8 col-span-2 flex flex-col justify-between hover:shadow-soft-purple transition-shadow cursor-pointer group" onClick={() => enrollments.length > 0 ? setActiveCoursePlayer(enrollments[0].courseId) : null}>
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="bg-primary/10 text-primary text-xs font-extrabold tracking-wider uppercase px-4 py-1.5 rounded-full">Continue Learning</span>
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-textMain mb-3 group-hover:text-primary transition-colors">
                                        {enrollments.length > 0 ? `Course ${enrollments[0].courseId}` : 'No active courses'}
                                    </h2>
                                    <p className="text-secondary text-lg mb-8">Jump back in and complete your modules.</p>
                                </div>
                                
                                <div>
                                    <button className="btn-primary flex items-center gap-2 px-8 py-4 w-max shadow-soft-purple hover:-translate-y-1">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        Resume Course
                                    </button>
                                </div>
                            </div>

                            {/* Right Column Widgets */}
                            <div className="space-y-8">
                                <div className="glass p-8 flex items-center justify-between hover:shadow-soft-purple transition-shadow">
                                    <div>
                                        <h3 className="text-xl font-bold text-textMain mb-1">Learning<br/>Streak</h3>
                                        <p className="text-sm text-secondary font-medium mt-2">You're on fire! 🔥</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-[#d97706] text-white flex items-center justify-center text-2xl font-extrabold shadow-[0_10px_20px_rgba(217,119,6,0.3)]">
                                        12
                                    </div>
                                </div>

                                <div className="glass p-8 hover:shadow-soft-purple transition-shadow">
                                    <h3 className="text-xl font-bold text-textMain mb-6">Weekly Goal</h3>
                                    <div className="flex items-end justify-between h-32 px-2">
                                        <div className="w-8 bg-primary/20 rounded-t-lg h-[40%]"></div>
                                        <div className="w-8 bg-primary/30 rounded-t-lg h-[60%]"></div>
                                        <div className="w-8 bg-primary rounded-t-lg h-[100%] shadow-soft-purple"></div>
                                        <div className="w-8 bg-gray-200 rounded-t-lg h-[20%]"></div>
                                        <div className="w-8 bg-gray-100 rounded-t-lg h-[5%]"></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-secondary mt-4 px-3">
                                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enrolled Courses Grid */}
                        <h3 className="text-2xl font-extrabold text-textMain mb-6">Enrolled Courses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {enrollments.length === 0 ? (
                                <div className="col-span-full text-center text-secondary py-12 glass">
                                    You are not enrolled in any courses yet. Explore the catalog to get started!
                                </div>
                            ) : (
                                enrollments.map((enrollment) => {
                                    const progressPercent = Math.min(100, (progressData[enrollment.courseId]?.filter(p => p.completed).length || 0) * 20);
                                    return (
                                        <div key={enrollment.id} className="glass p-5 flex flex-col hover:-translate-y-1 hover:shadow-soft-purple transition-all cursor-pointer group" onClick={() => setActiveCoursePlayer(enrollment.courseId)}>
                                            <div className="w-full h-36 bg-gradient-to-br from-primary/20 to-purple-400/20 rounded-xl mb-5 overflow-hidden relative flex items-center justify-center">
                                                <svg className="w-10 h-10 text-primary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-textMain text-lg line-clamp-1 group-hover:text-primary transition-colors">Course {enrollment.courseId}</h4>
                                            </div>
                                            <p className="text-sm text-secondary mb-6 flex-1">Access your course materials.</p>
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs mb-1 text-secondary font-bold">
                                                    <span>Progress</span>
                                                    <span>{progressPercent}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}

                            {/* Find Course Card */}
                            <div onClick={() => navigate('/courses')} className="glass p-5 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors border-dashed border-2 border-gray-200 cursor-pointer group">
                                <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </div>
                                <h4 className="font-bold text-textMain text-lg mb-2">Find a Course</h4>
                                <p className="text-sm text-secondary mb-0">Explore the catalog to start learning.</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'billing' && (
                    <div className="glass overflow-hidden rounded-3xl border border-gray-100">
                        <table className="w-full text-left text-sm text-textMain">
                            <thead className="text-xs uppercase bg-gray-50 text-secondary border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">Transaction ID</th>
                                    <th className="px-8 py-5">Course ID</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Amount</th>
                                    <th className="px-8 py-5">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-secondary">No transactions found.</td>
                                    </tr>
                                ) : (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5 font-mono text-xs text-secondary">{tx.transactionId}</td>
                                            <td className="px-8 py-5 font-bold">Course {tx.courseId}</td>
                                            <td className="px-8 py-5 text-secondary">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                            <td className="px-8 py-5 font-bold text-primary">${tx.amount}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
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
        </div>
    );
};

export default Dashboard;
