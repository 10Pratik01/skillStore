import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '@stomp/stompjs';

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
            webSocketFactory: () => new WebSocket('ws://localhost:8087/ws/community/websocket'),
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
        <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-white/10 w-80">
            <div className="p-4 border-b border-white/10 bg-black/40">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                    Live Q&A
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {posts.map((p, i) => (
                    <div key={i} className={`flex flex-col ${p.authorId === userId ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-secondary mb-1">{p.authorName}</span>
                        <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${p.authorId === userId ? 'bg-primary text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
                            {p.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
                <input 
                    type="text" 
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    placeholder="Ask a question..."
                />
                <button type="submit" className="text-primary hover:text-white transition-colors">
                    <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
            </form>
        </div>
    );
};

const StudentCoursePlayer = ({ courseId, onBack, user }) => {
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [quizAnswers, setQuizAnswers] = useState({});
    
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
            } catch (err) {
                console.error("Failed to load course player context", err);
            }
        };
        fetchContent();
    }, [courseId]);

    const handleAssignmentSubmit = async (assignmentId) => {
        try {
            await axios.post(`/api/assignments/${assignmentId}/submit`, {
                studentId: user.id,
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
            // Need to fetch questions to know correct answers for score parsing...
            // Mock: Auto scoring 100% since Question components will be built next phase.
            const percent = 100;
            
            await axios.post(`/api/quizzes/${quiz.id}/attempt`, {
                studentId: user.id,
                courseId: courseId,
                scorePercent: percent
            });
            alert(`Quiz completed! You scored ${percent}%`);
        } catch (e) {
            console.error(e);
            alert("Error submitting quiz");
        }
    };

    if (!course) return <div className="text-secondary text-center p-8">Loading course player...</div>;

    const ActiveContent = () => {
        if (!activeLesson) return <div className="p-8 text-center text-secondary border-2 border-dashed border-white/10 rounded-xl m-4">Select a lesson to begin.</div>;

        if (activeLesson.type === 'video') {
            return (
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{activeLesson.title}</h3>
                    <div className="aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                        {activeLesson.videoUrl ? (
                            <div className="text-secondary text-sm">Video Player Wrapper <br/><span className="text-primary">{activeLesson.videoUrl}</span></div>
                        ) : (
                            <div className="text-secondary opacity-50 flex flex-col items-center">
                                <svg className="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                <span>No Video Resource Provided</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeLesson.type === 'text') {
            return (
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{activeLesson.title}</h3>
                    <div className="glass p-6 text-white whitespace-pre-wrap leading-relaxed border-t-4 border-t-primary">
                        {activeLesson.content}
                    </div>
                </div>
            );
        }

        if (activeLesson.type === 'assignment') {
            const assignmentData = assignments.find(a => a.lessonId === activeLesson.id) || { instructions: activeLesson.content || 'Please submit your work below.' };
            return (
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{activeLesson.title} (Assignment)</h3>
                    <div className="glass p-6 text-white mb-6 border-l-4 border-l-yellow-500 bg-yellow-500/5">
                        <strong className="text-yellow-500 mb-2 block">Instructions:</strong>
                        {assignmentData.instructions}
                    </div>
                    
                    <div className="bg-black/30 p-6 border border-white/10 rounded-xl shadow-inner">
                        <h4 className="text-sm font-bold text-white mb-3 tracking-wide">Your Submission</h4>
                        <textarea 
                            value={submissionText} 
                            onChange={e => setSubmissionText(e.target.value)} 
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:border-primary focus:outline-none transition-colors mb-4"
                            placeholder="Type your answer here..."
                        ></textarea>
                        <button onClick={() => handleAssignmentSubmit(assignmentData.id)} disabled={!submissionText} className="btn-primary py-3 w-full disabled:opacity-50">Submit Assignment</button>
                    </div>
                </div>
            );
        }
        
        if (activeLesson.type === 'quiz') {
            const quizData = quizzes.find(q => q.lessonId === activeLesson.id);
            return (
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{activeLesson.title} (Quiz)</h3>
                    <div className="glass p-8 text-center border-t-4 border-t-purple-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                        <p className="text-secondary mb-6">You are about to start a quiz. Make sure you have reviewed the material in this section before proceeding.</p>
                        <button onClick={() => {
                             if(quizData) handleQuizSubmit(quizData);
                        }} className="btn-secondary px-8 py-3">Start Quiz Assessment</button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="max-w-7xl mx-auto h-[90vh] flex flex-col bg-black">
            <div className="glass flex items-center justify-between p-4 z-10 sticky top-0 border-b border-white/5 rounded-none shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-secondary hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="text-xl font-bold text-white">{course.title}</h2>
                </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                <div className="w-80 bg-white/5 border-r border-white/10 overflow-y-auto flex-shrink-0">
                    <div className="p-4">
                        <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">Course Content</h4>
                        <div className="space-y-4">
                            {course.sections?.map((section, sIdx) => (
                                <div key={section.id} className="space-y-1">
                                    <h5 className="text-white font-semibold text-sm px-2 py-1 bg-white/5 rounded">{sIdx + 1}. {section.title}</h5>
                                    <div className="pl-2 space-y-1 mt-1">
                                        {section.lessons?.map((lesson, lIdx) => (
                                            <button 
                                                key={lesson.id} 
                                                onClick={() => setActiveLesson(lesson)}
                                                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-3 ${activeLesson?.id === lesson.id ? 'bg-primary/20 text-white font-bold border-l-2 border-primary' : 'text-secondary hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {lesson.type === 'video' && <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                                                {lesson.type === 'text' && <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                                                {lesson.type === 'assignment' && <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
                                                {lesson.type === 'quiz' && <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
                                                <span className="truncate">{lIdx + 1}. {lesson.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-black/50 relative">
                    <ActiveContent />
                </div>
                <CourseQA courseId={courseId} userId={user.id} userName={user.username} />
            </div>
        </div>
    );
};

const InstructorGradingQueue = ({ courseId }) => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [gradingSubId, setGradingSubId] = useState(null);
    const [gradeScore, setGradeScore] = useState(100);
    const [gradeFeedback, setGradeFeedback] = useState('');

    useEffect(() => {
        const fetchGradingData = async () => {
            try {
                const assnRes = await axios.get(`/api/assignments/course/${courseId}`);
                if (!assnRes.data || assnRes.data.length === 0) return;
                setAssignments(assnRes.data);
                
                // Fetch submissions for all assignments in this course
                let allSubs = [];
                for (let a of assnRes.data) {
                    const subRes = await axios.get(`/api/assignments/${a.id}/submissions`);
                    // Map assignment title into submission for easy display
                    const mapped = subRes.data.map(s => ({ ...s, assignmentTitle: a.title, maxScore: a.maxScore }));
                    allSubs = [...allSubs, ...mapped];
                }
                setSubmissions(allSubs);
            } catch (error) {
                console.error("Failed fetching grading queue", error);
            }
        };
        fetchGradingData();
    }, [courseId]);

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/assignments/submissions/${gradingSubId}/grade`, {
                score: gradeScore,
                feedback: gradeFeedback
            });
            // Update local state without fetching again
            setSubmissions(subs => subs.map(s => s.id === gradingSubId ? {...s, status: 'GRADED', score: gradeScore, feedback: gradeFeedback} : s));
            setGradingSubId(null);
            setGradeScore(100);
            setGradeFeedback('');
        } catch (error) {
            console.error("Failed to grade", error);
        }
    };

    if (assignments.length === 0) return <div className="text-secondary text-sm">No assignments exist in this course.</div>;
    if (submissions.length === 0) return <div className="text-secondary text-sm">No student submissions yet.</div>;

    return (
        <div className="space-y-4">
            {submissions.map(sub => (
                <div key={sub.id} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded inline-block mb-1 ${sub.status==='SUBMITTED' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                {sub.status}
                            </span>
                            <h4 className="text-white font-bold">{sub.assignmentTitle}</h4>
                            <p className="text-xs text-secondary">Student ID: {sub.studentId}</p>
                        </div>
                        {sub.status === 'SUBMITTED' && (
                            <button onClick={() => {setGradingSubId(sub.id); setGradeScore(sub.maxScore);}} className="text-xs btn-primary px-3 py-1">Grade</button>
                        )}
                    </div>
                    <div className="bg-black/20 p-3 rounded text-sm text-white font-mono mt-2 mb-2 whitespace-pre-wrap">
                        {sub.textContent}
                    </div>
                    
                    {sub.status === 'GRADED' && (
                        <div className="border-t border-white/10 pt-2 mt-2">
                            <span className="text-green-400 font-bold block">Score: {sub.score} / {sub.maxScore}</span>
                            <span className="text-secondary text-xs italic">Feedback: {sub.feedback}</span>
                        </div>
                    )}

                    {gradingSubId === sub.id && (
                        <form onSubmit={handleGradeSubmission} className="slide-up bg-black/40 p-4 rounded mt-2 border border-primary/30">
                            <h5 className="text-sm font-bold text-white mb-2">Grade Submission</h5>
                            <div className="flex gap-4 mb-2">
                                <div className="w-24">
                                    <label className="text-xs text-secondary">Score</label>
                                    <input type="number" max={sub.maxScore} min={0} value={gradeScore} onChange={e=>setGradeScore(e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-secondary">Instructor Feedback</label>
                                    <input type="text" value={gradeFeedback} onChange={e=>setGradeFeedback(e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 text-white text-sm" placeholder="Great job..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <button type="button" onClick={() => setGradingSubId(null)} className="text-xs text-secondary hover:text-white px-2">Cancel</button>
                                <button type="submit" className="text-xs btn-primary px-4 py-1">Submit Grade</button>
                            </div>
                        </form>
                    )}
                </div>
            ))}
        </div>
    );
};

const InstructorDashboard = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [managingCourse, setManagingCourse] = useState(null); // The course currently being managed
    const [analytics, setAnalytics] = useState([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    
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
        if (user?.id) {
            fetchCourses();
            axios.get(`/api/courses/instructor/${user.id}/analytics`)
                .then(res => setAnalytics(res.data))
                .catch(() => {});
        }
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
            const resLesson = await axios.post(`/api/courses/sections/${sectionId}/lessons`, lessonData);
            const createdLesson = resLesson.data;

            // Optional branch to the Assignment/Quiz Service
            if (lessonData.type === 'assignment') {
                await axios.post('/api/assignments', {
                    lessonId: createdLesson.id,
                    courseId: managingCourse.id,
                    instructorId: user.id,
                    title: lessonData.title,
                    instructions: lessonData.content,
                    maxScore: 100
                });
            } else if (lessonData.type === 'quiz') {
                 await axios.post('/api/quizzes', {
                    lessonId: createdLesson.id,
                    courseId: managingCourse.id,
                    title: lessonData.title,
                    passScorePercent: 80
                 });
            }

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
                                                        <option value="assignment">Assignment</option>
                                                        <option value="quiz">Quiz</option>
                                                    </select>
                                                </div>
                                                {lessonData.type === 'video' && (
                                                    <input type="text" placeholder="Video URL (S3, YouTube, etc)" value={lessonData.videoUrl} onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                                )}
                                                {lessonData.type === 'text' && (
                                                    <textarea placeholder="Lesson Content..." value={lessonData.content} onChange={e => setLessonData({...lessonData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary h-24"></textarea>
                                                )}
                                                {lessonData.type === 'assignment' && (
                                                    <textarea placeholder="Assignment Instructions..." value={lessonData.content} onChange={e => setLessonData({...lessonData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary h-24"></textarea>
                                                )}
                                                {lessonData.type === 'quiz' && (
                                                    <textarea placeholder="Quiz JSON details (Temporary)..." value={lessonData.content} onChange={e => setLessonData({...lessonData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary h-24"></textarea>
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
                        
                        {/* Instructor Grading Queue Section */}
                        <div className="glass mt-12 p-6 slide-up">
                            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Submissions Grading Queue</h3>
                            <InstructorGradingQueue courseId={managingCourse.id} />
                        </div>
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

            {/* Analytics Panel */}
            {analytics.length > 0 && (
                <div className="mt-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Course Analytics
                        </h3>
                        <button onClick={() => setShowAnalytics(!showAnalytics)} className="text-sm text-secondary hover:text-white transition-colors">
                            {showAnalytics ? 'Hide' : 'Show'} Details
                        </button>
                    </div>
                    {showAnalytics && (
                        <div className="glass overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-secondary uppercase text-xs tracking-wider">
                                        <th className="p-4 text-left">Course Title</th>
                                        <th className="p-4 text-center">Avg Rating</th>
                                        <th className="p-4 text-center">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((row, i) => (
                                        <tr key={row.courseId} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                                            <td className="p-4 text-white font-medium">{row.title}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    <span className="text-white font-bold">{Number(row.averageRating).toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-secondary">{row.reviewCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// WebSocket Configuration & Notification Component

const NotificationBell = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Fetch historical unread
        const fetchInitial = async () => {
            try {
                const res = await axios.get(`/api/community/notifications/user/${userId}`);
                setNotifications(res.data);
            } catch (err) { }
        };
        fetchInitial();

        // Connect STOMP
        const stompClient = new Client({
            webSocketFactory: () => new WebSocket('ws://localhost:8087/ws/community/websocket'), // Direct to community-service
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
            <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-secondary hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden slide-up">
                    <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-secondary">No new notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleMarkAsRead(n.id)}>
                                    <div className="flex gap-2 items-start">
                                        <div className="bg-primary/20 p-1.5 rounded text-primary">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white mb-1 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-secondary">{new Date(n.timestamp).toLocaleTimeString()}</p>
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

const Dashboard = () => {
    const { user } = useAuth();
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

    if (activeCoursePlayer) {
        return <StudentCoursePlayer courseId={activeCoursePlayer} onBack={() => setActiveCoursePlayer(null)} user={user} />;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.username}</h2>
                    <p className="text-secondary">Manage your learning journey.</p>
                </div>
                <NotificationBell userId={user?.id || 1} />
            </div>
            
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
                                <button onClick={() => setActiveCoursePlayer(enrollment.courseId)} className="btn-secondary w-full py-2 text-sm mt-4">Go to Course</button>
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
}
export default Dashboard
