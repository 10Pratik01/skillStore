import React from 'react';

const LESSON_ICONS = {
  video: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
  text: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  assignment: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  quiz: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const LessonSidebar = ({ course, activeLesson, completedLessons, onSelectLesson, activeTab, setActiveTab }) => {
  return (
    <div className="w-[340px] bg-white border-l border-gray-100 flex flex-col h-full shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
      {/* Tab switcher */}
      <div className="p-4 border-b border-gray-100 flex gap-2 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}
        >
          Lessons
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'community' ? 'bg-primary text-white shadow-soft-purple' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}
        >
          💬 Community
        </button>
      </div>

      {activeTab === 'lessons' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {(course?.sections || []).map((section, sIdx) => (
            <div key={section.id}>
              <h5 className="text-[11px] font-extrabold text-secondary uppercase tracking-wider mb-3 px-2">
                Module {sIdx + 1}: {section.title}
              </h5>
              <div className="space-y-1.5">
                {(section.lessons || []).map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 border ${
                        isActive
                          ? 'bg-primary/8 border-primary/25 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-sm'
                      }`}
                    >
                      {/* Completion indicator */}
                      <div className={`mt-0.5 shrink-0 ${isDone ? 'text-green-500' : isActive ? 'text-primary' : 'text-gray-300'}`}>
                        {isDone ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-primary' : 'border-gray-200'}`}>
                            {LESSON_ICONS[lesson.type]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-sm font-semibold leading-snug truncate ${isActive ? 'text-primary' : isDone ? 'text-secondary line-through' : 'text-textMain'}`}>
                          {lesson.title}
                        </span>
                        <span className="text-[11px] text-secondary capitalize font-medium mt-0.5 block">{lesson.type}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonSidebar;
