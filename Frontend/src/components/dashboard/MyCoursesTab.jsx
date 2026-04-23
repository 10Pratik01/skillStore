import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyCoursesTab = ({ enrollments, progressData, courseDetails }) => {
  const navigate = useNavigate();

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-soft">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-bold text-textMain mb-2">No courses yet</h3>
        <p className="text-secondary mb-6">Explore our catalog to start learning.</p>
        <button onClick={() => navigate('/courses')} className="btn-primary shadow-soft-purple">
          Explore Courses →
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-textMain">My Courses</h2>
        <button onClick={() => navigate('/courses')} className="btn-secondary text-sm">
          Find more courses →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrollments.map(e => {
          const detail = courseDetails[e.courseId];
          const completedProgress = progressData[e.courseId] || [];
          const totalLessons = detail
            ? (detail.sections || []).reduce((sum, s) => sum + (s.lessons || []).length, 0)
            : 0;
          const doneLessons = completedProgress.filter(p => p.completed).length;
          const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
          const isCompleted = detail?.status === 'COMPLETED';

          return (
            <div
              key={e.id}
              onClick={() => navigate(`/courses/${e.courseId}/learn`)}
              className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 cursor-pointer hover:-translate-y-1 hover:shadow-soft-purple transition-all group"
            >
              {/* Thumbnail */}
              <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-purple-200/30 rounded-2xl mb-5 flex items-center justify-center text-4xl relative overflow-hidden">
                {detail?.thumbnailUrl
                  ? <img src={detail.thumbnailUrl} alt={detail.title} className="w-full h-full object-cover" />
                  : '📚'
                }
                {isCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    ✅ Completed
                  </div>
                )}
              </div>

              <h4 className="font-extrabold text-textMain mb-1 group-hover:text-primary transition-colors truncate">
                {detail?.title || `Course ${e.courseId}`}
              </h4>
              {detail?.subtitle && (
                <p className="text-secondary text-xs mb-2 truncate">{detail.subtitle}</p>
              )}
              <p className="text-secondary text-xs mb-4 font-medium">
                {doneLessons} of {totalLessons || '?'} lessons complete
              </p>

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-secondary">Progress</span>
                <span className="text-xs font-extrabold text-primary">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isCompleted ? 'bg-green-50 text-green-600' : 'bg-primary/10 text-primary'
                }`}>
                  {isCompleted ? '✅ Completed' : '⚡ In Progress'}
                </span>
                <span className="text-xs text-primary font-bold group-hover:underline">
                  Continue →
                </span>
              </div>
            </div>
          );
        })}

        {/* Add course card */}
        <div
          onClick={() => navigate('/courses')}
          className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-6 cursor-pointer flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-all group min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 text-primary flex items-center justify-center text-3xl mb-3 group-hover:bg-primary group-hover:text-white transition-all">
            +
          </div>
          <p className="font-extrabold text-textMain mb-1">Find a Course</p>
          <p className="text-secondary text-xs">Browse the full catalog</p>
        </div>
      </div>
    </div>
  );
};

export default MyCoursesTab;
