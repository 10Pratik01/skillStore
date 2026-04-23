import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import DashboardSidebar   from '../components/dashboard/DashboardSidebar';
import StatsStrip         from '../components/dashboard/StatsStrip';
import ActivityChart      from '../components/dashboard/ActivityChart';
import CourseStatusPie    from '../components/dashboard/CourseStatusPie';
import ContinueLearning   from '../components/dashboard/ContinueLearning';
import MyCoursesTab       from '../components/dashboard/MyCoursesTab';
import BillingTab         from '../components/dashboard/BillingTab';
import NotificationCenter from '../components/NotificationCenter';

// ─── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <p className="text-secondary font-semibold text-sm">Loading your dashboard…</p>
    </div>
  </div>
);

// ─── Dashboard Page ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [enrollments,    setEnrollments]    = useState([]);
  const [transactions,   setTransactions]   = useState([]);
  const [progressData,   setProgressData]   = useState({}); // { courseId: [LessonProgress] }
  const [courseDetails,  setCourseDetails]  = useState({}); // { courseId: Course }
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('overview');

  // Role redirects
  useEffect(() => {
    if (!user) return;
    if (user.role === 'INSTRUCTOR') { navigate('/instructor/dashboard'); return; }
    if (user.role === 'ADMIN')      { navigate('/admin/dashboard');      return; }
  }, [user, navigate]);

  // Data fetch
  useEffect(() => {
    if (!user || user.role !== 'STUDENT') { setLoading(false); return; }

    const studentId = user.id;

    const fetchAll = async () => {
      try {
        const [eRes, tRes] = await Promise.all([
          axios.get(`/api/orders/student/${studentId}/enrollments`),
          axios.get(`/api/orders/student/${studentId}/transactions`),
        ]);
        const enrolls = eRes.data || [];
        setEnrollments(enrolls);
        setTransactions(tRes.data || []);

        // Fetch progress + course details for every enrolled course
        const pMap = {};
        const dMap = {};
        await Promise.all(enrolls.map(async e => {
          // Progress
          try {
            const pRes = await axios.get(`/api/orders/student/${studentId}/progress/${e.courseId}`);
            pMap[e.courseId] = pRes.data || [];
          } catch { pMap[e.courseId] = []; }

          // Course detail (for title, sections count, status)
          try {
            const cRes = await axios.get(`/api/courses/${e.courseId}`);
            dMap[e.courseId] = cRes.data;
          } catch { dMap[e.courseId] = null; }
        }));

        setProgressData(pMap);
        setCourseDetails(dMap);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  if (loading) return <Skeleton />;

  // ── Derived stats ────────────────────────────────────────────────────────────
  const getProgress = (courseId) => {
    const detail = courseDetails[courseId];
    const totalLessons = detail
      ? (detail.sections || []).reduce((s, sec) => s + (sec.lessons || []).length, 0)
      : 0;
    const done = (progressData[courseId] || []).filter(p => p.completed).length;
    const pct  = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
    return { totalLessons, done, pct };
  };

  const completedCourses  = enrollments.filter(e => courseDetails[e.courseId]?.status === 'COMPLETED').length;
  const inProgressCourses = enrollments.length - completedCourses;
  const totalLessonsDone  = Object.values(progressData).flat().filter(p => p.completed).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-textMain capitalize">
              {activeTab === 'overview'  && `Welcome back, ${user?.username}! 👋`}
              {activeTab === 'courses'   && 'My Courses 📚'}
              {activeTab === 'billing'   && 'Billing History 💳'}
            </h1>
            <p className="text-secondary text-xs font-medium mt-0.5">
              {activeTab === 'overview'  && "Here's your learning progress at a glance."}
              {activeTab === 'courses'   && `${enrollments.length} course${enrollments.length !== 1 ? 's' : ''} enrolled`}
              {activeTab === 'billing'   && `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <NotificationCenter userId={user?.id} />
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              <StatsStrip
                enrolled={enrollments.length}
                completed={completedCourses}
                inProgress={inProgressCourses}
                lessonsCompleted={totalLessonsDone}
              />

              <div className="grid lg:grid-cols-3 gap-6">
                <ActivityChart progressData={progressData} />
                <CourseStatusPie
                  total={enrollments.length}
                  completed={completedCourses}
                  inProgress={inProgressCourses}
                />
              </div>

              <ContinueLearning
                enrollments={enrollments}
                progressData={progressData}
                courseDetails={courseDetails}
              />
            </>
          )}

          {/* ── MY COURSES ── */}
          {activeTab === 'courses' && (
            <MyCoursesTab
              enrollments={enrollments}
              progressData={progressData}
              courseDetails={courseDetails}
            />
          )}

          {/* ── BILLING ── */}
          {activeTab === 'billing' && (
            <BillingTab
              transactions={transactions}
              courseDetails={courseDetails}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
