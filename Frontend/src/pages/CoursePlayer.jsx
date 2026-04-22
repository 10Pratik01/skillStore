import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LessonSidebar from '../components/player/LessonSidebar';
import LessonContent from '../components/player/LessonContent';
import CommunityPanel from '../components/player/CommunityPanel';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('lessons');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, aRes, qRes] = await Promise.all([
          axios.get(`/api/courses/${courseId}`),
          axios.get(`/api/assignments/course/${courseId}`).catch(() => ({ data: [] })),
          axios.get(`/api/quizzes/course/${courseId}`).catch(() => ({ data: [] })),
        ]);
        setCourse(cRes.data);
        setAssignments(aRes.data || []);
        setQuizzes(qRes.data || []);

        // Set first lesson as active
        const firstLesson = cRes.data?.sections?.[0]?.lessons?.[0];
        if (firstLesson) setActiveLesson(firstLesson);

        // Fetch completed lessons
        const studentId = user?.id || 1;
        try {
          const pRes = await axios.get(`/api/orders/student/${studentId}/progress/${courseId}`);
          const done = (pRes.data || []).filter(p => p.completed).map(p => p.lessonId);
          setCompletedLessons(done);
        } catch (e) {}
      } catch (e) {
        console.error('Failed to load course player', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId, user]);

  const handleMarkComplete = async (lessonId) => {
    if (completedLessons.includes(lessonId)) return;
    try {
      await axios.patch(`/api/orders/student/${user?.id || 1}/progress`, { lessonId, courseId: parseInt(courseId), completed: true });
      setCompletedLessons(prev => [...prev, lessonId]);
    } catch (e) {
      // Optimistically mark as done even if API fails
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  // Progress calculation
  const totalLessons = (course?.sections || []).reduce((a, s) => a + (s.lessons || []).length, 0);
  const progressPct = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary font-medium">Loading your course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0 z-20 shadow-sm">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-secondary font-bold uppercase tracking-widest">Course Player</p>
          <h2 className="font-extrabold text-textMain text-base truncate">{course?.title || 'Loading...'}</h2>
        </div>

        {/* Progress bar */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-48 bg-gray-100 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-bold text-primary whitespace-nowrap">{progressPct}% complete</span>
        </div>

        {/* Current lesson chip */}
        {activeLesson && (
          <div className="hidden lg:flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-sm font-semibold max-w-[200px] truncate">
            {activeLesson.title}
          </div>
        )}
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content + comment thread */}
        <div className="flex-1 flex overflow-hidden">
          <LessonContent
            lesson={activeLesson}
            assignments={assignments}
            quizzes={quizzes}
            user={user}
            courseId={courseId}
            onMarkComplete={handleMarkComplete}
            completedLessons={completedLessons}
          />
        </div>

        {/* Right Sidebar */}
        <LessonSidebar
          course={course}
          activeLesson={activeLesson}
          completedLessons={completedLessons}
          onSelectLesson={(lesson) => { setActiveLesson(lesson); setSidebarTab('lessons'); }}
          activeTab={sidebarTab}
          setActiveTab={setSidebarTab}
        />

        {/* Community panel replaces sidebar content when tab = community */}
        {sidebarTab === 'community' && (
          <div className="absolute right-0 top-[57px] bottom-0 w-[340px] bg-white border-l border-gray-100 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
            <div className="p-4 border-b border-gray-100 flex gap-2 bg-white">
              <button onClick={() => setSidebarTab('lessons')} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-50 text-secondary hover:bg-gray-100 transition-all">Lessons</button>
              <button onClick={() => setSidebarTab('community')} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-soft-purple transition-all">💬 Community</button>
            </div>
            <CommunityPanel courseId={courseId} user={user} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
