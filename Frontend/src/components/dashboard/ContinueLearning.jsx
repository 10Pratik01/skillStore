import React from 'react';
import { useNavigate } from 'react-router-dom';

// Circular SVG progress ring
const ProgressRing = ({ pct, size = 52, stroke = 5 }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#6c48f2" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700" />
    </svg>
  );
};

/**
 * ContinueLearning — shows up to 3 enrolled courses with real progress.
 *
 * Props:
 *   enrollments   — [{id, courseId, ...}]
 *   progressData  — { courseId: [{lessonId, completed, completedAt}] }
 *   courseDetails — { courseId: { title, sections, status } }  (from course-service)
 */
const ContinueLearning = ({ enrollments, progressData, courseDetails }) => {
  const navigate = useNavigate();

  if (enrollments.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-textMain text-lg">Continue Learning</h3>
        <span className="text-xs text-secondary font-semibold">{enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrollments.slice(0, 3).map(e => {
          const detail = courseDetails[e.courseId];
          const completedProgress = progressData[e.courseId] || [];

          // Total lessons = count from course sections (accurate)
          const totalLessons = detail
            ? (detail.sections || []).reduce((sum, s) => sum + (s.lessons || []).length, 0)
            : 0;

          const doneLessons = completedProgress.filter(p => p.completed).length;
          const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

          // Status: teacher-marked COMPLETED vs In Progress
          const isCompleted = detail?.status === 'COMPLETED';

          return (
            <div
              key={e.id}
              onClick={() => navigate(`/courses/${e.courseId}/learn`)}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-soft-purple hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">📚</div>
                <div className="relative">
                  <ProgressRing pct={pct} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-primary rotate-90">{pct}%</span>
                  </div>
                </div>
              </div>

              <h4 className="font-extrabold text-textMain mb-1 group-hover:text-primary transition-colors truncate">
                {detail?.title || `Course ${e.courseId}`}
              </h4>
              <p className="text-secondary text-xs mb-3 font-medium">
                {doneLessons} / {totalLessons || '?'} lessons complete
              </p>

              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>

              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  ✅ Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  ⚡ In Progress
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueLearning;
